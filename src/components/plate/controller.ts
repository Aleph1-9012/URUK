import { createPlayer, type Player } from './player';
import type { FilmTimeline } from './timeline';

export type FilmDrawing = {
  resize: (width: number, height: number, density: number) => void;
  draw: (time: number) => void;
};

export type FilmSetup = {
  root: HTMLElement;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  labels: ReadonlyMap<string, HTMLElement>;
  signal: AbortSignal;
  redraw: () => void;
};

export function defineFilm(name: string, timeline: FilmTimeline, setup: (film: FilmSetup) => FilmDrawing): void {
  if (customElements.get(name)) return;

  class FilmElement extends HTMLElement {
    private disconnect: (() => void) | undefined;

    connectedCallback(): void {
      if (this.disconnect) return;

      const canvas = this.querySelector<HTMLCanvasElement>('[data-film-canvas]');
      const context = canvas?.getContext('2d');

      if (!canvas || !context) return;

      const surface = canvas;
      const events = new AbortController();
      const { signal } = events;
      const range = this.querySelector<HTMLInputElement>('[data-film-range]');
      const clock = this.querySelector('[data-film-clock]');
      const status = this.querySelector('[data-film-status]');
      const previous = this.querySelector<HTMLButtonElement>('[data-film-previous]');
      const next = this.querySelector<HTMLButtonElement>('[data-film-next]');
      const subtitles = Array.from(this.querySelectorAll<HTMLElement>('[data-cue]'));
      const motion = matchMedia('(prefers-reduced-motion: reduce)');
      const labels = new Map<string, HTMLElement>();
      let time = 0;
      let cue = -1;
      let rangeTick = -1;
      let second = -1;
      let player: Player | undefined;

      for (const label of this.querySelectorAll<HTMLElement>('[data-label]')) {
        if (label.dataset.label) labels.set(label.dataset.label, label);
      }

      const drawing = setup({ root: this, canvas, context, labels, signal, redraw: () => render(time) });

      function render(nextTime: number): void {
        time = nextTime;
        const index = timeline.cueAt(time);

        if (index !== cue) {
          cue = index;

          for (const [position, subtitle] of subtitles.entries()) {
            subtitle.classList.toggle('is-active', position === index);
          }

          if (previous) previous.disabled = index === 0;
          if (next) next.disabled = index === timeline.cues.length - 1;
        }

        drawing.draw(motion.matches ? timeline.stillTime(index) : time);
        const tick = Math.round(time / 100);

        if (range && (tick !== rangeTick || time === timeline.duration || time === 0)) {
          range.value = String(time);
          rangeTick = tick;
        }

        const elapsedSecond = Math.floor(time / 1000);

        if (elapsedSecond !== second) {
          second = elapsedSecond;
          const elapsed = timeline.formatTime(time);
          const duration = timeline.formatTime(timeline.duration);

          if (clock) clock.textContent = `${elapsed} / ${duration}`;

          range?.setAttribute('aria-valuetext', `${elapsed} of ${duration}`);
        }
      }

      function resize(): void {
        if (signal.aborted) return;

        const bounds = surface.getBoundingClientRect();
        drawing.resize(Math.max(1, bounds.width), Math.max(1, bounds.height), devicePixelRatio || 1);
        render(time);
      }

      function watchDensity(): void {
        matchMedia(`(resolution: ${devicePixelRatio}dppx)`).addEventListener('change', () => {
          resize();
          watchDensity();
        }, { once: true, signal });
      }

      function seek(nextTime: number, announce = false): void {
        player?.pause();
        player?.seek(nextTime);

        if (announce && status) status.textContent = subtitles[timeline.cueAt(nextTime)]?.textContent ?? '';
      }

      function step(direction: -1 | 1): void {
        const index = Math.max(0, Math.min(timeline.cues.length - 1, timeline.cueAt(time) + direction));
        seek(motion.matches ? timeline.stillTime(index) : timeline.cues[index]?.at ?? 0, true);
      }

      this.addEventListener('click', (event) => {
        if (!(event.target instanceof Element)) return;

        const button = event.target.closest('button');

        if (button?.hasAttribute('data-film-restart')) {
          seek(0, true);

          if (!motion.matches) player?.play();
        } else if (button?.hasAttribute('data-film-previous')) {
          step(-1);
        } else if (button?.hasAttribute('data-film-next')) {
          step(1);
        }
      }, { signal });
      range?.addEventListener('input', () => seek(Number(range.value)), { signal });
      range?.addEventListener('keydown', (event) => {
        switch (event.key) {
          case 'ArrowLeft':
          case 'ArrowDown':
          case 'PageDown':
            step(-1);
            break;
          case 'ArrowRight':
          case 'ArrowUp':
          case 'PageUp':
            step(1);
            break;
          case 'Home':
            seek(0, true);
            break;
          case 'End':
            seek(timeline.duration, true);
            break;
          default:
            return;
        }

        event.preventDefault();
      }, { signal });
      motion.addEventListener('change', () => render(time), { signal });
      const observer = new ResizeObserver(resize);
      observer.observe(canvas);
      watchDensity();
      resize();
      this.setAttribute('data-ready', '');
      player = createPlayer(this, { period: timeline.duration, start: 0, loop: false, onFrame: render });
      this.disconnect = () => {
        player?.destroy();
        observer.disconnect();
        events.abort();
        this.removeAttribute('data-ready');
      };

      void document.fonts.ready.then(() => {
        if (!signal.aborted) resize();
      });
    }

    disconnectedCallback(): void {
      this.disconnect?.();
      this.disconnect = undefined;
    }
  }

  customElements.define(name, FilmElement);
}
