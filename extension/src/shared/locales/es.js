/**
 * Spanish UI strings. `{name}` placeholders are filled by `Unspoiled.i18n.t`.
 * Keep the keys in sync with `en.js`; a test enforces it.
 */
((ns) => {
  "use strict";

  (ns.locales ??= {}).es = Object.freeze({
    statusOn: "Protección activada",
    statusOff: "Apagada: YouTube se ve normal",
    toggleAll: "Encender o apagar la protección",
    languageLabel: "Idioma",

    featurePlayerTitle: "Barra y tiempo",
    featurePlayerHint: "La barra roja y el 3:12 / 1:45:00, también en las vistas previas",
    featureDurationsTitle: "Duración de los vídeos",
    featureDurationsHint: "Duración y progreso de lo ya visto en las miniaturas",
    featureChaptersTitle: "Capítulos y minutos",
    featureChaptersHint: "Títulos de capítulo y minutos de la descripción",
    featureCommentsTitle: "Comentarios",
    featureCommentsHint: "Tapados hasta que pulses «Mostrar comentarios»",
    featureRecommendationsTitle: "Recomendados y pantalla final",
    featureRecommendationsHint: "Columna de sugeridos, tarjetas del final y cuenta atrás",
    featureSeekTitle: "Botones para avanzar",
    featureSeekHint: "Retroceder y avanzar junto al volumen",

    seekStepsLegend: "Tamaño de los saltos",
    seekStepsHint: "Elige hasta {max}. Cada uno añade un botón − y otro +.",
    keyboardTip: "Teclado: ← → mueven 5 s, J y L mueven 10 s.",

    showComments: "Mostrar comentarios",
    showCommentsWarning: "Ojo: pueden destripar el vídeo.",
    seekBackward: "Retroceder {amount}",
    seekForward: "Avanzar {amount}",
  });
})((globalThis.Unspoiled ??= {}));
