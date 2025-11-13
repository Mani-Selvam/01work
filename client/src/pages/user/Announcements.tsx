import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Megaphone, MessageCircle, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/contexts/WebSocketContext";
import type { GroupMessage, GroupMessageReply } from "@shared/schema";

function AnnouncementCard({ announcement }: { announcement: GroupMessage }) {
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState("");
  const { toast } = useToast();

  const user = localStorage.getItem('user');
  const userId = user ? JSON.parse(user).id : null;

  const { data: replies = [], isLoading: repliesLoading } = useQuery<GroupMessageReply[]>({
    queryKey: ['/api/group-messages', announcement.id, 'replies'],
    queryFn: async () => {
      const headers: Record<string, string> = {};
      if (userId) {
        headers["x-user-id"] = userId.toString();
      }
      
      const res = await fetch(`/api/group-messages/${announcement.id}/replies`, { headers, credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch replies');
      return res.json();
    },
    enabled: showReplies,
  });

  const replyMutation = useMutation({
    mutationFn: async (message: string) => {
      return await apiRequest(`/api/group-messages/${announcement.id}/replies`, 'POST', { message });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/group-messages', announcement.id, 'replies'] });
      setReplyText("");
      toast({
        title: "Reply sent",
        description: "Your reply has been posted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post reply",
        variant: "destructive",
      });
    },
  });

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    replyMutation.mutate(replyText);
  };

  return (
    <Card data-testid={`card-announcement-${announcement.id}`}>
      <CardHeader>
        <div className="flex items-start gap-3">
          <Megaphone className="h-5 w-5 text-primary mt-0.5" />
          <div className="flex-1">
            {announcement.title && (
              <CardTitle className="text-lg mb-2">{announcement.title}</CardTitle>
            )}
            <p className="text-sm text-muted-foreground font-mono">
              {format(new Date(announcement.createdAt), 'MMM dd, yyyy HH:mm')}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm whitespace-pre-wrap">{announcement.message}</p>

        <div className="border-t pt-4">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => setShowReplies(!showReplies)}
            data-testid={`button-toggle-replies-${announcement.id}`}
          >
            <MessageCircle className="h-4 w-4" />
            {showReplies ? 'Hide' : 'Show'} Replies {replies.length > 0 && `(${replies.length})`}
          </Button>

          {showReplies && (
            <div className="mt-4 space-y-4">
              {repliesLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  {replies.length > 0 && (
                    <div className="space-y-3" data-testid={`replies-list-${announcement.id}`}>
                      {replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="bg-muted rounded-md p-3"
                          data-testid={`reply-${reply.id}`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{reply.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(new Date(reply.createdAt), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <form onSubmit={handleReplySubmit} className="space-y-2">
                    <Textarea
                      placeholder="Write your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="min-h-[80px]"
                      data-testid={`textarea-reply-${announcement.id}`}
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!replyText.trim() || replyMutation.isPending}
                      className="gap-2"
                      data-testid={`button-submit-reply-${announcement.id}`}
                    >
                      {replyMutation.isPending ? (
                        <>Sending...</>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Reply
                        </>
                      )}
                    </Button>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Announcements() {
  const { data: announcements = [], isLoading } = useQuery<GroupMessage[]>({
    queryKey: ['/api/group-messages'],
    queryFn: async () => {
      const user = localStorage.getItem('user');
      const userId = user ? JSON.parse(user).id : null;
      const headers: Record<string, string> = {};
      if (userId) {
        headers["x-user-id"] = userId.toString();
      }
      
      const res = await fetch('/api/group-messages', { headers, credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch announcements');
      return res.json();
    },
  });

  useWebSocket((data) => {
    if (data.type === 'GROUP_MESSAGE_REPLY') {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/group-messages', data.groupMessageId, 'replies'] 
      });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold">Announcements</h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">Group messages from admin</p>
      </div>

      {announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map(announcement => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No announcements yet
        </div>
      )}
    </div>
  );
}
