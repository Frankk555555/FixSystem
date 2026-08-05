"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Clock, Wrench, CheckCircle2, RefreshCw, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDepartmentMeta, getStatusMeta, getPriorityMeta } from "@/lib/repair-constants";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type RepairTicket = Tables<"repair_tickets">;

export default function DashboardPage() {
  const { user, profile, isAdmin } = useAuth();
  const [tickets, setTickets] = useState<RepairTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      let query = supabase
        .from("repair_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      // If regular user, filter only their own tickets
      if (!isAdmin) {
        query = query.eq("reporter_id", user.id);
      }

      const { data, error } = await query;
      if (error) {
        toast.error(`ดึงข้อมูลไม่สำเร็จ: ${error.message}`);
      } else {
        setTickets(data || []);
      }
    } catch (err) {
      console.error("[DashboardPage] Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const counts = {
    pending: tickets.filter((t) => t.status === "pending" || t.status === "assigned").length,
    inProgress: tickets.filter((t) => t.status === "scheduled" || t.status === "in_progress").length,
    completed: tickets.filter((t) => t.status === "completed").length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">หน้าหลัก</h1>
          <p className="mt-1 text-muted-foreground">
            ยินดีต้อนรับคุณ <strong className="text-foreground">{profile?.full_name || user?.email || "ผู้ใช้งาน"}</strong> · ติดตามสถานะงานซ่อมของคุณ
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTickets}
            disabled={loading}
            className="shadow-soft"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            รีเฟรช
          </Button>
          <Button asChild size="default" className="shadow-elegant">
            <Link href="/tickets/new" className="flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              แจ้งซ่อมใหม่
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="รอดำเนินการ (Pending)"
          value={counts.pending}
          tone="muted"
        />
        <StatCard
          icon={<Wrench className="h-5 w-5" />}
          label="กำลังดำเนินการ (In Progress)"
          value={counts.inProgress}
          tone="primary"
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="เสร็จสิ้น (Completed)"
          value={counts.completed}
          tone="success"
        />
      </div>

      {/* User Tickets List */}
      <Card className="shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>รายการแจ้งซ่อมของฉัน ({tickets.length})</CardTitle>
            <CardDescription>คลิกเพื่อดูรายละเอียดและความคืบหน้าของงาน</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center text-muted-foreground flex flex-col items-center gap-2">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              <span>กำลังโหลดข้อมูลจาก Supabase...</span>
            </div>
          ) : tickets.length === 0 ? (
            <div className="px-6 py-16 text-center space-y-3">
              <p className="text-muted-foreground">คุณยังไม่มีรายการแจ้งซ่อมในระบบ</p>
              <Button asChild className="shadow-soft">
                <Link href="/tickets/new">เริ่มแจ้งซ่อมเลย</Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {tickets.map((t) => {
                const dept = getDepartmentMeta(t.department);
                const status = getStatusMeta(t.status);
                const prio = getPriorityMeta(t.priority);
                return (
                  <li key={t.id}>
                    <Link
                      href={`/tickets/${t.id}`}
                      className="flex flex-col gap-3 px-6 py-4 transition hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="space-y-1.5">
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
