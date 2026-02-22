/**
 * Hot install pipeline for processing file changes
 */

import { ChangeType } from "./change-classifier";
import { runtimeHotPatch } from "./runtime-hot-patch";
import { hotSwap } from "./hot-swap-custom-element";

/**
 * Stub for installing generated primitives
 * TODO: Implement when creator-loader infrastructure is available
 */
async function installGeneratedPrimitives(): Promise<any[]> {
  // This will eventually load manifests from the file system
  // and register them with the builder
  console.log("[Hot Reload] Installing generated primitives");
  return [];
}

/**
 * Stub for auto-creating experiences
 * TODO: Implement when experience infrastructure is available
 */
function autoCreateExperiences(_manifests: any[]): void {
  // This will create/update experiences based on the manifests
  console.log("[Hot Reload] Auto-creating experiences from manifests");
}

export async function runHotInstallPipeline(change: ChangeType) {
  console.log(`[Hot Reload] Processing ${change} change`);

  const manifests = await installGeneratedPrimitives();

  autoCreateExperiences(manifests);

  if (change === "embed") {
    hotSwap();
  }

  await runtimeHotPatch();
}
