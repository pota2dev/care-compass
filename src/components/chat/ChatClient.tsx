"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Plus, MessageCircle, X, Clock } from "lucide-react";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender?: { name: string; avatarUrl: string | null };
}

interface Room {
  id: string;
  type: string;
  providerName: string | null;
  subject: string | null;
  isOpen: boolean;
  updatedAt: string;
  messages: Message[];
  _count?: { messages: number };
}

interface Props {
  userId: string;
  userName: string;
  userAvatar: string;
  initialRooms: Room[];
}

const CHAT_TYPES = [
  { type: "ADMIN_SUPPORT", label: "Admin Support",    emoji: "🛡️", desc: "System queries & account help",      color: "#2D5016", bg: "#F2F7EC" },
  { type: "DAYCARE",       label: "Daycare",          emoji: "🏡", desc: "Daycare bookings & pet updates",     color: "#3A7AB5", bg: "#E3EFF8" },
  { type: "SHOP",          label: "Pet Shop",         emoji: "🛒", desc: "Product inquiries & order support",  color: "#C47A10", bg: "#FDF0D5" },
  { type: "RESCUE",        label: "Rescue Service",   emoji: "🚨", desc: "Emergency rescue coordination",      color: "#C8593A", bg: "#F9EDE8" },
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ChatClient({ userId, userName, userAvatar, initialRooms }: Props) {
  const [rooms, setRooms]             = useState<Room[]>(initialRooms);
  const [activeRoom, setActiveRoom]   = useState<Room | null>(null);
  const [messages, setMessages]       = useState<Message[]>([]);
  const [input, setInput]             = useState("");
  const [sending, setSending]         = useState(false);
  const [loadingRoom, setLoadingRoom] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const messagesEndRef                = useRef<HTMLDivElement>(null);
  const pollRef                       = useRef<NodeJS.Timeout>();

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for new messages every 3 seconds when a room is open
  const pollMessages = useCallback(async () => {
    if (!activeRoom) return;
    try {
      const res = await fetch(`/api/chat/${activeRoom.id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages ?? []);
      }
    } catch {}
  }, [activeRoom]);

  useEffect(() => {
    if (activeRoom) {
      pollMessages();
      pollRef.current = setInterval(pollMessages, 3000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeRoom, pollMessages]);

  async function openRoom(room: Room) {
    setLoadingRoom(true);
    setActiveRoom(room);
    try {
      const res = await fetch(`/api/chat/${room.id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages ?? []);
      }
    } finally {
      setLoadingRoom(false);
    }
  }

  async function startNewChat(type: string, label: string) {
    setShowNewChat(false);
    setLoadingRoom(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, providerName: label }),
      });
      if (res.ok) {
        const room = await res.json();
        setRooms((prev) => {
          const exists = prev.find((r) => r.id === room.id);
          return exists ? prev : [room, ...prev];
        });
        await openRoom(room);
      }
    } finally {
      setLoadingRoom(false);
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !activeRoom || sending) return;

    const content = input.trim();
    setInput("");
    setSending(true);

    // Optimistic update
    const tempMsg: Message = {
      id:         `temp-${Date.now()}`,
      senderId:   userId,
      senderName: userName,
      content,
      isRead:     false,
      createdAt:  new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await fetch(`/api/chat/${activeRoom.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        // Fetch updated messages after a short delay to get auto-reply
        setTimeout(pollMessages, 3500);
      }
    } finally {
      setSending(false);
    }
  }

  const chatInfo = CHAT_TYPES.find((c) => c.type === activeRoom?.type);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm mt-1" style={{ color: "#8A9480" }}>
            Chat with support, daycare, shop, and rescue teams
          </p>
        </div>
        <button
          onClick={() => setShowNewChat(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white"
          style={{ backgroundColor: "#2D5016" }}
        >
          <Plus className="w-4 h-4" /> New Chat
        </button>
      </div>

      {/* New chat modal */}
      {showNewChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          onClick={() => setShowNewChat(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg font-semibold">Start a New Chat</h2>
              <button onClick={() => setShowNewChat(false)}
                className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" style={{ color: "#8A9480" }} />
              </button>
            </div>
            <div className="space-y-3">
              {CHAT_TYPES.map((ct) => (
                <button key={ct.type} onClick={() => startNewChat(ct.type, ct.label)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all hover:shadow-sm"
                  style={{ borderColor: "rgba(45,80,22,0.1)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = ct.color)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(45,80,22,0.1)")}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ backgroundColor: ct.bg }}>{ct.emoji}</div>
                  <div>
                    <p className="font-medium text-gray-900">{ct.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#8A9480" }}>{ct.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-5" style={{ height: "calc(100vh - 220px)" }}>

        {/* Room list */}
        <div className="bg-white border rounded-2xl overflow-hidden flex flex-col"
          style={{ borderColor: "rgba(45,80,22,0.1)" }}>
          <div className="p-4 border-b font-display text-sm font-semibold"
            style={{ borderColor: "rgba(45,80,22,0.1)" }}>
            Conversations ({rooms.length})
          </div>
          <div className="flex-1 overflow-y-auto">
            {rooms.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="w-10 h-10 mx-auto mb-3" style={{ color: "rgba(45,80,22,0.2)" }} />
                <p className="text-sm" style={{ color: "#8A9480" }}>No chats yet</p>
                <button onClick={() => setShowNewChat(true)}
                  className="mt-3 text-xs font-medium" style={{ color: "#2D5016" }}>
                  Start your first chat →
                </button>
              </div>
            ) : (
              rooms.map((room) => {
                const ct = CHAT_TYPES.find((c) => c.type === room.type);
                const lastMsg = room.messages[0];
                const isActive = activeRoom?.id === room.id;
                return (
                  <button key={room.id} onClick={() => openRoom(room)}
                    className="w-full flex items-center gap-3 p-4 border-b text-left transition-all"
                    style={{
                      borderColor: "rgba(45,80,22,0.08)",
                      backgroundColor: isActive ? "#F2F7EC" : "transparent",
                    }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ backgroundColor: ct?.bg ?? "#FAF7F2" }}>
                      {ct?.emoji ?? "💬"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">{ct?.label}</p>
                        {lastMsg && (
                          <span className="text-[10px] flex-shrink-0 ml-1" style={{ color: "#8A9480" }}>
                            {timeAgo(lastMsg.createdAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs truncate mt-0.5" style={{ color: "#8A9480" }}>
                        {lastMsg ? lastMsg.content : "No messages yet"}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat window */}
        <div className="lg:col-span-2 bg-white border rounded-2xl overflow-hidden flex flex-col"
          style={{ borderColor: "rgba(45,80,22,0.1)" }}>
          {!activeRoom ? (
            <div className="flex-1 flex items-center justify-center flex-col gap-4 p-8">
              <MessageCircle className="w-16 h-16" style={{ color: "rgba(45,80,22,0.15)" }} />
              <div className="text-center">
                <p className="font-display text-lg font-semibold text-gray-900 mb-1">
                  Select a conversation
                </p>
                <p className="text-sm" style={{ color: "#8A9480" }}>
                  Choose from the left or start a new chat
                </p>
              </div>
              <button onClick={() => setShowNewChat(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white"
                style={{ backgroundColor: "#2D5016" }}>
                <Plus className="w-4 h-4" /> New Chat
              </button>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="p-4 border-b flex items-center gap-3"
                style={{ borderColor: "rgba(45,80,22,0.1)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ backgroundColor: chatInfo?.bg ?? "#FAF7F2" }}>
                  {chatInfo?.emoji ?? "💬"}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{chatInfo?.label}</p>
                  <p className="text-xs" style={{ color: "#8A9480" }}>
                    🟢 Online · Replies within minutes
                  </p>
                </div>
                <button onClick={() => { setActiveRoom(null); setMessages([]); }}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <X className="w-4 h-4" style={{ color: "#8A9480" }} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3"
                style={{ backgroundColor: "#FAF7F2" }}>
                {loadingRoom ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                      style={{ borderColor: "#2D5016", borderTopColor: "transparent" }} />
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === userId;
                    const isSupport = msg.senderName === "CareCompass Support";
                    return (
                      <div key={msg.id}
                        className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                        {/* Avatar */}
                        {!isMe && (
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                            style={{ backgroundColor: chatInfo?.bg ?? "#F2F7EC" }}>
                            {chatInfo?.emoji ?? "💬"}
                          </div>
                        )}
                        {isMe && (
                          <img src={userAvatar} alt="You"
                            className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                        )}
                        <div className={`max-w-[70%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                          {!isMe && (
                            <p className="text-[10px] px-1" style={{ color: "#8A9480" }}>
                              {msg.senderName}
                            </p>
                          )}
                          <div className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                            style={isMe
                              ? { backgroundColor: "#2D5016", color: "#fff", borderBottomRightRadius: "4px" }
                              : { backgroundColor: "#fff", color: "#2D5016", borderBottomLeftRadius: "4px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }
                            }>
                            {msg.content}
                          </div>
                          <p className="text-[10px] px-1 flex items-center gap-1"
                            style={{ color: "#8A9480" }}>
                            <Clock className="w-2.5 h-2.5" />
                            {timeAgo(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendMessage}
                className="p-4 border-t flex gap-3 items-end"
                style={{ borderColor: "rgba(45,80,22,0.1)" }}>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(e as any); } }}
                  placeholder="Type a message... (Enter to send)"
                  rows={1}
                  className="flex-1 bg-[#FAF7F2] border rounded-xl px-4 py-2.5 text-sm outline-none resize-none"
                  style={{ borderColor: "rgba(45,80,22,0.2)" }}
                />
                <button type="submit" disabled={!input.trim() || sending}
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
                  style={{ backgroundColor: "#2D5016" }}>
                  <Send className="w-4 h-4 text-white" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
