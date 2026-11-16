import { closedCardWidth, initialCardIndex, sheetRows, wholeSealTile } from './model';
import { drawRoller } from './roller';

const PHONE = '(max-width: 47.999rem)';
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

// How far the roller turns while the sheet opens, in seal rollings. About one full turn keeps its lines readable.
const OPENING_TURNS = 1;

// The closing roller needs room below the sheet; it may use the 16px above the credit line.
const CLOSING_ROLLER = 44;

type ResultFilter = {
  active: boolean;
  description: string;
  emptyMessage: string;
};

class UrukRoll extends HTMLElement {
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
  private unwritten: string | undefined;
  private arrivalFrame: number | undefined;
  private fontsReady = false;
  private resultsReady = false;
  private phoneArrivalStarted = false;

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

    if (this.hasAttribute('data-arrival') && !this.phone && !this.phoneArrivalStarted) {
      this.dataset.arrival = 'desktop';
    }

    this.loadSeal(signal);
    this.observer = new ResizeObserver(() => this.measure());
    this.observer.observe(this);
    window.addEventListener('resize', () => {
      this.measure();
      this.prepareArrival();
    }, { signal });
    viewport.addEventListener('scroll', () => this.followScroll(), { signal });
    viewport.addEventListener('focusin', () => this.finishArrival(), { signal });
    viewport.addEventListener('wheel', () => this.finishArrival(), { passive: true, signal });
    viewport.addEventListener('keydown', () => this.finishArrival(), { signal });
    this.addEventListener('animationend', (event) => {
      if (event.animationName === 'roll-unroll-down') this.finishArrival();
    }, { signal });
    matchMedia(REDUCED_MOTION).addEventListener('change', () => this.finishArrival(), { signal });

    for (const button of this.querySelectorAll<HTMLButtonElement>('[data-direction]')) {
      button.addEventListener('click', () => {
        const first = this.items[0];

        if (first) {
          viewport.scrollBy({ left: first.getBoundingClientRect().width * Number(button.dataset.direction), behavior: this.behavior() });
        }
      }, { signal });
    }

    viewport.addEventListener('pointerdown', (event) => {
      this.finishArrival();

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
    void document.fonts.ready.then(() => {
      if (signal.aborted) return;

      this.fontsReady = true;
      this.measure();
      this.prepareArrival();
    });
    this.measure();
  }

  disconnectedCallback(): void {
    this.events?.abort();
    this.observer?.disconnect();
    if (this.dataset.arrival === 'opening') this.finishArrival();

    if (this.arrivalFrame !== undefined) {
      cancelAnimationFrame(this.arrivalFrame);
      this.arrivalFrame = undefined;
    }

    if (this.turnFrame !== undefined) {
      cancelAnimationFrame(this.turnFrame);
      this.turnFrame = undefined;
    }
  }

  get scrolledBeyondPage(): boolean {
    const viewport = this.viewport;

    return viewport !== null && viewport.scrollTop > viewport.clientHeight;
  }

  scrollToStart(): void {
    if (this.resultsReady) this.finishArrival();
    this.viewport?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }

  filterResults(families: ReadonlySet<string>, filter: ResultFilter): void {
    if (this.resultsReady) this.finishArrival();

    for (const card of this.cards) {
      card.hidden = !families.has(card.dataset.family ?? '');
    }

    const count = families.size;
    const slot = this.querySelector<HTMLElement>('[data-roll-slot]');
    const note = this.querySelector<HTMLElement>('[data-roll-slot-note]');
    const help = this.querySelector<HTMLElement>('[data-roll-help]');
    this.unwritten ??= note?.textContent ?? '';

    if (slot && note) {
      slot.hidden = filter.active && count > 0;
      note.textContent = count > 0 ? this.unwritten : filter.emptyMessage;
    }

    if (help) {
      help.hidden = count === 0;
      help.textContent = filter.active
        ? 'Choose a result to read its page.'
        : 'Drag the roll or scroll sideways. Results run in number order.';
    }

    this.toggleAttribute('data-filtered', filter.active);
    this.toggleAttribute('data-empty', count === 0);
    this.querySelector('[data-roll-heading]')?.replaceChildren(filter.description);
    this.scrollToStart();
    this.measure();
    this.resultsReady = true;
    this.prepareArrival();
  }

  private behavior(): ScrollBehavior {
    return matchMedia(REDUCED_MOTION).matches ? 'instant' : 'smooth';
  }

  private finishArrival(): void {
    if (this.dataset.arrival === 'pending' || this.dataset.arrival === 'opening') {
      this.phoneArrivalStarted = true;
      this.dataset.arrival = 'open';

      if (this.arrivalFrame !== undefined) {
        cancelAnimationFrame(this.arrivalFrame);
        this.arrivalFrame = undefined;
      }

      this.scheduleTurn();
    }
  }

  private prepareArrival(): void {
    const signal = this.events?.signal;

    if (!signal || signal.aborted || !this.hasAttribute('data-arrival')) return;

    if (!this.phone) {
      if (this.dataset.arrival === 'opening') this.finishArrival();
      if (!this.phoneArrivalStarted) this.dataset.arrival = 'desktop';

      return;
    }

    if (this.phoneArrivalStarted) return;

    this.dataset.arrival = 'pending';

    if (matchMedia(REDUCED_MOTION).matches) {
      this.finishArrival();

      return;
    }

    if (!this.fontsReady || !this.resultsReady || this.arrivalFrame !== undefined) return;

    this.arrivalFrame = requestAnimationFrame(() => {
      this.arrivalFrame = undefined;
      if (signal.aborted || this.phoneArrivalStarted) return;

      if (!this.phone) {
        this.prepareArrival();

        return;
      }

      this.measure();
      this.phoneArrivalStarted = true;
      this.dataset.arrival = 'opening';
      this.scheduleTurn();
    });
  }

  private unopenedAmount(paper: HTMLElement): number {
    const { m41, m42 } = new DOMMatrixReadOnly(getComputedStyle(paper).transform);

    return this.phone ? -m42 / paper.offsetHeight : -m41 / paper.offsetWidth;
  }

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

  private turn(): void {
    this.turnFrame = undefined;
    const paper = this.querySelector<HTMLElement>('.roll-paper');

    if (!this.seal || !paper) {
      return;
    }

    const unopened = this.unopenedAmount(paper);
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
    const viewportHeight = this.querySelector<HTMLElement>('.roll-viewport-height')?.getBoundingClientRect().height;

    if (!sheet || !paper || !viewportHeight) {
      return;
    }

    // Measured against the paper, because the paper is still sliding out while the page opens.
    const below = paper.bottom - frame.bottom;
    const start = sheet.top + frame.top - paper.top + window.scrollY;
    const available = viewportHeight - start - below - footnote - (closed ? CLOSING_ROLLER : 0);
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

declare global {
  interface HTMLElementTagNameMap {
    'uruk-roll': UrukRoll;
  }
}
