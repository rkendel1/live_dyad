# Dyad StackLive Integration

This directory contains the bridge between Dyad and StackLive for development workflows.

## Files

### `start-dyad-watcher.ts`

Initializes the StackLive file watcher in development mode. This is called automatically when the Electron app starts in non-packaged (development) mode.

**Features:**

- Auto-starts file watcher for hot reload
- Monitors generated code changes in `src/creator/generated/`
- Monitors embed components in `public/embed-components/`
- Auto-installs primitives when files change

**Usage:**

The watcher starts automatically when you run:

```bash
npm run dev
# or
npm start
```

Console output:

```
🧠 Starting Dyad development watcher
🧠 Dyad watcher connected
```

## Development Workflow

1. Start the Dyad app in dev mode: `npm run dev`
2. The watcher automatically connects and monitors file changes
3. When Dyad generates code to `src/creator/generated/`, the watcher:
   - Detects the change
   - Classifies the change type (manifest, variant, embed component)
   - Runs the hot install pipeline
   - Updates the runtime
   - Triggers hot reload

## Configuration

See the root-level `dyad.config.ts` for configuration options including:

- Project type
- Generated code paths
- Development server URL
- Watcher settings
