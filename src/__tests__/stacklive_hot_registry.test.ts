import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  HotRegistry,
  getHotRegistry,
  resetHotRegistry,
  type HotModule,
  type MountContext,
  type MountedInstance,
} from "../../stacklive/runtime/hot/registry";

describe("HotRegistry", () => {
  let registry: HotRegistry;

  beforeEach(() => {
    registry = new HotRegistry();
  });

  describe("register and unregister", () => {
    it("should register a module", () => {
      const module: HotModule = {
        id: "test-module",
        mount: vi.fn(),
      };

      registry.register(module);

      // Try to mount to verify registration worked
      const element = document.createElement("div");
      const ctx: MountContext = {
        element,
        props: {},
      };

      module.mount = vi.fn(() => ({}));
      registry.register(module);
      const instance = registry.mount("test-module", ctx);

      expect(instance).toBeTruthy();
      expect(module.mount).toHaveBeenCalledWith(ctx);
    });

    it("should unregister a module", () => {
      const module: HotModule = {
        id: "test-module",
        mount: vi.fn(() => ({})),
      };

      registry.register(module);
      registry.unregister("test-module");

      const element = document.createElement("div");
      const ctx: MountContext = {
        element,
        props: {},
      };

      const instance = registry.mount("test-module", ctx);
      expect(instance).toBeNull();
    });
  });

  describe("mount and unmount", () => {
    it("should mount a component instance", () => {
      const mountedInstance: MountedInstance = {
        update: vi.fn(),
        destroy: vi.fn(),
      };

      const module: HotModule = {
        id: "test-module",
        mount: vi.fn(() => mountedInstance),
      };

      registry.register(module);

      const element = document.createElement("div");
      const ctx: MountContext = {
        element,
        props: { foo: "bar" },
      };

      const instance = registry.mount("test-module", ctx);

      expect(instance).toBe(mountedInstance);
      expect(module.mount).toHaveBeenCalledWith(ctx);
    });

    it("should unmount an instance and call destroy", () => {
      const destroy = vi.fn();
      const module: HotModule = {
        id: "test-module",
        mount: () => ({ destroy }),
      };

      registry.register(module);

      const element = document.createElement("div");
      const ctx: MountContext = {
        element,
        props: {},
      };

      registry.mount("test-module", ctx);
      registry.unmount(element);

      expect(destroy).toHaveBeenCalled();
    });

    it("should destroy existing instance when mounting on same element", () => {
      const destroy = vi.fn();
      const module: HotModule = {
        id: "test-module",
        mount: () => ({ destroy }),
      };

      registry.register(module);

      const element = document.createElement("div");
      const ctx: MountContext = {
        element,
        props: {},
      };

      // First mount
      registry.mount("test-module", ctx);

      // Second mount on same element should destroy first instance
      registry.mount("test-module", ctx);

      expect(destroy).toHaveBeenCalledTimes(1);
    });
  });

  describe("hotSwap", () => {
    it("should swap module implementation and re-mount instances", () => {
      const oldDestroy = vi.fn();
      const oldModule: HotModule = {
        id: "test-module",
        mount: () => ({ destroy: oldDestroy }),
      };

      const newDestroy = vi.fn();
      const newMount = vi.fn(() => ({ destroy: newDestroy }));
      const newModule: HotModule = {
        id: "test-module",
        mount: newMount,
      };

      registry.register(oldModule);

      // Mount two instances
      const element1 = document.createElement("div");
      const element2 = document.createElement("div");
      const ctx1: MountContext = {
        element: element1,
        props: { id: 1 },
      };
      const ctx2: MountContext = {
        element: element2,
        props: { id: 2 },
      };

      registry.mount("test-module", ctx1);
      registry.mount("test-module", ctx2);

      // Hot swap
      registry.hotSwap("test-module", newModule);

      // Old instances should be destroyed
      expect(oldDestroy).toHaveBeenCalledTimes(2);

      // New instances should be mounted with preserved context
      expect(newMount).toHaveBeenCalledTimes(2);
      expect(newMount).toHaveBeenCalledWith(ctx1);
      expect(newMount).toHaveBeenCalledWith(ctx2);
    });

    it("should preserve mount context during hot swap", () => {
      const capturedContexts: MountContext[] = [];

      const oldModule: HotModule = {
        id: "test-module",
        mount: () => ({}),
      };

      const newModule: HotModule = {
        id: "test-module",
        mount: (ctx) => {
          capturedContexts.push(ctx);
          return {};
        },
      };

      registry.register(oldModule);

      const element = document.createElement("div");
      const originalProps = { foo: "bar", runtime: "test-runtime" };
      const ctx: MountContext = {
        element,
        props: originalProps,
        runtime: "runtime-instance",
        experienceState: "state-instance",
      };

      registry.mount("test-module", ctx);

      // Hot swap
      registry.hotSwap("test-module", newModule);

      // Verify context was preserved
      expect(capturedContexts).toHaveLength(1);
      expect(capturedContexts[0].props).toEqual(originalProps);
      expect(capturedContexts[0].runtime).toBe("runtime-instance");
      expect(capturedContexts[0].experienceState).toBe("state-instance");
    });
  });

  describe("updateProps", () => {
    it("should update props and call instance update method", () => {
      const update = vi.fn();
      const module: HotModule = {
        id: "test-module",
        mount: () => ({ update }),
      };

      registry.register(module);

      const element = document.createElement("div");
      const ctx: MountContext = {
        element,
        props: { initial: "value" },
      };

      registry.mount("test-module", ctx);

      const newProps = { updated: "value" };
      registry.updateProps(element, newProps);

      expect(update).toHaveBeenCalledWith({
        initial: "value",
        updated: "value",
      });
    });

    it("should handle instances without update method", () => {
      const module: HotModule = {
        id: "test-module",
        mount: () => ({}),
      };

      registry.register(module);

      const element = document.createElement("div");
      const ctx: MountContext = {
        element,
        props: {},
      };

      registry.mount("test-module", ctx);

      // Should not throw
      expect(() => {
        registry.updateProps(element, { new: "prop" });
      }).not.toThrow();
    });
  });

  describe("getInstance and getModuleInstances", () => {
    it("should get instance record for an element", () => {
      const module: HotModule = {
        id: "test-module",
        mount: () => ({}),
      };

      registry.register(module);

      const element = document.createElement("div");
      const ctx: MountContext = {
        element,
        props: { test: "value" },
      };

      registry.mount("test-module", ctx);

      const record = registry.getInstance(element);

      expect(record).toBeTruthy();
      expect(record?.moduleId).toBe("test-module");
      expect(record?.ctx.props).toEqual({ test: "value" });
    });

    it("should get all instances of a module", () => {
      const module: HotModule = {
        id: "test-module",
        mount: () => ({}),
      };

      registry.register(module);

      const element1 = document.createElement("div");
      const element2 = document.createElement("div");

      registry.mount("test-module", { element: element1, props: {} });
      registry.mount("test-module", { element: element2, props: {} });

      const instances = registry.getModuleInstances("test-module");

      expect(instances).toHaveLength(2);
      expect(instances.every((r) => r.moduleId === "test-module")).toBe(true);
    });
  });

  describe("clear", () => {
    it("should clear all instances and modules", () => {
      const destroy1 = vi.fn();
      const destroy2 = vi.fn();

      const module: HotModule = {
        id: "test-module",
        mount: vi
          .fn()
          .mockReturnValueOnce({ destroy: destroy1 })
          .mockReturnValueOnce({ destroy: destroy2 }),
      };

      registry.register(module);

      const element1 = document.createElement("div");
      const element2 = document.createElement("div");

      registry.mount("test-module", { element: element1, props: {} });
      registry.mount("test-module", { element: element2, props: {} });

      registry.clear();

      expect(destroy1).toHaveBeenCalled();
      expect(destroy2).toHaveBeenCalled();

      // Verify registry is empty
      expect(registry.getInstance(element1)).toBeUndefined();
      expect(registry.getInstance(element2)).toBeUndefined();
      expect(registry.getModuleInstances("test-module")).toHaveLength(0);
    });
  });

  describe("global registry", () => {
    it("should provide a singleton instance", () => {
      const registry1 = getHotRegistry();
      const registry2 = getHotRegistry();

      expect(registry1).toBe(registry2);
    });

    it("should reset the global registry", () => {
      const registry1 = getHotRegistry();
      resetHotRegistry();
      const registry2 = getHotRegistry();

      expect(registry1).not.toBe(registry2);
    });
  });
});
