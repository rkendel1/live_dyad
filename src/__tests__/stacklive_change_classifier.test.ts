import { describe, it, expect } from "vitest";
import { classifyChange } from "../../stacklive/dev/change-classifier";

describe("change-classifier", () => {
  describe("classifyChange", () => {
    it("should classify manifest files", () => {
      expect(
        classifyChange("src/creator/components/my-component.manifest.ts"),
      ).toBe("manifest");
      expect(classifyChange("path/to/file.manifest.ts")).toBe("manifest");
    });

    it("should classify variants files", () => {
      expect(
        classifyChange("src/creator/components/my-component.variants.json"),
      ).toBe("variants");
      expect(classifyChange("path/to/file.variants.json")).toBe("variants");
    });

    it("should classify embed component files", () => {
      expect(classifyChange("public/embed-components/button.svelte")).toBe(
        "embed",
      );
      expect(
        classifyChange("public/embed-components/deep/nested/file.ts"),
      ).toBe("embed");
    });

    it("should return unknown for unrelated files", () => {
      expect(classifyChange("src/main.ts")).toBe("unknown");
      expect(classifyChange("package.json")).toBe("unknown");
      expect(classifyChange("README.md")).toBe("unknown");
    });
  });
});
