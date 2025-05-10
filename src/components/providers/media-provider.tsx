import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSocket } from "./socket-provider";
import { Device, types as mediasoupTypes } from "mediasoup-client";

export type RemoteTrack = {
  peerId: string;
  username: string;
  producerId: string;
  kind: mediasoupTypes.MediaKind;
  stream: MediaStream;
};

export type Participant = {
  channelId: string;
  username: string;
  avatar: string;
};

type MediaContextType = {
  joined: boolean;
  isJoining: boolean;
  join: (channelId: string, username: string, avatar: string) => void;
  leave: () => void;
  startCamera: () => void;
  stopCamera: () => void;
  startScreenShare: () => void;
  stopScreenShare: () => void;
  localStream: MediaStream | null;
  screenStream: MediaStream | null;
  remoteTracks: RemoteTrack[];
  audioSettings: Record<string, { volume: number; muted: boolean }>;
  setVolume: (producerId: string, volume: number) => void;
  setMuted: (producerId: string, muted: boolean) => void;
  participants: Participant[];
  fetchParticipants: (channelId: string) => void;
};

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export const MediaProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { socket, isConnected } = useSocket();
  const [isJoining, setIsJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [remoteTracks, setRemoteTracks] = useState<RemoteTrack[]>([]);
  const [audioSettings, setAudioSettings] = useState<
    Record<string, { volume: number; muted: boolean }>
  >({});
  const [participants, setParticipants] = useState<Participant[]>([]);

  const roomRef = useRef<string | null>(null);
  const localusernameRef = useRef<string>("");
  const localUserAvatarRef = useRef<string>("");
  const deviceRef = useRef<mediasoupTypes.Device>();
  const sendTransportRef = useRef<mediasoupTypes.Transport>();
  const recvTransportRef = useRef<mediasoupTypes.Transport>();
  const audioProducerRef = useRef<mediasoupTypes.Producer>();
  const consumedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!socket) return;

    const onUserJoined = (user: {
      channelId: string;
      username: string;
      avatar: string;
    }) => {
      setParticipants((prev) => {
        if (
          prev.some(
            (p) =>
              p.username === user.username && p.channelId === user.channelId
          )
        ) {
          return prev;
        }
        return [...prev, user];
      });
    };

    const onUserLeft = (user: { channelId: string; username: string }) => {
      setParticipants((prev) =>
        prev.filter(
          (p) =>
            !(p.username === user.username && p.channelId === user.channelId)
        )
      );
    };

    socket.on("userJoined", onUserJoined);
    socket.on("userLeft", onUserLeft);

    return () => {
      socket.off("userJoined", onUserJoined);
      socket.off("userLeft", onUserLeft);
    };
  }, [socket]);

  useEffect(() => {
    const handleUnload = () => {
      if (joined) leave();
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [joined]);

  // Handlers to adjust audio
  const setVolume = (producerId: string, volume: number) => {
    setAudioSettings((prev) => ({
      ...prev,
      [producerId]: { ...(prev[producerId] || {}), volume },
    }));
  };
  const setMuted = (producerId: string, muted: boolean) => {
    setAudioSettings((prev) => ({
      ...prev,
      [producerId]: { ...(prev[producerId] || {}), muted },
    }));
  };

  const join = (roomId: string, username: string, avatar: string) => {
    if (!socket || !isConnected || joined || isJoining) return;
    setIsJoining(true);

    roomRef.current = roomId;
    localusernameRef.current = username;
    localUserAvatarRef.current = avatar;

    socket.emit(
      "join-room",
      {
        roomId,
        peerId: socket.id,
        username: localusernameRef.current,
        avatar: localUserAvatarRef.current,
      },
      async (resp: any) => {
        try {
          if (resp.error) return console.error(resp.error);
          const {
            sendTransportOptions,
            recvTransportOptions,
            rtpCapabilities,
            existingProducers,
            participants,
          } = resp;

          setParticipants(participants);

          const device = new Device();
          await device.load({ routerRtpCapabilities: rtpCapabilities });
          deviceRef.current = device;

          const sendT = device.createSendTransport(sendTransportOptions);
          sendTransportRef.current = sendT;
          sendT.on("connect", ({ dtlsParameters }, cb, eb) => {
            socket.emit(
              "connect-transport",
              {
                transportId: sendT.id,
                dtlsParameters,
                roomId,
                peerId: socket.id,
              },
              (r: any) => (r.connected ? cb() : eb(r.error))
            );
          });
          sendT.on("produce", ({ kind, rtpParameters }, cb) => {
            socket.emit(
              "produce",
              {
                transportId: sendT.id,
                kind,
                rtpParameters,
                roomId,
                peerId: socket.id,
                username: localusernameRef.current,
              },
              (pid: string) => cb({ id: pid })
            );
          });

          const recvT = device.createRecvTransport(recvTransportOptions);
          recvTransportRef.current = recvT;
          recvT.on("connect", ({ dtlsParameters }, cb, eb) => {
            socket.emit(
              "connect-transport",
              {
                transportId: recvT.id,
                dtlsParameters,
                roomId,
                peerId: socket.id,
              },
              (r: any) => (r.connected ? cb() : eb(r.error))
            );
          });

          const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });

          // Проверяем существование предыдущего продюсера
          if (!audioProducerRef.current) {
            audioProducerRef.current = await sendT.produce({
              track: audioStream.getAudioTracks()[0],
            });
          }
          // setLocalStream(audioStream);

          for (const p of existingProducers.filter(
            (p: any) => p.peerId !== socket.id
          )) {
            await consume(p);
          }

          socket.on("new-producer", onNewProducer);
          socket.on("peer-left", onPeerLeft);
          setJoined(true);
        } catch (error) {
          console.error(error);
        } finally {
          setIsJoining(false);
        }
      }
    );
  };

  const leave = () => {
    if (!socket || !joined || !roomRef.current) return;
    socket.emit("leave-room", { roomId: roomRef.current }, (resp: any) => {
      if (resp.error) return console.error(resp.error);
      const { participants } = resp;
      setParticipants(participants);
    });
    socket.off("new-producer", onNewProducer);
    socket.off("peer-left", onPeerLeft);

    setJoined(false);
    roomRef.current = null;
    setRemoteTracks([]);

    sendTransportRef.current?.close();
    recvTransportRef.current?.close();
    audioProducerRef.current?.close();
    audioProducerRef.current = undefined;

    deviceRef.current = undefined;
    consumedRef.current.clear();
    localStream?.getTracks().forEach((t) => t.stop());
    screenStream?.getTracks().forEach((t) => t.stop());

    setLocalStream(null);
    setScreenStream(null);
  };

  const startCamera = async () => {
    if (!sendTransportRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setLocalStream(stream);
      await sendTransportRef.current.produce({
        track: stream.getVideoTracks()[0],
      });
    } catch (error: unknown) {
      console.log(error);
    }
  };
  const stopCamera = () => {
    localStream?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
  };

  const startScreenShare = async () => {
    if (!sendTransportRef.current) return;
    const stream = await navigator.mediaDevices.getDisplayMedia({
      audio: true,
      video: {
        width: {
          ideal: 1920,
        },
        height: {
          ideal: 1080,
        },
      },
    });
    setScreenStream(stream);
    const prod = await sendTransportRef.current.produce({
      track: stream.getVideoTracks()[0],
    });
    stream.getVideoTracks()[0].onended = () => {
      prod.close();
      setScreenStream(null);
    };
  };
  const stopScreenShare = () => {
    screenStream?.getTracks().forEach((t) => t.stop());
    setScreenStream(null);
  };

  const onNewProducer = (info: any) => {
    if (info.peerId === socket?.id) return;
    consume(info).catch(console.error);
  };
  const onPeerLeft = ({ peerId }: { peerId: string }) => {
    setRemoteTracks((t) => t.filter((r) => r.peerId !== peerId));
  };

  const consume = async (info: any) => {
    if (!socket || !deviceRef.current || !recvTransportRef.current) return;
    const key = `${info.peerId}:${info.producerId}:${info.kind}`;
    if (consumedRef.current.has(key)) return;
    consumedRef.current.add(key);

    socket.emit(
      "consume",
      {
        transportId: recvTransportRef.current.id,
        producerId: info.producerId,
        roomId: roomRef.current,
        peerId: socket.id,
        rtpCapabilities: deviceRef.current.rtpCapabilities,
      },
      async (res: any) => {
        if (res.error) return console.error(res.error);
        const consumer = await recvTransportRef.current!.consume({
          id: res.consumerData.id,
          producerId: res.consumerData.producerId,
          kind: res.consumerData.kind,
          rtpParameters: res.consumerData.rtpParameters,
        });
        await consumer.resume();
        const stream = new MediaStream([consumer.track]);
        setRemoteTracks((prev) => [
          ...prev,
          {
            peerId: info.peerId,
            username: info.username,
            producerId: info.producerId,
            kind: info.kind,
            stream,
          },
        ]);
      }
    );
  };

  const fetchParticipants = (channelId: string) => {
    if (!socket) return;
    socket.emit("getParticipants", { channelId }, (resp: any) => {
      console.log("getParticipants - ",resp)
      if (resp.status === "ok") {
        setParticipants(resp.participants);
      }
    });
  };

  // render audio elements
  const audioElements = remoteTracks
    .filter((t) => t.kind === "audio")
    .map((track) => {
      const settings = audioSettings[track.producerId] || {
        volume: 1,
        muted: false,
      };
      return (
        <audio
          key={track.producerId}
          autoPlay
          muted={settings.muted}
          ref={(el) => {
            if (el) {
              el.srcObject = track.stream;
              const raw = Number(settings.volume);
              const finite = Number.isFinite(raw) ? raw : 1.0;
              el.volume = Math.min(Math.max(finite, 0), 1);
            }
          }}
        />
      );
    });

  return (
    <MediaContext.Provider
      value={{
        joined,
        isJoining,
        join,
        leave,
        startCamera,
        stopCamera,
        startScreenShare,
        stopScreenShare,
        localStream,
        screenStream,
        remoteTracks,
        audioSettings,
        setVolume,
        setMuted,
        participants,
        fetchParticipants,
      }}
    >
      {children}
      {audioElements}
    </MediaContext.Provider>
  );
};

export const useMedia = () => {
  const ctx = useContext(MediaContext);
  if (!ctx) throw new Error("useMedia must be used inside MediaProvider");
  return ctx;
};
