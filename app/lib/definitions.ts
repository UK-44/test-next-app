import * as z from "zod";

export const SignupFormSchema = z.object({
  name: z
    .string()
    .min(2, { error: "名前は2文字以上で入力してください。" })
    .trim(),
  email: z
    .string()
    .email({ message: "有効なメールアドレスを入力してください。" })
    .trim(),
  password: z
    .string()
    .min(8, { error: "パスワードは8文字以上で入力してください。" })
    .trim(),
});

export const LoginFormSchema = z.object({
  email: z
    .string()
    .email({ message: "有効なメールアドレスを入力してください。" })
    .trim(),
  password: z.string().min(1, { error: "パスワードを入力してください。" }),
});

export type FormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;
