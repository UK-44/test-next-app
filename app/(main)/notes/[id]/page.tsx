import { notFound } from "next/navigation";
import { requireAuth } from "@/app/lib/auth-guard";
import { prisma } from "@/app/lib/db";
import { NoteEditForm } from "@/app/components/note-edit-form";
import { BackButton } from "@/app/components/back-button";

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAuth();
  const { id } = await params;

  const note = await prisma.note.findFirst({
    where: { id, userId: user.id },
    include: {
      book: { select: { id: true, title: true } },
    },
  });

  if (!note) notFound();

  const books = await prisma.book.findMany({
    where: { userId: user.id },
    select: { id: true, title: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <BackButton />
      <h1 className="text-xl font-bold text-[#2c2416] mb-6">メモ編集</h1>
      {note.book && (
        <p className="text-sm text-[#8c7e6a] mb-4">
          {note.book.title}
        </p>
      )}
      <NoteEditForm
        note={{
          id: note.id,
          bookId: note.bookId,
          body: note.body,
          quoteText: note.quoteText,
          locationInfo: note.locationInfo,
          actionItems: note.actionItems,
          actionStatus: note.actionStatus,
          importance: note.importance,
        }}
        books={books}
      />
    </div>
  );
}
