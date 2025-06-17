import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";

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

import { UsersService } from "@/services";
import { Tornado } from "lucide-react";

export const NavigationSideBar = () => {
  const { onOpen } = useModal();
  const navigate = useNavigate();

  const [servers, setServers] = useState<Server[]>([]);
  const [user, setUser] = useState<User>();

  const fetchData = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        navigate("/auth/login");
        return;
      }

      const user = await UsersService.get(accessToken);
      if (!user) {
        navigate("/auth/login");
        return;
      }
      setUser(user);

      const servers = await ServersService.getAll(accessToken);
      setServers(servers);
    } catch (error) {
      console.error("Ошибка при загрузке данных: ", error);
      navigate("/auth/login");
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const textChannels = useMemo(
    () =>
      servers.map((s) => ({
        id: s.id,
        firstTextChannelId: s.channels.find((c) => c.type === ChannelType.TEXT)
          ?.id,
      })),
    [servers]
  );

  if (!servers || !user) {
    return <Spinner />;
  }

  return (
    <div className="space-y-4 flex flex-col items-center h-full text-primary w-full bg-card py-3 border-r border-border">
      <ActionTooltip side="right" align="center" label="Личные сообщения">
        <button
          onClick={() => navigate("/")}
          className="group flex items-center cursor-pointer"
        >
          <div
            className="flex mx-3 h-[48px] w-[48px] rounded-[24px]
            group-hover:rounded-[16px] transition-all overflow-hidden
            items-center justify-center bg-secondary group-hover:bg-accent "
          >
            <Tornado className="group-hover:text-accent-foreground transition text-primary" />
          </div>
        </button>
      </ActionTooltip>
      <Separator className="h-[2px] bg-border rounded-md w-10 mx-auto" />
      <ScrollArea className="flex-1 w-full">
        {servers.map((server) => (
          <div key={server.id} className="mb-4">
            <NavigationItem
              serverId={server.id}
              channelId={
                textChannels.find((tc) => tc.id === server.id)
                  ?.firstTextChannelId!
              }
              imageUrl={server.imageUrl}
              name={server.name}
            />
          </div>
        ))}
      </ScrollArea>
      <Separator className="h-[2px] bg-border rounded-md w-10 mx-auto" />
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
