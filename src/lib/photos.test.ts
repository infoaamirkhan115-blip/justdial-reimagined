import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ sign: vi.fn(), deliver: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { storage: { from: () => ({ createSignedUrls: mocks.sign }) } } }));
vi.mock("./photos.functions", () => ({ getPublishedPhotoUrls: mocks.deliver }));
import { photoUrls } from "./photos";

const path = "eae5a35a-4c50-40e2-a17c-58c9ae324e4f/official-noida-20261114-dance-7.jpg";
describe("photo loading resilience", () => {
  beforeEach(() => vi.resetAllMocks());
  it("delivers an imported photo after guest direct signing is denied", async () => {
    mocks.sign.mockResolvedValue({ data: [] });
    mocks.deliver.mockResolvedValue({ [path]: "signed-photo" });
    expect(await photoUrls([path])).toEqual({ [path]: "signed-photo" });
    expect(mocks.deliver).toHaveBeenCalledWith({ data: { paths: [path] } });
  });
  it("does not reject listing loading when photo delivery fails", async () => {
    mocks.sign.mockRejectedValue(new Error("Storage unavailable"));
    mocks.deliver.mockRejectedValue(new Error("Photo delivery unavailable"));
    expect(await photoUrls([path])).toEqual({});
  });
  it("filters an invalid path without poisoning valid photo delivery", async () => {
    mocks.sign.mockResolvedValue({ data: [] });
    mocks.deliver.mockResolvedValue({ [path]: "signed-photo" });
    expect(await photoUrls(["../private.jpg", path])).toEqual({ [path]: "signed-photo" });
    expect(mocks.deliver).toHaveBeenCalledWith({ data: { paths: [path] } });
  });
});