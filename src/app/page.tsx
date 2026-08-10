import Link from "next/link";
import { Wrench, ClipboardList, Bell, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SplitText } from "@/components/react-bits/SplitText";
import { ShinyText } from "@/components/react-bits/ShinyText";
import { SpotlightCard } from "@/components/react-bits/SpotlightCard";
export default function LandingPage() {
  return (
    <div className="min-h-screen selection:bg-primary/20">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 px-4 py-4 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
              <Wrench className="h-5 w-5" />
            </span>
            ระบบแจ้งซ่อมออนไลน์สำหรับมหาวิทยาลัย
          </div>
          <Button asChild size="sm" className="rounded-full shadow-sm">
            <Link href="/auth">เข้าสู่ระบบ</Link>
          </Button>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-4 py-16 sm:py-24 lg:py-32">
          {/* Subtle background glow */}
          <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 opacity-50 blur-3xl" />
          
          <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2">
            <div className="space-y-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                <ShieldCheck className="h-4 w-4" />
                สำหรับนักศึกษา อาจารย์ และบุคลากร
              </span>
              
              <div className="space-y-4">
                <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                  <SplitText text="แจ้งซ่อมง่ายๆ" delay={0.1} /> <br/>
                  <ShinyText text="ติดตามได้ทุกขั้นตอน" />
                </h1>
                <p className="max-w-lg text-lg text-muted-foreground sm:text-xl sm:leading-relaxed">
                  ระบบแจ้งซ่อมออนไลน์สำหรับมหาวิทยาลัย ส่งเรื่องถึงช่างโดยตรง พร้อมแนบรูปและติดตามสถานะแบบเรียลไทม์
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Button asChild size="lg" className="group rounded-full shadow-elegant">
                  <Link href="/auth">
                    เริ่มแจ้งซ่อม
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="ghost" className="rounded-full hover:bg-primary/5">
                  <Link href="/auth">สมัครสมาชิก</Link>
                </Button>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[380px] lg:ml-auto lg:mr-0">
              {/* Decorative background blur */}
              <div className="absolute -inset-2 rounded-[2.5rem] bg-gradient-primary opacity-20 blur-2xl" />
              
              {/* Main Ticket Card */}
              <div className="relative rounded-[2rem] border border-border/60 bg-card p-6 shadow-elegant transition-transform duration-500 hover:-translate-y-1">
                <div className="flex items-start justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Wrench className="h-6 w-6" />
                  </div>
                  <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground shadow-sm">
                    ด่วนที่สุด
                  </span>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-display text-xl font-semibold">แอร์ไม่เย็น มีน้ำหยด</h3>
                  <p className="mt-1 text-sm text-muted-foreground">ห้องเรียน 402, อาคารวิศวกรรม</p>
                </div>
                
                <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-success"></span>
                    </span>
                    <span className="text-sm font-medium text-success">กำลังดำเนินการ</span>
                  </div>
                  <p className="font-mono text-xs font-medium text-muted-foreground">RPR-2025-001</p>
                </div>
              </div>
              
              {/* Floating Status Notification */}
              <div className="absolute -bottom-6 -right-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                <div className="rounded-2xl border border-border/50 bg-background/95 p-4 shadow-soft backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-glow">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">ช่างสมชาย รับงานแล้ว</p>
                      <p className="text-xs text-muted-foreground">เมื่อ 5 นาทีที่แล้ว</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="grid gap-6 sm:grid-cols-3">
            <Feature icon={<ClipboardList className="h-6 w-6" />} title="แจ้งซ่อมไว">
              กรอกข้อมูลครั้งเดียว แนบรูปจากมือถือได้ทันที ระบบจะวิเคราะห์และส่งต่อให้แผนกที่ถูกต้อง
            </Feature>
            <Feature icon={<Bell className="h-6 w-6" />} title="ติดตามสถานะ">
              รู้ทุกความเคลื่อนไหว ตั้งแต่รับเรื่องจนปิดงาน พร้อมแจ้งเตือนเมื่อมีการอัปเดต
            </Feature>
            <Feature icon={<Wrench className="h-6 w-6" />} title="ส่งตรงถึงช่าง">
              ส่งใบงานไปยังแผนกที่เกี่ยวข้องโดยอัตโนมัติ ทำให้การจัดคิวและเข้าซ่อมรวดเร็วยิ่งขึ้น
            </Feature>
          </div>
        </section>
      </main>
    </div>
  );
}

function Feature({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <SpotlightCard>
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/5 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-glow">
        {icon}
      </div>
      <h3 className="mt-5 font-display text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</p>
    </SpotlightCard>
  );
}
