import { highlight, matches, readSearch } from './matching';
import { readStatusKind, statusLabel } from '../../content/review-status';

class UrukMenu extends HTMLElement {
  private events: AbortController | undefined;

  // The roll's script is loaded on its own, so the Menu does not pull in a second file before it can run.
  connectedCallback(): void {
    void customElements.whenDefined('uruk-roll').then(() => this.start());
  }

  disconnectedCallback(): void {
    this.events?.abort();
    this.events = undefined;
  }

  private start(): void {
    const input = this.querySelector<HTMLInputElement>('[data-search]');
    const roll = this.querySelector('uruk-roll');

    if (this.events || !this.isConnected || !input || !roll) {
      return;
    }

    this.events = new AbortController();
    const { signal } = this.events;
    const buttons = this.querySelectorAll<HTMLButtonElement>('[data-filter]');
    const cards = roll.cards.map((node) => ({
      node,
      indexRow: this.querySelector<HTMLElement>(`[data-index-family="${node.dataset.family}"]`),
      family: node.dataset.family ?? '',
      topic: node.dataset.topic ?? '',
      title: node.dataset.title ?? '',
      paperTitle: node.dataset.paperTitle ?? '',
      status: node.dataset.status ?? '',
    }));
    const highlights = Array.from(this.querySelectorAll<HTMLElement>('[data-highlight]'), (node) => ({ node, text: node.textContent ?? '' }));
    let state = readSearch(location.search);

    const render = () => {
      input.value = state.query;
      const query = state.query.trim();
      const status = statusLabel(state.status);
      const active = query !== '' || status !== '';
      const families = new Set<string>();

      for (const item of cards) {
        const visible = matches(item, state.query, state.status);

        if (item.indexRow) {
          item.indexRow.hidden = !visible;
        }

        if (visible) {
          families.add(item.family);
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

      const count = families.size;
      const found = `${count} ${count === 1 ? 'result' : 'results'}`;
      const scope = `${status}${query ? ` for “${query}”` : ''}`.trim();
      const description = count === 0 ? `No matching results ${scope}` : active ? `${found} ${scope}` : `All ${found}`;

      for (const label of this.querySelectorAll<HTMLElement>('[data-result-count]')) {
        label.textContent = description;
      }

      this.querySelector('[data-no-results]')?.toggleAttribute('hidden', count !== 0);
      this.querySelector('[data-result-index]')?.toggleAttribute('hidden', count === 0);
      this.querySelector('[data-clear]')?.toggleAttribute('hidden', state.query === '');

      roll.filterResults(families, {
        active,
        description,
        emptyMessage: query ? `No papers on the roll match “${query}”.` : `Nothing on the roll is ${status}.`,
      });
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
        state.status = readStatusKind(button.dataset.filter ?? '');
        update();
      }, { signal });
    }

    window.addEventListener('popstate', () => {
      state = readSearch(location.search);
      render();
    }, { signal });
    render();
  }
}

if (!customElements.get('uruk-menu')) {
  customElements.define('uruk-menu', UrukMenu);
}
