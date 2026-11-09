---
family: "148"
topic: "Dimension of self-similar measures"
title: "How much of a line does a random fractal fill when its pieces overlap?"
paperTitle: "The entropy-rate dimension formula for self-similar measures on the line"
claim: "For every finite family of contracting similarities φ_i(x) = r_i x + t_i on the real line, with 0 < |r_i| < 1 and signed unequal ratios allowed, and every strictly positive probability vector p, the self-similar measure μ has Hausdorff dimension min{1, h_RW/χ}, where h_RW is the entropy rate of the random walk on the affine maps themselves and χ = −Σ p_i log|r_i| is the Lyapunov exponent. No separation condition is required and exact overlaps are allowed. This is the entropy-rate dimension conjecture."
status: unreviewed
checked: 2026-10-20
papers:
  - preprints/The-entropy-rate-dimension-formula-for-self-similar-measures-on-the-line-September-24-2026/main.pdf
draft: false
---

Toss a fair coin forever and add up $\pm\lambda^{n}$ for each toss: the law of the sum is a Bernoulli convolution, and for $\lambda<1/2$ it lives on a Cantor set, while for $\lambda>1/2$ the pieces overlap and the question of whether it has a density has been open since the 1930s. Erdős showed in 1939 that for certain algebraic $\lambda$, the reciprocals of Pisot numbers, it does not; Solomyak showed in 1995 that for almost every $\lambda$ it does; Varjú showed in 2019 that for every transcendental $\lambda$ it at least has full dimension. Bernoulli convolutions are the simplest self-similar measures, the stationary laws of random iterations of a few contracting maps of the line, and the general question is the same: when the images overlap, how much of the line does the measure fill? The guess, going back through work of Hochman, is that the dimension is the ratio of two numbers, the entropy of the random walk, which counts how many genuinely different maps the compositions produce, and the Lyapunov exponent, which measures how fast they contract; capped at one. Hochman proved this in 2014 under a weak separation condition, and a sequence of papers by Breuillard, Varjú, Rapaport, Feng and others proved it for algebraic parameters; the conjecture that it holds with no condition at all is Conjecture 3 in Varjú's survey of September 2026. On 24 September 2026 OpenAI posted a short paper claiming it in full. [1][2][3]

As of 20 October 2026 no mathematician has said publicly that they have read or checked the proof. The status on this page is "unreviewed".

## The problem

Let $\Phi=(\varphi_i)_{i\in\Lambda}$ be a finite indexed family of maps $\varphi_i(x)=r_ix+t_i$ with $0<|r_i|<1$, and let $p$ be a probability vector with all $p_i>0$. The self-similar measure is the unique Borel probability measure with $\mu=\sum_ip_i(\varphi_i)_*\mu$, equivalently the law of $\lim_n\varphi_{I_1}\circ\cdots\circ\varphi_{I_n}(0)$ for independent symbols $I_j$ with law $p$. Two different words may define the same affine map, an exact overlap; the relevant entropy counts maps, not words. With $G_n=\varphi_{I_1}\circ\cdots\circ\varphi_{I_n}$ as a random affine map, the random-walk entropy rate and the Lyapunov exponent are

$$
h_{\mathrm{RW}}=\lim_{n\to\infty}\frac{H(G_n)}n,\qquad\chi=-\sum_ip_i\log|r_i|.
$$

[1]

**The entropy-rate dimension conjecture (Varjú's survey, Conjecture 3).** $\dim_H\mu=\min\{1,h_{\mathrm{RW}}/\chi\}$ for every such system. [1][3]

<!-- uruk:visual-note
A visual for this page is the Bernoulli convolution itself: histograms of $\sum\pm\lambda^{n}$ for $\lambda$ sliding from $0.4$ to $0.9$, Cantor dust becoming a rough density, with a dip at the golden ratio's reciprocal where exact overlaps bite; and the formula's two ingredients plotted against $\lambda$, with the dimension drop at Pisot parameters. The paper has one TikZ figure. [1]
-->

## Why it stayed open

What was known. Under the open set condition the dimension is given by Moran's and Hutchinson's similarity formula. Hochman showed that a dimension drop below $\min\{1,H(p)/\chi\}$ forces superexponential concentration of the cylinder maps, which gives the formula under weak exponential separation, and Bárány and Verma extended that version to allow exact collisions. For Bernoulli convolutions, Breuillard and Varjú and then Varjú handled transcendental parameters, Rapaport handled algebraic contraction ratios with arbitrary translations, Rapaport and Varjú handled rational translations with exact overlaps, and Feng and Feng handled algebraic translations. The obstacle to the general case is that absence of exact overlaps gives no quantitative separation: Baker and, independently, Bárány and Käenmäki built systems whose distinct cylinders approach each other at any prescribed superexponential rate, so any proof must handle entropy carried by extremely close maps without a lower bound on their separation. [1]

## What OpenAI claims

**Theorem 1.1** (OpenAI, 24 September 2026). For every finite nonempty indexed family $\varphi_i(x)=r_ix+t_i$ on $\mathbb R$ with $0<|r_i|<1$ and every strictly positive probability vector $p$,

$$
\dim_H\mu_{\Phi,p}=\min\Bigl\{1,\frac{h_{\mathrm{RW}}(\Phi,p)}{\chi(\Phi,p)}\Bigr\}.
$$

No separation assumption is required; exact overlaps and repeated generators are allowed, and the ratios may be negative and unequal. [1]

**Corollaries.** Without exact overlaps, $H(G_n)=nH(p)$ and the formula becomes the usual $\min\{1,H(p)/\chi\}$; the attractor has dimension $\min\{1,s\}$ where $\sum|r_i|^{s}=1$; and the homogeneous three-map family $\{\lambda x,\lambda x+1,\lambda x+t\}$ is covered for all weights. [1]

What this does and does not say. The theorem is about Hausdorff dimension, which the paper defines as the lower dimension and shows equals the exact dimension by Feng and Hu's theorem. It asserts nothing about absolute continuity, a separate question on which Solomyak's almost-every result and Erdős's Pisot examples remain the state of the art. Critical and supercritical entropy rates are included. [1]

## How the claimed proof goes

What follows is a map of the paper's argument from its introduction, with the statements of its main lemmas. It is not a check of the details. The paper is short enough to read in full. [1]

**The statement and the upper bound.** For maps $\varphi_i(x)=r_ix+t_i$ on $\mathbb R$ with $0<|r_i|<1$ and positive weights $p$, let $G_n$ be the law of the composed map $\varphi_{i_1}\circ\dots\circ\varphi_{i_n}$ when the indices are drawn from $p$, so that $H(G_n)$ counts the distinct maps, not the distinct words; the random-walk entropy rate is $h_{\mathrm{RW}}=\lim H(G_n)/n$ and the Lyapunov exponent is $\chi=-\sum p_i\log|r_i|$. Theorem 1.1: $\dim_H\mu=\min\{1,h_{\mathrm{RW}}/\chi\}$, with no separation assumption, exact overlaps and repeated generators allowed; it asserts dimension, not absolute continuity. The upper bound is classical, and the paper records it in Section 1.3. Exact dimensionality, from Feng and Hu, is the only external dimension theorem used; when there are no exact overlaps, $H(G_n)=nH(p)$ and the theorem is the usual entropy-to-Lyapunov formula (Corollary 6.2). The paper notes that the absence of exact overlaps gives no quantitative separation: Baker and Bárány-Käenmäki built systems whose distinct cylinders approach at arbitrarily prescribed superexponential rates, so the entropy carried by extremely close maps must be handled without bounding the smallest separation. [1]

**The toolkit (Section 2).** Entropy calculus between two scales (Lemma 2.1), the link between entropy and dimension (Lemma 2.2), a uniform nonsaturation estimate (Lemma 2.3) with an antecedent in Breuillard and Varjú's work on Bernoulli convolutions, and a two-point gain (Lemma 2.4): a fair, equal-weight two-point law convolved against an unobserved tail increases entropy by a definite amount. Translation averaging follows Wang, and the entropy calculus and fair-pair arguments follow Varjú's work on absolute continuity. [1]

**Step one: hidden information is witnessed by fair pairs (Section 3).** For a finitely supported law $\nu$ on the line, compare its exact entropy $H(\nu)$ with the entropy $H^{0}_\rho(\nu)$ of its grid cell at scale $\rho$; the difference is information hidden inside the cells. Lemma 3.2, the finite-law pair bound: for every $k$ there is $C_k$ with

$$
k\bigl(H(\nu)-H^{0}_\rho(\nu)\bigr)\le\log|kF|+C_k\sum_{\ell:\,2^{-\ell}\le2\rho}c_\ell(\nu),
$$

where $F$ is the support, $kF$ its $k$-fold sumset, and $c_\ell(\nu)$ measures the mass of fair two-point pairs at scale $2^{-\ell}$. The constant is independent of the smallest positive distance in $F$. The proof takes $k$ independent samples, observes that knowing the initial cells leaves $k(H-H^{0}_\rho)$ bits of uncertainty and that revealing the sum costs at most $\log|kF|$ bits, and bounds the rest by successively refining the cells with random cuts, independent of the samples, so that atoms close to a fixed boundary are not charged too often. This independence from the minimal separation is how the superexponentially close cylinders are handled. [1]

**Step two: blocks and counts (Section 4).** Group the coding symbols into blocks and condition on the symbol counts of each block, the block-type disintegration of Galicer, Saglietti, Shmerkin and Yavicoli, also used by Saglietti-Shmerkin-Solomyak and Käenmäki-Orponen. The counts fix each block's signed contraction, so for a sequence of blocks the translation alone identifies the complete composed map; conditioning costs only the entropy of the counts, which is small relative to block length, so the map-entropy rate gives a lower bound on the remaining translation entropy even when addresses collide (Lemma 4.1, entropy retained by types). The fixed contractions also give a small sumset bound for $|kF|$ in Step one. Proposition 4.2: a hypothetical dimension deficit, $\dim_H\mu<\min\{1,h_{\mathrm{RW}}/\chi\}$, therefore produces a linear amount of fair-pair mass across a finite band of very fine scales. [1]

**Step three: telescoping gains (Section 5).** Each fair pair produces a positive entropy gain against the unobserved tail (Lemma 5.1, conditional pair gain). The bands may end at arbitrarily large depths, so the block lengths are chosen successively, each only after the preceding endpoints are known; at each observation scale the retained blocks are disjoint (Lemma 5.2, disjoint retained windows), so the gains telescope to a bounded total, and averaging over observation scales gives a fixed positive contribution from every band. As the number of bands grows this contradicts the deficit. No quantitative bound on the fine-scale endpoints is needed. [1]

**Corollaries (Section 6).** The no-exact-overlap formula for the measure and the attractor (Corollaries 6.2 and 6.3), the homogeneous all-weight consequence (Corollary 6.4), and the three-map family $\{\lambda x,\lambda x+1,\lambda x+t\}$ (Corollary 6.5), which Rapaport and Varjú had treated outside a zero-dimensional exceptional set. [1]

Where would an expert look first? At Lemma 3.2 and its random refinement cuts, whose independence from the minimal separation is the new ingredient; at the adaptive choice of block lengths and the disjointness that makes the gains telescope; and at the sumset bound in Step two, which is where the fixed contractions are used. [1]

## Consequences inside mathematics

If the proof holds, the dimension theory of self-similar measures on the line is complete: the dimension is always the entropy-to-Lyapunov ratio of the map walk, with exact overlaps the only mechanism for a drop, as Simon and Hochman conjectured; the long chain of algebraic and transcendental special cases is subsumed. Absolute continuity, the original Bernoulli convolution question of which parameters in $(1/2,1)$ have a density, remains open. [1][3]

## Uses outside mathematics

No known direct application.

Self-similar measures model multifractal spectra in turbulence, signal processing and image compression, where iterated function systems encode pictures; the dimension formula is a statement about the mathematical model's limiting objects. [1]

## Has anyone checked it?

We found no named mathematician who says they are reading or checking this paper, and no public comment from Varjú, Hochman, Shmerkin, Rapaport, Solomyak, Bárány or Käenmäki, whose work it builds on. VibeMathed records no check by an independent mathematician. [4]

**Machine checking.** The release's Lean scope note links two statements. `SelfSimilar.lean`, the dimension formula for every finite real self-similar measure with signed ratios and exact overlaps allowed, is in the catalogue `formalization.yaml`; `SelfSimilarCorollaries.lean`, the homogeneous and attractor formulas, is linked but not catalogued. Absolute continuity is outside both. The statement defines Hausdorff dimension and the entropy rate itself, which is where a reader should check it against the paper. A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval. [5]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; this paper is not among them. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [6]

## Sources

1. OpenAI, "The entropy-rate dimension formula for self-similar measures on the line", 24 September 2026. Theorem 1.1, the corollaries, "Background and proof strategy". Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/The-entropy-rate-dimension-formula-for-self-similar-measures-on-the-line-September-24-2026/main.pdf
2. Michael Hochman, "On self-similar sets with overlaps and inverse theorems for entropy", Annals of Mathematics 180 (2014), 773-822. https://doi.org/10.4007/annals.2014.180.2.7
3. Péter P. Varjú, "Entropy rates in the dimension theory of self-similar measures", arXiv:2509.22042, 2026, Conjecture 3. https://arxiv.org/abs/2509.22042
4. VibeMathed, "Entropy-rate dimension formula for self-similar measures", read 20 October 2026. https://vibemathed.com/problem/entropy-rate-dimension-self-similar-measures
5. OpenAI, Lean scope note for family 148 and `lean/formalization.yaml` at the pinned commit. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/148.md and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/formalization.yaml
6. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
