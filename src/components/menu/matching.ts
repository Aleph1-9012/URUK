import { readStatusKind } from '../../content/review-status';

export function searchText(family: string | undefined, topic: string | undefined, title: string | undefined, paperTitle: string | undefined): string {
  return [family, topic, title, paperTitle].join(' ').toLocaleLowerCase('en');
}

export function queryWords(query: string): string[] {
  return query.toLocaleLowerCase('en').trim().split(/\s+/u).filter(Boolean);
}

export function matches(item: { text: string; status: string }, words: readonly string[], status: string): boolean {
  return (status === '' || status === item.status) && words.every(word => item.text.includes(word));
}

export function readSearch(search: string) {
  const parameters = new URLSearchParams(search);
  const status = parameters.get('status') ?? '';

  return {
    query: parameters.get('q') ?? '',
    status: readStatusKind(status),
  };
}

export function highlight(text: string, words: readonly string[]): DocumentFragment {
  const fragment = document.createDocumentFragment();
  const lower = text.toLocaleLowerCase('en');
  let position = 0;

  while (position < text.length) {
    let start = text.length;
    let length = 0;

    for (const word of words) {
      const found = lower.indexOf(word, position);

      if (found >= 0 && (found < start || (found === start && word.length > length))) {
        start = found;
        length = word.length;
      }
    }

    fragment.append(document.createTextNode(text.slice(position, start)));

    if (length === 0) {
      break;
    }

    const mark = document.createElement('mark');
    mark.textContent = text.slice(start, start + length);
    fragment.append(mark);
    position = start + length;
  }

  return fragment;
}
