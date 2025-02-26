import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConected] = useState(false);

  useEffect(() => {
    console.log(import.meta.env.VITE_WEBSOCKET_URL)
    const socketInstance = io(import.meta.env.VITE_WEBSOCKET_URL, {
      addTrailingSlash: false,
      path: "/socket/io",
    });

    
    socketInstance.on("connect", () => {
      setIsConected(true);
    });
    
    socketInstance.on("disconnect", () => {
      setIsConected(false);
    });
    
    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
