import React from "react";
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
import { cn } from "../../lib/utils";


type VideoTile = {
  key: string;
  stream: MediaStream;
  name: string;
};

type AudioTile = {
  key: string;
  username: string;
  avatar: string;
  tracks: { producerId: string }[];
};

export const MediaContent: React.FC = () => {
  const {
    localStream,
    screenStream,
    remoteTracks,
    audioSettings,
    setMuted,
    setVolume,
    participants,
  } = useMedia();

  console.log(remoteTracks)

  const videoTiles: VideoTile[] = [
    ...(screenStream
      ? [{ key: "screen", stream: screenStream, name: "Screen" }]
      : []),
    ...remoteTracks
      .filter((t) => t.kind === "video")
      .map((t) => ({ key: t.producerId, stream: t.stream, name: t.username })),
    ...(localStream
      ? [{ key: "local", stream: localStream, name: "You" }]
      : []),
  ];

  const audioTiles: AudioTile[] = videoTiles.length
    ? []
    : participants
        .map((p) => ({
          key: p.username,
          username: p.username,
          avatar: p.avatar,
          tracks: remoteTracks
            .filter((t) => t.username === p.username)
            .map((t) => ({ producerId: t.producerId })),
        }));

  const gridCols = videoTiles.length || audioTiles.length;

  const tiles = videoTiles.length ? videoTiles : audioTiles;

  return (
    <div
      className={cn("grid", "gap-2", "flex-1", {
        "grid-cols-1": gridCols === 1,
        "grid-cols-2": gridCols === 2,
        "grid-cols-3": gridCols === 3,
        "grid-cols-4": gridCols === 4,
      })}
    >
      {tiles.slice(0, 16).map((tile) => {
        if ("stream" in tile) {
          return (
            <div
              key={tile.key}
              className="relative w-full h-full bg-black dark:bg-gray-900 rounded overflow-hidden"
            >
              <video
                autoPlay
                playsInline
                muted={tile.key === "local"}
                ref={(el) => el && (el.srcObject = tile.stream)}
                className="w-full h-full object-contain"
              />
              <div className="absolute bottom-1 left-1 text-xs text-white capitalize">
                {tile.name}
              </div>
            </div>
          );
        }

        const avatarBlock = (
          <div className="flex flex-col justify-center items-center w-full h-full bg-black dark:bg-gray-900 rounded overflow-hidden">
            <Avatar className="w-14 h-14 rounded-full object-cover mb-2">
              <AvatarImage src={tile.avatar} />
            </Avatar>
            <div className="text-lg text-white capitalize">{tile.username}</div>
          </div>
        );

        if (tile.tracks.length === 0) {
          return <div key={tile.key}>{avatarBlock}</div>;
        }

        return (
          <ContextMenu key={tile.key}>
            <ContextMenuTrigger>{avatarBlock}</ContextMenuTrigger>
            <ContextMenuContent>
              {tile.tracks.map(({ producerId }) => (
                <React.Fragment key={producerId}>
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
                </React.Fragment>
              ))}
            </ContextMenuContent>
          </ContextMenu>
        );
      })}
    </div>
  );
};
