---
family: "096"
topic: "The Gaussian propeller conjecture"
title: "Which way of cutting a Gaussian cloud into pieces spreads its centres of mass furthest?"
paperTitle: "The Gaussian propeller bound in every dimension"
claim: "For every finite measurable partition of R^d, in every dimension d and with any number k of cells, the sum of the squared lengths of the cells' Gaussian first moments is at most 9/(8π). For d ≥ 2 and k ≥ 3 the bound is attained by three planar sectors of angle 120 degrees extended by an orthogonal factor, the propeller. With Khot and Naor's analysis and the release's Unique Games Theorem, this gives the sharp NP-hardness threshold for identity-target kernel clustering."
status: unreviewed
checked: 2026-10-20
papers:
  - preprints/The-Gaussian-Propeller-Bound-in-Every-Dimension-September-24-2026/main.pdf
draft: false
---

Picture a cloud of points scattered around the origin according to the standard Gaussian distribution, in any number of dimensions. Cut it into $k$ pieces however you like and, for each piece, add up the position vectors of its points, weighted by the Gaussian density, to get an unnormalized centre of mass. How large can the sum of the squared lengths of these vectors be? Cutting into two half-spaces gives $1/\pi$. In 2008 Subhash Khot and Assaf Naor met this question while studying how well a clustering problem can be approximated, and conjectured the answer: three flat sectors of $120$ degrees, like the blades of a propeller, extended trivially in the other directions, are the best possible, with value $9/(8\pi)\approx0.358$, and no fourth or fifth piece ever helps. They proved it when the pieces are at most three; Heilman, Jagannath and Naor proved it in three dimensions in 2013, by a computer-assisted spherical-geometry argument; higher dimensions, and the possibility that five or more pieces might do better, stayed open. On 24 September 2026 OpenAI posted a paper claiming the conjecture in every dimension. [1][2][3]

As of 20 October 2026 no mathematician has said publicly that they have read or checked the proof. The status on this page is "unreviewed".

## The problem

Let $\gamma_d$ be the standard Gaussian measure on $\mathbb R^{d}$. For a measurable set $A$, its Gaussian first moment, which the paper calls its centroid, is $z(A)=\int_Ax\,d\gamma_d(x)$, not divided by the mass of $A$. For a measurable partition $\mathcal A=(A_1,\dots,A_k)$ of $\mathbb R^{d}$, up to null sets and with empty cells allowed, set

$$
\mathcal F(\mathcal A)=\sum_{i=1}^{k}\|z(A_i)\|^{2}.
$$

**The propeller conjecture (Khot and Naor, 2008).** For $d\ge2$ and $k\ge3$, the maximum of $\mathcal F$ is attained by three planar sectors of angle $2\pi/3$ times an orthogonal factor, so $\mathcal F(\mathcal A)\le9/(8\pi)$ always. [1]

Why the sectors. A sector in the plane of half-angle $\alpha$, symmetric about the $x$-axis, has centroid $(\sin\alpha)/\sqrt{2\pi}$ along the axis, by polar integration; three sectors of half-angle $\pi/3$ tile the plane and give $3\sin^{2}(\pi/3)/(2\pi)=9/(8\pi)$, and an orthogonal Gaussian factor adds nothing to any centroid, so the value is the same in every dimension at least two. [1]

<!-- uruk:visual-note
A visual for this page is the propeller: a Gaussian cloud in the plane cut into three $120$-degree sectors with the three centroid vectors drawn, against the same cloud cut into two halves, four quadrants, and five or six sectors, with $\mathcal F$ displayed for each, so that the reader sees three win; and a slider for the opening angles of three unequal sectors with the value falling away from the symmetric point. The paper has one TikZ figure of the sectors. [1]
-->

## Why it stayed open

What was known. Khot and Naor proved that a maximizer may be taken conical, each cell the region where one of a list of linear scores $\langle z_i,x\rangle$ is largest, in the span of its centroids, and computed the three-cell value. Heilman, Jagannath and Naor proved the bound for every finite partition of $\mathbb R^{3}$, handling the remaining four-cell cones by spherical geometry and a finite computer verification. Heilman gave a conditional route for three or four cells in any dimension under an extra stability hypothesis. Nothing was known for five or more active cells, and since the centroids of an $m$-cell extremizer span $m-1$ dimensions, five cells need four dimensions. [1]

## What OpenAI claims

**Theorem** (OpenAI, 24 September 2026). For all positive integers $d$ and $k$, every measurable partition $(A_1,\dots,A_k)$ of $\mathbb R^{d}$ satisfies

$$
\sum_{i=1}^{k}\Bigl\|\int_{A_i}x\,d\gamma_d(x)\Bigr\|^{2}\le\frac9{8\pi}.
$$

Empty cells are allowed. The constant is sharp whenever $d\ge2$ and $k\ge3$: three planar sectors of angle $2\pi/3$, multiplied by the orthogonal complement of their plane, attain equality, with any further cells empty. [1]

**Consequence.** Khot and Naor's Gaussian rounding for identity-target kernel clustering has loss factor $\alpha_k=\frac{8\pi}9(1-\frac1k)$ for $k\ge3$; the theorem evaluates the Gaussian parameter in their hardness analysis, and together with their low-influence theorem and the release's companion paper proving the Unique Games Theorem it gives NP-hardness of every deterministic approximation with a fixed loss factor below $\alpha_k$. [1]

What this does and does not say. The theorem places no constraint on cell probabilities, unlike the related noise-stability problems where equal volumes are prescribed; the paper says those are distinct. The hardness consequence needs the Unique Games Theorem of family 102, which is itself an unreviewed claim of the release; the bound itself does not. [1]

## How the claimed proof goes

What follows is a map of the paper's argument from its introduction and from Sections 2 to 5, which are short and were read in full. It is not a check of the details or of the rational enclosures in the appendix. [1]

**The statement.** Theorem 1.1: for all $d$ and $k$, every measurable partition $(A_1,\dots,A_k)$ of $\mathbb R^{d}$ satisfies $\sum_i\|\int_{A_i}x\,d\gamma_d\|^{2}\le9/(8\pi)$, where $\gamma_d$ is the standard Gaussian measure; empty cells are allowed, and the constant is sharp for $d\ge2$ and $k\ge3$, attained by three planar sectors of angle $2\pi/3$ times the orthogonal complement of their plane. A polar integration shows a sector of half-angle $\alpha$ has centroid of length $\sin\alpha/\sqrt{2\pi}$, so three sectors with $\alpha=\pi/3$ give $3\cdot\frac34\cdot\frac1{2\pi}=\frac9{8\pi}$. The difficulty, in the paper's words, is to control all measurable partitions while allowing both their shapes and their probabilities to vary. [1]

**From partitions to scores (Section 2).** The paper reproves Khot and Naor's reduction. By norm duality, the square root of the largest partition value equals the largest expected maximum of a list of Gaussian linear scores $\langle z_i,g\rangle$ over lists with total squared norm one (Lemma 2.1). Compactness gives an extremizer; among extremizers take one with the fewest positive-measure cells; merging two cells shows that the nonzero centroids $z_1,\dots,z_m$ have strictly negative pairwise inner products, that the cells agree almost everywhere with the cones where the corresponding score is largest, and that the centroids span a space of dimension $m-1$ (Lemma 2.2). Heilman, Jagannath and Naor's three-dimensional propeller theorem therefore excludes $m\le4$ from any counterexample, and the new work is $m\ge5$. Write $C$ for the optimal value, $r_i=\|z_i\|/\sqrt C$ for the normalized centroid lengths and $P_i$ for the cell probabilities, so $\sum r_i^{2}=\sum P_i=1$. [1]

**Probability bounds for the cells (Section 3).** Lemma 3.1: with $A=0.929$ for $m=5$ and $A=0.884$ for $m\ge6$, every cell satisfies $r_i\le2/3$, $P_i\ge Ar_i^{2}$ and $P_i\ge0.415r_i+0.15r_i^{2}$. The quadratic bound comes from halfspace rearrangement: replacing the cell by the halfspace $H=\{\langle e,g\rangle\ge x\}$ of the same Gaussian measure can only increase the centroid, so $|z|\le\phi(x)$ with $x=\Phi^{-1}(1-P)$, which gives $P/r^{2}\ge\frac94e^{x^{2}}\Phi(-x)$; a one-variable analysis locates the minimum of the right side near $x=0.612$ and bounds it below by $0.8843837$. For $m=5$, spherical rearrangement in the four-dimensional centroid span improves the constant to $0.929$. The linear bound comes from deleting one score: the extremal score inequality bounds the loss of expected maximum from below, and translating the deleted score's winning cone together with Ehrhard's inequality, which makes $\Phi^{-1}$ of the Gaussian measure of translates of a convex set concave, bounds it from above; comparing the two gives the scalar constraint (Lemma 3.2 handles a truncated variance). [1]

**Competition with two other cells (Section 4).** Take the cell with the smallest normalized centroid length $t=r_m$. Projecting the other scores orthogonally to its centroid gives residual Gaussian scores independent of the score in that direction, whose integrals over the chosen cell vanish. For two residual scores (Lemma 4.1, two competing scores), these identities let a positive-part integral be estimated by replacing the joint density with its maximum, whose denominator is the square root of the residual covariance determinant. Corollary 4.2 turns this into two inequalities on the ordered radii $r_1\ge r_2\ge\dots\ge r_m=t$, with $L=r_1^{2}+r_2^{2}$ and $c=r_3^{2}$:

$$
(c-t^{2})(L-c-2t^{2})\le8\Bigl(\frac3\pi\Bigr)^{2}t^{2},\qquad\tfrac32(c-t^{2})^{2}\le10\Bigl(\frac3\pi\Bigr)^{2}t^{2}.
$$

[1]

**Elimination (Section 5).** Combine the probability bounds with $\sum P_i=1$: the excesses $\delta_j=P_j-Ar_j^{2}$ are nonnegative, at least $0.415r_j-(A-0.15)r_j^{2}$, and sum to $1-A$. Since $r_j\le\sqrt c$ for $j\ge3$, summing the charges gives $(1-L)(0.415/\sqrt c-0.734)\le0.116$, and with $L\le8/9$ this forces $\sqrt c>0.23$. The smallest radius is then confined to $0.066<t<0.12$, and in that range the mass identity forces $c>2.6t$, which contradicts the second determinant inequality. So no optimal value exceeds $9/(8\pi)$, and a product-and-empty-cell reduction transfers the bound to every dimension and cell count. All terminating decimals are exact rationals, every finite comparison is recorded as a strict inequality, and Appendix A gives the rational arithmetic and square-root enclosures that verify them, including the interval cover for the scalar constraint. The only external theorems are the three-dimensional propeller bound and Ehrhard's inequality. Section 6 gives the kernel-clustering hardness application, which additionally uses Khot and Naor's discrete Fourier estimate and the release's Unique Games theorem. [1]

Where would an expert look first? At the deletion estimate in Section 3, where Ehrhard's inequality is applied to translates of a cone, and at the spherical-rearrangement improvement for $m=5$, since $0.929$ against $0.884$ is what the elimination needs; at Lemma 4.1 and the determinant inequalities; and at the rational enclosures in Appendix A, which are the computer-assisted part. [1]

## Consequences inside mathematics

If the proof holds, the propeller conjecture is a theorem in every dimension, extending Heilman, Jagannath and Naor's three-dimensional result with an argument that uses it as input; the clustering threshold $\alpha_k$ of Khot and Naor is sharp, conditional on the Unique Games Theorem; and the technique, combining Gaussian rearrangement, Ehrhard's inequality and residual-score covariance bounds, is applicable to other Gaussian partition problems. The noise-stability analogues, such as the standard simplex conjecture, remain open. [1]

## Uses outside mathematics

Kernel clustering is a standard machine-learning task, grouping data by a positive semidefinite similarity matrix; Khot and Naor's rounding algorithm achieves the factor $\alpha_k$, and the theorem says, assuming the Unique Games Theorem, that no efficient algorithm does better. For practitioners this is a limit on worst-case guarantees, not a change in practice. [1]

## Has anyone checked it?

We found no named mathematician who says they are reading or checking this paper, and no public comment from Naor, Heilman, Khot or Jagannath, whose work it builds on. VibeMathed records no check by an independent mathematician. [4]

**Machine checking.** The release's Lean scope note links one statement, `GaussianPropeller.lean`, the sharp bound $9/(8\pi)$ for every dimension and every number of labelled cells with attainment for $d\ge2$, $k\ge3$; it is in the catalogue `formalization.yaml`. The kernel-clustering consequence is outside it. A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval. [5]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; this paper is not among them. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [6]

## Sources

1. OpenAI, "The Gaussian propeller bound in every dimension", 24 September 2026. The theorem, the attaining propeller, the background, the kernel-clustering consequence and the proof strategy. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/The-Gaussian-Propeller-Bound-in-Every-Dimension-September-24-2026/main.pdf
2. Subhash Khot and Assaf Naor, "Approximate kernel clustering", Mathematika 55 (2009), 129-165. https://doi.org/10.1112/S002557930000098X
3. Steven Heilman, Aukosh Jagannath and Assaf Naor, "Solution of the propeller conjecture in R^3", Discrete and Computational Geometry 50 (2013), 263-305. https://doi.org/10.1007/s00454-013-9530-0
4. VibeMathed, "Gaussian propeller conjecture", read 20 October 2026. https://vibemathed.com/problem/gaussian-propeller-conjecture
5. OpenAI, Lean scope note for family 096 and `lean/formalization.yaml` at the pinned commit. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/096.md and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/formalization.yaml
6. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
