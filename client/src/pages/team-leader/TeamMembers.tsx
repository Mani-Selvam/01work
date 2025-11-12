import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, Mail, Phone } from "lucide-react";

export default function TeamMembers() {
  const teamMembers = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.j@company.com",
      phone: "+1 234-567-8901",
      role: "Senior Developer",
      status: "active",
      avatar: "",
    },
    {
      id: 2,
      name: "Mike Chen",
      email: "mike.c@company.com",
      phone: "+1 234-567-8902",
      role: "Designer",
      status: "active",
      avatar: "",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      email: "emily.r@company.com",
      phone: "+1 234-567-8903",
      role: "Developer",
      status: "on_leave",
      avatar: "",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Team</h1>
          <p className="text-muted-foreground">Manage your assigned team members</p>
        </div>
        <Button data-testid="button-add-member">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search team members..."
            className="pl-9"
            data-testid="input-search-members"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teamMembers.map((member) => (
          <Card key={member.id} data-testid={`card-member-${member.id}`}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">{member.name}</CardTitle>
                    <CardDescription className="text-xs truncate">{member.role}</CardDescription>
                  </div>
                </div>
                <Badge variant={member.status === "active" ? "default" : "secondary"}>
                  {member.status === "active" ? "Active" : "On Leave"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="truncate">{member.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{member.phone}</span>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1" data-testid={`button-view-${member.id}`}>
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {teamMembers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No team members assigned yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
