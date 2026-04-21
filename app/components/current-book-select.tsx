"use client";

import { useActionState } from "react";
import { updateCurrentBook } from "@/app/actions/settings";

type BookOption = { id: string; title: string; author: string };

export function CurrentBookSelect({
  books,
  currentBookId,
}: {
  books: BookOption[];
  currentBookId: string | null;
}) {
  const [state, action, pending] = useActionState(updateCurrentBook, undefined);

  return (
    <form action={action} className="flex gap-2">
      <select
        name="currentBookId"
        defaultValue={currentBookId ?? ""}
        className="flex-1 min-w-0 px-3 py-2.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl text-sm text-[#1a1a1a] focus:outline-none focus:border-[#9ca3af] transition-colors"
      >
        <option value="">未設定</option>
        {books.map((book) => (
          <option key={book.id} value={book.id}>
            {book.title}{book.author ? ` — ${book.author}` : ""}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={pending}
        className="shrink-0 whitespace-nowrap px-4 py-2.5 text-[13px] font-medium text-white bg-[#1a1a1a] rounded-xl hover:bg-[#374151] transition-colors disabled:opacity-50"
      >
        {pending ? "..." : "設定"}
      </button>
    </form>
  );
}
