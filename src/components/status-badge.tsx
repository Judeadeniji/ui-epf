"use client"

import { cn } from "@/lib/utils";

interface StatusBadgeProps {
    status: 'active' | 'banned' | 'verified' | 'pending';
    children: React.ReactNode;
    className?: string;
}

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'active':
                return "bg-green-100 text-green-800";
            case 'banned':
                return "bg-red-100 text-red-800";
            case 'verified':
                return "bg-blue-100 text-blue-800";
            case 'pending':
                return "bg-yellow-100 text-yellow-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <span
            className={cn(
                "px-2 py-1 text-xs font-semibold rounded-full",
                getStatusStyles(status),
                className
            )}
        >
            {children}
        </span>
    );
}
