"use client";

import Image from "next/image";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";

interface FormHeaderProps {
    children: React.ReactNode;
    formProgress: {
        email: boolean;
        personal: boolean;
        academic: boolean;
        postage: boolean;
        payment: boolean;
    };
}

export const FormHeader = ({ children, formProgress }: FormHeaderProps) => {
    const progressSteps = [
        { key: 'email', label: 'Email' },
        { key: 'personal', label: 'Personal' },
        { key: 'academic', label: 'Academic' },
        { key: 'postage', label: 'Postage' },
        { key: 'payment', label: 'Payment' }
    ];

    const completedSteps = Object.values(formProgress).filter(Boolean).length;
    const totalSteps = progressSteps.length;
    const progressPercentage = (completedSteps / totalSteps) * 100;
    return (
        <div className="w-full max-w-4xl">
            {/* Header Card with Creative Design */}
            <Card className="mb-6 shadow-xl bg-card text-card-foreground border-2 border-primary/20 relative overflow-hidden">
                {/* Decorative Corner Elements */}
                <div className="absolute top-0 left-0 w-20 h-20 border-l-4 border-t-4 border-primary/30"></div>
                <div className="absolute top-0 right-0 w-20 h-20 border-r-4 border-t-4 border-primary/30"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 border-l-4 border-b-4 border-primary/30"></div>
                <div className="absolute bottom-0 right-0 w-20 h-20 border-r-4 border-b-4 border-primary/30"></div>
                
                <CardHeader className="text-center py-8 px-8 relative">
                    {/* Logo with Creative Border */}
                    <div className="flex justify-center mb-6">
                        <div className="relative p-4 border-2 border-dashed border-primary/40 rounded-full">
                            <div className="p-2 bg-primary/5 rounded-full">
                                <Image src="/UI_logo.png" alt="Logo" width={80} height={80} />
                            </div>
                        </div>
                    </div>
                    
                    {/* Title with Creative Typography */}
                    <div className="space-y-3">
                        <CardTitle className="text-4xl font-bold tracking-tight text-foreground relative">
                            <span className="relative z-10">English Proficiency</span>
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-primary/30 rounded-full"></div>
                        </CardTitle>
                        <CardTitle className="text-2xl font-semibold text-primary">
                            Application Form
                        </CardTitle>
                    </div>
                    
                    <CardDescription className="mt-4 text-muted-foreground max-w-2xl mx-auto text-base">
                        Please complete all sections accurately. Required fields are marked with{" "}
                        <span className="text-red-500 font-semibold">*</span>
                    </CardDescription>
                    
                    {/* Progress Indicator */}
                    <div className="mt-6 space-y-3">
                        <div className="flex justify-center space-x-3">
                            {progressSteps.map((step, index) => {
                                const isCompleted = formProgress[step.key as keyof typeof formProgress];
                                return (
                                    <div key={step.key} className="flex flex-col items-center space-y-1">
                                        <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                            isCompleted 
                                                ? 'bg-primary shadow-lg' 
                                                : 'bg-primary/20'
                                        }`}></div>
                                        <span className={`text-xs font-medium transition-all duration-300 ${
                                            isCompleted 
                                                ? 'text-primary' 
                                                : 'text-muted-foreground'
                                        }`}>
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="max-w-md mx-auto">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>Progress</span>
                                <span>{completedSteps}/{totalSteps} sections</span>
                            </div>
                            <div className="w-full bg-primary/10 rounded-full h-2">
                                <div 
                                    className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </Card>
            
            {/* Main Form Content */}
            <Card className="shadow-xl bg-card text-card-foreground border border-border/50">
                <CardContent className="p-8">
                    {children}
                </CardContent>
            </Card>
        </div>
    );
};
