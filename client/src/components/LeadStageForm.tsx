import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, ArrowRight, CheckCircle2, Upload } from "lucide-react";
import type { Lead, User } from "@shared/schema";

interface LeadStageFormProps {
  stage: number;
  leadId?: number;
  onSuccess: () => void;
}

// Stage 1: Lead Entry Form
const stage1Schema = z.object({
  contactName: z.string().min(2, "Contact name is required"),
  contactEmail: z.string().email("Valid email is required"),
  contactPhone: z.string().optional(),
  companyName: z.string().min(2, "Company name is required"),
  website: z.string().optional(),
  industryType: z.string().min(1, "Industry type is required"),
  source: z.string().optional(),
  priority: z.string(),
  assignedTo: z.number().nullable(),
  notes: z.string().optional(),
});

// Stage 2: Requirements Collection
const stage2Schema = z.object({
  projectType: z.string().min(1, "Project type is required"),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  requirements: z.string().min(10, "Please provide detailed requirements"),
  nextFollowUpDate: z.string().optional(),
});

// Stage 3: Follow-up Communication
const stage3Schema = z.object({
  communicationNotes: z.string().min(5, "Communication notes are required"),
  clientResponse: z.string().optional(),
  nextFollowUpDate: z.string().optional(),
  followUpStatus: z.string(),
});

export default function LeadStageForm({ stage, leadId, onSuccess }: LeadStageFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: lead } = useQuery<Lead>({
    queryKey: ["/api/leads", leadId],
    enabled: !!leadId,
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const teamLeaders = users.filter(u => u.role === 'team_leader' || u.role === 'company_admin');

  // Determine which schema to use
  const getSchema = () => {
    switch (stage) {
      case 1:
        return stage1Schema;
      case 2:
        return stage2Schema;
      case 3:
        return stage3Schema;
      default:
        return z.object({
          notes: z.string().optional(),
          nextFollowUpDate: z.string().optional(),
        });
    }
  };

  const form = useForm({
    resolver: zodResolver(getSchema()),
    defaultValues: getDefaultValues(),
  });

  function getDefaultValues() {
    if (!lead) {
      return stage === 1 ? {
        contactName: "",
        contactEmail: "",
        contactPhone: "",
        companyName: "",
        website: "",
        industryType: "",
        source: "",
        priority: "medium",
        assignedTo: null,
        notes: "",
      } : {};
    }

    // Load existing data for editing
    return lead;
  }

  useEffect(() => {
    if (lead) {
      form.reset(getDefaultValues());
    }
  }, [lead]);

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);

      if (leadId) {
        // Update existing lead
        await apiRequest(`/api/leads/${leadId}`, "PATCH", {
          ...data,
          currentStage: stage,
        });

        // Save stage data
        await apiRequest("/api/lead-stage-data", "POST", {
          leadId,
          stage,
          stageData: JSON.stringify(data),
        });

        // Add history entry
        await apiRequest("/api/lead-history", "POST", {
          leadId,
          action: `Stage ${stage} completed`,
          stage,
          notes: JSON.stringify(data),
        });

        toast({
          title: "Success",
          description: `Stage ${stage} data saved successfully`,
        });
      } else {
        // Create new lead
        const result = await apiRequest("/api/leads", "POST", data);

        toast({
          title: "Success",
          description: "Lead created successfully",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save lead data",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStageForm = () => {
    switch (stage) {
      case 1:
        return renderStage1Form();
      case 2:
        return renderStage2Form();
      case 3:
        return renderStage3Form();
      default:
        return renderGenericForm();
    }
  };

  const renderStage1Form = () => (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="contactName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Name *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="John Doe" data-testid="input-contact-name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contactEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Email *</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="john@example.com" data-testid="input-contact-email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contactPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Phone</FormLabel>
              <FormControl>
                <Input {...field} placeholder="+1234567890" data-testid="input-contact-phone" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Acme Corp" data-testid="input-company-name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://example.com" data-testid="input-website" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="industryType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Industry Type *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-industry">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
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
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="source"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lead Source</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger data-testid="select-source">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="cold_call">Cold Call</SelectItem>
                  <SelectItem value="social_media">Social Media</SelectItem>
                  <SelectItem value="email_campaign">Email Campaign</SelectItem>
                  <SelectItem value="trade_show">Trade Show</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="assignedTo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Assign To</FormLabel>
            <Select
              onValueChange={(value) => field.onChange(value === "unassigned" ? null : parseInt(value))}
              value={field.value?.toString() || "unassigned"}
            >
              <FormControl>
                <SelectTrigger data-testid="select-assign-to">
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {teamLeaders.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea {...field} rows={3} placeholder="Additional notes about this lead..." data-testid="textarea-notes" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  const renderStage2Form = () => (
    <>
      <FormField
        control={form.control}
        name="projectType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Project Type *</FormLabel>
            <FormControl>
              <Input {...field} placeholder="e.g., Web Development, Mobile App, etc." data-testid="input-project-type" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="budget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget Range</FormLabel>
              <FormControl>
                <Input {...field} placeholder="$10,000 - $50,000" data-testid="input-budget" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="timeline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expected Timeline</FormLabel>
              <FormControl>
                <Input {...field} placeholder="3-6 months" data-testid="input-timeline" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="requirements"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Detailed Requirements *</FormLabel>
            <FormControl>
              <Textarea {...field} rows={5} placeholder="Provide detailed project requirements..." data-testid="textarea-requirements" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="nextFollowUpDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Next Follow-up Date</FormLabel>
            <FormControl>
              <Input {...field} type="date" data-testid="input-follow-up-date" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  const renderStage3Form = () => (
    <>
      <FormField
        control={form.control}
        name="communicationNotes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Communication Notes *</FormLabel>
            <FormControl>
              <Textarea {...field} rows={4} placeholder="What was discussed with the client?" data-testid="textarea-communication" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="clientResponse"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Client Response</FormLabel>
            <FormControl>
              <Textarea {...field} rows={3} placeholder="Client's response or feedback" data-testid="textarea-client-response" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="followUpStatus"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Follow-up Status *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ""}>
              <FormControl>
                <SelectTrigger data-testid="select-followup-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="interested">Client Interested</SelectItem>
                <SelectItem value="waiting">Waiting for Response</SelectItem>
                <SelectItem value="ready_for_quote">Ready for Quotation</SelectItem>
                <SelectItem value="needs_documents">Needs More Documents</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="nextFollowUpDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Next Follow-up Date</FormLabel>
            <FormControl>
              <Input {...field} type="date" data-testid="input-next-followup" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  const renderGenericForm = () => (
    <>
      <div className="text-center py-8">
        <p className="text-lg font-medium mb-2">Stage {stage} Form</p>
        <p className="text-sm text-muted-foreground mb-4">
          Form for stage {stage} is under development
        </p>
      </div>
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea {...field} rows={4} placeholder="Add notes for this stage..." />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="nextFollowUpDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Next Follow-up Date</FormLabel>
            <FormControl>
              <Input {...field} type="date" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {renderStageForm()}

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            data-testid="button-submit"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                {leadId ? "Update" : "Create"} & Move to Next Stage
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
