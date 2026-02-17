"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  getProjectById,
  mockUsers,
  projectStatusLabels,
  type ProjectStatus,
  type ProjectType,
  type ProjectLevel,
  type HealthStatus,
} from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";

const projectTypeLabels: Record<ProjectType, string> = {
  internal: "內部專案",
  external: "外部專案",
  research: "研究專案",
};

const projectLevelLabels: Record<ProjectLevel, string> = {
  high: "高",
  medium: "中",
  low: "低",
};

const healthLabels: Record<HealthStatus, string> = {
  green: "正常",
  yellow: "警告",
  red: "異常",
};

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const project = getProjectById(id);

  const [name, setName] = useState(project?.name ?? "");
  const [code, setCode] = useState(project?.code ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [type, setType] = useState<ProjectType>(project?.type ?? "internal");
  const [level, setLevel] = useState<ProjectLevel>(project?.level ?? "medium");
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? "planning");
  const [healthStatus, setHealthStatus] = useState<HealthStatus>(project?.healthStatus ?? "green");
  const [startDate, setStartDate] = useState(project?.startDate ?? "");
  const [endDate, setEndDate] = useState(project?.endDate ?? "");
  const [budget, setBudget] = useState(String(project?.budget ?? 0));
  const [budgetUsed, setBudgetUsed] = useState(String(project?.budgetUsed ?? 0));
  const [ownerId, setOwnerId] = useState(project?.ownerId ?? "u1");
  const [smartS, setSmartS] = useState(project?.smartGoals.S ?? "");
  const [smartM, setSmartM] = useState(project?.smartGoals.M ?? "");
  const [smartA, setSmartA] = useState(project?.smartGoals.A ?? "");
  const [smartR, setSmartR] = useState(project?.smartGoals.R ?? "");
  const [smartT, setSmartT] = useState(project?.smartGoals.T ?? "");
  const [isSaving, setIsSaving] = useState(false);

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

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("請填寫專案名稱");
      return;
    }
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsSaving(false);
    toast.success("專案已更新", {
      description: `「${name}」的資訊已成功儲存`,
    });
    router.push(`/projects/${id}`);
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold font-heading text-ds-text">編輯專案</h1>
          <p className="text-sm text-ds-text-muted mt-1">
            {project.code} — {project.name}
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Info */}
        <Card className="border-ds-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-heading text-ds-text">基本資訊</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-ds-text">專案名稱</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="請輸入專案名稱"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code" className="text-ds-text">專案代碼</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="例：EC-2026"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-ds-text">專案說明</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="請輸入專案說明..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-ds-text">專案類型</Label>
                <Select value={type} onValueChange={(v: string) => setType(v as ProjectType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(projectTypeLabels) as [ProjectType, string][]).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-ds-text">優先等級</Label>
                <Select value={level} onValueChange={(v: string) => setLevel(v as ProjectLevel)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(projectLevelLabels) as [ProjectLevel, string][]).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-ds-text">負責人</Label>
                <Select value={ownerId} onValueChange={setOwnerId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockUsers.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}（{u.department}）
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status & Schedule */}
        <Card className="border-ds-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-heading text-ds-text">狀態與時程</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-ds-text">專案狀態</Label>
                <Select value={status} onValueChange={(v: string) => setStatus(v as ProjectStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(projectStatusLabels) as [ProjectStatus, string][]).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-ds-text">健康狀態</Label>
                <Select value={healthStatus} onValueChange={(v: string) => setHealthStatus(v as HealthStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(healthLabels) as [HealthStatus, string][]).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-ds-text">開始日期</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-ds-text">結束日期</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <Separator className="bg-ds-border" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="budget" className="text-ds-text">總預算 (NT$)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budgetUsed" className="text-ds-text">已使用預算 (NT$)</Label>
                <Input
                  id="budgetUsed"
                  type="number"
                  value={budgetUsed}
                  onChange={(e) => setBudgetUsed(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SMART Goals */}
        <Card className="border-ds-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-heading text-ds-text">SMART 目標</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "S", label: "Specific（明確性）", value: smartS, setter: setSmartS },
              { key: "M", label: "Measurable（可衡量）", value: smartM, setter: setSmartM },
              { key: "A", label: "Achievable（可達成）", value: smartA, setter: setSmartA },
              { key: "R", label: "Relevant（相關性）", value: smartR, setter: setSmartR },
              { key: "T", label: "Time-bound（時限性）", value: smartT, setter: setSmartT },
            ].map((item) => (
              <div key={item.key} className="space-y-2">
                <Label className="text-ds-text">
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-ds-primary text-white text-xs font-bold mr-2">
                    {item.key}
                  </span>
                  {item.label}
                </Label>
                <Textarea
                  value={item.value}
                  onChange={(e) => item.setter(e.target.value)}
                  placeholder={`請輸入 ${item.label}...`}
                  rows={2}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="border-ds-border"
          >
            取消
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-ds-primary hover:bg-ds-primary-dark text-white min-w-[100px]"
          >
            {isSaving ? (
              <>
                <Save className="mr-2 h-4 w-4 animate-spin" />
                儲存中...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                儲存變更
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
