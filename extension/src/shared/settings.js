/**
 * User settings, shared by the content script and the popup.
 *
 * Stored in `chrome.storage.sync` as a flat object: a master `enabled`
 * switch, one boolean per feature, the list of seek step sizes and the UI
 * language. Every feature defaults to on, so a storage failure errs on the
 * side of hiding too much.
 */
((ns) => {
  "use strict";

  /** Feature ids, in the order they are listed in the popup. */
  const FEATURES = Object.freeze([
    "player",
    "durations",
    "chapters",
    "comments",
    "recommendations",
    "seek",
  ]);

  /** Seek step sizes (seconds) the user can pick from in the popup. */
  const SEEK_STEP_OPTIONS = Object.freeze([5, 10, 30, 60, 300, 600, 1800, 3600]);

  /** Each step adds two buttons (− and +), so cap them to keep the bar tidy. */
  const MAX_SEEK_STEPS = 4;

  /** UI languages with a dictionary in `shared/locales/`. */
  const LANGUAGES = Object.freeze(["en", "es"]);

  /** Language preference meaning "follow the browser". */
  const AUTO_LANGUAGE = "auto";

  /** @type {Readonly<UnspoiledSettings>} */
  const DEFAULTS = Object.freeze(
    /** @type {UnspoiledSettings} */ ({
      enabled: true,
      ...Object.fromEntries(FEATURES.map((id) => [id, true])),
      seekSteps: /** @type {number[]} */ (Object.freeze([10, 60])),
      language: AUTO_LANGUAGE,
    }),
  );

  /**
   * Keeps only known step sizes, without duplicates, ascending and capped at
   * `MAX_SEEK_STEPS`. Falls back to the defaults if nothing valid is left.
   * @param {unknown} raw
   * @returns {number[]}
   */
  function normalizeSeekSteps(raw) {
    const steps = Array.isArray(raw)
      ? [...new Set(raw)]
          .filter((step) => SEEK_STEP_OPTIONS.includes(step))
          .sort((a, b) => a - b)
          .slice(0, MAX_SEEK_STEPS)
      : [];
    return steps.length > 0 ? steps : [...DEFAULTS.seekSteps];
  }

  /**
   * Returns a complete settings object, ignoring unknown keys and values of
   * the wrong type.
   * @param {Record<string, unknown>} [raw]
   * @returns {UnspoiledSettings}
   */
  function normalize(raw = {}) {
    const flags = ["enabled", ...FEATURES].map((key) => [
      key,
      typeof raw[key] === "boolean" ? raw[key] : DEFAULTS[key],
    ]);
    return /** @type {UnspoiledSettings} */ ({
      ...Object.fromEntries(flags),
      seekSteps: normalizeSeekSteps(raw.seekSteps),
      language: LANGUAGES.includes(/** @type {string} */ (raw.language))
        ? raw.language
        : AUTO_LANGUAGE,
    });
  }

  /**
   * Ids of the features that should currently be applied.
   * @param {UnspoiledSettings} settings
   * @returns {string[]}
   */
  function activeFeatures(settings) {
    return settings.enabled ? FEATURES.filter((id) => settings[id]) : [];
  }

  /** @returns {Promise<UnspoiledSettings>} */
  async function load() {
    try {
      return normalize(await chrome.storage.sync.get(null));
    } catch {
      return normalize();
    }
  }

  /**
   * @param {Partial<UnspoiledSettings>} patch
   * @returns {Promise<void>}
   */
  function save(patch) {
    return chrome.storage.sync.set(patch);
  }

  /**
   * Calls `listener` with fresh settings whenever they change in any context.
   * @param {(settings: UnspoiledSettings) => void} listener
   */
  function subscribe(listener) {
    chrome.storage.onChanged.addListener((_changes, area) => {
      if (area === "sync") load().then(listener);
    });
  }

  ns.settings = Object.freeze({
    FEATURES,
    SEEK_STEP_OPTIONS,
    MAX_SEEK_STEPS,
    LANGUAGES,
    AUTO_LANGUAGE,
    DEFAULTS,
    normalize,
    normalizeSeekSteps,
    activeFeatures,
    load,
    save,
    subscribe,
  });
})((globalThis.Unspoiled ??= {}));
