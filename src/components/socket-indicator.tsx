import { useSocket } from "@/components/providers/socket-provider";
import { Badge } from "@/components/ui/badge";

export const SocketIndicator = () => {
  const { isConnected } = useSocket();

  if (!isConnected) {
    return (
      <Badge variant="outline" className="bg-destructive text-white border-none">
        Fallback: Poling every 1s
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-success/80 text-white border-none">
      Live: Real-time updates
    </Badge>
  );
};
