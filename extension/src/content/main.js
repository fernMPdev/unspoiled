/**
 * Content script entry point.
 *
 * The active feature ids are written to `<html data-unspoiled="…">`; the
 * stylesheets in `src/styles/` key off that attribute, so hiding is pure CSS
 * and applies before YouTube paints anything. Features that need to add UI
 * register a `sync(active)` that is re-run whenever the DOM changes.
 */
((ns) => {
  "use strict";

  const ROOT_ATTR = "data-unspoiled";

  /** @type {UnspoiledSettings} */
  let settings = ns.settings.normalize();
  /** @type {Set<string>} */
  let active = new Set();

  /** @param {UnspoiledSettings} next */
  function apply(next) {
    settings = next;
    active = new Set(ns.settings.activeFeatures(settings));
    document.documentElement.setAttribute(ROOT_ATTR, [...active].join(" "));
    syncFeatures();
  }

  function syncFeatures() {
    for (const feature of ns.features) {
      try {
        feature.sync(active.has(feature.id), settings);
      } catch (error) {
        // One broken feature (e.g. after a YouTube redesign) must not take
        // the others down with it.
        console.error(`[Unspoiled] feature "${feature.id}" failed`, error);
      }
    }
  }

  // Start from the spoiler-safe defaults synchronously, then load the
  // user's choices, so nothing leaks while storage is being read.
  apply(settings);
  for (const feature of ns.features) feature.init?.();
  ns.watchDom(syncFeatures);
  ns.settings.load().then(apply);
  ns.settings.subscribe(apply);
})((globalThis.Unspoiled ??= {}));
