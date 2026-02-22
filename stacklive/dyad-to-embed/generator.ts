import fs from "node:fs/promises";
import path from "node:path";
import Handlebars from "handlebars";
import { mapProps } from "./prop-mapper";
import { toNames } from "./name-utils";
import type {
  GenerateEmbedsOptions,
  ComponentNames,
  MappedProp,
} from "./types";

interface TemplateData {
  kebab: string;
  pascal: string;
  snake: string;
  props: MappedProp[];
  description: string;
  componentType?: string;
  hasVariants?: boolean;
}

export async function generateEmbeds({
  dyad,
  outDir,
  targetConfig,
}: GenerateEmbedsOptions): Promise<void> {
  // Determine which outputs to generate based on target config
  const generateLegacy =
    !targetConfig || targetConfig.target === "stacklive-legacy-embed";
  const generateRuntime =
    !targetConfig || targetConfig.target === "stacklive-runtime-embed";
  const generateCreatorManifest =
    targetConfig?.target === "stacklive-creator-manifest";

  // Load templates
  const legacyTpl = generateLegacy
    ? Handlebars.compile(
        await fs.readFile(getTemplatePath("legacy.svelte.hbs"), "utf8"),
      )
    : null;

  const wasmTpl = generateRuntime
    ? Handlebars.compile(
        await fs.readFile(getTemplatePath("wasm-render.svelte.hbs"), "utf8"),
      )
    : null;

  // Ensure output directory exists
  await fs.mkdir(outDir, { recursive: true });

  for (const component of dyad.components) {
    const names: ComponentNames = toNames(component.name);
    const props: MappedProp[] = mapProps(component.props);

    const baseData: TemplateData = {
      ...names,
      props,
      description: component.description || "",
      componentType: targetConfig?.componentType,
      hasVariants: targetConfig?.hasVariants,
    };

    // Generate legacy Svelte embed if requested
    if (generateLegacy && legacyTpl) {
      await fs.writeFile(
        path.join(outDir, `${names.kebab}.upgraded.svelte`),
        legacyTpl(baseData),
      );
    }

    // Generate WASM runtime embed if requested
    if (generateRuntime && wasmTpl) {
      await fs.writeFile(
        path.join(outDir, `${names.kebab}.runtime.svelte`),
        wasmTpl(baseData),
      );
    }

    // Generate creator manifest if requested
    if (generateCreatorManifest) {
      const manifest = {
        name: names.pascal,
        kebabName: names.kebab,
        description: component.description || "",
        componentType: targetConfig?.componentType || "primitive",
        props: props.map((p) => ({
          name: p.name,
          type: p.type,
          default: p.default,
        })),
        hasVariants: targetConfig?.hasVariants || false,
      };

      await fs.writeFile(
        path.join(outDir, `${names.kebab}.manifest.json`),
        JSON.stringify(manifest, null, 2),
      );
    }
  }

  // Generate registry file
  const registryTpl = Handlebars.compile(
    await fs.readFile(getTemplatePath("registry.ts.hbs"), "utf8"),
  );

  const componentsData = dyad.components.map((component) => ({
    ...toNames(component.name),
    props: mapProps(component.props),
    description: component.description || "",
  }));

  await fs.writeFile(
    path.join(outDir, "registry.ts"),
    registryTpl({ components: componentsData }),
  );
}

function getTemplatePath(file: string): string {
  return new URL(`./templates/${file}`, import.meta.url).pathname;
}
