import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TeamAttendanceReports() {
  const teamStats = [
    {
      id: 1,
      name: "Sarah Johnson",
      presentDays: 20,
      absentDays: 2,
      lateDays: 1,
      avgHours: "8.5h",
      trend: "up",
    },
    {
      id: 2,
      name: "Mike Chen",
      presentDays: 21,
      absentDays: 1,
      lateDays: 0,
      avgHours: "8.3h",
      trend: "stable",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      presentDays: 18,
      absentDays: 4,
      lateDays: 2,
      avgHours: "7.8h",
      trend: "down",
    },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down": return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Attendance Reports</h1>
          <p className="text-muted-foreground">View team attendance analytics and trends</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="month">
            <SelectTrigger className="w-40" data-testid="select-report-period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" data-testid="button-download-report">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Team Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">91.3%</div>
            <p className="text-xs text-muted-foreground mt-1">+2.4% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Working Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.2h</div>
            <p className="text-xs text-muted-foreground mt-1">Per team member</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Member Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-medium">Name</th>
                  <th className="text-left py-3 px-2 font-medium">Present</th>
                  <th className="text-left py-3 px-2 font-medium">Absent</th>
                  <th className="text-left py-3 px-2 font-medium">Late</th>
                  <th className="text-left py-3 px-2 font-medium">Avg Hours</th>
                  <th className="text-left py-3 px-2 font-medium">Trend</th>
                </tr>
              </thead>
              <tbody>
                {teamStats.map((member) => (
                  <tr key={member.id} className="border-b last:border-0" data-testid={`report-row-${member.id}`}>
                    <td className="py-3 px-2 font-medium">{member.name}</td>
                    <td className="py-3 px-2 text-green-600">{member.presentDays}</td>
                    <td className="py-3 px-2 text-red-600">{member.absentDays}</td>
                    <td className="py-3 px-2 text-orange-600">{member.lateDays}</td>
                    <td className="py-3 px-2">{member.avgHours}</td>
                    <td className="py-3 px-2">{getTrendIcon(member.trend)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
