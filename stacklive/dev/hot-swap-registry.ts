/**
 * Registry-aware hot swap for custom elements
 *
 * This enhanced version uses the HotRegistry to preserve state during hot reloads.
 * It provides both registry-based swapping (for components that use the registry)
 * and fallback to simple DOM replacement (for legacy components).
 */

import { getHotRegistry } from "../../runtime/hot";

/**
 * Hot swap with registry support
 *
 * This function:
 * 1. Attempts to use the hot registry for state-preserving swaps
 * 2. Falls back to simple DOM replacement for non-registered components
 *
 * @param moduleId - Optional module ID to swap. If not provided, swaps all preview elements
 */
export function hotSwapWithRegistry(moduleId?: string) {
  const registry = getHotRegistry();
  const elements = document.querySelectorAll("[data-stacklive-preview]");

  elements.forEach((node) => {
    if (!(node instanceof HTMLElement)) return;

    const tag = node.tagName.toLowerCase();

    // Check if this element is managed by the registry
    const instanceRecord = registry.getInstance(node);

    if (instanceRecord) {
      // Registry-managed component
      // If moduleId is specified, only swap matching modules
      if (moduleId && instanceRecord.moduleId !== moduleId) {
        return;
      }

      // The actual swap is handled by the registry when a new module is registered
      // Here we just log that we found a registered instance
      console.log(
        `[HotSwap] Element ${tag} is registry-managed (${instanceRecord.moduleId})`,
      );
    } else {
      // Legacy component - use simple DOM replacement
      const newEl = document.createElement(tag);

      // Copy all attributes to preserve component props/state
      Array.from(node.attributes).forEach((attr) =>
        newEl.setAttribute(attr.name, attr.value),
      );

      // Replace the old element with the new one
      // This triggers the custom element's connectedCallback
      node.replaceWith(newEl);

      console.log(`[HotSwap] Replaced legacy element ${tag}`);
    }
  });
}

/**
 * Simple hot swap function without registry support
 * Uses simple DOM replacement for legacy components
 * Note: This is a duplicate of hotSwap from hot-swap-custom-element.ts
 * but kept here for convenience when using this module standalone
 */
export function simpleHotSwap() {
  document.querySelectorAll("[data-stacklive-preview]").forEach((node) => {
    const tag = node.tagName.toLowerCase();
    const newEl = document.createElement(tag);

    // Copy all attributes to preserve component props/state
    Array.from(node.attributes).forEach((attr) =>
      newEl.setAttribute(attr.name, attr.value),
    );

    // Replace the old element with the new one
    // This triggers the custom element's connectedCallback
    node.replaceWith(newEl);
  });
}
