import { clsx, type ClassValue } from "clsx"
import { ClientRequest } from "hono/client"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type InferApiResponse<T, M extends "get" | "post" = "get"> = T extends ClientRequest<infer R> ?
  R extends { $get: infer G } | { $post: infer G }?
  G extends {
    output: infer O
  } ?
  O
  : never
  : never
  : never

  export interface FormDataState {
    email: string;
    matriculation_number: string;
    surname: string;
    firstname: string;
    middlename: string;
    sex: "male" | "female";
    department: string;
    course_of_study: string;
    year_of_graduation: string;
    class_of_degree: string;
    degree_awarded: string;
    reference_number: string;
    recipient_address: string;
    mode_of_postage: string;
    recipient_email: string;
    remita_rrr: string;
    certificate_file: File;
    payment_receipt_file: File;
}


