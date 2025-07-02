"use client";

import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Moon, Sun } from "lucide-react";

interface Message {
  id: string;
  message: string;
  sender: string;
  senderType: "client" | "artist";
  timestamp: string;
}

interface User {
  id: string;
  name: string;
  userType: "client" | "artist";
}

export default function Chat() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [darkMode, setDarkMode] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    inputRef.current?.focus();
    document.documentElement.classList.toggle("dark", darkMode);
  }, [messages, darkMode]);

  useEffect(() => {
    if (isJoined && name) {
      const newSocket = io("http://localhost:5001");
      setSocket(newSocket);

      // Join the chat
      newSocket.emit("join", { name, userType: "artist" });

      // Listen for messages
      newSocket.on("receive-message", (messageData: Message) => {
        setMessages((prev) => [...prev, messageData]);
      });

      // Listen for user events
      newSocket.on("user-joined", (data: { message: string; user: User }) => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            message: data.message,
            sender: "System",
            senderType: "artist",
            timestamp: new Date().toISOString(),
          },
        ]);
      });

      newSocket.on("user-left", (data: { message: string; user: User }) => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            message: data.message,
            sender: "System",
            senderType: "artist",
            timestamp: new Date().toISOString(),
          },
        ]);
      });

      newSocket.on("active-users", (users: User[]) => {
        setActiveUsers(users);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isJoined, name]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setIsJoined(true);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && socket) {
      socket.emit("send-message", {
        message: message.trim(),
        timestamp: new Date().toISOString(),
      });
      setMessage("");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0]?.toUpperCase())
      .join("");
  };

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold mb-6 text-center text-purple-600">
            Artist Chat
          </h1>
          <form onSubmit={handleJoin}>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your name"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500">
              Join Chat
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row transition-colors duration-300">
      {/* Sidebar for active users */}
      <aside className="hidden md:block w-64 border-r bg-card p-4">
        <h2 className="text-lg font-bold mb-4 text-purple-600 dark:text-purple-300">
          Active Users
        </h2>
        <ScrollArea className="h-[calc(100vh-4rem)] pr-2">
          <ul className="space-y-3">
            {activeUsers.map((user) => (
              <li key={user.id} className="flex items-center space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback
                    className={`bg-gradient-to-br ${user.userType === "artist" ? "from-purple-500 to-purple-700" : "from-blue-500 to-blue-700"} text-white font-bold`}>
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {user.name}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${user.userType === "artist" ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200" : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"}`}>
                  {user.userType}
                </span>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </aside>
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Card className="rounded-none bg-purple-500 dark:bg-purple-900 text-white p-4 flex flex-col md:flex-row md:items-center md:justify-between shadow-none border-0">
          <div>
            <h1 className="text-xl font-bold">
              Artist Chat - Welcome, {name}!
            </h1>
            <p className="text-sm opacity-90">
              {activeUsers.length} users online
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle dark mode"
            className="ml-auto mt-4 md:mt-0 text-white hover:bg-purple-700 dark:hover:bg-purple-800"
            onClick={() => setDarkMode((d) => !d)}>
            {darkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>
        </Card>
        {/* Messages */}
        <ScrollArea className="flex-1 h-96 p-4 space-y-2 bg-background">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === name ? "justify-end" : msg.sender === "System" ? "justify-center" : "justify-start"}`}>
              {msg.sender !== "System" && msg.sender !== name && (
                <div className="flex flex-col items-center mr-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback
                      className={`bg-gradient-to-br ${msg.senderType === "artist" ? "from-purple-500 to-purple-700" : "from-blue-500 to-blue-700"} text-white font-bold`}>
                      {getInitials(msg.sender)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {msg.senderType}
                  </span>
                </div>
              )}
              <Card
                className={`p-3 rounded-lg max-w-xs break-words shadow-sm border-0
                  ${
                    msg.sender === name
                      ? "bg-purple-500 text-white ml-auto dark:bg-purple-700"
                      : msg.sender === "System"
                        ? "bg-gray-300 text-gray-600 mx-auto text-center text-sm font-semibold dark:bg-gray-800 dark:text-gray-300"
                        : msg.senderType === "artist"
                          ? "bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200"
                          : "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200"
                  }`}>
                {msg.sender !== "System" && msg.sender !== name && (
                  <div className="text-xs font-semibold mb-1">{msg.sender}</div>
                )}
                <div>{msg.message}</div>
                <div className="text-xs opacity-70 mt-1 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </Card>
              {msg.sender === name && (
                <div className="flex flex-col items-center ml-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-700 text-white font-bold">
                      {getInitials(msg.sender)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    artist
                  </span>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </ScrollArea>
        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t bg-card">
          <div className="flex space-x-2">
            <Input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1"
              placeholder="Type your message..."
            />
            <Button
              type="submit"
              className="bg-purple-500 text-white px-6 py-2 rounded-md hover:bg-purple-600 dark:bg-purple-700 dark:hover:bg-purple-800">
              Send
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
