import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { ModeToggle } from "@/components/mode-toggle";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import Spinner from "@/components/ui/Spinner";

import { NavigationActionComponent } from "./navigation-action";
import { NavigationItem } from "./navigation-item";

import { ServersService } from "@/services/servers-service";
import { ChannelType, Server } from "@/types/servers";

export const NavigationSideBar = () => {
  const [servers, setServers] = useState<Server[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const abortController = new AbortController();
    const fetchServers = async () => {
      try {
        const data = await ServersService.getServers();
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
      <NavigationActionComponent />
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
      <div className="pb-3 mt-auto flex items-center flex-col gap-y-4">
        <ModeToggle />
        {/* <UserButton
          appearance={{
            elements: {
              avatarBox: "h-[48px] w-[48px]",
            },
          }}
        /> */}
      </div>
    </div>
  );
};
