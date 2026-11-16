export type FilmTones = Readonly<Record<'ink' | 'blue' | 'muted' | 'paper', string>>;

/** The canvas as the controller last measured it: CSS pixels, device density, and the page's colour tokens. */
export type FilmFrame = {
  readonly width: number;
  readonly height: number;
  readonly density: number;
  readonly tones: FilmTones;
};

/** The values in `styles/tokens.css`. A film holds these until its first `resize`, which always precedes a draw. */
export const PAGE_TONES: FilmTones = { ink: '#1c1a17', blue: '#28486e', muted: '#5f584d', paper: '#e7e5e0' };

/** Below this stage width the films use their phone layout. It matches `@container plate (max-width: 599px)` in the film styles. */
export const PHONE_STAGE_WIDTH = 600;

export function readFrame(canvas: HTMLCanvasElement): FilmFrame {
  const bounds = canvas.getBoundingClientRect();
  const style = getComputedStyle(canvas);
  const tone = (name: keyof FilmTones): string => style.getPropertyValue(`--${name}`).trim() || PAGE_TONES[name];

  return {
    width: Math.max(1, bounds.width),
    height: Math.max(1, bounds.height),
    density: devicePixelRatio || 1,
    tones: { ink: tone('ink'), blue: tone('blue'), muted: tone('muted'), paper: tone('paper') },
  };
}
