/**
 * Runtime-switchable translations.
 *
 * `chrome.i18n` always follows the browser's language and cannot be changed
 * from an extension, so UI strings live in `shared/locales/*.js` instead and
 * the user can pick the language in the popup. `_locales/` only keeps the
 * extension name and description, which Chrome reads before any script runs.
 */
((ns) => {
  "use strict";

  const { LANGUAGES } = ns.settings;
  const FALLBACK = "en";

  /**
   * Browser UI language reduced to a supported base tag (`es-AR` → `es`).
   * @returns {string}
   */
  function detect() {
    const tag = globalThis.chrome?.i18n?.getUILanguage?.() ?? globalThis.navigator?.language ?? "";
    const base = tag.toLowerCase().split("-")[0];
    return LANGUAGES.includes(base) ? base : FALLBACK;
  }

  /**
   * Maps the stored preference (`"auto"`, `"en"`, `"es"`) to a language.
   * @param {string} preference
   * @returns {string}
   */
  function resolve(preference) {
    return LANGUAGES.includes(preference) ? preference : detect();
  }

  let current = detect();

  /**
   * @param {string} preference
   * @returns {string} the language now in use
   */
  function setLanguage(preference) {
    current = resolve(preference);
    return current;
  }

  /** @returns {string} */
  function getLanguage() {
    return current;
  }

  /**
   * Looks `key` up in the current language, then in English, and fills
   * `{name}` placeholders from `params`. Unknown keys return the key itself
   * so a missing string is visible instead of blank.
   * @param {string} key
   * @param {Record<string, string | number>} [params]
   * @returns {string}
   */
  function t(key, params = {}) {
    const template = ns.locales?.[current]?.[key] ?? ns.locales?.[FALLBACK]?.[key] ?? key;
    return template.replace(/\{(\w+)\}/g, (match, name) =>
      name in params ? String(params[name]) : match,
    );
  }

  /**
   * Fills, within `root`:
   * - `[data-i18n]` text, with optional JSON `data-i18n-params`;
   * - `[data-i18n-label]` as `aria-label` and `title`.
   * @param {ParentNode} root
   */
  function localize(root) {
    for (const el of root.querySelectorAll("[data-i18n]")) {
      if (!(el instanceof HTMLElement)) continue;
      const params = el.dataset.i18nParams ? JSON.parse(el.dataset.i18nParams) : undefined;
      el.textContent = t(el.dataset.i18n, params);
    }
    for (const el of root.querySelectorAll("[data-i18n-label]")) {
      if (!(el instanceof HTMLElement)) continue;
      const label = t(el.dataset.i18nLabel);
      el.setAttribute("aria-label", label);
      el.title = label;
    }
  }

  ns.i18n = Object.freeze({ FALLBACK, detect, resolve, setLanguage, getLanguage, t, localize });
})((globalThis.Unspoiled ??= {}));
