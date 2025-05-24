import { type authClient } from "./auth-client";

export type Session = typeof authClient.$Infer.Session.session
export type User = typeof authClient.$Infer.Session.user