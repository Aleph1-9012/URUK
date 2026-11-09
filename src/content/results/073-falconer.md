---
family: "073"
topic: "Falconer's distance conjecture"
title: "How big must a dust cloud be before its distances fill an interval?"
paperTitle: "The Falconer distance conjecture in all dimensions"
claim: "For every integer d ≥ 2 and every compact set E in R^d with Hausdorff dimension greater than d/2, the set of distances {|x − y| : x, y ∈ E} has positive Lebesgue measure. The Falconer distance conjecture holds in every dimension, with no regularity assumption and with the strict threshold."
status: unreviewed
checked: 2026-10-18
papers:
  - preprints/The-Falconer-distance-conjecture-in-all-dimensions-September-23-2026/paper.pdf
draft: false
---

Take a set of points in the plane and write down every distance between two of them. A solid patch produces every distance up to its width. A finite set of $n$ points produces at most $\binom n2$ distances; Erdős asked how few, and Guth and Katz answered in 2010. In between are fractal sets: dust clouds with a dimension between $0$ and $2$. In 1985 Kenneth Falconer asked how large the dimension of a compact set must be to force its distance set to have positive length, proved that dimension above $3/2$ suffices in the plane and above $(d+1)/2$ in $\mathbb R^{d}$, and showed with lattice examples that $d/2$ is the best one could hope for. The conjecture that $d/2$ suffices became one of the central problems of harmonic analysis, attacked with Fourier restriction, decoupling and, most recently, the projection theory of fractal sets; forty years of work brought the planar threshold down to $5/4$ and the three-dimensional one to about $12/7$. On 23 September 2026 OpenAI posted a sixty-four-page paper claiming the conjecture in every dimension. [1][3][4][5]

As of 18 October 2026 no mathematician has said publicly that they have read or checked the proof. The status on this page is "unreviewed".

## The problem

For $E\subset\mathbb R^{d}$ the distance set is $\Delta(E)=\{|x-y|:x,y\in E\}\subset[0,\infty)$. Hausdorff dimension $\dim_HE$ is the standard measure of the size of a fractal set: a smooth curve has dimension $1$, a surface $2$, the middle-thirds Cantor set $\log2/\log3$. Lebesgue measure $\mathcal L^{1}$ is length. [1]

**Falconer's conjecture (1985).** If $E\subset\mathbb R^{d}$ is compact and $\dim_HE>d/2$, then $\mathcal L^{1}(\Delta(E))>0$. [1][3]

Why $d/2$ cannot be lowered: on a grid of spacing $1/N$ in $\mathbb R^{d}$ every squared distance is an integer over $N^{2}$, so the distances crowd onto few values; thickening the grid points slightly and iterating at finer scales gives compact sets of dimension exactly $d/2$ whose distance sets have length zero. [1][3]

<!-- uruk:visual-note
A visual for this page can show a random Cantor-like dust in the plane at adjustable dimension, with its distance set drawn as a bar below; at low dimension the bar is a sparse set of points, and as the dimension passes $1$ the bar should fill in. It can show the lattice example at dimension $1$ whose distances do not fill. It cannot show the proof.
-->

## Why it stayed open

What was known. Falconer proved the threshold $(d+1)/2$. Mattila's 1987 criterion turned the problem into an estimate on spherical averages of the Fourier transform of a measure on $E$, and Bourgain connected improvements to Fourier restriction. Wolff reached $4/3$ in the plane in 1999 and Erdoğan $d/2+1/3$ in higher dimensions in 2005. Decoupling and weighted restriction gave $9/5$ in $\mathbb R^{3}$, by Du, Guth, Ou, Wang, Wilson and Zhang, and Du and Zhang's bound for $d\ge4$. In 2020 Guth, Iosevich, Ou and Wang proved the planar threshold $5/4$, with the stronger pinned conclusion that some single point of $E$ already sees a positive-length set of distances; Du, Iosevich, Ou, Wang and Zhang did the analogue in even dimensions, and Du, Ou, Ren and Zhang reached $d/2+1/4-1/(8d+4)$ for $d\ge3$. At the critical dimension itself, Shmerkin and Wang showed in 2025 that sets with equal Hausdorff and packing dimension $d/2$ have distance sets of Hausdorff dimension one, and Liu proved the planar conjecture for sets whose Hausdorff and packing dimensions agree. The full conjecture, for arbitrary compact sets, was open in every dimension. [1][4][5]

## What OpenAI claims

**Theorem 1.1** (OpenAI, 23 September 2026). Let $d\ge2$ be an integer and let $E\subset\mathbb R^{d}$ be compact. If $\dim_HE>d/2$, then $\mathcal L^{1}(\Delta(E))>0$. [1]

What this does and does not say. The only hypothesis is the strict dimension inequality: no equality of Hausdorff and packing dimensions, no Ahlfors regularity, no product structure and no Fourier decay are assumed. The conclusion is positive measure, stronger than Hausdorff dimension one. The theorem is unpinned: it says nothing about distances from a single point at the threshold $d/2$, and nothing at the endpoint $\dim_HE=d/2$. The paper states that it "does not invoke a decoupling theorem or any earlier distance theorem at an improved threshold". [1]

## How the claimed proof goes

What follows is a map of the paper's argument from its introduction and section plan. It is not a check of the details. The paper is long and technical; what follows names its moving parts and the order in which they act. [1]

**The idea.** Put $S=d/2$, the critical dimension. Reduce to two separated Frostman measures $\mu,\nu$ on $E$, each of dimension $s>S$, and prove that the distance measure they generate, the pushforward of $\mu\times\nu$ under $(x,y)\mapsto|x-y|$, has an $L^{2}$ density, which forces $\Delta(E)$ to have positive length. Two things stand in the way in higher dimensions and the paper treats them in turn: the angular distribution of the measures, seen by radial projection from a point, need not be regular, and the angular information, once obtained, has to be converted into a Fourier estimate for distances. The paper lists its methodological ancestors, Keleti and Shmerkin's multiscale profiles for planar distance sets, Shmerkin and Wang's radial projections and slicing, Orponen and Shmerkin's incidence approach and Orponen, Shmerkin and Wang's thin-tube bootstrap, and the higher-dimensional radial and plate methods of Ren and of Du, Ou, Ren and Zhang, and states that it invokes no decoupling theorem and no earlier distance theorem at an improved threshold. [1]

**Issue one: cap bounds without densities (Sections 3 to 5).** The radial projection of an $s$-dimensional set from a point cannot have dimension more than $s$, so when $S<s<d-1$ one cannot assume the projections have densities on the sphere $S^{d-1}$. Instead the paper builds decreasing sets $\Gamma_N$ of admissible pairs of points whose intersection has positive product mass, and shows that at each scale $2^{-N}$, after deleting an exceptional set of pairs of power-small mass, every directional fibre, the opposite measure restricted by the pair condition at a fixed endpoint and pushed to the sphere, satisfies a cap bound with exponent $S$ and an arbitrarily small power loss (Proposition 5.10, starting pair measures). Integer exponents come from supercritical radial integrability after projecting to a smaller space (Lemma 5.7, radial $L^{p}$ estimate). In odd dimensions, where $S$ is a half-integer, a thin-tube upgrade supplies the missing half dimension (Proposition 5.4): its linear projection gain (Theorem 4.1) is proved by slicing to the plane and applying the Orponen-Shmerkin Furstenberg-set theorem in the tube form of Orponen, Shmerkin and Wang (Theorem 4.2, the planar discretized Furstenberg estimate), with Haar band estimates and a careful selection of slices to control the losses; the integer endpoint needs a separate transverse-triple argument, a Loomis-Whitney-type tube count (Lemma 4.6) together with a weak radial estimate proved by Orponen's finite-energy method. A coarse filter excludes heavy plates in odd dimensions (Lemma 5.9). All auxiliary projections concern directions and incidences only; every distance in the rest of the proof is measured in the original $\mathbb R^{d}$. [1]

**Issue two: from caps to belts (Section 6).** A cap bound controls parallel tubes, whereas a scalar projection test, a test of the form $\langle x-y,\theta\rangle\approx c$, involves belts on the sphere. The paper derives the belt estimate from a Fourier calculation for half-dimensional directions (Lemma 6.3) whose annular power is $B^{d-2S}$, equal to one exactly at $S=d/2$. That is the precise sense in which the conjecture's threshold is critical for the method, and the resulting directional tests, with their exceptional directions of small mass (Lemma 6.4), are what the recursion consumes. [1]

**The recursion (Sections 7 to 9).** At a dyadic frequency $R=2^{N}$, decompose each Frostman measure into almost uniform dyadic classes (Lemma 3.1, regular classes) with a mass profile $m$, so that occupied cells at depth $n$ have mass about $R^{-m(n/N)}$, and define the excess profile $A_n=m(n/N)-Sn/N$, which records decay beyond the critical exponent. Two quantities drive the argument: $\mathsf D$, a count of pairs with nearly equal distances, and $\mathsf H$, a product of spherical Fourier energies with independent angular variables. The high-frequency part of $\mathsf D$ is split into distance-frequency shells; stationary phase produces the square of an angular inner product $\mathsf H_F$, which Cauchy-Schwarz bounds by $\mathsf H$ (Section 7, Proposition 7.4, the weighted shell conversion); the graph estimate then uses the parallel tests to advance to finer cells (Section 8, Proposition 8.1), while other reductions return to positive distance counts or shorten the interval of scales. An angular state carries tests selected on an interval containing the current one, each retained until the recursion reaches its depth. [1]

**The ledger (Sections 9 and 10).** The recursion's positive step costs are paid by a potential formed from two values of $A_n$ at sufficiently separated depths, which the paper calls a ledger, in the tradition of Keleti and Shmerkin's profile optimization but with a two-depth potential in place of a sum of interval drops. For two profiles, let $c$ be the last depth at which either excess profile is at most a small fixed level $\beta$; the graph estimate passes the angular energy to cells at depth $c$, Cauchy-Schwarz in the radial variable bounds this by the geometric mean of two single-profile states, each potential is at least $2\beta-O(1/N)$ while the entry cost is at most $\beta$ up to regularization loss, the profile increments cancel, and a strictly decaying Fourier shell bound remains once the losses are small (Theorem 10.4, the single-profile angular bound). [1]

**Assembly (Section 11).** The coarse restrictions $\Gamma_N$ need not converge at a quantitative rate, so the paper uses a scalar shell principle: if positive measures $\alpha_N$ decrease to $\alpha_\infty$, are within total variation $2^{-\eta N}$ of measures $\tau_N$ whose Fourier transforms have $L^{2}$ mass at most $2^{-\gamma N}$ on the shell $2^{N-1}\le|r|\le2^{N+1}$, then $\alpha_\infty$ is absolutely continuous, by summable positive increments and telescoping smooth cutoffs (Lemma 11.4, the monotone measure shell criterion). The limiting distance measure is nonzero and carried by $\Delta(E)$, which proves the theorem. [1]

Where would an expert look first? At the cap-bound construction when $S<s<d-1$, especially the odd-dimensional thin-tube gain and its transverse-triple endpoint; at the half-dimensional Fourier estimate and the claim that the critical annular power is exactly one; at the two-depth ledger and the cancellation of profile increments; and at the shell principle's hypotheses being met without a convergence rate for $\Gamma_N$. [1]

## Consequences inside mathematics

If the proof holds, Falconer's distance conjecture is settled in every dimension, closing a forty-year programme that drove much of modern Fourier restriction theory and its interaction with the geometry of fractal sets. The pinned versions at the threshold, the endpoint, and the quantitative dependence on the dimension remain open, and the paper says so. The paper also cites the release's separate theorem on distinct distances for finite point sets in $\mathbb R^{d}$, the discrete cousin, as a parallel result. [1]

## Uses outside mathematics

No known direct application.

## Has anyone checked it?

We found no named mathematician who says they are reading or checking this paper, and no public comment from Guth, Iosevich, Ou, Wang, Shmerkin, Orponen or Du, whose work it builds on. VibeMathed records no check by an independent mathematician. [6]

**Machine checking.** The release's Lean scope note says the formalization "proves the Falconer distance conjecture in every dimension" and links two statements. Only one is in the catalogue `formalization.yaml`: `PlanarFalconer.lean`, 25 lines, which states the planar case, compact $E\subset\mathbb R^{2}$ with $\dim_HE>1$, using Mathlib's own Hausdorff dimension and Lebesgue measure, so the statement is as clean as a formal statement gets. The all-dimensions statement, `FalconerAllDimensions.lean`, 19 lines, is linked but not catalogued. The planar case alone, if the formal proof behind it is complete, would already be the open planar conjecture. We found no outside replay. A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval. [2]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; this paper is not among them. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [7]

## Sources

1. OpenAI, "The Falconer distance conjecture in all dimensions", 23 September 2026. Theorem 1.1, the history and scope section, the methodological antecedents, the two main issues and the profile section. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/The-Falconer-distance-conjecture-in-all-dimensions-September-23-2026/paper.pdf
2. OpenAI, Lean scope note for family 073 and the comparator statements `PlanarFalconer.lean` and `FalconerAllDimensions.lean` at the pinned commit, with `lean/formalization.yaml`. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/073.md , https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/PlanarFalconer.lean , https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/FalconerAllDimensions.lean and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/formalization.yaml
3. K. J. Falconer, "On the Hausdorff dimensions of distance sets", Mathematika 32 (1985), 206-212. https://doi.org/10.1112/S0025579300010998
4. Larry Guth, Alex Iosevich, Yumeng Ou and Hong Wang, "On Falconer's distance set problem in the plane", Inventiones Mathematicae 219 (2020), 779-830. https://doi.org/10.1007/s00222-019-00917-x
5. Pablo Shmerkin and Hong Wang, "On the distance sets spanned by sets of dimension d/2 in R^d", Geometric and Functional Analysis 35 (2025), 283-358. https://doi.org/10.1007/s00039-024-00696-5
6. VibeMathed, "Falconer distance conjecture", read 18 October 2026. https://vibemathed.com/problem/falconer-distance-conjecture
7. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
