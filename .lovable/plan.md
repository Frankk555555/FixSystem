# แผนพัฒนา: ระบบแจ้งซ่อมออนไลน์มหาวิทยาลัย (MVP)

โฟกัสรอบแรก: **Auth + แจ้งซ่อม + ติดตามสถานะ** ทั้ง UI ภาษาไทย ธีมม่วง-เหลือง ใช้ข้อมูลอาคาร/แผนกแบบ placeholder ส่วน Chat / ปฏิทินนัดหมาย / Admin Dashboard / รายงาน จะทำในรอบถัดไป

## 1. ดีไซน์ & ธีม

- พาเลตหลัก: ม่วงเข้ม `#5B2A86` (primary), ม่วงอ่อน `#8B5CF6` (primary-glow), เหลืองทอง `#FBBF24` (accent), พื้นหลังครีม `#FFFDF5`, text เทาเข้ม
- ฟอนต์: หัวเรื่อง **IBM Plex Sans Thai** / body **Sarabun** (โหลดผ่าน `<link>` ใน `__root.tsx`)
- กำหนด token ทั้งหมดใน `src/styles.css` (`--primary`, `--accent`, `--gradient-primary`, `--shadow-elegant`) ไม่ hardcode สีในคอมโพเนนต์
- โทน: official + อ่านง่าย, มี gradient ม่วงและ accent เหลืองในปุ่ม/สถานะ

## 2. Backend (Lovable Cloud)

เปิด Lovable Cloud แล้วสร้างตารางผ่าน migration:

- `profiles` — id (FK auth.users), full_name, phone, person_code (รหัส นศ./บุคลากร), email
- `app_role` enum: `user`, `technician_electric`, `technician_plumbing`, `technician_general`, `admin`
- `user_roles` (id, user_id, role) + ฟังก์ชัน `has_role(uuid, app_role)` SECURITY DEFINER
- `repair_tickets` — id, ticket_code (auto เช่น `RPR-2025-0001`), reporter_id, department (enum: electric/plumbing/general), priority (normal/urgent/critical), building, floor, room, location_note, description, status (pending/assigned/scheduled/in_progress/completed), created_at, updated_at
- `repair_ticket_media` — id, ticket_id, file_path, kind (image/video)
- Storage bucket `repair-media` (private) + policy: เจ้าของเรื่องและช่างแผนกที่เกี่ยวข้องเข้าถึงได้
- RLS:
  - `repair_tickets`: user เห็น/แก้เฉพาะของตน; ช่างเห็นเฉพาะ ticket ในแผนกของตน; admin เห็นทุก ticket
  - `profiles`: เจ้าของอ่าน/แก้ตนเองได้
  - `user_roles`: อ่านได้เฉพาะตนเอง (จัดการผ่าน has_role)
- Trigger auto-สร้าง profile เมื่อสมัคร + auto-assign role `user`

## 3. Auth

- ใช้ email/password (Lovable Cloud) — ลงทะเบียนกรอก: ชื่อ-นามสกุล, เบอร์โทร, อีเมล, รหัส นศ./บุคลากร, รหัสผ่าน
- `emailRedirectTo: window.location.origin`
- หน้า `/auth` (สมัคร + เข้าสู่ระบบ tab สลับ), logout
- ใช้ `_authenticated/` layout ที่ integration จัดการ เพื่อกันหน้า protected
- เก็บ session ผ่าน `onAuthStateChange` ใน `__root.tsx` (filter SIGNED_IN/OUT/USER_UPDATED)

## 4. Routes (TanStack)

```text
src/routes/
  __root.tsx                              (head + font links + auth listener)
  index.tsx                               หน้า landing สั้น ๆ + ปุ่มเข้าสู่ระบบ
  auth.tsx                                เข้าสู่ระบบ / สมัครสมาชิก
  _authenticated/
    route.tsx                             (integration-managed)
    dashboard.tsx                         รายการแจ้งซ่อมของฉัน + สถานะ
    tickets.new.tsx                       ฟอร์มแจ้งซ่อมใหม่
    tickets.$ticketId.tsx                 รายละเอียด + timeline สถานะ
    profile.tsx                           ดู/แก้โปรไฟล์
```

## 5. ฟีเจอร์รอบนี้

### 5.1 ฟอร์มแจ้งซ่อม (`/tickets/new`)
- Auto-fill ชื่อ + เบอร์ จาก profile (read-only)
- เลือกแผนก (ไฟฟ้า / ประปา / ซ่อมสร้าง) — ใช้ card 3 ใบ icon ชัดเจน
- ระดับความเร่งด่วน (ทั่วไป / ด่วน / ด่วนที่สุด) — radio chip
- เลือกอาคาร (dropdown placeholder ~6 อาคารตัวอย่าง) + ชั้น + เลขห้อง + จุดอ้างอิง
- รายละเอียดอาการ (textarea)
- แนบรูป/วิดีโอสั้น (multi-file, อัปขึ้น Storage bucket `repair-media`)
- Zod validation + toast แจ้งผล
- เมื่อสำเร็จ → redirect ไปหน้า ticket พร้อมแสดง ticket_code

### 5.2 Dashboard ผู้ใช้ (`/dashboard`)
- การ์ดสรุป: รอดำเนินการ / กำลังดำเนินการ / เสร็จสิ้น
- ตาราง/รายการ ticket ของฉัน — ticket_code, แผนก (badge สี), สถานะ (badge), วันที่, ปุ่มดูรายละเอียด
- ปุ่มลอย "แจ้งซ่อมใหม่"

### 5.3 รายละเอียด ticket (`/tickets/:id`)
- ข้อมูลครบ + รูปแนบ (gallery)
- Timeline สถานะ 5 ขั้น (Pending → Assigned → Scheduled → In Progress → Completed) แบบ stepper
- ปุ่ม "ยืนยันงานเสร็จสิ้น" (เฉพาะเจ้าของเมื่อสถานะ in_progress)

### 5.4 Profile (`/profile`)
- แก้ชื่อ / เบอร์โทร / รหัส (อีเมลอ่านอย่างเดียว)
- ปุ่มออกจากระบบ

## 6. Server functions (`src/lib/tickets.functions.ts`)

- `createTicket` — auth required, insert ticket + media
- `listMyTickets` — auth required, query ของ user
- `getTicket(id)` — auth required, RLS คุมสิทธิ์
- `confirmTicketCompleted(id)` — auth required, อัปเดต status = completed
- ใช้ `requireSupabaseAuth` middleware + register `attachSupabaseAuth` ใน `src/start.ts`

## 7. นอกขอบเขตรอบนี้ (จะทำต่อ)

- ระบบแชท real-time per ticket
- ปฏิทินนัดหมาย + จองคิว
- หน้าช่าง: queue, รับงาน, อัปเดตสถานะ
- Admin dashboard + รายงาน/กราฟ
- Notifications

---

ถ้าโอเค กดอนุมัติเพื่อให้เริ่ม build ได้เลยครับ
