import { generateEmbeds } from "./dyad-to-embed/generator";
import fs from "node:fs/promises";
import path from "node:path";

async function testGenerator() {
  console.log("🧪 Testing Dyad → StackLive Codegen Adapter");
  console.log("=".repeat(50));

  try {
    // Load example data
    const exampleData = JSON.parse(
      await fs.readFile(
        path.join(process.cwd(), "stacklive/example-output.json"),
        "utf8",
      ),
    );

    console.log(
      `\n✓ Loaded example data with ${exampleData.components.length} components`,
    );

    // Create test output directory
    const testOutDir = "/tmp/stacklive-test-output";
    await fs.mkdir(testOutDir, { recursive: true });

    console.log(`✓ Created test output directory: ${testOutDir}`);

    // Generate embeds
    await generateEmbeds({
      dyad: exampleData,
      outDir: testOutDir,
    });

    console.log(`\n✅ Successfully generated embeds!`);

    // List generated files
    const files = await fs.readdir(testOutDir);
    console.log(`\n📁 Generated ${files.length} files:`);
    for (const file of files.sort()) {
      const stats = await fs.stat(path.join(testOutDir, file));
      console.log(`   - ${file} (${stats.size} bytes)`);
    }

    // Show sample output
    console.log(`\n📄 Sample output (user-card.upgraded.svelte):`);
    console.log("=".repeat(50));
    const sampleContent = await fs.readFile(
      path.join(testOutDir, "user-card.upgraded.svelte"),
      "utf8",
    );
    console.log(sampleContent);
    console.log("=".repeat(50));

    console.log(`\n✓ Test completed successfully!`);
    console.log(`\nYou can inspect all generated files at: ${testOutDir}`);
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  }
}

testGenerator();
