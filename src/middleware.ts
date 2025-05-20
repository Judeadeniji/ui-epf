import { betterFetch } from "@better-fetch/fetch";
import type { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
 
type Session = typeof auth.$Infer.Session;
 
export async function middleware(request: NextRequest) {
	const { data: session } = await betterFetch<Session>("/api/auth/get-session", {
		baseURL: request.nextUrl.origin,
		headers: request.headers,
	});
 
	if (!session) {
		return NextResponse.redirect(new URL("/auth", request.url));
	}
 
	return NextResponse.next();
}
 
export const config = {
	matcher: ["/dashboard"],
};