import { paintRiver, prepareRiver, stirWake, type River } from './river';
import { paintRunoff, prepareRunoff, type Runoff } from './runoff';
import { BOAT_SCALE, WATERLINE, boatPose, type Course } from './swell';
import { LINE_BUDGET, UNTYPED, layOutTyping, readGlyphs, struckBy, typedClip, type Typing } from './typing';

/** Boat widths per second. */
const PASS_SPEED = 1.8;
const MIN_PASS = 2000;
const MAX_PASS = 3600;
const RISE = 1700;
const LOGO_DELAY = 200;
const SETTLE = 1100;
/** How far past its resting place the art rises, as a fraction of its own height. */
const OVERSHOOT = 0.024;
const OFFSTAGE_MARGIN = 12;
const IMAGE_WAIT = 2500;
const ENDING_EVENTS = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll', 'resize', 'pagehide'] as const;
/** Once the name reaches the top of its rise, the text is typed line by line, each this long after the one before. */
const LINE_STAGGER = 100;

/** Art coming up out of the water: it rises past rest, then bobs once and settles. */
interface Rise {
  element: HTMLElement;
  rest: DOMRect;
  /** The water surface the art comes up through, in viewport pixels. */
  cut: number;
  /** How far below its resting place it starts. */
  depth: number;
  overshoot: number;
  start: number;
  rise: number;
  settle: number;
}

/** A line of text and when it starts; its letters are measured as it starts, once the fonts have long set them. */
interface Line {
  element: HTMLElement;
  start: number;
  typing: Typing | null;
  /** How many glyphs the clip shows, so an unchanged line is not written again. */
  shown: number;
}

function smoothstep(amount: number): number {
  const clamped = Math.min(1, Math.max(0, amount));

  return clamped * clamped * (3 - 2 * clamped);
}

/** How far below its resting place it lies. */
function sunkBy(rise: Rise, elapsed: number): number {
  const time = elapsed - rise.start;

  if (time <= 0) return rise.depth;

  if (time < rise.rise) {
    return rise.depth - (rise.depth + rise.overshoot) * smoothstep(time / rise.rise);
  }

  const settled = Math.min(1, (time - rise.rise) / rise.settle);

  return -rise.overshoot * (1 - settled) ** 2 * (1 + 2 * settled) * Math.cos(1.5 * Math.PI * settled);
}

/** Whole device pixels let the browser copy the art instead of resampling it at a fractional offset. */
function snap(value: number): number {
  return Math.round(value * devicePixelRatio) / devicePixelRatio;
}

/** Move the art and hide what is still under the water. A plain rectangle keeps the browser from repainting a mask each frame. */
function placeRise(rise: Rise, shift: number): void {
  const { element, rest } = rise;
  const sunk = snap(shift);
  const underwater = snap(Math.min(rest.height, rest.top + sunk + rest.height - rise.cut));

  element.style.transform = `translateY(${sunk}px)`;
  element.style.clipPath = underwater > 0 ? `inset(0 0 ${underwater}px 0)` : '';
}

class UrukVoyageElement extends HTMLElement {
  private readonly motion = matchMedia('(prefers-reduced-motion: reduce)');
  private readonly rises: Rise[] = [];
  private readonly lines: Line[] = [];
  private deadline = 0;
  private frame = 0;
  private ended = false;

  private readonly end = (): void => {
    if (this.ended) return;

    this.ended = true;
    window.clearTimeout(this.deadline);
    window.cancelAnimationFrame(this.frame);

    for (const { element } of this.rises) {
      element.style.transform = '';
      element.style.clipPath = '';
    }

    for (const { element } of this.lines) element.style.clipPath = '';

    for (const canvas of this.querySelectorAll('canvas')) canvas.width = 0;

    for (const type of ENDING_EVENTS) window.removeEventListener(type, this.end, true);

    this.motion.removeEventListener('change', this.end);
    delete document.documentElement.dataset.voyageStage;
  };

  connectedCallback(): void {
    const root = document.documentElement;

    if (this.ended || root.dataset.voyageStage !== 'waiting') return;

    root.dataset.voyageStage = 'loading';

    if (this.motion.matches || document.hidden || location.hash || window.scrollY > 0) {
      this.end();
      return;
    }

    this.deadline = window.setTimeout(this.end, IMAGE_WAIT);

    for (const type of ENDING_EVENTS) window.addEventListener(type, this.end, { capture: true, passive: true });

    this.motion.addEventListener('change', this.end);
    void this.play().catch(this.end);
  }

  disconnectedCallback(): void {
    this.end();
  }

  private async play(): Promise<void> {
    const hero = this.parentElement;
    const hull = this.querySelector<HTMLImageElement>('.voyage__hull');
    const ruins = this.querySelector<HTMLImageElement>('.voyage__ruins-reflection');
    const surface = this.querySelector<HTMLCanvasElement>('.voyage__surface');
    const spill = this.querySelector<HTMLCanvasElement>('.voyage__runoff');
    const plate = hero?.querySelector<HTMLImageElement>('#hero-plate');
    const logo = hero?.querySelector<HTMLElement>('.hero__logo');
    const wordmark = logo?.querySelector('img');

    if (!hero || !hull || !ruins || !surface || !spill || !plate || !logo || !wordmark) {
      this.end();
      return;
    }

    for (const image of [hull, ruins]) image.loading = 'eager';

    await Promise.all([hull, ruins, plate, wordmark].map((image) => image.decode()));

    if (this.ended) return;

    const water = this.getBoundingClientRect();
    const plateRest = plate.getBoundingClientRect();
    const logoRest = logo.getBoundingClientRect();
    const scale = plateRest.width / 760;
    const boatWidth = BOAT_SCALE * plateRest.width;
    const lift = water.top - surface.getBoundingClientRect().top;
    const start = -1.12 * boatWidth - OFFSTAGE_MARGIN;
    const distance = water.width + 0.2 * boatWidth + OFFSTAGE_MARGIN - start;
    const duration = Math.min(MAX_PASS, Math.max(MIN_PASS, distance / (PASS_SPEED * boatWidth / 1000)));
    const course: Course = { start, distance, duration, boatWidth };

    this.rises.push(
      this.rising(plate, plateRest, water.top, duration),
      this.rising(logo, logoRest, water.top, duration + LOGO_DELAY),
    );

    // The nav row, the intro and the button in turn, then the scroll mark and the credit together.
    const visible = Array.from(hero.querySelectorAll<HTMLElement>('[data-voyage-text]'))
      .filter((element) => element.getClientRects().length > 0);
    const above = visible.filter((element) => !element.closest('.hero__foot'));
    const linesAt = duration + LOGO_DELAY + RISE;

    for (const element of visible) {
      const order = above.indexOf(element);
      const step = order === -1 ? above.length : order;

      this.lines.push({ element, start: linesAt + step * LINE_STAGGER, typing: null, shown: -1 });
    }

    const linesEnd = Math.max(0, ...this.lines.map((line) => line.start + LINE_BUDGET));
    const finish = Math.max(duration + LOGO_DELAY + RISE + SETTLE, linesEnd);
    const river = prepareRiver(surface, hull, ruins, {
      horizon: lift,
      waterline: lift + WATERLINE * plateRest.width,
      scale,
      boatWidth,
      speed: distance / duration,
      ruinsLeft: plateRest.left - water.left - 0.5 * plateRest.width + 755 / 2880 * 1.894737 * plateRest.width,
      ruinsWidth: 1531 / 2880 * 1.894737 * plateRest.width,
    });
    const runoff = this.prepareSpill(spill, water, scale);

    if (!river || !runoff) {
      this.end();
      return;
    }

    window.clearTimeout(this.deadline);
    this.deadline = window.setTimeout(this.end, finish + 600);

    const startedAt = performance.now();
    const draw = (now: number): void => {
      if (this.ended) return;

      const elapsed = Math.min(now - startedAt, finish);

      if (elapsed < duration) {
        const boat = boatPose(course, elapsed);

        stirWake(river, boat, elapsed);
        paintRiver(river, { elapsed, boat, ruinsDepth: null, stir: 0 });
      } else {
        this.paintRise(river, runoff, elapsed, duration, finish);
      }

      if (elapsed === finish) {
        this.end();
      } else {
        this.frame = window.requestAnimationFrame(draw);
      }
    };

    draw(startedAt);
    document.documentElement.dataset.voyageStage = 'sailing';
  }

  private rising(element: HTMLElement, rest: DOMRect, horizon: number, start: number): Rise {
    const cut = Math.max(rest.bottom, horizon);

    return {
      element,
      rest,
      cut,
      depth: cut - rest.top,
      overshoot: OVERSHOOT * rest.height,
      start,
      rise: RISE,
      settle: SETTLE,
    };
  }

  /** Strike each line's letters that are due. A line not yet started shows nothing. */
  private typeLines(elapsed: number): void {
    for (const line of this.lines) {
      if (!line.typing && elapsed >= line.start) {
        const box = line.element.getBoundingClientRect();

        line.typing = layOutTyping(readGlyphs(line.element), box.width, box.height);
      }

      const shown = line.typing ? struckBy(line.typing, elapsed - line.start) : 0;

      if (shown === line.shown) continue;

      line.shown = shown;
      line.element.style.clipPath = line.typing ? typedClip(line.typing, shown) : UNTYPED;
    }
  }

  /** Lay the runoff canvas over both arts, from the top of their overshoot down to the water. */
  private prepareSpill(canvas: HTMLCanvasElement, water: DOMRect, scale: number): Runoff | null {
    const pad = 8;
    const left = Math.min(...this.rises.map((rise) => rise.rest.left)) - pad;
    const right = Math.max(...this.rises.map((rise) => rise.rest.right)) + pad;
    const top = Math.min(...this.rises.map((rise) => rise.rest.top - rise.overshoot)) - pad;
    const bottom = Math.max(...this.rises.map((rise) => rise.cut)) + pad;

    canvas.style.left = `${left - water.left}px`;
    canvas.style.top = `${top - water.top}px`;
    canvas.style.width = `${right - left}px`;
    canvas.style.height = `${bottom - top}px`;

    const arts = [];

    for (const rise of this.rises) {
      const image = rise.element instanceof HTMLImageElement ? rise.element : rise.element.querySelector('img');

      if (!image) return null;

      arts.push({
        image,
        left: rise.rest.left - left,
        top: rise.rest.top - top,
        width: rise.rest.width,
        height: rise.rest.height,
        cut: rise.cut - top,
        solid: rise.element === image,
      });
    }

    return prepareRunoff(canvas, arts, scale);
  }

  private paintRise(river: River, runoff: Runoff, elapsed: number, duration: number, finish: number): void {
    const root = document.documentElement;
    const surfacing = root.dataset.voyageStage !== 'rising';
    const shifts = this.rises.map((rise) => sunkBy(rise, elapsed));

    for (const [index, rise] of this.rises.entries()) placeRise(rise, shifts[index] ?? 0);

    this.typeLines(elapsed);

    // Showing the art and the text in the frame that sinks the one and hides the other keeps both from flashing at rest.
    if (surfacing) {
      root.dataset.voyageStage = 'rising';
      this.startSwells(river, finish);
    }

    const canvas = runoff.context.canvas.getBoundingClientRect();
    const water = this.getBoundingClientRect();

    for (const splash of paintRunoff(runoff, elapsed, shifts, finish - 120)) {
      const life = Math.min(650 + 40 * splash.size, finish - elapsed);

      if (life < 160) continue;

      river.rings.push({
        x: splash.x + canvas.left - water.left,
        y: splash.y + canvas.top - water.top + river.horizon,
        born: elapsed,
        life,
        reach: (4 + 2.2 * splash.size) * river.stroke,
        base: 0,
      });
    }

    const calm = Math.min(1, (elapsed - duration) / (finish - duration));

    paintRiver(river, { elapsed, boat: null, ruinsDepth: shifts[0] ?? 0, stir: 1.8 * (1 - calm) ** 2 });
  }

  /** Waves run out from the foot of each art as it breaks the surface. */
  private startSwells(river: River, finish: number): void {
    const water = this.getBoundingClientRect();

    for (const rise of this.rises) {
      for (const delay of [150, 700, 1250]) {
        const born = rise.start + delay;

        river.rings.push({
          x: rise.rest.left + rise.rest.width / 2 - water.left,
          y: rise.cut - water.top + river.horizon,
          born,
          life: Math.min(1700, finish - born),
          reach: 0.24 * rise.rest.width,
          base: 0.46 * rise.rest.width,
        });
      }
    }
  }
}

if (!customElements.get('uruk-voyage')) {
  customElements.define('uruk-voyage', UrukVoyageElement);
}
