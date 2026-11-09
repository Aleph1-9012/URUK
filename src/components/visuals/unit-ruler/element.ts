import { createPlayer, type Player } from '../../plate/player';
import { wake } from '../../plate/track';
import { describeEnds, swatchFill } from './readout';
import { rulerParts, type LineKind } from './ruler-parts';
import { START_RULER, UNIT, VIEW, cellAt, fits, patternOf, rulerEnd, type Point, type Ruler } from './tiling';
import { RETURN_TIME, WANDER_PERIOD, between, rulerAt } from './wander';

type Grip = 'move' | 'start' | 'end';

type Drag = { pointer: number; grip: Grip; from: Point; ruler: Ruler };

type Return = { from: Ruler; at: number };

const STEP = 6;
const TURN = (6 * Math.PI) / 180;

function isGrip(value: string | undefined): value is Grip {
  return value === 'move' || value === 'start' || value === 'end';
}

class UrukUnitRuler extends HTMLElement {
  private ruler: Ruler = START_RULER;
  private drag: Drag | undefined;
  private plane: SVGSVGElement | null = null;
  private group: SVGGElement | null = null;
  private status: HTMLElement | null = null;
  private observer: ResizeObserver | undefined;
  private player: Player | undefined;
  // Set while the reader holds the ruler; the next frame of the film then starts a glide back to the path.
  private takenOver = false;
  private returning: Return | undefined;

  private readonly onPointerDown = (event: PointerEvent) => {
    const target = event.target instanceof SVGElement ? event.target.closest<SVGElement>('[data-grip]') : null;
    const grip = target?.dataset['grip'];
    const from = this.toPlane(event);

    if (event.button !== 0 || this.drag || !isGrip(grip) || !from || !this.plane) {
      return;
    }

    event.preventDefault();
    this.takeOver();
    this.plane.setPointerCapture(event.pointerId);
    this.group?.focus({ preventScroll: true });
    this.drag = { pointer: event.pointerId, grip, from, ruler: this.ruler };
    this.toggleAttribute('data-dragging', true);
  };

  private readonly onPointerMove = (event: PointerEvent) => {
    const point = this.toPlane(event);

    if (!this.drag || event.pointerId !== this.drag.pointer || !point) {
      return;
    }

    const { grip, from, ruler } = this.drag;

    if (grip === 'move') {
      const dx = point.x - from.x;
      const dy = point.y - from.y;
      // Against an edge the ruler slides along it instead of stopping dead.
      this.place(
        { start: { x: ruler.start.x + dx, y: ruler.start.y + dy }, angle: ruler.angle },
        { start: { x: ruler.start.x + dx, y: ruler.start.y }, angle: ruler.angle },
        { start: { x: ruler.start.x, y: ruler.start.y + dy }, angle: ruler.angle },
      );
    } else if (grip === 'end') {
      this.place({ start: ruler.start, angle: Math.atan2(point.y - ruler.start.y, point.x - ruler.start.x) });
    } else {
      // Dragging the first end turns the ruler about the other one.
      const pivot = rulerEnd(ruler);
      const angle = Math.atan2(pivot.y - point.y, pivot.x - point.x);
      this.place({ start: { x: pivot.x - UNIT * Math.cos(angle), y: pivot.y - UNIT * Math.sin(angle) }, angle });
    }

    this.announce();
  };

  private readonly onPointerEnd = (event: PointerEvent) => {
    if (this.drag?.pointer === event.pointerId) {
      this.drag = undefined;
      this.removeAttribute('data-dragging');
    }
  };

  private readonly onKeyDown = (event: KeyboardEvent) => {
    const moves: Record<string, Point> = {
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
    };
    const move = moves[event.key];

    if (!move) {
      return;
    }

    event.preventDefault();
    this.takeOver();

    if (event.shiftKey) {
      // Shift turns the ruler about its middle: right and down clockwise, left and up the other way.
      const turn = move.x + move.y > 0 ? TURN : -TURN;
      const end = rulerEnd(this.ruler);
      const middle = { x: (this.ruler.start.x + end.x) / 2, y: (this.ruler.start.y + end.y) / 2 };
      const angle = this.ruler.angle + turn;
      this.place({ start: { x: middle.x - (UNIT / 2) * Math.cos(angle), y: middle.y - (UNIT / 2) * Math.sin(angle) }, angle });
    } else {
      this.place({ start: { x: this.ruler.start.x + move.x * STEP, y: this.ruler.start.y + move.y * STEP }, angle: this.ruler.angle });
    }

    this.announce();
  };

  private readonly onClick = (event: MouseEvent) => {
    if (event.target instanceof Element && event.target.closest('[data-reset]')) {
      this.takenOver = false;
      this.returning = undefined;
      this.player?.seek(0);
      this.announce();
    }
  };

  connectedCallback(): void {
    this.plane = this.querySelector<SVGSVGElement>('[data-ruler-plane]');
    this.group = this.querySelector<SVGGElement>('[data-ruler]');
    this.status = this.querySelector<HTMLElement>('[data-ruler-status]');

    if (!this.plane || !this.group) {
      return;
    }

    this.plane.addEventListener('pointerdown', this.onPointerDown);
    this.plane.addEventListener('pointermove', this.onPointerMove);
    this.plane.addEventListener('pointerup', this.onPointerEnd);
    this.plane.addEventListener('pointercancel', this.onPointerEnd);
    this.group.addEventListener('keydown', this.onKeyDown);
    this.addEventListener('click', this.onClick);
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(this.plane);
    this.player = createPlayer(this, { period: WANDER_PERIOD, start: 0, onFrame: (time) => this.wander(time) });
    wake(this);
  }

  disconnectedCallback(): void {
    this.plane?.removeEventListener('pointerdown', this.onPointerDown);
    this.plane?.removeEventListener('pointermove', this.onPointerMove);
    this.plane?.removeEventListener('pointerup', this.onPointerEnd);
    this.plane?.removeEventListener('pointercancel', this.onPointerEnd);
    this.group?.removeEventListener('keydown', this.onKeyDown);
    this.removeEventListener('click', this.onClick);
    this.observer?.disconnect();
    this.player?.destroy();
  }

  // The reader has taken the ruler: the film stops where they leave it.
  private takeOver(): void {
    this.takenOver = true;
    this.returning = undefined;
    this.player?.pause();
  }

  private wander(time: number): void {
    const path = rulerAt(time);

    if (this.takenOver) {
      this.takenOver = false;
      this.returning = { from: this.ruler, at: time };
    }

    if (!this.returning) {
      this.place(path);

      return;
    }

    const since = (time - this.returning.at + WANDER_PERIOD) % WANDER_PERIOD;

    if (since >= RETURN_TIME) {
      this.returning = undefined;
      this.place(path);

      return;
    }

    this.place(between(this.returning.from, path, since / RETURN_TIME), path);
  }

  private toPlane(event: PointerEvent): Point | undefined {
    const matrix = this.plane?.getScreenCTM();

    if (!matrix) {
      return undefined;
    }

    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());

    return { x: point.x, y: point.y };
  }

  // Takes the first candidate that keeps both ends on the plate; if none does, the ruler stays where it is.
  private place(...candidates: Ruler[]): void {
    const next = candidates.find(fits);

    if (!next || !this.group) {
      return;
    }

    this.ruler = next;
    const degrees = (next.angle * 180) / Math.PI;
    this.group.setAttribute('transform', `translate(${next.start.x.toFixed(2)} ${next.start.y.toFixed(2)}) rotate(${degrees.toFixed(2)})`);
    this.querySelector('[data-swatch="start"]')?.setAttribute('fill', swatchFill(patternOf(cellAt(next.start))));
    this.querySelector('[data-swatch="end"]')?.setAttribute('fill', swatchFill(patternOf(cellAt(rulerEnd(next)))));
  }

  // Only the reader's own moves are spoken, and only when a pattern changes, never the film's.
  private announce(): void {
    const text = describeEnds(patternOf(cellAt(this.ruler.start)), patternOf(cellAt(rulerEnd(this.ruler))));

    if (this.status && this.status.textContent !== text) {
      this.status.textContent = text;
    }
  }

  private resize(): void {
    const width = this.plane?.getBoundingClientRect().width ?? 0;

    if (width === 0 || !this.group) {
      return;
    }

    const parts = rulerParts(width / VIEW.width);
    const lines: Record<LineKind, string | undefined> = { desktop: this.dataset['lineDesktop'], phone: this.dataset['linePhone'] };
    const line = this.group.querySelector('[data-ruler-line]');
    const href = lines[parts.kind];

    if (line && href) {
      line.setAttribute('href', href);
      setNumbers(line, { x: parts.line.x, y: parts.line.y, width: parts.line.width, height: parts.line.height });
    }

    for (const halo of this.group.querySelectorAll('[data-ruler-halo]')) {
      setNumbers(halo, { r: parts.halo });
    }

    for (const end of this.group.querySelectorAll('[data-ruler-end]')) {
      const x = Number(end.getAttribute('data-ruler-end'));
      setNumbers(end, { x: x - parts.disc / 2, y: -parts.disc / 2, width: parts.disc, height: parts.disc });
    }

    for (const grip of this.group.querySelectorAll('[data-grip="start"], [data-grip="end"]')) {
      setNumbers(grip, { r: parts.endGrip });
    }

    const lineGrip = this.group.querySelector('[data-grip="move"]');
    const focus = this.group.querySelector('[data-ruler-focus]');

    if (lineGrip) {
      setNumbers(lineGrip, { 'stroke-width': parts.lineGrip });
    }

    if (focus) {
      setNumbers(focus, { x: parts.focus.x, y: parts.focus.y, width: parts.focus.width, height: parts.focus.height, rx: parts.focus.height / 2, 'stroke-width': parts.focus.stroke });
    }
  }
}

function setNumbers(element: Element, attributes: Record<string, number>): void {
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, value.toFixed(3));
  }
}

if (!customElements.get('uruk-unit-ruler')) {
  customElements.define('uruk-unit-ruler', UrukUnitRuler);
}
