import { countLayout, pressTimes } from './layout';
import { caseRules, signLayer } from './paint';

declare global {
  interface DocumentEventMap {
    'uruk:count-destination': CustomEvent<number>;
  }
}

const cover = document.querySelector<HTMLElement>('.count-transition');
const tablet = cover?.querySelector<HTMLElement>('.count-transition__case');

function pressCount(into: HTMLElement, tabletElement: HTMLElement, family: number): void {
  const layout = countLayout(family);
  const times = pressTimes(layout);
  const rules = caseRules(layout);

  into.style.setProperty('--count-width', String(layout.width));
  into.style.setProperty('--count-height', String(layout.height));
  into.style.setProperty('--count-across', rules.across);
  into.style.setProperty('--count-down', rules.down);
  tabletElement.replaceChildren(...layout.signs.map((sign, index) => {
    const element = document.createElement('span');

    element.className = 'count-transition__sign';
    element.style.setProperty('--count-sign', signLayer(sign, layout));
    element.style.setProperty('--count-at', `${times.wide[index]}ms`);
    element.style.setProperty('--count-at-phone', `${times.phone[index]}ms`);

    return element;
  }));
}

// The head script asks for the destination's count before it closes the cover; an unanswered request keeps native navigation.
if (cover && tablet) {
  document.addEventListener('uruk:count-destination', (event) => {
    pressCount(cover, tablet, event.detail);
    event.preventDefault();
  });
}
