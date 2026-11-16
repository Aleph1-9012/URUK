import { createTimeline } from '../../plate/timeline';

export const CUES = [
  {
    at: 0,
    title: "A clock of remainders",
    text: "Divide the powers of $2$ by $11$ and keep the remainders: $2,4,8,5,10,9,7,3,6,1$.",
    sources: [],
  },
  {
    at: 6500,
    title: "Every nonzero remainder",
    text: "Every nonzero remainder appears before the cycle repeats, and one says that $2$ is a primitive root modulo $11$.",
    sources: [],
  },
  {
    at: 14000,
    title: "A cycle closes early",
    text: "Modulo $7$ it is not: $2,4,1$, and the cycle closes early.",
    sources: [],
  },
  {
    at: 19500,
    title: "Artin writes to Hasse",
    text: "Every integer other than $-1$ and the perfect squares should be a primitive root for infinitely many primes.",
    sources: [5],
  },
  {
    at: 29750,
    title: "Counting the primes",
    text: "He predicted the proportion: for $2$, about $37.4$ percent of all primes. A century later nobody had proved this for a single base.",
    sources: [5],
  },
  {
    at: 38250,
    title: "The index gates",
    text: "Why it is hard: a prime $q$ divides the index $(p-1)/\\operatorname{ord}_p(a)$ exactly when $p\\equiv1\\pmod q$ and $a^{(p-1)/q}\\equiv1\\pmod p$.",
    sources: [1],
  },
  {
    at: 45750,
    title: "Hooley under GRH",
    text: "Hooley proved it in 1967 assuming the generalized Riemann hypothesis.",
    sources: [3],
  },
  {
    at: 54000,
    title: "One of three bases",
    text: "At least one of $2$, $3$ and $5$ works, without being able to say which.",
    sources: [4],
  },
  {
    at: 61000,
    title: "A curious footnote",
    text: "A curious footnote: if $p=4q+1$ with $q$ prime then $2$ is a primitive root modulo $p$.",
    sources: [5],
  },
  {
    at: 67000,
    title: "Every admissible base, claimed",
    text: "On 4 October 2026, two days before its release, OpenAI posted a ninety-two-page paper claiming the infinitude statement for every admissible base.",
    sources: [1],
  },
  {
    at: 76000,
    title: "A logarithm short",
    text: "Its count is a logarithm short of Artin's prediction and the constants are not explicit; the predicted density remains unproved.",
    sources: [1],
  },
  {
    at: 84250,
    title: "A family of primes",
    text: "The residue class $u$ is chosen so that the Legendre symbol $(a/p)=-1$, which excludes $q=2$ as an index divisor.",
    sources: [1],
  },
  {
    at: 93250,
    title: "A common zero-free width, claimed",
    text: "For every finite-order Hecke character $\\eta$ of $F$, the $L$-function $L_F(s,\\eta)$ has no zeros with $\\operatorname{Re}s>1-10^{-6}$.",
    sources: [1],
  },
  {
    at: 102000,
    title: "Summing the gates",
    text: "The factors of $r$ lie exactly in the range where Proposition 2.2 applies with a saving that beats the sum over $q$.",
    sources: [1],
  },
  {
    at: 110250,
    title: "Where the claim stands",
    text: "As of 18 October 2026 no mathematician has said publicly that they have read or checked the proof.",
    sources: [1, 6, 7],
  },
] as const;

export const FILM_DURATION = 120000;

export const TIMELINE = createTimeline(CUES, FILM_DURATION, 180);
