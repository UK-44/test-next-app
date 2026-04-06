import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/app/lib/auth-guard";
import { prisma } from "@/app/lib/db";
import { BookEditForm } from "@/app/components/book-edit-form";

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAuth();
  const { id } = await params;

  const book = await prisma.book.findFirst({
    where: { id, userId: user.id },
  });

  if (!book) notFound();

  return (
    <div>
      <div className="max-w-lg mx-auto mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#2c2416]">本を編集</h1>
        <Link
          href={`/books/${book.id}`}
          className="text-sm text-[#8c7e6a] hover:text-[#2c2416]"
        >
          キャンセル
        </Link>
      </div>
      <BookEditForm
        book={{
          id: book.id,
          title: book.title,
          author: book.author,
          coverImageUrl: book.coverImageUrl,
          identifier: book.identifier,
          format: book.format,
          publisher: book.publisher,
          publishedAt: book.publishedAt,
          description: book.description,
          status: book.status,
          rating: book.rating,
          shortReview: book.shortReview,
        }}
      />
    </div>
  );
}
