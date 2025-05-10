import {
  Channel,
  ChannelType,
  MemberRole,
  ServerWithMembersWithUsersAndChannels,
} from "@/utils/types/servers";
import { Edit, Hash, Lock, Mic, Trash, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { ActionTooltip } from "@/components/action-tooltip";
import { ModalType, useModal } from "@/hooks/use-modal-store";
import { useNavigate, useParams } from "react-router-dom";
import { useMedia } from "../providers/media-provider";
import { UserAvatar } from "../user-avatar";
import { Avatar, AvatarImage } from "../ui/avatar";
import { useEffect } from "react";

interface ServerChannelProps {
  channel: Channel;
  server: ServerWithMembersWithUsersAndChannels;
  role?: MemberRole;
}

const iconMap = {
  [ChannelType.TEXT]: Hash,
  [ChannelType.AUDIO]: Mic,
  [ChannelType.VIDEO]: Video,
};

export const ServerChannel = ({
  channel,
  server,
  role,
}: ServerChannelProps) => {
  const params = useParams();
  const navigate = useNavigate();
  const { participants, fetchParticipants } = useMedia();

  const { onOpen } = useModal();
  const Icon = iconMap[channel.type];

  const onClick = () => {
    fetchParticipants(channel.id);
    navigate(`/servers/${server.id}/channels/${channel.id}`);
  };

  const onAction = (e: React.MouseEvent, action: ModalType) => {
    e.stopPropagation();
    onOpen(action, { channel, server });
  };

  return (
    <>
      <button
        onClick={onClick}
        className={cn(
          "group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1",
          params?.channelId === channel.id && "bg-zinc-700/20 dark:bg-zinc-700"
        )}
      >
        <Icon className="flex-shrink-0 w-5 h-5 text-zinc-500 dark:text-zinc-400" />
        <p
          className={cn(
            "line-clamp-1 font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition",
            params?.channelId === channel.id &&
              "text-primary dark:text-zinc-200 dark:group-hover:text-white"
          )}
        >
          {channel.name}
        </p>
        {channel.name !== "general" && role !== MemberRole.GUEST && (
          <div className="ml-auto flex items-center gap-x-2">
            <ActionTooltip label="Edit">
              <Edit
                onClick={(e) => onAction(e, "editChannel")}
                className="hidden group-hover:block w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
              />
            </ActionTooltip>
            <ActionTooltip label="Delete">
              <Trash
                onClick={(e) => onAction(e, "deleteChannel")}
                className="hidden group-hover:block w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
              />
            </ActionTooltip>
          </div>
        )}
        {channel.name === "general" && (
          <Lock className="ml-auto w-4 h-4 text-zinc-500 dark:text-zinc-400" />
        )}
      </button>
      <div className="px-2 text-xs text-zinc-400 flex flex-col">
        {channel.type === ChannelType.AUDIO &&
          (participants ?? [])
            .filter((p) => p.channelId === channel.id)
            .map((p) => (
              <div key={p.username} className="flex items-center pl-4 py-1">
                <Avatar className="w-6 h-6 rounded-full object-cover">
                  <AvatarImage src={p.avatar} />
                </Avatar>
                <span className="pl-1.5 font-medium text-zinc-700 dark:text-zinc-300">
                  {p.username}
                </span>
              </div>
            ))}
      </div>
    </>
  );
};
