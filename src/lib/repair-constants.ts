export const BUILDINGS = [
  "กองอาคาร",
  "โรงยิม",
  "โรงแรมพนมพิมาน",
  "เวทีราชภัฏภิรมย์",
  "ศูนย์ฝึกประสบการณ์วิชาชีพวิทยาศาสตร์การกีฬาและสุขภาพ",
  "ศูนย์วัฒนธรรมอิสานใต้",
  "ศูนย์อาหาร 1",
  "ศูนย์อาหาร 2",
  "สนามกีฬากลาง",
  "สระว่ายน้ำราชภัฏชลาธาร",
  "ห้องประชุมศิวาลัย",
  "หอประชุมมาลิณีจุโฑปะมา",
  "หอประชุมวิชชาอัตศาสตร์",
  "หอพักนักศึกษา",
  "อาคาร 1 (สถาบันวิจัย)",
  "อาคาร 2 (อาคารเรียนรวม) และห้องปฐมพยาบาล",
  "อาคาร 5 (อาคารเรียนคณะวิทยาศาสตร์)",
  "อาคาร 6 (อาคารเรียนคณะมนุษยศาสตร์และสังคมศาสตร์)",
  "อาคาร 7 (อาคารเรียนคณะวิทยาศาสตร์)",
  "อาคาร 10 (อาคารเรียนคณะครุศาสตร์)",
  "อาคาร 12 (อาคารเรียนคณะวิทยาศาสตร์)",
  "อาคาร 13 (อาคารเรียนคณะพยาบาลศาสตร์)",
  "อาคาร 14 (อาคารเรียนดนตรี และนาฏศิลป์)",
  "อาคาร 15 (อาคารเฉลิมพระเกียรติ 50 พรรษา มหาวชิราลงกรณ)",
  "อาคาร 16 (อาคารปฏิบัติการสิ่งทอ)",
  "อาคาร 17 (อาคารนวัตปัญญา)",
  "อาคาร 18 (อาคารเฉลิมพระเกียรติ 7 รอบ พระชนมพรรษา)",
  "อาคาร 19 (อาคารสิริวิชญากร)",
  "อาคาร 20 (อาคารเรียนสิริวิทยเกษตร)",
  "อาคาร 21 (อาคารพาณิชย์)",
  "อาคาร 22 (อาคารวิทยาศาสตร์สุขภาพ)",
  "อาคาร 23 (อเนกคุณาคาร ราชภัฏคอมเพล็กซ์)",
  "อาคาร 24 (อาคารเรียนคณะวิทยาการจัดการ)",
  "อาคาร 25 (อาคารเรียนคณะมนุษยศาสตร์และสังคมศาสตร์)",
  "อาคาร 26 ตึกสาขาวิชาศิลปศึกษา",
  "อาคาร 27 (โรงเรียนสาธิตมหาวิทยาลัยราชภัฏบุรีรัมย์)",
  "อาคารฝึกงานอุตสาหกรรม",
  "อาคารฝึกงานอุตสาหกรรม-โลหะ",
  "อาคารวิทยบริการ (ห้องสมุด)",
  "BRU DOME",
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
  { value: "normal", label: "ทั่วไป", className: "bg-muted text-muted-foreground hover:bg-muted/80" },
  { value: "urgent", label: "ด่วน", className: "bg-warning text-warning-foreground hover:bg-warning/80 hover:text-warning-foreground" },
  { value: "critical", label: "ด่วนที่สุด", className: "bg-destructive text-destructive-foreground hover:bg-destructive/80 hover:text-destructive-foreground" },
] as const;

export type PriorityValue = (typeof PRIORITIES)[number]["value"];

export const STATUSES: Array<{
  value: "pending" | "assigned" | "scheduled" | "in_progress" | "completed";
  label: string;
  className: string;
}> = [
  { value: "pending", label: "รอดำเนินการ", className: "bg-muted text-muted-foreground hover:bg-muted/80" },
  { value: "assigned", label: "รับเรื่องแล้ว", className: "bg-blue-500 text-white hover:bg-blue-600 hover:text-white" },
  { value: "scheduled", label: "นัดหมายแล้ว", className: "bg-accent text-accent-foreground hover:bg-accent/80 hover:text-accent-foreground" },
  { value: "in_progress", label: "กำลังดำเนินการ", className: "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" },
  { value: "completed", label: "เสร็จสิ้น", className: "bg-success text-success-foreground hover:bg-success/80 hover:text-success-foreground" },
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
