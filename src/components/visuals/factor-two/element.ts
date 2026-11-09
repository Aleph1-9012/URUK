import { createPlayer, type Player } from '../../plate/player';
import { FactorTwoFilm } from './film';
import { CUES, FILM_DURATION, cueAt, formatTime, stillTime } from './story';

class UrukFactorTwo extends HTMLElement {
  private drawing: FactorTwoFilm | undefined;
  private player: Player | undefined;
  private observer: ResizeObserver | undefined;
  private events: AbortController | undefined;
  private motion: MediaQueryList | undefined;
  private canvas: HTMLCanvasElement | null = null;
  private range: HTMLInputElement | null = null;
  private clock: HTMLElement | null = null;
  private status: HTMLElement | null = null;
  private previous: HTMLButtonElement | null = null;
  private next: HTMLButtonElement | null = null;
  private subtitles: HTMLElement[] = [];
  private time = 0;
  private cue = -1;
  private rangeTick = -1;
  private second = -1;

  connectedCallback(): void {
    if (this.events) return;

    const canvas = this.querySelector<HTMLCanvasElement>('[data-film-canvas]');
    const context = canvas?.getContext('2d');

    if (!canvas || !context) return;

    const events = new AbortController();
    const { signal } = events;
    this.events = events;
    this.canvas = canvas;
    this.range = this.querySelector('[data-film-range]');
    this.clock = this.querySelector('[data-film-clock]');
    this.status = this.querySelector('[data-film-status]');
    this.previous = this.querySelector('[data-film-previous]');
    this.next = this.querySelector('[data-film-next]');
    this.subtitles = Array.from(this.querySelectorAll<HTMLElement>('[data-cue]'));
    this.motion = matchMedia('(prefers-reduced-motion: reduce)');
    this.drawing = new FactorTwoFilm(this, canvas, context);
    this.time = 0;
    this.cue = -1;
    this.rangeTick = -1;
    this.second = -1;
    this.addEventListener('click', this.onClick, { signal });
    this.range?.addEventListener('input', this.onInput, { signal });
    this.range?.addEventListener('keydown', this.onKey, { signal });
    this.motion.addEventListener('change', this.onMotion, { signal });
    this.observer = new ResizeObserver(this.onResize);
    this.observer.observe(canvas);
    this.watchDensity(signal);
    this.onResize();
    this.setAttribute('data-ready', '');
    this.player = createPlayer(this, {
      period: FILM_DURATION,
      start: 0,
      loop: false,
      onFrame: (time) => this.render(time),
    });

    void document.fonts.ready.then(() => {
      if (this.events === events) this.onResize();
    });
  }

  disconnectedCallback(): void {
    this.player?.destroy();
    this.observer?.disconnect();
    this.events?.abort();
    this.player = undefined;
    this.observer = undefined;
    this.events = undefined;
    this.drawing = undefined;
    this.removeAttribute('data-ready');
  }

  private watchDensity(signal: AbortSignal): void {
    matchMedia(`(resolution: ${devicePixelRatio}dppx)`).addEventListener('change', () => {
      this.onResize();
      this.watchDensity(signal);
    }, { once: true, signal });
  }

  private readonly onResize = (): void => {
    if (!this.canvas || !this.drawing) return;

    const bounds = this.canvas.getBoundingClientRect();
    const width = Math.max(1, bounds.width);
    const height = Math.max(1, bounds.height);
    const density = devicePixelRatio || 1;
    this.drawing.resize(width, height, density);
    this.render(this.time);
  };

  private readonly onMotion = (): void => this.render(this.time);

  private readonly onInput = (): void => this.seek(Number(this.range?.value ?? 0));

  private readonly onClick = (event: MouseEvent): void => {
    if (!(event.target instanceof Element)) return;

    const button = event.target.closest('button');

    if (!button) return;

    if (button.hasAttribute('data-film-restart')) {
      this.seek(0, true);

      if (!this.motion?.matches) this.player?.play();
    } else if (button.hasAttribute('data-film-previous')) {
      this.step(-1);
    } else if (button.hasAttribute('data-film-next')) {
      this.step(1);
    }
  };

  private readonly onKey = (event: KeyboardEvent): void => {
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
      case 'PageDown':
        this.step(-1);
        break;
      case 'ArrowRight':
      case 'ArrowUp':
      case 'PageUp':
        this.step(1);
        break;
      case 'Home':
        this.seek(0, true);
        break;
      case 'End':
        this.seek(FILM_DURATION, true);
        break;
      default:
        return;
    }

    event.preventDefault();
  };

  private step(direction: number): void {
    const index = Math.max(0, Math.min(CUES.length - 1, cueAt(this.time) + direction));
    this.seek(this.motion?.matches ? stillTime(index) : CUES[index]?.at ?? 0, true);
  }

  private seek(time: number, announce = false): void {
    this.player?.pause();
    this.player?.seek(time);

    if (announce && this.status) this.status.textContent = this.subtitles[cueAt(time)]?.textContent ?? '';
  }

  private render(time: number): void {
    this.time = time;
    const index = cueAt(time);

    if (index !== this.cue) {
      this.cue = index;

      for (const [position, subtitle] of this.subtitles.entries()) {
        subtitle.classList.toggle('is-active', position === index);
      }

      if (this.previous) this.previous.disabled = index === 0;
      if (this.next) this.next.disabled = index === CUES.length - 1;
    }

    this.drawing?.draw(this.motion?.matches ? stillTime(index) : time);
    const tick = Math.round(time / 100);

    if (this.range && tick !== this.rangeTick) {
      this.range.value = String(time);
      this.rangeTick = tick;
    }

    const second = Math.floor(time / 1000);

    if (second !== this.second) {
      this.second = second;
      const elapsed = formatTime(time);
      const duration = formatTime(FILM_DURATION);

      if (this.clock) this.clock.textContent = `${elapsed} / ${duration}`;

      this.range?.setAttribute('aria-valuetext', `${elapsed} of ${duration}`);
    }
  }
}

if (!customElements.get('uruk-factor-two')) customElements.define('uruk-factor-two', UrukFactorTwo);
