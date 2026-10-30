import { expect, test } from 'bun:test';
import temml from 'temml';
import { alignedFormula, splitFormula } from '../src/lib/formulas/break';

test('formula rows preserve TeX and break only before top-level equality or less-than-or-equal', () => {
  const tex = String.raw`f(x=1) = \frac{a=b}{c} \leq 7`;
  const parts = splitFormula(tex);
  expect(parts).toEqual([String.raw`f(x=1) `, String.raw`= \frac{a=b}{c} `, String.raw`\leq 7`]);
  expect(parts.join('')).toBe(tex);
  expect(splitFormula(String.raw`\begin{matrix}a=b\end{matrix} = c`)).toEqual([String.raw`\begin{matrix}a=b\end{matrix} `, '= c']);
  expect(splitFormula(String.raw`a < b > c \geq d \neq e`)).toHaveLength(1);
  expect(splitFormula(String.raw`\left\langle a=b \right\rangle = c`)).toEqual([String.raw`\left\langle a=b \right\rangle `, '= c']);
  expect(splitFormula('a % = comment\n = b')).toEqual(['a % = comment\n ', '= b']);
});

test('the approved specimens render in Temml in single and aligned forms', () => {
  for (const tex of [String.raw`\chi(\mathbb{R}^{2})`, String.raw`6 \leq \chi(\mathbb{R}^{2}) \leq 7`, String.raw`u(n) = C n^{\beta} \leq C n^{4/3}`]) {
    expect(temml.renderToString(tex, { throwOnError: true })).toContain('<math');
    expect(temml.renderToString(alignedFormula(tex), { throwOnError: true, displayMode: true })).toContain('<mtable');
  }
});
