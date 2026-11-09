---
family: "375"
topic: "De Giorgi's conjecture"
title: "Must a wall between two phases be flat?"
paperTitle: "A positive resolution of De Giorgi's conjecture in dimension eight"
claim: "Every entire C^2 solution u: R^8 → (−1,1) of the Allen-Cahn equation Δu = u^3 − u that is strictly increasing in one direction is a planar transition tanh((e·x − c)/√2). Every stable entire solution v: R^7 → [−1,1] is a constant ±1 or a planar transition, with no energy-growth assumption. This proves De Giorgi's conjecture at its sharp dimension-eight endpoint."
status: unreviewed
checked: 2026-10-20
papers:
  - preprints/De-Giorgis-conjecture-in-dimension-eight-September-26-2026/article.pdf
draft: false
---

Where two phases of a material meet, oil and water, up-magnets and down-magnets, a thin wall forms, and the Allen-Cahn equation $\Delta u=u^{3}-u$ is the simplest model of it: $u$ is $-1$ in one phase, $+1$ in the other, and crosses between them along the wall. The flat wall is the explicit solution $\tanh((e\cdot x-c)/\sqrt2)$. In 1978 Ennio De Giorgi conjectured that in dimensions up to eight, any solution that rises monotonically in one direction must be a flat wall, and he chose eight because of the Bernstein problem for minimal surfaces, where flat is forced through dimension eight and fails from nine. The conjecture was proved in two dimensions in 1998, in three in 2000, and through eight by Ovidiu Savin in 2009 under an extra assumption that the solution really reaches $\pm1$ far away; del Pino, Kowalczyk and Wei built non-flat monotone solutions in dimension nine and above in 2011. Removing Savin's extra assumption in dimensions four to eight was the open problem, and in September 2026 two human groups independently removed it in dimension four. On 26 September 2026 OpenAI posted a paper claiming dimension eight, the sharp endpoint. [1][3][4][5]

As of 20 October 2026 no mathematician has said publicly that they have read or checked the proof. The status on this page is "unreviewed".

## The problem

The Allen-Cahn equation on $\mathbb R^{n}$ is

$$
\Delta u=u^{3}-u,\qquad|u|<1,
$$

the Euler-Lagrange equation of the energy $\int\tfrac12|\nabla u|^{2}+\tfrac14(1-u^{2})^{2}$, which rewards being near $\pm1$ and penalizes steep gradients. The function $g(s)=\tanh(s/\sqrt2)$ is its one-dimensional solution rising from $-1$ to $1$, and $u(x)=g(e\cdot x-c)$ for any unit vector $e$ is a flat wall whose level sets are parallel hyperplanes. [1]

**De Giorgi's conjecture (1978).** If $n\le8$ and $u$ is a bounded entire solution with $\partial_nu>0$ everywhere, then $u(x)=g(e\cdot x-c)$ for some $e$ and $c$. [1]

<!-- uruk:visual-note
A visual for this page can show the $\tanh$ profile and a flat wall in two dimensions, then a slice of the Simons cone $\{x_1^{2}+\cdots+x_4^{2}=x_5^{2}+\cdots+x_8^{2}\}$ as the non-flat minimizer that exists in eight dimensions but is not a graph, and a bar of dimensions one to nine coloured by what was known: proved, proved with Savin's assumption, false.
-->

## Why it stayed open

Why eight. Modica and Mortola showed that rescaled Allen-Cahn energies converge to surface tension times perimeter, so at large scales the wall behaves like a minimal surface. Simons found a non-flat area-minimizing cone in $\mathbb R^{8}$, and Bombieri, De Giorgi and Giusti found non-flat entire minimal graphs in $\mathbb R^{9}$; a monotone solution's level sets are graphs, so the graph threshold, nine, is where De Giorgi expected the conjecture to fail, and it does. [1]

What was known. Ghoussoub and Gui proved $n=2$ in 1998 and Ambrosio and Cabré $n=3$ in 2000. Savin's 2009 Annals paper proved $4\le n\le8$ assuming additionally that $u(x',t)\to\pm1$ as $t\to\pm\infty$ for every $x'$; Kelei Wang gave a new proof in 2017 [2] Del Pino, Kowalczyk and Wei's 2011 Annals paper constructed counterexamples for $n\ge9$ near dilations of the Bombieri-De Giorgi-Giusti graph. The related question for stable solutions, those with nonnegative second variation of the energy, is sharper by one dimension: Pacard and Wei built stable non-flat solutions in $\mathbb R^{8}$, so stable rigidity can hold at most through $\mathbb R^{7}$. In September 2026, within weeks of the release, Liu, Luo, Wang, Wei, Wei and Wu, and independently Chan, Fernández-Real, Figalli, Florit-Simon and Serra, proved stable rigidity in $\mathbb R^{3}$ and hence De Giorgi in $\mathbb R^{4}$ without Savin's assumption, after Florit-Simon and Serra had done $\mathbb R^{4}$ under a bounded-energy-density hypothesis. The human frontier was therefore stable three, monotone four. [1][3][4][5]

## What OpenAI claims

**Theorem** (monotone rigidity in dimension eight; OpenAI, 26 September 2026). Let $u\in C^{2}(\mathbb R^{8},(-1,1))$ satisfy $\Delta u=u^{3}-u$ and $\partial_8u>0$. Then there are $e\in\mathbb S^{7}$ with $e_8>0$ and $c\in\mathbb R$ such that

$$
u(x)=\tanh\Bigl(\frac{e\cdot x-c}{\sqrt2}\Bigr)\qquad\text{for every }x\in\mathbb R^{8}.
$$

Neither energy growth nor minimization is assumed; both, and the limits at infinity, are consequences. [1]

**Theorem** (stable rigidity in dimension seven). Let $v\in C^{2}(\mathbb R^{7},[-1,1])$ be a stable solution of $\Delta v=v^{3}-v$. Then $v\equiv1$, $v\equiv-1$, or $v(x)=\tanh((a\cdot x-b)/\sqrt2)$ for some $a\in\mathbb S^{6}$, $b\in\mathbb R$. No energy-growth assumption is required. [1]

What these do and do not say. The first theorem is De Giorgi's conjecture at its last and sharpest dimension, with no extra hypothesis. The second is sharp by Pacard and Wei's examples in dimension eight. Both concern the scalar quartic equation; other double-well potentials are not treated. The paper says the recent stable Bernstein theorem of Hong, Li and Wang in $\mathbb R^{7}$ is a geometric parallel and "not an input to our argument". [1]

## How the claimed proof goes

What follows is a map of the paper's argument from its introduction and from its "Guide to the analytical proof", with the main statements of its four parts. It is not a check of the details. [1]

**The shape of the paper.** Two theorems. Theorem 1.1, monotone rigidity in dimension eight: a solution of $\Delta u=u^{3}-u$ on $\mathbb R^{8}$ with $|u|\le1$ and $\partial_8u>0$ is a one-dimensional profile $g(a\cdot x-b)$. Theorem 1.2, stable rigidity in dimension seven: a solution on $\mathbb R^{7}$ that is stable, meaning the second variation $\int|\nabla\varphi|^{2}+(3v^{2}-1)\varphi^{2}$ is nonnegative for every test $\varphi$, is $\pm1$ or a flat wall. Part I (Section 3) deduces the first from the second in full; Parts II to IV (Sections 4 to 10) prove the second, first under a finite-density hypothesis and then without it. [1]

**Part I: monotone from stable.** A positive derivative $\partial_8u$ solves the linearized equation, so $u$ is stable; its limits as $x_8\to\pm\infty$ are stable solutions in seven variables hence by Theorem 1.2 wells or flat walls, each a global energy minimizer by a one-dimensional calibration (the end-profiles lemma). Clipping competitors between the two end profiles and sliding translates of $u$ (minimizing barriers and compact sliding), following Alberti, Ambrosio and Cabré and the end-profile reduction of Jerison and Monneau, shows that $u$ itself minimizes energy, with $\mathcal E(u;B_R)\le CR^{7}$. Blowing down, the exact perimeter limit proposition shows the energy measures converge exactly to the surface tension $s_0=2\sqrt2/3$ times the perimeter of a minimizing boundary, using a patched recovery sequence because convergence of the phases alone would allow extra energy; energy monotonicity makes the limit a cone; in dimension eight such a minimizing cone can be singular only at the vertex, and directional monotonicity plus the classical directed-cone argument forces a hyperplane (flatness of the directed cone), including the degenerate case where the normal component vanishes and translation invariance contradicts an isolated singularity. Wang's near-unit-density theorem then returns from the flat limit to $u$ itself. [1]

**Measuring the defect.** For $|v|<1$ write $q=1-v^{2}$, $U=g^{-1}(v)$ and $D=1-|\nabla U|^{2}$. Modica's gradient bound gives $D\ge0$, and $D=0$ exactly for a planar transition, where $U$ is affine. Testing stability against $q\eta$ gives the exact identity

$$
0\le Q_v(q\eta)=\int q^{2}|\nabla\eta|^{2}-\int q^{3}D\,\eta^{2},
$$

so the defect $D$ is paid for by gradients of the test function, and the second term detects defect even at zeros where no smooth level-set description exists; the paper notes the same inverse-profile test in Liu, Luo, Wang, Wei and Wu's three-dimensional work. At a regular point $z$ of the zero set $\Sigma$ with normal $\nu$, let $A$ be the second fundamental form and $H$ its trace, and let $I_P(z)$ be the average of $q^{3}D$ along the normal segment of length $2P$ through $z$, normalized by $\sigma=\int(1-g^{2})^{2}=2s_0$. Part II's diffuse estimates (Section 5) show $I_P$ controls both $|A|^{2}$ and $H$, with a sharp coefficient for $H$ obtained by normalizing $D$ at a zero where it is small, passing to a limiting equation with a nonnegative source, and separating that source from the positive homogeneous solutions (the positive decomposition lemma). The strict coefficient is what a six-dimensional interface needs. Lifting a surface test into the ambient equation gives a surface stability inequality, $(1-\varepsilon)\int_\Sigma\tfrac12(|A|^{2}+I_P)\psi^{2}\le\int_\Sigma|\nabla_\Sigma\psi|^{2}$ for $\psi$ supported where $D$ is small (Section 8, strengthened surface stability); the paper remarks this retains only about half of the mass $I_P$ when interaction dominates curvature, and that the final ambient test will retain almost all of it. [1]

**Part II: rigidity under finite density (Theorem 1.3 and Section 6).** With $M_R(y)=\mathcal E(v;B_R(y))/(s_0\omega_{n-1}R^{n-1})$ the normalized energy density, Theorem 1.3 classifies stable solutions in $\mathbb R^{n}$, $4\le n\le7$, with $\sup_RM_R<\infty$. The critical-density and regularity results of Florit-Simon and Serra, which apply through ambient dimension seven although their own classification was four-dimensional, reduce a possible failure to an integer-density solution whose zero set consists, away from a sparse set, of ordered sheets (the critical solution and its good regions); the transition-layer estimates of Wang and Wei apply once a nonvanishing core gradient and a bound on the derivative of its direction are established, hypotheses the paper keeps explicit. The contradiction compares the nearest gap between sheets in two ways: a preliminary concave test controls the geometric errors; then a sharper gap test combines the mean-curvature bound with a radial Green estimate (the Green inequality with cap-independent collar errors), while diffuse stability supplies a competing Hardy bound (the tube, mass and Hardy estimates). Their logarithmic coefficients are incompatible through dimension seven. The theorem also makes every finite density threshold available in the local regularity result used in Parts III and IV. [1]

**Parts III and IV: removing the density bound in $\mathbb R^{7}$ (Sections 7 to 10).** The task is to show that a stable solution in seven dimensions cannot have unbounded energy density. For zeros $z,y$ with $z$ regular, the ratio $|y-z|^{2}/|\nu(z)\cdot(y-z)|$ is twice the radius of the normal tangent ball through $y$, and as $y\to z$ it records curvature; a smoothed angular penalty turns this into a length $d(z)$, the penalized reach, which measures both bending of a sheet and proximity of another (Section 7). A delayed energy-monotonicity argument finds a bounded-density window at nearly the reach scale, the local regularity theorem of Part II then isolates a single sheet there (an isolated graph), projection onto the translation mode of $g$ improves the mean-curvature derivatives, and a tangent ball on one phase side controls signed mean curvature at a remote contact; these produce a differential inequality for $d$ and a change-of-variables formula counting its positive curvature contributions with multiplicity one (the weak reach inequality and positive-foot transfer). Section 9 proves a fourth-order growth estimate: tests lifted from sheets, with squares added where several lifts reach the same ambient point, are glued to $q$ near large-defect zeros, and combined with the Simons-Schoen-Simon-Yau curvature method they bound weighted integrals of $|A|^{4}+D^{2}+E^{2}$, with $E=e^{-\kappa d}$ the interaction, by $K(R)R^{m-4}$ for $m=6$, four powers of $R$ better than the area bound even though $K(R)=1+\sup M_R$ may grow. Section 10 makes the final comparison with the same radial reach weight in the geometric inequality and in an ambient stability test: on the regions where the regular-sheet description holds, the surface amplitude is extended normally and interpolated between adjacent sheets in bands inside their logarithmic gaps, at a cost proportional to the squared difference of amplitudes; assigning each switching band to the base with the larger amplitude, the reach comparison makes the ratio tend to one on that base's nearest gap, so only the other side can incur the fixed loss. The resulting estimate retains almost nine tenths of $\int_\Sigma I_P\psi^{2}$ with the gradient coefficient near one (Section 8, sharp interaction and middle-phase tail), which compared with the reach inequality leaves a strict margin in interface dimension six; a normal-tube packing argument converts this into an area contradiction. [1]

Where would an expert look first? At the sharp coefficient in the mean-curvature control of Section 5; at the reach inequality and its multiplicity-one counting in Section 7; at the gluing of ambient and surface tests in Section 9, where three claims about mass reserve, derivative cost and cancellation of partition costs carry the estimate; and at the nine-tenths retention in Sections 8 and 10, since the final margin in dimension six is what separates this from the three- and four-dimensional human results. In Part I, at the patched recovery sequence that identifies the limiting energy with the perimeter. [1]

## Consequences inside mathematics

If the proof holds, De Giorgi's 1978 conjecture is settled in every dimension: true through eight, false from nine, with the boundary exactly where the Bernstein problem predicted. The stable classification in $\mathbb R^{7}$ is sharp and parallels the stable Bernstein theorem for minimal hypersurfaces in $\mathbb R^{7}$. The month's human progress, stable three and monotone four by two groups, would be superseded by four dimensions at once. [1]

## Uses outside mathematics

No known direct application.

The Allen-Cahn equation is used in materials science to model phase separation and in image processing for segmentation, but those uses concern bounded domains and finite times; the conjecture is about the shape of eternal solutions on all of space. [3]

## Has anyone checked it?

We found no named mathematician who says they are reading or checking this paper, and no public comment from Savin, Wei, Cabré, Figalli, Serra or Wang, whose work it builds on or runs parallel to. VibeMathed records no check by an independent mathematician. [6]

**Machine checking.** None. Family 375 has no Lean scope note and no comparator statement in the release. [7]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; this paper is not among them. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [8]

## Sources

1. OpenAI, "A positive resolution of De Giorgi's conjecture in dimension eight", 26 September 2026. Both theorems, the history, "From stable end profiles to the monotone theorem", "The finite-density step" and the guide to the analytical proof. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/De-Giorgis-conjecture-in-dimension-eight-September-26-2026/article.pdf
2. Ovidiu Savin, "Regularity of flat level sets in phase transitions", Annals of Mathematics 169 (2009), 41-78. https://doi.org/10.4007/annals.2009.169.41
3. Manuel del Pino, Michał Kowalczyk and Juncheng Wei, "On De Giorgi's conjecture in dimension N ≥ 9", Annals of Mathematics 174 (2011), 1485-1569. The abstract gives the history and the conjecture. https://doi.org/10.4007/annals.2011.174.3.3
4. Hardy Chan, Xavier Fernández-Real, Alessio Figalli, Enric Florit-Simon and Joaquim Serra, "Stable solutions of the Allen-Cahn equation in dimension three are one-dimensional", 2026, as cited by the OpenAI paper; and Enric Florit-Simon and Joaquim Serra, "On stable solutions to the Allen-Cahn equation with bounded energy density in R^4", arXiv:2509.02739 (2025). https://arxiv.org/abs/2509.02739
5. Liu, Luo, Wang, Juncheng Wei, Yong Wei and Wu, "Stable De Giorgi conjecture of the Allen-Cahn equation in R^3", arXiv:2609.21680, September 2026. https://arxiv.org/abs/2609.21680
6. VibeMathed, "De Giorgi conjecture (Allen-Cahn)", read 20 October 2026. https://vibemathed.com/problem/de-giorgi-conjecture-allen-cahn
7. OpenAI, `lean/docs/` and `lean/formalization.yaml` at the pinned commit, which contain no entry for family 375. https://github.com/openai/math/tree/4eaee87548250b2682affda7d05d947c05554bae/lean/docs
8. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
