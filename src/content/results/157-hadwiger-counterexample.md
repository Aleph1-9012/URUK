---
family: "157"
topic: "Hadwiger’s conjecture"
title: "If a network needs many colours, must it hide a complete network inside?"
paperTitle: "A counterexample to Hadwiger's conjecture"
claim: "There are arbitrarily large finite graphs with no three pairwise non-adjacent vertices whose fractional chromatic number, and hence chromatic number, exceeds their Hadwiger number. Hadwiger's conjecture of 1943 is false."
status: unreviewed
checked: 2026-10-17
papers:
  - preprints/A-counterexample-to-Hadwigers-conjecture-September-23-2026/paper.pdf
  - preprints/A-counterexample-to-the-Colin-de-Verdiere-chromatic-conjecture-September-23-2026/paper.pdf
draft: false
---

Colour the points of a network so that no two linked points share a colour. Some networks need many colours. The four-colour theorem says a map never needs more than four, and the reason, roughly, is that a flat map cannot contain five regions that all touch each other. In 1943 Hugo Hadwiger proposed that this is the whole story for every network, flat or not: if a network needs $t$ colours, then it must contain the complete network on $t$ points, in which every pair is linked, in a loosened sense called a minor. The conjecture was proved for up to six colours, the last case in 1993, and Plummer, Stiebitz and Toft called it "the major unsolved problem in graph coloring theory". On 23 September 2026 OpenAI posted a paper claiming that it is false, with counterexamples in the special family that experts had long suspected might hide one. Two companion papers in the same family claim a second counterexample by a different route and a positive result in the other direction. [1][2][3][4][5]

As of 17 October 2026 no mathematician has said publicly that they have checked the counterexample. The status on this page is "unreviewed".

## The problem

A graph is a set of points, called vertices, some pairs of which are joined by edges. A colouring gives each vertex a colour so that the two ends of every edge differ. The chromatic number $\chi(G)$ is the fewest colours that suffice. A five-cycle, five vertices in a ring, needs three colours, because two colours would have to alternate around a ring of odd length and would collide. [4]

A minor of $G$ is anything obtained by deleting vertices, deleting edges, and contracting edges, which means merging the two ends of an edge into one vertex. The complete graph $K_t$ has $t$ vertices and every possible edge. $G$ has a $K_t$ minor exactly when it contains $t$ disjoint connected groups of vertices, called branch sets, with at least one edge between every two groups. Contracting each group to a point then leaves $K_t$. The Hadwiger number $h(G)$ is the largest such $t$. In the five-cycle, contract two neighbouring edges and a triangle remains, so $h=3$. [1][4]

**Hadwiger's conjecture.** For every finite graph $G$, $\chi(G)\le h(G)$. [1][4]

The cases $t=2$ and $t=3$ are easy. A graph needing two colours has an edge, and one needing three has an odd cycle, which contracts to a triangle. The connection to maps is that a planar graph has no $K_5$ minor, so Hadwiger's conjecture for five colours implies the four-colour theorem. [4]

Two more quantities are needed. The independence number $\alpha(G)$ is the size of the largest set of vertices with no edges among them. Every colour class is such a set, so a graph on $m$ vertices needs at least $m/\alpha(G)$ colours. The fractional chromatic number $\chi_f(G)$ relaxes colouring. Put a nonnegative weight on each independent set so that the sets containing each vertex have total weight at least one, and minimize the total weight. An ordinary colouring is the case of weights $0$ and $1$, so $\chi_f\le\chi$, and the same counting gives $\chi_f\ge m/\alpha$. [1]

### Why graphs with no three strangers

When $\alpha(G)\le2$, no three vertices are pairwise non-adjacent: among any three people in the network, two know each other. Then every colour class has at most two vertices, so a graph on $m$ vertices needs at least $m/2$ colours, and Hadwiger's conjecture demands a complete minor on at least $m/2$ vertices. Plummer, Stiebitz and Toft proved in 2003 that the conjecture for these graphs is equivalent to exactly that demand. [1][5]

They also explained why these graphs were the natural place to look for trouble, and the explanation is the key to the counterexample. By a theorem of Kim on Ramsey numbers, there are graphs with $\alpha=2$ on $m$ vertices whose largest complete subgraph has only about $\sqrt{m\log m}$ vertices. To build a $K_{\lceil m/2\rceil}$ minor in such a graph, nearly all of the $m/2$ branch sets must be tiny, and since there are only $m$ vertices in total, most of them must be single vertices or single edges. The edges among the branch sets must be pairwise joined. Plummer, Stiebitz and Toft wrote: "That is, $G$ will have a large matching with every two matching edges joined by at least one edge. We shall call such a matching connected." So the question of large complete minors in these graphs comes down to the question of large connected matchings, and they added that "a proof has proved elusive so far. This has led to speculation that the conjecture might be false, even in this special case." [5]

A small example shows the construction in miniature. Put seven vertices in a ring and join every pair except neighbours on the ring; this is the complement of the seven-cycle. Among any three vertices of a seven-ring two are not neighbours, so they are joined here, and $\alpha=2$. Each colour class is a pair of ring neighbours, so four colours are needed. Numbering the vertices $0$ to $6$ around the ring, the branch sets $\{0,3\}$, $\{1,5\}$, $\{2\}$, $\{4\}$ and $\{6\}$ are each connected and are joined pairwise, so $h=5$, comfortably above $\chi=4$. The minor is built from single vertices and joined pairs, as the heuristic predicts. We checked these values by exhaustive search.

## Why it stayed open

### Eighty years of evidence

Hadwiger proved the case of four colours in the paper that stated the conjecture, and Dirac proved it independently. In 1937 Wagner had shown that the five-colour case is equivalent to the four-colour theorem, so it became true when Appel and Haken proved that theorem in 1976. Robertson, Seymour and Thomas proved the six-colour case in 1993, again by reduction to the four-colour theorem, and won the Fulkerson Prize for it. Bollobás, Catlin and Erdős called the conjecture "one of the deepest unsolved problems in graph theory". From seven colours on it stayed open. [1][4][6]

Without an exact answer, researchers asked how many colours a graph with no $K_t$ minor can need. Kostochka and Thomason showed in 1984 that such graphs always have a vertex of degree $O(t\sqrt{\log t})$, which gives that many colours. Norin, Postle and Song broke that barrier with $O(t(\log t)^{\beta})$ for every $\beta>\tfrac14$, Delcourt and Postle reached $O(t\log\log t)$, and a 2026 preprint of Liu and Luo claims $O(t\log\log\log t)$. Reed and Seymour proved in 1998 that the fractional chromatic number is at most $2h(G)$, and discussed the weaker conjecture $\chi_f\le h$. [1][7]

For graphs with $\alpha\le2$, Duchet and Meyniel proved in 1982 that they have complete minors on $m/3$ vertices, and Fox improved this in 2010 to $m/3+cm^{4/5}(\log m)^{1/5}$. Getting from $m/3$ to $m/2$ resisted. Füredi, Gyárfás and Simonyi conjectured in 2005 that a graph with $\alpha=2$ on $4t-1$ vertices always has a connected matching of size $t$, and checked it up to $t=17$; Cambie later showed that Hadwiger's conjecture would imply it. In 2025 Kühn, Sauermann, Steiner and Wigderson disproved a related strengthening, the odd Hadwiger conjecture, using graphs with $\alpha\le2$. [1][5]

## What OpenAI claims

A connected matching is a set of disjoint edges such that every two of them are joined by at least one further edge. Write $\mathrm{cm}(G)$ for the largest size of one. [1]

**Theorem 1.1** (OpenAI, 23 September 2026). There are arbitrarily large integers $m$ for which some $m$-vertex graph $G$ satisfies $\alpha(G)\le2$ and $\mathrm{cm}(G)<m/100$. [1]

The paper proves that any graph satisfies $h(G)\le\bigl(|V(G)|+4\,\mathrm{cm}(G)+2\bigr)/3$. The reason is the heuristic above made exact: a complete minor larger than $m/3$ must use many branch sets of one or two vertices, and two-vertex branch sets that are pairwise joined form a connected matching. Combining this with $\chi_f\ge m/2$ gives: [1]

**Corollary 1.2.** There are graphs of arbitrarily large order $m$ with

$$
h(G)<\frac{26m}{75}+\frac23<\frac m2\le\chi_f(G)\le\chi(G).
$$

So Hadwiger's conjecture is false, and so is the fractional weakening $\chi_f\le h$ that Reed and Seymour discussed. In these graphs the chromatic number exceeds the Hadwiger number by a factor approaching at least $\tfrac{75}{52}\approx1.44$. [1]

What this does not say. The graphs exist only for sufficiently large $m$; the paper fixes its constants in a long chain and gives no explicit size and no explicit graph. It says nothing about any particular number of colours such as seven. And it does not touch the linear form of the conjecture, $\chi\le Ch$ for some constant $C$, which the companion below claims to prove. The construction also disproves the connected-matching conjecture of Füredi, Gyárfás and Simonyi, whose truth Hadwiger's conjecture would have implied. [1]

**The companions.** The Colin de Verdière invariant $\mu(G)$ is a number defined from the matrices that fit the graph's pattern of edges. It is at most $3$ exactly for planar graphs, and $h(G)\le\mu(G)+1$ always. Colin de Verdière conjectured $\chi\le\mu+1$. The second paper claims graphs with $\alpha\le2$ and $\chi_f>\mu+1$, which disproves that conjecture and, through $h\le\mu+1$, gives a second counterexample to Hadwiger's, by a rank argument independent of connected matchings. The third paper claims the Linear List Hadwiger conjecture of Kawarabayashi and Mohar, which asks for an absolute constant $C$ with $\chi_{\mathrm{list}}(G)\le Ch(G)$. List colouring lets each vertex choose from its own list of allowed colours. On 4 October, two days before OpenAI's release, Sergey Norin and Raphael Steiner posted a proof of the ordinary linear bound $\chi\le Ct$ for graphs with no $K_t$ minor, stating that it "was found by GPT-6 Astra, following the directions by the authors". [2][3][8][9]

## How the claimed proof goes

What follows is a map of the paper's construction, taken from its introduction and section plan. It is not a check of the details. [1]

**Holes.** The graph is described by its missing edges, which the paper calls holes. Vertices are sampled from a finite probability space, and each sampled configuration carries linear maps into vector spaces over the two-element field $\mathbb F_2$, where arithmetic is done modulo $2$. A pair of vertices is a hole when a shared tensor certifies two prescribed identities coming from a symmetric bilinear form. If three vertices were pairwise holes, adding the three identities around the triangle would cancel every bilinear term and leave $0=1$. So the hole relation has no triangles, which is exactly the statement that the graph has $\alpha\le2$. [1]

**Conflicts.** Two edges $A_1A_2$ and $B_1B_2$ cannot both belong to a connected matching if all four cross pairs $A_iB_j$ are holes. The heart of the paper is a distribution theorem forcing such four-hole conflicts between independent random edges drawn from any law with suitable density bounds, while allowing the two ends of an edge to depend on each other. An entropy-minimizing container argument then transfers this to the finite sampled graph. While a family of candidate edges supports such a law, it has many conflicts to delete, and when no such law remains, a capacitated cut covers what is left by a small set of vertex types. The upshot is that every connected matching is small. [1]

**Forcing four holes.** Proving the distribution theorem takes most of the paper: finite algebraic certificates for four holes, using Boolean moment matrices and pinned coordinates; a preparation step that splits the law into pieces with compatible tables; and an overlap argument through entropy, weak regularity and a limiting object, with a separate treatment for a branch whose mass may vanish in the limit. A closing section records the order in which all constants are chosen, with the one unbounded parameter $n$ sent to infinity last. [1]

Where would an expert look first? At the overlap sections, eleven to thirteen, which carry the distribution theorem and where the limiting argument must not lose the rare branch; at the container transfer in Section 3; and at the parameter ledger in Section 14, because a chain of "sufficiently large" choices is where circular dependencies hide. [1]

## Consequences inside mathematics

If the construction is right, several statements fall together. Hadwiger's conjecture fails, and so does its fractional weakening $\chi_f\le h$, which Reed and Seymour's theorem $\chi_f\le2h$ had left as the natural target. The special case for $\alpha\le2$, that every $m$-vertex graph with no three pairwise non-adjacent vertices has a $K_{\lceil m/2\rceil}$ minor, fails. Füredi, Gyárfás and Simonyi's sharp connected-matching conjecture fails. Through the companion, Colin de Verdière's chromatic conjecture fails as well. [1][2][7]

Much survives. The conjecture remains a theorem for six colours or fewer, because those cases were proved. The weaker conjecture of Füredi, Gyárfás and Simonyi that connected matchings of some linear size $c_0m$ always exist is not settled, since the construction only pushes below $m/100$. And the linear Hadwiger conjecture, $\chi\le Ch$ for a universal $C$, is untouched by the counterexample and claimed by the companion and by Norin and Steiner. The new open questions are the smallest number of colours for which Hadwiger's conjecture fails, and the best constant $C$. Steiner's 2022 examples show that the list-colouring version needs $C\ge2$. [1][3][9]

## Uses outside mathematics

No known direct application.

The counterexamples are random constructions that exist above an unstated size, and the paper produces no algorithm. [1][11]

## Has anyone checked it?

We found no named graph theorist who says they are reading or checking this proof. Gil Kalai listed the counterexample among results connected to his blog, with the disclaimer that the release's proofs "will need to be checked and digested by the mathematical community". VibeMathed records that no independent mathematician has checked it. The Norin-Steiner paper is expert work on the linear bound, which is the companion's subject and is consistent with the counterexample, but it is not a reading of OpenAI's construction. [9][10][11]

**Machine checking.** The 6 October release's Lean covered only the list-colouring companion, through a 35-line statement. On 7 October OpenAI added a 56-line statement for the counterexample, `HadwigerCounterexample.lean`, with a formal proof of about 280 files, and listed it in the release's catalogue, where both stand at the pinned commit. It defines the connected-matching number and the Hadwiger number through disjoint, connected, pairwise adjacent branch sets, and states that for every $M$ there is an $m\ge\max(M,5)$ and a graph on $m$ vertices with $\alpha\le2$, $\mathrm{cm}<m/100$, $h<26m/75+2/3<m/2\le\chi$, and $h<\chi$. It also states the negation of Hadwiger's conjecture directly. The fractional strengthening and the Colin de Verdière consequence are outside the formal statement. We found no outside replay. A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval. [12]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; none of them is in this family. The same update added the Lean statement above. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [13]

## Sources

1. OpenAI, "A counterexample to Hadwiger's conjecture", 23 September 2026. Theorem 1.1, Corollary 1.2, Proposition 3.5, Sections 1.1 and 1.2 and the historical context. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/A-counterexample-to-Hadwigers-conjecture-September-23-2026/paper.pdf
2. OpenAI, "A counterexample to the Colin de Verdière chromatic conjecture", 23 September 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/A-counterexample-to-the-Colin-de-Verdiere-chromatic-conjecture-September-23-2026/paper.pdf
3. OpenAI, "A linear list-coloring bound in terms of the Hadwiger number", 23 September 2026, with its `INPUTS.md` listing the results used without proof, and its introduction for Steiner's lower bound. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/A-linear-list-coloring-bound-in-terms-of-the-Hadwiger-number-September-23-2026/paper.pdf
4. Wikipedia, "Hadwiger conjecture (graph theory)", read 17 October 2026. The small cases, Wagner's equivalence, the Fulkerson Prize and the Bollobás-Catlin-Erdős quotation. https://en.wikipedia.org/wiki/Hadwiger_conjecture_(graph_theory)
5. Michael D. Plummer, Michael Stiebitz and Bjarne Toft, "On a special case of Hadwiger's conjecture", Discussiones Mathematicae Graph Theory 23 (2003), 333-363. The introduction's heuristic for connected matchings and the quotations. https://doi.org/10.7151/dmgt.1206
6. Neil Robertson, Paul Seymour and Robin Thomas, "Hadwiger's conjecture for K6-free graphs", Combinatorica 13 (1993), 279-361. https://doi.org/10.1007/BF01202354
7. Bruce Reed and Paul Seymour, "Fractional colouring and Hadwiger's conjecture", Journal of Combinatorial Theory, Series B 74 (1998), 147-152. https://doi.org/10.1006/jctb.1998.1835
8. Wikipedia, "Colin de Verdière graph invariant", read 17 October 2026. https://en.wikipedia.org/wiki/Colin_de_Verdi%C3%A8re_graph_invariant
9. Sergey Norin and Raphael Steiner, "A Proof of the Linear Hadwiger Conjecture", arXiv, 4 October 2026. https://arxiv.org/abs/2610.05291
10. Gil Kalai, "Updates: Sharing AI progress on mathematics (amazing!); and my lecture plans", Combinatorics and more, 7 October 2026. https://gilkalai.wordpress.com/2026/10/07/updates-sharing-ai-progress-on-mathematics-amazing-and-my-lecture-plans/
11. VibeMathed, "Hadwiger's Conjecture", read 17 October 2026. https://vibemathed.com/problem/hadwiger-conjecture
12. OpenAI, comparator statements `ListHadwiger.lean` and `HadwigerCounterexample.lean` with the family's scope note, at the pinned commit; the second statement and the note's second half date from 7 October. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/ListHadwiger.lean , https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/HadwigerCounterexample.lean and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/157.md
13. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
