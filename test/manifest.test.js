import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "extension");
const readJson = (path) => JSON.parse(readFileSync(join(root, path), "utf8"));

const manifest = readJson("manifest.json");
const pkg = JSON.parse(readFileSync(join(root, "..", "package.json"), "utf8"));
const chromeLocales = readdirSync(join(root, "_locales"));

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

  it("has a _locales folder for its default locale", () => {
    assert.ok(chromeLocales.includes(manifest.default_locale));
  });

  for (const locale of chromeLocales) {
    it(`finds every __MSG_ key in _locales/${locale}`, () => {
      const messages = readJson(`_locales/${locale}/messages.json`);
      const keys = JSON.stringify(manifest).match(/__MSG_(\w+)__/g) ?? [];
      for (const key of keys) {
        const name = key.slice("__MSG_".length, -2);
        assert.ok(messages[name]?.message, `missing message ${name}`);
      }
    });
  }
});
