"use server";

import { cookies } from "next/headers";
import { getUser } from "@/lib/data";

export type FeedbackState = { ok?: boolean; error?: string } | null;

const COOLDOWN_COOKIE = "feedback_sent_at";
const COOLDOWN_MS = 30_000;

/**
 * Emails feedback to the app owner via Resend (https://resend.com).
 * Needs RESEND_API_KEY and FEEDBACK_TO_EMAIL; both stay on the server.
 */
export async function sendFeedback(_prev: FeedbackState, formData: FormData): Promise<FeedbackState> {
  const subject = String(formData.get("subject") ?? "").trim().slice(0, 120);
  const message = String(formData.get("message") ?? "").trim().slice(0, 5000);
  if (!subject) return { error: "Add a short subject." };
  if (message.length < 3) return { error: "Write a message before sending." };

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.FEEDBACK_TO_EMAIL;
  if (!apiKey || !to) {
    return { error: "Feedback isn't set up on this server yet. Please tell the developer directly." };
  }

  // Only logged-in users can send, with a short cooldown against accidental double sends.
  const { user } = await getUser();
  const jar = await cookies();
  const last = Number(jar.get(COOLDOWN_COOKIE)?.value ?? 0);
  if (Date.now() - last < COOLDOWN_MS) {
    return { error: "You just sent feedback. Wait a few seconds before sending more." };
  }

  const from = process.env.FEEDBACK_FROM_EMAIL || "Ticked Feedback <onboarding@resend.dev>";
  const text = [
    message,
    "",
    "—",
    `From: ${user.email ?? "unknown"} (${user.id})`,
    `Sent: ${new Date().toISOString()}`,
  ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    // Plain text only, so nothing a user types can be rendered as HTML.
    body: JSON.stringify({
      from,
      to: [to],
      subject: `[Ticked feedback] ${subject}`,
      text,
      ...(user.email ? { reply_to: user.email } : {}),
    }),
  }).catch(() => null);

  if (!res || !res.ok) {
    console.error("Feedback email failed", res?.status, await res?.text().catch(() => ""));
    return { error: "Couldn't send your feedback. Try again in a minute." };
  }

  jar.set(COOLDOWN_COOKIE, String(Date.now()), { httpOnly: true, sameSite: "lax", maxAge: 60, path: "/" });
  return { ok: true };
}
