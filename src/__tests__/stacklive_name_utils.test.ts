import { describe, it, expect } from "vitest";
import { toNames } from "../../stacklive/dyad-to-embed/name-utils";

describe("toNames", () => {
  describe("naming convention conversions", () => {
    it("should convert snake_case to all naming conventions", () => {
      const result = toNames("my_component");
      expect(result).toEqual({
        kebab: "my-component",
        pascal: "MyComponent",
        snake: "my_component",
      });
    });

    it("should handle single word names", () => {
      const result = toNames("button");
      expect(result).toEqual({
        kebab: "button",
        pascal: "Button",
        snake: "button",
      });
    });

    it("should handle multi-word snake_case names", () => {
      const result = toNames("user_profile_card");
      expect(result).toEqual({
        kebab: "user-profile-card",
        pascal: "UserProfileCard",
        snake: "user_profile_card",
      });
    });

    it("should handle names with numbers", () => {
      const result = toNames("button_v2");
      expect(result).toEqual({
        kebab: "button-v2",
        pascal: "ButtonV2",
        snake: "button_v2",
      });
    });

    it("should handle consecutive underscores", () => {
      const result = toNames("my__component");
      expect(result).toEqual({
        kebab: "my--component",
        pascal: "MyComponent",
        snake: "my__component",
      });
    });

    it("should handle trailing underscores", () => {
      const result = toNames("component_");
      expect(result).toEqual({
        kebab: "component-",
        pascal: "Component",
        snake: "component_",
      });
    });

    it("should handle leading underscores", () => {
      const result = toNames("_component");
      expect(result).toEqual({
        kebab: "-component",
        pascal: "Component",
        snake: "_component",
      });
    });

    it("should preserve case in acronyms correctly", () => {
      const result = toNames("api_endpoint");
      expect(result).toEqual({
        kebab: "api-endpoint",
        pascal: "ApiEndpoint",
        snake: "api_endpoint",
      });
    });
  });

  describe("edge cases", () => {
    it("should handle empty string", () => {
      const result = toNames("");
      expect(result).toEqual({
        kebab: "",
        pascal: "",
        snake: "",
      });
    });

    it("should handle single underscore", () => {
      const result = toNames("_");
      expect(result).toEqual({
        kebab: "-",
        pascal: "",
        snake: "_",
      });
    });

    it("should handle very long component names", () => {
      const longName = "very_long_component_name_with_many_words";
      const result = toNames(longName);
      expect(result.kebab).toBe("very-long-component-name-with-many-words");
      expect(result.pascal).toBe("VeryLongComponentNameWithManyWords");
      expect(result.snake).toBe(longName);
    });
  });
});
