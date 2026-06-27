import { useState } from "react";
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  ShieldCheck,
  Wrench,
  Zap,
  Droplets,
  Thermometer,
  Monitor,
  HelpCircle,
  MapPin,
  Calendar,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Bell,
  Search,
  Upload,
  Circle,
  Menu,
  Building2,
  Phone,
  MessageSquare,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type View = "dashboard" | "new-request" | "my-requests" | "request-detail" | "admin";
type Status = "pending" | "in-progress" | "completed" | "cancelled";
type Urgency = "normal" | "urgent" | "critical";

interface RepairRequest {
  id: string;
  title: string;
  category: string;
  building: string;
  room: string;
  floor: string;
  description: string;
  status: Status;
  urgency: Urgency;
  submittedBy: string;
  submittedDate: string;
  assignedTo?: string;
  updatedDate?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_REQUESTS: RepairRequest[] = [
  {
    id: "REQ-2568-0042",
    title: "ไฟฟ้าขัดข้อง ห้องปฏิบัติการ",
    category: "ระบบไฟฟ้า",
    building: "อาคาร 40 ปี",
    room: "403",
    floor: "4",
    description: "ไฟดับทั้งห้อง ไม่สามารถใช้อุปกรณ์ทดลองได้ ต้องการซ่อมด่วน",
    status: "in-progress",
    urgency: "critical",
    submittedBy: "นายสมชาย วงศ์ใหญ่",
    submittedDate: "25 มิ.ย. 2568",
    assignedTo: "ช่างอนันต์ สุขดี",
    updatedDate: "26 มิ.ย. 2568",
  },
  {
    id: "REQ-2568-0041",
    title: "เครื่องปรับอากาศไม่ทำงาน",
    category: "เครื่องปรับอากาศ",
    building: "คณะวิศวกรรมศาสตร์",
    room: "201",
    floor: "2",
    description: "แอร์ไม่เย็น มีเสียงดัง ใช้งานมาหลายปีแล้ว",
    status: "pending",
    urgency: "urgent",
    submittedBy: "นางสาวปิยะดา แสงทอง",
    submittedDate: "26 มิ.ย. 2568",
  },
  {
    id: "REQ-2568-0040",
    title: "ท่อน้ำรั่วในห้องน้ำ",
    category: "ระบบประปา",
    building: "หอสมุด",
    room: "B1-05",
    floor: "B1",
    description: "ท่อน้ำใต้อ่างล้างมือรั่ว น้ำขังพื้น เสี่ยงลื่นหกล้ม",
    status: "completed",
    urgency: "urgent",
    submittedBy: "นายกิตติพงษ์ มีสุข",
    submittedDate: "20 มิ.ย. 2568",
    assignedTo: "ช่างวิชัย พรมมา",
    updatedDate: "22 มิ.ย. 2568",
  },
  {
    id: "REQ-2568-0039",
    title: "คอมพิวเตอร์ไม่เปิด",
    category: "คอมพิวเตอร์",
    building: "อาคาร 40 ปี",
    room: "512",
    floor: "5",
    description: "เครื่องเปิดไม่ติด กดปุ่ม Power ไม่มีไฟ",
    status: "pending",
    urgency: "normal",
    submittedBy: "นางสาวสุภาพร ชาติไทย",
    submittedDate: "27 มิ.ย. 2568",
  },
  {
    id: "REQ-2568-0038",
    title: "ประตูห้องชำรุด ปิดไม่สนิท",
    category: "อาคารสถานที่",
    building: "หอพักนักศึกษา",
    room: "312",
    floor: "3",
    description: "บานพับประตูหัก ประตูปิดไม่สนิท กลัวไม่ปลอดภัย",
    status: "in-progress",
    urgency: "normal",
    submittedBy: "นายพิชัย บุญมี",
    submittedDate: "24 มิ.ย. 2568",
    assignedTo: "ช่างสมพร จันทร์ดี",
    updatedDate: "25 มิ.ย. 2568",
  },
  {
    id: "REQ-2568-0037",
    title: "โปรเจกเตอร์ภาพไม่ชัด",
    category: "คอมพิวเตอร์",
    building: "คณะวิศวกรรมศาสตร์",
    room: "305",
    floor: "3",
    description: "ภาพจากโปรเจกเตอร์มัวมาก ไม่สามารถใช้สอนได้",
    status: "cancelled",
    urgency: "normal",
    submittedBy: "ผศ.ดร.วรรณา ศรีสุข",
    submittedDate: "18 มิ.ย. 2568",
    updatedDate: "19 มิ.ย. 2568",
  },
];

const TIMELINE_STEPS = [
  { label: "ส่งคำขอ", key: "submitted" },
  { label: "รับเรื่อง", key: "received" },
  { label: "มอบหมายช่าง", key: "assigned" },
  { label: "กำลังซ่อม", key: "in-progress" },
  { label: "เสร็จสิ้น", key: "completed" },
];

const CATEGORIES = [
  { id: "electric", label: "ระบบไฟฟ้า", icon: Zap },
  { id: "plumbing", label: "ระบบประปา", icon: Droplets },
  { id: "ac", label: "เครื่องปรับอากาศ", icon: Thermometer },
  { id: "building", label: "อาคารสถานที่", icon: Building2 },
  { id: "computer", label: "คอมพิวเตอร์", icon: Monitor },
  { id: "other", label: "อื่นๆ", icon: HelpCircle },
];

const BUILDINGS = [
  "อาคาร 40 ปี",
  "คณะวิศวกรรมศาสตร์",
  "หอสมุด",
  "หอพักนักศึกษา",
  "อาคารบริหาร",
  "โรงอาหาร",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, { label: string; className: string }> = {
    pending: { label: "รอดำเนินการ", className: "bg-[#FBBF24] text-[#1E1B2E]" },
    "in-progress": {
      label: "กำลังดำเนินการ",
      className: "bg-gradient-to-r from-[#5B2A86] to-[#8B5CF6] text-white",
    },
    completed: { label: "เสร็จสิ้น", className: "bg-[#10B981] text-white" },
    cancelled: { label: "ยกเลิก", className: "bg-[#9CA3AF] text-white" },
  };
  const { label, className } = map[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}

function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  const map: Record<Urgency, { label: string; className: string }> = {
    normal: { label: "ปกติ", className: "bg-secondary text-secondary-foreground" },
    urgent: { label: "ด่วน", className: "bg-orange-100 text-orange-700" },
    critical: { label: "เร่งด่วน", className: "bg-red-100 text-red-700" },
  };
  const { label, className } = map[urgency];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

function CategoryIcon({ category }: { category: string }) {
  const map: Record<string, typeof Wrench> = {
    "ระบบไฟฟ้า": Zap,
    "ระบบประปา": Droplets,
    "เครื่องปรับอากาศ": Thermometer,
    "อาคารสถานที่": Building2,
    "คอมพิวเตอร์": Monitor,
  };
  const Icon = map[category] ?? Wrench;
  return <Icon className="w-4 h-4" />;
}

function getStatusStep(status: Status): number {
  const map: Record<Status, number> = {
    pending: 1,
    "in-progress": 3,
    completed: 4,
    cancelled: 0,
  };
  return map[status] ?? 0;
}

// ─── Request Card ─────────────────────────────────────────────────────────────

function RequestCard({
  request,
  onClick,
}: {
  request: RepairRequest;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-card rounded-2xl p-4 border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 text-primary">
          <CategoryIcon category={request.category} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="text-xs text-muted-foreground">{request.id}</span>
            <UrgencyBadge urgency={request.urgency} />
          </div>
          <p className="font-medium text-foreground text-sm truncate">{request.title}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {request.building} ห้อง {request.room}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {request.submittedDate}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <StatusBadge status={request.status} />
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
    </button>
  );
}

// ─── Dashboard View ───────────────────────────────────────────────────────────

function DashboardView({
  onViewRequest,
  onNewRequest,
}: {
  onViewRequest: (id: string) => void;
  onNewRequest: () => void;
}) {
  const total = MOCK_REQUESTS.length;
  const pending = MOCK_REQUESTS.filter((r) => r.status === "pending").length;
  const inProgress = MOCK_REQUESTS.filter((r) => r.status === "in-progress").length;
  const completed = MOCK_REQUESTS.filter((r) => r.status === "completed").length;
  const recent = MOCK_REQUESTS.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #5B2A86 0%, #8B5CF6 100%)" }}
      >
        <div className="relative z-10">
          <p className="text-sm text-white/70 mb-1">ยินดีต้อนรับ</p>
          <h2 className="text-2xl font-semibold mb-1">นายสมชาย วงศ์ใหญ่</h2>
          <p className="text-white/80 text-sm mb-4">นักศึกษา · คณะวิศวกรรมศาสตร์</p>
          <button
            onClick={onNewRequest}
            className="inline-flex items-center gap-2 bg-[#FBBF24] text-[#1E1B2E] px-4 py-2 rounded-xl font-semibold text-sm hover:bg-yellow-300 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            แจ้งซ่อมใหม่
          </button>
        </div>
        <div className="absolute right-4 top-4 opacity-10 pointer-events-none">
          <Wrench className="w-32 h-32 text-white" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "คำขอทั้งหมด", value: total, icon: ClipboardList, color: "#5B2A86" },
          { label: "รอดำเนินการ", value: pending, icon: Clock, color: "#FBBF24" },
          { label: "กำลังซ่อม", value: inProgress, icon: Wrench, color: "#8B5CF6" },
          { label: "เสร็จสิ้น", value: completed, icon: CheckCircle2, color: "#10B981" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-card rounded-2xl p-4 border border-border shadow-sm"
            style={{ borderTop: `3px solid ${stat.color}` }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted-foreground text-xs">{stat.label}</p>
              <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
            </div>
            <p className="text-3xl font-semibold" style={{ color: stat.color }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent requests */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">คำขอล่าสุด</h3>
          <button className="text-primary text-sm flex items-center gap-1 hover:underline">
            ดูทั้งหมด <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="space-y-3">
          {recent.map((req) => (
            <RequestCard key={req.id} request={req} onClick={() => onViewRequest(req.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── New Request View ─────────────────────────────────────────────────────────

function NewRequestView({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [building, setBuilding] = useState("");
  const [room, setRoom] = useState("");
  const [floor, setFloor] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState<Urgency>("normal");
  const [submitted, setSubmitted] = useState(false);

  const stepLabels = ["ประเภทงาน", "สถานที่", "รายละเอียด"];

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-[#10B981]/10 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-[#10B981]" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">ส่งคำขอเรียบร้อยแล้ว!</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          คำขอของคุณได้รับการบันทึกแล้ว เจ้าหน้าที่จะติดต่อกลับภายใน 1-2 วันทำการ
        </p>
        <div className="bg-secondary rounded-xl px-4 py-2 text-primary font-semibold text-sm">
          REQ-2568-0043
        </div>
        <button
          onClick={onBack}
          className="mt-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white"
          style={{ background: "linear-gradient(135deg, #5B2A86, #8B5CF6)" }}
        >
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-primary" />
        </button>
        <h2 className="text-lg font-semibold text-foreground">แจ้งซ่อมใหม่</h2>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          {stepLabels.map((s, i) => (
            <span key={s} className={i + 1 <= step ? "text-primary font-medium" : ""}>
              {s}
            </span>
          ))}
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${((step - 1) / (stepLabels.length - 1)) * 100}%`,
              background: "linear-gradient(90deg, #5B2A86, #8B5CF6)",
            }}
          />
        </div>
      </div>

      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">เลือกประเภทงานซ่อม</h3>
            <div className="grid grid-cols-3 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    selectedCategory === cat.id
                      ? "border-primary bg-secondary text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <cat.icon className="w-6 h-6" />
                  <span className="text-xs font-medium text-center leading-tight">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">ระบุสถานที่</h3>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">อาคาร</label>
              <select
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-input-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">-- เลือกอาคาร --</option>
                {BUILDINGS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">ชั้น</label>
                <input
                  type="text"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  placeholder="เช่น 3"
                  className="w-full px-3 py-2.5 rounded-xl bg-input-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">ห้อง</label>
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="เช่น 301"
                  className="w-full px-3 py-2.5 rounded-xl bg-input-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">รายละเอียดการซ่อม</h3>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">อธิบายปัญหา</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="อธิบายปัญหาที่พบโดยละเอียด..."
                rows={4}
                className="w-full px-3 py-2.5 rounded-xl bg-input-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">ความเร่งด่วน</label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { value: "normal" as Urgency, label: "ปกติ" },
                    { value: "urgent" as Urgency, label: "ด่วน" },
                    { value: "critical" as Urgency, label: "เร่งด่วน" },
                  ] as const
                ).map((u) => (
                  <button
                    key={u.value}
                    onClick={() => setUrgency(u.value)}
                    className={`py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                      urgency === u.value
                        ? "border-primary bg-secondary text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                แนบรูปภาพ (ถ้ามี)
              </label>
              <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/40 transition-colors cursor-pointer">
                <Upload className="w-6 h-6" />
                <p className="text-sm">คลิกเพื่อแนบรูปภาพ</p>
                <p className="text-xs">PNG, JPG สูงสุด 10 MB</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex-1 py-3 rounded-xl border-2 border-border font-semibold text-sm text-foreground hover:bg-secondary transition-colors"
          >
            ย้อนกลับ
          </button>
        )}
        <button
          onClick={() => {
            if (step < 3) setStep(step + 1);
            else setSubmitted(true);
          }}
          disabled={step === 1 && !selectedCategory}
          className="flex-1 py-3 rounded-xl font-semibold text-sm text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-purple-200"
          style={{ background: "linear-gradient(135deg, #5B2A86, #8B5CF6)" }}
        >
          {step < 3 ? "ถัดไป" : "ส่งคำขอ"}
        </button>
      </div>
    </div>
  );
}

// ─── My Requests View ─────────────────────────────────────────────────────────

function MyRequestsView({ onViewRequest }: { onViewRequest: (id: string) => void }) {
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [search, setSearch] = useState("");

  const filters: { key: "all" | Status; label: string }[] = [
    { key: "all", label: "ทั้งหมด" },
    { key: "pending", label: "รอดำเนินการ" },
    { key: "in-progress", label: "กำลังซ่อม" },
    { key: "completed", label: "เสร็จสิ้น" },
    { key: "cancelled", label: "ยกเลิก" },
  ];

  const filtered = MOCK_REQUESTS.filter((r) => {
    if (filter !== "all" && r.status !== filter) return false;
    if (search && !r.title.includes(search) && !r.id.includes(search)) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold text-foreground">คำขอซ่อมของฉัน</h2>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาคำขอ..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === f.key
                ? "text-white shadow-sm"
                : "bg-card border border-border text-muted-foreground hover:border-primary/40"
            }`}
            style={
              filter === f.key
                ? { background: "linear-gradient(135deg, #5B2A86, #8B5CF6)" }
                : undefined
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">ไม่พบคำขอที่ตรงกัน</p>
          </div>
        ) : (
          filtered.map((req) => (
            <RequestCard key={req.id} request={req} onClick={() => onViewRequest(req.id)} />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Request Detail View ──────────────────────────────────────────────────────

function RequestDetailView({
  requestId,
  onBack,
}: {
  requestId: string;
  onBack: () => void;
}) {
  const request = MOCK_REQUESTS.find((r) => r.id === requestId) ?? MOCK_REQUESTS[0];
  const currentStep = getStatusStep(request.status);

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-primary" />
        </button>
        <div>
          <p className="text-xs text-muted-foreground">{request.id}</p>
          <h2 className="font-semibold text-foreground">{request.title}</h2>
        </div>
      </div>

      {/* Info card */}
      <div className="bg-card rounded-2xl p-5 border border-border shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <StatusBadge status={request.status} />
          <UrgencyBadge urgency={request.urgency} />
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs mb-0.5">ประเภท</p>
            <p className="font-medium text-foreground">{request.category}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-0.5">สถานที่</p>
            <p className="font-medium text-foreground">
              {request.building} ห้อง {request.room}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-0.5">ผู้แจ้ง</p>
            <p className="font-medium text-foreground">{request.submittedBy}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-0.5">วันที่แจ้ง</p>
            <p className="font-medium text-foreground">{request.submittedDate}</p>
          </div>
        </div>

        <div>
          <p className="text-muted-foreground text-xs mb-0.5">รายละเอียด</p>
          <p className="text-sm text-foreground">{request.description}</p>
        </div>

        {request.assignedTo && (
          <div className="bg-secondary rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">ช่างผู้รับผิดชอบ</p>
              <p className="text-sm font-medium text-foreground">{request.assignedTo}</p>
            </div>
            <button className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
              <Phone className="w-4 h-4 text-primary" />
            </button>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
        <h3 className="font-semibold text-foreground mb-4">สถานะการดำเนินการ</h3>
        <div>
          {TIMELINE_STEPS.map((step, index) => {
            const done = index <= currentStep;
            const active = index === currentStep;
            return (
              <div key={step.key} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                      done ? "border-primary bg-primary" : "border-border bg-background"
                    } ${active ? "shadow-md shadow-purple-200" : ""}`}
                  >
                    {done ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <Circle className="w-3 h-3 text-muted-foreground" />
                    )}
                  </div>
                  {index < TIMELINE_STEPS.length - 1 && (
                    <div
                      className="w-0.5 h-8 my-1 rounded-full"
                      style={{
                        background:
                          done && index < currentStep ? "#5B2A86" : "#EDE8F7",
                      }}
                    />
                  )}
                </div>
                <div className="pb-3">
                  <p
                    className={`text-sm font-medium ${
                      done ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </p>
                  {active && request.updatedDate && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {request.updatedDate}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comments */}
      <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          ความคิดเห็น
        </h3>
        <div className="space-y-3">
          <div className="bg-secondary rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-primary">
                {request.assignedTo ?? "เจ้าหน้าที่"}
              </span>
              <span className="text-xs text-muted-foreground">
                {request.updatedDate ?? request.submittedDate}
              </span>
            </div>
            <p className="text-sm text-foreground">
              รับเรื่องแล้ว จะเข้าตรวจสอบในวันพรุ่งนี้ช่วงบ่าย
            </p>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="พิมพ์ความคิดเห็น..."
              className="flex-1 px-3 py-2 rounded-xl bg-input-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              className="px-4 py-2 rounded-xl text-white text-sm font-medium"
              style={{ background: "linear-gradient(135deg, #5B2A86, #8B5CF6)" }}
            >
              ส่ง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Admin View ───────────────────────────────────────────────────────────────

function AdminView({ onViewRequest }: { onViewRequest: (id: string) => void }) {
  const columns: { status: Status; label: string }[] = [
    { status: "pending", label: "รอดำเนินการ" },
    { status: "in-progress", label: "กำลังดำเนินการ" },
    { status: "completed", label: "เสร็จสิ้น" },
  ];

  const colorMap: Record<Status, string> = {
    pending: "#FBBF24",
    "in-progress": "#8B5CF6",
    completed: "#10B981",
    cancelled: "#9CA3AF",
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-semibold text-foreground">กระดานผู้ดูแล</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card border border-border rounded-xl px-3 py-1.5">
          <AlertTriangle className="w-4 h-4 text-[#FBBF24]" />
          มีคำขอเร่งด่วน 1 รายการ
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((col) => {
          const reqs = MOCK_REQUESTS.filter((r) => r.status === col.status);
          return (
            <div key={col.status} className="space-y-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: colorMap[col.status] }}
                />
                <span className="font-medium text-sm text-foreground">{col.label}</span>
                <span
                  className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                  style={{ background: colorMap[col.status] }}
                >
                  {reqs.length}
                </span>
              </div>
              <div className="space-y-2 min-h-[200px]">
                {reqs.map((req) => (
                  <button
                    key={req.id}
                    onClick={() => onViewRequest(req.id)}
                    className="w-full bg-card rounded-xl p-3 border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 text-primary">
                        <CategoryIcon category={req.category} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">{req.id}</p>
                        <p className="text-sm font-medium text-foreground truncate">
                          {req.title}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {req.building}
                      </span>
                      <UrgencyBadge urgency={req.urgency} />
                    </div>
                    {req.assignedTo && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="w-3 h-3" /> {req.assignedTo}
                      </div>
                    )}
                  </button>
                ))}
                {reqs.length === 0 && (
                  <div className="flex items-center justify-center h-24 rounded-xl border-2 border-dashed border-border text-xs text-muted-foreground">
                    ไม่มีคำขอ
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  view,
  onNavigate,
  open,
  onClose,
}: {
  view: View;
  onNavigate: (v: View) => void;
  open: boolean;
  onClose: () => void;
}) {
  const items: { view: View; label: string; icon: typeof LayoutDashboard }[] = [
    { view: "dashboard", label: "ภาพรวม", icon: LayoutDashboard },
    { view: "new-request", label: "แจ้งซ่อมใหม่", icon: PlusCircle },
    { view: "my-requests", label: "คำขอของฉัน", icon: ClipboardList },
    { view: "admin", label: "ผู้ดูแลระบบ", icon: ShieldCheck },
  ];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-60 z-30 flex flex-col transition-transform duration-300 md:relative md:translate-x-0 md:z-auto ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "linear-gradient(180deg, #5B2A86 0%, #3D1A5C 100%)" }}
      >
        {/* Logo */}
        <div className="px-5 pt-6 pb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FBBF24] flex items-center justify-center">
              <Wrench className="w-5 h-5 text-[#1E1B2E]" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">มจพ. แจ้งซ่อม</p>
              <p className="text-white/50 text-xs">ระบบแจ้งซ่อมออนไลน์</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {items.map((item) => {
            const active = view === item.view || (view === "request-detail" && item.view === "my-requests");
            return (
              <button
                key={item.view}
                onClick={() => {
                  onNavigate(item.view);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-white/15 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
                style={
                  active
                    ? { borderLeft: "3px solid #FBBF24" }
                    : { borderLeft: "3px solid transparent" }
                }
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-4 pb-5 pt-3 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">นายสมชาย วงศ์ใหญ่</p>
              <p className="text-white/50 text-xs truncate">6201234567</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState<View>("dashboard");
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleViewRequest = (id: string) => {
    setSelectedRequestId(id);
    setView("request-detail");
  };

  const handleNavigate = (v: View) => {
    setView(v);
    setSelectedRequestId(null);
  };

  const viewLabel: Record<View, string> = {
    dashboard: "ภาพรวม",
    "new-request": "แจ้งซ่อมใหม่",
    "my-requests": "คำขอของฉัน",
    "request-detail": "รายละเอียดคำขอ",
    admin: "ผู้ดูแลระบบ",
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        view={view}
        onNavigate={handleNavigate}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-card border-b border-border flex items-center px-4 gap-3 flex-shrink-0">
          <button
            className="md:hidden w-8 h-8 rounded-lg bg-secondary flex items-center justify-center"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-4 h-4 text-primary" />
          </button>
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <span>ระบบแจ้งซ่อมออนไลน์</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-medium">{viewLabel[view]}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="relative w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-muted transition-colors">
              <Bell className="w-4 h-4 text-primary" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FBBF24]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {view === "dashboard" && (
            <DashboardView
              onViewRequest={handleViewRequest}
              onNewRequest={() => handleNavigate("new-request")}
            />
          )}
          {view === "new-request" && (
            <NewRequestView onBack={() => handleNavigate("dashboard")} />
          )}
          {view === "my-requests" && (
            <MyRequestsView onViewRequest={handleViewRequest} />
          )}
          {view === "request-detail" && selectedRequestId && (
            <RequestDetailView
              requestId={selectedRequestId}
              onBack={() => handleNavigate("my-requests")}
            />
          )}
          {view === "admin" && <AdminView onViewRequest={handleViewRequest} />}
        </main>
      </div>
    </div>
  );
}
