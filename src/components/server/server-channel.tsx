import React from "react";
import {
  Channel,
  ChannelType,
  MemberRole,
  ServerWithMembersWithUsersAndChannels,
} from "@/utils/types/servers";
import { Edit, Hash, Lock, Mic, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { ActionTooltip } from "@/components/action-tooltip";
import { ModalType, useModal } from "@/hooks/use-modal-store";
import { useNavigate, useParams } from "react-router-dom";
import { ParticipantList } from "./participant-list";

interface ServerChannelProps {
  channel: Channel;
  server: ServerWithMembersWithUsersAndChannels;
  role?: MemberRole;
}

const iconMap = {
  [ChannelType.TEXT]: Hash,
  [ChannelType.AUDIO]: Mic,
};

export const ServerChannel: React.FC<ServerChannelProps> = ({
  channel,
  server,
  role,
}) => {
  const params = useParams();
  const navigate = useNavigate();
  const { onOpen } = useModal();
  const Icon = iconMap[channel.type];

  const onClick = () => {
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
          "group px-2 py-3 rounded-md flex items-center gap-x-2 w-full hover:bg-accent/10 mb-1 cursor-pointer text-foreground hover:text-accent transition duration-300",
          params?.channelId === channel.id &&
            "bg-accent/20 hover:bg-accent/20 text-accent-foreground"
        )}
      >
        <Icon className="flex-shrink-0 w-5 h-5 " />
        <p className={"line-clamp-1 font-semibold text-sm"}>{channel.name}</p>

        {channel.name !== "general" && role !== MemberRole.GUEST && (
          <div className="ml-auto flex items-center gap-x-2">
            <ActionTooltip label="Изменить">
              <Edit
                onClick={(e) => onAction(e, "editChannel")}
                className="hidden group-hover:block w-4 h-4"
              />
            </ActionTooltip>
            <ActionTooltip label="Удалить">
              <Trash
                onClick={(e) => onAction(e, "deleteChannel")}
                className="hidden group-hover:block w-4 h-4"
              />
            </ActionTooltip>
          </div>
        )}

        {channel.name === "general" && (
          <Lock className="ml-auto w-4 h-4 text-accent-foreground" />
        )}
      </button>
      {channel.type === ChannelType.AUDIO && (
        <ParticipantList channelId={channel.id} />
      )}
    </>
  );
};
