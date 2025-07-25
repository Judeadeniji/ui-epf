"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";

interface EmailSectionProps {
    getFieldError: (field: string) => string | undefined;
}

export const EmailSection = ({ getFieldError }: EmailSectionProps) => {
    return (
        <div className="relative p-6 bg-muted/30 rounded-xl border border-border/60 shadow-sm">
            {/* Section Icon */}
            <div className="absolute -top-4 left-6 bg-primary text-primary-foreground p-2 rounded-lg shadow-md">
                <Mail className="h-5 w-5" />
            </div>
            
            <div className="pt-4">
                <Label
                    htmlFor="email"
                    className="text-base font-semibold text-foreground flex items-center gap-2"
                >
                    Email Address <span className="text-red-500 text-lg">*</span>
                </Label>
                <p className="text-sm text-muted-foreground mt-2 mb-4 bg-muted/50 p-3 rounded-lg border-l-4 border-primary/40">
                    📧 This email will be recorded with your response and used for communication.
                </p>
                <div className="relative">
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        required
                        className="mt-1 border-border/60 bg-background text-foreground h-12 text-base pl-4 pr-4 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                        placeholder="Enter your email address"
                        defaultValue=""
                    />
                </div>
                {getFieldError("email") && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm font-medium">
                            ⚠️ {getFieldError("email")}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
