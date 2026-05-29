import { describe, it, expect } from "vitest";
import { BundledTemplateRegistry } from "@/infra/templates/bundled-template-registry.js";

const registry = new BundledTemplateRegistry();

describe("BundledTemplateRegistry", () => {
  it("should return the crash template", async () => {
    const template = await registry.getTemplate("crash");
    expect(template.id).toBe("crash");
    expect(template.frames.idle.length).toBeGreaterThanOrEqual(2);
    expect(template.frames.talking.length).toBeGreaterThanOrEqual(2);
  });

  it("should return the generic-dev template", async () => {
    const template = await registry.getTemplate("generic-dev");
    expect(template.id).toBe("generic-dev");
  });

  it("should throw for an unknown species", async () => {
    await expect(registry.getTemplate("unknown-species")).rejects.toThrow("Unknown species");
  });

  it("should list all available species", async () => {
    const list = await registry.listAvailable();
    const ids = list.map((s) => s.id);
    expect(ids).toContain("crash");
    expect(ids).toContain("generic-dev");
  });

  it("should resolve prefetch without error", async () => {
    await expect(registry.prefetch("crash")).resolves.toBeUndefined();
  });
});
