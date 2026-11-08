import { describe, it } from "node:test";
import assert from "node:assert/strict";

import "../extension/src/shared/settings.js";

const { FEATURES, DEFAULTS, normalize, activeFeatures } = globalThis.Unspoiled.settings;

describe("DEFAULTS", () => {
  it("enables the extension and every feature", () => {
    assert.equal(DEFAULTS.enabled, true);
    for (const id of FEATURES) assert.equal(DEFAULTS[id], true, id);
  });

  it("is frozen", () => {
    assert.ok(Object.isFrozen(DEFAULTS));
    assert.ok(Object.isFrozen(FEATURES));
  });
});

describe("normalize", () => {
  it("fills missing keys with defaults", () => {
    assert.deepEqual(normalize({ comments: false }), { ...DEFAULTS, comments: false });
  });

  it("returns the defaults for no input", () => {
    assert.deepEqual(normalize(), { ...DEFAULTS });
  });

  it("drops unknown keys and non-boolean values", () => {
    const result = normalize({ enabled: "no", seek: 0, legacyFlag: false });
    assert.deepEqual(result, { ...DEFAULTS });
  });
});

describe("activeFeatures", () => {
  it("lists enabled features in popup order", () => {
    const settings = normalize({ chapters: false, seek: false });
    assert.deepEqual(activeFeatures(settings), [
      "player",
      "durations",
      "comments",
      "recommendations",
    ]);
  });

  it("is empty when the master switch is off", () => {
    assert.deepEqual(activeFeatures(normalize({ enabled: false })), []);
  });
});

describe("normalizeSeekSteps", () => {
  const { SEEK_STEP_OPTIONS, MAX_SEEK_STEPS, normalizeSeekSteps } = globalThis.Unspoiled.settings;

  it("defaults to 10 s and 1 min", () => {
    assert.deepEqual(normalizeSeekSteps(undefined), [10, 60]);
    assert.deepEqual(normalize().seekSteps, [10, 60]);
  });

  it("sorts and de-duplicates valid steps", () => {
    assert.deepEqual(normalizeSeekSteps([3600, 60, 60]), [60, 3600]);
  });

  it("drops sizes that are not offered in the popup", () => {
    assert.deepEqual(normalizeSeekSteps([7, "60", 60]), [60]);
  });

  it(`keeps at most ${MAX_SEEK_STEPS} steps`, () => {
    assert.equal(normalizeSeekSteps(SEEK_STEP_OPTIONS).length, MAX_SEEK_STEPS);
  });

  it("falls back to the defaults when nothing valid is left", () => {
    assert.deepEqual(normalizeSeekSteps([]), [10, 60]);
    assert.deepEqual(normalizeSeekSteps("60"), [10, 60]);
  });
});

describe("language", () => {
  it("defaults to following the browser", () => {
    assert.equal(normalize().language, "auto");
  });

  it("keeps supported languages", () => {
    assert.equal(normalize({ language: "es" }).language, "es");
  });

  it("rejects anything else", () => {
    assert.equal(normalize({ language: "fr" }).language, "auto");
    assert.equal(normalize({ language: 1 }).language, "auto");
  });
});
