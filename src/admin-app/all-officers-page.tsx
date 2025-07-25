import { useLoaderData, useSearchParams } from "react-router";
import { allUsersLoader } from "./loaders";
import { AddUserDialog } from "@/components/add-user-dialog";
import { UserTable } from "@/components/user-table";
import { PaginationControls } from "@/components/pagination-controls";
import { EmptyState } from "@/components/empty-state";
import { SearchInput } from "@/components/search-input";
import { User } from "@/lib/types";

export default function AllUsersPage() {
    const loaderData = useLoaderData<typeof allUsersLoader>();
    const [searchParams, setSearchParams] = useSearchParams();

    // Handle both success and error states from the loader
    const users = (loaderData.status ? loaderData.data : []) as User[];
    const meta = loaderData.status ? loaderData.meta : { total: 0, limit: 20, offset: 0 };
    const error = loaderData.status ? null : loaderData.error;

    const currentPage = Math.floor(meta.offset / meta.limit) + 1;
    const totalPages = Math.ceil(meta.total / meta.limit);

    const updateUrlParams = (newValues: Record<string, string | null>) => {
        const currentSearchParams = new URLSearchParams(searchParams);
        for (const key in newValues) {
            if (newValues[key] === null || newValues[key] === '') {
                currentSearchParams.delete(key);
            } else {
                currentSearchParams.set(key, newValues[key] as string);
            }
        }
        // Reset to page 1 when searching
        if (newValues.search !== undefined) {
            currentSearchParams.set("page", "1");
        }
        setSearchParams(currentSearchParams, { replace: true });
    };
    
    const handleSearchChange = (value: string) => {
        updateUrlParams({ search: value });
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            updateUrlParams({ page: newPage.toString() });
        }
    };

    return (
    <div className="p-4 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary">All Users</h1>
                    <p className="text-muted-foreground">View and manage all users in the system.</p>
                </div>
                <AddUserDialog />
            </div>

            <div className="flex items-center justify-between">
                <SearchInput
                    placeholder="Search users by name or email..."
                    value={searchParams.get("search") || ''}
                    onSearchChange={handleSearchChange}
                />
                {/* Future: Add more filter options here if needed, e.g., a Dropdown for status */}
            </div>

            {error && (
                <div className="text-center py-4 border rounded-md bg-red-50 dark:bg-red-900/20">
                    <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}

            {users.length > 0 ? (
                <>
                    <UserTable 
                        users={users}
                        className="rounded-md border"
                    />
                    <PaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={meta.total}
                        itemsPerPage={meta.limit}
                        offset={meta.offset}
                        onPageChange={handlePageChange}
                    />
                </>
            ) : (
                <EmptyState
                    title="No users found"
                    description="Get started by adding a new user."
                    action={
                        <AddUserDialog />
                    }
                />
            )}
        </div>
    );
}