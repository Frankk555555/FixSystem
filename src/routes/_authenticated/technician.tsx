import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { HardHat, Clock, Wrench, CheckCircle2, MapPin } from "lucide-react";
import { mockTickets, updateMockTicketStatus, type MockTicket } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DEPARTMENTS,
  getDepartmentMeta,
  getStatusMeta,
  getPriorityMeta,
  type DepartmentValue,
} from "@/lib/repair-constants";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/technician")({
  head: () => ({
    meta: [{ title: "หน้าฝ่ายช่าง - ระบบแจ้งซ่อม" }],
  }),
  component: TechnicianPage,
});

const NEXT_STATUS: Record<MockTicket["status"], MockTicket["status"] | null> = {
  pending: "assigned",
  assigned: "scheduled",
  scheduled: "in_progress",
  in_progress: "completed",
  completed: null,
};

const NEXT_LABEL: Record<MockTicket["status"], string> = {
  pending: "รับเรื่อง",
  assigned: "นัดหมาย",
  scheduled: "เริ่มดำเนินการ",
  in_progress: "ปิดงาน (เสร็จสิ้น)",
  completed: "-",
};

function TechnicianPage() {
  const [dept, setDept] = useState<DepartmentValue | "all">("all");
  const [, setTick] = useState(0);
  const refresh = () => setTick((n) => n + 1);

  const list = dept === "all" ? mockTickets : mockTickets.filter((t) => t.department === dept);
  const active = list.filter((t) => t.status !== "completed");
  const done = list.filter((t) => t.status === "completed");

  const counts = {
    incoming: list.filter((t) => t.status === "pending").length,
    working: list.filter((t) => t.status === "assigned" || t.status === "scheduled" || t.status === "in_progress").length,
    completed: done.length,
  };

  function advance(t: MockTicket) {
    const nxt = NEXT_STATUS[t.status];
    if (!nxt) return;
    updateMockTicketStatus(t.id, nxt);
    toast.success(`อัปเดตสถานะ ${t.ticket_code} → ${getStatusMeta(nxt).label}`);
    refresh();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary text-primary-foreground">
              <HardHat className="h-5 w-5" />
            </span>
            <h1 className="text-3xl font-semibold">หน้าฝ่ายช่าง</h1>
          </div>
          <p className="mt-1 text-muted-foreground">รายการงานที่ได้รับมอบหมาย (ข้อมูลตัวอย่าง)</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<Clock className="h-5 w-5" />} label="งานเข้าใหม่" value={counts.incoming} tone="muted" />
        <StatCard icon={<Wrench className="h-5 w-5" />} label="กำลังดำเนินการ" value={counts.working} tone="primary" />
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="เสร็จสิ้น" value={counts.completed} tone="success" />
      </div>

      <Tabs value={dept} onValueChange={(v) => setDept(v as DepartmentValue | "all")}>
        <TabsList>
          <TabsTrigger value="all">ทุกแผนก</TabsTrigger>
          {DEPARTMENTS.map((d) => (
            <TabsTrigger key={d.value} value={d.value}>
              {d.icon} {d.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>งานที่ต้องดำเนินการ ({active.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {active.length === 0 ? (
            <p className="px-6 py-12 text-center text-muted-foreground">ไม่มีงานที่ต้องดำเนินการในแผนกนี้</p>
          ) : (
            <ul className="divide-y divide-border">
              {active.map((t) => (
                <TicketRow key={t.id} t={t} onAdvance={() => advance(t)} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {done.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>งานที่ปิดแล้ว ({done.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {done.map((t) => (
                <TicketRow key={t.id} t={t} onAdvance={() => advance(t)} />
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TicketRow({ t, onAdvance }: { t: MockTicket; onAdvance: () => void }) {
  const dept = getDepartmentMeta(t.department);
  const status = getStatusMeta(t.status);
  const prio = getPriorityMeta(t.priority);
  const nxt = NEXT_STATUS[t.status];

  return (
    <li className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/tickets/$ticketId"
            params={{ ticketId: t.id }}
            className="font-mono text-sm font-semibold text-primary hover:underline"
          >
            {t.ticket_code}
          </Link>
          <Badge variant="outline">
            {dept?.icon} {dept?.label}
          </Badge>
          <Badge className={prio.className}>{prio.label}</Badge>
          <Badge className={status.className}>{status.label}</Badge>
        </div>
        <p className="line-clamp-2 text-sm">{t.description}</p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {t.building}
          {t.floor ? ` · ชั้น ${t.floor}` : ""}
          {t.room ? ` · ห้อง ${t.room}` : ""}
          {" · "}
          {new Date(t.created_at).toLocaleString("th-TH")}
        </p>
      </div>
      <div className="flex gap-2 sm:flex-col sm:items-end">
        {nxt ? (
          <Button size="sm" onClick={onAdvance} className="shadow-soft">
            {NEXT_LABEL[t.status]}
          </Button>
        ) : (
          <Badge className="bg-success text-success-foreground">ปิดงานแล้ว</Badge>
        )}
        <Button asChild size="sm" variant="ghost">
          <Link to="/tickets/$ticketId" params={{ ticketId: t.id }}>
            ดูรายละเอียด
          </Link>
        </Button>
      </div>
    </li>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "muted" | "primary" | "success";
}) {
  const toneClass =
    tone === "primary"
      ? "bg-gradient-primary text-primary-foreground"
      : tone === "success"
        ? "bg-success text-success-foreground"
        : "bg-accent text-accent-foreground";
  return (
    <Card className="overflow-hidden shadow-soft">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`grid h-12 w-12 place-items-center rounded-xl ${toneClass}`}>{icon}</div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
