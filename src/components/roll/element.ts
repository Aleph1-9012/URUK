import { closedCardWidth, initialCardIndex, sheetRows, wholeSealTile } from './model';
import { drawRoller } from './roller';

const PHONE = '(max-width: 47.999rem)';
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

// How far the roller turns while the sheet opens, in seal rollings. About one full turn keeps its lines readable.
const OPENING_TURNS = 1;

// The closing roller needs room below the sheet; it may use the 16px above the credit line.
const CLOSING_ROLLER = 44;

export class UrukRoll extends HTMLElement {
  private observer: ResizeObserver | undefined;
  private events: AbortController | undefined;
  private lastCardWidth = 0;
  private sealTile = 0;
  private dragStart: { x: number; scroll: number } | undefined;
  private dragged = false;
  private seal: HTMLImageElement | undefined;
  private sealOffset = 0;
  private drawnOffset: number | undefined;
  private turnFrame: number | undefined;

  get cards(): HTMLAnchorElement[] {
    return Array.from(this.querySelectorAll<HTMLAnchorElement>('.roll-card'));
  }

  private get viewport(): HTMLElement | null {
    return this.querySelector<HTMLElement>('.roll-window');
  }

  private get items(): HTMLElement[] {
    return Array.from(this.querySelectorAll<HTMLElement>('[data-snap-item]')).filter((item) => !item.hidden && item.getBoundingClientRect().width > 0);
  }

  private get phone(): boolean {
    return matchMedia(PHONE).matches;
  }

  connectedCallback(): void {
    this.events = new AbortController();
    const { signal } = this.events;
    const viewport = this.viewport;

    if (!viewport) {
      return;
    }

    this.querySelector<HTMLElement>('[data-roll-arrows]')?.removeAttribute('hidden');
    this.loadSeal(signal);
    this.observer = new ResizeObserver(() => this.measure());
    this.observer.observe(this);
    window.addEventListener('resize', () => this.measure(), { signal });
    viewport.addEventListener('scroll', () => this.followScroll(), { signal });

    for (const button of this.querySelectorAll<HTMLButtonElement>('[data-direction]')) {
      button.addEventListener('click', () => {
        const first = this.items[0];

        if (first) {
          viewport.scrollBy({ left: first.getBoundingClientRect().width * Number(button.dataset.direction), behavior: this.behavior() });
        }
      }, { signal });
    }

    viewport.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'mouse' || event.button !== 0 || this.phone) {
        return;
      }

      this.dragged = false;
      this.dragStart = { x: event.clientX, scroll: viewport.scrollLeft };
    }, { signal });
    viewport.addEventListener('dragstart', (event) => event.preventDefault(), { signal });
    window.addEventListener('pointermove', (event) => {
      if (!this.dragStart) {
        return;
      }

      const delta = event.clientX - this.dragStart.x;

      if (Math.abs(delta) > 5) {
        this.dragged = true;
        viewport.style.scrollSnapType = 'none';
        viewport.style.userSelect = 'none';
        viewport.scrollLeft = this.dragStart.scroll - delta;
        event.preventDefault();
      }
    }, { signal });
    const endDrag = () => {
      this.dragStart = undefined;

      if (this.dragged) {
        const width = this.items[0]?.getBoundingClientRect().width ?? 1;
        const target = Math.round(viewport.scrollLeft / width) * width;
        viewport.style.removeProperty('scroll-snap-type');
        viewport.style.removeProperty('user-select');
        viewport.scrollTo({ left: target, behavior: this.behavior() });
      }
    };

    window.addEventListener('pointerup', endDrag, { signal });
    window.addEventListener('pointercancel', endDrag, { signal });
    viewport.addEventListener('click', (event) => {
      if (this.dragged) {
        event.preventDefault();
        this.dragged = false;
      }
    }, { signal, capture: true });
    void document.fonts.ready.then(() => this.measure());
    this.measure();
  }

  disconnectedCallback(): void {
    this.events?.abort();
    this.observer?.disconnect();

    if (this.turnFrame !== undefined) {
      cancelAnimationFrame(this.turnFrame);
      this.turnFrame = undefined;
    }
  }

  refresh(): void {
    this.viewport?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    this.measure();
  }

  reveal(family: string): void {
    const card = this.cards.find((item) => item.dataset.family === family);

    if (card && !card.hidden) {
      card.scrollIntoView({ block: 'nearest', inline: 'start', behavior: this.behavior() });
      card.focus({ preventScroll: true });
    }
  }

  private behavior(): ScrollBehavior {
    return matchMedia(REDUCED_MOTION).matches ? 'instant' : 'smooth';
  }

  // Without this image, or with reduced motion, the roller stays as the still drawing.
  private loadSeal(signal: AbortSignal): void {
    const source = this.dataset.seal;

    if (!source || matchMedia(REDUCED_MOTION).matches) {
      return;
    }

    const seal = new Image();
    seal.addEventListener('load', () => {
      this.seal = seal;
      this.drawnOffset = undefined;
      this.scheduleTurn();
    }, { signal });
    seal.src = source;
  }

  private scheduleTurn(): void {
    if (this.seal && this.turnFrame === undefined) {
      this.turnFrame = requestAnimationFrame(() => this.turn());
    }
  }

  // Runs until the sheet has opened and one still frame has followed the last movement.
  private turn(): void {
    this.turnFrame = undefined;
    const paper = this.querySelector<HTMLElement>('.roll-paper');

    if (!this.seal || !paper) {
      return;
    }

    const { m41, m42 } = new DOMMatrixReadOnly(getComputedStyle(paper).transform);
    const unopened = this.phone ? -m42 / paper.offsetHeight : -m41 / paper.offsetWidth;
    const offset = this.sealOffset + unopened * this.sealTile * OPENING_TURNS;
    const moved = this.drawnOffset === undefined ? 0 : offset - this.drawnOffset;
    this.drawnOffset = offset;

    for (const canvas of this.querySelectorAll<HTMLCanvasElement>('.roll-roller canvas')) {
      drawRoller(canvas, {
        seal: this.seal,
        offset,
        moved,
        tile: this.sealTile,
        direction: canvas.closest('.roll-roller--end') ? -1 : 1,
      });
    }

    if (moved !== 0 || paper.getAnimations().length > 0) {
      this.scheduleTurn();
    }
  }

  private measure(): void {
    const viewport = this.viewport;
    const paper = this.querySelector<HTMLElement>('.roll-paper');

    if (!viewport || !paper) {
      return;
    }

    this.closeSheet();
    this.fitRows(viewport);
    const length = this.phone ? paper.clientHeight : paper.clientWidth;
    this.sealTile = wholeSealTile(length);
    this.style.setProperty('--seal-tile', `${this.sealTile}px`);
    this.style.setProperty('--sheet-height', `${length}px`);
    this.centreCurrent(viewport);
    this.followScroll();
  }

  // Filtered cards that fit stop at a second roller; otherwise the roll runs to the window edge.
  private closeSheet(): void {
    const stage = this.querySelector<HTMLElement>('.roll-stage');
    const frame = this.querySelector<HTMLElement>('.roll-frame');

    if (!stage || !frame) {
      return;
    }

    const count = this.items.length;
    const { paddingLeft, paddingRight } = getComputedStyle(stage);
    const available = stage.clientWidth - parseFloat(paddingLeft) - parseFloat(paddingRight) - parseFloat(getComputedStyle(frame).marginLeft);
    const width = this.phone ? undefined : closedCardWidth(count, available);

    if (width !== undefined) {
      this.style.setProperty('--card-width', `${width}px`);
      this.style.setProperty('--count', String(Math.max(1, count)));
    }

    this.toggleAttribute('data-closed', this.hasAttribute('data-filtered') && (this.phone || width !== undefined));
  }

  // The phone sheet stays still and always ends on a whole row.
  private fitRows(viewport: HTMLElement): void {
    const items = this.items;
    const first = items[0];
    const top = viewport.scrollTop;

    viewport.style.removeProperty('--window-height');
    viewport.style.removeProperty('--row-height');

    if (!this.phone || this.dataset.current || !first) {
      return;
    }

    const closed = this.hasAttribute('data-closed');
    const footnote = document.querySelector('[data-roll-footnote]')?.getBoundingClientRect().height ?? 0;
    const sheet = this.querySelector<HTMLElement>('.roll-sheet')?.getBoundingClientRect();
    const paper = this.querySelector<HTMLElement>('.roll-paper')?.getBoundingClientRect();
    const frame = viewport.getBoundingClientRect();

    if (!sheet || !paper) {
      return;
    }

    // Measured against the paper, because the paper is still sliding out while the page opens.
    const below = paper.bottom - frame.bottom;
    const start = sheet.top + frame.top - paper.top + window.scrollY;
    const available = window.innerHeight - start - below - footnote - (closed ? CLOSING_ROLLER : 0);
    const { rows, rowHeight } = sheetRows(available, first.getBoundingClientRect().height, items.length, !closed);

    viewport.style.setProperty('--row-height', `${rowHeight}px`);
    viewport.style.setProperty('--window-height', `${rows * rowHeight}px`);
    viewport.scrollTop = top;
  }

  private centreCurrent(viewport: HTMLElement): void {
    if (this.phone) {
      this.lastCardWidth = 0;

      return;
    }

    const items = this.items;
    const width = items[0]?.getBoundingClientRect().width ?? 0;

    if (this.dataset.current && width > 0 && width !== this.lastCardWidth) {
      const current = items.findIndex((card) => card.dataset.family === this.dataset.current);
      const visible = Math.round(viewport.clientWidth / width);

      viewport.scrollTo({ left: initialCardIndex(current, visible, items.length) * width, behavior: 'instant' });
      this.lastCardWidth = width;
    }
  }

  // The frieze moves one seal rolling per card, so it also rests whole at both edges.
  private followScroll(): void {
    const viewport = this.viewport;

    if (!viewport) {
      return;
    }

    const item = this.items[0]?.getBoundingClientRect();
    const step = (this.phone ? item?.height : item?.width) ?? 0;
    const distance = this.phone ? viewport.scrollTop : viewport.scrollLeft;
    this.sealOffset = step > 0 ? (distance / step) * this.sealTile : 0;
    this.style.setProperty('--seal-offset', `${this.sealOffset}px`);
    this.scheduleTurn();

    for (const button of this.querySelectorAll<HTMLButtonElement>('[data-direction]')) {
      button.disabled = button.dataset.direction === '-1'
        ? viewport.scrollLeft <= 1
        : viewport.scrollLeft >= viewport.scrollWidth - viewport.clientWidth - 1;
    }
  }
}

if (!customElements.get('uruk-roll')) {
  customElements.define('uruk-roll', UrukRoll);
}
