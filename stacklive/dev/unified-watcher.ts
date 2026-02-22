/**
 * Unified file watcher for StackLive hot reload
 */

import chokidar from "chokidar";
import { classifyChange } from "./change-classifier";
import { runHotInstallPipeline } from "./hot-install-pipeline";
import log from "electron-log";

const logger = log.scope("stacklive-watcher");

let watcher: chokidar.FSWatcher | null = null;

export function startStackLiveWatcher() {
  if (watcher) {
    logger.warn("StackLive watcher already running");
    return;
  }

  logger.info("Starting StackLive file watcher");

  watcher = chokidar.watch(
    ["src/creator/**/*", "public/embed-components/**/*"],
    {
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 100,
      },
    },
  );

  watcher.on("change", async (path) => {
    logger.info(`File changed: ${path}`);
    const change = classifyChange(path);

    if (change === "unknown") {
      logger.debug(`Ignoring change to ${path}`);
      return;
    }

    try {
      await runHotInstallPipeline(change);
      logger.info(`Hot reload completed for ${change} change`);
    } catch (error) {
      logger.error("Hot reload error:", error);
    }
  });

  watcher.on("error", (error) => {
    logger.error("Watcher error:", error);
  });

  logger.info("StackLive watcher started");
}

export function stopStackLiveWatcher() {
  if (watcher) {
    logger.info("Stopping StackLive file watcher");
    watcher.close();
    watcher = null;
  }
}
