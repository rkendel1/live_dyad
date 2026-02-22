/**
 * StackLive Generation Target System
 *
 * This module defines the core types and configuration for StackLive generation targets.
 * It enables Dyad to generate different types of StackLive embeds with appropriate
 * props, variant schemas, and capability annotations.
 */

// =============================================================================
// Generation Target Types
// =============================================================================

/**
 * Available generation targets for StackLive output.
 *
 * - stacklive-legacy-embed: Legacy StackLive embed format
 * - stacklive-runtime-embed: WASM runtime render embed format
 * - stacklive-creator-manifest: Creator manifest pack format
 */
export type GenerationTarget =
  | "stacklive-legacy-embed"
  | "stacklive-runtime-embed"
  | "stacklive-creator-manifest";

/**
 * Component type categories for StackLive.
 *
 * - primitive: Basic building blocks
 * - system: System-level components
 * - experience: Complete experience components
 */
export type ComponentType = "primitive" | "system" | "experience";

/**
 * Configuration for StackLive generation target.
 */
export interface StackLiveTargetConfig {
  /**
   * The target output format
   */
  target: GenerationTarget;

  /**
   * The type of component being generated
   */
  componentType: ComponentType;

  /**
   * Whether the component has variants
   */
  hasVariants: boolean;
}

// =============================================================================
// Default Configurations
// =============================================================================

/**
 * Default StackLive target configuration.
 * Uses legacy embed format for primitive components without variants.
 */
export const DEFAULT_STACKLIVE_CONFIG: StackLiveTargetConfig = {
  target: "stacklive-legacy-embed",
  componentType: "primitive",
  hasVariants: false,
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Checks if a generation target is a StackLive target.
 */
export function isStackLiveTarget(target: GenerationTarget): boolean {
  return (
    target === "stacklive-legacy-embed" ||
    target === "stacklive-runtime-embed" ||
    target === "stacklive-creator-manifest"
  );
}

/**
 * Gets a human-readable label for a generation target.
 */
export function getTargetLabel(target: GenerationTarget): string {
  switch (target) {
    case "stacklive-legacy-embed":
      return "Legacy Embed";
    case "stacklive-runtime-embed":
      return "Runtime Embed";
    case "stacklive-creator-manifest":
      return "Creator Manifest";
    default:
      return target;
  }
}

/**
 * Gets a human-readable label for a component type.
 */
export function getComponentTypeLabel(componentType: ComponentType): string {
  switch (componentType) {
    case "primitive":
      return "Primitive";
    case "system":
      return "System";
    case "experience":
      return "Experience";
    default:
      return componentType;
  }
}
