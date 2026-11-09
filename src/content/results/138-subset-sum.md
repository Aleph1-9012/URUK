---
family: "138"
topic: "Subset Sum below meet-in-the-middle"
title: "Given n numbers and a target, can you find a subset that adds up to it faster than checking half of all subsets?"
paperTitle: "Subset Sum in Time O(2^(0.49n))"
claim: "A randomized algorithm decides Subset Sum on n integers of polynomially many bits in O(2^{0.49n}) word operations on every run, correct with probability at least 2/3, breaking the 2^{n/2} meet-in-the-middle bound that had stood since 1974. A companion keeps the 2^{n/2} time but uses only about 2^{0.2n} words of memory."
status: unreviewed
checked: 2026-11-03
papers:
  - preprints/Subset-Sum-in-Time-2-power-0-49n-October-4-2026/subset-sum.pdf
  - preprints/A-Low-Space-Algorithm-for-Worst-Case-Subset-Sum-September-26-2026/paper.pdf
draft: false
---

Here are $n$ whole numbers and a target. Is there a selection of them that adds up to the target exactly? This is Subset Sum, one of the first problems proved NP-complete, in Karp's 1972 list under the name Knapsack. Trying every selection takes $2^{n}$ steps. In 1974 Horowitz and Sahni cut that to about $2^{n/2}$: split the numbers in half, list the sums of each half, and look for two that add to the target. For fifty-two years nobody improved the exponent $1/2$ for arbitrary inputs, and that number became the reference point of exact algorithms and a baseline in cryptography. On 4 October 2026 OpenAI posted a paper claiming $O(2^{0.49n})$. Three days later Baitian Li and Lixi Ye posted an independent human paper reaching $O(2^{0.499999n})$ by a different method. [1][3][4]

As of 3 November 2026 no computer scientist has said publicly that they have checked OpenAI's proof, and the release contains no Lean formalization for this family. The status on this page is "unreviewed". [1][8]

## The problem

An instance consists of positive integers $a_1,\ldots,a_n$, repeats allowed, and a target $t$; the question is whether some $I\subseteq\{1,\ldots,n\}$ has $\sum_{i\in I}a_i=t$. The running time is measured in $n$, the number of integers, with the numbers' bit length $b$ allowed to be polynomial in $n$; this is the regime in which the numbers are far too large for dynamic programming on the target. [1]

Meet-in-the-middle sorts the $2^{n/2}$ subset sums of the first half and, for each of the $2^{n/2}$ sums $s$ of the second half, looks up $t-s$. Schroeppel and Shamir in 1981 kept this time while cutting the memory to $2^{n/4}$. [5] Chen, Jin, Randolph and Servedio shaved a polynomial factor in 2023, $O(2^{n/2}n^{-\gamma})$ with $\gamma\approx0.5023$, and called a fixed reduction of the exponent "a major goal". That is what the new paper claims: $2^{0.49n}$ is smaller than $2^{n/2}$ by the exponential factor $2^{0.01n}$. [1][6]

<!-- uruk:visual-note
The visual on this page lets the reader enter a few numbers and a target and watch the two lists of meet-in-the-middle grow and meet, then plots $2^{n}$, $2^{n/2}$ and $2^{0.49n}$ as $n$ grows. What the visual leaves out is the scale of the gain: $2^{0.01n}$ is a factor of $2$ at $n=100$ and $4$ at $n=200$, and the constants $C_c$ in the theorem are not given, so no one would run this algorithm. The claim is about the exponent. [1]
-->

## Why it stayed open

### Who asked

The question is as old as the Horowitz-Sahni algorithm itself, and it is listed as open in surveys of exact exponential algorithms; Chen, Jin, Randolph and Servedio state it explicitly in 2023. No one is credited with posing it. [1][6][7]

### What was tried

Three lines of work explain both the progress and the difficulty. Pseudopolynomial algorithms measure time in the target: Bellman's dynamic programming runs in $O(nt)$, Koiliaris and Xu improved it, Bringmann reached $\widetilde O(n+t)$ with randomization and Chan deterministically; these are useless when $t$ has $n^{2}$ bits. Representation methods, introduced by Howgrave-Graham and Joux and developed by Becker, Coron and Joux, represent one solution by many pairs of partial solutions and search a filtered fraction of them; they beat $2^{n/2}$ for random instances, with no guarantee on every input. Austrin, Kaski, Koivisto and Nederlof exploited input blocks with many or few distinct sums, and Nederlof and Węgrzycki used related ideas to push the space below Schroeppel and Shamir's $2^{n/4}$. Randolph and Węgrzycki (2026) obtained worst-case exponent savings for several variants with coefficients other than $\{0,1\}$, but not for Subset Sum itself. [1]

### What stood in the way

Every worst-case method below $2^{n/2}$ must do something cleverer than list half the sums, and the obstacle is that an adversarial input can make the partial sums collide or spread exactly as the method does not want. Representation methods need many representations per solution, which random instances have and worst-case instances need not; reducing modulo a prime shrinks the lists but creates false positives, subsets with the right residue and the wrong sum, which must be found and removed. The new paper's organising idea is to do both halves of that trade: estimate a modular count by sampling, and enumerate the false positives exactly. Li and Ye's independent route instead reduces to a partial-match problem and solves it with a depth-two linear circuit. [1][4]

## What OpenAI claims

**Theorem 1.1** (OpenAI, 4 October 2026). There is a uniform randomized algorithm $\mathcal A$ for Subset Sum, on a word RAM with words of $\lceil4(n+b+\log_2(n+2))\rceil$ bits, such that for every input with $n\ge2$ it halts on every execution and answers correctly with probability at least $2/3$, and for every fixed $c$ there are constants $C_c$, $N_c$ such that every input with $n\ge N_c$ and $b\le n^{c}$ is processed, on every outcome of the random choices, in at most $C_c2^{0.49n}$ word operations. [1]

The intermediate bound is $2^{0.489995n}\operatorname{poly}(n+b)$, rounded up to $0.49$; the program does not know $c$. Nothing is assumed about the distribution of the inputs. The companion paper of 26 September proves a different trade-off: a one-sided-error algorithm, never wrongly answering yes, in $A_cn^{k_c}2^{n/2}$ operations and $A_c(n+b+2)^{15}2^{0.199n}$ writable words, below the Schroeppel-Shamir and Nederlof-Węgrzycki space bounds. The two are separate algorithms; neither paper cites the other, and no single algorithm is claimed to achieve both improvements at once. [1][2]

Scope. The algorithm is randomized and Monte Carlo; no deterministic version is claimed. The bit length must be polynomial in $n$; for enormously long numbers and for small $n$ the algorithm falls back to meet-in-the-middle. No claim is made about memory for the fast algorithm or about time for the low-space one. [1][2]

## How the claimed proof goes

What follows is a map of the main paper's argument from its introduction and six sections, with the companion noted at the end. It is not a check of the details. The main paper is 33 pages; the method is Fourier analysis over a random prime modulus with two filtering constructions. [1]

**Isolation and the preliminary test (Section 2).** Random tie-breaking weights, through the isolation lemma of Mulmuley, Vazirani and Vazirani, transform the instance into polynomially many targets for new positive weights $c_1,\ldots,c_n$ so that, with constant probability, some transformed target has exactly one solution whenever the original instance has any (Lemma 2.1). A capped meet-in-the-middle search handles inputs whose partial subset sums have small support (Proposition 2.4); Lemma 2.5 bounds collisions modulo a random prime. [1]

**The organising identity (Section 1.3).** Choose a random prime $P$ larger than the intended running time and independent uniform residues $\phi_i$, and give each subset the phase $\chi(I)=\exp(2\pi\mathrm i\sum_{i\in I}\phi_i/P)$. For a transformed target $t'$, an alias is a subset whose sum is $t'$ modulo $P$ but not over the integers. Then

$$
\sum_{\sum_{I}c_i=t'}\chi(I)=\sum_{\sum_Ic_i\equiv t'\ (P)}\chi(I)-\sum_{I\text{ an alias}}\chi(I).
$$

On a negative instance the left side is zero for every target; on an isolated positive target it is a single phase of modulus one. The two sums on the right can be far larger, so their difference must be found to small absolute error, and a relative approximation of the modular sum would not do. The paper estimates the modular sum and subtracts the phases of a complete list of aliases. [1]

**A checksum without a full Fourier transform (Sections 3 and 4).** Fourier inversion writes the modular sum as $\frac1P\sum_kJ_{t'}(k)$ with $J_{t'}(k)=e_P(-kt')\prod_i(1+e_P(\phi_i+kc_i))$. Uniform sampling of frequencies fails, since $\mathbb E|J(k)|^{2}=2^{n}$. Instead, writing $k=hL+l$ in a digit base $L$ splits the phase vector into a high-digit and a low-digit list; random coordinate-shift tables with logarithmic density scores filter both lists (Section 3, the fixed filtering construction, with Proposition 3.1's moments certified in Appendix A by rational enclosures), and a match is a table and a digit pair whose two vectors both pass. Coverage of every frequency is proved by a change of the shift law analysed through coarse "patterns" on coordinate blocks; patterns with few matches are summed directly, the rest are sampled with an inverse-coverage correction. Theorem 4.1, the modular checksum estimator, gives the absolute-error estimate for arbitrary input residues; Lemma 4.2 handles coverage and list sizes. [1]

**Extracting only aliases (Section 5).** Each subset is given many representations by two records: after randomly complementing some indicator variables, a shared coordinate block is chosen and its complement split into a left and a right side; a record is a subset of its side together with a mask, a subset of the shared block, and a small auxiliary modulus reduces the record lists. The analysis proves a dichotomy: either the preliminary distinct-sum test succeeds with high probability, or enough representations survive to recover every alias (Theorem 5.1, alias extraction; Lemma 5.2, sparse distinctions). The enumeration omits every pair satisfying the exact integer equation, so each remaining pair has a nonzero integer discrepancy and a random-prime divisor bound controls how many pass the main modulus. [1]

**Assembly (Section 6).** Once the reconstructed left side has error below $1/4$, comparing with the threshold $1/2$ separates an empty bin from an isolated one, so isolation removes any need for an anti-concentration theorem for sums of phases. Section 6 assembles the procedures with finite-precision arithmetic, capped enumerations and the fallback, and proves Theorem 1.1. [1]

**The companion.** The low-space paper keeps $2^{n/2}$ time and reaches $2^{0.199n}$ space by compressing repeated sums (Section 3), bounded parent dictionaries for representations (Section 4), a weighted-disjointness test in bounded space (Section 5, Lemma 5.1) and a survival analysis within the resource budgets (Section 6), assembled into one uniform algorithm with bounded samplers (Section 7). [2]

**Where an expert would look first.** At Theorem 4.1 and the second-moment calculation behind it, which must be carried out under the original phase law rather than conditioned on filtering, and at the two circle-density inequalities of Appendix A that control it; at the dichotomy in Theorem 5.1, which is where the worst-case input is handled; and at the parameter choices that produce $0.489995$, since a slip of a few thousandths would return the exponent to $1/2$. Li and Ye's independent $2^{0.499999n}$ is a check on the statement but not on this proof. [1][4]

## Consequences inside mathematics

If the proof holds, Subset Sum joins the problems whose exponential rate has been improved below the natural barrier, and together with Li and Ye's paper there are now two routes past $1/2$. The techniques, a sampled Fourier checksum with exact alias removal and a representation dichotomy for worst-case inputs, are the kind that transfer to related problems such as Subset Balancing and $k$-SUM in the exponential regime; the paper claims nothing beyond Subset Sum. A note worth recording: the refutation of the Exponential Time Hypothesis on this site's page 378 gives nothing for Subset Sum, as the reduction to 3-SAT blows up the number of variables, which Fortnow pointed out and a commenter on his blog answered by citing this paper. [1][4][9]

## Uses outside mathematics

Subset Sum underlies knapsack cryptosystems, and attacks on them are measured in the exponent of $2^{n}$; the Howgrave-Graham-Joux and Becker-Coron-Joux algorithms, which beat $1/2$ on random instances, are the ones that matter for security, since cryptographic instances are random. A worst-case $2^{0.49n}$ changes no security estimate. We record no application beyond that; the papers claim none. [1]

## Has anyone checked it?

We found no named computer scientist who has said publicly that they have read or checked OpenAI's proof. The natural readers are Nederlof, Węgrzycki, Randolph, Servedio and Jin, and we found no public statement from them on this paper. VibeMathed lists the result as unreviewed, "No independent mathematician has checked this yet". [7]

The most informative outside event is parallel work. On 7 October 2026 Baitian Li and Lixi Ye posted "Subset Sum via Partial Match", showing $O(2^{0.499999n})$ through the representation framework of Randolph and Węgrzycki and a depth-two linear circuit for the partial-match matrix. Their declaration says the result "was developed independently of that work and uses a different approach", and their AI disclosure states that they were developing the circuit theory in July and August and that on 5 September they used GPT-6 Pro to construct a first circuit. Two independent arguments past the barrier make the statement more plausible; they do not check either proof. [4]

**Machine checking.** The release contains no Lean statement for this family: no scope note, and neither paper is in the catalogue `formalization.yaml`. Everything rests on the written proofs. [8]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; neither paper in this family is among them. On 26 October it added two manuscripts and more Lean statements; nothing in this family changed. [10]

## Sources

1. OpenAI, "Subset Sum in Time $O(2^{0.49n})$", 4 October 2026. Theorem 1.1, Section 1.1 for the model, Section 1.2 for related approaches, Section 1.3 for the proof overview, Sections 2 to 6 and Appendix A. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Subset-Sum-in-Time-2-power-0-49n-October-4-2026/subset-sum.pdf
2. OpenAI, "A Low-Space Algorithm for Worst-Case Subset Sum", 26 September 2026. Theorem 1.1 and Sections 3 to 7. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/A-Low-Space-Algorithm-for-Worst-Case-Subset-Sum-September-26-2026/paper.pdf
3. Ellis Horowitz and Sartaj Sahni, "Computing partitions with applications to the knapsack problem", Journal of the ACM 21 (1974), 277 to 292. https://doi.org/10.1145/321812.321823
4. Baitian Li and Lixi Ye, "Subset Sum via Partial Match", arXiv:2610.10446, submitted 7 October 2026, revised 2 November 2026. The declaration of independence and the AI disclosure. https://arxiv.org/abs/2610.10446
5. Richard Schroeppel and Adi Shamir, "A $T=O(2^{n/2})$, $S=O(2^{n/4})$ algorithm for certain NP-complete problems", SIAM Journal on Computing 10 (1981), 456 to 464. https://doi.org/10.1137/0210033
6. Xi Chen, Yaonan Jin, Tim Randolph and Rocco A. Servedio, "Subset Sum in Time $2^{n/2}/\mathrm{poly}(n)$", 27th International Conference on Randomization and Computation, 2023. https://doi.org/10.4230/LIPIcs.APPROX/RANDOM.2023.39
7. VibeMathed, "Subset Sum below meet-in-the-middle", dataset of 1 November 2026. https://vibemathed.com/problem/subset-sum-below-meet-in-the-middle
8. OpenAI, `lean/formalization.yaml` and `lean/docs/` at the pinned commit, which contain no entry for family 138. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/formalization.yaml
9. Lance Fortnow, "The Exponential Time Refutation", Computational Complexity blog, 28 October 2026, with the comment of 28 October citing this paper. https://blog.computationalcomplexity.org/2026/10/the-exponential-time-refutation.html
10. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
