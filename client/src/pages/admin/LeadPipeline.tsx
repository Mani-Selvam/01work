import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Plus, Phone, Mail, Calendar, Building2, ArrowRight, Clock } from "lucide-react";
import { format } from "date-fns";
import type { Lead, User } from "@shared/schema";
import LeadStageForm from "@/components/LeadStageForm";
import LeadTimelineDialog from "@/components/LeadTimelineDialog";

const STAGES = [
  { id: 1, name: "Lead Entry", status: "new", color: "bg-blue-500", description: "New leads" },
  { id: 2, name: "Requirements", status: "requirements_received", color: "bg-purple-500", description: "Collecting requirements" },
  { id: 3, name: "Follow-up", status: "in_follow_up", color: "bg-cyan-500", description: "Active follow-up" },
  { id: 4, name: "Documents", status: "document_shared", color: "bg-yellow-500", description: "Documents shared" },
  { id: 5, name: "Quotation", status: "quotation_preparing", color: "bg-orange-500", description: "Preparing quote" },
  { id: 6, name: "Meeting", status: "meeting_scheduled", color: "bg-pink-500", description: "Meeting scheduled" },
  { id: 7, name: "Proposal", status: "proposal_sent", color: "bg-indigo-500", description: "Proposal submitted" },
  { id: 8, name: "Approval", status: "confirmed", color: "bg-emerald-500", description: "Client approved" },
  { id: 9, name: "Project Start", status: "project_started", color: "bg-green-600", description: "Project kickoff" },
];

export default function LeadPipeline() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedStage, setSelectedStage] = useState<number | null>(null);
  const [showNewLeadDialog, setShowNewLeadDialog] = useState(false);
  const [showTimelineDialog, setShowTimelineDialog] = useState(false);

  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const getLeadsByStage = (stage: number) => {
    return leads.filter(lead => lead.currentStage === stage);
  };

  const getAssignedUser = (userId: number | null) => {
    if (!userId) return null;
    return users.find(u => u.id === userId);
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      medium: "bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200",
      high: "bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200",
      urgent: "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200",
    };
    return colors[priority] || colors.medium;
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setSelectedStage(lead.currentStage);
  };

  const handleViewTimeline = (lead: Lead) => {
    setSelectedLead(lead);
    setShowTimelineDialog(true);
  };

  const isFollowUpOverdue = (date: Date | string | null) => {
    if (!date) return false;
    const followUpDate = new Date(date);
    return followUpDate < new Date();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="p-6 border-b space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-page-title">Lead Pipeline</h1>
            <p className="text-muted-foreground">Track leads through your 9-stage workflow</p>
          </div>
          <Button onClick={() => setShowNewLeadDialog(true)} data-testid="button-add-lead">
            <Plus className="mr-2 h-4 w-4" />
            New Lead
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leads.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {leads.filter(l => l.currentStage >= 2 && l.currentStage <= 8).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Confirmed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {leads.filter(l => l.status === 'confirmed').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Started</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {leads.filter(l => l.status === 'project_started').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Follow-ups Due</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {leads.filter(l => l.nextFollowUpDate && isFollowUpOverdue(l.nextFollowUpDate)).length}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6">
          <div className="flex gap-4 pb-4">
            {STAGES.map((stage) => {
              const stageLeads = getLeadsByStage(stage.id);
              
              return (
                <Card key={stage.id} className="flex-shrink-0 w-80" data-testid={`stage-${stage.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                        <CardTitle className="text-sm font-semibold">{stage.name}</CardTitle>
                      </div>
                      <Badge variant="secondary">{stageLeads.length}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{stage.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ScrollArea className="h-[calc(100vh-400px)]">
                      {stageLeads.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          No leads in this stage
                        </div>
                      ) : (
                        <div className="space-y-3 pr-4">
                          {stageLeads.map((lead) => {
                            const assignedUser = getAssignedUser(lead.assignedTo);
                            const isOverdue = lead.nextFollowUpDate && isFollowUpOverdue(lead.nextFollowUpDate);

                            return (
                              <Card
                                key={lead.id}
                                className="hover-elevate cursor-pointer"
                                onClick={() => handleLeadClick(lead)}
                                data-testid={`lead-card-${lead.id}`}
                              >
                                <CardContent className="p-4 space-y-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className="font-semibold text-sm line-clamp-1">{lead.contactName}</h4>
                                    <Badge className={getPriorityColor(lead.priority)} data-testid={`badge-priority-${lead.id}`}>
                                      {lead.priority}
                                    </Badge>
                                  </div>

                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Building2 className="h-3 w-3" />
                                    <span className="line-clamp-1">{lead.companyName}</span>
                                  </div>

                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Mail className="h-3 w-3" />
                                    <span className="line-clamp-1">{lead.contactEmail}</span>
                                  </div>

                                  {lead.contactPhone && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Phone className="h-3 w-3" />
                                      <span>{lead.contactPhone}</span>
                                    </div>
                                  )}

                                  {lead.dealValue && (
                                    <div className="text-sm font-semibold text-emerald-600">
                                      ${lead.dealValue.toLocaleString()}
                                    </div>
                                  )}

                                  {lead.nextFollowUpDate && (
                                    <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                                      <Clock className="h-3 w-3" />
                                      <span>
                                        {isOverdue ? 'Overdue: ' : 'Follow-up: '}
                                        {format(new Date(lead.nextFollowUpDate), 'MMM dd, yyyy')}
                                      </span>
                                    </div>
                                  )}

                                  {assignedUser && (
                                    <div className="flex items-center justify-between pt-2 border-t">
                                      <span className="text-xs text-muted-foreground">Assigned to:</span>
                                      <span className="text-xs font-medium">{assignedUser.displayName}</span>
                                    </div>
                                  )}

                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full mt-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewTimeline(lead);
                                    }}
                                    data-testid={`button-timeline-${lead.id}`}
                                  >
                                    View Timeline
                                  </Button>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* New Lead Dialog */}
      <Dialog open={showNewLeadDialog} onOpenChange={setShowNewLeadDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Lead - Stage 1</DialogTitle>
          </DialogHeader>
          <LeadStageForm
            stage={1}
            onSuccess={() => {
              setShowNewLeadDialog(false);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Lead Dialog */}
      {selectedLead && selectedStage && (
        <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {STAGES.find(s => s.id === selectedStage)?.name} - {selectedLead.contactName}
              </DialogTitle>
            </DialogHeader>
            <LeadStageForm
              stage={selectedStage}
              leadId={selectedLead.id}
              onSuccess={() => {
                setSelectedLead(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Timeline Dialog */}
      {selectedLead && showTimelineDialog && (
        <LeadTimelineDialog
          lead={selectedLead}
          open={showTimelineDialog}
          onClose={() => {
            setShowTimelineDialog(false);
            setSelectedLead(null);
          }}
        />
      )}
    </div>
  );
}
