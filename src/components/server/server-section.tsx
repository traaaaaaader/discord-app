import { Plus, Settings } from "lucide-react";
import {
  ChannelType,
  MemberRole,
  ServerWithMembersWithUsersAndChannels,
} from "@/utils/types/servers";

import { ActionTooltip } from "@/components/action-tooltip";
import { useModal } from "@/hooks/use-modal-store";

interface ServerSectionProps {
  label: string;
  role?: MemberRole;
  sectionType?: "channels" | "members";
  channelType?: ChannelType;
  server?: ServerWithMembersWithUsersAndChannels;
}

export const ServerSection = ({
  label,
  role,
  sectionType,
  channelType,
  server,
}: ServerSectionProps) => {
  const { onOpen } = useModal();

  return (
    <div className="flex items-center justify-between py-3 text-muted-foreground hover:text-foreground transition">
      <p className="text-xs uppercase font-semibold">{label}</p>
      {role !== MemberRole.GUEST && sectionType === "channels" && (
        <ActionTooltip label="Добавить канал" side="top">
          <button
            onClick={() => onOpen("createChannel", { channelType, server })}
            className="cursor-pointer"
          >
            <Plus className="h-4 w-4" />
          </button>
        </ActionTooltip>
      )}
      {role === MemberRole.ADMIN && sectionType === "members" && (
        <ActionTooltip label="Manage Members" side="top">
          <button
            onClick={() => onOpen("members", { server })}
            className="cursor-pointer"
          >
            <Settings className="h-4 w-4" />
          </button>
        </ActionTooltip>
      )}
    </div>
  );
};
