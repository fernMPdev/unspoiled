/**
 * Pure time helpers. No DOM access, so they are unit-tested in Node.
 */
((ns) => {
  "use strict";

  /** Matches a bare timestamp such as `4:05`, `1:02:03` or `(12:34)`. */
  const TIMESTAMP_PATTERN = /^\(?\d{1,2}(?::\d{2}){1,2}\)?$/;

  /**
   * @param {string} text
   * @returns {boolean}
   */
  function isTimestamp(text) {
    return TIMESTAMP_PATTERN.test(text.trim());
  }

  /**
   * Compact, unsigned duration in the largest whole unit:
   * `10` → `"10 s"`, `300` → `"5 min"`, `3600` → `"1 h"`, `90` → `"90 s"`.
   * @param {number} seconds
   * @returns {string}
   */
  function formatDuration(seconds) {
    const amount = Math.abs(seconds);
    if (amount >= 3600 && amount % 3600 === 0) return `${amount / 3600} h`;
    if (amount >= 60 && amount % 60 === 0) return `${amount / 60} min`;
    return `${amount} s`;
  }

  /**
   * Signed label for a seek button: `-60` → `"−1 min"`, `10` → `"+10 s"`.
   * Uses a true minus sign (U+2212) so it lines up with the plus sign.
   * @param {number} seconds
   * @returns {string}
   */
  function formatStep(seconds) {
    return `${seconds < 0 ? "−" : "+"}${formatDuration(seconds)}`;
  }

  /**
   * Turns step sizes into signed button deltas, mirrored around the middle:
   * `[10, 60]` → `[-60, -10, 10, 60]`.
   * @param {readonly number[]} steps positive seconds
   * @returns {number[]}
   */
  function toSeekDeltas(steps) {
    const ascending = [...steps].sort((a, b) => a - b);
    return [...ascending.map((step) => -step).reverse(), ...ascending];
  }

  /**
   * Target playback position after seeking by `delta`, kept within the video.
   * Live streams report an infinite or NaN duration, so only the lower bound
   * applies to them.
   * @param {number} current
   * @param {number} delta
   * @param {number} duration
   * @returns {number}
   */
  function clampSeek(current, delta, duration) {
    const upper = Number.isFinite(duration) ? duration : Infinity;
    return Math.min(Math.max(0, current + delta), upper);
  }

  ns.time = Object.freeze({ isTimestamp, formatDuration, formatStep, toSeekDeltas, clampSeek });
})((globalThis.Unspoiled ??= {}));
