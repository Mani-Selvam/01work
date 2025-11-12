import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";

export default function TeamFeedback() {
  const feedbackList = [
    {
      id: 1,
      from: "Sarah Johnson",
      avatar: "",
      type: "positive",
      subject: "Great work on Q4 report",
      message: "The quarterly report was well-structured and insightful. Keep up the good work!",
      date: "2024-12-11",
      status: "read",
    },
    {
      id: 2,
      from: "Mike Chen",
      avatar: "",
      type: "suggestion",
      subject: "Design workflow improvement",
      message: "I think we could improve our design review process by adding a checklist template.",
      date: "2024-12-10",
      status: "unread",
    },
    {
      id: 3,
      from: "Emily Rodriguez",
      avatar: "",
      type: "concern",
      subject: "Documentation clarity",
      message: "Some of the API documentation could be clearer. Would appreciate more examples.",
      date: "2024-12-09",
      status: "read",
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "positive":
        return <ThumbsUp className="h-4 w-4 text-green-600" />;
      case "concern":
        return <ThumbsDown className="h-4 w-4 text-red-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "positive":
        return <Badge variant="default" className="bg-green-600">Positive</Badge>;
      case "concern":
        return <Badge variant="destructive">Concern</Badge>;
      default:
        return <Badge variant="default">Suggestion</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Team Feedback</h1>
          <p className="text-muted-foreground">Review feedback from your team members</p>
        </div>
        <Button data-testid="button-provide-feedback">
          <MessageSquare className="h-4 w-4 mr-2" />
          Provide Feedback
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Positive</CardTitle>
            <ThumbsUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suggestions</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concerns</CardTitle>
            <ThumbsDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {feedbackList.map((feedback) => (
          <Card key={feedback.id} data-testid={`card-feedback-${feedback.id}`}>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={feedback.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {feedback.from.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(feedback.type)}
                      <CardTitle className="text-base">{feedback.subject}</CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      From {feedback.from} • {new Date(feedback.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {getTypeBadge(feedback.type)}
                  {feedback.status === "unread" && (
                    <Badge variant="secondary">Unread</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{feedback.message}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" data-testid={`button-respond-${feedback.id}`}>
                  Respond
                </Button>
                <Button variant="outline" size="sm" data-testid={`button-archive-${feedback.id}`}>
                  Archive
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {feedbackList.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No feedback received yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
