import { requireAuth } from "@/app/lib/auth-guard";
import { FooterNav } from "@/app/components/footer-nav";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  return (
    <div className="min-h-full flex flex-col md:pl-56">
      <main className="flex-1 px-4 py-5 pb-24 max-w-2xl mx-auto w-full">
        {children}
      </main>
      <FooterNav userName={user.name ?? ""} />
    </div>
  );
}
