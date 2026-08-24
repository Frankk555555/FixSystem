// Mock data store (in-memory) — ใช้สำหรับเข้าหน้าต่างๆ ได้โดยไม่ต้องล็อกอิน
import type { DepartmentValue, PriorityValue } from "@/lib/repair-constants";

export type MockTicket = {
  id: string;
  ticket_code: string;
  department: DepartmentValue;
  priority: PriorityValue;
  status: "pending" | "assigned" | "scheduled" | "in_progress" | "completed";
  building: string;
  floor: string | null;
  room: string | null;
  location_note: string | null;
  description: string;
  created_at: string;
  updated_at: string;
};

export type MockMedia = {
  id: string;
  file_path: string;
  kind: "image" | "video";
  url: string | null;
  created_at: string;
};

export type MockProfile = {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  person_code: string;
};

const now = Date.now();
const iso = (offsetMin: number) => new Date(now - offsetMin * 60_000).toISOString();

export const mockProfile: MockProfile = {
  id: "mock-user-1",
  full_name: "สมชาย ใจดี",
  phone: "081-234-5678",
  email: "somchai@university.ac.th",
  person_code: "6612345678",
};

export const mockTickets: MockTicket[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    ticket_code: "RPR-2025-00001",
    department: "electric",
    priority: "urgent",
    status: "in_progress",
    building: "อาคาร 15 (อาคารเฉลิมพระเกียรติ 50 พรรษา มหาวชิราลงกรณ)",
    floor: "3",
    room: "305",
    location_note: "หน้าห้องปฏิบัติการคอมพิวเตอร์",
    description: "หลอดไฟดับ 2 ดวง ห้องเรียนมืดมาก ต้องเปิดเรียนพรุ่งนี้เช้า",
    created_at: iso(60 * 5),
    updated_at: iso(60),
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    ticket_code: "RPR-2025-00002",
    department: "plumbing",
    priority: "normal",
    status: "assigned",
    building: "อาคารวิทยบริการ (ห้องสมุด)",
    floor: "1",
    room: null,
    location_note: "ห้องน้ำชายฝั่งตะวันออก",
    description: "ก๊อกน้ำในห้องน้ำชายปิดไม่สนิท น้ำหยดตลอดเวลา",
    created_at: iso(60 * 26),
    updated_at: iso(60 * 4),
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    ticket_code: "RPR-2025-00003",
    department: "general",
    priority: "critical",
    status: "completed",
    building: "หอพักนักศึกษา",
    floor: "2",
    room: "210",
    location_note: null,
    description: "ประตูห้องพักปิดไม่ได้ บานพับหลุด เสี่ยงต่อความปลอดภัย",
    created_at: iso(60 * 24 * 5),
    updated_at: iso(60 * 24 * 2),
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    ticket_code: "RPR-2025-00004",
    department: "electric",
    priority: "normal",
    status: "pending",
    building: "อาคาร 24 (อาคารเรียนคณะวิทยาการจัดการ)",
    floor: "5",
    room: "502",
    location_note: null,
    description: "ปลั๊กไฟด้านหลังห้องใช้ไม่ได้",
    created_at: iso(60 * 2),
    updated_at: iso(60 * 2),
  },
];

export const mockMediaByTicket: Record<string, MockMedia[]> = {};

let seq = mockTickets.length + 1;
export function addMockTicket(input: {
  department: DepartmentValue;
  priority: PriorityValue;
  building: string;
  floor: string | null;
  room: string | null;
  location_note: string | null;
  description: string;
}): MockTicket {
  const id = crypto.randomUUID();
  const code = `RPR-2025-${String(seq++).padStart(5, "0")}`;
  const ticket: MockTicket = {
    id,
    ticket_code: code,
    status: "pending",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...input,
  };
  mockTickets.unshift(ticket);
  return ticket;
}

export function getMockTicket(id: string) {
  return mockTickets.find((t) => t.id === id) ?? null;
}

export function markMockTicketCompleted(id: string) {
  updateMockTicketStatus(id, "completed");
}

export function updateMockTicketStatus(id: string, status: MockTicket["status"]) {
  const t = getMockTicket(id);
  if (t) {
    t.status = status;
    t.updated_at = new Date().toISOString();
  }
}

export function updateMockProfile(input: { full_name: string; phone: string; person_code: string }) {
  mockProfile.full_name = input.full_name;
  mockProfile.phone = input.phone;
  mockProfile.person_code = input.person_code;
}
