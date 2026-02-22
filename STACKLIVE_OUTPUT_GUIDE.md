# StackLive Output Guide

## Accessing StackLive Output

StackLive generates embed components and manifests that can now be easily viewed through the Dyad interface.

### Quick Access

1. **Open any app in Dyad**
2. **Click the "StackLive" tab** in the preview panel (next to Preview, Code, Problems, etc.)
3. **Browse generated files** in the sidebar:
   - **Creator Manifest** - Generated manifests from `src/creator/generated/`
   - **Embed Components** - Svelte components from `public/embed-components/`

### What You'll See

The StackLive panel shows:

- **File List**: All generated `.manifest.json`, `.svelte`, and other StackLive files
- **File Viewer**: Syntax-highlighted code viewer with:
  - File metadata (size, last modified time)
  - Copy to clipboard functionality
  - Automatic language detection
- **Real-time Updates**: Click refresh to see newly generated files

### File Types

- **`.manifest.json`** - Component metadata and prop schemas
- **`.runtime.svelte`** - WASM runtime embed components
- **`.upgraded.svelte`** - Legacy Svelte file-driven embeds
- **`.variants.json`** - Component variant definitions

## Configuration

Configure StackLive generation in **Settings** → **StackLive Target**:

- **Generation Target**: Legacy Embed, Runtime Embed, or Creator Manifest
- **Component Type**: Primitive, System, or Experience
- **Variants**: Enable/disable variant schema generation

## Generation Workflow

1. **Create components** using Dyad's AI
2. **Configure generation target** in Settings
3. **Files are automatically generated** to configured directories
4. **View output** in the StackLive panel
5. **Copy and use** the generated code in your projects

## Output Directories

- `src/creator/generated/` - Creator manifest files
- `public/embed-components/` - Embed component files

These directories are watched for hot reload during development.

## Example Output

### Creator Manifest (`test-component.manifest.json`)

```json
{
  "name": "TestComponent",
  "kebabName": "test-component",
  "description": "A test component for StackLive demo",
  "componentType": "primitive",
  "props": [
    {
      "name": "title",
      "type": "string",
      "default": "Hello World"
    }
  ],
  "hasVariants": false
}
```

### Runtime Embed (`test-button.runtime.svelte`)

```svelte
<script lang="ts">
  export let label = "Click me";
  export let onClick: () => void = () => {};
</script>

<button on:click={onClick} class="btn">
  {label}
</button>

<style>
  .btn {
    padding: 0.5rem 1rem;
    background-color: #0066cc;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
</style>
```

## Troubleshooting

### No files showing?

- Ensure you have generated components with StackLive configuration enabled
- Check that the output directories exist
- Click the refresh button in the StackLive panel

### Can't see the StackLive tab?

- Make sure you're viewing an app in the preview panel
- The tab appears between "Security" and "Publish" tabs

### Files not updating?

- Click the refresh button manually
- Check that the file watcher is running (dev mode only)

## Next Steps

- Configure your preferred generation target in Settings
- Generate components using Dyad's AI capabilities
- View and copy the generated code from the StackLive panel
- Integrate StackLive embeds into your applications

For more details on StackLive architecture, see [StackLive README](../stacklive/README.md).
