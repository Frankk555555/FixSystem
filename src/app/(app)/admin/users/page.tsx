"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Users, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type AppRole = "user" | "technician_electric" | "technician_plumbing" | "technician_general" | "admin";

interface UserWithRole {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: AppRole;
}

const ROLES: { value: AppRole; label: string; badge: string }[] = [
  { value: "admin", label: "ผู้ดูแลระบบ (Admin)", badge: "bg-destructive text-destructive-foreground hover:bg-destructive/90" },
  { value: "technician_electric", label: "ช่างไฟฟ้า", badge: "bg-warning text-warning-foreground hover:bg-warning/90" },
  { value: "technician_plumbing", label: "ช่างประปา", badge: "bg-primary text-primary-foreground hover:bg-primary/90" },
  { value: "technician_general", label: "ช่างซ่อมสร้าง", badge: "bg-accent text-accent-foreground hover:bg-accent/90" },
  { value: "user", label: "ผู้ใช้งานทั่วไป", badge: "bg-muted text-muted-foreground hover:bg-muted/80" },
];

export default function AdminUsersPage() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_users_with_roles");

      if (error) {
        toast.error(`ดึงข้อมูลไม่สำเร็จ: ${error.message}`);
      } else {
        setUsers(data as UserWithRole[] || []);
      }
    } catch (err) {
      console.error("[AdminUsersPage] Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [fetchUsers, isAdmin]);

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    setUpdatingId(userId);
    try {
      const { error } = await supabase.rpc("assign_user_role", {
        target_user_id: userId,
        new_role: newRole,
      });

      if (error) {
        toast.error(`อัปเดตสิทธิ์ไม่สำเร็จ: ${error.message}`);
      } else {
        toast.success("อัปเดตสิทธิ์สำเร็จ");
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      console.error("[AdminUsersPage] Update error:", err);
      toast.error("เกิดข้อผิดพลาดในการอัปเดตสิทธิ์");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (u.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (u.phone?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <Card className="max-w-2xl mx-auto mt-12 shadow-soft">
        <CardContent className="py-16 text-center space-y-4">
          <ShieldCheck className="h-16 w-16 mx-auto text-destructive" />
          <h2 className="text-2xl font-bold">ไม่มีสิทธิ์เข้าถึง</h2>
          <p className="text-muted-foreground">เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถจัดการผู้ใช้งานได้</p>
          <Button asChild>
            <Link href="/dashboard">กลับหน้าหลัก</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon" className="rounded-full shrink-0 shadow-sm hover:shadow-soft">
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight flex items-center gap-2">
              <Users className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
              จัดการผู้ใช้งาน
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              กำหนดสิทธิ์ช่างแต่ละแผนก และสิทธิ์ผู้ดูแลระบบ (Role Management)
            </p>
          </div>
        </div>
      </div>

      <Card className="shadow-soft">
        <CardHeader className="pb-4 bg-muted/20 border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg">รายชื่อผู้ใช้งานทั้งหมด ({users.length})</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="ค้นหาชื่อ, อีเมล, เบอร์โทร..." 
                className="pl-9 bg-background shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/40 uppercase border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold">ชื่อ - นามสกุล</th>
                  <th className="px-6 py-4 font-semibold">ข้อมูลติดต่อ</th>
                  <th className="px-6 py-4 font-semibold">สิทธิ์ปัจจุบัน</th>
                  <th className="px-6 py-4 font-semibold text-right min-w-[200px]">จัดการสิทธิ์ (Role)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
                        <span className="font-medium">กำลังโหลดข้อมูลผู้ใช้งาน...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center text-muted-foreground">
                      <Users className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                      ไม่พบข้อมูลผู้ใช้งานที่ค้นหา
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const roleMeta = ROLES.find(r => r.value === u.role) || ROLES[4];
                    return (
                      <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">
                          {u.full_name || <span className="text-muted-foreground italic">ไม่ระบุชื่อ</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-foreground">{u.email}</div>
                          <div className="text-muted-foreground text-xs mt-0.5">{u.phone || "ไม่มีเบอร์โทร"}</div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={cn("whitespace-nowrap font-medium", roleMeta.badge)}>
                            {roleMeta.label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Select 
                            value={u.role} 
                            onValueChange={(val) => handleRoleChange(u.id, val as AppRole)}
                            disabled={updatingId === u.id}
                          >
                            <SelectTrigger className="w-[180px] ml-auto h-9 shadow-sm bg-background">
                              {updatingId === u.id ? (
                                <div className="flex items-center gap-2 text-primary">
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> 
                                  <span>กำลังอัปเดต...</span>
                                </div>
                              ) : (
                                <SelectValue placeholder="เลือกสิทธิ์" />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              {ROLES.map(r => (
                                <SelectItem key={r.value} value={r.value} className="font-medium">
                                  {r.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
