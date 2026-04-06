"use client";

import { updateBookStatus } from "@/app/actions/books";

export function BookStatusSelect({
  bookId,
  currentStatus,
}: {
  bookId: string;
  currentStatus: string;
}) {
  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    await updateBookStatus(bookId, e.target.value);
  }

  return (
    <select
      defaultValue={currentStatus}
      onChange={handleChange}
      className="text-[#1a1a1a] px-3 py-1.5 text-xs bg-[#f3f4f6] rounded-full focus:outline-none focus:ring-1 focus:ring-[#9ca3af] appearance-none cursor-pointer"
    >
      <option value="WANT_TO_READ">読みたい</option>
      <option value="READING">読書中</option>
      <option value="FINISHED">読了</option>
    </select>
  );
}
