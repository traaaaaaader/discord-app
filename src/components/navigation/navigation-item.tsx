import { cn } from "@/lib/utils";
import { ActionTooltip } from "@/components/action-tooltip";
import { NavLink, useParams } from "react-router-dom";

interface NavigarionItemProps {
  serverId: string;
  channelId: string;
  imageUrl: string;
  name: string;
}

export const NavigationItem = ({ serverId, channelId, imageUrl, name }: NavigarionItemProps) => {
  const params = useParams();

  const url = imageUrl || "";

  return (
    <ActionTooltip side="right" align="center" label={name}>
      <NavLink to={`/servers/${serverId}/channels/${channelId}`} className="group relative flex items-center">
        <div
          className={cn(
            "absolute left-0 bg-primary rounded-r-full transition-all w-[4px]",
            params?.serverId !== serverId && "group-hover:h-[20px]",
            params?.serverId === serverId ? "h-[36px]" : "h-[8px]"
          )}
        />
        <div
          className={cn(
            "relative group flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden",
            params?.serverid === serverId &&
              "bg-primary/10 text-primary rounded-[16px]"
          )}
        >
          <img className="absolute" src={url} alt="Channel" />
        </div>
      </NavLink>
    </ActionTooltip>
  );
};
