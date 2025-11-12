import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, TrendingUp } from "lucide-react";

export default function TeamRatings() {
  const teamRatings = [
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "",
      overallRating: 4.8,
      categories: {
        performance: 5.0,
        punctuality: 4.5,
        teamwork: 5.0,
        communication: 4.7,
      },
      trend: "up",
    },
    {
      id: 2,
      name: "Mike Chen",
      avatar: "",
      overallRating: 4.5,
      categories: {
        performance: 4.5,
        punctuality: 4.8,
        teamwork: 4.3,
        communication: 4.5,
      },
      trend: "stable",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      avatar: "",
      overallRating: 4.2,
      categories: {
        performance: 4.0,
        punctuality: 4.5,
        teamwork: 4.2,
        communication: 4.0,
      },
      trend: "up",
    },
  ];

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Team Ratings</h1>
          <p className="text-muted-foreground">Review and manage team member performance ratings</p>
        </div>
        <Button data-testid="button-add-rating">
          <Star className="h-4 w-4 mr-2" />
          Add Rating
        </Button>
      </div>

      <div className="grid gap-4">
        {teamRatings.map((member) => (
          <Card key={member.id} data-testid={`card-rating-${member.id}`}>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(member.overallRating)}
                      <span className="text-sm font-semibold">{member.overallRating.toFixed(1)}</span>
                      {member.trend === "up" && (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Performance</p>
                  <div className="flex items-center gap-2">
                    {renderStars(member.categories.performance)}
                    <span className="text-sm font-medium">{member.categories.performance.toFixed(1)}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Punctuality</p>
                  <div className="flex items-center gap-2">
                    {renderStars(member.categories.punctuality)}
                    <span className="text-sm font-medium">{member.categories.punctuality.toFixed(1)}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Teamwork</p>
                  <div className="flex items-center gap-2">
                    {renderStars(member.categories.teamwork)}
                    <span className="text-sm font-medium">{member.categories.teamwork.toFixed(1)}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Communication</p>
                  <div className="flex items-center gap-2">
                    {renderStars(member.categories.communication)}
                    <span className="text-sm font-medium">{member.categories.communication.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Button variant="outline" size="sm" data-testid={`button-view-history-${member.id}`}>
                  View History
                </Button>
                <Button variant="outline" size="sm" data-testid={`button-update-rating-${member.id}`}>
                  Update Rating
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
