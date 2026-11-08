import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";

import "../extension/src/shared/settings.js";
import "../extension/src/shared/locales/en.js";
import "../extension/src/shared/locales/es.js";
import "../extension/src/shared/i18n.js";

const { locales, i18n, settings } = globalThis.Unspoiled;
const { t, resolve, setLanguage, getLanguage } = i18n;

const placeholders = (text) => [...text.matchAll(/\{(\w+)\}/g)].map(([, name]) => name).sort();

describe("locales", () => {
  it("has a dictionary for every supported language", () => {
    assert.deepEqual(Object.keys(locales).sort(), [...settings.LANGUAGES].sort());
  });

  for (const language of settings.LANGUAGES) {
    it(`${language} has exactly the same keys as en`, () => {
      assert.deepEqual(Object.keys(locales[language]).sort(), Object.keys(locales.en).sort());
    });

    it(`${language} uses the same placeholders as en`, () => {
      for (const [key, text] of Object.entries(locales.en)) {
        assert.deepEqual(placeholders(locales[language][key]), placeholders(text), key);
      }
    });

    it(`${language} has no empty strings`, () => {
      for (const [key, text] of Object.entries(locales[language])) {
        assert.ok(text.trim(), key);
      }
    });
  }

  it("has a title and hint for every feature", () => {
    for (const id of settings.FEATURES) {
      const base = `feature${id[0].toUpperCase()}${id.slice(1)}`;
      assert.ok(locales.en[`${base}Title`], `missing ${base}Title`);
      assert.ok(locales.en[`${base}Hint`], `missing ${base}Hint`);
    }
  });
});

describe("i18n", () => {
  afterEach(() => setLanguage("en"));

  it("uses an explicit preference as is", () => {
    assert.equal(resolve("es"), "es");
    assert.equal(resolve("en"), "en");
  });

  it("falls back to a supported language for auto or unknown values", () => {
    assert.ok(settings.LANGUAGES.includes(resolve("auto")));
    assert.ok(settings.LANGUAGES.includes(resolve("fr")));
  });

  it("switches language at runtime", () => {
    assert.equal(setLanguage("es"), "es");
    assert.equal(getLanguage(), "es");
    assert.equal(t("showComments"), "Mostrar comentarios");
    setLanguage("en");
    assert.equal(t("showComments"), "Show comments");
  });

  it("fills named placeholders", () => {
    setLanguage("es");
    assert.equal(t("seekForward", { amount: "1 h" }), "Avanzar 1 h");
    assert.equal(t("seekStepsHint", { max: 4 }).startsWith("Elige hasta 4."), true);
  });

  it("leaves unknown placeholders visible", () => {
    assert.equal(t("seekForward"), "Skip ahead {amount}");
  });

  it("returns the key for unknown messages", () => {
    assert.equal(t("doesNotExist"), "doesNotExist");
  });
});

describe("typography", () => {
  for (const language of settings.LANGUAGES) {
    it(`${language} never breaks a line between a number and its unit`, () => {
      for (const [key, text] of Object.entries(locales[language])) {
        assert.doesNotMatch(text, /\d (?:s|min|h)\b/, key);
      }
    });
  }
});
