import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, LogIn, LogOut } from "lucide-react";

export default function TeamLeaderAttendance() {
  const todayAttendance = {
    clockIn: "09:00 AM",
    clockOut: null,
    status: "present",
    totalHours: "4h 30m",
  };

  const recentAttendance = [
    {
      date: "2024-12-11",
      clockIn: "08:55 AM",
      clockOut: "05:30 PM",
      totalHours: "8h 35m",
      status: "present",
    },
    {
      date: "2024-12-10",
      clockIn: "09:05 AM",
      clockOut: "05:45 PM",
      totalHours: "8h 40m",
      status: "present",
    },
    {
      date: "2024-12-09",
      clockIn: "09:00 AM",
      clockOut: "05:30 PM",
      totalHours: "8h 30m",
      status: "present",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Attendance</h1>
        <p className="text-muted-foreground">Track your attendance and working hours</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Attendance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-md">
                <LogIn className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Clock In</p>
                <p className="text-lg font-semibold">{todayAttendance.clockIn}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-md">
                <LogOut className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Clock Out</p>
                <p className="text-lg font-semibold">
                  {todayAttendance.clockOut || "Not clocked out"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Hours Today:</span>
              <span className="font-semibold">{todayAttendance.totalHours}</span>
            </div>
            <Badge variant="default">Present</Badge>
          </div>
          <div className="flex gap-2">
            {!todayAttendance.clockIn && (
              <Button data-testid="button-clock-in">
                <LogIn className="h-4 w-4 mr-2" />
                Clock In
              </Button>
            )}
            {todayAttendance.clockIn && !todayAttendance.clockOut && (
              <Button data-testid="button-clock-out">
                <LogOut className="h-4 w-4 mr-2" />
                Clock Out
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentAttendance.map((record, index) => (
              <div
                key={index}
                className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b last:border-0"
                data-testid={`attendance-record-${index}`}
              >
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{new Date(record.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {record.clockIn} - {record.clockOut}
                  </span>
                  <span className="font-medium">{record.totalHours}</span>
                  <Badge variant="default">{record.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
