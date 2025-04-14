import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ConversationSidebar } from "@/components/conversation/conversations-sidebar";

import { ConversationService, UsersService } from "@/services";
import { ConversationChatMessages } from "@/components/conversation/conversation-chat-messages";
import { Conversation } from "@/utils/types/chat";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatHeader } from "@/components/chat/chat-header";
import { User } from "@/utils/types/servers";

const HomePage = () => {
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationId, setConversationId] = useState("");

  const [user, setUser] = useState<User>();

  useEffect(() => {
    const fetch = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) return;

        const user = await UsersService.get(accessToken);
        setUser(user);
        const response = await ConversationService.get(accessToken);
        setConversations(response);
      } catch (error) {
        console.error("Ошибка при загрузке пользователя:", error);
        navigate("/auth/login");
      }
    };

    fetch();
  }, [navigate]);

  if (!user) {
    return;
  }

  const updateConversationId = (id: string) => {
    setConversationId(id);
  };

  const conversation = conversations.find(
    (conv) => conv.userOneId === user.id || conv.userTwoId === user.id
  );
  const partner =
    conversation?.userOneId === user.id
      ? conversation?.userTwo
      : conversation?.userOne;

  const name = partner?.name ?? "";

  return (
    <div className="h-full">
      <div className="hidden md:flex h-full w-70 z-20 flex-col fixed inset-y-0">
        <ConversationSidebar
          conversations={conversations}
          updateConversationId={updateConversationId}
        />
      </div>
      {/* <div className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0 right-0">
          <ConversatoinParticipantsSidebar participants={conversation.participants} />
        </div> */}
      <main className="h-full md:pl-70">
        <div className="bg-white dark:bg-[#313338] flex flex-col h-screen">
          {conversationId && (
            <>
              <ChatHeader
                name={name}
                type="conversation"
                imageUrl={partner?.imageUrl}
              />
              <ConversationChatMessages
                chatId={conversationId}
                name={name}
                paramKey="conversationId"
                paramValue={conversationId}
                socketQuery={{
                  conversationId,
                }}
                type="conversation"
              />
              <ChatInput
                name={name}
                type="conversation"
                apiUrl="messages"
                query={{
                  conversationId,
                }}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
