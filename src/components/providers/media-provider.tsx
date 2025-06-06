import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSocket } from "./socket-provider";
import { Device, types as mediasoupTypes } from "mediasoup-client";
import { User } from "../../utils/types/servers";

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
  userId: string;
};

type MediaContextType = {
  joined: boolean;
  isJoining: boolean;
  join: (channelId: string, user: User) => void;
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
  toggleMute: () => void;
  isMicPaused: boolean;
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
  const [isMicPaused, setMicPaused] = useState(false);

  const roomRef = useRef<string | null>(null);
  const userRef = useRef<User>();
  const deviceRef = useRef<mediasoupTypes.Device>();
  const sendTransportRef = useRef<mediasoupTypes.Transport>();
  const recvTransportRef = useRef<mediasoupTypes.Transport>();
  const audioProducerRef =
    useRef<mediasoupTypes.Producer<mediasoupTypes.AppData>>();
  const screenProducerRef =
    useRef<mediasoupTypes.Producer<mediasoupTypes.AppData>>();
  const audioEls = useRef<Record<string, HTMLAudioElement>>({});
  const consumedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!socket) return;

    const onUserJoined = (user: {
      channelId: string;
      username: string;
      avatar: string;
      userId: string;
    }) => {
      console.log("User joined:", user);

      setParticipants((prev) => {
        const existingIndex = prev.findIndex(
          (p) => p.userId === user.userId && p.channelId === user.channelId
        );

        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = { ...updated[existingIndex], ...user };
          return updated;
        }

        return [...prev, user];
      });
    };

    const onUserLeft = (data: {
      channelId: string;
      username: string;
      userId: string;
    }) => {
      console.log("User left:", data);

      setParticipants((prev) => {
        const filtered = prev.filter(
          (p) => p.userId !== data.userId && p.channelId === data.channelId
        );

        console.log("Participants after user left:", filtered);
        return filtered;
      });

      setRemoteTracks((tracks) => {
        const filteredTracks = tracks.filter(
          (track) => track.peerId !== data.userId
        );
        console.log("Remote tracks after user left:", filteredTracks);
        return filteredTracks;
      });

      Object.keys(audioEls.current).forEach((producerId) => {
        const track = remoteTracks.find(
          (t) => t.producerId === producerId && t.peerId === data.userId
        );
        if (track) {
          const el = audioEls.current[producerId];
          if (el) {
            const stream = el.srcObject;
            if (stream instanceof MediaStream) {
              stream.getTracks().forEach((t) => t.stop());
            }
            delete audioEls.current[producerId];
          }
        }
      });
    };

    const onProducerClosed = ({ producerId }: { producerId: string }) => {
      console.log("Producer closed:", producerId);
      setRemoteTracks((tracks) => {
        const filteredTracks = tracks.filter(
          (r) => r.producerId !== producerId
        );
        console.log("Remote tracks after producer closed:", filteredTracks);
        return filteredTracks;
      });

      const el = audioEls.current[producerId];
      if (el) {
        const stream = el.srcObject;
        if (stream instanceof MediaStream) {
          stream.getTracks().forEach((t) => t.stop());
        }

        delete audioEls.current[producerId];
      }
    };

    const onProducerPaused = ({ producerId }: { producerId: string }) => {
      console.log("Producer paused:", producerId);
      if (audioProducerRef.current?.id === producerId) {
        setMicPaused(true);
      }
    };

    const onProducerResumed = ({ producerId }: { producerId: string }) => {
      console.log("Producer resumed:", producerId);
      if (audioProducerRef.current?.id === producerId) {
        setMicPaused(false);
      }
    };

    socket.on("user-joined", onUserJoined);
    socket.on("user-left", onUserLeft);
    socket.on("producer-closed", onProducerClosed);
    socket.on("producer-paused", onProducerPaused);
    socket.on("producer-resumed", onProducerResumed);

    return () => {
      socket.off("user-joined", onUserJoined);
      socket.off("user-left", onUserLeft);
      socket.off("producer-closed", onProducerClosed);
      socket.off("producer-paused", onProducerPaused);
      socket.off("producer-resumed", onProducerResumed);
    };
  }, [socket, remoteTracks]);

  useEffect(() => {
    const handleUnload = () => {
      if (joined) leave();
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [joined]);

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

  const join = (roomId: string, user: User) => {
    if (!socket || !isConnected || joined || isJoining) return;

    console.log("Joining room:", { roomId, user });
    setIsJoining(true);

    roomRef.current = roomId;
    userRef.current = user;

    socket.emit(
      "join-room",
      {
        roomId,
      },
      async (resp: any) => {
        try {
          if (resp.error) {
            console.error("Join room error:", resp.error);
            return;
          }
          const {
            sendTransportOptions,
            recvTransportOptions,
            rtpCapabilities,
            existingProducers,
            participants,
          } = resp;

          console.log("Join room response:", {
            participantsCount: participants?.length,
            existingProducersCount: existingProducers?.length,
          });

          setParticipants(participants || []);

          const device = new Device();
          await device.load({ routerRtpCapabilities: rtpCapabilities });
          deviceRef.current = device;

          const sendT = device.createSendTransport(sendTransportOptions);
          sendTransportRef.current = sendT;

          sendT.on("connect", ({ dtlsParameters }, cb, eb) => {
            socket.emit(
              "connect-transport",
              {
                roomId,
                dtlsParameters,
                transportId: sendT.id,
              },
              (r: any) => (r.connected ? cb() : eb(r.error))
            );
          });

          sendT.on("produce", ({ kind, rtpParameters }, cb) => {
            socket.emit(
              "produce",
              {
                roomId,
                kind,
                transportId: sendT.id,
                rtpParameters,
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
                roomId,
                dtlsParameters,
                transportId: recvT.id,
              },
              (r: any) => (r.connected ? cb() : eb(r.error))
            );
          });

          try {
            const audioStream = await navigator.mediaDevices.getUserMedia({
              audio: true,
            });

            if (!audioProducerRef.current) {
              audioProducerRef.current = await sendT.produce({
                track: audioStream.getAudioTracks()[0],
              });
              console.log(
                "Audio producer created:",
                audioProducerRef.current.id
              );
            }
          } catch (audioError) {
            console.error("Failed to get audio stream:", audioError);
          }

          for (const producer of existingProducers || []) {
            if (producer.peerId !== user.id) {
              await consume(producer);
            }
          }

          socket.on("new-producer", onNewProducer);
          socket.on("peer-left", onPeerLeft);

          setJoined(true);
          console.log("Successfully joined room");
        } catch (error) {
          console.error("Join room error:", error);
        } finally {
          setIsJoining(false);
        }
      }
    );
  };

  const leave = () => {
    if (!socket || !joined || !roomRef.current) return;

    console.log("Leaving room:", roomRef.current);

    socket.emit("leave-room", (resp: any) => {
      if (resp.error) {
        console.error("Leave room error:", resp.error);
        return;
      }

      console.log("Leave room response:", resp);
      const { participants } = resp;
      setParticipants(participants || []);
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

    Object.values(audioEls.current).forEach((el) => {
      const stream = el.srcObject;
      if (stream instanceof MediaStream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    });
    audioEls.current = {};

    deviceRef.current = undefined;
    consumedRef.current.clear();

    localStream?.getTracks().forEach((t) => t.stop());
    screenStream?.getTracks().forEach((t) => t.stop());

    setLocalStream(null);
    setScreenStream(null);
    console.log("Left room successfully");
  };

  const startCamera = async () => {
    if (!sendTransportRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setLocalStream(stream);

      const producer = await sendTransportRef.current.produce({
        track: stream.getVideoTracks()[0],
      });

      console.log("Camera started, producer created:", producer.id);
    } catch (error: unknown) {
      console.error("Failed to start camera:", error);
    }
  };

  const stopCamera = () => {
    console.log("Stopping camera");
    localStream?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
  };

  const startScreenShare = async () => {
    if (!sendTransportRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        audio: true,
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      setScreenStream(stream);

      const producer = await sendTransportRef.current.produce({
        track: stream.getVideoTracks()[0],
      });

      screenProducerRef.current = producer;
      console.log("Screen share started, producer created:", producer.id);

      stream.getVideoTracks()[0].onended = () => {
        console.log("Screen share ended by user");
        stopScreenShare();
      };
    } catch (error) {
      console.error("Failed to start screen share:", error);
    }
  };

  const stopScreenShare = async () => {
    if (screenProducerRef.current && socket && roomRef.current) {
      console.log("Stopping screen share");

      const producerId = (
        screenProducerRef.current.id as unknown as { producerId: string }
      ).producerId;
      screenProducerRef.current.close();

      socket.emit("producer-close", {
        roomId: roomRef.current,
        producerId: producerId,
      });

      screenProducerRef.current = undefined;
    }

    screenStream?.getTracks().forEach((t) => t.stop());
    setScreenStream(null);
  };

  const onNewProducer = (info: any) => {
    console.log("New producer:", info);
    if (info.peerId === userRef.current?.id) return;
    consume(info).catch(console.error);
  };

  const onPeerLeft = ({ peerId }: { peerId: string }) => {
    console.log("Peer left (WebRTC):", peerId);

    setRemoteTracks((tracks) => {
      const filteredTracks = tracks.filter((r) => r.peerId !== peerId);
      console.log("Remote tracks after peer left:", filteredTracks);
      return filteredTracks;
    });

    Object.keys(audioEls.current).forEach((producerId) => {
      const track = remoteTracks.find(
        (t) => t.producerId === producerId && t.peerId === peerId
      );
      if (track) {
        const el = audioEls.current[producerId];
        if (el) {
          const stream = el.srcObject;
          if (stream instanceof MediaStream) {
            stream.getTracks().forEach((t) => t.stop());
          }
          delete audioEls.current[producerId];
        }
      }
    });
  };

  const consume = async (info: any) => {
    if (!socket || !deviceRef.current || !recvTransportRef.current) return;

    const key = `${info.peerId}:${info.producerId}:${info.kind}`;
    if (consumedRef.current.has(key)) return;

    console.log("Consuming:", info);
    consumedRef.current.add(key);

    socket.emit(
      "consume",
      {
        roomId: roomRef.current,
        producerId: info.producerId,
        rtpCapabilities: deviceRef.current.rtpCapabilities,
        transportId: recvTransportRef.current.id,
      },
      async (res: any) => {
        if (res.error) {
          console.error("Consume error:", res.error);
          return;
        }

        try {
          const consumer = await recvTransportRef.current!.consume({
            id: res.consumerData.id,
            producerId: res.consumerData.producerId,
            kind: res.consumerData.kind,
            rtpParameters: res.consumerData.rtpParameters,
          });

          await consumer.resume();
          const stream = new MediaStream([consumer.track]);

          console.log("Consumer created:", {
            peerId: info.peerId,
            producerId: info.producerId,
            kind: info.kind,
          });

          setRemoteTracks((prev) => [
            ...prev,
            {
              peerId: info.peerId,
              username: info.username || "Unknown",
              producerId: info.producerId,
              kind: info.kind,
              stream,
            },
          ]);
        } catch (error) {
          console.error("Failed to create consumer:", error);
        }
      }
    );
  };

  const fetchParticipants = (channelId: string) => {
    if (!socket) return;

    console.log("Fetching participants for channel:", channelId);

    socket.emit("get-participants", { channelId }, (resp: any) => {
      console.log("Get participants response:", resp);
      if (resp.status === "ok") {
        setParticipants(resp.participants || []);
      }
    });
  };

  const toggleMute = () => {
    if (!audioProducerRef.current || !socket || !roomRef.current) return;

    const producerId = (
      audioProducerRef.current.id as unknown as { producerId: string }
    ).producerId;

    if (audioProducerRef.current.paused) {
      console.log("Resuming microphone");
      audioProducerRef.current.resume();
      socket.emit("producer-resume", {
        roomId: roomRef.current,
        producerId: producerId,
      });
      setMicPaused(false);
    } else {
      console.log("Pausing microphone");
      audioProducerRef.current.pause();
      socket.emit("producer-pause", {
        roomId: roomRef.current,
        producerId: producerId,
      });
      setMicPaused(true);
    }
  };

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
              audioEls.current[track.producerId] = el;
              el.srcObject = track.stream;
              const raw = Number(settings.volume);
              const finite = Number.isFinite(raw) ? raw : 1.0;
              el.volume = Math.min(Math.max(finite, 0), 1);
            } else {
              delete audioEls.current[track.producerId];
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
        toggleMute,
        isMicPaused,
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
