import { createAccessControl } from "better-auth/plugins/access";
import {
  defaultStatements,
  adminAc,
  userAc,
} from "better-auth/plugins/admin/access";

export const allPermissions = [
  "create",
  "read",
  "update",
  "delete",
  "cancel",
  "view",
  "ban",
  "get",
  "list",
  "set-role",
  "generate",
] as const;

// 1. Define all resources and their possible actions in your system
const statements = {
  ...defaultStatements,
  order: ["create", "read", "update", "delete", "cancel"],
  category: ["create", "read", "update", "delete"],
  menu: ["create", "read", "update", "delete", "generate"],
  table: ["create", "read", "update", "delete"],
  reservation: ["create", "read", "update", "delete"],
  kds: ["view", "update_status"], // Kitchen Display System
  report: ["view"], // Analytics & Financials
} as const;

export const ac = createAccessControl(statements);


// 2. Create your Custom Roles
// Admin Role
export const ADMIN = ac.newRole({
  ...adminAc.statements, // Inherit default admin abilities (like managing users)
  order: ["create", "read", "update", "delete", "cancel"],
  category: ["create", "read", "update", "delete"],
  menu: ["create", "read", "update", "delete", "generate"],
  table: ["create", "read", "update", "delete"],
  reservation: ["create", "read", "update", "delete"],
  kds: ["view", "update_status"],
  report: ["view"],
  user: ["create", "ban", "update", "delete", "get", "list", "set-role"],
  session: [],
});

// Manager Role
export const MANAGER = ac.newRole({
  ...userAc.statements,
  order: ["create", "read", "update", "delete", "cancel"],
  category: ["create", "read", "update", "delete"],
  menu: ["create", "read", "update", "delete", "generate"],
  table: ["create", "read", "update", "delete"],
  reservation: ["create", "read", "update", "delete"],
  kds: ["view", "update_status"],
  report: ["view"],
  user: ["create", "ban", "update", "delete", "get", "list", "set-role"],
  session: [],
});

// Staff Role
export const STAFF = ac.newRole({
  ...userAc.statements,
  order: ["create", "read", "update"], // Waiters can create and update orders
  category: ["read"],
  menu: ["read"],
  table: ["read", "update"],
  reservation: ["create", "read", "update", "delete"],
  kds: ["view"],
  report: [],
  user: [],
  session: [],
});

// Kitchen Role
export const KITCHEN = ac.newRole({
  ...userAc.statements,
  order: ["read"],
  category: ["read"],
  menu: ["read"],
  table: [],
  reservation: [],
  kds: ["view", "update_status"], // Chefs interact heavily with the KDS
  report: [],
  user: [],
  session: [],
});

// Customer Role
export const CUSTOMER = ac.newRole({
  ...userAc.statements,
  order: ["create", "read", "cancel"], // Can order online
  category: ["read"],
  menu: ["read"],
  table: ["read"],
  reservation: ["create", "read", "update"], // Can make and manage their own reservations
  kds: [],
  report: [],
  user: [],
  session: [],
});
