/**
 * Feature `seek`: with the progress bar gone you can no longer scrub, so this
 * adds a − and + button for each step size the user picked in the popup
 * (10 s and 1 min by default) to every YouTube player.
 */
((ns) => {
  "use strict";

  const { t } = ns.i18n;
  const { formatDuration, formatStep, clampSeek, toSeekDeltas } = ns.time;

  const TOAST_MS = 700;

  const SELECTOR = Object.freeze({
    player: ".html5-video-player",
    leftControls: ".ytp-left-controls",
  });

  const CLASS = Object.freeze({
    group: "unspoiled-seek",
    toast: "unspoiled-toast",
    toastVisible: "unspoiled-toast--visible",
  });

  /** @type {WeakMap<Element, number>} pending hide timer per toast */
  const toastTimers = new WeakMap();

  /**
   * Briefly shows the step label in the middle of the player, since the
   * usual time readout is hidden.
   * @param {Element} player
   * @param {string} text
   */
  function flash(player, text) {
    let toast = player.querySelector(`.${CLASS.toast}`);
    if (!toast) {
      toast = document.createElement("div");
      toast.className = CLASS.toast;
      toast.setAttribute("aria-live", "polite");
      player.append(toast);
    }
    toast.textContent = text;
    toast.classList.add(CLASS.toastVisible);
    clearTimeout(toastTimers.get(toast));
    toastTimers.set(
      toast,
      setTimeout(() => toast.classList.remove(CLASS.toastVisible), TOAST_MS),
    );
  }

  /**
   * @param {Element} player
   * @param {number} delta seconds
   */
  function seek(player, delta) {
    const video = player.querySelector("video");
    if (!video) return;
    video.currentTime = clampSeek(video.currentTime, delta, video.duration);
    flash(player, formatStep(delta));
  }

  /**
   * @param {Element} player
   * @param {number[]} deltas signed seconds, one button each
   * @returns {HTMLDivElement}
   */
  function createGroup(player, deltas) {
    const group = document.createElement("div");
    group.className = CLASS.group;
    group.dataset.deltas = deltas.join();

    for (const delta of deltas) {
      const label = formatStep(delta);
      const name = t(delta < 0 ? "seekBackward" : "seekForward", formatDuration(delta));
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.title = name;
      button.setAttribute("aria-label", name);
      button.addEventListener("click", (event) => {
        event.stopPropagation(); // keep the click from toggling play/pause
        seek(player, delta);
        button.blur(); // so Space keeps controlling playback, not this button
      });
      group.append(button);
    }
    return group;
  }

  (ns.features ??= []).push({
    id: "seek",
    sync(active, settings) {
      if (!active) return; // CSS hides already-injected buttons
      const deltas = toSeekDeltas(settings.seekSteps);
      const key = deltas.join();

      for (const player of document.querySelectorAll(SELECTOR.player)) {
        const controls = player.querySelector(SELECTOR.leftControls);
        if (!controls) continue;

        const current = controls.querySelector(`.${CLASS.group}`);
        if (current instanceof HTMLElement && current.dataset.deltas === key) continue;

        // Missing, or built for different step sizes: (re)build it.
        const group = createGroup(player, deltas);
        if (current) current.replaceWith(group);
        else controls.append(group);
      }
    },
  });
})((globalThis.Unspoiled ??= {}));
