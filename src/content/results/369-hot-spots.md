---
family: "369"
topic: "The hot spots conjecture"
title: "On an insulated plate with no holes, does the last warm spot always end up at the edge?"
paperTitle: "Strict hot spots and absence of interior critical points on smooth simply connected planar domains"
claim: "On every smooth bounded simply connected planar domain, every nonzero eigenfunction for the first positive Neumann eigenvalue has nonvanishing gradient at every interior point. Its maximum and minimum are therefore attained only on the boundary, even when the eigenvalue is multiple."
status: unreviewed
checked: 2026-10-17
papers:
  - preprints/Strict-hot-spots-and-absence-of-interior-critical-points-on-smooth-simply-connected-planar-domains-September-24-2026/main.pdf
draft: false
---

Heat a flat metal plate unevenly, wrap its edge in perfect insulation, and wait. The temperature evens out, but not all at once. One region stays warmest the longest and another stays coldest, and as time passes the pattern of warm and cold settles into a fixed shape that simply fades. In 1974 Jeffrey Rauch asked whether the hottest and coldest points of that final shape always sit on the edge of the plate. For plates with holes the answer is no, which Burdzy and Werner showed in 1999. For plates without holes, the case Burdzy singled out as a conjecture in 2005, the answer was unknown. On 24 September 2026 OpenAI posted a paper claiming that for every such plate with a smooth edge the answer is yes, in the strongest form: the final shape has no flat point anywhere inside, not even a saddle. [1][3][5][7]

As of 17 October 2026 no mathematician has said publicly that they have checked the proof. Krzysztof Burdzy, who formulated the conjecture, has built on the theorem in a note of his own while saying explicitly that he does not assess its proof. The status on this page is "unreviewed".

## The problem

Let $\Omega$ be a bounded region of the plane with a smooth boundary. Heat flow in $\Omega$ with an insulated edge is governed by the heat equation with Neumann boundary conditions: the temperature $T(t,x)$ satisfies $\partial_t T=\Delta T$ inside, where $\Delta$ is the Laplacian, the sum of second derivatives, and the derivative of $T$ in the direction normal to the boundary is zero on the edge, so no heat crosses it. [1][4][14]

Fourier's method solves this equation by separating time from space. There are special temperature profiles $\varphi$, the Neumann eigenfunctions, that keep their shape and only shrink: $\Delta\varphi=-\mu\varphi$ in $\Omega$ with zero normal derivative on the boundary, and then $T(t,x)=e^{-\mu t}\varphi(x)$ is a solution. The constant function is one, with $\mu=0$; it represents heat that has fully evened out. The remaining eigenvalues $0<\mu_1\le\mu_2\le\cdots$ form a sequence going to infinity. Any initial temperature is a sum of eigenfunctions, and each term decays at its own rate $e^{-\mu_k t}$. After a long time only the slowest survives: the temperature is the average plus a small multiple of $\varphi_1$, the eigenfunction for the first positive eigenvalue $\mu_1$. So the hottest and coldest points at late times are the maximum and minimum of $\varphi_1$. [1][4][14]

The first positive eigenvalue can be described without the equation. It is the smallest possible value of the Rayleigh quotient

$$
\mu_1(\Omega)=\inf\frac{\int_\Omega|\nabla v|^{2}}{\int_\Omega v^{2}}
$$

over functions $v$ with mean zero, and the eigenfunctions are the functions that achieve it. Several independent eigenfunctions may share the value $\mu_1$, in which case the eigenvalue is called multiple; a disk is an example, by rotational symmetry. On a planar domain the multiplicity is at most two. [1]

**The hot spots conjecture.** For a bounded domain $\Omega$ in the plane, every eigenfunction for $\mu_1$ attains its maximum and minimum on the boundary. [3][5][4][14]

The question is subtler than it looks. Bañuelos and Burdzy pointed out in 1999 that "attains its maximum on the boundary" can mean that the maximum over the closed region is reached somewhere on the edge, or, more strictly, that every interior value is below the boundary maximum. And when the eigenvalue is multiple, one can ask the question of some favourable eigenfunction or of every one. OpenAI's theorem takes the strongest reading on both counts. [1][4]

<!-- uruk:visual-note
A visual for this page can run the heat equation on a user-drawn plate with an insulated edge, show the temperature evening out, and mark the hottest and coldest points as time runs; then show the first eigenfunction directly and let the reader hunt for an interior extremum. It cannot show the theorem, which covers every smooth plate without holes at once.
-->

## Why it stayed open

### Fifty years of plates

Rauch posed the problem in a 1974 lecture, published the next year, as one of five problems introducing the qualitative theory of partial differential equations. The conjecture was expected to hold for all reasonable domains. [1][3]

In 1999 Burdzy and Werner disproved it. Their plate has two holes, its first positive eigenvalue is simple, and the eigenfunction has its strict maximum inside. Bass and Burdzy then built domains where both the maximum and the minimum are inside, and in 2005 Burdzy did it with a single hole. The same 2005 paper states the conjecture that survives: for simply connected planar domains, meaning plates with no holes, the extrema are on the boundary. That is Conjecture 1.2(ii) in his paper, and it is what OpenAI claims. [1][5][6][7]

Positive results accumulated for special shapes. Bañuelos and Burdzy proved it for long thin domains using couplings of reflecting Brownian motions, the probabilistic counterpart of heat flow. Jerison and Nadirashvili proved it for convex domains with two perpendicular axes of symmetry, Pascu for convex domains with one axis, Atar and Burdzy for "lip domains", regions squeezed between the graphs of two functions with slopes at most one. Judge and Mondal proved in 2020, with a correction in 2022, that every Euclidean triangle has no interior critical point of its first eigenfunction, and Chen, Gui and Yao sharpened the classification of its critical points in 2026. None of these handles a general plate without holes, and the general convex planar case was still open before this release. [1][8][9][10][11]

In higher dimensions the picture reversed. Jaume de Dios Pont showed in 2024 that convex bodies in sufficiently high dimension can have interior hot spots, and de Dios Pont, Hsu and Taylor determined in 2025 exactly how much higher than the boundary the interior maximum can be. Kennedy and Rohleder proved positive results for higher-dimensional generalizations of lip domains. And on 14 October 2026, a week after OpenAI's release, Rami Atar and Burdzy posted a bounded starlike domain in three-dimensional space, a shape with no holes, whose first eigenfunction has its unique maximum at the centre. So the plane is exactly where the conjecture for hole-free regions could be true, and OpenAI's claim is the planar case. [12][13][14][15]

The difficulty, in the paper's own words, is "to control the gradient without a preferred direction in the domain". Each partial derivative of an eigenfunction solves the same equation as the eigenfunction, but its boundary values have no fixed sign. The special cases above all had a direction to exploit: a long axis, a symmetry, the slope bound of a lip domain. A general plate has none. [1]

## What OpenAI claims

Let $\Omega\subset\mathbb R^{2}$ be a nonempty bounded simply connected open set with $C^{\infty}$ boundary, let $\mu=\mu_1(\Omega)$ be its first positive Neumann eigenvalue, and let $\mathcal V$ be the real eigenspace for $\mu$. [1]

**Theorem 1.1** (OpenAI, 24 September 2026). For every nonzero $u\in\mathcal V$,

$$
\nabla u(x)\neq0\qquad(x\in\Omega).
$$

In particular, for every interior point $x$,

$$
\min_{y\in\partial\Omega}u(y)<u(x)<\max_{y\in\partial\Omega}u(y).
$$

The theorem imposes no convexity or symmetry condition and applies to every member of the eigenspace, including when the eigenvalue is multiple. [1]

What it does and does not say. The gradient statement is stronger than the hot spots inequality, because it also rules out interior saddle points, where the surface is flat but neither highest nor lowest. The boundary must be smooth: the theorem says nothing directly about polygons or domains with corners or cusps. Burdzy's follow-up, below, extends the non-strict conclusion to arbitrary simply connected domains when the first eigenvalue is simple, taking OpenAI's theorem as an input. The theorem concerns the first positive eigenvalue only, and says nothing about higher eigenfunctions, about domains with holes, where it is false, or about dimension three, where Atar and Burdzy have now shown it fails even without holes. [1][13][15]

## How the claimed proof goes

What follows is a map of the paper's argument, taken from its introduction and final section. It is not a check of the details. [1]

**The idea.** Instead of studying the eigenfunction $u$, the proof studies its gradient as a vector field, and uses the fact that the Neumann condition forces this field to be tangent to the boundary. There is an energy for tangent vector fields, built from their divergence and curl, that is at least $\mu$ times their size, with equality exactly for gradients of first eigenfunctions. This is a variational principle Jonathan Rohleder introduced in 2021. Multiplying the boundary values of the gradient by a scalar function $b$ and measuring how much the energy rises gives a formula that is zero exactly when $bg$ is again the boundary gradient of a first eigenfunction. At an interior critical point, the paper produces so many such multipliers that there would have to be more first eigenfunctions than a planar domain can have. [1][16]

**Setting up on the disk.** By the Riemann mapping theorem there is a smooth conformal map $\Phi$ from the unit disk onto $\Omega$. Pulling everything back to the disk, the paper solves the Helmholtz equation $(\Delta+\mu)v=0$ componentwise for boundary vector data and obtains a nonnegative quadratic form $E$ on boundary vector fields whose nullspace is exactly the set of boundary gradients $g$ of first eigenfunctions. For a scalar multiplier $b$,

$$
E(bg)=\frac12\iint_{S^{1}\times S^{1}}N(s,t)\,\bigl(b(s)-b(t)\bigr)^{2}\,g(s)\cdot g(t)\,ds\,dt,
$$

where $N$ is a positive kernel on the circle. The dot product $g(s)\cdot g(t)$ changes sign, so one cannot conclude anything from this identity directly. [1]

**The kernel theorem.** Let $K(p,s)$ be the kernel that evaluates the solution at an interior point $p$ from its boundary data. The paper's main analytic result says that for every interior $p$, the kernel

$$
D_p(s,t)=\frac{K(p,s)\,K(p,t)}{N(s,t)}\quad(s\neq t),\qquad D_p(s,s)=0,
$$

is conditionally negative semidefinite. By a 1938 theorem of Schoenberg, such a kernel is the squared distance of a map $b$ from the circle into a Hilbert space, and the paper shows $b$ is injective and Lipschitz. Feeding the coordinates $b_j$ of this map into the energy identity, the factor $N$ cancels and the sum telescopes:

$$
\sum_j E(b_jg)=\frac12\bigl|\nabla u(\Phi(p))\bigr|^{2}.
$$

Proving the kernel theorem is the bulk of the paper. The disk Green function is regularized so that the entrywise reciprocal of every finite kernel matrix has at most one positive eigenvalue, a condition borrowed from the theory of complete Nevanlinna-Pick kernels; this survives rank-one updates, and positive quadrature and monotone limits pass it to the singular Green kernel and then to its boundary values. [1][17]

**The contradiction.** Suppose $u$ has a critical point at $\Phi(p)$. Then the sum above is zero, every term is zero, and every $b_jg$ is the boundary gradient of some first eigenfunction $v_j$. If $g$ is nonzero on a dense subset of the circle, three suitable coordinates give three linearly independent eigenfunctions, but Nadirashvili's bound says a planar first Neumann eigenspace has dimension at most two. If instead $g$ vanishes on an arc, two independent eigenfunctions have constant trace and zero normal derivative on that arc; a combination of them vanishes there to first order, extends by zero outside the domain as a solution of the Helmholtz equation, and must vanish identically by analytic continuation, which is absurd. Either way there is no critical point. [1]

Where would an expert look first? At the kernel theorem, in particular the step where the boundary limit is taken before a cutoff is removed, since a Poisson kernel need not be square integrable; at the nullspace characterization of $E$, which the whole multiplier argument rests on; and at the two end cases, the multiplicity bound and the zero-extension step. [1]

## Consequences inside mathematics

If the proof holds, the simply connected planar hot spots conjecture is true for smooth domains in its strongest form, and Rauch's question has a complete answer in the plane: yes for plates without holes, no for plates with holes. Burdzy's note of 8 October extends the non-strict conclusion to every bounded simply connected planar domain with a compact Neumann resolvent and simple first eigenvalue, smooth boundary or not, by approximating the domain from inside with conformal images of disks and passing eigenfunctions to the limit. The paper's kernel theorem is stated for a general class of disk potentials and, the paper says, "can be used independently of the eigenfunction argument". [1][13]

## Uses outside mathematics

No known direct application.

The hot spots question began as a statement about where a cooling object stays warmest. Engineers who need that information for a specific shape compute the eigenfunction numerically, and the theorem changes no such computation. It confirms a long-held expectation for one class of shapes. [1][4][14]

## Has anyone checked it?

Krzysztof Burdzy of the University of Washington, who formulated the simply connected conjecture in 2005 and coauthored the counterexamples with holes, posted a seven-page note to arXiv on 8 October titled "Removing Boundary Smoothness from the Hot-Spots Conclusion in the Simple-Eigenvalue Case". It takes OpenAI's theorem as "an external input" and says: "We take this assertion as an input and do not assess or reproduce its proof." Its opening section, headed "Human commentary", says the note "was generated by ChatGPT in response to multiple prompts from the human author", that Burdzy "has not checked every detail, because the theorem is, to a human, an obvious corollary" of OpenAI's result, that Rodrigo Bañuelos of Purdue independently generated "an almost identical theorem and proof" at the same time, that "the OpenAI model that generated [3] missed the theorem presented in this note", and that "it is highly surprising that [3] did not cite the spectacular paper of de Dios Pont", the 2024 convex counterexample in high dimensions. We checked the OpenAI paper's bibliography and confirmed that it cites the 2025 de Dios Pont-Hsu-Taylor paper but not the 2024 one. [13]

This is the conjecture's author treating the theorem as usable, and criticizing the paper's scholarship, while saying plainly that he has not assessed its proof. Under Uruk's definitions that is not a check, so the label stays "unreviewed". Under the looser reading of "under review" as experts discussing the result, it would qualify; the choice is recorded as an open question. Atar and Burdzy's 14 October paper on the three-dimensional counterexample likewise describes OpenAI as having "presented a proof" and does not assess it. VibeMathed records no check by an independent mathematician. An expository article on the family states that it "is not an independent verification of the complete proofs". [15][18][19]

**Machine checking.** The release's Lean statement is 57 lines and builds its own definitions: a smooth boundary through local defining functions, an admissible domain as nonempty, open, bounded and simply connected with smooth boundary, weak gradients in $L^{2}$, the first positive Neumann eigenvalue as the infimum of the Rayleigh quotient over mean-zero functions, and membership in its eigenspace through the weak eigenvalue equation. Its conclusion is the paper's: nonvanishing gradient inside, and strict inequalities between interior values and the boundary extremes. The formal proof behind it is 31 files. Because the statement defines the eigenvalue and eigenspace itself rather than using a library definition, whether those definitions match the paper's hypotheses is a question a reader must settle, and we have not. The statement is not listed in the release's catalogue `formalization.yaml`, and we found no outside replay. A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval. [2]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; none of them is this family, and the Lean statement did not change. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [20]

## Sources

1. OpenAI, "Strict hot spots and absence of interior critical points on smooth simply connected planar domains", 24 September 2026. Theorem 1.1, the background and mechanism paragraphs of Section 1, the multiplicity proposition in Section 2, Section 6. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Strict-hot-spots-and-absence-of-interior-critical-points-on-smooth-simply-connected-planar-domains-September-24-2026/main.pdf
2. OpenAI, Lean scope note for family 369 and the comparator statement `HotSpots.lean` at the pinned commit. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/369.md and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/HotSpots.lean
3. Jeffrey Rauch, "Five problems: an introduction to the qualitative theory of partial differential equations", in Partial Differential Equations and Related Topics, Lecture Notes in Mathematics 446, Springer, 1975, 355-369.
4. Rodrigo Bañuelos and Krzysztof Burdzy, "On the 'hot spots' conjecture of J. Rauch", Journal of Functional Analysis 164 (1999), 1-33. https://doi.org/10.1006/jfan.1999.3397
5. Krzysztof Burdzy and Wendelin Werner, "A counterexample to the 'hot spots' conjecture", Annals of Mathematics 149 (1999), 309-317. https://doi.org/10.2307/121027
6. Richard F. Bass and Krzysztof Burdzy, "Fiber Brownian motion and the 'hot spots' problem", Duke Mathematical Journal 105 (2000), 25-58. https://doi.org/10.1215/S0012-7094-00-10512-1
7. Krzysztof Burdzy, "The hot spots problem in planar domains with one hole", Duke Mathematical Journal 129 (2005), 481-502, Conjecture 1.2. https://doi.org/10.1215/S0012-7094-05-12932-5
8. David Jerison and Nikolai Nadirashvili, "The 'hot spots' conjecture for domains with two axes of symmetry", Journal of the American Mathematical Society 13 (2000), 741-772. https://doi.org/10.1090/S0894-0347-00-00346-5
9. Rami Atar and Krzysztof Burdzy, "On Neumann eigenfunctions in lip domains", Journal of the American Mathematical Society 17 (2004), 243-265. https://doi.org/10.1090/S0894-0347-04-00453-9
10. Chris Judge and Sugata Mondal, "Euclidean triangles have no hot spots", Annals of Mathematics 191 (2020), 167-211, https://doi.org/10.4007/annals.2020.191.1.3 ; erratum, Annals of Mathematics 195 (2022), https://doi.org/10.4007/annals.2022.195.1.5
11. Hongbin Chen, Changfeng Gui and Ruofei Yao, "Uniqueness of critical points of the second Neumann eigenfunctions on triangles", Inventiones Mathematicae (2026). https://doi.org/10.1007/s00222-025-01398-x
12. Jaume de Dios Pont, "Convex sets can have interior hot spots", arXiv 2412.06344, December 2024. https://arxiv.org/abs/2412.06344
13. Krzysztof Burdzy, "Removing Boundary Smoothness from the Hot-Spots Conclusion in the Simple-Eigenvalue Case", arXiv 2610.12622, dated 7 October and posted 8 October 2026. The abstract, Section 1 "Human commentary" and Section 2. https://arxiv.org/abs/2610.12622
14. James B. Kennedy and Jonathan Rohleder, "On the hot spots conjecture in higher dimensions", Transactions of the American Mathematical Society, Series B (2026). https://doi.org/10.1090/btran/245
15. Rami Atar and Krzysztof Burdzy, "A starlike 3-dimensional counterexample to the hot spots conjecture", 14 October 2026, arXiv 2610.19908. https://arxiv.org/abs/2610.19908
16. Jonathan Rohleder, "A new approach to the hot spots conjecture", arXiv 2106.05224, 2021, revised 2023. https://arxiv.org/abs/2106.05224
17. I. J. Schoenberg, "Metric spaces and positive definite functions", Transactions of the American Mathematical Society 44 (1938), 522-536. https://doi.org/10.1090/S0002-9947-1938-1501980-0
18. VibeMathed, "The hot spots conjecture for smooth simply connected planar domains", read 17 October 2026. https://vibemathed.com/problem/hot-spots-smooth-simply-connected-planar
19. Latent seminar, "Strict hot spots and interior critical points", explanatory article on family 369, read 17 October 2026. https://lowrank.github.io/latent-seminar/OpenAI-Math/369-hot-spots
20. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
