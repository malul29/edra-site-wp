import { cpSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const pairs = [
    [".next/static", ".next/standalone/.next/static"],
    ["public", ".next/standalone/public"],
];

for (const [src, dest] of pairs) {
    const from = resolve(root, src);
    const to = resolve(root, dest);
    if (existsSync(from)) {
        cpSync(from, to, { recursive: true });
        console.log(`Copied ${src} → ${dest}`);
    }
}
