"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Wrench,
  Loader2,
  Lock,
  Mail,
  User,
  Phone,
  CreditCard,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth, type AppRole } from "@/contexts/AuthContext";

export default function AuthPage() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();

  const [loading, setLoading] = useState(false);

  // Sign In Form State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Sign Up Form State
  const [signupName, setSignupName] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupCode, setSignupCode] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  function redirectByRole(role: AppRole) {
    if (role.startsWith("technician_")) {
      router.replace("/technician");
    } else if (role === "admin") {
      router.replace("/admin");
    } else {
      router.replace("/dashboard");
    }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }
    setLoading(true);
    const { error, role } = await signIn(loginEmail, loginPassword);
    setLoading(false);

    if (error) {
      toast.error(`เข้าสู่ระบบไม่สำเร็จ: ${error.message}`);
    } else {
      toast.success("เข้าสู่ระบบสำเร็จ!");
      redirectByRole(role || "user");
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (!signupName || !signupPhone || !signupCode || !signupEmail || !signupPassword) {
      toast.error("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    if (signupPassword.length < 6) {
      toast.error("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setLoading(true);
    const { error } = await signUp({
      email: signupEmail,
      password: signupPassword,
      full_name: signupName,
      phone: signupPhone,
      person_code: signupCode,
      role: "user",
    });
    setLoading(false);

    if (error) {
      toast.error(`สมัครสมาชิกไม่สำเร็จ: ${error.message}`);
    } else {
      toast.success("สมัครสมาชิกสำเร็จและเข้าสู่ระบบเรียบร้อย!");
      router.replace("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background px-4 py-12 flex flex-col justify-center items-center">
      <div className="w-full max-w-xl space-y-6">
        {/* Logo and System Title */}
        <div className="text-center space-y-2">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
            <Wrench className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">ระบบแจ้งซ่อมออนไลน์</h1>
          <p className="text-sm text-muted-foreground">
            มหาวิทยาลัยราชภัฏบุรีรัมย์
          </p>
        </div>

        {/* Main Auth Form */}
        <Card className="shadow-elegant border-border/80">
          <CardContent className="p-6">
            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin" className="font-semibold">เข้าสู่ระบบ</TabsTrigger>
                <TabsTrigger value="signup" className="font-semibold">สมัครสมาชิกใหม่</TabsTrigger>
              </TabsList>

              {/* TAB 1: Sign In */}
              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="signin-email">อีเมล</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="user@bru.ac.th" 
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="signin-password">รหัสผ่าน</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="••••••••"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full shadow-soft" size="lg" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    เข้าสู่ระบบ
                  </Button>
                </form>
              </TabsContent>

              {/* TAB 2: Sign Up */}
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-name">ชื่อ-นามสกุล *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        placeholder="สมชาย ใจดี"
                        required
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="signup-phone">เบอร์โทรศัพท์ *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-phone"
                          placeholder="081-234-5678"
                          required
                          value={signupPhone}
                          onChange={(e) => setSignupPhone(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="signup-code">รหัส นศ./บุคลากร *</Label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-code"
                          placeholder="66011213019"
                          required
                          value={signupCode}
                          onChange={(e) => setSignupCode(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="signup-email">อีเมล *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="user@bru.ac.th"
                        required
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="signup-pass">รหัสผ่าน *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-pass"
                        type="password"
                        placeholder="อย่างน้อย 6 ตัวอักษร"
                        required
                        minLength={6}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full shadow-soft" size="lg" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
