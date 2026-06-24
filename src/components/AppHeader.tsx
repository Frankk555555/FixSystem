import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { Wrench, LogOut, LayoutDashboard, Plus, User } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  const navigate = useNavigate();
  const router = useRouter();
  const qc = useQueryClient();

  async function handleSignOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    router.invalidate();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/dashboard" className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
            <Wrench className="h-5 w-5" />
          </span>
          <span>
            ระบบแจ้งซ่อม<span className="text-primary"> มหาวิทยาลัย</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1">
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
          <Button asChild variant="ghost" size="sm">
            <Link to="/profile">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">โปรไฟล์</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">ออกจากระบบ</span>
          </Button>
        </nav>
      </div>
    </header>
  );
}
