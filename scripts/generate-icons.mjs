import { mkdir, readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import sharp from "sharp";

export async function generateIcons() {
  const iconSource = resolve("assets/icon.svg");
  const sizes = [16, 24, 32, 48, 96, 128];

  const svg = await readFile(iconSource);

  await Promise.all(
    sizes.map(async (size) => {
      const output = resolve(`public/icon-${size}.png`);
      await mkdir(dirname(output), { recursive: true });
      await sharp(svg, { density: 384 })
        .resize(size, size, { fit: "contain" })
        .png({ compressionLevel: 9 })
        .toFile(output);
    }),
  );

  console.log(`Generated ${sizes.length} icons from ${iconSource}`);
}

const isCliRun =
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isCliRun) {
  await generateIcons();
}
