import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Wrench, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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

  // signin
  const [siEmail, setSiEmail] = useState("");
  const [siPassword, setSiPassword] = useState("");

  // signup
  const [suName, setSuName] = useState("");
  const [suPhone, setSuPhone] = useState("");
  const [suCode, setSuCode] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPassword, setSuPassword] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: siEmail,
      password: siPassword,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message === "Invalid login credentials" ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง" : error.message);
      return;
    }
    toast.success("ยินดีต้อนรับ");
    navigate({ to: "/dashboard", replace: true });
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: suEmail,
      password: suPassword,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          full_name: suName,
          phone: suPhone,
          person_code: suCode,
        },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(
        error.message.includes("already")
          ? "อีเมลนี้ถูกใช้แล้ว"
          : error.message,
      );
      return;
    }
    toast.success("สมัครสมาชิกสำเร็จ! กำลังเข้าสู่ระบบ...");
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
            <Wrench className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold">ระบบแจ้งซ่อมมหาวิทยาลัย</h1>
          <p className="text-sm text-muted-foreground">เข้าสู่ระบบเพื่อเริ่มต้นใช้งาน</p>
        </div>

        <Card className="shadow-elegant">
          <CardContent className="p-6">
            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">เข้าสู่ระบบ</TabsTrigger>
                <TabsTrigger value="signup">สมัครสมาชิก</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-6">
                <form className="space-y-4" onSubmit={handleSignIn}>
                  <div>
                    <Label>อีเมล</Label>
                    <Input
                      type="email"
                      autoComplete="email"
                      required
                      className="mt-1"
                      value={siEmail}
                      onChange={(e) => setSiEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>รหัสผ่าน</Label>
                    <Input
                      type="password"
                      autoComplete="current-password"
                      required
                      className="mt-1"
                      value={siPassword}
                      onChange={(e) => setSiPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full shadow-soft" disabled={loading}>
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    เข้าสู่ระบบ
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-6">
                <form className="space-y-4" onSubmit={handleSignUp}>
                  <div>
                    <Label>ชื่อ-นามสกุล</Label>
                    <Input className="mt-1" required value={suName} onChange={(e) => setSuName(e.target.value)} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>เบอร์โทรศัพท์</Label>
                      <Input
                        className="mt-1"
                        required
                        value={suPhone}
                        onChange={(e) => setSuPhone(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>รหัส นศ./บุคลากร</Label>
                      <Input
                        className="mt-1"
                        required
                        value={suCode}
                        onChange={(e) => setSuCode(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>อีเมล</Label>
                    <Input
                      type="email"
                      autoComplete="email"
                      required
                      className="mt-1"
                      value={suEmail}
                      onChange={(e) => setSuEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>รหัสผ่าน</Label>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={6}
                      className="mt-1"
                      value={suPassword}
                      onChange={(e) => setSuPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full shadow-soft" disabled={loading}>
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    สมัครสมาชิก
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
