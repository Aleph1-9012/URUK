---
family: "159"
topic: "Erdős’s reciprocal sums"
title: "If a set of whole numbers is not too thin, must it contain evenly spaced runs of every length?"
paperTitle: "Quasipolynomial Bounds for Arithmetic Progressions"
claim: "Every set of positive integers whose reciprocals have a divergent sum contains arithmetic progressions of every finite length. Quantitatively, for each fixed k ≥ 3, a subset of {1, ..., N} with no k-term progression has at most C_k N exp(−c_k (log N)^(ε_k)) elements."
status: unreviewed
checked: 2026-10-17
papers:
  - preprints/Quasipolynomial-Bounds-for-Arithmetic-Progressions-September-23-2026/paper.pdf
draft: false
visual: thick-enough
---

An arithmetic progression is a run of numbers with a constant gap, such as $5,8,11,14$. Paul Erdős asked whether every set of positive integers that is "not too thin" must contain such runs of every length, and he made "not too thin" precise in a way that covers the prime numbers: the reciprocals of the set's members should add up to infinity. He offered \$5000 for an answer. The three-term case was proved in 2020. The primes themselves, which Erdős saw as the motivating example, were handled by Green and Tao in 2004 by a different route. On 23 September 2026 OpenAI posted a 198-page paper claiming the full answer, yes, as a corollary of a much stronger statement about how large a set can be while avoiding a progression. [1][2][3]

As of 17 October 2026 no mathematician has said publicly that they have checked the proof. Thomas Bloom, who runs the Erdős problems database and proved the three-term case, has discussed it without claiming a check. The status on this page is "unreviewed".

## The problem

An arithmetic progression of length $k$ is a list $a,\ a+d,\ a+2d,\ \ldots,\ a+(k-1)d$ with a common difference $d>0$. The odd numbers below $10$ form one of length five, and $3,7,11,15$ is one of length four. Write $[N]$ for the set $\{1,2,\ldots,N\}$. [1]

For a set $A$ of positive integers, its reciprocal sum is $\sum_{a\in A}1/a$. Whether this sum is finite or infinite is a measure of how thick the set is. For all positive integers it is the harmonic series $1+\tfrac12+\tfrac13+\cdots$, which grows without bound. For the primes it also diverges, a fact Euler proved in 1737, even though primes become rarer and rarer. For the squares it converges, to $\pi^{2}/6$. For the powers of two $1,2,4,8,\ldots$ it converges to $2$. [4]

The powers of two show that an infinite set can avoid progressions completely. Three of them, $2^{i}<2^{j}<2^{l}$, would form a progression only if $2^{i}+2^{l}=2\cdot2^{j}=2^{j+1}$, which is impossible because $2^{l}$ alone is already at least $2^{j+1}$. Erdős's conjecture says this can only happen because the set is thin. Any set whose reciprocal sum diverges must contain progressions of every length. [2]

The finite version of the question asks how large a progression-free set can be. Let $r_k(N)$ be the largest number of elements of $[N]$ with no $k$-term progression. Small values can be found by exhaustive search: $r_3(9)=5$, and $r_3(14)=8$, attained for example by $\{1,2,4,5,10,11,13,14\}$. Every set of nine numbers from $[14]$ contains three in progression. [5]

The two questions are linked by a short calculation that the paper gives in full. Split the positive integers into blocks $[2^{m},2^{m+1})$, each twice as long as the one before. A set with no $k$-term progression meets the block $[2^{m},2^{m+1})$ in at most $r_k(2^{m})$ elements, and each of those has reciprocal at most $2^{-m}$. So its reciprocal sum is at most $1+\sum_{m\ge1}r_k(2^{m})/2^{m}$. If that series converges, every progression-free set has a finite reciprocal sum, which is Erdős's conjecture read backwards. The series converges as soon as $r_k(N)$ is a little smaller than $N/\log N$; Bloom's database notes that $N/\bigl((\log N)(\log\log N)^{2}\bigr)$ would be enough. Knowing only that $r_k(N)/N$ tends to zero, which is Szemerédi's theorem, is not enough. [1][2]

## Why it stayed open

### Ninety years of bounds

Van der Waerden proved in 1927 that if the positive integers are coloured with finitely many colours, one colour class contains progressions of every length. In 1936 Erdős and Turán asked for the stronger density version: does every set containing a positive proportion of the integers contain them? Roth proved the three-term case in 1953 using Fourier analysis. Szemerédi proved the four-term case in 1969 and the general case in 1975, in one of the most influential combinatorial arguments of the century. Furstenberg gave an ergodic-theory proof in 1977. [1][6]

Szemerédi's theorem says $r_k(N)/N\to0$. Erdős's question needs to know how fast, and here the subject splits by length. [1][2]

For three terms the bounds improved steadily. Roth had $N/\log\log N$. Heath-Brown and Szemerédi reached $N/(\log N)^{c}$; Bourgain, Sanders and Bloom pushed the power of $\log N$ toward one; and in 2020 Bloom and Sisask crossed it with $r_3(N)\ll N/(\log N)^{1+c}$, which settled the three-term case of Erdős's conjecture. In 2023 Kelley and Meka jumped to $N\exp(-c(\log N)^{1/12})$, since improved by Bloom and Sisask and by Raghavan. In the other direction, Behrend's 1946 construction gives three-term-free sets of size $N\exp(-C\sqrt{\log N})$, so no bound of the form $N^{1-\delta}$ is possible. [1][7][8]

For four or more terms Fourier analysis is not enough. A set can look random to every Fourier test and still have the wrong number of four-term progressions. Detecting that requires higher-order uniformity, measured by the Gowers norms, which Gowers introduced for this purpose. His 2001 bound was $r_k(N)\ll N/(\log\log N)^{c_k}$. Green and Tao reached $N/(\log N)^{c}$ for four terms in 2017. In 2024 Leng, Sah and Sawhney proved $r_k(N)\ll N\exp(-(\log\log N)^{c_k})$ for every $k\ge5$ with some $0<c_k<1$. All of these fall short of the dyadic threshold, which needs more than a full power of $\log N$. [1][2][9]

The primes are a set of density zero, so Szemerédi's theorem does not apply to them, but their reciprocal sum diverges. Erdős thought his conjecture was "the only way to approach" the question of long progressions of primes. Green and Tao answered that question in 2004 by a different route, a transference principle that does not go through Erdős's conjecture. [2][10]

## What OpenAI claims

**Theorem 1.1** (OpenAI, 23 September 2026). For each fixed integer $k\ge3$ there are constants $C_k,c_k,\varepsilon_k>0$ such that, for every $N\ge2$,

$$
r_k(N)\le C_kN\exp\bigl(-c_k(\log N)^{\varepsilon_k}\bigr).
$$

Equivalently, a subset of $[N]$ with density $\alpha$ contains a $k$-term progression once $\log N\ge A_k(2+\log(1/\alpha))^{A_k}$. [1]

**Corollary 1.2.** Every set $A$ of positive integers with $\sum_{a\in A}1/a=\infty$ contains arithmetic progressions of every finite length. [1]

The corollary follows from the theorem by the dyadic calculation above, in half a page. The theorem is far stronger than the corollary needs. It gives every length the same shape of bound that Kelley and Meka found for three terms. What it does not say: it claims no improvement of the three-term exponent, the exponents $\varepsilon_k$ are not computed or optimized, the constants depend on $k$, and there is no asymptotic formula for $r_k(N)$. [1]

## How the claimed proof goes

What follows is a map of the paper's own structure, taken from its introduction and section plan. It is not a check of the 198 pages. [1]

**The method.** The proof is a density increment, the strategy Roth introduced in 1953. Suppose a set occupies a fraction $\alpha$ of $[N]$ and has no $k$-term progression. A random set of that density would contain many progressions, so this set is not random. The shortage of progressions forces it to be denser than average on some structured sub-piece of $[N]$. Zoom in on that piece: the set now has density at least $\alpha(1+c)$ there, and still no progressions. Repeat. Each round multiplies the density by a fixed factor, so after about $\log(1/\alpha)$ rounds the density would exceed one, which is impossible. So a progression must exist. The difficulty is entirely quantitative. Each zoom shrinks the space and loses precision, and if those losses compound, the final bound is weak. For longer progressions the structured pieces are described by polynomial phases and nilsequences, and every round costs size and precision. Keeping the total loss polynomial in $\log(1/\alpha)$ is the whole problem, and the paper's contribution is a bookkeeping scheme that does it. [1]

**The regions.** The structured pieces the proof zooms into are triangular polynomial cells. A spatial variable $u$ determines integer blocks $b_1,\ldots,b_D$ one after another, through constraints of the form

$$
\|b_h-C_h(u,b_1,\ldots,b_{h-1})-l_h\|_\infty\le w_h,\qquad 0<w_h\le\tfrac1{32},
$$

where each $C_h$ is a polynomial of weighted degree at most $h$ and $D$ depends only on $k$. The widths $w_h$ are so narrow that each block is unique when it exists, so old constraints stay exactly true when new ones are added. [1]

**The bookkeeping that makes it work.** Write $Q_h=\log(2/w_h)$ for the precision at weight $h$. The key claim is that one increment adds extra precision at weight $h$ bounded by a polynomial in the dimensions, the logarithmic density and the precisions at strictly higher weights only, never in $Q_h$ itself or the lower ones. Since the number of weights is fixed, a descending induction then keeps every dimension and precision polynomial in $\log(1/\alpha)$ through all $O(\log(1/\alpha))$ rounds. That is what turns a density increment into a bound of the form $\exp(-(\log N)^{\varepsilon})$. [1]

**Finding an increment.** On a box with long sides, the higher-order inverse theorem of Leng, Sah and Sawhney turns a shortage of progressions into correlation with a nilsequence, a smooth function along a polynomial orbit. A shift-comparison theorem, adapting Kelley and Meka's methods as developed by Bloom and Sisask, passes from that correlation to positive counting. Schoen and Sisask's almost-periodicity theorem and Leng's equidistribution estimates supply the rest. The paper names these two external analytic inputs, the inverse theorem and the almost-periodicity theorem, as the principal ones. [1][9]

**Returning to the cell.** The increment is found on a sampled box and must be rewritten in the cell's original variables without disturbing the old equations, whose errors would otherwise spread to every later polynomial. Sections on ascent, active layers and extraction do this, with a cube form of Conlon, Fox and Zhao's densification for low-degree tests. The appendices, more than half of the TeX source, prove the inverse and counting tools with explicit dependence on every growing parameter. [1]

Thomas Bloom's first impression was that the paper "appears to use essentially all of the existing techniques currently used in the area". Where would an expert look first? At the claim that the precision loss at each weight depends only on higher weights, which is what the whole iteration rests on; at the return argument, which the introduction singles out as "the quantitative issue addressed here"; and at whether each external theorem is applied within its stated hypotheses after the paper's reductions to boxes and product groups. [1][3]

## Consequences inside mathematics

The paper proves a stronger divergence criterion: for every fixed $B\ge0$, a set with $\sum_{a\in A}(\log(2+a))^{B}/a=\infty$ contains progressions of every length. It recovers Green and Tao's theorem that every subset of the primes with positive relative upper density contains long progressions. And it bounds van der Waerden numbers: every colouring of $[N]$ with $r$ colours has a one-coloured $k$-term progression once $N\ge\exp(A_k(2+\log r)^{A_k})$, which together with a lower bound claimed in family 160 of the same release would pin the growth in $r$ between superpolynomial and quasipolynomial. [1][11]

If the theorem holds, it also settles a second Erdős problem. In 1981 Erdős conjectured that $r_k(N)\ll_C N/(\log N)^{C}$ for every $C>0$ and every $k$, which Kelley and Meka had proved for $k=3$. The bound $N\exp(-c(\log N)^{\varepsilon})$ beats every power of $\log N$, so it gives this for all $k\ge3$. [1][2]

## Uses outside mathematics

No known direct application.

Sets without progressions do appear in computer science. Coppersmith and Winograd's 1990 matrix multiplication algorithm, for example, was built on a construction of large sets with no three-term progression. The new theorem goes the other way. It limits how large such sets can be and constructs nothing. [12]

## Has anyone checked it?

No named mathematician has said they are reading or checking this proof. Thomas Bloom, who proved the three-term case with Sisask and runs the Erdős problems database, listed the claim on 8 October with an explicit disclaimer: he had "not yet looked at in any serious way any of the proofs", and the post "should not be read as any kind of endorsement". He also said of the release as a whole that the papers "are, at a glance, very poorly written, in the usual AI fashion" and that he expected "the vast majority of them are (a) correct yet (b) capable of being substantially simplified". In the comments a user posting as jleng01, whom Bloom addresses as James and who wrote that he is "familiar with many of the key ideas in the proof", described it as "largely a synthesis of previous work on the problem" and suggested waiting for a simpler proof before digesting this one. Bloom agreed, writing that the AI proof "tells us (a) the statement is true and (b) some combination of existing techniques, pushed sufficiently far, is capable of proving it", and that he would rather find a much simpler alternative than try to understand the AI's version. That is a judgment about where the subject stands, not a report of a check. [3]

Bloom's database has gone one step further in its wording. Its page for Problem 3, last edited on 16 October, links the formal proof and describes Erdős's stronger 1981 conjecture as "now known for all $k\ge3$". That takes the paper's main theorem as established. It is the database owner's editorial judgment, made after he said he had not checked the proof, and under Uruk's definitions it does not change the label. VibeMathed records that no independent mathematician has checked the result. [2][13]

**Machine checking.** The release's Lean statement is 36 lines and self-contained. It defines a progression with positive common difference and states that any set of natural numbers whose reciprocals are not summable contains progressions of every length. That is Corollary 1.2, not Theorem 1.1. The formal proof, about 4,800 files, reaches it through a weaker density bound, $r_k(N)\le CN\exp(-c(\log\log N)^{1+\eta})$, stated in its `Model.lean`. Bloom noticed this, and we confirmed it at the pinned commit. That bound is still enough for the reciprocal sum, and for $k\ge4$ it would itself improve every earlier bound, but it is not the paper's main theorem and it does not give the "every power of $\log N$" consequence above. The Erdős Problems wiki run by Plasma AI reports that it built the declaration and found it identical to the comparator statement. The statement is not listed in the release's catalogue `formalization.yaml`. A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval. [3][14][15]

The release also includes an abridged summary of the model's reasoning for this result. It describes two tasks, a first argument for the reciprocal-sum problem and a second for the stronger bound, which matches the two bounds above. [16]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; none of them is this family, and the Lean statement did not change. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [17]

## Sources

1. OpenAI, "Quasipolynomial Bounds for Arithmetic Progressions", 23 September 2026. Theorem 1.1, Corollary 1.2 and its proof, Sections 1.1 to 1.5 including the history of bounds, Section 11 for the consequences. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Quasipolynomial-Bounds-for-Arithmetic-Progressions-September-23-2026/paper.pdf
2. Thomas Bloom, Erdős Problem #3, erdosproblems.com, last edited 16 October 2026, read 17 October 2026. The \$5000 prize, the sufficient bound, the known cases, Erdős's remark on the primes, his 1981 stronger conjecture and the note that it is "now known for all $k\ge3$". https://www.erdosproblems.com/3
3. Thomas Bloom, "Erdős problems in the OpenAI proofs", erdosproblems.com forum, 8 October 2026, with the comment thread of 8 to 12 October. https://www.erdosproblems.com/forum/thread/blog:10
4. Wikipedia, "Divergence of the sum of the reciprocals of the primes" and "Basel problem", read 17 October 2026. https://en.wikipedia.org/wiki/Divergence_of_the_sum_of_the_reciprocals_of_the_primes and https://en.wikipedia.org/wiki/Basel_problem
5. OEIS A003002, "Size of the largest subset of the numbers [1...n] which does not contain a 3-term arithmetic progression". The values $r_3(9)=5$ and $r_3(14)=8$; the example set was found by our own exhaustive search. https://oeis.org/A003002
6. E. Szemerédi, "On sets of integers containing no k elements in arithmetic progression", Acta Arithmetica 27 (1975), 199-245. https://doi.org/10.4064/aa-27-1-199-245
7. Thomas F. Bloom and Olof Sisask, "Breaking the logarithmic barrier in Roth's theorem on arithmetic progressions", arXiv, 2020. https://arxiv.org/abs/2007.03528
8. Zander Kelley and Raghu Meka, "Strong bounds for 3-progressions", arXiv, 2023. https://arxiv.org/abs/2302.05537
9. James Leng, Ashwin Sah and Mehtaab Sawhney, "Improved bounds for Szemerédi's theorem", arXiv, 2024. https://arxiv.org/abs/2402.17995
10. Ben Green and Terence Tao, "The primes contain arbitrarily long arithmetic progressions", Annals of Mathematics 167 (2008), 481-547. https://doi.org/10.4007/annals.2008.167.481
11. OpenAI, "Quantitative Superexponential Bounds for van der Waerden Numbers", family 160, 23 September 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Quantitative-Superexponential-Bounds-for-van-der-Waerden-Numbers-September-23-2026/paper.pdf
12. Don Coppersmith and Shmuel Winograd, "Matrix multiplication via arithmetic progressions", Journal of Symbolic Computation 9 (1990), 251-280. https://doi.org/10.1016/S0747-7171(08)80013-2
13. VibeMathed, "Erdős Problem #3: sets with divergent reciprocal sum contain arbitrarily long arithmetic progressions", read 17 October 2026. https://vibemathed.com/problem/erdos-3
14. OpenAI, comparator statement `ErdosReciprocal.lean`, the solution library's `Model.lean`, and the scope note for family 159 at the pinned commit. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/ErdosReciprocal.lean , https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/OAI/Combinatorics/Progressions/Model.lean and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/159.md
15. Erdős Problems wiki (Plasma AI), "OpenAI's proof of the reciprocal-sum conjecture", read 17 October 2026. https://erdosproblems.ai/wiki/problems/additive_combinatorics/E0003/claims/2026_09_23_openai
16. OpenAI, "Summarized chain of thought (Quasipolynomial bounds for arithmetic progressions)", reasoning summary at the pinned commit. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/reasoning_traces/quasipolynomial-arithmetic-progressions.pdf
17. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
