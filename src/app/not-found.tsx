import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="mx-auto max-w-md space-y-4">
        <h2 className="text-4xl font-bold tracking-tight">404</h2>
        <p className="text-lg text-muted-foreground">ไม่พบหน้าที่คุณต้องการ</p>
        <div>
          <Button asChild>
            <Link href="/">กลับสู่หน้าหลัก</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
