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
  const { user, profile, currentRole, isTechnician, isAdmin, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    toast.success("ออกจากระบบเรียบร้อย");
    router.replace("/auth");
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

          {/* User Role Badge */}
          <div className={`flex items-center gap-1.5 border px-2.5 py-1 rounded-md text-xs font-semibold ${roleInfo.colorClass}`}>
            {roleInfo.icon}
            <span className="hidden xs:inline sm:inline">{roleInfo.label}</span>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSignOut} 
            title="ออกจากระบบ"
            className="text-muted-foreground hover:text-destructive gap-1"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">ออกจากระบบ</span>
          </Button>
        </nav>
      </div>
    </header>
  );
}
