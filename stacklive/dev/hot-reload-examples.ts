/**
 * Example: State-Preserving Hot Reload Integration
 *
 * This example shows how to integrate the hot registry with StackLive components
 * for state-preserving hot reload.
 */

import { getHotRegistry, type HotModule } from "../runtime/hot";
import { hotSwapWithRegistry } from "./hot-swap-registry";

/**
 * Example 1: Register a simple component
 *
 * This shows how to register a basic component that preserves state during hot reload.
 */
export function registerSimpleComponent() {
  const registry = getHotRegistry();

  const module: HotModule = {
    id: "simple-counter",
    mount: (ctx) => {
      // Create a simple counter component
      let count = 0;

      const render = () => {
        ctx.element.innerHTML = `
          <div>
            <h2>${ctx.props.title || "Counter"}</h2>
            <p>Count: ${count}</p>
            <button id="increment">+</button>
            <button id="decrement">-</button>
          </div>
        `;

        // Attach event listeners
        ctx.element
          .querySelector("#increment")
          ?.addEventListener("click", () => {
            count++;
            render();
          });
        ctx.element
          .querySelector("#decrement")
          ?.addEventListener("click", () => {
            count--;
            render();
          });
      };

      render();

      return {
        update: (newProps) => {
          // Update only the title when props change
          const title = ctx.element.querySelector("h2");
          if (title && newProps.title) {
            title.textContent = newProps.title;
          }
        },
        destroy: () => {
          // Clean up event listeners if needed
          ctx.element.innerHTML = "";
        },
      };
    },
  };

  registry.register(module);
}

/**
 * Example 2: Register a component with runtime integration
 *
 * This shows how to preserve runtime and experience state during hot reload.
 */
export function registerRuntimeComponent() {
  const registry = getHotRegistry();

  const module: HotModule = {
    id: "runtime-component",
    mount: (ctx) => {
      // Access runtime and experience state from context
      const { runtime, experienceState } = ctx;

      // Initialize component with runtime state
      if (runtime) {
        console.log("[Component] Connected to runtime:", runtime);
      }

      if (experienceState) {
        console.log("[Component] Bound to experience state:", experienceState);
      }

      // Render component
      ctx.element.innerHTML = `
        <div class="runtime-component">
          <h3>${ctx.props.title || "Runtime Component"}</h3>
          <div id="state-display"></div>
        </div>
      `;

      // Update state display
      const updateStateDisplay = () => {
        const display = ctx.element.querySelector("#state-display");
        if (display && experienceState) {
          display.textContent = JSON.stringify(experienceState, null, 2);
        }
      };

      updateStateDisplay();

      return {
        update: (newProps) => {
          const title = ctx.element.querySelector("h3");
          if (title && newProps.title) {
            title.textContent = newProps.title;
          }
          updateStateDisplay();
        },
        destroy: () => {
          // Disconnect from runtime if needed
          ctx.element.innerHTML = "";
        },
      };
    },
  };

  registry.register(module);
}

/**
 * Example 3: Trigger hot reload on file change
 *
 * This would be called by the file watcher when a component file changes.
 */
export function onComponentFileChange(componentId: string) {
  console.log(`[Hot Reload] Component ${componentId} changed, swapping...`);

  // In a real scenario, you would:
  // 1. Re-import the component module
  // 2. Create a new HotModule with the updated implementation
  // 3. Call hotSwap

  // For example:
  // const newModule: HotModule = {
  //   id: componentId,
  //   mount: (ctx) => {
  //     // Updated component implementation
  //     ...
  //   }
  // };

  // getHotRegistry().hotSwap(componentId, newModule);

  // Or use the registry-aware DOM swap:
  hotSwapWithRegistry(componentId);
}

/**
 * Example 4: Initialize hot reload system
 *
 * This would be called during app initialization.
 */
export function initializeHotReload() {
  console.log("[Hot Reload] Initializing state-preserving hot reload");

  // Register all components
  registerSimpleComponent();
  registerRuntimeComponent();

  console.log("[Hot Reload] Hot reload system ready");
}

/**
 * Example 5: Manual prop update
 *
 * This shows how to update component props programmatically.
 */
export function updateComponentProps(
  element: HTMLElement,
  newProps: Record<string, any>,
) {
  const registry = getHotRegistry();
  registry.updateProps(element, newProps);
}
