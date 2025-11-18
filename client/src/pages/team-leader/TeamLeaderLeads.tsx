import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Phone, Mail, Building, Calendar, MessageSquare } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Lead } from "@shared/schema";

export default function TeamLeaderLeads() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: "",
    followUpNotes: "",
  });
  
  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });
  
  const updateMutation = useMutation({
    mutationFn: async ({ leadId, data }: { leadId: number; data: { status?: string; followUpNotes?: string } }) => {
      return await apiRequest(`/api/leads/${leadId}`, {
        method: "PATCH",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Success",
        description: "Lead updated successfully",
      });
      setIsUpdateDialogOpen(false);
      setSelectedLead(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update lead",
        variant: "destructive",
      });
    },
  });
  
  const handleOpenUpdateDialog = (lead: Lead) => {
    setSelectedLead(lead);
    setUpdateData({
      status: lead.status,
      followUpNotes: lead.followUpNotes || "",
    });
    setIsUpdateDialogOpen(true);
  };
  
  const handleUpdateLead = () => {
    if (!selectedLead) return;
    
    updateMutation.mutate({
      leadId: selectedLead.id,
      data: updateData,
    });
  };
  
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.contactEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || lead.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });
  
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      contacted: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      qualified: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
      proposal: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      negotiation: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      won: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      lost: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
    return colors[status] || colors.new;
  };
  
  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
    return colors[priority] || colors.medium;
  };
  
  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
  };
  
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">My Assigned Leads</h1>
        <p className="text-muted-foreground">View and manage leads assigned to you</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Assigned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-leads">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600" data-testid="stat-new-leads">{stats.new}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Contacted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600" data-testid="stat-contacted-leads">{stats.contacted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Qualified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-600" data-testid="stat-qualified-leads">{stats.qualified}</div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads by name, email, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-leads"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]" data-testid="select-filter-status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="proposal">Proposal</SelectItem>
                <SelectItem value="negotiation">Negotiation</SelectItem>
                <SelectItem value="won">Won</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading leads...</div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery || filterStatus !== "all" 
                ? "No leads found matching your filters"
                : "No leads assigned to you yet"}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredLeads.map((lead) => (
                <Card key={lead.id} className="hover-elevate" data-testid={`card-lead-${lead.id}`}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg" data-testid={`text-lead-contact-${lead.id}`}>{lead.contactName}</h3>
                            <Badge className={getPriorityColor(lead.priority)}>
                              {lead.priority}
                            </Badge>
                            <Badge className={getStatusColor(lead.status)}>
                              {lead.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                            <div className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {lead.companyName}
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {lead.contactEmail}
                            </div>
                            {lead.contactPhone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {lead.contactPhone}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleOpenUpdateDialog(lead)}
                          data-testid={`button-update-${lead.id}`}
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Update
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Industry:</span>{" "}
                          <span className="font-medium capitalize">{lead.industryType.replace(/_/g, " ")}</span>
                        </div>
                        {lead.source && (
                          <div>
                            <span className="text-muted-foreground">Source:</span>{" "}
                            <span className="font-medium capitalize">{lead.source.replace(/_/g, " ")}</span>
                          </div>
                        )}
                        {lead.dealValue && (
                          <div>
                            <span className="text-muted-foreground">Deal Value:</span>{" "}
                            <span className="font-medium">₹{lead.dealValue.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                      
                      {lead.notes && (
                        <div className="text-sm bg-muted p-3 rounded-md">
                          <span className="font-medium text-muted-foreground">Initial Notes:</span>{" "}
                          <p className="mt-1 text-foreground">{lead.notes}</p>
                        </div>
                      )}
                      
                      {lead.followUpNotes && (
                        <div className="text-sm bg-primary/5 p-3 rounded-md border border-primary/20">
                          <span className="font-medium text-primary">Follow-up Notes:</span>{" "}
                          <p className="mt-1 text-foreground">{lead.followUpNotes}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Created {new Date(lead.createdAt).toLocaleDateString()}
                        {lead.expectedCloseDate && (
                          <span>• Expected Close: {new Date(lead.expectedCloseDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Lead</DialogTitle>
            <DialogDescription>
              Update the status and add follow-up notes for {selectedLead?.contactName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={updateData.status} onValueChange={(value) => setUpdateData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger data-testid="select-update-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="followUpNotes">Follow-up Notes</Label>
              <Textarea
                id="followUpNotes"
                placeholder="Add notes about your follow-up activities..."
                value={updateData.followUpNotes}
                onChange={(e) => setUpdateData(prev => ({ ...prev, followUpNotes: e.target.value }))}
                rows={4}
                data-testid="textarea-follow-up-notes"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsUpdateDialogOpen(false)}
                data-testid="button-cancel-update"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateLead}
                disabled={updateMutation.isPending}
                data-testid="button-submit-update"
              >
                {updateMutation.isPending ? "Updating..." : "Update Lead"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
