---
family: "150"
topic: "Billiards in irrational triangles"
title: "Does a ball in a lopsided triangle eventually go everywhere?"
paperTitle: "Ergodicity of triangular billiards with an irrational angle"
claim: "The unit-speed billiard flow in every nondegenerate Euclidean triangle with at least one angle that is an irrational multiple of π is ergodic for normalized Liouville measure, with no genericity or Diophantine condition, and is weakly mixing: the product of the flow with itself is ergodic. The irrationality assumption is sharp for the full phase space."
status: unreviewed
checked: 2026-10-20
papers:
  - preprints/Ergodicity-of-triangular-billiards-with-an-irrational-angle-September-25-2026/Ergodicity-of-triangular-billiards-with-an-irrational-angle-September-25-2026.pdf
  - preprints/Weak-mixing-of-triangular-billiards-with-an-irrational-angle-October-5-2026/weak-mixing-triangular-billiards.pdf
draft: false
visual: endless-bounce
---

Roll a frictionless ball inside a triangle and let it bounce forever. Does it eventually pass through every region in every direction, spending time in proportion to size? For triangles whose angles are rational multiples of $\pi$, the answer is no in a precise sense: the reflections generate only finitely many directions, so a ball launched one way explores only a finite set of directions, and the problem becomes the rich theory of translation surfaces, where Kerckhoff, Masur and Smillie proved unique ergodicity in almost every direction in 1986. For an irrational triangle the ball's direction wanders through a continuum, and ergodicity on the whole phase space was expected but never proved for a single explicit triangle without an approximation condition: Kerckhoff, Masur and Smillie got it for a dense set of polygons by Baire category, Vorobets for triangles whose angles are extremely well approximable by rationals, Chaika and Forni weak mixing for a dense set of polygons. Numerical experiments disagreed with one another, some suggesting mixing in irrational right triangles and others suggesting the opposite. On 25 September 2026 OpenAI posted a short paper claiming ergodicity for every irrational triangle, and on 5 October a second claiming weak mixing. [1][2][3]

As of 20 October 2026 no mathematician has said publicly that they have read or checked the proofs. The status on this page is "unreviewed".

## The problem

Let $Q\subset\mathbb R^{2}$ be a nondegenerate triangle. The unit-speed billiard flow $\Phi_t$ moves in straight lines inside $Q$ and reflects specularly at the open sides; trajectories that hit a vertex form a null set and are discarded. The flow preserves normalized Liouville measure $d\mu=dA\,d\theta/(2\pi\,\mathrm{Area}(Q))$ on position and direction. The flow is ergodic if every measurable invariant set has measure zero or one, and weakly mixing if the product flow $(x,y)\mapsto(\Phi_tx,\Phi_ty)$ is ergodic for $\mu\otimes\mu$. [1][2]

**The question.** Is the billiard flow in every irrational triangle ergodic? Weakly mixing? [1]

<!-- uruk:visual-note
A visual for this page is the billiard: a trajectory in an irrational triangle filling the table and, in the direction circle, filling all angles, against a trajectory in the equilateral or right isosceles triangle confined to finitely many directions; and the unfolding of a triangle into a flat surface with cone points. The papers contain no figures; the pictures are standard.
-->

## Why it stayed open

What was known. The unfolding construction of Zemlyakov and Katok replaces reflections by straight continuation on a surface; for rational polygons this surface is compact and the phase space splits into invariant directional surfaces, which is why rational billiards are never ergodic on the full phase space. Kerckhoff, Masur and Smillie's theorem gives ergodicity for a dense $G_\delta$ of polygons, Vorobets a quantitative rational-approximation criterion with explicit examples including some irrational right triangles, Chaika and Forni weak mixing for a dense $G_\delta$ of polygons with any number of sides; Arana-Herrera, Chaika and Forni characterized weak mixing in almost every direction for rational billiards. None of these gives a conclusion for each irrational triangle, and the Baire-category results do not give Lebesgue-almost-every angle. [1][2]

Why it was hard. On the flat double of the triangle, an invariant function satisfies a transport equation along geodesics, and the analytic methods of Forni and Moll can show such a function is constant if it also has some regularity in the transverse direction; but a measurable invariant function supplies only the geodesic derivative, and the missing transverse regularity cannot be assumed. The cone points at the vertices make any smoothing delicate. [1][2]

## What OpenAI claims

**Theorem** (ergodicity; OpenAI, 25 September 2026). The unit-speed billiard flow in every nondegenerate Euclidean triangle with at least one angle irrational relative to $\pi$ is ergodic for normalized Liouville measure. No genericity or Diophantine condition is required. [1]

**Theorem** (weak mixing; 5 October 2026). The same flow is weakly mixing: its product with itself is ergodic for $\mu\otimes\mu$. [2]

What these do and do not say. For triangles of area one with angles $(\alpha,\beta,\pi-\alpha-\beta)$, the conclusions hold for every pair except the countable set with both $\alpha/\pi$ and $\beta/\pi$ rational, hence for Lebesgue-almost every triangle. The irrationality assumption is sharp for the full phase space, by the finite-group argument above. Strong mixing is not claimed, nor are polygons with more than three sides. [1][2]

## How the claimed proof goes

What follows is a map of the ergodicity paper's argument from its introduction and its Sections 2 to 7, which were read in full, with the weak-mixing extension from the companion. It is not a check of the details. [1][2]

**The statement and its sharpness.** Theorem 1 of the ergodicity paper: for a nondegenerate triangle $Q$ with at least one of $\alpha/\pi,\beta/\pi,\gamma/\pi$ irrational, the unit-speed billiard flow with specular reflection is ergodic on $Q\times S^{1}$ for the normalized Liouville measure $dA\,d\theta/(2\pi\operatorname{Area}Q)$, trajectories hitting a vertex being discarded; equivalently every measurable set invariant under the flow has measure zero or one. The hypothesis is sharp for the full phase space: in a rational triangle the side reflections generate a finite group acting on directions, and any nonconstant function on the circle invariant under that group is an invariant function for the flow. Since the angles sum to $\pi$, exactly one irrational angle with two rational ones cannot occur, so the theorem covers triangles with one rational angle and triangles with three irrational angles. [1]

**The analytic issue.** Forni and Moll's framework for flat surfaces with cone points relates transport invariance to a recurrence among the derivatives of angular Fourier coefficients, and proves constancy of a geodesic-invariant function in the horizontal Sobolev space $H^{1,0}$ under non-rational holonomy. But an invariant indicator function has no such regularity a priori. The paper works directly with bounded invariant functions: a localized energy estimate first gives an $L^{2}$ gradient for each angular coefficient individually, not a square-summable family, and the remaining task is to show each such gradient vanishes. [1]

**The flat double and the coefficients (Section 2).** Glue two oppositely oriented copies of the triangle along corresponding sides to form an oriented flat surface $M$, regular across the sides, with cone points of angles $2\alpha,2\beta,2\gamma$ at the vertices, on which reflection becomes straight continuation. On its unit tangent bundle $SM$ let $X$ be differentiation along the geodesic and $Y$ differentiation in the perpendicular parallel direction; they commute locally. Expand a function in angular Fourier modes $f_j$ in the fibre direction. The equation $Xf=0$ for an invariant $f$ relates neighbouring coefficients through Cauchy-Riemann-type operators, and for each integer $m$ the sum of modes $m,m+2,m+4,\dots$ has $X$-derivative equal to a single endpoint coefficient derivative, which must be shown to vanish. [1]

**Smoothing away from the cones and the localized estimate (Sections 3 and 4).** The smoothing is in position only, away from the three cone points: averaging over long segments that stay clear of the cones gives bounded test functions close to $f$ with a small transport derivative (Section 3, the supported smoothing identities). Section 4's lemma: if $w\in L^{2}(SM)$ has compact spatial support with $Xw,Yw\in L^{2}$ and $Xw$ vanishes off a measurable set $E$, then every coefficient satisfies

$$
\|\nabla w_j\|_2^{2}\le4\|Xw\|_2\,\|\mathbf 1_E\nabla w\|_2,
$$

because integration by parts gives $\|\partial w_j\|^{2}=\|\bar\partial w_j\|^{2}=\frac14\|\nabla w_j\|^{2}$ and the parity recurrence confines the cost to where invariance fails. The square summability used here belongs to the regularized test field, never to $f$. [1]

**Two successive limits (Section 5, Proposition 5).** Integrating the smoothed endpoint equation along the long segments gives a pairing that tends to zero; the coefficient estimate controls the two coefficient gradients in that pairing as the smoothing scale tends to zero; the weak limit satisfies the exact local transport equation; applying the bounded-coefficient estimate again gives a new bound independent of the remaining approximation parameter; and only then are the weak limits allowed to approach $f$. This second passage proves that the endpoint derivative, and hence every coefficient gradient, vanishes, with no horizontal Sobolev hypothesis on $f$. [1]

**Holonomy (Section 6).** Each coefficient now has zero flat gradient, so it is a parallel section, constant in every regular chart with constants matching under the unitary transitions. Developing the punctured cone of angle $2\alpha$ shows that continuation around that vertex has holonomy rotation by $-2\alpha$, so a parallel coefficient of mode $j$ is fixed by the phase $e^{2ij\alpha}$; if $\alpha/\pi$ is irrational that phase is not one for $j\ne0$, so every nonzero mode vanishes, and the zeroth mode is constant on the connected surface. Fourier completeness makes $f$ constant, and an indicator with the same mass as the invariant set $A$ has integral zero or one. The paper remarks that the angle condition is visible only in this last step; all analytic constants may depend on the fixed triangle. Section 7 draws spectral consequences: for Dirichlet or Neumann boundary conditions, a density-one subsequence of Laplace eigenfunctions of the triangle equidistributes in phase space, the quantum ergodicity that Zelditch and Zworski's theorem attaches to ergodic billiards, together with consequences for nodal domains. [1]

**Weak mixing (companion).** The October paper proves the stronger statement that the flow is weakly mixing, by extending the same coefficient-energy and long-average method from $Xf=0$ to the eigenfunction equation $Xf=i\lambda f$ for every real $\lambda$ (Proposition 2.1, transverse rigidity; Section 4). Summing the coefficient-energy identities over consecutive angular indices telescopes the terms containing $\lambda$ into one boundary term, and a pairing with the two boundary modes produced by differentiating an angular Fourier tail gives a sharp bound that excludes nonconstant eigenfunctions (Proposition 5.1). [2]

Where would an expert look first? At the two successive limits of Proposition 5 and the claim that no transverse regularity of $f$ is needed; at the localized coefficient estimate of Section 4 near the cone points, where the cutoff cost must be confined to small annuli; and at the telescoping in the weak-mixing paper. Both papers are short enough to read in full. [1][2]

## Consequences inside mathematics

If the proofs hold, the ergodic theory of triangular billiards is settled: every irrational triangle is ergodic and weakly mixing, every rational one is neither on the full phase space, and the generic and approximation-based theorems of Kerckhoff, Masur, Smillie, Vorobets, Chaika and Forni become special cases for triangles. The conflicting numerical reports are explained as slow convergence. Strong mixing, and polygons with more sides, remain open. [1][2]

## Uses outside mathematics

No known direct application.

Polygonal billiards model ray optics in cavities and the motion of particles in microstructures; the question of whether an irrational triangular cavity is ergodic bears on how uniformly it is illuminated or heated over long times, though real cavities have rounded corners and losses that the model omits. [1]

## Has anyone checked it?

We found no named mathematician who says they are reading or checking these papers, and no public comment from Forni, Chaika, Masur, Smillie, Hubert or Athreya, whose work they build on. VibeMathed records no check by an independent mathematician. [4]

**Machine checking.** The release's Lean scope note links one statement, `IrrationalTriangleBilliard.lean`, for ergodicity, which constructs the flow outside the exceptional null set, proves uniqueness of the flight chain, measure preservation and the flow law almost everywhere. It is not listed in the catalogue `formalization.yaml` at the pinned commit, so no complete formal proof is presented there despite the catalogue's tag. Weak mixing has no Lean statement. A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval. [5]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; neither paper in this family is among them. The weak-mixing paper is dated 5 October, the day before the release. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [6]

## Sources

1. OpenAI, "Ergodicity of triangular billiards with an irrational angle", 25 September 2026. The theorem, the historical context and the proof strategy. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Ergodicity-of-triangular-billiards-with-an-irrational-angle-September-25-2026/Ergodicity-of-triangular-billiards-with-an-irrational-angle-September-25-2026.pdf
2. OpenAI, "Weak mixing of triangular billiards with an irrational angle", 5 October 2026. The theorem, the historical context and the analytic contribution. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Weak-mixing-of-triangular-billiards-with-an-irrational-angle-October-5-2026/weak-mixing-triangular-billiards.pdf
3. Steven Kerckhoff, Howard Masur and John Smillie, "Ergodicity of billiard flows and quadratic differentials", Annals of Mathematics 124 (1986), 293-311. https://doi.org/10.2307/1971280
4. VibeMathed, "Ergodicity of irrational triangular billiards", read 20 October 2026. https://vibemathed.com/problem/irrational-triangle-billiard-ergodicity
5. OpenAI, Lean scope note for family 150 and `lean/formalization.yaml` at the pinned commit, which does not list its comparator. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/150.md and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/formalization.yaml
6. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
