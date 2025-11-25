import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { MessageSquare, Send, Users, X, Search } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import type { User, Message, GroupMessage } from "@shared/schema";

type ConversationType = "direct" | "group";
interface Conversation {
  id: string;
  type: ConversationType;
  userId?: number;
  userName?: string;
  userRole?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
}

export default function AdminMessages() {
  const { toast } = useToast();
  const { dbUserId } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  const { data: privateMessages = [] } = useQuery<Message[]>({
    queryKey: ['/api/messages'],
  });

  const { data: groupMessages = [] } = useQuery<GroupMessage[]>({
    queryKey: ['/api/group-messages'],
  });

  // Real-time updates
  useWebSocket((data) => {
    if (data.type === 'NEW_MESSAGE') {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
    }
    if (data.type === 'NEW_GROUP_MESSAGE') {
      queryClient.invalidateQueries({ queryKey: ['/api/group-messages'] });
    }
  });

  // Build conversations from messages and all available users
  useEffect(() => {
    const convMap = new Map<string, Conversation>();

    // First, add all team members and team leaders as conversation starters
    const teamUsers = users.filter(u => u.id !== dbUserId && (u.role === 'company_member' || u.role === 'team_leader'));
    teamUsers.forEach(user => {
      const key = `direct-${user.id}`;
      convMap.set(key, {
        id: key,
        type: "direct",
        userId: user.id,
        userName: user.displayName || "Unknown",
        userRole: user.role || "",
        lastMessage: "No messages yet",
        lastMessageTime: new Date(0),
        unreadCount: 0,
      });
    });

    // Then update with actual messages
    privateMessages.forEach(msg => {
      const otherUserId = msg.senderId === dbUserId ? msg.receiverId : msg.senderId;
      const otherUser = users.find(u => u.id === otherUserId);
      const key = `direct-${otherUserId}`;
      
      if (convMap.has(key)) {
        const lastMessageTime = new Date(msg.createdAt);
        const current = convMap.get(key)!;
        
        if (lastMessageTime > (current.lastMessageTime || new Date(0))) {
          convMap.set(key, {
            ...current,
            lastMessage: msg.message,
            lastMessageTime,
            unreadCount: msg.readStatus ? 0 : (current.unreadCount || 0) + 1,
          });
        }
      }
    });

    // Group conversations (always shown as single group chat)
    if (groupMessages.length > 0) {
      const lastGroup = groupMessages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      convMap.set('group-all', {
        id: 'group-all',
        type: 'group',
        userName: 'Announcements',
        lastMessage: lastGroup?.title || lastGroup?.message || 'No messages',
        lastMessageTime: new Date(lastGroup?.createdAt || Date.now()),
        unreadCount: 0,
      });
    }

    // Sort by most recent message first, then by user name
    const sorted = Array.from(convMap.values()).sort((a, b) => {
      // Group announcements always at top
      if (a.type === 'group') return -1;
      if (b.type === 'group') return 1;
      
      // Then sort by most recent message
      const timeA = a.lastMessageTime?.getTime() || 0;
      const timeB = b.lastMessageTime?.getTime() || 0;
      
      if (timeA !== timeB) return timeB - timeA;
      
      // If same time, sort by name
      return (a.userName || '').localeCompare(b.userName || '');
    });

    setConversations(sorted);
  }, [privateMessages, groupMessages, users, dbUserId]);

  const sendPrivateMessageMutation = useMutation({
    mutationFn: async ({ receiverId, message, role }: { receiverId: number; message: string; role?: string }) => {
      // Determine messageType based on recipient role
      let messageType = 'direct_message';
      if (role === 'team_leader') {
        messageType = 'admin_to_team_leader';
      } else if (role === 'company_member') {
        messageType = 'admin_to_employee';
      }

      return await apiRequest('/api/messages', 'POST', {
        senderId: dbUserId,
        receiverId,
        message,
        messageType,
        readStatus: false,
      });
    },
    onSuccess: () => {
      setMessageInput("");
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const sendGroupMessageMutation = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      return await apiRequest('/api/group-messages', 'POST', {
        message,
        title: null,
      });
    },
    onSuccess: () => {
      setMessageInput("");
      queryClient.invalidateQueries({ queryKey: ['/api/group-messages'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;

    if (selectedConversation.type === 'direct' && selectedConversation.userId) {
      sendPrivateMessageMutation.mutate({
        receiverId: selectedConversation.userId,
        message: messageInput,
        role: selectedConversation.userRole,
      });
    } else if (selectedConversation.type === 'group') {
      sendGroupMessageMutation.mutate({
        message: messageInput,
      });
    }
  };

  const getConversationMessages = () => {
    if (!selectedConversation) return [];

    if (selectedConversation.type === 'direct' && selectedConversation.userId) {
      return privateMessages.filter(msg => 
        (msg.senderId === dbUserId && msg.receiverId === selectedConversation.userId) ||
        (msg.receiverId === dbUserId && msg.senderId === selectedConversation.userId)
      ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }

    if (selectedConversation.type === 'group') {
      return groupMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }

    return [];
  };

  const formatTime = (date: Date) => {
    if (isToday(date)) return format(date, 'HH:mm');
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM dd');
  };

  const filteredConversations = conversations.filter(conv =>
    conv.userName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [getConversationMessages()]);

  const messages = getConversationMessages();

  return (
    <div className="h-[calc(100vh-120px)] md:h-[calc(100vh-100px)] flex flex-col md:flex-row gap-0 md:gap-4 bg-background">
      {/* Conversations List */}
      <div className={`w-full md:w-80 border-r border-border flex flex-col ${selectedConversation ? 'hidden md:flex' : ''}`}>
        <div className="p-4 border-b border-border space-y-3">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            Chats
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9"
              data-testid="input-search-conversations"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No conversations yet
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full text-left p-3 rounded-lg transition-colors hover:bg-muted ${
                    selectedConversation?.id === conv.id ? 'bg-primary/10' : ''
                  }`}
                  data-testid={`conv-${conv.id}`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback>
                        {conv.type === 'group' ? <Users className="h-5 w-5" /> : (conv.userName?.[0] || '?')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium truncate">{conv.userName}</p>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {conv.lastMessageTime && formatTime(conv.lastMessageTime)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col md:flex-col gap-0">
          {/* Chat Header */}
          <div className="border-b border-border p-4 flex items-center justify-between bg-background">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedConversation(null)}
                className="md:hidden"
                data-testid="button-back-to-conversations"
              >
                <X className="h-4 w-4" />
              </Button>
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {selectedConversation.type === 'group' ? <Users className="h-5 w-5" /> : selectedConversation.userName?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{selectedConversation.userName}</p>
                {selectedConversation.type === 'direct' && selectedConversation.userRole && (
                  <Badge variant="outline" className="text-xs mt-1">
                    {selectedConversation.userRole === 'team_leader' ? 'Team Leader' : 'Team Member'}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No messages yet. Start a conversation!
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isOwn = 'senderId' in msg && msg.senderId === dbUserId;
                  return (
                    <div
                      key={`${msg.id}-${idx}`}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      data-testid={`message-${msg.id}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isOwn
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {'title' in msg && msg.title && (
                          <p className="font-semibold text-sm mb-1">{msg.title}</p>
                        )}
                        <p className="text-sm break-words">{msg.message}</p>
                        <p className={`text-xs mt-1 ${isOwn ? 'opacity-70' : 'opacity-60'}`}>
                          {format(new Date(msg.createdAt), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="border-t border-border p-4 bg-background">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={sendPrivateMessageMutation.isPending || sendGroupMessageMutation.isPending}
                data-testid="input-message"
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={
                  !messageInput.trim() ||
                  sendPrivateMessageMutation.isPending ||
                  sendGroupMessageMutation.isPending
                }
                size="icon"
                data-testid="button-send-message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-muted-foreground">
          <div className="text-center space-y-4">
            <MessageSquare className="h-16 w-16 mx-auto opacity-20" />
            <p>Select a conversation to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}
