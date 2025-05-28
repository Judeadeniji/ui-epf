"use client"

import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

interface SearchInputProps {
    placeholder?: string;
    value?: string;
    onSearchChange: (value: string) => void;
    className?: string;
    debounceMs?: number;
}

export function SearchInput({ 
    placeholder = "Search...",
    value: controlledValue,
    onSearchChange,
    className = "max-w-sm",
    debounceMs = 300
}: SearchInputProps) {
    const [internalValue, setInternalValue] = useState(controlledValue || "");

    // Update internal value when controlled value changes
    useEffect(() => {
        if (controlledValue !== undefined) {
            setInternalValue(controlledValue);
        }
    }, [controlledValue]);

    // Debounce the search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            onSearchChange(internalValue);
        }, debounceMs);

        return () => clearTimeout(timeoutId);
    }, [internalValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInternalValue(value);
    };

    return (
        <Input
            placeholder={placeholder}
            value={internalValue}
            onChange={handleChange}
            className={className}
        />
    );
}
