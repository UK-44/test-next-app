"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/db";
import { getSession } from "@/app/lib/session";

export async function updateCurrentBook(_prevState: unknown, formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const bookId = formData.get("currentBookId") as string;

  await prisma.user.update({
    where: { id: session.userId },
    data: { currentBookId: bookId || null },
  });

  revalidatePath("/settings");
}
