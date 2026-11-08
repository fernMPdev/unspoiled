/**
 * Feature `chapters` (JS half): in the expanded description, timestamps are
 * script-driven anchors without an `href`, so CSS alone cannot target them.
 * We tag them by their text and let `chapters.css` hide them.
 */
((ns) => {
  "use strict";

  const { isTimestamp } = ns.time;

  const ATTR = "data-unspoiled-timestamp";
  const SELECTOR = `ytd-watch-metadata a:not([${ATTR}])`;

  (ns.features ??= []).push({
    id: "chapters",
    sync(active) {
      if (!active) return;
      for (const link of document.querySelectorAll(SELECTOR)) {
        if (isTimestamp(link.textContent)) link.setAttribute(ATTR, "");
      }
    },
  });
})((globalThis.Unspoiled ??= {}));
