---
family: "238"
topic: "Mixing of the Thorp shuffle"
title: "How many times must you shuffle a deck this way before it is truly random?"
paperTitle: "Optimal-order mixing of the Thorp shuffle"
claim: "The Thorp shuffle on n = 2^d cards mixes in Θ(d) = Θ(log n) complete shuffles: after 1600d shuffles the law of the full permutation converges to uniform in total variation as d → ∞, uniformly over the initial deck, while counting the possible outcomes shows that at least 2d − O(1) shuffles are needed."
status: unreviewed
checked: 2026-10-20
papers:
  - preprints/Optimal-order-mixing-of-the-Thorp-shuffle-September-26-2026/paper.pdf
  - preprints/Random-coordinate-frames-and-partial-permutation-laws-September-26-2026/main.pdf
draft: false
visual: thorp-cube
---

Cut a deck into two equal halves. Take the top card of each half; flip a coin to decide which goes down first, then the other. Repeat with the next pair, and the next, until the deck is reassembled. This is the Thorp shuffle, introduced by Edward Thorp in 1973 while studying how imperfect shuffles leak information to card players, and it is one of the most natural shuffles there is: each step uses only a fair coin per pair of cards. For a deck of $n=2^{d}$ cards, a single tracked card is at a uniformly random position after just $d$ shuffles. But a deck is random only when the whole arrangement is, and the joint order of all $n$ cards is a far harder question. Ben Morris proved in 2005 that a polynomial number of shuffles in $d$ suffices, $O(d^{44})$; Montenegro and Tetali brought it to $O(d^{29})$; Morris then reached $O(d^{3})$ for dyadic decks in 2013. The conjecture, discussed in Jonasson's survey, was that the truth is $O(d)$, matching the trivial lower bound. On 26 September 2026 OpenAI posted twelve papers claiming it, by several different routes. [1][2][3]

As of 20 October 2026 no mathematician has said publicly that they have read or checked the proofs. The status on this page is "unreviewed".

## The problem

Let $q_d$ be the law of one complete Thorp shuffle as a random permutation of the $n=2^{d}$ positions, let $q_d^{*t}$ be the law after $t$ independent shuffles, and let $U_n$ be the uniform law on the symmetric group $S_n$. The total variation distance is $\|\mu-\nu\|_{\mathrm{TV}}=\frac12\sum_g|\mu(g)-\nu(g)|$, and the mixing time $t_{\mathrm{mix}}(d)$ is the first $t$ with $\|q_d^{*t}-U_n\|_{\mathrm{TV}}\le1/4$. [1]

**The question.** Is $t_{\mathrm{mix}}(d)=\Theta(d)$, so that a constant multiple of $\log n$ shuffles randomizes a deck of $n$ cards? [1][3]

<!-- uruk:visual-note
A visual for this page is the shuffle itself, animated on a small deck, with the total variation distance from uniform plotted against the number of shuffles for $d=3,4,5$ and the straight line of slope $2$ marking the lower bound; and the cube picture of the proof, positions as binary strings, each shuffle a layer of switches along one coordinate. The twelve papers contain fourteen TikZ figures.
-->

## Why it stayed open

Why it is hard. Each shuffle uses $n/2$ coins, and after $t$ shuffles there are at most $2^{tn/2}$ possible outcomes, which must be at least $n!$ for the deck to be close to uniform; that gives the lower bound $2d-O(1)$. The upper bound is the problem: the positions of different cards are strongly dependent, since each pair's coin decides both cards at once, and the standard tools for card shuffling, couplings and Fourier analysis on $S_n$, had reached only polynomial bounds. Czumaj and Vöcking showed in 2014 that $O(\log^{2}n)$ shuffles randomize any fixed fraction of the cards strictly below all of them; the last cards are the difficulty. [1]

## What OpenAI claims

**Theorem** (optimal-order mixing; OpenAI, 26 September 2026). As $d\to\infty$,

$$
\|q_d^{*(1600d)}-U_n\|_{\mathrm{TV}}\longrightarrow0,
$$

and for every $t\ge0$, $\|q_d^{*t}-U_n\|_{\mathrm{TV}}\ge1-2^{tn/2}/n!$. Consequently $t_{\mathrm{mix}}(d)\ge2d-O(1)$ and $t_{\mathrm{mix}}(d)=\Theta(d)$. [1]

**Companions.** Eleven further papers prove the same order by other routes with other constants: $32800d$, improved to $512d$ by combination with a Fourier transfer; $2048d$; and "an absolute number of coordinate sweeps", each sweep being $d$ shuffles, by routing densities, row-column symmetry, random subspace tests (reaching distance $\frac12n^{-5}$), compatibility entropy, signed tensor densities in $L^{2}$, conditional sweeps, and a four-row permanent inequality. One paper is a general transfer theorem from partial-permutation information to full permutation laws. [2]

What these do and do not say. The constant $1600$ is "an explicit choice in the proof, not a proposed sharp constant", and no cutoff is claimed. The result controls every statistic of the deck, and shows that an approximately uniform permutation of $n$ items can be made from $O(n\log n)$ fair bits. Only dyadic deck sizes $n=2^{d}$ are treated; the paper says the question for arbitrary even decks "is not addressed by the cube argument here". [1]

## How the claimed proof goes

What follows is a map of the headline paper's argument from its introduction and from Sections 2 to 7, which are short enough to read in full. It is not a check of the details. [1]

**The statement.** Theorem 1.1: for a deck of $n=2^{d}$ cards, the law after $1600d$ Thorp shuffles is close to uniform in total variation as $d\to\infty$, while for every $t$ the distance after $t$ shuffles is at least $1-2^{tn/2}/n!$, so that the mixing time at distance $1/4$ is at least $2d-O(1)$. Hence $t_{\mathrm{mix}}=\Theta(d)=\Theta(\log n)$. One step is one complete physical shuffle. [1]

**The cube (Section 2).** Label the $2^{d}$ positions by binary strings of length $d$. Undoing a deterministic cyclic rotation turns successive shuffles into layers of switches along successive coordinate directions: the two positions in one switch differ only in the active bit $i_s$, and a sweep through all $d$ directions is $d$ physical shuffles. The lower bound is a support count in this frame: each shuffle uses $n/2$ fair coins, so after $t$ shuffles at most $2^{tn/2}$ permutations are reachable, and the uniform law on $n!$ permutations is at distance at least $1-2^{tn/2}/n!$ from any law supported on them. [1]

**A conditional flow with one sweep of memory (Section 3).** Choose an ordered list $(c_1,\dots,c_k)$ of distinct labels independently of the shuffle, expose the trajectories of the first $\ell$ cards, and call the next one the tagged card. Given the exposed paths, the tagged card's position at time $s$ has a law $p_s$ on the set $B_s$ of free positions, and $w_s=p_s-\frac1m\mathbf 1_{B_s}$ is the centered flow, with total sum zero and squared norm at most one. Lemma 3.1, path cylinders and conditional flow: fixing the exposed paths fixes exactly the coins at visited time-edge pairs and leaves all other coins independent and fair, so on a switch with two free positions the tagged mass is averaged and on a switch with one free position it follows the exposed card's route. Writing $A_i$ for the average across coordinate-$i$ pairs, the update is

$$
w_{s+1}=A_{i_s}w_s+\xi_s,\qquad\mathbb E(\xi_s\mid\mathcal F_s)=0,
$$

where the noise lives on one-free-position switches and equals $\pm\frac12w_s(x)(\delta_x-\delta_{x^{(i_s)}})$ with independent signs. Lemma 3.2, the one-sweep energy identity: since the product of all $d$ coordinate averages maps any vector to its spatial mean and so annihilates the centered $w_{t-d}$, and since noises at distinct times have zero expected cross products, the energy $E_t=\mathbb E\|w_t\|^{2}$ satisfies $E_t=\sum_{j=1}^{d}2^{-j}b_{t-j}$ exactly, with $b_s$ the expected noise energy. This descends from Morris's chameleon process. [1]

**Why the recent noise contracts (Section 4).** Fix $s$ and let $H_0,H_1$ be the two halves of the cube cut by coordinate $i_s$. The $d-1$ updates since time $a=s-d+1$ used every other coordinate once and never crossed the halves, so conditional on $\mathcal F_a$ the two halves evolve by independent coin arrays; every position in a half is marginally uniform in that half after those updates, and for $x\in H_h$ the variables $w_s(x)^{2}$ and $\mathbf 1\{x^{(i_s)}\in B_s\}$ depend on opposite arrays. Their conditional independence gives $\mathbb E[\sum_{x\in H_h}w_s(x)^{2}\mathbf 1\{x^{(i_s)}\in B_s\}\mid\mathcal F_a]=\frac{|B_a\cap H_{1-h}|}{n/2}\mathbb E[\sum_{x\in H_h}w_s(x)^{2}\mid\mathcal F_a]$. For a uniform random list with at least $m\ge n/8$ free positions, $B_a$ is a uniform $m$-subset, and a Hoeffding-Azuma bound gives $\mathbb P\{|B_a\cap H_h|<m/4\}\le e^{-m/32}$. With $\beta=1/16$ this yields $b_s\le(1-\beta)E_s+\eta$, $\eta=2e^{-n/256}$, and the one-sweep identity then gives $E_t\le(31/32)^{t-2d}+32e^{-n/256}$ by induction, since $(1-\beta)\sum_j(2\gamma)^{-j}=1$ for $\gamma=31/32$. The paper stresses that it uses an unconditional exceptional probability and claims no concentration conditional on the exposed paths. Morris's sequential total-variation lemma then turns the energy bound into Proposition 4.2: averaged over a uniform ordered list of $7n/8$ labels, the joint positions of those cards after $200d$ shuffles are within $\varepsilon_n=o(1)$ of uniform among injections. [1]

**Representation degrees (Section 5).** The lift to the full group needs two facts about the degrees $f^{\lambda}$ of irreducible representations of $S_s$, given by the hook-length formula: the reciprocal sum $\sum_\lambda(f^{\lambda})^{-1}$ is bounded uniformly in $s$, and the sum omitting the trivial and sign representations tends to zero (Lemma 5.1). The paper gives an elementary proof via $p(u)\le e^{3\sqrt u}$ for the partition function; stronger asymptotics are due to Liebeck and Shalev. [1]

**From eight large marginals to the whole group (Section 6).** Let $\mu=q_d^{*(200d)}$ and partition the labels into eight blocks $M_1,\dots,M_8$ of size $n/8$; each complement is a uniform $7n/8$-subset, so Proposition 4.2 applies to all eight. Agreement on the complement of $M_a$ is agreement modulo the subgroup $H_a$ fixing everything outside $M_a$, so the marginal is a law on cosets $G/H_a$. Removing every coset with $\mu(C)>2|H_a|/|G|$ for any of the eight blocks, a common trimming, leaves an event $E$ of mass at least $1-2\delta_n$ with $\delta_n\le8\varepsilon_n$, and the conditioned law $\nu=\mu(\cdot\mid E)$ satisfies $\nu(gH_a)\le4|H_a|/|G|$ for all $g$ and $a$ while $\|\nu-\mu\|_{\mathrm{TV}}=o(1)$. Proposition 6.1, the eight-block Fourier bound, turns this coset cap into an operator-norm bound on the matrix Fourier transforms $\widehat\nu(\rho)$ for every nontrivial, non-sign irreducible $\rho$, using the span of one vector's orbit under a block subgroup and the reciprocal-degree bound. [1]

**Eight convolution factors (Section 7).** By the Diaconis-Shahshahani bound, $4\|\sigma-U\|_{\mathrm{TV}}^{2}\le\sum_{\rho\ne\mathbf 1}D_\rho\|\widehat\sigma(\rho)\|_{\mathrm{HS}}^{2}$, proved from Schur orthogonality; since the shuffle law is not a class function, matrix norms are kept throughout. Convolution multiplies Fourier matrices, the operator norm is submultiplicative and $\|B\|_{\mathrm{HS}}\le\sqrt D\|B\|_{\mathrm{op}}$, so $\nu^{*8}$ is close to uniform by the degree sums of Section 5; comparing $\nu^{*8}$ with $\mu^{*8}=q_d^{*(1600d)}$ through eight applications of $\|\nu-\mu\|_{\mathrm{TV}}=o(1)$ completes the theorem. [1]

Where would an expert look first? At Lemma 3.1 and the one-sweep identity, where the conditional independence of unexposed coins is the whole mechanism; at the half-independence claim of Section 4 and the unconditional handling of the exceptional event; at the eight-block Fourier bound, which converts marginal bounds into representation-theoretic operator bounds and is the step the paper presents as new; and, given twelve routes to one conclusion, at whether the companions share an unverified lemma. [1][2]

## Consequences inside mathematics

If the proofs hold, the Thorp shuffle mixes in optimal order, closing the gap from $d^{3}$ to $d$ that had stood since Morris's work and answering the question in Jonasson's notes for dyadic decks; it gives an explicit way to generate a nearly uniform permutation from $O(n\log n)$ random bits with a local rule; and the conditional-flow and Fourier-transfer methods may apply to other shuffles with pairwise rules. The sharp constant, a possible cutoff, and non-dyadic decks remain open. [1]

## Uses outside mathematics

The Thorp shuffle is the model for format-preserving encryption of small domains, where one needs a random-looking permutation of, say, all sixteen-digit credit card numbers; Morris, Rogaway and Stegers built enciphering schemes on it, and the number of rounds needed for security is exactly the mixing question. The theorem says a logarithmic number of rounds suffices in principle; the constant $1600$ is far from what a cipher designer would use, and practical security analyses use different measures. [1]

## Has anyone checked it?

We found no named mathematician who says they are reading or checking these papers, and no public comment from Morris, Peres, Diaconis, Montenegro, Tetali or Rogaway, whose work they build on. VibeMathed records no check by an independent mathematician. [4]

**Machine checking.** The release's Lean scope note links thirteen comparator statements across the twelve papers. Four are in the catalogue `formalization.yaml`: nine routing and representation estimates, a weighted compatibility bound, a conditional sweep moment estimate, and the binary-sweep theorem, whose scope note says a fixed number of independent sweeps brings the deck to uniform in total variation from every initial deck, which is the mixing conclusion by that route. The headline paper's own $1600d$ statement is described in the scope note but its comparator is not catalogued. All the statements define the shuffle themselves, which is where a reader should check that the formal object matches Thorp's. A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval. [5]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; none of the twelve papers in this family is among them. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [6]

## Sources

1. OpenAI, "Optimal-order mixing of the Thorp shuffle", 26 September 2026. The theorem, the history and the proof overview. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Optimal-order-mixing-of-the-Thorp-shuffle-September-26-2026/paper.pdf
2. OpenAI, "Random coordinate frames and partial permutation laws" and "Conditional information under deterministic coordinate sweeps", 26 September 2026, abstracts, with the family's other nine companions listed in the Lean scope note. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Random-coordinate-frames-and-partial-permutation-laws-September-26-2026/main.pdf and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Conditional-information-under-deterministic-coordinate-sweeps-September-26-2026/main.pdf
3. Ben Morris, "The mixing time of the Thorp shuffle", SIAM Journal on Computing 38 (2008), 484-504, the first polynomial bound; and "Improved mixing time bounds for the Thorp shuffle", Combinatorics, Probability and Computing 22 (2013), 118-132, the O(d^3) bound. https://doi.org/10.1137/050636231 and https://doi.org/10.1017/S0963548312000478
4. VibeMathed, "Thorp shuffle logarithmic mixing", read 20 October 2026. https://vibemathed.com/problem/thorp-shuffle-logarithmic-mixing
5. OpenAI, Lean scope note for family 238 and `lean/formalization.yaml` at the pinned commit. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/238.md and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/formalization.yaml
6. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
