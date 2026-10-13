import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";
import { login } from "../actions";

export const metadata: Metadata = { title: "Log in · Ticked" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;
  const notice =
    error === "confirm"
      ? "That confirmation link didn't work. It may have expired, so try logging in or sign up again."
      : undefined;

  return <AuthForm mode="login" action={login} notice={notice} />;
}
