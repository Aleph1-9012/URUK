---
family: "191"
topic: "Heilbronn's triangle problem"
title: "Scatter n points in a square. How large can the smallest triangle be forced to be?"
paperTitle: "A power improvement in the Heilbronn triangle lower bound"
claim: "There are absolute constants eta, c > 0 such that for every sufficiently large n some n points in the unit square determine no triangle of area below c n^{-2+eta}. So the smallest triangle can be kept larger than any fixed power n^{-2+epsilon} allows, and the long-standing expectation that the answer is n^{-2} up to lower-order factors is false."
status: unreviewed
checked: 2026-11-02
papers:
  - preprints/A-power-improvement-in-the-Heilbronn-triangle-lower-bound-September-25-2026/main.pdf
draft: false
---

Put $n$ points in a unit square. Some three of them form the smallest triangle; call its area $\Delta$. Hans Heilbronn asked, around 1950, how large $\Delta$ can be made by placing the points well. A grid wastes points on straight lines, where the area is zero. Random placement gives about $1/n^{2}$, and a trick with primes does the same; Heilbronn conjectured that nothing does better by more than a constant factor. In 1982 Komlós, Pintz and Szemerédi beat that by a factor of $\log n$, and for forty years the belief was that this was the truth up to such slow factors: $\Delta$ could not exceed $n^{-2+\epsilon}$ for any fixed $\epsilon>0$. On 25 September 2026 OpenAI posted a paper claiming that this belief is wrong: there is a fixed power saving, points can be placed so that every triangle has area at least $c\,n^{-2+\eta}$ for an absolute $\eta>0$. The paper calls $\eta$ "fixed but extremely small", and it is: about $3\times10^{-236}$. [1][2][3]

As of 2 November 2026 no mathematician has said publicly that they have checked the proof. A Lean statement exists for a weaker form of the result and is not in the release's catalogue. The status on this page is "unreviewed". [1][6][7]

## The problem

For three points $p,q,r$ in the plane write $\operatorname{Area}(pqr)=\tfrac12|\det(q-p,r-p)|$. For a finite set $P$ of at least three points let $\Delta(P)$ be the smallest area over all triples, and let

$$
\Delta(n)=\max_{P\subset[0,1]^{2},\ |P|=n}\Delta(P)
$$

be the best that $n$ points can do. A collinear triple makes $\Delta(P)=0$, so good configurations avoid three in a line, and the maximum exists by compactness. Heilbronn's problem asks for the order of growth of $\Delta(n)$. [1]

Two easy constructions give $\Delta(n)\gg n^{-2}$. Erdős's: take a prime $p$ near $n$ and the points $(i,i^{2}\bmod p)$, scaled into the square; the triangle determinants are nonzero integers before scaling, so no triangle is smaller than about $1/p^{2}$. The random one: scatter $2n$ points at random and delete one point from every triangle of area below $c/n^{2}$; there are few such triangles, so $n$ points survive. Heilbronn conjectured that $\Delta(n)=O(n^{-2})$. [1]

<!-- uruk:visual-note
The visual on this page lets the reader drop points into a square, shows the smallest triangle as the pointer moves, and compares the reader's score with Erdős's parabola and with random placement at the same $n$; a second panel plots the known bounds on $\Delta(n)$ on logarithmic axes. What the visual leaves out is the new result itself. The improvement $n^{\eta}$ over $n^{-2}$ is invisible at every size that will ever be drawn: $n^{\eta}$ first reaches $2$ when $n$ has about $10^{235}$ digits, and the old $\log n$ factor of 1982 is larger for every $n$ anyone can write down. The theorem is about the exponent, not about pictures. [1]
-->

## Why it stayed open

### Who asked

Heilbronn posed the problem in the late 1940s; the earliest printed source is Roth's 1951 paper "On a problem of Heilbronn", which records the conjecture $\Delta(n)=O(n^{-2})$ and the parabola construction. It is problem 507 in the Erdős problems collection. [1][3][6]

### What was tried

The upper bounds came first and came slowly. Roth proved in 1951 that $\Delta(n)=o(1/n)$ by a density-increment argument; Schmidt and Roth refined it in the 1970s; Komlós, Pintz and Szemerédi reached $n^{-8/7+\epsilon}$ in 1981. Then nothing moved for forty years, until Cohen, Pohoata and Zakharov found incidence-geometric arguments that gave $n^{-8/7-1/2000}$ in 2023 and then $n^{-7/6+\epsilon}$. [1][4]

On the lower side there was one advance. Komlós, Pintz and Szemerédi showed in 1982 that $\Delta(n)\gg(\log n)/n^{2}$, disproving Heilbronn's conjecture as stated: they represent the small-area triples of a random point set as the edges of a hypergraph, remove short cycles, and use a strong independence lemma to select a large subset containing no such triple. After that the gap between $n^{-2}\log n$ and $n^{-7/6}$ stood, and the working belief, discussed in Zakharov's 2026 survey "Small triangles", settled on the almost-$n^{-2}$ formulation: for every $\epsilon>0$, $\Delta(n)\le C_\epsilon n^{-2+\epsilon}$. [1][2][3][5]

### What stood in the way

Every known lower-bound construction is either algebraic, like the parabola, which gives exactly the scale $n^{-2}$ because its determinants are integers of size about $n^{2}$, or random, which also gives $n^{-2}$ because a random triple has area below $t$ with probability about $t$ and there are $n^{3}$ triples. The logarithm of 1982 came from the hypergraph structure of the bad triples, and nobody found a way to extract more than a logarithm from it. The paper also records two recent preprints, by Ellmann and by Agama, claiming stronger power lower bounds, and states specific objections to the cited versions: one rests on an unproved local uniformity assumption that its author describes as heuristic; the other counts triangles that include a collinear triple, the two endpoints of a diameter and their midpoint. The paper says its objections concern those arguments, not the possibility of their bounds. [1]

## What OpenAI claims

**Theorem 1.1** (OpenAI, 25 September 2026). There are absolute constants $\eta,c_1>0$ and an integer $n_0\ge3$ such that $\Delta(n)\ge c_1n^{-2+\eta}$ for every integer $n\ge n_0$. [1]

In particular $\Delta(n)\ge n^{-2+\eta/2}$ for all large $n$, which contradicts the almost-$n^{-2}$ formulation at $\epsilon=\eta/2$. Section 8 makes $\eta$ explicit: $\eta=2/(45435k+16)$, where $k=T^{2}+1$, $T=\binom M3$ and $M=\binom{163}{41}$. By our arithmetic $M$ has 39 digits, $k$ has 232, and $\eta$ is about $3\times10^{-236}$. The constants $c_1$ and $n_0$ are not given. The point set is produced by sampling and deletion, so the proof shows that good sets exist without writing one down. The theorem says nothing about the true order of $\Delta(n)$, which still lies somewhere between $n^{-2+\eta}$ and $n^{-7/6+\epsilon}$, and the paper makes no conjecture about it. [1]

## How the claimed proof goes

What follows is a map of the paper's argument from its introduction and its eight sections. It is not a check of the details. The paper is about 1,750 lines of TeX, and its argument is arithmetic: the points are chosen so that the determinants of their triples are forced, by congruence conditions, to be large. [1]

**Points as integer columns.** Work with integer columns $u=(u_1,u_2,u_3)^{\mathsf T}$ in the box $0\le u_1,u_2<N$, $N\le u_3<2N$. Such a column represents the point $(u_1/u_3,u_2/u_3)$ of the unit square, and three columns forming a matrix $A$ give a triangle of area exactly $|\det A|/(2A_{31}A_{32}A_{33})$. Since the third coordinates are between $N$ and $2N$, a triangle is small only if $|\det A|$ is small. The task becomes: sample many columns so that proportional pairs (repeated points) and triples with $|\det A|\le\tau$ are rare enough to delete, with $\tau$ as large as possible relative to $N^{3}$. [1]

**The first congruence condition: field norms and digits (Section 3).** Give each column an independent uniform label $\xi$ in the finite field $\mathbb F_{r^{d}}$, with $d=41$ fixed and the prime $r$ growing. The columns $(1,\xi,\xi^{2})^{\mathsf T}$ have nonzero determinant whenever the labels are distinct; this is Erdős's parabola again, over a larger field. Taking the field norm down to $\mathbb F_r$ turns the determinant into an alternating polynomial in three groups of coordinates, which the paper writes as a sum of monomial determinants and encodes in one designated coefficient of a determinant whose entries are base-$B$ expansions. Control of carries in a large base, a device the paper traces to the progression-free constructions of Salem and Spencer and of Behrend, isolates that coefficient. Modulo $h=B^{k}$, distinct labels then rule out a small determinant (Lemma 3.3, the determinant obstruction), and independent digit choices with the prescribed residues leave randomness even when labels coincide. [1]

**Mixing and counting lifts (Sections 2 and 4).** A common random matrix of determinant one mixes the three rows modulo $h$ without changing the determinant; conditional on the digit columns the resulting matrix is uniform on a special-linear orbit (Lemma 4.2). The rows of every integral lift lie in a lattice whose index, with the orbit size, is read off a diagonal form (Lemma 4.1). Section 2 supplies lattice counts: successive lengths (Lemma 2.1), points of a plane lattice in a box (Lemma 2.2), covolumes of integral planes (Lemma 2.3), and Proposition 2.5, which bounds the number of lifts with any fixed nonzero determinant. A conditional moment bound (Lemma 4.3) handles singular digit matrices and repeated labels. [1]

**The second congruence condition: determinant zero (Sections 5 and 7).** The fixed-nonzero-determinant count says nothing about determinant zero, where all three rows may lie in one integral plane, which is the collinear case. At an independent prime $q$, residues are chosen from a small portion of an affine quadratic surface with no three points on a line; a carefully restricted random translation excludes short integer relations, and a random invertible linear map allows uniform counting (Section 5, Proposition 5.3). For a singular lifted matrix with distinct projected columns, a primitive integer null vector determines a rank-two row lattice; summing over such vectors, with equal residue columns and low rank modulo $q$ treated separately, counts the collinear projected triples (Proposition 7.1). [1]

**Sampling (Section 6).** The Chinese remainder theorem combines the two congruence conditions and uniform lifting supplies integer columns in the box. Lemma 6.1 bounds proportional pairs; Lemma 6.2 is an exact lifting identity; Proposition 6.3 gives the weighted count of triples at a fixed determinant and Corollary 6.4 the probability that a triple is bad, that is, has pairwise distinct projections and $|\det A|\le\tau$. The exceptional triples require repeated labels, and the probability of a repeated label is the saving. [1]

**Deletion (Section 8).** With $N=(hq)^{10}$, take $2n_r$ samples, $n_r=\lfloor r\sqrt{N^{3}/\tau}\rfloor$, and let $Z$ count violating pairs and triples. Linearity of expectation gives $\mathbb EZ/n_r\ll n_r(hq)^{6}N^{-3}+n_r^{2}(\log 2N)^{2}h/(N^{3}r^{d})$, and both terms tend to zero, the second like $(\log r)^{2}r^{-9}$. For large $r$ choose an outcome with $Z<n_r$, delete one index from each violation, and keep $n_r$ of the survivors. Every retained triple has $|\det A|>\tau$ and hence area at least $\tau/(16N^{3})$, so $\Delta(P_r)\ge\tau/(16N^{3})$ with $n_r$ points. The paper notes that this final step is an elementary alteration argument, with none of the hypergraph independence machinery of 1982. Comparing $\tau/(16N^{3})$ with $n_r$ through the parameter relations ($B=O_k(r^{30})$, $q\le2h^{100}$, $\tau\ge B^{k-1}/3$) yields the exponent $\eta=2/\alpha$ with $\alpha=45435k+16$, along a sequence of primes $r$; Appendix A's elementary prime-interval estimate and an interpolation pass from that sequence to every sufficiently large $n$. [1]

**Where an expert would look first.** At Lemma 3.3, where the norm polynomial's designated coefficient must survive the base-$B$ carries for every triple with distinct labels; at Lemma 4.2 and Proposition 2.5, which together turn the orbit uniformity into a count of lifts at a fixed determinant; at the determinant-zero count of Proposition 7.1, since collinear triples are exactly the case Agama's preprint is said to have missed; and at the parameter bookkeeping of Section 8, where thirty-odd exponents must be consistent for the saving to survive. The Lean statement, which covers a sequence of sizes, is a check of the construction at those sizes but not of the interpolation to every $n$. [1][7]

## Consequences inside mathematics

The result changes the question. For forty years the gap in Heilbronn's problem was between $n^{-2+o(1)}$ below and $n^{-7/6+\epsilon}$ above, and the expectation was that the lower end was the truth; now the exponent $2$ is known not to be the answer, and the true exponent lies strictly inside the interval. The method, sampling with arithmetic congruence conditions and deleting, is different from both the algebraic and the random constructions and may apply to related problems about small determinants. Nothing explicit follows for small $n$, where the exact values of $\Delta(n)$ are known only up to about a dozen points. [1][2]

## Uses outside mathematics

No known direct application. Heilbronn's problem is sometimes mentioned in connection with point placement for numerical integration and for sampling, but those uses concern the quantities at practical sizes, where this result changes nothing, and the paper names no application. [1]

## Has anyone checked it?

We found no named mathematician who has said publicly that they have read or checked the proof. The experts on the problem are the authors of the recent upper bounds, Cohen, Pohoata and Zakharov, and we found no public statement from them; Zakharov's survey predates the release. The Erdős problems entry records the problem. VibeMathed lists the result as Lean-checked with the note "No independent mathematician has checked this yet", and observes that the comparator challenge is not in the release's catalogue. The claims of Ellmann and Agama, which the paper criticises, are not endorsements of it. [1][3][6]

**Machine checking.** The release's Lean scope note for this family links a 68-line comparator statement, `HeilbronnTriangle.lean`, and a formal proof of 243 files. The scope note is explicit that the formalization "constructs an unbounded sequence of sizes $n$ and point sets for which every triangle has area at least $n^{-2+\eta}$, for one fixed $\eta>0$", which is enough to refute the almost-$n^{-2}$ formulation, and that "the paper's statement for every sufficiently large $n$ is broader". The paper is not listed in the catalogue `formalization.yaml` at the pinned commit, despite the "(Lean)" tag on its catalogue entry. We found no outside replay. A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval. [7]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; this paper is not among them. On 26 October it added two manuscripts and more Lean statements; nothing in this family changed. [8]

## Sources

1. OpenAI, "A power improvement in the Heilbronn triangle lower bound", 25 September 2026. Theorem 1.1, Section 1 for the history, the two congruence conditions and the objections to earlier preprints, Sections 2 to 8 and Appendix A for the proof, Section 8 for the explicit $\eta$. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/A-power-improvement-in-the-Heilbronn-triangle-lower-bound-September-25-2026/main.pdf
2. János Komlós, János Pintz and Endre Szemerédi, "A lower bound for Heilbronn's problem", Journal of the London Mathematical Society 25 (1982), 13 to 24. The $(\log n)/n^{2}$ construction. https://doi.org/10.1112/jlms/s2-25.1.13
3. Klaus F. Roth, "On a problem of Heilbronn", Journal of the London Mathematical Society 26 (1951), 198 to 204. Heilbronn's conjecture and Erdős's parabola. https://doi.org/10.1112/jlms/s1-26.3.198
4. Alex Cohen, Cosmin Pohoata and Dmitrii Zakharov, "A new upper bound for the Heilbronn triangle problem", arXiv:2305.18253, 2023. The $n^{-8/7-1/2000}$ bound. https://arxiv.org/abs/2305.18253
5. Dmitrii Zakharov, "Small triangles", survey, Journal of the London Mathematical Society, 2026, as cited by the paper for the almost-$n^{-2}$ formulation.
6. Erdős Problems, Problem 507, and VibeMathed, "Heilbronn's triangle problem: a power-saving lower bound", dataset of 1 November 2026. https://www.erdosproblems.com/507 and https://vibemathed.com/problem/heilbronn-triangle-power-lower-bound
7. OpenAI, Lean scope note for family 191 and the comparator statement `HeilbronnTriangle.lean` at the pinned commit; `lean/formalization.yaml` at the pinned commit, which does not list the paper. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/191.md , https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/HeilbronnTriangle.lean and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/formalization.yaml
8. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
