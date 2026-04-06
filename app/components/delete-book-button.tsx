"use client";

import { deleteBook } from "@/app/actions/books";

export function DeleteBookButton({ bookId }: { bookId: string }) {
  async function handleDelete() {
    if (confirm("この本を削除しますか？関連するメモもすべて削除されます。")) {
      await deleteBook(bookId);
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="py-2.5 px-4 text-sm text-[#6b7280] bg-[#f3f4f6] rounded-xl hover:text-red-600 hover:bg-red-50 transition-colors"
    >
      削除
    </button>
  );
}
