---
family: "028"
topic: "The Gaussian moat problem"
title: "Can you walk to infinity on the Gaussian primes with steps of bounded length?"
paperTitle: "Bounded-Step Walks on Gaussian Primes"
claim: "For every step length D there is a finite number B_D such that every connected piece of the graph joining Gaussian primes at distance at most D has at most B_D vertices. In particular no infinite sequence of distinct Gaussian primes has bounded gaps between consecutive terms: there is no walk to infinity on the Gaussian primes."
status: unreviewed
checked: 2026-11-02
papers:
  - preprints/Bounded-Step-Walks-on-Gaussian-Primes-September-26-2026/paper.pdf
draft: false
---

Plot the Gaussian primes, the prime numbers of the complex plane, and they form a lattice of dots with eightfold symmetry, dense near the origin and thinning outward. In 1962 Basil Gordon asked, at the International Congress in Stockholm, whether one can walk from the origin to infinity stepping only on these dots, with every step shorter than some fixed length. Along the real axis the answer is no, because ordinary primes have arbitrarily long gaps; in the plane a walker can go around a gap, and the question stayed open for sixty-four years, with computer searches showing only that steps up to length $6$ do not get far. On 26 September 2026 OpenAI posted a paper claiming that for every fixed step length the walk is trapped, and more: the dots that can be reached from one another with steps of length at most $D$ come in finite clusters whose size is bounded by a number depending only on $D$. [1][2][3]

As of 2 November 2026 no mathematician has said publicly that they have checked the proof. OpenAI's Lean formalization of the full statement is in the release's catalogue, and two reference sites now record the problem as solved on that basis. The status on this page is "unreviewed". [5][6][7]

## The problem

A Gaussian integer is a complex number $a+bi$ with $a,b$ ordinary integers; its norm is $N(a+bi)=a^{2}+b^{2}$, the square of its distance from the origin. The Gaussian integers can be factored like ordinary integers, uniquely up to the four units $\pm1,\pm i$, and a Gaussian prime is one that cannot be factored further. They are of three kinds: $1+i$ and its associates; the ordinary primes $3,7,11,\ldots$ that leave remainder $3$ on division by $4$, together with their associates, which sit on the axes; and, for each ordinary prime $p=5,13,17,\ldots$ leaving remainder $1$, the two conjugate factors $a\pm bi$ with $a^{2}+b^{2}=p$ and their associates. The last kind fills the plane; the picture has the symmetries of a square. [1]

For a real number $D$, let $G_D$ be the graph whose vertices are all Gaussian primes and in which two of them are joined when their distance is at most $D$. A walk on $G_D$ is a path of distinct primes with every step of length at most $D$. The Gaussian moat problem asks whether, for some $D$, there is an infinite such walk. The name comes from the obstacles: a moat of width $D$ is a prime-free ring around the origin that no $D$-step can cross. On the real line there are moats of every width, since $n!+2,\ldots,n!+n$ are all composite, so no walk along the axis gets far. In the plane one can prove that there are arbitrarily large prime-free disks too, but a disk is not a ring; the walker can go around it. [1][3]

<!-- uruk:visual-note
The visual on this page draws the Gaussian primes out to a radius the reader chooses, lets the reader pick a step length, and colours the component of the origin, the set of primes reachable from $1+i$ with steps of at most that length. At small step lengths the component is tiny; at $\sqrt{26}$ and beyond it grows to thousands of dots before it ends. What the visual leaves out is everything the theorem is about: the claim concerns every component, including those far beyond any drawable radius, and the bound $B_D$ it supplies is not a number anyone can compute from the proof. [1][3]
-->

## Why it stayed open

### Who asked

Gethner and Stark trace the question to Gordon at the 1962 Congress; Erdős, writing in 1977, credited it to Gordon and to Motzkin, who had told it to him at a number-theory meeting in Pasadena in November 1963. It is problem 952 in the Erdős problems collection. The collection's record lists two earlier claimed negative answers, from 2019 and 2024, both withdrawn. [1][4][5]

### What was tried

Two lines of work ran in parallel. Computation surrounded the origin: Gethner, Wagon and Wick found in 1998 the successive moats that confine walks of step length up to $\sqrt{26}$, and Tsuchimura extended the search to step length $6$ in 2005, each time a statement about the component of one starting point, not about the whole plane. Theory produced periodic obstructions: Gethner and Stark showed in 1997 that for steps of length $\sqrt2$ and $2$ the walk is blocked by a finite sieve, a pattern of residues modulo a few small Gaussian primes that repeats across the plane, and proposed sieving by small primes for larger steps. Vardi, in "Prime percolation" (1998), studied these periodic coprimality graphs and stated the two conjectures that the new paper proves: no infinite component for any step length, and a uniform bound on component size. [1][2][3][4]

### What stood in the way

A finite sieve for a given $D$ has to rule out every self-avoiding walk, and not only walks from one point, and no one knew how to find one beyond $D=2$. Probabilistic heuristics say the walker should be trapped, because the density of Gaussian primes near radius $r$ falls like $1/\log r$ and a long walk needs primes at every step; but the primes are not random, and the walk is free to choose its route to wherever the primes happen to be. Turning the heuristic into a proof needed a way to charge the walk for every prime-free class it dodges, and to show that the charges add up to more than any walk can pay. [1]

## What OpenAI claims

**Theorem 1.1** (OpenAI, 26 September 2026; uniform component bound). For every finite real $D$ there is a finite $B_D$ such that every connected component of $G_D$ has at most $B_D$ vertices. The bound is independent of the starting prime and includes primes on the coordinate axes. Consequently every sequence of distinct Gaussian primes with successive distances at most $D$ has at most $B_D$ terms. [1]

**Theorem 1.2** (finite sieve obstruction). For every $D\ge1$ there is a finite set $\mathcal P_D$ of ordinary primes congruent to $1$ modulo $4$, depending only on $D$, such that the set $\mathcal A(\mathcal P_D)$ of Gaussian integers divisible by neither Gaussian factor of any $p\in\mathcal P_D$ contains no infinite sequence of distinct points with successive distances at most $D$. [1]

Three points of scope. The bound $B_D$ is nonexplicit: the proof fixes $D$, then takes its scales "sufficiently large", and gives no procedure for computing $B_D$ or the sieve set $\mathcal P_D$. For $D<1$ no two lattice points are adjacent and $B_D=1$. The theorem is about Gaussian primes only; the paper makes no claim about Eisenstein primes or other rings, although nothing in the strategy is specific to $\mathbb Z[i]$ beyond its arithmetic. [1]

## How the claimed proof goes

What follows is a map of the paper's argument from its introduction and the eight sections it points to. It is not a check of the details. The paper is about 2,200 lines of TeX; Section 2 is short and exact, and Sections 3 to 8 carry the analytic weight. [1]

**From a periodic obstruction to a uniform bound (Section 2, Proposition 2.1).** Suppose a finite set $\mathcal P$ of split primes is such that $\mathcal A(\mathcal P)$ contains no infinite $D$-step walk. The graph on $\mathcal A(\mathcal P)$ is invariant under translation by $Q\mathbb Z^{2}$, where $Q=\prod_{p\in\mathcal P}p$. An infinite component would contain an infinite simple path (the tree of finite paths from a vertex is finitely branching), so every component is finite; and a finite component cannot contain two points differing by a vector of $Q\mathbb Z^{2}$, because translation by that vector would map the component to itself. So each component injects into $(\mathbb Z/Q\mathbb Z)^{2}$ and has at most $Q^{2}$ points. The Gaussian primes outside $\mathcal A(\mathcal P)$ are exactly the finitely many associates of the selected factors; adding them back can join at most $(K_D-1)|E|$ components, where $K_D$ counts lattice vectors of length at most $D$. Hence every component of $G_D$ has at most $\max\{Q^{2},|E|+(K_D-1)|E|Q^{2}\}$ points. This is where uniformity in the starting point comes from: periodicity, which absence of an infinite path alone would not give. [1]

**The shape of the sieve argument (Sections 3 to 8).** Theorem 1.2 is proved by contradiction. Fix $D$ and an arbitrary infinite self-avoiding walk with steps at most $D$ that avoids zero modulo both factors of every prime in a large set $\mathcal P_M$; the walk is deterministic and fixed throughout, and randomness enters only through sampled times along it and through an auxiliary choice of one Gaussian factor over each prime. The plan is to show that avoiding the zero classes costs the walk information at every scale, and that the total cost exceeds what a bounded-step walk can carry. [1]

**Entropy enrichment (Section 4, Lemma 4.3).** The basic move takes a long segment of the walk, chooses uniformly one of its distinct displacement vectors and then one endpoint of that displacement. Lemma 4.1 shows that a self-avoiding segment of length $U$ has many distinct differences; Lemma 4.2 shows that a random collection of signed prime factors usually separates them, by a determinant-divisibility and concentration argument, with a torus-degree argument for the differences and disjoint neighbourhoods in the Boolean cube to avoid counting all lattice directions. Together they force the sampled endpoint to carry more joint entropy in its residues modulo the chosen factors than the segment's start did. [1]

**Coverage transfer (Section 5, Theorem 5.2).** Entropy alone does not give what the information step needs, namely that for most factors $\pi$ of norm $p$ the terminal residue has probability at least $\tau/p$ outside fewer than $p^{1-\beta}$ exceptional residues. Section 5 supplies this by repeated continuation from an exact later checkpoint: the continuations share one displacement vector across all residue coordinates, and if coverage failed in many coordinates at once that single vector would place the true residue on a short list with appreciable probability, at an entropy cost too small to produce such a deficit. Lemma 5.1 bounds the shared conditioning cost. [1]

**A common schedule (Section 6, Proposition 6.2).** The sampling operations are arranged at decreasing scales with checkpoints $A_J,\ldots,A_0$; the entropy and displacement estimates are established first, then coverage is transferred backward through the checkpoints, so that terminal residue coverage holds for all but a fraction $\eta_i$ of the signed primes at every level. Every prime batch uses the same terminal time law $t_*$, and an independent uniform offset makes that law nearly invariant under the time shifts used later (Lemma 6.1). [1]

**Zero avoidance costs information (Section 7, Proposition 7.1).** Now assume the walk avoids the selected zero classes. Short increment words, finite lists of consecutive steps, are used to test candidate starting residues: coverage and self-avoidance make the tests informative, and each prime batch near scale $T$ incurs conditional mutual information at least $c_1/\log T$ per increment between the residue vector and the increment word, with $c_1$ depending only on $D$. [1]

**The budget (Section 8, Lemma 8.1).** The costs are added with nested residue vectors and dyadic word lengths at the common time law. Block subadditivity of entropy bounds the sum over all batches by $\log K_D+o(1)$, the entropy of one bounded increment, while the selected batches at scales $T$ ranging over about $M$ disjoint intervals contribute at least $c/(1.05\log B)$ each and so diverge as $M$ grows. For $M$ large enough, depending only on $D$, this is a contradiction, and $\mathcal P_D=\mathcal P_M$ is the finite sieve set. The paper notes that the use of approximate translation invariance and block subadditivity to bound accumulated information is related in method to Tao's entropy-decrement argument for the logarithmically averaged Chowla conjecture, while stressing that the signed residue batches, coverage transfer and avoidance costs are established in full in the paper. [1]

**Where an expert would look first.** At Lemma 4.2, where the probabilistic separation of differences by random signed factors is proved, since the enrichment rests on it; at the numerical hypotheses of Theorem 5.2 and their verification level by level in Proposition 6.2, where many parameters $(\tau_i,\beta_i,\eta_i)$ must fit together; and at Lemma 8.1, the telescoping bound, where the common time law and the dyadic word lengths have to make the sum over scales genuinely subadditive. The periodicity reduction of Section 2 is elementary and can be checked in an afternoon. [1]

## Consequences inside mathematics

The theorem settles Erdős problem 952 in the negative and proves both of Vardi's 1998 conjectures, the second in its strong form with a bound uniform over starting points. The finite-sieve theorem is a statement about the lattice, not about primes: it says that the set of Gaussian integers avoiding a finite collection of residue classes contains no infinite bounded-step walk, which is stronger than needed and may be the part of the argument that carries over to other settings. Nothing explicit follows for the computational question of how far a walker with steps of length $6$ or $7$ can get. [1][4][5]

## Uses outside mathematics

No known direct application. The problem is a question about the geometry of the primes, asked for its own sake; the paper names none, and none is recorded on the problem's reference pages. [1][5][6]

## Has anyone checked it?

We found no named mathematician who has said publicly that they have read or checked the proof. The expected readers would be the people who worked on the problem: Ellen Gethner, Stan Wagon, Ilan Vardi, and Thomas Bloom as keeper of the Erdős problems list. Bloom's site records the problem's status; MathWorld's entry, revised in October 2026, states that "OpenAI (2026) gave a Lean-formalized proof that the answer is negative" and files the problem under solved problems and AI-generated proofs. The Erdős Problems wiki accepts the claim "on formalized evidence" and says explicitly that "No refereed publication, arXiv version or reviewer independent of the release is recorded". VibeMathed lists the result as Lean-checked, with the note "No independent mathematician has checked this yet." These are records of the claim and of its machine check, not reports of a human reading, and this site does not count them as approval. [5][6][7]

**Machine checking.** The release's catalogue `formalization.yaml` lists this paper, and its scope note links a 41-line comparator statement, `GaussianMoat.lean`, which defines the graph on irreducible Gaussian integers with an edge when the Euclidean distance is at most $D$, and states `fullMain` as the conjunction of two propositions: that for every real $D$ no injective sequence of Gaussian primes has all consecutive distances at most $D$, and that for every real $D$ some natural number bounds the size of every component and the length of every injective bounded-step walk. That is the whole of Theorem 1.1, in Mathlib's own terms. The formal proof behind it is 41 files. The DeepMind formal-conjectures catalogue marked its statement of problem 952 as solved on 11 October, linking this proof, with a note that its own statement bounds the norm of each step rather than the distance, a routine difference not bridged in Lean. We found no outside replay. A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval. [5][8]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; this paper is not among them. On 26 October it added two manuscripts and more Lean statements; nothing in this family changed. [9]

## Sources

1. OpenAI, "Bounded-Step Walks on Gaussian Primes", 26 September 2026. Theorems 1.1 and 1.2, Section 1 for the history and the proof outline, Section 2 for the periodicity reduction, Sections 3 to 8 for the sieve argument. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Bounded-Step-Walks-on-Gaussian-Primes-September-26-2026/paper.pdf
2. Ellen Gethner and Harold M. Stark, "Periodic Gaussian moats", Experimental Mathematics 6 (1997), 289 to 292. The attribution to Gordon; the periodic obstructions for $\sqrt2$ and $2$. https://doi.org/10.1080/10586458.1997.10504616
3. Ellen Gethner, Stan Wagon and Brian Wick, "A stroll through the Gaussian primes", American Mathematical Monthly 105 (1998), 327 to 337. The computed moats and the prime-free disks. https://doi.org/10.1080/00029890.1998.12004889
4. Ilan Vardi, "Prime percolation", Experimental Mathematics 7 (1998), 275 to 289. Conjectures 1.1 and 1.2, the periodic coprimality graphs. https://doi.org/10.1080/10586458.1998.10504373
5. Erdős Problems, Problem 952, and the Erdős Problems wiki page for OpenAI's claim, updated 7 October 2026, read 2 November 2026. The earlier withdrawn claims; the acceptance "on formalized evidence"; the formal-conjectures note of 11 October. https://www.erdosproblems.com/952 and https://erdosproblems.ai/wiki/problems/number_theory/E0952/claims/2026_09_26_openai
6. Eric W. Weisstein, "Gaussian Moat Problem", MathWorld, read 2 November 2026. Records the claim and the Lean proof. https://mathworld.wolfram.com/GaussianMoatProblem.html
7. VibeMathed, "The Gaussian moat problem", dataset of 1 November 2026. https://vibemathed.com/problem/gaussian-moat-problem
8. OpenAI, Lean scope note for family 028 and the comparator statement `GaussianMoat.lean` at the pinned commit. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/028.md and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/GaussianMoat.lean
9. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
