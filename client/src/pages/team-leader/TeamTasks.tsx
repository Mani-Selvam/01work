import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, User } from "lucide-react";

export default function TeamTasks() {
  const tasks = [
    {
      id: 1,
      title: "Complete Q4 Report",
      assignedTo: "Sarah Johnson",
      dueDate: "2024-12-15",
      priority: "high",
      status: "in_progress",
    },
    {
      id: 2,
      title: "Review Design Mockups",
      assignedTo: "Mike Chen",
      dueDate: "2024-12-10",
      priority: "medium",
      status: "pending",
    },
    {
      id: 3,
      title: "Update API Documentation",
      assignedTo: "Emily Rodriguez",
      dueDate: "2024-12-20",
      priority: "low",
      status: "completed",
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "in_progress": return "default";
      case "pending": return "secondary";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Team Tasks</h1>
          <p className="text-muted-foreground">Manage and assign tasks to your team</p>
        </div>
        <Button data-testid="button-create-task">
          <Plus className="h-4 w-4 mr-2" />
          Create Task
        </Button>
      </div>

      <div className="grid gap-4">
        {tasks.map((task) => (
          <Card key={task.id} data-testid={`card-task-${task.id}`}>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg">{task.title}</CardTitle>
                  <CardDescription className="flex flex-wrap items-center gap-2 mt-2">
                    <User className="h-4 w-4" />
                    <span>{task.assignedTo}</span>
                    <span className="text-muted-foreground">•</span>
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                  <Badge variant={getStatusColor(task.status)}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" data-testid={`button-view-task-${task.id}`}>
                  View Details
                </Button>
                <Button variant="outline" size="sm" data-testid={`button-edit-task-${task.id}`}>
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tasks.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No tasks assigned yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
