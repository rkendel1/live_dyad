/**
 * Dyad Development Watcher
 * 
 * Wrapper for starting the StackLive file watcher in development mode.
 * This is called automatically when the Electron app starts in dev mode.
 */

import { startStackLiveWatcher } from "../../stacklive/dev";
import log from "electron-log";

const logger = log.scope("dyad-dev");

/**
 * Initialize Dyad development mode features:
 * - Start file watcher for hot reload
 * - Monitor generated code changes
 * - Auto-install primitives
 */
export function startDyadDev() {
  if (process.env.NODE_ENV === "production") {
    logger.debug("Skipping Dyad dev mode in production");
    return;
  }

  logger.info("🧠 Starting Dyad development watcher");
  
  try {
    startStackLiveWatcher();
    logger.info("🧠 Dyad watcher connected");
  } catch (error) {
    logger.error("Failed to start Dyad watcher:", error);
  }
}
