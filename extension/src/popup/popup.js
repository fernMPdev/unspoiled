/**
 * Toolbar popup: a master switch, one switch per feature, a picker for the
 * seek step sizes and an ES | EN language toggle. Changes are saved
 * immediately; open YouTube tabs pick them up via storage events.
 */
(async (ns) => {
  "use strict";

  const { t, localize, setLanguage } = ns.i18n;
  const { FEATURES, SEEK_STEP_OPTIONS, MAX_SEEK_STEPS, load, save, subscribe } = ns.settings;
  const { formatDuration } = ns.time;

  const byId = (id) => document.getElementById(id);
  const master = /** @type {HTMLInputElement} */ (byId("enabled"));
  const status = byId("status");
  const list = byId("features");
  const rowTemplate = /** @type {HTMLTemplateElement} */ (byId("feature-row"));
  const stepsTemplate = /** @type {HTMLTemplateElement} */ (byId("seek-steps"));
  const languageButtons = /** @type {NodeListOf<HTMLButtonElement>} */ (
    byId("language").querySelectorAll("[data-language]")
  );

  /** @type {Map<string, HTMLInputElement>} */
  const featureInputs = new Map();
  /** @type {Map<number, HTMLButtonElement>} */
  const stepButtons = new Map();
  /** @type {HTMLFieldSetElement} */
  let stepsPanel;
  /** Last rendered settings; step toggles are computed from it. */
  let current = ns.settings.normalize();

  /** "seek" → "Seek", used to build message keys like `featureSeekTitle`. */
  const capitalize = (id) => id.charAt(0).toUpperCase() + id.slice(1);

  function buildFeatureRows() {
    for (const id of FEATURES) {
      const row = /** @type {DocumentFragment} */ (rowTemplate.content.cloneNode(true));
      /** @type {HTMLElement} */ (row.querySelector(".feature__title")).dataset.i18n =
        `feature${capitalize(id)}Title`;
      /** @type {HTMLElement} */ (row.querySelector(".feature__hint")).dataset.i18n =
        `feature${capitalize(id)}Hint`;

      const input = row.querySelector("input");
      input.addEventListener("change", () => save({ [id]: input.checked }));
      featureInputs.set(id, input);

      if (id === "seek") row.querySelector(".feature").append(buildStepsPanel());
      list.append(row);
    }
  }

  /** @returns {HTMLFieldSetElement} */
  function buildStepsPanel() {
    const fragment = /** @type {DocumentFragment} */ (stepsTemplate.content.cloneNode(true));
    stepsPanel = fragment.querySelector(".steps");
    /** @type {HTMLElement} */ (stepsPanel.querySelector(".steps__hint")).dataset.i18nParams =
      JSON.stringify({ max: MAX_SEEK_STEPS });

    const options = stepsPanel.querySelector(".steps__options");
    for (const step of SEEK_STEP_OPTIONS) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "chip";
      button.textContent = formatDuration(step);
      button.addEventListener("click", () => toggleStep(step));
      stepButtons.set(step, button);
      options.append(button);
    }
    return stepsPanel;
  }

  /** @param {number} step */
  function toggleStep(step) {
    const steps = current.seekSteps.includes(step)
      ? current.seekSteps.filter((s) => s !== step)
      : [...current.seekSteps, step];
    if (steps.length === 0 || steps.length > MAX_SEEK_STEPS) return;
    steps.sort((a, b) => a - b);
    // Render optimistically so a quick second click builds on this one
    // instead of on the value still being written to storage.
    render({ ...current, seekSteps: steps });
    save({ seekSteps: steps });
  }

  /** @param {string} language */
  function chooseLanguage(language) {
    render({ ...current, language });
    save({ language });
  }

  /** @param {UnspoiledSettings} settings */
  function render(settings) {
    current = settings;

    const language = setLanguage(settings.language);
    document.documentElement.lang = language;
    localize(document);
    for (const button of languageButtons) {
      button.setAttribute("aria-checked", String(button.dataset.language === language));
    }

    master.checked = settings.enabled;
    status.textContent = t(settings.enabled ? "statusOn" : "statusOff");
    list.toggleAttribute("inert", !settings.enabled);
    for (const [id, input] of featureInputs) input.checked = settings[id];

    stepsPanel.hidden = !settings.seek;
    const full = settings.seekSteps.length >= MAX_SEEK_STEPS;
    const last = settings.seekSteps.length === 1;
    for (const [step, button] of stepButtons) {
      const selected = settings.seekSteps.includes(step);
      button.setAttribute("aria-pressed", String(selected));
      // Can't exceed the cap, and at least one step must stay selected.
      button.disabled = selected ? last : full;
    }
  }

  buildFeatureRows();
  master.addEventListener("change", () => save({ enabled: master.checked }));
  for (const button of languageButtons) {
    button.addEventListener("click", () => chooseLanguage(button.dataset.language));
  }
  render(current);
  subscribe(render);
  render(await load());
})((globalThis.Unspoiled ??= {}));
