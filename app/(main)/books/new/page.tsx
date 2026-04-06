import { BookForm } from "@/app/components/book-form";

export default function NewBookPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-[#2c2416] mb-6">本を登録</h1>
      <BookForm />
    </div>
  );
}
