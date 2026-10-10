import fs from "fs";
import { spawnSync } from "child_process";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

function findChrome() {
  const roots = [
    "/Users/imad/.cache/chrome-lighthouse",
    "/tmp/chrome-lighthouse",
  ];
  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    const walk = (dir) => {
      for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = `${dir}/${ent.name}`;
        if (ent.isDirectory()) {
          const hit = walk(p);
          if (hit) return hit;
        } else if (ent.name === "Google Chrome for Testing") {
          return p;
        }
      }
      return null;
    };
    const hit = walk(root);
    if (hit) return hit;
  }
  return null;
}

let chromePath = findChrome();
if (!chromePath) {
  console.log("Installing Chrome for Testing…");
  const install = spawnSync(
    "npx",
    [
      "--yes",
      "@puppeteer/browsers",
      "install",
      "chrome@stable",
      "--path",
      "/Users/imad/.cache/chrome-lighthouse",
    ],
    { stdio: "inherit" },
  );
  if (install.status !== 0) process.exit(install.status ?? 1);
  chromePath = findChrome();
}
if (!chromePath) {
  console.error("Chrome binary not found");
  process.exit(1);
}
console.log("Using", chromePath);

const lighthouse = (await import("/tmp/lh-run/node_modules/lighthouse/core/index.js"))
  .default;
const chromeLauncher = await import(
  "/tmp/lh-run/node_modules/chrome-launcher/dist/chrome-launcher.js"
);

const out = "/tmp/md-lighthouse-v3";
fs.mkdirSync(out, { recursive: true });

async function run(url, file, opts = {}) {
  const chrome = await chromeLauncher.launch({
    chromePath,
    chromeFlags: [
      "--headless=new",
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
    ],
  });
  try {
    const result = await lighthouse(url, {
      port: chrome.port,
      output: "json",
      logLevel: "error",
      onlyCategories:
        opts.onlyCategories ?? [
          "performance",
          "accessibility",
          "best-practices",
          "seo",
        ],
      formFactor: opts.formFactor ?? "mobile",
      throttlingMethod: "simulate",
      preset: opts.preset,
    });
    fs.writeFileSync(`${out}/${file}`, result.report);
    const cats = Object.fromEntries(
      Object.entries(result.lhr.categories).map(([k, v]) => [
        k,
        Math.round(v.score * 100),
      ]),
    );
    const lcp = result.lhr.audits["largest-contentful-paint"];
    let snippet = "";
    try {
      snippet =
        result.lhr.audits[
          "largest-contentful-paint-element"
        ].details.items[0].items[0].node.snippet.slice(0, 140);
    } catch {}
    console.log(file, cats, "LCP", lcp.displayValue);
    console.log(" ", snippet);
  } finally {
    await chrome.kill();
  }
}

await run("http://localhost:3010/", "home-mobile.json");
await run("http://localhost:3010/", "home-desktop.json", {
  onlyCategories: ["performance"],
  formFactor: "desktop",
  preset: "desktop",
});
await run("http://localhost:3010/upload/demo", "upload-mobile.json", {
  onlyCategories: ["performance"],
});
