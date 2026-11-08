import { describe, it } from "node:test";
import assert from "node:assert/strict";

import "../extension/src/shared/time.js";

const { isTimestamp, formatDuration, formatStep, toSeekDeltas, clampSeek } =
  globalThis.Unspoiled.time;

describe("isTimestamp", () => {
  for (const text of ["0:00", "4:05", "12:34", "1:02:03", "(3:04:17)", "  9:59 "]) {
    it(`accepts ${JSON.stringify(text)}`, () => assert.equal(isTimestamp(text), true));
  }

  for (const text of ["", "12", "1:2", "123:45", "3:04 Intro", "v1:00", "2-1", "10:61:00:00"]) {
    it(`rejects ${JSON.stringify(text)}`, () => assert.equal(isTimestamp(text), false));
  }
});

describe("formatStep", () => {
  it("uses minutes for whole minutes", () => {
    assert.equal(formatStep(60), "+1 min");
    assert.equal(formatStep(-120), "−2 min");
  });

  it("uses seconds otherwise", () => {
    assert.equal(formatStep(10), "+10 s");
    assert.equal(formatStep(-10), "−10 s");
    assert.equal(formatStep(90), "+90 s");
    assert.equal(formatStep(3600), "+1 h");
  });
});

describe("clampSeek", () => {
  it("moves by delta inside the video", () => {
    assert.equal(clampSeek(100, 10, 600), 110);
    assert.equal(clampSeek(100, -60, 600), 40);
  });

  it("never goes below zero", () => {
    assert.equal(clampSeek(5, -10, 600), 0);
  });

  it("never goes past the end", () => {
    assert.equal(clampSeek(595, 60, 600), 600);
  });

  it("has no upper bound for live streams", () => {
    assert.equal(clampSeek(1000, 60, Infinity), 1060);
    assert.equal(clampSeek(1000, 60, NaN), 1060);
  });
});

describe("formatDuration", () => {
  it("picks the largest whole unit", () => {
    assert.equal(formatDuration(5), "5 s");
    assert.equal(formatDuration(300), "5 min");
    assert.equal(formatDuration(3600), "1 h");
    assert.equal(formatDuration(5400), "90 min");
    assert.equal(formatDuration(-1800), "30 min");
  });
});

describe("toSeekDeltas", () => {
  it("mirrors steps around zero, largest jumps outermost", () => {
    assert.deepEqual(toSeekDeltas([10, 60]), [-60, -10, 10, 60]);
    assert.deepEqual(toSeekDeltas([3600, 60]), [-3600, -60, 60, 3600]);
  });

  it("does not mutate its input", () => {
    const steps = Object.freeze([60, 10]);
    toSeekDeltas(steps);
    assert.deepEqual(steps, [60, 10]);
  });
});
