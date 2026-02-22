# StackLive Generation Target System

This document describes the StackLive generation target system that has been integrated into Dyad.

## Overview

The StackLive generation target system allows Dyad to natively output different types of StackLive embeds and components. Instead of being a post-processor, this system is integrated into Dyad's core generation pipeline.

## Architecture

The system modifies Dyad's generation flow as follows:

**Before:**

```
Prompt → AST → Component Model → Framework Emitter → Files
```

**After:**

```
Prompt → AST → Component Model → StackLive Target Resolver → Files
                                        ↓
                                   ├─ legacy embed
                                   ├─ runtime render embed
                                   └─ creator manifest pack
```

## Components

### 1. Core Types (`src/lib/stacklive-generation-target.ts`)

Defines the core types and configuration:

- **GenerationTarget**: The output format (`stacklive-legacy-embed`, `stacklive-runtime-embed`, `stacklive-creator-manifest`)
- **ComponentType**: The component category (`primitive`, `system`, `experience`)
- **StackLiveTargetConfig**: The configuration object combining target, component type, and variant support

**Helper Functions:**

- `isStackLiveTarget()`: Validates if a target is a StackLive target
- `getTargetLabel()`: Returns human-readable labels for targets
- `getComponentTypeLabel()`: Returns human-readable labels for component types
- `DEFAULT_STACKLIVE_CONFIG`: The default configuration

### 2. Settings Integration (`src/lib/schemas.ts`)

The StackLive target configuration is stored in user settings:

```typescript
export const UserSettingsSchema = z.object({
  // ... other settings
  stackliveTargetConfig: StackLiveTargetConfigSchema.optional(),
});
```

This allows users to set their preferred generation target globally.

### 3. UI Component (`src/components/StackLiveTargetSelector.tsx`)

A React component that provides a user interface for selecting:

- Generation target (legacy embed / runtime embed / creator manifest)
- Component type (primitive / system / experience)
- Variant support (toggle)

### 4. Settings Page Integration (`src/pages/settings.tsx`)

The StackLive settings section has been added to the settings page, allowing users to configure their generation preferences.

### 5. Generation Logic (`stacklive/dyad-to-embed/generator.ts`)

The generator has been updated to:

- Accept an optional `targetConfig` parameter
- Generate only the requested output format based on the target
- Include component type and variant information in generated files
- Support creator manifest generation (JSON format)

## Usage

### For Users

1. Navigate to Settings → StackLive Generation Settings
2. Select your preferred generation target
3. Choose the component type
4. Toggle variant support if needed
5. The settings will be saved and used for future generations

### For Developers

When calling the generation function:

```typescript
import { generateEmbeds } from "./stacklive/dyad-to-embed/generator";
import { DEFAULT_STACKLIVE_CONFIG } from "./src/lib/stacklive-generation-target";

// Generate with default config (all formats)
await generateEmbeds({
  dyad: componentData,
  outDir: "./output",
});

// Generate only runtime embeds
await generateEmbeds({
  dyad: componentData,
  outDir: "./output",
  targetConfig: {
    target: "stacklive-runtime-embed",
    componentType: "primitive",
    hasVariants: false,
  },
});

// Generate creator manifest
await generateEmbeds({
  dyad: componentData,
  outDir: "./output",
  targetConfig: {
    target: "stacklive-creator-manifest",
    componentType: "experience",
    hasVariants: true,
  },
});
```

## Generation Outputs

### Legacy Embed (`stacklive-legacy-embed`)

- Generates `.upgraded.svelte` files
- Uses the legacy StackLive embed format
- Includes component metadata

### Runtime Embed (`stacklive-runtime-embed`)

- Generates `.runtime.svelte` files
- Uses the WASM runtime render format
- Optimized for runtime rendering

### Creator Manifest (`stacklive-creator-manifest`)

- Generates `.manifest.json` files
- Includes component metadata, props, and variant information
- Designed for creator tools and manifest packs

## Testing

Unit tests are available in `src/__tests__/stacklive_generation_target.test.ts`:

```bash
npm test stacklive_generation_target.test.ts
```

## Future Enhancements

Potential improvements:

- Per-app generation target configuration
- Generation target templates/presets
- Automatic variant schema generation
- Enhanced creator manifest with capability annotations
