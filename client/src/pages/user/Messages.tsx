import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Send, MessageSquare, Mail, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/contexts/WebSocketContext";

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  message: string;
  messageType: string;
  readStatus: boolean;
  createdAt: string;
}

interface TeamLeader {
  id: number;
  displayName: string;
  email: string;
  photoURL?: string;
}

interface Conversation {
  id: string;
  type: 'admin' | 'team_leader';
  userId?: number;
  userName: string;
  userRole?: string;
  userPhoto?: string;
  lastMessage: string;
  lastMessageTime?: Date;
}

export default function Messages() {
  const { dbUserId } = useAuth();
  const { toast } = useToast();
  const [messageText, setMessageText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  const { data: allMessages = [], isLoading: loadingMessages } = useQuery<Message[]>({
    queryKey: ['/api/messages'],
    enabled: !!dbUserId,
  });

  const { data: teamLeaderInfo, isLoading: loadingLeader } = useQuery<TeamLeader | null>({
    queryKey: ['/api/team-leader/me'],
    queryFn: async () => {
      const res = await fetch('/api/team-leader/me', {
        credentials: "include",
        headers: {
          'x-user-id': dbUserId?.toString() || '',
        },
      });

      if (res.status === 404) {
        const body = await res.json().catch(() => ({}));
        if (body.message === 'NOT_ASSIGNED') {
          return null;
        }
        throw new Error('User not found');
      }

      if (!res.ok) {
        throw new Error('Failed to fetch team leader');
      }

      return res.json();
    },
    enabled: !!dbUserId,
    retry: false,
  });

  useWebSocket((data) => {
    if (data.type === 'NEW_MESSAGE') {
      const messageData = data.data;

      if (messageData.senderId === dbUserId || messageData.receiverId === dbUserId) {
        queryClient.invalidateQueries({ queryKey: ['/api/messages'] });

        if (messageData.receiverId === dbUserId) {
          toast({
            title: "New Message",
            description: `${messageData.senderName}: ${messageData.message.substring(0, 50)}${messageData.message.length > 50 ? '...' : ''}`,
          });
        }
      }
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { receiverId: number; message: string }) => {
      return await apiRequest('/api/messages', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      setMessageText("");
      toast({
        title: "Success",
        description: "Message sent successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const adminMessages = useMemo(() => {
    return allMessages
      .filter(msg => msg.messageType === 'admin_to_employee' && msg.receiverId === dbUserId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allMessages, dbUserId]);

  const teamLeaderMessages = useMemo(() => {
    if (!teamLeaderInfo) return [];
    return allMessages
      .filter(msg => 
        ((msg.senderId === teamLeaderInfo.id && msg.receiverId === dbUserId) ||
         (msg.senderId === dbUserId && msg.receiverId === teamLeaderInfo.id)) &&
        (msg.messageType === 'team_leader_to_employee' || msg.messageType === 'employee_to_team_leader')
      )
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [teamLeaderInfo, allMessages, dbUserId]);

  const conversations: Conversation[] = useMemo(() => {
    const convs: Conversation[] = [];

    if (adminMessages.length > 0) {
      const lastAdmin = adminMessages[0];
      convs.push({
        id: 'admin-all',
        type: 'admin',
        userName: 'Admin Messages',
        lastMessage: lastAdmin.message,
        lastMessageTime: new Date(lastAdmin.createdAt),
      });
    }

    if (teamLeaderInfo) {
      const lastTeamLeader = teamLeaderMessages[teamLeaderMessages.length - 1];
      convs.push({
        id: `team-leader-${teamLeaderInfo.id}`,
        type: 'team_leader',
        userId: teamLeaderInfo.id,
        userName: teamLeaderInfo.displayName,
        userRole: 'Team Leader',
        userPhoto: teamLeaderInfo.photoURL,
        lastMessage: lastTeamLeader?.message || 'Start a conversation',
        lastMessageTime: lastTeamLeader ? new Date(lastTeamLeader.createdAt) : new Date(),
      });
    }

    return convs;
  }, [adminMessages, teamLeaderMessages, teamLeaderInfo]);

  const filteredConversations = conversations.filter(conv =>
    conv.userName.toLowerCase().includes(searchText.toLowerCase())
  );

  const getConversationMessages = () => {
    if (!selectedConversation) return [];
    if (selectedConversation.type === 'admin') return adminMessages;
    return teamLeaderMessages;
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;

    if (selectedConversation.type === 'team_leader' && teamLeaderInfo) {
      sendMessageMutation.mutate({
        receiverId: teamLeaderInfo.id,
        message: messageText.trim(),
      });
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const conversationMessages = getConversationMessages();

  if (loadingMessages || loadingLeader) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold">Messages</h2>
      </div>

      <div className="flex gap-4 h-[600px] bg-background rounded-lg border border-border overflow-hidden">
        {/* LEFT SIDEBAR - Conversations List */}
        <div className="w-72 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border space-y-3">
            <h3 className="font-semibold text-sm">Messages</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                className="pl-9 h-9"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                data-testid="input-search-messages"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 p-2">
            {filteredConversations.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p className="text-sm">No conversations</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedConversation?.id === conv.id
                      ? 'bg-primary/10 border border-primary'
                      : 'hover:bg-accent'
                  }`}
                  data-testid={`button-conversation-${conv.id}`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={conv.userPhoto} />
                      <AvatarFallback>{getInitials(conv.userName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{conv.userName}</p>
                      {conv.userRole && (
                        <p className="text-xs text-muted-foreground">{conv.userRole}</p>
                      )}
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {conv.lastMessage}
                      </p>
                    </div>
                    {conv.lastMessageTime && (
                      <p className="text-xs text-muted-foreground shrink-0">
                        {conv.lastMessageTime.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* RIGHT SIDE - Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b border-border flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selectedConversation.userPhoto} />
                  <AvatarFallback>
                    {getInitials(selectedConversation.userName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedConversation.userName}</h3>
                  {selectedConversation.userRole && (
                    <p className="text-xs text-muted-foreground">
                      {selectedConversation.userRole}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {conversationMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p className="text-sm">No messages yet</p>
                  </div>
                ) : (
                  conversationMessages.map((msg) => {
                    const isOwn = msg.senderId === dbUserId;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        data-testid={`message-${msg.id}`}
                      >
                        <div
                          className={`max-w-[60%] ${
                            isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'
                          } rounded-lg p-3`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isOwn
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {selectedConversation.type === 'team_leader' && (
                <div className="p-4 border-t border-border flex gap-2">
                  <Textarea
                    placeholder="Type a message..."
                    className="resize-none"
                    rows={2}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    data-testid="input-message"
                  />
                  <Button
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || sendMessageMutation.isPending}
                    data-testid="button-send-message"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {selectedConversation.type === 'admin' && (
                <div className="p-4 border-t border-border bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground">
                    Admin messages are read-only
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Select a conversation to start</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
