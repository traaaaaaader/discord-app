import { useNavigate } from "react-router-dom";

import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from "lucide-react";
import { ServerHeader } from "./server-header";
import { ServerSection } from "./server-section";
import { ServerChannel } from "./server-channel";

import {
  ChannelType,
  MemberRole,
  ServerWithMembersWithUsersAndChannels,
} from "@/utils/types/servers";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ServerSearch } from "./server-search";

interface ServerChannelsSidebarProps {
  server: ServerWithMembersWithUsersAndChannels;
  userId: string;
}

const iconMap = {
  [ChannelType.TEXT]: <Hash className="mr-2 h-4 w-4" />,
  [ChannelType.AUDIO]: <Mic className="mr-2 h-4 w-4" />,
  [ChannelType.VIDEO]: <Video className="mr-2 h-4 w-4" />,
};

const roleIconMap = {
  [MemberRole.GUEST]: null,
  [MemberRole.MODERATOR]: (
    <ShieldCheck className="mr-2 h-4 w-4 text-indigo-500" />
  ),
  [MemberRole.ADMIN]: <ShieldAlert className="mr-2 h-4 w-4 text-rose-500" />,
};

export const ServerChannelsSidebar = ({
  server,
  userId,
}: ServerChannelsSidebarProps) => {
  const navigate = useNavigate();
  const user = localStorage.getItem("user");

  if (!user || !server) {
    navigate("/auth/login");
  }

  const textChannels = server?.channels.filter(
    (channel) => channel.type === ChannelType.TEXT
  );
  const audioChannels = server?.channels.filter(
    (channel) => channel.type === ChannelType.AUDIO
  );
  const vidoeChannels = server?.channels.filter(
    (channel) => channel.type === ChannelType.VIDEO
  );

  const role = server.members.find((member) => member.userId === userId)?.role;

  return (
    <div className="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
      <ServerHeader server={server} role={role} />
      <ScrollArea className="flex-1 px-3">
        <div className="mt-2">
          <ServerSearch
            data={[
              {
                label: "Text Channels",
                type: "channel",
                data: textChannels?.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[ChannelType.TEXT],
                })),
              },
              {
                label: "Voice Channels",
                type: "channel",
                data: audioChannels?.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[ChannelType.AUDIO],
                })),
              },
              {
                label: "Video Channels",
                type: "channel",
                data: vidoeChannels?.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[ChannelType.VIDEO],
                })),
              },
              {
                label: "Members",
                type: "member",
                data: server.members?.map((member) => ({
                  id: member.id,
                  name: member.user?.name,
                  icon: roleIconMap[member.role],
                })),
              },
            ]}
          />
        </div>
        <Separator className="bg-zinc-200 dark:bg-zinc-700 rounded-md my-2" />
        {!!textChannels?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="channels"
              channelType={ChannelType.TEXT}
              server={server}
              role={role}
              label="Text Channels"
            />
            <div className="space-y-[2px]">
              {textChannels.map((channel) => (
                <ServerChannel
                  key={channel.id}
                  channel={channel}
                  server={server}
                  role={role}
                />
              ))}
            </div>
          </div>
        )}
        {!!audioChannels?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="channels"
              channelType={ChannelType.AUDIO}
              server={server}
              role={role}
              label="Voice Channels"
            />
            <div className="space-y-[2px]">
              {audioChannels.map((channel) => (
                <ServerChannel
                  key={channel.id}
                  channel={channel}
                  server={server}
                  role={role}
                />
              ))}
            </div>
          </div>
        )}
        {!!vidoeChannels?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="channels"
              channelType={ChannelType.VIDEO}
              server={server}
              role={role}
              label="Video Channels"
            />
            <div className="space-y-[2px]">
              {vidoeChannels.map((channel) => (
                <ServerChannel
                  key={channel.id}
                  channel={channel}
                  server={server}
                  role={role}
                />
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
