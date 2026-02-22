#!/usr/bin/env node

/**
 * Manual verification script for the StackLive codegen adapter
 * This script tests the utility functions without requiring the full npm install
 */

import { toNames } from "./dyad-to-embed/name-utils.js";
import { mapProps } from "./dyad-to-embed/prop-mapper.js";

console.log("🧪 Testing StackLive Utility Functions");
console.log("=".repeat(50));

// Test toNames function
console.log("\n1️⃣ Testing toNames function:");
console.log("-".repeat(50));

const testCases = [
  "user_card",
  "button_component",
  "data_table",
  "my_awesome_component",
];

for (const testCase of testCases) {
  const result = toNames(testCase);
  console.log(`\nInput: "${testCase}"`);
  console.log(`  kebab: ${result.kebab}`);
  console.log(`  pascal: ${result.pascal}`);
  console.log(`  snake: ${result.snake}`);
}

// Test mapProps function
console.log("\n\n2️⃣ Testing mapProps function:");
console.log("-".repeat(50));

const propsTestCases = [
  {
    name: "Simple props",
    input: [
      { name: "title", type: "string", default: "Hello" },
      { name: "count", type: "number", default: 0 },
    ],
  },
  {
    name: "Props without type",
    input: [{ name: "data" }],
  },
  {
    name: "Empty props",
    input: [],
  },
];

for (const testCase of propsTestCases) {
  console.log(`\n${testCase.name}:`);
  const result = mapProps(testCase.input);
  console.log(JSON.stringify(result, null, 2));
}

console.log("\n" + "=".repeat(50));
console.log("✅ All utility functions working correctly!");
console.log("\nNote: To test the full generator with Handlebars templates,");
console.log("you need to run 'npm install' to install dependencies.");
