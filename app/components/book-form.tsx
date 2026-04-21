"use client";

import { useActionState, useState, useRef, useEffect } from "react";
import { createBook } from "@/app/actions/books";

const inputClass =
  "text-[#2c2416] mt-1 block w-full px-0 py-2 bg-transparent border-b border-[#e5e7eb] placeholder-[#b5a898] focus:outline-none focus:border-[#6b5d4d] sm:text-sm transition-colors";

interface BookResult {
  title: string;
  author: string;
  coverImageUrl: string | null;
  identifier: string;
  publisher: string;
  publishedAt: string;
  description: string;
}

export function BookForm() {
  const [state, action, pending] = useActionState(createBook, undefined);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");
  const [searchResults, setSearchResults] = useState<BookResult[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [publisher, setPublisher] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [description, setDescription] = useState("");

  const errors = state?.errors as
    | Record<string, string[] | undefined>
    | undefined;

  useEffect(() => {
    if (showDialog) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [showDialog]);

  async function handleSearch() {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError("");

    try {
      const res = await fetch("/api/book-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSearchError(data.error || "検索に失敗しました。");
        return;
      }

      if (data.results.length === 0) {
        setSearchError("書籍が見つかりませんでした。");
        return;
      }

      setSearchResults(data.results);
      setShowDialog(true);
    } catch {
      setSearchError("検索に失敗しました。手動で入力してください。");
    } finally {
      setSearching(false);
    }
  }

  function handleSelect(book: BookResult) {
    setTitle(book.title);
    setAuthor(book.author);
    setCoverImageUrl(book.coverImageUrl ?? "");
    setIdentifier(book.identifier);
    setPublisher(book.publisher);
    setPublishedAt(book.publishedAt);
    setDescription(book.description);
    setShowDialog(false);
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Book search section */}
      <div className="mb-6 p-4 bg-[#ebe3d5] rounded border border-[#e5e7eb]">
        <label className="block text-xs text-[#8c7e6a] tracking-widest mb-2">
          書籍タイトルで検索
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="書籍タイトルを入力..."
            className="flex-1 min-w-0 px-3 py-2 bg-transparent border-b border-[#e5e7eb] text-sm text-[#2c2416] placeholder-[#b5a898] focus:outline-none focus:border-[#6b5d4d]"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching || !searchQuery.trim()}
            className="shrink-0 px-4 py-2 bg-[#2c2416] text-[#f5f0e8] text-sm rounded hover:bg-[#3d3225] disabled:opacity-50 whitespace-nowrap"
          >
            {searching ? "検索中..." : "検索"}
          </button>
        </div>
        {searchError && (
          <p className="mt-2 text-sm text-red-600">{searchError}</p>
        )}
      </div>

      {/* Search results dialog */}
      <dialog
        ref={dialogRef}
        onClose={() => setShowDialog(false)}
        className="w-full max-w-md rounded-lg bg-[#f5f0e8] p-0 shadow-xl backdrop:bg-black/40"
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-[#2c2416] tracking-widest">
              検索結果
            </h2>
            <button
              type="button"
              onClick={() => setShowDialog(false)}
              className="text-[#8c7e6a] hover:text-[#2c2416] text-lg leading-none"
            >
              ✕
            </button>
          </div>
          <ul className="space-y-1 max-h-80 overflow-y-auto">
            {searchResults.map((book, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => handleSelect(book)}
                  className="w-full text-left px-3 py-2.5 rounded hover:bg-[#ebe3d5] transition-colors"
                >
                  <p className="text-sm font-medium text-[#2c2416] leading-snug">
                    {book.title}
                  </p>
                  {book.author && (
                    <p className="text-xs text-[#8c7e6a] mt-0.5">
                      {book.author}
                    </p>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </dialog>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#e5e7eb]" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-[#f5f0e8] px-2 text-[#8c7e6a]">または手動で入力</span>
        </div>
      </div>

      {/* Manual form */}
      <form action={action} className="space-y-4">
        <input type="hidden" name="identifier" value={identifier} />

        {/* Cover image URL + preview */}
        <div>
          <label htmlFor="coverImageUrl" className="block text-xs text-[#8c7e6a] tracking-widest">
            表紙画像URL
          </label>
          <input
            type="url"
            name="coverImageUrl"
            id="coverImageUrl"
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            placeholder="https://..."
            className={inputClass}
          />
          {coverImageUrl && (
            <div className="flex justify-center mt-3">
              <img
                src={coverImageUrl}
                alt="表紙プレビュー"
                className="h-40 object-contain rounded"
              />
            </div>
          )}
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
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
            defaultValue="WANT_TO_READ"
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
            defaultValue=""
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
            value={publisher}
            onChange={(e) => setPublisher(e.target.value)}
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
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
          {pending ? "登録中..." : "本を登録"}
        </button>
      </form>
    </div>
  );
}
