# StackLive State Migration System

Production-grade state migration layer for schema evolution without component remounts.

## Overview

The State Migration System enables:

- Schema evolution without remounting components
- Live creator editing across tabs
- Multiplayer sessions that don't reset
- Preview ↔ builder ↔ live surface syncing

## Components

### Versioned State

Wraps component state with a version number to track schema changes:

```typescript
import { createVersionedState, type Versioned } from "stacklive/runtime/state";

// Define your state type
type MyComponentState = {
  userId: string;
  settings: Record<string, any>;
};

// Create versioned state
const stateVersion = 2;
const state = createVersionedState<MyComponentState>(stateVersion, {
  userId: "user-123",
  settings: { theme: "dark" },
});
```

### Migration Registry

Manages migrations between state versions:

```typescript
import {
  getMigrationRegistry,
  type Migration,
} from "stacklive/runtime/state";

const registry = getMigrationRegistry();

// Register migration from v1 to v2
type V1State = { name: string };
type V2State = { name: string; age: number };

const migrationV1toV2: Migration<V1State, V2State> = (oldState) => ({
  ...oldState,
  age: 0, // Default value for new field
});

registry.register("my-component", 1, 2, migrationV1toV2);

// Apply migrations
const oldState = createVersionedState<V1State>(1, { name: "Alice" });
const newState = registry.migrate<V2State>("my-component", oldState, 2);
// Result: { version: 2, data: { name: "Alice", age: 0 } }
```

## Usage Patterns

### Simple Version Upgrade

Add a new field with a default value:

```typescript
type V1 = { count: number };
type V2 = { count: number; label: string };

registry.register<V1, V2>("counter", 1, 2, (old) => ({
  ...old,
  label: "Count",
}));
```

### Multi-Step Migration

Chain multiple migrations for complex schema changes:

```typescript
type V1 = { name: string };
type V2 = { firstName: string; lastName: string };
type V3 = { fullName: string };

// v1 -> v2: Split name into firstName/lastName
registry.register<V1, V2>("user", 1, 2, (old) => {
  const [firstName, lastName] = old.name.split(" ");
  return { firstName, lastName: lastName || "" };
});

// v2 -> v3: Combine into fullName
registry.register<V2, V3>("user", 2, 3, (old) => ({
  fullName: `${old.firstName} ${old.lastName}`.trim(),
}));

// Migrate from v1 to v3 automatically
const v1State = createVersionedState<V1>(1, { name: "Alice Smith" });
const v3State = registry.migrate<V3>("user", v1State, 3);
// Result: { version: 3, data: { fullName: "Alice Smith" } }
```

### Data Transformation

Transform data during migration:

```typescript
type V1 = { created: string }; // ISO date string
type V2 = { created: number }; // Unix timestamp

registry.register<V1, V2>("event", 1, 2, (old) => ({
  created: new Date(old.created).getTime(),
}));
```

### Handling Unversioned State

The system treats unversioned state as version 0:

```typescript
// Register migration from unversioned (v0) to v1
type V0 = { oldField: string };
type V1 = { newField: string };

registry.register<V0, V1>("component", 0, 1, (old) => ({
  newField: old.oldField,
}));

// Migrate unversioned state
const oldState = { oldField: "value" };
const newState = registry.migrate<V1>("component", oldState, 1);
// Result: { version: 1, data: { newField: "value" } }
```

## API Reference

### Versioned State

#### `createVersionedState<T>(version: number, data: T): Versioned<T>`

Creates a versioned state object.

#### `isVersionedState<T>(obj: any): obj is Versioned<T>`

Type guard to check if an object is versioned state.

#### `getStateVersion(state: any): number`

Returns the version number, or 0 for unversioned state.

#### `extractStateData<T>(state: Versioned<T> | T): T`

Extracts the data from versioned state, or returns as-is if not versioned.

### Migration Registry

#### `register<TFrom, TTo>(componentId: string, fromVersion: number, toVersion: number, migration: Migration<TFrom, TTo>): void`

Registers a migration function.

#### `migrate<T>(componentId: string, state: any, targetVersion: number): Versioned<T>`

Migrates state to the target version, automatically finding the shortest path.

#### `hasMigrationPath(componentId: string, fromVersion: number, toVersion: number): boolean`

Checks if a migration path exists.

#### `unregister(componentId: string): void`

Removes all migrations for a component.

#### `clear(): void`

Removes all registered migrations.

### Global Registry

#### `getMigrationRegistry(): MigrationRegistry`

Returns the global singleton registry instance.

#### `resetMigrationRegistry(): void`

Resets the global registry (useful for testing).

## Integration with Hot Reload

The state migration system works seamlessly with the hot reload system:

```typescript
import { getHotRegistry } from "stacklive/runtime/hot";
import { getMigrationRegistry } from "stacklive/runtime/state";

const hotRegistry = getHotRegistry();
const migrationRegistry = getMigrationRegistry();

// When hot swapping, migrate state if schema changed
hotRegistry.hotSwap("my-component", {
  id: "my-component",
  mount: (ctx) => {
    // Get current state from context
    const currentState = ctx.experienceState;

    // Migrate to new version
    const migratedState = migrationRegistry.migrate(
      "my-component",
      currentState,
      NEW_VERSION,
    );

    // Use migrated state
    return new MyComponent(ctx.element, migratedState.data);
  },
});
```

## Best Practices

1. **Always increment versions**: Never reuse version numbers
2. **Test migrations**: Write tests for each migration path
3. **Provide defaults**: Always provide sensible defaults for new fields
4. **Document changes**: Comment why each migration is needed
5. **Keep migrations pure**: Migrations should not have side effects
6. **Plan ahead**: Consider future schema changes when designing state structure

## Testing

Example test for a migration:

```typescript
import { describe, it, expect } from "vitest";
import { MigrationRegistry } from "stacklive/runtime/state";

describe("User state migrations", () => {
  it("should migrate from v1 to v2", () => {
    const registry = new MigrationRegistry();

    type V1 = { name: string };
    type V2 = { name: string; age: number };

    registry.register<V1, V2>("user", 1, 2, (old) => ({
      ...old,
      age: 0,
    }));

    const oldState = createVersionedState<V1>(1, { name: "Alice" });
    const newState = registry.migrate<V2>("user", oldState, 2);

    expect(newState.version).toBe(2);
    expect(newState.data.name).toBe("Alice");
    expect(newState.data.age).toBe(0);
  });
});
```

## Error Handling

The migration registry throws errors for:

- **No migration path**: When no path exists between versions
- **Same version migration**: When from and to versions are the same
- **Duplicate migrations**: When a migration path is registered twice

Always handle these errors appropriately in your application:

```typescript
try {
  const migratedState = registry.migrate("component", state, targetVersion);
} catch (error) {
  console.error("Migration failed:", error);
  // Handle error (e.g., use default state, show error to user, etc.)
}
```
