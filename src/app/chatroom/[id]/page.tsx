"use client";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import { ChatroomProvider, useChatroom } from "@/context/ChatroomContext";
import { Copy } from 'lucide-react';

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  image?: string;
  timestamp: number;
}

function getMessages(chatroomId: string): Message[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(`messages-${chatroomId}`) || "[]");
  } catch {
    return [];
  }
}

function saveMessages(chatroomId: string, messages: Message[]) {
  localStorage.setItem(`messages-${chatroomId}`, JSON.stringify(messages));
}

const PAGE_SIZE = 20;
function generateDummyMessages(count: number, before?: number): Message[] {
  const now = before || Date.now();
  return Array.from({ length: count }, (_, i) => ({
    id: `dummy-${now - (i + 1) * 60000}`,
    sender: i % 2 === 0 ? "ai" : "user",
    text: `Dummy message ${i + 1}`,
    timestamp: now - (i + 1) * 60000,
  }));
}

export default function ChatroomPage() {
  const { id } = useParams();
  const chatroomId = (Array.isArray(id) ? id[0] : id) || "default";
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const topRef = useRef<HTMLDivElement>(null);
  const { setSelectedChatroom, setIsTyping } = useChatroom();

  useEffect(() => {
    // On mount, load the latest PAGE_SIZE messages
    const all = getMessages(chatroomId);
    // Get chatroom title from localStorage
    const chatrooms = JSON.parse(localStorage.getItem("chatrooms") || "[]");
    const found = chatrooms.find((c: any) => c.id === chatroomId);
    setSelectedChatroom(found ? { id: found.id, title: found.title } : { id: chatroomId, title: `Chatroom ${chatroomId}` });
    if (all.length > PAGE_SIZE) {
      setMessages(all.slice(-PAGE_SIZE));
      setHasMore(true);
      setPage(1);
    } else {
      setMessages(all);
      setHasMore(false);
      setPage(1);
    }
  }, [chatroomId, setSelectedChatroom]);

  useEffect(() => {
    saveMessages(chatroomId, messages);
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatroomId]);

  useEffect(() => {
    setIsTyping(aiTyping);
  }, [aiTyping, setIsTyping]);

  const handleSend = () => {
    if (!input.trim() && !image) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: input,
      image: image || undefined,
      timestamp: Date.now(),
    };
    setMessages((msgs) => [...msgs, newMsg]);
    setInput("");
    setImage(null);
    setAiTyping(true);
    setLoading(true);
    // Simulate AI reply
    setTimeout(() => {
      setMessages((msgs) => [
        ...msgs,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: "This is a simulated Gemini reply!",
          timestamp: Date.now(),
        },
      ]);
      setAiTyping(false);
      setLoading(false);
    }, 1500);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const loadOlder = () => {
    setLoadingOlder(true);
    setTimeout(() => {
      const all = getMessages(chatroomId);
      const totalLoaded = (page + 1) * PAGE_SIZE;
      let newMessages = all;
      // If not enough, simulate with dummy data
      if (all.length < totalLoaded) {
        const dummy = generateDummyMessages(totalLoaded - all.length, all[0]?.timestamp || Date.now());
        newMessages = [...dummy.reverse(), ...all];
        saveMessages(chatroomId, newMessages);
      }
      setMessages(newMessages.slice(-totalLoaded));
      setPage(page + 1);
      setHasMore(newMessages.length > (page + 1) * PAGE_SIZE ? true : false);
      setLoadingOlder(false);
      // Scroll to the first loaded message
      topRef.current?.scrollIntoView({ behavior: "auto" });
    }, 800);
  };

  return (
    <div className="mx-auto mt-8 p-4 shadow flex flex-col bg-white dark:bg-gray-800" style={{ height: 'calc(100vh - 64px)', margin : '0', padding : '' }}>
      <div className="flex-1 overflow-y-auto mb-4 pr-2 flex flex-col" style={{padding : '0 40px'}}>
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-10">No messages yet.</div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={msg.id}
            className={`group flex flex-col items-${msg.sender === "user" ? "end" : "start"} mb-2`}
          >
            <div
              className={`relative max-w-xs px-4 py-2 rounded-lg shadow text-sm whitespace-pre-line ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none"
              }`}
              tabIndex={0}
              role="region"
              aria-label="Message bubble"
            >
              {msg.text}
              {msg.image && (
                <img src={msg.image} alt="uploaded" className="mt-2 max-h-32 rounded" />
              )}
              {/* Copy button, visible on hover/focus */}
              <button
                onClick={() => handleCopy(msg.text)}
                className="absolute right-1 bottom-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1 shadow hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
                aria-label="Copy message"
                tabIndex={0}
                type="button"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <span className="text-xs text-gray-400 mt-1">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            {idx === messages.length - 1 && hasMore && (
              <div ref={topRef} />
            )}
          </div>
        ))}
        {hasMore && (
          <button
            onClick={loadOlder}
            disabled={loadingOlder}
            className="block mx-auto my-2 px-4 py-1 bg-gray-300 dark:bg-gray-600 rounded text-gray-700 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500"
          >
            {loadingOlder ? "Loading..." : "Load older messages"}
          </button>
        )}
        {aiTyping && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
            <span className="animate-pulse">Gemini is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* Image preview before sending */}
      <div className="relative w-full">
        {image && (
          <div className="absolute right-2 -top-20 flex flex-col items-end z-10">
            <div className="relative">
              <img src={image} alt="Preview" className="w-16 h-16 object-cover rounded border shadow" />
              <button
                type="button"
                onClick={() => setImage(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 shadow"
                aria-label="Remove image preview"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
      <form
        className="flex gap-2 items-end"
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
      >
         <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          id="img-upload"
          value=""
        />
        <label htmlFor="img-upload" className="cursor-pointer px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center justify-center">
          {/* Camera SVG icon */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 19.5V8.25A2.25 2.25 0 014.5 6h2.379a1.5 1.5 0 001.06-.44l1.122-1.12A1.5 1.5 0 0110.621 4.5h2.758a1.5 1.5 0 011.06.44l1.122 1.12a1.5 1.5 0 001.06.44H19.5a2.25 2.25 0 012.25 2.25v11.25a2.25 2.25 0 01-2.25 2.25H4.5A2.25 2.25 0 012.25 19.5z" />
            <circle cx="12" cy="13.5" r="3.75" />
          </svg>
        </label>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          placeholder="Type a message..."
          disabled={loading}
          aria-label="Type a message"
        />
       
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
          disabled={loading || (!input.trim() && !image)}
        >Send</button>
      </form>
    </div>
  );
} 