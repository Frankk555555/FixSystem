"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, isSameDay } from "date-fns";
import { th } from "date-fns/locale";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, MapPin, CalendarOff, CalendarCheck } from "lucide-react";
import { getDepartmentMeta, getPriorityMeta, getStatusMeta } from "@/lib/repair-constants";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function CalendarPage() {
  const { user, isTechnician, isAdmin, currentRole } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [tickets, setTickets] = useState<any[]>([]);
  const [unavailabilities, setUnavailabilities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    async function fetchScheduledTickets() {
      if (!user) return;
      setLoading(true);
      let query = supabase.from("repair_tickets").select("*").not("scheduled_at", "is", null);

      if (!isAdmin) {
        if (isTechnician) {
          const dept = currentRole?.replace("technician_", "") as "electric" | "plumbing" | "general";
          query = query.eq("department", dept);
        } else {
          query = query.eq("reporter_id", user.id);
        }
      }

      const { data, error } = await query;
      if (!error && data) {
        setTickets(data);
      }
      setLoading(false);
    }

    async function fetchUnavail() {
      if (!user || !isTechnician) return;
      const { data } = await supabase
        .from("technician_unavailability")
        .select("unavailable_date")
        .eq("technician_id", user.id);
      if (data) {
        setUnavailabilities(data.map(d => d.unavailable_date));
      }
    }

    fetchScheduledTickets();
    fetchUnavail();
  }, [user, isAdmin, isTechnician, currentRole]);

  const selectedDateTickets = tickets.filter(t => t.scheduled_at && date && isSameDay(new Date(t.scheduled_at), date));
  const scheduledDates = tickets.map(t => new Date(t.scheduled_at));
  const unavailableDates = unavailabilities.map(d => new Date(d));

  const isDateUnavailable = date ? unavailabilities.includes(format(date, "yyyy-MM-dd")) : false;

  const toggleUnavailability = async () => {
    if (!date || !user) return;
    setToggling(true);
    const dateStr = format(date, "yyyy-MM-dd");
    const dept = currentRole?.replace("technician_", "") as any;

    if (isDateUnavailable) {
      const { error } = await supabase
        .from("technician_unavailability")
        .delete()
        .eq("technician_id", user.id)
        .eq("unavailable_date", dateStr);
      if (!error) {
        setUnavailabilities(prev => prev.filter(d => d !== dateStr));
        toast.success("ยกเลิกสถานะไม่ว่างเรียบร้อยแล้ว");
      } else {
        toast.error("เกิดข้อผิดพลาด: " + error.message);
      }
    } else {
      const { error } = await supabase
        .from("technician_unavailability")
        .insert({
          technician_id: user.id,
          department: dept,
          unavailable_date: dateStr,
        });
      if (!error) {
        setUnavailabilities(prev => [...prev, dateStr]);
        toast.success("บันทึกวันหยุด/วันไม่ว่างเรียบร้อยแล้ว");
      } else {
        toast.error("เกิดข้อผิดพลาด: " + error.message);
      }
    }
    setToggling(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
          <CalendarIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">ปฏิทินนัดหมายช่าง</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            ดูตารางงานและคิวการซ่อมที่ได้ถูกนัดหมายไว้แล้ว
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <Card className="md:col-span-5 lg:col-span-4 shadow-soft sticky top-24">
          <CardHeader>
            <CardTitle>เลือกวันที่</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              modifiers={{ scheduled: scheduledDates, unavailable: unavailableDates }}
              modifiersClassNames={{ 
                scheduled: "bg-primary/10 text-primary font-bold",
                unavailable: "bg-destructive/10 text-destructive line-through" 
              }}
              className="rounded-xl border shadow-sm p-4"
            />
          </CardContent>
        </Card>

        <div className="md:col-span-7 lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              รายการนัดหมายวันที่ {date ? format(date, "d MMMM yyyy", { locale: th }) : "..."}
            </h2>
            
            {isTechnician && date && (
              <Button 
                variant={isDateUnavailable ? "outline" : "destructive"}
                size="sm"
                onClick={toggleUnavailability}
                disabled={toggling}
                className="shadow-sm"
              >
                {isDateUnavailable ? (
                  <>
                    <CalendarCheck className="h-4 w-4 mr-2" />
                    ยกเลิกสถานะไม่ว่าง (พร้อมรับงาน)
                  </>
                ) : (
                  <>
                    <CalendarOff className="h-4 w-4 mr-2" />
                    กำหนดว่าไม่ว่างวันนี้ (ลางาน/ติดธุระ)
                  </>
                )}
              </Button>
            )}
          </div>
          
          {loading ? (
            <Card className="shadow-soft">
              <CardContent className="py-12 text-center text-muted-foreground">
                กำลังโหลดข้อมูล...
              </CardContent>
            </Card>
          ) : selectedDateTickets.length === 0 ? (
            <Card className="shadow-soft border-dashed">
              <CardContent className="py-16 text-center text-muted-foreground flex flex-col items-center gap-2">
                <CalendarIcon className="h-10 w-10 opacity-20" />
                <p>ไม่มีรายการนัดหมายในวันนี้</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {selectedDateTickets.map(t => {
                const dept = getDepartmentMeta(t.department);
                const status = getStatusMeta(t.status);
                const prio = getPriorityMeta(t.priority);
                
                return (
                  <Card key={t.id} className="shadow-soft hover:shadow-md transition overflow-hidden">
                    <div className="bg-gradient-primary px-5 py-2.5 flex justify-between items-center text-primary-foreground">
                      <span className="font-mono text-xs font-bold bg-black/20 px-2.5 py-0.5 rounded-full backdrop-blur">{t.ticket_code}</span>
                      <span className="text-sm font-medium">{format(new Date(t.scheduled_at), "HH:mm น.")}</span>
                    </div>
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex gap-2">
                          <Badge variant="outline" className="gap-1 bg-muted/30">
                            {dept?.icon} {dept?.label}
                          </Badge>
                          <Badge className={prio.className}>{prio.label}</Badge>
                        </div>
                        <Badge className={status.className}>{status.label}</Badge>
                      </div>
                      <h3 className="font-medium text-lg mb-2">{t.description}</h3>
                      <div className="text-sm text-muted-foreground flex items-center gap-1.5 mb-4">
                        <MapPin className="h-4 w-4 text-primary" />
                        {t.building} {t.room ? `ห้อง ${t.room}` : ""}
                      </div>
                      <Link href={`/tickets/${t.id}`} className="text-sm text-primary hover:underline font-medium inline-flex items-center">
                        ดูรายละเอียดใบงาน &rarr;
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
