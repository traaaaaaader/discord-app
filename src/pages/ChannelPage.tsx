import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ChannelType,
  ServerWithMembersWithUsersAndChannels,
} from "@/utils/types/servers";
import { ServersService } from "@/services";

import { ChatHeader } from "@/components/chat/chat-header";
// import { ChatInput } from "@/components/chat/chat-input";
// import { ChatMessages } from "@/components/chat/chat-messages";

import { ServerChannelsSidebar } from "@/components/server/server-channels-sidebar";
import { ServerMembersSidebar } from "@/components/server/server-members-sidebar";

import Spinner from "@/components/ui/Spinner";
import { ChatMessages } from "../components/chat/chat-messages";
import { ChatInput } from "../components/chat/chat-input";

const ChannelPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.user);

  if (!user) {
    navigate("/auth/login");
  }

  const serverId = params.serverId;
  const channelId = params.channelId;

  const [server, setServer] =
    useState<ServerWithMembersWithUsersAndChannels | null>(null);

  useEffect(() => {
    const fetchServers = async () => {
      try {
        if (!serverId) {
          throw new Error("Server ID is required.");
        }
        const data: ServerWithMembersWithUsersAndChannels =
          await ServersService.get(serverId);
        setServer(data);
      } catch (error) {
        console.error("Ошибка при загрузке сервера:", error);
        navigate("/auth/login");
      }
    };

    fetchServers();
  }, [navigate, serverId]);

  if (!server) {
    navigate("/");
    return;
  }

  const channel = server.channels.find((channel) => channel.id === channelId);
  const member = server.members.find((member) => member.userId === user.id);

  if (!serverId || !channel || !member) {
    return <Spinner />;
  }

  return (
    <div className="h-full">
      <div className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0">
        <ServerChannelsSidebar userId={user.id} server={server} />
      </div>
      <div className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0 right-0">
        <ServerMembersSidebar server={server} />
      </div>
      <main className="h-full md:px-60">
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
          {/* {channel.type === ChannelType.AUDIO && (
        <MediaRoom chatId={channel.id} video={false} audio={true} />
      )}
      {channel.type === ChannelType.VIDEO && (
        <MediaRoom chatId={channel.id} video={true} audio={true} />
      )} */}
        </div>
      </main>
    </div>
  );
};

export default ChannelPage;
