"use client";
import DarkModeToggle from "./DarkModeToggle";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Plus, Trash2, Send, Upload, Copy, Moon, Sun, LogOut, Phone, MessageCircle, Bot, User, Check, X } from 'lucide-react';
import { ChatroomProvider, useChatroom } from "@/context/ChatroomContext";

export default function Header() {
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";
  const { selectedChatroom, isTyping } = useChatroom();

  function handleLogout(){
    console.log("log out");
  }

  return isDashboard ? (
    <header className="!bg-white dark:!bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="!bg-white dark:!bg-gray-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Gemini Chat</h1>
          </div>
          <div className="flex items-center gap-2">
           <DarkModeToggle/>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-red-500"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
  ) : (
    <header className="!bg-white dark:!bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="!bg-white dark:!bg-gray-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href= '/dashboard'
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
              >
              ←
            </Link>
            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 dark:text-white">{selectedChatroom?.title}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isTyping ? 'Gemini is typing...' : 'Online'}
              </p>
            </div>
          </div>
          <DarkModeToggle/>
        </div>
      </header>
  );
} 