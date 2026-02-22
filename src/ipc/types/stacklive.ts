/**
 * StackLive IPC Contracts
 *
 * Type-safe IPC interface for StackLive output management
 */

import { z } from "zod";
import { defineContract, createClient } from "../contracts/core";

// =============================================================================
// Schemas
// =============================================================================

const StackLiveFileSchema = z.object({
  path: z.string(),
  name: z.string(),
  type: z.enum(["manifest", "svelte", "json", "unknown"]),
  size: z.number(),
  modifiedAt: z.string(),
});

const StackLiveDirectorySchema = z.object({
  creatorGenerated: z.array(StackLiveFileSchema),
  embedComponents: z.array(StackLiveFileSchema),
});

// =============================================================================
// Contracts
// =============================================================================

export const stackliveContracts = {
  getFiles: defineContract({
    channel: "stacklive:get-files",
    input: z.void(),
    output: StackLiveDirectorySchema,
  }),

  readFile: defineContract({
    channel: "stacklive:read-file",
    input: z.object({ path: z.string() }),
    output: z.object({
      content: z.string(),
      path: z.string(),
    }),
  }),
} as const;

// =============================================================================
// Client
// =============================================================================

export const stackliveClient = createClient(stackliveContracts);

// =============================================================================
// Type Exports
// =============================================================================

export type StackLiveFile = z.infer<typeof StackLiveFileSchema>;
export type StackLiveDirectory = z.infer<typeof StackLiveDirectorySchema>;

export type GetStackLiveFilesInput = z.infer<
  (typeof stackliveContracts)["getFiles"]["input"]
>;
export type GetStackLiveFilesOutput = z.infer<
  (typeof stackliveContracts)["getFiles"]["output"]
>;

export type ReadStackLiveFileInput = z.infer<
  (typeof stackliveContracts)["readFile"]["input"]
>;
export type ReadStackLiveFileOutput = z.infer<
  (typeof stackliveContracts)["readFile"]["output"]
>;
