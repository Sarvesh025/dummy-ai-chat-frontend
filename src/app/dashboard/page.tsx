"use client";
import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import { LogOut, MessageCircle } from 'lucide-react';
import DarkModeToggle from "../../components/DarkModeToggle";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

interface Chatroom {
  id: string;
  title: string;
}

function getChatrooms(): Chatroom[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("chatrooms") || "[]");
  } catch {
    return [];
  }
}

function saveChatrooms(chatrooms: Chatroom[]) {
  localStorage.setItem("chatrooms", JSON.stringify(chatrooms));
}

export default function DashboardPage() {
  const [chatrooms, setChatrooms] = useState<Chatroom[]>([]);
  const [search, setSearch] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [showModal, setShowModal] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setChatrooms(getChatrooms());
  }, []);

  // Debounced search input
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearch(searchValue);
    }, 300);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchValue]);

  const handleCreate = () => {
    if (!newTitle.trim()) {
      toast.error("Chatroom title required");
      return;
    }
    const newRoom = { id: Date.now().toString(), title: newTitle.trim() };
    const updated = [...chatrooms, newRoom]; // Oldest at top, newest at bottom
    setChatrooms(updated);
    saveChatrooms(updated);
    setNewTitle("");
    setShowModal(false);
    toast.success("Chatroom created successfully!");
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    const updated = chatrooms.filter((c) => c.id !== deleteId);
    setChatrooms(updated);
    saveChatrooms(updated);
    setDeleteId(null);
    toast.success("Chatroom deleted successfully!");
  };

  const cancelDelete = () => {
    setDeleteId(null);
  };

  const visibleChatrooms = search
    ? chatrooms.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()))
    : chatrooms;

    function handleLogout(){
      Cookies.remove("auth_token");
      localStorage.removeItem("auth");
      router.push("/login");
    }

  return (
    <div className="w-full min-h-screen">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="px-4 py-3 flex items-center justify-between">
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
      {chatrooms.length === 0 ? (
        // Centered create button when no chatrooms
        <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900" style={{ height: 'calc(100vh - 64px)' }}>
          <button
            onClick={() => setShowModal(true)}
            className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-xl hover:bg-blue-700 transition shadow"
          >
            + New Chat
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full bg-gray-50 dark:bg-gray-900" style={{ overflow: 'auto', height: 'calc(100vh - 64px)' }}>
          {/* Row with search and create button */}
          <div className="flex w-[90vw] max-w-2xl gap-2 mt-8 mb-6 bg-white dark:bg-gray-800" style={{ position: 'sticky', top: '10px', zIndex: '99999' }}>
            <input
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              className="flex-1 p-4 border rounded-lg focus:ring-2 focus:ring-blue-400 text-lg"
              placeholder="Search chatrooms..."
              aria-label="Search chatrooms"
            />
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition shadow"
            >
              + New Chat
            </button>
          </div>
          {/* Chatroom list */}
          <ul className="w-[90vw] max-w-2xl space-y-4 mt-2">
            {visibleChatrooms.length === 0 && (
              <li className="py-6 text-center text-gray-500">No chatrooms found.</li>
            )}
            {visibleChatrooms.map((c) => (
              <li key={c.id} className="group relative">
                <Link
                  href={`/chatroom/${c.id}`}
                  className="flex items-center gap-4 p-5 rounded-xl bg-gradient-to-r from-blue-100/60 to-blue-50 dark:from-gray-700 dark:to-gray-800 shadow group-hover:shadow-lg transition cursor-pointer w-full relative"
                  style={{ textDecoration: 'none' }}
                  aria-label={`Open chatroom ${c.title}`}
                >
                  <img src="/window.svg" alt="Chatroom" className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-400 p-2" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-lg truncate text-gray-900 dark:text-white">{c.title}</div>
                    <div className="text-gray-500 text-sm truncate dark:text-gray-300">Chatroom ID: {c.id}</div>
                  </div>
                  <button
                    onClick={e => { e.preventDefault(); e.stopPropagation(); handleDelete(c.id); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 p-2 rounded-full bg-transparent hover:bg-red-100 dark:hover:bg-red-900 opacity-0 group-hover:opacity-100 transition"
                    aria-label={`Delete chatroom ${c.title}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Modal for creating chatroom */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-md flex flex-col gap-5 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-2 text-center text-gray-900 dark:text-white">Create New Chatroom</h2>
            <input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
              placeholder="Chatroom name"
              onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
              autoFocus
            />
            <div className="flex gap-3 mt-2">
              <button
                onClick={handleCreate}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 transition shadow"
              >Create</button>
              <button
                onClick={() => { setShowModal(false); setNewTitle(""); }}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 focus:ring-2 focus:ring-gray-400 transition shadow"
              >Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-sm flex flex-col gap-4 items-center border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
            <h2 className="text-xl font-bold mb-4 text-center">Are you sure you want to delete this chat?</h2>
            <div className="flex gap-4 w-full justify-center">
              <button
                onClick={confirmDelete}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
              >OK</button>
              <button
                onClick={cancelDelete}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 