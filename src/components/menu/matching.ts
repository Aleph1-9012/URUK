type SearchItem = { family: string; topic: string; title: string; status: string };

function queryWords(query: string): string[] {
  return query.toLocaleLowerCase('en').trim().split(/\s+/u).filter(Boolean);
}

export function matches(item: SearchItem, query: string, status: string): boolean {
  const text = `${item.family} ${item.topic} ${item.title}`.toLocaleLowerCase('en');

  return (status === '' || status === item.status) && queryWords(query).every((word) => text.includes(word));
}

export function readSearch(search: string) {
  const parameters = new URLSearchParams(search);
  const status = parameters.get('status') ?? '';

  return {
    query: parameters.get('q') ?? '',
    status: ['approved', 'under-review', 'unreviewed', 'disputed'].includes(status) ? status : '',
  };
}

export function highlight(text: string, query: string): DocumentFragment {
  const fragment = document.createDocumentFragment();
  const words = queryWords(query);
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
