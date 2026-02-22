import { describe, it, expect } from "vitest";
import {
  isStackLiveTarget,
  getTargetLabel,
  getComponentTypeLabel,
  DEFAULT_STACKLIVE_CONFIG,
} from "../lib/stacklive-generation-target";

describe("stacklive-generation-target", () => {
  describe("isStackLiveTarget", () => {
    it("should return true for stacklive-legacy-embed", () => {
      expect(isStackLiveTarget("stacklive-legacy-embed")).toBe(true);
    });

    it("should return true for stacklive-runtime-embed", () => {
      expect(isStackLiveTarget("stacklive-runtime-embed")).toBe(true);
    });

    it("should return true for stacklive-creator-manifest", () => {
      expect(isStackLiveTarget("stacklive-creator-manifest")).toBe(true);
    });
  });

  describe("getTargetLabel", () => {
    it("should return correct label for legacy embed", () => {
      expect(getTargetLabel("stacklive-legacy-embed")).toBe("Legacy Embed");
    });

    it("should return correct label for runtime embed", () => {
      expect(getTargetLabel("stacklive-runtime-embed")).toBe("Runtime Embed");
    });

    it("should return correct label for creator manifest", () => {
      expect(getTargetLabel("stacklive-creator-manifest")).toBe(
        "Creator Manifest",
      );
    });
  });

  describe("getComponentTypeLabel", () => {
    it("should return correct label for primitive", () => {
      expect(getComponentTypeLabel("primitive")).toBe("Primitive");
    });

    it("should return correct label for system", () => {
      expect(getComponentTypeLabel("system")).toBe("System");
    });

    it("should return correct label for experience", () => {
      expect(getComponentTypeLabel("experience")).toBe("Experience");
    });
  });

  describe("DEFAULT_STACKLIVE_CONFIG", () => {
    it("should have expected default values", () => {
      expect(DEFAULT_STACKLIVE_CONFIG).toEqual({
        target: "stacklive-legacy-embed",
        componentType: "primitive",
        hasVariants: false,
      });
    });

    it("should be a valid StackLive target", () => {
      expect(isStackLiveTarget(DEFAULT_STACKLIVE_CONFIG.target)).toBe(true);
    });
  });
});
