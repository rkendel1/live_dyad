import { describe, it, expect } from "vitest";
import {
  type Versioned,
  createVersionedState,
  isVersionedState,
  getStateVersion,
  extractStateData,
} from "../../stacklive/runtime/state/versionedState";

describe("versionedState", () => {
  describe("createVersionedState", () => {
    it("should create a versioned state object", () => {
      const data = { name: "test", value: 42 };
      const versioned = createVersionedState(2, data);

      expect(versioned).toEqual({
        version: 2,
        data: { name: "test", value: 42 },
      });
    });

    it("should work with different data types", () => {
      const stringState = createVersionedState(1, "hello");
      expect(stringState.data).toBe("hello");
      expect(stringState.version).toBe(1);

      const arrayState = createVersionedState(2, [1, 2, 3]);
      expect(arrayState.data).toEqual([1, 2, 3]);
      expect(arrayState.version).toBe(2);

      const numberState = createVersionedState(3, 123);
      expect(numberState.data).toBe(123);
      expect(numberState.version).toBe(3);
    });
  });

  describe("isVersionedState", () => {
    it("should return true for valid versioned state", () => {
      const versioned: Versioned<any> = {
        version: 1,
        data: { test: "value" },
      };
      expect(isVersionedState(versioned)).toBe(true);
    });

    it("should return false for non-versioned objects", () => {
      expect(isVersionedState({ test: "value" })).toBe(false);
      expect(isVersionedState({ version: 1 })).toBe(false);
      expect(isVersionedState({ data: "test" })).toBe(false);
    });

    it("should return false for primitives", () => {
      expect(isVersionedState(null)).toBe(false);
      expect(isVersionedState(undefined)).toBe(false);
      expect(isVersionedState("string")).toBe(false);
      expect(isVersionedState(123)).toBe(false);
      expect(isVersionedState(true)).toBe(false);
    });

    it("should return false for invalid version type", () => {
      expect(isVersionedState({ version: "1", data: {} })).toBe(false);
      expect(isVersionedState({ version: null, data: {} })).toBe(false);
    });
  });

  describe("getStateVersion", () => {
    it("should return version for versioned state", () => {
      const versioned = createVersionedState(5, { test: "data" });
      expect(getStateVersion(versioned)).toBe(5);
    });

    it("should return 0 for unversioned state", () => {
      expect(getStateVersion({ test: "data" })).toBe(0);
      expect(getStateVersion("string")).toBe(0);
      expect(getStateVersion(null)).toBe(0);
      expect(getStateVersion(undefined)).toBe(0);
    });

    it("should handle various version numbers", () => {
      expect(getStateVersion(createVersionedState(0, {}))).toBe(0);
      expect(getStateVersion(createVersionedState(1, {}))).toBe(1);
      expect(getStateVersion(createVersionedState(100, {}))).toBe(100);
    });
  });

  describe("extractStateData", () => {
    it("should extract data from versioned state", () => {
      const data = { name: "test", value: 42 };
      const versioned = createVersionedState(2, data);

      expect(extractStateData(versioned)).toEqual(data);
    });

    it("should return state as-is if not versioned", () => {
      const data = { name: "test", value: 42 };
      expect(extractStateData(data)).toEqual(data);
    });

    it("should work with different data types", () => {
      expect(extractStateData(createVersionedState(1, "hello"))).toBe("hello");
      expect(extractStateData(createVersionedState(1, [1, 2, 3]))).toEqual([
        1, 2, 3,
      ]);
      expect(extractStateData(createVersionedState(1, null))).toBe(null);
    });

    it("should preserve reference for non-versioned state", () => {
      const data = { name: "test" };
      expect(extractStateData(data)).toBe(data);
    });
  });

  describe("type safety", () => {
    it("should maintain type information", () => {
      type MyState = {
        userId: string;
        count: number;
      };

      const state = createVersionedState<MyState>(1, {
        userId: "123",
        count: 42,
      });

      // TypeScript should enforce the type
      expect(state.data.userId).toBe("123");
      expect(state.data.count).toBe(42);
    });
  });
});
