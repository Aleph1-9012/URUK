import { createPlayer, swingAt, swingPeriod, swingTimeOf, type Player } from '../../plate/player';
import { bindTrack, wake, type Track } from '../../plate/track';
import { describeK, formatK } from './labels';
import { FILM, K_MAX, K_MIN, K_START } from './orbits';
import type { OrbitJob, OrbitPicture } from './worker';

// Once k has stopped moving for this long, the rough picture is redrawn in full.
const SETTLE_AFTER = 250;

class UrukStandardMap extends HTMLElement {
  private worker: Worker | undefined;
  private track: Track | undefined;
  private player: Player | undefined;
  private observer: ResizeObserver | undefined;
  private canvas: HTMLCanvasElement | null = null;
  private k = K_START;
  private lastId = 0;
  private busy = false;
  private waiting: OrbitJob | undefined;
  private settle: number | undefined;

  private readonly onPicture = (event: MessageEvent<OrbitPicture>) => {
    const picture = event.data;
    this.busy = false;

    // A picture for a canvas size that has since changed is dropped; the resize has asked for a new one.
    if (this.canvas && picture.width === this.canvas.width && picture.height === this.canvas.height) {
      this.canvas.getContext('2d')?.putImageData(new ImageData(picture.pixels, picture.width, picture.height), 0, 0);
      this.querySelector('[data-plate-loader]')?.remove();
    }

    this.sendWaiting();
  };

  private readonly onClick = (event: MouseEvent) => {
    if (event.target instanceof Element && event.target.closest('[data-reset]')) {
      this.player?.seek(swingTimeOf(FILM, K_START));
    }
  };

  connectedCallback(): void {
    this.canvas = this.querySelector<HTMLCanvasElement>('[data-map-canvas]');
    const figure = this.querySelector<HTMLElement>('[data-map-figure]');
    const track = this.querySelector<HTMLElement>('[data-track]');

    if (!this.canvas || !figure || !track) {
      return;
    }

    this.worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    this.worker.addEventListener('message', this.onPicture);
    this.track = bindTrack(track, {
      min: K_MIN,
      max: K_MAX,
      step: 0.01,
      page: 0.1,
      value: K_START,
      describe: describeK,
      // The reader has taken over: the film stops at the k they chose.
      onInput: (k, settled) => {
        this.player?.pause();
        this.player?.seek(swingTimeOf(FILM, k));
        this.change(k, settled);
      },
    });
    this.player = createPlayer(this, {
      period: swingPeriod(FILM),
      start: swingTimeOf(FILM, K_START),
      onFrame: (time) => {
        const k = swingAt(FILM, time);
        this.track?.glide(k);

        // While the film rests at either end, k is still, and the picture is left to sharpen.
        if (k !== this.k) {
          this.change(k, false);
        }
      },
    });
    this.addEventListener('click', this.onClick);
    this.observer = new ResizeObserver(() => this.resize(figure));
    this.observer.observe(figure);
    wake(this);
  }

  disconnectedCallback(): void {
    this.worker?.terminate();
    this.track?.destroy();
    this.player?.destroy();
    this.observer?.disconnect();
    window.clearTimeout(this.settle);
    this.removeEventListener('click', this.onClick);
  }

  private change(k: number, settled: boolean): void {
    this.k = k;
    const readout = this.querySelector('[data-readout]');

    if (readout) {
      readout.textContent = `k = ${formatK(k)}`;
    }

    this.canvas?.setAttribute('aria-label', `Orbits of the standard map at ${describeK(k)}.`);
    this.draw(!settled);
    window.clearTimeout(this.settle);

    if (!settled) {
      this.settle = window.setTimeout(() => this.draw(false), SETTLE_AFTER);
    }
  }

  private resize(figure: HTMLElement): void {
    if (!this.canvas) {
      return;
    }

    const ratio = window.devicePixelRatio || 1;
    const width = Math.round(figure.clientWidth * ratio);
    const height = Math.round(figure.clientHeight * ratio);

    if (width === 0 || height === 0 || (width === this.canvas.width && height === this.canvas.height)) {
      return;
    }

    this.canvas.width = width;
    this.canvas.height = height;
    this.draw(false);
  }

  // One picture at a time; while one is being drawn only the newest request waits, so a fast film never queues up.
  private draw(draft: boolean): void {
    if (!this.canvas || this.canvas.width === 0) {
      return;
    }

    this.lastId += 1;
    const dot = Math.max(1, Math.round(window.devicePixelRatio || 1));
    this.waiting = { id: this.lastId, k: this.k, canvas: { width: this.canvas.width, height: this.canvas.height, dot }, draft };
    this.sendWaiting();
  }

  private sendWaiting(): void {
    if (this.busy || !this.waiting || !this.worker) {
      return;
    }

    this.busy = true;
    this.worker.postMessage(this.waiting);
    this.waiting = undefined;
  }
}

if (!customElements.get('uruk-standard-map')) {
  customElements.define('uruk-standard-map', UrukStandardMap);
}
