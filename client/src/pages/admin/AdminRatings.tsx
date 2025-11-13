import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Users as UsersIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Rating, User } from "@shared/schema";
import RatingDialog from "@/components/RatingDialog";

export default function AdminRatings() {
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  const { data: allRatings = [] } = useQuery<Rating[]>({
    queryKey: ['/api/ratings'],
  });

  const teamLeaders = users.filter(u => u.role === 'team_leader');

  const getUserNameById = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user?.displayName || "Unknown User";
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRatingStars = (rating: string) => {
    const starCount: Record<string, number> = {
      'excellent': 5,
      'very_good': 4,
      'good': 3,
      'average': 2,
      'poor': 1,
    };
    return starCount[rating.toLowerCase()] || 3;
  };

  const getRatingLabel = (ratingStr: string): string => {
    return ratingStr.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground"
            }`}
          />
        ))}
      </div>
    );
  };

  const getLeaderLatestRating = (leaderId: number) => {
    const leaderRatings = allRatings.filter(r => r.userId === leaderId);
    return leaderRatings.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <Star className="h-8 w-8" />
          Performance Ratings
        </h2>
        <p className="text-muted-foreground mt-1">
          Rate team leaders and view all ratings
        </p>
      </div>

      <Tabs defaultValue="team-leaders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="team-leaders" data-testid="tab-team-leaders">
            <UsersIcon className="h-4 w-4 mr-2" />
            Team Leaders ({teamLeaders.length})
          </TabsTrigger>
          <TabsTrigger value="all-ratings" data-testid="tab-all-ratings">
            All Ratings ({allRatings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="team-leaders" className="space-y-4">
          {teamLeaders.length > 0 ? (
            <div className="grid gap-4">
              {teamLeaders.map(leader => {
                const latestRating = getLeaderLatestRating(leader.id);
                return (
                  <Card key={leader.id} data-testid={`card-leader-${leader.id}`}>
                    <CardHeader>
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={leader.photoURL || undefined} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {getInitials(leader.displayName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{leader.displayName}</CardTitle>
                            <p className="text-sm text-muted-foreground">{leader.email}</p>
                            {latestRating ? (
                              <div className="flex items-center gap-2 mt-1">
                                {renderStars(getRatingStars(latestRating.rating))}
                                <span className="text-sm font-semibold">
                                  {getRatingLabel(latestRating.rating)}
                                </span>
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground mt-1">
                                No ratings yet
                              </p>
                            )}
                          </div>
                        </div>
                        <RatingDialog
                          userId={leader.id}
                          userName={leader.displayName}
                          trigger={
                            <Button variant="outline" size="sm" data-testid={`button-rate-${leader.id}`}>
                              <Star className="h-4 w-4 mr-2" />
                              Rate Leader
                            </Button>
                          }
                        />
                      </div>
                    </CardHeader>
                    {latestRating && (
                      <CardContent>
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Rating Period</p>
                            <p className="text-sm font-medium">
                              {getRatingLabel(latestRating.period)}
                            </p>
                          </div>
                          {latestRating.feedback && (
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Feedback</p>
                              <p className="text-sm">{latestRating.feedback}</p>
                            </div>
                          )}
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Rated On</p>
                            <p className="text-sm">
                              {format(new Date(latestRating.createdAt), 'MMMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <UsersIcon className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No team leaders found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all-ratings">
          <Card>
            <CardHeader>
              <CardTitle>All Ratings ({allRatings.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {allRatings.length > 0 ? (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  {allRatings.map((rating) => (
                    <Card key={rating.id} data-testid={`rating-${rating.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-base truncate">{getUserNameById(rating.userId)}</h4>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(rating.createdAt), "MMM dd, yyyy")}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {getRatingLabel(rating.period)}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {renderStars(getRatingStars(rating.rating))}
                            <span className="text-sm font-medium">{getRatingLabel(rating.rating)}</span>
                          </div>
                          {rating.feedback && (
                            <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                              {rating.feedback}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No ratings yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
