"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  mockTasks,
  mockProjects,
  taskStatusLabels,
  taskPriorityLabels,
  type Task,
  type TaskStatus,
  type TaskPriority,
} from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  CircleDot,
  CircleOff,
  Timer,
  FolderKanban,
  ChevronRight,
} from "lucide-react";

const STATUS_TABS: { key: TaskStatus | "all"; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "todo", label: "待辦" },
  { key: "in_progress", label: "進行中" },
  { key: "review", label: "審查中" },
  { key: "done", label: "已完成" },
  { key: "blocked", label: "已阻塞" },
];

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function getPriorityBadgeClass(priority: TaskPriority) {
  switch (priority) {
    case "high":
      return "bg-ds-error-light text-ds-error border-ds-error/30";
    case "medium":
      return "bg-ds-warning-light text-ds-warning border-ds-warning/30";
    case "low":
      return "bg-ds-success-light text-ds-success border-ds-success/30";
  }
}

function getStatusBadgeClass(status: TaskStatus) {
  switch (status) {
    case "todo":
      return "bg-ds-surface text-ds-text-muted border-ds-border";
    case "in_progress":
      return "bg-blue-50 text-ds-primary border-ds-primary/30";
    case "review":
      return "bg-purple-50 text-ds-secondary border-ds-secondary/30";
    case "done":
      return "bg-ds-success-light text-ds-success border-ds-success/30";
    case "blocked":
      return "bg-ds-error-light text-ds-error border-ds-error/30";
  }
}

function getStatusIcon(status: TaskStatus) {
  switch (status) {
    case "todo":
      return <CircleDot className="w-4 h-4" />;
    case "in_progress":
      return <Timer className="w-4 h-4" />;
    case "review":
      return <AlertCircle className="w-4 h-4" />;
    case "done":
      return <CheckCircle2 className="w-4 h-4" />;
    case "blocked":
      return <CircleOff className="w-4 h-4" />;
  }
}

function isOverdue(dueDate: string): boolean {
  return new Date(dueDate) < new Date("2026-02-17");
}

function canRequestDelay(task: Task): boolean {
  return task.status === "in_progress" || task.status === "blocked" || isOverdue(task.dueDate);
}

export default function MyTasksPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TaskStatus | "all">("all");
  const [delayDialogOpen, setDelayDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [delayReason, setDelayReason] = useState("");
  const [requestedDate, setRequestedDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) return null;

  const myTasks = mockTasks.filter((t) => t.assigneeId === user.id);

  const filteredTasks = myTasks
    .filter((t) => activeTab === "all" || t.status === activeTab)
    .sort((a, b) => {
      const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  function getProjectName(projectId: string): string {
    return mockProjects.find((p) => p.id === projectId)?.name ?? "未知專案";
  }

  function handleTaskClick(task: Task) {
    const projectName = getProjectName(task.projectId);
    toast.info(`任務詳情：${task.title}`, {
      description: (
        <div className="space-y-1 mt-1 text-sm">
          <div>專案：{projectName}</div>
          <div>說明：{task.description}</div>
          <div>預估工時：{task.estimatedHours} 小時 ／ 實際：{task.actualHours} 小時</div>
          <div>開始日期：{task.startDate}</div>
          <div>截止日期：{task.dueDate}</div>
        </div>
      ),
      duration: 5000,
    });
  }

  function handleOpenDelayDialog(task: Task, e: React.MouseEvent) {
    e.stopPropagation();
    setSelectedTask(task);
    setDelayReason("");
    setRequestedDate("");
    setDelayDialogOpen(true);
  }

  async function handleSubmitDelay() {
    if (!delayReason.trim()) {
      toast.error("請填寫延期原因");
      return;
    }
    if (!requestedDate) {
      toast.error("請選擇申請延期日期");
      return;
    }
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsSubmitting(false);
    setDelayDialogOpen(false);
    toast.success(`延期申請已提交`, {
      description: `「${selectedTask?.title}」的延期申請已送出，等待審核`,
    });
  }

  const counts: Record<TaskStatus | "all", number> = {
    all: myTasks.length,
    todo: myTasks.filter((t) => t.status === "todo").length,
    in_progress: myTasks.filter((t) => t.status === "in_progress").length,
    review: myTasks.filter((t) => t.status === "review").length,
    done: myTasks.filter((t) => t.status === "done").length,
    blocked: myTasks.filter((t) => t.status === "blocked").length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold font-heading text-ds-text">我的任務</h1>
        <p className="text-ds-text-muted mt-1">
          共 {myTasks.length} 項任務，{counts.in_progress} 項進行中，{counts.blocked} 項阻塞
        </p>
      </div>

      {/* Status Filter Tabs */}
      <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as TaskStatus | "all")}>
        <TabsList className="bg-ds-surface border border-ds-border">
          {STATUS_TABS.map((tab) => (
            <TabsTrigger
              key={tab.key}
              value={tab.key}
              className="data-[state=active]:bg-ds-primary data-[state=active]:text-white cursor-pointer"
            >
              {tab.label}
              <span className="ml-1.5 text-xs opacity-70">({counts[tab.key]})</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Task Cards */}
      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-ds-text-muted">
          <CheckCircle2 className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-lg font-medium">沒有符合條件的任務</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const projectName = getProjectName(task.projectId);
            const overdue = isOverdue(task.dueDate) && task.status !== "done";
            const showDelayBtn = canRequestDelay(task);

            return (
              <Card
                key={task.id}
                className="bg-ds-surface border-ds-border hover:border-ds-primary/40 hover:shadow-md transition-all duration-150 cursor-pointer"
                onClick={() => handleTaskClick(task)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Status Icon */}
                    <div className={`mt-0.5 ${getStatusBadgeClass(task.status).split(" ")[1]}`}>
                      {getStatusIcon(task.status)}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-ds-text leading-tight">{task.title}</h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge
                            variant="outline"
                            className={`text-xs font-medium ${getPriorityBadgeClass(task.priority)}`}
                          >
                            {taskPriorityLabels[task.priority]}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs font-medium ${getStatusBadgeClass(task.status)}`}
                          >
                            {taskStatusLabels[task.status]}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-ds-text-muted">
                        <span className="flex items-center gap-1">
                          <FolderKanban className="w-3.5 h-3.5" />
                          {projectName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {task.estimatedHours}h 預估 / {task.actualHours}h 實際
                        </span>
                        <span className={`flex items-center gap-1 ${overdue ? "text-ds-error font-medium" : ""}`}>
                          <Calendar className="w-3.5 h-3.5" />
                          截止：{task.dueDate}
                          {overdue && <span className="text-xs">(已逾期)</span>}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {showDelayBtn && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs border-ds-warning text-ds-warning hover:bg-ds-warning-light cursor-pointer transition-all duration-150"
                          onClick={(e) => handleOpenDelayDialog(task, e)}
                        >
                          申請延期
                        </Button>
                      )}
                      <ChevronRight className="w-4 h-4 text-ds-text-light" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delay Request Dialog */}
      <Dialog open={delayDialogOpen} onOpenChange={setDelayDialogOpen}>
        <DialogContent className="sm:max-w-md bg-ds-surface">
          <DialogHeader>
            <DialogTitle className="text-ds-text font-heading">申請任務延期</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4 py-2">
              <div className="p-3 bg-ds-background rounded-lg border border-ds-border">
                <p className="text-sm font-medium text-ds-text">{selectedTask.title}</p>
                <p className="text-xs text-ds-text-muted mt-1">
                  原截止日期：{selectedTask.dueDate}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requestedDate" className="text-ds-text text-sm font-medium">
                  申請延期至
                </Label>
                <Input
                  id="requestedDate"
                  type="date"
                  value={requestedDate}
                  onChange={(e) => setRequestedDate(e.target.value)}
                  min={selectedTask.dueDate}
                  className="border-ds-border focus:border-ds-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="delayReason" className="text-ds-text text-sm font-medium">
                  延期原因
                </Label>
                <Textarea
                  id="delayReason"
                  placeholder="請說明申請延期的原因..."
                  value={delayReason}
                  onChange={(e) => setDelayReason(e.target.value)}
                  rows={4}
                  className="border-ds-border focus:border-ds-primary resize-none"
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDelayDialogOpen(false)}
              className="cursor-pointer border-ds-border"
            >
              取消
            </Button>
            <Button
              onClick={handleSubmitDelay}
              disabled={isSubmitting}
              className="bg-ds-primary hover:bg-ds-primary-dark text-white cursor-pointer transition-all duration-150"
            >
              {isSubmitting ? "提交中..." : "送出申請"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
