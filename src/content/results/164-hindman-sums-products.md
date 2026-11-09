---
family: "164"
topic: "Hindman’s sums and products"
title: "Colour the whole numbers: must some set have all its sums and all its products in one colour?"
paperTitle: "Monochromatic finite sums and products in the positive integers"
claim: "For every finite colouring of the positive integers and every m, there are m positive integers a_1 < ... < a_m such that every nonempty subset sum and every nonempty subset product has the same colour; the a_j can be chosen so widely separated that all 2(2^m − 1) − m sums and products are distinct. This is Hindman's finite sums and products conjecture, Erdős Problem 172."
status: unreviewed
checked: 2026-10-20
papers:
  - preprints/Monochromatic-finite-sums-and-products-in-the-positive-integers-September-23-2026/paper.pdf
draft: false
---

Paint every positive integer one of finitely many colours. In 1916 Schur proved that some $x$, $y$ and $x+y$ share a colour; Folkman, Rado and Sanders extended this to arbitrarily large finite sets all of whose subset sums share a colour; and in 1974 Neil Hindman proved it for an infinite set. Multiplication alone behaves the same way, by colouring exponents. The hard question is both at once. Hindman showed in 1980 that no infinite set can have all its elements, pairwise sums and pairwise products in one colour, and in 1979 he conjectured that finite sets of every size can: for every $m$ there are $m$ numbers whose subset sums and subset products are all the same colour. Even the four-element case $\{x,y,x+y,xy\}$ for two colours needed computer help from Graham and Hindman; Moreira's 2017 Annals paper gave $\{x,x+y,xy\}$ for any number of colours; Bowen and Sabok proved the four-element case over the rationals, and Alweiss proved the full conjecture over the rationals in a paper accepted at Duke. The integers resisted, because scaling a sum and scaling a product behave differently, so rational solutions cannot simply be cleared of denominators. The problem is number 172 on the Erdős problems list. On 23 September 2026 OpenAI posted a seventy-page paper claiming it. [1][2][3]

As of 20 October 2026 no mathematician has said publicly that they have read or checked the proof. An outside Lean 4 formalization following the paper, posted on 7 October, has been replayed by two independent checkers. The status on this page is "unreviewed"; see below.

## The problem

For a finite set $A\subset\mathbb N$ let $\mathrm{FS}(A)$ be the set of sums over nonempty subsets of $A$ and $\mathrm{FP}(A)$ the set of products, each element used at most once, singletons included. [1]

**Hindman's finite sums and products conjecture (1979; Hindman and Strauss, Question 17.18).** For every finite colouring of $\mathbb N$ and every $m\ge1$ there is an $m$-element set $A$ with $\mathrm{FS}(A)\cup\mathrm{FP}(A)$ monochromatic. [1]

## Why it stayed open

What was known. The purely additive and purely multiplicative statements are classical. For the mixed problem: Graham and Hindman's computer-assisted $\{x,y,x+y,xy\}$ for two colours; Bowen's proof with $x,y$ distinct and large; Moreira's $\{x,x+y,xy\}$ for every finite colouring, with prefix products and polynomial shifts; Alweiss's polynomial patterns; Alweiss, Bowen and Sabok's $\{x,y,xy,x+iy\}$ for two colours; Green and Sanders in large prime fields; Bergelson and Moreira's ergodic methods; Bowen and Sabok's four-element case over $\mathbb Q$ and Alweiss's full theorem over $\mathbb Q$; Richter's density theorems for $\{x+Q(y),xy\}$. [1]

Why the integers are harder than the rationals. Over $\mathbb Q$ one can rescale freely, but a common dilation multiplies a sum by one power of the dilation and a product of $j$ terms by its $j$-th power, and an arbitrary colouring of $\mathbb N$ need not respect these different changes; the paper says the passage "requires more than clearing denominators". [1]

## What OpenAI claims

**Theorem 1.1** (OpenAI, 23 September 2026). Let $r,m\ge1$ and fix real $R\ge2$, $D\ge1$. For every colouring $\chi:\mathbb N\to[r]$ there are distinct positive integers $a_1<\dots<a_m$ and a colour $c$ such that

$$
\chi\Bigl(\sum_{j\in J}a_j\Bigr)=\chi\Bigl(\prod_{j\in J}a_j\Bigr)=c\qquad\text{for every nonempty }J\subseteq[m],
$$

and moreover $a_1>R$ and $a_d>R\bigl(\sum_{k<d}a_k+\prod_{k<d}a_k\bigr)^{D}$ for $2\le d\le m$. [1]

**Corollary 1.2.** The set can be chosen with $|\mathrm{FS}(A)|=|\mathrm{FP}(A)|=2^{m}-1$ and $\mathrm{FS}(A)\cap\mathrm{FP}(A)=A$, so the monochromatic union has $2(2^{m}-1)-m$ distinct elements. [1]

What this does and does not say. The theorem is for prescribed finite $m$; it does not assert an infinite simultaneous sequence, which Hindman showed cannot exist. By compactness there are finite thresholds, but the paper gives no numerical bound. The statement for colourings of $\mathbb N_0$ follows by restriction. [1]

## How the claimed proof goes

What follows is a map of the paper's argument from its introduction and from Section 2, where the two principles are stated exactly and the theorem is deduced from them. It is not a check of the details. [1]

**The statement.** Theorem 1.1: for all $r,m\ge1$ and any $R\ge2$, $D\ge1$, every $r$-colouring of $\mathbb N$ admits distinct $a_1<\dots<a_m$ and a colour $c$ such that every nonempty subset sum and every nonempty subset product has colour $c$; moreover the $a_d$ can be taken rapidly increasing, $a_1>R$ and $a_d>R(\sum_{k<d}a_k+\prod_{k<d}a_k)^{D}$, so that no two of the $2^{m+1}-2$ expressions collide except the shared singletons (Corollary 1.2). The paper notes that all parameters are qualitative: finiteness and the order of choice matter, but no numerical bound for the smallest configuration is claimed. [1]

**The combinatorial frame (Section 2).** Variables are grouped into blocks $B=T\cup\{i\}$ with a tail $T$ and a pivot $i>T$, and a chain of length $m$ is a list of blocks $B_d=T_d\cup\{i_d\}$ with $T_1<\dots<T_m<i_1<\dots<i_m$, so that earlier blocks lie in the set $\mathcal E_{B_d}$ of blocks whose values are added at the anchor $B_d$. The chosen integers are products $h_Bb_Bt_B$ of a fixed smooth factor, a rational scale and a raw variable. A Ramsey argument and the finite sums theorem, in the Folkman-Rado-Sanders finite form, select a chain whose nonempty block products already share a colour (Lemma 2.5, selection of a product chain), following the ordered-block selection in Alweiss's proof for the rationals; the task is to make the sums share it too, and this is split into two principles. [1]

**The Prediction Principle (2.3).** For every $m$ there is a nilpotence step $s(m)$ such that, for any colouring, lists and tolerances $\tau,\eta$, there are admissible parameters and step-at-most-$s$ "models" $S_{B,a,c}$, piecewise nilsequences, that is Lipschitz functions evaluated along polynomial orbits on nilmanifolds separately on intervals and residue classes, with two properties along a fixed ultrafilter in the asymptotic parameter $w$. First, a colour occurring at a centre is unlikely to have a small predicted value there: $\mathbb P(\chi(h_Bat_B)=c,\ S_{B,a,c}(t_B)\le2\tau)\le3\tau+\eta$. Second, for a chain, the nonnegative weighted count $\mathcal I_{b,c,\mathbf B}$ of configurations whose products all have colour $c$ and whose sums $L_J(z)$ have colour $c$, weighted by divisor weights $\nu_d$, is within $\eta$ of the same count with the colour indicators at the sums replaced by the models $S_{d(J)}(L_J)$, the multiplicative colour masks $U(z)$ being kept. The weights put the function at each sum under the same majorant as the function at its last summand, and positivity of the weighted count still gives an actual monochromatic configuration. [1]

**The Alignment Principle (2.4).** For every $n,r,s$ there are finite lists $\mathcal B,\mathcal A$ of rational scale vectors and a constant $\delta>0$ depending only on $n,r,s$ such that, for any admissible family, any system of step-at-most-$s$ models and any $\tau>0$, with probability at least $\delta$ in the limit some $b\in\mathcal B$ has, simultaneously for every block, colour and subset $D\subseteq\mathcal E_B$: if $S_{B,b_B,c}(t_B)>2\tau$ then $S_{B,b_B,c}$ stays above $\tau$ after adding $\sum_{A\in D}(h_Ab_A/h_Bb_B)t_A$. The point is that $\delta$ is independent of $\tau$ and of the complexity of the models, which permits the calibration tolerance to be chosen before the models are built; no convergence rate uniform in complexity is asserted, only a uniform positive lower bound. Together the principles give the theorem: select the chain, predict, align, and read off a configuration from a positive count, with Corollary 2.6 supplying the finite-interval form with prescribed divisibility. [1]

**Construction one: divisor weights (Sections 3 and 4).** Each chosen element is a product of several raw variables, so its distribution differs from a single variable's at the same scale. Nonnegative weights encode divisibility by the earlier variables and are attached to every sum ending at a block (Lemma 3.3, master scales; Proposition 3.6, weighted linear forms). Prime substitutions and a weighted Cauchy-Schwarz remove the product-colour conditions and reduce the counting error to one-variable additive tests (Lemma 4.1, prime insertion; Lemma 4.2, weighted removal of multiplicative masks; Proposition 4.5, uniform correlation test). [1]

**Construction two: predictions at two scales (Section 5).** The counting estimate tests short additive shifts while Alignment needs one model valid across a larger interval. Nilsequence models are built on nested intervals from the Green-Tao-Ziegler inverse theorem, transferred through dense models (Lemma 5.1, dual-test pseudorandomness; Proposition 5.2, bounded dense models), and Ramsey selection of gap energies (Lemma 5.4) makes their projections close, so one model serves both, with step depending only on $m$. [1]

**Construction three: shifts as nilsequence states (Sections 6 to 8).** Adding an earlier block product may require a non-integer change in a block's largest variable. An integer residue correction is made first, and the remaining displacement is realized as a transformation of the nilsequence model, justified in two ways: by comparing averages on arithmetic progressions with a rough step (Theorem 6.1, a corrected box form of the quantitative Leibman theorem; Proposition 6.3, removal of a rough step), and by a lifting theorem that makes transformations for different models act on one common state (Proposition 7.4, the simultaneous local cube law; Proposition 7.5, a marginal face symmetry has a joint lift). These transformations generate a nilpotent group of bounded step (Lemma 7.7), and finite polynomial recurrence in it, from Zorin-Kranich, gives the uniform alignment probability (Section 8, finite word plan, conditional face invariance, conditional alignment mass). [1]

**Inputs.** The Green-Tao-Ziegler inverse theorem for Gowers norms, the Tao-Ziegler concatenation theorem, Green and Tao's quantitative equidistribution on nilmanifolds, and Zorin-Kranich's nilpotent polynomial recurrence, each stated in the form used; the transference, progression-comparison and lifting arguments are proved in the paper. [1]

Where would an expert look first? At the uniformity of $\delta$ in the Alignment Principle, which is the hinge of the whole order of choices; at the lifting theorem of Section 7 and the rough-step comparison of Section 6, which realize shifts as nilsequence transformations; at the weighted Cauchy-Schwarz of Section 4, where the product conditions are removed; and at the outside Lean formalization described below, which follows this paper's deduction but imports the Alignment Principle from the release's Lean library and replaces one input, so it is not a check of Sections 6 to 8 as written. [1]

## Consequences inside mathematics

If the proof holds, Hindman's 1979 conjecture is a theorem, Erdős Problem 172 is solved, Moreira's triple and Alweiss's rational theorem become special cases, and the mixed additive-multiplicative Ramsey theory of the integers reaches the strongest statement compatible with Hindman's 1980 counterexample. The quantitative question, how large $\mathbb N$ must be cut off for a given $r$ and $m$, remains open. [1]

## Uses outside mathematics

No known direct application.

Ramsey theory's statement that complete disorder is impossible has no engineering counterpart here; the theorem is about arbitrary colourings of all integers. [1]

## Has anyone checked it?

We found no named mathematician who says they are reading or checking the paper, and no public comment from Hindman, Moreira, Bergelson, Alweiss, Bowen or Sabok, whose work it builds on. Thomas Bloom's Erdős problems database records the result as a claim rather than an endorsement. [4]

**Machine checking.** The release itself provides no Lean statement for this family. Outside the release, Yao Xu posted a Lean 4 proof of the theorem without the separation clause, `hindman_finite_sums_products`, on 7 October, developed with AI assistance; its README says it follows the paper's deduction from the two principles, takes the Alignment Principle and a cyclic inverse theorem from the release's Lean library, and replaces the Tao-Ziegler concatenation theorem by a box-norm concatenation of Kravitz, Kuca and Leng. The repository reports a build with no unproved steps and standard axioms, and the proof was replayed in a fresh kernel by the Erdős Problem a Day project on 11 October and accepted by the independent checker nanoda on 10 October. This is the first outside formalization of a release theorem we have recorded. It is machine evidence, resting partly on the release's own library, by an author whose standing we cannot assess, and Uruk does not count it as human approval. [4][5]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; this paper is not among them. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [6]

## Sources

1. OpenAI, "Monochromatic finite sums and products in the positive integers", 23 September 2026. Theorem 1.1, Corollary 1.2, the history and the proof strategy. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Monochromatic-finite-sums-and-products-in-the-positive-integers-September-23-2026/paper.pdf
2. Neil Hindman, "Partitions and sums and products of integers", Transactions of the American Mathematical Society 247 (1979), 227-245. https://doi.org/10.1090/S0002-9947-1979-0517693-4
3. Joel Moreira, "Monochromatic sums and products in N", Annals of Mathematics 185 (2017), 1069-1090; and Ryan Alweiss, "Monochromatic sums and products over Q", arXiv:2307.08901, accepted for publication in Duke Mathematical Journal. https://doi.org/10.4007/annals.2017.185.3.10 and https://arxiv.org/abs/2307.08901
4. Erdős Problem a Day, "#172: OpenAI's proof of Hindman's sums-and-products conjecture", closed 11 October 2026, with its kernel replay; and the Erdős Problems wiki entry on the claim, read 20 October 2026. https://erdosproblemaday.com/day/172-openai-hindman-sums-products-refereed and https://erdosproblems.ai/wiki/problems/ramsey_theory/E0172/claims/2026_09_23_openai
5. Yao Xu, `hindman-sums-products-lean4`, GitHub repository `cadamcat`, tag v1.0.0, 7 October 2026. https://github.com/cadamcat/hindman-sums-products-lean4
6. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
