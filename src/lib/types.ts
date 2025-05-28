import { type authClient } from "./auth-client";

export type Session = typeof authClient.$Infer.Session.session
export type User = typeof authClient.$Infer.Session.user


export type ApplicationFilter = {
  field: string;
  value: string;
  operator?: string; // e.g., 'is', 'contains', 'is_any_of'
};