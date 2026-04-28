import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  appType: "mpa",
  server: {
    host: "127.0.0.1",
    port: 5173
  },
  preview: {
    host: "127.0.0.1",
    port: 4173
  },
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        roadmap: resolve(__dirname, "pages/roadmap.html"),
        notes: resolve(__dirname, "pages/notes.html"),
        labs: resolve(__dirname, "pages/labs.html"),
        strategies: resolve(__dirname, "pages/strategies.html"),
        debugLog: resolve(__dirname, "pages/debug-log.html"),
        weeklyReview: resolve(__dirname, "pages/weekly-review.html"),
        about: resolve(__dirname, "pages/about.html"),
        learningLog: resolve(__dirname, "pages/learning-log.html"),
        codeExperiments: resolve(__dirname, "pages/code-experiments.html"),
        strategyLab: resolve(__dirname, "pages/strategy-lab.html"),
        marketBasics: resolve(__dirname, "pages/market-basics.html")
      }
    }
  }
});
