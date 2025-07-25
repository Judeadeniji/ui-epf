"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { User, IdCard } from "lucide-react";

interface PersonalInformationSectionProps {
    getFieldError: (field: string) => string | undefined;
}

export const PersonalInformationSection = ({ getFieldError }: PersonalInformationSectionProps) => {
    return (
        <div className="relative">
            {/* Creative Section Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center justify-center w-12 h-12 bg-primary text-primary-foreground rounded-xl shadow-lg">
                    <User className="h-6 w-6" />
                </div>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">Personal Information</h2>
                    <div className="h-1 bg-primary/30 rounded-full mt-1 w-1/3"></div>
                </div>
                <div className="hidden md:flex space-x-1">
                    <div className="w-3 h-3 rounded-full bg-primary/60"></div>
                    <div className="w-3 h-3 rounded-full bg-primary/40"></div>
                    <div className="w-3 h-3 rounded-full bg-primary/20"></div>
                </div>
            </div>

            {/* Form Content */}
            <div className="bg-muted/20 rounded-xl p-6 border border-border/40 space-y-6">
                {/* Matriculation and Sex Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <Label htmlFor="matriculation_number" className="text-base font-semibold text-foreground flex items-center gap-2">
                            <IdCard className="h-4 w-4 text-primary" />
                            Matriculation Number <span className="text-red-500 text-lg">*</span>
                        </Label>
                        <Input
                            id="matriculation_number"
                            name="matriculation_number"
                            placeholder="E.g., 212xxx"
                            required
                            defaultValue=""
                            className="h-12 text-base border-border/60 bg-background rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                        />
                        {getFieldError("matriculation_number") && (
                            <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-600 text-sm">⚠️ {getFieldError("matriculation_number")}</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="space-y-3">
                        <Label htmlFor="sex" className="text-base font-semibold text-foreground flex items-center gap-2">
                            <User className="h-4 w-4 text-primary" />
                            Sex <span className="text-red-500 text-lg">*</span>
                        </Label>
                        <Select name="sex" required defaultValue="">
                            <SelectTrigger id="sex" className="h-12 text-base border-border/60 bg-background rounded-lg focus:ring-2 focus:ring-primary/20">
                                <SelectValue placeholder="Select Sex" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                            </SelectContent>
                        </Select>
                        {getFieldError("sex") && (
                            <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-600 text-sm">⚠️ {getFieldError("sex")}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Names Section with Creative Divider */}
                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border/40"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-muted/20 text-muted-foreground font-medium">Full Name Details</span>
                    </div>
                </div>

                {/* Names Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                        <Label htmlFor="surname" className="text-base font-semibold text-foreground">
                            Surname (as in Certificate) <span className="text-red-500 text-lg">*</span>
                        </Label>
                        <Input
                            id="surname"
                            name="surname"
                            required
                            placeholder="E.g., Doe"
                            defaultValue=""
                            className="h-12 text-base border-border/60 bg-background rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                        />
                        {getFieldError("surname") && (
                            <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-600 text-sm">⚠️ {getFieldError("surname")}</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="space-y-3">
                        <Label htmlFor="firstname" className="text-base font-semibold text-foreground">
                            First Name (as in Certificate) <span className="text-red-500 text-lg">*</span>
                        </Label>
                        <Input
                            id="firstname"
                            name="firstname"
                            required
                            placeholder="E.g., John"
                            defaultValue=""
                            className="h-12 text-base border-border/60 bg-background rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                        />
                        {getFieldError("firstname") && (
                            <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-600 text-sm">⚠️ {getFieldError("firstname")}</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="space-y-3">
                        <Label htmlFor="middlename" className="text-base font-semibold text-foreground">
                            Middle Name (as in Certificate)
                        </Label>
                        <Input
                            id="middlename"
                            name="middlename"
                            placeholder="Optional"
                            defaultValue=""
                            className="h-12 text-base border-border/60 bg-background rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                        />
                        {getFieldError("middlename") && (
                            <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-600 text-sm">⚠️ {getFieldError("middlename")}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
