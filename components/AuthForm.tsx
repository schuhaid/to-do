"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthState } from "@/app/(auth)/actions";

type Props = {
  mode: "login" | "signup";
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
  notice?: string;
};

const copy = {
  login: {
    title: "Log in",
    submit: "Log in",
    pending: "Logging in…",
    switchText: "New here?",
    switchLink: "Create an account",
    switchHref: "/signup",
    passwordAutocomplete: "current-password",
  },
  signup: {
    title: "Create your account",
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
        <h1 className="font-display text-3xl font-semibold tracking-tight">Check your inbox</h1>
        <p className="text-muted">{state.message}</p>
        <Link href="/login" className="link">Back to log in</Link>
      </div>
    );
  }

  const error = state?.error ?? notice;

  return (
    <form action={formAction} className="space-y-5">
      <h1 className="font-display text-3xl font-semibold tracking-tight">{t.title}</h1>

      <label className="block space-y-1.5">
        <span className="text-sm font-bold">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="field"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-bold">Password</span>
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
        <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn w-full">
        {pending ? t.pending : t.submit}
      </button>

      <p className="text-sm text-muted">
        {t.switchText}{" "}
        <Link href={t.switchHref} className="link">{t.switchLink}</Link>
      </p>
    </form>
  );
}
