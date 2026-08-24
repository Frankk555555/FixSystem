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
  Eye,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Play,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database, Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  getDepartmentMeta,
  getStatusMeta,
  getPriorityMeta,
  STATUSES,
} from "@/lib/repair-constants";
import { useAuth } from "@/contexts/AuthContext";
import { TicketChat } from "@/components/chat/TicketChat";

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
  const [selectedMediaIdx, setSelectedMediaIdx] = useState<number | null>(null);
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
            publicUrl: data.publicUrl,
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
        toast.success(`อัปเดตสถานะเป็น "${getStatusMeta(newStatus).label}" เรียบร้อยแล้ว`);
        await fetchTicketDetails();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">กำลังโหลดข้อมูลใบแจ้งซ่อม...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="mx-auto max-w-lg text-center py-16 space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold">ไม่พบข้อมูลใบแจ้งซ่อม</h2>
        <p className="text-sm text-muted-foreground">
          รหัสหรือข้อมูลใบแจ้งซ่อมนี้อาจไม่มีอยู่ในระบบ หรือคุณไม่มีสิทธิ์เข้าถึง
        </p>
        <div className="pt-2">
          <Button asChild variant="outline">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" /> กลับไปหน้าหลัก
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const dept = getDepartmentMeta(ticket.department);
  const status = getStatusMeta(ticket.status);
  const priority = getPriorityMeta(ticket.priority);
  const nextStatus = NEXT_STATUS[ticket.status];

  // Technician authorization for this ticket
  const isTechnicianForDept =
    isTechnician &&
    (currentRole === `technician_${ticket.department}` || currentRole === "technician_general");
  const canManageTicket = isAdmin || isTechnicianForDept;
  const isReporter = user?.id === ticket.reporter_id;

  const currentIdx = STATUSES.findIndex((s) => s.value === ticket.status);

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {ticket.ticket_code}
              </h1>
              <Badge className={priority.className}>{priority.label}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              สร้างเมื่อ: {new Date(ticket.created_at).toLocaleString("th-TH")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className={`${status.className} px-3 py-1 text-xs font-semibold`}>
            {status.label}
          </Badge>
          {canManageTicket && (
            <Badge variant="outline" className="border-primary/40 text-primary text-xs">
              <ShieldCheck className="h-3 w-3 mr-1" />
              {isAdmin ? "ผู้ดูแลระบบ" : "ช่างผู้รับผิดชอบ"}
            </Badge>
          )}
        </div>
      </div>

      {/* Ticket Main Info */}
      <Card className="shadow-soft overflow-hidden border-border/80">
        <div className="h-2 bg-gradient-to-r from-primary to-accent" />
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <span>{dept?.icon}</span>
              <span>{dept?.label}</span>
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              อัปเดตล่าสุด: {new Date(ticket.updated_at).toLocaleString("th-TH")}
            </span>
          </div>
          <CardDescription>{dept?.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Location Summary */}
          <div className="rounded-xl bg-muted/50 p-4 border border-border/50 space-y-2">
            <div className="flex items-start gap-2.5">
              <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold text-sm text-foreground">{ticket.building}</p>
                <p className="text-xs text-muted-foreground">
                  {ticket.floor ? `ชั้น ${ticket.floor}` : ""}{" "}
                  {ticket.room ? `· ห้อง ${ticket.room}` : ""}
                </p>
              </div>
            </div>
            {ticket.location_note && (
              <p className="text-xs text-muted-foreground pl-7 pt-1 border-t border-border/40">
                จุดสังเกต: <span className="text-foreground">{ticket.location_note}</span>
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
              <span className="font-medium">{reporter?.full_name || reporter?.email || "ผู้ใช้งาน"}</span>
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
        <Card className="shadow-soft overflow-hidden">
          <CardHeader className="bg-muted/20 border-b pb-4">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileImage className="h-5 w-5 text-primary" />
                ไฟล์รูปภาพ / วิดีโอแนบ ({mediaList.length} ไฟล์)
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                คลิกที่รูปเพื่อดูขนาดใหญ่
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4">
              {mediaList.map((m, idx) =>
                m.publicUrl ? (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMediaIdx(idx)}
                    className="group relative aspect-square w-full cursor-pointer overflow-hidden rounded-xl border border-border/80 bg-muted shadow-sm transition hover:shadow-md hover:border-primary/50"
                  >
                    {m.kind === "video" ? (
                      <div className="relative h-full w-full bg-black/90 flex items-center justify-center">
                        <video
                          src={m.publicUrl}
                          className="h-full w-full object-cover opacity-80 pointer-events-none"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition">
                          <span className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition group-hover:scale-110">
                            <Play className="h-5 w-5 fill-current ml-0.5" />
                          </span>
                        </div>
                        <Badge className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5">
                          วิดีโอ
                        </Badge>
                      </div>
                    ) : (
                      <>
                        <img
                          src={m.publicUrl}
                          alt="ไฟล์แนบการแจ้งซ่อม"
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                          <span className="flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                            <Eye className="h-3.5 w-3.5" /> ดูภาพใหญ่
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                ) : null
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lightbox Modal */}
      <Dialog
        open={selectedMediaIdx !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedMediaIdx(null);
        }}
      >
        <DialogContent className="max-w-4xl p-2 sm:p-4 bg-background/95 backdrop-blur-md border-border">
          {selectedMediaIdx !== null && mediaList[selectedMediaIdx] && (
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between px-2 pt-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {mediaList[selectedMediaIdx].kind === "video" ? "วิดีโอ" : "รูปภาพ"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    ไฟล์ที่ {selectedMediaIdx + 1} จาก {mediaList.length}
                  </span>
                </div>
                {mediaList[selectedMediaIdx].publicUrl && (
                  <a
                    href={mediaList[selectedMediaIdx].publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline mr-6 font-medium"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    เปิดแท็บใหม่
                  </a>
                )}
              </div>

              <div className="relative flex items-center justify-center overflow-hidden rounded-lg bg-black/90 min-h-[320px] max-h-[75vh]">
                {mediaList[selectedMediaIdx].kind === "video" ? (
                  <video
                    src={mediaList[selectedMediaIdx].publicUrl}
                    controls
                    autoPlay
                    className="max-h-[70vh] w-full object-contain rounded-md"
                  />
                ) : (
                  <img
                    src={mediaList[selectedMediaIdx].publicUrl}
                    alt="ไฟล์แนบการแจ้งซ่อมขนาดเต็ม"
                    className="max-h-[70vh] w-full object-contain rounded-md"
                  />
                )}

                {/* Prev / Next buttons if multiple files */}
                {mediaList.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMediaIdx((prev) =>
                          prev !== null ? (prev - 1 + mediaList.length) % mediaList.length : 0
                        );
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition"
                      aria-label="ก่อนหน้า"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMediaIdx((prev) =>
                          prev !== null ? (prev + 1) % mediaList.length : 0
                        );
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition"
                      aria-label="ถัดไป"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Realtime Chat Component */}
      <div className="mt-6">
        <TicketChat ticketId={ticket.id} />
      </div>
    </div>
  );
}
