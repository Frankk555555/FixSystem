import { useState } from "react";
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  ShieldCheck,
  Wrench,
  Zap,
  Droplets,
  Lightbulb,
  Tv,
  Waves,
  Building2,
  Hammer,
  Package,
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
  Phone,
  MessageSquare,
  Camera,
  ImagePlus,
  Users,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type View = "dashboard" | "new-request" | "my-requests" | "request-detail" | "admin";
type Status = "pending" | "in-progress" | "completed" | "cancelled";
type Urgency = "normal" | "urgent" | "critical";
type DeptId = "electric" | "plumbing" | "construction";

interface SubCategory {
  id: string;
  label: string;
  icon: typeof Wrench;
}

interface Department {
  id: DeptId;
  label: string;
  shortLabel: string;
  description: string;
  color: string;
  bgLight: string;
  icon: typeof Wrench;
  categories: SubCategory[];
  technicians: string[];
}

interface RepairRequest {
  id: string;
  title: string;
  department: DeptId;
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

// ─── Department Config ────────────────────────────────────────────────────────

const DEPARTMENTS: Department[] = [
  {
    id: "electric",
    label: "แผนกไฟฟ้า",
    shortLabel: "ไฟฟ้า",
    description: "ระบบไฟฟ้า แสงสว่าง และเครื่องใช้ไฟฟ้า",
    color: "#D97706",
    bgLight: "#FEF3C7",
    icon: Zap,
    categories: [
      { id: "electric-system", label: "ระบบไฟฟ้า", icon: Zap },
      { id: "lighting", label: "แสงสว่าง", icon: Lightbulb },
      { id: "appliance", label: "เครื่องใช้ไฟฟ้า", icon: Tv },
    ],
    technicians: ["ช่างอนันต์ สุขดี", "ช่างสมบัติ ใจดี", "ช่างวิโรจน์ แก้วมณี"],
  },
  {
    id: "plumbing",
    label: "แผนกประปา",
    shortLabel: "ประปา",
    description: "ระบบประปา ท่อน้ำ และสุขภัณฑ์",
    color: "#0891B2",
    bgLight: "#CFFAFE",
    icon: Droplets,
    categories: [
      { id: "pipe", label: "ระบบประปา/ท่อน้ำ", icon: Droplets },
      { id: "sanitary", label: "สุขภัณฑ์", icon: Waves },
    ],
    technicians: ["ช่างวิชัย พรมมา", "ช่างประสิทธิ์ มงคล"],
  },
  {
    id: "construction",
    label: "แผนกซ่อมสร้าง",
    shortLabel: "ซ่อมสร้าง",
    description: "โครงสร้างอาคาร เฟอร์นิเจอร์ และงานปูน/งานไม้",
    color: "#5B2A86",
    bgLight: "#F3EEFF",
    icon: Building2,
    categories: [
      { id: "structure", label: "โครงสร้างอาคาร", icon: Building2 },
      { id: "furniture", label: "เฟอร์นิเจอร์", icon: Package },
      { id: "masonry", label: "งานปูน/งานไม้", icon: Hammer },
      { id: "general", label: "งานซ่อมทั่วไป", icon: Wrench },
    ],
    technicians: ["ช่างสมพร จันทร์ดี", "ช่างชัยวัฒน์ แสงศรี", "ช่างนิพนธ์ ดีงาม"],
  },
];

const DEPT_MAP = Object.fromEntries(DEPARTMENTS.map((d) => [d.id, d])) as Record<DeptId, Department>;

const BUILDINGS = [
  "อาคาร 40 ปี",
  "คณะวิศวกรรมศาสตร์",
  "คณะวิทยาศาสตร์ประยุกต์",
  "หอสมุด",
  "หอพักนักศึกษา",
  "อาคารบริหาร",
  "โรงอาหารกลาง",
  "อาคารเรียนรวม",
  "ศูนย์กีฬา",
];

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_REQUESTS: RepairRequest[] = [
  {
    id: "REQ-2568-0042",
    title: "ไฟฟ้าขัดข้อง ห้องปฏิบัติการ",
    department: "electric",
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
    department: "electric",
    category: "เครื่องใช้ไฟฟ้า",
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
    department: "plumbing",
    category: "ระบบประปา/ท่อน้ำ",
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
    title: "หลอดไฟห้องเรียนดับ",
    department: "electric",
    category: "แสงสว่าง",
    building: "อาคาร 40 ปี",
    room: "512",
    floor: "5",
    description: "หลอดไฟนีออนดับทั้งหมด 4 หลอด ห้องมืด ใช้สอนไม่ได้",
    status: "pending",
    urgency: "normal",
    submittedBy: "นางสาวสุภาพร ชาติไทย",
    submittedDate: "27 มิ.ย. 2568",
  },
  {
    id: "REQ-2568-0038",
    title: "ประตูห้องชำรุด ปิดไม่สนิท",
    department: "construction",
    category: "โครงสร้างอาคาร",
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
    title: "โถส้วมอุดตัน",
    department: "plumbing",
    category: "สุขภัณฑ์",
    building: "คณะวิศวกรรมศาสตร์",
    room: "ห้องน้ำชาย ชั้น 3",
    floor: "3",
    description: "โถส้วมอุดตัน ใช้การไม่ได้ทั้งห้องน้ำ",
    status: "pending",
    urgency: "urgent",
    submittedBy: "ผศ.ดร.วรรณา ศรีสุข",
    submittedDate: "27 มิ.ย. 2568",
  },
  {
    id: "REQ-2568-0036",
    title: "โต๊ะเก้าอี้ห้องเรียนชำรุด",
    department: "construction",
    category: "เฟอร์นิเจอร์",
    building: "อาคารเรียนรวม",
    room: "203",
    floor: "2",
    description: "เก้าอี้นักเรียน 5 ตัว ขาหัก อันตรายต่อนักศึกษา",
    status: "completed",
    urgency: "normal",
    submittedBy: "นายธนาธร รักษ์ไทย",
    submittedDate: "15 มิ.ย. 2568",
    assignedTo: "ช่างชัยวัฒน์ แสงศรี",
    updatedDate: "17 มิ.ย. 2568",
  },
];

const TIMELINE_STEPS = [
  { label: "ส่งคำขอ", key: "submitted" },
  { label: "รับเรื่องแล้ว", key: "received" },
  { label: "มอบหมายช่าง", key: "assigned" },
  { label: "กำลังซ่อม", key: "in-progress" },
  { label: "เสร็จสิ้น", key: "completed" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDept(id: DeptId) {
  return DEPT_MAP[id];
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
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  const map: Record<Urgency, { label: string; className: string }> = {
    normal: { label: "ทั่วไป", className: "bg-secondary text-secondary-foreground" },
    urgent: { label: "ด่วน", className: "bg-orange-100 text-orange-700" },
    critical: { label: "ด่วนที่สุด", className: "bg-red-100 text-red-700" },
  };
  const { label, className } = map[urgency];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

function DeptBadge({ deptId }: { deptId: DeptId }) {
  const dept = getDept(deptId);
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ background: dept.bgLight, color: dept.color }}
    >
      <dept.icon className="w-3 h-3" />
      {dept.shortLabel}
    </span>
  );
}

function DeptIcon({ deptId, size = "sm" }: { deptId: DeptId; size?: "sm" | "md" }) {
  const dept = getDept(deptId);
  const sz = size === "md" ? "w-10 h-10" : "w-9 h-9";
  const iconSz = size === "md" ? "w-5 h-5" : "w-4 h-4";
  return (
    <div
      className={`${sz} rounded-xl flex items-center justify-center flex-shrink-0`}
      style={{ background: dept.bgLight, color: dept.color }}
    >
      <dept.icon className={iconSz} />
    </div>
  );
}

// ─── Request Card ─────────────────────────────────────────────────────────────

function RequestCard({ request, onClick }: { request: RepairRequest; onClick: () => void }) {
  const dept = getDept(request.department);
  return (
    <button
      onClick={onClick}
      className="w-full bg-card rounded-2xl p-4 border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
      style={{ borderLeft: `3px solid ${dept.color}` }}
    >
      <div className="flex items-start gap-3">
        <DeptIcon deptId={request.department} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="text-xs text-muted-foreground font-mono">{request.id}</span>
            <DeptBadge deptId={request.department} />
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
          { label: "รอดำเนินการ", value: pending, icon: Clock, color: "#D97706" },
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

      {/* Department summary */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">สรุปตามแผนก</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {DEPARTMENTS.map((dept) => {
            const deptReqs = MOCK_REQUESTS.filter((r) => r.department === dept.id);
            const deptPending = deptReqs.filter((r) => r.status === "pending" || r.status === "in-progress").length;
            return (
              <div
                key={dept.id}
                className="bg-card rounded-2xl p-4 border border-border shadow-sm flex items-center gap-3"
                style={{ borderLeft: `4px solid ${dept.color}` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: dept.bgLight, color: dept.color }}
                >
                  <dept.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground">{dept.label}</p>
                  <p className="text-xs text-muted-foreground">{dept.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xl font-semibold" style={{ color: dept.color }}>
                    {deptReqs.length}
                  </p>
                  {deptPending > 0 && (
                    <p className="text-xs text-muted-foreground">{deptPending} รอ</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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
  const [selectedDept, setSelectedDept] = useState<DeptId | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [building, setBuilding] = useState("");
  const [room, setRoom] = useState("");
  const [floor, setFloor] = useState("");
  const [landmark, setLandmark] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState<Urgency>("normal");
  const [submitted, setSubmitted] = useState(false);

  const stepLabels = ["แผนก/ประเภท", "สถานที่", "รายละเอียด"];
  const dept = selectedDept ? getDept(selectedDept) : null;

  // Auto-routed technician preview
  const routedTech = dept ? dept.technicians[0] : null;

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-[#10B981]/10 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-[#10B981]" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">ส่งคำขอเรียบร้อยแล้ว!</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          ระบบได้ส่งงานไปยัง{dept?.label}แล้ว เจ้าหน้าที่จะติดต่อกลับภายใน 1-2 วันทำการ
        </p>
        <div className="bg-secondary rounded-xl px-5 py-3 space-y-1">
          <p className="text-xs text-muted-foreground">หมายเลขใบสั่งซ่อม</p>
          <p className="text-primary font-bold text-lg font-mono">REQ-2568-0043</p>
        </div>
        {dept && (
          <div
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
            style={{ background: dept.bgLight }}
          >
            <dept.icon className="w-4 h-4 flex-shrink-0" style={{ color: dept.color }} />
            <span style={{ color: dept.color }}>
              ส่งต่อไปยัง <strong>{dept.label}</strong> อัตโนมัติ
            </span>
          </div>
        )}
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
        <div className="flex justify-between">
          {stepLabels.map((s, i) => (
            <span
              key={s}
              className={`text-xs font-medium transition-colors ${
                i + 1 < step
                  ? "text-[#10B981]"
                  : i + 1 === step
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {i + 1 < step ? "✓ " : ""}{s}
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

      {/* Auto-routing preview chip */}
      {dept && (
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium"
          style={{ background: dept.bgLight, color: dept.color }}
        >
          <dept.icon className="w-3.5 h-3.5 flex-shrink-0" />
          <span>ส่งงานอัตโนมัติ → {dept.label}</span>
          {selectedCategory && (
            <span className="ml-1 opacity-70">· {selectedCategory}</span>
          )}
        </div>
      )}

      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
        {/* ── Step 1: Department + Sub-category ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h3 className="font-semibold text-foreground mb-1">เลือกแผนกช่าง</h3>
              <p className="text-xs text-muted-foreground mb-3">
                ระบบจะส่งงานไปยังแผนกที่เลือกโดยอัตโนมัติ
              </p>
              <div className="space-y-2.5">
                {DEPARTMENTS.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      setSelectedDept(d.id);
                      setSelectedCategory(null);
                    }}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                      selectedDept === d.id
                        ? "border-2 bg-card shadow-sm"
                        : "border-border bg-background hover:border-opacity-40"
                    }`}
                    style={
                      selectedDept === d.id
                        ? { borderColor: d.color }
                        : undefined
                    }
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: d.bgLight, color: d.color }}
                    >
                      <d.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-semibold text-sm"
                        style={{ color: selectedDept === d.id ? d.color : undefined }}
                      >
                        {d.label}
                      </p>
                      <p className="text-xs text-muted-foreground leading-tight mt-0.5">
                        {d.description}
                      </p>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        selectedDept === d.id ? "border-0" : "border-border"
                      }`}
                      style={selectedDept === d.id ? { background: d.color } : undefined}
                    >
                      {selectedDept === d.id && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-category — appears once dept selected */}
            {selectedDept && (
              <div>
                <h3 className="font-semibold text-foreground mb-2">ประเภทปัญหา</h3>
                <div className="grid grid-cols-2 gap-2">
                  {getDept(selectedDept).categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.label)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all ${
                        selectedCategory === cat.label
                          ? "border-2"
                          : "border-border bg-background hover:border-opacity-40"
                      }`}
                      style={
                        selectedCategory === cat.label
                          ? { borderColor: dept!.color, background: dept!.bgLight }
                          : undefined
                      }
                    >
                      <cat.icon
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: selectedCategory === cat.label ? dept!.color : undefined }}
                      />
                      <span
                        className="text-xs font-medium leading-tight"
                        style={{ color: selectedCategory === cat.label ? dept!.color : undefined }}
                      >
                        {cat.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Technician list preview */}
            {selectedDept && (
              <div className="rounded-xl p-3 space-y-2" style={{ background: dept!.bgLight }}>
                <p className="text-xs font-medium flex items-center gap-1.5" style={{ color: dept!.color }}>
                  <Users className="w-3.5 h-3.5" />
                  ช่างในแผนก {dept!.label}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {dept!.technicians.map((t) => (
                    <span
                      key={t}
                      className="text-xs px-2.5 py-1 rounded-full bg-white/70 font-medium"
                      style={{ color: dept!.color }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Step 2: Location ── */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-1">ระบุสถานที่</h3>
              <p className="text-xs text-muted-foreground mb-3">เลือกจากรายชื่ออาคารเพื่อป้องกันการสะกดผิด</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">อาคาร</label>
              <select
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-input-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">-- เลือกอาคาร --</option>
                {BUILDINGS.map((b) => (
                  <option key={b} value={b}>{b}</option>
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
                  placeholder="เช่น 3, B1"
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
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                จุดอ้างอิงเพิ่มเติม <span className="text-muted-foreground font-normal">(ไม่บังคับ)</span>
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="เช่น ใกล้ลิฟต์, ห้องน้ำด้านขวา"
                className="w-full px-3 py-2.5 rounded-xl bg-input-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        )}

        {/* ── Step 3: Details + Media ── */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">รายละเอียดและสื่อประกอบ</h3>

            {/* Auto-filled user info banner */}
            <div className="bg-secondary rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">ข้อมูลผู้แจ้ง (ดึงจากโปรไฟล์อัตโนมัติ)</p>
                <p className="text-sm font-medium text-foreground">นายสมชาย วงศ์ใหญ่ · 081-234-5678</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">อธิบายปัญหา / อาการชำรุด</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="อธิบายลักษณะอาการชำรุด หรือปัญหาที่พบโดยละเอียด..."
                rows={4}
                className="w-full px-3 py-2.5 rounded-xl bg-input-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">ระดับความเร่งด่วน</label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { value: "normal" as Urgency, label: "ทั่วไป", sub: "ภายใน 3-5 วัน" },
                    { value: "urgent" as Urgency, label: "ด่วน", sub: "ภายใน 1-2 วัน" },
                    { value: "critical" as Urgency, label: "ด่วนที่สุด", sub: "ภายในวันนี้" },
                  ] as const
                ).map((u) => (
                  <button
                    key={u.value}
                    onClick={() => setUrgency(u.value)}
                    className={`py-2.5 px-2 rounded-xl text-sm border-2 transition-all text-center ${
                      urgency === u.value
                        ? "border-primary bg-secondary text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    <p className="font-semibold text-xs">{u.label}</p>
                    <p className="text-xs opacity-70 mt-0.5">{u.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                แนบรูปภาพ / วิดีโอ <span className="text-muted-foreground font-normal">(ถ้ามี)</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button className="border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors">
                  <Camera className="w-5 h-5" />
                  <p className="text-xs font-medium">ถ่ายภาพ</p>
                </button>
                <button className="border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors">
                  <ImagePlus className="w-5 h-5" />
                  <p className="text-xs font-medium">เลือกจากคลัง</p>
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 text-center">
                รองรับ PNG, JPG, MP4 · สูงสุด 30 MB
              </p>
            </div>

            {/* Routing summary */}
            {dept && (
              <div
                className="rounded-xl p-3 flex items-start gap-3"
                style={{ background: dept.bgLight }}
              >
                <dept.icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: dept.color }} />
                <div>
                  <p className="text-xs font-semibold" style={{ color: dept.color }}>
                    งานนี้จะถูกส่งไปยัง {dept.label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: dept.color, opacity: 0.8 }}>
                    ช่างที่รับผิดชอบ: {routedTech}
                  </p>
                </div>
              </div>
            )}
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
          disabled={step === 1 && (!selectedDept || !selectedCategory)}
          className="flex-1 py-3 rounded-xl font-semibold text-sm text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-purple-200"
          style={{ background: "linear-gradient(135deg, #5B2A86, #8B5CF6)" }}
        >
          {step < 3 ? "ถัดไป" : "ยืนยันส่งคำขอ"}
        </button>
      </div>
    </div>
  );
}

// ─── My Requests View ─────────────────────────────────────────────────────────

function MyRequestsView({ onViewRequest }: { onViewRequest: (id: string) => void }) {
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [deptFilter, setDeptFilter] = useState<"all" | DeptId>("all");
  const [search, setSearch] = useState("");

  const statusFilters: { key: "all" | Status; label: string }[] = [
    { key: "all", label: "ทั้งหมด" },
    { key: "pending", label: "รอ" },
    { key: "in-progress", label: "กำลังซ่อม" },
    { key: "completed", label: "เสร็จ" },
    { key: "cancelled", label: "ยกเลิก" },
  ];

  const filtered = MOCK_REQUESTS.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (deptFilter !== "all" && r.department !== deptFilter) return false;
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

      {/* Dept filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setDeptFilter("all")}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
            deptFilter === "all"
              ? "bg-primary text-white border-primary"
              : "bg-card border-border text-muted-foreground hover:border-primary/40"
          }`}
        >
          ทุกแผนก
        </button>
        {DEPARTMENTS.map((d) => (
          <button
            key={d.id}
            onClick={() => setDeptFilter(d.id)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border"
            style={
              deptFilter === d.id
                ? { background: d.color, color: "#fff", borderColor: d.color }
                : { background: d.bgLight, color: d.color, borderColor: "transparent" }
            }
          >
            <d.icon className="w-3 h-3" />
            {d.shortLabel}
          </button>
        ))}
      </div>

      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {statusFilters.map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              statusFilter === f.key
                ? "text-white shadow-sm"
                : "bg-card border border-border text-muted-foreground hover:border-primary/40"
            }`}
            style={
              statusFilter === f.key
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

function RequestDetailView({ requestId, onBack }: { requestId: string; onBack: () => void }) {
  const request = MOCK_REQUESTS.find((r) => r.id === requestId) ?? MOCK_REQUESTS[0];
  const currentStep = getStatusStep(request.status);
  const dept = getDept(request.department);

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
          <p className="text-xs text-muted-foreground font-mono">{request.id}</p>
          <h2 className="font-semibold text-foreground">{request.title}</h2>
        </div>
      </div>

      {/* Info card */}
      <div className="bg-card rounded-2xl p-5 border border-border shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <StatusBadge status={request.status} />
          <div className="flex items-center gap-2">
            <DeptBadge deptId={request.department} />
            <UrgencyBadge urgency={request.urgency} />
          </div>
        </div>

        {/* Dept routing info */}
        <div
          className="rounded-xl px-4 py-3 flex items-center gap-3"
          style={{ background: dept.bgLight }}
        >
          <dept.icon className="w-4 h-4 flex-shrink-0" style={{ color: dept.color }} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold" style={{ color: dept.color }}>{dept.label}</p>
            <p className="text-xs mt-0.5" style={{ color: dept.color, opacity: 0.75 }}>
              {dept.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs mb-0.5">ประเภทปัญหา</p>
            <p className="font-medium text-foreground">{request.category}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-0.5">สถานที่</p>
            <p className="font-medium text-foreground">{request.building} ห้อง {request.room}</p>
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
              <p className="text-xs text-muted-foreground">ช่างผู้รับผิดชอบ · {dept.label}</p>
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
                      style={{ background: done && index < currentStep ? "#5B2A86" : "#EDE8F7" }}
                    />
                  )}
                </div>
                <div className="pb-3">
                  <p className={`text-sm font-medium ${done ? "text-foreground" : "text-muted-foreground"}`}>
                    {step.label}
                  </p>
                  {active && request.updatedDate && (
                    <p className="text-xs text-muted-foreground mt-0.5">{request.updatedDate}</p>
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
              <span className="text-xs font-medium text-primary">{request.assignedTo ?? "เจ้าหน้าที่"}</span>
              <span className="text-xs text-muted-foreground">{request.updatedDate ?? request.submittedDate}</span>
            </div>
            <p className="text-sm text-foreground">รับเรื่องแล้ว จะเข้าตรวจสอบในวันพรุ่งนี้ช่วงบ่าย</p>
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
  const [deptTab, setDeptTab] = useState<"all" | DeptId>("all");

  const statusCols: { status: Status; label: string; color: string }[] = [
    { status: "pending", label: "รอดำเนินการ", color: "#D97706" },
    { status: "in-progress", label: "กำลังดำเนินการ", color: "#8B5CF6" },
    { status: "completed", label: "เสร็จสิ้น", color: "#10B981" },
  ];

  const visibleReqs = deptTab === "all"
    ? MOCK_REQUESTS
    : MOCK_REQUESTS.filter((r) => r.department === deptTab);

  const critical = MOCK_REQUESTS.filter((r) => r.urgency === "critical" && r.status !== "completed");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-semibold text-foreground">กระดานผู้ดูแลระบบ</h2>
        {critical.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-[#B45309] bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5">
            <AlertTriangle className="w-4 h-4" />
            คำขอด่วนที่สุด {critical.length} รายการ
          </div>
        )}
      </div>

      {/* Department tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setDeptTab("all")}
          className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
            deptTab === "all"
              ? "bg-primary text-white border-primary"
              : "bg-card border-border text-muted-foreground hover:border-primary/30"
          }`}
        >
          ทุกแผนก ({MOCK_REQUESTS.length})
        </button>
        {DEPARTMENTS.map((d) => {
          const cnt = MOCK_REQUESTS.filter((r) => r.department === d.id).length;
          return (
            <button
              key={d.id}
              onClick={() => setDeptTab(d.id)}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all"
              style={
                deptTab === d.id
                  ? { background: d.color, color: "#fff", borderColor: d.color }
                  : { background: d.bgLight, color: d.color, borderColor: "transparent" }
              }
            >
              <d.icon className="w-3.5 h-3.5" />
              {d.label} ({cnt})
            </button>
          );
        })}
      </div>

      {/* Department info strip */}
      {deptTab !== "all" && (
        <div
          className="rounded-xl p-4 flex items-center gap-4"
          style={{ background: getDept(deptTab).bgLight }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: getDept(deptTab).color, color: "#fff" }}
          >
            {(() => { const D = getDept(deptTab); return <D.icon className="w-5 h-5" />; })()}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm" style={{ color: getDept(deptTab).color }}>
              {getDept(deptTab).label}
            </p>
            <p className="text-xs mt-0.5" style={{ color: getDept(deptTab).color, opacity: 0.75 }}>
              {getDept(deptTab).description}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-1">ช่างในแผนก</p>
            <div className="flex flex-wrap gap-1 justify-end">
              {getDept(deptTab).technicians.map((t) => (
                <span
                  key={t}
                  className="text-xs px-2 py-0.5 rounded-full bg-white/70 font-medium"
                  style={{ color: getDept(deptTab).color }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statusCols.map((col) => {
          const reqs = visibleReqs.filter((r) => r.status === col.status);
          return (
            <div key={col.status} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: col.color }} />
                <span className="font-medium text-sm text-foreground">{col.label}</span>
                <span
                  className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                  style={{ background: col.color }}
                >
                  {reqs.length}
                </span>
              </div>
              <div className="space-y-2 min-h-[180px]">
                {reqs.map((req) => {
                  const d = getDept(req.department);
                  return (
                    <button
                      key={req.id}
                      onClick={() => onViewRequest(req.id)}
                      className="w-full bg-card rounded-xl p-3 border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left"
                      style={{ borderLeft: `3px solid ${d.color}` }}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: d.bgLight, color: d.color }}
                        >
                          <d.icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground font-mono">{req.id}</p>
                          <p className="text-sm font-medium text-foreground truncate">{req.title}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {req.building}
                        </span>
                        <div className="flex items-center gap-1">
                          <DeptBadge deptId={req.department} />
                          <UrgencyBadge urgency={req.urgency} />
                        </div>
                      </div>
                      {req.assignedTo && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="w-3 h-3" /> {req.assignedTo}
                        </div>
                      )}
                    </button>
                  );
                })}
                {reqs.length === 0 && (
                  <div className="flex items-center justify-center h-20 rounded-xl border-2 border-dashed border-border text-xs text-muted-foreground">
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
        <div className="fixed inset-0 bg-black/40 z-20 md:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-30 flex flex-col transition-transform duration-300 md:relative md:translate-x-0 md:z-auto ${
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
            const active =
              view === item.view ||
              (view === "request-detail" && item.view === "my-requests");
            return (
              <button
                key={item.view}
                onClick={() => { onNavigate(item.view); onClose(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active ? "bg-white/15 text-white" : "text-white/60 hover:text-white hover:bg-white/10"
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

          {/* Department quick-access */}
          <div className="pt-4 pb-2">
            <p className="text-white/30 text-xs px-3 pb-2 uppercase tracking-wider">แผนกช่าง</p>
            {DEPARTMENTS.map((d) => {
              const pending = MOCK_REQUESTS.filter(
                (r) => r.department === d.id && r.status === "pending"
              ).length;
              return (
                <div
                  key={d.id}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-white/60 text-xs"
                >
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ background: d.bgLight, color: d.color }}
                  >
                    <d.icon className="w-3 h-3" />
                  </div>
                  <span className="flex-1">{d.label}</span>
                  {pending > 0 && (
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white"
                      style={{ background: d.color }}
                    >
                      {pending}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
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
