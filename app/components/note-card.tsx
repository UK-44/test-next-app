"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { deleteNote } from "@/app/actions/notes";

export type ActionStatus = "NOT_STARTED" | "IN_PROGRESS" | "DONE";

export const actionStatusConfig: Record<ActionStatus, { label: string; class: string }> = {
  NOT_STARTED: { label: "未着手", class: "bg-[#f3f4f6] text-[#6b7280]" },
  IN_PROGRESS: { label: "実行中", class: "bg-[#fef3c7] text-[#b45309]" },
  DONE: { label: "完了", class: "bg-[#d1fae5] text-[#059669]" },
};

export type NoteCardItem = {
  id: string;
  body: string;
  quoteText: string | null;
  locationInfo: string | null;
  actionItems: string | null;
  actionStatus: ActionStatus;
  importance: number;
  createdAt: string;
  book: { id: string; title: string; author: string } | null;
};

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
            P{note.locationInfo}
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
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#d4a017]">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
          </svg>
          {note.actionStatus && actionStatusConfig[note.actionStatus] ? (
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${actionStatusConfig[note.actionStatus].class}`}>
              {actionStatusConfig[note.actionStatus].label}
            </span>
          ) : (
            "アクションあり"
          )}
        </div>
      )}
    </button>
  );
}

export function NoteDetailView({
  note,
  onBack,
  from,
}: {
  note: NoteCardItem;
  onBack: () => void;
  from?: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("このメモを削除しますか？")) return;
    setDeleting(true);
    await deleteNote(note.id);
  }

  const date = new Date(note.createdAt);
  const formattedDate = date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-[60vh] max-w-lg mx-auto pt-2 pb-12">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-[12px] text-[#9ca3af] hover:text-[#1a1a1a] transition-colors mb-6"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        戻る
      </button>

      {/* Header: date, book, importance */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-base font-semibold text-[#1a1a1a]">{formattedDate}</h2>
          {note.importance > 0 && (
            <span className="text-xs text-[#d4a017]">{"★".repeat(note.importance)}</span>
          )}
        </div>
        {note.book && (
          <p className="text-[12px] text-[#9ca3af]">
            {note.book.title}
            {note.book.author && <span> — {note.book.author}</span>}
          </p>
        )}
        {note.locationInfo && (
          <p className="text-[12px] text-[#9ca3af] mt-0.5">P{note.locationInfo}</p>
        )}
      </div>

      {/* Sections */}
      <div className="space-y-5">
        {/* Quote */}
        {note.quoteText && (
          <section>
            <blockquote className="font-[family-name:var(--font-noto-serif-jp)] text-[15px] text-[#4a4540] leading-[2] pl-4 border-l-2 border-[#e5e7eb] italic whitespace-pre-wrap">
              {note.quoteText}
            </blockquote>
          </section>
        )}

        {/* Body */}
        <section>
          <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-[0.1em] mb-2">メモ</p>
          <p className="text-[15px] text-[#1a1a1a] leading-[2] whitespace-pre-wrap">
            {note.body}
          </p>
        </section>

        {/* Action items */}
        {note.actionItems && (
          <section className="bg-[#fefce8] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-[10px] font-semibold text-[#d4a017] uppercase tracking-[0.1em]">Next Action</p>
              {note.actionStatus && actionStatusConfig[note.actionStatus] && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${actionStatusConfig[note.actionStatus].class}`}>
                  {actionStatusConfig[note.actionStatus].label}
                </span>
              )}
            </div>
            <p className="text-[14px] text-[#1a1a1a] leading-[1.9] whitespace-pre-wrap">
              {note.actionItems}
            </p>
          </section>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-8 pt-6 border-t border-[#f0f0f0]">
        <button
          onClick={() => router.push(`/notes/${note.id}${from ? `?from=${from}` : ""}`)}
          className="flex-1 py-2.5 text-[13px] font-medium text-white bg-[#1a1a1a] rounded-xl hover:bg-[#374151] transition-colors"
        >
          編集する
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="py-2.5 px-5 text-[13px] text-[#9ca3af] bg-[#f3f4f6] rounded-xl hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          {deleting ? "..." : "削除"}
        </button>
      </div>
    </div>
  );
}

export function NoteList({
  notes,
  emptyMessage,
  showCount,
  onDetailOpen,
}: {
  notes: NoteCardItem[];
  emptyMessage?: string;
  showCount?: boolean;
  onDetailOpen?: (open: boolean) => void;
}) {
  const searchParams = useSearchParams();
  const [selectedNote, setSelectedNote] = useState<NoteCardItem | null>(null);
  const [isSliding, setIsSliding] = useState(false);
  const [skipTransition, setSkipTransition] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-open note detail when returning from edit page (no animation)
  useEffect(() => {
    const openNoteId = searchParams.get("openNote");
    if (openNoteId) {
      const note = notes.find((n) => n.id === openNoteId);
      if (note) {
        setSkipTransition(true);
        setSelectedNote(note);
        setIsSliding(true);
        onDetailOpen?.(true);
        requestAnimationFrame(() => setSkipTransition(false));
      }
    }
  }, [searchParams, notes, onDetailOpen]);

  useEffect(() => {
    function handleCloseDetail() {
      if (isSliding) {
        setIsSliding(false);
        onDetailOpen?.(false);
        setTimeout(() => setSelectedNote(null), 300);
      }
    }
    window.addEventListener("closeDetail", handleCloseDetail);
    return () => window.removeEventListener("closeDetail", handleCloseDetail);
  }, [isSliding, onDetailOpen]);

  function handleSelect(note: NoteCardItem) {
    setSelectedNote(note);
    setIsSliding(true);
    onDetailOpen?.(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleBack() {
    setIsSliding(false);
    onDetailOpen?.(false);
    setTimeout(() => setSelectedNote(null), 300);
  }

  return (
    <div ref={containerRef} className="overflow-hidden">
      <div
        className={`flex items-start ${skipTransition ? "" : "transition-transform duration-300 ease-in-out"}`}
        style={{ transform: isSliding ? "translateX(-100%)" : "translateX(0)" }}
      >
        {/* Panel 1: List — collapse height when detail is shown */}
        <div className={`w-full flex-shrink-0 ${skipTransition ? "" : "transition-[max-height,opacity] duration-300"} ${isSliding ? "max-h-0 overflow-hidden opacity-0" : "max-h-none opacity-100"}`}>
          {showCount && (
            <p className="text-xs text-[#9ca3af] mb-4">{notes.length}件</p>
          )}

          {notes.length === 0 ? (
            <p className="text-sm text-[#9ca3af] text-center py-12">
              {emptyMessage ?? "メモがありません"}
            </p>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <NoteCard key={note.id} note={note} onSelect={handleSelect} />
              ))}
            </div>
          )}
        </div>

        {/* Panel 2: Detail */}
        <div className="w-full flex-shrink-0">
          {selectedNote && (
            <NoteDetailView note={selectedNote} onBack={handleBack} from="memo" />
          )}
        </div>
      </div>
    </div>
  );
}
