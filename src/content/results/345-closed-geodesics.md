---
family: "345"
topic: "Infinitely many closed geodesics"
title: "On a lumpy sphere, how many ways can a straight line close up on itself?"
paperTitle: "Infinitely many closed geodesic images on every Riemannian sphere"
claim: "Every smooth Riemannian metric on the sphere S^n, n ≥ 2, has infinitely many prime closed geodesics with pairwise distinct images. The same holds on every closed manifold finitely covered by a sphere and on every closed three-manifold."
status: unreviewed
checked: 2026-10-18
papers:
  - preprints/Infinitely-many-closed-geodesic-images-on-every-Riemannian-sphere-September-24-2026/paper.pdf
draft: false
---

On a perfectly round sphere, walk straight ahead and you return to where you started along a great circle; there are infinitely many great circles, so infinitely many closed straight paths. Dent the sphere, stretch it, make it an egg or a potato, and the straight paths, the geodesics, bend with the surface. Birkhoff showed in 1917 that at least one still closes up. Whether infinitely many always do, on every possible shape of sphere in every dimension, became one of the classical problems of geometry. For the ordinary two-dimensional sphere the answer is yes, by work of Franks, Bangert and Hingston around 1992. For higher-dimensional spheres it was known for "generic" shapes, by Rademacher, but not for all: a proof claimed in Klingenberg's 1978 textbook is regarded as wrong, and a 2019 claim is disputed by this very paper. On 24 September 2026 OpenAI posted a paper claiming infinitely many closed geodesics on every sphere of every dimension, and, using Perelman's geometrization theorem, on every closed three-dimensional space. [1][3][4][5]

As of 18 October 2026 no mathematician has said publicly that they have read or checked the proof. The status on this page is "unreviewed".

## The problem

A Riemannian metric on a manifold is a smoothly varying way of measuring lengths and angles; a geodesic is a curve that is locally shortest, the surface's version of a straight line. A closed geodesic is a nonconstant periodic one. It is prime if it goes around once rather than repeating a shorter closed geodesic several times. Two closed geodesics count as the same if they have the same image: starting at a different point, running backwards, or going around twice gives nothing new. A prime closed geodesic may cross itself. [1]

**The closed-geodesic infinitude problem.** Does every closed Riemannian manifold of dimension at least two carry infinitely many closed geodesics with distinct images? [1]

<!-- uruk:visual-note
A visual for this page can draw a deformed sphere, an ellipsoid first, and trace geodesics from a chosen point and direction, showing the three closed ones on a triaxial ellipsoid and then the mess of non-closing ones. It can show what "prime" and "same image" mean. The higher-dimensional theorem cannot be drawn.
-->

## Why it stayed open

What was known. Lyusternik and Fet proved in 1951 that every closed manifold has at least one closed geodesic. Infinitude needs a way to tell new geodesics from repeats of old ones, which Bott's iteration theory and the local Morse theory of Gromoll and Meyer provide: on a simply connected manifold, if the Betti numbers of the free loop space are unbounded, there are infinitely many distinct closed geodesics. Vigué-Poirrier and Sullivan showed in 1976 that this holds whenever the rational cohomology needs at least two generators. Spheres are exactly the case that escapes: their cohomology has one generator and the loop homology is bounded in each degree. The two-sphere was settled anyway, by Franks's theorem on annulus maps combined with Bangert's, or by Hingston's independent route. In higher dimensions Rademacher proved infinitude for strongly bumpy metrics, which are generic, and Long and Duan proved at least two on every three-sphere, but a degenerate metric can escape every generic argument, and a limiting argument does not preserve distinct prime images. [1][3][4][5]

The history has false starts. Asselle and Mazzucchelli identified the proof in Klingenberg's 1978 monograph as erroneous. A 2019 paper of Charles claimed infinitude on every closed manifold; the OpenAI paper identifies two unsupported steps in it and says explicitly that these are objections to the proof, not counterexamples to its conclusion. [1]

## What OpenAI claims

**Theorem 1.1** (OpenAI, 24 September 2026). For every integer $n\ge2$ and every smooth Riemannian metric on the standard sphere $S^{n}$, there are infinitely many prime closed geodesics with pairwise different images. [1]

**Corollary 1.2.** The same holds on every closed manifold admitting a finite smooth cover diffeomorphic to $S^{n}$, $n\ge2$, which includes real projective spaces and spherical space forms. [1]

**Corollary 1.3.** Every smooth Riemannian metric on every closed three-manifold, orientable or not, has infinitely many prime closed geodesics with distinct images. [1]

What these do and do not say. The two-sphere case is classical input, not reproved; the new work is $n\ge3$ with no genericity or nondegeneracy assumption. The three-manifold corollary is proved in the introduction: if the fundamental group is infinite, a 2022 theorem of Rademacher and Taimanov gives the conclusion; if it is finite, Perelman's elliptization theorem makes the manifold a spherical space form, finitely covered by $S^{3}$, and Corollary 1.2 applies. Nothing is claimed about general closed manifolds in dimension four or more, where the infinitude problem remains open, and nothing quantitative is claimed about how many geodesics of length at most $L$ exist. [1]

## How the claimed proof goes

What follows is a map of the paper's argument from its introduction and from the statements of its main theorems in Sections 3 to 10. It is not a check of the details. The methods are string topology and equivariant Morse theory on the free loop space, which are technical even for specialists. [1]

**The idea.** Closed geodesics are the critical points of the energy functional on the free loop space $\Lambda$ of the sphere, and Morse theory relates them to the topology of the energy sublevel sets $X_a$. Suppose a metric on $S^{n}$, $n\ge3$, has only finitely many prime geodesic images. Then every nonconstant critical loop is an iterate of one of finitely many oriented trajectories, so the local homology at each critical level has uniformly bounded rank and sits near finitely many straight lines relating Morse index to length (Theorem 3.7, uniform local control: at every tight crossing of a critical level the local pairs have total rank at most $B$ and are supported within $A$ of the index $I_{i,m}$ of the $m$-th iterate of the $i$-th prime). The obstacle to a direct count is that sublevel homology can contain temporary classes, born at one level and dying at a later one. The paper controls those transients, then uses the symmetry of loops traversed twice to force a contradiction. The paper works with the length filtration and square-root energy, the $L^{2}$ norm of velocity over one period, interchangeably. [1]

**Step 1: uniform filling, for every metric (Sections 4 and 6).** Theorem 6.1, uniform ordinary death: for every smooth metric on $S^{n}$ there is a constant $D$ such that, in every degree $j$ and at every level $a$, a class in $H_j(X_a)$ that dies in the whole loop space already dies in $H_j(X_{a+D})$, and likewise relative to the constant loops $M$; the same $D$ works at regular and non-regular levels, and nothing about the number of geodesics is assumed. The fixed-degree version comes from a shortening argument in the strong $H^{1}$ topology, a direct descendant of Block, Manin and Weinberger's additive filling estimate and of Nabutovsky and Rotman's quantitative shortening (Proposition 4.6, fixed-degree filling). To remove the dependence on the degree, a high-degree null cycle is cut with a power of a cohomology class to bring its degree into a fixed finite range, filled there, and the degree is restored by the Chas-Sullivan loop product. [1][2]

**Step 2: resonance and the cut-join identity (Section 5).** Why the lengths removed and added nearly cancel is the resonance theorem of Hingston and Rademacher, in the form of Proposition 5.1: there are constants $\alpha,C_H$ depending on the metric such that every nonzero homogeneous homology or cohomology class of degree $k$ has critical level $\mathrm{cr}(z)$ with $|k-\alpha\,\mathrm{cr}(z)|\le C_H$; each ordinary group in a fixed degree has dimension at most one; and there are classes $\Theta\in H_{3n-2}(\Lambda)$, $\omega\in H^{n-1}(\Lambda,M)$, $\theta\in H^{3n-2}(\Lambda,M)$ whose loop-product powers $\Theta^{\bullet m}$ have degree $n+2md$ and whose relative-cohomology-product powers $\omega^{\circledast m}$ have degree $(2m-1)d$, pairing to one. The Filtered Interchange theorem (5.4) is the technical heart: it says which factor of a loop product is cut does not matter, with explicit length bounds on all the homologies involved; its chain-level constructions build on Hingston and Wahl's string-topology models, and Proposition 5.6 shows that the absolute cut, with a diagonal-relative Thom cocycle, of a suitable power is the constant-loop fundamental class, the unit for the loop product. These are the identities that make the cut-then-join manoeuvre of Step 1 cost a bounded amount of length. [1]

**Step 3: the transient count (Sections 7 to 9).** With $\mathbb F_2$ coefficients, let $B_a$ be the cohomology of $X_a$ relative to the constant loops, equivariant under reversing loops, and $B_\infty$ the global group; set

$$
T(a)=\dim\operatorname{coker}(B_\infty\to B_a),
$$

summed over degrees, the number of extra reflection classes at level $a$. Theorem 8.2, the finite-cut defect bound: comparing two filtrations on the fixed locus of translation by half a period, the actual equivariant degree and the degree of the half-length root, the total discrepancy $\sum_j\Phi_j(a)$ is at most $C(1+a)$ whenever $2a$ is regular, by an exact-sequence diagram chase along the critical events. A long string of extra classes would produce discrepancy of order $a^{2}$, so, after the uniform filling estimate excludes the remaining configurations, $T(a)$ is uniformly bounded under the finiteness assumption (Theorem 9.1, bounded total transients). Section 7 constructs the global equivariant classes this needs, through natural Gysin sequences, the "round" filtration from the round metric, and an analysis of the cohomology of the critical manifolds at each stage, including the torsion of the odd stages. [1]

**Step 4: doubling (Section 10).** The orthogonal group acts on the sphere, and Theorem 10.2 gives $T(2L)\ge T(L)$ for regular $2L$, with an equality condition: if equality holds then at every odd stage $m$ of the round filtration the number $h_{m,k}$ of selected bottom classes equals the number $b_{m,k}$ of bottoms, meaning every nonzero bottom restriction from an odd stage has a partner, obtained by cup product with the sphere class pulled back by evaluation at time zero, whose restriction is independent modulo all bottom restrictions in its degree. [1]

**Step 5: the contradiction (Section 10).** Since $T$ is a bounded integer, an interval on which it attains its maximum propagates under doubling to arbitrarily long intervals on which $T(2L)=T(L)$, so the equality condition holds throughout. A bottom generator must first appear at some local crossing inside such an interval. But by part (iv) of uniform local control, cup product with the evaluation class $e=\mathrm{ev}_0^{*}[S^{n}]^{*}$ vanishes on every reflection crossing under the finiteness assumption, so the generator's partner is zero, contradicting the equality case. Hence there are infinitely many prime geodesic images. [1]

Where would an expert look first? At the degree-independence step of the uniform filling theorem, where cut, cohomology power, loop product and resonance are combined, and at the filtered interchange identity it rests on; at the two-filtration comparison that bounds the transients, in particular the $O(a)$ diagram chase against the $\Omega(a^{2})$ count; and at the equality case of the doubling theorem together with part (iv) of local control, which together deliver the contradiction. A specialist might also look at the paper's two objections to Charles's 2019 argument, since if those steps can be repaired the theorem is older and human. [1]

## Consequences inside mathematics

If the proof holds, the sphere case of the closed-geodesic infinitude problem is settled in every dimension, the case the two-generator criterion of Vigué-Poirrier and Sullivan could not reach, and with it every spherical space form and every closed three-manifold. The uniform filling estimate and the filtered cut-join identity are stated as reusable ingredients. The general problem, for closed manifolds of dimension at least four with one-generator cohomology other than spheres, such as projective spaces over the complex numbers and quaternions, is not addressed. [1]

## Uses outside mathematics

No known direct application.

Closed geodesics are periodic orbits of a frictionless particle on a surface, and periodic orbits matter in mechanics, but the theorem concerns their existence in the abstract, with no bound on their lengths. [1]

## Has anyone checked it?

We found no named mathematician who says they are reading or checking this paper, and no comment from Hingston, Rademacher, Bangert, Mazzucchelli or Taimanov, whose theorems it uses or whose critiques it cites. VibeMathed records no check by an independent mathematician. [6]

**Machine checking.** None. Family 345 has no Lean scope note and no comparator statement in the release. The theorem rests entirely on the written paper. [7]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; this paper is not among them. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [8]

## Sources

1. OpenAI, "Infinitely many closed geodesic images on every Riemannian sphere", 24 September 2026. Theorem 1.1, Corollaries 1.2 and 1.3 with their proofs, the history and the idea of the proof. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Infinitely-many-closed-geodesic-images-on-every-Riemannian-sphere-September-24-2026/paper.pdf
2. Nancy Hingston and Hans-Bert Rademacher, "Resonance for loop homology of spheres", Journal of Differential Geometry 93 (2013), 133-174. https://doi.org/10.4310/jdg/1357141508
3. John Franks, "Geodesics on S² and periodic points of annulus homeomorphisms", Inventiones Mathematicae 108 (1992), 403-418. https://doi.org/10.1007/BF02100612
4. Victor Bangert, "On the existence of closed geodesics on two-spheres", International Journal of Mathematics 4 (1993), 1-10. https://doi.org/10.1142/S0129167X93000029
5. Hans-Bert Rademacher, "On a generic property of geodesic flows", Mathematische Annalen 298 (1994), 101-116. https://doi.org/10.1007/BF01459728
6. VibeMathed, "Infinitely many closed geodesics on every Riemannian sphere and every closed three-manifold", read 18 October 2026. https://vibemathed.com/problem/closed-geodesics-on-spheres-infinitude
7. OpenAI, `lean/docs/` and `lean/formalization.yaml` at the pinned commit, which contain no entry for family 345. https://github.com/openai/math/tree/4eaee87548250b2682affda7d05d947c05554bae/lean/docs
8. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
