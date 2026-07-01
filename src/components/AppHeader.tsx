import { Link, useNavigate } from "@tanstack/react-router";
import { Wrench, LogOut, LayoutDashboard, Plus, User, HardHat, UserRound, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRole, type Role } from "@/lib/role";

export function AppHeader() {
  const navigate = useNavigate();
  const [role, setRole] = useRole();
  const isTech = role === "technician";

  function handleSignOut() {
    navigate({ to: "/auth", replace: true });
  }

  function switchRole(r: Role) {
    setRole(r);
    navigate({ to: r === "technician" ? "/technician" : "/dashboard", replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to={isTech ? "/technician" : "/dashboard"} className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
            <Wrench className="h-5 w-5" />
          </span>
          <span>
            ระบบแจ้งซ่อม<span className="text-primary"> มหาวิทยาลัย</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {isTech ? (
            <Button asChild variant="ghost" size="sm">
              <Link to="/technician">
                <HardHat className="h-4 w-4" />
                <span className="hidden sm:inline">งานของช่าง</span>
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">หน้าหลัก</span>
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/tickets/new">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">แจ้งซ่อม</span>
                </Link>
              </Button>
            </>
          )}
          <Button asChild variant="ghost" size="sm">
            <Link to="/profile">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">โปรไฟล์</span>
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-1">
                {isTech ? <HardHat className="h-4 w-4" /> : <UserRound className="h-4 w-4" />}
                <span className="hidden sm:inline">{isTech ? "ช่างเทคนิค" : "ผู้ใช้งาน"}</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>สลับบทบาท (mock)</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => switchRole("user")}>
                <UserRound className="h-4 w-4" />
                ผู้ใช้งานทั่วไป
                {!isTech && <span className="ml-auto text-xs text-primary">●</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => switchRole("technician")}>
                <HardHat className="h-4 w-4" />
                ช่างเทคนิค
                {isTech && <span className="ml-auto text-xs text-primary">●</span>}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">ออก</span>
          </Button>
        </nav>
      </div>
    </header>
  );
}
