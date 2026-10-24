import fs from "node:fs";
import path from "node:path";

const roots = ["src", "api"];
const re = /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(["'])(\.{1,2}\/[^"'\n]*)\2/g;
const hasExt = /\.(js|mjs|cjs|json|css|svg|png)$/;
const isFile = (p) => fs.existsSync(p) && fs.statSync(p).isFile();

function fix(file, spec) {
  if (hasExt.test(spec)) return spec;
  const base = path.resolve(path.dirname(file), spec);
  if (isFile(base + ".ts") || isFile(base + ".tsx") || isFile(base + ".js"))
    return spec + ".js";
  if (isFile(path.join(base, "index.ts")) || isFile(path.join(base, "index.js")))
    return spec.replace(/\/$/, "") + "/index.js";
  return spec;
}

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (/\.tsx?$/.test(name) && !name.endsWith(".d.ts")) {
      const src = fs.readFileSync(full, "utf8");
      const out = src.replace(re, (m, pre, q, spec) => {
        const next = fix(full, spec);
        return next === spec ? m : `${pre}${q}${next}${q}`;
      });
      if (out !== src) {
        fs.writeFileSync(full, out);
        console.log("fixed", full);
      }
    }
  }
}

roots.filter(fs.existsSync).forEach(walk);
