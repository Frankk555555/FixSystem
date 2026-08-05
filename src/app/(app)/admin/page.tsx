"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ClipboardList,
  CheckCircle2,
  Clock,
  Wrench,
  RefreshCw,
  Zap,
  Droplets,
  Hammer,
  BarChart3,
  TrendingUp,
  MapPin,
} from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DEPARTMENTS,
  STATUSES,
  getDepartmentMeta,
  getStatusMeta,
  getPriorityMeta,
} from "@/lib/repair-constants";
import { toast } from "sonner";

type RepairTicket = Tables<"repair_tickets">;

const PIE_COLORS = ["#F59E0B", "#3B82F6", "#8B5CF6", "#10B981", "#64748B"];
const MONTH_TH = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

export default function AdminPage() {
  const [tickets, setTickets] = useState<RepairTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("repair_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error(`ดึงข้อมูลไม่สำเร็จ: ${error.message}`);
      } else {
        setTickets(data || []);
      }
    } catch (err) {
      console.error("[AdminPage] Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const total = tickets.length;
  const completed = tickets.filter((t) => t.status === "completed").length;
  const pending = tickets.filter((t) => t.status === "pending" || t.status === "assigned").length;
  const inProgress = tickets.filter((t) => t.status === "scheduled" || t.status === "in_progress").length;

  // Stats by department
  const byDept = DEPARTMENTS.map((d) => {
    const deptTickets = tickets.filter((t) => t.department === d.value);
    return {
      name: d.label,
      icon: d.icon,
      value: d.value,
      total: deptTickets.length,
      completed: deptTickets.filter((t) => t.status === "completed").length,
      pending: deptTickets.filter((t) => t.status !== "completed").length,
    };
  });

  // Stats by status for PieChart
  const byStatus = STATUSES.map((s) => {
    const count = tickets.filter((t) => t.status === s.value).length;
    return {
      name: s.label,
      value: count,
    };
  }).filter((s) => s.value > 0);

  // Monthly trend (past 6 months)
  const now = new Date();
  const byMonth = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const inMonth = tickets.filter((t) => {
      const ct = new Date(t.created_at);
      return ct >= d && ct < nextMonth;
    });

    const completedM = inMonth.filter((t) => t.status === "completed").length;
    const openM = inMonth.filter((t) => t.status !== "completed").length;
    return {
      month: MONTH_TH[d.getMonth()],
      เสร็จสิ้น: completedM,
      คงค้าง: openM,
    };
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-3xl font-semibold">หน้าผู้ดูแลระบบ (Admin)</h1>
            <p className="text-sm text-muted-foreground">
              รายงานสถิติและภาพรวมการแจ้งซ่อมทั่วทั้งมหาวิทยาลัย (Supabase Realtime)
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchTickets}
          disabled={loading}
          className="shadow-soft"
        >
          <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          รีเฟรชข้อมูล
        </Button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<ClipboardList className="h-5 w-5" />}
          label="ใบแจ้งซ่อมทั้งหมด"
          value={total}
          tone="primary"
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="รอดำเนินการ (Pending)"
          value={pending}
          tone="muted"
        />
        <StatCard
          icon={<Wrench className="h-5 w-5" />}
          label="กำลังดำเนินการ (Working)"
          value={inProgress}
          tone="accent"
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="เสร็จสิ้นแล้ว (Completed)"
          value={completed}
          tone="success"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Department Stats Bar Chart */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              สถิติจำแนกตามแผนกช่าง
            </CardTitle>
            <CardDescription>เปรียบเทียบจำนวนงานเสร็จสิ้นและงานคงค้างใน 3 แผนก</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byDept}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.2)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: 8,
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="completed" name="เสร็จสิ้น" fill="#10B981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="pending" name="คงค้าง" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <ul className="mt-4 space-y-2">
              {byDept.map((d) => (
                <li
                  key={d.name}
                  className="flex items-center justify-between rounded-lg border bg-card/60 px-3 py-2 text-sm"
                >
                  <span className="font-medium flex items-center gap-2">
                    <span className="text-lg">{d.icon}</span>
                    <span>{d.name}</span>
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <Badge variant="outline">รวม {d.total}</Badge>
                    <Badge className="bg-success text-success-foreground">เสร็จ {d.completed}</Badge>
                    <Badge variant="secondary">ค้าง {d.pending}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Status Distribution Pie Chart */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              สัดส่วนสถานะใบงานทั้งหมด
            </CardTitle>
            <CardDescription>สัดส่วนเปอร์เซ็นต์ตามสถานะปัจจุบันในระบบ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 flex items-center justify-center">
              {byStatus.length === 0 ? (
                <p className="text-sm text-muted-foreground">ยังไม่มีข้อมูลสถานะ</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={byStatus}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={95}
                      paddingAngle={3}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {byStatus.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: 8,
                        color: "hsl(var(--foreground))",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend Chart */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            แนวโน้มการแจ้งซ่อมรายเดือน (6 เดือนย้อนหลัง)
          </CardTitle>
          <CardDescription>เปรียบเทียบปริมาณงานเสร็จสิ้น เทียบกับ งานที่รอดำเนินการ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={byMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.2)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: 8,
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="เสร็จสิ้น" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="คงค้าง" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Tickets List */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>รายการแจ้งซ่อมล่าสุดทุกแผนก ({tickets.length})</CardTitle>
          <CardDescription>คลิกรายการเพื่อตรวจสอบข้อมูลและประวัติการดำเนินงาน</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center text-muted-foreground flex flex-col items-center gap-2">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              <span>กำลังโหลดข้อมูลจาก Supabase...</span>
            </div>
          ) : tickets.length === 0 ? (
            <p className="px-6 py-12 text-center text-muted-foreground">ยังไม่มีรายการแจ้งซ่อมในระบบ</p>
          ) : (
            <ul className="divide-y divide-border">
              {tickets.slice(0, 15).map((t) => {
                const dept = getDepartmentMeta(t.department);
                const status = getStatusMeta(t.status);
                const prio = getPriorityMeta(t.priority);
                return (
                  <li key={t.id}>
                    <Link
                      href={`/tickets/${t.id}`}
                      className="flex flex-col gap-2 px-6 py-4 transition hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-sm font-bold text-primary">{t.ticket_code}</span>
                          <Badge variant="outline" className="gap-1">
                            {dept?.icon} {dept?.label}
                          </Badge>
                          <Badge className={prio.className}>{prio.label}</Badge>
                        </div>
                        <p className="line-clamp-1 text-sm font-medium text-foreground">{t.description}</p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {t.building}
                          {t.room ? ` · ห้อง ${t.room}` : ""}
                          {" · "}
                          {new Date(t.created_at).toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" })}
                        </p>
                      </div>
                      <Badge className={status.className}>{status.label}</Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
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
