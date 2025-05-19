import { PropsWithChildren } from "react";

export default function AdminLayout({ children }: PropsWithChildren) {
    return (
       <main>
        {children}
       </main>
    );
}