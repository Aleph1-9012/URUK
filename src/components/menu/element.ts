import { UrukRoll } from '../roll/element';
import { highlight, matches, readSearch } from './matching';

const ROLL_HELP = 'Drag the roll or scroll sideways. Results run in number order.';
const INDEX_HELP = 'Choose a line to wind the roll to it.';

class UrukMenu extends HTMLElement {
  private events: AbortController | undefined;

  connectedCallback(): void {
    this.events = new AbortController();
    const { signal } = this.events;
    const input = this.querySelector<HTMLInputElement>('[data-search]');
    const roll = this.querySelector('uruk-roll');

    if (!input || !(roll instanceof UrukRoll)) {
      return;
    }

    const buttons = this.querySelectorAll<HTMLButtonElement>('[data-filter]');
    const cards = roll.cards.map((node) => ({
      node,
      family: node.dataset.family ?? '',
      topic: node.dataset.topic ?? '',
      title: node.dataset.title ?? '',
      status: node.dataset.status ?? '',
    }));
    const highlights = Array.from(this.querySelectorAll<HTMLElement>('[data-highlight]'), (node) => ({ node, text: node.textContent ?? '' }));
    const slot = roll.querySelector<HTMLElement>('[data-roll-slot]');
    const slotNote = roll.querySelector<HTMLElement>('[data-roll-slot-note]');
    const unwritten = slotNote?.textContent ?? '';
    let state = readSearch(location.search);

    const render = () => {
      input.value = state.query;
      const query = state.query.trim();
      const status = state.status.replace('-', ' ');
      const active = query !== '' || status !== '';
      let count = 0;

      for (const item of cards) {
        item.node.hidden = !matches(item, state.query, state.status);

        if (!item.node.hidden) {
          count += 1;
        }

        const row = this.querySelector<HTMLElement>(`[data-index-family="${item.family}"]`);

        if (row) {
          row.hidden = item.node.hidden;
        }
      }

      for (const { node, text } of highlights) {
        node.replaceChildren(highlight(text, state.query));
      }

      for (const button of buttons) {
        const filter = button.dataset.filter ?? '';
        button.setAttribute('aria-pressed', String(filter === state.status));
        button.disabled = filter !== '' && filter !== state.status && !cards.some((item) => item.status === filter);
      }

      const found = `${count} ${count === 1 ? 'result' : 'results'}`;
      const scope = query ? `for “${query}”` : status;
      const description = count === 0 ? `No results ${scope}` : active ? `${found} ${scope}` : found;

      for (const label of this.querySelectorAll<HTMLElement>('[data-result-count]')) {
        label.textContent = description;
      }

      if (slot && slotNote) {
        slot.hidden = active && count > 0;
        slotNote.textContent = count > 0 ? unwritten : query ? `Nothing on the roll asks about “${query}”.` : `Nothing on the roll is ${status}.`;
      }

      roll.toggleAttribute('data-filtered', active);
      roll.toggleAttribute('data-empty', count === 0);
      roll.querySelector('[data-roll-heading]')?.replaceChildren(description);
      this.querySelector('[data-result-index]')?.toggleAttribute('hidden', !active || count === 0);
      this.querySelector('[data-no-results]')?.toggleAttribute('hidden', count !== 0);
      this.querySelector('[data-clear]')?.toggleAttribute('hidden', state.query === '');

      const help = roll.querySelector<HTMLElement>('[data-roll-help]');

      if (help) {
        help.hidden = count === 0;
        help.textContent = active ? INDEX_HELP : ROLL_HELP;
      }

      roll.refresh();
    };
    const update = () => {
      const url = new URL(location.href);

      for (const [key, value] of [['q', state.query], ['status', state.status]] as const) {
        if (value) {
          url.searchParams.set(key, value);
        } else {
          url.searchParams.delete(key);
        }
      }

      history.replaceState(null, '', url);
      render();
    };

    for (const node of this.querySelectorAll('[data-menu-enhancement]')) {
      node.removeAttribute('hidden');
    }

    input.addEventListener('input', () => {
      state.query = input.value;
      update();
    }, { signal });
    this.querySelector('[data-clear]')?.addEventListener('click', () => {
      state.query = '';
      update();
      input.focus();
    }, { signal });

    for (const button of buttons) {
      button.addEventListener('click', () => {
        state.status = button.dataset.filter ?? '';
        update();
      }, { signal });
    }

    for (const row of this.querySelectorAll<HTMLElement>('[data-index-family]')) {
      row.querySelector('[data-wind]')?.addEventListener('click', () => roll.reveal(row.dataset.indexFamily ?? ''), { signal });
    }

    window.addEventListener('popstate', () => {
      state = readSearch(location.search);
      render();
    }, { signal });
    render();
  }

  disconnectedCallback(): void {
    this.events?.abort();
  }
}

if (!customElements.get('uruk-menu')) {
  customElements.define('uruk-menu', UrukMenu);
}
