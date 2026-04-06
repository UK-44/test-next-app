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

  try {
    const res = await fetch(parsed.data.url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "ja-JP,ja;q=0.9",
      },
    });

    if (!res.ok) {
      return Response.json(
        { error: "ページの取得に失敗しました。" },
        { status: 502 }
      );
    }

    const html = await res.text();
    const bookInfo = parseAmazonHtml(html, parsed.data.url);

    return Response.json(bookInfo);
  } catch {
    return Response.json(
      { error: "情報の取得に失敗しました。手動で入力してください。" },
      { status: 500 }
    );
  }
}

function parseAmazonHtml(html: string, url: string) {
  const getMetaContent = (property: string): string | null => {
    const ogMatch = html.match(
      new RegExp(
        `<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["']`,
        "i"
      )
    );
    if (ogMatch) return decodeHtmlEntities(ogMatch[1]);

    const nameMatch = html.match(
      new RegExp(
        `<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']*)["']`,
        "i"
      )
    );
    if (nameMatch) return decodeHtmlEntities(nameMatch[1]);

    return null;
  };

  // --- 登録情報セクション (detail-bullet-list) からラベル:値ペアを抽出 ---
  const detailBullets = parseDetailBullets(html);

  // Title: #productTitle span を優先、OGタグはフォールバック
  let title = "";
  const productTitleMatch = html.match(
    /<span[^>]*id="productTitle"[^>]*>\s*([\s\S]*?)\s*<\/span>/i
  );
  if (productTitleMatch) {
    title = stripHtml(productTitleMatch[1]).trim();
  }
  if (!title) {
    title = getMetaContent("og:title") ?? "";
    title = title.replace(/\s*\|.*$/, "").trim();
  }

  // Cover image: #landingImage の data-old-hires (高解像度) > src > OGタグ
  let coverImageUrl: string | null = null;
  const landingImgMatch = html.match(
    /<img[^>]*id="landingImage"[^>]*>/i
  );
  if (landingImgMatch) {
    const imgTag = landingImgMatch[0];
    const hiresMatch = imgTag.match(/data-old-hires="([^"]+)"/i);
    if (hiresMatch) {
      coverImageUrl = hiresMatch[1];
    } else {
      const srcMatch = imgTag.match(/src="([^"]+)"/i);
      if (srcMatch) coverImageUrl = srcMatch[1];
    }
  }
  if (!coverImageUrl) {
    coverImageUrl = getMetaContent("og:image") ?? null;
  }

  // ASIN: URL > 登録情報 > ページ内JSON
  let identifier = "";
  const asinFromUrl = url.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
  if (asinFromUrl) {
    identifier = asinFromUrl[1];
  } else if (detailBullets["ASIN"]) {
    identifier = detailBullets["ASIN"];
  } else {
    const pageAsinMatch = html.match(/"ASIN"\s*:\s*"([A-Z0-9]{10})"/i);
    if (pageAsinMatch) identifier = pageAsinMatch[1];
  }

  // 出版社: 登録情報から
  const publisher = detailBullets["出版社"] ?? "";

  // 発売日: 登録情報から
  const publishedAt = detailBullets["発売日"] ?? "";

  // Author: 「著者について」h3 の直後の div > span からテキスト冒頭を取得
  let author = "";
  const aboutAuthorMatch = html.match(
    /<h3[^>]*>\s*<span[^>]*>\s*著者について\s*<\/span>\s*<\/h3>\s*<div[^>]*>\s*<span[^>]*>([\s\S]*?)<\/span>/i
  );
  if (aboutAuthorMatch) {
    // 著者略歴の本文から名前部分を推定: 冒頭の「〜生まれ。」の前にある人名等は取りにくいため
    // byline を優先し、こちらは fallback 用の略歴テキストとして保持
    const bioText = stripHtml(aboutAuthorMatch[1]).trim();
    // 略歴テキストは description の補足に使える（著者名自体は byline から取る）
    if (!author && bioText) {
      // 略歴からは名前が取りにくいので byline に任せる
    }
    void bioText;
  }

  // Author: byline エリア（タイトル下の著者名リンク）
  // class="author notFaded" 等、class に "author" を含む span 内の最初の <a> テキスト
  if (!author) {
    const bylineMatch = html.match(
      /<span[^>]*class="[^"]*author[^"]*"[^>]*>[\s\S]*?<a[^>]*class="a-link-normal"[^>]*>([^<]+)<\/a>/i
    );
    if (bylineMatch) {
      author = decodeHtmlEntities(bylineMatch[1]).trim();
    }
  }
  // Fallback: any <a> inside author span
  if (!author) {
    const bylineFallback = html.match(
      /<span[^>]*class="[^"]*author[^"]*"[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>/i
    );
    if (bylineFallback) {
      author = decodeHtmlEntities(bylineFallback[1]).trim();
    }
  }

  // Description
  const description = getMetaContent("og:description") ?? "";

  return {
    title,
    author,
    coverImageUrl,
    identifier,
    publisher,
    publishedAt,
    description: description.substring(0, 500),
  };
}

/**
 * 「登録情報」セクションの detail-bullet-list をパースし、
 * ラベル名 → 値 の Record を返す。
 *
 * HTML構造:
 *   <li><span class="a-list-item">
 *     <span class="a-text-bold">出版社 ‏ : ‎ </span>
 *     <span>文響社</span>
 *   </span></li>
 *
 * ラベル内には Unicode 制御文字 (U+200F, U+200E) と空白が混在する。
 */
function parseDetailBullets(html: string): Record<string, string> {
  const result: Record<string, string> = {};

  // 登録情報セクションを抽出
  const sectionMatch = html.match(
    /登録情報[\s\S]*?<ul[^>]*class="[^"]*detail-bullet-list[^"]*"[^>]*>([\s\S]*?)<\/ul>/i
  );
  if (!sectionMatch) return result;

  const listHtml = sectionMatch[1];

  // 各 <li> を抽出
  const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let liMatch;
  while ((liMatch = liRegex.exec(listHtml)) !== null) {
    const li = liMatch[1];

    // ラベル: <span class="a-text-bold">...</span>
    const labelMatch = li.match(
      /<span[^>]*class="[^"]*a-text-bold[^"]*"[^>]*>([\s\S]*?)<\/span>/i
    );
    if (!labelMatch) continue;

    // ラベルテキストからHTMLエンティティ・Unicode制御文字・コロン・空白を除去
    const rawLabel = decodeHtmlEntities(stripHtml(labelMatch[1]));
    const label = rawLabel
      .replace(/[\u200F\u200E\u00A0]/g, "")
      .replace(/\s*[：:]\s*/, "")
      .trim();

    if (!label) continue;

    // 値: ラベル span の直後にある次の <span> のテキスト
    // ラベル span を取り除いた残りから最初の <span>...</span> を探す
    const afterLabel = li.substring(li.indexOf(labelMatch[0]) + labelMatch[0].length);
    const valueMatch = afterLabel.match(/<span[^>]*>([^<]*)<\/span>/i);

    if (valueMatch) {
      const value = decodeHtmlEntities(valueMatch[1]).trim();
      if (value) {
        result[label] = value;
      }
    }
  }

  return result;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&rlm;/g, "")
    .replace(/&lrm;/g, "")
    .replace(/&nbsp;/g, " ");
}
