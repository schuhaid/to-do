"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthState } from "@/app/(auth)/actions";
import Icon from "@/components/Icon";

type Props = {
  mode: "login" | "signup";
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
  notice?: string;
};

const copy = {
  login: {
    title: "Welcome back",
    intro: "Log in to see your tasks.",
    submit: "Log in",
    pending: "Logging in…",
    switchText: "New here?",
    switchLink: "Create an account",
    switchHref: "/signup",
    passwordAutocomplete: "current-password",
  },
  signup: {
    title: "Create your account",
    intro: "Your list is private. Only you can see it.",
    submit: "Create account",
    pending: "Creating account…",
    switchText: "Already have an account?",
    switchLink: "Log in",
    switchHref: "/login",
    passwordAutocomplete: "new-password",
  },
} as const;

export default function AuthForm({ mode, action, notice }: Props) {
  const [state, formAction, pending] = useActionState(action, null);
  const t = copy[mode];

  if (state?.message) {
    return (
      <div className="space-y-3">
        <h1 className="page-title">Check your inbox</h1>
        <p className="text-muted">{state.message}</p>
        <Link href="/login" className="btn-outline mt-4 w-full">Back to log in</Link>
      </div>
    );
  }

  const error = state?.error ?? notice;

  return (
    <form action={formAction} className="space-y-5">
      <div className="mb-8 space-y-2">
        <h1 className="page-title">{t.title}</h1>
        <p className="text-[1.0625rem] font-light text-muted">{t.intro}</p>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-semibold">Email</span>
        <input name="email" type="email" required autoComplete="email" className="field" />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-semibold">Password</span>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete={t.passwordAutocomplete}
          className="field"
        />
        {mode === "signup" && (
          <span className="block text-sm text-muted">At least 6 characters.</span>
        )}
      </label>

      {error && (
        <p role="alert" className="flex gap-2.5 rounded-[10px] border border-danger/25 bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
          <Icon name="alert" className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn w-full">
        {pending ? t.pending : t.submit}
      </button>

      <p className="border-t border-line pt-5 text-center text-sm text-muted">
        {t.switchText}{" "}
        <Link href={t.switchHref} className="link">{t.switchLink}</Link>
      </p>
    </form>
  );
}
