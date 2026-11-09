import { createPlayer, type Player } from '../../plate/player';
import { FractionRulersFilm } from './film';
import { CUES, FILM_DURATION, cueAt, formatTime, stillTime } from './story';
import type { SeriesMessage } from './worker';

class UrukFractionRulers extends HTMLElement {
  private player: Player | undefined;
  private film: FractionRulersFilm | undefined;
  private worker: Worker | undefined;
  private resizeObserver: ResizeObserver | undefined;
  private events: AbortController | undefined;
  private motion: MediaQueryList | undefined;
  private timeline: HTMLInputElement | null = null;
  private clock: HTMLElement | null = null;
  private announcement: HTMLElement | null = null;
  private previous: HTMLButtonElement | null = null;
  private next: HTMLButtonElement | null = null;
  private subtitles: HTMLElement[] = [];
  private time = 0;
  private activeCue = -1;
  private lastTick = -1;
  private lastSecond = -1;

  connectedCallback(): void {
    if (this.events) return;

    const canvas = this.querySelector<HTMLCanvasElement>('[data-film-canvas]');

    if (!canvas) return;

    const labels = new Map<string, HTMLElement>();

    for (const label of this.querySelectorAll<HTMLElement>('[data-label]')) {
      if (label.dataset.label) labels.set(label.dataset.label, label);
    }

    const events = new AbortController();
    const { signal } = events;
    this.events = events;
    this.film = new FractionRulersFilm(canvas, labels);
    this.timeline = this.querySelector('[data-film-range]');
    this.clock = this.querySelector('[data-film-clock]');
    this.announcement = this.querySelector('[data-film-status]');
    this.previous = this.querySelector('[data-film-previous]');
    this.next = this.querySelector('[data-film-next]');
    this.subtitles = Array.from(this.querySelectorAll<HTMLElement>('[data-cue]'));
    this.motion = matchMedia('(prefers-reduced-motion: reduce)');
    this.activeCue = -1;
    this.lastTick = -1;
    this.lastSecond = -1;
    this.addEventListener('click', this.onControl, { signal });
    this.timeline?.addEventListener('input', this.onScrub, { signal });
    this.timeline?.addEventListener('keydown', this.onTimelineKey, { signal });
    this.motion.addEventListener('change', this.onMotionChange, { signal });
    this.resizeObserver = new ResizeObserver(this.onResize);
    this.resizeObserver.observe(canvas);
    this.watchDensity(signal);
    this.film.resize();
    this.render(0);
    this.setAttribute('data-ready', '');
    this.player = createPlayer(this, {
      period: FILM_DURATION,
      start: 0,
      loop: false,
      onFrame: (time) => this.render(time),
    });
    this.worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    this.worker.addEventListener('message', this.onSeries, { signal });

    void document.fonts.ready.then(() => {
      if (this.events !== events) return;

      this.onResize();
    });
  }

  disconnectedCallback(): void {
    this.player?.destroy();
    this.worker?.terminate();
    this.resizeObserver?.disconnect();
    this.events?.abort();
    this.player = undefined;
    this.worker = undefined;
    this.resizeObserver = undefined;
    this.events = undefined;
    this.film = undefined;
    this.removeAttribute('data-ready');
  }

  private watchDensity(signal: AbortSignal): void {
    const density = matchMedia(`(resolution: ${devicePixelRatio}dppx)`);
    density.addEventListener('change', () => {
      this.onResize();
      this.watchDensity(signal);
    }, { once: true, signal });
  }

  private readonly onResize = (): void => {
    this.film?.resize();
    this.render(this.time);
  };

  private readonly onSeries = (event: MessageEvent<SeriesMessage>): void => {
    if (event.data.kind !== 'series') return;

    this.film?.setSeries(event.data.data);
    this.render(this.time);
  };

  private readonly onMotionChange = (): void => this.render(this.time);

  private readonly onScrub = (): void => this.seek(Number(this.timeline?.value ?? 0));

  private readonly onControl = (event: MouseEvent): void => {
    if (!(event.target instanceof Element)) return;

    const button = event.target.closest('button');

    if (!button) return;

    if (button.hasAttribute('data-film-restart')) {
      this.seek(0, true);

      if (!this.motion?.matches) this.player?.play();
    } else if (button.hasAttribute('data-film-next')) {
      this.step(1);
    } else if (button.hasAttribute('data-film-previous')) {
      this.step(-1);
    }
  };

  private readonly onTimelineKey = (event: KeyboardEvent): void => {
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
    const time = this.motion?.matches ? stillTime(index) : CUES[index]?.at ?? 0;
    this.seek(time, true);
  }

  private seek(time: number, announce = false): void {
    this.player?.pause();
    this.player?.seek(time);

    if (announce && this.announcement) {
      this.announcement.textContent = this.subtitles[cueAt(time)]?.textContent ?? '';
    }
  }

  private render(time: number): void {
    this.time = time;
    const index = cueAt(time);

    if (index !== this.activeCue) {
      this.activeCue = index;

      for (const [position, subtitle] of this.subtitles.entries()) {
        subtitle.classList.toggle('is-active', position === index);
      }

      if (this.previous) this.previous.disabled = index === 0;
      if (this.next) this.next.disabled = index === CUES.length - 1;
    }

    this.film?.draw(this.motion?.matches ? stillTime(index) : time);
    const tick = Math.round(time / 100);

    if (this.timeline && tick !== this.lastTick) {
      this.timeline.value = String(time);
      this.lastTick = tick;
    }

    const second = Math.floor(time / 1000);

    if (second !== this.lastSecond) {
      this.lastSecond = second;
      const elapsed = formatTime(time);
      const duration = formatTime(FILM_DURATION);

      if (this.clock) this.clock.textContent = `${elapsed} / ${duration}`;

      this.timeline?.setAttribute('aria-valuetext', `${elapsed} of ${duration}`);
    }
  }
}

if (!customElements.get('uruk-fraction-rulers')) {
  customElements.define('uruk-fraction-rulers', UrukFractionRulers);
}
