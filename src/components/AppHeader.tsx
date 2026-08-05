"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wrench,
  LogOut,
  LayoutDashboard,
  Plus,
  User,
  HardHat,
  UserRound,
  ChevronDown,
  ShieldCheck,
  BarChart3,
  Zap,
  Droplets,
  Hammer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth, type AppRole } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function AppHeader() {
  const router = useRouter();
  const { user, profile, currentRole, isTechnician, isAdmin, signOut, switchRole } = useAuth();

  async function handleSignOut() {
    await signOut();
    toast.success("ออกจากระบบเรียบร้อย");
    router.replace("/auth");
  }

  function handleSwitchRole(r: AppRole) {
    switchRole(r);
    toast.info(`สลับบทบาทเป็น ${getRoleShortLabel(r)}`);
    if (r.startsWith("technician_")) {
      router.push("/technician");
    } else if (r === "admin") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
  }

  function getRoleShortLabel(role: AppRole): string {
    switch (role) {
      case "technician_electric":
        return "ช่างไฟฟ้า";
      case "technician_plumbing":
        return "ช่างประปา";
      case "technician_general":
        return "ช่างซ่อมสร้าง";
      case "admin":
        return "ผู้ดูแลระบบ";
      case "user":
      default:
        return "ผู้ใช้งาน";
    }
  }

  function getRoleBadgeVariant(role: AppRole): { label: string; icon: React.ReactNode; colorClass: string } {
    switch (role) {
      case "technician_electric":
        return {
          label: "ช่างไฟฟ้า",
          icon: <Zap className="h-3.5 w-3.5 text-amber-500" />,
          colorClass: "border-amber-400/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
        };
      case "technician_plumbing":
        return {
          label: "ช่างประปา",
          icon: <Droplets className="h-3.5 w-3.5 text-cyan-500" />,
          colorClass: "border-cyan-400/40 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
        };
      case "technician_general":
        return {
          label: "ช่างซ่อมสร้าง",
          icon: <Hammer className="h-3.5 w-3.5 text-emerald-500" />,
          colorClass: "border-emerald-400/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        };
      case "admin":
        return {
          label: "ผู้ดูแลระบบ",
          icon: <ShieldCheck className="h-3.5 w-3.5 text-purple-500" />,
          colorClass: "border-purple-400/40 bg-purple-500/10 text-purple-600 dark:text-purple-400",
        };
      case "user":
      default:
        return {
          label: "ผู้ใช้งานทั่วไป",
          icon: <UserRound className="h-3.5 w-3.5 text-primary" />,
          colorClass: "border-primary/30 bg-primary/10 text-primary",
        };
    }
  }

  const roleInfo = getRoleBadgeVariant(currentRole);
  const homeLink = isAdmin ? "/admin" : isTechnician ? "/technician" : "/dashboard";

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href={homeLink} className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
            <Wrench className="h-5 w-5" />
          </span>
          <span className="hidden sm:inline">
            ระบบแจ้งซ่อม<span className="text-primary"> มหาวิทยาลัย</span>
          </span>
          <span className="sm:hidden font-bold text-primary">UniRepair</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {isAdmin ? (
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin" className="flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">รายงานภาพรวม</span>
              </Link>
            </Button>
          ) : isTechnician ? (
            <Button asChild variant="ghost" size="sm">
              <Link href="/technician" className="flex items-center gap-1.5">
                <HardHat className="h-4 w-4" />
                <span className="hidden sm:inline">งานของช่าง</span>
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard" className="flex items-center gap-1.5">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">หน้าหลัก</span>
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/tickets/new" className="flex items-center gap-1.5">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">แจ้งซ่อม</span>
                </Link>
              </Button>
            </>
          )}

          <Button asChild variant="ghost" size="sm">
            <Link href="/profile" className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">โปรไฟล์</span>
            </Link>
          </Button>

          {/* Role selector dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={`ml-1 flex items-center gap-1.5 border px-2.5 sm:px-3 ${roleInfo.colorClass}`}
              >
                {roleInfo.icon}
                <span className="text-xs font-semibold sm:text-sm">{roleInfo.label}</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-normal text-muted-foreground">เข้าสู่ระบบในฐานะ</span>
                  <span className="truncate font-semibold text-foreground">
                    {profile?.full_name || user?.email || "ผู้ใช้งาน"}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                สลับบทบาทการใช้งาน
              </DropdownMenuLabel>

              <DropdownMenuItem
                onClick={() => handleSwitchRole("user")}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-blue-500" />
                  <span>ผู้ใช้งานทั่วไป (User)</span>
                </div>
                {currentRole === "user" && <Badge variant="secondary" className="text-xs">กำลังใช้</Badge>}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => handleSwitchRole("technician_electric")}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span>ช่าง - แผนกไฟฟ้า ⚡</span>
                </div>
                {currentRole === "technician_electric" && <Badge variant="secondary" className="text-xs">กำลังใช้</Badge>}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => handleSwitchRole("technician_plumbing")}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-cyan-500" />
                  <span>ช่าง - แผนกประปา 💧</span>
                </div>
                {currentRole === "technician_plumbing" && <Badge variant="secondary" className="text-xs">กำลังใช้</Badge>}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => handleSwitchRole("technician_general")}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Hammer className="h-4 w-4 text-emerald-500" />
                  <span>ช่าง - แผนกซ่อมสร้าง 🔨</span>
                </div>
                {currentRole === "technician_general" && <Badge variant="secondary" className="text-xs">กำลังใช้</Badge>}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => handleSwitchRole("admin")}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-purple-500" />
                  <span>ผู้ดูแลระบบ (Admin) 🛡️</span>
                </div>
                {currentRole === "admin" && <Badge variant="secondary" className="text-xs">กำลังใช้</Badge>}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="sm" onClick={handleSignOut} title="ออกจากระบบ">
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">ออก</span>
          </Button>
        </nav>
      </div>
    </header>
  );
}
