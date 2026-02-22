/**
 * Hot swap custom elements in the DOM without page refresh
 *
 * Note: This implementation does not preserve:
 * - Child nodes (custom elements should re-render their own content)
 * - Event listeners (custom elements should re-attach listeners in connectedCallback)
 *
 * This is acceptable for Svelte custom elements which manage their own
 * internal state and rendering via the custom element lifecycle.
 */

export function hotSwap() {
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
