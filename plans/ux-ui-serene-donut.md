# Plan: ระบบแจ้งซ่อมออนไลน์มหาวิทยาลัย (University Maintenance Request System)

## Context
Build a complete, multi-view UX/UI for a Thai university online maintenance and repair request system. The design system is prescribed: deep purple `#5B2A86` primary, light purple `#8B5CF6` glow, golden yellow `#FBBF24` accent, cream `#FFFDF5` background, dark gray text, IBM Plex Sans Thai headings. Tone: official, readable, trustworthy — not startup-SaaS.

## Stance & Aesthetic
**Structured Official** — institutional clarity with restrained warmth. Think government portal meets modern card-based dashboard. The prescribed palette drives everything: deep purple for navigation/structure, golden yellow for calls-to-action and status highlights, cream for breathing room. Clean grid, generous whitespace, subtle purple-to-violet gradients on key elements.

## Pages / Views (tab-based React state router — no react-router needed)

| View | Purpose |
|---|---|
| **Dashboard** | Student overview: stats row, recent requests list, quick-submit CTA |
| **New Request** | Multi-step form: category → location → description + photo |
| **My Requests** | Filterable table/card list of all submitted requests |
| **Request Detail** | Status timeline, technician info, comments thread |
| **Admin Board** | Kanban-style columns (Pending → In Progress → Done) |

Active view controlled by `useState<View>`.

## Token Updates — `src/styles/theme.css`
Update `:root` values only (keep `.dark` block and `@theme inline` untouched):
```
--background: #FFFDF5
--foreground: #1E1B2E
--card: #FFFFFF
--card-foreground: #1E1B2E
--primary: #5B2A86
--primary-foreground: #FFFFFF
--secondary: #F3EEFF
--secondary-foreground: #5B2A86
--muted: #EDE8F7
--muted-foreground: #6B6883
--accent: #FBBF24
--accent-foreground: #1E1B2E
--border: rgba(91,42,134,0.12)
--ring: #8B5CF6
--radius: 0.75rem
```

## Font — `src/styles/fonts.css`
```css
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');
```
Apply `font-family: 'IBM Plex Sans Thai', 'IBM Plex Sans', sans-serif` to `body` in theme.css base layer.

## Layout Structure
```
┌─────────────────────────────────────────────────┐
│  Sidebar (240px fixed)  │  Main content area     │
│  - University logo/name │  - Top bar (user info) │
│  - Nav items            │  - Page content        │
│  - Purple gradient bg   │  - bg-background       │
└─────────────────────────────────────────────────┘
```
On mobile (<768px): sidebar collapses to top nav bar.

## Key Components

### Sidebar
- Background: `linear-gradient(180deg, #5B2A86 0%, #3D1A5C 100%)`
- University crest/icon + "มจพ. แจ้งซ่อม" wordmark
- Nav items: Dashboard, แจ้งซ่อมใหม่, คำขอของฉัน, ผู้ดูแลระบบ
- Active item: yellow `#FBBF24` left border + light bg

### Status Badges
| Status | Color |
|---|---|
| รอดำเนินการ (Pending) | Yellow `#FBBF24` bg, dark text |
| กำลังดำเนินการ (In Progress) | Purple gradient `#8B5CF6` bg, white text |
| เสร็จสิ้น (Completed) | Green `#10B981` bg, white text |
| ยกเลิก (Cancelled) | Gray `#9CA3AF` bg, white text |

### Dashboard Stats Row (4 cards)
- คำขอทั้งหมด / รอดำเนินการ / กำลังซ่อม / เสร็จสิ้น
- Each card: number + label + icon, subtle purple top border accent

### Request Cards
- Category icon (Lucide: Wrench, Zap, Droplets, Thermometer, Monitor)
- Request ID, title, location, submitted date
- Status badge, urgency indicator
- Hover: slight lift shadow

### New Request Form — 3 steps
1. **ประเภทงาน**: icon grid of categories (ระบบไฟฟ้า, ประปา, เครื่องปรับอากาศ, อาคาร, คอมพิวเตอร์, อื่นๆ)
2. **สถานที่**: building dropdown + room input + floor input
3. **รายละเอียด**: textarea, urgency select (ปกติ/ด่วน/เร่งด่วน), optional photo upload UI

Progress bar at top: purple fill on cream track. Submit button: `bg-gradient-to-r from-[#5B2A86] to-[#8B5CF6]` with yellow hover ring.

### Request Detail — Timeline
Vertical timeline with purple connecting line:
- ส่งคำขอ → รับเรื่อง → มอบหมายช่าง → กำลังซ่อม → เสร็จสิ้น
- Each step: circle node (filled = done, hollow = pending), timestamp, actor name

### Admin Board (Kanban)
3 columns: รอดำเนินการ / กำลังดำเนินการ / เสร็จสิ้น
Drag-not-required: click card → detail modal. Column headers show count badge.

## Realistic Placeholder Data
- Requests from real-sounding Thai names (นายสมชาย วงศ์ใหญ่, นางสาวปิยะดา แสงทอง)
- Buildings: อาคาร 40 ปี, หอสมุด, คณะวิศวกรรมศาสตร์, หอพักนักศึกษา
- Dates in Thai Buddhist calendar format (27 มิ.ย. 2568)

## Interactivity
- View switching via sidebar nav (useState)
- Form step progression with validation feedback
- Filter tabs on My Requests (ทั้งหมด / รอ / กำลังซ่อม / เสร็จ)
- Expandable request cards → detail view
- Status badge click opens modal (admin view)

## Files to Modify
1. `src/styles/theme.css` — update `:root` tokens as above
2. `src/styles/fonts.css` — add IBM Plex Sans Thai import
3. `src/app/App.tsx` — full implementation (single file, ~600-800 lines)

## Verification
1. Run dev server and confirm sidebar navigation switches views
2. Verify all 5 views render without errors
3. Check form step progression works (Next/Back buttons)
4. Confirm status badge colors match spec
5. Check responsive collapse at <768px
