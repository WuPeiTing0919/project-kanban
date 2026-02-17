"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Bell,
  Calendar,
  ClipboardList,
  CheckCircle2,
  Settings,
  Save,
} from "lucide-react";

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  defaultOn: boolean;
}

const NOTIFICATION_SETTINGS: NotificationSetting[] = [
  {
    id: "delay_request",
    label: "延期申請通知",
    description: "當有成員提交延期申請時，發送通知給審核人員",
    icon: <Bell className="w-4 h-4 text-ds-warning" />,
    defaultOn: true,
  },
  {
    id: "milestone_reminder",
    label: "里程碑到期提醒",
    description: "里程碑截止日期前 3 天發送提醒通知",
    icon: <Calendar className="w-4 h-4 text-ds-primary" />,
    defaultOn: true,
  },
  {
    id: "task_assignment",
    label: "任務指派通知",
    description: "當任務被指派給您時，立即發送通知",
    icon: <ClipboardList className="w-4 h-4 text-ds-secondary" />,
    defaultOn: true,
  },
  {
    id: "delay_review_result",
    label: "延期審核結果",
    description: "延期申請審核完成後，通知申請人結果",
    icon: <CheckCircle2 className="w-4 h-4 text-ds-success" />,
    defaultOn: true,
  },
];

export default function SettingsPage() {
  const [switches, setSwitches] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFICATION_SETTINGS.map((s) => [s.id, s.defaultOn]))
  );
  const [isSaving, setIsSaving] = useState(false);

  function handleToggle(id: string, value: boolean) {
    setSwitches((prev) => ({ ...prev, [id]: value }));
  }

  async function handleSave() {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsSaving(false);
    toast.success("設定已儲存", {
      description: "通知偏好設定已成功更新",
    });
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold font-heading text-ds-text">系統設定</h1>
        <p className="text-ds-text-muted mt-1">管理您的個人通知偏好設定</p>
      </div>

      {/* Notification Preferences */}
      <Card className="bg-ds-surface border-ds-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold text-ds-text flex items-center gap-2">
            <Bell className="w-4 h-4 text-ds-primary" />
            通知偏好
          </CardTitle>
          <CardDescription className="text-ds-text-muted text-sm">
            選擇您希望接收哪些類型的系統通知
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {NOTIFICATION_SETTINGS.map((setting, index) => (
            <div key={setting.id}>
              <div className="flex items-start justify-between gap-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-ds-background border border-ds-border flex items-center justify-center flex-shrink-0 mt-0.5">
                    {setting.icon}
                  </div>
                  <div>
                    <Label
                      htmlFor={setting.id}
                      className="text-sm font-medium text-ds-text cursor-pointer"
                    >
                      {setting.label}
                    </Label>
                    <p className="text-xs text-ds-text-muted mt-0.5 leading-relaxed">
                      {setting.description}
                    </p>
                  </div>
                </div>
                <Switch
                  id={setting.id}
                  checked={switches[setting.id]}
                  onCheckedChange={(v: boolean) => handleToggle(setting.id, v)}
                  className="cursor-pointer flex-shrink-0 mt-0.5 data-[state=checked]:bg-ds-primary"
                />
              </div>
              {index < NOTIFICATION_SETTINGS.length - 1 && (
                <Separator className="bg-ds-border" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Active Summary */}
      <Card className="bg-ds-background border-ds-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-ds-text-muted">
            <Settings className="w-4 h-4" />
            <span>
              目前已啟用{" "}
              <span className="font-semibold text-ds-primary">
                {Object.values(switches).filter(Boolean).length}
              </span>{" "}
              / {NOTIFICATION_SETTINGS.length} 項通知
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-ds-primary hover:bg-ds-primary-dark text-white cursor-pointer transition-all duration-150 min-w-[100px]"
        >
          {isSaving ? (
            <>
              <Save className="w-4 h-4 mr-2 animate-spin" />
              儲存中...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              儲存設定
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
