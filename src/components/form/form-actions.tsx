"use client";

import { Button } from "@/components/ui/button";
import { Loader2, RotateCcw, Send } from "lucide-react";

interface FormActionsProps {
    isPending: boolean;
    onClearForm: () => void;
    formProgress: {
        email: boolean;
        personal: boolean;
        academic: boolean;
        postage: boolean;
        payment: boolean;
    };
}

export const FormActions = ({ isPending, onClearForm, formProgress }: FormActionsProps) => {
    const completedSections = Object.values(formProgress).filter(Boolean).length;
    const totalSections = Object.keys(formProgress).length;
    const isFormComplete = completedSections === totalSections;
    return (
        <div className="relative mt-8">
            {/* Creative separator line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-border/40"></div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background px-4">
                <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-primary/60"></div>
                    <div className="w-2 h-2 rounded-full bg-primary/40"></div>
                    <div className="w-2 h-2 rounded-full bg-primary/20"></div>
                </div>
            </div>
            
            {/* Action buttons */}
            <div className="pt-8">
                <div className="flex flex-col sm:flex-row justify-end items-center gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClearForm}
                        className="w-full sm:w-auto h-12 px-6 text-base font-semibold border-2 border-border/60 hover:border-primary/40 hover:bg-muted/50 transition-all duration-200 group"
                        disabled={isPending}
                    >
                        <RotateCcw className="mr-2 h-5 w-5 group-hover:rotate-180 transition-transform duration-300" />
                        Clear Form
                    </Button>
                    
                    <Button 
                        type="submit" 
                        disabled={isPending || !isFormComplete} 
                        className={`w-full sm:w-auto h-12 px-8 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 group ${
                            isFormComplete 
                                ? 'bg-primary hover:bg-primary/90' 
                                : 'bg-muted text-muted-foreground cursor-not-allowed'
                        }`}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Submitting Application...
                            </>
                        ) : (
                            <>
                                <Send className={`mr-2 h-5 w-5 transition-transform duration-200 ${
                                    isFormComplete ? 'group-hover:translate-x-1' : ''
                                }`} />
                                {isFormComplete ? 'Submit Application' : `Complete All Sections (${completedSections}/${totalSections})`}
                            </>
                        )}
                    </Button>
                </div>
                
                {/* Progress indicator */}
                <div className="mt-6 flex justify-center">
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <div className={`w-1 h-1 rounded-full transition-colors duration-300 ${
                            isFormComplete ? 'bg-primary' : 'bg-muted-foreground/40'
                        }`}></div>
                        <span className={`transition-colors duration-300 ${
                            isFormComplete ? 'text-primary font-medium' : ''
                        }`}>
                            {isFormComplete ? 'Ready to submit!' : `${completedSections}/${totalSections} sections completed`}
                        </span>
                        <div className={`w-1 h-1 rounded-full transition-colors duration-300 ${
                            isFormComplete ? 'bg-primary' : 'bg-muted-foreground/40'
                        }`}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
