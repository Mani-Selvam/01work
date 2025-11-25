import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Mail, MailOpen } from "lucide-react";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { queryClient } from "@/lib/queryClient";

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

  const { data: allMessages = [], isLoading: loadingMessages } = useQuery<Message[]>({
    queryKey: ['/api/messages'],
    enabled: !!dbUserId,
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  // Real-time message updates via WebSocket
  useWebSocket((data) => {
    if (data.type === 'NEW_MESSAGE') {
      const messageData = data.data;
      if (messageData.messageType === 'admin_to_team_leader' && messageData.receiverId === dbUserId) {
        queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      }
    }
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

  if (loadingMessages) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold">Admin Messages</h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Messages and announcements from administration
        </p>
      </div>

      {/* ADMIN MESSAGES SECTION */}
      <Card data-testid="card-admin-messages">
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Messages from Administration</CardTitle>
              <p className="text-sm text-muted-foreground">Important updates and notices</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3 max-h-full overflow-y-auto">
            {adminMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Mail className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground text-center">
                  No admin messages yet. You'll receive important updates here.
                </p>
              </div>
            ) : (
              adminMessages.map((msg) => {
                const sender = getSenderInfo(msg.senderId);
                return (
                  <div
                    key={msg.id}
                    className="p-4 border border-border/50 rounded-lg bg-card hover:bg-accent/5 transition-colors"
                    data-testid={`message-admin-${msg.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={sender?.photoURL} alt={sender?.displayName} />
                        <AvatarFallback>{sender ? getInitials(sender.displayName) : 'AD'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold">
                              {sender?.displayName || 'Administrator'}
                            </span>
                            {!msg.readStatus && (
                              <Badge variant="default" className="shrink-0 text-xs">New</Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                            {format(new Date(msg.createdAt), "MMM dd, yyyy h:mm a")}
                          </span>
                        </div>
                        <p className="text-sm text-foreground break-words">{msg.message}</p>
                      </div>
                      <div className={`p-2 rounded-lg shrink-0 ${msg.readStatus ? "bg-muted" : "bg-primary/10"}`}>
                        {msg.readStatus ? (
                          <MailOpen className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Mail className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
