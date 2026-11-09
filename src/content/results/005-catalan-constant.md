---
family: "005"
topic: "Catalan's constant"
title: "Is 1 − 1/9 + 1/25 − 1/49 + ... a fraction?"
paperTitle: "Catalan's constant is irrational"
claim: "Catalan's constant G = Σ_{j≥0} (−1)^j/(2j+1)^2 is irrational."
status: unreviewed
checked: 2026-10-18
papers:
  - preprints/Catalans-constant-is-irrational-September-24-2026/paper.pdf
draft: false
---

Add the reciprocals of the odd squares with alternating signs: $1-\tfrac19+\tfrac1{25}-\tfrac1{49}+\cdots=0.9159655\ldots$ This is Catalan's constant $G$, named for Eugène Catalan who studied it in the 1860s. It appears in combinatorics, in the volume of hyperbolic solids and in the physics of crystals, and it is among the most famous numbers not known to be irrational. The sum without the signs, $1+\tfrac19+\tfrac1{25}+\cdots$, equals $\pi^{2}/8$ and is irrational since Lambert; Apéry proved in 1978 that $\zeta(3)=1+\tfrac18+\tfrac1{27}+\cdots$ is irrational in a result that shocked the field; but $G$ resisted every attempt. Rivoal and Zudilin showed in 2003 that infinitely many of the related alternating sums are irrational, and that at least one of $G$ and its cousins up to $\beta(14)$ is, without being able to say which. On 3 September 2026 Zhi-Wei Sun of Nanjing University posted a claimed proof that $G$ is irrational; two weeks later a note reported a numerical discrepancy in its final estimate. On 24 September 2026 OpenAI posted its own proof, by a different method, saying it uses nothing from Sun's. [1][3][4][5][6]

As of 18 October 2026 no mathematician has said publicly that they have read or checked OpenAI's proof. The status on this page is "unreviewed".

## The problem

The Dirichlet beta function is $\beta(s)=\sum_{j\ge0}(-1)^{j}/(2j+1)^{s}$, and Catalan's constant is $G=\beta(2)$; in the language of $L$-functions it is $L(2,\chi_{-4})$ for the odd character of conductor four. At odd arguments $\beta(s)$ is a rational multiple of $\pi^{s}$, so $\beta(1)=\pi/4$ and $\beta(3)=\pi^{3}/32$ are irrational; the even values are a different arithmetic problem. [1]

A real number is irrational if it is not a ratio of integers. The standard way to prove it, going back to Fourier's proof for $e$, is to find integers $A_m,B_m$ with $0<|A_mG-B_m|\to0$: a rational $G=a/b$ would make $b(A_mG-B_m)$ a nonzero integer smaller than one. The trap is that good rational approximations $B_m/A_m$ to $G$ do not suffice; multiplying by $A_m$ may destroy the smallness. Apéry's recurrences for $\zeta(2)$ and $\zeta(3)$ work because the decay survives clearing denominators. For $G$, Zudilin constructed Apéry-like recurrences in 2003 and showed explicitly that their integer forms do not tend to zero. [1]

**The question.** Is $G$ irrational? [1][3]

What was known. Rivoal and Zudilin's 2003 theorem: infinitely many $\beta(2k)$ are irrational, and at least one of $\beta(2),\ldots,\beta(14)$ is; Zudilin reduced the list to $\beta(12)$ and Lai and Zhou to $\beta(10)$. Rivoal, Krattenthaler and others proved sharp bounds on the denominators of the natural approximants, which showed hidden cancellation but still left the denominator cost too large. Explicit approximations with error exponents around $0.62$ were found, below the $1$ needed. In 2024 Calegari, Dimitrov and Tang proved that $1$, $\pi^{2}$ and $L(2,\chi_{-3})$ are linearly independent over the rationals, the analogous statement for conductor three, and discussed why their method did not reach $G$. Calegari had earlier proved irrationality of a $2$-adic analogue of $G$; the real case contains an extra $\pi^{2}$ term that the $2$-adic one lacks. [1][3][4]

<!-- uruk:visual-note
A visual for this page can show the partial sums converging to $G$ from both sides, then the sequence of best rational approximations and the integer forms $A_mG-B_m$, which for the naive approximants grow rather than shrink. That is the obstruction in a picture. The proof's determinants cannot be shown.
-->

## Why it stayed open

### Two proofs in one month

On 3 September 2026 Sun posted "Catalan's constant is irrational", a twenty-page preprint using weighted tails of the series and a determinant argument. On 16 September Dane Wachs posted a note reporting exact computations on Sun's construction: at eighteen tested indices, a quantity that Sun's final theorem requires to be at most $-0.00966B^{2}$ comes out between $+1.49B^{2}$ and $+1.79B^{2}$, and the note locates a contribution from the prime $2$ of size $(2\log2+o(1))B^{2}$ that the displayed derivation does not account for. We found no response from Sun. OpenAI's paper, dated 24 September, cites Sun's preprint as having "also announced a proof of the same qualitative irrationality statement" and says "No result from that preprint is used here." As of this writing neither proof has been accepted by anyone. [1][5][6]

## What OpenAI claims

**Theorem 1.1** (OpenAI, 24 September 2026). Catalan's constant is irrational. [1]

What this does and does not say. It is a qualitative statement; no irrationality measure, no linear independence with other constants, and nothing about $\beta(4)$ or higher even values is claimed. [1]

## How the claimed proof goes

What follows is a map of the paper's argument from its introduction and from the opening of its construction section. It is not a check of the details. The method belongs to the same family as the release's proof that the irrationality exponent of $\pi$ is $2$, family 017 on this site, and is a descendant of Zudilin's 2017 determinantal criterion. [1]

**The idea.** Build large determinants $\Delta_N$ of size $n=48N$ whose entries are moments of two elementary kernels, each a rational combination of $1$, $G$ and $\zeta(2)=\pi^{2}/6$. Choose the polynomial rows so that two prescribed expressions share their initial Taylor coefficients, a "Taylor contact" that cancels the $\zeta(2)$ term in every entry. Under the single hypothesis that $G$ is rational, every $\Delta_N$ is then a rational number. A nonzero rational number's absolute value is determined by its prime valuations, so bounds on the denominators of $\Delta_N$ give a lower bound on $\log|\Delta_N|$; an integral formula for the same determinant gives an upper bound; for large $N$ the two bounds are incompatible. Zudilin's criterion worked with positive moment representations, where Hankel determinants are squared-Vandermonde integrals and positivity gives nonvanishing for free, and his Section 6 explains why the denominator growth of the natural approximation family for $G$ blocked its application. The determinant here is mixed and signed, so nonvanishing and the real estimate each need their own argument. [1]

**The construction (Section 2).** With $n=48N$ the paper fixes auxiliary sizes $a=11N$, $b=7N$, $q=g=4N$, $h=2N$, $L=59N$, $C=63N$, $H=65N$, $A=19N$. The rows live on the rational parametrization $t=2w/(1+w^{2})$, $f=\sqrt{1-t^{2}}=(1-w^{2})/(1+w^{2})$ of the circle, with the involution $w\mapsto w^{-1}$ fixing $t$ and negating $f$. For $0\le r<n$ set $R_r=(1-t)^{h}t^{C-1}w^{r-g}$ and take the symmetric and antisymmetric parts $P_r=(R_r+R_r^{*})/2$ and $D_r=t(R_r^{*}-R_r)/(2f)$; these turn out to be $(1-t)^{h}t^{C-1}$ times Chebyshev polynomials $T_d(1/t)$ and $U_{d-1}(1/t)$ with $d=|r-g|$, so they are integer polynomials. Their moments against the two kernels are rational combinations of $1$, $G$ and $\zeta(2)$, and Proposition 2.1 (rationality) shows the Taylor contact kills $\zeta(2)$, so that under $G\in\mathbb Q$ every entry, hence every $\Delta_N$, is rational. [1]

**Denominators (Sections 2 and 3).** The integral Chebyshev rows provide divisibility as well as contact. Proposition 2.2 is a uniform estimate at the prime two. At the large odd primes that dominate the bound, denominators of order $p^{2}$ and of order $p$ must both be controlled, and Section 3 follows the two layers separately, by digit reductions of the rational moments (Lemma 3.1), a leading layer with paired raw columns, and a central layer with elimination over the local integers (Lemmas 3.2 and 3.3); the paper says cancellation at the first layer alone would not give the required bound. Summing the prime losses gives the finite-place lower bound (Proposition 3.4). In terms of the normalized logarithm

$$
\mathcal L_N=\frac{\log|\Delta_N|}{(48N)^{2}}-\tfrac12\log2,
$$

the lower bound is $\liminf\mathcal L_N>-2.29084$ along every sequence of nonzero determinants. [1]

**Nonvanishing (Section 4).** Positivity is unavailable, so nonvanishing is arithmetic. When $N=p$ is a large prime, Frobenius and a pair of palindromic polynomial bases, with two extraction shifts, reduce the growing matrix modulo $p$ to three fixed rational matrices (the residue blocks), and an exact finite certificate proves those three nonzero. This gives $\Delta_p\ne0$ along an unbounded sequence of primes, without asserting a sign for the mixed determinant. [1]

**The real estimate (Sections 5 to 7).** The upper bound respects both branches of the parametrization, the two sheets of the integral. A bounded holomorphic interpolant, uniform even when nodes approach one another and constructed through a finite-dimensional Hardy-space operator so that the evaluation determinant cancels algebraically rather than through an inverse-Vandermonde estimate, controls the mixed evaluations in one range of configurations (Proposition 5.2, interpolation estimate); a Hadamard bound treats the complementary range (Proposition 5.3). Andréief's identity and Cauchy's double alternant are the classical context. The Vandermonde products have logarithmic interactions, as in logarithmic potential theory; a Chebyshev expansion of the logarithmic kernel reduces the estimate to quadratic sums and two one-variable functions, which the paper regularizes together before taking suprema. Sections 6 and 7 supply explicit rational trial coefficients with a certificate that exhausts all stationary points and brackets every root, rather than relying on a numerical search for the maxima, and arrives at $\limsup\mathcal L_N\le-2.290939875<-2.2909$ (Proposition 7.1). [1]

**The contradiction.** Along the prime sequence of Section 4, $\mathcal L_N>-2.29084$ for large $N$ by the denominators, while $\mathcal L_N\le-2.2909$ by the integral. The margin is about $10^{-4}$ on the normalized scale. The argument proves irrationality only; the paper says an irrationality measure would require additional control of rational approximations. Section 8 deduces the irrationality of the minimal volume of an orientable complete finite-volume hyperbolic three-manifold with exactly two cusps, and of certain arithmetic hyperbolic volumes, since these are rational multiples of $G$. [1]

Where would an expert look first? At the two-layer denominator bound in Section 3, since the margin of $10^{-4}$ leaves no room for a lost factor; at the nonvanishing certificate and the Frobenius reduction to three fixed matrices; and at the interpolation estimate's uniformity as nodes coalesce. Zudilin's own 2017 discussion of why determinant methods had failed for $G$ is the natural companion reading. [1]

## Consequences inside mathematics

If the proof holds, Catalan's constant joins $\pi$, $e$ and $\zeta(3)$ among the famous constants known to be irrational, and the "one of $\beta(2),\ldots,\beta(10)$" theorem is sharpened to its first member. The method, moments with arithmetic cancellation of an unwanted period and determinants compared at primes and at the real place, is the same machine as the release's result on $\pi$, and its reach among other $L$-values is an obvious question the paper does not address. [1]

## Uses outside mathematics

No known direct application.

Catalan's constant appears in formulas in combinatorics and statistical mechanics, for instance in counting dimer tilings, but whether it is irrational changes none of those formulas. [3]

## Has anyone checked it?

We found no named mathematician who says they are reading or checking OpenAI's paper, and no public comment from Zudilin, Rivoal, Fischler or Calegari. The human priority claim by Sun is three weeks older and is under public challenge by Wachs's note; that dispute concerns Sun's argument, not OpenAI's. VibeMathed records no check by an independent mathematician. [5][6][7]

**Machine checking.** The release's Lean scope note for this family links a statement `Catalan.lean` of thirteen lines, asserting `Irrational` of the series in Mathlib's terms, which is the cleanest formal statement on this site. It is not listed in the catalogue `formalization.yaml` at the pinned commit, so the release does not present a complete formal proof of it. We found no outside replay. A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval. [2]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; this paper is not among them. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [8]

## Sources

1. OpenAI, "Catalan's constant is irrational", 24 September 2026. Theorem 1.1, the earlier-results section and the determinant strategy. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Catalans-constant-is-irrational-September-24-2026/paper.pdf
2. OpenAI, Lean scope note for family 005 and the comparator statement `Catalan.lean` at the pinned commit, with `lean/formalization.yaml`, which does not list it. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/005.md , https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/Catalan.lean and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/formalization.yaml
3. Wikipedia, "Catalan's constant", read 18 October 2026. The value, Catalan's work, the appearances in combinatorics and physics, and the open status. https://en.wikipedia.org/wiki/Catalan%27s_constant
4. Tanguy Rivoal and Wadim Zudilin, "Diophantine properties of numbers related to Catalan's constant", Mathematische Annalen 326 (2003), 705-721. https://doi.org/10.1007/s00208-003-0420-2
5. Zhi-Wei Sun, "Catalan's constant is irrational", arXiv:2609.04176, 3 September 2026. https://arxiv.org/abs/2609.04176
6. Dane Wachs, "A note on a recent claimed proof of the irrationality of Catalan's constant", arXiv:2609.22339, 16 September 2026. https://arxiv.org/abs/2609.22339
7. VibeMathed, "Catalan's constant is irrational", read 18 October 2026. https://vibemathed.com/problem/catalan-constant-irrational
8. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
