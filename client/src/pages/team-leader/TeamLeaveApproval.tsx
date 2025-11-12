import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Calendar, User } from "lucide-react";

export default function TeamLeaveApproval() {
  const leaveRequests = [
    {
      id: 1,
      employeeName: "Sarah Johnson",
      leaveType: "Vacation",
      startDate: "2024-12-20",
      endDate: "2024-12-27",
      days: 5,
      reason: "Family vacation during holidays",
      status: "pending",
    },
    {
      id: 2,
      employeeName: "Mike Chen",
      leaveType: "Sick Leave",
      startDate: "2024-12-12",
      endDate: "2024-12-12",
      days: 1,
      reason: "Medical appointment",
      status: "pending",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Leave Approval</h1>
        <p className="text-muted-foreground">Review and approve team leave requests</p>
      </div>

      <div className="grid gap-4">
        {leaveRequests.map((request) => (
          <Card key={request.id} data-testid={`card-leave-${request.id}`}>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {request.employeeName}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                        </span>
                        <span className="text-muted-foreground">({request.days} days)</span>
                      </div>
                      <div>
                        <span className="font-medium">Type:</span> {request.leaveType}
                      </div>
                    </div>
                  </CardDescription>
                </div>
                <Badge variant="secondary">{request.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Reason:</p>
                <p className="text-sm text-muted-foreground">{request.reason}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="default" size="sm" data-testid={`button-approve-${request.id}`}>
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button variant="destructive" size="sm" data-testid={`button-reject-${request.id}`}>
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {leaveRequests.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No pending leave requests</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
