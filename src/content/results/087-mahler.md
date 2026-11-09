---
family: "087"
topic: "Mahler's conjectures"
title: "Which shape, multiplied by its own shadow, is smallest?"
paperTitle: "The symmetric Mahler conjecture and its equality cases"
claim: "For every origin-symmetric convex body K in R^n, |K|·|K°| ≥ 4^n/n!, with equality exactly for linear images of Hanner polytopes. For every convex body, the volume product at the Santaló point is at least (n+1)^(n+1)/(n!)^2, with equality exactly for simplices. For n ≥ 2 the Gromov width of int K × int K° is 4."
status: unreviewed
checked: 2026-10-18
papers:
  - preprints/The-symmetric-Mahler-conjecture-and-its-equality-cases-September-22-2026/paper.pdf
  - preprints/The-Mahler-Conjecture-for-General-Convex-Bodies-September-22-2026/paper.pdf
draft: false
---

Every convex shape has a dual, called its polar: a big shape has a small polar and a long thin shape has a short wide one, so that multiplying the two volumes together gives a number that does not change when the shape is stretched or rotated. For a disk that number is $\pi^{2}\approx9.87$, for a regular hexagon it is $9$, for a square it is $8$. In 1939 Kurt Mahler asked how small it can be. He proved that in the plane the square is the answer, and conjectured that in every dimension the cube is, together with the cube's dual, the octahedron, and a family of hybrids. The largest value is classical, the ball, by a theorem of Blaschke and Santaló. The smallest resisted everyone. Bourgain and Milman proved in 1987 that it is at least a fixed fraction of the conjectured value, raised to the power of the dimension; Iriyeh and Shibata proved the three-dimensional case in 2020 after eighty years, for which the Mathematical Society of Japan gave them its Geometry Prize with a citation saying the conjecture had been considered impregnable even among experts. On 22 September 2026 OpenAI posted three papers claiming the full conjecture in every dimension, with the equality cases, together with the version for shapes without a center of symmetry, where the answer is the triangle's higher-dimensional cousin. [1][2][3][4][6][7]

As of 18 October 2026 no mathematician has said publicly that they have checked the proofs. One symplectic geometer has published illustrations of the third paper's construction while saying he has not checked the details. The status on this page is "unreviewed".

## The problem

A convex body is a compact convex set in $\mathbb R^{n}$ with nonempty interior. If $K$ is symmetric about the origin, $K=-K$, its polar body is

$$
K^{\circ}=\{y\in\mathbb R^{n}:\langle x,y\rangle\le1\text{ for every }x\in K\}.
$$

Each point $y$ of the polar corresponds to a half-space $\{x:\langle x,y\rangle\le1\}$ containing $K$; the polar is the set of all such half-spaces, so it encodes $K$'s facets as points. Scaling $K$ by $\lambda$ scales $K^{\circ}$ by $1/\lambda$, and more generally an invertible linear map $T$ sends $K^{\circ}$ to $(T^{-1})^{\mathsf T}K^{\circ}$, so the two determinants cancel in the volume product

$$
P(K)=|K|\,|K^{\circ}|.
$$

This is a linear invariant of the shape. The cube $[-1,1]^{n}$ has volume $2^{n}$ and its polar is the cross-polytope $\{\sum|y_i|\le1\}$ of volume $2^{n}/n!$, so $P=4^{n}/n!$. The ball is self-polar with $P=|B^{n}|^{2}$, and the Blaschke-Santaló inequality says every symmetric body has $P(K)\le|B^{n}|^{2}$, with equality only for ellipsoids. [1][2][6]

The conjectured minimizers are the Hanner polytopes: start with a segment, and repeatedly take either the Cartesian product of two Hanner polytopes or the convex hull of their union placed in complementary coordinates. Cubes and cross-polytopes are the pure cases; mixed sums give others, and all have $P=4^{n}/n!$. In dimension three there are two, the cube and the octahedron; in dimension four, four. [1]

**Symmetric Mahler conjecture.** For every origin-symmetric convex body $K\subset\mathbb R^{n}$, $|K||K^{\circ}|\ge4^{n}/n!$, with equality exactly for linear images of Hanner polytopes. [1]

For a body without a center of symmetry one has to choose where to put the origin before taking the polar. The polar volume $|(K-z)^{\circ}|$ is minimized at a unique interior point $s(K)$, the Santaló point, and the general volume product is $P(K)=|K||(K-s(K))^{\circ}|$, an affine invariant. The simplex, the convex hull of $n+1$ affinely independent points, has $P=(n+1)^{n+1}/(n!)^{2}$: $27/4$ for a triangle, $64/9$ for a tetrahedron. [2]

**General Mahler conjecture.** For every convex body $K\subset\mathbb R^{n}$, $P(K)\ge(n+1)^{n+1}/(n!)^{2}$, with equality exactly for simplices. [2]

<!-- uruk:visual-note
A visual for this page can let the reader deform a symmetric polygon and watch its polar change and the product of the two areas move, never dropping below $8$ and reaching it only at parallelograms. A second view can show the three-dimensional cube and octahedron. Kienzle's post includes interactive versions of exactly this, and his image of a four-dimensional symplectic ball sliced into flowers on an island is the kind of picture this page should aim for. [8]
-->

## Why it stayed open

### Eighty-seven years

Mahler posed the problem in his work on the geometry of numbers, where the volume product governs how a lattice and its dual lattice relate, and proved the planar case for polygons in 1938; Meyer completed the planar general case in 1991, and Reisner showed that among symmetric planar bodies only parallelograms attain the minimum. Saint-Raymond proved the conjecture in 1981 for unconditional bodies, those symmetric under every coordinate sign change, and Meyer and Reisner identified the Hanner equality cases in that class; Reisner proved it for zonoids. These are the classes where coordinates give one something to induct on. [1][2]

The general problem had two kinds of partial progress. Bourgain and Milman's 1987 inverse Santaló inequality gives $P(K)\ge c^{n}|B^{n}|^{2}$ for an absolute $c>0$, which is the right order of magnitude but not the constant; Kuperberg made the constant explicit in 2008 with Gauss linking integrals, and Nazarov gave a complex-analytic proof using Hörmander's $\bar\partial$ estimates. Locally, Nazarov, Petrov, Ryabogin and Zvavitch showed in 2010 that the cube is a strict local minimizer up to linear equivalence, and Kim extended this to every Hanner polytope. Neither line reaches the sharp constant globally. Mahler's problem is also connected to symplectic geometry: Artstein-Avidan, Karasev and Ostrover showed in 2014 that Viterbo's conjecture on symplectic capacities would imply the symmetric case, but Viterbo's conjecture was disproved by Haim-Kislev and Ostrover in 2024, closing that route. [1][2][9]

The breakthrough was Iriyeh and Shibata's 2020 proof of the three-dimensional symmetric case, including equality, by reducing the volume to surface and then line integrals and finally to planar cross-sections. Fradelizi, Hubard, Meyer, Roldán-Pensado and Zvavitch gave a shorter proof via equipartitions in 2022, and a 2026 preprint of Chen, Li, Xi and Xu proves the three-dimensional general case, $P(K)\ge64/9$ with tetrahedra as the only minimizers. Dimension four was open in both versions. [1][2][3][5]

## What OpenAI claims

**Theorem 1.1** (OpenAI, "The symmetric Mahler conjecture and its equality cases", 22 September 2026). For every integer $n\ge1$ and every origin-symmetric convex body $K\subset\mathbb R^{n}$,

$$
|K|\,|K^{\circ}|\ge\frac{4^{n}}{n!}.
$$

Equality holds if and only if $K$ is a linear image of a Hanner polytope. [1]

**Theorem 1.1** (OpenAI, "The Mahler conjecture for general convex bodies", 22 September 2026). For every integer $n\ge1$ and every convex body $K\subset\mathbb R^{n}$,

$$
P(K)=\inf_{z\in\operatorname{int}K}|K|\,|(K-z)^{\circ}|\ge\frac{(n+1)^{n+1}}{(n!)^{2}}.
$$

Equality holds if and only if $K$ is a simplex. [2]

**Theorem 1.1** (OpenAI, "Symplectic balls in symmetric polar products", 22 September 2026). For every $n\ge2$ and every origin-symmetric convex body $K\subset\mathbb R^{n}$, the Gromov width of $\operatorname{int}K\times\operatorname{int}K^{\circ}$ in $\mathbb R^{2n}$ with its standard symplectic form is $4$: for every $0<c<4$ there is a symplectic embedding of the ball of capacity $c$ into it. [4]

What these do and do not say. The three papers are logically independent routes. The symmetric paper proves the inequality and classifies equality; the general paper proves the simplex bound, which is a different, smaller constant on a larger class and does not imply the symmetric one; the symplectic paper proves the symmetric inequality a second way, since symplectic embeddings preserve volume and the ball of capacity $c$ has volume $c^{n}/n!$, but makes no equality claim. The symmetric paper also derives the functional Mahler inequality for even convex potentials and an entropy-transport inequality, using a 2008 implication of Fradelizi and Meyer that needs the geometric theorem in all dimensions at once. [1][2][4]

## How the claimed proofs go

What follows is a map of the three arguments, from the papers' introductions and from the sections they point to. It is not a check of the details. The symmetric and symplectic papers are short; the general paper is seventy-two pages. [1][2][4]

**The symmetric paper: the idea.** Lower-bound the polar volume by an integral of volumes of simplices built from the body's own facets, then prove that integral is at least $4^{d}/d!$ by a complex-analytic mass estimate. The novelty is that a real convex-geometry inequality is proved by sampling boundary points of a complex domain and using several complex variables to force a probability to be at least one. [1]

**The symmetric paper: simplices from a lens.** Write the body as $A=\{X:|b_i\cdot X|\le1\}$ with polar $A^{\circ}=\operatorname{conv}\{\pm b_i\}$, the rows $b_i$ spanning $\mathbb R^{d}$. Section 3 constructs a planar "lens" $D$, the image of the unit disc under the conformal map

$$
F(z)=\frac8{\pi^{2}}\sum_{j\ge0}\frac{(-1)^{j}z^{2j+1}}{(2j+1)^{2}},
$$

a rotation of an example from Gross's conformal Skorokhod embedding. Its closure is $\{v+it:|t|\le1,\ |v|\le\lambda(t)\}$ with an explicit concave half-width, $\lambda''(t)=-\sec(\pi t/2)<0$, and its decisive property is that if $\Theta$ is uniform on the circle then the imaginary part of $F(e^{i\Theta})$ is uniform on $[-1,1]$. For an interior point $X$ of $A$, the lens defines a smaller body $L_X=\{Y:|b_i\cdot Y|\le\lambda(b_i\cdot X)\}$; every independent set $I$ of $d$ constraints that are tight at some point of $L_X$ spans, with the origin, a simplex, and the union $\Sigma_X$ of these simplices lies in $A^{\circ}$. [1]

**The symmetric paper: the mass estimate and the inequality.** For each $I$, sample independent uniform angles $\theta_i$, solve $b_iZ=F(e^{i\theta_i})$ for a complex vector $Z$, and let $P_I$ be the probability that all the remaining coordinates $b_jZ$ also land in the closed lens. The Holomorphic Mass lemma (Section 4) is a Lelong-number estimate proved directly by Stokes' theorem: if $f:\mathcal U\to\mathbb C^{N}$ is holomorphic with the single zero $0$, vanishes there to order $k$ with a nondegenerate leading homogeneous part, and has compact sublevel sets of $|f|^{2}$ below one, then

$$
\int_{\{|f|^{2}<1\}}\sum_{|I|=d}\Bigl|\det\Bigl(\frac{\partial f_i}{\partial z_j}\Bigr)_{i\in I}\Bigr|^{2}dV\ge\frac{(\pi k)^{d}}{d!},
$$

the proof bounding $\int(dd^{c}|f|^{2})^{d}$ by comparison with a small sphere and the homogeneous flux, then converting to Jacobian minors by Cauchy-Binet. Applied to $f_i=g(b_iZ)^{k}$ with $g=F^{-1}$ and $k\to\infty$, after a radial change of variables the Jacobian integrals concentrate on the boundary samples and force $S=\sum_IP_I\ge1$ (Section 5). The uniform imaginary coordinate then identifies the probability sum with a real integral: $1\le S=(d!/4^{d})\int_A|\Sigma_X|\,dX\le(d!/4^{d})|A||A^{\circ}|$, the last step being the inclusion $\Sigma_X\subseteq A^{\circ}$. Approximation by polytopes extends this to all symmetric bodies. [1]

**The symmetric paper: equality.** Pass to $B=K\oplus_1[-1,1]$ with $B^{\circ}=K^{\circ}\times[-1,1]$, one dimension up, where the norm-sum formula preserves equality. Equality means the missing volume $|A^{\circ}|-|\Sigma_X|$ vanishes on average for inner polytope approximations, and Section 7 turns this into a feasibility witness at every interior point and direction. Section 8 sends points toward an apex of $B$: the endpoint scaling of $\lambda$ gives a support-function inequality, convex separation turns it into a metric median for every three points of the normed space with unit ball $K^{\circ}$, a point whose distances to each pair add to that pair's distance, and Hansen and Lima's 1981 theorem, that a finite-dimensional normed space with this three-ball property has a Hanner unit ball, finishes the classification. [1]

**The general paper: cones and Laplace transforms.** Choose $z_0$ in the interior of $K$ and lift to the cone $C=\{(tx,t):t\ge0,\ x\in K-z_0\}\subset\mathbb R^{m}$, $m=n+1$, with dual cone $D$. Klartag's correspondence turns the volume product into Laplace transforms: with $\chi_C(V)=\int_Ce^{-\langle V,x\rangle}dx$ and $\chi_D$ likewise, the theorem follows from $\chi_C(V)\chi_D(U)\ge1$ whenever $\langle U,V\rangle=m$, and Section 2 does the short calculation that fixes signs and factorials. [2]

**The general paper: biased Gaussian projections.** Let $Z=\Sigma^{1/2}G$ be a Gaussian vector and, for a real layer parameter $z$, choose a bias $\xi_z$ so that the nearest-point projection $X_z=\Pi_C(Z+\xi_z)$ has mean $a(z)U$ with $a(z)=\mathbb E\max\{g+z,0\}$; its Moreau partner is $Y_z=\Pi_D(-Z-\xi_z)$. Section 3 proves these biases exist and chooses the coordinates and the covariance $\Sigma$ simultaneously, by a fixed-point argument (Proposition 3.4); the paper says the dependence of the covariance on the projection field is essential later. Integrating over $z$ gives two injective smoothed maps into the cones, and change of variables plus Jensen's inequality bound the normalized log of the Laplace product below by $-\mathcal E$ (Section 4, Proposition 4.3, the entropy inequality). It remains to show $\mathcal E\le0$. [2]

**The general paper: the hard part.** The derivative matrices $P_z=D\Pi_C(Z+\xi_z)$ neither commute nor increase in $z$, so estimating them separately would lose the constant. Sections 5 and 6 compare the whole family to spectral thresholds of a linear Gaussian matrix $L=\sum_iG_iM_i$ with deterministic symmetric $M_i$, separating the linear part by Hermite expansion and the Gaussian covariance identity of Houdré and Privault, and reduce $\mathcal E$ to functions of $L$ and the covariance minus a nonnegative "layer defect". Section 7 writes those functions as averages over pairs of eigenvalues by the matrix divided-difference formula (Proposition 7.2, the linear-field bound), and a strict scalar inequality on each nontrivial interval, proved in Appendix B (Proposition B.1) by analytic interpolation and tail bounds from finite rational certificates ("numerical sampling is not used as a substitute"), absorbs the errors. Equality forces the $M_i$ to commute and the projection derivative to be diagonal in one basis, so the cone splits into half-lines and its section is a simplex; the converse is a volume computation. [2]

**The symplectic paper.** Here $K$ sits in position coordinates and $K^{\circ}$ in momentum coordinates of $\mathbb R^{2n}$, and the task is to embed symplectic balls of every capacity below $4$ into $\operatorname{int}K\times\operatorname{int}K^{\circ}$. Two ingredients. First, a ball from a holomorphic zero (Section 2): if $f$ is holomorphic near $0$ in $\mathbb C^{n}$ with $0$ its unique common zero, $|f|=O(|z|^{k})$ and compact sublevels, then $\{|f|^{2}<1\}$ with the symplectic form from the potential $|z|^{2}+|f|^{2}$ contains balls of every capacity below $\pi k$, by replacing the logarithmic singularity with a smooth radial potential and transporting with a compactly supported Moser deformation. Second, a uniform slice estimate (Section 3) for the same lens map $F$ as in the symmetric paper: the horizontal primitives of $|(g^{k})'|^{2}$ from the imaginary axis are at most $(\pi k/4)|g|^{2k}+o(k)$ uniformly, including near the tips $\pm i$. Combining them, for $K=\{|\langle b_j,x\rangle|\le1\}$ set $f_j(z)=g(\langle b_j,z\rangle)^{k}$, send the imaginary part of $z$ to position and the horizontal primitives to momentum; monotonicity makes this injective and the estimate puts the momentum inside $S_kK^{\circ}$ with $S_k=(1+o(1))\pi k/4$. Dividing momentum by $S_k$ and dilating the source ball gives every capacity below $4$ as $k\to\infty$; approximation handles general $K$, and a supporting-cylinder argument with Gromov nonsqueezing gives the matching upper bound $4$. Kienzle's post sketches exactly this construction for symplectic geometers and draws the image of the ball. [4][8]

Where would an expert look first? In the symmetric paper, at the Holomorphic Mass lemma and the radial rescaling that produces $\sum_IP_I\ge1$ in Section 5, then at the identification of that sum with the simplex integral through the uniform imaginary coordinate; in the general paper, at the matrix comparison in Sections 5 to 7 and the strict segment inequality in Appendix B, which the paper itself names as the hard part; in the symplectic paper, at the uniform slice estimate near the tips, which is where $\pi k/4$ comes from. [1][2][4]

## Consequences inside mathematics

If the proofs hold, the symmetric and general Mahler conjectures are settled in every dimension, closing a problem open since 1939 whose three-dimensional case alone took eighty years. The functional Mahler inequality for even log-concave functions follows with the sharp constant $4^{n}$, and with it an entropy-transport inequality; the general paper gives the constant $e^{n}$ without evenness. In the geometry of numbers, the volume product bounds how far a lattice and its dual can be from each other. In symplectic geometry, the width theorem gives a Mahler-type statement with symplectic rather than volume content and transports ball packings into polar products. The field's symplectic programme is affected: Viterbo's conjecture, which would have implied Mahler, is false, but the paper obtains the specific capacity statement that was wanted. [1][2][4][9]

## Uses outside mathematics

No known direct application.

Volume products appear in the analysis of lattices and in functional inequalities with information-theoretic readings, where the entropy-transport corollary lives, but no engineering or scientific use of the sharp constant is known. [1]

## Has anyone checked it?

One named person in the exact subfield has engaged with the proofs in public. Elliot Kienzle, a fourth-year mathematics PhD student at UC Berkeley working in symplectic geometry, published "Illustrating the AI proof of the Mahler conjecture" in October 2026. He writes that he has been scooped, that the symplectic paper is "a clever construction applying a technique I haven't published yet", and then: "I will present the proof as if it were written by a colleague, assuming it's correct and outlining the ideas. I haven't checked the line-by-line details." He discloses using an AI assistant to read the paper. Under Uruk's strict reading this is engagement, not review, and under the looser reading in the project rules it is the beginning of expert discussion of one of the three papers; the label stays "unreviewed" until a check is claimed. [8]

We found no public statement from Iriyeh, Shibata, Fradelizi, Meyer, Zvavitch, Klartag, Karasev or Ostrover, whose work the papers build on. VibeMathed records no check by an independent mathematician for either the symmetric or the general entry. [10]

**Machine checking.** The release's Lean scope note for this family lists four statements. Three are in the catalogue `formalization.yaml`: `MahlerConjecture.lean` (the symmetric inequality, 26 lines), `SymmetricMahlerEquality.lean` (the Hanner classification, 54 lines) and `SymmetricPolar.lean` (Gromov width $4$, 49 lines), with formal proofs of 243 and 46 files behind them. The fourth, `GeneralMahler.lean` for the simplex bound, is linked from the scope note but not in the catalogue, and the note contradicts itself, saying first that the nonsymmetric conjecture "is not included" and then stating it as formalized. A reader should take the general theorem as uncatalogued. We found no outside replay. A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval. [11]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; none of the three papers in this family is among them. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [12]

## Sources

1. OpenAI, "The symmetric Mahler conjecture and its equality cases", 22 September 2026. Theorem 1.1, the history section, the proof overview, Corollaries 1.2 and 1.3. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/The-symmetric-Mahler-conjecture-and-its-equality-cases-September-22-2026/paper.pdf
2. OpenAI, "The Mahler conjecture for general convex bodies", 22 September 2026. Theorem 1.1, the history section and the proof strategy. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/The-Mahler-Conjecture-for-General-Convex-Bodies-September-22-2026/paper.pdf
3. Hiroshi Iriyeh and Masataka Shibata, "Symmetric Mahler's conjecture for the volume product in the 3-dimensional case", Duke Mathematical Journal 169 (2020), 1077-1134. https://doi.org/10.1215/00127094-2019-0072
4. OpenAI, "Symplectic balls in symmetric polar products", 22 September 2026. Theorem 1.1, Corollary 1.2 and the construction overview. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Symplectic-Balls-in-Symmetric-Polar-Products-September-22-2026/paper.pdf
5. Matthieu Fradelizi, Alfredo Hubard, Mathieu Meyer, Edgardo Roldán-Pensado and Artem Zvavitch, "Equipartitions and Mahler volumes of symmetric convex bodies", American Journal of Mathematics 144 (2022), 1201-1219; arXiv:1904.10765. https://arxiv.org/abs/1904.10765
6. J. Bourgain and V. D. Milman, "New volume ratio properties for convex symmetric bodies in R^n", Inventiones Mathematicae 88 (1987), 319-340. https://doi.org/10.1007/BF01388911
7. Kurt Mahler, "Ein Übertragungsprinzip für konvexe Körper", Časopis pro pěstování matematiky a fysiky 68 (1939), 93-102. The Mathematical Society of Japan citation is quoted from a Japanese-language account of the Iriyeh-Shibata proof, read 18 October 2026. https://doi.org/10.21136/CPMF.1939.109441 and https://note.com/akikito/n/n7c8391c1ba24
8. Elliot Kienzle, "Illustrating the AI proof of the Mahler conjecture", October 2026, read 18 October 2026; affiliation from the site's About page. https://chessapig.github.io/Mahler
9. Pazit Haim-Kislev and Yaron Ostrover, "A counterexample to Viterbo's conjecture", arXiv:2405.16513 (2024). https://arxiv.org/abs/2405.16513
10. VibeMathed, "Symmetric Mahler conjecture" and "General Mahler conjecture", read 18 October 2026. https://vibemathed.com/problem/symmetric-mahler-conjecture and https://vibemathed.com/problem/general-mahler-conjecture
11. OpenAI, Lean scope note for family 087 and the comparator statements at the pinned commit. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/087.md , https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/MahlerConjecture.lean , https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/SymmetricMahlerEquality.lean , https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/SymmetricPolar.lean and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/GeneralMahler.lean
12. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
