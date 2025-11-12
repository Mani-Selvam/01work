import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, MessageSquare } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TeamMember {
  id: number;
  displayName: string;
  email: string;
  photoURL?: string;
  uniqueUserId: string;
}

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  message: string;
  readStatus: boolean;
  createdAt: string;
}

interface ConversationData {
  memberId: number;
  memberName: string;
  memberPhoto?: string;
  lastMessage?: Message;
  unreadCount: number;
}

export default function TeamMessages() {
  const { dbUserId } = useAuth();
  const { toast } = useToast();
  const [selectedMember, setSelectedMember] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");

  const { data: teamMembers = [], isLoading: loadingMembers } = useQuery<TeamMember[]>({
    queryKey: [`/api/team-assignments/${dbUserId}/members`],
    enabled: !!dbUserId,
  });

  const { data: allMessages = [], isLoading: loadingMessages } = useQuery<Message[]>({
    queryKey: ['/api/messages'],
    enabled: !!dbUserId,
    refetchInterval: 5000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { receiverId: number; message: string }) => {
      return await apiRequest('/api/messages', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      setMessageText("");
      toast({
        title: "Success",
        description: "Message sent successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const conversations: ConversationData[] = teamMembers.map(member => {
    const memberMessages = allMessages.filter(
      msg => (msg.senderId === member.id && msg.receiverId === dbUserId) ||
             (msg.senderId === dbUserId && msg.receiverId === member.id)
    );
    
    const sortedMessages = memberMessages.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    const unreadCount = memberMessages.filter(
      msg => msg.senderId === member.id && !msg.readStatus
    ).length;

    return {
      memberId: member.id,
      memberName: member.displayName,
      memberPhoto: member.photoURL,
      lastMessage: sortedMessages[0],
      unreadCount,
    };
  });

  const selectedConversation = conversations.find(c => c.memberId === selectedMember);
  
  const conversationMessages = selectedMember
    ? allMessages
        .filter(
          msg => (msg.senderId === selectedMember && msg.receiverId === dbUserId) ||
                 (msg.senderId === dbUserId && msg.receiverId === selectedMember)
        )
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    : [];

  const handleSendMessage = () => {
    if (!selectedMember || !messageText.trim()) return;
    
    sendMessageMutation.mutate({
      receiverId: selectedMember,
      message: messageText.trim(),
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loadingMembers) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-96 lg:col-span-1" />
          <Skeleton className="h-96 lg:col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Team Messages</h1>
          <p className="text-muted-foreground">Communicate with your team members</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Team Members</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground text-center">
                  No team members assigned yet
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {conversations.map((conv) => (
                  <button
                    key={conv.memberId}
                    onClick={() => setSelectedMember(conv.memberId)}
                    className={`w-full p-4 hover-elevate active-elevate-2 text-left flex items-start gap-3 ${
                      selectedMember === conv.memberId ? 'bg-muted' : ''
                    }`}
                    data-testid={`conversation-${conv.memberId}`}
                  >
                    <Avatar>
                      <AvatarImage src={conv.memberPhoto} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(conv.memberName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium truncate">{conv.memberName}</p>
                        {conv.unreadCount > 0 && (
                          <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.lastMessage?.message || "No messages yet"}
                      </p>
                      {conv.lastMessage && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTime(conv.lastMessage.createdAt)}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedConversation.memberPhoto} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(selectedConversation.memberName)}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-base">{selectedConversation.memberName}</CardTitle>
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
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          data-testid={`message-${msg.id}`}
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
                      );
                    })
                  )}
                </div>
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
              </CardContent>
            </>
          ) : (
            <CardContent className="flex flex-col items-center justify-center py-24">
              <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
              <p className="text-sm text-muted-foreground text-center">
                Select a team member from the list to start messaging
              </p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
