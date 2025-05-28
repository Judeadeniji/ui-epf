"use client"

import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description: string;
    action?: React.ReactNode;
    className?: string;
}

export function EmptyState({
    icon,
    title,
    description,
    action,
    className = "text-center py-10 border rounded-md"
}: EmptyStateProps) {
    const defaultIcon = <PlusCircle className="mx-auto h-12 w-12 text-muted-foreground" />;

    return (
        <div className={className}>
            {icon || defaultIcon}
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                {title}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
                {description}
            </p>
            {action && (
                <div className="mt-6">
                    {action}
                </div>
            )}
        </div>
    );
}
