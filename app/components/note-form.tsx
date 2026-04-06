"use client";

import { useActionState, useState } from "react";
import { createNote } from "@/app/actions/notes";

type BookOption = {
  id: string;
  title: string;
};

const inputClass =
  "mt-1 block w-full px-0 py-2 bg-transparent border-b border-[#e5e7eb] text-[#2c2416] placeholder-[#b5a898] text-sm focus:outline-none focus:border-[#6b5d4d] transition-colors";

export function NoteForm({
  books,
  defaultBookId,
}: {
  books: BookOption[];
  defaultBookId?: string;
}) {
  const [state, action, pending] = useActionState(createNote, undefined);
  const [importance, setImportance] = useState(0);

  const errors = state?.errors as
    | Record<string, string[] | undefined>
    | undefined;

  return (
    <form action={action} className="max-w-lg mx-auto space-y-5">
      <input type="hidden" name="importance" value={importance} />
      <div>
        <label htmlFor="bookId" className="block text-xs text-[#8c7e6a]">
          本
        </label>
        <select
          name="bookId"
          id="bookId"
          defaultValue={defaultBookId ?? ""}
          className={inputClass}
        >
          <option value="">未選択（フリーメモ）</option>
          {books.map((book) => (
            <option key={book.id} value={book.id}>
              {book.title}
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
          rows={2}
          autoFocus
          placeholder="印象に残った一文..."
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
          placeholder="p.42, 第3章"
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
          placeholder="読書中に浮かんだことを書く..."
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
          rows={2}
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
        {pending ? "保存中..." : "メモを保存"}
      </button>
    </form>
  );
}
