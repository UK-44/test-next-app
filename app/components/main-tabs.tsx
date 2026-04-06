"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteNote } from "@/app/actions/notes";
import { NoteList, type NoteCardItem } from "@/app/components/note-card";

type ActionItem = {
  noteId: string;
  body: string;
  quoteText: string | null;
  actionItems: string;
  bookTitle: string | null;
  createdAt: string;
};

type BookItem = {
  id: string;
  title: string;
  author: string;
  coverImageUrl: string | null;
  status: string;
  noteCount: number;
};

type BookOption = { id: string; title: string };

const statuses = [
  { value: "", label: "すべて" },
  { value: "WANT_TO_READ", label: "読みたい" },
  { value: "READING", label: "読書中" },
  { value: "FINISHED", label: "読了" },
];

const statusLabels: Record<string, string> = {
  WANT_TO_READ: "読みたい",
  READING: "読書中",
  FINISHED: "読了",
};

export function MainTabs({
  activeTab,
  notes,
  actionItems,
  books,
  allBooks,
  currentStatus,
  currentBookId,
  currentImportance,
  currentSort,
  currentBookSort,
  currentQuery,
}: {
  activeTab: "memo" | "action" | "books";
  notes: NoteCardItem[];
  actionItems: ActionItem[];
  books: BookItem[];
  allBooks: BookOption[];
  currentStatus: string;
  currentBookId: string;
  currentImportance: string;
  currentSort: string;
  currentBookSort: string;
  currentQuery: string;
}) {
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const hasActiveFilters =
    !!currentQuery ||
    (activeTab === "memo" && (!!currentBookId || !!currentImportance || currentSort === "importance")) ||
    (activeTab === "books" && (!!currentStatus || !!currentBookSort));

  function applyFilters(params: {
    q?: string;
    bookId?: string;
    importance?: string;
    sort?: string;
    status?: string;
    bookSort?: string;
  }) {
    const sp = new URLSearchParams();
    sp.set("tab", activeTab);
    if (params.q) sp.set("q", params.q);
    if (activeTab === "memo") {
      if (params.bookId) sp.set("bookId", params.bookId);
      if (params.importance) sp.set("importance", params.importance);
      if (params.sort) sp.set("sort", params.sort);
    } else if (activeTab === "books") {
      if (params.status) sp.set("status", params.status);
      if (params.bookSort) sp.set("bookSort", params.bookSort);
    }
    router.push(`/?${sp.toString()}`);
  }

  return (
    <div>
      {activeTab === "memo" && (
        <NoteList notes={notes} showCount onDetailOpen={setIsDetailOpen} />
      )}
      {activeTab === "action" && (
        <ActionList items={actionItems} />
      )}
      {activeTab === "books" && (
        <BookList books={books} />
      )}

      {/* Search FAB + Add FAB — hidden during detail view */}
      <div className={`fixed bottom-20 right-5 z-40 flex flex-col items-center gap-2 transition-opacity duration-200 ${isDetailOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
        {(activeTab === "memo" || activeTab === "books") && (
          <button
            onClick={() => setShowSearch(true)}
            className="relative w-10 h-10 bg-white text-[#1a1a1a] rounded-full flex items-center justify-center shadow-lg hover:bg-[#f3f4f6] transition-colors border border-[#e5e7eb]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            {hasActiveFilters && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#d4a017] rounded-full" />
            )}
          </button>
        )}
        {activeTab === "memo" && (
          <Link
            href="/notes/new"
            className="w-12 h-12 bg-[#d4a017] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#b8890f] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </Link>
        )}
        {activeTab === "books" && (
          <Link
            href="/books/new"
            className="w-12 h-12 bg-[#d4a017] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#b8890f] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </Link>
        )}
      </div>

      {/* Search/Filter dialog */}
      {showSearch && (
        <SearchFilterDialog
          activeTab={activeTab}
          allBooks={allBooks}
          currentQuery={currentQuery}
          currentBookId={currentBookId}
          currentImportance={currentImportance}
          currentSort={currentSort}
          currentStatus={currentStatus}
          currentBookSort={currentBookSort}
          onApply={(params) => {
            setShowSearch(false);
            applyFilters(params);
          }}
          onClose={() => setShowSearch(false)}
        />
      )}
    </div>
  );
}

function SearchFilterDialog({
  activeTab,
  allBooks,
  currentQuery,
  currentBookId,
  currentImportance,
  currentSort,
  currentStatus,
  currentBookSort,
  onApply,
  onClose,
}: {
  activeTab: "memo" | "action" | "books";
  allBooks: BookOption[];
  currentQuery: string;
  currentBookId: string;
  currentImportance: string;
  currentSort: string;
  currentStatus: string;
  currentBookSort: string;
  onApply: (params: {
    q?: string;
    bookId?: string;
    importance?: string;
    sort?: string;
    status?: string;
    bookSort?: string;
  }) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState(currentQuery);
  const [selectedBookId, setSelectedBookId] = useState(currentBookId);
  const [selectedImportance, setSelectedImportance] = useState(currentImportance);
  const [selectedSort, setSelectedSort] = useState(currentSort || "newest");
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [selectedBookSort, setSelectedBookSort] = useState(currentBookSort);

  function handleApply() {
    if (activeTab === "memo") {
      onApply({
        q: query,
        bookId: selectedBookId,
        importance: selectedImportance,
        sort: selectedSort,
      });
    } else {
      onApply({
        q: query,
        status: selectedStatus,
        bookSort: selectedBookSort,
      });
    }
  }

  function handleReset() {
    setQuery("");
    setSelectedBookId("");
    setSelectedImportance("");
    setSelectedSort("newest");
    setSelectedStatus("");
    setSelectedBookSort("");
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div className="fixed inset-x-4 bottom-24 z-50 bg-white rounded-2xl shadow-xl max-w-md mx-auto overflow-hidden border border-[#e5e7eb]">
        <div className="p-5 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#1a1a1a]">
              {activeTab === "memo" ? "メモを検索" : "本を検索"}
            </h2>
            <button onClick={onClose} className="text-[#9ca3af] hover:text-[#6b7280] p-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Text search */}
          <div className="flex items-center gap-2 bg-[#f3f4f6] rounded-xl px-3 py-2.5">
            <svg className="w-4 h-4 text-[#9ca3af] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleApply(); }}
              placeholder={activeTab === "memo" ? "メモ・引用・本名で検索" : "タイトル・著者で検索"}
              className="flex-1 bg-transparent text-sm text-[#1a1a1a] placeholder-[#9ca3af] outline-none"
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-[#9ca3af]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Memo filters */}
          {activeTab === "memo" && (
            <div className="space-y-4">
              {/* Book filter */}
              <div>
                <p className="text-xs text-[#6b7280] mb-1.5 font-medium">本</p>
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f3f4f6] border border-[#e5e7eb] rounded-xl text-sm text-[#1a1a1a] outline-none focus:border-[#9ca3af]"
                >
                  <option value="">すべての本</option>
                  {allBooks.map((book) => (
                    <option key={book.id} value={book.id}>{book.title}</option>
                  ))}
                </select>
              </div>

              {/* Importance filter */}
              <div>
                <p className="text-xs text-[#6b7280] mb-1.5 font-medium">重要度</p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setSelectedImportance("")}
                    className={`px-3 py-1.5 text-xs rounded-full transition-colors ${!selectedImportance
                      ? "bg-[#1a1a1a] text-white"
                      : "text-[#6b7280] bg-[#f3f4f6] hover:bg-[#e5e7eb]"
                      }`}
                  >
                    全て
                  </button>
                  {[1, 2, 3].map((star) => (
                    <button
                      key={star}
                      onClick={() => setSelectedImportance(String(star))}
                      className={`px-3 py-1.5 text-xs rounded-full transition-colors ${selectedImportance === String(star)
                        ? "bg-[#1a1a1a] text-white"
                        : "text-[#6b7280] bg-[#f3f4f6] hover:bg-[#e5e7eb]"
                        }`}
                    >
                      {"★".repeat(star)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <p className="text-xs text-[#6b7280] mb-1.5 font-medium">並び順</p>
                <div className="inline-flex rounded-xl bg-[#f3f4f6] p-0.5 overflow-hidden">
                  {[
                    { value: "newest", label: "最新順" },
                    { value: "importance", label: "重要度順" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedSort(opt.value)}
                      className={`px-4 py-1.5 text-xs rounded-xl transition-colors ${selectedSort === opt.value
                        ? "bg-white text-[#1a1a1a] shadow-sm"
                        : "text-[#6b7280] hover:text-[#1a1a1a]"
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Book filters */}
          {activeTab === "books" && (
            <div className="space-y-4">
              {/* Status filter */}
              <div>
                <p className="text-xs text-[#6b7280] mb-1.5 font-medium">ステータス</p>
                <div className="flex gap-1.5 flex-wrap">
                  {statuses.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setSelectedStatus(s.value)}
                      className={`px-3 py-1.5 text-xs rounded-full transition-colors ${selectedStatus === s.value
                        ? "bg-[#1a1a1a] text-white"
                        : "text-[#6b7280] bg-[#f3f4f6] hover:bg-[#e5e7eb]"
                        }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <p className="text-xs text-[#6b7280] mb-1.5 font-medium">並び順</p>
                <div className="inline-flex rounded-xl bg-[#f3f4f6] p-0.5 overflow-hidden">
                  {[
                    { value: "", label: "更新順" },
                    { value: "memos", label: "メモ数順" },
                    { value: "added", label: "追加日順" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedBookSort(opt.value)}
                      className={`px-4 py-1.5 text-xs rounded-xl transition-colors ${selectedBookSort === opt.value
                        ? "bg-white text-[#1a1a1a] shadow-sm"
                        : "text-[#6b7280] hover:text-[#1a1a1a]"
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-2.5 text-sm text-[#6b7280] bg-[#f3f4f6] rounded-xl hover:bg-[#e5e7eb] transition-colors"
            >
              リセット
            </button>
            <button
              onClick={handleApply}
              className="flex-1 py-2.5 text-sm text-white bg-[#1a1a1a] rounded-xl hover:bg-[#374151] transition-colors"
            >
              適用
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function ActionDetailModal({
  item,
  onClose,
}: {
  item: ActionItem;
  onClose: () => void;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("このメモごと削除されます。よろしいですか？")) return;
    setDeleting(true);
    await deleteNote(item.noteId);
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-x-4 top-[8%] max-h-[80vh] z-50 bg-white rounded-2xl shadow-2xl overflow-y-auto max-w-lg mx-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/30 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-5">
          {/* Header */}
          <div className="flex items-center gap-2 mb-5 pt-1">
            {item.bookTitle && (
              <span className="px-3 py-1 bg-[#f3f4f6] rounded-full text-xs text-[#6b7280]">{item.bookTitle}</span>
            )}
            <span className="text-xs text-[#9ca3af]">
              {new Date(item.createdAt).toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, ".")}
            </span>
          </div>

          {/* Flow: Quote -> Memo -> Action */}
          <div className="relative pl-4 border-l-2 border-[#e5e7eb] space-y-0">
            {/* Quote */}
            {item.quoteText && (
              <>
                <div className="pb-6">
                  <div className="absolute left-[-5px] w-2 h-2 bg-[#e5e7eb] rounded-full" />
                  <p className="text-[10px] text-[#9ca3af] mb-1 uppercase tracking-wider">引用</p>
                  <p className="text-sm text-[#6b7280] italic leading-relaxed">
                    {item.quoteText}
                  </p>
                </div>
              </>
            )}

            {/* Memo */}
            <div className="pb-6">
              <div className="absolute left-[-5px] w-2 h-2 bg-[#e5e7eb] rounded-full" style={{ marginTop: "0px" }} />
              <p className="text-[10px] text-[#9ca3af] mb-1 uppercase tracking-wider">メモ</p>
              <p className="text-sm text-[#1a1a1a] leading-relaxed whitespace-pre-wrap">
                {item.body}
              </p>
            </div>

            {/* Action */}
            <div className="bg-[#fefce8] rounded-xl p-4">
              <div className="absolute left-[-5px] w-2 h-2 bg-[#d4a017] rounded-full" style={{ marginTop: "0px" }} />
              <p className="text-[10px] text-[#d4a017] mb-1 uppercase tracking-wider font-medium">アクション</p>
              <p className="text-sm text-[#1a1a1a] leading-relaxed">
                {item.actionItems}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-5">
            <button
              onClick={() => router.push(`/notes/${item.noteId}`)}
              className="flex-1 py-2.5 text-sm text-white bg-[#1a1a1a] rounded-xl hover:bg-[#374151] transition-colors"
            >
              編集
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="py-2.5 px-4 text-sm text-[#6b7280] bg-[#f3f4f6] rounded-xl hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {deleting ? "削除中..." : "削除"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function ActionList({ items }: { items: ActionItem[] }) {
  const [selectedItem, setSelectedItem] = useState<ActionItem | null>(null);

  return (
    <div>
      <p className="text-xs text-[#9ca3af] mb-4">{items.length}件</p>

      {items.length === 0 ? (
        <p className="text-sm text-[#9ca3af] text-center py-12">
          アクションがありません
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <button
              key={item.noteId}
              onClick={() => setSelectedItem(item)}
              className="block w-full text-left p-4 bg-white border border-[#e5e7eb] rounded-2xl hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-1 mb-2">
                <svg className="w-3.5 h-3.5 text-[#d4a017]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                </svg>
                {item.bookTitle && (
                  <span className="text-[10px] px-2 py-0.5 bg-[#f3f4f6] text-[#6b7280] rounded-full">{item.bookTitle}</span>
                )}
              </div>
              <p className="text-sm text-[#1a1a1a] leading-relaxed line-clamp-2">
                {item.actionItems}
              </p>
            </button>
          ))}
        </div>
      )}

      {selectedItem && (
        <ActionDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}

function BookList({ books }: { books: BookItem[] }) {
  return (
    <div>
      {books.length === 0 ? (
        <p className="text-sm text-[#9ca3af] text-center py-12">
          本がありません
        </p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {books.map((book) => (
            <Link
              key={book.id}
              href={`/books/${book.id}`}
              className="group"
            >
              <div className="relative aspect-[2/3] overflow-hidden shadow-sm group-hover:shadow-md transition-all">
                {book.coverImageUrl ? (
                  <img
                    src={book.coverImageUrl}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#374151] to-[#1a1a1a] flex items-center justify-center p-2">
                    <span className="text-white/60 text-[11px] text-center line-clamp-3 leading-snug">
                      {book.title}
                    </span>
                  </div>
                )}
                {/* Note count badge */}
                {book.noteCount > 0 && (
                  <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 px-1.5 py-0.5 bg-black/40 backdrop-blur-sm text-white text-[9px] rounded-full">
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                    </svg>
                    {book.noteCount}
                  </div>
                )}
              </div>
              <div className="mt-1.5 px-0.5">
                <h3 className="text-xs text-[#1a1a1a] font-medium line-clamp-2 leading-snug">
                  {book.title}
                </h3>
                <p className="text-[10px] text-[#9ca3af] mt-0.5">
                  {statusLabels[book.status] ?? book.status}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
