import { createTypedHandler } from "./base";
import { stackliveContracts } from "../types/stacklive";
import fs from "node:fs/promises";
import path from "node:path";
import type { StackLiveFile } from "../types/stacklive";

const CREATOR_GENERATED_DIR = path.join(
  process.cwd(),
  "src",
  "creator",
  "generated",
);
const EMBED_COMPONENTS_DIR = path.join(
  process.cwd(),
  "public",
  "embed-components",
);

/**
 * Get file type based on extension
 */
function getFileType(filename: string): StackLiveFile["type"] {
  if (
    filename.endsWith(".manifest.json") ||
    filename.endsWith(".manifest.ts")
  ) {
    return "manifest";
  }
  if (filename.endsWith(".svelte")) {
    return "svelte";
  }
  if (filename.endsWith(".json")) {
    return "json";
  }
  return "unknown";
}

/**
 * List files in a directory and return StackLiveFile objects
 */
async function listFiles(dirPath: string): Promise<StackLiveFile[]> {
  try {
    await fs.access(dirPath);
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    const files: StackLiveFile[] = [];
    for (const entry of entries) {
      if (entry.isFile() && !entry.name.startsWith(".")) {
        const filePath = path.join(dirPath, entry.name);
        const stats = await fs.stat(filePath);

        files.push({
          path: filePath,
          name: entry.name,
          type: getFileType(entry.name),
          size: stats.size,
          modifiedAt: stats.mtime.toISOString(),
        });
      }
    }

    return files.sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    // Directory doesn't exist or can't be accessed
    return [];
  }
}

export function registerStackLiveHandlers() {
  createTypedHandler(stackliveContracts.getFiles, async () => {
    const [creatorGenerated, embedComponents] = await Promise.all([
      listFiles(CREATOR_GENERATED_DIR),
      listFiles(EMBED_COMPONENTS_DIR),
    ]);

    return {
      creatorGenerated,
      embedComponents,
    };
  });

  createTypedHandler(
    stackliveContracts.readFile,
    async (_, { path: filePath }) => {
      try {
        const content = await fs.readFile(filePath, "utf-8");
        return {
          content,
          path: filePath,
        };
      } catch (error) {
        throw new Error(
          `Failed to read file: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    },
  );
}
