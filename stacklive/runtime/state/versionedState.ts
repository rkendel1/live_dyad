/**
 * Versioned State System
 *
 * Provides a type-safe way to version state contracts for components.
 * This allows schema evolution without remounting components.
 *
 * Example usage:
 * ```ts
 * // Define versioned state
 * type MyComponentState = {
 *   userId: string;
 *   settings: Record<string, any>;
 * };
 *
 * const stateVersion = 2;
 * const versionedState: Versioned<MyComponentState> = {
 *   version: stateVersion,
 *   data: {
 *     userId: "user-123",
 *     settings: {}
 *   }
 * };
 * ```
 */

/**
 * Wraps state data with a version number
 */
export type Versioned<T> = {
  /** Version number of the state schema */
  version: number;
  /** The actual state data */
  data: T;
};

/**
 * Create a versioned state object
 */
export function createVersionedState<T>(
  version: number,
  data: T,
): Versioned<T> {
  return {
    version,
    data,
  };
}

/**
 * Check if an object is a versioned state
 */
export function isVersionedState<T = any>(obj: any): obj is Versioned<T> {
  return (
    obj !== null &&
    typeof obj === "object" &&
    typeof obj.version === "number" &&
    "data" in obj
  );
}

/**
 * Get the version from a versioned state, or return 0 for unversioned state
 */
export function getStateVersion(state: any): number {
  if (isVersionedState(state)) {
    return state.version;
  }
  return 0;
}

/**
 * Extract the data from a versioned state, or return the state as-is if not versioned
 */
export function extractStateData<T>(state: Versioned<T> | T): T {
  if (isVersionedState<T>(state)) {
    return state.data;
  }
  return state as T;
}
