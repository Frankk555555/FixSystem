import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, ClipboardList, CheckCircle2, Clock, Wrench } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { mockTickets } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DEPARTMENTS,
  STATUSES,
  getDepartmentMeta,
  getStatusMeta,
  getPriorityMeta,
} from "@/lib/repair-constants";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "หน้าผู้ดูแลระบบ - ระบบแจ้งซ่อม" }] }),
  component: AdminPage,
});

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--warning, 42 96% 55%))", "hsl(var(--success, 142 71% 45%))", "hsl(var(--destructive))"];

const MONTH_TH = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

function AdminPage() {
  const tickets = mockTickets;
  const total = tickets.length;
  const completed = tickets.filter((t) => t.status === "completed").length;
  const pending = tickets.filter((t) => t.status === "pending" || t.status === "assigned").length;
  const inProgress = tickets.filter((t) => t.status === "scheduled" || t.status === "in_progress").length;

  // สรุปตามแผนก
  const byDept = DEPARTMENTS.map((d) => ({
    name: d.label,
    icon: d.icon,
    total: tickets.filter((t) => t.department === d.value).length,
    completed: tickets.filter((t) => t.department === d.value && t.status === "completed").length,
    pending: tickets.filter((t) => t.department === d.value && t.status !== "completed").length,
  }));

  // สรุปตามสถานะ (สำหรับ pie)
  const byStatus = STATUSES.map((s) => ({
    name: s.label,
    value: tickets.filter((t) => t.status === s.value).length,
  })).filter((s) => s.value > 0);

  // รายเดือน (ย้อนหลัง 6 เดือน)
  const now = new Date();
  const byMonth = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const inMonth = tickets.filter((t) => {
      const ct = new Date(t.created_at);
      return ct >= d && ct < next;
    });
    // เติมข้อมูลจำลองเพิ่มเติมสำหรับเดือนก่อน ๆ ให้กราฟมีชีวิตชีวา
    const baseline = i < 5 ? Math.floor(3 + Math.random() * 8) : 0;
    const completedM = inMonth.filter((t) => t.status === "completed").length + (i < 5 ? Math.floor(baseline * 0.7) : 0);
    const openM = inMonth.filter((t) => t.status !== "completed").length + (i < 5 ? Math.ceil(baseline * 0.3) : 0);
    return {
      month: MONTH_TH[d.getMonth()],
      เสร็จสิ้น: completedM,
      คงค้าง: openM,
    };
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary text-primary-foreground">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-3xl font-semibold">หน้าผู้ดูแลระบบ</h1>
          <p className="text-sm text-muted-foreground">รายงานสรุปการแจ้งซ่อม (ข้อมูลตัวอย่าง)</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<ClipboardList className="h-5 w-5" />} label="ใบแจ้งซ่อมทั้งหมด" value={total} tone="primary" />
        <StatCard icon={<Clock className="h-5 w-5" />} label="รอดำเนินการ" value={pending} tone="muted" />
        <StatCard icon={<Wrench className="h-5 w-5" />} label="กำลังดำเนินการ" value={inProgress} tone="accent" />
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="เสร็จสิ้น" value={completed} tone="success" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>สถิติจำแนกตามแผนก</CardTitle>
            <p className="text-sm text-muted-foreground">จำนวนใบแจ้งซ่อมของแต่ละแผนก</p>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byDept}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Legend />
                  <Bar dataKey="completed" name="เสร็จสิ้น" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="pending" name="คงค้าง" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-4 space-y-2">
              {byDept.map((d) => (
                <li key={d.name} className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-sm">
                  <span>
                    <span className="mr-2">{d.icon}</span>
                    {d.name}
                  </span>
                  <span className="font-mono">
                    <Badge variant="outline" className="mr-2">รวม {d.total}</Badge>
                    <Badge className="bg-success text-success-foreground">เสร็จ {d.completed}</Badge>
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>สัดส่วนสถานะงาน</CardTitle>
            <p className="text-sm text-muted-foreground">แบ่งตามสถานะปัจจุบัน</p>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={50} outerRadius={100} paddingAngle={2}>
                    {byStatus.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>แนวโน้มรายเดือน (6 เดือนย้อนหลัง)</CardTitle>
          <p className="text-sm text-muted-foreground">งานที่เสร็จสิ้น เทียบกับ งานคงค้างในแต่ละเดือน</p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={byMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Legend />
                <Line type="monotone" dataKey="เสร็จสิ้น" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="คงค้าง" stroke="hsl(var(--accent-foreground))" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>รายการแจ้งซ่อมล่าสุด</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {tickets.slice(0, 10).map((t) => {
              const dept = getDepartmentMeta(t.department);
              const status = getStatusMeta(t.status);
              const prio = getPriorityMeta(t.priority);
              return (
                <li key={t.id} className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-primary">{t.ticket_code}</span>
                      <Badge variant="outline">{dept?.icon} {dept?.label}</Badge>
                      <Badge className={prio.className}>{prio.label}</Badge>
                    </div>
                    <p className="line-clamp-1 text-sm">{t.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.building}
                      {t.room ? ` · ห้อง ${t.room}` : ""}
                      {" · "}
                      {new Date(t.created_at).toLocaleString("th-TH")}
                    </p>
                  </div>
                  <Badge className={status.className}>{status.label}</Badge>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
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
  tone: "primary" | "muted" | "success" | "accent";
}) {
  const toneClass =
    tone === "primary"
      ? "bg-gradient-primary text-primary-foreground"
      : tone === "success"
        ? "bg-success text-success-foreground"
        : tone === "accent"
          ? "bg-primary/15 text-primary"
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
