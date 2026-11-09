---
family: "216"
topic: "The XY model and the BKT transition"
title: "When do spinning arrows on a grid stop remembering each other?"
paperTitle: "The critical correlation exponent of the planar XY model"
claim: "For the nearest-neighbour XY model on the square lattice: at the critical inverse temperature the spin correlation decays as r^(−1/4) up to a (log r)^(1/8) correction with a positive finite amplitude; approaching the critical point from the disordered side the correlation length grows as exp(A/√(b_c − b)); the critical spin field converges to the imaginary exponential of a Gaussian free field with stiffness 2/π; and the discrete Gaussian height model has Gaussian scaling limits throughout its rough phase including the roughening point, for every finite square-symmetric interaction."
status: unreviewed
checked: 2026-10-20
papers:
  - preprints/The-critical-correlation-exponent-of-the-planar-XY-model-September-24-2026/paper.pdf
  - preprints/The-critical-logarithmic-correction-for-the-planar-XY-model-October-5-2026/paper.pdf
draft: false
---

Put an arrow at every point of a square grid, free to point in any direction in the plane, and let neighbouring arrows prefer to agree, with a strength $b$ that plays the role of inverse temperature. This is the XY model, the simplest model of a thin magnetic film or a film of superfluid helium. In two dimensions it cannot order: Mermin and Wagner showed that no temperature, however low, makes all the arrows point the same way. Yet in the early 1970s Berezinskii, Kosterlitz and Thouless found that something does happen. At low temperature the arrows remember each other over long distances, with correlations fading like a power of the distance; at high temperature vortices, points around which the arrows turn a full circle, unbind and destroy the memory exponentially fast. Kosterlitz's renormalization-group analysis predicted the exact numbers at the transition: correlations decay like $r^{-1/4}$ with a $(\log r)^{1/8}$ correction, and the correlation length just above the transition blows up like $e^{A/\sqrt{b_c-b}}$, an essential singularity unlike any ordinary phase transition. The work won Kosterlitz and Thouless the 2016 Nobel Prize in Physics. Fröhlich and Spencer proved in 1981 that the low-temperature phase exists; the exact critical numbers remained predictions. Between 24 September and 5 October 2026 OpenAI posted six papers, about 461 pages, claiming all of them for the ordinary square-lattice model. [1][2][3][4]

As of 20 October 2026 no mathematician has said publicly that they have read or checked the proofs. The status on this page is "unreviewed".

## The problem

On the box $\Lambda_L=[-L,L]^{2}\cap\mathbb Z^{2}$ with free boundary, the XY model at inverse temperature $b>0$ gives the angles $\theta_x\in\mathbb R/2\pi\mathbb Z$ the law

$$
d\mu_{L,b}(\theta)=Z_{L,b}^{-1}\exp\Bigl\{b\sum_{\{x,y\}}\cos(\theta_x-\theta_y)\Bigr\}\prod_x\frac{d\theta_x}{2\pi},
$$

the sum over nearest-neighbour pairs. The two-point correlation at separation $n$ along an axis is $C_b(n)=\lim_{L\to\infty}\mathbb E_{\mu_{L,b}}\cos(\theta_0-\theta_{ne_1})$, the mass is $m(b)=\lim_n-\frac1n\log C_b(n)$, and the critical point is $b_c=\inf\{b:m(b)=0\}$, which van Engelenburg and Lis showed is finite, positive, and itself in the massless regime. [1]

**The BKT predictions (Berezinskii 1971, Kosterlitz and Thouless 1973, Kosterlitz 1974).** At $b_c$, $C_{b_c}(r)\sim B\,r^{-1/4}(\log r)^{1/8}$; for $b<b_c$, $\log(1/m(b))\sim A/\sqrt{b_c-b}$; and the stiffness of the critical spin field is exactly $2/\pi$. [1][2]

<!-- uruk:visual-note
A visual for this page is the model itself: arrows on a grid sampled by Monte Carlo at three temperatures, with vortices and antivortices marked, pairs bound below the transition and unbound above; and the correlation function on logarithmic axes with the slope $-1/4$ and the logarithmic bend. The six papers contain thirteen TikZ figures of height profiles, annuli and dual heights.
-->

## Why it stayed open

What was known. McBryan and Spencer proved power-law upper bounds on correlations in 1977; Fröhlich and Spencer's Coulomb-gas analysis proved the algebraic phase in 1981; van Engelenburg and Lis proved in 2023 that correlations decay either exponentially or polynomially, with a polynomial lower bound at the threshold whose exponent is not sharp. The dual picture, in which the XY model becomes an integer-valued height model, was developed by Aizenman, Harel, Peled and Shapiro and by Lammers, who found the exact relation between the XY mass and the height mass. None of this identified the exponent $1/4$, the logarithm, or the essential singularity. [1]

Why it was hard. The transition is driven by topological defects, not by a symmetry breaking, so the standard tools of critical phenomena do not apply; the logarithmic correction means that even numerically the exponent is disguised, with simulations on grids hundreds of sites across showing an apparent decay near $r^{-0.21}$. And the critical point is defined only indirectly, as the edge of the massive phase, so a proof has to work at a temperature it cannot compute. [1]

## What OpenAI claims

**Theorem** (critical exponent; OpenAI, 24 September 2026). For the model above and $b_c$ as defined,

$$
\lim_{n\to\infty}\frac{\log C_{b_c}(n)}{\log n}=-\frac14.
$$

[1]

**Theorem** (logarithmic correction; 5 October 2026). There is $B_{\mathrm{XY}}\in(0,\infty)$ such that $C_{b_c}(r)=B_{\mathrm{XY}}\,r^{-1/4}(\log r)^{1/8}(1+o(1))$. [2]

**Theorem** (essential singularity; 5 October 2026). As $b\uparrow b_c$, $\sqrt{b_c-b}\,\log(1/m(b))\to A_{\mathrm{XY}}\in(0,\infty)$. [3]

**Companions.** The critical spin field on a square with boundary angles fixed to zero converges to the imaginary exponential of a zero-Dirichlet Gaussian free field with stiffness $2/\pi$; the centre magnetization in such a square is $A\,n^{-1/8}(\log n)^{1/16}(1+o(1))$; and, in the foundation paper, the two-dimensional discrete Gaussian height model has Gaussian scaling limits throughout its rough phase including the roughening threshold, for every finite square-symmetric interaction set, with universal critical effective temperature $8\pi$, while the Villain and XY spin fields at sufficiently low temperature converge to the exponential of a Gaussian free field. [4]

What these do and do not say. All results are for the nearest-neighbour cosine model on $\mathbb Z^{2}$, with the thermodynamic limit through free boxes taken before the separation limit, at the mass-defined threshold. The value of $b_c$ is not computed. Nothing is claimed in three dimensions or for the $O(n)$ models with $n\ge3$, which are a separate family. [1][2][3]

## How the claimed proof goes

What follows is a map of the exponent paper's argument from its introduction, its "structure of the proof" and its account of what it imports from the foundation paper. It is not a check of the details. [1]

**The statement.** Theorem 1.1 of the exponent paper: at the BKT threshold $b_c$, with $b$ the usual inverse temperature $\beta$ in the coupling $b\cos(\theta_x-\theta_y)$ per edge, the two-point function satisfies $\log C_{b_c}(n)/\log n\to-1/4$, that is $n^{-1/4-\varepsilon}\le C_{b_c}(n)\le n^{-1/4+\varepsilon}$ for large $n$. The thermodynamic limit is taken first at each fixed separation $n$, then $n\to\infty$ through all integers. The one external endpoint input is van Engelenburg and Lis's theorem, which gives $C_{b_c}(n)\ge1/(8n)$ at and above the threshold (Proposition 1.2); the paper checks that their free-boundary convention and threshold coincide with its own. [1]

**Dual heights and the coefficient $a(b)$ (Section 2).** The XY model is rewritten as an integer-valued height model on the dual lattice, with heights in $2\pi\mathbb Z$ and edge weights $p_b(j)=e^{-b}I_j(b)$ given by modified Bessel functions, following Fröhlich-Spencer, Aizenman-Harel-Peled-Shapiro and Lammers. Spin correlations become statements about height fluctuations, and the BKT phase is the rough phase of the height model. Section 2 constructs the "free height coefficient" $a=a(b)$, the constant such that the height covariance is $aA^{-1}$ for the unit-edge Laplacian $A$, as a limit (Theorem 2.4), and proves that $a\in\{0\}\cup[8\pi,\infty)$, a forbidden range (Theorem 2.5): a radial unit flow has energy $(2\pi)^{-1}\log r+O(1)$, and summing its Fourier sectors gives the gap $a\ge8\pi$ whenever $a>0$. It then gives the spin upper exponent: $C_b(n)\le n^{-2\pi/a+o(1)}$, with arbitrarily fast polynomial decay when $a=0$ (Proposition 2.6), because a pair of opposite angular singularities has energy $4\pi\log n+O(1)$. [1]

**Localization and the lower bound (Sections 3 and 4).** Section 3 proves the mixed-boundary height limits (Theorem 3.1) and the conditional laws in the presence of separated "hard pins" (Theorem 3.2), with a vanishing-reach estimate (Proposition 3.8); these are what localize the height field in bands. Section 4 proves the matching lower exponent whenever $a>0$ (Proposition 4.1, the magnetic lower bound), by comparing magnetic sectors across many scales (Proposition 4.2); so for $a>0$ the exponent is exactly $2\pi/a$ and the spin mass is zero. [1]

**Openness and the identification (Sections 5 and 6).** Proposition 5.1: if $a(b)>8\pi$ then the coefficient is positive in a neighbourhood of $b$. No continuity of the unknown function $a(b)$ is assumed. Section 6 combines the pieces: the critical lower bound $1/(8n)$ excludes $a(b_c)=0$, since that would give faster-than-polynomial decay; openness excludes $a(b_c)>8\pi$, since the coefficient would then be positive, with power-law decay, slightly below $b_c$, contradicting exponential decay there; so $a(b_c)=8\pi$ and $2\pi/a(b_c)=1/4$. The paper remarks that the constants can be followed through this short chain of identities. [1]

**What is imported, and the three transfers.** The foundation paper proves Gaussian scaling limits for height models with quadratic weights and for spin fields at low fixed temperature, and supplies finite Gaussian comparisons, Gaussian localization in rectangular geometries with separated pins, and a local analytic map for small even periodic activities. The exponent paper uses it at three levels and transfers each to Bessel weights. First, the finite-dimensional Gaussian comparison is applied to Gaussian-chain approximants of the Bessel law on each fixed primary graph before the geometry is refined, with uniform moment bounds in the unit-edge flow norm replacing the bare inverse precision; the paper checks affine supports, centered constraints and observation penalties. Second, the geometric and Gaussian localization conclusions apply with coefficient $a(b)>0$, but the Bessel mixed-boundary and conditional statements are proved afresh in Theorems 3.1 and 3.2, with primary path bounds, polynomial cluster moments and a relative small-tilt estimate replacing the quadratic tail argument; since convergence of height observations does not determine the ratio of winding sectors, a finite isolation expansion on geometric annuli supplies that comparison with small error per scale. Third, the analytic map is entered at a fixed gapped Gaussian reference $a'>8\pi$ after an additional positive form on averages of heights supplies a "large-field reserve"; the entry conditions are verified for the strengthened Bessel law in the exponent paper itself, and the added precision is removed by a variance comparison before anything is concluded about the original model. This is what gives openness at criticality without continuity. [1][4]

**The later papers.** The October papers identify the logarithmic correction $(\log n)^{1/8}$, the critical center magnetization and spin field, and the essential singularity of the correlation length, each building on the height representation and the coefficient $a$; the amplitudes $B_{\mathrm{XY}}$ and $A_{\mathrm{XY}}$ are defined there. [2][3]

Where would an expert look first? At Theorem 2.5, the forbidden range $(0,8\pi)$, which is the discrete analogue of the renormalization-group picture and carries the whole identification; at the three Bessel transfers, in particular the entry into the analytic map at $a'>8\pi$ and its removal; at the foundation paper's claim at the roughening threshold itself, which the human literature had called out of reach; and in the later papers, at how the amplitudes are identified. [1][2][3][4]

## Consequences inside mathematics

If the proofs hold, the Berezinskii-Kosterlitz-Thouless theory is a theorem for the model it was written for: exponent, logarithm, essential singularity and universal stiffness jump, fifty years after the predictions and forty-five after Fröhlich and Spencer proved the phase exists. The discrete Gaussian results would settle the roughening transition for a broad class of height models, and the methods, dual heights with annular Gaussian comparisons, apply to other two-dimensional systems with continuous symmetry. [1][4]

## Uses outside mathematics

The XY model describes thin superfluid and superconducting films, two-dimensional arrays of Josephson junctions and ultracold atomic gases in two dimensions, and the BKT transition has been observed in all of them; the universal jump of the superfluid stiffness, here the value $2/\pi$, is what experiments measure. The theorems prove what physicists have assumed for fifty years; they do not add a new effect. [4]

## Has anyone checked it?

We found no named mathematician who says they are reading or checking these papers, and no public comment from Peled, Lammers, Lis, van Engelenburg, Aizenman or Bauerschmidt, whose work they build on. VibeMathed records no check by an independent mathematician. [5]

**Machine checking.** None. Family 216 has no Lean scope note and no comparator statement in the release. [6]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; none of the six papers in this family is among them. Three of the six are dated 5 October, the day before the release. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [7]

## Sources

1. OpenAI, "The critical correlation exponent of the planar XY model", 24 September 2026. The theorem, the history, the three extensions and the model. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/The-critical-correlation-exponent-of-the-planar-XY-model-September-24-2026/paper.pdf
2. OpenAI, "The critical logarithmic correction for the planar XY model", 5 October 2026. Theorem and background. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/The-critical-logarithmic-correction-for-the-planar-XY-model-October-5-2026/paper.pdf
3. OpenAI, "Essential singularity of the correlation length in the planar XY model", 5 October 2026, abstract. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Essential-Singularity-of-the-Correlation-Length-in-the-Planar-XY-Model-October-5-2026/paper.pdf
4. OpenAI, "BKT universality for height and planar spin fields", 24 September 2026, "The critical spin field of the planar XY model" and "Critical center magnetization in the planar XY model", 5 October 2026, abstracts. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/BKT-universality-for-height-and-planar-spin-fields-September-24-2026/paper.pdf , https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/The-Critical-Spin-Field-of-the-Planar-XY-Model-October-5-2026/paper.pdf and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Critical-Center-Magnetization-in-the-Planar-XY-Model-October-5-2026/paper.pdf
5. VibeMathed, "The critical logarithmic correction for the planar XY model", read 20 October 2026. https://vibemathed.com/problem/xy-model-critical-log-correction
6. OpenAI, `lean/docs/` and `lean/formalization.yaml` at the pinned commit, which contain no entry for family 216. https://github.com/openai/math/tree/4eaee87548250b2682affda7d05d947c05554bae/lean/docs
7. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
