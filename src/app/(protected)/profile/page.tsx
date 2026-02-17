"use client";

import { useAuth } from "@/lib/auth";
import { mockProjects } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Building2,
  Shield,
  FolderKanban,
  Calendar,
} from "lucide-react";

function getRoleBadgeClass(role: string) {
  switch (role) {
    case "PM":
      return "bg-blue-50 text-ds-primary border-ds-primary/30";
    case "Executive":
      return "bg-purple-50 text-ds-secondary border-ds-secondary/30";
    case "Member":
      return "bg-ds-success-light text-ds-success border-ds-success/30";
    default:
      return "bg-gray-100 text-gray-600 border-gray-300";
  }
}

function getRoleLabel(role: string) {
  switch (role) {
    case "PM":
      return "專案經理";
    case "Executive":
      return "主管";
    case "Member":
      return "成員";
    default:
      return role;
  }
}

function getProjectStatusBadgeClass(status: string) {
  switch (status) {
    case "planning":
      return "bg-blue-50 text-ds-primary border-ds-primary/30";
    case "in_progress":
      return "bg-ds-success-light text-ds-success border-ds-success/30";
    case "on_hold":
      return "bg-ds-warning-light text-ds-warning border-ds-warning/30";
    case "completed":
      return "bg-gray-100 text-gray-600 border-gray-300";
    case "cancelled":
      return "bg-ds-error-light text-ds-error border-ds-error/30";
    default:
      return "bg-gray-100 text-gray-600 border-gray-300";
  }
}

function getProjectStatusLabel(status: string) {
  const map: Record<string, string> = {
    planning: "規劃中",
    in_progress: "進行中",
    on_hold: "暫停",
    completed: "已完成",
    cancelled: "已取消",
  };
  return map[status] ?? status;
}

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  const ownedProjects = mockProjects.filter((p) => p.ownerId === user.id);

  // Get initials from name
  const initials = user.name
    .split("")
    .slice(-2)
    .join("");

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold font-heading text-ds-text">個人資料</h1>
        <p className="text-ds-text-muted mt-1">查看您的帳號資訊與專案參與狀況</p>
      </div>

      {/* Profile Card */}
      <Card className="bg-ds-surface border-ds-border">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-ds-primary flex items-center justify-center shadow-md">
                <span className="text-white text-2xl font-bold font-heading">{initials}</span>
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold font-heading text-ds-text">{user.name}</h2>
                <Badge
                  variant="outline"
                  className={`font-medium ${getRoleBadgeClass(user.role)}`}
                >
                  <Shield className="w-3 h-3 mr-1" />
                  {getRoleLabel(user.role)}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2.5 text-sm text-ds-text">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-ds-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-ds-text-muted">電子郵件</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-sm text-ds-text">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-ds-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-ds-text-muted">部門</p>
                    <p className="font-medium">{user.department}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-sm text-ds-text">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <User className="w-4 h-4 text-ds-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-ds-text-muted">使用者 ID</p>
                    <p className="font-medium font-mono text-xs text-ds-text-muted">{user.id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-sm text-ds-text">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <FolderKanban className="w-4 h-4 text-ds-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-ds-text-muted">負責專案數</p>
                    <p className="font-medium">{ownedProjects.length} 個</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Owned Projects */}
      <Card className="bg-ds-surface border-ds-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-ds-text flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-ds-primary" />
            參與專案
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-4">
          {ownedProjects.length === 0 ? (
            <div className="px-5 py-8 text-center text-ds-text-muted text-sm">
              尚未負責任何專案
            </div>
          ) : (
            <div className="divide-y divide-ds-border">
              {ownedProjects.map((project) => (
                <div
                  key={project.id}
                  className="px-5 py-3.5 hover:bg-ds-surface-hover transition-all duration-150"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-ds-text">{project.name}</p>
                        <span className="text-xs text-ds-text-light font-mono bg-ds-background px-1.5 py-0.5 rounded border border-ds-border">
                          {project.code}
                        </span>
                      </div>
                      <p className="text-xs text-ds-text-muted mt-0.5 line-clamp-1">
                        {project.description}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-ds-text-muted">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {project.startDate} ～ {project.endDate}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs flex-shrink-0 ${getProjectStatusBadgeClass(project.status)}`}
                    >
                      {getProjectStatusLabel(project.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
