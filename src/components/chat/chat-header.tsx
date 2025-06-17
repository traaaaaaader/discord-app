import { Hash } from "lucide-react";

import { UserAvatar } from "@/components/user-avatar";
import { SocketIndicator } from "@/components/socket-indicator";
// import { ChatVideoButton } from "./chat-video-button";

interface ChatHeaderProps {
  serverId?: string;
  name: string;
  type: "channel" | "conversation";
  imageUrl?: string;
}

export const ChatHeader = ({
  serverId,
  name,
  type,
  imageUrl,
}: ChatHeaderProps) => {
  return (
    <div className="text-md font-semibold px-3 flex flex-shrink-0 items-center h-16
    bg-card border-border border">
      {/* {serverId && <MobileToggle serverId={serverId} />} */}
      {type === "channel" && (
        <Hash className="w-6 h-6 text-accent mr-2" />
      )}
      {type === "conversation" && (
        <UserAvatar src={imageUrl} className="w-8 h-8 md:w-8 md:h-8 mr-3" />
      )}
      <p className="font-semibold text-l text-accent ">{name}</p>
      <div className="ml-auto flex items-center">
        {/* {type === "conversation" && (
					<ChatVideoButton/>
				)} */}
        <SocketIndicator />
      </div>
    </div>
  );
};
