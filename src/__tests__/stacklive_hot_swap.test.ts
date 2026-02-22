import { describe, it, expect, beforeEach } from "vitest";
import { hotSwap } from "../../stacklive/dev/hot-swap-custom-element";

describe("hot-swap-custom-element", () => {
  describe("hotSwap", () => {
    beforeEach(() => {
      // Clear the DOM before each test
      document.body.innerHTML = "";
    });

    it("should swap elements with data-stacklive-preview attribute", () => {
      // Create a test element
      const originalElement = document.createElement("my-component");
      originalElement.setAttribute("data-stacklive-preview", "true");
      originalElement.setAttribute("custom-prop", "value");
      originalElement.className = "test-class";
      document.body.appendChild(originalElement);

      // Call hotSwap
      hotSwap();

      // Verify the element was replaced
      const newElement = document.body.querySelector("my-component");
      expect(newElement).toBeTruthy();
      expect(newElement?.getAttribute("data-stacklive-preview")).toBe("true");
      expect(newElement?.getAttribute("custom-prop")).toBe("value");
      expect(newElement?.className).toBe("test-class");

      // Verify it's a different instance
      expect(newElement).not.toBe(originalElement);
    });

    it("should swap multiple elements", () => {
      // Create multiple test elements
      const elem1 = document.createElement("component-one");
      elem1.setAttribute("data-stacklive-preview", "true");
      elem1.setAttribute("id", "first");
      document.body.appendChild(elem1);

      const elem2 = document.createElement("component-two");
      elem2.setAttribute("data-stacklive-preview", "true");
      elem2.setAttribute("id", "second");
      document.body.appendChild(elem2);

      // Call hotSwap
      hotSwap();

      // Verify both elements were replaced
      const newElem1 = document.querySelector("#first");
      const newElem2 = document.querySelector("#second");

      expect(newElem1).toBeTruthy();
      expect(newElem2).toBeTruthy();
      expect(newElem1?.tagName.toLowerCase()).toBe("component-one");
      expect(newElem2?.tagName.toLowerCase()).toBe("component-two");
    });

    it("should ignore elements without data-stacklive-preview", () => {
      // Create an element without the attribute
      const normalElement = document.createElement("div");
      normalElement.className = "normal";
      document.body.appendChild(normalElement);

      // Call hotSwap
      hotSwap();

      // Verify the element was not replaced
      const element = document.body.querySelector(".normal");
      expect(element).toBe(normalElement);
    });

    it("should copy all attributes to new element", () => {
      const elem = document.createElement("test-component");
      elem.setAttribute("data-stacklive-preview", "true");
      elem.setAttribute("attr1", "value1");
      elem.setAttribute("attr2", "value2");
      elem.setAttribute("data-custom", "custom-value");
      document.body.appendChild(elem);

      hotSwap();

      const newElem = document.body.querySelector("test-component");
      expect(newElem?.getAttribute("attr1")).toBe("value1");
      expect(newElem?.getAttribute("attr2")).toBe("value2");
      expect(newElem?.getAttribute("data-custom")).toBe("custom-value");
      expect(newElem?.getAttribute("data-stacklive-preview")).toBe("true");
    });
  });
});
