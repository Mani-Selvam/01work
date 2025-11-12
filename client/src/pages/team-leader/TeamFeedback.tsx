import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo } from "react";

interface Feedback {
  id: number;
  userId: number;
  message: string;
  createdAt: string;
}

interface TeamMember {
  id: number;
  displayName: string;
  email: string;
}

interface ExtendedFeedback extends Feedback {
  displayName?: string;
}

export default function TeamFeedback() {
  const { dbUserId, companyId } = useAuth();
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const { data: teamMembers = [], isLoading: loadingMembers } = useQuery<TeamMember[]>({
    queryKey: [`/api/team-assignments/${dbUserId}/members`],
    enabled: !!dbUserId,
  });

  const { data: allFeedbacks = [], isLoading: loadingFeedbacks } = useQuery<Feedback[]>({
    queryKey: [`/api/feedbacks`],
    enabled: !!companyId,
  });

  const teamMemberIds = teamMembers.map(m => m.id);
  const teamFeedbackList: ExtendedFeedback[] = allFeedbacks
    .filter(feedback => teamMemberIds.includes(feedback.userId))
    .map(feedback => {
      const member = teamMembers.find(m => m.id === feedback.userId);
      return {
        ...feedback,
        displayName: member?.displayName,
      };
    });

  const feedbackStats = useMemo(() => {
    const positive = teamFeedbackList.filter(f => 
      f.message.toLowerCase().includes('great') || 
      f.message.toLowerCase().includes('excellent') ||
      f.message.toLowerCase().includes('good job') ||
      f.message.toLowerCase().includes('well done')
    ).length;
    
    const concern = teamFeedbackList.filter(f => 
      f.message.toLowerCase().includes('concern') || 
      f.message.toLowerCase().includes('issue') ||
      f.message.toLowerCase().includes('problem')
    ).length;
    
    const suggestion = teamFeedbackList.length - positive - concern;
    
    return { positive, concern, suggestion };
  }, [teamFeedbackList]);

  const getTypeIcon = (message: string) => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('great') || lowerMessage.includes('excellent') || 
        lowerMessage.includes('good job') || lowerMessage.includes('well done')) {
      return <ThumbsUp className="h-4 w-4 text-green-600" />;
    }
    if (lowerMessage.includes('concern') || lowerMessage.includes('issue') || 
        lowerMessage.includes('problem')) {
      return <ThumbsDown className="h-4 w-4 text-red-600" />;
    }
    return <MessageSquare className="h-4 w-4 text-blue-600" />;
  };

  const getTypeBadge = (message: string) => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('great') || lowerMessage.includes('excellent') || 
        lowerMessage.includes('good job') || lowerMessage.includes('well done')) {
      return <Badge variant="default" className="bg-green-600">Positive</Badge>;
    }
    if (lowerMessage.includes('concern') || lowerMessage.includes('issue') || 
        lowerMessage.includes('problem')) {
      return <Badge variant="destructive">Concern</Badge>;
    }
    return <Badge variant="default">Suggestion</Badge>;
  };

  const filteredFeedbackList = selectedType 
    ? teamFeedbackList.filter(f => {
        const lowerMessage = f.message.toLowerCase();
        if (selectedType === 'positive') {
          return lowerMessage.includes('great') || lowerMessage.includes('excellent') || 
                 lowerMessage.includes('good job') || lowerMessage.includes('well done');
        }
        if (selectedType === 'concern') {
          return lowerMessage.includes('concern') || lowerMessage.includes('issue') || 
                 lowerMessage.includes('problem');
        }
        return !lowerMessage.includes('great') && !lowerMessage.includes('excellent') && 
               !lowerMessage.includes('good job') && !lowerMessage.includes('well done') &&
               !lowerMessage.includes('concern') && !lowerMessage.includes('issue') && 
               !lowerMessage.includes('problem');
      })
    : teamFeedbackList;

  if (loadingMembers || loadingFeedbacks) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-5 w-72" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      </div>
    );
  }

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
        <Card 
          className="cursor-pointer hover-elevate"
          onClick={() => setSelectedType(selectedType === 'positive' ? null : 'positive')}
          data-testid="card-filter-positive"
        >
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Positive</CardTitle>
            <ThumbsUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-positive">{feedbackStats.positive}</div>
            <p className="text-xs text-muted-foreground mt-1">Team feedback</p>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer hover-elevate"
          onClick={() => setSelectedType(selectedType === 'suggestion' ? null : 'suggestion')}
          data-testid="card-filter-suggestion"
        >
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suggestions</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-suggestions">{feedbackStats.suggestion}</div>
            <p className="text-xs text-muted-foreground mt-1">Team feedback</p>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer hover-elevate"
          onClick={() => setSelectedType(selectedType === 'concern' ? null : 'concern')}
          data-testid="card-filter-concern"
        >
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concerns</CardTitle>
            <ThumbsDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-concerns">{feedbackStats.concern}</div>
            <p className="text-xs text-muted-foreground mt-1">Team feedback</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {filteredFeedbackList.map((feedback) => (
          <Card key={feedback.id} data-testid={`card-feedback-${feedback.id}`}>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {feedback.displayName?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(feedback.message)}
                      <CardTitle className="text-base">Feedback from {feedback.displayName || 'Team Member'}</CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {getTypeBadge(feedback.message)}
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

      {filteredFeedbackList.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground" data-testid="text-no-feedback">
              {selectedType ? `No ${selectedType} feedback found` : 'No feedback received yet'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
