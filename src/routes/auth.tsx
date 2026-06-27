import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Wrench, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "เข้าสู่ระบบ - ระบบแจ้งซ่อมมหาวิทยาลัย" },
      { name: "description", content: "เข้าสู่ระบบหรือสมัครสมาชิกเพื่อแจ้งซ่อม" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  function handleMockAuth(e: React.FormEvent, msg: string) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success(msg);
      navigate({ to: "/dashboard", replace: true });
    }, 300);
  }

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
            <Wrench className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold">ระบบแจ้งซ่อมมหาวิทยาลัย</h1>
          <p className="text-sm text-muted-foreground">โหมดทดสอบ (mock) — กรอกอะไรก็เข้าได้</p>
        </div>

        <Card className="shadow-elegant">
          <CardContent className="p-6">
            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">เข้าสู่ระบบ</TabsTrigger>
                <TabsTrigger value="signup">สมัครสมาชิก</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-6">
                <form className="space-y-4" onSubmit={(e) => handleMockAuth(e, "ยินดีต้อนรับ")}>
                  <div>
                    <Label>อีเมล</Label>
                    <Input type="email" required className="mt-1" defaultValue="demo@university.ac.th" />
                  </div>
                  <div>
                    <Label>รหัสผ่าน</Label>
                    <Input type="password" required className="mt-1" defaultValue="demo1234" />
                  </div>
                  <Button type="submit" className="w-full shadow-soft" disabled={loading}>
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    เข้าสู่ระบบ
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-6">
                <form className="space-y-4" onSubmit={(e) => handleMockAuth(e, "สมัครสมาชิกสำเร็จ!")}>
                  <div>
                    <Label>ชื่อ-นามสกุล</Label>
                    <Input className="mt-1" required />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>เบอร์โทรศัพท์</Label>
                      <Input className="mt-1" required />
                    </div>
                    <div>
                      <Label>รหัส นศ./บุคลากร</Label>
                      <Input className="mt-1" required />
                    </div>
                  </div>
                  <div>
                    <Label>อีเมล</Label>
                    <Input type="email" required className="mt-1" />
                  </div>
                  <div>
                    <Label>รหัสผ่าน</Label>
                    <Input type="password" required minLength={6} className="mt-1" />
                  </div>
                  <Button type="submit" className="w-full shadow-soft" disabled={loading}>
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    สมัครสมาชิก
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <Button
              variant="ghost"
              className="mt-4 w-full"
              onClick={() => navigate({ to: "/dashboard", replace: true })}
            >
              ข้ามไปยังหน้าหลักเลย (mock)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
