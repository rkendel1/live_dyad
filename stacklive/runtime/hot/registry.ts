/**
 * Hot Registry for State-Preserving Hot Reload
 *
 * Manages hot module instances and enables swapping component implementations
 * without tearing down runtime state, user context, or experience state.
 *
 * The registry separates:
 * - Cold layer (persistent): Runtime, signal graph, user context, multiplayer session
 * - Hot layer (replaceable): Component implementation, view renderer, styles
 */

export type MountContext = {
  /** DOM element where the component is mounted */
  element: HTMLElement;
  /** Component props/attributes */
  props: Record<string, any>;
  /** Optional runtime instance reference */
  runtime?: any;
  /** Optional experience state reference */
  experienceState?: any;
};

export type MountedInstance = {
  /** Optional update function called when props change */
  update?: (props: Record<string, any>) => void;
  /** Optional destroy/cleanup function */
  destroy?: () => void;
};

export type HotModule = {
  /** Unique module identifier (e.g., component name or file path) */
  id: string;
  /** Mount function that creates and returns a component instance */
  mount: (ctx: MountContext) => MountedInstance;
};

type InstanceRecord = {
  moduleId: string;
  instance: MountedInstance;
  ctx: MountContext;
};

export class HotRegistry {
  private modules = new Map<string, HotModule>();
  private instances = new Map<HTMLElement, InstanceRecord>();

  /**
   * Register a hot module
   */
  register(module: HotModule): void {
    this.modules.set(module.id, module);
  }

  /**
   * Unregister a hot module
   */
  unregister(moduleId: string): void {
    this.modules.delete(moduleId);
  }

  /**
   * Mount a component instance
   */
  mount(moduleId: string, ctx: MountContext): MountedInstance | null {
    const module = this.modules.get(moduleId);
    if (!module) {
      console.warn(`[HotRegistry] Module ${moduleId} not found`);
      return null;
    }

    // If an instance already exists for this element, destroy it first
    this.unmount(ctx.element);

    const instance = module.mount(ctx);
    this.instances.set(ctx.element, { moduleId, instance, ctx });

    return instance;
  }

  /**
   * Unmount a component instance
   */
  unmount(element: HTMLElement): void {
    const record = this.instances.get(element);
    if (!record) {
      return;
    }

    // Call destroy if available
    if (record.instance.destroy) {
      record.instance.destroy();
    }

    this.instances.delete(element);
  }

  /**
   * Hot swap: replace module implementation and re-mount all instances
   * This preserves the mount context (props, runtime, state) while swapping the implementation
   */
  hotSwap(moduleId: string, newModule: HotModule): void {
    // Register the new module
    this.register(newModule);

    // Find all instances of this module
    const instancesToSwap: Array<{
      element: HTMLElement;
      record: InstanceRecord;
    }> = [];
    for (const [element, record] of this.instances.entries()) {
      if (record.moduleId === moduleId) {
        instancesToSwap.push({ element, record });
      }
    }

    // Swap each instance
    for (const { element, record } of instancesToSwap) {
      // Destroy old instance
      if (record.instance.destroy) {
        record.instance.destroy();
      }

      // Mount new instance with preserved context
      const newInstance = newModule.mount(record.ctx);
      this.instances.set(element, {
        moduleId,
        instance: newInstance,
        ctx: record.ctx,
      });
    }

    console.log(
      `[HotRegistry] Swapped ${instancesToSwap.length} instances of ${moduleId}`,
    );
  }

  /**
   * Update props for an instance
   */
  updateProps(element: HTMLElement, props: Record<string, any>): void {
    const record = this.instances.get(element);
    if (!record) {
      return;
    }

    // Update context
    record.ctx.props = { ...record.ctx.props, ...props };

    // Call update if available
    if (record.instance.update) {
      record.instance.update(record.ctx.props);
    }
  }

  /**
   * Get instance record for an element
   */
  getInstance(element: HTMLElement): InstanceRecord | undefined {
    return this.instances.get(element);
  }

  /**
   * Get all instances of a module
   */
  getModuleInstances(moduleId: string): InstanceRecord[] {
    const instances: InstanceRecord[] = [];
    for (const record of this.instances.values()) {
      if (record.moduleId === moduleId) {
        instances.push(record);
      }
    }
    return instances;
  }

  /**
   * Clear all instances and modules
   */
  clear(): void {
    // Destroy all instances
    for (const record of this.instances.values()) {
      if (record.instance.destroy) {
        record.instance.destroy();
      }
    }

    this.instances.clear();
    this.modules.clear();
  }
}

// Global singleton instance
let globalRegistry: HotRegistry | null = null;

/**
 * Get the global hot registry instance
 */
export function getHotRegistry(): HotRegistry {
  if (!globalRegistry) {
    globalRegistry = new HotRegistry();
  }
  return globalRegistry;
}

/**
 * Reset the global hot registry (useful for testing)
 */
export function resetHotRegistry(): void {
  if (globalRegistry) {
    globalRegistry.clear();
  }
  globalRegistry = null;
}
