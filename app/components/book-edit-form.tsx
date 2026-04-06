"use client";

import { useActionState, useState } from "react";
import { updateBook } from "@/app/actions/books";

type BookData = {
  id: string;
  title: string;
  author: string;
  coverImageUrl: string | null;
  identifier: string | null;
  format: string | null;
  publisher: string | null;
  publishedAt: string | null;
  description: string | null;
  status: string;
  rating: number | null;
  shortReview: string | null;
};

const inputClass =
  "text-[#2c2416] mt-1 block w-full px-0 py-2 bg-transparent border-b border-[#e5e7eb] focus:outline-none focus:border-[#6b5d4d] sm:text-sm transition-colors";

export function BookEditForm({ book }: { book: BookData }) {
  const updateWithId = updateBook.bind(null, book.id);
  const [state, action, pending] = useActionState(updateWithId, undefined);
  const [coverImageUrl, setCoverImageUrl] = useState(book.coverImageUrl ?? "");
  const [rating, setRating] = useState(book.rating ?? 0);

  const errors = state?.errors as
    | Record<string, string[] | undefined>
    | undefined;

  return (
    <form action={action} className="max-w-lg mx-auto space-y-4">
      <input type="hidden" name="coverImageUrl" value={coverImageUrl} />
      <input type="hidden" name="identifier" value={book.identifier ?? ""} />

      {/* Cover preview */}
      {coverImageUrl && (
        <div className="flex justify-center">
          <img
            src={coverImageUrl}
            alt="表紙プレビュー"
            className="h-40 object-contain rounded"
          />
        </div>
      )}

      <div>
        <label htmlFor="coverImageUrl" className="block text-xs text-[#8c7e6a] tracking-widest">
          表紙画像URL
        </label>
        <input
          type="url"
          id="coverImageUrl"
          value={coverImageUrl}
          onChange={(e) => setCoverImageUrl(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="title" className="block text-xs text-[#8c7e6a] tracking-widest">
          タイトル *
        </label>
        <input
          type="text"
          name="title"
          id="title"
          required
          defaultValue={book.title}
          className={inputClass}
        />
        {errors?.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="author" className="block text-xs text-[#8c7e6a] tracking-widest">
          著者
        </label>
        <input
          type="text"
          name="author"
          id="author"
          defaultValue={book.author}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-xs text-[#8c7e6a] tracking-widest">
          ステータス
        </label>
        <select
          name="status"
          id="status"
          defaultValue={book.status}
          className={inputClass}
        >
          <option value="WANT_TO_READ">読みたい</option>
          <option value="READING">読書中</option>
          <option value="FINISHED">読了</option>
        </select>
      </div>

      <div>
        <label htmlFor="format" className="block text-xs text-[#8c7e6a] tracking-widest">
          書籍形式
        </label>
        <select
          name="format"
          id="format"
          defaultValue={book.format ?? ""}
          className={inputClass}
        >
          <option value="">未選択</option>
          <option value="PAPER">紙の本</option>
          <option value="EBOOK">電子書籍</option>
          <option value="AUDIOBOOK">オーディオブック</option>
        </select>
      </div>

      <div>
        <label htmlFor="publisher" className="block text-xs text-[#8c7e6a] tracking-widest">
          出版社
        </label>
        <input
          type="text"
          name="publisher"
          id="publisher"
          defaultValue={book.publisher ?? ""}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="publishedAt" className="block text-xs text-[#8c7e6a] tracking-widest">
          出版日
        </label>
        <input
          type="text"
          name="publishedAt"
          id="publishedAt"
          defaultValue={book.publishedAt ?? ""}
          placeholder="例: 2024/01/15"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-xs text-[#8c7e6a] tracking-widest">
          概要
        </label>
        <textarea
          name="description"
          id="description"
          rows={3}
          defaultValue={book.description ?? ""}
          className={inputClass}
        />
      </div>

      {/* Rating */}
      <div>
        <label className="block text-xs text-[#8c7e6a] tracking-widest mb-1">
          評価
        </label>
        <input type="hidden" name="rating" value={rating} />
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star === rating ? 0 : star)}
              className="text-2xl leading-none"
            >
              {star <= rating ? (
                <span className="text-yellow-400">★</span>
              ) : (
                <span className="text-[#e5e7eb]">☆</span>
              )}
            </button>
          ))}
          {rating > 0 && (
            <button
              type="button"
              onClick={() => setRating(0)}
              className="ml-2 text-xs text-[#b5a898] hover:text-[#2c2416]"
            >
              クリア
            </button>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="shortReview" className="block text-xs text-[#8c7e6a] tracking-widest">
          ひとこと感想
        </label>
        <textarea
          name="shortReview"
          id="shortReview"
          rows={2}
          defaultValue={book.shortReview ?? ""}
          placeholder="この本をひとことで表すと..."
          className={inputClass}
        />
      </div>

      {state?.message && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full flex justify-center py-3 px-4 rounded text-sm font-medium text-[#f5f0e8] bg-[#2c2416] hover:bg-[#3d3225] focus:outline-none disabled:opacity-50"
      >
        {pending ? "保存中..." : "変更を保存"}
      </button>
    </form>
  );
}
