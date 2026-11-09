---
family: "147"
topic: "The near-boundary Birkhoff conjecture"
title: "If a billiard table is orderly near its rim, must it be an ellipse?"
paperTitle: "Rigidity of smooth billiards with a continuous caustic collar"
claim: "A smooth strictly convex planar billiard table with positive curvature is an ellipse whenever a full neighbourhood of its boundary is continuously foliated by smooth closed convex caustics, with no differentiability assumed across the leaves. Equivalently, if an invariant annulus of the billiard phase space containing all sufficiently shallow shots is continuously foliated by invariant curves, the table is an ellipse. This is the near-boundary Birkhoff conjecture in the smooth positively curved class."
status: unreviewed
checked: 2026-10-20
papers:
  - preprints/Rigidity-of-Smooth-Billiards-with-a-Continuous-Caustic-Collar-September-24-2026/paper.pdf
  - preprints/Continuous-Phase-Foliations-Create-Analytic-Caustic-Collars-September-24-2026/paper.pdf
draft: false
---

Roll a ball inside an elliptical table and launch it at a shallow angle. It never crosses a certain smaller ellipse with the same two foci: every segment of its path is tangent to that inner curve, its caustic. Shallower launches give caustics closer to the rim, and the nested caustics fill a whole band inside the wall. This is what it means for the elliptical billiard to be integrable. George Birkhoff, who turned the convex billiard into a model dynamical system in 1927, is credited with asking the converse, first printed by Poritsky in 1950: is the ellipse the only table whose billiard is integrable? The conjecture has been attacked for decades with partial success: Lazutkin showed in 1973 that every smooth positively curved table has a Cantor set of caustics near the rim, which can leave gaps; Bialy proved in 1993 that a table whose entire phase space is foliated by invariant curves is a circle; and Avila, De Simoi and Kaloshin in 2016, then Kaloshin and Sorrentino in 2018, proved it for tables close to ellipses, in two Annals papers. The version in which integrability is assumed only near the boundary, with no closeness to an ellipse, is the near-boundary Birkhoff conjecture. On 24 September 2026 OpenAI posted two papers claiming it for smooth tables of positive curvature. [1][2][3][4]

As of 20 October 2026 no mathematician has said publicly that they have read or checked the proofs. The status on this page is "unreviewed".

## The problem

Let $\Omega\subset\mathbb R^{2}$ be a bounded strictly convex domain whose boundary is a $C^{\infty}$ curve of positive curvature. The billiard map $T$ records each bounce by the arclength $s$ of the point of impact and the angle $\delta\in(0,\pi)$ of the outgoing velocity with the tangent, so $T$ acts on the cylinder $M=(\mathbb R/L\mathbb Z)\times(0,\pi)$, and $\delta\to0$ is the grazing end, shallow shots along the rim. A smooth closed convex caustic is a smooth closed convex curve inside $\Omega$ such that a billiard segment tangent to it remains tangent after reflection; in phase space it is an invariant closed curve going round the cylinder. A continuous caustic collar is a homeomorphism $H_0:S^{1}\times[0,1)\to A$ onto a neighbourhood $A$ of the boundary, with $H_0(S^{1}\times\{0\})=\partial\Omega$ and every $H_0(S^{1}\times\{b\})$, $0<b<1$, a smooth closed convex caustic. [1]

**The near-boundary Birkhoff conjecture.** If a smooth strictly convex positively curved table has a continuous caustic collar, it is an ellipse. [1]

<!-- uruk:visual-note
A visual for this page is the billiard itself: trajectories in an ellipse hugging their confocal caustics, then the same table with a one-percent three-lobed wobble, where the picture near the rim looks unchanged while islands and a chaotic sea appear further in; and the phase-space portrait, with the band of shallow angles filled by invariant curves for the ellipse and broken for the wobble. The papers contain seven TikZ figures of these objects.
-->

## Why it stayed open

Why the near-boundary version is the hard one. Lazutkin's theorem gives every such table many caustics near the rim, but only a Cantor family with gaps; the conjecture asks what happens when there are no gaps. Marvizi and Melrose built an approximate grazing integral, exact only up to a flat error. Bialy's rigidity needs the whole phase space; Avila, De Simoi, Kaloshin and Sorrentino needed the table to be a small perturbation of an ellipse; Bialy and Mironov needed central symmetry and a foliation reaching the four-bounce orbits. A small grazing collar supplies none of these. Mather showed that positive curvature matters: where the curvature vanishes there are no grazing caustics at all. [1][2]

## What OpenAI claims

**Theorem 1.2** (continuous caustic collar; OpenAI, 24 September 2026). If $\Omega$ has a continuous caustic collar, then $\Omega$ is an ellipse: there are $c\in\mathbb R^{2}$ and a positive-definite symmetric matrix $Q$ with $\Omega=\{x:(x-c)^{T}Q(x-c)<1\}$. Circles are included. [1]

**Theorem** (phase-foliation rigidity; companion). Suppose a $T$-invariant open annulus $U\subset M$ contains $(\mathbb R/L\mathbb Z)\times(0,\eta)$ for some $\eta>0$, and there is a homeomorphism $H:S^{1}\times(0,1)\to U$ whose leaves are essential simple closed curves, each invariant under $T$. Then $\Omega$ is an ellipse. [2]

What these do and do not say. Only continuity of the leaves and of their transverse dependence is assumed; the foliation need not extend beyond the collar, and $\eta$ may be arbitrarily small. The table must be $C^{\infty}$ with positive curvature. The theorems do not address the full Birkhoff conjecture in its other common forms, such as integrability on a positive-measure set with gaps, and VibeMathed accordingly files the result as partial relative to the whole conjecture. The companion's phase-space statement does not assume the invariant curves are tangent lines of smooth caustics; constructing the physical collar is its job. [1][2]

## How the claimed proof goes

What follows is a map of the main paper's argument from its introduction, which the paper itself divides into three parts, and from the dependency table and main theorem statements of its eleven sections. It is not a check of the details. [1]

**The statement being proved.** Theorem 1.2 of the main paper: if a smooth, positively curved table $\Omega$ has a continuous caustic collar, a full family of convex caustics filling a neighbourhood of the boundary, then $\Omega$ is an ellipse, $\{x:(x-c)^{T}Q(x-c)<1\}$ for a positive definite $Q$, circles included. The hypothesis says nothing about the dynamics farther inside, and a Cantor family of invariant curves accumulating at the boundary, which Lazutkin's theorem always provides, does not satisfy it. The companion paper's Theorem 1.1 weakens the hypothesis further: a continuous foliation of an annulus near the boundary of the phase cylinder by essential invariant curves, without assuming they are tangent lines of smooth convex caustics, already forces the ellipse; its Section 2 passes from continuous leaves to periodic invariant graphs and its Section 5 builds a physical collar of analytic caustics, after which the main paper applies. [1][2]

**Part one: rational caustics force analyticity (Sections 2 and 3).** Nesting of the caustics and the area-recurrence property imply that every sufficiently small rational rotation number occurs on a leaf made entirely of periodic orbits. The actions of these periodic orbits, as functions of the rotation number, form a high-frequency system whose derivative is the identity up to a small operator (Proposition 2.4, the high-frequency estimate), and an analytic Newton construction inverts it to upgrade the boundary from smooth to analytic (Theorem 2.1, analytic regularity). A second construction uses both the values and the first parameter jets at rational resonances to produce a jointly analytic parametrization of the glancing collar (Theorem 3.1, with a Newton step across all retained resonances in Proposition 3.3). This is where the "merely continuous" foliation is converted into analytic data. The paper names Lazutkin's and Marvizi-Melrose's grazing expansions, the rational-action Fourier test of Avila, De Simoi and Kaloshin, and Kaloshin-Sorrentino's use of complex singularities as method ancestry, "not formal inputs", since those works were perturbative and this one treats an arbitrary table. [1]

**Part two: finite chains determine their lines (Section 4).** Finite reflected chains determine their intermediate lines algebraically from the jets at their endpoints, through a finite system for one-variable jets combined with a coalescing-impact scaling (Theorems 4.4 and 4.5, line-endpoint and point-endpoint determination). This local determination controls monodromy of the complex continuation: Theorem 4.9, the no-patch property, says that at a finite first continuation wall, the first height at which the complexified boundary stops continuing, no joint meromorphic patch of the primary branch passes through any point of the wall. The paper separates this finite jet determination from the later growth analysis and states it independently. [1]

**Part three: the complexified boundary (Sections 5 to 11).** The analytic boundary is continued into a horizontal strip in the complex parameter and studied through its meromorphic unit normal $a$, of modulus one on the real axis, and two analytic derivative fields. Theorem 5.3: if $a$ has a zero or a pole in the strip, a reflection symmetry about that "isotropic centre" extends the continuation past an edge of the strip, which with the no-patch property forces the boundary to be an ellipse. If there are none, continued impacts lift to one global complex shape coordinate (Theorem 5.4, the global shape lift). Sections 6 and 7 study growth at the edge of the shape strip through normalized chord equations and passage through cones (Theorem 6.3), excluding subcritical growth (Proposition 6.6), finite superlinear growth (Theorem 6.8), and entire or infinite-order growth through exponential-profile obstructions (Theorems 7.1 and 7.7). What remains is a critical finite-width case. Section 8 proves conditional estimates there: a critical moment bootstrap (Theorem 8.4), the exclusion of vanishing "quiet" profiles at individual centres (Theorem 8.6), a power saving (Proposition 8.8), and the conditional angle-budget reduction (Theorem 8.11), which bounds the total angular change along paths through regions where the fields are large. Section 9 excludes the critical sequence independently (Theorem 9.1) by a first-field model and a high-modulus mesh contradiction (Theorem 9.11); the paper is explicit that the angle budget is activated only after these exclusions. Section 10 fixes one odd periodic chain and uses matrix identities to transfer the angle budget to Brownian paths stopped before the shape boundary (Theorems 10.3 and 10.9, boundary contact and stopped geometry at every power). Section 11 finds a horizontal row on which the first field is robustly small or large outside a set of vanishing relative measure (Theorem 11.6, the deterministic row sign test; Proposition 11.7, a robust sign disk), and the sign test on that row keeps the last moving impact away from the boundary, contradicting the assumed first wall (Theorem 11.10, the last-site contradiction). With no finite wall, the continuation is entire, which was excluded in Section 7, so an isotropic centre must exist and the table is an ellipse. [1]

**Two reusable pieces.** The paper singles out the finite-chain determination principle with its monodromy consequence, and the combination of an individual-centre quiet-profile obstruction with moment bounds, by which a local analytic passage forces a global width improvement so that even an exceptional sequence of quiet centres is ruled out. [1]

Where would an expert look first? At Part one, where area recurrence is said to yield full curves of periodic orbits from a continuous foliation and the Newton step produces analyticity from smoothness alone; at the no-patch property of Section 4, on which the whole continuation strategy rests; and at Sections 10 and 11, where the Brownian-path transfer and the row sign test are the unfamiliar steps. In the companion, at the construction of smooth convex caustics from continuous invariant curves. [1][2]

## Consequences inside mathematics

If the proofs hold, the near-boundary form of Birkhoff's conjecture is settled for smooth positively curved tables: integrability in any neighbourhood of the rim, however thin, forces an ellipse, with no closeness to an ellipse assumed. The perturbative theorems of Avila, De Simoi, Kaloshin and Sorrentino become special cases, and the method, analytic regularity from rational caustics followed by complex continuation, is one that may apply to other rigidity questions for twist maps. The full conjecture, where integrability may have gaps, remains a separate question. [1][2]

## Uses outside mathematics

No known direct application.

Billiards are a model for ray optics, acoustics and the motion of particles in cavities; whispering-gallery modes in optical resonators are the wave version of grazing caustics. The theorem is about which shapes are exactly integrable, a question of the mathematical model. [1]

## Has anyone checked it?

We found no named mathematician who says they are reading or checking these papers, and no public comment from Kaloshin, Sorrentino, Bialy, Mironov, Avila or De Simoi, whose work they build on. VibeMathed records no check by an independent mathematician. [5]

**Machine checking.** None. Family 147 has no Lean scope note and no comparator statement in the release. [6]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; neither paper in this family is among them. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [7]

## Sources

1. OpenAI, "Rigidity of smooth billiards with a continuous caustic collar", 24 September 2026. Definition 1.1, Theorem 1.2, the context and "The main ideas". Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Rigidity-of-Smooth-Billiards-with-a-Continuous-Caustic-Collar-September-24-2026/paper.pdf
2. OpenAI, "Continuous phase foliations create analytic caustic collars", 24 September 2026. The phase-foliation theorem and "Context and significance". https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Continuous-Phase-Foliations-Create-Analytic-Caustic-Collars-September-24-2026/paper.pdf
3. Artur Avila, Jacopo De Simoi and Vadim Kaloshin, "An integrable deformation of an ellipse of small eccentricity is an ellipse", Annals of Mathematics 184 (2016), 527-558. https://doi.org/10.4007/annals.2016.184.2.5
4. Vadim Kaloshin and Alfonso Sorrentino, "On the local Birkhoff conjecture for convex billiards", Annals of Mathematics 188 (2018), 315-380. https://doi.org/10.4007/annals.2018.188.1.6
5. VibeMathed, "The near-boundary Birkhoff conjecture", read 20 October 2026. https://vibemathed.com/problem/birkhoff-conjecture-near-boundary
6. OpenAI, `lean/docs/` and `lean/formalization.yaml` at the pinned commit, which contain no entry for family 147. https://github.com/openai/math/tree/4eaee87548250b2682affda7d05d947c05554bae/lean/docs
7. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
