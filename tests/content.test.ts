import { expect, test } from 'bun:test';
import { renderResult } from '../src/content/render';

const body = String.raw`An introduction with a citation [1] and an escaped price \$500.

## The problem

The variable $x_1$ stays mathematics. [1]

## Why it stayed open

Earlier work.

## What OpenAI claims

$$
x_1 = \frac{1}{2} \leq 1
$$

## How the claimed proof goes

An explanation.

## Uses outside mathematics

No known direct application.

## Has anyone checked it?

Evidence with a date. [2]

## Sources

1. The paper. https://example.com/paper
2. The review. https://example.com/review
`;

test('result text renders math, citations, escaped dollars and real sources', () => {
  const rendered = renderResult(body, 'https://example.com/review');

  expect(rendered.sources).toHaveLength(2);
  expect(rendered.sections).toHaveLength(7);
  expect(rendered.introduction).toContain('$500');
  expect(rendered.introduction).toContain('href="#source-1"');
  expect(rendered.sources[1]?.html).toContain('href="https://example.com/review"');
  expect(rendered.sections.find((section) => section.key === 'problem')?.html).toContain('<math');
  expect(rendered.sections.find((section) => section.key === 'claim')?.html).toContain('<uruk-formula>');
});

test('visual planning notes stay in Markdown without appearing in the article', () => {
  const withNote = body.replace('Earlier work.', 'Earlier work.\n\n<!-- uruk:visual-note\nA visual for this page can show a future diagram.\n-->');
  const rendered = renderResult(withNote);

  expect(rendered.sections.find((section) => section.key === 'history')?.html).toBe('<p>Earlier work.</p>');
  expect(() => renderResult(body.replace('Earlier work.', '<script>alert(1)</script>'))).toThrow('raw HTML');
});

test('invalid sections and disconnected references stop content rendering', () => {
  expect(() => renderResult(body.replace('## The problem', '## Unrecognized'))).toThrow('section');
  expect(() => renderResult(body.replace('[1]', '[3]'))).toThrow('no source');
  expect(() => renderResult(body.replace('[2]', ''))).toThrow('never cited');
  expect(() => renderResult(body.replace('2. The review.', '3. The review.'))).toThrow('consecutively');
  expect(() => renderResult(body, 'https://example.com/missing')).toThrow('review link');
  expect(() => renderResult(body.replace('$x_1$', '$\\notARealCommand$'))).toThrow();
});
