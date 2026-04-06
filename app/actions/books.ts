"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/db";
import { requireAuth } from "@/app/lib/auth-guard";
import { BookFormSchema, FormState } from "@/app/lib/definitions";

export async function createBook(state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireAuth();

  const validatedFields = BookFormSchema.safeParse({
    title: formData.get("title"),
    author: formData.get("author"),
    coverImageUrl: formData.get("coverImageUrl"),
    identifier: formData.get("identifier"),
    format: formData.get("format") || undefined,
    publisher: formData.get("publisher"),
    publishedAt: formData.get("publishedAt"),
    description: formData.get("description"),
    status: formData.get("status") || "WANT_TO_READ",
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const data = validatedFields.data;

  // Check duplicate by identifier
  if (data.identifier) {
    const existing = await prisma.book.findUnique({
      where: {
        userId_identifier: {
          userId: user.id,
          identifier: data.identifier,
        },
      },
    });
    if (existing) {
      return { message: "この本は既に登録されています。" };
    }
  }

  const book = await prisma.book.create({
    data: {
      userId: user.id,
      title: data.title,
      author: data.author,
      coverImageUrl: data.coverImageUrl || null,
      identifier: data.identifier || null,
      format: data.format ?? null,
      publisher: data.publisher || null,
      publishedAt: data.publishedAt || null,
      description: data.description || null,
      status: data.status,
      startedAt: data.status === "READING" ? new Date() : null,
    },
  });

  revalidatePath("/books");
  revalidatePath("/");
  redirect(`/books/${book.id}`);
}

export async function updateBook(
  bookId: string,
  state: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireAuth();

  const book = await prisma.book.findFirst({
    where: { id: bookId, userId: user.id },
  });
  if (!book) return { message: "本が見つかりません。" };

  const validatedFields = BookFormSchema.safeParse({
    title: formData.get("title"),
    author: formData.get("author"),
    coverImageUrl: formData.get("coverImageUrl"),
    identifier: formData.get("identifier"),
    format: formData.get("format") || undefined,
    publisher: formData.get("publisher"),
    publishedAt: formData.get("publishedAt"),
    description: formData.get("description"),
    status: formData.get("status") || book.status,
    rating: formData.get("rating"),
    shortReview: formData.get("shortReview"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const data = validatedFields.data;

  const updateData: Record<string, unknown> = {
    title: data.title,
    author: data.author,
    coverImageUrl: data.coverImageUrl || null,
    identifier: data.identifier || null,
    format: data.format ?? null,
    publisher: data.publisher || null,
    publishedAt: data.publishedAt || null,
    description: data.description || null,
    status: data.status,
    rating: data.rating || null,
    shortReview: data.shortReview || null,
  };

  if (data.status === "READING" && book.status !== "READING") {
    updateData.startedAt = new Date();
  }
  if (data.status === "FINISHED" && book.status !== "FINISHED") {
    updateData.finishedAt = new Date();
  }

  await prisma.book.update({
    where: { id: bookId },
    data: updateData,
  });

  revalidatePath(`/books/${bookId}`);
  revalidatePath("/books");
  revalidatePath("/");
  redirect(`/books/${bookId}`);
}

export async function updateBookStatus(bookId: string, status: string) {
  const user = await requireAuth();

  const book = await prisma.book.findFirst({
    where: { id: bookId, userId: user.id },
  });
  if (!book) return;

  const updateData: Record<string, unknown> = { status };
  if (status === "READING" && book.status !== "READING") {
    updateData.startedAt = new Date();
  }
  if (status === "FINISHED" && book.status !== "FINISHED") {
    updateData.finishedAt = new Date();
  }

  await prisma.book.update({
    where: { id: bookId },
    data: updateData,
  });

  revalidatePath(`/books/${bookId}`);
  revalidatePath("/books");
  revalidatePath("/");
}

export async function updateBookReview(
  bookId: string,
  rating: number | null,
  shortReview: string
) {
  const user = await requireAuth();

  await prisma.book.updateMany({
    where: { id: bookId, userId: user.id },
    data: { rating, shortReview: shortReview || null },
  });

  revalidatePath(`/books/${bookId}`);
}

export async function deleteBook(bookId: string) {
  const user = await requireAuth();

  await prisma.book.deleteMany({
    where: { id: bookId, userId: user.id },
  });

  revalidatePath("/books");
  revalidatePath("/");
  redirect("/books");
}
