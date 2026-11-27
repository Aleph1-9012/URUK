import { closedCardWidth, initialCardIndex, PHONE_SEAL_PHASE, sheetRows, wholeSealTile } from './model';
import { drawRoller } from './roller';

const PHONE = '(max-width: 47.999rem)';
const SHOWN_ITEMS = '[data-snap-item]:not([hidden])';
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

// How far the roller turns while the sheet opens, in seal rollings. About one full turn keeps its lines readable.
const OPENING_TURNS = 1;

// The closed phone roll reserves 60px below the sheet for its closing roller.
const CLOSING_ROLLER = 60;

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
  private sealStrip: HTMLElement | null = null;
  private sealOffset = 0;
  private drawnOffset: number | undefined;
  private turnFrame: number | undefined;
  private unwritten: string | undefined;
  private arrivalFrame: number | undefined;
  private fontsReady = false;
  private resultsReady = false;
  private phoneArrivalStarted = false;
  private paperEdge: number | undefined;
  private minimumRow: { width: number; height: number } | undefined;
  private phoneRowHeight = 0;

  get cards(): HTMLAnchorElement[] {
    return Array.from(this.querySelectorAll<HTMLAnchorElement>('.roll-card'));
  }

  private get viewport(): HTMLElement | null {
    return this.querySelector<HTMLElement>('.roll-window');
  }

  private firstItemBounds(): DOMRect | undefined {
    const selector = this.phone && this.dataset.current ? '[data-neighbor]:not([hidden])' : SHOWN_ITEMS;
    const bounds = this.querySelector(selector)?.getBoundingClientRect();

    return bounds && bounds.width > 0 ? bounds : undefined;
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

    this.sealStrip = this.querySelector('.roll-seal');
    if (this.hasAttribute('data-arrival') && !this.phoneArrivalStarted) {
      if (document.documentElement.hasAttribute('data-cone-stage')) {
        this.finishArrival();
      } else if (!this.phone) {
        this.dataset.arrival = 'desktop';
      }
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
        const first = this.firstItemBounds();

        if (first) {
          viewport.scrollBy({ left: first.width * Number(button.dataset.direction), behavior: this.behavior() });
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
        const width = this.firstItemBounds()?.width ?? 1;
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
      this.minimumRow = undefined;
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

  get verticalScrollOffset(): number {
    return Math.max(0, this.viewport?.scrollTop ?? 0);
  }

  scrollToStart(behavior: ScrollBehavior = 'instant'): void {
    if (this.resultsReady) this.finishArrival();
    this.viewport?.scrollTo({ top: 0, left: 0, behavior });
  }

  /** Ends a smooth scroll where it is, so the reader's own scroll takes over. */
  stopScroll(): void {
    const viewport = this.viewport;

    viewport?.scrollTo({ top: viewport.scrollTop, left: viewport.scrollLeft, behavior: 'instant' });
  }

  filterResults(families: ReadonlySet<string>, filter: ResultFilter): void {
    for (const card of this.cards) {
      card.hidden = !families.has(card.dataset.family ?? '');
    }

    const count = families.size;
    const slot = this.querySelector<HTMLElement>('[data-roll-slot]');
    const note = this.querySelector<HTMLElement>('[data-roll-slot-note]');
    const help = this.querySelector<HTMLElement>('[data-roll-help]');
    const heading = this.querySelector('[data-roll-heading]');
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
    if (heading) heading.textContent = filter.description;
    this.scrollToStart();
    this.measure();
    this.resultsReady = true;
    this.prepareArrival();
  }

  private behavior(): ScrollBehavior {
    return matchMedia(REDUCED_MOTION).matches ? 'instant' : 'smooth';
  }

  whenArrivalSettles(): Promise<void> {
    const moving = () => this.dataset.arrival === 'pending' || this.dataset.arrival === 'opening';
    if (!moving()) {
      const paper = this.querySelector('.roll-paper');
      const animations = paper?.getAnimations({ subtree: true }) ?? [];
      return Promise.allSettled(animations.map(animation => animation.finished)).then(() => undefined);
    }
    return new Promise(resolve => {
      const observer = new MutationObserver(() => {
        if (!moving()) { observer.disconnect(); resolve(); }
      });
      observer.observe(this, { attributes: true, attributeFilter: ['data-arrival'] });
    });
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
    if (document.documentElement.dataset.coneStage || document.documentElement.hasAttribute('data-cone-loading')) {
      this.finishArrival();
      return;
    }

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

    const density = matchMedia('(resolution > 2dppx)');
    let pending: HTMLImageElement | undefined;
    const load = () => {
      const seal = new Image();
      pending = seal;
      seal.addEventListener('load', () => {
        if (pending !== seal) return;

        this.seal = seal;
        this.drawnOffset = undefined;
        this.scheduleTurn();
      }, { signal, once: true });
      seal.src = density.matches ? this.dataset.sealSharp ?? source : source;
    };

    density.addEventListener('change', load, { signal });
    load();
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

    const phoneMenu = this.phone && !this.dataset.current;
    const opening = phoneMenu ? this.dataset.arrival === 'opening' : paper.getAnimations().length > 0;
    const unopened = opening ? this.unopenedAmount(paper) : 0;
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
        paperEdge: this.paperEdge,
      });
    }

    if (moved !== 0 || opening) {
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
    const roller = this.querySelector('.roll-roller--start');
    // The turned seal is inset 8px from the paper's right edge.
    this.paperEdge = this.phone && !this.dataset.current && this.sealStrip && roller
      ? roller.getBoundingClientRect().right - this.sealStrip.getBoundingClientRect().right + 8
      : undefined;
    const length = this.phone ? paper.clientHeight : paper.clientWidth;
    this.sealTile = wholeSealTile(length);
    this.style.setProperty('--seal-tile', `${this.sealTile}px`);
    this.style.setProperty('--sheet-height', `${length}px`);
    this.centreCurrent(viewport);
    this.followScroll();
  }

  private closeSheet(): void {
    const filtered = this.hasAttribute('data-filtered');

    if (this.phone || !filtered) {
      this.toggleAttribute('data-closed', this.phone && !this.dataset.current);
      return;
    }

    const stage = this.querySelector<HTMLElement>('.roll-stage');
    const frame = this.querySelector<HTMLElement>('.roll-frame');

    if (!stage || !frame) {
      return;
    }

    const count = this.querySelectorAll(SHOWN_ITEMS).length;
    const { paddingLeft, paddingRight } = getComputedStyle(stage);
    const available = stage.clientWidth - parseFloat(paddingLeft) - parseFloat(paddingRight) - parseFloat(getComputedStyle(frame).marginLeft);
    const width = closedCardWidth(count, available);

    if (width !== undefined) {
      this.style.setProperty('--card-width', `${width}px`);
      this.style.setProperty('--count', String(Math.max(1, count)));
    }

    this.toggleAttribute('data-closed', width !== undefined);
  }

  private fitRows(viewport: HTMLElement): void {
    if (!this.phone || this.dataset.current) {
      if (this.phoneRowHeight) {
        this.phoneRowHeight = 0;
        viewport.style.removeProperty('--window-height');
        viewport.style.removeProperty('--row-height');
      }
      return;
    }

    const track = viewport.querySelector<HTMLElement>('.roll-track');
    const sheet = this.querySelector<HTMLElement>('.roll-sheet')?.getBoundingClientRect();
    const paper = this.querySelector<HTMLElement>('.roll-paper')?.getBoundingClientRect();
    const frame = viewport.getBoundingClientRect();
    const viewportHeight = this.querySelector<HTMLElement>('.roll-viewport-height')?.getBoundingClientRect().height;

    if (!track || !sheet || !paper || !viewportHeight) {
      return;
    }

    const width = frame.width;
    const cards = this.cards;
    const first = cards[0];

    if (!first) return;

    const top = viewport.scrollTop;

    if (this.minimumRow?.width !== width) {
      viewport.style.removeProperty('--row-height');
      track.setAttribute('data-measure-rows', '');
      this.minimumRow = { width, height: Math.ceil(first.getBoundingClientRect().height) };
      track.removeAttribute('data-measure-rows');
    }

    // Measured against the paper, because the paper is still sliding out while the page opens.
    const below = paper.bottom - frame.bottom;
    const start = sheet.top + frame.top - paper.top + window.scrollY;
    const available = viewportHeight - start - below - CLOSING_ROLLER;
    const fitted = sheetRows(available, this.minimumRow.height, cards.length + 1);
    // Whole pixels keep the last snap point at the scroll boundary.
    this.phoneRowHeight = Math.floor(fitted.rowHeight);
    const count = track.querySelectorAll(SHOWN_ITEMS).length;

    viewport.style.setProperty('--row-height', `${this.phoneRowHeight}px`);
    viewport.style.setProperty('--window-height', `${Math.min(count, fitted.rows) * this.phoneRowHeight}px`);
    viewport.scrollTop = top;
  }

  private centreCurrent(viewport: HTMLElement): void {
    if (this.phone || !this.dataset.current) {
      this.lastCardWidth = 0;

      return;
    }

    const width = viewport.querySelector(SHOWN_ITEMS)?.getBoundingClientRect().width ?? 0;

    if (width > 0 && width !== this.lastCardWidth) {
      const items = Array.from(viewport.querySelectorAll<HTMLElement>(SHOWN_ITEMS));
      const current = items.findIndex(item => item.getAttribute('aria-current') === 'page');
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

    const phone = this.phone;
    const step = this.phoneRowHeight || this.firstItemBounds()?.[phone ? 'height' : 'width'] || 0;
    const distance = phone ? viewport.scrollTop : viewport.scrollLeft;
    this.sealOffset = step > 0 ? (distance / step) * this.sealTile : 0;
    const phase = this.paperEdge === undefined ? 0 : PHONE_SEAL_PHASE * this.sealTile;
    this.sealStrip?.style.setProperty('--seal-offset', `${this.sealOffset + phase}px`);
    this.scheduleTurn();

    if (phone) return;

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
