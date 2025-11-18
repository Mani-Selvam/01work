import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, User, FileText, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";
import type { Lead, LeadHistory } from "@shared/schema";

interface LeadTimelineDialogProps {
  lead: Lead;
  open: boolean;
  onClose: () => void;
}

export default function LeadTimelineDialog({ lead, open, onClose }: LeadTimelineDialogProps) {
  const { data: history = [], isLoading } = useQuery<LeadHistory[]>({
    queryKey: ["/api/lead-history", lead.id],
    enabled: open && !!lead.id,
  });

  const STAGE_NAMES: Record<number, string> = {
    1: "Lead Entry",
    2: "Requirements Collection",
    3: "Follow-up & Communication",
    4: "Document Sharing",
    5: "Quotation Preparation",
    6: "Meeting Scheduling",
    7: "Proposal Submission",
    8: "Client Approval",
    9: "Project Kickoff",
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Lead Timeline - {lead.contactName}</DialogTitle>
          <p className="text-sm text-muted-foreground">{lead.companyName}</p>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Current Stage</p>
                  <p className="font-medium">{STAGE_NAMES[lead.currentStage] || `Stage ${lead.currentStage}`}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge>{lead.status.replace("_", " ").toUpperCase()}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Priority</p>
                  <Badge variant="secondary">{lead.priority.toUpperCase()}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Deal Value</p>
                  <p className="font-medium">{lead.dealValue ? `$${lead.dealValue.toLocaleString()}` : "Not set"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Timeline History
            </h3>
            <Separator className="mb-4" />

            <ScrollArea className="h-[400px] pr-4">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  Loading timeline...
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No timeline history available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((entry, index) => (
                    <Card key={entry.id} className="relative">
                      {index !== history.length - 1 && (
                        <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-border"></div>
                      )}
                      <CardContent className="pt-6">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                            </div>
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold">{entry.action}</h4>
                                {entry.stage && (
                                  <p className="text-sm text-muted-foreground">
                                    {STAGE_NAMES[entry.stage] || `Stage ${entry.stage}`}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(entry.createdAt), "MMM dd, yyyy")}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {format(new Date(entry.createdAt), "h:mm a")}
                                </div>
                              </div>
                            </div>

                            {entry.oldStatus && entry.newStatus && (
                              <div className="flex items-center gap-2 text-sm">
                                <Badge variant="outline">{entry.oldStatus.replace("_", " ")}</Badge>
                                <span>→</span>
                                <Badge variant="secondary">{entry.newStatus.replace("_", " ")}</Badge>
                              </div>
                            )}

                            {entry.notes && (
                              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                                {entry.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
