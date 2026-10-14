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
    title: "Log in",
    intro: "Use the email you signed up with.",
    submit: "Log in",
    pending: "Logging in…",
    switchText: "New here?",
    switchLink: "Create an account",
    switchHref: "/signup",
    passwordAutocomplete: "current-password",
  },
  signup: {
    title: "Create an account",
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
      <div>
        <h1 className="page-title">Check your inbox</h1>
        <p className="mt-2 text-muted">{state.message}</p>
        <Link href="/login" className="btn-outline mt-8 w-full">Back to log in</Link>
      </div>
    );
  }

  const error = state?.error ?? notice;

  return (
    <form action={formAction} className="space-y-4">
      <div className="mb-8">
        <h1 className="page-title">{t.title}</h1>
        <p className="mt-1 text-muted">{t.intro}</p>
      </div>

      <label className="block space-y-1.5">
        <span className="meta font-medium text-ink">Email</span>
        <input name="email" type="email" required autoComplete="email" className="field" />
      </label>

      <label className="block space-y-1.5">
        <span className="meta font-medium text-ink">Password</span>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete={t.passwordAutocomplete}
          className="field"
        />
        {mode === "signup" && (
          <span className="meta block">At least 6 characters.</span>
        )}
      </label>

      {error && (
        <p role="alert" className="meta flex gap-2 text-danger">
          <Icon name="alert" className="mt-[3px] size-3.5 shrink-0" />
          {error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn mt-2 w-full">
        {pending ? t.pending : t.submit}
      </button>

      <p className="meta pt-4">
        {t.switchText}{" "}
        <Link href={t.switchHref} className="link">{t.switchLink}</Link>
      </p>
    </form>
  );
}
