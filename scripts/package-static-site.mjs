import { cp, mkdir, readdir, rename, rm, writeFile } from "node:fs/promises";

const dist = new URL("../dist/", import.meta.url);
const client = new URL("../dist/client/", import.meta.url);
const server = new URL("../dist/server/", import.meta.url);

await mkdir(client, { recursive: true });

for (const entry of await readdir(dist, { withFileTypes: true })) {
  if (entry.name === "client" || entry.name === "server") continue;
  const source = new URL(entry.name, dist);
  const target = new URL(entry.name, client);
  await rm(target, { recursive: true, force: true });
  try {
    await rename(source, target);
  } catch {
    await cp(source, target, { recursive: true });
    await rm(source, { recursive: true, force: true });
  }
}

await mkdir(server, { recursive: true });
await writeFile(
  new URL("index.js", server),
  `export default {\n  fetch(request, env) {\n    return env.ASSETS.fetch(request);\n  },\n};\n`,
);
