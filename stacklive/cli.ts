import { generateEmbeds } from "./dyad-to-embed/generator";
import type { DyadOutput } from "./dyad-to-embed/types";

async function main() {
  try {
    // This should be dynamically imported based on where the dyad output is located
    // For now, we'll provide an example structure
    const dyadOutputPath = "../.dyad/output.json";

    let dyadOutput: DyadOutput;

    try {
      const fs = await import("node:fs/promises");
      const outputContent = await fs.readFile(dyadOutputPath, "utf8");
      dyadOutput = JSON.parse(outputContent);
    } catch (error) {
      console.error(
        `Failed to load dyad output from ${dyadOutputPath}:`,
        error,
      );
      console.log(
        "Using example structure. Please update the path to your actual dyad output.",
      );
      dyadOutput = {
        components: [],
      };
    }

    await generateEmbeds({
      dyad: dyadOutput,
      outDir: "../src/embed-upgrader-tool/components-upgraded",
    });

    console.log("✅ Successfully generated StackLive embeds!");
    console.log(
      "   Output directory: ../src/embed-upgrader-tool/components-upgraded",
    );
  } catch (error) {
    console.error("❌ Failed to generate embeds:", error);
    process.exit(1);
  }
}

main();
