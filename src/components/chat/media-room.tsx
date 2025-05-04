import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { MonitorStop, MonitorUp, Video, VideoOff } from "lucide-react";
import { useSocket } from "@/components/providers/socket-provider";
import { Device, types as mediasoupTypes } from "mediasoup-client";

type MediaRoomProps = { channelId: string; username: string };

export const MediaRoom = ({ channelId, username }: MediaRoomProps) => {
  const { socket } = useSocket();

  const [device, setDevice] = useState<mediasoupTypes.Device | null>(null);
  const [sendTransport, setSendTransport] =
    useState<mediasoupTypes.Transport | null>(null);
  const [recvTransport, setRecvTransport] =
    useState<mediasoupTypes.Transport | null>(null);
  const [joined, setJoined] = useState<boolean>(
    () =>
      typeof window !== "undefined" &&
      sessionStorage.getItem("joined") === "true"
  );
  const [peers, setPeers] = useState<Set<string>>(new Set());
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [audioProducer, setAudioProducer] =
    useState<mediasoupTypes.Producer | null>(null);
  const [videoProducer, setVideoProducer] =
    useState<mediasoupTypes.Producer | null>(null);
  const [screenProducer, setScreenProducer] =
    useState<mediasoupTypes.Producer | null>(null);

  // Track which producerIds we've already consumed to avoid duplicates
  const consumedRef = useRef<Set<string>>(new Set());

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const deviceRef = useRef<mediasoupTypes.Device | null>(null);
  const recvTransportRef = useRef<mediasoupTypes.Transport | null>(null);

  const removePeerMedia = (peerId: string) => {
    const remote = document.getElementById("remote-media");
    if (!remote) return;
    Array.from(remote.children).forEach((el) => {
      if (el.id.startsWith(peerId + "-")) remote.removeChild(el);
    });
    consumedRef.current.forEach((key) => {
      if (key.startsWith(peerId + ":")) consumedRef.current.delete(key);
    });
  };

  // Auto-join on mount
  useEffect(() => {
    console.log(joined);
    if (!joined) {
      joinRoom().then(() => {
        console.log("Join room. `joined`=", joined);
        sessionStorage.setItem("joined", "true");
      });
    }
  }, []);

  useEffect(() => {
    if (!socket || !joined) return;

    socket.on("new-peer", ({ peerId }) => {
      if (peerId !== socket.id) setPeers((prev) => new Set(prev).add(peerId));
    });
    socket.on("peer-left", ({ peerId }) => {
      setPeers((prev) => {
        const newPeers = new Set(prev);
        newPeers.delete(peerId);
        return newPeers;
      });
      removePeerMedia(peerId);
    });
    socket.on("new-producer", handleNewProducer);
    return () => {
      socket.off("new-peer");
      socket.off("peer-left");
      socket.off("new-producer");
    };
  }, [socket, joined]);

  const createDevice = async (
    rtpCapabilities: mediasoupTypes.RtpCapabilities
  ) => {
    const newDevice = new Device();
    await newDevice.load({ routerRtpCapabilities: rtpCapabilities });
    setDevice(newDevice);
    deviceRef.current = newDevice;
    return newDevice;
  };

  const createSendTransport = (
    device: mediasoupTypes.Device,
    options: mediasoupTypes.TransportOptions
  ) => {
    if (!socket) return;
    const transport = device.createSendTransport(options);
    transport.on("connect", ({ dtlsParameters }, callback, errback) => {
      socket.emit(
        "connect-transport",
        {
          transportId: transport.id,
          dtlsParameters,
          roomId: channelId,
          peerId: socket.id,
        },
        (res: any) =>
          res.connected ? callback() : errback(new Error(res.error))
      );
    });
    transport.on("produce", ({ kind, rtpParameters }, callback) => {
      socket.emit(
        "produce",
        {
          transportId: transport.id,
          kind,
          rtpParameters,
          roomId: channelId,
          peerId: socket.id,
        },
        (producerId: string) => callback({ id: producerId })
      );
    });
    setSendTransport(transport);
    return transport;
  };

  const createRecvTransport = (
    device: mediasoupTypes.Device,
    options: mediasoupTypes.TransportOptions
  ) => {
    if (!socket) return;
    const transport = device.createRecvTransport(options);
    transport.on("connect", ({ dtlsParameters }, callback, errback) => {
      socket.emit(
        "connect-transport",
        {
          transportId: transport.id,
          dtlsParameters,
          roomId: channelId,
          peerId: socket.id,
        },
        (res: any) =>
          res.connected ? callback() : errback(new Error(res.error))
      );
    });
    setRecvTransport(transport);
    recvTransportRef.current = transport;
    return transport;
  };

  const joinRoom = async () => {
    if (!socket || joined) return;
    socket.emit(
      "join-room",
      { roomId: channelId, peerId: socket.id },
      async (resp: any) => {
        if (resp.error) return console.error(resp.error);
        const {
          sendTransportOptions,
          recvTransportOptions,
          rtpCapabilities,
          peerIds,
          existingProducers,
        } = resp;
        const dev = await createDevice(rtpCapabilities);
        const sendT = createSendTransport(dev, sendTransportOptions)!;
        createRecvTransport(dev, recvTransportOptions);

        // produce local audio once on join
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const audioTrack = audioStream.getAudioTracks()[0];
        const audioProd = await sendT.produce({ track: audioTrack });
        setAudioProducer(audioProd);

        setPeers(peerIds.filter((id: string) => id !== socket.id));
        // consume existing remote producers
        for (const p of existingProducers.filter(
          (p: any) => p.peerId !== socket.id
        )) {
          await consume(p);
        }
        setJoined(true);
      }
    );
  };

  const leaveRoom = () => {
    if (!socket) return;
    socket.emit("leave-room", {}, () => {});
    setJoined(false);
    setPeers(new Set<string>());
    stopCamera();
    stopScreenShare();
    audioProducer?.close();
    setAudioProducer(null);
    sendTransport?.close();
    setSendTransport(null);
    recvTransport?.close();
    setRecvTransport(null);
    setDevice(null);
    consumedRef.current.clear();
    sessionStorage.removeItem("joined");
    const remote = document.getElementById("remote-media");
    if (remote) remote.innerHTML = "";
  };

  const startCamera = async () => {
    if (!sendTransport) return;
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    setLocalStream(stream);
    const track = stream.getVideoTracks()[0];
    const prod = await sendTransport.produce({ track });
    setVideoProducer(prod);
  };

  const stopCamera = () => {
    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
      setLocalStream(null);
    }
    videoProducer?.close();
    setVideoProducer(null);
  };

  const startScreenShare = async () => {
    if (!sendTransport) return;
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });
    setScreenStream(stream);
    const track = stream.getVideoTracks()[0];
    const prod = await sendTransport.produce({ track });
    setScreenProducer(prod);
    track.onended = stopScreenShare;
  };

  const stopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach((t) => t.stop());
      setScreenStream(null);
    }
    screenProducer?.close();
    setScreenProducer(null);
  };

  useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
  }, [localStream]);
  useEffect(() => {
    if (screenVideoRef.current) screenVideoRef.current.srcObject = screenStream;
  }, [screenStream]);

  const handleNewProducer = async (info: {
    producerId: string;
    peerId: string;
    kind: mediasoupTypes.MediaKind;
  }) => {
    if (info.peerId === socket?.id) return;
    await consume(info);
  };

  const consume = async ({
    producerId,
    peerId,
    kind,
  }: {
    producerId: string;
    peerId: string;
    kind: mediasoupTypes.MediaKind;
  }) => {
    // avoid consuming same producer twice
    const key = `${peerId}:${producerId}:${kind}`;
    if (consumedRef.current.has(key)) return;
    consumedRef.current.add(key);

    const dev = deviceRef.current,
      recvT = recvTransportRef.current;
    if (!socket || !dev || !recvT) return;
    socket.emit(
      "consume",
      {
        transportId: recvT.id,
        producerId,
        roomId: channelId,
        peerId: socket.id,
        rtpCapabilities: dev.rtpCapabilities,
      },
      async (res: any) => {
        console.log('Socket consume. res=', res)
        if (res.error) return;
        const consumer = await recvT.consume({
          id: res.consumerData.id,
          producerId: res.consumerData.producerId,
          kind: res.consumerData.kind,
          rtpParameters: res.consumerData.rtpParameters,
        });
        await consumer.resume();
        const media = new MediaStream([consumer.track]);
        const id = `${peerId}-${kind}-${producerId}`;
        const el = document.createElement(kind === "video" ? "video" : "audio");
        el.id = id;
        el.srcObject = media;
        (el as any).autoplay = true;
        (el as any).controls = true;
        if (kind === "video") (el as HTMLVideoElement).playsInline = true;
        document.getElementById("remote-media")?.appendChild(el);
      }
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Mediasoup Demo</h1>
      <div className="flex gap-4 my-2">
        {!joined ? (
          <Button onClick={joinRoom}>Join Room</Button>
        ) : (
          <Button variant="destructive" onClick={leaveRoom}>
            Leave Room
          </Button>
        )}
        {joined && (
          <>
            <Button onClick={localStream ? stopCamera : startCamera}>
              {localStream ? <VideoOff /> : <Video />} Camera
            </Button>
            <Button onClick={screenStream ? stopScreenShare : startScreenShare}>
              {screenStream ? <MonitorStop /> : <MonitorUp />} Screen
            </Button>
          </>
        )}
      </div>

      {localStream && (
        <div className="my-4">
          <h2 className="text-lg font-semibold">Local Video</h2>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            controls
            className="rounded shadow"
            width={400}
          />
        </div>
      )}

      {screenStream && (
        <div className="my-4">
          <h2 className="text-lg font-semibold">Screen Preview</h2>
          <video
            ref={screenVideoRef}
            autoPlay
            muted
            playsInline
            controls
            className="rounded shadow"
            width={400}
          />
        </div>
      )}

      <div className="my-4">
        <h2 className="text-lg font-semibold">Peers in Room</h2>
        <ul className="list-disc list-inside">
          {[...peers].map((id) => (
            <li key={id}>{id}</li>
          ))}
        </ul>
      </div>

      <div className="my-4">
        <h2 className="text-lg font-semibold">Remote Media</h2>
        <div id="remote-media" className="flex flex-wrap gap-2" />
      </div>
    </div>
  );
};
