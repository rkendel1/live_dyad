/**
 * Hot swap custom elements in the DOM without page refresh
 */

export function hotSwap() {
  document.querySelectorAll("[data-stacklive-preview]").forEach((node) => {
    const tag = node.tagName.toLowerCase();
    const newEl = document.createElement(tag);

    Array.from(node.attributes).forEach((attr) =>
      newEl.setAttribute(attr.name, attr.value),
    );

    node.replaceWith(newEl);
  });
}
