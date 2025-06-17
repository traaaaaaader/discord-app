import React from "react";
import { Button } from "@/components/ui/button";
import {
  Video,
  VideoOff,
  MonitorUp,
  MonitorStop,
  PhoneMissed,
  Mic,
  MicOff,
} from "lucide-react";
import { useMedia } from "@/components/providers/media-provider";
import { MediaContent } from "./media-content";
import { User } from "../../utils/types/servers";

interface MediaRoomProps {
  channelId: string;
  user: User;
  setLeaved: React.Dispatch<React.SetStateAction<boolean>>;
}

export const MediaRoom: React.FC<MediaRoomProps> = ({
  channelId,
  user,
  setLeaved,
}) => {
  const {
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
    toggleMute,
    isMicPaused,
  } = useMedia();

  return (
    <div className="flex flex-col h-full bg-background text-foreground  p-4">
      {joined && <MediaContent />}

      {joined ? (
        <div className="mt-4 flex justify-center gap-4">
          <Button
            size="lg"
            variant={isMicPaused ? "destructive" : "success"}
            onClick={toggleMute}
          >
            {isMicPaused ? <MicOff size={20} /> : <Mic size={20} />}
          </Button>
          <Button
            size="lg"
            variant={!localStream ? "destructive" : "secondary"}
            onClick={localStream ? stopCamera : startCamera}
          >
            {localStream ? <Video size={20} /> : <VideoOff size={20} />}
          </Button>
          <Button
            size="lg"
            variant={screenStream ? "default" : "secondary"}
            onClick={screenStream ? stopScreenShare : startScreenShare}
          >
            {screenStream ? <MonitorStop size={20} /> : <MonitorUp size={20} />}
          </Button>
          <Button
            variant="destructive"
            size="lg"
            onClick={() => {
              leave();
              setLeaved(true);
            }}
          >
            <PhoneMissed size={20} />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col h-full justify-center items-center">
          <Button
            variant="default"
            size="lg"
            onClick={() => join(channelId, user)}
            disabled={isJoining || joined}
          >
            {isJoining
              ? "Подключение..."
              : "Присоединиться к голосовому каналу"}
          </Button>
        </div>
      )}
    </div>
  );
};
