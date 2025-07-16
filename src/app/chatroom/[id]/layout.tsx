"use client";
import { ChatroomProvider, useChatroom } from "@/context/ChatroomContext";
import Link from "next/link";
import DarkModeToggle from "../../../components/DarkModeToggle";
import { Bot} from 'lucide-react';
import Header from "@/components/Header";

export default function ChatroomLayout({ children }: { children: React.ReactNode }) {
  const { selectedChatroom, isTyping } = useChatroom();

  return (
    <ChatroomProvider>
      <Header/>
      {children}
    </ChatroomProvider>
  );
} 