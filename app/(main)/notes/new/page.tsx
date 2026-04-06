import Link from "next/link";
import { requireAuth } from "@/app/lib/auth-guard";
import { prisma } from "@/app/lib/db";
import { NoteForm } from "@/app/components/note-form";
import { BackButton } from "@/app/components/back-button";

export default async function NewNotePage({
  searchParams,
}: {
  searchParams: Promise<{ bookId?: string }>;
}) {
  const user = await requireAuth();
  const { bookId } = await searchParams;

  const books = await prisma.book.findMany({
    where: { userId: user.id },
    select: { id: true, title: true },
    orderBy: { updatedAt: "desc" },
  });

  const defaultBookId = bookId ?? user.currentBookId ?? undefined;

  return (
    <div>
      <BackButton />
      <h1 className="text-xl font-bold text-[#2c2416] mb-6">メモを記録</h1>
      <NoteForm books={books} defaultBookId={defaultBookId} />
    </div>
  );
}
