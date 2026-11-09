---
family: "102"
topic: "Unique Games"
title: "Can you fix one rule without breaking another?"
paperTitle: "The Unique Games Theorem"
claim: "The Unique Games Conjecture is true: for every fixed ε, δ in (0, 1/2) there is a deterministic polynomial-time reduction from 3SAT to Unique Games over a fixed alphabet, with completeness at least 1 − ε and soundness at most δ."
status: under review
checked: 2026-10-15
papers:
  - preprints/The-Unique-Games-Theorem-September-23-2026/paper.pdf
draft: false
visual: unique-rules
---

In 2002 Subhash Khot proposed that a certain kind of labelling puzzle is hard to solve approximately, even when almost all of its rules can be satisfied. Over the next two decades his conjecture became the organizing hypothesis of approximation algorithms: if it were true, dozens of optimization problems would have known, exact limits on how well any fast algorithm can do. On 23 September 2026 OpenAI posted a proof. [1]

As of 15 October 2026, one named expert in the field has said publicly that she is working through the paper. No one has said it is correct. The status on this page is "under review".

## The problem

### The puzzle

A Unique Game is played on a network. The dots are called vertices and the lines joining them are edges. You must give every vertex a label from a fixed finite set $K$. Every edge carries a rule, and the rule is a permutation $\pi_e$ of $K$: for each label at one end, it allows exactly one label at the other end, and because permutations are invertible the same is true in reverse. A labelling $a$ satisfies the edge $e=(u,v,\pi_e)$ when $a(v)=\pi_e(a(u))$. The value of the game, written $\mathrm{val}(G)$, is the largest fraction of edges that any labelling satisfies. [1]

The word "unique" describes the rules, not the solutions. Each rule allows one reply. A game can still have many labellings that satisfy everything, or none.

Here is why the uniqueness matters. Suppose every edge can be satisfied at once. Pick any vertex, give it any label, and follow the edges: each rule forces the label at the far end, and that label forces the next. If the network is connected you reach a complete labelling in one pass, and if it fails anywhere you try the next starting label. With $|K|$ starting labels this is fast. So deciding whether a Unique Game has value exactly $1$ is easy. [1]

The hard question is what happens when the value is a little less than $1$. Say $99\%$ of the edges can be satisfied but not all of them. Following edges no longer works, because a single bad edge sends wrong labels around the whole network, and you have no way of knowing which edge to disbelieve. Khot's conjecture is that this version is as hard as anything in NP.

### What NP-hard means

A problem is in NP if a proposed solution can be checked in time polynomial in the input size. 3SAT, deciding whether a formula built from clauses of three literals can be made true, is the standard example. A problem is NP-hard if a polynomial-time algorithm for it would give a polynomial-time algorithm for every problem in NP, 3SAT included. Nobody has such an algorithm, and the P versus NP question asks whether one exists. The working assumption in the field is that it does not. [1]

Hardness of approximation is NP-hardness for gap problems. Instead of asking for the exact value, you are promised that it is either at least $1-\varepsilon$ or at most $\delta$, and asked which. If telling those two cases apart is NP-hard, then no polynomial-time algorithm can approximate the value to within the gap unless P equals NP.

**The Unique Games Conjecture** (Khot, 2002). For every $\varepsilon,\delta>0$ there is an alphabet size $k$ such that it is NP-hard to distinguish Unique Games over an alphabet of size $k$ with value at least $1-\varepsilon$ from those with value at most $\delta$. [1][2]

The order of quantifiers is the point. You choose both errors first, then the alphabet. Large fixed alphabets are allowed; the algorithms discussed below show that they are also necessary.

### Why it mattered so much

Khot's conjecture was never about Unique Games for their own sake. Reductions from Unique Games pin down the exact approximation threshold of many problems, meaning the best ratio a polynomial-time algorithm can guarantee. Three results set the tone. [1]

Max-Cut asks for a partition of a graph's vertices into two sides that cuts as many edges as possible. In 1995 Goemans and Williamson gave a polynomial-time algorithm that always achieves at least $\alpha_{\mathrm{GW}}\approx0.878$ of the maximum, by relaxing the problem to a semidefinite program and rounding with a random hyperplane. In 2007 Khot, Kindler, Mossel and O'Donnell showed that if the Unique Games Conjecture holds, no polynomial-time algorithm can guarantee any ratio above $\alpha_{\mathrm{GW}}$. The peculiar constant would be the truth. [1][3]

Vertex Cover asks for the smallest set of vertices touching every edge. A trivial algorithm gets within a factor of $2$. Khot and Regev showed in 2008 that under the conjecture, $2$ is the best possible factor. [1]

In 2008 Raghavendra proved something broader: under the conjecture, for every constraint satisfaction problem, one specific semidefinite program achieves the best approximation ratio any polynomial-time algorithm can, and he gave a way to compute that ratio. One algorithm, optimal for an entire class of problems. [1]

The citation for Khot's 2014 Nevanlinna Prize says that this body of consequences "turned the Unique Games problem into a major open problem of the theory of computation". [4]

## Why it stayed open

The paper names the difficulty in one sentence: "The central difficulty is to retain completeness near one when every label permits only one reply." Completeness is the value in the yes case. Hardness proofs of this kind encode a solution to a hard problem as a table of answers and test the table with a few random queries. The test has to pass almost always when the table is honest, and fail often when it is not. For Unique Games, a two-query test with a one-reply rule sits very close to the fatal case. [1]

The paper's own illustration: if the table is the linear map $M\mapsto Mz$ on binary matrices and the test compares $M$ with a random rank-one perturbation $M+al^{\top}$, then the answer survives the perturbation with probability $(1+2^{-\ell})/2$, just above one half. A test with completeness about one half gives you a conjecture with completeness about one half, which is not Khot's. [1]

Algorithms explain why the conjecture has the shape it does. Charikar, Makarychev and Makarychev gave a rounding that recovers value $1-O(\sqrt{\varepsilon\log q})$ from a $q$-label instance of value $1-\varepsilon$, so hardness is impossible unless the alphabet grows as the error shrinks. Arora, Barak and Steurer gave an algorithm whose running time is subexponential, $2^{n^{\mathrm{poly}(\varepsilon)}}$, for every fixed completeness error; not polynomial, but far below what one expects for a truly hard problem. Any proof had to leave room for both. [1]

The closest previous breakthrough was the 2-to-2 Games Theorem of Khot, Minzer and Safra in 2018, building on work with Dinur and Kindler and on a connection made by Barak, Kothari and Steurer. It proved hardness for a relaxed kind of constraint, where each label on one side matches a pair on the other, and as a consequence proved the Unique Games Conjecture with completeness close to $\tfrac12$ and arbitrarily small soundness. Getting the completeness up to $1$ was recognized as a separate and harder problem. Quanta reported in October that Dor Minzer and two students had just posted a 95-page paper on a closely related conjecture when rumours of the OpenAI proof began circulating, and rushed it out with a note that it was "not in the shape we wished to share in". [1][5]

## What OpenAI claims

A Unique Games instance is explicit and unweighted when its whole vertex list, constraint list and permutation tables are written out. It is simple and bipartite when the vertices split into two sides with at most one constraint on each opposite pair. [1]

**Theorem 1.1** (the Unique Games Theorem, OpenAI, 23 September 2026). For every fixed $\varepsilon,\delta\in(0,\tfrac12)$ there are an integer $s\ge1$ and a deterministic polynomial-time reduction from 3SAT to explicit unweighted Unique Games instances $G_\varphi$ over the alphabet $K=\mathbb{F}_2^{s}$ such that

$$
\varphi\ \text{satisfiable}\implies\mathrm{val}(G_\varphi)\ge1-\varepsilon,\qquad\varphi\ \text{unsatisfiable}\implies\mathrm{val}(G_\varphi)\le\delta.
$$

The graph is simple and bipartite, every constraint is a translation $a(v)=a(u)+c_e$ of $K$, and the alphabet, the degree of the running-time polynomial and its constants depend only on $\varepsilon$ and $\delta$. [1]

Translation constraints are addition of a fixed vector of bits, that is, XOR with a constant. They are a special case of permutations, so hardness for them is hardness for the general conjecture, and Khot, Kindler, Mossel and O'Donnell had already shown the two forms equivalent. The theorem produces the special form directly. [1]

What the theorem does not say: it gives no new algorithm, it says nothing about instances that arise in practice, and it does not by itself resolve P versus NP. It is a reduction. Its force comes from the twenty years of other reductions that assumed it. The paper's Section 7 restates those consequences with their exact thresholds and proves them from the completed theorem. The same release includes four companion papers that prove optimal hardness for Max-Cut, Vertex Cover, Min-UnCut and directed feedback vertex set directly, without going through Unique Games. [1][6]

## How the claimed proof goes

This is a map, not a check. The paper is about 4,800 lines of TeX, and the one expert known to be reading it has described it as very hard to read. [1][7]

**Start from Håstad.** The input hardness is Håstad's 2001 theorem on systems of linear equations over $\mathbb{F}_2$ with three variables each: it is NP-hard to tell nearly satisfiable systems from ones where little more than half the equations can be satisfied. This is the hard problem the reduction encodes. [1]

**Build a gadget that is stable but detectable.** The new object is what the paper calls a latent construction. For any prescribed $p>0$ it fixes a rank threshold and, for every large enough $\ell$, constructs a binary space $\mathcal V$ containing $K=\mathbb{F}_2^{\ell}$, a map $C:\mathcal V\to K$ and a noise distribution $\mu$ on $\mathcal V$ with two properties that pull in opposite directions. Stability: for random $x$ and noise $a\sim\mu$, $C(x+a)=C(x)$ with probability at least $1-p$. Detectability: every family of linear observations whose restrictions to $K$ have large enough rank detects the noise with probability at least $\tfrac18$. The construction uses quadratic blocks over a finite field, whose nonlinear outputs become more stable under recursion, together with a rank potential that limits what linear observations lose. This is the piece Dana Moshkovitz described as "a completely new bizarre code with a noise test". [1][7]

**Tables and the test.** A table on a tuple of equations is an affine map from their solution space into $\mathcal V$, represented by a matrix. The verifier compares a table's restored answer $C(Pz)$ with the restored answer after a rank-one update whose direction carries the latent noise. An honest table built from a near-satisfying assignment passes with probability at least $1-p/2$, which gives completeness near $1$. Folding, adapted from Bellare, Goldreich and Sudan, and shared keys, adapted from Khot and Safra's virtual tables, make the answers consistent across translates and projections so that the final game is a genuine Unique Game with translation constraints. [1]

**Soundness, step one: low-rank mass.** Suppose some labelling passes the test with probability at least $0.99$. Fourier analysis over the matrix space splits the acceptance probability into frequencies. The latent detection property says high-rank frequencies contribute at most $\tfrac78$, so a fixed amount of mass must sit at low rank. That low-rank mass means the table also often survives the ordinary uniform rank-one perturbation inside $K$. [1]

**Soundness, step two: the inverse shortcode theorem.** For the ordinary perturbation, a structural theorem applies: a table that often keeps its value under rank-one updates agrees with a linear target $Mz+u$ on a slice defined by a bounded number of row and column equations. The paper derives this from the Grassmann expansion theorem of Khot, Minzer and Safra, through the binary matrix formulation of Barak, Kothari and Steurer. [1]

**Soundness, step three: an advice experiment.** The decoded linear targets are turned into strategies for a two-prover game between an equation tuple $U$ and a sparsified question $O$ that replaces each equation by one of its variables with probability $\beta=k^{-2/3}$. A Fourier decoder on one side and a certificate-sampling strategy on the other agree with probability at least some fixed $\gamma>0$, independent of $k$. [1]

**The contradiction.** On an unsatisfiable input, Dinur and Steurer's parallel repetition bound for projection games, whose constant does not depend on the alphabet, forces the agreement of any pair of strategies to decay like $\exp(-ck^{1/3})$. For large $k$ this is below $\gamma$. The alphabet independence is what lets the repetition be fixed before the latent alphabet is chosen, which is how the quantifiers come out in the order the conjecture demands. [1]

The published inputs the paper relies on are Håstad (2001), the Khot-Minzer-Safra expansion theorem, Barak-Kothari-Steurer (2018), Khot-Safra (2013) and Dinur-Steurer (2014). It cites OpenAI's separate 2-to-1 paper and says that paper is not an input. [1]

Where would an expert look first? The latent lemma, where everything rests on the gap between stability and detection with the rank threshold fixed before $\ell$; the derivation of the inverse shortcode theorem and the order in which its parameters are chosen; and the parameter accounting in the final section.

## Uses outside mathematics

No known direct application. The result tells algorithm designers which guarantees are impossible; it does not change what any program does.

Max-Cut itself is not an abstraction. In 1988 Barahona, Grötschel, Jünger and Reinelt showed that finding ground states of spin glasses in physics and minimizing the number of layer changes in a circuit-board layout both reduce to Max-Cut, and they solved real instances with up to 1,600 vertices exactly. The Unique Games Theorem says no polynomial-time algorithm can promise better than $0.878$ of the optimum on every graph unless P equals NP. Practitioners already work with heuristics that do well on their instances and badly on adversarial ones. That stays as it is. [8]

## Has anyone checked it?

Dana Moshkovitz of UT Austin, who has worked toward this conjecture for years, is reading the paper. In messages her husband Scott Aaronson published on 7 October with her permission, she wrote that "the paper is so horribly written that it's impossible to read it without AI help", that "the citations are often irrelevant and confusing", and that the proof "invents a completely new bizarre code with a noise test". She gave no verdict on correctness. Aaronson's updates of 9 and 12 October add none. Aaronson wrote in the same post that "no human has understood just about any of these proofs yet; the race to do so has just started"; he worked at OpenAI in 2022 and 2023. [7]

Quanta Magazine reported on 7 October that OpenAI's manuscripts "didn't undergo any human editing or review by independent experts". Its article quotes Dor Minzer, Ryan O'Donnell and Mark Braverman about the field and about Minzer's own result, not about checking this proof. [5]

**Machine checking.** The release includes a Lean statement, 239 lines and self-contained, and a formal proof of about 480 files. On our reading the statement matches Theorem 1.1: it encodes 3SAT under a fixed binary encoding, defines polynomial time through Mathlib's Turing-machine model with a finite alphabet on every tape, and measures completeness and soundness as fractions of satisfied constraints over a nonempty list. If the formal proof is sound, the theorem as formalized holds regardless of how readable the paper is. Two things remain for a human to confirm: that the Turing-machine definitions at the pinned Mathlib commit behave as intended, and that the 3SAT encoding covers every formula. Our last search, on 8 October, found no independent replay of this particular proof. A machine check is evidence about the formal statement. Uruk does not count it as approval. [9]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; none of them is this family. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [10]

## Sources

1. OpenAI, "The Unique Games Theorem", 23 September 2026. Theorem 1.1, Sections 1.1 to 1.4, and the consequences in Section 7. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/The-Unique-Games-Theorem-September-23-2026/paper.pdf. Introduction source: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/The-Unique-Games-Theorem-September-23-2026/build/sections/00-introduction.tex
2. Subhash Khot, "On the power of unique 2-prover 1-round games", STOC 2002. The original conjecture. https://doi.org/10.1145/509907.510017
3. Michel X. Goemans and David P. Williamson, "Improved approximation algorithms for maximum cut and satisfiability problems using semidefinite programming", Journal of the ACM 42 (1995). The 0.878 algorithm. https://doi.org/10.1145/227683.227684
4. International Mathematical Union, Rolf Nevanlinna Prize 2014 citation for Subhash Khot. https://www.mathunion.org/imu-awards/rolf-nevanlinna-prize/rolf-nevanlinna-prize-2014
5. Quanta Magazine, "As AI Closed In on 'Unique Games' Proof, Researchers Raced to Beat the Machines", 7 October 2026. https://www.quantamagazine.org/as-ai-closed-in-on-unique-games-proof-researchers-raced-to-beat-the-machines-20261007/
6. OpenAI, Lean scope note for family 102, listing the four direct-hardness companions. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/102.md
7. Scott Aaronson, "The Mathocalypse", Shtetl-Optimized, 7 October 2026, with updates of 9 and 12 October. Moshkovitz's messages and Aaronson's own assessment. https://scottaaronson.blog/?p=10169
8. Francisco Barahona, Martin Grötschel, Michael Jünger and Gerhard Reinelt, "An application of combinatorial optimization to statistical physics and circuit layout design", Operations Research 36 (1988). https://doi.org/10.1287/opre.36.3.493
9. OpenAI, comparator statement `UniqueGamesTheorem.lean` at the pinned commit. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/UniqueGamesTheorem.lean
10. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
