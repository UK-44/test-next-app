"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/db";
import { requireAuth } from "@/app/lib/auth-guard";
import { NoteFormSchema, FormState } from "@/app/lib/definitions";

export async function createNote(state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireAuth();

  const validatedFields = NoteFormSchema.safeParse({
    bookId: formData.get("bookId"),
    body: formData.get("body"),
    quoteText: formData.get("quoteText"),
    locationInfo: formData.get("locationInfo"),
    actionItems: formData.get("actionItems"),
    importance: formData.get("importance"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const data = validatedFields.data;

  const note = await prisma.note.create({
    data: {
      userId: user.id,
      bookId: data.bookId || null,
      body: data.body,
      quoteText: data.quoteText || null,
      locationInfo: data.locationInfo || null,
      actionItems: data.actionItems || null,
      importance: data.importance ?? 0,
    },
  });

  // Redirect back to book detail if bookId, otherwise to the new note
  if (data.bookId) {
    redirect(`/books/${data.bookId}`);
  }
  redirect(`/notes/${note.id}`);
}

export async function updateNote(
  noteId: string,
  state: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireAuth();

  const note = await prisma.note.findFirst({
    where: { id: noteId, userId: user.id },
  });
  if (!note) return { message: "メモが見つかりません。" };

  const validatedFields = NoteFormSchema.safeParse({
    bookId: formData.get("bookId"),
    body: formData.get("body"),
    quoteText: formData.get("quoteText"),
    locationInfo: formData.get("locationInfo"),
    actionItems: formData.get("actionItems"),
    importance: formData.get("importance"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const data = validatedFields.data;

  const updated = await prisma.note.update({
    where: { id: noteId },
    data: {
      bookId: data.bookId || null,
      body: data.body,
      quoteText: data.quoteText || null,
      locationInfo: data.locationInfo || null,
      actionItems: data.actionItems || null,
      importance: data.importance ?? 0,
    },
  });

  if (updated.bookId) {
    redirect(`/books/${updated.bookId}`);
  }
  redirect("/?tab=memo");
}

export async function deleteNote(noteId: string) {
  const user = await requireAuth();

  const note = await prisma.note.findFirst({
    where: { id: noteId, userId: user.id },
  });
  if (!note) return;

  const bookId = note.bookId;
  await prisma.note.delete({ where: { id: noteId } });

  if (bookId) {
    redirect(`/books/${bookId}`);
  }
  redirect("/?tab=memo");
}
