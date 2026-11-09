---
family: "173"
topic: "Seymour's second neighbourhood conjecture"
title: "In a city of one-way streets, is there always a corner with as many places two blocks away as one block away?"
paperTitle: "A proof of Seymour's second-neighborhood conjecture"
claim: "Every nonempty finite oriented graph, a directed graph with no loops and no pair of opposite arcs, has a vertex with at least as many vertices at directed distance exactly two as at directed distance one. This is Seymour's second neighbourhood conjecture, in full generality."
status: unreviewed
checked: 2026-11-02
papers:
  - preprints/A-proof-of-Seymours-second-neighborhood-conjecture-September-23-2026/paper.pdf
draft: false
---

Draw any number of dots and join some pairs with arrows, never two arrows between the same pair and never an arrow from a dot to itself. From a dot you can reach some dots in one step along the arrows, and some further dots in exactly two steps. Around 1990 Paul Seymour conjectured that in every such picture there is a dot whose two-step set is at least as large as its one-step set. The statement takes a sentence; the proof resisted every attack for thirty-five years, with the best general result guaranteeing only about $0.716$ of the two-step dots the conjecture asks for. On 23 September 2026 OpenAI posted a fifteen-page proof of the full conjecture, together with a Lean formalization that the release's catalogue lists as complete. [1][2]

As of 2 November 2026 no mathematician has said publicly that they have checked the proof. The status on this page is "unreviewed". [1][11]

## The problem

A directed graph is a set of vertices with arcs, each arc pointing from one vertex to another. An oriented graph is one with no loops, no repeated arcs, and no pair of arcs pointing opposite ways between the same two vertices: for each pair of vertices there is at most one arc, in one direction. For a vertex $v$, its first out-neighbourhood $N_1^+(v)$ is the set of vertices reached by one arc from $v$, and its second out-neighbourhood $N_2^+(v)$ is the set of vertices at directed distance exactly two: reachable by a path of two arcs from $v$, but not equal to $v$ and not in $N_1^+(v)$. A vertex is counted once however many two-step paths reach it. [1]

**Seymour's second neighbourhood conjecture.** Every nonempty finite oriented graph has a vertex $v$ with $|N_1^+(v)|\le|N_2^+(v)|$. [1]

Some vertices satisfy this trivially. A sink, a vertex with no outgoing arcs, has both sets empty. In a directed triangle every vertex has one first neighbour and one second neighbour. The content of the conjecture is that no oriented graph can be arranged so that every vertex's second neighbourhood is strictly smaller than its first. The exclusion of opposite arcs is essential: two vertices pointing at each other each have one out-neighbour and no second neighbour. [1]

<!-- uruk:visual-note
The visual on this page lets the reader build an oriented graph by placing dots and dragging arrows, highlights each vertex's one-step and two-step sets as the pointer moves, and marks the vertices that satisfy the inequality; there is always at least one, and the reader can try to make it disappear. What the visual leaves out is the general case: the proof concerns all finite oriented graphs at once, and its argument runs through objects, pairs of vertices and families of such pairs, that are not what the picture shows. [1]
-->

## Why it stayed open

### Who asked

Seymour's conjecture was recorded in print by Nathaniel Dean and Brenda Latka in 1995, in a paper titled "Squaring the tournament, an open problem", as a strengthening of Dean's own conjecture for tournaments, the oriented graphs in which every pair of vertices is joined by an arc. Seymour is usually said to have posed it around 1990. [1][3]

### What was tried

The tournament case fell first. David Fisher proved Dean's conjecture in 1996 by a probabilistic argument, finding a suitable distribution on the vertices through Farkas's lemma from linear programming; Havet and Thomassé gave a combinatorial proof in 2000 using local median orders, a tool that also served Sumner's conjecture. Fidler and Yuster extended the tournament result to tournaments missing a matching, a star or a clique; Ghazal corrected and generalised the star case; later papers handled a matching together with a star, and two stars. [1][4][5][6]

On general oriented graphs the attacks took two forms. One fixed the minimum out-degree: Kaneko and Locke proved the conjecture when every vertex has at most six out-neighbours, in 2001, and a computer-assisted preprint of 2026 by Sadhukhan, Sandeep and Sen reached seven. The other weakened the ratio: Chen, Shen and Yuster showed in 2003 that some vertex always has $|N_2^+(v)|\ge\gamma|N_1^+(v)|$ with $\gamma\approx0.657298$, the real root of $2x^{3}+x^{2}-1$, and Huang and Peng raised this to about $0.715538$ in 2024, reporting a computational bound of $0.74530$. Random orientations were handled by Botler, Moura and Naia and by Espuny Díaz, Girão, Granet and Kronenberg; a dense case appeared in a 2026 preprint by Brukhman. None of these reached the ratio $1$ that the conjecture asks for. [1][7][8]

### What stood in the way

The methods that work for tournaments use the completeness of the arc set: every pair of vertices is comparable, so a median order or a weighting can be pushed through the whole graph. In a general oriented graph most pairs are not joined, and the non-neighbours of a vertex can be arranged to absorb the two-step paths. The ratio results show how far local counting goes, and that it stalls short of $1$. What was missing was a global argument that could use the minimality of a hypothetical counterexample across all of its subsets at once. The present paper builds on two earlier pieces of exactly that kind: the minimal-counterexample and graph-product methods of Brantner, Brockman, Kay and Snively (2009), and Tyler Seacrest's 2019 reformulation of the conjecture in terms of subsets of vertices rather than single vertices. [1][9][10]

## What OpenAI claims

**Theorem 1.1** (OpenAI, 23 September 2026). Every nonempty finite oriented graph has a vertex $v$ with $|N_1^+(v)|\le|N_2^+(v)|$. [1]

The theorem has no connectivity or degree hypothesis. Through Seacrest's known equivalences, the paper records the weighted forms of the conjecture (Corollary 5.1): for every nonnegative weighting of the vertices there is a vertex whose weighted second neighbourhood is at least its weighted first neighbourhood, and there is one probability distribution on the vertices under which every vertex satisfies the inequality. Corollary 6.1 draws consequences for short directed cycles; among them, an oriented graph on $n$ vertices in which every vertex has at least $n/3$ in-neighbours and at least $n/3$ out-neighbours contains a directed triangle. The paper is explicit that the equivalences themselves are not new. The ratio $1$ cannot be improved, since the directed triangle attains it. [1]

## How the claimed proof goes

What follows is a map of the paper's argument from its introduction and six sections. It is not a check of the details. The paper is about 1,100 lines of TeX, and its logic is a proof by contradiction in three moves: reduce a counterexample to a clean inequality, set up an extremal problem on pairs of vertices that the inequality feeds, and show the extremal problem has no maximum. [1]

**The subset operator.** For a digraph $D$ and a set $S$ of vertices write $F_D(S)$ for the set of vertices reached by one arc from some vertex of $S$, and $F_D^{2}(S)=F_D(F_D(S))$; the operator does not subtract $S$. In an oriented graph there is no directed walk of length two from a vertex to itself, so $N_2^+(v)=F_D^{2}(\{v\})\setminus F_D(\{v\})$. [1]

**From a counterexample to a strict subset inequality (Section 2).** Suppose a counterexample exists and choose one of minimum order, then minimum number of arcs. Lemma 2.2, the subset deficit, adapts the arc-deletion idea of Seacrest's Lemma 4: deleting carefully chosen arcs and using minimality shows that every nonempty proper vertex set $S$ satisfies $|F_D^{2}(S)\setminus F_D(S)|<|F_D(S)\setminus S|$, a strengthening of Seacrest's bound, which had $|F(S)|$ on the right and needed only arc-minimality. Lemma 2.3 then replaces each vertex by a sufficiently large transitive tournament, a blow-up that turns the deficit into the strict inequality

$$
|U|+|F_G^{2}(U)|<2|F_G(U)|\qquad\text{for every }\varnothing\ne U\subsetneq V(G),
$$

in a new oriented graph $G$ in which every vertex has positive in-degree. Proposition 2.1 records this reduction. The inequality says that the function $U\mapsto|F_G^{\,k}(U)|$ is strictly concave at the first step for every proper subset; the rest of the proof shows no finite oriented graph can be that concave everywhere. [1]

**The extremal problem (Section 4).** Work in $X\times X$ with $X=V(G)$. Two coordinate image operators advance one coordinate along an arc of $G$ and leave the other fixed. Consider two families of ordered pairs, a left family $\mathcal R$ and a right family $\mathcal C$, both containing the diagonal $\{(x,x)\}$; call them compatible when the first-coordinate image of $\mathcal R$ and the second-coordinate image of $\mathcal C$ are disjoint, and call a point of $X\times X$ uncovered when it lies in neither image. Let $M$ be the combined size of the two families and $d$ the number of uncovered points, and maximise $M+d$ over all compatible pairs; a maximum exists because everything is finite. [1]

**Why the maximum cannot exist.** The columns of $\mathcal R$ and the rows of $\mathcal C$ are nonempty proper vertex sets, so the strict inequality applies to each of them. Taking complements of the second iterated images produces two prospective new families whose combined size exceeds $M+2d$. These new families may conflict with each other, but their diagonal members are present and conflict-free. [1]

**Pruning (Section 3, Lemma 3.1).** The pruning lemma holds for an arbitrary finite binary relation, with no orientation assumption. Given two families $\mathcal R,\mathcal C\subseteq X\times X$, a member $(p,j)$ of the left family and $(i,s)$ of the right conflict when $p\to i$ and $s\to j$. The lemma produces subfamilies with no conflicts between them, keeping the diagonal, and bounds the number of deleted members by two cost terms. The point that makes the whole argument work is that one of those costs is charged to the points left uncovered after the deletion, not before. The proof bounds a matching in an augmented bipartite graph: changing the two coordinates of a pair in the two possible orders factors the same matrix through two index sets attached to a conflict, and a simultaneous maximum-rank choice of the entries (Lemma 3.2, kernels at maximum support rank) makes the kernels of these maps control the matching size. [1]

**The contradiction (Proposition 4.1).** Apply the pruning lemma to the prospective families. Its two cost terms are at most $d$ and $d'$, where $d'$ is the number of points left uncovered by the retained families, so at most $d+d'$ members are deleted. The retained compatible pair therefore has objective at least $(M+2d)-(d+d')+d'=M+d$, and strictly more, which contradicts the maximality of $M+d$. Hence no graph $G$ as in Proposition 2.1 exists, hence no counterexample exists, and Theorem 1.1 follows. [1]

**The consequences (Sections 5 and 6).** Corollary 5.1 passes to the vertex-weighted and arc-weighted forms through Seacrest's equivalences, which have two different quantifier orders; Corollary 6.1 derives the statements about non-neighbours and directed cycles, including the $n/3$ triangle criterion. [1]

**Where an expert would look first.** At Lemma 2.2, where the arc-deletion argument must deliver the strict inequality with $|F(S)\setminus S|$ on the right rather than Seacrest's $|F(S)|$; at the blow-up in Lemma 2.3, where the tournament size has to be large enough for every subset at once; and above all at Lemma 3.1, since the accounting of the two deletion costs, one of them against the points uncovered after pruning, is the step that no earlier approach had. The rank argument of Lemma 3.2 is linear algebra over a field and can be checked on its own. [1]

## Consequences inside mathematics

The theorem closes a conjecture that organised a corner of digraph theory for three decades, and it makes the partial results above, the ratio bounds and the out-degree thresholds, special cases. The weighted forms and the short-cycle consequences follow at once. The paper's pruning lemma is stated for arbitrary finite binary relations, so it may have uses beyond this problem; the paper does not claim any. [1]

## Uses outside mathematics

No known direct application. Oriented graphs model one-way road systems, dominance relations and tournaments, and the theorem guarantees a vertex of a certain kind in each; but it offers no algorithm for finding one beyond checking the vertices, and no outside field has used the conjecture as an assumption. [1]

## Has anyone checked it?

We found no named mathematician who has said publicly that they have read or checked the proof. The people whose work it builds on, Seacrest, Yuster, Havet, Thomassé, Huang and Peng, have not commented in any source we found. VibeMathed lists the result as Lean-checked with the note "No independent mathematician has checked this yet", and separately lists two human preprints on the same conjecture from 2026, Brukhman's dense case and the out-degree-seven paper of Sadhukhan, Sandeep and Sen, both of which predate or run parallel to the release. A company called Haivian published what it calls an audit supporting the proof; it describes its own method as AI review with "same-provider" limits and a replay of the Lean proof, and names no mathematician, so this site treats it as machine evidence. [1][11][12]

**Machine checking.** The release's catalogue `formalization.yaml` lists this paper, and its scope note links a 40-line comparator statement, `SeymourSecondNeighborhood.lean`, which quantifies over every nonempty finite vertex type with a loopless asymmetric relation and asserts a vertex whose first out-neighbourhood is no larger than its second, defined exactly as in the paper, with the initial vertex and first neighbours excluded and sinks included. That is the whole of Theorem 1.1. The formal proof behind it is 43 files. Haivian reports compiling all 43 modules and replaying the comparator under Lean's default kernel. A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval. [12][13]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; this paper is not among them. On 26 October it added two manuscripts and more Lean statements; nothing in this family changed. [14]

## Sources

1. OpenAI, "A proof of Seymour's second-neighborhood conjecture", 23 September 2026. Theorem 1.1, the introduction with its history and proof strategy, Sections 2 to 6. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/A-proof-of-Seymours-second-neighborhood-conjecture-September-23-2026/paper.pdf
2. Hao Huang and Fei Peng, "An improved bound on Seymour's second neighborhood conjecture", arXiv:2412.20234, December 2024. The ratio $0.715538$ and the computational bound. https://arxiv.org/abs/2412.20234
3. Nathaniel Dean and Brenda J. Latka, "Squaring the tournament, an open problem", Congressus Numerantium 109 (1995). Cited by the paper as the record of the conjecture.
4. David C. Fisher, "Squaring a tournament: a proof of Dean's conjecture", Journal of Graph Theory 23 (1996), 43 to 48. https://doi.org/10.1002/(SICI)1097-0118(199609)23:1<43::AID-JGT4>3.0.CO;2-K
5. Frédéric Havet and Stéphan Thomassé, "Median orders of tournaments: a tool for the second neighborhood problem and Sumner's conjecture", Journal of Graph Theory 35 (2000), 244 to 256. https://doi.org/10.1002/1097-0118(200012)35:4<244::AID-JGT2>3.0.CO;2-H
6. Dror Fidler and Raphael Yuster, "Remarks on the second neighborhood problem", Journal of Graph Theory 55 (2007), 208 to 220. https://doi.org/10.1002/jgt.20229
7. Guantao Chen, Jian Shen and Raphael Yuster, "Second neighborhood via first neighborhood in digraphs", Annals of Combinatorics 7 (2003), 15 to 20. The ratio $0.657298$. https://doi.org/10.1007/s000260300001
8. Arpan Sadhukhan, R. B. Sandeep and Sagnik Sen, "A proof of Seymour's second neighborhood conjecture for oriented graphs with minimum out-degree 7", arXiv:2606.30588, 2026. https://arxiv.org/abs/2606.30588
9. James Brantner, Greg Brockman, Bill Kay and Emma Snively, "Contributions to Seymour's second neighborhood conjecture", Involve 2 (2009), 387 to 395. The minimal-counterexample and graph-product methods.
10. Tyler Seacrest, "Seymour's second neighborhood conjecture for subsets of vertices", arXiv:1808.06293, revised 2019. Lemma 4 and the subset equivalences. https://doi.org/10.48550/arXiv.1808.06293
11. VibeMathed, "Seymour's second neighborhood conjecture" and its two linked human entries (the dense case; minimum out-degree 7), dataset of 1 November 2026. https://vibemathed.com/problem/seymour-second-neighborhood-conjecture
12. Haivian, "Seymour's Second-Neighborhood Conjecture Audit", validation journal, read 2 November 2026. The compile of 43 modules and the default-kernel comparator replay; the stated AI-review limits. https://haivian.com/validation-journal/seymours-second-neighborhood-conjecture-mathematical-audit-formal-verification/
13. OpenAI, Lean scope note for family 173 and the comparator statement `SeymourSecondNeighborhood.lean` at the pinned commit. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/173.md and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/SeymourSecondNeighborhood.lean
14. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
