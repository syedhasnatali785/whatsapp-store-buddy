import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify("https://yobywytmxewzyxteorqf.supabase.co"),
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvYnl3eXRteGV3enl4dGVvcnFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNjI3OTcsImV4cCI6MjA4OTkzODc5N30.2OREFnxGv5p6doYVbE9oWzso3C-FZnVMQQF44nQy6oA"),
    "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify("yobywytmxewzyxteorqf"),
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
}));
