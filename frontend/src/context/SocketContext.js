import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { SOCKET_URL } from "../utils/constants";

const SocketContext = createContext();

export const SocketProvider = ({ children, authToken = null }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Use authToken prop if provided, otherwise fallback to localStorage
    // Note: Ideally AuthProvider should wrap SocketProvider and pass token
    const token = authToken || localStorage.getItem("qms_token");

    // Initialize socket connection with auth token
    const socketInstance = io(SOCKET_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: {
        token: token || undefined, // Pass token if available
      },
    });

    socketInstance.on("connect", () => {
      if (process.env.NODE_ENV === 'development') {
        console.log("Socket.io connection established");
      }
      setIsConnected(true);
    });

    socketInstance.on("disconnect", (reason) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`Socket.io disconnected: ${reason}`);
      }
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error("Socket.io connection error:", error);
      }
      setIsConnected(false);
    });

    // Listen for socket errors (e.g., authentication failures)
    socketInstance.on("error", (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error("Socket.io error:", error);
      }
    });

    setSocket(socketInstance);

    // Clean up on unmount
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [authToken]); // Re-initialize socket if token changes

  // Function to subscribe as customer
  const subscribeAsCustomer = (queueName, tokenNumber) => {
    if (socket && isConnected) {
      socket.emit("customer:join", { queueName, tokenNumber });
    }
  };

  // Function to subscribe as staff
  const subscribeAsStaff = (queues) => {
    if (socket && isConnected) {
      socket.emit("staff:subscribe", { queues });
    }
  };

  // Function to subscribe as admin
  const subscribeAsAdmin = () => {
    if (socket && isConnected) {
      socket.emit("admin:subscribe");
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        subscribeAsCustomer,
        subscribeAsStaff,
        subscribeAsAdmin,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
