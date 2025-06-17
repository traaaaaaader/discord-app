import React, { useEffect } from "react";
import { useMedia } from "@/components/providers/media-provider";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Fragment } from "react";

interface ParticipantListProps {
  channelId: string;
}

export const ParticipantList: React.FC<ParticipantListProps> = ({
  channelId,
}) => {
  const {
    participants,
    fetchParticipants,
    remoteTracks,
    audioSettings,
    setMuted,
    setVolume,
  } = useMedia();

  useEffect(() => {
    fetchParticipants(channelId);
  }, []);

  return (
    <div className="px-2 text-xs text-foreground flex flex-col">
      {participants.map(({ username, avatar }) => {
        const userTracks = remoteTracks.filter((t) => t.username === username);
        const content = (
          <div className="flex items-center pl-4 py-1">
            <Avatar className="w-6 h-6 rounded-full object-cover">
              <AvatarImage src={avatar} />
            </Avatar>
            <span className="pl-1.5 font-medium text-foreground">
              {username}
            </span>
          </div>
        );

        if (userTracks.length === 0) {
          return <div key={username}>{content}</div>;
        }

        return (
          <ContextMenu key={username}>
            <ContextMenuTrigger>{content}</ContextMenuTrigger>
            <ContextMenuContent>
              {userTracks.map(({ producerId }) => (
                <Fragment key={producerId}>
                  <ContextMenuCheckboxItem
                    checked={audioSettings[producerId]?.muted ?? false}
                    onCheckedChange={(ch) => setMuted(producerId, ch)}
                  >
                    Отключить звук
                  </ContextMenuCheckboxItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem inset className="flex flex-col items-start">
                    Громкость
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={audioSettings[producerId]?.volume ?? 1}
                      onChange={(e) =>
                        setVolume(producerId, parseFloat(e.target.value))
                      }
                      className="flex-1"
                    />
                  </ContextMenuItem>
                </Fragment>
              ))}
            </ContextMenuContent>
          </ContextMenu>
        );
      })}
    </div>
  );
};
