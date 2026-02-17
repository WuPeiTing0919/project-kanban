"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  mockDelayRequests,
  mockTasks,
  mockProjects,
  mockUsers,
  delayRequestStatusLabels,
  type DelayRequest,
  type DelayRequestStatus,
} from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Calendar,
  User,
  FolderKanban,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

const FILTER_TABS: { key: DelayRequestStatus | "all"; label: string }[] = [
  { key: "pending", label: "待審核" },
  { key: "approved", label: "已核准" },
  { key: "rejected", label: "已駁回" },
  { key: "all", label: "全部" },
];

function getStatusBadge(status: DelayRequestStatus) {
  switch (status) {
    case "pending":
      return "bg-ds-warning-light text-ds-warning border-ds-warning/30";
    case "approved":
      return "bg-ds-success-light text-ds-success border-ds-success/30";
    case "rejected":
      return "bg-ds-error-light text-ds-error border-ds-error/30";
  }
}

function getStatusIcon(status: DelayRequestStatus) {
  switch (status) {
    case "pending":
      return <Clock className="w-4 h-4" />;
    case "approved":
      return <CheckCircle2 className="w-4 h-4" />;
    case "rejected":
      return <XCircle className="w-4 h-4" />;
  }
}

export default function DelayRequestsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<DelayRequestStatus | "all">("pending");
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<DelayRequest | null>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localStatuses, setLocalStatuses] = useState<Record<string, DelayRequestStatus>>({});

  if (!user) return null;

  const isPrivileged = user.role === "PM" || user.role === "Executive";

  // Role-based filtering: Members only see their own requests
  const visibleRequests = isPrivileged
    ? mockDelayRequests
    : mockDelayRequests.filter((r) => r.requesterId === user.id);

  const filteredRequests = visibleRequests.filter((r) => {
    const effectiveStatus = localStatuses[r.id] ?? r.status;
    return activeTab === "all" || effectiveStatus === activeTab;
  });

  const counts: Record<DelayRequestStatus | "all", number> = {
    all: visibleRequests.length,
    pending: visibleRequests.filter((r) => (localStatuses[r.id] ?? r.status) === "pending").length,
    approved: visibleRequests.filter((r) => (localStatuses[r.id] ?? r.status) === "approved").length,
    rejected: visibleRequests.filter((r) => (localStatuses[r.id] ?? r.status) === "rejected").length,
  };

  function getTaskName(taskId: string): string {
    return mockTasks.find((t) => t.id === taskId)?.title ?? "未知任務";
  }

  function getProjectName(projectId: string): string {
    return mockProjects.find((p) => p.id === projectId)?.name ?? "未知專案";
  }

  function getUserName(userId: string | null): string {
    if (!userId) return "—";
    return mockUsers.find((u) => u.id === userId)?.name ?? "未知用戶";
  }

  function openReviewDialog(request: DelayRequest, action: "approve" | "reject") {
    setSelectedRequest(request);
    setReviewAction(action);
    setReviewComment("");
    setReviewDialogOpen(true);
  }

  async function handleSubmitReview() {
    if (!selectedRequest || !reviewAction) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    const newStatus: DelayRequestStatus = reviewAction === "approve" ? "approved" : "rejected";
    setLocalStatuses((prev) => ({ ...prev, [selectedRequest.id]: newStatus }));
    setIsSubmitting(false);
    setReviewDialogOpen(false);
    if (reviewAction === "approve") {
      toast.success("延期申請已核准", {
        description: `「${getTaskName(selectedRequest.taskId)}」的延期申請已通過審核`,
      });
    } else {
      toast.error("延期申請已駁回", {
        description: `「${getTaskName(selectedRequest.taskId)}」的延期申請已被駁回`,
      });
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold font-heading text-ds-text">延期審核</h1>
        <p className="text-ds-text-muted mt-1">
          {isPrivileged ? "審核所有成員的任務延期申請" : "我的延期申請記錄"}
        </p>
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as DelayRequestStatus | "all")}>
        <TabsList className="bg-ds-surface border border-ds-border">
          {FILTER_TABS.map((tab) => (
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

      {/* Request Cards */}
      {filteredRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-ds-text-muted">
          <CheckCircle2 className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-lg font-medium">目前沒有延期申請</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((request) => {
            const effectiveStatus = localStatuses[request.id] ?? request.status;
            const taskName = getTaskName(request.taskId);
            const projectName = getProjectName(request.projectId);
            const requesterName = getUserName(request.requesterId);
            const reviewerName = getUserName(request.reviewerId);
            const isPending = effectiveStatus === "pending";

            return (
              <Card
                key={request.id}
                className="bg-ds-surface border-ds-border hover:shadow-md transition-all duration-150"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Request Info */}
                    <div className="flex-1 min-w-0 space-y-3">
                      {/* Title row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={getStatusBadge(effectiveStatus)}>
                          {getStatusIcon(effectiveStatus)}
                        </span>
                        <h3 className="font-semibold text-ds-text text-base leading-tight">
                          {taskName}
                        </h3>
                        <Badge
                          variant="outline"
                          className={`text-xs font-medium ${getStatusBadge(effectiveStatus)}`}
                        >
                          {delayRequestStatusLabels[effectiveStatus]}
                        </Badge>
                      </div>

                      {/* Meta info */}
                      <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-ds-text-muted">
                        <span className="flex items-center gap-1.5">
                          <FolderKanban className="w-3.5 h-3.5" />
                          {projectName}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          申請人：{requesterName}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          原截止：{request.originalDueDate}
                        </span>
                        <span className="flex items-center gap-1.5 text-ds-accent font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          申請延至：{request.requestedDueDate}
                        </span>
                      </div>

                      {/* Reason */}
                      <div className="p-3 bg-ds-background rounded-lg border border-ds-border">
                        <p className="text-xs font-medium text-ds-text-muted mb-1">申請原因</p>
                        <p className="text-sm text-ds-text">{request.reason}</p>
                      </div>

                      {/* Review result (approved/rejected) */}
                      {!isPending && (
                        <div
                          className={`p-3 rounded-lg border ${
                            effectiveStatus === "approved"
                              ? "bg-ds-success-light border-ds-success/30"
                              : "bg-ds-error-light border-ds-error/30"
                          }`}
                        >
                          <p className="text-xs font-medium text-ds-text-muted mb-1">
                            審核結果 — 審核人：{reviewerName}
                          </p>
                          <p
                            className={`text-sm font-medium ${
                              effectiveStatus === "approved" ? "text-ds-success" : "text-ds-error"
                            }`}
                          >
                            {request.reviewComment ?? "（無留言）"}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right: Actions (PM/Executive + pending only) */}
                    {isPrivileged && isPending && (
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          className="bg-ds-success hover:bg-ds-success/90 text-white cursor-pointer transition-all duration-150 min-w-[72px]"
                          onClick={() => openReviewDialog(request, "approve")}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          核准
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-ds-error text-ds-error hover:bg-ds-error-light cursor-pointer transition-all duration-150 min-w-[72px]"
                          onClick={() => openReviewDialog(request, "reject")}
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          駁回
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-md bg-ds-surface">
          <DialogHeader>
            <DialogTitle className="font-heading text-ds-text">
              {reviewAction === "approve" ? "核准延期申請" : "駁回延期申請"}
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 py-2">
              <div className="p-3 bg-ds-background rounded-lg border border-ds-border space-y-1">
                <p className="text-sm font-medium text-ds-text">{getTaskName(selectedRequest.taskId)}</p>
                <p className="text-xs text-ds-text-muted">
                  申請人：{getUserName(selectedRequest.requesterId)} ｜
                  延至：{selectedRequest.requestedDueDate}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reviewComment" className="text-ds-text text-sm font-medium">
                  審核留言（選填）
                </Label>
                <Textarea
                  id="reviewComment"
                  placeholder={
                    reviewAction === "approve"
                      ? "請輸入核准說明..."
                      : "請輸入駁回原因..."
                  }
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                  className="border-ds-border focus:border-ds-primary resize-none"
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setReviewDialogOpen(false)}
              className="cursor-pointer border-ds-border"
            >
              取消
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={isSubmitting}
              className={`text-white cursor-pointer transition-all duration-150 ${
                reviewAction === "approve"
                  ? "bg-ds-success hover:bg-ds-success/90"
                  : "bg-ds-error hover:bg-ds-error/90"
              }`}
            >
              {isSubmitting
                ? "處理中..."
                : reviewAction === "approve"
                ? "確認核准"
                : "確認駁回"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
