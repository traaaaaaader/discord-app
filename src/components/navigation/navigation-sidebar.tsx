import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { ModeToggle } from "@/components/mode-toggle";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import Spinner from "@/components/ui/Spinner";

import { NavigationActionComponent } from "./navigation-action";
import { NavigationItem } from "./navigation-item";

import { ServersService } from "@/services/servers-service";
import { ChannelType, Server, User } from "@/utils/types/servers";
import { UserAvatar } from "@/components/user-avatar";

import { useModal } from "@/hooks/use-modal-store";
import { ActionTooltip } from "../action-tooltip";
import { IconBrandDiscordFilled } from "@tabler/icons-react";

export const NavigationSideBar = () => {
  const { onOpen } = useModal();
  const navigate = useNavigate();

  const [servers, setServers] = useState<Server[]>([]);

  const user: User = JSON.parse(localStorage.user);
  if (!user) {
    navigate("/auth/login");
  }

  useEffect(() => {
    const abortController = new AbortController();
    const fetchServers = async () => {
      try {
        const data = await ServersService.getAll();
        setServers(data);
      } catch (error) {
        console.error("Ошибка при загрузке серверов:", error);
        navigate("/auth/login");
      }
    };

    fetchServers();

    return () => {
      abortController.abort();
    };
  }, [navigate]);

  if (!servers) {
    return <Spinner />;
  }

  return (
    <div className="space-y-4 flex flex-col items-center h-full text-primary w-full dark:bg-[#1E1F22] bg-[#E3E5E8] py-3">
      <ActionTooltip side="right" align="center" label="Личные сообщения">
        <button
          onClick={() => navigate("/")}
          className="group flex items-center"
        >
          <div
            className="flex mx-3 h-[48px] w-[48px] rounded-[24px]
            group-hover:rounded-[16px] transition-all overflow-hidden
            items-center justify-center bg-background dark:bg-neutral-700 group-hover:bg-emerald-500"
          >
            <IconBrandDiscordFilled
              className="group-hover:text-white transition text-emerald-500"
            />
          </div>
        </button>
      </ActionTooltip>
      <Separator className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto" />
      <ScrollArea className="flex-1 w-full">
        {servers.map((server) => (
          <div key={server.id} className="mb-4">
            <NavigationItem
              serverId={server.id}
              channelId={
                server.channels.filter(
                  (channel) => channel.type === ChannelType.TEXT
                )[0].id
              }
              imageUrl={server.imageUrl}
              name={server.name}
            />
          </div>
        ))}
      </ScrollArea>
      <Separator className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto" />
      <NavigationActionComponent />
      <div className="pb-3 mt-auto flex items-center flex-col gap-y-4">
        <ModeToggle />
        <UserAvatar
          src={user.imageUrl}
          onClick={() => onOpen("editUser", { user: { ...user } })}
        />
      </div>
    </div>
  );
};
