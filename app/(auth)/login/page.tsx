"use client";

import { useActionState } from "react";
import { login, signup } from "@/app/actions/auth";
import { useState } from "react";

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [loginState, loginAction, loginPending] = useActionState(
    login,
    undefined
  );
  const [signupState, signupAction, signupPending] = useActionState(
    signup,
    undefined
  );

  const state = isSignup ? signupState : loginState;
  const action = isSignup ? signupAction : loginAction;
  const pending = isSignup ? signupPending : loginPending;

  const errors = state?.errors as
    | Record<string, string[] | undefined>
    | undefined;

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-white px-4">
      {/* Brand */}
      <div className="mb-10 text-center">
        <h1 className="font-[family-name:var(--font-noto-serif-jp)] text-3xl font-bold tracking-tight text-[#1a1a1a]">
          ReadDo
        </h1>
        <p className="mt-2 text-[13px] text-[#9ca3af] tracking-wide">
          読書中に浮かんだ思考を逃さず記録する
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-[#e5e7eb] p-7">
          <h2 className="text-[15px] font-semibold text-[#1a1a1a] mb-6">
            {isSignup ? "アカウント作成" : "ログイン"}
          </h2>

          <form action={action} className="space-y-5">
            {isSignup && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-[11px] font-medium text-[#9ca3af] uppercase tracking-wider mb-1.5"
                >
                  名前
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  className="block w-full px-3.5 py-2.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-sm text-[#1a1a1a] placeholder-[#c4c4c4] focus:outline-none focus:border-[#9ca3af] transition-colors"
                />
                {errors?.name && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.name[0]}
                  </p>
                )}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-[11px] font-medium text-[#9ca3af] uppercase tracking-wider mb-1.5"
              >
                メールアドレス
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                className="block w-full px-3.5 py-2.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-sm text-[#1a1a1a] placeholder-[#c4c4c4] focus:outline-none focus:border-[#9ca3af] transition-colors"
              />
              {errors?.email && (
                <p className="mt-1.5 text-xs text-red-500">
                  {errors.email[0]}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[11px] font-medium text-[#9ca3af] uppercase tracking-wider mb-1.5"
              >
                パスワード
              </label>
              <input
                type="password"
                name="password"
                id="password"
                required
                autoComplete={isSignup ? "new-password" : "current-password"}
                className="block w-full px-3.5 py-2.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-sm text-[#1a1a1a] placeholder-[#c4c4c4] focus:outline-none focus:border-[#9ca3af] transition-colors"
              />
              {errors?.password && (
                <p className="mt-1.5 text-xs text-red-500">
                  {errors.password[0]}
                </p>
              )}
            </div>

            {state?.message && (
              <p className="text-xs text-red-500">{state.message}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full py-2.5 rounded-lg text-[13px] font-semibold text-white bg-[#1a1a1a] hover:bg-[#374151] transition-colors disabled:opacity-40"
            >
              {pending
                ? "処理中..."
                : isSignup
                  ? "アカウントを作成"
                  : "ログイン"}
            </button>
          </form>
        </div>

        {/* Toggle */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => setIsSignup(!isSignup)}
            className="text-[12px] text-[#9ca3af] hover:text-[#1a1a1a] transition-colors"
          >
            {isSignup
              ? "既にアカウントをお持ちですか？ログイン"
              : "アカウントをお持ちでないですか？新規登録"}
          </button>
        </div>
      </div>
    </div>
  );
}
