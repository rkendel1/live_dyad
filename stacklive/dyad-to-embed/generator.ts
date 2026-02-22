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
}

export async function generateEmbeds({
  dyad,
  outDir,
}: GenerateEmbedsOptions): Promise<void> {
  const legacyTpl = Handlebars.compile(
    await fs.readFile(getTemplatePath("legacy.svelte.hbs"), "utf8"),
  );

  const wasmTpl = Handlebars.compile(
    await fs.readFile(getTemplatePath("wasm-render.svelte.hbs"), "utf8"),
  );

  // Ensure output directory exists
  await fs.mkdir(outDir, { recursive: true });

  for (const component of dyad.components) {
    const names: ComponentNames = toNames(component.name);
    const props: MappedProp[] = mapProps(component.props);

    const baseData: TemplateData = {
      ...names,
      props,
      description: component.description || "",
    };

    // Generate legacy Svelte embed
    await fs.writeFile(
      path.join(outDir, `${names.kebab}.upgraded.svelte`),
      legacyTpl(baseData),
    );

    // Generate WASM runtime embed
    await fs.writeFile(
      path.join(outDir, `${names.kebab}.runtime.svelte`),
      wasmTpl(baseData),
    );
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
