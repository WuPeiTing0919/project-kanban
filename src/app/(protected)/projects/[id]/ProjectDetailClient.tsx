"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  getProjectById,
  getMilestonesByProjectId,
  getTasksByProjectId,
  getTasksByMilestoneId,
  getRisksByProjectId,
  getUserById,
  getProjectProgress,
  projectStatusLabels,
  healthStatusLabels,
  taskStatusLabels,
  taskPriorityLabels,
  riskImpactLabels,
  mockTaskLogs,
  mockUsers,
  type HealthStatus,
  type TaskStatus,
  type TaskPriority,
  type RiskImpact,
  type MilestoneStatus,
  type RiskStatus,
} from "@/lib/mock-data";
import type { DependencyType } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowLeft,
  Edit,
  Target,
  Calendar,
  DollarSign,
  Users,
  BarChart3,
  CheckCircle2,
  Clock,
  AlertTriangle,
  GanttChart,
  FileText,
  GitBranch,
  GitCompare,
  Plus,
  ChevronRight,
  Info,
} from "lucide-react";

// Color maps

const healthDotMap: Record<HealthStatus, string> = {
  green: "bg-ds-success",
  yellow: "bg-ds-warning",
  red: "bg-ds-error",
};

const healthBadgeMap: Record<HealthStatus, string> = {
  green: "bg-ds-success-light text-ds-success",
  yellow: "bg-ds-warning-light text-ds-warning",
  red: "bg-ds-error-light text-ds-error",
};

const taskStatusColorMap: Record<TaskStatus, string> = {
  todo: "bg-gray-100 text-gray-600",
  in_progress: "bg-blue-50 text-ds-primary",
  review: "bg-purple-50 text-purple-600",
  done: "bg-ds-success-light text-ds-success",
  blocked: "bg-ds-error-light text-ds-error",
};

const taskPriorityColorMap: Record<TaskPriority, string> = {
  high: "bg-ds-error-light text-ds-error",
  medium: "bg-ds-warning-light text-ds-warning",
  low: "bg-ds-success-light text-ds-success",
};

const milestoneStatusColorMap: Record<MilestoneStatus, string> = {
  pending: "bg-gray-100 text-gray-600",
  in_progress: "bg-blue-50 text-ds-primary",
  completed: "bg-ds-success-light text-ds-success",
  overdue: "bg-ds-error-light text-ds-error",
};

const milestoneStatusLabels: Record<MilestoneStatus, string> = {
  pending: "待開始",
  in_progress: "進行中",
  completed: "已完成",
  overdue: "已逾期",
};

const riskImpactColorMap: Record<RiskImpact, string> = {
  critical: "bg-red-100 text-red-700",
  high: "bg-ds-error-light text-ds-error",
  medium: "bg-ds-warning-light text-ds-warning",
  low: "bg-ds-success-light text-ds-success",
};

const riskStatusColorMap: Record<RiskStatus, string> = {
  open: "bg-ds-error-light text-ds-error",
  mitigating: "bg-ds-warning-light text-ds-warning",
  resolved: "bg-ds-success-light text-ds-success",
  accepted: "bg-gray-100 text-gray-600",
};

const riskStatusLabels: Record<RiskStatus, string> = {
  open: "開放",
  mitigating: "緩解中",
  resolved: "已解決",
  accepted: "已接受",
};

const depTypeLabels: Record<DependencyType, string> = {
  FS: "完成→開始",
  SS: "開始→開始",
  FF: "完成→完成",
  SF: "開始→完成",
};

const depTypeColorMap: Record<DependencyType, string> = {
  FS: "bg-blue-50 text-ds-primary",
  SS: "bg-purple-50 text-purple-600",
  FF: "bg-ds-warning-light text-ds-warning",
  SF: "bg-ds-error-light text-ds-error",
};

const taskStatusGanttColorMap: Record<TaskStatus, string> = {
  todo: "bg-gray-400",
  in_progress: "bg-ds-primary",
  review: "bg-purple-400",
  done: "bg-ds-success",
  blocked: "bg-ds-error",
};

const logActionColorMap: Record<string, string> = {
  status_change: "bg-blue-50 text-ds-primary",
  comment: "bg-purple-50 text-purple-600",
  assigned: "bg-ds-warning-light text-ds-warning",
  created: "bg-ds-success-light text-ds-success",
};

const logActionLabels: Record<string, string> = {
  status_change: "狀態變更",
  comment: "留言",
  assigned: "指派",
  created: "建立",
};

// Gantt helpers

function parseDate(s: string): Date {
  return new Date(s + "T00:00:00");
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function getMonthsInRange(
  start: Date,
  end: Date
): { year: number; month: number; label: string }[] {
  const months: { year: number; month: number; label: string }[] = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);
  while (cur <= last) {
    months.push({
      year: cur.getFullYear(),
      month: cur.getMonth(),
      label: `${cur.getFullYear()}年${cur.getMonth() + 1}月`,
    });
    cur.setMonth(cur.getMonth() + 1);
  }
  return months;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDateStr(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function getInitials(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

function addDaysToDate(dateStr: string, days: number): string {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Main Page

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [riskDialogOpen, setRiskDialogOpen] = useState(false);
  const [depDialogOpen, setDepDialogOpen] = useState(false);
  const [baselineDialogOpen, setBaselineDialogOpen] = useState(false);

  const project = getProjectById(id);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <p className="text-lg text-ds-text-muted">找不到此專案</p>
        <Button variant="outline" onClick={() => router.push("/projects")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回專案列表
        </Button>
      </div>
    );
  }

  const milestones = getMilestonesByProjectId(project.id);
  const allTasks = getTasksByProjectId(project.id);
  const risks = getRisksByProjectId(project.id);
  const owner = getUserById(project.ownerId);
  const progress = getProjectProgress(project.id);
  const budgetPercent = Math.round((project.budgetUsed / project.budget) * 100);

  const taskStats = {
    total: allTasks.length,
    done: allTasks.filter((t) => t.status === "done").length,
    inProgress: allTasks.filter((t) => t.status === "in_progress").length,
    blocked: allTasks.filter((t) => t.status === "blocked").length,
  };

  // Task logs
  const projectTaskIds = new Set(allTasks.map((t) => t.id));
  const projectLogs = mockTaskLogs.filter((l) => projectTaskIds.has(l.taskId));
  const logsByDate: Record<string, typeof projectLogs> = {};
  for (const log of [...projectLogs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )) {
    const dateKey = formatDateStr(log.timestamp);
    if (!logsByDate[dateKey]) logsByDate[dateKey] = [];
    logsByDate[dateKey].push(log);
  }

  // Team
  const teamMemberIds = new Set<string>();
  teamMemberIds.add(project.ownerId);
  for (const t of allTasks) teamMemberIds.add(t.assigneeId);
  const teamTaskCountMap: Record<string, number> = {};
  for (const t of allTasks) {
    teamTaskCountMap[t.assigneeId] = (teamTaskCountMap[t.assigneeId] || 0) + 1;
  }

  // Gantt
  const ganttRangeStart = (() => {
    if (milestones.length === 0) {
      const d = parseDate(project.startDate);
      return new Date(d.getFullYear(), d.getMonth(), 1);
    }
    const dates = milestones.map((m) => parseDate(m.startDate));
    const earliest = new Date(Math.min(...dates.map((d) => d.getTime())));
    return new Date(earliest.getFullYear(), earliest.getMonth(), 1);
  })();

  const ganttRangeEnd = (() => {
    if (milestones.length === 0) {
      const d = parseDate(project.endDate);
      return new Date(d.getFullYear(), d.getMonth() + 1, 0);
    }
    const dates = milestones.map((m) => parseDate(m.dueDate));
    const latest = new Date(Math.max(...dates.map((d) => d.getTime())));
    return new Date(latest.getFullYear(), latest.getMonth() + 1, 0);
  })();

  const totalDays = daysBetween(ganttRangeStart, ganttRangeEnd) + 1;
  const months = getMonthsInRange(ganttRangeStart, ganttRangeEnd);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayOffset =
    today >= ganttRangeStart && today <= ganttRangeEnd
      ? (daysBetween(ganttRangeStart, today) / totalDays) * 100
      : null;

  function getBarStyle(startDateStr: string, dueDateStr: string) {
    const s = parseDate(startDateStr);
    const e = parseDate(dueDateStr);
    const clampedS = s < ganttRangeStart ? ganttRangeStart : s;
    const clampedE = e > ganttRangeEnd ? ganttRangeEnd : e;
    const left = (daysBetween(ganttRangeStart, clampedS) / totalDays) * 100;
    const width = ((daysBetween(clampedS, clampedE) + 1) / totalDays) * 100;
    return { left: `${Math.max(0, left)}%`, width: `${Math.max(0.5, width)}%` };
  }

  // Mock dependencies
  const mockDeps: Array<{
    id: string;
    upstreamTask: (typeof allTasks)[0];
    downstreamTask: (typeof allTasks)[0];
    type: DependencyType;
  }> = [];
  if (allTasks.length >= 2) {
    const tl = allTasks.slice(0, Math.min(6, allTasks.length));
    if (tl[0] && tl[1])
      mockDeps.push({ id: "dep1", upstreamTask: tl[0], downstreamTask: tl[1], type: "FS" });
    if (tl[1] && tl[2])
      mockDeps.push({ id: "dep2", upstreamTask: tl[1], downstreamTask: tl[2], type: "FS" });
    if (tl[2] && tl[3])
      mockDeps.push({ id: "dep3", upstreamTask: tl[2], downstreamTask: tl[3], type: "SS" });
    if (tl[3] && tl[4])
      mockDeps.push({ id: "dep4", upstreamTask: tl[3], downstreamTask: tl[4], type: "FF" });
    if (tl[4] && tl[5])
      mockDeps.push({ id: "dep5", upstreamTask: tl[4], downstreamTask: tl[5], type: "SF" });
  }

  // Mock baselines
  const mockBaselines = milestones.slice(0, 3).map((m, i) => ({
    id: `bl${i + 1}`,
    snapshotName:
      i === 0 ? "初始基線 v1.0" : i === 1 ? "第一次修訂 v1.1" : "第二次修訂 v1.2",
    snapshotAt: i === 0 ? "2026-01-20" : i === 1 ? "2026-02-15" : "2026-03-01",
    milestoneId: m.id,
    milestoneName: m.name,
    plannedEnd: i === 0 ? m.dueDate : addDaysToDate(m.dueDate, (i - 1) * -5),
    actualEnd: m.status === "completed" ? m.dueDate : null,
    currentProgress: m.progress,
  }));

  function calcDeviation(planned: string, actual: string | null): number | null {
    if (!actual) return null;
    return daysBetween(parseDate(planned), parseDate(actual));
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/projects")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className={`h-4 w-4 rounded-full ${healthDotMap[project.healthStatus]}`} />
            <div>
              <h1 className="text-2xl font-bold font-heading text-ds-text">{project.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-ds-text-muted">{project.code}</span>
                <Badge className={`text-xs border-0 ${healthBadgeMap[project.healthStatus]}`}>
                  {healthStatusLabels[project.healthStatus]}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <Link href={`/projects/${project.id}/edit`}>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            編輯專案
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start border-b border-ds-border bg-transparent p-0 h-auto rounded-none overflow-x-auto">
          {(
            [
              { value: "overview", Icon: Target, label: "概覽" },
              { value: "tasks", Icon: CheckCircle2, label: "工作項目" },
              { value: "gantt", Icon: GanttChart, label: "甘特圖" },
              { value: "logs", Icon: FileText, label: "工作日誌" },
              { value: "team", Icon: Users, label: "團隊" },
              { value: "risks", Icon: AlertTriangle, label: "風險" },
              { value: "deps", Icon: GitBranch, label: "相依分析" },
              { value: "baseline", Icon: GitCompare, label: "基線比較" },
            ] as const
          ).map(({ value, Icon, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-ds-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 shrink-0 transition-all duration-150"
            >
              <Icon className="mr-2 h-4 w-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab 1: 概覽 */}
        <TabsContent value="overview" className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card className="border-ds-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                    <BarChart3 className="h-5 w-5 text-ds-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-ds-text-muted">任務進度</p>
                    <p className="text-lg font-bold text-ds-text font-heading">{progress}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-ds-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                    <CheckCircle2 className="h-5 w-5 text-ds-success" />
                  </div>
                  <div>
                    <p className="text-xs text-ds-text-muted">已完成</p>
                    <p className="text-lg font-bold text-ds-text font-heading">
                      {taskStats.done}/{taskStats.total}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-ds-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                    <Clock className="h-5 w-5 text-ds-secondary" />
                  </div>
                  <div>
                    <p className="text-xs text-ds-text-muted">進行中</p>
                    <p className="text-lg font-bold text-ds-text font-heading">
                      {taskStats.inProgress}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-ds-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
                    <AlertTriangle className="h-5 w-5 text-ds-error" />
                  </div>
                  <div>
                    <p className="text-xs text-ds-text-muted">已阻塞</p>
                    <p className="text-lg font-bold text-ds-text font-heading">
                      {taskStats.blocked}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="border-ds-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-heading text-ds-text flex items-center gap-2">
                  <Target className="h-4 w-4 text-ds-primary" />
                  SMART 目標
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(project.smartGoals).map(([key, value]) => (
                  <div key={key} className="flex gap-3">
                    <Badge
                      variant="outline"
                      className="shrink-0 h-6 w-6 p-0 flex items-center justify-center text-xs font-bold"
                    >
                      {key}
                    </Badge>
                    <p className="text-sm text-ds-text">{value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-ds-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-heading text-ds-text flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-ds-primary" />
                  基本資訊
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-ds-text-muted mb-1">狀態</p>
                    <p className="text-sm font-medium text-ds-text">
                      {projectStatusLabels[project.status]}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-ds-text-muted mb-1">類型</p>
                    <p className="text-sm font-medium text-ds-text">
                      {project.type === "internal"
                        ? "內部"
                        : project.type === "external"
                        ? "外部"
                        : "研究"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-ds-text-muted mb-1">開始日期</p>
                    <p className="text-sm font-medium text-ds-text">{project.startDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ds-text-muted mb-1">結束日期</p>
                    <p className="text-sm font-medium text-ds-text">{project.endDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ds-text-muted mb-1">負責人</p>
                    <p className="text-sm font-medium text-ds-text">
                      <Users className="inline-block mr-1 h-3 w-3" />
                      {owner?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-ds-text-muted mb-1">優先等級</p>
                    <p className="text-sm font-medium text-ds-text">
                      {project.level === "high" ? "高" : project.level === "medium" ? "中" : "低"}
                    </p>
                  </div>
                </div>
                <div className="pt-3 border-t border-ds-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-ds-text-muted flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      預算使用
                    </span>
                    <span className="text-xs font-medium text-ds-text">
                      NT$ {project.budgetUsed.toLocaleString()} /{" "}
                      {project.budget.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={budgetPercent} className="h-2" />
                  <p className="text-xs text-ds-text-light mt-1 text-right">{budgetPercent}%</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-ds-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-heading text-ds-text">專案說明</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-ds-text leading-relaxed">{project.description}</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: 工作項目 */}
        <TabsContent value="tasks" className="space-y-6 pt-4">
          {milestones.map((milestone) => {
            const mTasks = getTasksByMilestoneId(milestone.id);
            return (
              <Card key={milestone.id} className="border-ds-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-base font-heading text-ds-text">
                        {milestone.name}
                      </CardTitle>
                      <Badge
                        className={`text-xs border-0 ${milestoneStatusColorMap[milestone.status]}`}
                      >
                        {milestoneStatusLabels[milestone.status]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24">
                        <Progress value={milestone.progress} className="h-2" />
                      </div>
                      <span className="text-xs text-ds-text-muted">{milestone.progress}%</span>
                    </div>
                  </div>
                  <p className="text-xs text-ds-text-muted mt-1">
                    {milestone.startDate} ~ {milestone.dueDate}
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  {mTasks.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">任務</TableHead>
                          <TableHead className="text-xs">狀態</TableHead>
                          <TableHead className="text-xs">優先級</TableHead>
                          <TableHead className="text-xs">負責人</TableHead>
                          <TableHead className="text-xs">到期日</TableHead>
                          <TableHead className="text-xs text-right">工時</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mTasks.map((task) => {
                          const assignee = getUserById(task.assigneeId);
                          return (
                            <TableRow
                              key={task.id}
                              className="cursor-pointer hover:bg-ds-surface-hover transition-all duration-150"
                            >
                              <TableCell className="text-sm font-medium text-ds-text">
                                {task.title}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={`text-xs border-0 ${taskStatusColorMap[task.status]}`}
                                >
                                  {taskStatusLabels[task.status]}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={`text-xs border-0 ${taskPriorityColorMap[task.priority]}`}
                                >
                                  {taskPriorityLabels[task.priority]}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-ds-text-muted">
                                {assignee?.name}
                              </TableCell>
                              <TableCell className="text-sm text-ds-text-muted">
                                {task.dueDate}
                              </TableCell>
                              <TableCell className="text-sm text-ds-text-muted text-right">
                                {task.actualHours}/{task.estimatedHours}h
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="py-4 text-center text-sm text-ds-text-muted">
                      此里程碑尚無任務
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
          {milestones.length === 0 && (
            <div className="py-12 text-center text-ds-text-muted">此專案尚無里程碑</div>
          )}
        </TabsContent>

        {/* Tab 3: 甘特圖 */}
        <TabsContent value="gantt" className="pt-4">
          <Card className="border-ds-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-base font-heading text-ds-text flex items-center gap-2">
                  <GanttChart className="h-4 w-4 text-ds-primary" />
                  甘特圖（月視圖）
                </CardTitle>
                <div className="flex items-center gap-4 text-xs text-ds-text-muted flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-3 w-6 rounded bg-slate-600 opacity-80" />
                    里程碑
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-3 w-6 rounded bg-ds-primary" />
                    進行中
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-3 w-6 rounded bg-ds-success" />
                    已完成
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-3 w-6 rounded bg-ds-error" />
                    阻塞
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                    今日
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {milestones.length === 0 ? (
                <p className="py-8 text-center text-sm text-ds-text-muted">此專案尚無里程碑</p>
              ) : (
                <div className="min-w-[700px]">
                  <div className="flex mb-2 pl-44">
                    {months.map((m) => {
                      const days = daysInMonth(m.year, m.month);
                      const widthPct = (days / totalDays) * 100;
                      return (
                        <div
                          key={`${m.year}-${m.month}`}
                          style={{ width: `${widthPct}%` }}
                          className="text-xs text-ds-text-muted font-medium border-l border-ds-border pl-1 shrink-0"
                        >
                          {m.label}
                        </div>
                      );
                    })}
                  </div>
                  <div className="space-y-0.5">
                    {milestones.map((milestone) => {
                      const mTasks = getTasksByMilestoneId(milestone.id);
                      const msBar = getBarStyle(milestone.startDate, milestone.dueDate);
                      return (
                        <div key={milestone.id}>
                          <div className="flex items-center h-8">
                            <div className="w-44 shrink-0 pr-3 text-xs font-semibold text-ds-text truncate">
                              {milestone.name}
                            </div>
                            <div className="relative flex-1 h-full">
                              <div className="absolute inset-0 flex pointer-events-none">
                                {months.map((m) => (
                                  <div
                                    key={`${m.year}-${m.month}`}
                                    style={{
                                      width: `${(daysInMonth(m.year, m.month) / totalDays) * 100}%`,
                                    }}
                                    className="border-l border-ds-border h-full shrink-0"
                                  />
                                ))}
                              </div>
                              {todayOffset !== null && (
                                <div
                                  className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
                                  style={{ left: `${todayOffset}%` }}
                                />
                              )}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div
                                      className="absolute top-1 h-6 rounded bg-slate-600 opacity-80 flex items-center px-2 cursor-pointer transition-all duration-150 hover:opacity-100 overflow-hidden"
                                      style={msBar}
                                    >
                                      <div
                                        className="absolute left-0 top-0 bottom-0 bg-white/20 rounded"
                                        style={{ width: `${milestone.progress}%` }}
                                      />
                                      <span className="relative text-white text-xs font-medium z-10">
                                        {milestone.progress}%
                                      </span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="font-medium">{milestone.name}</p>
                                    <p className="text-xs text-ds-text-muted">
                                      {milestone.startDate} ~ {milestone.dueDate}
                                    </p>
                                    <p className="text-xs">進度：{milestone.progress}%</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                          {mTasks.map((task) => {
                            const tBar = getBarStyle(task.startDate, task.dueDate);
                            const taskPct =
                              task.estimatedHours > 0
                                ? Math.min(
                                    100,
                                    Math.round((task.actualHours / task.estimatedHours) * 100)
                                  )
                                : 0;
                            return (
                              <div key={task.id} className="flex items-center h-7">
                                <div className="w-44 shrink-0 pr-3 pl-3 text-xs text-ds-text-muted truncate flex items-center gap-1">
                                  <ChevronRight className="h-3 w-3 shrink-0 text-ds-text-light" />
                                  {task.title}
                                </div>
                                <div className="relative flex-1 h-full">
                                  <div className="absolute inset-0 flex pointer-events-none">
                                    {months.map((m) => (
                                      <div
                                        key={`${m.year}-${m.month}`}
                                        style={{
                                          width: `${(daysInMonth(m.year, m.month) / totalDays) * 100}%`,
                                        }}
                                        className="border-l border-ds-border/50 h-full shrink-0"
                                      />
                                    ))}
                                  </div>
                                  {todayOffset !== null && (
                                    <div
                                      className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
                                      style={{ left: `${todayOffset}%` }}
                                    />
                                  )}
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div
                                          className={`absolute top-1 h-5 rounded ${taskStatusGanttColorMap[task.status]} flex items-center px-1.5 cursor-pointer transition-all duration-150 hover:opacity-90 overflow-hidden`}
                                          style={tBar}
                                        >
                                          <div
                                            className="absolute left-0 top-0 bottom-0 bg-white/20 rounded"
                                            style={{ width: `${taskPct}%` }}
                                          />
                                          <span className="relative text-white text-xs z-10">
                                            {taskPct > 0 ? `${taskPct}%` : ""}
                                          </span>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="font-medium">{task.title}</p>
                                        <p className="text-xs text-ds-text-muted">
                                          {task.startDate} ~ {task.dueDate}
                                        </p>
                                        <p className="text-xs">
                                          狀態：{taskStatusLabels[task.status]}
                                        </p>
                                        <p className="text-xs">
                                          工時：{task.actualHours}/{task.estimatedHours}h
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: 工作日誌 */}
        <TabsContent value="logs" className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold font-heading text-ds-text">工作日誌</h2>
            <Button size="sm" onClick={() => setLogDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              新增日誌
            </Button>
          </div>
          {Object.keys(logsByDate).length === 0 ? (
            <Card className="border-ds-border">
              <CardContent className="py-12 text-center text-sm text-ds-text-muted">
                此專案尚無工作日誌
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(logsByDate).map(([date, logs]) => (
                <div key={date}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm font-semibold text-ds-text-muted">{date}</span>
                    <Separator className="flex-1" />
                  </div>
                  <Card className="border-ds-border">
                    <CardContent className="p-0">
                      {logs.map((log, idx) => {
                        const task = allTasks.find((t) => t.id === log.taskId);
                        const user = getUserById(log.userId);
                        return (
                          <div
                            key={log.id}
                            className={`flex items-start gap-4 p-4 hover:bg-ds-surface-hover transition-all duration-150 cursor-pointer${
                              idx < logs.length - 1 ? " border-b border-ds-border" : ""
                            }`}
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ds-primary text-white text-xs font-bold">
                              {user ? getInitials(user.name) : "??"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-ds-text">
                                  {user?.name ?? "未知使用者"}
                                </span>
                                <Badge
                                  className={`text-xs border-0 ${
                                    logActionColorMap[log.action] ?? "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {logActionLabels[log.action] ?? log.action}
                                </Badge>
                                {task && (
                                  <span className="text-xs text-ds-text-muted truncate">
                                    [{task.title}]
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-ds-text mt-1">{log.detail}</p>
                              <p className="text-xs text-ds-text-light mt-1">
                                {formatDateTime(log.timestamp)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
          <Dialog open={logDialogOpen} onOpenChange={setLogDialogOpen}>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle className="font-heading">新增工作日誌</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label>相關任務</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇任務..." />
                    </SelectTrigger>
                    <SelectContent>
                      {allTasks.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>類型</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇類型..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comment">留言</SelectItem>
                      <SelectItem value="status_change">狀態變更</SelectItem>
                      <SelectItem value="assigned">指派</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>內容</Label>
                  <Textarea placeholder="請輸入日誌內容..." rows={4} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setLogDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={() => setLogDialogOpen(false)}>儲存</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Tab 5: 團隊 */}
        <TabsContent value="team" className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold font-heading text-ds-text">
              團隊成員（{teamMemberIds.size} 人）
            </h2>
            <Button size="sm" onClick={() => setMemberDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              新增成員
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from(teamMemberIds).map((uid) => {
              const member = getUserById(uid);
              if (!member) return null;
              const isOwner = uid === project.ownerId;
              const taskCount = teamTaskCountMap[uid] || 0;
              return (
                <Card
                  key={uid}
                  className="border-ds-border cursor-pointer hover:bg-ds-surface-hover transition-all duration-150"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ds-primary text-white text-sm font-bold">
                        {getInitials(member.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-ds-text truncate">
                            {member.name}
                          </p>
                          {isOwner && (
                            <Badge className="text-xs border-0 bg-ds-primary text-white shrink-0">
                              負責人
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-ds-text-muted mt-0.5">{member.department}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-ds-text-light">
                            角色：
                            {member.role === "PM"
                              ? "專案經理"
                              : member.role === "Member"
                              ? "成員"
                              : "主管"}
                          </span>
                          <Separator orientation="vertical" className="h-3" />
                          <span className="text-xs text-ds-text-light">任務：{taskCount} 件</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <Dialog open={memberDialogOpen} onOpenChange={setMemberDialogOpen}>
            <DialogContent className="sm:max-w-[420px]">
              <DialogHeader>
                <DialogTitle className="font-heading">新增成員</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label>選擇成員</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇使用者..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockUsers
                        .filter((u) => !teamMemberIds.has(u.id))
                        .map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name}（{u.department}）
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>備註</Label>
                  <Input placeholder="成員備註（選填）" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setMemberDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={() => setMemberDialogOpen(false)}>新增</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Tab 6: 風險 */}
        <TabsContent value="risks" className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold font-heading text-ds-text">
              風險清單（{risks.length} 項）
            </h2>
            <Button size="sm" onClick={() => setRiskDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              新增風險
            </Button>
          </div>
          {risks.length === 0 ? (
            <Card className="border-ds-border">
              <CardContent className="py-12 text-center text-sm text-ds-text-muted">
                此專案尚無風險登錄
              </CardContent>
            </Card>
          ) : (
            <Card className="border-ds-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">風險名稱</TableHead>
                    <TableHead className="text-xs">影響程度</TableHead>
                    <TableHead className="text-xs">發生機率</TableHead>
                    <TableHead className="text-xs">狀態</TableHead>
                    <TableHead className="text-xs">負責人</TableHead>
                    <TableHead className="text-xs">緩解方案</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {risks.map((risk) => {
                    const riskOwner = getUserById(risk.ownerId);
                    return (
                      <TableRow
                        key={risk.id}
                        className="cursor-pointer hover:bg-ds-surface-hover transition-all duration-150"
                      >
                        <TableCell>
                          <p className="text-sm font-medium text-ds-text">{risk.title}</p>
                          <p className="text-xs text-ds-text-muted mt-0.5 max-w-[200px] truncate">
                            {risk.description}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs border-0 ${riskImpactColorMap[risk.impact]}`}>
                            {riskImpactLabels[risk.impact]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16">
                              <Progress value={risk.probability * 100} className="h-1.5" />
                            </div>
                            <span className="text-xs text-ds-text-muted">
                              {Math.round(risk.probability * 100)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`text-xs border-0 ${riskStatusColorMap[risk.status]}`}
                          >
                            {riskStatusLabels[risk.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-ds-text-muted">
                          {riskOwner?.name}
                        </TableCell>
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="text-xs text-ds-text max-w-[160px] truncate cursor-help">
                                  {risk.mitigation}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-[260px]">
                                <p className="text-xs">{risk.mitigation}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
          <Dialog open={riskDialogOpen} onOpenChange={setRiskDialogOpen}>
            <DialogContent className="sm:max-w-[520px]">
              <DialogHeader>
                <DialogTitle className="font-heading">新增風險</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label>風險名稱</Label>
                  <Input placeholder="請輸入風險名稱..." />
                </div>
                <div className="space-y-1.5">
                  <Label>說明</Label>
                  <Textarea placeholder="請描述風險詳情..." rows={2} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>影響程度</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="選擇..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">嚴重</SelectItem>
                        <SelectItem value="high">高</SelectItem>
                        <SelectItem value="medium">中</SelectItem>
                        <SelectItem value="low">低</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>狀態</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="選擇..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">開放</SelectItem>
                        <SelectItem value="mitigating">緩解中</SelectItem>
                        <SelectItem value="resolved">已解決</SelectItem>
                        <SelectItem value="accepted">已接受</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>緩解方案</Label>
                  <Textarea placeholder="請描述緩解方案..." rows={2} />
                </div>
                <div className="space-y-1.5">
                  <Label>負責人</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇負責人..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(teamMemberIds).map((uid) => {
                        const u = getUserById(uid);
                        return u ? (
                          <SelectItem key={uid} value={uid}>
                            {u.name}
                          </SelectItem>
                        ) : null;
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRiskDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={() => setRiskDialogOpen(false)}>儲存</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Tab 7: 相依分析 */}
        <TabsContent value="deps" className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold font-heading text-ds-text">
                相依關係（{mockDeps.length} 項）
              </h2>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-ds-text-muted cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[300px]">
                    <p className="text-xs font-semibold mb-1">相依類型說明</p>
                    <p className="text-xs">FS（完成→開始）：前置完成後，後置才能開始</p>
                    <p className="text-xs">SS（開始→開始）：前置開始後，後置才能開始</p>
                    <p className="text-xs">FF（完成→完成）：前置完成後，後置才能完成</p>
                    <p className="text-xs">SF（開始→完成）：前置開始後，後置才能完成</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Button size="sm" onClick={() => setDepDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              新增相依
            </Button>
          </div>
          {mockDeps.length === 0 ? (
            <Card className="border-ds-border">
              <CardContent className="py-12 text-center text-sm text-ds-text-muted">
                此專案尚無相依關係設定
              </CardContent>
            </Card>
          ) : (
            <Card className="border-ds-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">前置任務（上游）</TableHead>
                    <TableHead className="text-xs text-center">相依類型</TableHead>
                    <TableHead className="text-xs">後置任務（下游）</TableHead>
                    <TableHead className="text-xs">前置狀態</TableHead>
                    <TableHead className="text-xs">後置狀態</TableHead>
                    <TableHead className="text-xs">視覺關係</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockDeps.map((dep) => (
                    <TableRow
                      key={dep.id}
                      className="cursor-pointer hover:bg-ds-surface-hover transition-all duration-150"
                    >
                      <TableCell>
                        <p className="text-sm font-medium text-ds-text">
                          {dep.upstreamTask.title}
                        </p>
                        <p className="text-xs text-ds-text-muted">{dep.upstreamTask.dueDate}</p>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={`text-xs border-0 font-mono ${depTypeColorMap[dep.type]}`}
                        >
                          {dep.type}
                        </Badge>
                        <p className="text-xs text-ds-text-muted mt-0.5">
                          {depTypeLabels[dep.type]}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium text-ds-text">
                          {dep.downstreamTask.title}
                        </p>
                        <p className="text-xs text-ds-text-muted">{dep.downstreamTask.dueDate}</p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`text-xs border-0 ${taskStatusColorMap[dep.upstreamTask.status]}`}
                        >
                          {taskStatusLabels[dep.upstreamTask.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`text-xs border-0 ${taskStatusColorMap[dep.downstreamTask.status]}`}
                        >
                          {taskStatusLabels[dep.downstreamTask.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs">
                          <span className="max-w-[56px] truncate text-ds-text-muted">
                            {dep.upstreamTask.title.slice(0, 5)}
                          </span>
                          <div className="flex items-center">
                            <div className="h-px w-5 bg-ds-border-dark" />
                            <ChevronRight className="h-3 w-3 text-ds-text-muted" />
                          </div>
                          <span className="max-w-[56px] truncate text-ds-text-muted">
                            {dep.downstreamTask.title.slice(0, 5)}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
          <Dialog open={depDialogOpen} onOpenChange={setDepDialogOpen}>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle className="font-heading">新增相依關係</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label>前置任務（上游）</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇前置任務..." />
                    </SelectTrigger>
                    <SelectContent>
                      {allTasks.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>相依類型</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇類型..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FS">FS — 完成→開始</SelectItem>
                      <SelectItem value="SS">SS — 開始→開始</SelectItem>
                      <SelectItem value="FF">FF — 完成→完成</SelectItem>
                      <SelectItem value="SF">SF — 開始→完成</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>後置任務（下游）</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇後置任務..." />
                    </SelectTrigger>
                    <SelectContent>
                      {allTasks.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDepDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={() => setDepDialogOpen(false)}>新增</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Tab 8: 基線比較 */}
        <TabsContent value="baseline" className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold font-heading text-ds-text">
              基線比較（{mockBaselines.length} 條基線）
            </h2>
            <Button size="sm" onClick={() => setBaselineDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              建立基線
            </Button>
          </div>
          {mockBaselines.length === 0 ? (
            <Card className="border-ds-border">
              <CardContent className="py-12 text-center text-sm text-ds-text-muted">
                此專案尚無基線快照
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {mockBaselines.map((bl) => {
                const deviation = calcDeviation(bl.plannedEnd, bl.actualEnd);
                const isOnTime = deviation !== null && deviation <= 0;
                const isLate = deviation !== null && deviation > 0;
                return (
                  <Card
                    key={bl.id}
                    className="border-ds-border cursor-pointer hover:bg-ds-surface-hover transition-all duration-150"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-sm font-heading text-ds-text">
                            {bl.snapshotName}
                          </CardTitle>
                          <p className="text-xs text-ds-text-muted mt-0.5">
                            快照建立：{bl.snapshotAt}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {bl.milestoneName}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">里程碑</TableHead>
                            <TableHead className="text-xs">計畫完成日</TableHead>
                            <TableHead className="text-xs">實際完成日</TableHead>
                            <TableHead className="text-xs">偏差（天）</TableHead>
                            <TableHead className="text-xs">目前進度</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow className="hover:bg-ds-surface-hover transition-all duration-150">
                            <TableCell className="text-sm font-medium text-ds-text">
                              {bl.milestoneName}
                            </TableCell>
                            <TableCell className="text-sm text-ds-text-muted">
                              {bl.plannedEnd}
                            </TableCell>
                            <TableCell className="text-sm text-ds-text-muted">
                              {bl.actualEnd ?? (
                                <span className="text-ds-text-light italic text-xs">
                                  尚未完成
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {deviation === null ? (
                                <span className="text-xs text-ds-text-light">—</span>
                              ) : (
                                <span
                                  className={`text-sm font-semibold ${
                                    isOnTime ? "text-ds-success" : "text-ds-error"
                                  }`}
                                >
                                  {deviation === 0
                                    ? "準時"
                                    : isLate
                                    ? `+${deviation} 天`
                                    : `${deviation} 天`}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-20">
                                  <Progress value={bl.currentProgress} className="h-1.5" />
                                </div>
                                <span className="text-xs text-ds-text-muted">
                                  {bl.currentProgress}%
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                      {deviation !== null && (
                        <div
                          className={`mt-3 rounded-md px-3 py-2 text-xs flex items-center gap-2 ${
                            isOnTime
                              ? "bg-ds-success-light text-ds-success"
                              : "bg-ds-error-light text-ds-error"
                          }`}
                        >
                          {isOnTime ? (
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                          ) : (
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                          )}
                          {deviation === 0
                            ? "此里程碑準時完成，符合計畫基線。"
                            : isLate
                            ? `此里程碑比計畫基線延遲 ${deviation} 天完成。`
                            : `此里程碑比計畫基線提前 ${Math.abs(deviation)} 天完成。`}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          <Dialog open={baselineDialogOpen} onOpenChange={setBaselineDialogOpen}>
            <DialogContent className="sm:max-w-[460px]">
              <DialogHeader>
                <DialogTitle className="font-heading">建立基線快照</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label>基線名稱</Label>
                  <Input placeholder="例：初始基線 v1.0" />
                </div>
                <div className="space-y-1.5">
                  <Label>里程碑</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇里程碑..." />
                    </SelectTrigger>
                    <SelectContent>
                      {milestones.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}（{m.dueDate}）
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="rounded-md bg-blue-50 px-3 py-2.5 text-xs text-ds-primary flex items-start gap-2">
                  <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  建立基線後將記錄目前各里程碑的計畫日期與進度，作為日後比較的基準。
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setBaselineDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={() => setBaselineDialogOpen(false)}>建立基線</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
