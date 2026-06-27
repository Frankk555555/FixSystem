import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { addMockTicket, mockMediaByTicket } from "@/lib/mock-data";
import {
  BUILDINGS,
  DEPARTMENTS,
  PRIORITIES,
  type DepartmentValue,
  type PriorityValue,
} from "@/lib/repair-constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/tickets/new")({
  component: NewTicketPage,
});

function NewTicketPage() {
  const navigate = useNavigate();

  const [department, setDepartment] = useState<DepartmentValue | "">("");
  const [priority, setPriority] = useState<PriorityValue>("normal");
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [room, setRoom] = useState("");
  const [locationNote, setLocationNote] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!department) return toast.error("กรุณาเลือกแผนก");
    if (!building) return toast.error("กรุณาเลือกอาคาร");
    if (description.trim().length < 5) return toast.error("อธิบายอาการอย่างน้อย 5 ตัวอักษร");

    setSubmitting(true);
    setTimeout(() => {
      const ticket = addMockTicket({
        department,
        priority,
        building,
        floor: floor || null,
        room: room || null,
        location_note: locationNote || null,
        description,
      });
      if (files.length > 0) {
        mockMediaByTicket[ticket.id] = files.map((f, i) => ({
          id: `${ticket.id}-${i}`,
          file_path: f.name,
          kind: f.type.startsWith("video") ? "video" : "image",
          url: URL.createObjectURL(f),
          created_at: new Date().toISOString(),
        }));
      }
      toast.success(`แจ้งซ่อมสำเร็จ! หมายเลข ${ticket.ticket_code}`);
      navigate({ to: "/tickets/$ticketId", params: { ticketId: ticket.id } });
    }, 400);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">แจ้งซ่อมใหม่</h1>
        <p className="mt-1 text-muted-foreground">กรอกรายละเอียดเพื่อส่งเรื่องให้แผนกช่างที่เกี่ยวข้อง</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>เลือกแผนกช่าง</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {DEPARTMENTS.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => setDepartment(d.value)}
                className={cn(
                  "rounded-xl border-2 p-4 text-left transition hover:shadow-soft",
                  department === d.value
                    ? "border-primary bg-primary/5 shadow-elegant"
                    : "border-border bg-card",
                )}
              >
                <div className="text-3xl">{d.icon}</div>
                <div className="mt-2 font-semibold">{d.label}</div>
                <div className="text-xs text-muted-foreground">{d.description}</div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ระดับความเร่งด่วน</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {PRIORITIES.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPriority(p.value)}
                className={cn(
                  "rounded-full border-2 px-5 py-2 text-sm font-medium transition",
                  priority === p.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-primary/50",
                )}
              >
                {p.label}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>สถานที่</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>อาคาร *</Label>
              <Select value={building} onValueChange={setBuilding}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="เลือกอาคาร" />
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
                <Label>ชั้น</Label>
                <Input className="mt-1" value={floor} onChange={(e) => setFloor(e.target.value)} placeholder="เช่น 3" />
              </div>
              <div>
                <Label>เลขห้อง</Label>
                <Input className="mt-1" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="เช่น 305" />
              </div>
            </div>
            <div>
              <Label>จุดอ้างอิงเพิ่มเติม</Label>
              <Input
                className="mt-1"
                value={locationNote}
                onChange={(e) => setLocationNote(e.target.value)}
                placeholder="เช่น ห้องน้ำชายฝั่งตะวันออก"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>รายละเอียดอาการ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="อธิบายอาการชำรุดให้ชัดเจน เช่น หลอดไฟดับ มีน้ำรั่ว ฯลฯ"
              required
              maxLength={2000}
            />
            <div>
              <Label className="mb-2 block">รูปภาพ / วิดีโอประกอบ (สูงสุด 10 ไฟล์)</Label>
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-8 text-center transition hover:border-primary hover:bg-muted/50">
                <ImagePlus className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">คลิกเพื่อแนบรูป/วิดีโอ</span>
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
                      <span className="truncate">{f.name}</span>
                      <button
                        type="button"
                        onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                        className="text-muted-foreground hover:text-destructive"
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

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate({ to: "/dashboard" })}>
            ยกเลิก
          </Button>
          <Button type="submit" size="lg" disabled={submitting} className="shadow-elegant">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            ส่งใบแจ้งซ่อม
          </Button>
        </div>
      </form>
    </div>
  );
}
