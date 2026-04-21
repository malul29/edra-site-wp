import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { Client } from "pg";

type MediaDoc = {
  id: string | number;
  filename?: string;
  url?: string;
};

type RelinkTarget = {
  collection: "blogs" | "portfolio";
  field: "image";
};

type RelationalValue =
  | string
  | number
  | null
  | undefined
  | {
      id?: string | number;
    };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(root, ".env.local"), override: true });
dotenv.config({ path: path.join(root, ".env"), override: true });

const diskRoots = [
  path.join(root, "media"),
  path.join(root, "public", "media"),
  path.join(root, ".next", "standalone", "public", "media"),
];

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

async function fileExistsInAnyRoot(base: string): Promise<boolean> {
  for (const dir of diskRoots) {
    if (await exists(path.join(dir, base))) return true;
  }
  return false;
}

async function main() {
  const apply = process.argv.includes("--apply");

  const [{ default: config }, { getPayload }] = await Promise.all([
    import("../payload.config.ts"),
    import("payload"),
  ]);
  const payload = await getPayload({ config });

  const docs: MediaDoc[] = [];
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
    docs.push(...(res.docs as MediaDoc[]));
    page += 1;
  }

  const orphans: Array<{ id: string | number; filename: string }> = [];
  const validMediaIds: Array<string | number> = [];

  for (const doc of docs) {
    const base = basenameFromMaybeUrl(doc.filename) ?? basenameFromMaybeUrl(doc.url);
    if (!base) continue;
    if (!(await fileExistsInAnyRoot(base))) {
      orphans.push({ id: doc.id, filename: base });
    } else {
      validMediaIds.push(doc.id);
    }
  }

  console.log(`Media docs scanned: ${docs.length}`);
  console.log(`Orphan docs found: ${orphans.length}`);

  if (!apply) {
    for (const item of orphans.slice(0, 30)) {
      console.log(`- ${item.id}: ${item.filename}`);
    }
    if (orphans.length > 30) {
      console.log(`...and ${orphans.length - 30} more`);
    }
    console.log("Dry run complete. Re-run with --apply to delete orphan media docs.");
    return;
  }

  const relinkTargets: RelinkTarget[] = [
    { collection: "blogs", field: "image" },
    { collection: "portfolio", field: "image" },
  ];

  const fallbackMediaId = validMediaIds[0] ?? null;
  if (!fallbackMediaId) {
    console.warn("No valid media found on disk to use as fallback for required references.");
  }

  let deleted = 0;
  let failed = 0;
  let relinked = 0;

  async function relinkRequiredReferencesSqlBatch(): Promise<number> {
    if (!fallbackMediaId) return 0;

    const fallbackNum = Number(fallbackMediaId);
    if (!Number.isFinite(fallbackNum)) return 0;

    const orphanNums = orphans
      .map((o) => Number(o.id))
      .filter((n) => Number.isFinite(n) && n !== fallbackNum);

    if (orphanNums.length === 0) return 0;

    const databaseUrl = process.env.DATABASE_URI || process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.warn("DATABASE_URL/DATABASE_URI is not set. Skipping SQL relink pre-pass.");
      return 0;
    }

    const client = new Client({ connectionString: databaseUrl });
    await client.connect();

    try {
      const targets = [
        { table: "blogs", column: "image_id" },
        { table: "portfolio", column: "image_id" },
        { table: "portfolio_gallery", column: "image_id" },
      ];

      let changed = 0;
      for (const target of targets) {
        const result = await client.query(
          `UPDATE ${target.table} SET ${target.column} = $1 WHERE ${target.column} = ANY($2::int[])`,
          [fallbackNum, orphanNums],
        );
        changed += result.rowCount || 0;
      }

      return changed;
    } finally {
      await client.end();
    }
  }

  function asComparable(value: string | number): string {
    return String(value);
  }

  function extractRelationId(value: RelationalValue): string | null {
    if (value === null || value === undefined) return null;
    if (typeof value === "string" || typeof value === "number") return String(value);
    if (typeof value === "object" && value.id !== undefined && value.id !== null) return String(value.id);
    return null;
  }

  async function relinkRequiredReferences(orphanId: string | number): Promise<number> {
    if (!fallbackMediaId || fallbackMediaId === orphanId) return 0;

    let updated = 0;
    const orphanComparable = asComparable(orphanId);
    const fallbackComparable = asComparable(fallbackMediaId);

    for (const target of relinkTargets) {
      let page = 1;
      let totalPages = 1;

      while (page <= totalPages) {
        const result = await payload.find({
          collection: target.collection,
          limit: 100,
          page,
          depth: 0,
          overrideAccess: true,
          pagination: true,
        });

        totalPages = result.totalPages || 1;

        for (const doc of result.docs as Array<{ id: string | number; image?: RelationalValue }>) {
          const currentId = extractRelationId(doc.image);
          if (!currentId || currentId !== orphanComparable) continue;

          if (currentId === fallbackComparable) continue;

          await payload.update({
            collection: target.collection,
            id: doc.id,
            data: {
              [target.field]: typeof fallbackMediaId === "string" ? Number(fallbackMediaId) : fallbackMediaId,
            } as any,
            overrideAccess: true,
            depth: 0,
          });

          updated += 1;
        }

        page += 1;
      }
    }

    // Portfolio gallery has nested required relations in an array field.
    let portfolioPage = 1;
    let portfolioTotalPages = 1;

    while (portfolioPage <= portfolioTotalPages) {
      const portfolioResult = await payload.find({
        collection: "portfolio",
        limit: 100,
        page: portfolioPage,
        depth: 0,
        overrideAccess: true,
        pagination: true,
      });

      portfolioTotalPages = portfolioResult.totalPages || 1;

      for (const doc of portfolioResult.docs as Array<{
        id: string | number;
        gallery?: Array<{ image?: RelationalValue }>;
      }>) {
        const gallery = Array.isArray(doc.gallery) ? doc.gallery : [];
        if (gallery.length === 0) continue;

        let changed = false;
        const nextGallery = gallery.map((item) => {
          const currentId = extractRelationId(item?.image);
          if (!currentId || currentId !== orphanComparable) return item;
          changed = true;
          return {
            ...item,
            image: typeof fallbackMediaId === "string" ? Number(fallbackMediaId) : fallbackMediaId,
          } as any;
        });

        if (!changed) continue;

        await payload.update({
          collection: "portfolio",
          id: doc.id,
          data: {
            gallery: nextGallery,
          },
          overrideAccess: true,
          depth: 0,
        });

        updated += 1;
      }

      portfolioPage += 1;
    }

    return updated;
  }

  relinked += await relinkRequiredReferencesSqlBatch();

  for (const item of orphans) {
    try {
      const moved = await relinkRequiredReferences(item.id);
      relinked += moved;

      await payload.delete({
        collection: "media",
        id: item.id,
        overrideAccess: true,
      });
      deleted += 1;
    } catch (err) {
      failed += 1;
      console.error(`Failed to delete media id=${item.id} filename=${item.filename}`, err);
    }
  }

  console.log(`Relinked required references: ${relinked}`);
  console.log(`Deleted orphan docs: ${deleted}`);
  console.log(`Failed deletions: ${failed}`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("Failed to prune orphan media docs:", err);
  process.exit(1);
});
