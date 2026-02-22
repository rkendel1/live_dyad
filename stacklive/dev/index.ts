/**
 * StackLive Hot Reload System
 *
 * This module provides true hot reload for StackLive components.
 * It watches for changes to manifests, variants, and embed components,
 * then automatically re-installs, re-scaffolds, and hot-swaps elements
 * without requiring a page refresh.
 */

export { startStackLiveWatcher, stopStackLiveWatcher } from "./unified-watcher";
export { classifyChange } from "./change-classifier";
export { runHotInstallPipeline } from "./hot-install-pipeline";
export { hotSwap } from "./hot-swap-custom-element";
export { runtimeHotPatch } from "./runtime-hot-patch";

export type { ChangeType } from "./change-classifier";
