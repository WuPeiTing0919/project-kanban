"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  mockProjects,
  getUserById,
  getProjectProgress,
  projectStatusLabels,
  type ProjectStatus,
  type HealthStatus,
} from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  ArrowRight,
} from "lucide-react";

const healthColorMap: Record<HealthStatus, string> = {
  green: "bg-ds-success",
  yellow: "bg-ds-warning",
  red: "bg-ds-error",
};

const statusBadgeMap: Record<ProjectStatus, string> = {
  planning: "bg-blue-50 text-ds-primary",
  in_progress: "bg-indigo-50 text-ds-secondary",
  on_hold: "bg-ds-warning-light text-ds-warning",
  completed: "bg-ds-success-light text-ds-success",
  cancelled: "bg-ds-error-light text-ds-error",
};

export default function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  const filteredProjects = useMemo(() => {
    return mockProjects.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.code.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-ds-text">專案列表</h1>
          <p className="text-sm text-ds-text-muted mt-1">
            共 {filteredProjects.length} 個專案
          </p>
        </div>
        <Link href="/projects/new">
          <Button className="bg-ds-primary hover:bg-ds-primary-dark text-white">
            <Plus className="mr-2 h-4 w-4" />
            新建專案
          </Button>
        </Link>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ds-text-light" />
          <Input
            placeholder="搜尋專案名稱或代碼..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="篩選狀態" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部狀態</SelectItem>
            <SelectItem value="planning">規劃中</SelectItem>
            <SelectItem value="in_progress">進行中</SelectItem>
            <SelectItem value="on_hold">暫停</SelectItem>
            <SelectItem value="completed">已完成</SelectItem>
            <SelectItem value="cancelled">已取消</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-1 border border-ds-border rounded-lg p-1">
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("table")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "card" ? "default" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("card")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table View */}
      {viewMode === "table" && (
        <Card className="border-ds-border">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">燈號</TableHead>
                  <TableHead>專案名稱</TableHead>
                  <TableHead>代碼</TableHead>
                  <TableHead>狀態</TableHead>
                  <TableHead>負責人</TableHead>
                  <TableHead className="w-[160px]">進度</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => {
                  const owner = getUserById(project.ownerId);
                  const progress = getProjectProgress(project.id);
                  return (
                    <TableRow key={project.id} className="hover:bg-ds-surface-hover">
                      <TableCell>
                        <div className={`h-3 w-3 rounded-full ${healthColorMap[project.healthStatus]}`} />
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/projects/${project.id}`}
                          className="font-medium text-ds-text hover:text-ds-primary transition-colors"
                        >
                          {project.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-ds-text-muted">{project.code}</TableCell>
                      <TableCell>
                        <Badge className={`text-xs border-0 ${statusBadgeMap[project.status]}`}>
                          {projectStatusLabels[project.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-ds-text-muted">{owner?.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={progress} className="h-2 flex-1" />
                          <span className="text-xs text-ds-text-muted w-8 text-right">{progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link href={`/projects/${project.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowRight className="h-4 w-4 text-ds-text-muted" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredProjects.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-ds-text-muted">
                      沒有符合條件的專案
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Card View */}
      {viewMode === "card" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => {
            const owner = getUserById(project.ownerId);
            const progress = getProjectProgress(project.id);
            const budgetPercent = Math.round((project.budgetUsed / project.budget) * 100);
            return (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="border-ds-border hover:border-ds-primary/30 hover:shadow-md transition-all cursor-pointer h-full">
                  <CardContent className="p-5 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full shrink-0 ${healthColorMap[project.healthStatus]}`} />
                        <Badge className={`text-xs border-0 ${statusBadgeMap[project.status]}`}>
                          {projectStatusLabels[project.status]}
                        </Badge>
                      </div>
                      <span className="text-xs text-ds-text-light">{project.code}</span>
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="text-base font-semibold text-ds-text font-heading">
                        {project.name}
                      </h3>
                      <p className="text-xs text-ds-text-muted mt-1 line-clamp-2">
                        {project.description}
                      </p>
                    </div>

                    {/* Progress */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-ds-text-muted">任務進度</span>
                        <span className="text-xs font-medium text-ds-text">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {/* Budget */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-ds-text-muted">預算使用</span>
                        <span className="text-xs font-medium text-ds-text">{budgetPercent}%</span>
                      </div>
                      <Progress value={budgetPercent} className="h-2" />
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-ds-border">
                      <span className="text-xs text-ds-text-muted">負責人：{owner?.name}</span>
                      <span className="text-xs text-ds-text-light">
                        {project.startDate} ~ {project.endDate}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
          {filteredProjects.length === 0 && (
            <div className="col-span-full py-12 text-center text-ds-text-muted">
              沒有符合條件的專案
            </div>
          )}
        </div>
      )}
    </div>
  );
}
