import { useLoaderData, useSubmit } from "react-router";
import { singleApplicationLoader } from "./loaders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { getStatusBadge } from "./components";
import { LoaderCircle } from "lucide-react";
import { formatDate } from "date-fns";

export function SingleApplicationPage() {
    const submit = useSubmit();
    const applicationData = useLoaderData<typeof singleApplicationLoader>();
    const [decision, setDecision] = useState<"approve" | "reject" | null>(null);
    const [feedback, setFeedback] = useState("");
    const [docFile, setDocFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);

    if ("error" in applicationData) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <p className="font-medium text-red-500">Could not load application</p>
                {applicationData.error && <p className="text-sm text-red-500 mt-1">Error: {applicationData.error}</p>}
            </div>
        );
    }

    const { application, application_hash } = applicationData.data;
    const isEmailPostage = application.mode_of_postage.toLowerCase() === "email";
    const isProcessed = application_hash.status === "approved" || application_hash.status === "rejected";

    // Helper for file download links
    const fileLink = (fileUrl: string, label: string) => (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 hover:text-blue-800" download>
            {label}
        </a>
    );

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        setSubmitting(true);
        await submit(form, {
            method: "POST",
        });
        form.reset();
        setDecision(null);
        setFeedback("");
        setDocFile(null);
        setSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-4 md:px-6">
                {/* Header Section */}
                <div className="space-y-4 mb-6">
                    <h1 className="text-3xl font-bold text-primary">Application Details</h1>
                    <div className="space-y-2 text-muted-foreground">
                        <p>Submitted on {formatDate(new Date(application_hash.created_at), "PPP")}</p>
                        <div className="flex items-center gap-2">
                            Status: {getStatusBadge(application_hash.status)}
                        </div>
                    </div>
                </div>


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Main Details Section */}
                    <div className="lg:col-span-2 space-y-4">
                        <section className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Full Name</Label>
                                        <div>{application.surname} {application.firstname} {application.middlename}</div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Email</Label>
                                        <div>{application.email}</div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Sex</Label>
                                        <div className="text-lg capitalize">{application.sex}</div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Matriculation Number</Label>
                                        <div>{application.matriculation_number}</div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Department</Label>
                                        <div>{application.department}</div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Course of Study</Label>
                                        <div>{application.course_of_study}</div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Year of Graduation</Label>
                                        <div>{application.year_of_graduation}</div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Class of Degree</Label>
                                        <div>{application.class_of_degree}</div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Reference Number</Label>
                                        <div>{application.reference_number || <span className="text-muted-foreground">N/A</span>}</div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Mode of Postage</Label>
                                        <div className="text-lg capitalize">{application.mode_of_postage}</div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Remita RRR</Label>
                                        <div>{application.remita_rrr}</div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Recipient Address</Label>
                                        <div>{application.recipient_address}</div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Recipient Email</Label>
                                        <div>{application.recipient_email}</div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Uploaded Certificate</Label>
                                    <div>{fileLink(application.certificate_file, "View Certificate")}</div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Payment Receipt</Label>
                                    <div>{fileLink(application.payment_receipt_file, "View Receipt")}</div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Review Section - Right Side */}
                    <div className="lg:col-span-1">
                        <div className="bg-muted/30 rounded-lg p-6 sticky top-4">
                            <h2 className="text-2xl font-semibold mb-4">Review & Action</h2>
                            {isProcessed ? (
                                <div className="space-y-6">
                                    <div>
                                        <Label className="text-sm font-medium">Status</Label>
                                        <div className="mt-1">{getStatusBadge(application_hash.status)}</div>
                                    </div>

                                    {application_hash.reason && (
                                        <div>
                                            <Label className="text-sm font-medium">Feedback</Label>
                                            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{application_hash.reason}</p>
                                        </div>
                                    )}

                                    {application_hash.status === "approved" && isEmailPostage && application_hash.processed_document_link && (
                                        <div>
                                            <Label className="text-sm font-medium">Sent Document</Label>
                                            <div className="mt-1">{fileLink(application_hash.processed_document_link, "View Sent Document")}</div>
                                        </div>
                                    )}
                                    
                                    {!application_hash.reason && !(application_hash.status === "approved" && isEmailPostage && application_hash.processed_document_link) && (
                                        <p className="text-sm text-muted-foreground mt-2">
                                            This application has been processed. Current status: <span className="font-semibold">{application_hash.status}</span>.
                                        </p>
                                     )}
                                </div>
                            ) : (
                                <form className="space-y-6" onSubmit={handleSubmit}>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Decision</Label>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                className="flex-1"
                                                variant={decision === "approve" ? "default" : "outline"}
                                                onClick={() => setDecision("approve")}
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                type="button"
                                                className="flex-1"
                                                variant={decision === "reject" ? "destructive" : "outline"}
                                                onClick={() => setDecision("reject")}
                                            >
                                                Reject
                                            </Button>
                                        </div>
                                        <Input
                                            type="hidden"
                                            name="decision"
                                            value={decision || ""}
                                        />
                                    </div>

                                    {decision === "approve" && isEmailPostage && (
                                        <div className="space-y-2">
                                            <Label htmlFor="doc-upload">Upload File</Label>
                                            <Input
                                                id="doc-upload"
                                                name="doc-upload"
                                                type="file"
                                                accept=".pdf"
                                                onChange={e => setDocFile(e.target.files?.[0] || null)}
                                            />
                                            {docFile && (
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Selected: {docFile.name}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="feedback">Feedback (optional)</Label>
                                        <Input
                                            id="feedback"
                                            name="feedback"
                                            value={feedback}
                                            onChange={e => setFeedback(e.target.value)}
                                            placeholder="Enter feedback for the applicant..."
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={!decision || (decision === "approve" && isEmailPostage && !docFile) || submitting}
                                    >
                                        {submitting ? <>
                                            <LoaderCircle className="animate-spin" />
                                            <span>
                                                {decision === "approve" ? "Approving Application..." :
                                                 decision === "reject" ? "Rejecting Application..." :
                                                 "Submitting..."}
                                            </span>
                                        </> :
                                            decision === "approve" ? "Approve Application" :
                                                decision === "reject" ? "Reject Application" :
                                                    "Select Action"}
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}