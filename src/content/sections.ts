export const resultSections = [
  { key: 'problem', id: 'the-problem', titles: ['The problem'], required: true },
  { key: 'history', id: 'why-it-stayed-open', titles: ['Why it stayed open'], required: true },
  { key: 'claim', id: 'what-openai-claims', titles: ['What OpenAI claims'], required: true },
  { key: 'proof', id: 'how-the-claimed-proof-goes', titles: ['How the claimed proof goes', 'How the claimed proofs go'], required: true },
  { key: 'consequences', id: 'consequences-inside-mathematics', titles: ['Consequences inside mathematics'], required: false },
  { key: 'uses', id: 'uses-outside-mathematics', titles: ['Uses outside mathematics'], required: true },
  { key: 'review', id: 'has-anyone-checked-it', titles: ['Has anyone checked it?'], required: true },
  { key: 'sources', id: 'sources', titles: ['Sources'], required: true },
] as const;

export type SectionKey = typeof resultSections[number]['key'];
