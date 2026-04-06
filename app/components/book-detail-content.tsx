"use client";

import Link from "next/link";
import { useState } from "react";
import { BookStatusSelect } from "@/app/components/book-status-select";
import { DeleteBookButton } from "@/app/components/delete-book-button";
import { NoteDetailView } from "@/app/components/note-card";
import type { NoteCardItem } from "@/app/components/note-card";

function NoteCard({
  note,
  onSelect,
}: {
  note: NoteCardItem;
  onSelect: (note: NoteCardItem) => void;
}) {
  return (
    <button
      onClick={() => onSelect(note)}
      className="block w-full text-left p-4 bg-white border border-[#e5e7eb] rounded-2xl hover:shadow-md transition-all"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[11px] text-[#9ca3af]">
          {new Date(note.createdAt).toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, ".")}
        </span>
        {note.importance > 0 && (
          <span className="text-xs text-[#d4a017]">
            {"★".repeat(note.importance)}
          </span>
        )}
        {note.locationInfo && (
          <span className="ml-auto text-[10px] text-[#9ca3af]">
            {note.locationInfo}
          </span>
        )}
      </div>
      {note.quoteText && (
        <p className="border-l-2 border-[#e5e7eb] pl-3 mb-2 text-xs text-[#9ca3af] italic line-clamp-1">
          {note.quoteText}
        </p>
      )}
      <p className="text-sm text-[#1a1a1a] line-clamp-2 leading-relaxed">
        {note.body}
      </p>
      {note.actionItems && (
        <div className="mt-2 flex items-center gap-1 text-[11px] text-[#d4a017]">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
          </svg>
          アクションあり
        </div>
      )}
    </button>
  );
}

type BookData = {
  id: string;
  title: string;
  author: string;
  coverImageUrl: string | null;
  status: string;
  rating: number | null;
  format: string | null;
  publisher: string | null;
  description: string | null;
};

export function BookDetailContent({
  book,
  notes,
}: {
  book: BookData;
  notes: NoteCardItem[];
}) {
  const [selectedNote, setSelectedNote] = useState<NoteCardItem | null>(null);
  const [isSliding, setIsSliding] = useState(false);

  function handleSelect(note: NoteCardItem) {
    setSelectedNote(note);
    setIsSliding(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleBack() {
    setIsSliding(false);
    setTimeout(() => setSelectedNote(null), 300);
  }

  return (
    <div className="overflow-hidden">
      <div
        className="flex transition-transform duration-300 ease-in-out items-start"
        style={{ transform: isSliding ? "translateX(-100%)" : "translateX(0)" }}
      >
        {/* Panel 1: Book detail page */}
        <div className={`w-full flex-shrink-0 transition-[max-height,opacity] duration-300 ${isSliding ? "max-h-0 overflow-hidden opacity-0" : "max-h-none opacity-100"}`}>
          <div className="max-w-2xl mx-auto">
            {/* Book cover + info */}
            <div className="flex gap-4 mb-5">
              <div className="w-28 flex-shrink-0">
                {book.coverImageUrl ? (
                  <img
                    src={book.coverImageUrl}
                    alt={book.title}
                    className="w-full rounded-lg shadow-md"
                  />
                ) : (
                  <div className="aspect-[2/3] w-full bg-gradient-to-br from-[#374151] to-[#1a1a1a] rounded-lg flex items-center justify-center">
                    <svg className="w-10 h-10 text-white/20" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 py-1">
                <h1 className="text-lg font-bold text-[#1a1a1a] leading-snug mb-1">{book.title}</h1>
                {book.author && (
                  <p className="text-sm text-[#6b7280] mb-3">{book.author}</p>
                )}
                <div className="mb-3">
                  <BookStatusSelect bookId={book.id} currentStatus={book.status} />
                </div>
                {book.rating !== null && (
                  <p className="text-sm text-[#d4a017] mb-2">
                    {"★".repeat(book.rating)}{"☆".repeat(5 - book.rating)}
                  </p>
                )}
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#9ca3af]">
                  {book.format && (
                    <span>
                      {book.format === "PAPER"
                        ? "紙の本"
                        : book.format === "EBOOK"
                          ? "電子書籍"
                          : "オーディオブック"}
                    </span>
                  )}
                  {book.publisher && (
                    <span>{book.publisher}</span>
                  )}
                </div>
              </div>
            </div>

            {book.description && (
              <details className="mb-5">
                <summary className="text-sm text-[#6b7280] cursor-pointer hover:text-[#1a1a1a] transition-colors">
                  概要を表示
                </summary>
                <p className="mt-2 text-sm text-[#6b7280] leading-relaxed">{book.description}</p>
              </details>
            )}

            {/* Actions */}
            <div className="flex gap-2 mb-6">
              <Link
                href={`/notes/new?bookId=${book.id}`}
                className="flex-1 text-center py-2.5 px-4 bg-[#1a1a1a] text-white text-sm rounded-xl hover:bg-[#374151] transition-colors"
              >
                メモを追加
              </Link>
              <Link
                href={`/books/${book.id}/edit`}
                className="py-2.5 px-4 bg-[#f3f4f6] text-[#6b7280] text-sm rounded-xl hover:bg-[#e5e7eb] transition-colors"
              >
                編集
              </Link>
              <DeleteBookButton bookId={book.id} />
            </div>

            {/* Notes list */}
            <h2 className="text-base font-semibold text-[#1a1a1a] mb-4">
              メモ ({notes.length})
            </h2>

            <div className="mb-8">
              {notes.length === 0 ? (
                <p className="text-sm text-[#9ca3af] text-center py-12">
                  まだメモがありません。読書中に気づいたことを記録しましょう。
                </p>
              ) : (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <NoteCard key={note.id} note={note} onSelect={handleSelect} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Panel 2: Note detail — full page slide */}
        <div className="w-full flex-shrink-0">
          {selectedNote && (
            <NoteDetailView note={selectedNote} onBack={handleBack} />
          )}
        </div>
      </div>
    </div>
  );
}
