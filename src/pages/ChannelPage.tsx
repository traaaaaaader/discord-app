import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ServersService, UsersService } from "@/services";
import {
  ChannelType,
  ServerWithMembersWithUsersAndChannels,
  User,
} from "@/utils/types/servers";
import { ChatHeader } from "@/components/chat/chat-header";
import { ServerChannelsSidebar } from "@/components/server/server-channels-sidebar";
import { ServerMembersSidebar } from "@/components/server/server-members-sidebar";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import { MediaRoom } from "@/components/chat/media-room";
import Spinner from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";
import { useMedia } from "@/components/providers/media-provider";

const ChannelPage = () => {
  const { serverId, channelId } = useParams<{
    serverId: string;
    channelId: string;
  }>();
  const navigate = useNavigate();
  const [leaved, setLeaved] = useState<boolean>(false);

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return navigate("/auth/login");
    const u = await UsersService.get(token);
    if (!u) return navigate("/auth/login");
    setUser(u);
    setAuthLoading(false);
  }, [navigate]);
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const [server, setServer] =
    useState<ServerWithMembersWithUsersAndChannels | null>(null);
  const [serverLoading, setServerLoading] = useState(true);
  const fetchServer = useCallback(async () => {
    if (!serverId) return;
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error();
      const data = await ServersService.get(serverId, token);
      setServer(data);
    } catch {
      navigate("/auth/login");
    } finally {
      setServerLoading(false);
    }
  }, [serverId, navigate]);
  useEffect(() => {
    fetchServer();
  }, [fetchServer]);

  const isAudio = useMemo(
    () =>
      server?.channels.some(
        (c) => c.id === channelId && c.type === ChannelType.AUDIO
      ),
    [server, channelId]
  );

  const { join, joined } = useMedia();
  useEffect(() => {
    if (user && isAudio && !joined && !leaved) {
      join(channelId!, user);
    }
  }, [user, isAudio, joined, join, channelId]);

  if (authLoading || serverLoading) return <Spinner />;
  if (!user || !server || !channelId) return <Spinner />;

  const channel = server.channels.find((c) => c.id === channelId);
  const member = server.members.find((m) => m.userId === user.id);

  if (!channel || !member) {
    return <Spinner />;
  }

  return (
    <div className="h-full">
      <div className="hidden md:flex h-full w-60 fixed inset-y-0">
        <ServerChannelsSidebar user={user} server={server} />
      </div>
      {channel.type !== ChannelType.AUDIO && (
        <div className="hidden md:flex h-full w-60 fixed inset-y-0 right-0">
          <ServerMembersSidebar user={user} server={server} />
        </div>
      )}
      <main
        className={cn(
          "h-full md:pl-60",
          channel.type !== ChannelType.AUDIO ? "md:pr-60" : "md:pr-0"
        )}
      >
        <div className="flex flex-col h-screen bg-white dark:bg-[#313338]">
          <ChatHeader
            name={channel.name}
            serverId={channel.serverId}
            type="channel"
          />
          {channel.type === ChannelType.TEXT ? (
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
                query={{ channelId: channel.id, serverId: channel.serverId }}
              />
            </>
          ) : (
            <MediaRoom
              setLeaved={setLeaved}
              channelId={channel.id}
              user={user}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default ChannelPage;
