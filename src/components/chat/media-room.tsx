// src/components/MediaRoom.tsx
import { useState, useEffect, useCallback } from "react";
import { RoomClient, mediaType } from "@/lib/room-client";
import { Button } from "@/components/ui/button";
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
import { useSocket } from "@/components/providers/socket-provider";

type MediaRoomProps = { channelId: string; username: string };

export const MediaRoom = ({ channelId, username }: MediaRoomProps) => {
  const { socket } = useSocket();

  const [rc, setRc] = useState<RoomClient | null>(null);

  const [audioEnabled, setAudioEnabled] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [streams, setStreams] = useState<Array<{ id: string; stream: MediaStream }>>([]);

  // cleanup on unmount
  useEffect(() => {
    if (!socket) return;
    const client = new RoomClient(socket, channelId, username);
    setRc(client);

    client.on("stream", ({ stream, id }) => {
      console.log(stream, id)
      setStreams((prev) => {
        if (prev.find((s) => s.id === id)) return prev;
        return [...prev, { id, stream }];
      });
    });

    return () => {
      client.exit();
    };
  }, [socket, channelId, username]);

  const handleScreenShare = useCallback(() => {
    isSharingScreen
      ? rc?.closeProducer(mediaType.screen)
      : rc?.produce(mediaType.screen);
    setIsSharingScreen(!isSharingScreen);
  }, [isSharingScreen]);

  const toggleAudio = useCallback(() => {
    audioEnabled
      ? rc?.closeProducer(mediaType.audio)
      : rc?.produce(mediaType.audio);
    setAudioEnabled(!audioEnabled);
  }, [audioEnabled]);

  const toggleVideo = useCallback(() => {
    videoEnabled
      ? rc?.closeProducer(mediaType.video)
      : rc?.produce(mediaType.video);
    setVideoEnabled(!videoEnabled);
  }, [videoEnabled]);

  const handleLeave = useCallback(() => {
    rc?.exit();
    console.log("[MediaRoom] handleLeave");
  }, []);

  console.log("[MediaRoom] Streams = ",streams, " open = ", rc?.isOpen())

  return (
    <div className="h-full bg-gray-200 dark:bg-gray-950 flex flex-col">
      <div className="flex-1 p-2 grid grid-cols-2 gap-2">
        {streams.map(({ id, stream }) => (
          <video
            key={id}
            ref={el => { if (el && el.srcObject !== stream) el.srcObject = stream; }}
            autoPlay
            playsInline
            className="w-full h-auto bg-black"
          />
        ))}
      </div>
      <div className="controls fixed bottom-0 left-0 right-0 bg-gray-400/50 dark:bg-black/50 backdrop-blur-sm py-4 flex justify-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "rounded-full h-14 w-14",
            !audioEnabled && "bg-rose-800/70"
          )}
          onClick={toggleAudio}
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
            "rounded-full h-14 w-14",
            !videoEnabled && "bg-red-800/70"
          )}
          onClick={toggleVideo}
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
            "rounded-full h-14 w-14",
            isSharingScreen && "bg-blue-800/70"
          )}
          onClick={handleScreenShare}
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
          className="rounded-full h-14 w-14 bg-red-800/70"
          onClick={handleLeave}
        >
          <PhoneMissed className="h-6 w-6 text-gray-200" />
        </Button>
      </div>
    </div>
  );
};
