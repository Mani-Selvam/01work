import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, MessageSquare, Mail, Reply } from "lucide-react";
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

export default function Messages() {
  const { dbUserId } = useAuth();
  const { toast } = useToast();
  const [messageText, setMessageText] = useState("");
  const [replyingToAdminId, setReplyingToAdminId] = useState<number | null>(null);

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
      setReplyingToAdminId(null);
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

  const handleSendMessage = () => {
    if (!teamLeaderInfo || !messageText.trim()) return;

    sendMessageMutation.mutate({
      receiverId: teamLeaderInfo.id,
      message: messageText.trim(),
    });
  };

  const handleReplyToAdmin = (adminMessageId: number) => {
    setReplyingToAdminId(adminMessageId);
  };

  const handleSendAdminReply = () => {
    if (!messageText.trim() || !teamLeaderInfo) return;

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
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold">Messages</h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          View messages from admin and your team leader
        </p>
      </div>

      {/* ADMIN MESSAGES SECTION */}
      <Card data-testid="card-admin-messages">
        <CardHeader className="border-b pb-3">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-base">Admin Messages</CardTitle>
              <p className="text-xs text-muted-foreground">Announcements from administration</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {adminMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Mail className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No admin messages yet</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {adminMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-3 bg-muted rounded-lg border border-border/50 group hover:bg-muted/80 transition-colors"
                  data-testid={`message-admin-${msg.id}`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{msg.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(msg.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 h-8 w-8 p-0"
                      onClick={() => handleReplyToAdmin(msg.id)}
                      data-testid={`button-reply-admin-${msg.id}`}
                    >
                      <Reply className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* REPLY TO ADMIN SECTION */}
      {replyingToAdminId && teamLeaderInfo && (
        <Card className="border-accent bg-accent/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Reply to Admin</CardTitle>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => setReplyingToAdminId(null)}
                data-testid="button-cancel-reply"
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Sending to: <span className="font-semibold">{teamLeaderInfo.displayName}</span>
            </p>
            <div className="flex gap-2">
              <Textarea
                placeholder="Type your reply..."
                className="resize-none"
                rows={2}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendAdminReply();
                  }
                }}
                data-testid="input-admin-reply"
              />
              <Button
                size="icon"
                onClick={handleSendAdminReply}
                disabled={!messageText.trim() || sendMessageMutation.isPending}
                data-testid="button-send-admin-reply"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TEAM LEADER MESSAGES SECTION */}
      {teamLeaderInfo && (
        <Card data-testid="card-team-leader-messages">
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={teamLeaderInfo.photoURL} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(teamLeaderInfo.displayName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">{teamLeaderInfo.displayName}</CardTitle>
                <p className="text-sm text-muted-foreground">Your Team Leader</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {teamLeaderMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <MessageSquare className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No messages yet</p>
              </div>
            ) : (
              <div className="space-y-3 mb-4 max-h-72 overflow-y-auto">
                {teamLeaderMessages.map((msg) => {
                  const isOwn = msg.senderId === dbUserId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      data-testid={`message-team-leader-${msg.id}`}
                    >
                      <div
                        className={`max-w-[70%] ${
                          isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        } rounded-lg p-3`}
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
                  );
                })}
              </div>
            )}
            <div className="flex gap-2 pt-4 border-t">
              <Textarea
                placeholder="Type your message..."
                className="resize-none"
                rows={2}
                value={!replyingToAdminId ? messageText : ''}
                onChange={(e) => !replyingToAdminId && setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !replyingToAdminId) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                data-testid="input-message"
                disabled={replyingToAdminId !== null}
              />
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={!messageText.trim() || sendMessageMutation.isPending || replyingToAdminId !== null}
                data-testid="button-send-message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
