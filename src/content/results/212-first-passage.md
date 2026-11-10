---
family: "212"
topic: "Geodesics in planar first-passage percolation"
title: "In a random landscape, can a shortest path run forever in both directions?"
paperTitle: "No bigeodesics in planar first-passage percolation"
claim: "In first-passage percolation on the square lattice with independent identically distributed nonnegative edge weights with no atoms, if the minimum of four independent weights has finite second moment, then almost surely there is no doubly infinite geodesic: no bi-infinite path all of whose finite segments are shortest paths. All bigeodesics are excluded in one event, with no assumption on the limit shape. A companion proves that for exponential edge weights the limit shape is strictly convex with a C^1 boundary, and that the time-constant norm is differentiable for every Gamma edge-weight law."
status: unreviewed
checked: 2026-10-20
papers:
  - preprints/No-bigeodesics-in-planar-first-passage-percolation-September-24-2026/main.pdf
  - preprints/Strict-convexity-and-differentiability-of-the-planar-exponential-first-passage-limit-shape-September-24-2026/main.pdf
draft: false
visual: fastest-routes
---

Give every edge of a square grid a random travel time and ask how long it takes to get from one point to another along the fastest route. This is first-passage percolation, introduced by Hammersley and Welsh in 1965 as a model of fluid seeping through rock, and it is the simplest random metric there is. Its fastest routes, the geodesics, behave like straight lines on a large scale but wiggle randomly, and a basic question about them was attributed by Kesten to Furstenberg: can there be a geodesic that extends infinitely far in both directions, a "bigeodesic", every finite piece of which is a fastest route? In the plane the answer is conjectured to be no, for any continuous distribution of edge times. The conjecture is tied to the geometry of the limit shape, the asymptotic shape of the set reachable in time $t$, about which almost nothing is known rigorously: it is not even known to be strictly convex for any nontrivial distribution. Partial results by Licea and Newman, Damron and Hanson, Alexander and others excluded bigeodesics in fixed directions or under curvature assumptions on the limit shape that nobody could verify. On 24 September 2026 OpenAI posted two papers: one claims that there are no bigeodesics at all, under a mild moment condition and with no assumption on the limit shape; the other claims that the limit shape for exponential edge times is strictly convex and smooth. [1][2][3]

As of 20 October 2026 no mathematician has said publicly that they have read or checked the proofs. The status on this page is "unreviewed".

## The problem

Give the edges $e$ of $\mathbb Z^{2}$ independent weights $t_e\ge0$ with a common law $G$. The passage time $T(x,y)$ is the infimum over nearest-neighbour paths from $x$ to $y$ of the sum of the weights of their edges. A geodesic is a path achieving $T$ between every pair of its vertices. A bigeodesic is a sequence $(v_i)_{i\in\mathbb Z}$ of distinct adjacent vertices with $\sum_{k=i}^{j-1}t_{\{v_k,v_{k+1}\}}=T(v_i,v_j)$ for every $i<j$. [1]

**The planar no-bigeodesics conjecture (Furstenberg's question, via Kesten; Damron and Hanson's Conjecture 1).** For independent continuous edge weights on $\mathbb Z^{2}$, almost surely there is no bigeodesic. [1]

<!-- uruk:visual-note
A visual for this page is the random metric itself: a grid with random edge times, the ball of radius $t$ growing into the limit shape, geodesics from a point fanning out and coalescing into a tree, and a search for a two-sided geodesic that always fails; for the companion, the simulated limit shape for exponential weights with its smooth strictly convex boundary. The papers contain six TikZ figures of grids, sectors and Busemann labels.
-->

## Why it stayed open

What was known. Licea and Newman proved in 1996 that geodesics in almost every fixed direction coalesce, which excludes bigeodesics whose two end directions are both prescribed in a full-measure set. Newman showed, under exponential moments and a uniformly curved limit shape, that every one-sided geodesic has a direction; Damron and Hanson excluded one end in sectors under local differentiability of the limit shape; Alexander excluded all bigeodesics under exponential moments, uniform curvature and quantitative fluctuation bounds. The catch is that none of these shape assumptions is known for a single distribution; Auffinger, Damron and Hanson's survey makes the point that the limit shape's strict convexity and differentiability are themselves open. Ahlberg and Hoffman built a structural theory of random coalescing geodesics that attaches a linear Busemann function to every geodesic ray without any shape assumption, giving uniqueness and coalescence for each fixed asymptotic slope. [1]

Why that was not enough. A bigeodesic, if one existed, could pick an exceptional slope that depends on the random environment; almost-sure uniqueness for each fixed slope does not rule out simultaneous failure at some random slope. The paper names this quantifier gap as the thing to be closed. [1]

## What OpenAI claims

**Theorem** (no bigeodesics; OpenAI, 24 September 2026). Suppose $G$ has no atoms and, for independent $X_1,\dots,X_4$ with law $G$,

$$
\mathbb E\bigl[\min\{X_1,X_2,X_3,X_4\}^{2}\bigr]<\infty.
$$

Then with probability one there is no bigeodesic. The conclusion excludes all bigeodesics in a single event; $G$ may be singular continuous or have bounded support, $\mathbb E t_e$ may be infinite, and no differentiability, strict convexity or curvature of the limit shape is assumed. [1]

**Theorem** (companion). For independent exponential edge weights the limit shape is strictly convex and has a $C^{1}$ boundary; for every Gamma edge-weight law with positive shape and rate, the time-constant norm is differentiable away from the origin. [2]

What these do and do not say. The first theorem settles the conjecture in the class defined by the minimum-of-four moment condition, which is satisfied by every bounded law and by the exponential law; the paper says it "does not assert the moment-free formulation". The companion is the first strict convexity result for a nontrivial law, but only for exponential weights. [1][2]

## How the claimed proof goes

What follows is a map of the first paper's argument from its introduction, which lays out the whole route, with the main statements of Sections 2 to 8. It is not a check of the details. [1]

**The statement.** Theorem 1.1: if the edge-weight law $G$ has no atoms and $\mathbb E[\min\{X_1,\dots,X_4\}^{2}]<\infty$ for four independent weights, then almost surely there is no doubly infinite self-avoiding path all of whose finite segments are geodesics. The conclusion excludes all bigeodesics in one probability-one event, so an end direction may depend on the environment; $G$ may be singular or have bounded support, the mean may be infinite, and no differentiability, strict convexity or curvature of the limit shape is assumed. The paper names the quantifier issue that earlier inputs leave open: almost-sure uniqueness of geodesics for each fixed direction does not give simultaneous uniqueness at every environment-dependent direction, and a bigeodesic could select an exceptional one. [1]

**Labels (Section 2).** Every geodesic ray $p$ has a Busemann function $B_p(x,y)=\lim_j(T(x,p_j)-T(y,p_j))$, which by Ahlberg and Hoffman's theory, with the shape theorem (Theorem 2.3), has a linear asymptote $\rho_p$, its label; the two ends of a bigeodesic have opposite labels. A countable reduction leaves bigeodesics whose upper labels lie in one compact sector of the dual unit circle, ordered by the horizontal coordinate $r(\rho)=\rho(e_1)$, with width $W$. Section 3 uses planar ordering and fixed bounding rays to confine every ray in the sector to a deterministic cone (Proposition 3.4, uniform confinement of all rays). [1]

**The budget (Section 5).** The contradiction is an accounting identity. On a horizontal grid of spacing $l$, sites are marked by selecting bigeodesics in environments where finitely many edge weights have been raised, so that a marked path has acquired an extra cost of at least $M$ on an initial portion. The label sector is cut into bins with deterministic endpoints, and the selected arms and the comparison rays are required to satisfy common cone bounds. When the marks in each bin are well separated, comparing with rays at the bin endpoints charges the increase to the bin's width, Busemann increments telescope along the line, and the result is

$$
Mq\le lW,
$$

where $q$ is the common probability that a site is marked (Proposition 5.2, the label budget; Proposition 5.4 counts expected labels at an edge). The rest of the proof constructs marks with $q$ bounded away from zero and $l$ fixed while $M$ grows without bound. [1]

**Raising weights without losing the marks (Section 7).** Finitely many edge weights are raised in a widening region around each site, a low-to-high replacement that is an instance of the bounded-density Bernoulli perturbations of Bates and Chatterjee, with all densities relative to the original law even when it is singular. At height $h$ the replacement scale is $\delta_h=\eta/((h+2)\log(h+2))$: there are order $h$ edges at that height, so the convergent sum $\sum h\delta_h^{2}$ keeps the change of law uniformly small, while the divergent sum $\sum\delta_h$ permits an arbitrarily large gain along a path. The path must be chosen in the raised environment, not in advance, and conditioning on that output gives an explicit product law for the hidden raises along it (Proposition 7.4, marks with an arbitrary toll). An appendix replaces an expectation step by a boundary comparison for a fixed functional (Proposition A.3), so that no integrability of restricted passage times is needed, which is what admits infinite-mean laws. [1]

**Separating labels without widening the grid (Sections 4, 6 and 7).** The budget needs the marks in a bin to be separated, and that needs distinct marks to have distinct labels. The key simultaneous statement is that two bigeodesics with the same label have the same pair of Busemann functions. The labels that admit branching or distinct Busemann functions form a countable set in each environment (Proposition 4.2); resampling complementary half-planes independently transfers rays across a distant cut while preserving their exact labels and finite witnesses of exceptionality, and countability with independence gives coalescence at the opposite end of every exceptional label (Proposition 4.5). A one-edge version of the budget and a finite-tree count exclude forks (Proposition 6.1), yielding the common Busemann pair without intersecting uncountably many fixed-label events. To apply this, all sites share the same raised samples; passing from two perturbation regions to their union leaves both selected paths and costs unchanged, and $l$ is chosen once so that a strictly raised edge near one site lies outside the other's region. If two marked sites had the same label, their common Busemann pair would produce a detour through that edge with arbitrarily small excess in the union metric, and returning to the individual metric would make the detour strictly cheaper than the selected geodesic. Hence distinct marked sites have distinct labels (Proposition 7.6). [1]

**The order of limits (Section 8).** For each fixed gain $M$, refining the label partition separates every mark from the finitely many neighbours within the deterministic separation the budget requires, and the probability lost tends to zero as the partition is refined; only then is $M$ increased, with the grid spacing fixed, so $Mq\le lW$ fails. No quantitative separation of the random labels and no rate of coalescence is required. [1]

**The companion.** The second paper proves, for exponential weights, strict convexity of the limit shape and, for Gamma weights, differentiability (Theorems 1.1 and 1.2), by a long argument through localized crossings, characteristic lengths, calibrated "roads" and their improvement (Proposition 15.2, contraction in the original road class), and Section 17 draws geodesic consequences. The bigeodesic theorem does not depend on it. [2]

Where would an expert look first? At the label-budget proposition and the cone bounds under which comparison rays are chosen; at Proposition 7.4, the construction of marks with $q$ bounded below as $M\to\infty$ at the replacement scale $\delta_h$; at the coalescence and no-fork arguments of Sections 4 and 6, which are how the paper handles the environment-dependent labels it identifies as the gap in earlier work; and at the appendix's boundary comparison for infinite-mean laws. [1]

## Consequences inside mathematics

If the proofs hold, Furstenberg's question is answered in the plane for every continuous edge law with a mild moment condition, with no appeal to unproved properties of the limit shape; and, separately, the exponential limit shape is the first for which strict convexity and differentiability are known, which are the hypotheses many older theorems about geodesics required. The moment-free statement and higher dimensions, where bigeodesics are expected to exist in high enough dimension, remain open. [1][2]

## Uses outside mathematics

First-passage percolation models the spread of fluids in porous media, of infections in a population, of rumours in a network and of growing crystals; its geodesics are the fastest infection routes. The theorem concerns the infinite-volume structure of those routes and does not change how the models are used. [1]

## Has anyone checked it?

We found no named mathematician who says they are reading or checking these papers, and no public comment from Damron, Hanson, Hoffman, Ahlberg, Newman or Peled, whose work they build on. VibeMathed records no check by an independent mathematician. [4]

**Machine checking.** The release's Lean scope note links two statements for the companion: `PlanarFirstPassage.lean`, differentiability of the exponential limit shape, which is in the catalogue `formalization.yaml`, and `GammaPassage.lean`, differentiability for Gamma laws, which is not. Strict convexity is outside both. The no-bigeodesics theorem, the headline of this page, has no Lean statement at all. A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval. [5]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; neither paper in this family is among them. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [6]

## Sources

1. OpenAI, "No bigeodesics in planar first-passage percolation", 24 September 2026. The theorem, the background and "The argument". Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/No-bigeodesics-in-planar-first-passage-percolation-September-24-2026/main.pdf
2. OpenAI, "Strict convexity and differentiability of the planar exponential first-passage limit shape", 24 September 2026, abstract. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Strict-convexity-and-differentiability-of-the-planar-exponential-first-passage-limit-shape-September-24-2026/main.pdf
3. Antonio Auffinger, Michael Damron and Jack Hanson, "50 years of first passage percolation", University Lecture Series 68, American Mathematical Society, 2017; arXiv:1511.03262. The survey of the limit-shape and bigeodesic problems. https://arxiv.org/abs/1511.03262
4. VibeMathed, "No bigeodesics in planar first-passage percolation", read 20 October 2026. https://vibemathed.com/problem/planar-fpp-no-bigeodesics
5. OpenAI, Lean scope note for family 212 and `lean/formalization.yaml` at the pinned commit. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/212.md and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/formalization.yaml
6. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
