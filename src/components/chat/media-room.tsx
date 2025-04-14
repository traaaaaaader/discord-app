import { useState, useEffect, useRef, useCallback } from "react";
import { useSocket } from "@/components/providers/socket-provider";
import { Button } from "../ui/button";
import {
  Mic,
  MicOff,
  MonitorStop,
  MonitorUp,
  PhoneMissed,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";

type MediaRoomProps = {
  channelId: string;
  username: string;
};

export const MediaRoom = ({ channelId, username }: MediaRoomProps) => {
  const { socket, isConnected } = useSocket();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<
    Record<string, MediaStream>
  >({});
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hasAudioDevice, setHasAudioDevice] = useState(false);
  const [hasVideoDevice, setHasVideoDevice] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const mediaConstraints = useRef({ audio: true, video: true });

  const setVideoRef = useCallback((id: string, node: HTMLVideoElement | null) => {
    videoRefs.current[id] = node;
    if (node && remoteStreams[id]) {
      node.srcObject = remoteStreams[id];
    }
  }, [remoteStreams]);

  useEffect(() => {
    const checkDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(
          (device) => device.kind === "audioinput"
        );
        const videoInputs = devices.filter(
          (device) => device.kind === "videoinput"
        );

        setHasAudioDevice(audioInputs.length > 0);
        setHasVideoDevice(videoInputs.length > 1);

        // Обновляем constraints на основе доступных устройств
        mediaConstraints.current = {
          audio: hasAudioDevice,
          video: hasVideoDevice,
        };
      } catch (error) {
        console.error("Error enumerating devices:", error);
      }
    };

    checkDevices();
  }, []);

  // Initialize media stream
  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices
          .getUserMedia(mediaConstraints.current)
          .catch((error) => {
            if (error.name === "NotFoundError") {
              return new MediaStream();
            }
            throw error;
          });

        setLocalStream(stream);
        socket?.emit("joinRoom", {
          username,
          channelId,
        });
      } catch (error) {
        console.error("Error accessing media devices:", error);
        setLocalStream(null);
        socket?.emit("joinRoom", { username, channelId });
      }
    };

    if (isConnected) {
      initializeMedia();
    }

    return () => {
      localStream?.getTracks().forEach((track) => track.stop());
      screenStream?.getTracks().forEach((track) => track.stop());
    };
  }, [isConnected, hasAudioDevice, hasVideoDevice]);

  // Handle socket events
  useEffect(() => {
    if (!socket) return;

    const handleNewParticipant = (data: {
      id: string;
      stream: MediaStream;
    }) => {
      setRemoteStreams((prev) => ({ ...prev, [data.id]: data.stream }));
    };

    const handleParticipantLeft = (id: string) => {
      setRemoteStreams((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    };

    socket.on("newParticipant", handleNewParticipant);
    socket.on("participantLeft", handleParticipantLeft);

    return () => {
      socket.off("newParticipant", handleNewParticipant);
      socket.off("participantLeft", handleParticipantLeft);
    };
  }, [socket]);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      // Отключаем микрофон при отключении звука
      if (prev) {
        localStream?.getAudioTracks().forEach(track => track.enabled = false);
        setAudioEnabled(false);
      }
      
      // Управляем громкостью всех удаленных потоков
      Object.values(videoRefs.current).forEach(video => {
        if (video) {
          video.muted = !prev;
        }
      });
      
      return !prev;
    });
  }, [localStream]);

  // Обновленная функция переключения микрофона
  const toggleAudio = useCallback(() => {
    setAudioEnabled((prev) => {
      const newState = !prev;
      localStream?.getAudioTracks().forEach(track => track.enabled = newState);
      
      // Синхронизируем состояние звука
      if (newState && !soundEnabled) {
        setSoundEnabled(true);
        Object.values(videoRefs.current).forEach(video => {
          if (video) video.muted = false;
        });
      }
      
      return newState;
    });
  }, [localStream, soundEnabled]);

  const toggleVideo = useCallback(() => {
    setVideoEnabled((prev) => {
      localStream?.getVideoTracks().forEach((track) => (track.enabled = !prev));
      return !prev;
    });
  }, [localStream]);

  const handleLeave = useCallback(() => {
    socket?.emit("leaveRoom", { username, channelId });
    localStream?.getTracks().forEach((track) => track.stop());
  }, [socket, localStream, channelId, username]);

  const startScreenShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

      setScreenStream(stream);
      setIsSharingScreen(true);
      socket?.emit("screenShare", { channelId, stream });
    } catch (error) {
      console.error("Error sharing screen:", error);
      setIsSharingScreen(false);
    }
  }, [channelId, socket]);

  const stopScreenShare = useCallback(() => {
    screenStream?.getTracks().forEach((track) => track.stop());
    setScreenStream(null);
    setIsSharingScreen(false);
    socket?.emit("stopScreenShare", { channelId });
  }, [screenStream, socket, channelId]);

  const totalVideos = [
    // localStream,
    screenStream,
    ...Object.values(remoteStreams),
  ].filter(Boolean).length;

  const allVideoElements = [
    // localStream && (
    //   <video
    //     key="local"
    //     ref={(node) => node && (node.srcObject = localStream)}
    //     autoPlay
    //     muted
    //     className="w-full h-full object-cover"
    //   />
    // ),
    screenStream && (
      <video
        key="screen"
        ref={(node) => node && (node.srcObject = screenStream)}
        autoPlay
        muted
        className="w-full h-full object-cover border-2 border-blue-400"
      />
    ),
    ...Object.entries(remoteStreams).map(([id, stream]) => (
      <video
        key={id}
        ref={node => setVideoRef(id, node)}
        autoPlay
        className="w-full h-full object-cover"
      />
    )),
  ].filter(Boolean);

  return (
    <div className="h-full dark:bg-gray-950 bg-gray-200 flex flex-col">
      {/* Видео контейнер с адаптивной сеткой */}
      <div className="flex-1 overflow-hidden p-2">
        <div
          className={cn(
            "grid h-full w-full",
            "grid-rows-1 gap-2 grid-cols-1", // По умолчанию для 1 элемента
            {
              "grid-cols-2": totalVideos === 2 || totalVideos >= 4,
              "grid-rows-2": totalVideos === 3 || totalVideos >= 5,
              "grid-cols-3": totalVideos === 5,
              "lg:grid-cols-4": totalVideos >= 4,
            }
          )}
        >
          {allVideoElements.map((element, index) => (
            <div
              key={element?.key}
              className={cn("relative overflow-hidden", {
                "row-span-2": totalVideos === 3 && index === 2,
                "col-span-2": totalVideos === 3 && index < 2,
                "col-span-2 row-span-2": totalVideos === 1,
              })}
            >
              {element}
            </div>
          ))}
        </div>
      </div>

      <div className="controls fixed bottom-0 left-0 right-0 dark:bg-black/50 bg-gray-400/50 backdrop-blur-sm md:pl-60 py-4 flex items-center justify-center gap-3">
      <Button
          variant="ghost"
          size="icon"
          className={cn(
            "rounded-full h-14 w-14 bg-zinc-500/70 hover:bg-zinc-600/70 transition",
            !audioEnabled && "bg-rose-800/70 hover:bg-red-700/80"
          )}
          onClick={toggleAudio}
          disabled={!hasAudioDevice}
        >
          {audioEnabled ? (
            <Mic className="h-6 w-6 text-gray-300" />
          ) : (
            <MicOff className="h-6 w-6 text-gray-300" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "rounded-full h-14 w-14 bg-zinc-500/70 hover:bg-zinc-600/70 transition",
            !soundEnabled && "bg-purple-800/70 hover:bg-purple-700/80"
          )}
          onClick={toggleSound}
        >
          {soundEnabled ? (
            <Volume2 className="h-6 w-6 text-gray-300" />
          ) : (
            <VolumeX className="h-6 w-6 text-gray-300" />
          )}
        </Button>


        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "rounded-full h-14 w-14 bg-zinc-500/70 hover:bg-zinc-600/70",
            !videoEnabled && "bg-red-800/70 hover:bg-red-700/80"
          )}
          onClick={toggleVideo}
          disabled={!hasVideoDevice}
        >
          {videoEnabled ? (
            <Video className="h-6 w-6 text-gray-300" />
          ) : (
            <VideoOff className="h-6 w-6 text-gray-300" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "rounded-full h-14 w-14 bg-zinc-500/70 hover:bg-zinc-600/70",
            isSharingScreen && "bg-blue-800/70 hover:bg-blue-700/80"
          )}
          onClick={isSharingScreen ? stopScreenShare : startScreenShare}
        >
          {isSharingScreen ? (
            <MonitorStop className="h-6 w-6 text-gray-300" />
          ) : (
            <MonitorUp className="h-6 w-6 text-gray-300" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-14 w-14 bg-red-800/70 hover:bg-red-700/80"
          onClick={handleLeave}
        >
          <PhoneMissed className="h-6 w-6 text-gray-200" />
        </Button>
      </div>
    </div>
  );
};
