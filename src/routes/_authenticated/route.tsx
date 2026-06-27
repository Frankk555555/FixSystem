import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  // โหมด mock: ไม่ต้องเช็ค auth — ให้เข้าทุกหน้าได้
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
