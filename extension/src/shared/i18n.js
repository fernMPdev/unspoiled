/**
 * Thin wrapper around `chrome.i18n` so every string lives in `_locales/`.
 * Falls back to the message key when the API is unavailable (e.g. in tests).
 */
((ns) => {
  "use strict";

  /**
   * @param {string} key
   * @param {string | string[]} [substitutions]
   * @returns {string}
   */
  function t(key, substitutions) {
    return globalThis.chrome?.i18n?.getMessage(key, substitutions) || key;
  }

  /**
   * Fills every `[data-i18n]` element's text and every `[data-i18n-label]`
   * element's `aria-label` / `title` within `root`.
   * @param {ParentNode} root
   */
  function localize(root) {
    for (const el of root.querySelectorAll("[data-i18n]")) {
      if (el instanceof HTMLElement) el.textContent = t(el.dataset.i18n);
    }
    for (const el of root.querySelectorAll("[data-i18n-label]")) {
      if (!(el instanceof HTMLElement)) continue;
      const label = t(el.dataset.i18nLabel);
      el.setAttribute("aria-label", label);
      el.title = label;
    }
  }

  ns.i18n = Object.freeze({ t, localize });
})((globalThis.Unspoiled ??= {}));
