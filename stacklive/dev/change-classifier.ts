/**
 * Classifies file changes for hot reload
 */

export type ChangeType = "manifest" | "variants" | "embed" | "unknown";

export function classifyChange(path: string): ChangeType {
  if (path.endsWith(".manifest.ts")) return "manifest";
  if (path.endsWith(".variants.json")) return "variants";
  if (path.includes("embed-components")) return "embed";

  return "unknown";
}
