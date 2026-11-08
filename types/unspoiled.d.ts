/**
 * Ambient types for the extension's shared namespace. The extension ships as
 * plain scripts (no bundler), so modules communicate through
 * `globalThis.Unspoiled`; these declarations let `tsc --checkJs` verify it.
 */

interface UnspoiledSettings {
  /** Master switch. */
  enabled: boolean;
  player: boolean;
  durations: boolean;
  chapters: boolean;
  comments: boolean;
  recommendations: boolean;
  seek: boolean;
  /** Seek step sizes in seconds, ascending; each gets a − and + button. */
  seekSteps: number[];
  /** `"auto"` follows the browser; otherwise one of `settings.LANGUAGES`. */
  language: string;
}

type UnspoiledLocale = Readonly<Record<string, string>>;

interface UnspoiledFeature {
  /** Must match an id in `Unspoiled.settings.FEATURES`. */
  id: string;
  /** Runs once at startup, e.g. to attach global listeners. */
  init?(): void;
  /** Idempotent; called on every settings change and DOM mutation batch. */
  sync(active: boolean, settings: UnspoiledSettings): void;
}

interface UnspoiledNamespace {
  locales: Record<string, UnspoiledLocale>;
  i18n: {
    readonly FALLBACK: string;
    detect(): string;
    resolve(preference: string): string;
    setLanguage(preference: string): string;
    getLanguage(): string;
    t(key: string, params?: Record<string, string | number>): string;
    localize(root: ParentNode): void;
  };
  settings: {
    readonly FEATURES: readonly string[];
    readonly SEEK_STEP_OPTIONS: readonly number[];
    readonly MAX_SEEK_STEPS: number;
    readonly LANGUAGES: readonly string[];
    readonly AUTO_LANGUAGE: string;
    readonly DEFAULTS: Readonly<UnspoiledSettings>;
    normalize(raw?: Record<string, unknown>): UnspoiledSettings;
    normalizeSeekSteps(raw: unknown): number[];
    activeFeatures(settings: UnspoiledSettings): string[];
    load(): Promise<UnspoiledSettings>;
    save(patch: Partial<UnspoiledSettings>): Promise<void>;
    subscribe(listener: (settings: UnspoiledSettings) => void): void;
  };
  time: {
    isTimestamp(text: string): boolean;
    formatDuration(seconds: number): string;
    formatStep(seconds: number): string;
    toSeekDeltas(steps: readonly number[]): number[];
    clampSeek(current: number, delta: number, duration: number): number;
  };
  watchDom(
    callback: () => void,
    options?: { delay?: number },
  ): { schedule(): void; disconnect(): void };
  features: UnspoiledFeature[];
}

// eslint-disable-next-line no-var
declare var Unspoiled: Partial<UnspoiledNamespace>;
