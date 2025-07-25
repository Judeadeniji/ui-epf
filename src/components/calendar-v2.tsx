// components/ui/calendar-v2.tsx
"use client";

import { cn } from "@/lib/utils";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import React from "react";
import { Calendar } from "./ui/calendar";
import { ScrollArea } from "./ui/scroll-area";


// Helper function to generate years
const getYears = (startYear: number, endYear: number) => {
  const years = [];
  for (let i = startYear; i <= endYear; i++) {
    years.push(i);
  }
  return years;
};

// Helper function to generate months
const getMonths = () => [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Define the props for CalendarV2, explicitly extending shadcn/ui's Calendar props
export type CalendarV2Props = React.ComponentProps<typeof Calendar> & {
  selectedDate?: Date | null;
  onDateChange: (date: Date | null) => void;
  minYear?: number; // Optional: define min year for dropdown
  maxYear?: number; // Optional: define max year for dropdown
};

function CalendarV2({
  className,
  classNames, // Pass classNames through to the base Calendar
  selectedDate, // Prop to pass in the currently selected date (from RHF field.value)
  onDateChange, // Callback when a new date is selected
  minYear,
  maxYear,
  ...props
}: CalendarV2Props) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const startYear = minYear ?? currentYear - 100;
  const endYear = maxYear ?? currentYear;

  // Internal state for controlling the custom month and year dropdowns
  const [selectedMonthIndex, setSelectedMonthIndex] = React.useState<number>(
    selectedDate ? selectedDate.getMonth() : today.getMonth()
  );
  const [selectedYear, setSelectedYear] = React.useState<number>(
    selectedDate ? selectedDate.getFullYear() : today.getFullYear()
  );

  // Sync internal dropdown states when selectedDate prop changes
  React.useEffect(() => {
    if (selectedDate) {
      setSelectedMonthIndex(selectedDate.getMonth());
      setSelectedYear(selectedDate.getFullYear());
    } else {
      // If no date is selected, revert to current month/year for dropdowns
      setSelectedMonthIndex(today.getMonth());
      setSelectedYear(today.getFullYear());
    }
  }, [selectedDate, today]);

  // This Date object controls what month the shadcn/ui Calendar displays
  const displayedMonth = React.useMemo(() => {
    // If a date is already selected, start the calendar on that month/year
    if (selectedDate) {
      return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    }
    // Otherwise, use the custom selected month/year from our dropdowns
    return new Date(selectedYear, selectedMonthIndex, 1);
  }, [selectedYear, selectedMonthIndex, selectedDate]);

  const years = getYears(startYear, endYear);
  const months = getMonths();

  return (
    <div className={cn("p-3", className)}>
      {/* Custom Month and Year Selectors */}
      <div className="flex justify-center p-2 space-x-2">
        <Select
          value={String(selectedMonthIndex)}
          onValueChange={(value) => {
            const newMonthIndex = parseInt(value, 10);
            setSelectedMonthIndex(newMonthIndex);
            // If there's an existing date, update its month and trigger onDateChange
            if (selectedDate) {
              const newDate = new Date(selectedDate.getFullYear(), newMonthIndex, selectedDate.getDate());
              onDateChange(newDate);
            }
          }}
        >
          <SelectTrigger className="w-full flex-1">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent className="w-full flex-1">
            {months.map((month, index) => (
              <SelectItem key={month} value={String(index)}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={String(selectedYear)}
          onValueChange={(value) => {
            const newYear = parseInt(value, 10);
            setSelectedYear(newYear);
            // If there's an existing date, update its year and trigger onDateChange
            if (selectedDate) {
              const newDate = new Date(newYear, selectedDate.getMonth(), selectedDate.getDate());
              onDateChange(newDate);
            }
          }}
        >
          <SelectTrigger className="w-full flex-1">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-[15rem]">
              {years.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>
      </div>

      {/* The actual shadcn/ui Calendar component */}
      <Calendar
        {...props}
        mode="single"
        // Control the displayed month of the shadcn/ui Calendar
        month={displayedMonth}
        onMonthChange={(newMonth) => {
          setSelectedMonthIndex(newMonth.getMonth());
          setSelectedYear(newMonth.getFullYear());
        }}
        selected={selectedDate || undefined} 
        disableNavigation
        // @ts-ignore
        onSelect={(date: Date) => {
          // If a date is selected, update the selectedDate prop
          if (date) {
            onDateChange(date);
          } else {
            // If no date is selected, clear the selection
            onDateChange(null);
          }
        }}
        toYear={endYear}
        fromYear={startYear}
      />
    </div>
  );
}

CalendarV2.displayName = "CalendarV2";

export { CalendarV2 };