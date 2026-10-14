"use client";

import { useId, useState } from "react";
import Markdown from "react-markdown";

/** A subtask note: rendered as Markdown, editable in place. Raw HTML is never rendered. */
export default function Note({
  note,
  onSave,
}: {
  note: string | null;
  onSave: (note: string | null) => void;
}) {
  const id = useId();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note ?? "");

  if (editing) {
    return (
      <div className="space-y-2">
        <label className="sr-only" htmlFor={id}>Note</label>
        <textarea
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setEditing(false);
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              onSave(draft.trim() ? draft : null);
              setEditing(false);
            }
          }}
          autoFocus
          rows={Math.min(14, Math.max(4, draft.split("\n").length + 1))}
          maxLength={20000}
          placeholder={"Write anything. Markdown works: **bold**, - lists, [links](https://…)"}
          className="field resize-y text-[0.875rem] leading-relaxed"
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              onSave(draft.trim() ? draft : null);
              setEditing(false);
            }}
            className="btn btn-sm"
          >
            Save note
          </button>
          <button type="button" onClick={() => setEditing(false)} className="btn-quiet">Cancel</button>
          <span className="ml-auto hidden text-[0.75rem] text-faint sm:block">Ctrl + Enter to save</span>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <button
        type="button"
        onClick={() => {
          setDraft("");
          setEditing(true);
        }}
        className="btn-quiet -ml-2.5"
      >
        Add a note
      </button>
    );
  }

  return (
    <div>
      <div className="note-body rounded-md bg-side px-3 py-2.5 text-[0.875rem]">
        <Markdown>{note}</Markdown>
      </div>
      <button
        type="button"
        onClick={() => {
          setDraft(note);
          setEditing(true);
        }}
        className="btn-quiet -ml-2.5 mt-1"
      >
        Edit note
      </button>
    </div>
  );
}
