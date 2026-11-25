// Each heading keeps its own anchor, so links to an older heading still land.
export const resultSections = [
  { key: 'problem', headings: [{ title: 'The problem', id: 'the-problem' }], required: true },
  { key: 'history', headings: [{ title: 'Why it stayed open', id: 'why-it-stayed-open' }], required: true },
  {
    key: 'claim',
    headings: [
      { title: 'What the paper claims', id: 'what-the-paper-claims' },
      { title: 'What OpenAI claims', id: 'what-openai-claims' },
    ],
    required: true,
  },
  {
    key: 'proof',
    headings: [
      { title: 'How the claimed proof goes', id: 'how-the-claimed-proof-goes' },
      { title: 'How the claimed proofs go', id: 'how-the-claimed-proof-goes' },
    ],
    required: true,
  },
  { key: 'consequences', headings: [{ title: 'Consequences inside mathematics', id: 'consequences-inside-mathematics' }], required: false },
  { key: 'uses', headings: [{ title: 'Uses outside mathematics', id: 'uses-outside-mathematics' }], required: true },
  { key: 'review', headings: [{ title: 'Has anyone checked it?', id: 'has-anyone-checked-it' }], required: true },
  { key: 'sources', headings: [{ title: 'Sources', id: 'sources' }], required: true },
] as const;

export type SectionKey = typeof resultSections[number]['key'];
