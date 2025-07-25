"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChangeEvent } from "react";
import { CreditCard, Upload, FileText, CheckCircle } from "lucide-react";

interface PaymentUploadsSection {
    certificateFile: File | null;
    paymentReceiptFile: File | null;
    handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
    getFieldError: (field: string) => string | undefined;
}

export const PaymentUploadsSection = ({
    certificateFile,
    paymentReceiptFile,
    handleFileChange,
    getFieldError
}: PaymentUploadsSection) => {
    return (
        <div className="relative">
            {/* Creative Section Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center justify-center w-12 h-12 bg-primary text-primary-foreground rounded-xl shadow-lg">
                    <CreditCard className="h-6 w-6" />
                </div>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">Payment & Uploads</h2>
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
                {/* REMITA RRR Number */}
                <div className="space-y-3">
                    <Label htmlFor="remita_rrr" className="text-base font-semibold text-foreground flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-primary" />
                        REMITA Payment Receipt RRR Number <span className="text-red-500 text-lg">*</span>
                    </Label>
                    <div className="relative">
                        <Input
                            id="remita_rrr"
                            name="remita_rrr"
                            required
                            placeholder="Enter your RRR number"
                            defaultValue=""
                            className="h-12 text-base border-border/60 bg-background rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 pl-12"
                        />
                        <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary/60" />
                    </div>
                    {getFieldError("remita_rrr") && (
                        <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">⚠️ {getFieldError("remita_rrr")}</p>
                        </div>
                    )}
                </div>

                {/* File Upload Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Certificate Upload */}
                    <div className="space-y-3">
                        <Label htmlFor="certificate_file" className="text-base font-semibold text-foreground flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            Certificate Upload <span className="text-red-500 text-lg">*</span>
                        </Label>
                        <div className="relative">
                            <div className={`border-2 border-dashed rounded-xl p-6 transition-all duration-200 ${
                                certificateFile ? 'border-green-300 bg-green-50' : 'border-border/60 hover:border-primary/40 bg-background'
                            }`}>
                                <div className="text-center">
                                    {certificateFile ? (
                                        <div className="flex flex-col items-center space-y-2">
                                            <CheckCircle className="h-8 w-8 text-green-600" />
                                            <p className="text-sm font-medium text-green-700">File Selected</p>
                                            <p className="text-xs text-green-600 break-all">{certificateFile.name}</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center space-y-2">
                                            <Upload className="h-8 w-8 text-primary/60" />
                                            <p className="text-sm font-medium text-foreground">Upload Certificate</p>
                                            <p className="text-xs text-muted-foreground">PDF only, max 1MB</p>
                                        </div>
                                    )}
                                </div>
                                <Input
                                    id="certificate_file"
                                    type="file"
                                    name="certificate_file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    required
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>
                        {getFieldError("certificate_file") && (
                            <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-600 text-sm">⚠️ {getFieldError("certificate_file")}</p>
                            </div>
                        )}
                    </div>

                    {/* Payment Receipt Upload */}
                    <div className="space-y-3">
                        <Label htmlFor="payment_receipt_file" className="text-base font-semibold text-foreground flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            Payment Receipt <span className="text-red-500 text-lg">*</span>
                        </Label>
                        <div className="relative">
                            <div className={`border-2 border-dashed rounded-xl p-6 transition-all duration-200 ${
                                paymentReceiptFile ? 'border-green-300 bg-green-50' : 'border-border/60 hover:border-primary/40 bg-background'
                            }`}>
                                <div className="text-center">
                                    {paymentReceiptFile ? (
                                        <div className="flex flex-col items-center space-y-2">
                                            <CheckCircle className="h-8 w-8 text-green-600" />
                                            <p className="text-sm font-medium text-green-700">File Selected</p>
                                            <p className="text-xs text-green-600 break-all">{paymentReceiptFile.name}</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center space-y-2">
                                            <Upload className="h-8 w-8 text-primary/60" />
                                            <p className="text-sm font-medium text-foreground">Upload Receipt</p>
                                            <p className="text-xs text-muted-foreground">PDF only, max 1MB</p>
                                        </div>
                                    )}
                                </div>
                                <Input
                                    id="payment_receipt_file"
                                    type="file"
                                    name="payment_receipt_file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    required
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>
                        {getFieldError("payment_receipt_file") && (
                            <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-600 text-sm">⚠️ {getFieldError("payment_receipt_file")}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Upload Guidelines */}
                <div className="bg-muted/40 rounded-lg p-4 border border-border/30">
                    <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        Upload Guidelines
                    </h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Files must be in PDF format only</li>
                        <li>• Maximum file size: 1MB per file</li>
                        <li>• Ensure documents are clear and readable</li>
                        <li>• Original scanned copies are preferred</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
