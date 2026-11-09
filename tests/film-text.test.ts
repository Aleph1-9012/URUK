import { expect, test } from 'bun:test';
import { renderFilmText } from '../src/components/plate/text';

test('film text keeps unmatched currency literal and escapes text outside formulas', () => {
  expect(renderFilmText('The prize is $500 & <1000>.')).toBe('The prize is $500 &amp; &lt;1000&gt;.');
  expect(renderFilmText('A trailing $')).toBe('A trailing $');
});

test('film text groups formulas with their attached punctuation or word', () => {
  const result = renderFilmText('An $L$-function, then $x$.');

  expect(result.match(/<math[ >]/g)).toHaveLength(2);
  expect(result).toContain('-function,</span>');
  expect(result).toContain('.</span>');
});

test('film text renders adjacent formulas separately and escapes attached markup', () => {
  const result = renderFilmText('$x$/$y$<tag>&');

  expect(result.match(/<math[ >]/g)).toHaveLength(2);
  expect(result.match(/class="film-phrase"/g)).toHaveLength(2);
  expect(result).toContain('/</span>');
  expect(result).toContain('&lt;tag&gt;&amp;</span>');
});
