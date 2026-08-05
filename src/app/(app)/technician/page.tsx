"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  HardHat,
  Clock,
  Wrench,
  CheckCircle2,
  MapPin,
  RefreshCw,
  Zap,
  Droplets,
  Hammer,
  ArrowRight,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database, Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type RepairTicket = Tables<"repair_tickets">;
type RepairStatus = Database["public"]["Enums"]["repair_status"];

const NEXT_STATUS: Record<RepairStatus, RepairStatus | null> = {
  pending: "assigned",
  assigned: "scheduled",
  scheduled: "in_progress",
  in_progress: "completed",
  completed: null,
};

const NEXT_LABEL: Record<RepairStatus, string> = {
  pending: "รับเรื่อง (Assigned)",
  assigned: "นัดหมาย (Scheduled)",
  scheduled: "เริ่มดำเนินการ (In Progress)",
  in_progress: "ปิดงานเสร็จสิ้น (Completed)",
  completed: "เสร็จสิ้น",
};

export default function TechnicianPage() {
  const { currentRole, department: authDept, isAdmin } = useAuth();

  // Selected department tab: default to logged in technician's department if available
  const [selectedDept, setSelectedDept] = useState<DepartmentValue | "all">("all");
  const [tickets, setTickets] = useState<RepairTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [advancingId, setAdvancingId] = useState<string | null>(null);

  // Set default tab when role/department loads
  useEffect(() => {
    if (authDept) {
      setSelectedDept(authDept);
    } else if (isAdmin) {
      setSelectedDept("all");
    }
  }, [authDept, isAdmin]);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("repair_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) {
        toast.error(`ดึงข้อมูลไม่สำเร็จ: ${error.message}`);
      } else {
        setTickets(data || []);
      }
    } catch (err) {
      console.error("[TechnicianPage] Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Filter tickets by selected department
  const filteredList =
    selectedDept === "all"
      ? tickets
      : tickets.filter((t) => t.department === selectedDept);

  const activeTickets = filteredList.filter((t) => t.status !== "completed");
  const completedTickets = filteredList.filter((t) => t.status === "completed");

  const counts = {
    incoming: filteredList.filter((t) => t.status === "pending").length,
    working: filteredList.filter(
      (t) =>
        t.status === "assigned" ||
        t.status === "scheduled" ||
        t.status === "in_progress"
    ).length,
    completed: completedTickets.length,
  };

  async function advanceStatus(t: RepairTicket) {
    const next = NEXT_STATUS[t.status];
    if (!next) return;

    setAdvancingId(t.id);
    try {
      const { error } = await supabase
        .from("repair_tickets")
        .update({ status: next, updated_at: new Date().toISOString() })
        .eq("id", t.id);

      if (error) {
        toast.error(`อัปเดตสถานะไม่สำเร็จ: ${error.message}`);
      } else {
        toast.success(`อัปเดตสถานะ ${t.ticket_code} เป็น "${getStatusMeta(next).label}"`);
        setTickets((prev) =>
          prev.map((item) => (item.id === t.id ? { ...item, status: next } : item))
        );
      }
    } catch (err) {
      console.error("[TechnicianPage] Update status error:", err);
      toast.error("เกิดข้อผิดพลาดในการอัปเดต");
    } finally {
      setAdvancingId(null);
    }
  }

  function getDepartmentTitle(role: string) {
    if (role === "technician_electric") return "แผนกไฟฟ้า (Electric Department)";
    if (role === "technician_plumbing") return "แผนกประปา (Plumbing Department)";
    if (role === "technician_general") return "แผนกซ่อมสร้าง (General/Building Department)";
    if (role === "admin") return "ผู้ดูแลระบบ — ภาพรวมงานช่างทุกแผนก";
    return "งานฝ่ายช่างเทคนิค";
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
              <HardHat className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-3xl font-semibold">หน้าฝ่ายช่าง</h1>
              <p className="text-sm font-medium text-primary">
                {getDepartmentTitle(currentRole)}
              </p>
            </div>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            จัดการและอัปเดตสถานะใบแจ้งซ่อมตามขั้นตอนการทำงาน
          </p>
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

      {/* KPI Counters */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="งานเข้าใหม่ (Pending)"
          value={counts.incoming}
          tone="muted"
        />
        <StatCard
          icon={<Wrench className="h-5 w-5" />}
          label="กำลังดำเนินการ (Working)"
          value={counts.working}
          tone="primary"
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="เสร็จสิ้น (Completed)"
          value={counts.completed}
          tone="success"
        />
      </div>

      {/* Department Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={selectedDept}
          onValueChange={(v) => setSelectedDept(v as DepartmentValue | "all")}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full sm:w-auto">
            <TabsTrigger value="all">ทุกแผนก ({tickets.length})</TabsTrigger>
            {DEPARTMENTS.map((d) => {
              const count = tickets.filter((t) => t.department === d.value).length;
              return (
                <TabsTrigger key={d.value} value={d.value} className="flex items-center gap-1.5">
                  <span>{d.icon}</span>
                  <span>{d.label}</span>
                  <span className="text-xs opacity-70">({count})</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>

      {/* Active Tickets List */}
      <Card className="shadow-soft">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">งานที่ต้องดำเนินการ ({activeTickets.length})</CardTitle>
              <CardDescription>
                คลิกปุ่มเพื่อเลื่อนสถานะงานตามลำดับ: รับเรื่อง → นัดหมาย → เริ่มงาน → ปิดงาน
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center text-muted-foreground flex flex-col items-center gap-2">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              <span>กำลังโหลดรายการแจ้งซ่อมจาก Supabase...</span>
            </div>
          ) : activeTickets.length === 0 ? (
            <div className="px-6 py-16 text-center text-muted-foreground space-y-2">
              <CheckCircle2 className="mx-auto h-10 w-10 text-success opacity-80" />
              <p className="font-medium text-foreground">ไม่มีงานคงค้างในแผนกนี้</p>
              <p className="text-sm">เมื่อมีผู้แจ้งซ่อมเข้ามา งานใหม่จะปรากฏที่นี่โดยอัตโนมัติ</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {activeTickets.map((t) => (
                <TicketRow
                  key={t.id}
                  ticket={t}
                  onAdvance={() => advanceStatus(t)}
                  isAdvancing={advancingId === t.id}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Completed Tickets List */}
      {completedTickets.length > 0 && (
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">ประวัติงานที่ปิดแล้ว ({completedTickets.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {completedTickets.map((t) => (
                <TicketRow
                  key={t.id}
                  ticket={t}
                  onAdvance={() => {}}
                  isAdvancing={false}
                />
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TicketRow({
  ticket,
  onAdvance,
  isAdvancing,
}: {
  ticket: RepairTicket;
  onAdvance: () => void;
  isAdvancing: boolean;
}) {
  const dept = getDepartmentMeta(ticket.department);
  const status = getStatusMeta(ticket.status);
  const prio = getPriorityMeta(ticket.priority);
  const nextStatus = NEXT_STATUS[ticket.status];

  return (
    <li className="flex flex-col gap-3 px-6 py-4 transition hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/tickets/${ticket.id}`}
            className="font-mono text-sm font-bold text-primary hover:underline"
          >
            {ticket.ticket_code}
          </Link>
          <Badge variant="outline" className="gap-1">
            {dept?.icon} {dept?.label}
          </Badge>
          <Badge className={prio.className}>{prio.label}</Badge>
          <Badge className={status.className}>{status.label}</Badge>
        </div>

        <p className="line-clamp-2 text-sm text-foreground">{ticket.description}</p>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            {ticket.building}
            {ticket.floor ? ` · ชั้น ${ticket.floor}` : ""}
            {ticket.room ? ` · ห้อง ${ticket.room}` : ""}
          </span>
          {ticket.location_note && (
            <span className="text-muted-foreground">({ticket.location_note})</span>
          )}
          <span>
            · {new Date(ticket.created_at).toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" })}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
        {nextStatus ? (
          <Button
            size="sm"
            onClick={onAdvance}
            disabled={isAdvancing}
            className="shadow-soft whitespace-nowrap"
          >
            {isAdvancing ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1" />
            ) : (
              <ArrowRight className="h-3.5 w-3.5 mr-1" />
            )}
            {NEXT_LABEL[ticket.status]}
          </Button>
        ) : (
          <Badge className="bg-success text-success-foreground">ปิดงานแล้ว</Badge>
        )}

        <Button asChild size="sm" variant="ghost">
          <Link href={`/tickets/${ticket.id}`}>ดูรายละเอียด</Link>
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
