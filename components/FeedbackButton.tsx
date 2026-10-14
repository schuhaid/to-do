"use client";

import { useActionState, useId, useRef, useState } from "react";
import { sendFeedback, type FeedbackState } from "@/app/feedback/actions";
import Icon from "./Icon";

/** "sidebar": full-width nav item (desktop). "compact": small button for the phone top bar. */
export default function FeedbackButton({ variant = "sidebar" }: { variant?: "sidebar" | "compact" }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // A new key each time the dialog opens gives a fresh, empty form.
  const [session, setSession] = useState(0);
  const titleId = useId();

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setSession((n) => n + 1);
          dialogRef.current?.showModal();
        }}
        className={
          variant === "sidebar"
            ? "flex min-h-11 w-full items-center gap-3 rounded-[10px] px-3 text-[15px] font-semibold text-muted transition-colors duration-150 hover:bg-hover hover:text-ink"
            : "btn-quiet min-h-11"
        }
        title="Send feedback to the developer"
      >
        <Icon name="message" className={variant === "sidebar" ? "size-5" : "size-[18px]"} />
        {variant === "sidebar" ? <span className="flex-1 text-left">Feedback</span> : "Feedback"}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClick={(e) => e.target === dialogRef.current && dialogRef.current?.close()}
        className="panel m-auto w-[calc(100%-2rem)] max-w-md p-0 text-ink backdrop:bg-[var(--overlay)]"
      >
        <FeedbackForm key={session} titleId={titleId} onClose={() => dialogRef.current?.close()} />
      </dialog>
    </>
  );
}

function FeedbackForm({ titleId, onClose }: { titleId: string; onClose: () => void }) {
  const [state, action, pending] = useActionState<FeedbackState, FormData>(sendFeedback, null);

  return state?.ok ? (
    <div className="p-6 text-center">
      <div className="mx-auto mb-3 grid size-10 place-items-center rounded-full bg-accent-soft text-accent">
        <svg viewBox="0 0 16 16" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3.5 8.5l3 3 6-7" />
        </svg>
      </div>
      <h2 id={titleId} className="text-lg font-bold tracking-tight">Feedback sent</h2>
      <p className="mt-1 text-sm text-muted">Thanks! The developer will read it and may reply by email.</p>
      <button type="button" onClick={onClose} className="btn mt-5 w-full">
        Close
      </button>
    </div>
  ) : (
    <form action={action} className="space-y-4 p-6">
      <div>
        <h2 id={titleId} className="text-lg font-bold tracking-tight">Send feedback</h2>
        <p className="text-sm text-muted">Found a bug or have an idea? It goes straight to the developer.</p>
      </div>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Subject</span>
        <input name="subject" required maxLength={120} placeholder="e.g. Graph is hard to read on mobile" className="field" />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Message</span>
        <textarea
          name="message"
          required
          minLength={3}
          maxLength={5000}
          rows={6}
          placeholder="What happened, or what would you like to see?"
          className="field resize-y"
        />
      </label>
      {state?.error && (
        <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">{state.error}</p>
      )}
      <div className="flex items-center justify-end gap-2 pt-1">
        <button type="button" onClick={onClose} className="btn-quiet">
          Cancel
        </button>
        <button type="submit" disabled={pending} className="btn">
          <Icon name="send" className="size-4" />
          {pending ? "Sending…" : "Send feedback"}
        </button>
      </div>
    </form>
  );
}
