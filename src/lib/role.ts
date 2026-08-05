import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];
export type RepairDepartment = Database["public"]["Enums"]["repair_department"];

export type Role = "user" | "technician" | "admin" | AppRole;

export interface RoleMeta {
  role: AppRole;
  label: string;
  department: RepairDepartment | null;
  departmentLabel?: string;
  icon: string;
  color: string;
}

export const ROLE_DEFINITIONS: Record<AppRole, RoleMeta> = {
  user: {
    role: "user",
    label: "ผู้ใช้งานทั่วไป (นักศึกษา/อาจารย์/บุคลากร)",
    department: null,
    icon: "👤",
    color: "bg-blue-500",
  },
  technician_electric: {
    role: "technician_electric",
    label: "ช่างซ่อม - แผนกไฟฟ้า",
    department: "electric",
    departmentLabel: "แผนกไฟฟ้า (Electric)",
    icon: "⚡",
    color: "bg-amber-500",
  },
  technician_plumbing: {
    role: "technician_plumbing",
    label: "ช่างซ่อม - แผนกประปา",
    department: "plumbing",
    departmentLabel: "แผนกประปา (Plumbing)",
    icon: "💧",
    color: "bg-cyan-500",
  },
  technician_general: {
    role: "technician_general",
    label: "ช่างซ่อม - แผนกซ่อมสร้าง",
    department: "general",
    departmentLabel: "แผนกซ่อมสร้าง (General/Building)",
    icon: "🔨",
    color: "bg-emerald-500",
  },
  admin: {
    role: "admin",
    label: "ผู้ดูแลระบบ (Admin)",
    department: null,
    icon: "🛡️",
    color: "bg-purple-600",
  },
};

export function getRoleMeta(role: AppRole): RoleMeta {
  return ROLE_DEFINITIONS[role] || ROLE_DEFINITIONS.user;
}
