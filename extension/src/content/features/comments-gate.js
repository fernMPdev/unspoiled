/**
 * Feature `comments`: the comment section is hidden by CSS; this adds a
 * "Show comments" button in its place. Revealing lasts for the current video
 * only and resets on the next navigation.
 */
((ns) => {
  "use strict";

  const { t, getLanguage } = ns.i18n;

  const SELECTOR = Object.freeze({ comments: "ytd-comments#comments" });
  const CLASS = Object.freeze({ gate: "unspoiled-comments-gate" });
  /** Attribute on <html> that lifts the CSS rule hiding the comments. */
  const REVEALED_ATTR = "data-unspoiled-comments-revealed";

  function createGate() {
    const gate = document.createElement("div");
    gate.className = CLASS.gate;
    gate.lang = getLanguage();

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = t("showComments");
    button.addEventListener("click", () => {
      document.documentElement.setAttribute(REVEALED_ATTR, "");
    });

    const note = document.createElement("small");
    note.textContent = t("showCommentsWarning");

    gate.append(button, note);
    return gate;
  }

  (ns.features ??= []).push({
    id: "comments",
    init() {
      document.addEventListener("yt-navigate-start", () => {
        document.documentElement.removeAttribute(REVEALED_ATTR);
      });
    },
    sync(active) {
      if (!active) return;
      const comments = document.querySelector(SELECTOR.comments);
      if (!comments) return;

      const current = comments.previousElementSibling;
      const hasGate = current instanceof HTMLElement && current.classList.contains(CLASS.gate);
      if (hasGate && current.lang === getLanguage()) return;

      // Missing, or written in another language: (re)build it.
      if (hasGate) current.replaceWith(createGate());
      else comments.before(createGate());
    },
  });
})((globalThis.Unspoiled ??= {}));
