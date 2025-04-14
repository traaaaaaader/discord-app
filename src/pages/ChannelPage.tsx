import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ChannelType,
  ServerWithMembersWithUsersAndChannels,
  User,
} from "@/utils/types/servers";
import { ServersService, UsersService } from "@/services";

import { ChatHeader } from "@/components/chat/chat-header";

import { ServerChannelsSidebar } from "@/components/server/server-channels-sidebar";
import { ServerMembersSidebar } from "@/components/server/server-members-sidebar";

import Spinner from "@/components/ui/Spinner";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import { MediaRoom } from "@/components/chat/media-room";
import { cn } from "@/lib/utils";

const ChannelPage = () => {
  const params = useParams();
  const navigate = useNavigate();

  const serverId = params.serverId;
  const channelId = params.channelId;

  const [server, setServer] =
    useState<ServerWithMembersWithUsersAndChannels | null>(null);
  const [user, setUser] = useState<User>();

  useEffect(() => {
    const fetchUser = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) return;

      const user = await UsersService.get(accessToken);
      if (!user) {
        navigate("/auth/login");
        return;
      }
      setUser(user);
    };

    fetchUser();

    const fetchServers = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) return;

        if (!serverId) {
          throw new Error("Server ID is required.");
        }
        const data: ServerWithMembersWithUsersAndChannels =
          await ServersService.get(serverId, accessToken);
        setServer(data);
      } catch (error) {
        console.error("Ошибка при загрузке сервера:", error);
        navigate("/auth/login");
      }
    };

    fetchServers();
  }, [navigate, serverId]);

  if (!server) {
    return <Spinner />;
  }
  if (!user) {
    return <Spinner />;
  }

  const channel = server.channels.find((channel) => channel.id === channelId);
  const member = server.members.find((member) => member.userId === user.id);

  if (!serverId || !channel || !member) {
    return <Spinner />;
  }

  return (
    <div className="h-full">
      <div className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0">
        <ServerChannelsSidebar user={user} server={server} />
      </div>
      {channel.type !== ChannelType.AUDIO && (
        <div className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0 right-0">
          <ServerMembersSidebar user={user} server={server} />
        </div>
      )}
      <main className={cn(
        "h-full",
        "md:pl-60",
        channel.type !== ChannelType.AUDIO ? "md:pr-60" : "md:pr-0"
      )}>
        <div className="bg-white dark:bg-[#313338] flex flex-col h-screen">
          <ChatHeader
            name={channel.name}
            serverId={channel.serverId}
            type="channel"
          />
          {channel.type == ChannelType.TEXT && (
            <>
              <ChatMessages
                member={member}
                name={channel.name}
                chatId={channel.id}
                type="channel"
                socketQuery={{
                  channelId: channel.id,
                  serverId: channel.serverId,
                }}
                paramKey="channelId"
                paramValue={channel.id}
              />
              <ChatInput
                name={channel.name}
                type="channel"
                apiUrl="messages"
                query={{
                  channelId: channel.id,
                  serverId: channel.serverId,
                }}
              />
            </>
          )}
          {channel.type === ChannelType.AUDIO && (
            <MediaRoom
              channelId={channel.id}
              username={user.name}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default ChannelPage;
