import { getSession } from "@/app/lib/session";
import { z } from "zod";

const SearchSchema = z.object({
  query: z.string().min(1, "検索キーワードを入力してください。").max(200),
});

interface GoogleBooksVolume {
  volumeInfo: {
    title?: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
  };
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "認証が必要です。" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = SearchSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.flatten().fieldErrors.query?.[0] ?? "無効なリクエストです。" },
      { status: 400 }
    );
  }

  try {
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    const url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(parsed.data.query)}&maxResults=5&langRestrict=ja${apiKey ? `&key=${apiKey}` : ""}`;

    let res: Response | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      res = await fetch(url, { cache: "no-store" });
      if (res.status !== 429) break;
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }

    if (!res || !res.ok) {
      const text = await res?.text().catch(() => "") ?? "";
      console.error("Google Books API error:", res?.status, text);
      return Response.json(
        { error: `Google Books APIへのリクエストに失敗しました。(${res?.status})` },
        { status: 502 }
      );
    }

    const data = await res.json();
    if (!data.items || data.items.length === 0) {
      return Response.json({ results: [] });
    }

    const results = (data.items as GoogleBooksVolume[]).map((vol) => {
      const info = vol.volumeInfo;
      const isbn =
        info.industryIdentifiers?.find((id) => id.type === "ISBN_13")?.identifier ??
        info.industryIdentifiers?.find((id) => id.type === "ISBN_10")?.identifier ??
        "";

      let coverImageUrl =
        info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail ?? null;
      if (coverImageUrl) {
        coverImageUrl = coverImageUrl
          .replace("zoom=1", "zoom=3")
          .replace(/^http:/, "https:");
      }

      return {
        title: info.title ?? "",
        author: info.authors?.join(", ") ?? "",
        coverImageUrl,
        identifier: isbn,
        publisher: info.publisher ?? "",
        publishedAt: info.publishedDate ?? "",
        description: (info.description ?? "").substring(0, 500),
      };
    });

    return Response.json({ results });
  } catch {
    return Response.json(
      { error: "検索に失敗しました。" },
      { status: 500 }
    );
  }
}
