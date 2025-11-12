import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock, User } from "lucide-react";

export default function TeamCorrectionRequests() {
  const correctionRequests = [
    {
      id: 1,
      employeeName: "Sarah Johnson",
      date: "2024-12-10",
      originalTime: "09:15 AM",
      correctedTime: "09:00 AM",
      reason: "Forgot to clock in on time, was in a meeting",
      status: "pending",
    },
    {
      id: 2,
      employeeName: "Mike Chen",
      date: "2024-12-09",
      originalTime: "05:45 PM",
      correctedTime: "06:00 PM",
      reason: "System error during clock out",
      status: "pending",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Correction Requests</h1>
        <p className="text-muted-foreground">Review and approve attendance correction requests</p>
      </div>

      <div className="grid gap-4">
        {correctionRequests.map((request) => (
          <Card key={request.id} data-testid={`card-correction-${request.id}`}>
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
                        <Clock className="h-4 w-4" />
                        <span>{new Date(request.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-destructive line-through">{request.originalTime}</span>
                        <span>→</span>
                        <span className="text-green-600 font-medium">{request.correctedTime}</span>
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
                <Button variant="default" size="sm" data-testid={`button-approve-correction-${request.id}`}>
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button variant="destructive" size="sm" data-testid={`button-reject-correction-${request.id}`}>
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {correctionRequests.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No pending correction requests</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
