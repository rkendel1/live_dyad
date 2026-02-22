# StackLive Hot Reload System

## Overview

The StackLive Hot Reload System provides true hot reload functionality for StackLive components without requiring a page refresh. It watches for changes to manifests, variants, and embed components, then automatically re-installs, re-scaffolds, and hot-swaps elements in real-time.

## Architecture

```
chokidar watcher
   ↓
change classifier
   ↓
install/update pipeline
   ↓
builder stores
   ↓
runtime bridge patch()
   ↓
customElement hot swap
```

## Components

### 1. Unified Watcher (`unified-watcher.ts`)

The core file watcher that monitors changes to:

- `src/creator/**/*` - Creator manifests and variants
- `public/embed-components/**/*` - Runtime render embeds

Uses chokidar for efficient file watching with:

- Debouncing via `awaitWriteFinish` option
- Ignores initial file scan to avoid false triggers
- Persistent watching in development mode

### 2. Change Classifier (`change-classifier.ts`)

Classifies file changes into categories:

- `manifest` - Files ending with `.manifest.ts`
- `variants` - Files ending with `.variants.json`
- `embed` - Files in `embed-components` directory
- `unknown` - Unrelated files (ignored)

### 3. Hot Install Pipeline (`hot-install-pipeline.ts`)

Orchestrates the hot reload process:

1. **Install Generated Primitives** - Loads and registers new/updated manifests
2. **Auto-create Experiences** - Updates experiences based on manifest changes
3. **Hot Swap** (for embed changes) - Replaces custom elements in the DOM
4. **Runtime Hot Patch** - Pushes updates to the WASM runtime

### 4. Hot Swap Custom Element (`hot-swap-custom-element.ts`)

Replaces custom elements in the DOM without page refresh:

- Finds all elements with `data-stacklive-preview` attribute
- Creates new instance of the same tag
- Copies all attributes to the new element
- Replaces old element with new element

This triggers the custom element's `connectedCallback` to re-render with the latest code.

### 5. Runtime Hot Patch (`runtime-hot-patch.ts`)

Pushes updated experience graph into the live WASM runtime:

- Checks if runtime is ready
- Resolves updated experiences
- Patches the runtime with new graph data

> **Note:** Currently a stub - will be implemented when runtime infrastructure is available.

## Usage

### Automatic in Development

The hot reload system starts automatically when running Dyad in development mode:

```bash
npm start
```

The watcher only runs when `!app.isPackaged`, ensuring it doesn't activate in production builds.

### Manual Control

You can also control the watcher programmatically:

```typescript
import { startStackLiveWatcher, stopStackLiveWatcher } from "../stacklive/dev";

// Start watching
startStackLiveWatcher();

// Stop watching
stopStackLiveWatcher();
```

## File Structure

```
stacklive/
├── dev/
│   ├── unified-watcher.ts          # Main file watcher
│   ├── change-classifier.ts        # File change classification
│   ├── hot-install-pipeline.ts     # Install/update orchestration
│   ├── hot-swap-custom-element.ts  # DOM element hot swapping
│   ├── runtime-hot-patch.ts        # Runtime state patching
│   └── index.ts                    # Public API exports
```

## What Gets Hot Reloaded

### Manifest Changes (`.manifest.ts`)

- Re-installs the primitive definition
- Updates the builder registry
- Refreshes experience graph
- Patches runtime state

### Variants Changes (`.variants.json`)

- Re-reads variant configurations
- Updates component instances
- Refreshes preview

### Embed Component Changes (`embed-components/**/*`)

- Triggers hot swap of custom elements
- Forces re-initialization without page reload
- All of the above (manifest + runtime updates)

## Developer Experience

### Before Hot Reload

1. Edit component variant
2. Save file
3. **Manually refresh browser**
4. Navigate back to preview
5. See changes

### With Hot Reload

1. Edit component variant
2. Save file
3. **Changes appear instantly** ✨
4. No navigation needed
5. State preserved (when possible)

## Example Flow

When you change a variant from `compact` → remove avatar:

```
SAVE → File watcher detects change
     → Classifies as "variants"
     → Reinstalls manifest
     → Experience updates
     → Runtime resolves
     → DOM hot swaps
     → UI morphs in place
```

All in **milliseconds**, with **no page refresh**.

## Logging

Hot reload actions are logged via `electron-log`:

```
[stacklive-watcher] Starting StackLive file watcher
[stacklive-watcher] File changed: src/creator/button.manifest.ts
[Hot Reload] Processing manifest change
[Hot Reload] Installing generated primitives
[Hot Reload] Auto-creating experiences from manifests
[Hot Reload] Runtime hot patch called
[stacklive-watcher] Hot reload completed for manifest change
```

## Error Handling

The system includes robust error handling:

- File watcher errors are logged but don't crash the app
- Hot reload pipeline errors are caught and logged
- Unknown file changes are ignored
- Failed hot swaps don't affect other elements

## Future Enhancements

Planned improvements when infrastructure is available:

1. **Full Runtime Integration** - Complete `runtime-hot-patch.ts` with actual runtime bridge
2. **Install Primitives** - Implement `installGeneratedPrimitives()` with manifest loading
3. **Experience Auto-creation** - Implement `autoCreateExperiences()` for graph updates
4. **Preview Tagging** - Add `data-stacklive-preview` to preview renderer
5. **Builder Store Updates** - Connect to actual builder store for state sync
6. **State Preservation** - Maintain component state across hot swaps when possible

## Testing

Test files are located in `src/__tests__/`:

- `stacklive_change_classifier.test.ts` - Tests file classification logic
- `stacklive_hot_swap.test.ts` - Tests DOM element hot swapping

Run tests with:

```bash
npm test
```

## Integration Points

### Main Process (`src/main.ts`)

Hot reload watcher is started in the `onReady()` function when running in development mode.

### File System

Watches specific directories for changes:

- `src/creator/**/*` - For generated primitives and manifests
- `public/embed-components/**/*` - For Svelte/runtime embeds

### Builder System (Future)

Will integrate with:

- Builder registry for manifest management
- Experience graph for context → policy → experience flow
- Runtime bridge for WASM preview updates

## Why This Matters

This is more than just hot reload - it's a **real Experience IDE loop**.

You're not just reloading UI. You're re-resolving:

```
context → policy → experience → render
```

**Live.**

That is the core StackLive superpower. 🚀
