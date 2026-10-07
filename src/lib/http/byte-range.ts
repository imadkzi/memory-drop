const SINGLE_RANGE = /^bytes=(\d+)-(\d*)$/;

/** Accept a single `bytes=start-end` header. Ignore multi-range and malformed values. */
export function singleByteRange(header: string | null): string | null {
  if (!header) return null;
  const match = header.trim().match(SINGLE_RANGE);
  if (!match) return null;

  const start = Number(match[1]);
  const end = match[2] === "" ? null : Number(match[2]);
  if (!Number.isSafeInteger(start) || start < 0) return null;
  if (end !== null && (!Number.isSafeInteger(end) || end < start)) return null;

  return end === null ? `bytes=${start}-` : `bytes=${start}-${end}`;
}
