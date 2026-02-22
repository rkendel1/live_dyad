import { describe, it, expect, beforeEach } from "vitest";
import {
  MigrationRegistry,
  getMigrationRegistry,
  resetMigrationRegistry,
  type Migration,
} from "../../stacklive/runtime/state/migrations";
import { createVersionedState } from "../../stacklive/runtime/state/versionedState";

describe("MigrationRegistry", () => {
  let registry: MigrationRegistry;

  beforeEach(() => {
    registry = new MigrationRegistry();
  });

  describe("register", () => {
    it("should register a migration", () => {
      const migration: Migration = (old) => ({ ...old, newField: "value" });
      registry.register("component-1", 1, 2, migration);

      expect(registry.getMigrations("component-1")).toEqual([
        { fromVersion: 1, toVersion: 2 },
      ]);
    });

    it("should register multiple migrations for the same component", () => {
      registry.register("component-1", 1, 2, (old) => old);
      registry.register("component-1", 2, 3, (old) => old);
      registry.register("component-1", 3, 4, (old) => old);

      expect(registry.getMigrations("component-1")).toHaveLength(3);
    });

    it("should throw error when fromVersion equals toVersion", () => {
      expect(() => {
        registry.register("component-1", 1, 1, (old) => old);
      }).toThrow("Cannot register migration from version 1 to itself");
    });

    it("should throw error for duplicate migration paths", () => {
      registry.register("component-1", 1, 2, (old) => old);

      expect(() => {
        registry.register("component-1", 1, 2, (old) => old);
      }).toThrow("Migration from version 1 to 2 already exists");
    });

    it("should allow same migration versions for different components", () => {
      registry.register("component-1", 1, 2, (old) => old);
      registry.register("component-2", 1, 2, (old) => old);

      expect(registry.getMigrations("component-1")).toHaveLength(1);
      expect(registry.getMigrations("component-2")).toHaveLength(1);
    });
  });

  describe("unregister", () => {
    it("should unregister all migrations for a component", () => {
      registry.register("component-1", 1, 2, (old) => old);
      registry.register("component-1", 2, 3, (old) => old);

      registry.unregister("component-1");

      expect(registry.getMigrations("component-1")).toHaveLength(0);
    });

    it("should not affect other components", () => {
      registry.register("component-1", 1, 2, (old) => old);
      registry.register("component-2", 1, 2, (old) => old);

      registry.unregister("component-1");

      expect(registry.getMigrations("component-1")).toHaveLength(0);
      expect(registry.getMigrations("component-2")).toHaveLength(1);
    });
  });

  describe("unregisterMigration", () => {
    it("should unregister a specific migration", () => {
      registry.register("component-1", 1, 2, (old) => old);
      registry.register("component-1", 2, 3, (old) => old);

      registry.unregisterMigration("component-1", 1, 2);

      const migrations = registry.getMigrations("component-1");
      expect(migrations).toHaveLength(1);
      expect(migrations[0]).toEqual({ fromVersion: 2, toVersion: 3 });
    });

    it("should clean up empty component entries", () => {
      registry.register("component-1", 1, 2, (old) => old);

      registry.unregisterMigration("component-1", 1, 2);

      expect(registry.getComponentIds()).not.toContain("component-1");
    });
  });

  describe("migrate", () => {
    it("should migrate state through single migration", () => {
      type V1 = { name: string };
      type V2 = { name: string; age: number };

      registry.register<V1, V2>("user", 1, 2, (old) => ({
        ...old,
        age: 0,
      }));

      const oldState = createVersionedState<V1>(1, { name: "Alice" });
      const newState = registry.migrate<V2>("user", oldState, 2);

      expect(newState).toEqual({
        version: 2,
        data: { name: "Alice", age: 0 },
      });
    });

    it("should migrate through multiple migrations", () => {
      type V1 = { name: string };
      type V2 = { name: string; age: number };
      type V3 = { fullName: string; age: number };

      registry.register<V1, V2>("user", 1, 2, (old) => ({
        ...old,
        age: 0,
      }));
      registry.register<V2, V3>("user", 2, 3, (old) => ({
        fullName: old.name,
        age: old.age,
      }));

      const v1State = createVersionedState<V1>(1, { name: "Alice" });
      const v3State = registry.migrate<V3>("user", v1State, 3);

      expect(v3State).toEqual({
        version: 3,
        data: { fullName: "Alice", age: 0 },
      });
    });

    it("should handle unversioned state as version 0", () => {
      type V0 = { oldField: string };
      type V1 = { newField: string };

      registry.register<V0, V1>("component", 0, 1, (old) => ({
        newField: old.oldField,
      }));

      const unversionedState = { oldField: "value" };
      const newState = registry.migrate<V1>("component", unversionedState, 1);

      expect(newState).toEqual({
        version: 1,
        data: { newField: "value" },
      });
    });

    it("should return state as-is when already at target version", () => {
      const state = createVersionedState(2, { test: "data" });
      const result = registry.migrate("component", state, 2);

      expect(result).toEqual(state);
    });

    it("should throw error when no migration path exists", () => {
      registry.register("component", 1, 2, (old) => old);

      const state = createVersionedState(1, { test: "data" });

      expect(() => {
        registry.migrate("component", state, 5);
      }).toThrow("No migration path found");
    });

    it("should find shortest migration path", () => {
      // Create a graph with multiple paths from 1 to 3
      // Path 1: 1 -> 2 -> 3
      // Path 2: 1 -> 3 (direct, shorter)
      let pathTaken = "";

      registry.register("component", 1, 2, (old) => {
        pathTaken += "1->2,";
        return old;
      });
      registry.register("component", 2, 3, (old) => {
        pathTaken += "2->3";
        return old;
      });
      registry.register("component", 1, 3, (old) => {
        pathTaken += "1->3";
        return old;
      });

      const state = createVersionedState(1, { test: "data" });
      registry.migrate("component", state, 3);

      // Should use the direct path (BFS finds shortest path first)
      expect(pathTaken).toBe("1->3");
    });
  });

  describe("hasMigrationPath", () => {
    it("should return true when direct migration exists", () => {
      registry.register("component", 1, 2, (old) => old);

      expect(registry.hasMigrationPath("component", 1, 2)).toBe(true);
    });

    it("should return true when indirect migration path exists", () => {
      registry.register("component", 1, 2, (old) => old);
      registry.register("component", 2, 3, (old) => old);

      expect(registry.hasMigrationPath("component", 1, 3)).toBe(true);
    });

    it("should return false when no migration path exists", () => {
      registry.register("component", 1, 2, (old) => old);

      expect(registry.hasMigrationPath("component", 1, 5)).toBe(false);
    });

    it("should return true when fromVersion equals toVersion", () => {
      expect(registry.hasMigrationPath("component", 1, 1)).toBe(true);
    });
  });

  describe("getComponentIds", () => {
    it("should return all registered component IDs", () => {
      registry.register("component-1", 1, 2, (old) => old);
      registry.register("component-2", 1, 2, (old) => old);
      registry.register("component-3", 1, 2, (old) => old);

      const ids = registry.getComponentIds();
      expect(ids).toHaveLength(3);
      expect(ids).toContain("component-1");
      expect(ids).toContain("component-2");
      expect(ids).toContain("component-3");
    });

    it("should return empty array when no components registered", () => {
      expect(registry.getComponentIds()).toEqual([]);
    });
  });

  describe("getMigrations", () => {
    it("should return all migrations for a component", () => {
      registry.register("component", 1, 2, (old) => old);
      registry.register("component", 2, 3, (old) => old);
      registry.register("component", 3, 4, (old) => old);

      const migrations = registry.getMigrations("component");
      expect(migrations).toHaveLength(3);
      expect(migrations).toContainEqual({ fromVersion: 1, toVersion: 2 });
      expect(migrations).toContainEqual({ fromVersion: 2, toVersion: 3 });
      expect(migrations).toContainEqual({ fromVersion: 3, toVersion: 4 });
    });

    it("should return empty array for unknown component", () => {
      expect(registry.getMigrations("unknown")).toEqual([]);
    });

    it("should return readonly array", () => {
      registry.register("component", 1, 2, (old) => old);
      const migrations = registry.getMigrations("component");

      // TypeScript should enforce readonly
      expect(Array.isArray(migrations)).toBe(true);
    });
  });

  describe("clear", () => {
    it("should clear all migrations", () => {
      registry.register("component-1", 1, 2, (old) => old);
      registry.register("component-2", 1, 2, (old) => old);

      registry.clear();

      expect(registry.getComponentIds()).toEqual([]);
      expect(registry.getMigrations("component-1")).toEqual([]);
      expect(registry.getMigrations("component-2")).toEqual([]);
    });
  });

  describe("complex migration scenarios", () => {
    it("should handle branching migration paths", () => {
      // Create a branching structure
      // 1 -> 2
      // 1 -> 3
      // 2 -> 4
      // 3 -> 4
      registry.register("component", 1, 2, (old) => ({ ...old, v2: true }));
      registry.register("component", 1, 3, (old) => ({ ...old, v3: true }));
      registry.register("component", 2, 4, (old) => ({ ...old, v4: true }));
      registry.register("component", 3, 4, (old) => ({ ...old, v4: true }));

      const state = createVersionedState(1, { initial: true });
      const result = registry.migrate("component", state, 4);

      expect(result.version).toBe(4);
      expect(result.data).toHaveProperty("initial", true);
      expect(result.data).toHaveProperty("v4", true);
    });

    it("should preserve data integrity through migrations", () => {
      type V1 = { count: number };
      type V2 = { count: number; doubled: number };
      type V3 = { total: number };

      registry.register<V1, V2>("counter", 1, 2, (old) => ({
        count: old.count,
        doubled: old.count * 2,
      }));
      registry.register<V2, V3>("counter", 2, 3, (old) => ({
        total: old.count + old.doubled,
      }));

      const state = createVersionedState<V1>(1, { count: 5 });
      const result = registry.migrate<V3>("counter", state, 3);

      expect(result.data.total).toBe(15); // 5 + (5*2)
    });
  });

  describe("global registry", () => {
    it("should provide a singleton instance", () => {
      const registry1 = getMigrationRegistry();
      const registry2 = getMigrationRegistry();

      expect(registry1).toBe(registry2);
    });

    it("should reset the global registry", () => {
      const registry1 = getMigrationRegistry();
      registry1.register("component", 1, 2, (old) => old);

      resetMigrationRegistry();

      const registry2 = getMigrationRegistry();
      expect(registry2).not.toBe(registry1);
      expect(registry2.getMigrations("component")).toEqual([]);
    });
  });
});
