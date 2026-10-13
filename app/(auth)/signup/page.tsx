import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";
import { signup } from "../actions";

export const metadata: Metadata = { title: "Sign up · Ticked" };

export default function SignupPage() {
  return <AuthForm mode="signup" action={signup} />;
}
