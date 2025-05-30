"use client";

import { useState, ChangeEvent, useActionState, useEffect } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input"; // Ensure Input component is available
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Loader2, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { cn, FormDataState } from "@/lib/utils";
import { client } from "@/server/client";
import { formatDate, parseISO, isValid } from "date-fns"; // Import parseISO and isValid

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

    const [graduationDate, setGraduationDate] = useState<Date | undefined>(
        undefined
    );
    const [certificateFile, setCertificateFile] = useState<File | null>(null);
    const [paymentReceiptFile, setPaymentReceiptFile] = useState<File | null>(
        null
    );
    const [modeOfPostage, setModeOfPostage] =
        useState<ModeOfPostageType>("delivery");

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
        // Attempt to parse the date string. We'll be lenient with formats.
        // For simple year/month/day input, 'YYYY-MM-DD' is best.
        try {
            const parsedDate = parseISO(dateString); // Tries to parse 'YYYY-MM-DD', 'YYYY/MM/DD', etc.
            if (isValid(parsedDate)) {
                setGraduationDate(parsedDate);
            } else {
                setGraduationDate(undefined); // Clear if invalid
            }
        } catch (error) {
            setGraduationDate(undefined); // Clear if parsing fails
        }
    };

    useEffect(() => {
        if (state) {
            if (state.success) {
                toast.success(state.message);
                setGraduationDate(undefined);
                setCertificateFile(null);
                setPaymentReceiptFile(null);
                setModeOfPostage("delivery");
                const formElement = document.getElementById("englishProficiencyForm") as HTMLFormElement;
                if (formElement) {
                    formElement.reset();
                }
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
        <div className="min-h-screen bg-background sm:py-8 sm:px-6 lg:px-8 flex justify-center items-start">
            <Card className="w-full max-w-3xl shadow-2xl bg-card text-card-foreground">
                <CardHeader className="text-center border-b pb-4">
                    <div className="flex justify-center mb-4">
                        <Image src="/UI_logo.png" alt="Logo" width={100} height={100} />
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
                        English Proficiency Application
                    </CardTitle>
                    <CardDescription className="mt-2 text-muted-foreground">
                        Please fill out the form accurately. Fields marked with{" "}
                        <span className="text-red-500">*</span> are required.
                    </CardDescription>
                </CardHeader>
                <CardContent className="sm:pt-6 px-2 sm:px-6">
                    <form action={formAction} className="space-y-8" id="englishProficiencyForm">
                        <div className="p-4 bg-muted/50 rounded-lg border">
                            <Label
                                htmlFor="email"
                                className="text-sm font-semibold text-foreground/90"
                            >
                                Email Address <span className="text-red-500">*</span>
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1 mb-2">
                                This email will be recorded with your response.
                            </p>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                required
                                className="mt-1 border-muted"
                                defaultValue=""
                            />
                            {getFieldError("email") && (
                                <p className="text-red-500 text-xs mt-1">
                                    {getFieldError("email")}
                                </p>
                            )}
                        </div>

                        <fieldset className="space-y-6 p-6 border rounded-lg">
                            <legend className="text-xl font-semibold text-foreground/90 px-2 -ml-2">
                                Personal Information
                            </legend>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="matriculation_number" className="font-medium">
                                        Matriculation Number <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="matriculation_number"
                                        name="matriculation_number"
                                        placeholder="E.g., 212xxx"
                                        required
                                        defaultValue=""
                                    />
                                    {getFieldError("matriculation_number") && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {getFieldError("matriculation_number")}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="sex" className="font-medium">
                                        Sex <span className="text-red-500">*</span>
                                    </Label>
                                    <Select name="sex" required defaultValue="">
                                        <SelectTrigger id="sex" className="w-full bg-background text-sm">
                                            <SelectValue placeholder="Select Sex" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {getFieldError("sex") && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {getFieldError("sex")}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="surname" className="font-medium">
                                        Surname (as in Certificate){" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="surname"
                                        name="surname"
                                        required
                                        placeholder="E.g., Doe"
                                        defaultValue=""
                                    />
                                    {getFieldError("surname") && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {getFieldError("surname")}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="firstname" className="font-medium">
                                        First Name (as in Certificate){" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="firstname"
                                        name="firstname"
                                        required
                                        placeholder="E.g., John"
                                        defaultValue=""
                                    />
                                    {getFieldError("firstname") && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {getFieldError("firstname")}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="middlename" className="font-medium">
                                        Middle Name (as in Certificate)
                                    </Label>
                                    <Input
                                        id="middlename"
                                        name="middlename"
                                        placeholder="Optional"
                                        defaultValue=""
                                    />
                                    {getFieldError("middlename") && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {getFieldError("middlename")}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </fieldset>

                        <Separator className="my-8" />

                        <fieldset className="space-y-6 p-6 border rounded-lg">
                            <legend className="text-xl font-semibold text-foreground/90 px-2 -ml-2">
                                Academic Information
                            </legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="department" className="font-medium">
                                        Department <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="department"
                                        name="department"
                                        required
                                        placeholder="E.g., Computer Science"
                                        defaultValue=""
                                    />
                                    {getFieldError("department") && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {getFieldError("department")}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="course_of_study" className="font-medium">
                                        Faculty <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="course_of_study"
                                        name="course_of_study"
                                        required
                                        placeholder="E.g., Science"
                                        defaultValue=""
                                    />
                                    {getFieldError("course_of_study") && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {getFieldError("course_of_study")}
                                        </p>
                                    )}
                                </div>
                                {/* --- GRADUATION DATE FIELD --- */}
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="graduation_date_input" // Changed htmlFor to point to the input
                                        className="font-medium"
                                    >
                                        Year of Graduation <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="flex items-center gap-2"> {/* Flex container for input and button */}
                                        <Input
                                            id="graduation_date_input"
                                            name="year_of_graduation_display" // Use a display name, actual value is from state
                                            placeholder="YYYY-MM-DD"
                                            value={graduationDate ? formatDate(graduationDate, "yyyy-MM-dd") : ""}
                                            onChange={handleGraduationDateInputChange}
                                            className="flex-grow bg-background text-sm"
                                            type="text" 
                                        />
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    id="year_of_graduation_trigger_button"
                                                    variant={"outline"}
                                                    className="shrink-0 bg-background text-sm"
                                                    type="button"
                                                >
                                                    <CalendarIcon className="h-4 w-4" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={graduationDate}
                                                    onSelect={setGraduationDate}
                                                    initialFocus
                                                    captionLayout="buttons"
                                                    fromYear={1948}
                                                    toYear={new Date().getFullYear()}
                                                    className="w-full"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    {getFieldError("year_of_graduation") && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {getFieldError("year_of_graduation")}
                                        </p>
                                    )}
                                </div>
                                {/* --- END GRADUATION DATE FIELD --- */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="class_of_degree" className="font-medium">
                                        Class of Degree <span className="text-red-500">*</span>
                                    </Label>
                                    <Select name="class_of_degree" required defaultValue="">
                                        <SelectTrigger
                                            id="class_of_degree"
                                            className="w-full bg-background text-sm"
                                        >
                                            <SelectValue placeholder="Select Class" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="First Class">First Class</SelectItem>
                                            <SelectItem value="Second Class Upper">
                                                Second Class Upper
                                            </SelectItem>
                                            <SelectItem value="Second Class Lower">
                                                Second Class Lower
                                            </SelectItem>
                                            <SelectItem value="Third Class">Third Class</SelectItem>
                                            <SelectItem value="Pass">Pass</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {getFieldError("class_of_degree") && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {getFieldError("class_of_degree")}
                                        </p>
                                    )}
                                </div>
                                <div className="md:col-span-2 space-y-1.5">
                                    <Label htmlFor="degree_awarded" className="font-medium">
                                        Degree Awarded <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="degree_awarded"
                                        name="degree_awarded"
                                        required
                                        placeholder="E.g., Bachelor of Science"
                                        defaultValue=""
                                    />
                                    {getFieldError("degree_awarded") && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {getFieldError("degree_awarded")}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </fieldset>

                        <Separator className="my-8" />

                        <fieldset className="space-y-6 p-6 border rounded-lg">
                            <legend className="text-xl font-semibold text-foreground/90 px-2 -ml-2">
                                Recipient & Postage
                            </legend>
                            <div className="space-y-1.5">
                                <Label htmlFor="reference_number" className="font-medium">
                                    Reference Number (if applicable)
                                </Label>
                                <Input
                                    id="reference_number"
                                    name="reference_number"
                                    placeholder="Optional"
                                    defaultValue=""
                                />
                                {getFieldError("reference_number") && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {getFieldError("reference_number")}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="postage_address" className="font-medium">
                                    Postage Address{" "}
                                    {modeOfPostage === "delivery" && (
                                        <span className="text-red-500">*</span>
                                    )}
                                </Label>
                                <textarea
                                    id="postage_address"
                                    name="postage_address"
                                    required={modeOfPostage === "delivery"}
                                    rows={3}
                                    className="w-full border rounded-md p-2 focus:ring-ring focus:border-ring text-sm bg-background"
                                    placeholder="Detailed address please..."
                                    defaultValue=""
                                ></textarea>
                                {getFieldError("postage_address") && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {getFieldError("postage_address")}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label className="font-medium">
                                    Mode of Postage <span className="text-red-500">*</span>
                                </Label>
                                <RadioGroup
                                    name="mode_of_postage"
                                    className="mt-2 space-y-2"
                                    required
                                    value={modeOfPostage}
                                    onValueChange={(value) =>
                                        setModeOfPostage(value as ModeOfPostageType)
                                    }
                                >
                                    {[
                                        { label: "Email", value: "email" },
                                        { label: "Hand Collection", value: "hand_collection" },
                                        { label: "Delivery", value: "delivery" },
                                    ].map((mode) => (
                                        <div key={mode.value} className="flex items-center">
                                            <RadioGroupItem
                                                value={mode.value}
                                                id={`mode_${mode.value}`}
                                            />
                                            <Label
                                                htmlFor={`mode_${mode.value}`}
                                                className="ml-2 text-sm font-normal text-foreground/90 cursor-pointer"
                                            >
                                                {mode.label}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                                {getFieldError("mode_of_postage") && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {getFieldError("mode_of_postage")}
                                    </p>
                                )}
                            </div>
                            {modeOfPostage === "email" && (
                                <div className="space-y-1.5">
                                    <Label htmlFor="recipient_email" className="font-medium">
                                        Recipient Email Address{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="recipient_email"
                                        type="email"
                                        name="recipient_email"
                                        required={modeOfPostage === "email"}
                                        placeholder="E.g., recipient@example.com"
                                        defaultValue=""
                                    />
                                    {getFieldError("recipient_email") && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {getFieldError("recipient_email")}
                                        </p>
                                    )}
                                </div>
                            )}
                        </fieldset>

                        <Separator className="my-8" />

                        <fieldset className="space-y-6 p-6 border rounded-lg">
                            <legend className="text-xl font-semibold text-foreground/90 px-2 -ml-2">
                                Payment & Uploads
                            </legend>
                            <div className="space-y-1.5">
                                <Label htmlFor="remita_rrr" className="font-medium">
                                    REMITA Payment Receipt RRR Number{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="remita_rrr"
                                    name="remita_rrr"
                                    required
                                    placeholder="Enter RRR number"
                                    defaultValue=""
                                />
                                {getFieldError("remita_rrr") && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {getFieldError("remita_rrr")}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="certificate_file" className="font-medium">
                                    Certificate Upload (Original Scanned PDF){" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <p className="text-xs text-muted-foreground mt-0.5 mb-1.5">
                                    Max 1MB, PDF only.
                                </p>
                                <Input
                                    id="certificate_file"
                                    type="file"
                                    name="certificate_file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    required
                                    className="block w-full text-sm text-slate-500 file:px-4 file:rounded-sm p-1 file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                                />
                                {certificateFile && (
                                    <p className="text-xs text-muted-foreground mt-1.5">
                                        Selected: {certificateFile.name}
                                    </p>
                                )}
                                {getFieldError("certificate_file") && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {getFieldError("certificate_file")}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="payment_receipt_file" className="font-medium">
                                    Payment Receipt Upload (PDF){" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <p className="text-xs text-muted-foreground mt-0.5 mb-1.5">
                                    Max 1MB, PDF only.
                                </p>
                                <Input
                                    id="payment_receipt_file"
                                    type="file"
                                    name="payment_receipt_file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    required
                                    className="block w-full text-sm text-slate-500 file:px-4 file:rounded-sm p-1 file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                                />
                                {paymentReceiptFile && (
                                    <p className="text-xs text-muted-foreground mt-1.5">
                                        Selected: {paymentReceiptFile.name}
                                    </p>
                                )}
                                {getFieldError("payment_receipt_file") && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {getFieldError("payment_receipt_file")}
                                    </p>
                                )}
                            </div>
                        </fieldset>

                        <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-8 border-t mt-10">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setGraduationDate(undefined);
                                    setCertificateFile(null);
                                    setPaymentReceiptFile(null);
                                    setModeOfPostage("delivery");
                                    const formElement = document.getElementById("englishProficiencyForm") as HTMLFormElement;
                                    if (formElement) {
                                        formElement.reset();
                                    }
                                }}
                                className="w-full sm:w-auto"
                                disabled={isPending}
                            >
                                Clear Form
                            </Button>
                            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    "Submit Application"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default EnglishProficiencyForm;