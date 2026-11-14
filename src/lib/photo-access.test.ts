import { describe, expect, it } from "vitest";
import { photoRequestSchema, publishedPhotoPaths } from "./photo-access";

const path = "00000000-0000-4000-8000-000000000001/00000000-0000-4000-8000-000000000002.jpg";
const other = path.replace("002.jpg", "003.jpg");

describe("public photo delivery authorization", () => {
  it("allows only requested photos and logos of approved businesses", () => {
    expect(publishedPhotoPaths([path, path, other], [{ status: "approved", photos: [path], logo: null }], [])).toEqual([path]);
    expect(publishedPhotoPaths([path], [{ status: "approved", photos: [], logo: path }], [])).toEqual([path]);
  });
  it("rejects draft, suspended and unlinked files", () => {
    for (const status of ["pending", "suspended", "rejected"]) {
      expect(publishedPhotoPaths([path], [{ status, photos: [path], logo: path }], [])).toEqual([]);
    }
    expect(publishedPhotoPaths([other], [{ status: "approved", photos: [path], logo: null }], [])).toEqual([]);
  });
  it("requires both offering publication and parent approval", () => {
    for (const [published, status, expected] of [[true, "approved", [path]], [false, "approved", []], [true, "pending", []]] as const) {
      expect(publishedPhotoPaths([path], [], [{ published, photos: [path], businesses: { status } }])).toEqual(expected);
    }
  });
  it("rejects arbitrary URLs, traversal and oversized requests", () => {
    expect(photoRequestSchema.safeParse({ paths: [path] }).success).toBe(true);
    for (const invalid of ["../private.jpg", "https://example.com/photo.jpg", "other-bucket/photo.jpg", path.replace("00000000-0000-4000-8000-000000000002.jpg", "../private.jpg"), path.replace("002.jpg", "002.jpg?token=x")]) {
      expect(photoRequestSchema.safeParse({ paths: [invalid] }).success).toBe(false);
    }
    expect(photoRequestSchema.safeParse({ paths: Array(101).fill(path) }).success).toBe(false);
  });
  it("accepts descriptive official-photo filenames without relaxing approval checks", () => {
    const imported = "eae5a35a-4c50-40e2-a17c-58c9ae324e4f/official-noida-20261114-dance-7.jpg";
    expect(photoRequestSchema.parse({ paths: [imported] }).paths).toEqual([imported]);
    expect(publishedPhotoPaths([imported], [{ status: "approved", photos: [imported], logo: null }], [])).toEqual([imported]);
    expect(publishedPhotoPaths([imported], [], [])).toEqual([]);
  });
});