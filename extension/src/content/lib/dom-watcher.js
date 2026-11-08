/**
 * YouTube is a single-page app that rebuilds large parts of the DOM while you
 * browse. Instead of chasing individual elements, features expose an
 * idempotent `sync()` and we re-run it (debounced) after DOM changes and
 * client-side navigations.
 */
((ns) => {
  "use strict";

  /**
   * @param {() => void} callback
   * @param {{ delay?: number }} [options]
   * @returns {{ schedule: () => void, disconnect: () => void }}
   */
  function watchDom(callback, { delay = 250 } = {}) {
    let timer = null;

    const schedule = () => {
      if (timer !== null) return;
      timer = setTimeout(() => {
        timer = null;
        callback();
      }, delay);
    };

    const observer = new MutationObserver(schedule);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    document.addEventListener("yt-navigate-finish", schedule);

    return {
      schedule,
      disconnect() {
        observer.disconnect();
        document.removeEventListener("yt-navigate-finish", schedule);
        clearTimeout(timer);
        timer = null;
      },
    };
  }

  ns.watchDom = watchDom;
})((globalThis.Unspoiled ??= {}));
