"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ClipboardList,
  CheckCircle2,
  Clock,
  Wrench,
  RefreshCw,
  Zap,
  Droplets,
  Hammer,
  BarChart3,
  TrendingUp,
  MapPin,
  Users,
  Search,
  Download,
  Filter,
  ArrowUpRight,
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
  PieChart as PieChartIcon,
  Activity,
  FileSpreadsheet,
  Sparkles,
  SlidersHorizontal,
  ExternalLink,
  Copy,
  Check,
  MoreVertical,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DEPARTMENTS,
  STATUSES,
  PRIORITIES,
  BUILDINGS,
  getDepartmentMeta,
  getStatusMeta,
  getPriorityMeta,
} from "@/lib/repair-constants";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type RepairTicket = Tables<"repair_tickets">;

const PIE_COLORS = [
  "#F59E0B", // Warning / Pending
  "#3B82F6", // Blue / Assigned
  "#8B5CF6", // Purple / Scheduled
  "#06B6D4", // Cyan / In Progress
  "#10B981", // Emerald / Completed
  "#64748B", // Slate
];

const MONTH_TH = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

export default function AdminPage() {
  const [tickets, setTickets] = useState<RepairTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Pagination for table
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("repair_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error(`ดึงข้อมูลไม่สำเร็จ: ${error.message}`);
      } else {
        setTickets(data || []);
      }
    } catch (err) {
      console.error("[AdminPage] Fetch error:", err);
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Copy ticket code helper
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`คัดลอกรหัส ${code} แล้ว`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Time-filtered tickets for statistics
  const timeFilteredTickets = useMemo(() => {
    if (timeRange === "all") return tickets;
    const now = new Date();
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return tickets.filter((t) => new Date(t.created_at) >= cutoff);
  }, [tickets, timeRange]);

  // Overall KPI statistics
  const total = timeFilteredTickets.length;
  const completed = timeFilteredTickets.filter((t) => t.status === "completed").length;
  const pending = timeFilteredTickets.filter((t) => t.status === "pending" || t.status === "assigned").length;
  const inProgress = timeFilteredTickets.filter((t) => t.status === "scheduled" || t.status === "in_progress").length;
  const urgentCount = timeFilteredTickets.filter((t) => t.priority === "urgent" || t.priority === "critical").length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Department Stats
  const byDept = useMemo(() => {
    return DEPARTMENTS.map((d) => {
      const deptTickets = timeFilteredTickets.filter((t) => t.department === d.value);
      const deptTotal = deptTickets.length;
      const deptCompleted = deptTickets.filter((t) => t.status === "completed").length;
      const deptPending = deptTickets.filter((t) => t.status !== "completed").length;
      const rate = deptTotal > 0 ? Math.round((deptCompleted / deptTotal) * 100) : 0;
      return {
        name: d.label,
        icon: d.icon,
        value: d.value,
        total: deptTotal,
        completed: deptCompleted,
        pending: deptPending,
        rate,
      };
    });
  }, [timeFilteredTickets]);

  // Status Distribution for Donut Chart
  const byStatus = useMemo(() => {
    return STATUSES.map((s) => {
      const count = timeFilteredTickets.filter((t) => t.status === s.value).length;
      return {
        name: s.label,
        value: count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      };
    }).filter((s) => s.value > 0);
  }, [timeFilteredTickets, total]);

  // Monthly trend (past 6 months)
  const byMonth = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const inMonth = tickets.filter((t) => {
        const ct = new Date(t.created_at);
        return ct >= d && ct < nextMonth;
      });

      const completedM = inMonth.filter((t) => t.status === "completed").length;
      const openM = inMonth.filter((t) => t.status !== "completed").length;
      return {
        month: MONTH_TH[d.getMonth()],
        เสร็จสิ้น: completedM,
        คงค้าง: openM,
        รวม: completedM + openM,
      };
    });
  }, [tickets]);

  // Top building hotspots
  const topBuildings = useMemo(() => {
    const counts: Record<string, { total: number; completed: number; pending: number }> = {};
    timeFilteredTickets.forEach((t) => {
      const b = t.building || "ไม่ระบุอาคาร";
      if (!counts[b]) counts[b] = { total: 0, completed: 0, pending: 0 };
      counts[b].total += 1;
      if (t.status === "completed") {
        counts[b].completed += 1;
      } else {
        counts[b].pending += 1;
      }
    });

    return Object.entries(counts)
      .map(([building, stats]) => ({
        building,
        ...stats,
        rate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [timeFilteredTickets]);

  // Filtered tickets for the Tickets Tab table
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // Search text
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = t.ticket_code.toLowerCase().includes(q);
        const matchDesc = t.description.toLowerCase().includes(q);
        const matchBldg = (t.building || "").toLowerCase().includes(q);
        const matchRoom = (t.room || "").toLowerCase().includes(q);
        if (!matchCode && !matchDesc && !matchBldg && !matchRoom) return false;
      }

      // Department filter
      if (selectedDept !== "all" && t.department !== selectedDept) return false;

      // Status filter
      if (selectedStatus !== "all" && t.status !== selectedStatus) return false;

      // Priority filter
      if (selectedPriority !== "all" && t.priority !== selectedPriority) return false;

      return true;
    });
  }, [tickets, searchQuery, selectedDept, selectedStatus, selectedPriority]);

  // Paginated tickets
  const totalPages = Math.ceil(filteredTickets.length / pageSize) || 1;
  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTickets.slice(start, start + pageSize);
  }, [filteredTickets, currentPage, pageSize]);

  // Reset filter handler
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedDept("all");
    setSelectedStatus("all");
    setSelectedPriority("all");
    setCurrentPage(1);
  };

  // Export CSV handler
  const exportToCSV = () => {
    if (tickets.length === 0) {
      toast.error("ไม่มีข้อมูลสำหรับส่งออก");
      return;
    }

    const headers = ["รหัสใบงาน", "แผนกช่าง", "ระดับความเร่งด่วน", "อาคาร", "ห้อง", "รายละเอียด", "สถานะ", "วันที่แจ้ง"];
    const rows = filteredTickets.map((t) => [
      `"${t.ticket_code}"`,
      `"${getDepartmentMeta(t.department)?.label || t.department}"`,
      `"${getPriorityMeta(t.priority)?.label || t.priority}"`,
      `"${t.building || ""}"`,
      `"${t.room || ""}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      `"${getStatusMeta(t.status)?.label || t.status}"`,
      `"${new Date(t.created_at).toLocaleString("th-TH")}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `uni_repair_tickets_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`ส่งออกข้อมูลสำเร็จ (${filteredTickets.length} รายการ)`);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Header */}
      <div className="relative overflow-hidden rounded-3xl border bg-card p-6 sm:p-8 shadow-soft">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-16 h-48 w-48 rounded-full bg-accent/10 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="grid h-14 w-14 sm:h-16 sm:w-16 shrink-0 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-elegant">
              <ShieldCheck className="h-8 w-8 sm:h-9 sm:w-9" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary font-semibold">
                  <Sparkles className="h-3 w-3 mr-1" />
                  จัดการและวิเคราะห์ข้อมูล
                </Badge>
                <span className="text-xs text-muted-foreground">
                  อัปเดตล่าสุด: {new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                ระบบจัดการและแดชบอร์ดแอดมิน
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
                ภาพรวมสถิติการแจ้งซ่อม ติดตามการปฏิบัติงานของช่าง และการบริหารจัดการอาคารสถานที่
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[130px] sm:w-[140px] h-9 bg-background shadow-xs text-xs sm:text-sm">
                <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="ช่วงเวลา" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ข้อมูลทั้งหมด</SelectItem>
                <SelectItem value="7d">7 วันล่าสุด</SelectItem>
                <SelectItem value="30d">30 วันล่าสุด</SelectItem>
                <SelectItem value="90d">90 วันล่าสุด</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              disabled={loading || tickets.length === 0}
              className="h-9 px-3 text-xs sm:text-sm gap-1.5 shadow-xs"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="hidden sm:inline">ส่งออก</span> CSV
            </Button>

            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-9 px-3 text-xs sm:text-sm gap-1.5 shadow-xs"
            >
              <Link href="/admin/users">
                <Users className="h-4 w-4 text-primary shrink-0" />
                <span>จัดการสิทธิ์</span>
              </Link>
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={fetchTickets}
              disabled={loading}
              className="h-9 px-3 text-xs sm:text-sm gap-1.5 shadow-soft"
            >
              <RefreshCw className={cn("h-4 w-4 shrink-0", loading && "animate-spin")} />
              <span>รีเฟรช</span>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <KPICard
          icon={<ClipboardList className="h-4 w-4 sm:h-5 sm:w-5" />}
          label="ใบแจ้งซ่อมทั้งหมด"
          value={total}
          subtext="งานแจ้งซ่อมในระบบ"
          tone="primary"
          loading={loading}
        />
        <KPICard
          icon={<Clock className="h-4 w-4 sm:h-5 sm:w-5" />}
          label="รอดำเนินการ"
          value={pending}
          subtext="รอรับเรื่อง & มอบหมาย"
          tone="warning"
          loading={loading}
        />
        <KPICard
          icon={<Wrench className="h-4 w-4 sm:h-5 sm:w-5" />}
          label="กำลังดำเนินการ"
          value={inProgress}
          subtext="ช่างกำลังเข้าตรวจสอบ"
          tone="accent"
          loading={loading}
        />
        <KPICard
          icon={<CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />}
          label="เสร็จสิ้นแล้ว"
          value={completed}
          subtext={`คิดเป็น ${completionRate}% ของทั้งหมด`}
          tone="success"
          progress={completionRate}
          loading={loading}
        />
        <KPICard
          icon={<AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />}
          label="งานด่วน / ด่วนที่สุด"
          value={urgentCount}
          subtext="ระดับความสำคัญสูง"
          tone="destructive"
          loading={loading}
          className="col-span-2 md:col-span-1"
        />
      </div>

      {/* Shadcn UI Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b pb-3">
          <div className="w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <TabsList className="inline-flex h-11 w-max min-w-full sm:min-w-0 sm:w-auto items-center justify-start sm:justify-center rounded-xl bg-muted/60 p-1 gap-1 border border-border/40 shadow-xs">
              <TabsTrigger
                value="overview"
                className="rounded-lg gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium shrink-0 whitespace-nowrap"
              >
                <BarChart3 className="h-4 w-4 shrink-0" />
                <span>ภาพรวมสถิติ</span>
              </TabsTrigger>
              <TabsTrigger
                value="tickets"
                className="rounded-lg gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium shrink-0 whitespace-nowrap"
              >
                <Layers className="h-4 w-4 shrink-0" />
                <span>รายการแจ้งซ่อม</span>
                <Badge variant="secondary" className="ml-1 text-[11px] sm:text-xs px-1.5 py-0 h-4.5 sm:h-5">
                  {filteredTickets.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="departments"
                className="rounded-lg gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium shrink-0 whitespace-nowrap"
              >
                <Activity className="h-4 w-4 shrink-0" />
                <span>สถิติรายแผนก</span>
              </TabsTrigger>
              <TabsTrigger
                value="locations"
                className="rounded-lg gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium shrink-0 whitespace-nowrap"
              >
                <Building2 className="h-4 w-4 shrink-0" />
                <span>วิเคราะห์สถานที่</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {activeTab === "tickets" && (
            <div className="text-xs text-muted-foreground shrink-0 sm:text-right">
              แสดง {filteredTickets.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{" "}
              {Math.min(currentPage * pageSize, filteredTickets.length)} จาก {filteredTickets.length} รายการ
            </div>
          )}
        </div>

        {/* TAB 1: OVERVIEW */}
        <TabsContent value="overview" className="space-y-6">
          {/* Charts Row 1: Department Bar Chart & Status Donut */}
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Department Workload Bar Chart */}
            <Card className="lg:col-span-7 shadow-soft">
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="font-display text-lg sm:text-xl flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      ภาระงานและผลการดำเนินงานรายแผนก
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      เปรียบเทียบจำนวนงานที่เสร็จสิ้นแล้ว กับงานที่คงค้างในแต่ละแผนกช่าง
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {loading ? (
                  <Skeleton className="h-72 w-full rounded-xl" />
                ) : (
                  <>
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={byDept} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.15)" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                          <Tooltip
                            contentStyle={{
                              background: "hsl(var(--card))",
                              borderColor: "hsl(var(--border))",
                              borderRadius: 12,
                              color: "hsl(var(--foreground))",
                              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                            }}
                          />
                          <Legend wrapperStyle={{ paddingTop: "12px", fontSize: "12px" }} />
                          <Bar dataKey="completed" name="เสร็จสิ้น" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={45} />
                          <Bar dataKey="pending" name="คงค้าง/ดำเนินงาน" fill="#F59E0B" radius={[6, 6, 0, 0]} maxBarSize={45} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Department Metric Pills */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-4 border-t">
                      {byDept.map((d) => (
                        <div key={d.name} className="rounded-xl border bg-card/60 p-3 flex flex-col justify-between">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold flex items-center gap-1.5">
                              <span>{d.icon}</span>
                              <span className="truncate">{d.name}</span>
                            </span>
                            <Badge variant="outline" className="text-xs font-mono font-bold">
                              {d.rate}% สำเร็จ
                            </Badge>
                          </div>
                          <div className="space-y-1.5">
                            <Progress value={d.rate} className="h-1.5" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>รวม {d.total}</span>
                              <span className="text-emerald-600 font-medium">เสร็จ {d.completed}</span>
                              <span className="text-amber-600 font-medium">ค้าง {d.pending}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Status Distribution Pie / Donut */}
            <Card className="lg:col-span-5 shadow-soft">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="font-display text-lg sm:text-xl flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-primary" />
                  สัดส่วนสถานะงานซ่อมปัจจุบัน
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  สัดส่วนเปอร์เซ็นต์ตามขั้นตอนการปฏิบัติงานในระบบ
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {loading ? (
                  <Skeleton className="h-72 w-full rounded-xl" />
                ) : byStatus.length === 0 ? (
                  <div className="h-72 flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <Clock className="h-8 w-8 text-muted-foreground/40" />
                    <span>ยังไม่มีข้อมูลสถานะในช่วงเวลานี้</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={byStatus}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={55}
                            outerRadius={85}
                            paddingAngle={4}
                          >
                            {byStatus.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="transparent" />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              background: "hsl(var(--card))",
                              borderColor: "hsl(var(--border))",
                              borderRadius: 12,
                              color: "hsl(var(--foreground))",
                              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Status Breakdown Legend List */}
                    <div className="w-full grid grid-cols-2 gap-2 mt-4 pt-4 border-t">
                      {byStatus.map((s, idx) => (
                        <div key={s.name} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-muted/40">
                          <div className="flex items-center gap-1.5 truncate">
                            <span
                              className="h-2.5 w-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                            />
                            <span className="font-medium truncate">{s.name}</span>
                          </div>
                          <span className="font-mono text-muted-foreground ml-1">{s.value} ({s.percentage}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2: Monthly Trend Area Chart & Top Building Hotspots */}
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Monthly Trend Area Chart */}
            <Card className="lg:col-span-7 shadow-soft">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="font-display text-lg sm:text-xl flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  แนวโน้มการแจ้งซ่อมรายเดือน (6 เดือนย้อนหลัง)
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  ปริมาณงานที่บันทึกเข้าสู่ระบบ เทียบกับ ปริมาณงานที่ซ่อมเสร็จสมบูรณ์
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {loading ? (
                  <Skeleton className="h-72 w-full rounded-xl" />
                ) : (
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={byMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.15)" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            background: "hsl(var(--card))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: 12,
                            color: "hsl(var(--foreground))",
                            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                        <Legend wrapperStyle={{ paddingTop: "12px", fontSize: "12px" }} />
                        <Area
                          type="monotone"
                          dataKey="เสร็จสิ้น"
                          stroke="#10B981"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#colorCompleted)"
                        />
                        <Area
                          type="monotone"
                          dataKey="คงค้าง"
                          stroke="#F59E0B"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#colorPending)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top 5 Building Hotspots */}
            <Card className="lg:col-span-5 shadow-soft">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="font-display text-lg sm:text-xl flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  5 อันดับอาคารที่มีการแจ้งซ่อมสูงสุด
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  พื้นที่ที่ต้องการการตรวจสอบและบำรุงรักษาเชิงรุก
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {loading ? (
                  <Skeleton className="h-72 w-full rounded-xl" />
                ) : topBuildings.length === 0 ? (
                  <div className="h-72 flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <Building2 className="h-8 w-8 text-muted-foreground/40" />
                    <span>ยังไม่มีข้อมูลการแจ้งซ่อมตามอาคาร</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topBuildings.map((b, idx) => (
                      <div key={b.building} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="grid h-5 w-5 place-items-center rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
                              {idx + 1}
                            </span>
                            <span className="font-medium text-foreground truncate max-w-[180px] sm:max-w-[220px]">
                              {b.building}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-muted-foreground">{b.total} งาน</span>
                            <Badge variant="outline" className="text-[11px] px-1.5 py-0">
                              {b.rate}% เสร็จ
                            </Badge>
                          </div>
                        </div>
                        <Progress value={b.rate} className="h-2" />
                      </div>
                    ))}

                    <div className="pt-4 mt-4 border-t flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-primary gap-1"
                        onClick={() => setActiveTab("locations")}
                      >
                        ดูข้อมูลทุกอาคาร
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: TICKETS TABLE */}
        <TabsContent value="tickets" className="space-y-4">
          <Card className="shadow-soft">
            <CardHeader className="p-4 sm:p-6 pb-4 bg-muted/20 border-b">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <CardTitle className="font-display text-lg sm:text-xl flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-primary shrink-0" />
                    ตารางรายการแจ้งซ่อมทั้งหมด
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-0.5">
                    ค้นหา ตรวจสอบรายละเอียด และติดตามความคืบหน้ารายใบงาน
                  </CardDescription>
                </div>

                {/* Search Bar */}
                <div className="relative w-full lg:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="ค้นหารหัส, อาคาร, ห้อง, รายละเอียด..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-9 bg-background shadow-xs h-9 text-xs sm:text-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Filters Bar */}
              <div className="flex flex-wrap items-center gap-2 pt-3 mt-3 border-t border-border/60">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mr-1 shrink-0">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>ตัวกรอง:</span>
                </div>

                {/* Dept Filter */}
                <Select
                  value={selectedDept}
                  onValueChange={(val) => {
                    setSelectedDept(val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full xs:w-[135px] sm:w-[135px] h-8 text-xs bg-background">
                    <SelectValue placeholder="แผนกช่าง" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกแผนกช่าง</SelectItem>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.icon} {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select
                  value={selectedStatus}
                  onValueChange={(val) => {
                    setSelectedStatus(val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full xs:w-[140px] sm:w-[140px] h-8 text-xs bg-background">
                    <SelectValue placeholder="สถานะงาน" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกสถานะ</SelectItem>
                    {STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Priority Filter */}
                <Select
                  value={selectedPriority}
                  onValueChange={(val) => {
                    setSelectedPriority(val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full xs:w-[130px] sm:w-[130px] h-8 text-xs bg-background">
                    <SelectValue placeholder="ความเร่งด่วน" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกระดับความด่วน</SelectItem>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {(searchQuery || selectedDept !== "all" || selectedStatus !== "all" || selectedPriority !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                  >
                    <X className="h-3 w-3" />
                    ล้างตัวกรอง
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="w-[130px] font-semibold">รหัสใบงาน</TableHead>
                    <TableHead className="w-[130px] font-semibold">แผนก</TableHead>
                    <TableHead className="font-semibold">รายละเอียด & สถานที่</TableHead>
                    <TableHead className="w-[110px] font-semibold">ความด่วน</TableHead>
                    <TableHead className="w-[130px] font-semibold">วันที่แจ้ง</TableHead>
                    <TableHead className="w-[140px] font-semibold text-center">สถานะ</TableHead>
                    <TableHead className="w-[80px] text-right font-semibold">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell className="space-y-1">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-32" />
                        </TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24 mx-auto" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : paginatedTickets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-16 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <ClipboardList className="h-10 w-10 text-muted-foreground/30" />
                          <p className="font-medium text-base">ไม่พบรายการแจ้งซ่อมตามเงื่อนไข</p>
                          <Button variant="outline" size="sm" onClick={resetFilters} className="mt-1">
                            รีเซ็ตตัวกรองทั้งหมด
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedTickets.map((t) => {
                      const dept = getDepartmentMeta(t.department);
                      const status = getStatusMeta(t.status);
                      const prio = getPriorityMeta(t.priority);

                      return (
                        <TableRow key={t.id} className="hover:bg-muted/40 transition-colors">
                          {/* Ticket Code */}
                          <TableCell className="font-mono font-bold text-primary">
                            <div className="flex items-center gap-1.5">
                              <Link
                                href={`/tickets/${t.id}`}
                                className="hover:underline focus:outline-none"
                              >
                                {t.ticket_code}
                              </Link>
                              <button
                                onClick={() => handleCopyCode(t.ticket_code)}
                                title="คัดลอกรหัส"
                                className="text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100 transition-opacity"
                              >
                                {copiedCode === t.ticket_code ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          </TableCell>

                          {/* Department */}
                          <TableCell>
                            <Badge variant="outline" className="gap-1 font-medium bg-background/80 whitespace-nowrap">
                              <span>{dept?.icon}</span>
                              <span>{dept?.label}</span>
                            </Badge>
                          </TableCell>

                          {/* Description & Location */}
                          <TableCell>
                            <div className="space-y-1 max-w-[320px] sm:max-w-md">
                              <Link
                                href={`/tickets/${t.id}`}
                                className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1 block"
                              >
                                {t.description}
                              </Link>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3 text-muted-foreground/70 shrink-0" />
                                <span className="truncate">{t.building}{t.room ? ` · ห้อง ${t.room}` : ""}</span>
                              </div>
                            </div>
                          </TableCell>

                          {/* Priority */}
                          <TableCell>
                            <Badge className={cn("text-xs whitespace-nowrap", prio.className)}>
                              {prio.label}
                            </Badge>
                          </TableCell>

                          {/* Date */}
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground/70" />
                              <span>{new Date(t.created_at).toLocaleDateString("th-TH", { dateStyle: "short" })}</span>
                            </div>
                          </TableCell>

                          {/* Status */}
                          <TableCell className="text-center">
                            <Badge className={cn("whitespace-nowrap font-medium text-xs justify-center", status.className)}>
                              {status.label}
                            </Badge>
                          </TableCell>

                          {/* Action Dropdown */}
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>การจัดการ</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                  <Link href={`/tickets/${t.id}`} className="cursor-pointer">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    ดูรายละเอียดเต็ม
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleCopyCode(t.ticket_code)} className="cursor-pointer">
                                  <Copy className="h-4 w-4 mr-2" />
                                  คัดลอกรหัสใบงาน
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                  <Link href={`/technician`} className="cursor-pointer">
                                    <Wrench className="h-4 w-4 mr-2" />
                                    เปิดในแดชบอร์ดช่าง
                                  </Link>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t py-4 px-4 sm:px-6">
                <div className="text-xs text-muted-foreground">
                  หน้า <span className="font-semibold text-foreground">{currentPage}</span> จาก {totalPages}
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-8 px-2.5 sm:px-3 text-xs"
                  >
                    ก่อนหน้า
                  </Button>
                  <div className="hidden sm:flex items-center gap-1">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <Button
                        key={i}
                        variant={currentPage === i + 1 ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentPage(i + 1)}
                        className="h-8 w-8 p-0 text-xs"
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 px-2.5 sm:px-3 text-xs"
                  >
                    ถัดไป
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        {/* TAB 3: DEPARTMENT ANALYTICS */}
        <TabsContent value="departments" className="space-y-6">
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {DEPARTMENTS.map((d) => {
              const deptTickets = tickets.filter((t) => t.department === d.value);
              const deptCompleted = deptTickets.filter((t) => t.status === "completed").length;
              const deptPending = deptTickets.filter((t) => t.status === "pending" || t.status === "assigned").length;
              const deptWorking = deptTickets.filter((t) => t.status === "scheduled" || t.status === "in_progress").length;
              const deptUrgent = deptTickets.filter((t) => (t.priority === "urgent" || t.priority === "critical") && t.status !== "completed").length;
              const rate = deptTickets.length > 0 ? Math.round((deptCompleted / deptTickets.length) * 100) : 0;

              return (
                <Card key={d.value} className="shadow-soft overflow-hidden flex flex-col justify-between">
                  <div>
                    <CardHeader className="border-b bg-muted/20 pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-card border text-2xl shadow-xs">
                            {d.icon}
                          </span>
                          <div>
                            <CardTitle className="font-display text-lg">{d.label}</CardTitle>
                            <CardDescription className="text-xs line-clamp-1">{d.description}</CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      {/* Rate and Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-baseline">
                          <span className="text-xs font-semibold text-muted-foreground">อัตรางานเสร็จสิ้น</span>
                          <span className="font-display text-2xl font-bold text-foreground">{rate}%</span>
                        </div>
                        <Progress value={rate} className="h-2.5" />
                      </div>

                      {/* Stat Breakdown Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl border bg-muted/20 p-3">
                          <span className="text-xs text-muted-foreground block">งานทั้งหมด</span>
                          <span className="font-display text-xl font-bold text-foreground">{deptTickets.length}</span>
                        </div>
                        <div className="rounded-xl border bg-success/10 p-3">
                          <span className="text-xs text-success-foreground block font-medium">เสร็จสิ้น</span>
                          <span className="font-display text-xl font-bold text-success">{deptCompleted}</span>
                        </div>
                        <div className="rounded-xl border bg-warning/10 p-3">
                          <span className="text-xs text-warning-foreground block font-medium">รอดำเนินการ</span>
                          <span className="font-display text-xl font-bold text-warning">{deptPending}</span>
                        </div>
                        <div className="rounded-xl border bg-accent/20 p-3">
                          <span className="text-xs text-accent-foreground block font-medium">กำลังดำเนินการ</span>
                          <span className="font-display text-xl font-bold text-accent-foreground">{deptWorking}</span>
                        </div>
                      </div>

                      {deptUrgent > 0 && (
                        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive font-medium">
                          <AlertTriangle className="h-4 w-4 shrink-0" />
                          <span>มีงานด่วนคงค้างอยู่ {deptUrgent} รายการ</span>
                        </div>
                      )}
                    </CardContent>
                  </div>

                  <CardFooter className="border-t pt-4 bg-card">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs shadow-xs"
                      onClick={() => {
                        setSelectedDept(d.value);
                        setActiveTab("tickets");
                      }}
                    >
                      ดูรายการงานของ {d.label} ({deptTickets.length})
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* TAB 4: LOCATIONS INSIGHTS */}
        <TabsContent value="locations" className="space-y-6">
          <Card className="shadow-soft">
            <CardHeader className="border-b">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="font-display text-xl flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    รายงานสถิติการแจ้งซ่อมจำแนกตามอาคารและสถานที่
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    ภาพรวมความถี่ของปัญหาในแต่ละอาคารภายในมหาวิทยาลัย
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {BUILDINGS.map((bldg) => {
                  const bldgTickets = tickets.filter((t) => t.building === bldg);
                  const bldgCompleted = bldgTickets.filter((t) => t.status === "completed").length;
                  const bldgPending = bldgTickets.filter((t) => t.status !== "completed").length;
                  const rate = bldgTickets.length > 0 ? Math.round((bldgCompleted / bldgTickets.length) * 100) : 0;

                  return (
                    <div
                      key={bldg}
                      className={cn(
                        "rounded-2xl border p-4 transition-all flex flex-col justify-between",
                        bldgTickets.length > 0
                          ? "bg-card hover:shadow-soft hover:border-primary/40"
                          : "bg-muted/10 opacity-60"
                      )}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-semibold text-sm text-foreground line-clamp-1">{bldg}</h4>
                          <Badge variant={bldgTickets.length > 0 ? "secondary" : "outline"} className="text-xs shrink-0 font-mono">
                            {bldgTickets.length} งาน
                          </Badge>
                        </div>

                        {bldgTickets.length > 0 ? (
                          <div className="space-y-2 mt-3">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>อัตราเสร็จสิ้น</span>
                              <span className="font-medium text-foreground">{rate}%</span>
                            </div>
                            <Progress value={rate} className="h-1.5" />
                            <div className="flex items-center gap-2 text-xs pt-1">
                              <span className="text-emerald-600 font-medium">เสร็จ {bldgCompleted}</span>
                              <span className="text-muted-foreground">&bull;</span>
                              <span className="text-amber-600 font-medium">ค้าง {bldgPending}</span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-2">ยังไม่มีประวัติการแจ้งซ่อม</p>
                        )}
                      </div>

                      {bldgTickets.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full mt-4 h-7 text-xs text-primary"
                          onClick={() => {
                            setSearchQuery(bldg);
                            setActiveTab("tickets");
                          }}
                        >
                          กรองรายการอาคารนี้
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// KPI Metric Card Sub-component
function KPICard({
  icon,
  label,
  value,
  subtext,
  tone,
  progress,
  loading,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  subtext: string;
  tone: "primary" | "warning" | "accent" | "success" | "destructive";
  progress?: number;
  loading?: boolean;
  className?: string;
}) {
  const toneMap = {
    primary: "bg-primary/10 text-primary border-primary/20",
    warning: "bg-warning/15 text-warning-foreground border-warning/30",
    accent: "bg-accent/20 text-accent-foreground border-accent/40",
    success: "bg-success/15 text-success border-success/30",
    destructive: "bg-destructive/15 text-destructive border-destructive/30",
  };

  return (
    <Card className={cn("shadow-soft hover:shadow-elegant transition-all duration-300 hover:-translate-y-0.5 overflow-hidden", className)}>
      <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full space-y-2.5 sm:space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground truncate">{label}</span>
          <div className={cn("grid h-7 w-7 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-lg sm:rounded-xl border", toneMap[tone])}>
            {icon}
          </div>
        </div>

        {loading ? (
          <div className="space-y-1.5 sm:space-y-2">
            <Skeleton className="h-7 sm:h-8 w-14 sm:w-16" />
            <Skeleton className="h-3 w-24 sm:w-28" />
          </div>
        ) : (
          <div>
            <p className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{value}</p>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-1">{subtext}</p>
          </div>
        )}

        {typeof progress === "number" && !loading && (
          <Progress value={progress} className="h-1.5 mt-1" />
        )}
      </CardContent>
    </Card>
  );
}
