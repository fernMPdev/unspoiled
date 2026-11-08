import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "extension");
const readJson = (path) => JSON.parse(readFileSync(join(root, path), "utf8"));

const manifest = readJson("manifest.json");
const messages = readJson("_locales/en/messages.json");
const pkg = JSON.parse(readFileSync(join(root, "..", "package.json"), "utf8"));

describe("manifest.json", () => {
  it("references files that exist", () => {
    const [script] = manifest.content_scripts;
    const paths = [
      ...script.css,
      ...script.js,
      manifest.action.default_popup,
      ...Object.values(manifest.icons),
    ];
    for (const path of paths) assert.ok(existsSync(join(root, path)), `missing ${path}`);
  });

  it("loads main.js last so every feature is registered first", () => {
    assert.equal(manifest.content_scripts[0].js.at(-1), "src/content/main.js");
  });

  it("keeps its version in sync with package.json", () => {
    assert.equal(manifest.version, pkg.version);
  });

  it("only uses __MSG_ keys that exist", () => {
    const keys = JSON.stringify(manifest).match(/__MSG_(\w+)__/g) ?? [];
    for (const key of keys) {
      const name = key.slice("__MSG_".length, -2);
      assert.ok(messages[name], `missing message ${name}`);
    }
  });
});

describe("messages.json", () => {
  it("has a title and hint for every feature", async () => {
    await import("../extension/src/shared/settings.js");
    for (const id of globalThis.Unspoiled.settings.FEATURES) {
      const base = `feature${id[0].toUpperCase()}${id.slice(1)}`;
      assert.ok(messages[`${base}Title`], `missing ${base}Title`);
      assert.ok(messages[`${base}Hint`], `missing ${base}Hint`);
    }
  });
});
