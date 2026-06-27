import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { mockProfile, updateMockProfile } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const [fullName, setFullName] = useState(mockProfile.full_name);
  const [phone, setPhone] = useState(mockProfile.phone);
  const [personCode, setPersonCode] = useState(mockProfile.person_code);
  const [saving, setSaving] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    updateMockProfile({ full_name: fullName, phone, person_code: personCode });
    setTimeout(() => {
      setSaving(false);
      toast.success("บันทึกข้อมูลเรียบร้อย (mock)");
    }, 300);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">โปรไฟล์ของฉัน</h1>
        <p className="mt-1 text-muted-foreground">ข้อมูลตัวอย่างสำหรับทดสอบระบบ</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลส่วนตัว</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label>อีเมล (เปลี่ยนไม่ได้)</Label>
              <Input value={mockProfile.email} readOnly disabled className="mt-1" />
            </div>
            <div>
              <Label>ชื่อ-นามสกุล *</Label>
              <Input className="mt-1" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div>
              <Label>เบอร์โทรศัพท์ *</Label>
              <Input className="mt-1" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
            <div>
              <Label>รหัสนักศึกษา / รหัสบุคลากร *</Label>
              <Input
                className="mt-1"
                value={personCode}
                onChange={(e) => setPersonCode(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={saving} className="shadow-elegant">
              บันทึก
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
