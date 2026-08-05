import { createFileRoute, Link } from "@tanstack/react-router";
import { Wrench, ClipboardList, Bell, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ระบบแจ้งซ่อมออนไลน์ - มหาวิทยาลัย" },
      {
        name: "description",
        content: "แจ้งซ่อม ติดตามสถานะ และจัดการงานซ่อมภายในมหาวิทยาลัยได้ในที่เดียว",
      },
      { property: "og:title", content: "ระบบแจ้งซ่อมออนไลน์ - มหาวิทยาลัย" },
      {
        property: "og:description",
        content: "แจ้งซ่อม ติดตามสถานะ และจัดการงานซ่อมภายในมหาวิทยาลัยได้ในที่เดียว",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
            <Wrench className="h-5 w-5" />
          </span>
          ระบบแจ้งซ่อม
        </div>
        <Button asChild size="sm">
          <Link to="/auth">เข้าสู่ระบบ</Link>
        </Button>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1 text-sm font-medium text-accent-foreground">
              สำหรับนักศึกษา อาจารย์ และบุคลากร
            </span>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              แจ้งซ่อมง่ายๆ <span className="text-primary">ติดตามได้ทุกขั้นตอน</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              ระบบแจ้งซ่อมออนไลน์ภายในมหาวิทยาลัย รองรับงานไฟฟ้า ประปา และซ่อมสร้าง
              ส่งเรื่องถึงช่างที่เกี่ยวข้องโดยตรง พร้อมแนบรูปและติดตามสถานะแบบเรียลไทม์
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="shadow-elegant">
                <Link to="/auth">
                  เริ่มแจ้งซ่อม
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/auth">สมัครสมาชิก</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square rounded-3xl bg-gradient-warm p-8 shadow-elegant">
              <div className="grid h-full place-items-center rounded-2xl bg-background/90 p-6 backdrop-blur">
                <div className="space-y-4 text-center">
                  <div className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
                    <Wrench className="h-10 w-10" />
                  </div>
                  <p className="font-display text-xl font-semibold">RPR-2025-00128</p>
                  <p className="text-sm text-muted-foreground">⚡ แผนกไฟฟ้า · ด่วน</p>
                  <span className="inline-block rounded-full bg-success px-4 py-1 text-sm font-medium text-success-foreground">
                    กำลังดำเนินการ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 grid gap-6 sm:grid-cols-3">
          <Feature icon={<ClipboardList className="h-6 w-6" />} title="แจ้งซ่อมไว">
            กรอกข้อมูลครั้งเดียว แนบรูปจากมือถือได้ทันที
          </Feature>
          <Feature icon={<Bell className="h-6 w-6" />} title="ติดตามสถานะ">
            รู้ทุกความเคลื่อนไหว ตั้งแต่รับเรื่องจนปิดงาน
          </Feature>
          <Feature icon={<Wrench className="h-6 w-6" />} title="ส่งตรงถึงช่าง">
            ส่งใบงานไปยังแผนกที่เกี่ยวข้องโดยอัตโนมัติ
          </Feature>
        </div>
      </section>
    </div>
  );
}

function Feature({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary text-primary-foreground">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
