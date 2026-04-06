import "server-only";
import { redirect } from "next/navigation";
import { getSession } from "./session";
import { prisma } from "./db";

export async function requireAuth() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, currentBookId: true },
  });
  if (!user) redirect("/login");

  return user;
}
