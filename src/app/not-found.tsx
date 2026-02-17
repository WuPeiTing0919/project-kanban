import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-ds-background">
      <h1 className="text-6xl font-bold font-heading text-ds-text mb-4">404</h1>
      <p className="text-lg text-ds-text-muted mb-8">找不到此頁面</p>
      <Link
        href="/dashboard"
        className="inline-flex items-center px-4 py-2 bg-ds-primary text-white rounded-lg hover:bg-ds-primary-dark transition-all duration-150 cursor-pointer"
      >
        返回首頁
      </Link>
    </div>
  );
}
