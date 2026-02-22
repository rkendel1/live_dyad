/**
 * Dyad Configuration
 *
 * This configuration file enables Dyad to:
 * - Detect this project as a StackLive integration
 * - Know where to write generated code
 * - Configure development server integration
 */

export default {
  project: "stacklive",

  paths: {
    // Where Dyad writes generated manifest files and components
    generated: "src/creator/generated",
    // Where embed components are stored
    embedComponents: "public/embed-components",
  },

  dev: {
    // Default development server URL
    server: "http://localhost:32100",
    // Auto-start file watcher in dev mode
    watcher: true,
  },
};
