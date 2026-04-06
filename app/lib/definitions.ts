import * as z from "zod";

// --- Auth schemas ---

export const SignupFormSchema = z.object({
  name: z
    .string()
    .min(2, { error: "名前は2文字以上で入力してください。" })
    .trim(),
  email: z
    .string()
    .email({ message: "有効なメールアドレスを入力してください。" })
    .trim(),
  password: z
    .string()
    .min(8, { error: "パスワードは8文字以上で入力してください。" })
    .trim(),
});

export const LoginFormSchema = z.object({
  email: z
    .string()
    .email({ message: "有効なメールアドレスを入力してください。" })
    .trim(),
  password: z.string().min(1, { error: "パスワードを入力してください。" }),
});

export type FormState =
  | {
      errors?: Record<string, string[] | undefined>;
      message?: string;
    }
  | undefined;

// --- Book schemas ---

export const BookFormSchema = z.object({
  title: z
    .string()
    .min(1, { error: "タイトルを入力してください。" })
    .trim(),
  author: z.string().trim().default(""),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  identifier: z.string().trim().optional().or(z.literal("")),
  format: z.enum(["PAPER", "EBOOK", "AUDIOBOOK"]).optional(),
  publisher: z.string().trim().optional().or(z.literal("")),
  publishedAt: z.string().trim().optional().or(z.literal("")),
  description: z.string().trim().optional().or(z.literal("")),
  status: z.enum(["WANT_TO_READ", "READING", "FINISHED"]).default("WANT_TO_READ"),
  rating: z.coerce.number().int().min(0).max(5).optional().default(0),
  shortReview: z.string().trim().optional().or(z.literal("")),
});

export const AmazonUrlSchema = z.object({
  url: z
    .string()
    .url({ message: "有効なURLを入力してください。" })
    .refine(
      (url) => {
        try {
          const parsed = new URL(url);
          return (
            parsed.hostname.includes("amazon.co.jp") ||
            parsed.hostname.includes("amazon.com")
          );
        } catch {
          return false;
        }
      },
      { message: "AmazonのURLを入力してください。" }
    ),
});

// --- Note schemas ---

export const NoteFormSchema = z.object({
  bookId: z.string().optional().or(z.literal("")),
  body: z.string().min(1, { error: "メモ本文を入力してください。" }),
  quoteText: z.string().optional().or(z.literal("")),
  locationInfo: z.string().optional().or(z.literal("")),
  actionItems: z.string().optional().or(z.literal("")),
  importance: z.coerce.number().int().min(0).max(3).optional().default(0),
});
