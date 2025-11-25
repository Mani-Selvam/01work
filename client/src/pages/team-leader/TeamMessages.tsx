import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, MessageSquare, Search } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";

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

export default function TeamMessages() {
  const { dbUserId } = useAuth();
  const { toast } = useToast();
  const [selectedMember, setSelectedMember] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchText, setSearchText] = useState("");

  const { data: teamMembers = [], isLoading: loadingMembers } = useQuery<TeamMember[]>({
    queryKey: [`/api/team-assignments/${dbUserId}/members`],
    enabled: !!dbUserId,
  });

  const { data: allMessages = [], isLoading: loadingMessages } = useQuery<Message[]>({
    queryKey: ['/api/messages'],
    enabled: !!dbUserId,
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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const conversations = useMemo(() => {
    return teamMembers.map(member => {
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
        member,
      };
    });
  }, [teamMembers, allMessages, dbUserId]);

  const filteredConversations = useMemo(() => {
    return conversations.filter(conv =>
      conv.memberName.toLowerCase().includes(searchText.toLowerCase()) ||
      conv.lastMessage?.message.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [conversations, searchText]);

  const selectedConversation = filteredConversations.find(c => c.memberId === selectedMember);
  
  const conversationMessages = selectedMember
    ? allMessages
        .filter(
          msg => (msg.senderId === selectedMember && msg.receiverId === dbUserId) ||
                 (msg.senderId === dbUserId && msg.receiverId === selectedMember)
        )
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    : [];

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedMember) return;

    sendMessageMutation.mutate({
      receiverId: selectedMember,
      message: messageText.trim(),
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loadingMembers || loadingMessages) {
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
        <h2 className="text-2xl sm:text-3xl font-bold">Team Messages</h2>
      </div>

      <div className="flex gap-4 h-[600px] bg-background rounded-lg border border-border overflow-hidden">
        {/* LEFT SIDEBAR - Conversations List */}
        <div className="w-72 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Team Members
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                className="pl-9 h-9"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                data-testid="input-search-members"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 p-2">
            {filteredConversations.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p className="text-sm">No team members</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.memberId}
                  onClick={() => setSelectedMember(conv.memberId)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedMember === conv.memberId
                      ? 'bg-primary/10 border border-primary'
                      : 'hover:bg-accent'
                  }`}
                  data-testid={`button-conversation-${conv.memberId}`}
                >
                  <div className="flex items-start gap-2">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={conv.memberPhoto} />
                      <AvatarFallback>{getInitials(conv.memberName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{conv.memberName}</p>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {conv.lastMessage?.message || "No messages yet"}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <div className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                        {conv.unreadCount}
                      </div>
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
                  <AvatarImage src={selectedConversation.memberPhoto} />
                  <AvatarFallback>{getInitials(selectedConversation.memberName)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedConversation.memberName}</h3>
                  <p className="text-xs text-muted-foreground">{selectedConversation.member?.email}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {conversationMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p className="text-sm">No messages yet. Start a conversation!</p>
                  </div>
                ) : (
                  conversationMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === dbUserId ? 'justify-end' : 'justify-start'}`}
                      data-testid={`message-${msg.id}`}
                    >
                      <div
                        className={`rounded-lg p-3 max-w-xs ${
                          msg.senderId === dbUserId
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${
                          msg.senderId === dbUserId
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                        }`}>
                          {format(new Date(msg.createdAt), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

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
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Select a team member to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
