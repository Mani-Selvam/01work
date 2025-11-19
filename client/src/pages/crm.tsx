import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExcelTable } from "@/components/ExcelTable";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
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

  return (
    <div className="container mx-auto p-6 max-w-[1400px]">
      <Card>
        <CardHeader>
          <CardTitle>CRM Lead Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
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

            <TabsContent value="outreach" className="mt-6">
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
                  { key: "nextFollowUpDate", label: "Next Follow-up", type: "date", width: "140px" },
                  { key: "priority", label: "Priority", width: "100px" },
                  { key: "notes", label: "Notes" },
                ]}
                data={outreachData}
                onAdd={(newRow) => createOutreach.mutate(newRow)}
                onUpdate={(id, field, value) => updateOutreach.mutate({ id, field, value })}
                onDelete={(id) => deleteOutreach.mutate(id)}
                loading={outreachLoading}
              />
            </TabsContent>

            <TabsContent value="communication" className="mt-6">
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
                onAdd={(newRow) => createComm.mutate(newRow)}
                onUpdate={(id, field, value) => updateComm.mutate({ id, field, value })}
                onDelete={(id) => deleteComm.mutate(id)}
                loading={commLoading}
              />
            </TabsContent>

            <TabsContent value="proposal" className="mt-6">
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
                onAdd={(newRow) => createProposal.mutate(newRow)}
                onUpdate={(id, field, value) => updateProposal.mutate({ id, field, value })}
                onDelete={(id) => deleteProposal.mutate(id)}
                loading={proposalLoading}
              />
            </TabsContent>

            <TabsContent value="income" className="mt-6">
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
                onAdd={(newRow) => createIncome.mutate(newRow)}
                onUpdate={(id, field, value) => updateIncome.mutate({ id, field, value })}
                onDelete={(id) => deleteIncome.mutate(id)}
                loading={incomeLoading}
              />
            </TabsContent>

            <TabsContent value="expense" className="mt-6">
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
                onAdd={(newRow) => createExpense.mutate(newRow)}
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
