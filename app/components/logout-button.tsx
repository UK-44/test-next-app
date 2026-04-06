"use client";

import { logout } from "@/app/actions/auth";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="w-full py-2.5 text-[13px] text-[#9ca3af] bg-[#f3f4f6] rounded-xl hover:text-red-500 hover:bg-red-50 transition-colors"
      >
        ログアウト
      </button>
    </form>
  );
}
