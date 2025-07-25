import { useLoaderData, useSubmit } from "react-router";
import { singleApplicationLoader } from "./loaders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { getStatusBadge } from "./components";
import { LoaderCircle } from "lucide-react";
import { formatDate } from "date-fns";
import { useSession } from "@/contexts/session";

export function SingleApplicationPage() {
    const { user } = useSession();
    const isAdmin = user.role === "admin";
    const submit = useSubmit();
    const applicationData = useLoaderData<typeof singleApplicationLoader>();
    const [decision, setDecision] = useState<"pre-approved" | "approved" | "rejected" | null>(null);
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

    // Define allowed statuses for processing
    const isProcessed = application_hash.status === "approved" || application_hash.status === "rejected";

    // Determine if the current application can still be acted upon
    // It can be acted upon if it's 'pending' or 'pre-approved' (and not 'approved' or 'rejected')
    const canTakeAction = !isProcessed && application_hash.status !== "approved"; // Already approved is processed and no more action

    // Helper for file download links
    const fileLink = (fileUrl: string, label: string) => {
        // Ensure the file URL is absolute for proper linking in a deployed environment
        const absoluteUrl = fileUrl.startsWith('/') ? `${window.location.origin}${fileUrl}` : fileUrl;
        return (
            <a href={absoluteUrl} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 hover:text-blue-800" download>
                {label}
            </a>
        );
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;

        // Basic client-side validation for decision
        if (!decision) {
            alert("Please select a decision (Approve or Reject).");
            return;
        }

        // Client-side validation for document upload if pre-approving with email postage
        if (decision === "pre-approved" && isEmailPostage && !docFile) {
            alert("Please upload a processed document file for pre-approval with email postage.");
            return;
        }

        setSubmitting(true);
        await submit(form, {
            method: "POST",
            // If you have specific error handling or success messages from the backend,
            // you might want to use `action` or `useFetcher` with `onSuccess`/`onError` callbacks
        });
        // Reset form state after submission (whether successful or not)
        setSubmitting(false); // Set to false AFTER submit, potentially on success/error callbacks if needed.
        // Form reset and state resets will be handled by loader re-fetch on successful submission.
        // For now, these lines below will clear the form immediately, which is fine for simple cases.
        form.reset();
        setDecision(null);
        setFeedback("");
        setDocFile(null);
    };

    // Determine the 'Approve' button's label based on admin status and current application status
    const getApproveButtonLabel = () => {
        if (application_hash.status === "pending" && isAdmin) {
            return "Approve (Final)"; // Admin directly approves
        } else if (application_hash.status === "pending" && !isAdmin) {
            return "Pre-Approve"; // Non-admin pre-approves
        } else if (application_hash.status === "pre-approved" && isAdmin) {
            return "Approve (Final)"; // Admin takes pre-approved to approved
        }
        return "Approve"; // Fallback, though should be covered by above
    };

    // Determine the decision value to send based on admin status and current status
    const getDecisionValueForApproveButton = () => {
        if (application_hash.status === "pending" && isAdmin) {
            return "approved"; // Admin directly approves to 'approved'
        } else if (application_hash.status === "pending" && !isAdmin) {
            return "pre-approved"; // Non-admin sets to 'pre-approved'
        } else if (application_hash.status === "pre-approved" && isAdmin) {
            return "approved"; // Admin changes from 'pre-approved' to 'approved'
        }
        return "approved"; // Default, should be covered
    };

    // Determine if the "Reject" button should be visible/active
    const canReject = !isProcessed; // Can reject if not yet approved or rejected

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
                    {
                        (isAdmin || application_hash.approved_by) && ( // Show if admin or if approved_by exists
                            <div className="space-y-2 text-muted-foreground">
                                <p>Approved By: {application_hash.approved_by || "N/A"}</p>
                                <div className="flex items-center gap-2">
                                    Approval Date: {application_hash.approved_at ? formatDate(new Date(application_hash.approved_at), "PPPP") : "N/A"}
                                </div>
                            </div>
                        )
                    }
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
                                        <Label className="text-sm font-medium">Faculty of Study</Label>
                                        <div>{application.faculty}</div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Course of Study</Label>
                                        <div>{application.department}</div>
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
                                        <Label className="text-sm font-medium">Postage Address</Label>
                                        <div>{application.postage_address}</div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Recipient Email</Label>
                                        <div>{application.recipient_email || <span className="text-muted-foreground">N/A</span>}</div>
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
                            {/* Display for processed applications */}
                            {isProcessed || !canTakeAction ? (
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

                                    {application_hash.processed_document_link && (
                                        <div>
                                            <Label className="text-sm font-medium">Processed Document</Label>
                                            <div className="mt-1">
                                                {fileLink(application_hash.processed_document_link, "View Processed Document")}
                                            </div>
                                        </div>
                                    )}

                                    {!application_hash.reason && !application_hash.processed_document_link && (
                                        <p className="text-sm text-muted-foreground mt-2">
                                            This application has been processed. Current status: <span className="font-semibold">{application_hash.status}</span>.
                                        </p>
                                    )}
                                </div>
                            ) : (
                                // Display for applications awaiting action (pending or pre-approved, but not yet final approved/rejected)
                                <form className="space-y-6" onSubmit={handleSubmit}>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Decision</Label>
                                        <div className="flex gap-2">
                                            {/* Approve Button */}
                                            <Button
                                                type="button"
                                                className="flex-1"
                                                variant={decision === getDecisionValueForApproveButton() ? "default" : "outline"}
                                                onClick={() => setDecision(getDecisionValueForApproveButton())}
                                                // Disable if it's pre-approved and current user is not admin
                                                // Or if it's already approved (though 'canTakeAction' should handle this)
                                                disabled={
                                                    (application_hash.status === "pre-approved" && !isAdmin) ||
                                                    (application_hash.status === "approved") // Already approved cannot be re-approved
                                                }
                                            >
                                                {getApproveButtonLabel()}
                                            </Button>

                                            {/* Reject Button */}
                                            <Button
                                                type="button"
                                                className="flex-1"
                                                variant={decision === "rejected" ? "destructive" : "outline"}
                                                onClick={() => setDecision("rejected")}
                                                disabled={!canReject}
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

                                    {/* Conditional upload file input */}
                                    {decision === "pre-approved" && isEmailPostage && (
                                        <div className="space-y-2">
                                            <Label htmlFor="doc-upload">Upload Processed Document (PDF)</Label>
                                            <Input
                                                id="doc-upload"
                                                name="doc-upload"
                                                type="file"
                                                accept=".pdf" // Ensure only PDF files are accepted
                                                onChange={e => setDocFile(e.target.files?.[0] || null)}
                                            />
                                            {docFile && (
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Selected: {docFile.name}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    {/* If current status is pre-approved and admin is approving, show existing doc or new upload */}
                                    {(application_hash.status === "pre-approved" && isAdmin && application_hash.processed_document_link) && (
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Existing Processed Document</Label>
                                            <div className="mt-1">
                                                {fileLink(application_hash.processed_document_link, "View Existing Document")}
                                            </div>
                                            {/* Optionally allow admin to re-upload if needed, or simply approve */}
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
                                        disabled={
                                            !decision ||
                                            (decision === "pre-approved" && isEmailPostage && !docFile) || // Require doc for pre-approve + email
                                            (decision === "approved" && application_hash.status === "pending" && isEmailPostage && !docFile) || // Require doc for direct admin approve + email
                                            submitting
                                        }
                                    >
                                        {submitting ? (
                                            <>
                                                <LoaderCircle className="animate-spin mr-2" />
                                                <span>
                                                    {decision === "approved" ? "Approving Application..." :
                                                    decision === "pre-approved" ? "Pre-Approving Application..." :
                                                    "Rejecting Application..."}
                                                </span>
                                            </>
                                        ) : (
                                            decision === "approved" ? "Approve Application" :
                                            decision === "pre-approved" ? "Pre-Approve Application" :
                                            decision === "rejected" ? "Reject Application" :
                                            "Select Action"
                                        )}
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