// Keep the original TeX slices intact; only top-level relations may start a new row.
export function splitFormula(tex: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let environments = 0;
  let start = 0;
  const tokens = tex.matchAll(/%[^\n]*(?:\n|$)|\\[a-zA-Z]+|\\.|./gs);

  for (const token of tokens) {
    const value = token[0];
    const relation = value === '=' || value === '≤' || value === '\\le' || value === '\\leq';

    if (relation && depth === 0 && environments === 0 && token.index > start) {
      parts.push(tex.slice(start, token.index));
      start = token.index;
    }

    if (['{', '(', '[', '\\{', '\\left', '\\langle', '\\lceil', '\\lfloor', '\\lvert', '\\lVert'].includes(value)) {
      depth += 1;
    } else if (['}', ')', ']', '\\}', '\\right', '\\rangle', '\\rceil', '\\rfloor', '\\rvert', '\\rVert'].includes(value)) {
      depth = Math.max(0, depth - 1);
    } else if (value === '\\begin') {
      environments += 1;
    } else if (value === '\\end') {
      environments = Math.max(0, environments - 1);
    }
  }

  parts.push(tex.slice(start));

  return parts;
}

export function alignedFormula(tex: string): string {
  return `\\begin{aligned}${splitFormula(tex).map((part) => `& ${part}`).join(' \\\\ ')}\\end{aligned}`;
}
