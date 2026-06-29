import { mkdir, readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import sharp from "sharp";

export async function generateIcons({ check = false } = {}) {
  const iconSource = resolve("assets/icon.svg");
  const sizes = [16, 24, 32, 48, 96, 128];

  const svg = await readFile(iconSource);

  const results = await Promise.all(
    sizes.map(async (size) => {
      const output = resolve(`public/icon-${size}.png`);
      const png = await sharp(svg, { density: 384 })
        .resize(size, size, { fit: "contain" })
        .png({ compressionLevel: 9 })
        .toBuffer();

      let current;
      try {
        current = await readFile(output);
      } catch (error) {
        if (error?.code !== "ENOENT") {
          throw error;
        }
      }

      if (current?.equals(png)) {
        return { output, status: "current" };
      }

      if (check) {
        return { output, status: "outdated" };
      }

      await mkdir(dirname(output), { recursive: true });
      await writeFile(output, png);

      return { output, status: "updated" };
    }),
  );

  const outdated = results.filter((result) => result.status === "outdated");
  if (outdated.length > 0) {
    const iconList = outdated.map((result) => result.output).join("\n");
    throw new Error(
      `Icon files are out of date. Run npm run generate:icons.\n${iconList}`,
    );
  }

  const updatedCount = results.filter(
    (result) => result.status === "updated",
  ).length;
  if (check) {
    console.log(`Verified ${sizes.length} icons from ${iconSource}`);
  } else {
    console.log(`Generated ${updatedCount} changed icons from ${iconSource}`);
  }
}

const isCliRun =
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isCliRun) {
  await generateIcons({ check: process.argv.includes("--check") });
}
