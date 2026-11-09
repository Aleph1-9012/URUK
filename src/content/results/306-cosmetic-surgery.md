---
family: "306"
topic: "Cosmetic surgery on knots"
title: "Can two different surgeries on the same knot produce the same space?"
paperTitle: "Purely cosmetic surgery on knots in the three-sphere"
claim: "For every nontrivial smooth knot K in the three-sphere and every pair of distinct slopes r ≠ s, the Dehn surgeries S^3_r(K) and S^3_s(K) are not orientation-preservingly homeomorphic. The purely cosmetic surgery conjecture holds, including the meridional slope."
status: unreviewed
checked: 2026-10-18
papers:
  - preprints/Purely-Cosmetic-Surgery-on-Knots-in-the-Three-Sphere-September-23-2026/paper.pdf
draft: false
---

Three-dimensional spaces can be built by surgery: drill out a tube around a knot in ordinary space, then glue the tube back in twisted. Each way of twisting is labelled by a fraction, the slope, and every closed three-dimensional space arises this way from some link. The natural question is how much the result remembers. Gordon and Luecke proved in 1989 that if you get ordinary space back, you did nothing: a nontrivial knot cannot be re-glued to give the three-sphere. Cameron Gordon asked in 1990 whether the same holds for every target: could two different slopes on the same knot ever give the same oriented space? Such a pair would be called purely cosmetic. Thirty-five years of work with every tool in low-dimensional topology, Alexander polynomials, Heegaard Floer homology, quantum invariants and hyperbolic geometry, narrowed the possibilities to a single case, opposite slopes of magnitude two on a knot of genus two. On 23 September 2026 OpenAI posted a long gauge-theoretic paper claiming to exclude that case and hence the conjecture in full. [1][3][4]

As of 18 October 2026 no mathematician has said publicly that they have read or checked the proof. The status on this page is "unreviewed".

## The problem

Let $K$ be a smooth knot in the oriented three-sphere $S^{3}$ and $E_K$ its exterior, the sphere with an open tube around $K$ removed. The boundary of $E_K$ is a torus. A slope is an unoriented simple closed curve on it up to isotopy; the meridian $\mu$ bounds a disc in the tube and the preferred longitude $\lambda$ bounds a surface in the exterior, and the class $p\mu+q\lambda$ corresponds to the fraction $p/q\in\mathbb Q\cup\{\infty\}$. Dehn surgery with slope $p/q$ glues a solid torus back so that its meridian disc is attached along that curve; the result $S^{3}_{p/q}(K)$ is a closed oriented three-manifold. Slope $\infty$ gives back $S^{3}$. [1]

Two distinct slopes $r\ne s$ are purely cosmetic if $S^{3}_r(K)$ and $S^{3}_s(K)$ are homeomorphic by an orientation-preserving map. The homeomorphism is arbitrary; it need not come from a symmetry of the knot or preserve the surgered tube. Orientation-reversing coincidences, called chirally cosmetic, do happen, for example on amphichiral knots, and are a different question. [1]

**Purely cosmetic surgery conjecture (Gordon 1990, Kirby's Problem 1.81(A)).** A nontrivial knot in $S^{3}$ has no purely cosmetic pair of slopes. [1][3]

<!-- uruk:visual-note
A visual for this page can show a trefoil, the solid tube around it, the meridian and longitude on the boundary torus, and the re-gluing for a few slopes; and then the slope line $\mathbb Q\cup\{\infty\}$ with the known exclusions shaded in order, Gordon-Luecke at $\infty$, Ni-Wu forcing opposite signs, Hanselman leaving $\pm2$ and $\pm1/q$, Daemi-Lidman-Miller Eismeier removing $\pm1/q$, until only $\{-2,2\}$ on genus-two knots remains. The claimed theorem removes that.
-->

## Why it stayed open

### Thirty-five years of narrowing

Gordon and Luecke's 1989 theorem handles slope $\infty$: knots are determined by their complements. [2] Boyer and Lines obtained an obstruction from the Alexander polynomial in 1990. Heegaard Floer homology then became the main tool: Ozsváth and Szabó's rational surgery formula, Wang's theorem for genus-one knots, Wu's exclusion of same-sign pairs, and Ni and Wu's 2015 theorem that a purely cosmetic pair must consist of opposite slopes $\pm p/q$ with $q^{2}\equiv-1$ modulo $p$. Hanselman's 2023 work with immersed curves cut this to $\pm2$ or $\pm1/q$, with $\pm2$ possible only in genus two. Special classes were settled outright: cables and composites by Tao, pretzel knots by Stipsicz and Szabó, strongly invertible knots in an equivariant sense by Kotelskiy, Lidman, Moore, Watson and Zibrowius. Futer, Purcell and Schleimer verified the conjecture by computer for all knots through nineteen crossings and the SnapPy census, and Ren showed it suffices to treat hyperbolic surgeries on hyperbolic knots. Finally Daemi, Lidman and Miller Eismeier's filtered instanton homology excluded the pairs $\pm1/q$, leaving exactly opposite integer slopes of magnitude two on a genus-two knot. [1][4][5]

Why the last case is hard: the two surgeries have the same homology, the same Heegaard Floer invariants as far as the known formulas see, and the same hyperbolic volume if hyperbolic; everything that distinguishes three-manifolds cheaply has been tried. [1]

## What OpenAI claims

**Theorem 1.1** (OpenAI, 23 September 2026). Let $K\subset S^{3}$ be a smooth nontrivial knot. For any $r,s\in\mathbb Q\cup\{\infty\}$, an orientation-preserving homeomorphism $S^{3}_r(K)\cong S^{3}_s(K)$ implies $r=s$. [1]

What this does and does not say. It resolves the purely cosmetic surgery conjecture for knots in $S^{3}$, including the meridional slope through Gordon-Luecke. It says nothing about chirally cosmetic surgeries, about knots in other three-manifolds, or about cosmetic surgeries on links. The paper uses the human reduction to the case $g(K)=2$, slopes $\{-2,2\}$, as a black box and proves only that case. [1]

## How the claimed proof goes

What follows is a map of the paper's argument from its introduction and section plan. It is not a check of the details. The paper is about eleven thousand lines of gauge theory, and even with the introduction read closely the map is coarse. [1]

**What is left to prove.** The paper takes as input the state of the art: Hanselman's Heegaard Floer work restricted purely cosmetic pairs to slopes $\pm2$ on a genus-two knot or $\pm1/q$, and Daemi, Lidman and Miller Eismeier's filtered instanton argument excluded the $\pm1/q$ pairs. Proposition 1.2 records the reduction: if a nontrivial knot $K\subset S^{3}$ has distinct purely cosmetic slopes, then $g(K)=2$ and the slopes are $-2$ and $2$. So the paper assumes $g(K)=2$ and an orientation-preserving diffeomorphism $\phi:Y_{-2}\to Y_2$ between the two surgeries, which exists by three-dimensional smoothing if a homeomorphism does, and imposes no condition on how $\phi$ behaves near the knot. [1]

**The idea.** Two counts of solutions to gauge-theoretic equations on one closed four-dimensional cobordism built from the surgery pieces and $\phi$. The first is an integer count $\Omega$ of instantons, shown to be nonzero. The second is an oriented count of a one-dimensional moduli space of solutions to a coupled spinor equation, the nonabelian monopole equations, whose boundary points are, by construction, $2^{\eta}\Omega$ copies of the first count plus other contributions that are shown to cancel. A compact oriented one-manifold has boundary of signed count zero, so $2^{\eta}\Omega=0$, contradicting $\Omega\ne0$. The strategy is the nonabelian-monopole cobordism of Pidstrigach and Tyurin and of Okonek and Teleman, developed analytically by Feehan and Leness; the paper's work is to construct the two counts with compatible metrics, incidence conditions, determinant lifts and orientations, and to control every other end of the one-manifold. [1]

**The instanton count (Sections 2 to 5).** Instanton Floer homology and Donaldson theory with determinant-one gauge transformations. At the rational ends $Y_{\pm2}$, where first homology has order two, every flat reducible connection is central; at the zero surgery $Y_0$ the paper uses instead a determinant class evaluating oddly on the capped Seifert surface. Ordinary surgery cobordisms give "handle units" modulo two (Theorem 2.1). The negative direction is harder and needs an interval of metrics, a degree-two sphere test and a signed sum over two determinant lifts; the two minimal lens-space wall contributions cancel with these signs (Theorem 3.1, the negative interval unit, with the order-four cap and local relative signs). Symplectic caps and ordinary Donaldson invariants supply a nonzero rational cap pairing whose probes can be moved off all variable blocks, following Kronheimer and Mrowka's cap and nonvanishing methods, with an enhanced symplectic closure and a model word on an elliptic surface (Theorem 4.1). Repetition on the free integral Floer lattice modulo a power of two then produces the nonzero integer $\Omega$, and the same repetition makes the complex coupled Dirac index $n_D$ positive (Section 5, Theorem 5.11). [1]

**The spinor count.** The phase circle acts by multiplying the spinor. Starting from the zero-dimensional instanton count, adding spinors, imposing $\eta=n_D-1$ complex phase cuts and taking the phase quotient gives a moduli space of expected dimension $2n_D-2\eta-1=1$. Near each ordinary instanton the phase link is $\mathbb{CP}^{n_D-1}$, and each phase cut has class twice the hyperplane class, as in Feehan and Leness's link calculation, so these ends contribute $2^{\eta}\Omega$ with the instanton signs. [1]

**Controlling the other ends (Sections 6 to 9).** Reducible fields, that is parallel splittings of the bundle into line bundles, and broken or bubbled limits could add boundary points. The paper builds toric metric sectors from Guillemin's Hessian description of toric Kähler metrics and Abreu's scalar-curvature formula; their periods constrain every parallel line reduction, and long-tube estimates on an $S^{2}\times S^{1}$ neck together with isolated-cap estimates make the constraints hold simultaneously, including at corners of the parameter family (Section 6, the metric family and the line-class inequalities, with Theorem 6.1 and the Abelian clamp). Quadratic and index inequalities then exclude fixed tuples and every mixed broken or bubbled boundary except faces at which a single minimal trace cap separates from one free main component (Section 7, ending in Theorem 7.16, numerical exclusion). At those lens faces the limits carry no spinor "particles", regular cylindrical gluing applies, and the two determinant sectors cancel by the same local orientation comparison that defined the negative instanton unit. The analytic construction is staged: energy bounds and ideal compactness, then fixed-type regularization and its index exclusions, then a finite projected regularization using exact-support incidence conditions and finite equivariant branch perturbations, then gluing of the remaining regular ends, and only then the interior regularization of the one-dimensional free stratum, with all generic choices made near the ordinary data in a neighbourhood that preserves $\Omega$ (Sections 8 and 9, Theorems 8.1 and 9.6). [1]

**Two kinds of neck.** The paper distinguishes the surgery seams $Y_j$ and auxiliary isolation collars, which are long but finite, from the genuine infinite faces of the spinor compactification, the specified $S^{3}$ cuts and the lens boundaries of neighbourhoods of square $-4$ spheres, whose limiting metrics have positive scalar curvature. Because of this, it says, no general regular spinor Floer theory on the knot surgeries is needed, and no gluing at positive particle levels. [1]

Where would an expert look first? At the boundary analysis of the spinor moduli space, since every gauge-theoretic cobordism argument lives or dies on the control of reducibles and bubbling, specifically at the line-class inequalities from toric periods and whether they really hold at the corners; at the cancellation of the two determinant sectors at the lens faces; and at the nonvanishing of $\Omega$ through the cap pairing and the integral repetition. This is a paper for specialists in Donaldson and Seiberg-Witten-type theory, and it will take them time. [1]

## Consequences inside mathematics

If the proof holds, the purely cosmetic surgery conjecture for knots in the three-sphere is settled, closing Problem 1.81(A) on Kirby's list after thirty-five years: the oriented homeomorphism type of a surgery on a nontrivial knot determines the slope. The new ingredient is a comparison between an instanton count and a nonabelian monopole count on a cobordism built from the hypothetical homeomorphism, a technique that may apply to other rigidity questions about surgeries. [1]

## Uses outside mathematics

No known direct application.

## Has anyone checked it?

We found no named mathematician who says they are reading or checking this paper, and no public comment from Ni, Hanselman, Lidman, Daemi, Futer, Purcell or Schleimer, whose results it builds on. VibeMathed records no check by an independent mathematician. [6]

OSVerify, an automated referee from Stanford whose findings its site says are "further verified by human experts", unnamed, reported three minor issues in this paper, a parameter-count misstatement, a boundary-flux sign error and an overcount in an index equality, and no major issue. Added 20 October 2026. [9]

**Machine checking.** None. Family 306 has no Lean scope note and no comparator statement in the release. The theorem rests entirely on the written paper, which is among the longest in the release. [7]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; this paper is not among them. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [8]

## Sources

1. OpenAI, "Purely cosmetic surgery on knots in the three-sphere", 23 September 2026. Theorem 1.1, the remaining-case section with its reduction proposition, and the argument outline. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Purely-Cosmetic-Surgery-on-Knots-in-the-Three-Sphere-September-23-2026/paper.pdf
2. C. McA. Gordon and J. Luecke, "Knots are determined by their complements", Journal of the American Mathematical Society 2 (1989), 371-415. https://doi.org/10.2307/1990979
3. Cameron Gordon, "Dehn surgery on knots", Proceedings of the International Congress of Mathematicians, Kyoto 1990, volume I, 631-642. Conjecture 6.1. https://www.mathunion.org/fileadmin/ICM/Proceedings/ICM1990.1/ICM1990.1.ocr.pdf
4. Yi Ni and Zhongtao Wu, "Cosmetic surgeries on knots in S³", Journal für die reine und angewandte Mathematik 706 (2015), 1-17. https://doi.org/10.1515/crelle-2013-0067
5. Aliakbar Daemi, Tye Lidman and Mike Miller Eismeier, "Filtered instanton homology and cosmetic surgery", arXiv:2410.21248 (2024, version 2 2025). https://arxiv.org/abs/2410.21248
6. VibeMathed, "Purely cosmetic surgery conjecture", read 18 October 2026. https://vibemathed.com/problem/purely-cosmetic-surgery-conjecture
7. OpenAI, `lean/docs/` and `lean/formalization.yaml` at the pinned commit, which contain no entry for family 306. https://github.com/openai/math/tree/4eaee87548250b2682affda7d05d947c05554bae/lean/docs
8. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
9. OSVerify, "Purely cosmetic surgery on knots in the three-sphere", referee report, read 20 October 2026. https://osverify.github.io/cases/cosmetic-surgery.html
