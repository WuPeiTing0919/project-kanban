"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { mockUsers, type UserRole } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FolderKanban, LogIn, AlertCircle } from "lucide-react";

const roleOptions: { value: UserRole; label: string }[] = [
  { value: "PM", label: "專案經理 (PM)" },
  { value: "Member", label: "團隊成員" },
  { value: "Executive", label: "主管" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("pm@demo.com");
  const [password, setPassword] = useState("demo");
  const [role, setRole] = useState<UserRole>("PM");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 500));

    const success = login(email, password, role);
    if (success) {
      router.replace("/dashboard");
    } else {
      setError("登入失敗，請檢查 Email、密碼和角色是否正確");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#1E293B] via-[#1E3A5F] to-[#1E293B] p-4">
      <Card className="w-full max-w-md bg-ds-surface shadow-2xl border-0">
        <CardHeader className="text-center pb-2">
          {/* Logo */}
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-ds-primary shadow-lg">
            <FolderKanban className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold font-heading text-ds-text">
            ProjectHub
          </CardTitle>
          <CardDescription className="text-ds-text-muted">
            專案看板管理系統
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-ds-text">
                電子郵件
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="請輸入 Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-ds-text">
                密碼
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="請輸入密碼"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>

            {/* Role selection */}
            <div className="space-y-2">
              <Label className="text-ds-text">登入角色</Label>
              <RadioGroup
                value={role}
                onValueChange={(v: string) => setRole(v as UserRole)}
                className="flex gap-4"
              >
                {roleOptions.map((opt) => (
                  <div key={opt.value} className="flex items-center gap-2">
                    <RadioGroupItem value={opt.value} id={`role-${opt.value}`} />
                    <Label htmlFor={`role-${opt.value}`} className="text-sm text-ds-text cursor-pointer">
                      {opt.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-ds-error-light p-3 text-sm text-ds-error">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-11 bg-ds-primary hover:bg-ds-primary-dark text-white font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  登入中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  登入
                </span>
              )}
            </Button>
          </form>

          {/* Demo accounts hint */}
          <div className="mt-6 rounded-lg bg-ds-background p-4">
            <p className="mb-2 text-xs font-semibold text-ds-text-muted uppercase tracking-wider">
              示範帳號
            </p>
            <div className="space-y-1 text-xs text-ds-text-muted">
              {mockUsers.map((u) => (
                <div key={u.id} className="flex justify-between">
                  <span>{u.email}</span>
                  <span className="text-ds-text-light">
                    {u.role === "PM" ? "專案經理" : u.role === "Executive" ? "主管" : "成員"} / 密碼: demo
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
