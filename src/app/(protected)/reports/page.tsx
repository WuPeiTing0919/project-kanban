"use client";

import { useState } from "react";
import {
  mockProjects,
  mockRisks,
  projectStatusLabels,
  riskImpactLabels,
  healthStatusLabels,
  type HealthStatus,
  type ProjectStatus,
  getProjectProgress,
  getMilestonesByProjectId,
  getRisksByProjectId,
} from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  FileText,
  BarChart3,
  Download,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ShieldAlert,
} from "lucide-react";

type ReportType = "single" | "summary";

function getHealthBadgeClass(health: HealthStatus) {
  switch (health) {
    case "green":
      return "bg-ds-success-light text-ds-success border-ds-success/30";
    case "yellow":
      return "bg-ds-warning-light text-ds-warning border-ds-warning/30";
    case "red":
      return "bg-ds-error-light text-ds-error border-ds-error/30";
  }
}

function getRiskImpactClass(impact: string) {
  switch (impact) {
    case "critical":
      return "bg-red-100 text-red-700 border-red-300";
    case "high":
      return "bg-ds-error-light text-ds-error border-ds-error/30";
    case "medium":
      return "bg-ds-warning-light text-ds-warning border-ds-warning/30";
    case "low":
      return "bg-ds-success-light text-ds-success border-ds-success/30";
    default:
      return "bg-gray-100 text-gray-600 border-gray-300";
  }
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("single");
  const [selectedProjectId, setSelectedProjectId] = useState<string>(mockProjects[0].id);
  const [isExporting, setIsExporting] = useState(false);

  const selectedProject = mockProjects.find((p) => p.id === selectedProjectId) ?? mockProjects[0];
  const projectMilestones = getMilestonesByProjectId(selectedProject.id);
  const projectRisks = getRisksByProjectId(selectedProject.id);
  const projectProgress = getProjectProgress(selectedProject.id);
  const budgetUtilization = Math.round((selectedProject.budgetUsed / selectedProject.budget) * 100);

  async function handleExportPDF() {
    setIsExporting(true);
    await new Promise((r) => setTimeout(r, 2000));
    setIsExporting(false);
    toast.success("PDF 報告已產生", {
      description: "報告已準備完成，可供下載",
    });
  }

  // Summary stats
  const statusCounts = mockProjects.reduce<Partial<Record<ProjectStatus, number>>>(
    (acc, p) => ({ ...acc, [p.status]: (acc[p.status] ?? 0) + 1 }),
    {}
  );
  const healthCounts = mockProjects.reduce<Partial<Record<HealthStatus, number>>>(
    (acc, p) => ({ ...acc, [p.healthStatus]: (acc[p.healthStatus] ?? 0) + 1 }),
    {}
  );
  const topRisks = mockRisks
    .filter((r) => r.status === "open")
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-ds-text">報表中心</h1>
          <p className="text-ds-text-muted mt-1">產生專案進度與狀態報告</p>
        </div>
        <Button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="bg-ds-primary hover:bg-ds-primary-dark text-white cursor-pointer transition-all duration-150"
        >
          {isExporting ? (
            <>
              <Download className="w-4 h-4 mr-2 animate-bounce" />
              產生中...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              匯出 PDF
            </>
          )}
        </Button>
      </div>

      {/* Report Controls */}
      <Card className="bg-ds-surface border-ds-border">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <Label className="text-sm font-medium text-ds-text whitespace-nowrap">報告類型</Label>
              <Tabs value={reportType} onValueChange={(v: string) => setReportType(v as ReportType)}>
                <TabsList className="bg-ds-background border border-ds-border">
                  <TabsTrigger
                    value="single"
                    className="cursor-pointer data-[state=active]:bg-ds-primary data-[state=active]:text-white"
                  >
                    <FileText className="w-3.5 h-3.5 mr-1.5" />
                    單一專案報告
                  </TabsTrigger>
                  <TabsTrigger
                    value="summary"
                    className="cursor-pointer data-[state=active]:bg-ds-primary data-[state=active]:text-white"
                  >
                    <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
                    跨專案摘要
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {reportType === "single" && (
              <div className="flex items-center gap-3">
                <Label className="text-sm font-medium text-ds-text whitespace-nowrap">選擇專案</Label>
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger className="w-[220px] border-ds-border cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockProjects.map((p) => (
                      <SelectItem key={p.id} value={p.id} className="cursor-pointer">
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-ds-text-muted">
              <Calendar className="w-4 h-4" />
              <span>報告期間：2026-01-01 ～ 2026-03-31</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      {reportType === "single" ? (
        <div className="space-y-5">
          {/* KPI Cards */}
          <div>
            <h2 className="text-base font-semibold text-ds-text mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-ds-primary" />
              專案概覽 — {selectedProject.name}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-ds-surface border-ds-border">
                <CardContent className="p-4">
                  <p className="text-xs text-ds-text-muted font-medium uppercase tracking-wide">整體進度</p>
                  <p className="text-3xl font-bold text-ds-primary mt-1">{projectProgress}%</p>
                  <Progress value={projectProgress} className="mt-2 h-1.5" />
                </CardContent>
              </Card>
              <Card className="bg-ds-surface border-ds-border">
                <CardContent className="p-4">
                  <p className="text-xs text-ds-text-muted font-medium uppercase tracking-wide">預算使用</p>
                  <p className="text-3xl font-bold text-ds-accent mt-1">{budgetUtilization}%</p>
                  <p className="text-xs text-ds-text-muted mt-1">
                    {(selectedProject.budgetUsed / 10000).toFixed(0)}萬 / {(selectedProject.budget / 10000).toFixed(0)}萬
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-ds-surface border-ds-border">
                <CardContent className="p-4">
                  <p className="text-xs text-ds-text-muted font-medium uppercase tracking-wide">健康狀態</p>
                  <div className="mt-2">
                    <Badge
                      variant="outline"
                      className={`text-sm font-semibold px-2 py-0.5 ${getHealthBadgeClass(selectedProject.healthStatus)}`}
                    >
                      {healthStatusLabels[selectedProject.healthStatus]}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-ds-surface border-ds-border">
                <CardContent className="p-4">
                  <p className="text-xs text-ds-text-muted font-medium uppercase tracking-wide">里程碑</p>
                  <p className="text-3xl font-bold text-ds-text mt-1">{projectMilestones.length}</p>
                  <p className="text-xs text-ds-text-muted mt-1">
                    {projectMilestones.filter((m) => m.status === "completed").length} 已完成
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Milestone Table */}
          <Card className="bg-ds-surface border-ds-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-ds-text flex items-center gap-2">
                <Layers className="w-4 h-4 text-ds-primary" />
                里程碑進度
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pb-4">
              <Table>
                <TableHeader>
                  <TableRow className="border-ds-border">
                    <TableHead className="text-ds-text-muted font-medium pl-5">里程碑名稱</TableHead>
                    <TableHead className="text-ds-text-muted font-medium">截止日期</TableHead>
                    <TableHead className="text-ds-text-muted font-medium">進度</TableHead>
                    <TableHead className="text-ds-text-muted font-medium">狀態</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projectMilestones.map((m) => (
                    <TableRow key={m.id} className="border-ds-border hover:bg-ds-surface-hover transition-colors">
                      <TableCell className="font-medium text-ds-text pl-5">{m.name}</TableCell>
                      <TableCell className="text-ds-text-muted text-sm">{m.dueDate}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={m.progress} className="w-24 h-1.5" />
                          <span className="text-sm text-ds-text-muted">{m.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            m.status === "completed"
                              ? "bg-ds-success-light text-ds-success border-ds-success/30"
                              : m.status === "overdue"
                              ? "bg-ds-error-light text-ds-error border-ds-error/30"
                              : m.status === "in_progress"
                              ? "bg-blue-50 text-ds-primary border-ds-primary/30"
                              : "bg-gray-100 text-gray-600 border-gray-300"
                          }`}
                        >
                          {m.status === "completed"
                            ? "已完成"
                            : m.status === "overdue"
                            ? "已逾期"
                            : m.status === "in_progress"
                            ? "進行中"
                            : "待開始"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Risk Table */}
          <Card className="bg-ds-surface border-ds-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-ds-text flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-ds-error" />
                風險清單
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pb-4">
              {projectRisks.length === 0 ? (
                <div className="py-8 text-center text-ds-text-muted text-sm">此專案尚無風險記錄</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-ds-border">
                      <TableHead className="text-ds-text-muted font-medium pl-5">風險名稱</TableHead>
                      <TableHead className="text-ds-text-muted font-medium">衝擊</TableHead>
                      <TableHead className="text-ds-text-muted font-medium">機率</TableHead>
                      <TableHead className="text-ds-text-muted font-medium">狀態</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectRisks.map((r) => (
                      <TableRow key={r.id} className="border-ds-border hover:bg-ds-surface-hover transition-colors">
                        <TableCell className="pl-5">
                          <div className="font-medium text-ds-text">{r.title}</div>
                          <div className="text-xs text-ds-text-muted line-clamp-1">{r.description}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${getRiskImpactClass(r.impact)}`}>
                            {riskImpactLabels[r.impact]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-ds-text-muted text-sm">
                          {Math.round(r.probability * 100)}%
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              r.status === "resolved"
                                ? "bg-ds-success-light text-ds-success border-ds-success/30"
                                : r.status === "mitigating"
                                ? "bg-ds-warning-light text-ds-warning border-ds-warning/30"
                                : r.status === "accepted"
                                ? "bg-gray-100 text-gray-600 border-gray-300"
                                : "bg-ds-error-light text-ds-error border-ds-error/30"
                            }`}
                          >
                            {r.status === "open"
                              ? "開放"
                              : r.status === "mitigating"
                              ? "緩解中"
                              : r.status === "resolved"
                              ? "已解決"
                              : "已接受"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Summary Report */
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Project Status Distribution */}
            <Card className="bg-ds-surface border-ds-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-ds-text flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-ds-primary" />
                  專案狀態分佈
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(["planning", "in_progress", "on_hold", "completed", "cancelled"] as ProjectStatus[]).map(
                  (status) => {
                    const count = statusCounts[status] ?? 0;
                    const pct = Math.round((count / mockProjects.length) * 100);
                    return (
                      <div key={status} className="flex items-center gap-3">
                        <span className="text-sm text-ds-text-muted w-20 shrink-0">
                          {projectStatusLabels[status]}
                        </span>
                        <div className="flex-1 bg-ds-background rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-ds-primary rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-ds-text w-8 text-right">{count}</span>
                      </div>
                    );
                  }
                )}
                <Separator className="bg-ds-border" />
                <p className="text-xs text-ds-text-muted text-right">共 {mockProjects.length} 個專案</p>
              </CardContent>
            </Card>

            {/* Health Distribution */}
            <Card className="bg-ds-surface border-ds-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-ds-text flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-ds-success" />
                  健康狀態分佈
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(["green", "yellow", "red"] as HealthStatus[]).map((health) => {
                  const count = healthCounts[health] ?? 0;
                  const pct = Math.round((count / mockProjects.length) * 100);
                  const colorClass =
                    health === "green"
                      ? "bg-ds-success"
                      : health === "yellow"
                      ? "bg-ds-warning"
                      : "bg-ds-error";
                  return (
                    <div key={health} className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full flex-shrink-0 ${colorClass}`} />
                      <span className="text-sm text-ds-text-muted w-12 shrink-0">
                        {healthStatusLabels[health]}
                      </span>
                      <div className="flex-1 bg-ds-background rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-ds-text w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Top Open Risks */}
          <Card className="bg-ds-surface border-ds-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-ds-text flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-ds-warning" />
                高優先風險（開放中）
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pb-4">
              {topRisks.length === 0 ? (
                <div className="py-8 text-center text-ds-text-muted text-sm">目前沒有開放風險</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-ds-border">
                      <TableHead className="text-ds-text-muted font-medium pl-5">風險名稱</TableHead>
                      <TableHead className="text-ds-text-muted font-medium">所屬專案</TableHead>
                      <TableHead className="text-ds-text-muted font-medium">衝擊</TableHead>
                      <TableHead className="text-ds-text-muted font-medium">機率</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topRisks.map((r) => {
                      const projectName =
                        mockProjects.find((p) => p.id === r.projectId)?.name ?? "未知";
                      return (
                        <TableRow key={r.id} className="border-ds-border hover:bg-ds-surface-hover transition-colors">
                          <TableCell className="font-medium text-ds-text pl-5">{r.title}</TableCell>
                          <TableCell className="text-ds-text-muted text-sm">{projectName}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-xs ${getRiskImpactClass(r.impact)}`}>
                              {riskImpactLabels[r.impact]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-ds-text-muted text-sm">
                            {Math.round(r.probability * 100)}%
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
