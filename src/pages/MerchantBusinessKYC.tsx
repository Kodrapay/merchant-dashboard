import { FormEvent, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Building2, Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { API_BASE_URL } from "@/lib/api-client";
import { getMerchantUser } from "@/lib/merchant-user";
import { Badge } from "@/components/ui/badge";

type BusinessType = "registered" | "startup" | "small_business";
type DocumentType = "cac" | "tin" | "memart" | "directors_id" | "utility_bill" | "bank_statement";

interface UploadedDocument {
  type: DocumentType;
  fileName: string;
  uploadedAt: Date;
}

export default function MerchantBusinessKYC() {
  const [businessType, setBusinessType] = useState<BusinessType>("registered");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const { toast } = useToast();
  const user = getMerchantUser();

  // Form state for registered business
  const [businessName, setBusinessName] = useState("");
  const [cacNumber, setCacNumber] = useState("");
  const [tinNumber, setTinNumber] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [incorporationDate, setIncorporationDate] = useState("");
  const [businessCategory, setBusinessCategory] = useState("");
  const [directorName, setDirectorName] = useState("");
  const [directorBVN, setDirectorBVN] = useState("");
  const [directorPhone, setDirectorPhone] = useState("");
  const [directorEmail, setDirectorEmail] = useState("");

  // Nigerian states
  const nigerianStates = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo",
    "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa",
    "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
    "Yobe", "Zamfara"
  ];

  // Business categories
  const businessCategories = [
    "E-commerce",
    "Financial Services",
    "Technology/Software",
    "Professional Services",
    "Healthcare",
    "Education",
    "Hospitality",
    "Retail",
    "Manufacturing",
    "Transportation/Logistics",
    "Real Estate",
    "Media/Entertainment",
    "Agriculture",
    "Other"
  ];

  const handleFileUpload = (type: DocumentType, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Only PDF, JPG, and PNG files are allowed",
        variant: "destructive",
      });
      return;
    }

    // Add to uploaded documents
    setUploadedDocuments(prev => [
      ...prev.filter(doc => doc.type !== type),
      {
        type,
        fileName: file.name,
        uploadedAt: new Date(),
      }
    ]);

    toast({
      title: "Document uploaded",
      description: `${file.name} has been uploaded successfully`,
    });
  };

  const isDocumentUploaded = (type: DocumentType) => {
    return uploadedDocuments.some(doc => doc.type === type);
  };

  const getRequiredDocuments = (): { type: DocumentType; label: string; description: string }[] => {
    if (businessType === "startup" || businessType === "small_business") {
      return [
        { type: "directors_id", label: "Director's ID", description: "Valid government-issued ID (NIN, Driver's License, or International Passport)" },
        { type: "utility_bill", label: "Utility Bill", description: "Recent utility bill (not older than 3 months) showing business address" },
        { type: "bank_statement", label: "Bank Statement", description: "Recent bank statement (not older than 3 months)" },
      ];
    }

    return [
      { type: "cac", label: "CAC Certificate", description: "Certificate of Incorporation from Corporate Affairs Commission" },
      { type: "tin", label: "TIN Certificate", description: "Tax Identification Number (TIN) Certificate from FIRS" },
      { type: "memart", label: "MEMART (Form CAC 7)", description: "Memorandum and Articles of Association" },
      { type: "directors_id", label: "Director's ID", description: "Valid government-issued ID of at least one director" },
      { type: "utility_bill", label: "Utility Bill", description: "Recent utility bill (not older than 3 months) showing business address" },
    ];
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    // Validate required documents
    const requiredDocs = getRequiredDocuments();
    const missingDocs = requiredDocs.filter(doc => !isDocumentUploaded(doc.type));

    if (missingDocs.length > 0) {
      toast({
        title: "Missing documents",
        description: `Please upload all required documents: ${missingDocs.map(d => d.label).join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    if (!user?.merchantId) {
      toast({
        title: "Not logged in",
        description: "Please sign in again and retry your KYC submission.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await fetch(`${API_BASE_URL}/kyc/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchant_id: user.merchantId,
          business_type: businessType,
          business_name: businessName,
          cac_number: cacNumber,
          tin_number: tinNumber,
          business_address: businessAddress,
          city,
          state,
          postal_code: postalCode,
          incorporation_date: incorporationDate,
          business_category: businessCategory,
          director_name: directorName,
          director_bvn: directorBVN,
          director_phone: directorPhone,
          director_email: directorEmail,
          documents: uploadedDocuments.reduce<Record<string, string>>((acc, doc) => {
            acc[doc.type] = doc.fileName;
            return acc;
          }, {}),
        }),
      });

      toast({
        title: "KYC submitted successfully",
        description: "Your business verification is under review. We'll notify you within 24-48 hours.",
      });
    } catch (error) {
      console.error("KYC submit failed", error);
      toast({
        title: "Submission failed",
        description: "We could not submit your KYC. Please retry shortly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout type="merchant" title="Business KYC Verification">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Business Verification</h2>
              <p className="text-muted-foreground">
                Complete your business KYC verification to comply with Nigerian CBN regulations and unlock full payment processing capabilities.
              </p>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-foreground mb-1">Why KYC is required</p>
                <p className="text-muted-foreground">
                  In accordance with CBN (Central Bank of Nigeria) and FIRS regulations, all payment service providers must verify business identity to prevent fraud and money laundering.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Business Type Selection */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Business Type</Label>
              <RadioGroup value={businessType} onValueChange={(value) => setBusinessType(value as BusinessType)}>
                <div className="grid md:grid-cols-2 gap-4">
                  <label className={`flex items-start gap-3 border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    businessType === "registered" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}>
                    <RadioGroupItem value="registered" id="registered" className="mt-1" />
                    <div>
                      <p className="font-medium text-foreground">Registered Business</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Business registered with CAC with RC number
                      </p>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    businessType === "startup" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}>
                    <RadioGroupItem value="startup" id="startup" className="mt-1" />
                    <div>
                      <p className="font-medium text-foreground">Startup/Unregistered</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Early-stage business without CAC registration
                      </p>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    businessType === "small_business" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}>
                    <RadioGroupItem value="small_business" id="small_business" className="mt-1" />
                    <div>
                      <p className="font-medium text-foreground">Small Business</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Sole proprietors or small shops without formal registration
                      </p>
                    </div>
                  </label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            {/* Business Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Business Information</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">
                    Business Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="businessName"
                    placeholder="Enter legal business name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessCategory">
                    Business Category <span className="text-destructive">*</span>
                  </Label>
                  <Select value={businessCategory} onValueChange={setBusinessCategory} required>
                    <SelectTrigger id="businessCategory">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessCategories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {businessType === "registered" && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cacNumber">
                      CAC Registration Number (RC) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="cacNumber"
                      placeholder="e.g., RC1234567"
                      value={cacNumber}
                      onChange={(e) => setCacNumber(e.target.value)}
                      required={businessType === "registered"}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="incorporationDate">
                      Date of Incorporation <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="incorporationDate"
                      type="date"
                      value={incorporationDate}
                      onChange={(e) => setIncorporationDate(e.target.value)}
                      required={businessType === "registered"}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="tinNumber">
                  Tax Identification Number (TIN) {businessType === "registered" && <span className="text-destructive">*</span>}
                </Label>
                <Input
                  id="tinNumber"
                  placeholder="Enter TIN"
                  value={tinNumber}
                  onChange={(e) => setTinNumber(e.target.value)}
                  required={businessType === "registered"}
                />
                {businessType === "startup" && (
                  <p className="text-xs text-muted-foreground">Optional for startups, but recommended</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Business Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Business Address</h3>

              <div className="space-y-2">
                <Label htmlFor="businessAddress">
                  Street Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="businessAddress"
                  placeholder="Enter street address"
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  required
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">
                    City <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="city"
                    placeholder="Enter city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">
                    State <span className="text-destructive">*</span>
                  </Label>
                  <Select value={state} onValueChange={setState} required>
                    <SelectTrigger id="state">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {nigerianStates.map(stateName => (
                        <SelectItem key={stateName} value={stateName}>
                          {stateName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    placeholder="Enter postal code"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Director/Owner Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                {businessType === "startup" ? "Owner Information" : "Director Information"}
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="directorName">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="directorName"
                    placeholder="Enter full name"
                    value={directorName}
                    onChange={(e) => setDirectorName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="directorBVN">
                    BVN (Bank Verification Number) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="directorBVN"
                    placeholder="Enter 11-digit BVN"
                    value={directorBVN}
                    onChange={(e) => setDirectorBVN(e.target.value)}
                    maxLength={11}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="directorPhone">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="directorPhone"
                    type="tel"
                    placeholder="+234 XXX XXX XXXX"
                    value={directorPhone}
                    onChange={(e) => setDirectorPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="directorEmail">
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="directorEmail"
                    type="email"
                    placeholder="Enter email address"
                    value={directorEmail}
                    onChange={(e) => setDirectorEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Document Upload */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Required Documents</h3>
                <Badge variant="secondary">
                  {uploadedDocuments.length}/{getRequiredDocuments().length} uploaded
                </Badge>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Document Requirements:</strong> All documents must be clear, legible, and not older than 3 months (where applicable).
                  Accepted formats: PDF, JPG, PNG. Maximum file size: 5MB per document.
                </p>
              </div>

              <div className="grid gap-4">
                {getRequiredDocuments().map(doc => (
                  <div key={doc.type} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Label className="font-medium text-foreground">
                            {doc.label} <span className="text-destructive">*</span>
                          </Label>
                          {isDocumentUploaded(doc.type) && (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{doc.description}</p>
                        {isDocumentUploaded(doc.type) && (
                          <div className="flex items-center gap-2 text-sm">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground">
                              {uploadedDocuments.find(d => d.type === doc.type)?.fileName}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <Label
                          htmlFor={`upload-${doc.type}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:bg-primary/90 transition-colors"
                        >
                          <Upload className="h-4 w-4" />
                          {isDocumentUploaded(doc.type) ? "Replace" : "Upload"}
                        </Label>
                        <Input
                          id={`upload-${doc.type}`}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={(e) => handleFileUpload(doc.type, e.target.files)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                All fields marked with <span className="text-destructive">*</span> are required
              </p>
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="min-w-[200px]"
              >
                {isSubmitting ? "Submitting..." : "Submit for Verification"}
              </Button>
            </div>
          </form>
        </Card>

        {/* Information Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
              <div>
                <p className="font-medium text-foreground mb-1">Verification Timeline</p>
                <p className="text-sm text-muted-foreground">
                  Most verifications are completed within 24-48 hours. Complex cases may take up to 5 business days.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground mb-1">Need Help?</p>
                <p className="text-sm text-muted-foreground">
                  Contact our compliance team at compliance@kodrapay.com for assistance with your verification.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
