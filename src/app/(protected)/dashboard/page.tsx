"use client";

import { useAuth } from "@/lib/auth";
import {
  mockProjects,
  mockMilestones,
  mockRisks,
  mockDelayRequests,
  mockTasks,
  getUserById,
  riskImpactLabels,
  healthStatusLabels,
  delayRequestStatusLabels,
  getProjectProgress,
  type HealthStatus,
  type RiskImpact,
  type DelayRequestStatus,
} from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import {
  FolderKanban,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
} from "lucide-react";

const healthColorMap: Record<HealthStatus, string> = {
  green: "bg-ds-success",
  yellow: "bg-ds-warning",
  red: "bg-ds-error",
};

const riskImpactColorMap: Record<RiskImpact, string> = {
  critical: "bg-ds-error text-white",
  high: "bg-ds-error-light text-ds-error",
  medium: "bg-ds-warning-light text-ds-warning",
  low: "bg-ds-success-light text-ds-success",
};

const delayStatusColorMap: Record<DelayRequestStatus, string> = {
  pending: "bg-ds-warning-light text-ds-warning",
  approved: "bg-ds-success-light text-ds-success",
  rejected: "bg-ds-error-light text-ds-error",
};

export default function DashboardPage() {
  const { user } = useAuth();

  // KPI calculations
  const totalProjects = mockProjects.length;
  const inProgressProjects = mockProjects.filter((p) => p.status === "in_progress").length;
  const completedProjects = mockProjects.filter((p) => p.status === "completed").length;
  const overdueProjects = mockProjects.filter((p) => p.healthStatus === "red").length;

  // Upcoming milestones (due in next 30 days and not completed)
  const today = new Date("2026-03-20");
  const thirtyDaysLater = new Date(today);
  thirtyDaysLater.setDate(today.getDate() + 30);

  const upcomingMilestones = mockMilestones
    .filter((m) => {
      const due = new Date(m.dueDate);
      return m.status !== "completed" && due <= thirtyDaysLater && due >= today;
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  // Open risks (sorted by impact severity)
  const impactOrder: Record<RiskImpact, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  const openRisks = mockRisks
    .filter((r) => r.status === "open" || r.status === "mitigating")
    .sort((a, b) => impactOrder[a.impact] - impactOrder[b.impact]);

  // Pending delay requests
  const pendingDelays = mockDelayRequests.filter((d) => d.status === "pending");

  // Projects not updated this week (mock: projects with red/yellow health)
  const warningProjects = mockProjects.filter(
    (p) => p.status === "in_progress" && (p.healthStatus === "yellow" || p.healthStatus === "red")
  );

  const kpiCards = [
    { label: "專案總數", value: totalProjects, icon: FolderKanban, color: "text-ds-primary", bg: "bg-blue-50" },
    { label: "進行中", value: inProgressProjects, icon: PlayCircle, color: "text-ds-secondary", bg: "bg-indigo-50" },
    { label: "已完成", value: completedProjects, icon: CheckCircle2, color: "text-ds-success", bg: "bg-emerald-50" },
    { label: "異常警告", value: overdueProjects, icon: AlertTriangle, color: "text-ds-error", bg: "bg-red-50" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold font-heading text-ds-text">
          歡迎回來，{user?.name}
        </h1>
        <p className="text-ds-text-muted mt-1">以下是您的專案概況</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="border-ds-border">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${kpi.bg}`}>
                  <Icon className={`h-6 w-6 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-sm text-ds-text-muted">{kpi.label}</p>
                  <p className="text-2xl font-bold text-ds-text font-heading">{kpi.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Risk Table */}
        <Card className="border-ds-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-heading text-ds-text">
                <AlertTriangle className="inline-block mr-2 h-4 w-4 text-ds-warning" />
                風險列表
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {openRisks.length} 項
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">風險</TableHead>
                  <TableHead className="text-xs">專案</TableHead>
                  <TableHead className="text-xs">影響度</TableHead>
                  <TableHead className="text-xs">狀態</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {openRisks.slice(0, 5).map((risk) => {
                  const project = mockProjects.find((p) => p.id === risk.projectId);
                  return (
                    <TableRow key={risk.id}>
                      <TableCell className="text-sm font-medium text-ds-text max-w-[180px] truncate">
                        {risk.title}
                      </TableCell>
                      <TableCell className="text-sm text-ds-text-muted">
                        {project?.code}
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${riskImpactColorMap[risk.impact]} border-0`}>
                          {riskImpactLabels[risk.impact]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-ds-text-muted">
                        {risk.status === "open" ? "未處理" : "處理中"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Upcoming Milestones */}
        <Card className="border-ds-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-heading text-ds-text">
                <Clock className="inline-block mr-2 h-4 w-4 text-ds-primary" />
                即將到期里程碑
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {upcomingMilestones.length} 項
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {upcomingMilestones.slice(0, 5).map((ms) => {
                const project = mockProjects.find((p) => p.id === ms.projectId);
                return (
                  <div key={ms.id} className="flex items-center justify-between rounded-lg border border-ds-border p-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ds-text truncate">{ms.name}</p>
                      <p className="text-xs text-ds-text-muted">{project?.name} &middot; 到期：{ms.dueDate}</p>
                    </div>
                    <div className="ml-4 flex items-center gap-2 shrink-0">
                      <div className="w-20">
                        <Progress value={ms.progress} className="h-2" />
                      </div>
                      <span className="text-xs text-ds-text-muted w-8 text-right">{ms.progress}%</span>
                    </div>
                  </div>
                );
              })}
              {upcomingMilestones.length === 0 && (
                <p className="py-4 text-center text-sm text-ds-text-muted">目前沒有即將到期的里程碑</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Warning Projects */}
        <Card className="border-ds-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-heading text-ds-text">
                <AlertTriangle className="inline-block mr-2 h-4 w-4 text-ds-error" />
                需關注專案
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {warningProjects.map((project) => {
                const progress = getProjectProgress(project.id);
                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex items-center justify-between rounded-lg border border-ds-border p-3 hover:bg-ds-surface-hover transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`h-3 w-3 rounded-full shrink-0 ${healthColorMap[project.healthStatus]}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ds-text truncate">{project.name}</p>
                        <p className="text-xs text-ds-text-muted">
                          {project.code} &middot; {healthStatusLabels[project.healthStatus]} &middot; 進度 {progress}%
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-ds-text-light shrink-0" />
                  </Link>
                );
              })}
              {warningProjects.length === 0 && (
                <p className="py-4 text-center text-sm text-ds-text-muted">所有專案運行正常</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Delay Requests */}
        <Card className="border-ds-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-heading text-ds-text">
                <Clock className="inline-block mr-2 h-4 w-4 text-ds-accent" />
                待審核延期申請
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {pendingDelays.length} 項
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {pendingDelays.map((dr) => {
                const task = mockTasks.find((t) => t.id === dr.taskId);
                const requester = getUserById(dr.requesterId);
                const project = mockProjects.find((p) => p.id === dr.projectId);
                return (
                  <div key={dr.id} className="rounded-lg border border-ds-border p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-ds-text">{task?.title}</p>
                      <Badge className={`text-xs border-0 ${delayStatusColorMap[dr.status]}`}>
                        {delayRequestStatusLabels[dr.status]}
                      </Badge>
                    </div>
                    <p className="text-xs text-ds-text-muted">
                      {requester?.name} &middot; {project?.code} &middot;
                      延期至 {dr.requestedDueDate}
                    </p>
                    <p className="text-xs text-ds-text-light mt-1 line-clamp-1">{dr.reason}</p>
                  </div>
                );
              })}
              {pendingDelays.length === 0 && (
                <p className="py-4 text-center text-sm text-ds-text-muted">沒有待審核的延期申請</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
