import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "ProjectHub - 專案看板系統",
  description: "企業級專案管理看板系統",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
