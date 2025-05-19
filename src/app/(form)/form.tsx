"use client"

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Loader2, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDate } from "date-fns";

interface FormDataState {
    email: string;
    matriculation_number: string;
    surname: string;
    firstname: string;
    middlename: string;
    sex: string;
    department: string;
    course_of_study: string;
    year_of_graduation: string;
    class_of_degree: string;
    degree_awarded: string;
    reference_number: string;
    recipient_address: string;
    mode_of_postage: string;
    recipient_email: string;
    remita_rrr: string;
    certificate_file: File | null;
    payment_receipt_file: File | null;
}



const EnglishProficiencyForm = () => {
    const [formData, setFormData] = useState<FormDataState>({
        email: "adenijiferanmi64@gmail.com",
        matriculation_number: "",
        surname: "",
        firstname: "",
        middlename: "",
        sex: "",
        department: "",
        course_of_study: "",
        year_of_graduation: "",
        class_of_degree: "",
        degree_awarded: "",
        reference_number: "",
        recipient_address: "",
        mode_of_postage: "",
        recipient_email: "",
        remita_rrr: "",
        certificate_file: null,
        payment_receipt_file: null
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [graduationDate, setGraduationDate] = useState<Date | undefined>(undefined);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));
                const mockData = {
                    matriculation_number: "MAT12345",
                    surname: "Adeniji",
                    firstname: "Feranmi"
                };
                setFormData(prevData => ({
                    ...prevData,
                    ...mockData
                }));
            } catch (err) {
                setError("Failed to fetch initial data. Please try again.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: files ? files[0] : null
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        const finalFormData = { ...formData };
        if (graduationDate && !formData.year_of_graduation) {
            finalFormData.year_of_graduation = graduationDate.toLocaleDateString('en-CA');
        }

        try {
            const submitPayload = new FormData();
            Object.entries(finalFormData).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    if (value instanceof File) {
                        submitPayload.append(key, value);
                    } else {
                        submitPayload.append(key, String(value));
                    }
                }
            });

            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success("Form submitted successfully!");
        } catch (err) {
            setError("Failed to submit form. Please try again.");
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const clearForm = () => {
        setFormData({
            email: "adenijiferanmi64@gmail.com",
            matriculation_number: "",
            surname: "",
            firstname: "",
            middlename: "",
            sex: "",
            department: "",
            course_of_study: "",
            year_of_graduation: "",
            class_of_degree: "",
            degree_awarded: "",
            reference_number: "",
            recipient_address: "",
            mode_of_postage: "",
            recipient_email: "",
            remita_rrr: "",
            certificate_file: null,
            payment_receipt_file: null
        });
        setGraduationDate(undefined);
        setError(null);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4 text-lg">Loading form data...</p>
            </div>
        );
    }

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
                        Please fill out the form accurately. Fields marked with <span className="text-red-500">*</span> are required.
                    </CardDescription>
                </CardHeader>
                <CardContent className="sm:pt-6 px-2 sm:px-6">
                    {error && (
                        <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                            <p className="font-semibold">Error:</p>
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="p-4 bg-muted/50 rounded-lg border">
                            <Label htmlFor="email" className="text-sm font-semibold text-foreground/90">
                                Email Address <span className="text-red-500">*</span>
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1 mb-2">
                                This email will be recorded with your response.
                            </p>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="mt-1"
                            />
                        </div>

                        <fieldset className="space-y-6 p-6 border rounded-lg">
                            <legend className="text-xl font-semibold text-foreground/90 px-2 -ml-2">Personal Information</legend>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="matriculation_number" className="font-medium">Matriculation Number</Label>
                                    <Input id="matriculation_number" name="matriculation_number" value={formData.matriculation_number} onChange={handleChange} placeholder="E.g., MAT12345" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="sex" className="font-medium">Sex <span className="text-red-500">*</span></Label>
                                    <Select name="sex" value={formData.sex} onValueChange={(value) => handleSelectChange("sex", value)} required>
                                        <SelectTrigger id="sex" className="w-full bg-background text-sm">
                                            <SelectValue placeholder="Select Sex" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="surname" className="font-medium">Surname (as in Certificate) <span className="text-red-500">*</span></Label>
                                    <Input id="surname" name="surname" value={formData.surname} onChange={handleChange} required placeholder="E.g., Doe" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="firstname" className="font-medium">First Name (as in Certificate) <span className="text-red-500">*</span></Label>
                                    <Input id="firstname" name="firstname" value={formData.firstname} onChange={handleChange} required placeholder="E.g., John" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="middlename" className="font-medium">Middle Name (as in Certificate)</Label>
                                    <Input id="middlename" name="middlename" value={formData.middlename} onChange={handleChange} placeholder="Optional" />
                                </div>
                            </div>
                        </fieldset>

                        <Separator className="my-8" />

                        <fieldset className="space-y-6 p-6 border rounded-lg">
                            <legend className="text-xl font-semibold text-foreground/90 px-2 -ml-2">Academic Information</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="department" className="font-medium">Department <span className="text-red-500">*</span></Label>
                                    <Input id="department" name="department" value={formData.department} onChange={handleChange} required placeholder="E.g., Computer Science" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="course_of_study" className="font-medium">Course of Study <span className="text-red-500">*</span></Label>
                                    <Input id="course_of_study" name="course_of_study" value={formData.course_of_study} onChange={handleChange} required placeholder="E.g., B.Sc. Computer Science" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="year_of_graduation_trigger" className="font-medium">Year of Graduation <span className="text-red-500">*</span></Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                id="year_of_graduation_trigger"
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal bg-background text-sm",
                                                    !graduationDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {graduationDate ? graduationDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={graduationDate}
                                                onSelect={(date) => {
                                                    setGraduationDate(date);
                                                    if (date) {
                                                        setFormData(prevData => ({
                                                            ...prevData,
                                                            year_of_graduation: date.toLocaleDateString('en-GB')
                                                        }));
                                                    } else {
                                                        setFormData(prevData => ({
                                                            ...prevData,
                                                            year_of_graduation: ""
                                                        }));
                                                    }
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>

                                    <input
                                        type="hidden"
                                        name="year_of_graduation"
                                        value={formData.year_of_graduation}
                                        required={!graduationDate}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="class_of_degree" className="font-medium">Class of Degree <span className="text-red-500">*</span></Label>
                                    <Select name="class_of_degree" value={formData.class_of_degree} onValueChange={(value) => handleSelectChange("class_of_degree", value)} required>
                                        <SelectTrigger id="class_of_degree" className="w-full bg-background text-sm">
                                            <SelectValue placeholder="Select Class" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="First Class">First Class</SelectItem>
                                            <SelectItem value="Second Class Upper">Second Class Upper</SelectItem>
                                            <SelectItem value="Second Class Lower">Second Class Lower</SelectItem>
                                            <SelectItem value="Third Class">Third Class</SelectItem>
                                            <SelectItem value="Pass">Pass</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="md:col-span-2 space-y-1.5">
                                    <Label htmlFor="degree_awarded" className="font-medium">Degree Awarded <span className="text-red-500">*</span></Label>
                                    <Input id="degree_awarded" name="degree_awarded" value={formData.degree_awarded} onChange={handleChange} required placeholder="E.g., Bachelor of Science" />
                                </div>
                            </div>
                        </fieldset>

                        <Separator className="my-8" />

                        <fieldset className="space-y-6 p-6 border rounded-lg">
                            <legend className="text-xl font-semibold text-foreground/90 px-2 -ml-2">Recipient & Postage</legend>
                            <div className="space-y-1.5">
                                <Label htmlFor="reference_number" className="font-medium">Reference Number (if applicable)</Label>
                                <Input id="reference_number" name="reference_number" value={formData.reference_number} onChange={handleChange} placeholder="Optional" />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="recipient_address" className="font-medium">Recipient Address <span className="text-red-500">*</span></Label>
                                <textarea id="recipient_address" name="recipient_address" value={formData.recipient_address} onChange={handleChange} required rows={3} className="w-full border rounded-md p-2 focus:ring-ring focus:border-ring text-sm bg-background" placeholder="Detailed address please..."></textarea>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="font-medium">Mode of Postage <span className="text-red-500">*</span></Label>
                                <RadioGroup
                                    name="mode_of_postage"
                                    value={formData.mode_of_postage}
                                    onValueChange={(value) => handleSelectChange("mode_of_postage", value)}
                                    className="mt-2 space-y-2"
                                    required
                                >
                                    {["EMAIL", "HAND COLLECTION"].map(mode => (
                                        <div key={mode} className="flex items-center">
                                            <RadioGroupItem value={mode} id={`mode_${mode.toLowerCase().replace(/\s+/g, '_')}`} />
                                            <Label htmlFor={`mode_${mode.toLowerCase().replace(/\s+/g, '_')}`} className="ml-2 text-sm font-normal text-foreground/90 cursor-pointer">
                                                {mode.charAt(0) + mode.slice(1).toLowerCase()}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="recipient_email" className="font-medium">Recipient Email Address <span className="text-red-500">*</span></Label>
                                <Input id="recipient_email" type="email" name="recipient_email" value={formData.recipient_email} onChange={handleChange} required placeholder="E.g., recipient@example.com" />
                            </div>
                        </fieldset>

                        <Separator className="my-8" />

                        <fieldset className="space-y-6 p-6 border rounded-lg">
                            <legend className="text-xl font-semibold text-foreground/90 px-2 -ml-2">Payment & Uploads</legend>
                            <div className="space-y-1.5">
                                <Label htmlFor="remita_rrr" className="font-medium">REMITA Payment Receipt RRR Number <span className="text-red-500">*</span></Label>
                                <Input id="remita_rrr" name="remita_rrr" value={formData.remita_rrr} onChange={handleChange} required placeholder="Enter RRR number" />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="certificate_file" className="font-medium">Certificate Upload (Original Scanned PDF) <span className="text-red-500">*</span></Label>
                                <p className="text-xs text-muted-foreground mt-0.5 mb-1.5">Max 10MB, PDF only.</p>
                                <Input id="certificate_file" type="file" name="certificate_file" accept=".pdf" onChange={handleFileChange} required className="block w-full text-sm text-slate-500 file:px-4 file:rounded-sm p-1 file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer" />
                                {formData.certificate_file && <p className="text-xs text-muted-foreground mt-1.5">Selected: {formData.certificate_file.name}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="payment_receipt_file" className="font-medium">Payment Receipt Upload (PDF) <span className="text-red-500">*</span></Label>
                                <p className="text-xs text-muted-foreground mt-0.5 mb-1.5">Max 10MB, PDF only.</p>
                                <Input id="payment_receipt_file" type="file" name="payment_receipt_file" accept=".pdf" onChange={handleFileChange} required className="block w-full text-sm text-slate-500 file:px-4 file:rounded-sm p-1 file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer" />
                                {formData.payment_receipt_file && <p className="text-xs text-muted-foreground mt-1.5">Selected: {formData.payment_receipt_file.name}</p>}
                            </div>
                        </fieldset>

                        <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-8 border-t mt-10">
                            <Button type="button" variant="outline" onClick={clearForm} className="w-full sm:w-auto">
                                Clear Form
                            </Button>
                            <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                                {submitting ? (
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