/**
 * Compiles `previews/` into self-contained files in `dist/`.
 *
 * Claude Design renders each preview as an isolated static page, so nothing can
 * reference an external stylesheet. This runs the app's own Tailwind theme over
 * the preview markup and inlines the result into each file.
 *
 * Usage: node design-system/build.mjs   (from the repo root)
 */
import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..");
const previewsDir = join(here, "previews");
const cssPath = join(here, ".tailwind-preview.css");

/**
 * Everything is emitted under this single top-level directory so the uploaded
 * paths can never collide with files already in a Claude Design project. If
 * this bundle is ever pointed at the wrong project it adds a folder; it cannot
 * overwrite anything. Do not flatten this away.
 */
const NAMESPACE = "helm-design-system";
const distDir = join(here, "dist", NAMESPACE);

function htmlFilesIn(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return htmlFilesIn(full);
    return full.endsWith(".html") ? [full] : [];
  });
}

// Invoke the locally installed binary directly rather than via npx: npx will
// happily reach for the network when the package is missing, and its
// "could not determine executable to run" is not a useful diagnostic.
const tailwindBin = join(
  repoRoot,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "tailwindcss.cmd" : "tailwindcss"
);

if (!existsSync(tailwindBin)) {
  console.error(
    "tailwindcss is not installed.\n\n" +
      "  Run `npm install` from the repo root, then try again.\n"
  );
  process.exit(1);
}

// The app's globals.css is the input, so previews inherit the real token layer
// (light + dark) rather than a copy that can drift out of sync.
execFileSync(
  tailwindBin,
  [
    "--input",
    "app/globals.css",
    "--output",
    relative(repoRoot, cssPath),
    "--config",
    relative(repoRoot, join(here, "tailwind.preview.config.ts")),
    "--minify",
  ],
  { cwd: repoRoot, stdio: ["ignore", "ignore", "inherit"] }
);

const css = readFileSync(cssPath, "utf8");
rmSync(join(here, "dist"), { recursive: true, force: true });

const files = htmlFilesIn(previewsDir);
for (const file of files) {
  const source = readFileSync(file, "utf8");

  // The Design System pane indexes cards off the first-line @dsCard marker, so
  // fail loudly rather than shipping a preview that silently never appears.
  if (!source.startsWith("<!-- @dsCard ")) {
    throw new Error(
      `${relative(repoRoot, file)} is missing its first-line @dsCard marker`
    );
  }
  if (!source.includes("</head>")) {
    throw new Error(`${relative(repoRoot, file)} has no </head> to inline into`);
  }

  const out = join(distDir, relative(previewsDir, file));
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, source.replace("</head>", `<style>${css}</style>\n</head>`));
}

// base.html is also written outside dist/ and committed, so the one-file
// starting point can be opened or uploaded without anyone running this build.
copyFileSync(join(distDir, "base.html"), join(here, "helm-base.html"));

rmSync(cssPath, { force: true });
console.log(
  `Built ${files.length} previews into design-system/dist/\n` +
    `Refreshed design-system/helm-base.html`
);
