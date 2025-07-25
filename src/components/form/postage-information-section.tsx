"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MapPin, Mail, Truck, Hand } from "lucide-react";

type ModeOfPostageType = "email" | "hand_collection" | "delivery";

interface PostageInformationSectionProps {
    modeOfPostage: ModeOfPostageType;
    setModeOfPostage: (mode: ModeOfPostageType) => void;
    getFieldError: (field: string) => string | undefined;
}

export const PostageInformationSection = ({
    modeOfPostage,
    setModeOfPostage,
    getFieldError
}: PostageInformationSectionProps) => {
    return (
        <div className="relative">
            {/* Creative Section Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center justify-center w-12 h-12 bg-primary text-primary-foreground rounded-xl shadow-lg">
                    <MapPin className="h-6 w-6" />
                </div>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">Recipient & Postage</h2>
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
                {/* Reference Number */}
                <div className="space-y-3">
                    <Label htmlFor="reference_number" className="text-base font-semibold text-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        Reference Number (if applicable)
                    </Label>
                    <Input
                        id="reference_number"
                        name="reference_number"
                        placeholder="Optional reference number"
                        defaultValue=""
                        className="h-12 text-base border-border/60 bg-background rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                    />
                    {getFieldError("reference_number") && (
                        <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">⚠️ {getFieldError("reference_number")}</p>
                        </div>
                    )}
                </div>

                {/* Postage Address */}
                <div className="space-y-3">
                    <Label htmlFor="postage_address" className="text-base font-semibold text-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        Postage Address{" "}
                        {modeOfPostage === "delivery" && (
                            <span className="text-red-500 text-lg">*</span>
                        )}
                    </Label>
                    <div className="relative">
                        <textarea
                            id="postage_address"
                            name="postage_address"
                            required={modeOfPostage === "delivery"}
                            rows={4}
                            className="w-full border border-border/60 rounded-lg p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary text-base bg-background transition-all duration-200 resize-none"
                            placeholder="Enter detailed address..."
                            defaultValue=""
                        ></textarea>
                        <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                            {modeOfPostage === "delivery" ? "Required for delivery" : "Optional"}
                        </div>
                    </div>
                    {getFieldError("postage_address") && (
                        <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">⚠️ {getFieldError("postage_address")}</p>
                        </div>
                    )}
                </div>

                {/* Mode of Postage with Creative Cards */}
                <div className="space-y-4">
                    <Label className="text-base font-semibold text-foreground flex items-center gap-2">
                        <Truck className="h-4 w-4 text-primary" />
                        Mode of Postage <span className="text-red-500 text-lg">*</span>
                    </Label>
                    
                    <RadioGroup
                        name="mode_of_postage"
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                        required
                        value={modeOfPostage}
                        onValueChange={(value) =>
                            setModeOfPostage(value as ModeOfPostageType)
                        }
                    >
                        {[
                            { 
                                label: "Email", 
                                value: "email", 
                                icon: Mail, 
                                description: "Digital delivery via email",
                                color: "border-blue-200 bg-blue-50"
                            },
                            { 
                                label: "Hand Collection", 
                                value: "hand_collection", 
                                icon: Hand, 
                                description: "Pick up in person",
                                color: "border-green-200 bg-green-50"
                            },
                            { 
                                label: "Delivery", 
                                value: "delivery", 
                                icon: Truck, 
                                description: "Physical delivery to address",
                                color: "border-orange-200 bg-orange-50"
                            },
                        ].map((mode) => {
                            const IconComponent = mode.icon;
                            const isSelected = modeOfPostage === mode.value;
                            return (
                                <div
                                    key={mode.value}
                                    className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                                        isSelected 
                                            ? 'border-primary bg-primary/5 shadow-md' 
                                            : `${mode.color} hover:shadow-sm`
                                    }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <RadioGroupItem
                                            value={mode.value}
                                            id={`mode_${mode.value}`}
                                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                        />
                                        <div className="flex-1">
                                            <Label
                                                htmlFor={`mode_${mode.value}`}
                                                className="flex items-center gap-2 text-base font-semibold text-foreground cursor-pointer"
                                            >
                                                <IconComponent className="h-5 w-5 text-primary" />
                                                {mode.label}
                                            </Label>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {mode.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </RadioGroup>
                    
                    {getFieldError("mode_of_postage") && (
                        <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">⚠️ {getFieldError("mode_of_postage")}</p>
                        </div>
                    )}
                </div>

                {/* Conditional Recipient Email */}
                {modeOfPostage === "email" && (
                    <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <Label htmlFor="recipient_email" className="text-base font-semibold text-foreground flex items-center gap-2">
                            <Mail className="h-4 w-4 text-blue-600" />
                            Recipient Email Address <span className="text-red-500 text-lg">*</span>
                        </Label>
                        <Input
                            id="recipient_email"
                            type="email"
                            name="recipient_email"
                            required={modeOfPostage === "email"}
                            placeholder="Enter recipient's email address"
                            defaultValue=""
                            className="h-12 text-base border-border/60 bg-background rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                        />
                        {getFieldError("recipient_email") && (
                            <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-600 text-sm">⚠️ {getFieldError("recipient_email")}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
