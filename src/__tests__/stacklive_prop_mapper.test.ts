import { describe, it, expect } from "vitest";
import { mapProps } from "../../stacklive/dyad-to-embed/prop-mapper";

describe("mapProps", () => {
  describe("basic prop mapping", () => {
    it("should map props with all fields", () => {
      const props = [
        {
          name: "title",
          type: "string",
          default: "Hello",
        },
        {
          name: "count",
          type: "number",
          default: 0,
        },
      ];

      const result = mapProps(props);

      expect(result).toEqual([
        { name: "title", type: "string", default: "Hello" },
        { name: "count", type: "number", default: 0 },
      ]);
    });

    it("should default to 'any' type when type is missing", () => {
      const props = [
        {
          name: "data",
        },
      ];

      const result = mapProps(props);

      expect(result).toEqual([
        { name: "data", type: "any", default: undefined },
      ]);
    });

    it("should handle props with undefined default", () => {
      const props = [
        {
          name: "optional",
          type: "string",
        },
      ];

      const result = mapProps(props);

      expect(result).toEqual([
        { name: "optional", type: "string", default: undefined },
      ]);
    });

    it("should handle empty array", () => {
      const result = mapProps([]);
      expect(result).toEqual([]);
    });

    it("should handle undefined input", () => {
      const result = mapProps(undefined);
      expect(result).toEqual([]);
    });
  });

  describe("complex prop types", () => {
    it("should handle complex object types", () => {
      const props = [
        {
          name: "config",
          type: "object",
          default: { enabled: true },
        },
      ];

      const result = mapProps(props);

      expect(result).toEqual([
        { name: "config", type: "object", default: { enabled: true } },
      ]);
    });

    it("should handle array types", () => {
      const props = [
        {
          name: "items",
          type: "array",
          default: [],
        },
      ];

      const result = mapProps(props);

      expect(result).toEqual([{ name: "items", type: "array", default: [] }]);
    });

    it("should handle boolean types", () => {
      const props = [
        {
          name: "isActive",
          type: "boolean",
          default: false,
        },
      ];

      const result = mapProps(props);

      expect(result).toEqual([
        { name: "isActive", type: "boolean", default: false },
      ]);
    });

    it("should handle function types", () => {
      const props = [
        {
          name: "onClick",
          type: "function",
        },
      ];

      const result = mapProps(props);

      expect(result).toEqual([
        { name: "onClick", type: "function", default: undefined },
      ]);
    });
  });

  describe("multiple props", () => {
    it("should handle many props", () => {
      const props = [
        { name: "prop1", type: "string", default: "a" },
        { name: "prop2", type: "number", default: 1 },
        { name: "prop3", type: "boolean", default: true },
        { name: "prop4", type: "array", default: [] },
        { name: "prop5", type: "object", default: {} },
      ];

      const result = mapProps(props);

      expect(result).toHaveLength(5);
      expect(result[0].name).toBe("prop1");
      expect(result[4].name).toBe("prop5");
    });
  });

  describe("edge cases", () => {
    it("should handle props with null values", () => {
      const props = [
        {
          name: "nullable",
          type: "string",
          default: null,
        },
      ];

      const result = mapProps(props);

      expect(result).toEqual([
        { name: "nullable", type: "string", default: null },
      ]);
    });

    it("should handle props with empty string default", () => {
      const props = [
        {
          name: "text",
          type: "string",
          default: "",
        },
      ];

      const result = mapProps(props);

      expect(result).toEqual([{ name: "text", type: "string", default: "" }]);
    });

    it("should handle props with zero as default", () => {
      const props = [
        {
          name: "count",
          type: "number",
          default: 0,
        },
      ];

      const result = mapProps(props);

      expect(result).toEqual([{ name: "count", type: "number", default: 0 }]);
    });
  });
});
