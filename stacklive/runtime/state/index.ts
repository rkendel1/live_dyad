/**
 * StackLive State Migration System
 *
 * Provides versioned state contracts and migration capabilities for schema evolution
 * without remounting components.
 */

export {
  type Versioned,
  createVersionedState,
  isVersionedState,
  getStateVersion,
  extractStateData,
} from "./versionedState";

export {
  type Migration,
  MigrationRegistry,
  getMigrationRegistry,
  resetMigrationRegistry,
} from "./migrations";
