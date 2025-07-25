"use client"

import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    offset: number;
    onPageChange: (page: number) => void;
    disabled?: boolean;
}

export function PaginationControls({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    offset,
    onPageChange,
    disabled = false
}: PaginationControlsProps) {
    const startItem = offset + 1;
    const endItem = Math.min(offset + itemsPerPage, totalItems);

    return (
        <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-muted-foreground">
                Showing {startItem} to {endItem} of {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </div>
            <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={disabled || currentPage === 1}
                >
                    Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages || 1}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={disabled || currentPage >= totalPages}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
