import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExcelTable } from "@/components/ExcelTable";
import { SummaryCards } from "@/components/SummaryCards";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Users,
  TrendingUp,
  CalendarCheck,
  Calendar,
  DollarSign,
  Flame,
  MessageSquare,
  FileText,
  Wallet,
  Receipt,
} from "lucide-react";
import type {
  ClientOutreach,
  CommunicationLog,
  ProposalTracker,
  IncomeTracker,
  ExpenseTracker,
} from "@shared/schema";

export default function CRMPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("outreach");
  
  // Filters for Client Outreach
  const [outreachDateFilter, setOutreachDateFilter] = useState("");
  const [outreachPriorityFilter, setOutreachPriorityFilter] = useState("all");
  const [outreachStatusFilter, setOutreachStatusFilter] = useState("all");

  // Client Outreach Queries
  const { data: outreachData = [], isLoading: outreachLoading } = useQuery<ClientOutreach[]>({
    queryKey: ["/api/crm/client-outreach"],
  });

  const createOutreach = useMutation({
    mutationFn: async (data: Partial<ClientOutreach>) =>
      apiRequest("/api/crm/client-outreach", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/client-outreach"] });
      toast({ title: "Row added successfully" });
    },
  });

  const updateOutreach = useMutation({
    mutationFn: async ({ id, field, value }: { id: number; field: string; value: any }) => {
      const updates = { [field]: value };
      return apiRequest(`/api/crm/client-outreach/${id}`, "PATCH", updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/client-outreach"] });
    },
  });

  const deleteOutreach = useMutation({
    mutationFn: async (id: number) =>
      apiRequest(`/api/crm/client-outreach/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/client-outreach"] });
      toast({ title: "Row deleted successfully" });
    },
  });

  // Communication Log Queries
  const { data: commData = [], isLoading: commLoading } = useQuery<CommunicationLog[]>({
    queryKey: ["/api/crm/communication-log"],
  });

  const createComm = useMutation({
    mutationFn: async (data: Partial<CommunicationLog>) =>
      apiRequest("/api/crm/communication-log", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/communication-log"] });
      toast({ title: "Row added successfully" });
    },
  });

  const updateComm = useMutation({
    mutationFn: async ({ id, field, value }: { id: number; field: string; value: any }) => {
      const updates = { [field]: value };
      return apiRequest(`/api/crm/communication-log/${id}`, "PATCH", updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/communication-log"] });
    },
  });

  const deleteComm = useMutation({
    mutationFn: async (id: number) =>
      apiRequest(`/api/crm/communication-log/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/communication-log"] });
      toast({ title: "Row deleted successfully" });
    },
  });

  // Proposal Tracker Queries
  const { data: proposalData = [], isLoading: proposalLoading } = useQuery<ProposalTracker[]>({
    queryKey: ["/api/crm/proposal-tracker"],
  });

  const createProposal = useMutation({
    mutationFn: async (data: Partial<ProposalTracker>) =>
      apiRequest("/api/crm/proposal-tracker", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/proposal-tracker"] });
      toast({ title: "Row added successfully" });
    },
  });

  const updateProposal = useMutation({
    mutationFn: async ({ id, field, value }: { id: number; field: string; value: any }) => {
      const updates = { [field]: value };
      return apiRequest(`/api/crm/proposal-tracker/${id}`, "PATCH", updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/proposal-tracker"] });
    },
  });

  const deleteProposal = useMutation({
    mutationFn: async (id: number) =>
      apiRequest(`/api/crm/proposal-tracker/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/proposal-tracker"] });
      toast({ title: "Row deleted successfully" });
    },
  });

  // Income Tracker Queries
  const { data: incomeData = [], isLoading: incomeLoading } = useQuery<IncomeTracker[]>({
    queryKey: ["/api/crm/income-tracker"],
  });

  const createIncome = useMutation({
    mutationFn: async (data: Partial<IncomeTracker>) =>
      apiRequest("/api/crm/income-tracker", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/income-tracker"] });
      toast({ title: "Row added successfully" });
    },
  });

  const updateIncome = useMutation({
    mutationFn: async ({ id, field, value }: { id: number; field: string; value: any }) => {
      const updates = { [field]: value };
      return apiRequest(`/api/crm/income-tracker/${id}`, "PATCH", updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/income-tracker"] });
    },
  });

  const deleteIncome = useMutation({
    mutationFn: async (id: number) =>
      apiRequest(`/api/crm/income-tracker/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/income-tracker"] });
      toast({ title: "Row deleted successfully" });
    },
  });

  // Expense Tracker Queries
  const { data: expenseData = [], isLoading: expenseLoading } = useQuery<ExpenseTracker[]>({
    queryKey: ["/api/crm/expense-tracker"],
  });

  const createExpense = useMutation({
    mutationFn: async (data: Partial<ExpenseTracker>) =>
      apiRequest("/api/crm/expense-tracker", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/expense-tracker"] });
      toast({ title: "Row added successfully" });
    },
  });

  const updateExpense = useMutation({
    mutationFn: async ({ id, field, value }: { id: number; field: string; value: any }) => {
      const updates = { [field]: value };
      return apiRequest(`/api/crm/expense-tracker/${id}`, "PATCH", updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/expense-tracker"] });
    },
  });

  const deleteExpense = useMutation({
    mutationFn: async (id: number) =>
      apiRequest(`/api/crm/expense-tracker/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/expense-tracker"] });
      toast({ title: "Row deleted successfully" });
    },
  });

  // Helper function to get locale-stable date string (YYYY-MM-DD)
  // For Date objects, convert to local date string
  // For strings, trust them as-is (already YYYY-MM-DD format)
  function getDateKey(date: Date | string | null | undefined): string {
    if (!date) return '';
    if (typeof date === 'string') {
      // Already in YYYY-MM-DD format, return as-is
      return date.split('T')[0];
    }
    // Convert Date object to YYYY-MM-DD in local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Filtered data for Client Outreach
  const filteredOutreachData = useMemo(() => {
    let filtered = [...outreachData];
    
    if (outreachDateFilter) {
      filtered = filtered.filter(item => {
        if (!item.date) return false;
        const itemDate = getDateKey(item.date);
        return itemDate === outreachDateFilter;
      });
    }
    
    if (outreachPriorityFilter !== "all") {
      filtered = filtered.filter(item => item.priority?.toLowerCase() === outreachPriorityFilter);
    }
    
    if (outreachStatusFilter !== "all") {
      filtered = filtered.filter(item => item.status?.toLowerCase() === outreachStatusFilter);
    }
    
    return filtered;
  }, [outreachData, outreachDateFilter, outreachPriorityFilter, outreachStatusFilter]);

  // Top-level summary calculations
  const topSummary = useMemo(() => {
    // Get today's date string in local timezone (YYYY-MM-DD)
    const todayStr = getDateKey(new Date());
    
    // Total Leads: only count rows with valid client name or project ID
    const totalLeads = outreachData.filter(o => o.clientName || o.projectId).length;
    
    const activeProjects = proposalData.filter(p => 
      (p.projectStatus?.toLowerCase() === "active" || p.projectStatus?.toLowerCase() === "in progress") &&
      (p.clientName || p.projectId) // Only count rows with identifiers
    ).length;
    
    // Pending Follow-ups: overdue items (date < today) excluding completed status
    const pendingFollowUps = outreachData.filter(o => {
      if (!o.nextFollowUpDate) return false;
      const followUpDateStr = getDateKey(o.nextFollowUpDate);
      if (!followUpDateStr || followUpDateStr.length !== 10) return false; // Guard against invalid dates
      const isOverdue = followUpDateStr < todayStr;
      const notCompleted = o.status?.toLowerCase() !== "completed" && o.status?.toLowerCase() !== "closed";
      const hasIdentifier = o.clientName || o.projectId; // Only count rows with identifiers
      return isOverdue && notCompleted && hasIdentifier;
    }).length;
    
    // Upcoming Meetings: future or today dates (date >= today) excluding completed status
    const upcomingMeetings = commData.filter(c => {
      if (!c.followUpDate) return false;
      const meetingDateStr = getDateKey(c.followUpDate);
      if (!meetingDateStr || meetingDateStr.length !== 10) return false; // Guard against invalid dates
      const isUpcoming = meetingDateStr >= todayStr;
      const notCompleted = c.status?.toLowerCase() !== "completed" && c.status?.toLowerCase() !== "closed";
      const hasIdentifier = c.clientName || c.projectId; // Only count rows with identifiers
      return isUpcoming && notCompleted && hasIdentifier;
    }).length;
    
    const totalIncome = incomeData.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
    const totalExpenses = expenseData.reduce((sum, item) => sum + (item.amount || 0), 0);

    return { totalLeads, activeProjects, pendingFollowUps, upcomingMeetings, totalIncome, totalExpenses };
  }, [outreachData, proposalData, commData, incomeData, expenseData]);

  // Client Outreach summary
  const outreachSummary = useMemo(() => {
    // Get today's date string in local timezone (YYYY-MM-DD)
    const todayStr = getDateKey(new Date());
    
    // Only count rows with valid identifiers
    const totalLeads = filteredOutreachData.filter(o => o.clientName || o.projectId).length;
    const hotLeads = filteredOutreachData.filter(o => 
      o.status?.toLowerCase() === "hot" && (o.clientName || o.projectId)
    ).length;
    
    // Follow-ups Due: overdue items (date < today) excluding completed status
    const followUpsDue = filteredOutreachData.filter(o => {
      if (!o.nextFollowUpDate) return false;
      const followUpDateStr = getDateKey(o.nextFollowUpDate);
      if (!followUpDateStr || followUpDateStr.length !== 10) return false; // Guard against invalid dates
      const isOverdue = followUpDateStr < todayStr;
      const notCompleted = o.status?.toLowerCase() !== "completed" && o.status?.toLowerCase() !== "closed";
      const hasIdentifier = o.clientName || o.projectId; // Only count rows with identifiers
      return isOverdue && notCompleted && hasIdentifier;
    }).length;

    return { totalLeads, hotLeads, followUpsDue };
  }, [filteredOutreachData]);

  // Communication Log summary
  const commSummary = useMemo(() => {
    // Only count rows with valid identifiers
    const totalComm = commData.filter(c => c.clientName || c.projectId).length;
    const completed = commData.filter(c => 
      c.status?.toLowerCase() === "completed" && (c.clientName || c.projectId)
    ).length;
    const pending = commData.filter(c => 
      c.status?.toLowerCase() === "pending" && (c.clientName || c.projectId)
    ).length;

    return { totalComm, completed, pending };
  }, [commData]);

  // Proposal Tracker summary
  const proposalSummary = useMemo(() => {
    // Only count rows with valid identifiers
    // Sent: proposals that have been actually sent (have dateSent or status is sent)
    const sent = proposalData.filter(p => 
      (p.dateSent || p.dealStatus?.toLowerCase() === "sent") && (p.clientName || p.projectId)
    ).length;
    const approved = proposalData.filter(p => 
      p.dealStatus?.toLowerCase() === "approved" && (p.clientName || p.projectId)
    ).length;
    const rejected = proposalData.filter(p => 
      p.dealStatus?.toLowerCase() === "rejected" && (p.clientName || p.projectId)
    ).length;
    const underNegotiation = proposalData.filter(p => 
      p.dealStatus?.toLowerCase() === "under negotiation" && (p.clientName || p.projectId)
    ).length;

    return { sent, approved, rejected, underNegotiation };
  }, [proposalData]);

  // Income Tracker summary
  const incomeSummary = useMemo(() => {
    // Only count rows with valid identifiers
    const validIncome = incomeData.filter(i => i.clientName || i.projectId);
    
    const totalIncome = validIncome.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
    
    // Pending Payments: sum of all amounts with pending status
    const pendingPayments = validIncome
      .filter(i => i.paymentStatus?.toLowerCase() === "pending")
      .reduce((sum, item) => sum + (item.totalAmount || 0), 0);
    
    const advanceReceived = validIncome.reduce((sum, item) => sum + (item.advancePayment || 0), 0);
    const remainingBalance = validIncome.reduce((sum, item) => sum + (item.remainingBalance || 0), 0);

    return { totalIncome, pendingPayments, advanceReceived, remainingBalance };
  }, [incomeData]);

  // Expense Tracker summary
  const expenseSummary = useMemo(() => {
    // Expense tracker may not have client/project IDs for all entries, so just check for date or description
    const validExpenses = expenseData.filter(e => e.date || e.description || e.service);
    
    const totalExpenses = validExpenses.reduce((sum, item) => sum + (item.amount || 0), 0);
    const paid = validExpenses.filter(e => e.status?.toLowerCase() === "paid").reduce((sum, item) => sum + (item.amount || 0), 0);
    const pending = validExpenses.filter(e => e.status?.toLowerCase() === "pending").reduce((sum, item) => sum + (item.amount || 0), 0);
    const approved = validExpenses.filter(e => e.status?.toLowerCase() === "approved").reduce((sum, item) => sum + (item.amount || 0), 0);

    return { totalExpenses, paid, pending, approved };
  }, [expenseData]);

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-[1400px]">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">CRM Lead Management</h1>
        <p className="text-sm text-muted-foreground">Track leads, communications, proposals, income, and expenses</p>
      </div>

      {/* Top-level Summary Cards */}
      <SummaryCards 
        cards={[
          { title: "Total Leads", value: topSummary.totalLeads, icon: Users, color: "text-blue-600 dark:text-blue-400" },
          { title: "Active Projects", value: topSummary.activeProjects, icon: TrendingUp, color: "text-green-600 dark:text-green-400" },
          { title: "Pending Follow-ups", value: topSummary.pendingFollowUps, icon: CalendarCheck, color: "text-orange-600 dark:text-orange-400" },
          { title: "Upcoming Meetings", value: topSummary.upcomingMeetings, icon: Calendar, color: "text-purple-600 dark:text-purple-400" },
          { title: "Total Income", value: `₹${topSummary.totalIncome.toLocaleString()}`, icon: DollarSign, color: "text-green-600 dark:text-green-400" },
          { title: "Total Expenses", value: `₹${topSummary.totalExpenses.toLocaleString()}`, icon: Receipt, color: "text-red-600 dark:text-red-400" },
        ]}
      />

      <Card>
        <CardContent className="p-4 sm:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-0">
              <TabsTrigger value="outreach" data-testid="tab-outreach">
                Client Outreach
              </TabsTrigger>
              <TabsTrigger value="communication" data-testid="tab-communication">
                Communication Log
              </TabsTrigger>
              <TabsTrigger value="proposal" data-testid="tab-proposal">
                Proposals
              </TabsTrigger>
              <TabsTrigger value="income" data-testid="tab-income">
                Income
              </TabsTrigger>
              <TabsTrigger value="expense" data-testid="tab-expense">
                Expenses
              </TabsTrigger>
            </TabsList>

            <TabsContent value="outreach" className="mt-6 space-y-4">
              {/* Client Outreach Summary Cards */}
              <SummaryCards 
                cards={[
                  { title: "Total Leads", value: outreachSummary.totalLeads, icon: Users, color: "text-blue-600 dark:text-blue-400" },
                  { title: "Hot Leads", value: outreachSummary.hotLeads, icon: Flame, color: "text-red-600 dark:text-red-400" },
                  { title: "Follow-ups Due", value: outreachSummary.followUpsDue, icon: CalendarCheck, color: "text-orange-600 dark:text-orange-400" },
                ]}
              />

              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Filters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date-filter">Date</Label>
                      <Input
                        id="date-filter"
                        type="date"
                        value={outreachDateFilter}
                        onChange={(e) => setOutreachDateFilter(e.target.value)}
                        data-testid="filter-date"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority-filter">Priority</Label>
                      <Select value={outreachPriorityFilter} onValueChange={setOutreachPriorityFilter}>
                        <SelectTrigger id="priority-filter" data-testid="filter-priority">
                          <SelectValue placeholder="All Priorities" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Priorities</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status-filter">Status</Label>
                      <Select value={outreachStatusFilter} onValueChange={setOutreachStatusFilter}>
                        <SelectTrigger id="status-filter" data-testid="filter-status">
                          <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="hot">Hot</SelectItem>
                          <SelectItem value="warm">Warm</SelectItem>
                          <SelectItem value="cold">Cold</SelectItem>
                          <SelectItem value="in progress">In Progress</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <ExcelTable
                columns={[
                  { key: "date", label: "Date", type: "date", width: "120px" },
                  { key: "clientName", label: "Client Name", width: "180px" },
                  { key: "contactPerson", label: "Contact Person", width: "150px" },
                  { key: "projectId", label: "Project ID", width: "120px" },
                  { key: "contactMethod", label: "Contact Method", width: "130px" },
                  { key: "emailPhone", label: "Email/Phone", width: "180px" },
                  { key: "profileLink", label: "Profile Link", width: "150px" },
                  { key: "serviceOffered", label: "Service Offered", width: "150px" },
                  { key: "initialOutreach", label: "Initial Outreach" },
                  { key: "followUp2", label: "Follow-up 2" },
                  { key: "followUp3", label: "Follow-up 3" },
                  { key: "status", label: "Status", width: "130px" },
                  { key: "outcome", label: "Outcome" },
                  { key: "nextFollowUpDate", label: "Next Follow-up Date", type: "date", width: "150px" },
                  { key: "priority", label: "Priority", width: "100px" },
                  { key: "notes", label: "Notes" },
                ]}
                data={filteredOutreachData}
                onAdd={(newRow) => {
                  if (!newRow.clientName && !newRow.projectId) {
                    toast({ 
                      title: "Validation Error", 
                      description: "Please fill in at least Client Name or Project ID before adding a row",
                      variant: "destructive"
                    });
                    return;
                  }
                  createOutreach.mutate(newRow);
                }}
                onUpdate={(id, field, value) => updateOutreach.mutate({ id, field, value })}
                onDelete={(id) => deleteOutreach.mutate(id)}
                loading={outreachLoading}
              />
            </TabsContent>

            <TabsContent value="communication" className="mt-6 space-y-4">
              {/* Communication Log Summary Cards */}
              <SummaryCards 
                cards={[
                  { title: "Total Communications", value: commSummary.totalComm, icon: MessageSquare, color: "text-blue-600 dark:text-blue-400" },
                  { title: "Completed", value: commSummary.completed, icon: CalendarCheck, color: "text-green-600 dark:text-green-400" },
                  { title: "Pending", value: commSummary.pending, icon: Calendar, color: "text-orange-600 dark:text-orange-400" },
                ]}
              />

              <ExcelTable
                columns={[
                  { key: "dateOfContact", label: "Date of Contact", type: "date", width: "140px" },
                  { key: "clientName", label: "Client Name", width: "180px" },
                  { key: "projectId", label: "Project ID", width: "120px" },
                  { key: "channel", label: "Channel", width: "120px" },
                  { key: "purposeOfContact", label: "Purpose of Contact" },
                  { key: "summaryOfDiscussion", label: "Summary of Discussion" },
                  { key: "nextAction", label: "Next Action" },
                  { key: "followUpDate", label: "Follow-up Date", type: "date", width: "130px" },
                  { key: "status", label: "Status", width: "130px" },
                  { key: "notes", label: "Notes" },
                ]}
                data={commData}
                onAdd={(newRow) => {
                  if (!newRow.clientName && !newRow.projectId) {
                    toast({ 
                      title: "Validation Error", 
                      description: "Please fill in at least Client Name or Project ID before adding a row",
                      variant: "destructive"
                    });
                    return;
                  }
                  createComm.mutate(newRow);
                }}
                onUpdate={(id, field, value) => updateComm.mutate({ id, field, value })}
                onDelete={(id) => deleteComm.mutate(id)}
                loading={commLoading}
              />
            </TabsContent>

            <TabsContent value="proposal" className="mt-6 space-y-4">
              {/* Proposal Tracker Summary Cards */}
              <SummaryCards 
                cards={[
                  { title: "Proposals Sent", value: proposalSummary.sent, icon: FileText, color: "text-blue-600 dark:text-blue-400" },
                  { title: "Approved", value: proposalSummary.approved, icon: CalendarCheck, color: "text-green-600 dark:text-green-400" },
                  { title: "Rejected", value: proposalSummary.rejected, icon: Calendar, color: "text-red-600 dark:text-red-400" },
                  { title: "Under Negotiation", value: proposalSummary.underNegotiation, icon: MessageSquare, color: "text-orange-600 dark:text-orange-400" },
                ]}
              />

              <ExcelTable
                columns={[
                  { key: "projectId", label: "Project ID", width: "120px" },
                  { key: "dateSent", label: "Date Sent", type: "date", width: "120px" },
                  { key: "clientName", label: "Client Name", width: "180px" },
                  { key: "contactPerson", label: "Contact Person", width: "150px" },
                  { key: "emailPhone", label: "Email/Phone", width: "180px" },
                  { key: "projectName", label: "Project Name", width: "180px" },
                  { key: "dealStatus", label: "Deal Status", width: "130px" },
                  { key: "projectStartDate", label: "Start Date", type: "date", width: "120px" },
                  { key: "projectEndDate", label: "End Date", type: "date", width: "120px" },
                  { key: "projectStatus", label: "Project Status", width: "140px" },
                ]}
                data={proposalData}
                onAdd={(newRow) => {
                  if (!newRow.clientName && !newRow.projectId) {
                    toast({ 
                      title: "Validation Error", 
                      description: "Please fill in at least Client Name or Project ID before adding a row",
                      variant: "destructive"
                    });
                    return;
                  }
                  createProposal.mutate(newRow);
                }}
                onUpdate={(id, field, value) => updateProposal.mutate({ id, field, value })}
                onDelete={(id) => deleteProposal.mutate(id)}
                loading={proposalLoading}
              />
            </TabsContent>

            <TabsContent value="income" className="mt-6 space-y-4">
              {/* Income Tracker Summary Cards */}
              <SummaryCards 
                cards={[
                  { title: "Total Income", value: `₹${incomeSummary.totalIncome.toLocaleString()}`, icon: DollarSign, color: "text-green-600 dark:text-green-400" },
                  { title: "Pending Payments", value: `₹${incomeSummary.pendingPayments.toLocaleString()}`, icon: Calendar, color: "text-orange-600 dark:text-orange-400" },
                  { title: "Advance Received", value: `₹${incomeSummary.advanceReceived.toLocaleString()}`, icon: Wallet, color: "text-blue-600 dark:text-blue-400" },
                  { title: "Remaining Balance", value: `₹${incomeSummary.remainingBalance.toLocaleString()}`, icon: Receipt, color: "text-purple-600 dark:text-purple-400" },
                ]}
              />

              <ExcelTable
                columns={[
                  { key: "date", label: "Date", type: "date", width: "120px" },
                  { key: "clientName", label: "Client Name", width: "180px" },
                  { key: "projectId", label: "Project ID", width: "120px" },
                  { key: "service", label: "Service", width: "150px" },
                  { key: "invoiceDate", label: "Invoice Date", type: "date", width: "120px" },
                  { key: "invoiceId", label: "Invoice ID", width: "120px" },
                  { key: "totalAmount", label: "Total Amount", type: "number", width: "130px" },
                  { key: "advancePayment", label: "Advance Payment", type: "number", width: "150px" },
                  { key: "remainingBalance", label: "Remaining Balance", type: "number", width: "160px" },
                  { key: "advPaymentDate", label: "Adv Payment Date", type: "date", width: "150px" },
                  { key: "finalPaymentDate", label: "Final Payment Date", type: "date", width: "160px" },
                  { key: "paymentStatus", label: "Payment Status", width: "140px" },
                  { key: "paymentMethod", label: "Payment Method", width: "140px" },
                  { key: "expense", label: "Expense", type: "number", width: "120px" },
                  { key: "netIncome", label: "Net Income", type: "number", width: "130px" },
                ]}
                data={incomeData}
                onAdd={(newRow) => {
                  if (!newRow.clientName && !newRow.projectId) {
                    toast({ 
                      title: "Validation Error", 
                      description: "Please fill in at least Client Name or Project ID before adding a row",
                      variant: "destructive"
                    });
                    return;
                  }
                  createIncome.mutate(newRow);
                }}
                onUpdate={(id, field, value) => updateIncome.mutate({ id, field, value })}
                onDelete={(id) => deleteIncome.mutate(id)}
                loading={incomeLoading}
              />
            </TabsContent>

            <TabsContent value="expense" className="mt-6 space-y-4">
              {/* Expense Tracker Summary Cards */}
              <SummaryCards 
                cards={[
                  { title: "Total Expenses", value: `₹${expenseSummary.totalExpenses.toLocaleString()}`, icon: Receipt, color: "text-red-600 dark:text-red-400" },
                  { title: "Paid", value: `₹${expenseSummary.paid.toLocaleString()}`, icon: CalendarCheck, color: "text-green-600 dark:text-green-400" },
                  { title: "Pending", value: `₹${expenseSummary.pending.toLocaleString()}`, icon: Calendar, color: "text-orange-600 dark:text-orange-400" },
                  { title: "Approved", value: `₹${expenseSummary.approved.toLocaleString()}`, icon: Wallet, color: "text-blue-600 dark:text-blue-400" },
                ]}
              />

              <ExcelTable
                columns={[
                  { key: "date", label: "Date", type: "date", width: "120px" },
                  { key: "clientName", label: "Client Name", width: "180px" },
                  { key: "projectId", label: "Project ID", width: "120px" },
                  { key: "service", label: "Service", width: "150px" },
                  { key: "description", label: "Description" },
                  { key: "amount", label: "Amount", type: "number", width: "120px" },
                  { key: "status", label: "Status", width: "130px" },
                  { key: "paymentMethod", label: "Payment Method", width: "140px" },
                  { key: "notes", label: "Notes" },
                ]}
                data={expenseData}
                onAdd={(newRow) => {
                  // Expense tracker may not have client/project IDs, so check for date OR description OR service
                  if (!newRow.date && !newRow.description && !newRow.service && !newRow.clientName) {
                    toast({ 
                      title: "Validation Error", 
                      description: "Please fill in at least Date, Description, Service, or Client Name before adding a row",
                      variant: "destructive"
                    });
                    return;
                  }
                  createExpense.mutate(newRow);
                }}
                onUpdate={(id, field, value) => updateExpense.mutate({ id, field, value })}
                onDelete={(id) => deleteExpense.mutate(id)}
                loading={expenseLoading}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
