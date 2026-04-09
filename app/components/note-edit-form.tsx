"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { updateNote } from "@/app/actions/notes";

type BookOption = { id: string; title: string };

type NoteData = {
  id: string;
  bookId: string | null;
  body: string;
  quoteText: string | null;
  locationInfo: string | null;
  actionItems: string | null;
  actionStatus: string | null;
  importance: number;
};

const inputClass =
  "mt-1 block w-full px-0 py-2 bg-transparent border-b border-[#e5e7eb] text-[#2c2416] placeholder-[#b5a898] text-sm focus:outline-none focus:border-[#6b5d4d] transition-colors";

export function NoteEditForm({
  note,
  books,
}: {
  note: NoteData;
  books: BookOption[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const updateWithId = updateNote.bind(null, note.id);
  const [state, action, pending] = useActionState(updateWithId, undefined);
  const [importance, setImportance] = useState(note.importance);
  const [actionStatus, setActionStatus] = useState(note.actionStatus ?? "NOT_STARTED");

  useEffect(() => {
    if (state?.success) {
      const from = searchParams.get("from");
      if (from?.startsWith("book-")) {
        const bookId = from.slice(5);
        router.push(`/books/${bookId}?openNote=${note.id}`);
      } else if (from === "memo" || from === "action") {
        router.push(`/?tab=${from}&openNote=${note.id}`);
      } else {
        router.push("/?tab=memo");
      }
    }
  }, [state, router, searchParams, note.id]);

  const errors = state?.errors as
    | Record<string, string[] | undefined>
    | undefined;

  return (
    <div className="max-w-lg mx-auto">
      <form action={action} className="space-y-5">
        <input type="hidden" name="importance" value={importance} />
        <input type="hidden" name="actionStatus" value={actionStatus} />
        <div>
          <label htmlFor="bookId" className="block text-xs text-[#8c7e6a]">
            本
          </label>
          <select
            name="bookId"
            id="bookId"
            defaultValue={note.bookId ?? ""}
            className={inputClass}
          >
            <option value="">未選択</option>
            {books.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="quoteText" className="block text-xs text-[#8c7e6a]">
            引用文
          </label>
          <textarea
            name="quoteText"
            id="quoteText"
            rows={4}
            defaultValue={note.quoteText ?? ""}
            className={inputClass + " resize-none"}
          />
        </div>

        <div>
          <label htmlFor="locationInfo" className="block text-xs text-[#8c7e6a]">
            ページ
          </label>
          <input
            type="number"
            name="locationInfo"
            id="locationInfo"
            min="0"
            inputMode="numeric"
            defaultValue={note.locationInfo ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="body" className="block text-xs text-[#8c7e6a]">
            メモ *
          </label>
          <textarea
            name="body"
            id="body"
            rows={6}
            required
            defaultValue={note.body}
            className={inputClass + " resize-none leading-relaxed"}
          />
          {errors?.body && (
            <p className="mt-1 text-xs text-red-700">{errors.body[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="actionItems" className="block text-xs text-[#8c7e6a]">
            次のアクション
          </label>
          <textarea
            name="actionItems"
            id="actionItems"
            rows={4}
            defaultValue={note.actionItems ?? ""}
            placeholder="この学びから試したいこと..."
            className={inputClass + " resize-none"}
          />
        </div>

        <div>
          <label className="block text-xs text-[#8c7e6a] mb-1">ステータス</label>
          <div className="flex gap-1.5">
            {[
              { value: "NOT_STARTED", label: "未着手" },
              { value: "IN_PROGRESS", label: "実行中" },
              { value: "DONE", label: "完了" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setActionStatus(opt.value)}
                className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                  actionStatus === opt.value
                    ? "bg-[#2c2416] text-[#f5f0e8]"
                    : "text-[#8c7e6a] bg-[#f3f4f6] hover:bg-[#e5e7eb]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-[#8c7e6a] mb-1">重要度</label>
          <div className="flex gap-1">
            {[1, 2, 3].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setImportance(star === importance ? 0 : star)}
                className="text-xl leading-none"
              >
                {star <= importance ? (
                  <span className="text-[#d4a017]">★</span>
                ) : (
                  <span className="text-[#e5e7eb]">☆</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {state?.message && (
          <p className="text-xs text-red-700">{state.message}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full py-3 text-sm text-[#f5f0e8] bg-[#2c2416] rounded hover:bg-[#3d3225] transition-colors disabled:opacity-50"
        >
          {pending ? "保存中..." : "更新"}
        </button>
      </form>

    </div>
  );
}
