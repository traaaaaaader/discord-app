// src/components/chat/MediaRoom.tsx
import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Video, VideoOff, MonitorUp, MonitorStop } from "lucide-react";
import { useMedia } from "@/components/providers/media-provider";

interface MediaRoomProps {
  channelId: string;
  username: string;
  avatar: string;
  setLeaved: React.Dispatch<React.SetStateAction<boolean>>;
}

export const MediaRoom: React.FC<MediaRoomProps> = ({
  channelId,
  username,
  avatar,
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
    remoteTracks,
    audioSettings,
    setVolume,
    setMuted,
  } = useMedia();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    if (screenVideoRef.current) screenVideoRef.current.srcObject = screenStream;
  }, [screenStream]);

  // Video tiles
  const videoTiles = [
    ...(screenStream
      ? [{ id: "screen", stream: screenStream, name: "Screen" }]
      : []),
    ...remoteTracks
      .filter((track) => track.kind === "video")
      .map((track) => ({
        id: track.producerId,
        stream: track.stream,
        name: track.username,
      })),
    ...(localStream ? [{ id: "local", stream: localStream, name: "You" }] : []),
  ];

  const count = videoTiles.length;
  const gridCols =
    count === 1 ? "grid-cols-1" : count === 2 ? "grid-cols-2" : "grid-cols-2";
  const gridRows = count <= 2 ? "" : "grid-rows-2";

  return (
    <div className="flex flex-col h-full bg-white text-black dark:bg-black dark:text-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold"># Voice Channel</h2>
        {joined ? (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              leave();
              setLeaved(true);
            }}
          >
            Disconnect
          </Button>
        ) : (
          <Button
            variant="default"
            size="sm"
            onClick={() => join(channelId, username, avatar)}
            disabled={isJoining || joined}
          >
            {isJoining ? "Connecting..." : "Connect"}
          </Button>
        )}
      </div>

      {joined && (
        <>
          {/* Video Grid */}
          <div className={`grid gap-2 flex-1 ${gridCols} ${gridRows}`}>
            {videoTiles.map(({ id, stream, name }) => (
              <div
                key={id}
                className="relative w-full h-full bg-black dark:bg-gray-900 rounded overflow-hidden"
              >
                <video
                  autoPlay
                  playsInline
                  muted={id === "local"}
                  ref={(el) => el && (el.srcObject = stream)}
                  className="w-full h-full object-contain"
                />
                <div className="absolute bottom-1 left-1 text-xs text-white capitalize">
                  {name}
                </div>
              </div>
            ))}
          </div>

          {/* Volume sliders */}
          <div className="mt-4 space-y-2">
            {/* Если не работает вернуть настройку только для kind === 'audio' */}
            {remoteTracks.map(({ producerId, username }) => (
              <div key={producerId} className="flex items-center space-x-2">
                <span className="text-sm">{username}</span>
                <input
                  type="checkbox"
                  checked={audioSettings[producerId]?.muted ?? false}
                  onChange={(e) => setMuted(producerId, e.target.checked)}
                />
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
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="mt-4 flex justify-center gap-4">
            <Button
              size="sm"
              variant="secondary"
              onClick={localStream ? stopCamera : startCamera}
            >
              {localStream ? <Video size={20} /> : <VideoOff size={20} />}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={screenStream ? stopScreenShare : startScreenShare}
            >
              {screenStream ? (
                <MonitorStop size={20} />
              ) : (
                <MonitorUp size={20} />
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
