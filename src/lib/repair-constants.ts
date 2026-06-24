export const BUILDINGS = [
  "อาคาร 1 - คณะวิศวกรรมศาสตร์",
  "อาคาร 2 - คณะวิทยาศาสตร์",
  "อาคาร 3 - คณะบริหารธุรกิจ",
  "อาคาร 4 - หอสมุดกลาง",
  "อาคาร 5 - สำนักงานอธิการบดี",
  "อาคาร 6 - หอประชุมใหญ่",
  "อาคารกิจกรรมนักศึกษา",
  "หอพักนักศึกษา A",
  "หอพักนักศึกษา B",
  "โรงอาหารกลาง",
] as const;

export const DEPARTMENTS = [
  {
    value: "electric",
    label: "แผนกไฟฟ้า",
    description: "ระบบไฟฟ้า แสงสว่าง เครื่องใช้ไฟฟ้า",
    icon: "⚡",
  },
  {
    value: "plumbing",
    label: "แผนกประปา",
    description: "ระบบประปา ท่อน้ำ สุขภัณฑ์",
    icon: "💧",
  },
  {
    value: "general",
    label: "แผนกซ่อมสร้าง",
    description: "โครงสร้าง อาคาร เฟอร์นิเจอร์ งานปูน/ไม้",
    icon: "🔨",
  },
] as const;

export type DepartmentValue = (typeof DEPARTMENTS)[number]["value"];

export const PRIORITIES = [
  { value: "normal", label: "ทั่วไป", className: "bg-muted text-muted-foreground" },
  { value: "urgent", label: "ด่วน", className: "bg-warning text-warning-foreground" },
  { value: "critical", label: "ด่วนที่สุด", className: "bg-destructive text-destructive-foreground" },
] as const;

export type PriorityValue = (typeof PRIORITIES)[number]["value"];

export const STATUSES: Array<{
  value: "pending" | "assigned" | "scheduled" | "in_progress" | "completed";
  label: string;
  className: string;
}> = [
  { value: "pending", label: "รอดำเนินการ", className: "bg-muted text-muted-foreground" },
  { value: "assigned", label: "รับเรื่องแล้ว", className: "bg-primary/15 text-primary" },
  { value: "scheduled", label: "นัดหมายแล้ว", className: "bg-accent text-accent-foreground" },
  { value: "in_progress", label: "กำลังดำเนินการ", className: "bg-primary text-primary-foreground" },
  { value: "completed", label: "เสร็จสิ้น", className: "bg-success text-success-foreground" },
];

export function getStatusMeta(value: string) {
  return STATUSES.find((s) => s.value === value) ?? STATUSES[0];
}

export function getDepartmentMeta(value: string) {
  return DEPARTMENTS.find((d) => d.value === value);
}

export function getPriorityMeta(value: string) {
  return PRIORITIES.find((p) => p.value === value) ?? PRIORITIES[0];
}
