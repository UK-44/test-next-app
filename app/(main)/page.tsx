import { requireAuth } from "@/app/lib/auth-guard";
import { prisma } from "@/app/lib/db";
import { MainTabs } from "@/app/components/main-tabs";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    status?: string;
    bookId?: string;
    importance?: string;
    sort?: string;
    bookSort?: string;
    q?: string;
  }>;
}) {
  const user = await requireAuth();
  const { tab, status, bookId, importance, sort, bookSort, q } = await searchParams;
  const searchQuery = q?.trim() ?? "";

  const activeTab = tab === "books" ? "books" : tab === "action" ? "action" : "memo";

  const importanceFilter = importance ? parseInt(importance, 10) : undefined;
  const sortBy = sort === "importance" ? "importance" : "newest";

  // Only fetch data needed for the active tab
  const notesPromise =
    activeTab === "memo"
      ? prisma.note.findMany({
          where: {
            userId: user.id,
            ...(bookId ? { bookId } : {}),
            ...(importanceFilter ? { importance: importanceFilter } : {}),
            ...(searchQuery
              ? {
                  OR: [
                    { body: { contains: searchQuery, mode: "insensitive" as const } },
                    { quoteText: { contains: searchQuery, mode: "insensitive" as const } },
                    { book: { title: { contains: searchQuery, mode: "insensitive" as const } } },
                  ],
                }
              : {}),
          },
          orderBy:
            sortBy === "importance"
              ? [{ importance: "desc" }, { createdAt: "desc" }]
              : { createdAt: "desc" },
          take: 50,
          include: {
            book: { select: { id: true, title: true, author: true } },
          },
        })
      : Promise.resolve([]);

  const booksPromise =
    activeTab === "books"
      ? prisma.book.findMany({
          where: {
            userId: user.id,
            ...(status && ["WANT_TO_READ", "READING", "FINISHED"].includes(status)
              ? { status: status as "WANT_TO_READ" | "READING" | "FINISHED" }
              : {}),
            ...(searchQuery
              ? {
                  OR: [
                    { title: { contains: searchQuery, mode: "insensitive" as const } },
                    { author: { contains: searchQuery, mode: "insensitive" as const } },
                  ],
                }
              : {}),
          },
          orderBy:
            bookSort === "memos"
              ? { notes: { _count: "desc" } }
              : bookSort === "added"
                ? { createdAt: "desc" }
                : { updatedAt: "desc" },
          include: {
            _count: { select: { notes: true } },
          },
        })
      : Promise.resolve([]);

  const actionNotesPromise =
    activeTab === "action"
      ? prisma.note.findMany({
          where: {
            userId: user.id,
            actionItems: { not: "" },
          },
          orderBy: { createdAt: "desc" },
          include: {
            book: { select: { id: true, title: true, author: true } },
          },
        })
      : Promise.resolve([]);

  const allBooksPromise =
    activeTab === "memo"
      ? prisma.book.findMany({
          where: { userId: user.id },
          orderBy: { title: "asc" },
          select: { id: true, title: true },
        })
      : Promise.resolve([]);

  const [notes, books, actionNotes, allBooks] = await Promise.all([
    notesPromise,
    booksPromise,
    actionNotesPromise,
    allBooksPromise,
  ]);

  return (
    <MainTabs
      activeTab={activeTab}
      notes={notes.map((n) => ({
        id: n.id,
        body: n.body,
        quoteText: n.quoteText,
        locationInfo: n.locationInfo,
        actionItems: n.actionItems,
        actionStatus: n.actionStatus,
        importance: n.importance,
        createdAt: n.createdAt.toISOString(),
        book: n.book,
      }))}
      actionItems={actionNotes
        .filter((n: typeof actionNotes[number]) => n.actionItems)
        .map((n: typeof actionNotes[number]) => ({
          id: n.id,
          body: n.body,
          quoteText: n.quoteText,
          locationInfo: n.locationInfo,
          actionItems: n.actionItems,
          actionStatus: n.actionStatus,
          importance: n.importance,
          createdAt: n.createdAt.toISOString(),
          book: n.book,
        }))}
      books={books.map((b) => ({
        id: b.id,
        title: b.title,
        author: b.author,
        coverImageUrl: b.coverImageUrl,
        status: b.status,
        noteCount: b._count.notes,
      }))}
      allBooks={allBooks}
      currentStatus={status ?? ""}
      currentBookId={bookId ?? ""}
      currentImportance={importance ?? ""}
      currentSort={sort ?? ""}
      currentBookSort={bookSort ?? ""}
      currentQuery={searchQuery}
    />
  );
}
