import { useInfiniteQuery } from "@tanstack/react-query";

import { useSocket } from "@/components/providers/socket-provider";
import { ConversationMessagesService, MessagesService } from "@/services";

interface ChatQueryProps {
  queryKey: string;
  paramKey: "channelId" | "conversationId";
  paramValue: string;
  enabled?: boolean;
}

export const useChatQuery = ({
  queryKey,
  paramKey,
  paramValue,
  enabled = true,
}: ChatQueryProps) => {
  if (!enabled) {
    return {
      data: undefined,
      fetchNextPage: () => {},
      hasNextPage: false,
      isFetchingNextPage: false,
      status: 'disabled' as const,
    };
  }
  const { isConnected } = useSocket();

  const fetchMessages = async ({ pageParam = undefined }) => {
    const messages =
      paramKey === "channelId"
        ? await MessagesService.get(pageParam, paramKey, paramValue)
        : ConversationMessagesService.get(pageParam, paramKey, paramValue);
    return messages;
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: [queryKey],
      queryFn: fetchMessages,
      getNextPageParam: (lastPage) => lastPage?.nextCursor,
      refetchInterval: isConnected ? false : 1000,
      initialPageParam: undefined,
    });

  return {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  };
};
