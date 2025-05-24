import { createAccessControl, Statements } from "better-auth/plugins/access"

const statements = {
    applications: ["approve", "decline", "view", "re-view"],
} satisfies Statements;

export const accessControl = createAccessControl(statements);

export const officer = accessControl.newRole({
    applications: ["approve", "decline", "view"]
});

export const admin = accessControl.newRole({
    applications: ["approve", "decline", "view", "re-view"]
});

