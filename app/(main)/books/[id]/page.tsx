import { notFound } from "next/navigation";
import { requireAuth } from "@/app/lib/auth-guard";
import { prisma } from "@/app/lib/db";
import { BookDetailContent } from "@/app/components/book-detail-content";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAuth();
  const { id } = await params;

  const found = await prisma.book.findFirst({
    where: { id, userId: user.id },
    include: {
      notes: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!found) notFound();
  const book = found;

  return (
    <BookDetailContent
      book={{
        id: book.id,
        title: book.title,
        author: book.author,
        coverImageUrl: book.coverImageUrl,
        status: book.status,
        rating: book.rating,
        format: book.format,
        publisher: book.publisher,
        description: book.description,
      }}
      notes={book.notes.map((n: typeof book.notes[number]) => ({
        id: n.id,
        body: n.body,
        quoteText: n.quoteText,
        locationInfo: n.locationInfo,
        actionItems: n.actionItems,
        actionStatus: n.actionStatus,
        importance: n.importance,
        createdAt: n.createdAt.toISOString(),
        book: null,
      }))}
    />
  );
}
