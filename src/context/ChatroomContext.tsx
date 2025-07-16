import React, { createContext, useContext, useState } from "react";

interface Chatroom {
  id: string;
  title: string;
}

interface ChatroomContextType {
  selectedChatroom: Chatroom | null;
  setSelectedChatroom: (c: Chatroom | null) => void;
  isTyping: boolean;
  setIsTyping: (b: boolean) => void;
}

const ChatroomContext = createContext<ChatroomContextType>({
  selectedChatroom: null,
  setSelectedChatroom: () => {},
  isTyping: false,
  setIsTyping: () => {},
});

export function useChatroom() {
  return useContext(ChatroomContext);
}

export function ChatroomProvider({ children }: { children: React.ReactNode }) {
  const [selectedChatroom, setSelectedChatroom] = useState<Chatroom | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  return (
    <ChatroomContext.Provider value={{ selectedChatroom, setSelectedChatroom, isTyping, setIsTyping }}>
      {children}
    </ChatroomContext.Provider>
  );
} 