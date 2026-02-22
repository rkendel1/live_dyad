/**
 * Migration Registry
 *
 * Manages state migrations for schema evolution.
 * Allows transforming state from one version to another without remounting components.
 *
 * Example usage:
 * ```ts
 * const registry = new MigrationRegistry();
 *
 * // Register migration from v1 to v2
 * registry.register("my-component", 1, 2, (oldState) => ({
 *   ...oldState,
 *   newField: "default-value"
 * }));
 *
 * // Apply migrations
 * const oldState = { version: 1, data: { name: "test" } };
 * const newState = registry.migrate("my-component", oldState, 2);
 * // Result: { version: 2, data: { name: "test", newField: "default-value" } }
 * ```
 */

import {
  type Versioned,
  isVersionedState,
  createVersionedState,
  getStateVersion,
} from "./versionedState";

/**
 * A function that transforms state from one version to another
 */
export type Migration<TFrom = any, TTo = any> = (oldState: TFrom) => TTo;

/**
 * A registered migration path
 */
type MigrationPath = {
  fromVersion: number;
  toVersion: number;
  migrate: Migration;
};

/**
 * Registry for state migrations
 */
export class MigrationRegistry {
  private migrations = new Map<string, MigrationPath[]>();

  /**
   * Register a migration for a component
   *
   * @param componentId - Unique identifier for the component
   * @param fromVersion - Source version number
   * @param toVersion - Target version number
   * @param migration - Function that transforms state from old to new version
   */
  register<TFrom = any, TTo = any>(
    componentId: string,
    fromVersion: number,
    toVersion: number,
    migration: Migration<TFrom, TTo>,
  ): void {
    if (fromVersion === toVersion) {
      throw new Error(
        `Cannot register migration from version ${fromVersion} to itself`,
      );
    }

    if (!this.migrations.has(componentId)) {
      this.migrations.set(componentId, []);
    }

    const paths = this.migrations.get(componentId)!;

    // Check for duplicate migration paths
    const existing = paths.find(
      (p) => p.fromVersion === fromVersion && p.toVersion === toVersion,
    );
    if (existing) {
      throw new Error(
        `Migration from version ${fromVersion} to ${toVersion} already exists for component ${componentId}`,
      );
    }

    paths.push({
      fromVersion,
      toVersion,
      migrate: migration as Migration,
    });
  }

  /**
   * Unregister all migrations for a component
   */
  unregister(componentId: string): void {
    this.migrations.delete(componentId);
  }

  /**
   * Unregister a specific migration
   */
  unregisterMigration(
    componentId: string,
    fromVersion: number,
    toVersion: number,
  ): void {
    const paths = this.migrations.get(componentId);
    if (!paths) {
      return;
    }

    const index = paths.findIndex(
      (p) => p.fromVersion === fromVersion && p.toVersion === toVersion,
    );
    if (index !== -1) {
      paths.splice(index, 1);
    }

    // Clean up empty component entries
    if (paths.length === 0) {
      this.migrations.delete(componentId);
    }
  }

  /**
   * Find a migration path from one version to another
   * Uses breadth-first search to find the shortest path
   */
  private findMigrationPath(
    componentId: string,
    fromVersion: number,
    toVersion: number,
  ): MigrationPath[] | null {
    const paths = this.migrations.get(componentId);
    if (!paths || paths.length === 0) {
      return null;
    }

    // BFS to find shortest path
    const queue: Array<{ version: number; path: MigrationPath[] }> = [
      { version: fromVersion, path: [] },
    ];
    const visited = new Set<number>();

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.version === toVersion) {
        return current.path;
      }

      if (visited.has(current.version)) {
        continue;
      }
      visited.add(current.version);

      // Find all migrations from current version
      for (const migration of paths) {
        if (migration.fromVersion === current.version) {
          queue.push({
            version: migration.toVersion,
            path: [...current.path, migration],
          });
        }
      }
    }

    return null;
  }

  /**
   * Migrate state from one version to another
   *
   * @param componentId - Component identifier
   * @param state - Current state (versioned or unversioned)
   * @param targetVersion - Target version to migrate to
   * @returns Migrated state wrapped in Versioned<T>
   */
  migrate<T = any>(
    componentId: string,
    state: Versioned<any> | any,
    targetVersion: number,
  ): Versioned<T> {
    const currentVersion = getStateVersion(state);

    // If already at target version, return as-is (wrapped if needed)
    if (currentVersion === targetVersion) {
      if (isVersionedState(state)) {
        return state as Versioned<T>;
      }
      return createVersionedState(targetVersion, state);
    }

    // Find migration path
    const path = this.findMigrationPath(
      componentId,
      currentVersion,
      targetVersion,
    );

    if (!path) {
      throw new Error(
        `No migration path found for component ${componentId} from version ${currentVersion} to ${targetVersion}`,
      );
    }

    // Apply migrations in sequence
    let currentData = isVersionedState(state) ? state.data : state;
    for (const migration of path) {
      currentData = migration.migrate(currentData);
    }

    return createVersionedState(targetVersion, currentData);
  }

  /**
   * Check if a migration path exists
   */
  hasMigrationPath(
    componentId: string,
    fromVersion: number,
    toVersion: number,
  ): boolean {
    if (fromVersion === toVersion) {
      return true;
    }
    return this.findMigrationPath(componentId, fromVersion, toVersion) !== null;
  }

  /**
   * Get all registered component IDs
   */
  getComponentIds(): string[] {
    return Array.from(this.migrations.keys());
  }

  /**
   * Get all migrations for a component
   */
  getMigrations(componentId: string): ReadonlyArray<{
    fromVersion: number;
    toVersion: number;
  }> {
    const paths = this.migrations.get(componentId);
    if (!paths) {
      return [];
    }
    return paths.map((p) => ({
      fromVersion: p.fromVersion,
      toVersion: p.toVersion,
    }));
  }

  /**
   * Clear all migrations
   */
  clear(): void {
    this.migrations.clear();
  }
}

// Global singleton instance
let globalRegistry: MigrationRegistry | null = null;

/**
 * Get the global migration registry instance
 */
export function getMigrationRegistry(): MigrationRegistry {
  if (!globalRegistry) {
    globalRegistry = new MigrationRegistry();
  }
  return globalRegistry;
}

/**
 * Reset the global migration registry (useful for testing)
 */
export function resetMigrationRegistry(): void {
  if (globalRegistry) {
    globalRegistry.clear();
  }
  globalRegistry = null;
}
