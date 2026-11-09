---
family: "071"
topic: "Koebe's circle-domain conjecture"
title: "Can every region of the plane be redrawn so that all its holes are round?"
paperTitle: "Koebe's circle-domain conjecture"
claim: "Every nonempty connected open subset of the Riemann sphere is conformally equivalent to a circle domain, a domain whose complementary components are round closed discs or single points, with no restriction on the number or shape of the components. A companion proves that a circle domain whose boundary is conformally removable is rigid: every conformal map onto another circle domain is a Möbius transformation."
status: unreviewed
checked: 2026-10-20
papers:
  - preprints/Koebes-Circle-Domain-Conjecture-September-23-2026/paper.pdf
  - preprints/Removable-Boundaries-and-Rigidity-of-Circle-Domains-September-23-2026/paper.pdf
draft: false
---

The Riemann mapping theorem says that any region of the plane without holes, however jagged, can be mapped onto a round disc by a map that preserves angles. In 1908 Paul Koebe asked for the version with holes: can any region, with any number of holes of any shape, be mapped conformally onto a region whose holes are all round discs or points? He proved it himself for finitely many holes in 1920. In 1993 Zheng-Xu He and Oded Schramm proved it for countably many, in the paper that also launched the modern theory of circle packings, and conjectured that such a circle domain is unique up to Möbius maps exactly when its boundary is "removable". A survey posted on 30 September 2026 by two specialists, Ntalampekos and Younsi, says the problem "remains open after more than a hundred years". On 23 September 2026 OpenAI posted two papers: one claims the full conjecture, for uncountably many holes with no condition at all, and the other claims one direction of He and Schramm's rigidity conjecture. [1][2][3][4]

As of 20 October 2026 no mathematician has said publicly that they have read or checked the proofs. The status on this page is "unreviewed".

## The problem

A domain is a nonempty connected open set; here it lives in the Riemann sphere $\hat{\mathbb C}=\mathbb C\cup\{\infty\}$. A conformal map is a one-to-one holomorphic map, which preserves angles and the shapes of infinitesimal figures. A circle domain is a domain whose complement in the sphere consists of closed round discs and single points; the complement may be empty. [1]

**Koebe's Kreisnormierungsproblem (1908).** Is every domain in $\hat{\mathbb C}$ conformally equivalent to a circle domain? [1][4]

The companion question. He and Schramm conjectured that a circle domain is rigid, meaning every conformal map onto another circle domain is a Möbius transformation, if and only if its boundary is conformally removable, meaning every homeomorphism of the sphere that is conformal off the boundary is Möbius. They proved rigidity for countably connected domains and for boundaries of $\sigma$-finite length; Rajala showed in 2025 that the "only if" direction is false. The "if" direction, removable implies rigid, remained. [2]

<!-- uruk:visual-note
A visual for this page is excellent: a domain with many irregular holes morphing under a conformal map into one with round holes, with a conformal grid carried along so that angles are visibly preserved; then a Cantor-set-of-circles domain to show what "uncountably many holes" means. Circle packings are the discrete cousin and make a natural second frame.
-->

## Why it stayed open

Why uncountably many holes are hard. The natural approach exhausts the domain by finitely connected ones, maps each onto a finite circle domain by Koebe's theorem, and takes a limit. Two things can go wrong in the limit. A hole that was a round disc at every finite stage can grow extra material, a "protrusion", as the holes accumulate; and the uncountably many holes that were never among the finitely many followed can fail to collapse to points. Rajala showed in 2025 that arbitrary exhaustions really can fail to have circle-domain limits. He and Schramm's countable case and Schramm's transboundary extremal length controlled these failures when the holes can be listed; the uncountable case, where the complement may be a Cantor set of circles with no regularity or separation, resisted. [1]

## What OpenAI claims

**Theorem** (circle-domain uniformization; OpenAI, 23 September 2026). Every nonempty connected open set $G\subset\hat{\mathbb C}$ is conformally equivalent to a circle domain. [1]

**Theorem** (companion; rigidity). If $\Omega,\Omega'\subset\hat{\mathbb C}$ are circle domains, $\partial\Omega$ is conformally removable, and $f:\Omega\to\Omega'$ is a conformal equivalence, then $f$ is the restriction of a Möbius transformation. The complementary components may have arbitrary cardinality, and no boundary extension of $f$ is assumed. [2]

What these do and do not say. The first theorem imposes no geometric condition on the complement, which may have uncountably many components with no regularity or separation. Combined with a 2025 exhaustion theorem of Ntalampekos and Rajala, the paper states an unconditional approximation: every proper domain has an exhaustion by domains bounded by finitely many Jordan curves whose normalized circle-domain uniformizations converge to a conformal map onto a circle domain. The theorem says nothing about uniqueness of the model in general; that is what rigidity is about, and the companion proves it only under removability, which is the direction not refuted by Rajala. [1][2]

## How the claimed proof goes

What follows is a map of the main paper's argument from its introduction and from the statements of its main theorems in Sections 2 to 8. It is not a check of the details. [1]

**The idea.** Decide in advance, by analytic tests chosen on the original domain $G$, what must happen to every hole in the limit; then run finite circle-domain uniformization in a way that transfers those tests to the finite approximations without changing the conformal structure on a growing core; and finally read off from the surviving tests that unmarked holes collapse to points and marked holes become exactly their followed discs. The analytic machinery is transboundary extremal length after Schramm, with its duality to probability laws on paths proved in the generality of measure families. [1]

**The quotient sphere (Section 2).** Collapse every complementary component of $G$ to a point. By Moore's decomposition theorem the quotient $X$ is a topological sphere and the collapsed complement $B=X\setminus G$, the "dust", is compact and totally disconnected (Lemma 2.1). Small disks in $X$ around dust points with contours in $G$ (Lemma 2.2) give coordinates, bands and a compatibility condition for tests, and the geometry of generic level unions of test functions is worked out (Lemmas 2.5 and 2.6). The topology of $X$ is used to approach components while the original conformal structure on $G$ is kept for lengths and energies. A countable set $S$ of components will be marked; for marked $b$ the finite approximations supply a round disc $D_b$ inside the limiting component $K_b(f)$, and the two things to prove are that $K_b(f)$ is a point for unmarked $b$ and $K_b(f)=D_b$ for marked $b$. [1]

**Finite transfer (Section 3).** The tests are real functions on $G$, or functions with additive period one around a selected component, each with finite Dirichlet energy and a square-summable bound on its oscillation at the dust points, satisfying a compatibility condition that controls how the level sets of a new test meet continua formed from earlier levels. Theorem 3.1, Finite Transfer: given a finite compatible list $u_1,\dots,u_m$, a finite set $F\subset B$ containing all singular points, a compact core $K_0\subset G$, a dust-disk cover and $\varepsilon>0$, there are a larger smooth core $K$, finitely many terminal disks $T_s$ indexed by a finite $S\subset B$ containing $F$, and a smooth metric $g$ on the sphere agreeing with the spherical metric near $K$, such that the tests extend to the finite completion $Q=\hat{\mathbb C}\setminus\bigcup T_s$ with the original values on $K$, exact periods, and at most $\varepsilon$ additional energy and excess boundary oscillation. The conformal structure may change outside the core, but the cores exhaust $G$, so the limiting map is conformal in the original structure. Normalized compactness (Lemma 3.2) and identification and trapping of the ends (Lemma 3.3) produce the limiting conformal map $f$ and the component correspondence from Koebe's finite theorem applied to the completions. [1]

**Barriers and laws (Sections 4 and 5).** The tests come from a boundary alternative. Section 4 constructs compatible barriers from tagged paths that may run through complementary components, with tags recording portions lying in previously chosen level sets and explicit incidence bounds on the remaining boundary contacts; paths are cut, joined and coded Borel-measurably (Lemmas 4.4 and 4.5), concatenated through collars (Lemma 4.7), and one shrinking level of small jumps can be removed (Lemma 4.8), which lets paths be spliced near their ends without losing the estimates (Theorem 4.3, the compatible barrier lemma). Section 5 proves the other horn: Theorem 5.1, the positive-law alternative, says that if no new compatible barrier coordinate with energy and boundary oscillation below $\beta$ exists, then there is a probability law $\mu$ on path codes whose mean occupation density is in $L^{2}(G)$, whose hit counts are square-summable on the whole dust $B$, and whose tuple distributions are absolutely continuous, with norms depending only on $\beta$. The proof is a duality for Borel families of measures (Lemma 5.2), Fuglede's modulus in the probability form of Ambrosio, Di Marino and Savaré, first for each prescribed countable set of boundary tests and each atomless test measure (Lemma 5.3), followed by a fusion argument (Lemma 5.4) that produces one law controlling the entire, possibly uncountable, dust. [1]

**Collapsing the unmarked components (Section 6).** Independent path laws are made to avoid domain points and their diffuse dust intersections are removed (Lemmas 6.1 and 6.2). A four-path crossing argument (Theorem 6.3) shows that only countably many ends can lack small barriers. Selecting countably many barriers gives the countable marked set $S\subset B$, and Theorem 6.5 shows that every $K_b(f)$ with $b\notin S$ collapses to a point, a conclusion that survives every later countable compatible extension of the tests, with the cost accounted by payment along parallel lines (Lemma 6.4). [1]

**Excluding protrusions at marked components (Section 7).** For a marked $b$, lift simple arcs around the end and average their integer indices to produce period-one tests, the "stream coordinates", with small energy and small oscillation away from the selected end (Lemma 7.2). A Stokes estimate (Lemma 7.3) turns these bounds into an upper bound on a boundary integral of the transferred stream; a protrusion of $K_b(f)$ beyond the disc $D_b$ would force a strictly larger lower bound (Lemma 7.4, local exclusion of a bad pair). Each test excludes a neighbourhood of a possible pair $(f,D_b)$, and second countability permits a countable selection excluding all pairs with $D_b\ne K_b(f)$. Theorem 7.5, retained-test transfer and selection, runs the whole construction with an arbitrary prescribed countable compatible list retained from the outset, and a corollary gives a simple sufficient condition, that the planar image of the dust under a pair of tests has zero area, for exact agreement on exhausting cores with vanishing tail energy; this quantitative form is the analytic input the rigidity companion uses. [1][2]

**The geometric consequence (Section 8).** From Luo and Wu's theorem on hyperbolic convex hulls, every complete hyperbolic surface of genus zero is realized intrinsically by the boundary of a convex hull in hyperbolic space whose ideal set has round-disc or point components. [1]

Where would an expert look first? At the Finite Transfer theorem, where the chosen tests have to survive a change of conformal structure outside the core with exact periods; at the fusion lemma of Section 5, which turns countably many path laws into one controlling an uncountable dust; at the four-path crossing argument that limits the ends without barriers to countably many; and at the Stokes estimate and bad-pair exclusion that forbid protrusions. [1]

## Consequences inside mathematics

If the proofs hold, Koebe's 1908 problem is settled in full, extending He and Schramm's 1993 theorem from countably to uncountably many boundary components, and one half of the He-Schramm rigidity conjecture is established, the half that Rajala's 2025 counterexample left standing. The exhaustion approximation gives a concrete way to compute the circle-domain model of any domain. The transfer of analytic tests across finite uniformizations is a technique that may apply to other uniformization problems. [1][2]

## Uses outside mathematics

No known direct application.

Conformal maps are used in engineering and in mapmaking, and circle packings, the discrete version of this theory, have been used in brain mapping and mesh generation; the uncountably connected case of Koebe's problem is a question about the limits of the theory rather than a tool. [3]

## Has anyone checked it?

We found no named mathematician who says they are reading or checking either paper, and no public comment from Bonk, Rohde, Ntalampekos, Rajala or Younsi, whose work is cited. VibeMathed records no check by an independent mathematician. [5]

**Machine checking.** The release's catalogue marks this family as formalized and its Lean scope note links a statement `KoebeCircleDomains.lean` of 79 lines, covering both the circle-domain theorem and the rigidity theorem. That file is not listed in the catalogue `formalization.yaml` at the pinned commit, so no complete formal proof of either theorem is presented there despite the tag. We found no outside replay. A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval. [6]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; neither paper in this family is among them. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [7]

## Sources

1. OpenAI, "Koebe's circle-domain conjecture", 23 September 2026. The theorem, the history, the exhaustion corollary and the proof overview. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Koebes-Circle-Domain-Conjecture-September-23-2026/paper.pdf
2. OpenAI, "Removable boundaries and rigidity of circle domains", 23 September 2026. Abstract, the theorem and the rigidity-and-removability section. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Removable-Boundaries-and-Rigidity-of-Circle-Domains-September-23-2026/paper.pdf
3. Zheng-Xu He and Oded Schramm, "Fixed points, Koebe uniformization and circle packings", Annals of Mathematics 137 (1993), 369-406. https://doi.org/10.2307/2946541
4. Dimitrios Ntalampekos and Malik Younsi, "Conformal rigidity: progress and challenges", arXiv:2610.00560, 30 September 2026. Conjecture 1.3 and the sentence quoted. https://arxiv.org/abs/2610.00560
5. VibeMathed, "Koebe circle domain conjecture", read 20 October 2026. https://vibemathed.com/problem/koebe-circle-domain-conjecture
6. OpenAI, Lean scope note for family 071 and the comparator statement `KoebeCircleDomains.lean` at the pinned commit, with `lean/formalization.yaml`, which does not list it. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/071.md , https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/KoebeCircleDomains.lean and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/formalization.yaml
7. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
