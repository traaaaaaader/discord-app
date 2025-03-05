import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { Conversation } from "@/utils/types/chat";
import { UserAvatar } from "../user-avatar";
import { ActionTooltip } from "../action-tooltip";
import { Plus } from "lucide-react";
import { useModal } from "@/hooks/use-modal-store";

interface ConversationSidebarProps {
  conversations?: Conversation[];
  updateConversationId: (id: string) => void;
}

export const ConversationSidebar = ({
  conversations,
  updateConversationId,
}: ConversationSidebarProps) => {
  const navigate = useNavigate();
  const { onOpen } = useModal();
  const user = JSON.parse(localStorage.user);

  if (!user) {
    navigate("/auth/login");
  }

  return (
    <div className="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
      <div className="flex justify-between px-4 mt-4 text-md font-semibold text-zinc-500 dark:text-zinc-400 ">
        <p>Сообщения</p>
        <ActionTooltip label="Create Conversation" side="top">
          <button
            onClick={() => onOpen("createConversation")}
            className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
          >
            <Plus className="h-4 w-4" />
          </button>
        </ActionTooltip>
      </div>
      <Separator className="bg-zinc-200 dark:bg-zinc-700 rounded-md my-2" />
      <ScrollArea className="flex-1 px-3">
        <div className="mt-2">
          {conversations?.map((conversation) => (
            <div
              className="p-2 flex items-center text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 rounded-md cursor-pointer hover:dark:bg-[#3e41468d]"
              onClick={() => updateConversationId(conversation.id)}
            >
              <UserAvatar
                src={
                  conversation.userTwo.id === user.id
                    ? conversation.userOne.imageUrl
                    : conversation.userTwo.imageUrl
                }
              />
              <p className="ml-2">
                {conversation.userTwo.id === user.id
                  ? conversation.userOne.name
                  : conversation.userTwo.name}
              </p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
