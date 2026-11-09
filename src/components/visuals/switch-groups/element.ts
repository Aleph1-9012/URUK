import { createPlayer, type Player } from '../../plate/player';
import { SwitchFilm } from './film';
import { CUES, FILM_DURATION, cueAt, formatTime, stillTime } from './timeline';

// The 378 film: the canvas, its subtitles and its controls. Every frame is drawn from the time alone.
class UrukSwitchFilm extends HTMLElement {
  private film: SwitchFilm | undefined;
  private player: Player | undefined;
  private listening: AbortController | undefined;
  private watcher: ResizeObserver | undefined;
  private reduced: MediaQueryList | undefined;
  private range: HTMLInputElement | null = null;
  private clock: Element | null = null;
  private status: Element | null = null;
  private previous: HTMLButtonElement | null = null;
  private next: HTMLButtonElement | null = null;
  private cues: HTMLElement[] = [];
  private time = 0;
  private cue = -1;
  private second = -1;
  private tenth = -1;

  connectedCallback(): void {
    if (this.listening) return;

    const canvas = this.querySelector<HTMLCanvasElement>('[data-film-canvas]');

    if (!canvas) return;

    const labels = new Map<string, HTMLElement>();

    for (const label of this.querySelectorAll<HTMLElement>('[data-label]')) {
      labels.set(label.dataset.label ?? '', label);
    }

    this.film = new SwitchFilm(canvas, labels);
    this.range = this.querySelector('[data-film-range]');
    this.clock = this.querySelector('[data-film-clock]');
    this.status = this.querySelector('[data-film-status]');
    this.previous = this.querySelector('[data-film-previous]');
    this.next = this.querySelector('[data-film-next]');
    this.cues = Array.from(this.querySelectorAll<HTMLElement>('[data-cue]'));
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.cue = -1;
    this.second = -1;
    this.tenth = -1;
    this.listening = new AbortController();
    const { signal } = this.listening;
    this.addEventListener('click', this.onClick, { signal });
    this.range?.addEventListener('input', () => this.seek(Number(this.range?.value ?? 0)), { signal });
    this.range?.addEventListener('keydown', this.onKey, { signal });
    this.reduced.addEventListener('change', () => this.render(this.time), { signal });
    this.watcher = new ResizeObserver(() => this.refit());
    this.watcher.observe(canvas);
    this.watchDensity();
    this.film.resize();
    this.render(0);
    this.setAttribute('data-ready', '');
    this.player = createPlayer(this, { period: FILM_DURATION, start: 0, loop: false, onFrame: (time) => this.render(time) });
    // The formulas are measured again once their font has arrived.
    void document.fonts.ready.then(() => {
      if (this.isConnected) this.refit();
    });
  }

  disconnectedCallback(): void {
    this.player?.destroy();
    this.watcher?.disconnect();
    this.listening?.abort();
    this.listening = undefined;
  }

  private refit(): void {
    this.film?.resize();
    this.render(this.time);
  }

  // A change of pixel density (another screen, or zoom) redraws the canvas at the new density.
  private watchDensity(): void {
    const signal = this.listening?.signal;

    if (!signal) return;

    window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`).addEventListener('change', () => {
      this.refit();
      this.watchDensity();
    }, { once: true, signal });
  }

  private readonly onClick = (event: MouseEvent): void => {
    const button = event.target instanceof Element ? event.target.closest('button') : null;

    if (button?.hasAttribute('data-film-restart')) {
      this.seek(0);

      if (!this.reduced?.matches) this.player?.play();
    } else if (button?.hasAttribute('data-film-previous')) {
      this.step(-1);
    } else if (button?.hasAttribute('data-film-next')) {
      this.step(1);
    }
  };

  private readonly onKey = (event: KeyboardEvent): void => {
    const moves: Record<string, () => void> = {
      ArrowLeft: () => this.step(-1),
      ArrowDown: () => this.step(-1),
      PageDown: () => this.step(-1),
      ArrowRight: () => this.step(1),
      ArrowUp: () => this.step(1),
      PageUp: () => this.step(1),
      Home: () => this.seek(0, true),
      End: () => this.seek(FILM_DURATION, true),
    };
    const move = moves[event.key];

    if (!move) return;

    event.preventDefault();
    move();
  };

  // One subtitle back or forward: its start, or its settled picture when motion is reduced.
  private step(direction: -1 | 1): void {
    const index = Math.min(CUES.length - 1, Math.max(0, cueAt(this.time) + direction));
    this.seek(this.reduced?.matches ? stillTime(index) : CUES[index]?.at ?? 0, true);
  }

  private seek(time: number, announce = false): void {
    this.player?.pause();
    this.player?.seek(time);
    const cue = this.cues[cueAt(time)];

    if (announce && this.status && cue) this.status.textContent = cue.textContent;
  }

  private render(time: number): void {
    this.time = time;
    const index = cueAt(time);

    if (index !== this.cue) {
      this.cue = index;

      for (const [position, cue] of this.cues.entries()) {
        cue.classList.toggle('is-active', position === index);
      }

      if (this.previous) this.previous.disabled = index === 0;
      if (this.next) this.next.disabled = index === CUES.length - 1;
    }

    this.film?.draw(this.reduced?.matches ? stillTime(index) : time);
    const tenth = Math.round(time / 100);

    if (this.range && tenth !== this.tenth) {
      this.tenth = tenth;
      this.range.value = String(time);
    }

    const second = Math.floor(time / 1000);

    if (second !== this.second) {
      this.second = second;
      this.clock?.replaceChildren(`${formatTime(time)} / ${formatTime(FILM_DURATION)}`);
      this.range?.setAttribute('aria-valuetext', `${formatTime(time)} of ${formatTime(FILM_DURATION)}`);
    }
  }
}

if (!customElements.get('uruk-switch-film')) customElements.define('uruk-switch-film', UrukSwitchFilm);
