---
family: "350"
topic: "Yau's nodal-set conjecture"
title: "How long are the silent lines on a vibrating drum?"
paperTitle: "Sharp nodal length on smooth surfaces"
claim: "On every closed smooth Riemannian surface, the zero set of every Laplace eigenfunction with eigenvalue λ has length at most C√λ, with C depending only on the surface; together with the known lower bound this proves Yau's conjecture for smooth surfaces. In dimensions three and four the corresponding upper bound fails for fixed smooth metrics, including metrics on S^3 arbitrarily close to the round one; in dimension five the nodal measure can grow faster than λ^(1/2+ε_0) for a fixed ε_0 > 0."
status: unreviewed
checked: 2026-10-20
papers:
  - preprints/Sharp-nodal-length-on-smooth-surfaces-September-23-2026/paper.pdf
  - preprints/Smooth-counterexamples-to-Yaus-nodal-upper-bound-in-dimensions-three-and-four-September-23-2026/paper.pdf
draft: false
---

Sprinkle sand on a metal plate and bow its edge: the sand collects along the lines where the plate does not move. Ernst Chladni showed these figures to Napoleon in 1809, and they are the nodal sets of the plate's vibration modes, the zero sets of eigenfunctions of the Laplacian. Higher notes give finer patterns. In 1982 Shing-Tung Yau conjectured the rule: on any closed surface, or any closed manifold of dimension $n$, the nodal set of the mode with eigenvalue $\lambda$ has $(n-1)$-dimensional size between $c\sqrt\lambda$ and $C\sqrt\lambda$, with constants depending only on the shape. Donnelly and Fefferman proved it in 1988 when the shape is real-analytic. For merely smooth shapes the lower bound was proved by Alexander Logunov in 2018, together with a polynomial upper bound, in work for which he and Eugenia Malinnikova received a Clay Research Award; on surfaces the two of them pushed the upper bound to $\lambda^{3/4-\beta}$, still short of $\sqrt\lambda$. On 23 September 2026 OpenAI posted three papers with a split verdict: the sharp upper bound holds on every smooth surface, and it is false in dimensions three, four and five. [1][2][3][4][5]

As of 20 October 2026 no mathematician has said publicly that they have read or checked the proofs. The status on this page is "unreviewed".

## The problem

Let $(M,g)$ be a closed connected smooth Riemannian manifold of dimension $d$, a compact curved space without boundary with a smoothly varying way of measuring length. The Laplace-Beltrami operator $\Delta_g$ generalizes the second derivative; its eigenfunctions solve $-\Delta_gu=\lambda u$ and describe the standing waves of $M$, with $\lambda$ proportional to the squared frequency. The nodal set $Z_u=\{u=0\}$ is where the wave is silent; its size is measured by $(d-1)$-dimensional Hausdorff measure $\mathcal H^{d-1}_g$, which is length on a surface and area in three dimensions. [1][2]

**Yau's conjecture (1982).** There are constants $c_g,C_g>0$, depending on the one fixed metric, such that for every nonzero real eigenfunction,

$$
c_g\sqrt\lambda\le\mathcal H^{d-1}_g(Z_u)\le C_g\sqrt\lambda.
$$

[2]

Two points the papers insist on. The metric is fixed once and the constants must work for all its eigenfunctions; a metric chosen anew for each eigenvalue is a different and easier question. And the two inequalities are logically separate: a counterexample to the upper bound says nothing about the lower. [2]

<!-- uruk:visual-note
A visual for this page is the Chladni figures themselves: eigenfunctions of a square or a disc with nodal lines drawn, frequency rising, nodal length counted and plotted against $\sqrt\lambda$ to show the linear growth on a surface. For the counterexample, a sketch of a corrugated bump on a three-sphere where the nodal surfaces of a wave packet are folded many times.
-->

## Why it stayed open

What was known. Donnelly and Fefferman proved both bounds for real-analytic metrics. For smooth metrics, Brüning proved the lower bound on surfaces in 1978 and Logunov in every dimension in 2018; for the upper bound, Hardt and Simon had a bound exponential in $\sqrt\lambda$, Logunov proved a polynomial bound $\lambda^{\alpha}$ in dimensions at least three, and on surfaces Donnelly and Fefferman's $\lambda^{3/4}$ was improved by Logunov and Malinnikova to $\lambda^{3/4-\beta}$. Separately, a line of work by Enciso, Peralta-Salas and others showed that by choosing the metric one can prescribe the topology of nodal sets; the question here is about size along a sequence of eigenfunctions of one metric. [1][2][3]

## What OpenAI claims

**Theorem 1.1** (OpenAI, "Sharp nodal length on smooth surfaces", 23 September 2026). Let $(M,g)$ be a closed connected $C^{\infty}$ Riemannian surface. There is a finite constant $C=C(M,g)$ such that every nonzero real eigenfunction with $-\Delta_gu=\lambda u$, $\lambda>0$, satisfies

$$
\mathcal H^{1}_g(Z_u)\le C\sqrt\lambda.
$$

Together with Brüning's lower bound, this resolves Yau's conjecture for smooth closed surfaces. [1]

**Theorems 1.1 and 1.2** (OpenAI, "Smooth counterexamples to Yau's nodal upper bound in dimensions three and four"). Every $C^{\infty}$ neighbourhood of the round metric on $S^{3}$ contains a smooth metric $g_\infty$ with eigenfunctions $u_j$, $\lambda_j\to\infty$, and $\mathcal H^{2}_{g_\infty}(Z_{u_j})/\sqrt{\lambda_j}\to\infty$. The same holds for a smooth metric on $S^{2}\times\mathbb T^{2}$. [2]

**Theorem 1.1** (OpenAI, "Power-law violations of Yau's nodal upper bound"). There are a smooth metric $g$ on $S^{4}\times S^{1}$, an $\varepsilon_0>0$ and eigenfunctions with $\lambda_j\to\infty$ and $\mathcal H^{4}_g(Z_{u_j})/\lambda_j^{1/2+\varepsilon_0}\to\infty$; products extend this to every dimension above five. [5]

What these do and do not say. The surface theorem is for arbitrary smooth metrics with no analyticity, and the constant is uniform over every eigenspace. The counterexamples refute only the upper inequality, for one fixed smooth metric; they do not contradict the lower bound, Donnelly and Fefferman's analytic theorem, or Logunov's polynomial bound, within which they sit. The three- and four-dimensional examples assert unbounded ratio but no power law; the five-dimensional one asserts a fixed positive power. [1][2][5]

## How the claimed proofs go

What follows is a map of the two main arguments from the papers' introductions and from the statements of their principal theorems. It is not a check of the details. [1][2]

**Surfaces: the target.** In local smooth isothermal coordinates the metric is $p(x)(dx_1^{2}+dx_2^{2})$ and the eigenfunction equation becomes $\Delta u+k^{2}p\,u=0$ with $k=\sqrt\lambda$ the frequency. The input that converts growth into length is a theorem of Roy-Fortin (Theorem 6.1 of the paper): if $\Delta F+qF=0$ on a disk of radius $3$ with $\|q\|_\infty$ small, and $\beta$ is the logarithm of the ratio of the sup norms of $F$ on the disks of radius $5/2$ and $1/4$, then the nodal length of $F$ in the disk of radius $1/60$ is at most $C\max\{1,\beta\}$; the potential need not have a sign. After rescaling to squares of side $s\approx1/k$ and converting sup norms to $L^{2}$ norms (Lemma 6.2), each terminal square $Q$ contributes nodal length at most $Cs(1+E(Q,0))$, where $E(Q,0)$ is the logarithmic growth of the $L^{2}$ norm from the disk of radius $s$ to one of radius $Rs$. There are $O(s^{-2})$ squares in a coordinate region, so if the average of $E(Q,0)$ over terminal squares is bounded, the total nodal length is $O(s^{-1})=O(k)$. The whole paper is the proof that the average is bounded (Theorem 5.5, bounded mean growth), while individual squares may have large growth. This statistical formulation follows Nazarov, Polterovich and Sodin's programme. [1]

**Surfaces: subharmonic profiles (Section 2).** Lemma 2.1 extracts a logarithmic profile from norms of $u$ measured on an exponential scale, and Theorem 2.2 proves that such profiles are subharmonic: for solutions $\Delta U_j+K_j^{2}p_jU_j=0$ on a planar disk with weights $e^{-2B_j\cdot x}$, under the separation $K_j/D_j\to0$ from the rescaled frequency where $D_j=S_j+|B_j|$ combines the scale and the tilt, every upper semicontinuous limiting profile is subharmonic, even for arbitrarily large tilts $B_j$. The engine is a localized Carleman estimate (Lemma 2.3) whose decisive feature the paper calls two-dimensional: when the normalized derivative energy is perpendicular to the weight gradient, the commutator sees the full trace of the weight's Hessian. Proposition 2.5 gives the initial growth bound on a fixed disk. [1]

**Surfaces: affine correction and descent (Sections 3 and 4).** A local affine part of a profile is an obstruction to decay, since its oscillation and the rescaled frequency $ks$ shrink by the same factor under subdivision. Lemma 3.3 subtracts that affine part and carries its slope separately; Proposition 3.4, one subdivision step, shows the remaining profile growth decreases faster than the side length on average while slope changes have bounded average cost, using a uniform potential decomposition (Lemma 3.2). Section 4 iterates: one step of descent, stopped descents along grid paths that may terminate, the fact that a large slope forces large growth (Lemma 4.3), and the stability of large growth (Proposition 4.4). [1]

**Surfaces: persistence and packing (Section 5).** Grid paths are divided into excursions of high growth. At an entry, Lemma 5.2 and Proposition 5.3 show that a newly entered excursion produces a nearby set of positive area on which high growth persists down to the terminal scale. These witness sets may lie outside their entry squares, so Lemma 5.4 is a packing argument that counts discrepancies between spatial membership and grid ancestry and confines them to summable boundary collars. Theorem 5.5 then bounds the terminal mean growth by a constant independent of the eigenfunction and of the number of levels; the proof fixes a threshold $H$, observes that a terminal path with no active excursion has growth at most $H$ and every other has exactly one final active entry, and uses the disjointness of the active sets $\Omega_Q$ as the entry $Q$ varies. All constructions are local, so no orientability is needed. [1]

**Dimensions three and four: quasimodes with many sign changes.** The counterexample paper starts from a background metric with explicit high-frequency eigenfunctions, the round metric on $S^{3}$ or a product metric on $S^{2}\times\mathbb T^{2}$, and a region left unchanged by all local corrections. Section 2 of the $S^{3}$ branch amplifies the mean gradient of a smooth logarithmic envelope by transverse radial corrugation in two variables (Lemma 2.5), with a fixed gain per step and finite iteration, so that the integrated gradient becomes arbitrarily large while a strict Hessian inequality still localizes complex waves. Section 3 builds finite complex waves, quasimodes with arbitrarily small weighted residual, from admissible phase Hessians and a finite Taylor construction (Lemmas 3.1 and 3.2), in the manner of complex-phase WKB after Dencker, Sjöstrand and Zworski. A random Gaussian superposition makes the real value and first derivative jointly nonvanishing (Lemma 3.4) and supplies many strict opposite-sign tests along short coordinate segments; these form a lower semicontinuous "sign functional" bounded above by the nodal Hausdorff measure even when the zero set is not regular (Proposition 3.3, persistence and area comparison for sign tests), and Lemma 3.5 shows the expected sign gain is independent of the profile. [2]

**Dimensions three and four: exactification.** The obstacle is to replace each quasimode by an exact eigenfunction of an ordinary Laplace-Beltrami operator while retaining every sign. On $S^{3}$ (Section 4), a scalar correction with weighted estimates (Lemma 4.1) first corrects the equation with a conductivity and an independent density; a metric conductivity and a positive conjugating factor, a positive solution of a semilinear elliptic equation, make them satisfy the three-dimensional metric determinant identity in the active region (Lemmas 4.2 and 4.3); and a transverse tensor change repairs the remaining defect in a clean annulus, leaving the exterior unchanged (Proposition 4.4). On $S^{2}\times\mathbb T^{2}$ (Section 10), an exact weighted correction with an independent density, a conformal factor whose linearization $\Delta_h-2\lambda$ is coercive, and a change tangent to the level sets enforce the four-dimensional determinant identity (Lemmas 10.1 to 10.4). The paper insists these are separate arguments, not a dimension-independent realization lemma. [2]

**Dimensions three and four: one fixed metric.** The point of the theorem is a single metric, not one chosen per eigenvalue. Section 5 makes the constructed eigenvalue simple with the eigenfunction fixed (Proposition 5.2, using a nondegenerate pencil of symmetric forms), and Section 6 proves continuity of eigenpairs near a simple eigenvalue (Lemma 6.1). Proposition 6.2, one construction step, then says: given a metric $g$ in the admissible class agreeing with the round metric outside a small ball, any $C^{\infty}$ neighbourhood $\mathcal N$ of $g$, any $A>0$ and any $N$, there is a metric $g'\in\mathcal N$ with a simple eigenvalue $\Lambda_n$, $n\ge N$, and an open neighbourhood $\mathcal W$ of $g'$ such that every metric $h\in\mathcal W$ has an exact eigenfunction with eigenvalue within one of $\Lambda_n$ and nodal ratio $\mathcal H^{2}(\{u_h=0\})/\sqrt{\lambda_h}>A$, the neighbourhood being obtained by retaining one sign functional and one strict numerical threshold. Iterating with $A_k\to\infty$ and nested neighbourhoods produces a Cauchy sequence of metrics whose $C^{\infty}$ limit $g_\infty$ lies in every $\mathcal W_k$, hence has eigenfunctions with $\lambda_k\to\infty$ and unbounded ratio; and since each step stays inside the prescribed neighbourhood of the round metric, $g_\infty$ can be taken arbitrarily close to round. The four-dimensional branch repeats the pattern in Sections 7 to 11, with background modes and strict envelopes, finite-order packets, a sign score bounded by nodal measure, and an arbitrarily close step (Proposition 11.3). [2]

Where would an expert look first? In the surface paper, at the Carleman estimate under large affine tilts and at the packing lemma, which together make the mean-growth bound depth-independent; at the use of Roy-Fortin's theorem with a potential of no fixed sign. In the counterexample paper, at the exactification steps, whether the sign functional survives the positive factor and division on $S^{3}$ and the conformal correction on $S^{2}\times\mathbb T^{2}$; and at the persistence proposition, since the one-fixed-metric conclusion rests on the openness of the sets $\mathcal W$. [1][2]

## Consequences inside mathematics

If the proofs hold, Yau's conjecture is true on smooth surfaces and false in every dimension from three up, which rewrites the question: the right smooth upper bound in dimension $d\ge3$ is some power strictly above $1/2$, between the new lower examples and Logunov's polynomial bound, and its exponent is now an open problem. The real-analytic theorem of Donnelly and Fefferman is untouched, so analyticity is exactly what the higher-dimensional bound needs. The three-sphere example, arbitrarily close to round, shows the failure is not exotic. [1][2][5]

## Uses outside mathematics

No known direct application.

Chladni figures and nodal patterns appear in acoustics, in the design of musical instruments and in quantum chaos, where the statistics of nodal lines are studied; the theorem bounds a quantity those fields measure but does not change how they measure it. [3]

## Has anyone checked it?

We found no named mathematician who says they are reading or checking these papers, and no public comment from Logunov, Malinnikova, Mangoubi, Zelditch or Steinerberger. VibeMathed lists the family as a candidate with review pending. [6]

**Machine checking.** The release's Lean scope note links three statements. The two negative ones are in the catalogue `formalization.yaml`: `SmoothYau.lean` (149 lines) for the $S^{3}$ and $S^{2}\times\mathbb T^{2}$ examples, and `YauCounterexample.lean` (72 lines) for $S^{4}\times S^{1}$. The positive theorem for surfaces, `NodalLength.lean` (62 lines), is linked but not catalogued. So, at the pinned commit, the counterexamples are machine-checked statements and the theorem that completes Yau's conjecture on surfaces is not. All three define nodal measure and the Laplacian themselves, which is where a reader should check that the formal statements match. We found no outside replay. A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval. [7]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; none of the three papers in this family is among them. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [8]

## Sources

1. OpenAI, "Sharp nodal length on smooth surfaces", 23 September 2026. Theorem 1.1, the history, "Mean growth as the target" and "Affine correction and persistent growth". Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Sharp-nodal-length-on-smooth-surfaces-September-23-2026/paper.pdf
2. OpenAI, "Smooth counterexamples to Yau's nodal upper bound in dimensions three and four", 23 September 2026. Theorems 1.1 and 1.2, the context and "Two constructions and their common logic". https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Smooth-counterexamples-to-Yaus-nodal-upper-bound-in-dimensions-three-and-four-September-23-2026/paper.pdf
3. Wikipedia, "Chladni figures" (in "Ernst Chladni") and "Nodal set", read 20 October 2026, for the 1809 demonstration and the acoustic background. https://en.wikipedia.org/wiki/Ernst_Chladni
4. Alexander Logunov, "Nodal sets of Laplace eigenfunctions: proof of Nadirashvili's conjecture and of the lower bound in Yau's conjecture", Annals of Mathematics 187 (2018), 241-262; and "Nodal sets of Laplace eigenfunctions: polynomial upper estimates of the Hausdorff measure", Annals of Mathematics 187 (2018), 221-239. https://annals.math.princeton.edu/2018/187-1/p05 and https://doi.org/10.4007/annals.2018.187.1.4
5. OpenAI, "Power-law violations of Yau's nodal upper bound", 23 September 2026. Theorem 1.1. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Power-law-violations-of-Yaus-nodal-upper-bound-September-23-2026/paper.pdf
6. VibeMathed, "Yau's nodal-set conjecture for smooth metrics", read 20 October 2026. https://vibemathed.com/problem/yau-nodal-set-conjecture-smooth
7. OpenAI, Lean scope note for family 350 and the comparator statements `NodalLength.lean`, `SmoothYau.lean` and `YauCounterexample.lean` at the pinned commit, with `lean/formalization.yaml`. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/350.md , https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/NodalLength.lean , https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/SmoothYau.lean and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/YauCounterexample.lean
8. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
