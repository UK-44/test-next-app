"use client";

import { useActionState, useState } from "react";
import { updateNote } from "@/app/actions/notes";

type BookOption = { id: string; title: string };

type NoteData = {
  id: string;
  bookId: string | null;
  body: string;
  quoteText: string | null;
  locationInfo: string | null;
  actionItems: string | null;
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
  const updateWithId = updateNote.bind(null, note.id);
  const [state, action, pending] = useActionState(updateWithId, undefined);
  const [importance, setImportance] = useState(note.importance);

  const errors = state?.errors as
    | Record<string, string[] | undefined>
    | undefined;

  return (
    <div className="max-w-lg mx-auto">
      <form action={action} className="space-y-5">
        <input type="hidden" name="importance" value={importance} />
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
            type="text"
            name="locationInfo"
            id="locationInfo"
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
