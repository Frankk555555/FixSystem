"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { User, Phone, CreditCard, Mail, Shield, Loader2, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { getRoleMeta } from "@/lib/role";

export default function ProfilePage() {
  const { user, profile, currentRole, updateProfile, loading } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [personCode, setPersonCode] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setPersonCode(profile.person_code || "");
    }
  }, [profile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("กรุณาระบุชื่อ-นามสกุล");
      return;
    }

    setSaving(true);
    const { error } = await updateProfile({
      full_name: fullName.trim(),
      phone: phone.trim(),
      person_code: personCode.trim(),
    });
    setSaving(false);

    if (error) {
      toast.error(`บันทึกข้อมูลไม่สำเร็จ: ${error.message}`);
    } else {
      toast.success("บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว");
    }
  }

  const roleMeta = getRoleMeta(currentRole);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">โปรไฟล์ของฉัน</h1>
        <p className="mt-1 text-muted-foreground">
          จัดการข้อมูลส่วนตัวและตรวจสอบสิทธิ์การใช้งานในระบบแจ้งซ่อม
        </p>
      </div>

      {/* Role & Account Summary Card */}
      <Card className="shadow-soft border-primary/20 bg-card/60 backdrop-blur">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-5">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-soft text-xl">
              {roleMeta.icon}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">สิทธิ์ผู้ใช้งานปัจจุบัน</p>
              <h2 className="text-lg font-bold text-foreground">{roleMeta.label}</h2>
              {roleMeta.departmentLabel && (
                <p className="text-xs font-semibold text-primary">{roleMeta.departmentLabel}</p>
              )}
            </div>
          </div>
          <Badge variant="outline" className="text-xs py-1 px-3">
            {user?.email}
          </Badge>
        </CardContent>
      </Card>

      {/* Profile Edit Form */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>ข้อมูลส่วนตัว</CardTitle>
          <CardDescription>ข้อมูลนี้จะแสดงอัตโนมัติเมื่อท่านสร้างใบแจ้งซ่อม</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label>อีเมล (บัญชีผู้ใช้)</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input value={user?.email || ""} readOnly disabled className="pl-9 bg-muted/40" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fullname">ชื่อ-นามสกุล *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullname"
                  className="pl-9"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="เช่น สมชาย ใจดี"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">เบอร์โทรศัพท์ติดต่อ *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  className="pl-9"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="เช่น 081-234-5678"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="personcode">รหัสนักศึกษา / รหัสประจำตัวบุคลากร *</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="personcode"
                  className="pl-9"
                  value={personCode}
                  onChange={(e) => setPersonCode(e.target.value)}
                  placeholder="เช่น 66011213019"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={saving || loading} className="shadow-elegant min-w-32">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    บันทึกข้อมูล
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
