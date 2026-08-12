"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImagePlus, X, Loader2, User, Phone, CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  BUILDINGS,
  DEPARTMENTS,
  PRIORITIES,
  type DepartmentValue,
  type PriorityValue,
} from "@/lib/repair-constants";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export default function NewTicketPage() {
  const router = useRouter();
  const { user, profile } = useAuth();

  const [department, setDepartment] = useState<DepartmentValue | "">("");
  const [priority, setPriority] = useState<PriorityValue>("normal");
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [room, setRoom] = useState("");
  const [locationNote, setLocationNote] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState<Date | undefined>(undefined);
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Fetch blocked dates when department changes
  useEffect(() => {
    async function fetchUnavailable() {
      if (!department) {
        setUnavailableDates([]);
        return;
      }
      const { data, error } = await supabase.rpc("get_unavailable_dates", { dept: department as any });
      if (data && !error) {
        setUnavailableDates(data.map((d: any) => new Date(d.unavailable_date)));
      }
    }
    fetchUnavailable();
  }, [department]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!user) {
      toast.error("กรุณาเข้าสู่ระบบก่อนแจ้งซ่อม");
      router.push("/auth");
      return;
    }

    if (!department) return toast.error("กรุณาเลือกแผนกช่างที่ต้องการแจ้ง");
    if (!building) return toast.error("กรุณาเลือกอาคารสถานที่");
    if (description.trim().length < 5) return toast.error("กรุณาระบุรายละเอียดอาการอย่างน้อย 5 ตัวอักษร");

    setSubmitting(true);

    try {
      // 1. Generate fallback ticket code in case DB sequence isn't triggered
      const randomSeq = Math.floor(1000 + Math.random() * 9000);
      const generatedCode = `RPR-${new Date().getFullYear()}-${randomSeq}`;

      // 2. Insert into Supabase `repair_tickets`
      const { data: ticket, error: ticketError } = await supabase
        .from("repair_tickets")
        .insert({
          ticket_code: generatedCode,
          reporter_id: user.id,
          department,
          priority,
          building,
          floor: floor.trim() || null,
          room: room.trim() || null,
          location_note: locationNote.trim() || null,
          description: description.trim(),
          scheduled_at: scheduledAt ? scheduledAt.toISOString() : null,
          status: "pending",
        })
        .select()
        .single();

      if (ticketError || !ticket) {
        throw new Error(ticketError?.message || "ไม่สามารถสร้างใบแจ้งซ่อมได้");
      }

      // 3. Upload files to Supabase Storage and insert to `repair_ticket_media`
      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileExt = file.name.split(".").pop();
          const filePath = `${user.id}/${ticket.id}/${Date.now()}_${i}.${fileExt}`;
          const isVideo = file.type.startsWith("video");

          const { error: uploadError } = await supabase.storage
            .from("repair-media")
            .upload(filePath, file);

          if (!uploadError) {
            await supabase.from("repair_ticket_media").insert({
              ticket_id: ticket.id,
              file_path: filePath,
              kind: isVideo ? "video" : "image",
            });
          } else {
            console.warn(`[Storage Upload Warning] ${file.name}:`, uploadError);
          }
        }
      }

      toast.success(`แจ้งซ่อมสำเร็จ! รหัสใบงาน ${ticket.ticket_code}`);
      router.push(`/tickets/${ticket.id}`);
    } catch (err) {
      console.error("[NewTicketPage] Submit error:", err);
      toast.error(`ส่งใบแจ้งซ่อมไม่สำเร็จ: ${(err as Error).message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">แจ้งซ่อมใหม่</h1>
        <p className="mt-1 text-muted-foreground">
          กรอกรายละเอียดเพื่อส่งเรื่องไปยังแผนกช่างที่เกี่ยวข้องโดยตรง
        </p>
      </div>

      {/* User Information Auto-filled Banner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">ผู้แจ้งซ่อม (ดึงข้อมูลอัตโนมัติ)</p>
              <p className="font-semibold text-foreground">
                {profile?.full_name || user?.email || "ผู้ใช้งาน"}
              </p>
            </div>
          </div>
          {profile?.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4 text-primary" />
              <span>{profile.phone}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Department Selection */}
        <Card>
          <CardHeader>
            <CardTitle>1. เลือกแผนกช่างที่เกี่ยวข้อง *</CardTitle>
            <CardDescription>ระบบจะส่งใบงานเข้าคิวของช่างประจำแผนกนั้นทันที</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {DEPARTMENTS.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => setDepartment(d.value)}
                className={cn(
                  "rounded-xl border-2 p-4 text-left transition hover:shadow-soft flex flex-col justify-between",
                  department === d.value
                    ? "border-primary bg-primary/10 shadow-elegant ring-2 ring-primary/20"
                    : "border-border bg-card hover:border-primary/40",
                )}
              >
                <div>
                  <div className="text-3xl mb-2">{d.icon}</div>
                  <div className="font-bold text-foreground">{d.label}</div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">{d.description}</div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Priority Selection */}
        <Card>
          <CardHeader>
            <CardTitle>2. ระดับความเร่งด่วน</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {PRIORITIES.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPriority(p.value)}
                className={cn(
                  "rounded-full border-2 px-5 py-2 text-sm font-semibold transition cursor-pointer",
                  priority === p.value
                    ? "border-primary bg-primary text-primary-foreground shadow-soft"
                    : "border-border bg-card text-foreground hover:border-primary/50",
                )}
              >
                {p.label}
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Location Selection */}
        <Card>
          <CardHeader>
            <CardTitle>3. สถานที่เกิดปัญหา *</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="building">อาคารสถานที่ *</Label>
              <Select value={building} onValueChange={setBuilding}>
                <SelectTrigger id="building" className="mt-1">
                  <SelectValue placeholder="-- กรุณาเลือกอาคาร --" />
                </SelectTrigger>
                <SelectContent>
                  {BUILDINGS.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="floor">ชั้น</Label>
                <Input
                  id="floor"
                  className="mt-1"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  placeholder="เช่น ชั้น 3, ชั้น G"
                />
              </div>
              <div>
                <Label htmlFor="room">เลขห้อง</Label>
                <Input
                  id="room"
                  className="mt-1"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="เช่น ห้อง 305, ห้อง Lab 2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="locationNote">จุดอ้างอิงเพิ่มเติม</Label>
              <Input
                id="locationNote"
                className="mt-1"
                value={locationNote}
                onChange={(e) => setLocationNote(e.target.value)}
                placeholder="เช่น ริมหน้าต่างฝั่งทิศใต้, ใกล้ตู้กดน้ำ"
              />
            </div>

            <div className="pt-2">
              <Label className="block mb-2">วันที่สะดวกให้เข้าซ่อม (ไม่บังคับ)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[280px] justify-start text-left font-normal",
                      !scheduledAt && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledAt ? format(scheduledAt, "PPP", { locale: th }) : <span>เลือกวันนัดหมาย</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={scheduledAt}
                    onSelect={setScheduledAt}
                    initialFocus
                    disabled={[
                      { before: new Date() }, // ป้องกันการเลือกวันในอดีต
                      ...unavailableDates,    // ป้องกันการเลือกวันที่ช่างไม่ว่าง
                    ]}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* Description & Media Upload */}
        <Card>
          <CardHeader>
            <CardTitle>4. รายละเอียดอาการชำรุด *</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="description">อธิบายปัญหา / อาการที่พบ *</Label>
              <Textarea
                id="description"
                rows={4}
                className="mt-1"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="อธิบายลักษณะสิ่งชำรุดให้ชัดเจน เช่น ไฟกะพริบไม่ติด, ก๊อกน้ำปิดไม่อยู่, บานพับประตูหลุด..."
                required
                maxLength={2000}
              />
            </div>

            <div>
              <Label className="mb-2 block">แนบรูปภาพหรือคลิปวิดีโอ (สูงสุด 10 ไฟล์)</Label>
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-8 text-center transition hover:border-primary hover:bg-muted/50">
                <ImagePlus className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">คลิกเพื่อเลือกไฟล์รูปถ่ายหรือวิดีโอ</span>
                <span className="text-xs text-muted-foreground">รองรับ JPG, PNG, MP4</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => {
                    const list = Array.from(e.target.files ?? []);
                    setFiles((prev) => [...prev, ...list].slice(0, 10));
                    e.target.value = "";
                  }}
                />
              </label>

              {files.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {files.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm"
                    >
                      <span className="truncate font-medium">{f.name} ({(f.size / 1024).toFixed(0)} KB)</span>
                      <button
                        type="button"
                        onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                        className="text-muted-foreground hover:text-destructive p-1"
                        title="ลบไฟล์นี้"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard")}
            disabled={submitting}
          >
            ยกเลิก
          </Button>
          <Button type="submit" size="lg" disabled={submitting} className="shadow-elegant min-w-36">
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              "ยืนยันส่งใบแจ้งซ่อม"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
