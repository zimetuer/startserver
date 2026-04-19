import { build } from "esbuild";

await build({
  entryPoints: ["src/index.tsx"],
  bundle: true,
  platform: "node",
  target: "node18",
  outdir: "dist",
  jsx: "automatic",
  jsxImportSource: "react",
  loader: {
    ".tsx": "tsx",
  },
  format: "esm",
  alias: {
    "react-devtools-core": "./src/stubs/react-devtools-core.ts",
  },
  banner: {
    js: 'import { createRequire } from "module"; const require = createRequire(import.meta.url);',
  },
});
