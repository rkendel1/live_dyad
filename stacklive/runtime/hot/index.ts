/**
 * StackLive Runtime Hot Reload System
 *
 * Provides state-preserving hot reload capabilities for StackLive components.
 * Enables swapping component implementations without tearing down runtime state.
 */

export {
  HotRegistry,
  getHotRegistry,
  resetHotRegistry,
  type HotModule,
  type MountedInstance,
  type MountContext,
} from "./registry";
