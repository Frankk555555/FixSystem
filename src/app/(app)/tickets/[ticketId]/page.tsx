"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  Phone,
  Calendar,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  FileImage,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database, Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getDepartmentMeta,
  getStatusMeta,
  getPriorityMeta,
  STATUSES,
} from "@/lib/repair-constants";
import { useAuth } from "@/contexts/AuthContext";

type RepairTicket = Tables<"repair_tickets">;
type RepairTicketMedia = Tables<"repair_ticket_media"> & { publicUrl?: string };
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
  completed: "ปิดงานแล้ว",
};

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params?.ticketId as string;
  const { user, isTechnician, isAdmin, currentRole } = useAuth();

  const [ticket, setTicket] = useState<RepairTicket | null>(null);
  const [reporter, setReporter] = useState<{ full_name?: string; phone?: string; email?: string } | null>(null);
  const [mediaList, setMediaList] = useState<RepairTicketMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTicketDetails = useCallback(async () => {
    if (!ticketId) return;
    try {
      setLoading(true);

      // 1. Fetch ticket
      const { data: tData, error: tErr } = await supabase
        .from("repair_tickets")
        .select("*")
        .or(`id.eq.${ticketId},ticket_code.eq.${ticketId}`)
        .maybeSingle();

      if (tErr || !tData) {
        setTicket(null);
        return;
      }
      setTicket(tData);

      // 2. Fetch reporter profile
      if (tData.reporter_id) {
        const { data: profData } = await supabase
          .from("profiles")
          .select("full_name, phone, email")
          .eq("id", tData.reporter_id)
          .maybeSingle();
        if (profData) {
          setReporter(profData);
        }
      }

      // 3. Fetch media
      const { data: mData } = await supabase
        .from("repair_ticket_media")
        .select("*")
        .eq("ticket_id", tData.id);

      if (mData && mData.length > 0) {
        const mediaWithUrls = mData.map((m) => {
          const { data } = supabase.storage
            .from("repair-media")
            .getPublicUrl(m.file_path);
          return {
            ...m,
            publicUrl: data?.publicUrl,
          };
        });
        setMediaList(mediaWithUrls);
      } else {
        setMediaList([]);
      }
    } catch (err) {
      console.error("[TicketDetailPage] Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchTicketDetails();
  }, [fetchTicketDetails]);

  async function updateStatus(newStatus: RepairStatus) {
    if (!ticket) return;
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("repair_tickets")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", ticket.id);

      if (error) {
        toast.error(`อัปเดตสถานะไม่สำเร็จ: ${error.message}`);
      } else {
        toast.success(`อัปเดตสถานะเป็น "${getStatusMeta(newStatus).label}" เรียบร้อย`);
        setTicket((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err) {
      toast.error("เกิดข้อผิดพลาดในการอัปเดต");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 py-16 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">กำลังโหลดข้อมูลใบแจ้งซ่อม...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            กลับหน้าหลัก
          </Link>
        </Button>
        <Card className="shadow-soft">
          <CardContent className="py-16 text-center space-y-3">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="text-xl font-semibold">ไม่พบข้อมูลใบแจ้งซ่อม</h2>
            <p className="text-sm text-muted-foreground">รหัสใบงานไม่ถูกต้อง หรือถูกลบออกจากระบบแล้ว</p>
            <Button asChild className="mt-2">
              <Link href="/dashboard">กลับหน้าหลัก</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dept = getDepartmentMeta(ticket.department);
  const status = getStatusMeta(ticket.status);
  const prio = getPriorityMeta(ticket.priority);
  const currentIdx = STATUSES.findIndex((s) => s.value === ticket.status);
  const nextStatus = NEXT_STATUS[ticket.status];
  const isReporter = user?.id === ticket.reporter_id;
  const canManageTicket = isTechnician || isAdmin;

  const backLink = isTechnician ? "/technician" : isAdmin ? "/admin" : "/dashboard";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back Navigation */}
      <Button asChild variant="ghost" size="sm">
        <Link href={backLink} className="flex items-center gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          <span>กลับไปยังรายการ</span>
        </Link>
      </Button>

      {/* Ticket Header Card */}
      <Card className="overflow-hidden shadow-soft border-border/80">
        <div className="bg-gradient-primary px-6 py-6 text-primary-foreground">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-sm font-semibold tracking-wider bg-black/20 px-2.5 py-0.5 rounded-full backdrop-blur">
              {ticket.ticket_code}
            </span>
            <span className="text-xs opacity-90">
              แจ้งเมื่อ {new Date(ticket.created_at).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold">
              {dept?.icon} {dept?.label}
            </h1>
            <Badge className={prio.className}>{prio.label}</Badge>
            <Badge className={status.className}>{status.label}</Badge>
          </div>
        </div>

        <CardContent className="space-y-5 p-6">
          {/* Location Details */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">สถานที่เกิดเหตุ</p>
            <p className="mt-1 font-semibold text-foreground flex items-center gap-1.5 text-base">
              <MapPin className="h-4 w-4 text-primary" />
              {ticket.building}
              {ticket.floor ? ` · ชั้น ${ticket.floor}` : ""}
              {ticket.room ? ` · ห้อง ${ticket.room}` : ""}
            </p>
            {ticket.location_note && (
              <p className="text-sm text-muted-foreground mt-0.5 pl-5.5">
                จุดอ้างอิง: {ticket.location_note}
              </p>
            )}
          </div>

          {/* Issue Description */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">รายละเอียดปัญหา / อาการ</p>
            <p className="mt-1 whitespace-pre-wrap rounded-lg bg-muted/40 p-3.5 text-sm leading-relaxed text-foreground border border-border/60">
              {ticket.description}
            </p>
          </div>

          {/* Reporter Contact Info */}
          <div className="rounded-lg border bg-card/60 p-3.5 text-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">ผู้แจ้ง:</span>
              <span className="font-medium">{reporter?.full_name || "ผู้ใช้งาน"}</span>
            </div>
            {reporter?.phone && (
              <div className="flex items-center gap-1.5 text-primary">
                <Phone className="h-4 w-4" />
                <a href={`tel:${reporter.phone}`} className="hover:underline font-medium">
                  {reporter.phone}
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress Timeline */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            ความคืบหน้าการซ่อม (5 ขั้นตอน)
          </CardTitle>
          <CardDescription>
            สถานะปัจจุบัน: <strong className="text-foreground">{status.label}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3.5">
            {STATUSES.map((s, i) => {
              const done = i <= currentIdx;
              const active = i === currentIdx;
              return (
                <li key={s.value} className="flex items-center gap-3.5">
                  <span
                    className={`grid h-8 w-8 place-items-center rounded-full text-sm font-semibold transition ${
                      done
                        ? "bg-gradient-primary text-primary-foreground shadow-soft"
                        : "border-2 border-border bg-card text-muted-foreground"
                    }`}
                  >
                    {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </span>
                  <span
                    className={`text-sm ${
                      active
                        ? "font-bold text-primary"
                        : done
                          ? "font-medium text-foreground"
                          : "text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </span>
                  {active && <Badge className={status.className}>ขั้นตอนปัจจุบัน</Badge>}
                </li>
              );
            })}
          </ol>

          {/* Action Buttons for Technician / Admin */}
          {canManageTicket && nextStatus && (
            <div className="mt-6 pt-4 border-t space-y-2">
              <p className="text-xs text-muted-foreground font-medium">
                การดำเนินการสำหรับช่าง ({getDepartmentMeta(ticket.department)?.label}):
              </p>
              <Button
                className="w-full shadow-elegant"
                size="lg"
                onClick={() => updateStatus(nextStatus)}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ArrowRight className="h-4 w-4 mr-2" />
                )}
                เลื่อนสถานะเป็น: {NEXT_LABEL[ticket.status]}
              </Button>
            </div>
          )}

          {/* Reporter Confirm Completion button */}
          {(isReporter || !canManageTicket) && ticket.status === "in_progress" && (
            <div className="mt-6 pt-4 border-t">
              <Button
                className="w-full shadow-elegant bg-success text-success-foreground hover:bg-success/90"
                size="lg"
                onClick={() => updateStatus("completed")}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                ยืนยันการซ่อมเสร็จสิ้น (ปิดงาน)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Media Attachments Gallery */}
      {mediaList.length > 0 && (
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileImage className="h-5 w-5 text-primary" />
              ไฟล์รูปภาพ / วิดีโอแนบ ({mediaList.length} ไฟล์)
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {mediaList.map((m) =>
              m.publicUrl ? (
                m.kind === "video" ? (
                  <video
                    key={m.id}
                    src={m.publicUrl}
                    controls
                    className="aspect-square w-full rounded-xl object-cover border"
                  />
                ) : (
                  <a key={m.id} href={m.publicUrl} target="_blank" rel="noreferrer" className="block group">
                    <img
                      src={m.publicUrl}
                      alt="ไฟล์แนบการแจ้งซ่อม"
                      className="aspect-square w-full rounded-xl object-cover border shadow-soft transition group-hover:scale-[1.02]"
                    />
                  </a>
                )
              ) : null
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
