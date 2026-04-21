import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

type MediaDoc = {
  filename?: string;
  url?: string;
  sizes?: Record<string, { filename?: string; url?: string } | null>;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

// Ensure standalone CLI execution sees the same DB env as Next/Payload runtime.
// `override: true` prevents inherited empty env values from shadowing .env values.
dotenv.config({ path: path.join(root, ".env.local"), override: true });
dotenv.config({ path: path.join(root, ".env"), override: true });

const mediaDirs = [
  path.join(root, "media"),
  path.join(root, "public", "media"),
  path.join(root, ".next", "standalone", "public", "media"),
];

const sourceRootsForRefs = [
  path.join(root, "app"),
  path.join(root, "components"),
  path.join(root, "lib"),
  path.join(root, "collections"),
];

const textExtensions = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".md",
  ".css",
]);

function basenameFromMaybeUrl(value?: string): string | null {
  if (!value) return null;
  const clean = String(value).split("?")[0].split("#")[0].trim();
  if (!clean) return null;
  const base = path.posix.basename(clean.replace(/\\/g, "/"));
  return base || null;
}

async function exists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function walkFiles(dir: string, out: string[] = []): Promise<string[]> {
  if (!(await exists(dir))) return out;
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkFiles(abs, out);
    } else {
      out.push(abs);
    }
  }
  return out;
}

async function gatherCodeReferencedBasenames(): Promise<Set<string>> {
  const referenced = new Set<string>();
  const files: string[] = [];

  for (const dir of sourceRootsForRefs) {
    await walkFiles(dir, files);
  }

  const mediaRef = /(?:\/media\/|\/api\/media\/file\/)([^"'\s)]+\.(?:png|jpe?g|webp|avif|gif|svg))/gi;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!textExtensions.has(ext)) continue;

    const content = await fs.readFile(file, "utf8");
    for (const match of content.matchAll(mediaRef)) {
      const raw = match[1];
      const decoded = decodeURIComponent(raw);
      const base = basenameFromMaybeUrl(decoded);
      if (base) referenced.add(base);
    }
  }

  return referenced;
}

async function gatherCmsUsedBasenames(): Promise<Set<string>> {
  const used = new Set<string>();
  const [{ default: config }, { getPayload }] = await Promise.all([
    import("../payload.config.ts"),
    import("payload"),
  ]);
  const payload = await getPayload({ config });

  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const res = await payload.find({
      collection: "media",
      limit: 200,
      page,
      depth: 0,
      overrideAccess: true,
      pagination: true,
    });

    totalPages = res.totalPages || 1;

    for (const rawDoc of res.docs as unknown[]) {
      const doc = rawDoc as MediaDoc;

      const mainFilename = basenameFromMaybeUrl(doc.filename) ?? basenameFromMaybeUrl(doc.url ?? undefined);
      if (mainFilename) used.add(mainFilename);

      const sizes = doc.sizes || {};
      for (const size of Object.values(sizes)) {
        if (!size) continue;
        const sizeFilename = basenameFromMaybeUrl(size.filename) ?? basenameFromMaybeUrl(size.url ?? undefined);
        if (sizeFilename) used.add(sizeFilename);
      }
    }

    page += 1;
  }

  return used;
}

async function pruneDirectory(dir: string, keep: Set<string>) {
  if (!(await exists(dir))) {
    return { dir, deleted: 0, kept: 0, scanned: 0 };
  }

  const files = await walkFiles(dir);
  let deleted = 0;
  let kept = 0;

  for (const abs of files) {
    const base = path.basename(abs);
    if (keep.has(base)) {
      kept += 1;
      continue;
    }

    await fs.unlink(abs);
    deleted += 1;
  }

  return { dir, deleted, kept, scanned: files.length };
}

async function main() {
  const codeOnly = process.argv.includes("--code-only");

  let cmsUsed = new Set<string>();
  if (!codeOnly) {
    try {
      cmsUsed = await gatherCmsUsedBasenames();
    } catch (err) {
      throw err;
    }
  }

  if (!codeOnly && cmsUsed.size === 0) {
    throw new Error("Safety stop: no media documents resolved from CMS. Aborting prune.");
  }

  const codeUsed = await gatherCodeReferencedBasenames();
  const keep = new Set<string>([...cmsUsed, ...codeUsed]);

  if (keep.size === 0) {
    throw new Error("Safety stop: keep set is empty. Aborting prune.");
  }

  const results = [];
  for (const dir of mediaDirs) {
    results.push(await pruneDirectory(dir, keep));
  }

  console.log(`Mode: ${codeOnly ? "code-only" : "cms+code"}`);
  console.log("Kept basenames:", keep.size);
  for (const result of results) {
    console.log(
      `${result.dir} -> scanned=${result.scanned} kept=${result.kept} deleted=${result.deleted}`
    );
  }
}

main().catch((err) => {
  console.error("Failed to prune media:", err);
  process.exit(1);
});
