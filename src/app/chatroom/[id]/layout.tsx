"use client";
import { ChatroomProvider } from "@/context/ChatroomContext";
import Header from "@/components/Header";

export default function ChatroomLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChatroomProvider>
      <Header/>
      {children}
    </ChatroomProvider>
  );
} 