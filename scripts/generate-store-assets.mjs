import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import sharp from "sharp";

const ROOT = resolve(".");
const STORE_DIR = resolve(ROOT, "assets/store");
const SOURCE_DIR = resolve(STORE_DIR, "source");
const SCREENSHOT_DIR = resolve(STORE_DIR, "screenshots");
const PROMO_DIR = resolve(STORE_DIR, "promo");
const README_DIR = resolve(ROOT, "assets/readme");
const README_SOURCE_DIR = resolve(README_DIR, "source");

const iconSource = await readFile(resolve(ROOT, "assets/icon.svg"), "utf8");
const iconBody = iconSource
  .replace(/^[\s\S]*?<svg[^>]*>/, "")
  .replace(/<\/svg>\s*$/, "");
const strictLayoutCheck = process.argv.includes("--check");
const fitWarnings = [];

const palette = {
  ink: "#172033",
  slate: "#334155",
  muted: "#64748B",
  pale: "#F8FAFC",
  line: "#CBD5E1",
  blue: "#2563EB",
  blueDark: "#1E3A8A",
  teal: "#14B8A6",
  amber: "#F59E0B",
  green: "#22C55E",
  red: "#EF4444",
  white: "#FFFFFF",
};

const assets = [
  {
    path: "screenshots/01-context-menu-target-1280x800",
    width: 1280,
    height: 800,
    svg: contextMenuScreenshot,
  },
  {
    path: "screenshots/02-popup-window-result-1280x800",
    width: 1280,
    height: 800,
    svg: popupResultScreenshot,
  },
  {
    path: "screenshots/03-firefox-bookmark-container-1280x800",
    width: 1280,
    height: 800,
    svg: firefoxBookmarkScreenshot,
  },
  {
    path: "screenshots/04-local-privacy-1280x800",
    width: 1280,
    height: 800,
    svg: privacyScreenshot,
  },
  {
    path: "promo/chrome-small-440x280",
    width: 440,
    height: 280,
    svg: (w, h) => smallPromo(w, h, "Chrome", palette.blue),
  },
  {
    path: "promo/edge-small-440x280",
    width: 440,
    height: 280,
    svg: (w, h) => smallPromo(w, h, "Edge", palette.teal),
  },
  {
    path: "promo/firefox-small-440x280",
    width: 440,
    height: 280,
    svg: (w, h) => smallPromo(w, h, "Firefox", palette.amber),
  },
  {
    path: "promo/chrome-marquee-1400x560",
    width: 1400,
    height: 560,
    svg: (w, h) => marqueePromo(w, h, "Chrome Web Store", palette.blue, {
      supportsBookmarks: false,
      supportsContainers: false,
    }),
  },
  {
    path: "promo/edge-marquee-1400x560",
    width: 1400,
    height: 560,
    svg: (w, h) => marqueePromo(w, h, "Microsoft Edge Add-ons", palette.teal, {
      supportsBookmarks: false,
      supportsContainers: false,
    }),
  },
  {
    path: "promo/firefox-marquee-1400x560",
    width: 1400,
    height: 560,
    svg: (w, h) => marqueePromo(w, h, "Firefox Add-ons", palette.amber, {
      supportsBookmarks: true,
      supportsContainers: true,
    }),
  },
  {
    path: "hero-1676x720",
    width: 1676,
    height: 720,
    svg: readmeHero,
    sourceDir: README_SOURCE_DIR,
    outputDir: README_DIR,
  },
];

await Promise.all([SOURCE_DIR, SCREENSHOT_DIR, PROMO_DIR, README_SOURCE_DIR].map(ensureDir));

for (const asset of assets) {
  const svg = baseSvg(asset.width, asset.height, asset.svg(asset.width, asset.height));
  const sourcePath = resolve(asset.sourceDir ?? SOURCE_DIR, `${asset.path}.svg`);
  const pngPath = resolve(asset.outputDir ?? STORE_DIR, `${asset.path}.png`);

  await ensureDir(dirname(sourcePath));
  await ensureDir(dirname(pngPath));
  await writeFile(sourcePath, svg);
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(pngPath);
}

console.log(`Generated ${assets.length} assets in ${STORE_DIR} and ${README_DIR}`);
if (fitWarnings.length) {
  console.warn(`Text fit warnings (${fitWarnings.length}):`);
  for (const warning of fitWarnings) console.warn(`- ${warning}`);
  if (strictLayoutCheck) process.exitCode = 1;
} else {
  console.log("Text fit checks passed.");
}

function ensureDir(path) {
  return mkdir(path, { recursive: true });
}

function baseSvg(width, height, body) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img">
  <defs>
    <linearGradient id="heroGradient" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#EFF6FF"/>
      <stop offset="48%" stop-color="#F8FAFC"/>
      <stop offset="100%" stop-color="#CCFBF1"/>
    </linearGradient>
    <linearGradient id="blueGradient" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#2563EB"/>
      <stop offset="100%" stop-color="#14B8A6"/>
    </linearGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="20" flood-color="#0F172A" flood-opacity="0.18"/>
    </filter>
    <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#0F172A" flood-opacity="0.16"/>
    </filter>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#heroGradient)"/>
  ${body}
</svg>
`;

  return svg.replace(/[ \t]+$/gm, "");
}

function icon(x, y, size) {
  const scale = size / 128;
  return `<g transform="translate(${x} ${y}) scale(${scale})">${iconBody}</g>`;
}

function text({
  value,
  x,
  y,
  size = 32,
  weight = 500,
  fill = palette.ink,
  anchor = "start",
  lineHeight = 1.25,
  maxChars,
  maxWidth,
  maxHeight,
  maxLines,
  id = value,
}) {
  let finalSize = size;
  let lines = maxWidth
    ? wrapByWidth(value, maxWidth, finalSize, weight)
    : maxChars
      ? wrap(value, maxChars)
      : `${value}`.split("\n");

  if (maxWidth || maxHeight || maxLines) {
    const minSize = Math.max(12, Math.floor(size * 0.72));
    while (
      finalSize > minSize &&
      ((maxLines && lines.length > maxLines) ||
        (maxHeight && lines.length * finalSize * lineHeight > maxHeight) ||
        (maxWidth &&
          lines.some((line) => estimateTextWidth(line, finalSize, weight) > maxWidth)))
    ) {
      finalSize -= 1;
      lines = maxWidth
        ? wrapByWidth(value, maxWidth, finalSize, weight)
        : maxChars
          ? wrap(value, maxChars)
          : `${value}`.split("\n");
    }

    const widest = Math.max(
      ...lines.map((line) => estimateTextWidth(line, finalSize, weight)),
      0,
    );
    const totalHeight = lines.length * finalSize * lineHeight;
    if (
      (maxWidth && widest > maxWidth) ||
      (maxHeight && totalHeight > maxHeight) ||
      (maxLines && lines.length > maxLines)
    ) {
      fitWarnings.push(
        `${id}: estimated ${Math.round(widest)}x${Math.round(totalHeight)} at ${finalSize}px exceeds ${maxWidth ?? "∞"}x${maxHeight ?? "∞"} / ${maxLines ?? "∞"} lines`,
      );
    }
  }

  const tspans = lines
    .map(
      (line, index) =>
        `<tspan x="${x}" dy="${index === 0 ? 0 : finalSize * lineHeight}">${escapeXml(line)}</tspan>`,
    )
    .join("");
  return `<text x="${x}" y="${y}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="${finalSize}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${tspans}</text>`;
}

function wrap(value, maxChars) {
  const words = `${value}`.split(/\s+/);
  const lines = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function wrapByWidth(value, maxWidth, size, weight) {
  const hardLines = `${value}`.split("\n");
  const lines = [];

  for (const hardLine of hardLines) {
    const words = hardLine.split(/\s+/).filter(Boolean);
    let current = "";

    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (estimateTextWidth(next, size, weight) > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = next;
      }
    }

    if (current) lines.push(current);
  }

  return lines.length ? lines : [""];
}

function estimateTextWidth(value, size, weight = 500) {
  const weightScale = weight >= 800 ? 1.08 : weight >= 700 ? 1.04 : 1;
  let units = 0;

  for (const char of `${value}`) {
    if (char === " ") units += 0.32;
    else if (/[ilI.,:;!'|]/.test(char)) units += 0.28;
    else if (/[mwMW@#%&]/.test(char)) units += 0.86;
    else if (/[A-Z]/.test(char)) units += 0.68;
    else if (/[0-9]/.test(char)) units += 0.56;
    else if (/[→•\-–—/]/.test(char)) units += 0.48;
    else units += 0.54;
  }

  return units * size * weightScale;
}

function escapeXml(value) {
  return `${value}`
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function roundedRect(x, y, width, height, radius, fill, stroke = "none", strokeWidth = 0) {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
}

function browserWindow(x, y, width, height, { title = "Example Page", url = "https://example.com/article", fill = palette.white } = {}) {
  return `
    <g filter="url(#softShadow)">
      ${roundedRect(x, y, width, height, 22, fill, "#E2E8F0", 2)}
      ${roundedRect(x, y, width, 62, 22, "#F1F5F9")}
      <path d="M${x} ${y + 62}H${x + width}" stroke="#E2E8F0" stroke-width="2"/>
      <circle cx="${x + 30}" cy="${y + 31}" r="8" fill="#EF4444"/>
      <circle cx="${x + 56}" cy="${y + 31}" r="8" fill="#F59E0B"/>
      <circle cx="${x + 82}" cy="${y + 31}" r="8" fill="#22C55E"/>
      ${roundedRect(x + 118, y + 16, width - 150, 30, 15, "#FFFFFF", "#CBD5E1", 1)}
      ${text({ value: url, x: x + 140, y: y + 38, size: 14, fill: palette.muted })}
      ${text({ value: title, x: x + 36, y: y + 110, size: 28, weight: 700 })}
    </g>
  `;
}

function contextMenu(x, y, highlighted = true, target) {
  const label = target
    ? `Open ${target} in Basic Window`
    : "Open in Basic Window";

  return `
    <g filter="url(#cardShadow)">
      ${roundedRect(x, y, 330, 292, 16, "#FFFFFF", "#CBD5E1", 1)}
      ${menuItem(x, y + 22, "Back", false)}
      ${menuItem(x, y + 66, "Reload", false)}
      <path d="M${x + 18} ${y + 118}H${x + 312}" stroke="#E2E8F0"/>
      ${highlighted ? roundedRect(x + 12, y + 132, 306, 44, 10, "#DBEAFE") : ""}
      ${menuItem(x, y + 162, label, true)}
      <path d="M${x + 18} ${y + 194}H${x + 312}" stroke="#E2E8F0"/>
      ${menuItem(x, y + 238, "Copy link address", false)}
      ${menuItem(x, y + 282, "Inspect", false)}
    </g>
  `;
}

function menuItem(x, y, label, withIcon) {
  return `
    ${withIcon ? icon(x + 24, y - 24, 28) : ""}
    ${text({ value: label, x: x + (withIcon ? 66 : 24), y, size: 20, weight: withIcon ? 700 : 500, fill: withIcon ? palette.blueDark : palette.slate })}
  `;
}

function contextMenuScreenshot(width, height) {
  return `
    ${browserWindow(74, 70, 850, 560, { title: "Helpful article about browser windows" })}
    ${text({ value: "Right-click any supported target", x: 120, y: 235, size: 34, weight: 800 })}
    ${text({ value: "Choose “Open in Basic Window” from the context menu.", x: 120, y: 282, size: 23, fill: palette.slate })}
    <a>
      ${roundedRect(120, 335, 430, 74, 16, "#EFF6FF", "#93C5FD", 2)}
      ${text({ value: "https://example.com/reference", x: 150, y: 381, size: 24, weight: 700, fill: palette.blue })}
    </a>
    ${contextMenu(690, 310)}
    ${icon(990, 96, 140)}
    ${text({ value: "Open in Basic Window", x: 1090, y: 285, size: 42, weight: 800, anchor: "middle", maxWidth: 300, maxLines: 2, id: "context screenshot title" })}
    ${text({ value: "Links • Media • Frames • Pages • Tabs", x: 1140, y: 385, size: 23, weight: 600, fill: palette.slate, anchor: "middle", maxWidth: 230, maxLines: 3, id: "context screenshot contexts" })}
  `;
}

function popupResultScreenshot(width, height) {
  return `
    ${text({ value: "Open the target in a focused popup-style window", x: 640, y: 92, size: 43, weight: 800, anchor: "middle", maxWidth: 1110, maxLines: 1, id: "popup screenshot heading" })}
    ${text({ value: "A minimal separate window for the selected link, media item, page, frame, or tab.", x: 640, y: 137, size: 23, fill: palette.slate, anchor: "middle", maxWidth: 900, maxLines: 2, id: "popup screenshot subheading" })}
    ${browserWindow(92, 205, 470, 420, { title: "Original tab", url: "https://example.com" })}
    ${browserWindow(654, 166, 530, 500, { title: "Basic popup window", url: "https://example.com/reference" })}
    <path d="M580 405C625 405 625 405 658 405" stroke="${palette.blue}" stroke-width="10" stroke-linecap="round"/>
    <path d="M640 377L668 405L640 433" fill="none" stroke="${palette.blue}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
    ${roundedRect(725, 300, 390, 170, 18, "#EFF6FF", "#93C5FD", 2)}
    ${icon(755, 332, 82)}
    ${text({ value: "Focused popup", x: 860, y: 362, size: 28, weight: 800, maxWidth: 235, maxLines: 1, id: "popup card title" })}
    ${text({ value: "No new normal tab required", x: 860, y: 403, size: 21, fill: palette.slate, maxWidth: 225, maxLines: 2, id: "popup card body" })}
  `;
}

function firefoxBookmarkScreenshot(width, height) {
  return `
    ${text({ value: "Firefox-ready bookmark and container support", x: 640, y: 90, size: 43, weight: 800, anchor: "middle", maxWidth: 1060, maxLines: 1, id: "firefox screenshot heading" })}
    ${text({ value: "Open supported bookmarks and preserve container identity when Firefox exposes it.", x: 640, y: 136, size: 23, fill: palette.slate, anchor: "middle", maxWidth: 860, maxLines: 2, id: "firefox screenshot subheading" })}
    ${roundedRect(110, 205, 455, 420, 24, "#FFFFFF", "#E2E8F0", 2)}
    ${text({ value: "Bookmarks", x: 160, y: 275, size: 34, weight: 800 })}
    ${bookmarkRow(160, 330, "Project docs", "https://example.com/docs", true)}
    ${bookmarkRow(160, 410, "Reference page", "https://example.com/reference", false)}
    ${bookmarkRow(160, 490, "Release checklist", "https://example.com/release", false)}
    ${contextMenu(410, 355, true, "Bookmark")}
    ${roundedRect(820, 260, 330, 220, 24, "#FFFFFF", "#E2E8F0", 2)}
    ${text({ value: "Container preserved", x: 985, y: 325, size: 31, weight: 800, anchor: "middle" })}
    <circle cx="985" cy="390" r="44" fill="#E0E7FF" stroke="${palette.blue}" stroke-width="5"/>
    ${text({ value: "Work", x: 985, y: 400, size: 25, weight: 800, fill: palette.blue, anchor: "middle" })}
    ${text({ value: "Firefox contextual identity", x: 985, y: 445, size: 18, fill: palette.slate, anchor: "middle" })}
  `;
}

function bookmarkRow(x, y, title, url, selected) {
  return `
    ${selected ? roundedRect(x - 18, y - 34, 360, 62, 14, "#EFF6FF", "#93C5FD", 2) : ""}
    <circle cx="${x}" cy="${y - 10}" r="11" fill="${selected ? palette.blue : "#CBD5E1"}"/>
    ${text({ value: title, x: x + 28, y: y - 12, size: 20, weight: 700 })}
    ${text({ value: url, x: x + 28, y: y + 14, size: 14, fill: palette.muted })}
  `;
}

function privacyScreenshot(width, height) {
  return `
    ${icon(105, 105, 150)}
    ${text({ value: "Local-only by design", x: 300, y: 155, size: 48, weight: 850 })}
    ${text({ value: "Open in Basic Window does not collect, transmit, sell, track, or analyze user data.", x: 302, y: 208, size: 25, fill: palette.slate, maxWidth: 720, maxLines: 2, id: "privacy hero body" })}
    ${privacyCard(135, 330, "No analytics", "No tracking scripts, telemetry, or advertising identifiers.", palette.blue)}
    ${privacyCard(475, 330, "No servers", "Selected URLs are used locally only to open the popup window.", palette.teal)}
    ${privacyCard(815, 330, "No data sale", "No data is collected, shared, sold, or sent to third parties.", palette.amber)}
    ${roundedRect(250, 610, 780, 70, 35, "#FFFFFF", "#BFDBFE", 2)}
    ${text({ value: "Permissions are used only for context menus, target resolution, popup windows, and Firefox-only bookmarks/containers.", x: 640, y: 640, size: 21, weight: 650, fill: palette.blueDark, anchor: "middle", maxWidth: 700, maxHeight: 54, maxLines: 2, id: "privacy permission pill" })}
  `;
}

function privacyCard(x, y, title, body, accent) {
  return `
    <g filter="url(#cardShadow)">
      ${roundedRect(x, y, 295, 205, 24, "#FFFFFF", "#E2E8F0", 2)}
      <circle cx="${x + 52}" cy="${y + 56}" r="22" fill="${accent}"/>
      <path d="M${x + 42} ${y + 56}L${x + 50} ${y + 64}L${x + 66} ${y + 45}" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      ${text({ value: title, x: x + 32, y: y + 110, size: 27, weight: 800 })}
      ${text({ value: body, x: x + 32, y: y + 145, size: 17, fill: palette.slate, maxWidth: 225, maxHeight: 60, maxLines: 3, id: `privacy card ${title}` })}
    </g>
  `;
}

function readmeHero(width, height) {
  return `
    <rect width="${width}" height="${height}" fill="#F8FAFC"/>
    <rect x="0" y="0" width="${width}" height="${height}" fill="url(#heroGradient)"/>
    <g opacity="0.42">
      <circle cx="1460" cy="85" r="280" fill="${palette.blue}"/>
      <circle cx="188" cy="690" r="250" fill="${palette.teal}"/>
    </g>
    ${roundedRect(72, 62, 1532, 596, 44, "#FFFFFF", "#D7E0EA", 2)}
    ${icon(132, 124, 150)}
    ${text({ value: "Open in Basic Window", x: 318, y: 174, size: 50, weight: 850, maxWidth: 570, maxLines: 1, id: "readme hero title" })}
    ${text({ value: "Send the target you picked into a focused popup-style browser window.", x: 322, y: 224, size: 30, weight: 600, fill: palette.slate, maxWidth: 560, maxLines: 2, id: "readme hero tagline" })}
    ${capabilityGrid(132, 374)}
    ${heroWindowPair(910, 155)}
  `;
}

function capabilityGrid(x, y) {
  const items = [
    ["Links", palette.blue],
    ["Images", palette.teal],
    ["Video", palette.amber],
    ["Audio", palette.green],
    ["Frames", "#8B5CF6"],
    ["Pages", "#0EA5E9"],
    ["Tabs", "#F97316"],
    ["Bookmarks", "#EC4899"],
    ["Containers", "#6366F1"],
  ];

  return items
    .map(([label, accent], index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      return capabilityPill(x + col * 245, y + row * 74, label, accent);
    })
    .join("");
}

function capabilityPill(x, y, label, accent) {
  return `
    ${roundedRect(x, y, 210, 52, 26, "#FFFFFF", "#CBD5E1", 2)}
    <circle cx="${x + 31}" cy="${y + 26}" r="13" fill="${accent}"/>
    ${text({ value: label, x: x + 56, y: y + 34, size: 23, weight: 800, fill: palette.ink, maxWidth: 130, maxLines: 1, id: `readme capability ${label}` })}
  `;
}

function heroWindowPair(x, y) {
  return `
    <g filter="url(#softShadow)">
      ${roundedRect(x, y, 380, 305, 24, "#FFFFFF", "#D7E0EA", 2)}
      ${roundedRect(x, y, 380, 55, 24, "#F1F5F9")}
      <path d="M${x} ${y + 55}H${x + 380}" stroke="#D7E0EA" stroke-width="2"/>
      <circle cx="${x + 28}" cy="${y + 28}" r="7" fill="#EF4444"/>
      <circle cx="${x + 52}" cy="${y + 28}" r="7" fill="#F59E0B"/>
      <circle cx="${x + 76}" cy="${y + 28}" r="7" fill="#22C55E"/>
      ${roundedRect(x + 38, y + 92, 205, 34, 17, "#EFF6FF", "#93C5FD", 2)}
      ${text({ value: "Selected target", x: x + 58, y: y + 116, size: 18, weight: 800, fill: palette.blueDark })}
      ${contextMenu(x + 86, y + 142)}
    </g>
    <path d="M${x + 322} ${y + 318}C${x + 378} ${y + 382} ${x + 420} ${y + 382} ${x + 468} ${y + 318}" stroke="${palette.blue}" stroke-width="11" stroke-linecap="round" fill="none"/>
    <path d="M${x + 442} ${y + 313}L${x + 472} ${y + 318}L${x + 450} ${y + 339}" fill="none" stroke="${palette.blue}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
    <g filter="url(#cardShadow)">
      ${roundedRect(x + 400, y + 250, 332, 240, 28, "#FFFFFF", "#D7E0EA", 2)}
      ${roundedRect(x + 400, y + 250, 332, 52, 28, "#F1F5F9")}
      <path d="M${x + 400} ${y + 302}H${x + 732}" stroke="#D7E0EA" stroke-width="2"/>
      ${icon(x + 432, y + 334, 78)}
      ${text({ value: "Focused popup", x: x + 532, y: y + 363, size: 28, weight: 850, maxWidth: 170, maxLines: 1, id: "readme popup title" })}
      ${text({ value: "A cleaner place for the thing you opened.", x: x + 532, y: y + 405, size: 20, weight: 600, fill: palette.slate, maxWidth: 175, maxLines: 2, id: "readme popup body" })}
    </g>
  `;
}

function smallPromo(width, height, browserName, accent) {
  return `
    <rect width="${width}" height="${height}" fill="url(#blueGradient)"/>
    <circle cx="${width - 65}" cy="55" r="116" fill="#FFFFFF" opacity="0.16"/>
    <circle cx="54" cy="${height - 24}" r="96" fill="#FFFFFF" opacity="0.13"/>
    ${roundedRect(26, 30, 388, 220, 30, "#FFFFFF", "none", 0)}
    ${icon(50, 58, 86)}
    ${text({ value: "Open in", x: 158, y: 82, size: 29, weight: 800 })}
    ${text({ value: "Basic Window", x: 158, y: 119, size: 33, weight: 850, fill: accent })}
    ${text({ value: `${browserName} release`, x: 56, y: 178, size: 19, weight: 800, fill: palette.slate })}
    ${text({ value: "Context menu → popup window", x: 56, y: 212, size: 20, weight: 650, fill: palette.ink, maxWidth: 320, maxLines: 1, id: `${browserName} small promo tagline` })}
  `;
}

function marqueePromo(
  width,
  height,
  storeName,
  accent,
  { supportsBookmarks, supportsContainers },
) {
  const body = supportsBookmarks && supportsContainers
    ? "Open links, media, tabs, frames, pages, and bookmarks, with Firefox container support."
    : "Open links, media, tabs, frames, and pages in a basic popup window.";

  return `
    <rect width="${width}" height="${height}" fill="#0F172A"/>
    <circle cx="1200" cy="80" r="330" fill="${accent}" opacity="0.26"/>
    <circle cx="170" cy="520" r="280" fill="${palette.teal}" opacity="0.22"/>
    ${roundedRect(80, 78, 1240, 404, 42, "#FFFFFF", "none", 0)}
    ${icon(132, 130, 168)}
    ${text({ value: "Open in Basic Window", x: 345, y: 178, size: 62, weight: 850, maxWidth: 820, maxLines: 1, id: `${storeName} marquee title` })}
    ${text({ value: body, x: 350, y: 240, size: 29, weight: 600, fill: palette.slate, maxWidth: 720, maxHeight: 82, maxLines: 2, id: `${storeName} marquee body` })}
    ${roundedRect(350, 324, 380, 72, 36, accent)}
    ${text({ value: "Context menu → popup", x: 540, y: 370, size: 27, weight: 800, fill: palette.white, anchor: "middle" })}
    ${roundedRect(768, 324, 265, 72, 36, "#F1F5F9", "#CBD5E1", 2)}
    ${text({ value: "No data collection", x: 900, y: 370, size: 26, weight: 800, fill: palette.ink, anchor: "middle" })}
    ${text({ value: storeName, x: 1180, y: 430, size: 22, weight: 800, fill: palette.muted, anchor: "middle" })}
  `;
}
