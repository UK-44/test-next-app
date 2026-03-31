import { redirect } from "next/navigation";
import { getSession } from "@/app/lib/session";
import { prisma } from "@/app/lib/db";
import { logout } from "@/app/actions/auth";

export default async function Home() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-full items-center justify-center">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">トップページ</h1>

        <div className="space-y-3">
          <p className="text-gray-700">
            <span className="font-medium">名前:</span> {user.name}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">メール:</span> {user.email}
          </p>
        </div>

        <form action={logout} className="mt-6">
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            ログアウト
          </button>
        </form>
      </div>
    </div>
  );
}
