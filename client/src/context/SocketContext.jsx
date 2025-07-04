import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 20000
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      // Add error handling for socket connection
      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      // Handle challenge-related errors gracefully
      newSocket.on('challenge_error', (error) => {
        console.error('Challenge error:', error);
        // Don't show error toast here, let individual components handle it
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setSocket(null);
        setIsConnected(false);
      };
    } else {
      // Clean up socket when not authenticated
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [isAuthenticated]);

  const joinChallenge = (challengeId) => {
    if (socket && isConnected && challengeId) {
      console.log('Joining challenge:', challengeId);
      socket.emit('join_challenge', challengeId);
    }
  };

  const joinLeaderboard = (challengeId) => {
    if (socket && isConnected && challengeId) {
      console.log('Joining leaderboard:', challengeId);
      socket.emit('join_leaderboard', challengeId);
    }
  };

  const requestLeaderboard = (challengeId) => {
    if (socket && isConnected && challengeId) {
      console.log('Requesting leaderboard:', challengeId);
      socket.emit('request_leaderboard', challengeId);
    }
  };

  const value = {
    socket,
    isConnected,
    joinChallenge,
    joinLeaderboard,
    requestLeaderboard
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};