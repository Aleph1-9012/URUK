export const digResult = {
  family: '248',
  layers: [
    {
      numeral: 'I',
      question: 'What is the problem?',
      answer: 'In 1965 Richard Thompson wrote down a group of simple-looking maps: stretch and squeeze a line piecewise, with every slope a power of two. One question about it became famous: does the group admit a fair way to average?',
      pattern: 'bark',
      review: false,
    },
    {
      numeral: 'II',
      question: 'Why did it stay open?',
      answer: "For fifty years nobody could decide. False proofs in both directions appeared, by one expert's count, about once a year, including a 2012 claim that its author withdrew after a competitor found the error.",
      pattern: 'slant',
      review: false,
    },
    {
      numeral: 'III',
      question: 'Does it matter outside mathematics?',
      answer: "No known direct application. Amenability underlies ergodic theory and the Banach-Tarski paradox, but Thompson's group is an object of pure mathematics.",
      pattern: 'zigzag',
      review: false,
    },
    {
      numeral: 'IV',
      question: 'Have mathematicians approved the proof?',
      answer: 'Yes. Sang-hyun Kim and Yash Lodha, two experts in exactly this area, rewrote the proof as their own and published it under their names. It is not a journal acceptance, and it is not a consensus.',
      pattern: 'lozenge',
      review: true,
    },
  ],
  related: [
    { family: '158', question: 'How many colours does it take to paint the plane so that no two points one unit apart match?' },
    { family: '003', question: 'How close can the zeros get to the edge?' },
    { family: '102', question: 'Can you fix one rule without breaking another?' },
    { family: '167', question: 'How many pairs of points can be exactly one unit apart?' },
  ],
} as const;
