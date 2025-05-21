import { Link } from '@react-email/components';
import React from 'react';

interface EmailBodyProps {
    decision: 'approve' | 'reject' | 'submit'; 
    applicantName: string;
    feedback?: string;
    modeOfPostage?: string;
    processedDocumentLink?: string;
    appUrl?: string;
}

export const EmailBody: React.FC<EmailBodyProps> = ({
    decision,
    applicantName,
    feedback,
    modeOfPostage,
    processedDocumentLink,
    appUrl
}) => {
    switch (decision) {
        case "approve":
            return (
                <>
                    <p>Congratulations, {applicantName}!</p>
                    <p>Your application for English Proficiency has been approved.</p>
                    {feedback && <p><strong>Feedback:</strong> {feedback}</p>}
                    {modeOfPostage && modeOfPostage.toLowerCase() === "email" && processedDocumentLink && appUrl && (
                        <p>
                            Your processed document can be downloaded from: {}
                            <Link href={`${appUrl}${processedDocumentLink}`}>View Document</Link>
                        </p>
                    )}
                    {modeOfPostage && modeOfPostage.toLowerCase() === "hand collection" && (
                        <p>Your document is ready for hand collection. Please visit the designated office.</p>
                    )}
                </>
            );
        case "reject":
            return (
                <>
                    <p>Dear {applicantName},</p>
                    <p>We regret to inform you that your application for English Proficiency has been rejected.</p>
                    {feedback && <p><strong>Reason:</strong> {feedback}</p>}
                    <p>If you have any questions, please contact support.</p>
                </>
            );
        case "submit":
            return (
                <>
                    <p>Dear {applicantName},</p>
                    <p>Thank you for submitting your application for English Proficiency.</p>
                    <p>We have received your application and it is currently being processed. You will receive an email with the outcome in due course.</p>
                </>
            );
        default:
            return <p>An unexpected error occurred with your application status.</p>;
    }
};
