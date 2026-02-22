/**
 * Registry-aware hot swap for custom elements
 *
 * This enhanced version uses the HotRegistry to preserve state during hot reloads.
 * It provides both registry-based swapping (for components that use the registry)
 * and fallback to simple DOM replacement (for legacy components).
 */

import { getHotRegistry } from "../../runtime/hot";
import { hotSwap as legacyHotSwap } from "./hot-swap-custom-element";

/**
 * Hot swap with registry support
 *
 * This function:
 * 1. Checks which elements are managed by the hot registry
 * 2. For registry-managed elements, logs that they're handled by the registry
 * 3. For non-registry elements, delegates to the legacy hotSwap function
 *
 * @param moduleId - Optional module ID to swap. If not provided, checks all preview elements
 */
export function hotSwapWithRegistry(moduleId?: string) {
  const registry = getHotRegistry();
  const elements = document.querySelectorAll("[data-stacklive-preview]");

  let hasRegistryManagedElements = false;
  let hasLegacyElements = false;

  elements.forEach((node) => {
    if (!(node instanceof HTMLElement)) return;

    const tag = node.tagName.toLowerCase();
    const instanceRecord = registry.getInstance(node);

    if (instanceRecord) {
      // Registry-managed component
      // If moduleId is specified, only count matching modules
      if (!moduleId || instanceRecord.moduleId === moduleId) {
        hasRegistryManagedElements = true;
        console.log(
          `[HotSwap] Element ${tag} is registry-managed (${instanceRecord.moduleId})`,
        );
      }
    } else {
      // Legacy component
      hasLegacyElements = true;
    }
  });

  // For legacy elements, use the standard hotSwap function
  if (hasLegacyElements) {
    console.log("[HotSwap] Swapping non-registry elements using legacy method");
    legacyHotSwap();
  }

  if (!hasRegistryManagedElements && !hasLegacyElements) {
    console.log("[HotSwap] No elements found to swap");
  }
}

/**
 * Simple hot swap function without registry support
 * Uses simple DOM replacement for legacy components
 * Delegates to the existing hotSwap function from hot-swap-custom-element
 */
export function simpleHotSwap() {
  legacyHotSwap();
}
