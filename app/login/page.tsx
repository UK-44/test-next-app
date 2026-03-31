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
    <div className="flex min-h-full items-center justify-center">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">
          {isSignup ? "アカウント作成" : "ログイン"}
        </h1>

        <form action={action} className="space-y-4">
          {isSignup && (
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                名前
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                className="text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors?.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name[0]}
                </p>
              )}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              メールアドレス
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              className="text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {errors?.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email[0]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              パスワード
            </label>
            <input
              type="password"
              name="password"
              id="password"
              required
              className="text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {errors?.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password[0]}
              </p>
            )}
          </div>

          {state?.message && (
            <p className="text-sm text-red-600">{state.message}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {pending
              ? "処理中..."
              : isSignup
                ? "アカウントを作成"
                : "ログイン"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsSignup(!isSignup)}
            className="text-sm text-indigo-600 hover:text-indigo-500"
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
