import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Mail, Reply } from "lucide-react";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  message: string;
  messageType: string;
  readStatus: boolean;
  createdAt: string;
}

interface User {
  id: number;
  displayName: string;
  email: string;
  photoURL?: string;
  role: string;
}

export default function TeamLeaderPrivateMessages() {
  const { dbUserId } = useAuth();
  const { toast } = useToast();
  const [messageText, setMessageText] = useState("");
  const [replyingToAdminId, setReplyingToAdminId] = useState<number | null>(null);

  const { data: allMessages = [], isLoading: loadingMessages } = useQuery<Message[]>({
    queryKey: ['/api/messages'],
    enabled: !!dbUserId,
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  useWebSocket((data) => {
    if (data.type === 'NEW_MESSAGE') {
      const messageData = data.data;
      if (messageData.messageType === 'admin_to_team_leader' && messageData.receiverId === dbUserId) {
        queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      }
    }
  });

  const sendReplyMutation = useMutation({
    mutationFn: async (data: { receiverId: number; message: string; messageType: string }) => {
      return await apiRequest('/api/messages', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      setMessageText("");
      setReplyingToAdminId(null);
      toast({
        title: "Success",
        description: "Reply sent successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send reply",
        variant: "destructive",
      });
    },
  });

  const adminMessages = allMessages
    .filter(msg => msg.receiverId === dbUserId && msg.messageType === 'admin_to_team_leader')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getSenderInfo = (senderId: number) => {
    return users.find(u => u.id === senderId);
  };

  const handleReplyToAdmin = (adminMessageId: number) => {
    setReplyingToAdminId(adminMessageId);
  };

  const handleSendReply = () => {
    if (!messageText.trim()) return;

    const adminMessage = adminMessages.find(msg => msg.id === replyingToAdminId);
    if (!adminMessage) return;

    sendReplyMutation.mutate({
      receiverId: adminMessage.senderId,
      message: messageText.trim(),
      messageType: 'team_leader_to_admin',
    });
  };

  if (loadingMessages) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold">Admin Messages</h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Messages and announcements from administration
        </p>
      </div>

      {/* ADMIN MESSAGES SECTION */}
      <Card data-testid="card-admin-messages">
        <CardHeader className="border-b pb-3">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-base">Messages from Administration</CardTitle>
              <p className="text-xs text-muted-foreground">Important updates and notices</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {adminMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Mail className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground text-center">
                No admin messages yet
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {adminMessages.map((msg) => {
                const sender = getSenderInfo(msg.senderId);
                return (
                  <div
                    key={msg.id}
                    className="p-3 bg-muted rounded-lg border border-border/50 group hover:bg-muted/80 transition-colors"
                    data-testid={`message-admin-${msg.id}`}
                  >
                    <div className="flex items-start gap-2 justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 gap-2 mb-1">
                          <span className="text-xs font-semibold">
                            {sender?.displayName || 'Administrator'}
                          </span>
                        </div>
                        <p className="text-sm text-foreground break-words">{msg.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(msg.createdAt), "MMM dd, yyyy h:mm a")}
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
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* REPLY TO ADMIN SECTION */}
      {replyingToAdminId && (
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
              Your reply will be sent to the administrator
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
                    handleSendReply();
                  }
                }}
                data-testid="input-admin-reply"
              />
              <Button
                size="icon"
                onClick={handleSendReply}
                disabled={!messageText.trim() || sendReplyMutation.isPending}
                data-testid="button-send-admin-reply"
              >
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
