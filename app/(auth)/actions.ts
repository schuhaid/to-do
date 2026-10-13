"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string } | null;

function readCredentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const { email, password } = readCredentials(formData);
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.code === "email_not_confirmed") {
      return { error: "Confirm your email first. The link is in your inbox." };
    }
    return { error: "Wrong email or password." };
  }

  revalidatePath("/", "layout");
  redirect("/todos");
}

export async function signup(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const { email, password } = readCredentials(formData);
  if (password.length < 6) {
    return { error: "Use at least 6 characters for your password." };
  }

  const h = await headers();
  const origin =
    h.get("origin") ?? `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/confirm` },
  });

  if (error) {
    if (error.code === "user_already_exists") {
      return { error: "An account with this email already exists. Log in instead." };
    }
    if (error.code === "over_email_send_rate_limit") {
      return { error: "Too many sign-ups right now. Try again in an hour." };
    }
    return { error: error.message };
  }

  // "Confirm email" is off in Supabase: the user is logged in right away.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/todos");
  }

  // "Confirm email" is on: the user has to click the link first.
  return { message: `We sent a confirmation link to ${email}. Open it to finish signing up.` };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
