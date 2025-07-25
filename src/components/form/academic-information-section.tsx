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
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, GraduationCap, Building } from "lucide-react";
import { CalendarV2 } from "@/components/calendar-v2";
import { formatDate } from "date-fns";

interface AcademicInformationSectionProps {
    graduationDate: Date | undefined;
    setGraduationDate: (date: Date | undefined) => void;
    handleGraduationDateInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    getFieldError: (field: string) => string | undefined;
}

export const AcademicInformationSection = ({
    graduationDate,
    setGraduationDate,
    handleGraduationDateInputChange,
    getFieldError
}: AcademicInformationSectionProps) => {
    return (
        <div className="relative">
            {/* Creative Section Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center justify-center w-12 h-12 bg-primary text-primary-foreground rounded-xl shadow-lg">
                    <GraduationCap className="h-6 w-6" />
                </div>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">Academic Information</h2>
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
                {/* Department and Faculty Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <Label htmlFor="department" className="text-base font-semibold text-foreground flex items-center gap-2">
                            <Building className="h-4 w-4 text-primary" />
                            Department <span className="text-red-500 text-lg">*</span>
                        </Label>
                        <Input
                            id="department"
                            name="department"
                            required
                            placeholder="E.g., Computer Science"
                            defaultValue=""
                            className="h-12 text-base border-border/60 bg-background rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                        />
                        {getFieldError("department") && (
                            <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-600 text-sm">⚠️ {getFieldError("department")}</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="space-y-3">
                        <Label htmlFor="faculty" className="text-base font-semibold text-foreground flex items-center gap-2">
                            <Building className="h-4 w-4 text-primary" />
                            Faculty <span className="text-red-500 text-lg">*</span>
                        </Label>
                        <Input
                            id="faculty"
                            name="faculty"
                            required
                            placeholder="E.g., Science"
                            defaultValue=""
                            className="h-12 text-base border-border/60 bg-background rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                        />
                        {getFieldError("faculty") && (
                            <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-600 text-sm">⚠️ {getFieldError("faculty")}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Graduation Date and Class of Degree */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Graduation Date Field with Creative Design */}
                    <div className="space-y-3">
                        <Label htmlFor="graduation_date_input" className="text-base font-semibold text-foreground flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-primary" />
                            Year of Graduation <span className="text-red-500 text-lg">*</span>
                        </Label>
                        <div className="relative">
                            <div className="flex items-center gap-2 p-2 bg-background border border-border/60 rounded-lg focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all duration-200">
                                <Input
                                    id="graduation_date_input"
                                    name="year_of_graduation_display"
                                    placeholder="YYYY-MM-DD"
                                    value={graduationDate ? formatDate(graduationDate, "yyyy-MM-dd") : ""}
                                    onChange={handleGraduationDateInputChange}
                                    className="flex-grow border-0 bg-transparent text-base focus:ring-0 focus:outline-none"
                                    type="text"
                                />
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            id="year_of_graduation_trigger_button"
                                            variant="ghost"
                                            className="shrink-0 h-8 w-8 p-0 hover:bg-primary/10"
                                            type="button"
                                        >
                                            <CalendarIcon className="h-4 w-4 text-primary" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 shadow-xl border border-border/60">
                                        <CalendarV2
                                            mode="single"
                                            onDateChange={(date) => setGraduationDate(date ? date : undefined)}
                                            selectedDate={graduationDate}
                                            initialFocus
                                            captionLayout="buttons"
                                            fromYear={1948}
                                            toYear={new Date().getFullYear()}
                                            className="w-full"
                                            pagedNavigation
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                        {getFieldError("year_of_graduation") && (
                            <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-600 text-sm">⚠️ {getFieldError("year_of_graduation")}</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="space-y-3">
                        <Label htmlFor="class_of_degree" className="text-base font-semibold text-foreground flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-primary" />
                            Class of Degree <span className="text-red-500 text-lg">*</span>
                        </Label>
                        <Select name="class_of_degree" required defaultValue="">
                            <SelectTrigger
                                id="class_of_degree"
                                className="h-12 text-base border-border/60 bg-background rounded-lg focus:ring-2 focus:ring-primary/20"
                            >
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
                        {getFieldError("class_of_degree") && (
                            <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-600 text-sm">⚠️ {getFieldError("class_of_degree")}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Degree Awarded - Full Width */}
                <div className="space-y-3">
                    <Label htmlFor="degree_awarded" className="text-base font-semibold text-foreground flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        Degree Awarded <span className="text-red-500 text-lg">*</span>
                    </Label>
                    <Input
                        id="degree_awarded"
                        name="degree_awarded"
                        required
                        placeholder="E.g., Bachelor of Science"
                        defaultValue=""
                        className="h-12 text-base border-border/60 bg-background rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                    />
                    {getFieldError("degree_awarded") && (
                        <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">⚠️ {getFieldError("degree_awarded")}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
