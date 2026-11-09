---
family: "166"
topic: "Distinct distances in higher dimensions"
title: "How few different distances can n points in space have?"
paperTitle: "The higher-dimensional Erdős distinct-distances conjecture"
claim: "For every fixed integer d ≥ 3 there is a constant c_d > 0 such that every set of n ≥ 2 distinct points in R^d determines at least c_d n^(2/d) distinct distances. The exponent is optimal, attained by the integer grid, so this is the higher-dimensional Erdős distinct-distances conjecture with a constant factor."
status: unreviewed
checked: 2026-10-20
papers:
  - preprints/The-higher-dimensional-Erdos-distinct-distances-conjecture-September-23-2026/paper.pdf
draft: false
---

Place $n$ points in space and measure every distance between two of them. How few different values can you get? Paul Erdős asked this in 1946 and observed that a cubic grid of side $t$, with $n=t^{3}$ points, has only about $t^{2}=n^{2/3}$ distinct distances, since every squared distance is an integer below $3t^{2}$; in dimension $d$ the grid gives $n^{2/d}$. He conjectured that nothing does better. In the plane the question became one of the most famous in discrete geometry, and Guth and Katz settled it up to a logarithm in 2015 with polynomial partitioning. In three and more dimensions the known lower bounds were far from the grid: Clarkson and others got close to $\sqrt n$ in 1990, Aronov, Pach, Sharir and Tardos reached $n^{77/141}$, Solymosi and Vu built recurrences giving $n^{0.5643}$, and in August 2026 Tidor, Yu and Zakharov reached $n^{2/3-o(1)}$ in three dimensions, the grid exponent up to a subpolynomial loss. An earlier manuscript claiming the full conjecture had been withdrawn by its author. On 23 September 2026 OpenAI posted a paper claiming the conjecture with a constant factor in every dimension $d\ge3$. [1][2][3]

As of 20 October 2026 no mathematician has said publicly that they have read or checked the proof. The status on this page is "unreviewed".

## The problem

For a finite set $P\subset\mathbb R^{d}$, let $\Delta(P)=\{|p-q|:p\ne q\in P\}$ be its set of distinct distances. [1]

**The higher-dimensional Erdős distinct-distances conjecture.** For every fixed $d\ge3$ there is $c_d>0$ such that $|\Delta(P)|\ge c_dn^{2/d}$ for every $n$-point set $P\subset\mathbb R^{d}$. [1]

Why the constant matters. The paper is explicit that $n^{2/d-o(1)}$ does not give the theorem: the ratio $|\Delta(P)|/n^{2/d}$ could still tend to zero more slowly than every negative power of $n$. A proof with a constant must rule out every such slowly failing sequence, without first fixing a power saving. [1]

<!-- uruk:visual-note
A visual for this page is the grid: $t^{3}$ points in a cube with their distances tallied, the count growing like $n^{2/3}$; next to it a random set of the same size with almost $\binom n2$ distinct distances; and the ladder of exponents in three dimensions over thirty-five years, $1/2$, $77/141$, $0.5643$, $3/5$, $2/3-o(1)$, $2/3$. Our week-1 page on planar unit distances is the sibling problem. [1]
-->

## Why it stayed open

What was known. The grid shows the exponent $2/d$ cannot be improved; in the plane the grid gives $n/\sqrt{\log n}$, so the planar problem has a different conjectural order, and Guth and Katz's $n/\log n$ is the state of the art there. In three dimensions the sequence of lower bounds ran from $n^{1/2}$ up to Tidor, Yu and Zakharov's $n^{2/3-o(1)}$; inserting their bound into Solymosi and Vu's recurrences gives $n^{8/17-o(1)}$ in dimension four and $n^{3/8-o(1)}$ in dimension five, still short of $1/2$ and $2/5$. Bardwell-Evans and Sheffer had reduced the higher-dimensional problem to incidences of $(d-1)$-flats in $\mathbb R^{2d-1}$ and identified the obstacles: the flats are structurally constrained and may concentrate in algebraic varieties. [1][3]

## What OpenAI claims

**Theorem 1.1** (OpenAI, 23 September 2026). For every integer $d\ge3$ there is a constant $c_d>0$ such that every finite set $P\subset\mathbb R^{d}$ of $n\ge2$ distinct points satisfies

$$
|\Delta(P)|\ge c_dn^{2/d}.
$$

No assumption is made on the position, spacing or concentration of the points. [1]

What this does and does not say. The constant $c_d$ is not computed. The planar case is not addressed; it is the two-dimensional input to the induction, supplied by Guth and Katz. Pinned versions, counting distances from a single point, are a different problem. [1]

## How the claimed proof goes

What follows is a map of the paper's argument from its introduction, which gives a four-step overview, and from the statements of its main sections. It is not a check of the details. The paper is long, with two substantial appendices. [1]

**Why the constant matters, and the minimal counterexample.** An estimate $|\Delta(P)|\ge n^{2/d-o(1)}$ does not give the theorem, since the ratio $|\Delta(P)|/n^{2/d}$ could tend to zero more slowly than any power. The paper therefore argues in the least dimension $d\ge3$ where the theorem could fail, writes $N=|P|$, $B=N^{1/d}$, $A=B^{2}$ and $M=1+|\Delta(P)|$, and supposes a sequence with $N\to\infty$ and $M/A\to0$. The lower-dimensional theorem limits how many points lie in any proper affine flat (Lemma 2.1, occupancy of proper flats), but it neither prevents concentration on more general algebraic varieties nor singles out one polynomial degree at which to study it. The algebraic tools are Hilbert function estimates of Chardin and Chardin-Philippon, which measure how many independent polynomial conditions a set can impose, and Walsh's approximate complete intersections, which cut out an irreducible variety as a component of equations whose degree product is controlled by its degree (Theorem A.2). [1]

**Step 1: directions that admit interpolation (Section 2).** For distinct points write $\pi_p(q)=[q-p]$ for the projective direction. The goal is a positive fraction of unordered pairs, selected symmetrically at both endpoints, such that at each centre $p$ homogeneous polynomials of degree $\lfloor A\rfloor$ can prescribe arbitrary values at the selected displacement vectors, that is, the evaluation vectors are linearly independent (Propositions 2.2 and 2.3, independent evaluations in every star). The obstruction would be a collection $C_p$ of projective curves at each centre, each spanning at most a plane, with total degree $o(N/A)$, such that almost every pair has $\pi_p(q)\in C_p$ or $\pi_q(p)\in C_q$; the union of the lines through $p$ is a cone of small degree, hence "sparse cones". Theorem 6.1 rules this out, including the choice of endpoint for each pair; greedy removal of curves with too many directions then leaves pairs with controlled concentration on every variety, and a maximal symmetric selection gives interpolation at the cost of a fixed fraction of pairs. [1]

**Step 2: excluding sparse cones at all scales (Sections 3 to 6).** This is the central part. Section 5 divides the point set according to how successive polynomial equations cut down the dimension of the varieties containing its points, testing degrees in windows $[Be^{-s},Be^{s}]$ for several widths $s$ rather than at one fixed power of $N$ (Proposition 5.1, multiscale partition). Points isolated by equations of small degree form a core handled directly; each remaining piece carries a chain of proper hypersurface cuts ending in isolated points, whose testing degrees form a scale profile (Propositions 5.2 and 5.3). Between cuts the dimension is constant and Hilbert-function estimates give a lower bound on the growth of polynomial restriction rank (Lemma 3.6, upper and lower component ranks), while Bézout bounds the degrees and point counts of the intervening components. The comparison uses labels $(p,\pi_p(q))$: at a fixed centre, sparse-cone coverage puts the directions on curves of small total degree, limiting their rank, and the profiles give an incompatible lower bound for a positive fraction of pairs (Lemma 6.3, common-window label rank; Lemma 6.7, strict rank margin). Radial projection can identify several components or several points on one component; Section 4 controls this by secant geometry (Lemma 4.1 and Proposition 4.3, terminal-curve deletion), and Proposition 6.5 bounds the resulting degree loss in separated windows. Two limiting cases have no strict margin, the outermost degree window and the last one-dimensional stage for narrow centre windows, and Section 6 supplies endpoint arguments for both; this is what permits an arbitrarily slow limit $M/A\to0$. [1]

**Step 3: equal distances as intersections of flats (Section 2, Section 7, Appendix A).** Take a generic rotated copy $Q$ of $P$. For $(p,q)\in P\times Q$ consider the affine flat $F_{p,q}=\{(Z,c):Z(p+q)/2+c=(p-q)/2\}$ with $Z$ skew-symmetric, whose coordinates identify with skew forms on $\mathbb C^{d+1}$; this is the Elekes-Sharir rigid-motion viewpoint that Guth and Katz used in the plane, in the flat form of Bardwell-Evans-Sheffer and of Tidor, Yu and Zakharov. Join $(p,q)$ to $(p',q')$ when both pairs were selected and $|p-p'|=|q-q'|$; Cauchy-Schwarz gives $\Omega(N^{4}/M)$ edges, and on $F_{p,q}$ the intersection with a neighbour is the flat $Z(u+w)=u-w$. Interpolation makes these local flats distinct with polynomial separators of degree $O(A)$. Appendix A proves uniform concentration bounds for such evaluation flats (Theorem A.1), in the full skew-form space and inside one pair flat; its exceptional parameter family corresponds to many matches under one rigid motion. For $d\ge4$ that family is bounded by the total number of points; for $d=3$, Section 7 bounds $\sum_g|gP\cap Q|^{2}$ over motions with at least $CA$ matches by $O(N^{4}/A)$ (Theorem 7.1, very rich motions), using the real incidence estimates of Appendix B, which reproves Szemerédi-Trotter, Guth-Katz rich lines and the planar distinct-distances bound. Removing those edges costs $o(N^{4}/M)$, and after pruning, every retained flat has a number of neighbours that, divided by $A^{d-1}$, tends to infinity (Lemmas 2.4 and 2.5, global and local concentration). [1]

**Step 4: sample once and compare ranks (Proposition 2.6).** Sample the retained pair flats independently with a small fixed probability. With positive probability the sample is small enough that global concentration forces the whole family to impose more independent polynomial conditions in degree $\lfloor A\rfloor$ than the sample does, while every retained flat still has more than $CA^{d-1}$ sampled neighbours. So some polynomial of degree at most $\lfloor A\rfloor$ vanishes on every sampled flat but not on some retained flat $F$, and its restriction to $F$ vanishes on more than $CA^{d-1}$ neighbour flats, violating local concentration. The sample uses one fixed probability and all constants are uniform, which is where the positive constant $c_d$ comes from. [1]

Where would an expert look first? At the multiscale partition and the rank comparison of Sections 5 and 6, which convert a subpolynomial bound into a constant and which the paper calls central; at the two endpoint cases with no strict margin; at the uniform concentration theorem for skew-form flats and its exceptional families in Appendix A; and, for $d=3$, at the very-rich-motions bound of Section 7. The paper's own footnote records that an earlier human manuscript claiming this theorem was withdrawn because its key theorem was incorrect, which is a reason for care. [1]

## Consequences inside mathematics

If the proof holds, Erdős's 1946 conjecture is settled in every dimension three and up, and the three-dimensional progress of the last two years is overtaken by a constant-factor theorem; the planar problem, with its logarithmic gap, remains the one open case. The concentration machinery for flats in algebraic varieties is a tool for other incidence problems. [1]

## Uses outside mathematics

No known direct application.

Distinct-distance counts appear in the theory of point-set reconstruction from distance data, as in molecular structure determination from interatomic distances, but those problems concern recovering positions, not the minimal number of distances, and the theorem does not bear on them. [1]

## Has anyone checked it?

We found no named mathematician who says they are reading or checking this paper, and no public comment from Sheffer, Tidor, Yu, Zakharov, Guth, Katz or Solymosi, whose work it builds on. VibeMathed records no check by an independent mathematician. [4]

**Machine checking.** None. Family 166 has no Lean scope note and no comparator statement in the release. [5]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; this paper is not among them. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [6]

## Sources

1. OpenAI, "The higher-dimensional Erdős distinct-distances conjecture", 23 September 2026. Theorem 1.1, the historical context, "Why the constant factor matters" and the proof overview. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/The-higher-dimensional-Erdos-distinct-distances-conjecture-September-23-2026/paper.pdf
2. Larry Guth and Nets Hawk Katz, "On the Erdős distinct distances problem in the plane", Annals of Mathematics 181 (2015), 155-190. https://doi.org/10.4007/annals.2015.181.1.2
3. Jonathan Tidor, Hung-Hsun Hans Yu and Dmitrii Zakharov, "The Erdős distinct distances problem in R^3", arXiv:2608.14454, August 2026. https://arxiv.org/abs/2608.14454
4. VibeMathed, "Erdős distinct distances in higher dimensions", read 20 October 2026. https://vibemathed.com/problem/erdos-distinct-distances-higher-dimensions
5. OpenAI, `lean/docs/` and `lean/formalization.yaml` at the pinned commit, which contain no entry for family 166. https://github.com/openai/math/tree/4eaee87548250b2682affda7d05d947c05554bae/lean/docs
6. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
