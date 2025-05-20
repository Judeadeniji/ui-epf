import { client } from "@/server/client";
import { ActionFunction } from "react-router";

export const SingleApplicationAction: ActionFunction = async ({ params, request, context }) => {
    const id = params.id;
    if (!id) {
        console.error("Missing application ID");
        return { status: false, error: "Missing application ID" };
    }

    const formData = await request.formData();

 
    const res = await client.api.v1.applications[":id"].$post({
        param: {
            id,
        },
    }, {
        fetch: (input: RequestInfo | URL, requestInit: RequestInit | undefined) => {
             return globalThis.fetch(input, {
                ...(requestInit || {}),
                method: "POST",
                body: formData,
            })
        },
    })

    if (res.ok) {
        return await res.json();
    } else {
        return { status: false, error: "Failed to perform action" };
    }
}