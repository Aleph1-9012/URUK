import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import { toHast } from 'mdast-util-to-hast';
import { toHtml } from 'hast-util-to-html';
import type { Definition, Parent, PhrasingContent, Root, RootContent } from 'mdast';
import { renderFormula } from '../lib/formulas/render';
import { resultSections, type SectionKey } from './sections';

const parser = unified().use(remarkParse).use(remarkMath).use(remarkGfm);
const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

interface Section {
  key: SectionKey;
  id: string;
  title: string;
  numeral: string;
  nodes: RootContent[];
}

function citationLinks(value: string, total: number, cited: Set<number>): PhrasingContent[] {
  const children: PhrasingContent[] = [];
  let start = 0;

  for (const match of value.matchAll(/\[(\d+)\]/g)) {
    const number = Number(match[1]);

    if (number < 1 || number > total) {
      throw new Error(`Citation ${match[0]} has no source.`);
    }

    children.push({ type: 'text', value: value.slice(start, match.index) });
    children.push({
      type: 'link',
      url: `#source-${number}`,
      children: [{ type: 'text', value: match[0] }],
      data: { hProperties: { className: ['text-link', 'citation'], ariaLabel: `Source ${number}` } },
    });
    cited.add(number);
    start = match.index + match[0].length;
  }

  children.push({ type: 'text', value: value.slice(start) });

  return children;
}

function prepare(parent: Parent, total: number, cited: Set<number>, citations = true): void {
  const children: RootContent[] = [];

  for (const node of parent.children) {
    if (node.type === 'html') {
      if (/^<!-- uruk:visual-note\n(?:(?!-->)[\s\S])*\n-->$/u.test(node.value)) {
        continue;
      }

      throw new Error('Result documents must use Markdown rather than raw HTML.');
    }

    if (node.type === 'math' || node.type === 'inlineMath') {
      children.push({ type: 'html', value: renderFormula(node.value, node.type === 'math') });
      continue;
    }

    if (node.type === 'text' && citations) {
      children.push(...citationLinks(node.value, total, cited));
      continue;
    }

    if (node.type === 'link' || node.type === 'linkReference') {
      node.data = { hProperties: { className: ['text-link'] } };
    }

    if ('children' in node) {
      prepare(node, total, cited, citations && node.type !== 'link' && node.type !== 'linkReference');
    }

    children.push(node);
  }

  parent.children = children;
}

function collectDefinitions(parent: Parent, definitions: Map<string, Definition>): void {
  for (const node of parent.children) {
    if (node.type === 'definition' && !definitions.has(node.identifier)) {
      definitions.set(node.identifier, node);
    }

    if ('children' in node) {
      collectDefinitions(node, definitions);
    }
  }
}

function hasDestination(parent: Parent, destination: string, definitions: Map<string, Definition>): boolean {
  return parent.children.some((node) => {
    if (node.type === 'link') {
      return node.url === destination;
    }

    if (node.type === 'linkReference') {
      return definitions.get(node.identifier)?.url === destination;
    }

    return 'children' in node && hasDestination(node, destination, definitions);
  });
}

function renderNodes(nodes: RootContent[], definitions: Map<string, Definition>, total: number, cited: Set<number>, citations = true): string {
  const tree: Root = { type: 'root', children: structuredClone([...nodes, ...definitions.values()]) };
  prepare(tree, total, cited, citations);

  // Only our Temml renderer creates HTML nodes; authored HTML is rejected above.
  return toHtml(toHast(tree, { allowDangerousHtml: true }), { allowDangerousHtml: true });
}

export function renderResult(body: string, reviewLink?: string) {
  const tree = parser.parse(body);
  const definitions = new Map<string, Definition>();
  const introduction: RootContent[] = [];
  const sections: Section[] = [];
  let current: Section | undefined;
  let previousIndex = -1;
  collectDefinitions(tree, definitions);

  for (const node of tree.children) {
    if (node.type === 'definition') {
      continue;
    }

    if (node.type === 'heading' && node.depth === 1) {
      throw new Error('The page title belongs in front matter, not the body.');
    }

    if (node.type === 'heading' && node.depth === 2) {
      const title = node.children.map((child) => child.type === 'text' ? child.value : '').join('');
      const index = resultSections.findIndex((section) => section.titles.some((allowed) => allowed === title));
      const definition = resultSections[index];

      if (!definition || index <= previousIndex) {
        throw new Error(`Unknown, repeated or misplaced section: ${title}`);
      }

      const numeral = numerals[sections.length];

      if (!numeral) {
        throw new Error('Too many result sections.');
      }

      current = { key: definition.key, id: definition.id, title, numeral, nodes: [] };
      sections.push(current);
      previousIndex = index;
    } else {
      (current ? current.nodes : introduction).push(node);
    }
  }

  for (const definition of resultSections) {
    if (definition.required && !sections.some((section) => section.key === definition.key && section.nodes.length > 0)) {
      throw new Error(`Missing section: ${definition.titles[0]}`);
    }
  }

  const sourceSection = sections.find((section) => section.key === 'sources');
  const list = sourceSection?.nodes[0];

  if (!list || list.type !== 'list' || !list.ordered || list.start !== 1 || sourceSection?.nodes.length !== 1) {
    throw new Error('Sources must be one numbered list starting at 1.');
  }

  const lines = body.split('\n');

  for (const [index, item] of list.children.entries()) {
    const line = item.position ? lines[item.position.start.line - 1] : '';
    const number = line?.match(/^\s*(\d+)[.)]\s/);

    if (Number(number?.[1]) !== index + 1) {
      throw new Error(`Sources must be numbered consecutively; expected ${index + 1}.`);
    }
  }

  const cited = new Set<number>();

  if (reviewLink && !hasDestination(list, reviewLink, definitions)) {
    throw new Error('The review link must appear in Sources.');
  }

  const sources = list.children.map((item, index) => ({
    number: index + 1,
    html: renderNodes(item.children, definitions, list.children.length, cited, false),
  }));
  const intro = renderNodes(introduction, definitions, sources.length, cited);
  const rendered = sections.map(({ nodes, ...section }) => ({
    ...section,
    html: section.key === 'sources' ? '' : renderNodes(nodes, definitions, sources.length, cited),
  }));

  for (const source of sources) {
    if (!cited.has(source.number)) {
      throw new Error(`Source ${source.number} is never cited.`);
    }
  }

  return { introduction: intro, sections: rendered, sources };
}
