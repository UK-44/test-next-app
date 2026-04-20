import { getSession } from "@/app/lib/session";
import { z } from "zod";

const SearchSchema = z.object({
  query: z.string().min(1, "検索キーワードを入力してください。").max(200),
});

interface RakutenBooksItem {
  title?: string;
  author?: string;
  publisherName?: string;
  isbn?: string;
  itemCaption?: string;
  largeImageUrl?: string;
  mediumImageUrl?: string;
  smallImageUrl?: string;
  salesDate?: string;
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
    const appId = process.env.RAKUTEN_APP_ID;
    const accessKey = process.env.RAKUTEN_ACCESS_KEY;
    if (!appId || !accessKey) {
      return Response.json(
        { error: "楽天APIの認証情報が設定されていません。" },
        { status: 500 }
      );
    }

    const params = new URLSearchParams({
      applicationId: appId,
      accessKey,
      title: parsed.data.query,
      hits: "5",
    });
    const url = `https://openapi.rakuten.co.jp/services/api/BooksBook/Search/20170404?${params}`;

    let res: Response | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      res = await fetch(url, { cache: "no-store" });
      if (res.status !== 429) break;
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }

    if (!res || !res.ok) {
      const text = await res?.text().catch(() => "") ?? "";
      console.error("Rakuten Books API error:", res?.status, text);
      return Response.json(
        { error: `楽天ブックスAPIへのリクエストに失敗しました。(${res?.status})` },
        { status: 502 }
      );
    }

    const data = await res.json();
    if (!data.Items || data.Items.length === 0) {
      return Response.json({ results: [] });
    }

    const results = (data.Items as { Item: RakutenBooksItem }[]).map(({ Item: item }) => {
      const coverImageUrl = item.largeImageUrl || item.mediumImageUrl || item.smallImageUrl || null;

      return {
        title: item.title ?? "",
        author: item.author ?? "",
        coverImageUrl,
        identifier: item.isbn ?? "",
        publisher: item.publisherName ?? "",
        publishedAt: item.salesDate ?? "",
        description: (item.itemCaption ?? "").substring(0, 500),
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
