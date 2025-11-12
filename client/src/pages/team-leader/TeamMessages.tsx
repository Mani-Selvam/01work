import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Plus } from "lucide-react";

export default function TeamMessages() {
  const conversations = [
    {
      id: 1,
      name: "Sarah Johnson",
      lastMessage: "Thanks for the feedback on the report!",
      timestamp: "2 hours ago",
      unread: 0,
      avatar: "",
    },
    {
      id: 2,
      name: "Mike Chen",
      lastMessage: "Can we discuss the design changes?",
      timestamp: "5 hours ago",
      unread: 2,
      avatar: "",
    },
  ];

  const selectedConversation = conversations[0];
  const messages = [
    {
      id: 1,
      sender: "Sarah Johnson",
      content: "Hi! I've completed the Q4 report draft",
      timestamp: "10:30 AM",
      isOwn: false,
    },
    {
      id: 2,
      sender: "You",
      content: "Great work! Let me review it and get back to you",
      timestamp: "10:45 AM",
      isOwn: true,
    },
    {
      id: 3,
      sender: "Sarah Johnson",
      content: "Thanks for the feedback on the report!",
      timestamp: "11:30 AM",
      isOwn: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Communicate with your team members</p>
        </div>
        <Button data-testid="button-new-message">
          <Plus className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  className="w-full p-4 hover-elevate active-elevate-2 text-left flex items-start gap-3"
                  data-testid={`conversation-${conv.id}`}
                >
                  <Avatar>
                    <AvatarImage src={conv.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {conv.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium truncate">{conv.name}</p>
                      {conv.unread > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                    <p className="text-xs text-muted-foreground mt-1">{conv.timestamp}</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={selectedConversation.avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {selectedConversation.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-base">{selectedConversation.name}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                  data-testid={`message-${msg.id}`}
                >
                  <div className={`max-w-[70%] ${msg.isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-md p-3`}>
                    {!msg.isOwn && <p className="text-xs font-medium mb-1">{msg.sender}</p>}
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-4 border-t">
              <Textarea
                placeholder="Type your message..."
                className="resize-none"
                rows={2}
                data-testid="input-message"
              />
              <Button size="icon" data-testid="button-send-message">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
