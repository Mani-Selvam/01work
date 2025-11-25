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
      // Refresh messages when new admin messages arrive
      if (messageData.messageType === 'admin_to_team_leader' && messageData.receiverId === dbUserId) {
        queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      }
    }
  });

  const adminMessages = allMessages.filter(
    msg => msg.receiverId === dbUserId && msg.messageType === 'admin_to_team_leader'
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
        <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <Mail className="h-6 w-6 sm:h-8 sm:w-8" />
          Private Messages
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Messages from administration
        </p>
      </div>

      <div className="space-y-3">
        {adminMessages.map((msg) => {
          const sender = getSenderInfo(msg.senderId);
          return (
            <Card 
              key={msg.id} 
              className={`${!msg.readStatus ? "border-primary" : ""}`}
              data-testid={`message-${msg.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={sender?.photoURL} alt={sender?.displayName} />
                    <AvatarFallback>{sender ? getInitials(sender.displayName) : 'AD'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold">
                          {sender?.displayName || 'Admin'}
                        </span>
                        {!msg.readStatus && (
                          <Badge variant="secondary" className="shrink-0">New</Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                        {format(new Date(msg.createdAt), "MMM dd, yyyy h:mm a")}
                      </span>
                    </div>
                    <p className="text-sm text-foreground break-words">{msg.message}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${msg.readStatus ? "bg-muted" : "bg-primary/10"}`}>
                    {msg.readStatus ? (
                      <MailOpen className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Mail className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {adminMessages.length === 0 && (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-lg font-semibold mb-2">No Private Messages</h3>
                <p className="text-sm text-muted-foreground">
                  You haven't received any private messages from administration yet.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
