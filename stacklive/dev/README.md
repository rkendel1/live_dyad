# StackLive Hot Reload Dev Tools

This directory contains the hot reload system for StackLive components.

## Quick Start

The hot reload system starts automatically in development mode. Just run:

```bash
npm start
```

Then edit any of these files to see instant updates:

- `.manifest.ts` files
- `.variants.json` files
- Files in `public/embed-components/`

## Files

- **`unified-watcher.ts`** - Chokidar-based file watcher
- **`change-classifier.ts`** - Classifies file changes by type
- **`hot-install-pipeline.ts`** - Orchestrates the reload process
- **`hot-swap-custom-element.ts`** - DOM element replacement logic
- **`runtime-hot-patch.ts`** - WASM runtime state updates
- **`index.ts`** - Public API exports

## How It Works

1. File changes detected by watcher
2. Change type classified (manifest/variants/embed)
3. Pipeline runs appropriate update steps
4. Custom elements hot-swapped in DOM
5. Runtime patched with new state

All without page refresh! ⚡

## Documentation

For detailed documentation, see:

- [StackLive Hot Reload System](../../docs/stacklive-hot-reload.md)
- [StackLive Architecture](../README.md)

## Tests

Tests are located in `src/__tests__/`:

- `stacklive_change_classifier.test.ts`
- `stacklive_hot_swap.test.ts`
