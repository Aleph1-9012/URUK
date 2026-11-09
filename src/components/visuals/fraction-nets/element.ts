import { createPlayer, type Player } from '../../plate/player';
import { FractionNetsFilm } from './film';
import { CUES, FILM_DURATION, cueAt, formatTime, stillTime } from './story';

class UrukFractionNets extends HTMLElement {
  private player: Player | undefined;
  private drawing: FractionNetsFilm | undefined;
  private events: AbortController | undefined;
  private observer: ResizeObserver | undefined;
  private motion: MediaQueryList | undefined;
  private range: HTMLInputElement | null = null;
  private cues: HTMLElement[] = [];
  private current = -1;
  private time = 0;
  private second = -1;
  private rangeStep = -1;

  connectedCallback(): void {
    if (this.events) return;

    const canvas = this.querySelector<HTMLCanvasElement>('[data-film-canvas]');

    if (!canvas) return;

    const labels = new Map<string, HTMLElement>();

    for (const element of this.querySelectorAll<HTMLElement>('[data-label]')) {
      labels.set(element.dataset.label ?? '', element);
    }

    this.drawing = new FractionNetsFilm(canvas, labels);
    this.events = new AbortController();
    const { signal } = this.events;
    this.range = this.querySelector('[data-film-range]');
    this.cues = Array.from(this.querySelectorAll('[data-cue]'));
    this.motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.addEventListener('click', this.onClick, { signal });
    this.range?.addEventListener('input', this.onInput, { signal });
    this.range?.addEventListener('keydown', this.onKey, { signal });
    this.motion.addEventListener('change', this.onMotion, { signal });
    this.observer = new ResizeObserver(() => {
      this.drawing?.resize();
      this.render(this.time);
    });

    this.observer.observe(canvas);
    this.watchDensity();
    this.drawing.resize();
    this.render(0);
    this.setAttribute('data-ready', '');
    this.player = createPlayer(this, { period: FILM_DURATION, start: 0, loop: false, onFrame: (time) => this.render(time) });
    // Once the fonts arrive the labels are measured again.
    void document.fonts.ready.then(() => {
      if (!this.isConnected) return;

      this.drawing?.resize();
      this.render(this.time);
    });
  }

  disconnectedCallback(): void {
    this.player?.destroy();
    this.observer?.disconnect();
    this.events?.abort();
    this.events = undefined;
  }

  private watchDensity(): void {
    if (!this.events) return;

    const query = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    query.addEventListener('change', () => {
      this.drawing?.resize();
      this.render(this.time);
      this.watchDensity();
    }, { once: true, signal: this.events.signal });
  }

  private readonly onMotion = () => this.render(this.time);

  private readonly onInput = () => this.seek(Number(this.range?.value ?? 0));

  private readonly onClick = (event: MouseEvent) => {
    const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>('button') : null;

    if (!button) return;

    if (button.hasAttribute('data-film-restart')) {
      this.seek(0);

      if (!this.motion?.matches) this.player?.play();
    } else if (button.hasAttribute('data-film-previous')) {
      this.step(-1);
    } else if (button.hasAttribute('data-film-next')) {
      this.step(1);
    }
  };

  private readonly onKey = (event: KeyboardEvent) => {
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

  // One subtitle back or forward, landing at its start.
  private step(direction: number): void {
    const index = Math.min(CUES.length - 1, Math.max(0, cueAt(this.time) + direction));
    this.seek(this.motion?.matches ? stillTime(index) : CUES[index]?.at ?? 0, true);
  }

  private seek(time: number, announce = false): void {
    this.player?.pause();
    this.player?.seek(time);
    const status = this.querySelector('[data-film-status]');
    const cue = this.cues[cueAt(time)];

    if (status && announce && cue) status.textContent = cue.textContent;
  }

  private render(time: number): void {
    this.time = time;
    const index = cueAt(time);

    if (this.current !== index) {
      this.current = index;

      for (const [at, cue] of this.cues.entries()) {
        cue.classList.toggle('is-active', at === index);
      }

      const previous = this.querySelector<HTMLButtonElement>('[data-film-previous]');
      const next = this.querySelector<HTMLButtonElement>('[data-film-next]');

      if (previous) previous.disabled = index === 0;
      if (next) next.disabled = index === CUES.length - 1;
    }

    this.drawing?.draw(this.motion?.matches ? stillTime(index) : time);
    const step = Math.round(time / 100);

    if (this.range && step !== this.rangeStep) {
      this.range.value = String(time);
      this.rangeStep = step;
    }

    const second = Math.floor(time / 1000);

    if (this.second !== second) {
      this.second = second;
      this.querySelector('[data-film-clock]')?.replaceChildren(`${formatTime(time)} / ${formatTime(FILM_DURATION)}`);
      this.range?.setAttribute('aria-valuetext', `${formatTime(time)} of ${formatTime(FILM_DURATION)}`);
    }
  }
}

if (!customElements.get('uruk-fraction-nets')) customElements.define('uruk-fraction-nets', UrukFractionNets);
