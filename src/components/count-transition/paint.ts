import type { CountLayout, PlacedSign } from './layout';

/** How far each rule of the case runs past the other two, in case units, as on the site's crossed case. */
export const RULE_OVERSHOOT = 9;

function units(value: number): string {
  return `calc(${Number(value.toFixed(2))} * var(--count-unit))`;
}

function shift(base: string, value: number, extra = ''): string {
  return `calc(${base} + ${Number(value.toFixed(2))} * var(--count-unit)${extra})`;
}

/*
 * Layers for a viewport-sized box. Lengths place a layer's left edge from 50vw, so a scrollbar appearing on the next
 * document does not move the case; percentages place a layer's centre on the box's middle line. The closing paints
 * with these same layers, so the source's last frame and the destination's first snap to the same pixels.
 */

/** One pressed sign. */
export function signLayer(sign: PlacedSign, { width, height }: CountLayout): string {
  return `var(--count-sign-${sign.unit}) ${shift('50vw', sign.x - width / 2)} `
    + `${shift('50%', sign.y + sign.height / 2 - height / 2)} / ${units(sign.width)} ${units(sign.height)} no-repeat`;
}

/** The case's two rules across, then its two rules down, each pair running past the other. */
export function caseRules({ width, height }: CountLayout): { across: string; down: string } {
  const ink = 'linear-gradient(var(--ink, #1c1a17), var(--ink, #1c1a17))';
  const across = units(width + 2 * RULE_OVERSHOOT);
  const down = units(height + 2 * RULE_OVERSHOOT);
  const left = shift('50vw', -width / 2 - RULE_OVERSHOOT);

  return {
    across: [
      `${ink} ${left} ${shift('50%', -height / 2, ' + 0.5px')} / ${across} 1px no-repeat`,
      `${ink} ${left} ${shift('50%', height / 2, ' - 0.5px')} / ${across} 1px no-repeat`,
    ].join(', '),
    down: [
      `${ink} ${shift('50vw', -width / 2)} 50% / 1px ${down} no-repeat`,
      `${ink} ${shift('50vw', width / 2, ' - 1px')} 50% / 1px ${down} no-repeat`,
    ].join(', '),
  };
}

/** The finished case: every pressed sign, then the rules. */
export function arrivalLayers(layout: CountLayout): string {
  const rules = caseRules(layout);

  return [...layout.signs.map((sign) => signLayer(sign, layout)), rules.across, rules.down].join(', ');
}
