import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { getMockTicket, markMockTicketCompleted, mockMediaByTicket } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDepartmentMeta, getStatusMeta, getPriorityMeta, STATUSES } from "@/lib/repair-constants";

export const Route = createFileRoute("/_authenticated/tickets/$ticketId")({
  component: TicketDetailPage,
});

function TicketDetailPage() {
  const { ticketId } = Route.useParams();
  const navigate = useNavigate();
  const [, setTick] = useState(0);

  const ticket = getMockTicket(ticketId);
  if (!ticket) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            กลับหน้าหลัก
          </Link>
        </Button>
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">ไม่พบใบแจ้งซ่อม</CardContent>
        </Card>
      </div>
    );
  }

  const dept = getDepartmentMeta(ticket.department);
  const status = getStatusMeta(ticket.status);
  const prio = getPriorityMeta(ticket.priority);
  const currentIdx = STATUSES.findIndex((s) => s.value === ticket.status);
  const media = mockMediaByTicket[ticket.id] ?? [];

  function handleComplete() {
    markMockTicketCompleted(ticket!.id);
    toast.success("ปิดงานเรียบร้อย ขอบคุณครับ");
    setTick((n) => n + 1);
    setTimeout(() => navigate({ to: "/dashboard" }), 600);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link to="/dashboard">
          <ArrowLeft className="h-4 w-4" />
          กลับหน้าหลัก
        </Link>
      </Button>

      <Card className="overflow-hidden">
        <div className="bg-gradient-primary px-6 py-6 text-primary-foreground">
          <p className="font-mono text-sm opacity-90">{ticket.ticket_code}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold">
              {dept?.icon} {dept?.label}
            </h1>
            <Badge className={prio.className}>{prio.label}</Badge>
          </div>
          <p className="mt-1 text-sm opacity-90">
            แจ้งเมื่อ {new Date(ticket.created_at).toLocaleString("th-TH")}
          </p>
        </div>
        <CardContent className="space-y-4 p-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">สถานที่</p>
            <p className="font-medium">
              {ticket.building}
              {ticket.floor ? ` · ชั้น ${ticket.floor}` : ""}
              {ticket.room ? ` · ห้อง ${ticket.room}` : ""}
            </p>
            {ticket.location_note && (
              <p className="text-sm text-muted-foreground">{ticket.location_note}</p>
            )}
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">อาการ</p>
            <p className="whitespace-pre-wrap">{ticket.description}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>สถานะงาน</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {STATUSES.map((s, i) => {
              const done = i <= currentIdx;
              const active = i === currentIdx;
              return (
                <li key={s.value} className="flex items-center gap-3">
                  <span
                    className={`grid h-8 w-8 place-items-center rounded-full text-sm font-semibold ${
                      done
                        ? "bg-gradient-primary text-primary-foreground shadow-soft"
                        : "border-2 border-border bg-card text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className={active ? "font-semibold text-primary" : done ? "" : "text-muted-foreground"}>
                    {s.label}
                  </span>
                  {active && <Badge className={status.className}>ปัจจุบัน</Badge>}
                </li>
              );
            })}
          </ol>

          {ticket.status === "in_progress" && (
            <Button className="mt-6 w-full shadow-elegant" size="lg" onClick={handleComplete}>
              <CheckCircle2 className="h-4 w-4" />
              ยืนยันงานเสร็จสิ้น
            </Button>
          )}
        </CardContent>
      </Card>

      {media.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>ไฟล์แนบ</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {media.map((m) =>
              m.url ? (
                m.kind === "video" ? (
                  <video key={m.id} src={m.url} controls className="aspect-square w-full rounded-lg object-cover" />
                ) : (
                  <a key={m.id} href={m.url} target="_blank" rel="noreferrer">
                    <img
                      src={m.url}
                      alt="ไฟล์แนบ"
                      className="aspect-square w-full rounded-lg object-cover shadow-soft transition hover:scale-[1.02]"
                    />
                  </a>
                )
              ) : null,
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
