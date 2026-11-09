---
family: "103"
topic: "Logarithmic-space derandomization"
title: "Does a computer with almost no memory need coins?"
paperTitle: "Exact derandomization of logarithmic space: L = RL = BPL"
claim: "L = RL = BPL: every language decided by a randomized Turing machine with logarithmic work space and polynomial running time, with one-sided or two-sided bounded error, is decided by a deterministic machine in logarithmic space. The acceptance probability of such a machine can be approximated to within 2^(−q) in space O(log n + q) and time poly(n)·2^(O(q)), and an effective compiler converts any such randomized program into a deterministic one with explicit bounds."
status: unreviewed
checked: 2026-10-20
papers:
  - preprints/Exact-Derandomization-of-Logarithmic-Space-L-equals-RL-equals-BPL-September-23-2026/paper.pdf
draft: false
---

Imagine a computer that can read its input as often as it likes but can write down only a handful of numbers, enough to count to the input's length and to point at a few positions in it. That is logarithmic space, the class $\mathsf L$, and it captures what can be computed with almost no memory. Now give that computer a coin to flip. In 1979 Aleliunas, Karp, Lipton, Lovász and Rackoff showed that with coins it can tell whether two points of a maze are connected, by walking randomly for a polynomial number of steps, and asked whether the coins could be removed: is randomized logarithmic space the same as deterministic logarithmic space? Nisan's pseudorandom generator of 1990 showed that $\log^{2}n$ bits of memory suffice; Saks and Zhou got to $\log^{3/2}n$ in 1999; Reingold removed the coins from the maze problem itself in 2005, in a result that won a Gödel Prize; but the general question, $\mathsf L=\mathsf{BPL}$, stayed open and became the central problem of its field. On 23 September 2026 OpenAI posted a 108-page paper claiming it. [1][3][4][5]

As of 20 October 2026 no computer scientist has said publicly that they have read or checked the proof. The status on this page is "unreviewed".

## The problem

A Turing machine with a read-only input of length $n$ and work tapes of $O(\log n)$ cells has only polynomially many possible configurations, so it always runs in polynomial time. The class $\mathsf L$ is what such deterministic machines decide. A randomized version gets fresh fair coin flips; $\mathsf{RL}$ consists of languages decided in polynomial time with one-sided error, never accepting a no-instance and accepting a yes-instance with probability at least $1/2$; $\mathsf{BPL}$ allows two-sided error, at most $1/3$ either way. Trivially $\mathsf L\subseteq\mathsf{RL}\subseteq\mathsf{BPL}$. The paper counts space carefully: every live counter, register and suspended call is charged. [1]

**The question (Aleliunas, Karp, Lipton, Lovász and Rackoff, 1979).** Is $\mathsf L=\mathsf{RL}=\mathsf{BPL}$? [1][5]

<!-- uruk:visual-note
A visual for this page can show a small maze with a random walker finding the exit, then the configuration graph of a tiny randomized machine as a layered directed graph with probabilities on the edges, and the question as computing the probability of reaching "accept" from "start" when you can only remember a few pointers. The space-bound records, $\log^{2}n$, $\log^{3/2}n$, $\log n$, make a simple timeline.
-->

## Why it stayed open

What was known. Nisan's 1992 generator stretches $O(\log^{2}n)$ truly random bits into enough pseudorandom bits to fool any logarithmic-space machine, which puts $\mathsf{BPL}$ in deterministic $\log^{2}n$ space and quasipolynomial time; Nisan then achieved polynomial time with $\log^{2}n$ space. Saks and Zhou brought the space down to $O(\log^{3/2}n)$ without the time bound, Cai, Chakaravarthy and van Melkebeek traded time against space between the two, and Hoza shaved a $\sqrt{\log\log n}$ factor in 2021. Reingold's 2005 theorem $\mathsf{SL}=\mathsf L$, undirected connectivity in logarithmic space, settled the original maze problem; Reingold, Trevisan and Vadhan extended it to Eulerian directed graphs; but the configuration graphs of general randomized machines are directed and irregular, and those methods did not reach them. Cheng and Hoza showed in 2022 that an explicit hitting set for width-$n$ read-once branching programs would give $\mathsf L=\mathsf{BPL}$; nobody had one. [1][3][4]

Why it is hard: a logarithmic-space machine that reads polynomially many random bits defines a product of polynomially many stochastic matrices of polynomial size, and the deterministic machine must estimate an entry of that product with only logarithmic memory, which is not enough to store even one row. [1]

## What OpenAI claims

**Theorem 1.1** (exact logarithmic-space derandomization; OpenAI, 23 September 2026).

$$
\mathsf L=\mathsf{RL}=\mathsf{BPL}.
$$

[1]

**Theorem 1.2** (acceptance-probability approximation). Fix a randomized machine with polynomial worst-case running time and $O(\log n)$ work space, with acceptance probability $p(x)$ on input $x$. There is a uniform deterministic algorithm which, on input $(x,1^{q})$, outputs an integer $a$ with $|a2^{-(q+2)}-p(x)|\le2^{-q}$, using $O(\log n+q)$ space and $n^{O(1)}2^{O(q)}$ time. [1]

**Effective compiler.** Given a source program together with polynomial-time and logarithmic-space bounds for it, one terminating compiler produces a deterministic decider and explicit numerical bounds on its space and time. [1]

What these do and do not say. Theorem 1.2 works even when the machine's acceptance probabilities have no gap, so it is stronger than the class equality. The randomized machines must run in polynomial time on every random tape; randomized logarithmic space without a time bound is a different, larger class and is not addressed. The paper does not construct a pseudorandom generator with logarithmic seed; it derandomizes by a different route. Nothing is claimed about $\mathsf P$ versus $\mathsf{BPP}$, the time-bounded analogue. [1]

## How the claimed proof goes

What follows is a map of the paper's argument from its introduction and section plan. It is not a check of the details. The paper is 108 pages in thirteen sections, and the introduction itself contains a four-page proof strategy, which this map follows. [1]

**The idea.** Build a finite family of estimates of the acceptance probability, each indexed by an $O(\log n)$-bit string, such that more than three quarters of them are accurate and every one of them can be computed by a halting deterministic computation in $O(\log n)$ space. Then enumerate the whole family and take a median. The second property is essential: the enumeration must finish even on indices whose estimate is wrong. [1]

**The exact target.** After a configuration reduction (Section 2), the machine on a fixed input is a strictly forward substochastic matrix $S$ on a polynomial-size set $V_0$ of configurations, and the vector of acceptance probabilities is $p_0=(I-S)^{-1}e$, where $e$ marks accepting final configurations; the inverse is a finite sum because every transition advances time. [1]

**The correction and copy hierarchy (Section 4).** The paper replaces $S$ in stages by transitions $C_l$ on sets $V_l$ of configuration copies that carry accumulated rewards $W_l\in[0,1]^{V_l}$. A correction $E$ replaces $C$ by $D=C-E+EC$, and the identity $I-D=(I+E)(I-C)$ transfers the removed transition contribution into the reward (Section 4.1, correction with a fixed column multiplier). Detectors identify columns with many substantial entries and suppress correction there (the detector lemma); a finite pilot chooses the column multiplier; an ordered-support argument gives a factorial truncation bound, so only constantly many correction steps are needed at each stage; and the copy step distributes the remaining large entries while controlling how many vertices are incident to them (the one-stage density and active-count reduction). Each copy step has a designated primary copy, and following primaries from the start $x_0$ gives $z_l$ with

$$
0\le p_0(x_0)-W_l(z_l)\le|V_0|\,2^{-(H-1)l}
$$

for a fixed $H\ge4$ (the reward identity and shallow target proposition). After $L=O(B)$ stages, $B=\Theta(\log n)$, the reward at $z_L$ is accurate to any fixed inverse-polynomial error, and every stage has at most $N=2^{C_NB}$ vertices. The paper's one-line summary: the hierarchy reduces transition entries more rapidly than it increases the number of vertices incident to positive entries. [1]

**The shared random environment and the estimators (Sections 3 and 5 to 8).** The exact matrices and conditional expectations define the targets but are never stored. Section 5 represents their contributions by sample-dependent tables with bounded row support, "stochastic atoms"; corrections have bounded incoming degree, and their true conditional means recover the required entries. The algorithm estimates $W_L$ in one shared finite random environment $\sigma$, uniform on a specified finite set of matrix-and-bit-string encodings of length $O(B)$; on each channel a retention test selects vertices, with retention probability $\pi_f\asymp f$ at the final rate $f=2^{-HL}$ (Section 3, rank channels). Conditional averaging in the shared environment preserves the retention tests, and its uniform mixing bound is derived from classical property (T) results of Shalom, with the finite-action and sampling consequences proved in Section 6 (a uniform affine spectral gap, and conditional averaging). At parent budget $M$, Section 7 averages differences between child estimates at consecutive budgets $m$ and $m-1$, which are small because both approximate the same true sample term; the slack $M-m$ both sets the length of conditional averaging available to reduce noise and bounds the description of an immediate sample path. Section 8 compresses each row array into a short list of exceptions to a common default, charging deterministic conditional-mean error separately from residual noise (the integrated compression bound). The analysis must bound the bias from substituting earlier estimates without assuming independence of the estimated factors. [1]

**Why the lists fit in logarithmic space (Section 9).** A list entry is found by a path, and retaining a full endpoint at every recursive level would cost too much. Endpoints are compared by short fingerprint keys at small slacks, combining polynomial evaluation and affine hashing (short fingerprints). Since candidate endpoints can depend on earlier comparisons, a fixed-pair collision estimate is insufficient; a comparison within one budget block produces candidate sets independent of that block's fingerprint bits (independence of the clean block), smooth support functions charge escaped paths to lower-call errors, collisions within the fixed sets supply the remaining error, and a coupled induction (uniform block coupling) proves the moment bound for the actual estimator (the error-bounds theorem of Section 9). A shared catalytic bit vector permits equality tests without a key index at every level (the restoring equality test). [1]

**The accuracy statement.** The error-bounds theorem gives, for the actual estimator $\bar W_L$ and the final retention indicator $X_f$,

$$
\frac1N\,\mathbb E_\sigma\sum_{v\in V_L}\frac{X_f(v)}f\,|\bar W_L(v)-W_L(v)|^{8}\le C^{8}2^{-8p},
$$

with $p$ the statistical accuracy exponent. Keeping only the summand at $z_L$ costs a factor $N$, the price of passing from an integrated bound to one specified start; since $\log N=O(B)$, taking the statistical budget to be a large fixed multiple of $B$ pays that price and gives an accurate value on more than three quarters of the environments conditioned on $X_f(z_L)=1$ (Section 12, conditioning on one start). [1]

**Implementation and the space bound (Sections 10 and 11).** Numerical operations request one bounded digit at a time, through the uniform numerical interface of Section 10, with bounded suspended storage. The controller of Section 11 keeps one vertex cursor, uses bounded inverse ports for correction moves, and recovers incoming accesses by traversing finite program trees, using the contour idea of Cook and McKenzie and the space-preserving traversal of Lange, McKenzie and Tapp. Each call gets a decreasing recursion allowance $w$, top allowance $O(B)$, and the requested digit place $t$ serves as a numerical clock; a child with allowance $w'$ and digit place $j$ retains at most $A(w-w')+D(t-j)$ bits, these differences telescope along the active call chain, and the environment, cursor, catalyst and scratch are shared once. The bound and termination do not depend on statistical accuracy, which is the halting guarantee for inaccurate indices. [1]

**The final count (Section 12).** Dyadic approximations to the fixed value $\bar W_L(z_L)$ are computed on every environment encoding; choosing the stage count, statistical budget and digit accuracy makes the total error below $1/8$ on more than three quarters of the encodings; repeated enumeration finds the median while retaining only the current encoding and $O(B)$-bit registers; each digit query has $2^{O(B)}$ configurations and there are $2^{O(B)}$ encodings, so the whole computation is polynomial time. Comparing the median with $1/2$ separates acceptance probability at most $1/3$ from at least $2/3$, which is the nontrivial containment $\mathsf{BPL}\subseteq\mathsf L$. Padding gives the variable-precision Theorem 1.2, and Section 13 builds the compiler by specializing one resource-capped universal interpreter. [1]

Where would an expert look first? At the hierarchy's per-stage error bound $2^{-(H-1)l}$ and the polynomial vertex bound, which depend on the detector and the factorial truncation; at the uniform spectral gap of Section 6, where property (T) enters a derandomization argument; at the coupled induction of Section 9, which is where adaptively chosen candidates and fingerprint collisions are controlled together; and at the telescoping space bound of Section 11, which is the halting guarantee the paper itself flags as essential. [1]

## Consequences inside mathematics

If the proof holds, the main open problem of space-bounded derandomization is closed: randomness gives no power to polynomial-time logarithmic-space computation, the complexity classes $\mathsf L$, $\mathsf{RL}$ and $\mathsf{BPL}$ coincide, and Nisan's, Saks and Zhou's and Hoza's partial simulations are superseded. It is the space analogue of the conjectured $\mathsf P=\mathsf{BPP}$, which remains open and is believed to require circuit lower bounds; the space case was expected to be easier, and this would confirm it. The method does not give a logarithmic-seed pseudorandom generator, which remains a separate goal. [1]

## Uses outside mathematics

No known direct application.

Derandomization results are about what is possible in principle. Randomized algorithms are used everywhere in practice because they are simple and fast, and a proof that they can be replaced in logarithmic space does not make the replacement efficient enough to prefer. [1]

## Has anyone checked it?

Lance Fortnow of Illinois Tech, a complexity theorist, wrote on his blog on 15 October about why results on complexity classes are hard to formalize in Lean, using this paper as his example of a release result without a formal proof, and added an update: "Since I first drafted this post, OpenAI dropped a claimed Lean proof of L = RL = BPL, so maybe ignore this whole post?" He did not assess the paper. His blog's 7 October list of the release's highlights included "a full derandomization of randomized log space". We found no public statement from Hoza, Vadhan, Reingold, Saks, Zhou, Ta-Shma, Doron or Pyne, whose work the paper builds on. VibeMathed records no check by an independent mathematician. [6][7]

**Machine checking.** The 6 October release had no Lean scope note and no comparator statement for this family. On 7 October OpenAI added a statement `LogspaceEquality.lean` and listed it in the catalogue `formalization.yaml`, where it stands at the pinned commit; its scope note says it asserts the class equality $\mathsf L=\mathsf{RL}=\mathsf{BPL}$ for an explicit Turing-machine model and does not cover the quantitative approximation or the compiler. Because the statement defines its own machine model, a reader should check that model against the paper's. We found no outside replay. A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval. [2]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; this paper is not among them, and the same update added its Lean statement. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [8]

## Sources

1. OpenAI, "Exact derandomization of logarithmic space: L = RL = BPL", 23 September 2026. Theorems 1.1 and 1.2, the compiler, the historical context and the proof strategy. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Exact-Derandomization-of-Logarithmic-Space-L-equals-RL-equals-BPL-September-23-2026/paper.pdf
2. OpenAI, Lean scope note for family 103 and the comparator statement `LogspaceEquality.lean` at the pinned commit, both added on 7 October. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/103.md and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/LogspaceEquality.lean
3. Noam Nisan, "Pseudorandom generators for space-bounded computation", Combinatorica 12 (1992), 449-461. https://doi.org/10.1007/BF01305237
4. Omer Reingold, "Undirected connectivity in log-space", Journal of the ACM 55 (2008), article 17. https://doi.org/10.1145/1391289.1391291
5. Romas Aleliunas, Richard M. Karp, Richard J. Lipton, László Lovász and Charles Rackoff, "Random walks, universal traversal sequences, and the complexity of maze problems", Proceedings of the 20th IEEE Symposium on Foundations of Computer Science (1979), 218-223. https://doi.org/10.1109/SFCS.1979.34
6. Lance Fortnow, "Complexity and Lean", Computational Complexity blog, 15 October 2026, with its update and comments, read 20 October 2026. https://blog.computationalcomplexity.org/2026/10/complexity-and-lean.html
7. VibeMathed, "Derandomization of logarithmic space: is L = RL = BPL?", read 20 October 2026. https://vibemathed.com/problem/l-equals-rl-equals-bpl
8. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
