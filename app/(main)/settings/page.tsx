import { requireAuth } from "@/app/lib/auth-guard";
import { prisma } from "@/app/lib/db";
import { LogoutButton } from "@/app/components/logout-button";
import { CurrentBookSelect } from "@/app/components/current-book-select";

export default async function SettingsPage() {
  const user = await requireAuth();

  const books = await prisma.book.findMany({
    where: { userId: user.id },
    select: { id: true, title: true, author: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-lg font-semibold text-[#1a1a1a] mb-6">設定</h1>

      {/* User name */}
      <section className="mb-6">
        <p className="text-[11px] font-medium text-[#9ca3af] uppercase tracking-wider mb-2">ユーザー名</p>
        <p className="text-[15px] text-[#1a1a1a]">{user.name || "未設定"}</p>
      </section>

      <div className="h-px bg-[#e5e7eb] mb-6" />

      {/* Current book */}
      <section className="mb-6">
        <p className="text-[11px] font-medium text-[#9ca3af] uppercase tracking-wider mb-2">読書中の本</p>
        <p className="text-[12px] text-[#9ca3af] mb-3">
          設定すると、メモを記録するときにこの本がデフォルトで選択されます。
        </p>
        <CurrentBookSelect books={books} currentBookId={user.currentBookId} />
      </section>

      <div className="h-px bg-[#e5e7eb] mb-6" />

      {/* Logout */}
      <LogoutButton />
    </div>
  );
}
