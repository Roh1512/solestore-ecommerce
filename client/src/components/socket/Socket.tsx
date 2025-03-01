import { useCurrentAuthState } from "@/app/useCurrentState";
import { socketConn as socket } from "@/utils/socket_io";
import { ReactNode, useEffect } from "react";
const Socket = ({ children }: { children: ReactNode }) => {
  const token = useCurrentAuthState().accessToken;

  useEffect(() => {
    // Authentication handler
    socket.on("connect", () => {
      socket.emit("authenticate", { token });
    });

    socket.on("connection_success", () => {
      console.log("Successfully connected to WebSocket server");
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  }, [token]);

  return children;
};

export default Socket;
