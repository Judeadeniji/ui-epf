import { authClient } from "@/lib/auth-client";
import { client } from "@/server/client";
import { LoaderFunction } from "react-router";
import { toast } from "sonner";


export const dashboardLoader = (async () => {
    const values = await Promise.allSettled([
        client.api.v1.applications.stats.$get().then(async (res) => {
            if (res.ok) {
                return await res.json();
            } else {
                return { status: false, error: "Failed to fetch stats" };
            }
        }),
        client.api.v1.applications.$get({
            query: {
                page: "1",
                pageSize: "10",
            }
        }).then(async (res) => {
            if (res.ok) {
                return await res.json();
            } else {
                return { status: false, error: "Failed to fetch applications" };
            }
        }),
        authClient.admin.listUsers({
            query: {
                limit: "10",
                offset: "0",
            }
        }).then((response) => {
            if (response.error === null) {
                return {
                    status: true as const,
                    data: response.data.users,
                    meta: {
                        total: response.data.total,
                        limit: 10,
                        offset: 0
                    }
                };
            }
            return {
                status: false as const,
                error: response.error.message || "Failed to fetch users",
                data: [],
                meta: { total: 0, limit: 10, offset: 0 }
            };
        }).catch((e) => {
            return {
                status: false as const,
                error: e instanceof Error ? e.message : "An unexpected error occurred",
                data: [],
                meta: { total: 0, limit: 10, offset: 0 }
            };
        }),
    ]);

    const stats = values[0].status === "fulfilled"
        ? values[0].value
        : { status: false, error: "Failed to fetch stats" };
    const applications = values[1].status === "fulfilled"
        ? values[1].value
        : { status: false, error: "Failed to fetch applications" };
    const users = values[2].status === "fulfilled"
        ? values[2].value
        : { status: false, error: "Failed to fetch users" };
    return {
        stats,
        applications,
        users,
    };
}) satisfies LoaderFunction;

export const applicationsLoader = (async ({ request }) => {
    const url = new URL(request.url);
    const page = url.searchParams.get("page") || "1";
    const filtersParam = url.searchParams.get("filters");
    let filters = [];
    if (filtersParam) {
        try {
            filters = JSON.parse(filtersParam);
        } catch (e) {
            console.error("Failed to parse filters from URL:", e);
        }
    }

    const res = await client.api.v1.applications.$get({
        query: {
            page,
            filters: filters.length > 0 ? JSON.stringify(filters) : undefined,
        },
    });

    if (res.ok) {
        return await res.json();
    } else {
        return {
            status: false as const,
            error: "Failed to fetch applications"
        };
    }
}) satisfies LoaderFunction;

export const singleApplicationLoader = (async ({ params }) => {
    const id = params.id;
    if (!id) {
        return { status: false, error: "Missing application ID" };
    }

    const res = await client.api.v1.applications[":id"].$get({
        param: {
            id,
        },
    })
    if (res.ok) {
        return await res.json();
    } else {
        return { status: false, error: "Failed to fetch application" };
    }
}) satisfies LoaderFunction;

export const allUsersLoader = (async ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = 20;
    const offset = (page - 1) * limit;

    const searchValue = url.searchParams.get("search") || undefined; // Use undefined if not present
    const filterField = url.searchParams.get("filterField") || undefined;
    const filterValue = url.searchParams.get("filterValue") || undefined;
    const sortBy = url.searchParams.get("sortBy") || undefined;
    const sortDirection = (url.searchParams.get("sortDirection") || undefined) as "asc" | "desc" | undefined;
    const allowedSearchFields = ["name", "email"] as const;
    const rawSearchField = url.searchParams.get("searchField");
    const searchField = allowedSearchFields.includes(rawSearchField as any) ? rawSearchField as "name" | "email" : undefined;
    const allowedFilterOperators = ["eq", "ne", "gt", "lt", "gte", "lte"] as const;
    const rawFilterOperator = url.searchParams.get("filterOperator");
    const filterOperator = allowedFilterOperators.includes(rawFilterOperator as any)
        ? (rawFilterOperator as typeof allowedFilterOperators[number])
        : undefined;
    const rawSearchOperator = url.searchParams.get("searchOperator") as "eq" | "ne" | "gt" | "lt" | "gte" | "lte" | "contains" | "startsWith" | "endsWith" | undefined;
    const searchOperator: "contains" | "starts_with" | "ends_with" | undefined =
        rawSearchOperator === "contains"
            ? "contains"
            : rawSearchOperator === "startsWith"
            ? "starts_with"
            : rawSearchOperator === "endsWith"
            ? "ends_with"
            : undefined;

    try {
        const response = await authClient.admin.listUsers({
            fetchOptions: {
                headers: request.headers
            },
            query: {
                filterField: filterField,
                filterValue: filterValue,
                limit: String(limit),
                searchField: searchField, 
                offset: String(offset),
                searchOperator: searchOperator,
                searchValue: searchValue,
                sortBy: sortBy,
                sortDirection: sortDirection,
                filterOperator: filterOperator,
            }
        });

        if (response.error === null) {
            return {
                status: true as const,
                data: response.data.users,
                meta: {
                    total: response.data.total,
                    limit: limit,
                    offset: offset
                }
            };
        }        return {
            status: false as const,
            error: response.error.message || "Failed to fetch users",
            data: [],
            meta: { total: 0, limit, offset: offset }
        };

    } catch (e) {
        return {
            status: false as const,
            error: e instanceof Error ? e.message : "An unexpected error occurred",
            data: [],
            meta: { total: 0, limit, offset: offset }
        };
    }
}) satisfies LoaderFunction;

export const singleOfficerLoader = (async ({ params }) => {
    const id = params.id;
    if (!id) {
        return { status: false, error: "Missing officer ID" };
    }

    try {
        const response = await client.api.v1.users[":userId"].$get({
            param: {
                userId: id,
            },
        });

        if (!response.ok) {
            const data = await response.json();
            toast.error("Failed to fetch officer details", {
                description: data.error || "An unexpected error occurred",
            });
            return data
        }

        const data = await response.json();
        return data;
    } catch (e) {
        return {
            status: false as const,
            error: e instanceof Error ? e.message : "An unexpected error occurred",
        };
    }
}) satisfies LoaderFunction;