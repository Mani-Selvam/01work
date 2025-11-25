import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Mail, MessageSquare, Search } from "lucide-react";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
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
  const [searchText, setSearchText] = useState("");
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);

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
      setSelectedMessageId(null);
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

  const adminMessages = useMemo(() => {
    return allMessages
      .filter(msg => msg.receiverId === dbUserId && msg.messageType === 'admin_to_team_leader')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allMessages, dbUserId]);

  const filteredMessages = useMemo(() => {
    return adminMessages.filter(msg => {
      const sender = users.find(u => u.id === msg.senderId);
      return (
        msg.message.toLowerCase().includes(searchText.toLowerCase()) ||
        sender?.displayName.toLowerCase().includes(searchText.toLowerCase())
      );
    });
  }, [adminMessages, searchText, users]);

  const selectedMessage = selectedMessageId
    ? adminMessages.find(msg => msg.id === selectedMessageId)
    : null;

  const handleSendReply = () => {
    if (!messageText.trim() || !selectedMessage) return;

    sendReplyMutation.mutate({
      receiverId: selectedMessage.senderId,
      message: messageText.trim(),
      messageType: 'team_leader_to_admin',
    });
  };

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
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold">Admin Messages</h2>
      </div>

      <div className="flex gap-4 h-[600px] bg-background rounded-lg border border-border overflow-hidden">
        {/* LEFT SIDEBAR - Messages List */}
        <div className="w-72 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Messages
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                className="pl-9 h-9"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                data-testid="input-search-messages"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 p-2">
            {filteredMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p className="text-sm">No messages</p>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const sender = getSenderInfo(msg.senderId);
                return (
                  <button
                    key={msg.id}
                    onClick={() => setSelectedMessageId(msg.id)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      selectedMessage?.id === msg.id
                        ? 'bg-primary/10 border border-primary'
                        : 'hover:bg-accent'
                    }`}
                    data-testid={`button-message-${msg.id}`}
                  >
                    <div className="flex items-start gap-2">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={sender?.photoURL} />
                        <AvatarFallback>{getInitials(sender?.displayName || 'AD')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{sender?.displayName || 'Admin'}</p>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {msg.message}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground shrink-0">
                        {format(new Date(msg.createdAt), 'HH:mm')}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT SIDE - Message View */}
        <div className="flex-1 flex flex-col">
          {selectedMessage ? (
            <>
              <div className="p-4 border-b border-border flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={getSenderInfo(selectedMessage.senderId)?.photoURL} />
                  <AvatarFallback>
                    {getInitials(getSenderInfo(selectedMessage.senderId)?.displayName || 'Admin')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">
                    {getSenderInfo(selectedMessage.senderId)?.displayName || 'Administrator'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(selectedMessage.createdAt), "MMM dd, yyyy h:mm a")}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 flex items-start">
                <div className="w-full">
                  <div className="bg-muted rounded-lg p-4 inline-block max-w-[80%]">
                    <p className="text-sm">{selectedMessage.message}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-border flex gap-2">
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
                  data-testid="input-reply"
                />
                <Button
                  size="icon"
                  onClick={handleSendReply}
                  disabled={!messageText.trim() || sendReplyMutation.isPending}
                  data-testid="button-send-reply"
                >
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Select a message to view</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
