---
family: "075"
topic: "Almost-everywhere Fourier convergence"
title: "How rough can a function be before its Fourier series stops converging?"
paperTitle: "Almost-everywhere Fourier convergence in L log L"
claim: "For every complex-valued function f on the circle with ∫|f| log(2+|f|) < ∞, the ordinary symmetric Fourier partial sums S_N f converge to f almost everywhere along the full sequence N = 0, 1, 2, .... This is the classical L log L sufficiency conjecture, the endpoint between Carleson's theorem for L^2 and Kolmogorov's divergent example in L^1."
status: unreviewed
checked: 2026-10-20
papers:
  - preprints/Almost-everywhere-Fourier-convergence-in-L-log-L-September-23-2026/paper.pdf
draft: false
---

Every periodic function can be written as a sum of sines and cosines, Fourier claimed in 1807, and the question of when that sum really adds back up to the function occupied analysis for a century and a half. In 1923 Kolmogorov, aged nineteen, built an integrable function whose Fourier series diverges at almost every point. In 1966 Lennart Carleson proved that for square-integrable functions the series converges almost everywhere, settling a conjecture of Lusin from 1915 in one of the hardest proofs of the century; Hunt extended it to every $L^{p}$ with $p>1$. Between $L^{1}$, where convergence fails, and $L^{p}$, where it holds, lies a scale of function classes measured by logarithms, and the natural conjecture was that $L\log L$, the functions with $\int|f|\log|f|<\infty$, is where convergence still holds. Sjölin proved it with an extra $\log\log$, Antonov in 1996 with an extra $\log\log\log$, and Arias de Reyna, Lie, Di Plinio and Fragkos pushed closer; the endpoint itself resisted. On 23 September 2026 OpenAI posted a paper claiming it. [1][2][3]

As of 20 October 2026 no mathematician has said publicly that they have read or checked the proof. The status on this page is "unreviewed".

## The problem

On the circle $\mathbb T=\mathbb R/2\pi\mathbb Z$ with normalized measure, write $\widehat f(k)=\int f(x)e^{-ikx}\,d\mu$ and $S_Nf(x)=\sum_{|k|\le N}\widehat f(k)e^{ikx}$. The Orlicz class is

$$
L\log L(\mathbb T)=\Bigl\{f:\int_{\mathbb T}|f(x)|\log(2+|f(x)|)\,d\mu(x)<\infty\Bigr\}.
$$

**The $L\log L$ conjecture.** For every $f\in L\log L$, $S_Nf\to f$ almost everywhere along the full sequence. Lie's 2017 formulation asks equivalently for a weak-$L^{1}$ bound on the maximal operator $\sup_N|S_Nf|$ from $L\log L$. [1]

<!-- uruk:visual-note
A visual for this page is the Fourier partial sums themselves: $S_Nf$ for a function with a logarithmic singularity, converging almost everywhere as $N$ grows, against a Kolmogorov-type function whose partial sums oscillate wildly everywhere; and the ladder of classes from $L^{1}$ through $L\log L\log\log\log L$, $L\log L\log\log L$, $L\log L$ to $L^{p}$ with the year each was settled. The paper has two TikZ figures. [1]
-->

## Why it stayed open

What was known. Carleson for $L^{2}$, Hunt for $L^{p}$, Kolmogorov's counterexample in $L^{1}$. Sjölin's $L\log L\log\log L$ in 1969, Soria's extrapolation spaces, Antonov's $L\log L\log\log\log L$ in 1996, Arias de Reyna's quasi-Banach space QA containing both, the Lorentz space of Carro, Mastyło and Rodríguez-Piazza, Lie's time-frequency proof of the maximal bound from QA to weak $L^{1}$, and Di Plinio and Fragkos's weak-$L^{p}$ bounds of order $(p-1)^{-1}$ as $p\downarrow1$. Each result got closer to $L\log L$ by one iterated logarithm or a quantified rate; none reached it. [1]

Why it was hard. Carleson's operator is controlled, in Fefferman's and Lacey and Thiele's proofs, by organizing the time-frequency plane into tiles and trees, with losses that depend on the number of frequencies in play; at the $L\log L$ endpoint there is no room for any loss that grows with that number, and the extrapolation methods that handle the iterated-logarithm classes stop exactly one logarithm short. [1]

## What OpenAI claims

**Theorem** (almost-everywhere convergence in $L\log L$; OpenAI, 23 September 2026). For every complex-valued $f\in L\log L(\mathbb T)$ there is a null set $N_f$ such that

$$
\lim_{N\to\infty}S_Nf(x)=f(x)\qquad(x\in\mathbb T\setminus N_f),
$$

the limit along the full sequence $N=0,1,2,\dots$. Stein's theorem then gives the corresponding Luxemburg-norm weak-$L^{1}$ maximal bound as a corollary. [1]

What this does and does not say. The theorem is sufficiency: $L\log L$ is enough. It does not say that $L\log L$ is the exact threshold; the gap between $L\log L$ and $L^{1}$, where Kolmogorov's example lives, is not addressed. Only the one-dimensional circle and the ordinary symmetric partial sums are treated. [1]

## How the claimed proof goes

What follows is a map of the paper's argument from its introduction, which sets out the main estimate, the finite model, and the three constructions behind it, with the main statements of Sections 3 to 10. It is not a check of the details. [1]

**The statement.** Theorem 1.1: for every complex $f\in L\log L(\mathbb T)$ there is a null set off which the symmetric partial sums $S_Nf(x)$ converge to $f(x)$ along the full sequence $N=0,1,2,\dots$. Carleson proved this for $L^{2}$, Hunt for $L^{p}$ with $p>1$, Antonov for $L\log L\log\log\log L$; Kolmogorov's example shows it fails in $L^{1}$, and Konyagin's examples show it fails in spaces only slightly larger than $L\log L$. [1]

**One estimate on a good set (Section 10).** The main analytic estimate concerns one nonnegative input $\rho$ of mass one and height at most $e^{d}$, $d$ large. Let $M\rho$ be the uncentered maximal function over arcs, set $h=\log\log d$, and remove the set where $M\rho>e^{4h}$, which has measure at most $Ce^{-4h}$ by the maximal theorem. On the remainder, Theorem 10.1 proves

$$
\int_{\{M\rho\le e^{4h}\}}\sup_{N\ge0}|S_N\rho|\,d\mu\le Cd.
$$

The two bounds play different roles: the integral bound is summable against the masses of the height layers of an $L\log L$ function, since a layer of height $e^{d}$ has mass about $1/d$ times its contribution to $\int|f|\log|f|$, and the exceptional sets are summable when the layers are taken at doubly exponential heights $e^{d_k}$ with $d_k=2^{k}$, since $e^{-4h}=(\log d_k)^{-4}=k^{-4}\log^{-4}2$ sums over $k$. Proposition 10.2 assembles the layers into the theorem. Good-set integral estimates of this kind appear in Lie's near-endpoint argument; here they are quantified at the endpoint. [1]

**A finite dyadic model (Section 6).** On a finite binary tree of dyadic intervals, modulate the input by $e^{2\pi iuy}$ for an integer $u$ and, at each interval, take half the difference between the averages of the modulated input on its two children, a Haar coefficient. Along a uniformly chosen path down the tree this coefficient is known before the next left-or-right choice, and its output may be multiplied by a factor of modulus at most one depending on the intervening choice, which is what "delayed" means; stop the path when the average of the original input first exceeds $e^{4h}$. Proposition 6.1, the modulated delayed Haar estimate, bounds the integral of the supremum over all integer modulations $u$ of the resulting sum by $Cd$, uniformly in the tree depth. Averaging these delayed Haar kernels over translations and scales produces a nonzero multiple of the Hilbert kernel, by the dyadic representation method of Petermichl and Hytönen, with the error controlled on the same good set, and the periodic Hilbert transform gives the symmetric Fourier projections (Section 10). [1]

**Controlling many frequencies (Sections 3 to 5).** The finite proof must handle all modulation frequencies at once without a loss growing with their number, the problem Fefferman solved with a measurable frequency selector and Lacey-Thiele with tiles and trees. The paper's approach is probabilistic: it splits the input into pieces and, on each, uses a noisy observation of the input point, sampled with probability proportional to the density, to identify frequencies with nearly the same phase, while the transform is estimated along a uniformly sampled output path; information is counted under the first law and converted into path estimates under the second. Three constructions make this work. First, the compression lemma (Sections 3 and 4, ending in Proposition 4.2, finite refinement search): from a finite set of integer frequencies and a uniform bound on noisy sums of independent samples from any law on it, produce a large subset whose phase defects relative to one centre frequency are small on average over one common region, with the conclusion valid for every later choice of weights on the subset; the proof introduces correlated samples with prescribed marginals and controls their relative entropy together with the information in the noisy sum, refining conditional laws in two stages. Second, the cost of a new observation (Section 5): a label is $Z=Y+\theta$ with noise density proportional to $e^{-A}$, $A$ a nonnegative combination of $1-\cos(2\pi sy)$; nonnegative Fourier coefficients and the Griffiths-Ginibre positive-correlation method control how the density changes when a term is added, and compression either produces an event unlikely under a comparison law, bounded by likelihood information, or enlarges the set of phase-stable frequencies, bounded by packing (Proposition 5.4, regular evidence). Third, separate costs for information and for choosing frequencies (Sections 6 to 8): the tree is cut into "live plateaus" with fixed noise law and mass normalization, cumulative lists approximate the relevant frequencies, snapshots store representatives and mass measures and are refreshed before the next output bit when the measures have changed enough (Proposition 7.2, capture on a plateau), and the scalar and vector path estimates (Propositions 8.2 and 8.6) charge label information with an absolute coefficient while the logarithms of representative counts appear only in a probability tail. [1]

**The budget.** The expected costs of choosing representatives and the remaining path terms on each live plateau are $O(d/h)$ under uniform output sampling; the total starting weight of the plateaus is $O(h)$; their product is $O(d)$, which is the bound in Proposition 6.1 (Proposition 6.2, live budgets). Information and errors from input near dyadic boundaries are charged directly across all plateaus. Section 9 assembles the dyadic estimate. [1]

Where would an expert look first? At Theorem 10.1 and the layer summation of Proposition 10.2, which is where $L\log L$ enters and where the doubly exponential layer heights must be shown to suffice; at the compression lemma's entropy argument, which is the unusual ingredient; at the plateau budget $O(d/h)\times O(h)$, since any loss there would push the result away from the endpoint; and at the kernel averaging that recovers the symmetric partial sums with errors controlled on the same good set. [1]

## Consequences inside mathematics

If the proof holds, the convergence problem for Fourier series is settled at the $L\log L$ endpoint, completing the line from Carleson and Hunt through Sjölin and Antonov; the maximal Carleson operator maps $L\log L$ to weak $L^{1}$; and the entropy-based control of frequencies is a new tool in time-frequency analysis, where the tile-and-tree methods had reached their limit. Whether anything between $L\log L$ and $L^{1}$ still converges remains open, as does the analogous problem for Walsh series and in higher dimensions. [1]

## Uses outside mathematics

No known direct application.

Fourier series are the basis of signal processing, but engineers work with finite data and square-integrable signals, where Carleson's theorem already applies; the $L\log L$ endpoint concerns functions rougher than any signal in practice. [1]

## Has anyone checked it?

We found no named mathematician who says they are reading or checking this paper, and no public comment from Lie, Di Plinio, Thiele, Lacey, Arias de Reyna or Carro, whose work it builds on. VibeMathed records no check by an independent mathematician. [4]

**Machine checking.** The 6 October release had no Lean scope note and no comparator statement for this family. On 7 October OpenAI added a statement `FourierLLogL.lean` and listed it in the catalogue `formalization.yaml`, where it stands at the pinned commit; its scope note states almost-everywhere convergence along the full sequence for every measurable complex $f$ with $\int|f|\log(2+|f|)<\infty$, which is the theorem. A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval. [5]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; this paper is not among them, and the same update added its Lean statement. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [6]

## Sources

1. OpenAI, "Almost-everywhere Fourier convergence in L log L", 23 September 2026. The theorem, the history, "The estimate behind the convergence theorem" and "The structural argument". Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Almost-everywhere-Fourier-convergence-in-L-log-L-September-23-2026/paper.pdf
2. Lennart Carleson, "On convergence and growth of partial sums of Fourier series", Acta Mathematica 116 (1966), 135-157. https://doi.org/10.1007/BF02392815
3. N. Yu. Antonov, "Convergence of Fourier series", East Journal on Approximations 2 (1996), 187-196; and Victor Lie, "Pointwise convergence of Fourier series (I). On a conjecture of Konyagin", Journal of the European Mathematical Society 19 (2017), 1655-1701, Conjecture 1. https://doi.org/10.4171/JEMS/703
4. VibeMathed, "Almost everywhere convergence of Fourier series in L log L", read 20 October 2026. https://vibemathed.com/problem/fourier-series-ae-convergence-l-log-l
5. OpenAI, Lean scope note for family 075 and the comparator statement `FourierLLogL.lean` at the pinned commit, both added on 7 October. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/075.md and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/FourierLLogL.lean
6. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
