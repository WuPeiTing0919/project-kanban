"use client";

import { useState } from "react";
import { mockDrafts, mockProjects } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  FileText,
  FolderKanban,
  Clock,
  Pencil,
  Trash2,
  FilePlus,
} from "lucide-react";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hour = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${year}/${month}/${day} ${hour}:${min}`;
}

export default function DraftsPage() {
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const visibleDrafts = mockDrafts.filter((d) => !deletedIds.has(d.id));

  function getProjectName(projectId: string | null): string | null {
    if (!projectId) return null;
    return mockProjects.find((p) => p.id === projectId)?.name ?? null;
  }

  function handleEdit(draftTitle: string) {
    toast.info("草稿編輯功能尚未啟用（Demo）", {
      description: `「${draftTitle}」草稿編輯功能將在正式版本中開放`,
    });
  }

  function handleDelete(draftId: string, draftTitle: string) {
    setDeletedIds((prev) => new Set(prev).add(draftId));
    toast.success("草稿已刪除", {
      description: `「${draftTitle}」已從草稿列表中移除`,
    });
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-ds-text">草稿</h1>
          <p className="text-ds-text-muted mt-1">
            {visibleDrafts.length > 0
              ? `共 ${visibleDrafts.length} 份草稿`
              : "目前沒有草稿"}
          </p>
        </div>
      </div>

      {/* Draft Cards */}
      {visibleDrafts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-ds-text-muted">
          <FilePlus className="w-14 h-14 mb-4 opacity-25" />
          <p className="text-lg font-medium text-ds-text-muted">沒有草稿</p>
          <p className="text-sm mt-1 text-ds-text-light">草稿將在您建立專案報告或規劃文件時自動儲存</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleDrafts.map((draft) => {
            const projectName = getProjectName(draft.projectId);
            const contentPreview =
              draft.content.length > 100
                ? draft.content.slice(0, 100) + "..."
                : draft.content;

            return (
              <Card
                key={draft.id}
                className="bg-ds-surface border-ds-border hover:border-ds-primary/30 hover:shadow-md transition-all duration-150"
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 border border-ds-primary/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-ds-primary" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-ds-text leading-tight">{draft.title}</h3>
                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-ds-text-muted">
                            {projectName && (
                              <span className="flex items-center gap-1">
                                <FolderKanban className="w-3 h-3" />
                                {projectName}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              上次編輯：{formatDate(draft.updatedAt)}
                            </span>
                            {!projectName && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-ds-background text-ds-text-muted border-ds-border"
                              >
                                未關聯專案
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs border-ds-border text-ds-primary hover:bg-blue-50 cursor-pointer transition-all duration-150"
                            onClick={() => handleEdit(draft.title)}
                          >
                            <Pencil className="w-3.5 h-3.5 mr-1" />
                            繼續編輯
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs border-ds-error/30 text-ds-error hover:bg-ds-error-light cursor-pointer transition-all duration-150"
                            onClick={() => handleDelete(draft.id, draft.title)}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            刪除草稿
                          </Button>
                        </div>
                      </div>

                      {/* Content Preview */}
                      <Separator className="my-3 bg-ds-border" />
                      <p className="text-sm text-ds-text-muted leading-relaxed whitespace-pre-line line-clamp-2">
                        {contentPreview}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
