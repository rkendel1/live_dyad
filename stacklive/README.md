# Dyad → StackLive Codegen Adapter

This module provides a code generation adapter that converts Dyad output into StackLive embeds.

## Installation

Before using this module, ensure you have installed the required dependencies:

```bash
npm install
```

The main dependencies required are:

- `handlebars` - Template engine for generating Svelte components
- `@types/handlebars` - TypeScript type definitions for Handlebars

## Features

- **Dual-mode embed generation**:
  1. Legacy Svelte file-driven embed
  2. Render-only WASM runtime embed
- **Automatic prop schema mapping** to StackLive's `defineSystemEmbed`
- **Naming conventions**: Automatic conversion between kebab, snake, and Pascal case
- **Svelte 4 custom element** wrapping for both modes
- **Registry generation**: Creates a registry file for easy import management

## Directory Structure

```
stacklive/
├── cli.ts                     # CLI entry point
└── dyad-to-embed/
    ├── generator.ts           # Core generation logic
    ├── prop-mapper.ts         # Prop schema mapping
    ├── name-utils.ts          # Naming convention utilities
    ├── types.ts               # TypeScript type definitions
    └── templates/
        ├── legacy.svelte.hbs  # Legacy Svelte embed template
        ├── wasm-render.svelte.hbs  # WASM runtime embed template
        └── registry.ts.hbs    # Registry file template
```

## Usage

### Quick Start

First, ensure you have a Dyad output JSON file. An example is provided in `example-output.json`.

### Running the CLI

```bash
cd stacklive
npx tsx cli.ts
```

### Testing the Utilities

You can verify the utility functions work correctly without installing all dependencies:

```bash
cd stacklive
node verify-utils.js
```

### Testing the Full Generator

To test the complete generation with templates:

```bash
cd stacklive
npx tsx test-generator.ts
```

This will generate example embeds in `/tmp/stacklive-test-output`.

### Programmatic Usage

```typescript
import { generateEmbeds } from "./dyad-to-embed/generator";
import dyadOutput from "../.dyad/output.json";

await generateEmbeds({
  dyad: dyadOutput,
  outDir: "../src/embed-upgrader-tool/components-upgraded",
});
```

## Input Format

The generator expects a Dyad output JSON file with the following structure:

```json
{
  "components": [
    {
      "name": "my_component",
      "description": "Component description",
      "props": [
        {
          "name": "propName",
          "type": "string",
          "default": "defaultValue"
        }
      ]
    }
  ]
}
```

## Output

For each component in the Dyad output, the generator creates:

1. **`{component-name}.upgraded.svelte`** - Legacy Svelte file-driven embed
2. **`{component-name}.runtime.svelte`** - WASM runtime embed
3. **`registry.ts`** - A registry file that exports all generated embeds

## Naming Conventions

The generator automatically converts component names:

- `my_component` → `my-component` (kebab case for file names)
- `my_component` → `MyComponent` (Pascal case for class names)
- `my_component` → `my_component` (snake case preserved)

## Integration

The generated embeds are designed to work with:

- StackLive embed SDK
- StackLive runtime SDK
- Rollup build pipeline
- Your existing embed upgrader tool

No changes are required to your runtime host to use these embeds.
