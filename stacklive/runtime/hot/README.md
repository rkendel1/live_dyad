# StackLive Hot Registry

State-preserving hot reload system for StackLive components.

## Overview

The Hot Registry enables swapping component implementations without tearing down:
- Runtime instances
- Signal graph
- User context
- Multiplayer sessions
- Experience state

## Architecture

The system separates two layers:

**Cold Layer (Persistent)**
- Runtime
- Signal graph
- User memory/context
- Multiplayer/session
- Experience state

**Hot Layer (Replaceable)**
- Component implementation module
- View renderer
- Style module

Hot reload only replaces the implementation, then re-attaches it to the existing instance state.

## Usage

### 1. Define a Hot Module

A hot module provides a `mount` function that creates component instances:

```typescript
import { HotModule, MountContext, MountedInstance } from 'stacklive/runtime/hot';

const myModule: HotModule = {
  id: 'my-component',
  mount: (ctx: MountContext): MountedInstance => {
    // Create and configure your component
    const component = new MyComponent(ctx.element, ctx.props);
    
    // Access persistent state if available
    if (ctx.runtime) {
      component.connectToRuntime(ctx.runtime);
    }
    
    if (ctx.experienceState) {
      component.bindState(ctx.experienceState);
    }
    
    return {
      update: (newProps) => {
        component.updateProps(newProps);
      },
      destroy: () => {
        component.cleanup();
      }
    };
  }
};
```

### 2. Register the Module

```typescript
import { getHotRegistry } from 'stacklive/runtime/hot';

const registry = getHotRegistry();
registry.register(myModule);
```

### 3. Mount Instances

```typescript
const element = document.getElementById('my-component');
const ctx = {
  element,
  props: { title: 'Hello', count: 0 },
  runtime: myRuntime,
  experienceState: myExperienceState
};

const instance = registry.mount('my-component', ctx);
```

### 4. Hot Swap on Code Change

When the component implementation changes, create a new module and swap:

```typescript
// New implementation
const myModuleV2: HotModule = {
  id: 'my-component',
  mount: (ctx: MountContext): MountedInstance => {
    // Updated component implementation
    const component = new MyComponentV2(ctx.element, ctx.props);
    
    // Same mount context is preserved
    if (ctx.runtime) {
      component.connectToRuntime(ctx.runtime);
    }
    
    if (ctx.experienceState) {
      component.bindState(ctx.experienceState);
    }
    
    return {
      update: (newProps) => component.updateProps(newProps),
      destroy: () => component.cleanup()
    };
  }
};

// Swap all instances
registry.hotSwap('my-component', myModuleV2);
```

## API Reference

### HotRegistry

#### `register(module: HotModule): void`
Register a hot module.

#### `unregister(moduleId: string): void`
Unregister a hot module.

#### `mount(moduleId: string, ctx: MountContext): MountedInstance | null`
Mount a component instance. Automatically unmounts any existing instance on the same element.

#### `unmount(element: HTMLElement): void`
Unmount a component instance and call its destroy method.

#### `hotSwap(moduleId: string, newModule: HotModule): void`
Replace module implementation and re-mount all instances with preserved context.

#### `updateProps(element: HTMLElement, props: Record<string, any>): void`
Update props for an instance. Merges new props with existing and calls the instance's update method.

#### `getInstance(element: HTMLElement): InstanceRecord | undefined`
Get the instance record for an element.

#### `getModuleInstances(moduleId: string): InstanceRecord[]`
Get all instances of a module.

#### `clear(): void`
Clear all instances and modules. Calls destroy on all instances.

### Global Registry

#### `getHotRegistry(): HotRegistry`
Get the global hot registry singleton.

#### `resetHotRegistry(): void`
Reset the global hot registry (useful for testing).

## Integration with Existing Hot Reload

The hot registry integrates with the existing hot reload pipeline:

```typescript
import { hotSwapWithRegistry } from 'stacklive/dev';

// On file change
hotSwapWithRegistry('my-component');
```

This function:
1. Checks if components are registered with the hot registry
2. For registered components: uses state-preserving swap
3. For non-registered components: falls back to simple DOM replacement

## Example: Svelte Component

```typescript
import MyComponent from './MyComponent.svelte';
import { getHotRegistry } from 'stacklive/runtime/hot';

const module: HotModule = {
  id: 'my-component',
  mount: (ctx) => {
    const component = new MyComponent({
      target: ctx.element,
      props: ctx.props
    });
    
    return {
      update: (newProps) => {
        component.$set(newProps);
      },
      destroy: () => {
        component.$destroy();
      }
    };
  }
};

getHotRegistry().register(module);
```

## Testing

Tests are located in `src/__tests__/stacklive_hot_registry.test.ts`.

Run tests with:
```bash
npm test stacklive_hot_registry
```
