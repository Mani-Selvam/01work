import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Filter, Trash2, Edit, Phone, Mail, Building, Calendar, TrendingUp } from "lucide-react";
import LeadEntryForm from "@/components/LeadEntryForm";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Lead, User } from "@shared/schema";

export default function LeadManagement() {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterIndustry, setFilterIndustry] = useState("all");
  
  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });
  
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });
  
  const teamLeaders = users.filter(user => user.role === 'team_leader');
  
  const deleteMutation = useMutation({
    mutationFn: async (leadId: number) => {
      await apiRequest(`/api/leads/${leadId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Success",
        description: "Lead deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete lead",
        variant: "destructive",
      });
    },
  });
  
  const handleDelete = (leadId: number) => {
    if (confirm("Are you sure you want to delete this lead?")) {
      deleteMutation.mutate(leadId);
    }
  };
  
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.contactEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || lead.status === filterStatus;
    const matchesPriority = filterPriority === "all" || lead.priority === filterPriority;
    const matchesIndustry = filterIndustry === "all" || lead.industryType === filterIndustry;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesIndustry;
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
  
  const getAssignedTeamLeader = (assignedTo: number | null) => {
    if (!assignedTo) return "Unassigned";
    const leader = users.find(u => u.id === assignedTo);
    return leader ? leader.displayName : "Unknown";
  };
  
  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    won: leads.filter(l => l.status === 'won').length,
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Lead Management</h1>
          <p className="text-muted-foreground">Manage and track your sales leads</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-lead">
              <Plus className="mr-2 h-4 w-4" />
              Add Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Lead</DialogTitle>
              <DialogDescription>
                Fill in the details to add a new lead to your pipeline
              </DialogDescription>
            </DialogHeader>
            <LeadEntryForm 
              teamLeaders={teamLeaders}
              onSuccess={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-leads">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600" data-testid="stat-new-leads">{stats.new}</div>
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Won</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="stat-won-leads">{stats.won}</div>
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
            <div className="flex gap-2 flex-wrap">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]" data-testid="select-filter-status">
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
              
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-[150px]" data-testid="select-filter-priority">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterIndustry} onValueChange={setFilterIndustry}>
                <SelectTrigger className="w-[150px]" data-testid="select-filter-industry">
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="real_estate">Real Estate</SelectItem>
                  <SelectItem value="hospitality">Hospitality</SelectItem>
                  <SelectItem value="construction">Construction</SelectItem>
                  <SelectItem value="transportation">Transportation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading leads...</div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery || filterStatus !== "all" || filterPriority !== "all" || filterIndustry !== "all" 
                ? "No leads found matching your filters"
                : "No leads yet. Create your first lead to get started!"}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredLeads.map((lead) => (
                <Card key={lead.id} className="hover-elevate" data-testid={`card-lead-${lead.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start gap-3">
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
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
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
                          <div>
                            <span className="text-muted-foreground">Assigned:</span>{" "}
                            <span className="font-medium">{getAssignedTeamLeader(lead.assignedTo)}</span>
                          </div>
                        </div>
                        
                        {lead.notes && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Notes:</span>{" "}
                            <span className="text-foreground">{lead.notes}</span>
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
                      
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(lead.id)}
                          data-testid={`button-delete-${lead.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
