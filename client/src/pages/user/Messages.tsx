import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, MessageSquare } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
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

export default function Messages() {
  const { dbUserId } = useAuth();
  const { toast } = useToast();
  const [messageText, setMessageText] = useState("");

  const { data: allMessages = [], isLoading: loadingMessages } = useQuery<Message[]>({
    queryKey: ['/api/messages'],
    enabled: !!dbUserId,
  });

  // Fetch assigned team leader using dedicated endpoint
  const { data: teamLeaderInfo, isLoading: loadingLeader, error: leaderError } = useQuery<TeamLeader | null>({
    queryKey: ['/api/team-leader/me'],
    queryFn: async () => {
      const res = await fetch('/api/team-leader/me', {
        credentials: "include",
        headers: {
          'x-user-id': dbUserId?.toString() || '',
        },
      });
      
      // Handle "NOT_ASSIGNED" case specifically
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

  // Real-time message updates via WebSocket
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

  // Get messages from team leader OR admin
  const conversationMessages = useMemo(() => {
    if (!teamLeaderInfo && !allMessages.some(m => m.messageType === 'admin_to_employee' && m.receiverId === dbUserId)) {
      return [];
    }

    return allMessages
      .filter(msg => {
        // Team leader conversation
        const isTeamLeaderMsg = (msg.senderId === teamLeaderInfo?.id || msg.receiverId === teamLeaderInfo?.id) &&
                                (msg.messageType === 'team_leader_to_employee' || msg.messageType === 'employee_to_team_leader');
        
        // Admin message
        const isAdminMsg = msg.messageType === 'admin_to_employee' && msg.receiverId === dbUserId;
        
        return isTeamLeaderMsg || isAdminMsg;
      })
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [teamLeaderInfo, allMessages, dbUserId]);

  const unreadCount = conversationMessages.filter(
    msg => msg.senderId === teamLeaderInfo?.id && !msg.readStatus
  ).length;

  const handleSendMessage = () => {
    if (!teamLeaderInfo || !messageText.trim()) return;
    
    sendMessageMutation.mutate({
      receiverId: teamLeaderInfo.id,
      message: messageText.trim(),
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loadingMessages || loadingLeader) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold">Messages</h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
        </p>
      </div>

      <Card>
        {teamLeaderInfo || conversationMessages.length > 0 ? (
          <>
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={teamLeaderInfo?.photoURL} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {teamLeaderInfo ? getInitials(teamLeaderInfo.displayName) : 'TL'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">{teamLeaderInfo?.displayName || 'Team Messages'}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {teamLeaderInfo ? 'Your Team Leader' : 'Messages from team'}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                {conversationMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No messages yet. Start a conversation!
                    </p>
                  </div>
                ) : (
                  conversationMessages.map((msg) => {
                    const isOwn = msg.senderId === dbUserId;
                    const isFromAdmin = msg.messageType === 'admin_to_employee';
                    return (
                      <div key={msg.id} data-testid={`message-${msg.id}`}>
                        {isFromAdmin && (
                          <p className="text-xs text-muted-foreground mb-1 font-semibold">Admin Message</p>
                        )}
                        <div
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] ${
                              isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'
                            } rounded-md p-3`}
                          >
                            <p className="text-sm">{msg.message}</p>
                            <p
                              className={`text-xs mt-1 ${
                                isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                              }`}
                            >
                              {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              {teamLeaderInfo && (
                <div className="flex gap-2 pt-4 border-t">
                  <Textarea
                    placeholder="Type your message..."
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
            </CardContent>
          </>
        ) : (
          <CardContent className="flex flex-col items-center justify-center py-24" data-testid="card-not-assigned">
            <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2" data-testid="text-not-assigned-title">No Team Leader Assigned</h3>
            <p className="text-sm text-muted-foreground text-center mb-4" data-testid="text-not-assigned-description">
              You haven't been assigned to a team leader yet.
            </p>
            <p className="text-sm text-muted-foreground text-center" data-testid="text-not-assigned-guidance">
              Contact your administrator to be assigned to a team.
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
