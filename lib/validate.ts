import type { Priority } from "@/lib/types";

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function cleanTitle(value: unknown): string | null {
  const title = String(value ?? "").trim();
  return title.length > 0 && title.length <= 500 ? title : null;
}

/** A YYYY-MM-DD string, or null for "no date". Anything else is rejected. */
export function cleanDate(value: unknown): string | null | undefined {
  if (value === null || value === "") return null;
  const s = String(value ?? "");
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s)) ? s : undefined;
}

export function cleanPriority(value: unknown): Priority | undefined {
  const n = Number(value);
  return n === 0 || n === 1 || n === 2 || n === 3 ? n : undefined;
}

export function cleanTag(value: string): string | null {
  const tag = value.trim().replace(/^#/, "").toLowerCase().replace(/[^\p{L}\p{N}_-]/gu, "");
  return tag.length > 0 && tag.length <= 30 ? tag : null;
}

export function cleanTags(values: unknown): string[] {
  const list = Array.isArray(values) ? values : [];
  const tags = list.map((v) => cleanTag(String(v))).filter((t): t is string => !!t);
  return [...new Set(tags)].slice(0, 10);
}

/** Pulls "#tags" out of a quick-add title: "Buy milk #home" → ["Buy milk", ["home"]]. */
export function extractTags(input: string): { title: string; tags: string[] } {
  const tags: string[] = [];
  const title = input
    .replace(/(^|\s)#([\p{L}\p{N}_-]{1,30})/gu, (_, space: string, tag: string) => {
      tags.push(tag);
      return space;
    })
    .replace(/\s+/g, " ")
    .trim();
  return { title, tags: cleanTags(tags) };
}
