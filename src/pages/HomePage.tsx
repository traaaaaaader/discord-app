import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ConversationService, UsersService } from "@/services";
import { Conversation, User } from "@/utils/types/chat";
import { ChatHeader } from "@/components/chat/chat-header";
import { ConversationSidebar } from "@/components/conversation/conversations-sidebar";
import { ConversationChatMessages } from "@/components/conversation/conversation-chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import Spinner from "@/components/ui/Spinner";

const HomePage = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return navigate("/auth/login");
    const user = await UsersService.get(token);
    if (!user) return navigate("/auth/login");
    setUser(user);
    setAuthLoading(false);
  }, [navigate]);
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [convLoading, setConvLoading] = useState(true);
  const fetchConvs = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    const conversation = await ConversationService.get(token);
    setConversations(conversation);
    setConvLoading(false);
  }, []);
  useEffect(() => {
    fetchConvs();
  }, [fetchConvs]);

  const [conversationId, setConversationId] = useState("");

  const conversation = useMemo<Conversation | undefined>(() => {
    if (!conversations.length) return undefined;
    return (
      conversations.find((c) => c.id === conversationId) || conversations[0]
    );
  }, [conversations, conversationId]);

  const partner = useMemo(() => {
    if (!conversation || !user) return undefined;
    return conversation.userOneId === user.id
      ? conversation.userTwo
      : conversation.userOne;
  }, [conversation, user]);

  if (authLoading || convLoading) return <Spinner />;
  if (!user) return <Spinner />;

  return (
    <div className="h-full">
      <div className="hidden md:flex h-full w-70 fixed inset-y-0">
        <ConversationSidebar
          conversations={conversations}
          updateConversationId={setConversationId}
        />
      </div>
      <main className="h-full md:pl-70">
        <div className="flex flex-col h-screen bg-white dark:bg-[#313338]">
          {partner && conversation && (
            <>
              <ChatHeader
                name={partner.name}
                type="conversation"
                imageUrl={partner.imageUrl}
              />
              <ConversationChatMessages
                chatId={conversation.id}
                name={partner.name}
                paramKey="conversationId"
                paramValue={conversation.id}
                socketQuery={{ conversationId }}
                type="conversation"
              />
              <ChatInput
                name={partner.name}
                type="conversation"
                apiUrl="messages"
                query={{ conversationId }}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
