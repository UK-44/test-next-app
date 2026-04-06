import { getSession } from "@/app/lib/session";
import { AmazonUrlSchema } from "@/app/lib/definitions";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "認証が必要です。" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = AmazonUrlSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.flatten().fieldErrors.url?.[0] ?? "無効なURLです。" },
      { status: 400 }
    );
  }

  // Resolve shortened URLs (amzn.asia, amzn.to) to full Amazon URLs
  let resolvedUrl = parsed.data.url;
  const hostname = new URL(resolvedUrl).hostname;
  if (hostname === "amzn.asia" || hostname === "amzn.to") {
    try {
      const redirectRes = await fetch(resolvedUrl, { redirect: "follow" });
      resolvedUrl = redirectRes.url;
    } catch {
      return Response.json(
        { error: "短縮URLの解決に失敗しました。" },
        { status: 400 }
      );
    }
  }

  // Extract ASIN from Amazon URL
  const asinMatch = resolvedUrl.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
  if (!asinMatch) {
    return Response.json(
      { error: "URLからASINを取得できませんでした。" },
      { status: 400 }
    );
  }
  const asin = asinMatch[1];

  // Extract book title from Amazon URL path as a fallback search term
  const titleFromUrl = extractTitleFromAmazonUrl(resolvedUrl);

  const queries = [
    `isbn:${asin}`,
    asin,
    ...(titleFromUrl ? [titleFromUrl] : []),
  ];

  try {
    for (const query of queries) {
      const result = await searchGoogleBooksWithRetry(query);
      if (result) {
        return Response.json(result);
      }
    }

    return Response.json(
      { error: "書籍情報が見つかりませんでした。手動で入力してください。" },
      { status: 404 }
    );
  } catch {
    return Response.json(
      { error: "情報の取得に失敗しました。手動で入力してください。" },
      { status: 500 }
    );
  }
}

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

function extractTitleFromAmazonUrl(url: string): string | null {
  try {
    const pathname = new URL(url).pathname;
    // Amazon URLs: /書籍タイトル/dp/ASIN or /dp/ASIN
    const segments = pathname.split("/").filter(Boolean);
    const dpIndex = segments.indexOf("dp");
    if (dpIndex > 0) {
      return decodeURIComponent(segments[dpIndex - 1]).replace(/-/g, " ");
    }
    return null;
  } catch {
    return null;
  }
}

async function searchGoogleBooksWithRetry(query: string, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    const result = await searchGoogleBooks(query);
    if (result) return result;
    if (i < retries) {
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
  return null;
}

async function searchGoogleBooks(query: string) {
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=1&langRestrict=ja`
  );

  if (!res.ok) return null;

  const data = await res.json();
  if (!data.items || data.items.length === 0) return null;

  const vol: GoogleBooksVolume = data.items[0];
  const info = vol.volumeInfo;

  // Get the best available identifier (ISBN-13 > ISBN-10)
  const isbn =
    info.industryIdentifiers?.find((id) => id.type === "ISBN_13")?.identifier ??
    info.industryIdentifiers?.find((id) => id.type === "ISBN_10")?.identifier ??
    "";

  // Get cover image and upgrade to higher resolution
  let coverImageUrl = info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail ?? null;
  if (coverImageUrl) {
    // Google Books thumbnails use zoom=1 by default; use zoom=3 for higher res
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
}
