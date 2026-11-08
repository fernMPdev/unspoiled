/**
 * English UI strings. `{name}` placeholders are filled by `Unspoiled.i18n.t`.
 * Keep the keys in sync with `es.js`; a test enforces it.
 */
((ns) => {
  "use strict";

  (ns.locales ??= {}).en = Object.freeze({
    statusOn: "Protection is on",
    statusOff: "Off: YouTube looks as usual",
    toggleAll: "Turn protection on or off",
    languageLabel: "Language",

    featurePlayerTitle: "Progress bar and time",
    featurePlayerHint: "The red bar and the 3:12 / 1:45:00 readout, also in hover previews",
    featureDurationsTitle: "Video lengths",
    featureDurationsHint: "Length badges and watch progress on thumbnails",
    featureChaptersTitle: "Chapters and timestamps",
    featureChaptersHint: "Chapter titles and timestamps in the description",
    featureCommentsTitle: "Comments",
    featureCommentsHint: "Hidden until you click “Show comments”",
    featureRecommendationsTitle: "Recommendations and end screen",
    featureRecommendationsHint: "Up next sidebar, end cards and autoplay countdown",
    featureSeekTitle: "Seek buttons",
    featureSeekHint: "Rewind and skip buttons next to the volume",

    seekStepsLegend: "Jump sizes",
    seekStepsHint: "Pick up to {max}. Each one adds a − and a + button.",
    keyboardTip: "Keyboard: ← → seek 5 s, J and L seek 10 s.",

    showComments: "Show comments",
    showCommentsWarning: "Heads up: they may spoil the video.",
    seekBackward: "Rewind {amount}",
    seekForward: "Skip ahead {amount}",
  });
})((globalThis.Unspoiled ??= {}));
