"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-ds-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-ds-primary" />
          <p className="text-ds-text-muted font-body">載入中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
