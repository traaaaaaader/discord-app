import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "@/components/user-avatar";
import { ActionTooltip } from "@/components/action-tooltip";
import Spinner from "@/components/ui/Spinner";

import { useModal } from "@/hooks/use-modal-store";
import { Conversation } from "@/utils/types/chat";
import { User } from "@/utils/types/servers";

import { UsersService } from "@/services";

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

  const [user, setUser] = useState<User | null>(null);
  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return navigate("/auth/login");
    const user = await UsersService.get(token);
    if (!user) return navigate("/auth/login");
    setUser(user);
  }, [navigate]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (!user) {
    return <Spinner />;
  }

  return (
    <div className="flex flex-col h-full text-primary w-full bg-card">
      <div className="h-16 px-3 flex items-center justify-between text-lg font-semibold ">
        Сообщения
        <ActionTooltip label="Начать беседу" side="top">
          <button
            onClick={() => onOpen("createConversation")}
            className="cursor-pointer text-accent hover:text-accent/90 transition"
          >
            <div
              className="flex h-10 w-10 rounded-full
            hover:rounded-2xl transition-all overflow-hidden
            items-center justify-center bg-secondary hover:bg-accent"
            >
              <Plus className="hover:text-accent-foreground transition text-primary" />
            </div>
          </button>
        </ActionTooltip>
      </div>
      <Separator className="bg-border rounded-md" />
      <ScrollArea className="flex-1 px-3">
        <div className="mt-2">
          {conversations?.map((conversation) => (
            <div
              key={conversation.id}
              className="p-2 flex items-center hover:bg-accent/10 rounded-md cursor-pointer text-foreground hover:text-accent"
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
