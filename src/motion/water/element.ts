import { breezeOffsets } from './breeze';
import { paintWaterTint } from './tint';

function offsetsChanged(
  previous: Int16Array | null,
  next: Int16Array,
): boolean {
  if (!previous || previous.length !== next.length) {
    return true;
  }

  for (let row = 0; row < next.length; row += 1) {
    if (previous[row] !== next[row]) {
      return true;
    }
  }

  return false;
}

function drawOffsetRuns(
  context: CanvasRenderingContext2D,
  surface: HTMLCanvasElement,
  offsets: Int16Array,
  width: number,
  margin: number,
): void {
  if (width <= 0) {
    return;
  }

  context.clearRect(0, 0, width, offsets.length);
  context.imageSmoothingEnabled = false;

  let rowStart = 0;

  while (rowStart < offsets.length) {
    const offset = offsets[rowStart] ?? 0;
    let rowEnd = rowStart + 1;

    while (rowEnd < offsets.length && (offsets[rowEnd] ?? 0) === offset) {
      rowEnd += 1;
    }

    const runHeight = rowEnd - rowStart;
    const sourceX = margin - offset;

    context.drawImage(
      surface,
      sourceX,
      rowStart,
      width,
      runHeight,
      0,
      rowStart,
      width,
      runHeight,
    );

    rowStart = rowEnd;
  }
}

class UrukWaterElement extends HTMLElement {
  private canvas: HTMLCanvasElement | null = null;
  private canvasContext: CanvasRenderingContext2D | null = null;
  private image: HTMLImageElement | null = null;
  private mediaPreference: MediaQueryList | null = null;
  private plate: Element | null = null;
  private preRendered: HTMLCanvasElement | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private frameRequest: number | null = null;
  private previousOffsets: Int16Array | null = null;
  private rowCount = 0;
  private bitmapWidth = 0;
  private margin = 0;
  private pixelRatio = 1;
  private scale = 1;
  private startedAt = 0;
  private lastDrawAt = 0;
  private runId = 0;
  private active = false;
  private inView = true;

  private readonly onPreferenceChange = (): void => {
    if (this.mediaPreference?.matches) {
      this.stopMotion();
    } else {
      void this.startMotion();
    }
  };

  private readonly onWindowResize = (): void => {
    this.prepareSurface();
    this.scheduleFrame();
  };

  private readonly onVisibilityChange = (): void => {
    if (document.hidden) {
      this.cancelFrame();
    } else {
      this.scheduleFrame();
    }
  };

  private readonly onIntersectionChange = (
    entries: IntersectionObserverEntry[],
  ): void => {
    const entry = entries[0];

    if (!entry) {
      return;
    }

    this.inView = entry.isIntersecting;

    if (this.inView) {
      this.scheduleFrame();
    } else {
      this.cancelFrame();
    }
  };

  connectedCallback(): void {
    const plateId = this.getAttribute('for');
    const canvas = this.querySelector('canvas');
    const plate = plateId ? document.getElementById(plateId) : null;

    if (!canvas || !plate) {
      return;
    }

    this.canvas = canvas;
    this.plate = plate;
    this.mediaPreference = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    );
    this.mediaPreference.addEventListener('change', this.onPreferenceChange);
    document.addEventListener('visibilitychange', this.onVisibilityChange);

    if (!this.mediaPreference.matches) {
      void this.startMotion();
    }
  }

  disconnectedCallback(): void {
    this.mediaPreference?.removeEventListener(
      'change',
      this.onPreferenceChange,
    );
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.stopMotion();
  }

  private async startMotion(): Promise<void> {
    if (
      this.active ||
      !this.isConnected ||
      this.mediaPreference?.matches ||
      !this.canvas ||
      !this.plate
    ) {
      return;
    }

    const density = window.devicePixelRatio >= 1.5 ? '2x' : '1x';
    const source = this.getAttribute(`data-water-${density}`);

    if (!source) {
      return;
    }

    this.active = true;
    this.runId += 1;
    const runId = this.runId;
    const image = new Image();
    image.decoding = 'async';
    image.src = source;

    try {
      await image.decode();
    } catch {
      if (runId === this.runId) {
        this.active = false;
      }

      return;
    }

    if (
      !this.active ||
      runId !== this.runId ||
      !this.isConnected ||
      this.mediaPreference?.matches
    ) {
      return;
    }

    this.image = image;
    this.startedAt = performance.now();
    this.observeLayout();
    this.prepareSurface();
    this.scheduleFrame();
  }

  private observeLayout(): void {
    if (!this.resizeObserver) {
      this.resizeObserver = new ResizeObserver(this.onWindowResize);
      this.resizeObserver.observe(this);
    }

    if (!this.intersectionObserver) {
      this.intersectionObserver = new IntersectionObserver(
        this.onIntersectionChange,
      );
      this.intersectionObserver.observe(this);
    }

    window.addEventListener('resize', this.onWindowResize);
  }

  private prepareSurface(): void {
    const canvas = this.canvas;
    const image = this.image;
    const plate = this.plate;

    if (!canvas || !image || !plate || !this.active) {
      return;
    }

    const waterRect = this.getBoundingClientRect();
    const plateRect = plate.getBoundingClientRect();
    const pixelRatio = window.devicePixelRatio || 1;
    const width = Math.round(waterRect.width * pixelRatio);
    const height = Math.round(waterRect.height * pixelRatio);
    const scale = plateRect.width / 760;
    const margin = Math.ceil(3 * scale * pixelRatio) + 1;

    if (width <= 0 || height <= 0) {
      return;
    }

    this.removeAttribute('data-live');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    const surface = document.createElement('canvas');

    surface.width = width + 2 * margin;
    surface.height = height;
    const surfaceContext = surface.getContext('2d');

    if (!context || !surfaceContext) {
      this.stopMotion();
      return;
    }

    const imageLeft =
      (plateRect.left - waterRect.left - 0.5 * plateRect.width) * pixelRatio;
    const imageWidth = 1.894737 * plateRect.width * pixelRatio;
    const shiftedImageLeft = imageLeft + margin;
    const imageRight = shiftedImageLeft + imageWidth;
    const leftWidth = Math.max(
      0,
      Math.min(surface.width, shiftedImageLeft),
    );
    const rightStart = Math.max(0, Math.min(surface.width, imageRight));
    const rightWidth = Math.max(0, surface.width - rightStart);

    paintWaterTint(surfaceContext, 0, 0, leftWidth, height);
    paintWaterTint(surfaceContext, rightStart, 0, rightWidth, height);
    surfaceContext.imageSmoothingEnabled = true;
    surfaceContext.imageSmoothingQuality = 'high';
    surfaceContext.drawImage(image, shiftedImageLeft, 0, imageWidth, height);

    this.canvasContext = context;
    this.preRendered = surface;
    this.rowCount = height;
    this.bitmapWidth = width;
    this.margin = margin;
    this.pixelRatio = pixelRatio;
    this.scale = scale;
    this.previousOffsets = null;
    this.lastDrawAt = 0;
  }

  private scheduleFrame(): void {
    if (
      !this.active ||
      !this.inView ||
      document.hidden ||
      this.frameRequest !== null
    ) {
      return;
    }

    this.frameRequest = requestAnimationFrame(this.drawFrame);
  }

  private cancelFrame(): void {
    if (this.frameRequest !== null) {
      cancelAnimationFrame(this.frameRequest);
      this.frameRequest = null;
    }
  }

  private readonly drawFrame = (time: number): void => {
    this.frameRequest = null;

    if (
      !this.active ||
      !this.inView ||
      document.hidden ||
      !this.canvasContext ||
      !this.preRendered
    ) {
      return;
    }

    if (time - this.lastDrawAt >= 1000 / 30 || !this.previousOffsets) {
      const offsets = breezeOffsets({
        rows: this.rowCount,
        pixelRatio: this.pixelRatio,
        scale: this.scale,
        elapsedMs: time - this.startedAt,
      });

      this.lastDrawAt = time;

      if (offsetsChanged(this.previousOffsets, offsets)) {
        drawOffsetRuns(
          this.canvasContext,
          this.preRendered,
          offsets,
          this.bitmapWidth,
          this.margin,
        );
        this.previousOffsets = offsets;

        if (!this.hasAttribute('data-live')) {
          this.setAttribute('data-live', '');
        }
      }
    }

    this.scheduleFrame();
  };

  private stopMotion(): void {
    this.active = false;
    this.runId += 1;
    this.cancelFrame();
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    this.resizeObserver = null;
    this.intersectionObserver = null;
    window.removeEventListener('resize', this.onWindowResize);
    this.canvasContext?.clearRect(0, 0, this.bitmapWidth, this.rowCount);
    this.removeAttribute('data-live');
    this.image = null;
    this.preRendered = null;
    this.previousOffsets = null;
  }
}

if (!customElements.get('uruk-water')) {
  customElements.define('uruk-water', UrukWaterElement);
}
