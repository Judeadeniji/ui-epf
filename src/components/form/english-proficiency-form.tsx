"use client";

import { useState, ChangeEvent, useActionState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn, FormDataState } from "@/lib/utils";
import { client } from "@/server/client";
import { formatDate, parseISO, isValid } from "date-fns";

// Import form sections
import { FormHeader } from "@/components/form/form-header";
import { EmailSection } from "@/components/form/email-section";
import { PersonalInformationSection } from "@/components/form/personal-information-section";
import { AcademicInformationSection } from "@/components/form/academic-information-section";
import { PostageInformationSection } from "@/components/form/postage-information-section";
import { PaymentUploadsSection } from "@/components/form/payment-uploads-section";
import { FormActions } from "@/components/form/form-actions";

type ModeOfPostageType = "email" | "hand_collection" | "delivery";
const MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024; // 1MB

const EnglishProficiencyForm = () => {
    const [state, formAction, isPending] = useActionState<
        | {
            success: true;
            message: string;
            error: null;
            fieldErrors: Record<string, string>;
        }
        | {
            success: false;
            error: string;
            fieldErrors: Record<string, string>;
        }
        | null,
        FormData
    >(
        async (_, formData) => {
            const payload: Record<string, any> = {};
            for (const [key, value] of formData.entries()) {
                if (typeof value === 'string') {
                    payload[key] = value;
                }
            }

            if (certificateFile) {
                payload.certificate_file = certificateFile;
            }
            if (paymentReceiptFile) {
                payload.payment_receipt_file = paymentReceiptFile;
            }

            payload.mode_of_postage = modeOfPostage;

            if (graduationDate) {
                payload.year_of_graduation = formatDate(graduationDate, "yyyy-MM-dd");
            } else {
                payload.year_of_graduation = "";
                // If graduation date is required and not set, add a field error
                if (!payload.year_of_graduation) {
                    return {
                        success: false,
                        error: "Graduation date is required.",
                        fieldErrors: { year_of_graduation: "Graduation date is required." },
                    };
                }
            }

            // Conditional validation for postage_address
            if (modeOfPostage === "delivery" && !payload.postage_address) {
                return {
                    success: false,
                    error: "Postage address is required for delivery.",
                    fieldErrors: { postage_address: "Postage address is required for delivery." },
                };
            }
            // Conditional validation for recipient_email
            if (modeOfPostage === "email" && !payload.recipient_email) {
                return {
                    success: false,
                    error: "Recipient email is required for email postage.",
                    fieldErrors: { recipient_email: "Recipient email is required for email postage." },
                };
            }

            try {
                const response = await client.api.v1.applications.$post({
                    form: payload as FormDataState,
                });

                const newState = await response.json();

                if (response.ok && newState.error === null && newState.message) {
                    return {
                        success: true,
                        message: newState.message,
                        error: null,
                        fieldErrors: {},
                    };
                } else {
                    const errorMsg =
                        typeof newState.error === "string"
                            ? newState.error
                            : newState.message || "An unknown error occurred.";

                    const finalFieldErrors: Record<string, string> = {};
                    if (newState.fieldErrors && typeof newState.fieldErrors === 'object') {
                        for (const key in newState.fieldErrors) {
                            if (Object.prototype.hasOwnProperty.call(newState.fieldErrors, key)) {
                                const value = (newState.fieldErrors as Record<string, any>)[key];
                                if (typeof value === 'string') {
                                    finalFieldErrors[key] = value;
                                }
                            }
                        }
                    }
                    return {
                        success: false,
                        error: errorMsg,
                        fieldErrors: finalFieldErrors,
                    };
                }
            } catch (error) {
                console.error("Submission error:", error);
                return {
                    success: false,
                    error: "Network error or server unreachable.",
                    fieldErrors: {},
                };
            }
        },
        null
    );

    const [graduationDate, setGraduationDate] = useState<Date | undefined>(undefined);
    const [certificateFile, setCertificateFile] = useState<File | null>(null);
    const [paymentReceiptFile, setPaymentReceiptFile] = useState<File | null>(null);
    const [modeOfPostage, setModeOfPostage] = useState<ModeOfPostageType>("delivery");
    
    // Progress tracking
    const [formProgress, setFormProgress] = useState({
        email: false,
        personal: false,
        academic: false,
        postage: false,
        payment: false
    });

    function getFieldError<T extends string>(field: T): string | undefined {
        if (
            state &&
            !state.success &&
            state.fieldErrors &&
            typeof state.fieldErrors === "object" &&
            field in state.fieldErrors
        ) {
            return (state.fieldErrors as Record<T, string>)[field];
        }
        return undefined;
    }

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            const file = files[0];

            if (file.size > MAX_FILE_SIZE_BYTES) {
                toast.error(`File "${file.name}" is too large. Max size is 1MB.`);
                e.target.value = "";
                if (name === "certificate_file") {
                    setCertificateFile(null);
                } else if (name === "payment_receipt_file") {
                    setPaymentReceiptFile(null);
                }
                return;
            }

            if (name === "certificate_file") {
                setCertificateFile(file);
            } else if (name === "payment_receipt_file") {
                setPaymentReceiptFile(file);
            }
        } else {
            if (name === "certificate_file") {
                setCertificateFile(null);
            } else if (name === "payment_receipt_file") {
                setPaymentReceiptFile(null);
            }
        }
    };

    const handleGraduationDateInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const dateString = e.target.value;
        try {
            const parsedDate = parseISO(dateString);
            if (isValid(parsedDate)) {
                setGraduationDate(parsedDate);
            } else {
                setGraduationDate(undefined);
            }
        } catch (error) {
            setGraduationDate(undefined);
        }
    };

    const handleClearForm = () => {
        setGraduationDate(undefined);
        setCertificateFile(null);
        setPaymentReceiptFile(null);
        setModeOfPostage("delivery");
        setFormProgress({
            email: false,
            personal: false,
            academic: false,
            postage: false,
            payment: false
        });
        const formElement = document.getElementById("englishProficiencyForm") as HTMLFormElement;
        if (formElement) {
            formElement.reset();
        }
    };

    // Function to check form progress
    const checkFormProgress = () => {
        const form = document.getElementById("englishProficiencyForm") as HTMLFormElement;
        if (!form) return;

        const formData = new FormData(form);
        
        // Check email section
        const emailCompleted = !!formData.get("email");
        
        // Check personal information section
        const personalCompleted = !!(
            formData.get("matriculation_number") &&
            formData.get("sex") &&
            formData.get("surname") &&
            formData.get("firstname")
        );
        
        // Check academic information section
        const academicCompleted = !!(
            formData.get("department") &&
            formData.get("faculty") &&
            graduationDate &&
            formData.get("class_of_degree") &&
            formData.get("degree_awarded")
        );
        
        // Check postage information section
        const postageCompleted = !!(
            modeOfPostage &&
            (modeOfPostage !== "delivery" || formData.get("postage_address")) &&
            (modeOfPostage !== "email" || formData.get("recipient_email"))
        );
        
        // Check payment section
        const paymentCompleted = !!(
            formData.get("remita_rrr") &&
            certificateFile &&
            paymentReceiptFile
        );

        setFormProgress({
            email: emailCompleted,
            personal: personalCompleted,
            academic: academicCompleted,
            postage: postageCompleted,
            payment: paymentCompleted
        });
    };

    // Check progress on form changes
    useEffect(() => {
        const form = document.getElementById("englishProficiencyForm") as HTMLFormElement;
        if (!form) return;

        const handleFormChange = () => {
            setTimeout(checkFormProgress, 100); // Small delay to ensure state updates
        };

        form.addEventListener("input", handleFormChange);
        form.addEventListener("change", handleFormChange);
        
        // Also check when dependencies change
        checkFormProgress();

        return () => {
            form.removeEventListener("input", handleFormChange);
            form.removeEventListener("change", handleFormChange);
        };
    }, [graduationDate, modeOfPostage, certificateFile, paymentReceiptFile]);

    useEffect(() => {
        if (state) {
            if (state.success) {
                toast.success(state.message);
                handleClearForm();
            } else {
                if (state.error && Object.keys(state.fieldErrors).length === 0) {
                    toast.error(state.error);
                } else if (Object.keys(state.fieldErrors).length > 0) {
                    Object.values(state.fieldErrors).forEach((error) => {
                        toast.error(error);
                    });
                }
            }
        }
    }, [state]);

    return (
        <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8 flex justify-center items-start">
            <FormHeader formProgress={formProgress}>
                <form action={formAction} className="space-y-12" id="englishProficiencyForm">
                    <EmailSection getFieldError={getFieldError} />

                    <PersonalInformationSection getFieldError={getFieldError} />

                    <div className="relative my-12">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border/40"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-background text-muted-foreground font-medium">
                                Academic Details
                            </span>
                        </div>
                    </div>

                    <AcademicInformationSection
                        graduationDate={graduationDate}
                        setGraduationDate={setGraduationDate}
                        handleGraduationDateInputChange={handleGraduationDateInputChange}
                        getFieldError={getFieldError}
                    />

                    <div className="relative my-12">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border/40"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-background text-muted-foreground font-medium">
                                Delivery Information
                            </span>
                        </div>
                    </div>

                    <PostageInformationSection
                        modeOfPostage={modeOfPostage}
                        setModeOfPostage={setModeOfPostage}
                        getFieldError={getFieldError}
                    />

                    <div className="relative my-12">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border/40"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-background text-muted-foreground font-medium">
                                Payment & Documents
                            </span>
                        </div>
                    </div>

                    <PaymentUploadsSection
                        certificateFile={certificateFile}
                        paymentReceiptFile={paymentReceiptFile}
                        handleFileChange={handleFileChange}
                        getFieldError={getFieldError}
                    />

                    <FormActions 
                        isPending={isPending} 
                        onClearForm={handleClearForm}
                        formProgress={formProgress}
                    />
                </form>
            </FormHeader>
        </div>
    );
};

export { EnglishProficiencyForm };
