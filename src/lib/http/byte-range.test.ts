import { describe, expect, it } from "vitest";
import { singleByteRange } from "@/lib/http/byte-range";

describe("singleByteRange", () => {
  it("keeps an open-ended range", () => {
    expect(singleByteRange("bytes=0-")).toBe("bytes=0-");
  });

  it("keeps a closed range", () => {
    expect(singleByteRange("bytes=100-199")).toBe("bytes=100-199");
  });

  it("rejects multi-range and inverted ranges", () => {
    expect(singleByteRange("bytes=0-1,5-6")).toBeNull();
    expect(singleByteRange("bytes=20-10")).toBeNull();
    expect(singleByteRange("bytes=-100")).toBeNull();
    expect(singleByteRange(null)).toBeNull();
  });
});
