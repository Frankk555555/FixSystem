import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getMyProfile, updateMyProfile } from "@/lib/tickets.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const fetcher = useServerFn(getMyProfile);
  const updater = useServerFn(updateMyProfile);
  const qc = useQueryClient();

  const { data: profile } = useSuspenseQuery({
    queryKey: ["my-profile"],
    queryFn: () => fetcher(),
  });

  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [personCode, setPersonCode] = useState(profile?.person_code ?? "");

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setPhone(profile.phone);
      setPersonCode(profile.person_code);
    }
  }, [profile]);

  const mutation = useMutation({
    mutationFn: () =>
      updater({ data: { full_name: fullName, phone, person_code: personCode } }),
    onSuccess: () => {
      toast.success("บันทึกข้อมูลเรียบร้อย");
      qc.invalidateQueries({ queryKey: ["my-profile"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">โปรไฟล์ของฉัน</h1>
        <p className="mt-1 text-muted-foreground">ข้อมูลนี้จะใช้ตอนแจ้งซ่อมโดยอัตโนมัติ</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลส่วนตัว</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
          >
            <div>
              <Label>อีเมล (เปลี่ยนไม่ได้)</Label>
              <Input value={profile?.email ?? ""} readOnly disabled className="mt-1" />
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
            <Button type="submit" disabled={mutation.isPending} className="shadow-elegant">
              บันทึก
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
