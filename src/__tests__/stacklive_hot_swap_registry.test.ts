import { describe, it, expect, beforeEach, vi } from "vitest";
import { hotSwapWithRegistry } from "../../stacklive/dev/hot-swap-registry";
import {
  getHotRegistry,
  resetHotRegistry,
  type HotModule,
  type MountContext,
} from "../../stacklive/runtime/hot/registry";

describe("hot-swap-registry", () => {
  beforeEach(() => {
    // Clear the DOM before each test
    document.body.innerHTML = "";
    // Reset the global registry
    resetHotRegistry();
  });

  describe("hotSwapWithRegistry", () => {
    it("should use registry for registered components", () => {
      const registry = getHotRegistry();

      // Create a registered module
      const module: HotModule = {
        id: "registered-component",
        mount: vi.fn(() => ({})),
      };

      registry.register(module);

      // Create and mount an element
      const element = document.createElement("registered-component");
      element.setAttribute("data-stacklive-preview", "true");
      document.body.appendChild(element);

      const ctx: MountContext = {
        element,
        props: { test: "value" },
      };

      registry.mount("registered-component", ctx);

      // Call hotSwapWithRegistry
      const consoleSpy = vi.spyOn(console, "log");
      hotSwapWithRegistry();

      // Should log that it found a registry-managed component
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("registry-managed"),
      );
    });

    it("should use simple swap for non-registered components", () => {
      // Create a non-registered element
      const element = document.createElement("legacy-component");
      element.setAttribute("data-stacklive-preview", "true");
      element.setAttribute("test-attr", "test-value");
      document.body.appendChild(element);

      const consoleSpy = vi.spyOn(console, "log");
      hotSwapWithRegistry();

      // Should log that it replaced a legacy element
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Replaced legacy element"),
      );

      // Verify the element was replaced
      const newElement = document.body.querySelector("legacy-component");
      expect(newElement).toBeTruthy();
      expect(newElement?.getAttribute("test-attr")).toBe("test-value");
    });

    it("should only swap specified moduleId when provided", () => {
      const registry = getHotRegistry();

      // Register two modules
      const module1: HotModule = {
        id: "component-1",
        mount: () => ({}),
      };
      const module2: HotModule = {
        id: "component-2",
        mount: () => ({}),
      };

      registry.register(module1);
      registry.register(module2);

      // Create and mount two elements
      const element1 = document.createElement("component-1");
      element1.setAttribute("data-stacklive-preview", "true");
      document.body.appendChild(element1);

      const element2 = document.createElement("component-2");
      element2.setAttribute("data-stacklive-preview", "true");
      document.body.appendChild(element2);

      registry.mount("component-1", { element: element1, props: {} });
      registry.mount("component-2", { element: element2, props: {} });

      // Swap only component-1
      const consoleSpy = vi.spyOn(console, "log");
      hotSwapWithRegistry("component-1");

      // Should only log for component-1
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("component-1"),
      );
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining("component-2"),
      );
    });

    it("should handle mixed registered and non-registered components", () => {
      const registry = getHotRegistry();

      // Create a registered component
      const module: HotModule = {
        id: "registered",
        mount: () => ({}),
      };
      registry.register(module);

      const registeredElement = document.createElement("registered");
      registeredElement.setAttribute("data-stacklive-preview", "true");
      document.body.appendChild(registeredElement);

      registry.mount("registered", {
        element: registeredElement,
        props: {},
      });

      // Create a non-registered component
      const legacyElement = document.createElement("legacy");
      legacyElement.setAttribute("data-stacklive-preview", "true");
      document.body.appendChild(legacyElement);

      const consoleSpy = vi.spyOn(console, "log");
      hotSwapWithRegistry();

      // Should handle both types
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("registry-managed"),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Replaced legacy element"),
      );
    });

    it("should preserve attributes when swapping legacy components", () => {
      const element = document.createElement("test-component");
      element.setAttribute("data-stacklive-preview", "true");
      element.setAttribute("attr1", "value1");
      element.setAttribute("attr2", "value2");
      element.className = "test-class";
      document.body.appendChild(element);

      hotSwapWithRegistry();

      const newElement = document.body.querySelector("test-component");
      expect(newElement?.getAttribute("attr1")).toBe("value1");
      expect(newElement?.getAttribute("attr2")).toBe("value2");
      expect(newElement?.className).toBe("test-class");
    });
  });
});
