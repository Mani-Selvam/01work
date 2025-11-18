import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { User, Building2, Target, UserPlus } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InsertLead, User as UserType } from "@shared/schema";

interface LeadFormData {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  
  companyName: string;
  website: string;
  industryType: string;
  
  status: string;
  source: string;
  priority: string;
  dealValue: string;
  expectedCloseDate: string;
  notes: string;
  
  assignedTo: string;
}

interface LeadEntryFormProps {
  teamLeaders: UserType[];
  onSuccess?: () => void;
}

export default function LeadEntryForm({ teamLeaders, onSuccess }: LeadEntryFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<LeadFormData>({
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    
    companyName: "",
    website: "",
    industryType: "",
    
    status: "new",
    source: "",
    priority: "medium",
    dealValue: "",
    expectedCloseDate: "",
    notes: "",
    
    assignedTo: "unassigned",
  });
  
  const updateFormData = (field: keyof LeadFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  
  const validateStep1 = () => {
    if (!formData.contactName || formData.contactName.length < 2) {
      setError("Contact name must be at least 2 characters");
      return false;
    }
    if (!formData.contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (formData.contactPhone && !/^\d{10}$/.test(formData.contactPhone)) {
      setError("Please enter a valid 10-digit phone number");
      return false;
    }
    return true;
  };
  
  const validateStep2 = () => {
    if (!formData.companyName || formData.companyName.length < 2) {
      setError("Company name must be at least 2 characters");
      return false;
    }
    if (!formData.industryType) {
      setError("Please select an industry type");
      return false;
    }
    return true;
  };
  
  const validateStep3 = () => {
    if (!formData.status) {
      setError("Please select lead status");
      return false;
    }
    if (!formData.priority) {
      setError("Please select priority");
      return false;
    }
    return true;
  };
  
  const validateStep4 = () => {
    return true;
  };
  
  const handleNext = () => {
    setError("");
    
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;
    if (currentStep === 4 && !validateStep4()) return;
    
    setCurrentStep((prev) => prev + 1);
  };
  
  const handleBack = () => {
    setError("");
    setCurrentStep((prev) => prev - 1);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (currentStep !== 4 || !validateStep4()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const leadData: Partial<InsertLead> = {
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone || undefined,
        companyName: formData.companyName,
        website: formData.website || undefined,
        industryType: formData.industryType as any,
        status: formData.status as any,
        source: formData.source ? (formData.source as any) : undefined,
        priority: formData.priority as any,
        dealValue: formData.dealValue ? parseInt(formData.dealValue) : undefined,
        expectedCloseDate: formData.expectedCloseDate || undefined,
        notes: formData.notes || undefined,
        assignedTo: formData.assignedTo && formData.assignedTo !== "unassigned" ? parseInt(formData.assignedTo) : undefined,
      };
      
      await apiRequest("/api/leads", "POST", leadData);
      
      await queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      
      toast({
        title: "Success",
        description: "Lead created successfully",
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      setFormData({
        contactName: "",
        contactEmail: "",
        contactPhone: "",
        companyName: "",
        website: "",
        industryType: "",
        status: "new",
        source: "",
        priority: "medium",
        dealValue: "",
        expectedCloseDate: "",
        notes: "",
        assignedTo: "unassigned",
      });
      setCurrentStep(1);
    } catch (error: any) {
      setError(error.message || "Failed to create lead");
      toast({
        title: "Error",
        description: error.message || "Failed to create lead",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const steps = [
    { number: 1, title: "Contact Info", icon: User },
    { number: 2, title: "Company Details", icon: Building2 },
    { number: 3, title: "Qualification", icon: Target },
    { number: 4, title: "Assignment", icon: UserPlus },
  ];
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-6 w-6 text-primary" />
          Create New Lead
        </CardTitle>
        <CardDescription>
          Add a new lead to your pipeline
        </CardDescription>
        
        <div className="flex justify-between items-center mt-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;
            
            return (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                      isCompleted
                        ? "bg-primary border-primary text-primary-foreground"
                        : isActive
                        ? "border-primary text-primary bg-primary/10"
                        : "border-gray-300 dark:border-gray-600 text-gray-400"
                    }`}
                    data-testid={`step-indicator-${step.number}`}
                  >
                    {isCompleted ? "✓" : <Icon className="h-5 w-5" />}
                  </div>
                  <span className={`text-xs mt-1 hidden sm:block ${isActive ? "text-primary font-medium" : "text-muted-foreground"}`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 ${
                      isCompleted ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Name *</Label>
                <Input
                  id="contactName"
                  placeholder="John Doe"
                  value={formData.contactName}
                  onChange={(e) => updateFormData("contactName", e.target.value)}
                  data-testid="input-contact-name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.contactEmail}
                  onChange={(e) => updateFormData("contactEmail", e.target.value)}
                  data-testid="input-contact-email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  placeholder="9876543210"
                  value={formData.contactPhone}
                  onChange={(e) => updateFormData("contactPhone", e.target.value.replace(/\D/g, ''))}
                  maxLength={10}
                  data-testid="input-contact-phone"
                />
              </div>
            </div>
          )}
          
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  placeholder="Acme Corporation"
                  value={formData.companyName}
                  onChange={(e) => updateFormData("companyName", e.target.value)}
                  data-testid="input-company-name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">Website <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://example.com"
                  value={formData.website}
                  onChange={(e) => updateFormData("website", e.target.value)}
                  data-testid="input-website"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="industryType">Industry Type *</Label>
                <Select value={formData.industryType} onValueChange={(value) => updateFormData("industryType", value)}>
                  <SelectTrigger data-testid="select-industry-type">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
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
              </div>
            </div>
          )}
          
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Lead Status *</Label>
                <Select value={formData.status} onValueChange={(value) => updateFormData("status", value)}>
                  <SelectTrigger data-testid="select-status">
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
                <Label htmlFor="source">Lead Source <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                <Select value={formData.source} onValueChange={(value) => updateFormData("source", value)}>
                  <SelectTrigger data-testid="select-source">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
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
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select value={formData.priority} onValueChange={(value) => updateFormData("priority", value)}>
                  <SelectTrigger data-testid="select-priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dealValue">Deal Value <span className="text-muted-foreground text-xs">(Optional, in ₹)</span></Label>
                <Input
                  id="dealValue"
                  type="number"
                  placeholder="100000"
                  value={formData.dealValue}
                  onChange={(e) => updateFormData("dealValue", e.target.value)}
                  data-testid="input-deal-value"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expectedCloseDate">Expected Close Date <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                <Input
                  id="expectedCloseDate"
                  type="date"
                  value={formData.expectedCloseDate}
                  onChange={(e) => updateFormData("expectedCloseDate", e.target.value)}
                  data-testid="input-expected-close-date"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes about this lead"
                  value={formData.notes}
                  onChange={(e) => updateFormData("notes", e.target.value)}
                  rows={3}
                  data-testid="input-notes"
                />
              </div>
            </div>
          )}
          
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assign to Team Leader <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                <Select value={formData.assignedTo} onValueChange={(value) => updateFormData("assignedTo", value)}>
                  <SelectTrigger data-testid="select-assigned-to">
                    <SelectValue placeholder="Select team leader" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {teamLeaders.map((leader) => (
                      <SelectItem key={leader.id} value={leader.id.toString()}>
                        {leader.displayName} ({leader.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mt-6 p-4 bg-muted rounded-md">
                <h3 className="font-medium mb-2">Summary</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Contact:</span> {formData.contactName} ({formData.contactEmail})</p>
                  <p><span className="text-muted-foreground">Company:</span> {formData.companyName}</p>
                  <p><span className="text-muted-foreground">Industry:</span> {formData.industryType}</p>
                  <p><span className="text-muted-foreground">Status:</span> {formData.status}</p>
                  <p><span className="text-muted-foreground">Priority:</span> {formData.priority}</p>
                  {formData.dealValue && (
                    <p><span className="text-muted-foreground">Deal Value:</span> ₹{parseInt(formData.dealValue).toLocaleString()}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <p className="text-sm text-red-500" data-testid="error-message">{error}</p>
          )}
          
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || isLoading}
              data-testid="button-back"
            >
              Back
            </Button>
            
            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={isLoading}
                data-testid="button-next"
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading}
                data-testid="button-submit"
              >
                {isLoading ? "Creating..." : "Create Lead"}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
