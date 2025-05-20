import { client } from "@/server/client";
import { LoaderFunction } from "react-router";


export const dashboardLoader = (async () => {
   const values = await Promise.allSettled([
        client.api.v1.applications.stats.$get().then(async (res) => {
            if (res.ok) {
                return await res.json();
            } else {
                return { status: false, error: "Failed to fetch stats" };
            }
        }),
        client.api.v1.applications.$get().then(async (res) => {
            if (res.ok) {
                return await res.json();
            } else {
                return { status: false, error: "Failed to fetch applications" };
            }
        }),
    ]);

    const stats = values[0].status === "fulfilled" 
        ? values[0].value
     : { status: false, error: "Failed to fetch stats" };
    const applications = values[1].status === "fulfilled"
        ? values[1].value
        : { status: false, error: "Failed to fetch applications" };
    return {
        stats,
        applications,
    };
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