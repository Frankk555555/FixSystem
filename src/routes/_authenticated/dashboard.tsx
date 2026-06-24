import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Clock, Wrench, CheckCircle2 } from "lucide-react";
import { listMyTickets } from "@/lib/tickets.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDepartmentMeta, getStatusMeta, getPriorityMeta } from "@/lib/repair-constants";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const fetchTickets = useServerFn(listMyTickets);
  const qc = useQueryClient();
  const { data: tickets } = useSuspenseQuery({
    queryKey: ["my-tickets"],
    queryFn: () => fetchTickets(),
  });

  const counts = {
    pending: tickets.filter((t) => t.status === "pending" || t.status === "assigned").length,
    inProgress: tickets.filter((t) => t.status === "scheduled" || t.status === "in_progress").length,
    completed: tickets.filter((t) => t.status === "completed").length,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">หน้าหลัก</h1>
          <p className="mt-1 text-muted-foreground">ภาพรวมใบแจ้งซ่อมของคุณ</p>
        </div>
        <Button asChild size="lg" className="shadow-elegant">
          <Link to="/tickets/new">
            <Plus className="h-4 w-4" />
            แจ้งซ่อมใหม่
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="รอดำเนินการ"
          value={counts.pending}
          tone="muted"
        />
        <StatCard
          icon={<Wrench className="h-5 w-5" />}
          label="กำลังดำเนินการ"
          value={counts.inProgress}
          tone="primary"
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="เสร็จสิ้น"
          value={counts.completed}
          tone="success"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>ใบแจ้งซ่อมของฉัน</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => qc.invalidateQueries({ queryKey: ["my-tickets"] })}
          >
            รีเฟรช
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {tickets.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-muted-foreground">ยังไม่มีใบแจ้งซ่อม</p>
              <Button asChild className="mt-4">
                <Link to="/tickets/new">เริ่มแจ้งซ่อม</Link>
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
                      to="/tickets/$ticketId"
                      params={{ ticketId: t.id }}
                      className="flex flex-col gap-3 px-6 py-4 transition hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-sm font-semibold text-primary">
                            {t.ticket_code}
                          </span>
                          <Badge variant="outline">
                            {dept?.icon} {dept?.label}
                          </Badge>
                          <Badge className={prio.className}>{prio.label}</Badge>
                        </div>
                        <p className="line-clamp-1 text-sm text-foreground">{t.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.building}
                          {t.room ? ` · ห้อง ${t.room}` : ""}
                          {" · "}
                          {new Date(t.created_at).toLocaleString("th-TH")}
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
