---
family: "106"
topic: "Colouring three-colourable graphs"
title: "If a map can be coloured with three colours, is it hard to find a colouring with a hundred?"
paperTitle: "Hardness of finding large independent sets in three-colorable graphs"
claim: "For every fixed delta below 1/3 it is NP-hard to tell a three-colourable graph from a graph in which every independent set has fewer than delta n of the n vertices. Since a graph coloured with c colours has an independent set of n/c vertices, it follows that for every fixed c colouring a three-colourable graph with c colours is NP-hard."
status: unreviewed
checked: 2026-11-03
papers:
  - preprints/Hardness-of-finding-large-independent-sets-in-three-colorable-graphs-September-24-2026/Hardness-of-finding-large-independent-sets-in-three-colorable-graphs-September-24-2026.pdf
draft: false
---

A proper colouring of a graph gives neighbouring vertices different colours. Deciding whether three colours suffice is a classic hard problem. The question here is stranger: suppose you are promised that three colours suffice, and asked only to find some colouring with a hundred colours, or a million. It sounds like it should be easy, and nobody knows how to do it. The best algorithms use a number of colours that grows with the graph, about $n^{0.195}$ for $n$ vertices, and the best hardness results proved for decades that four colours, then five, are out of reach. On 14 September 2026 Fei, Minzer and Wang posted a human proof of a conjecture about 4-to-1 games that, through two earlier reductions, closes the question: for every fixed $c$, colouring a three-colourable graph with $c$ colours is NP-hard. Ten days later OpenAI posted a paper proving something stronger by a different route: it is NP-hard even to find an independent set, a set of mutually non-adjacent vertices, containing any fixed positive fraction of the vertices, although a three-colourable graph always has one containing a third of them. [1][2][3]

As of 3 November 2026 no mathematician has said publicly that they have checked OpenAI's proof. The release's Lean formalization of the theorem is in its catalogue. The status on this page is "unreviewed". [1][10]

## The problem

A graph is a set of vertices with edges between some pairs. A proper $c$-colouring assigns each vertex one of $c$ colours so that no edge joins two vertices of the same colour; a graph that has one is $c$-colourable. An independent set is a set of vertices no two of which are joined by an edge, and $\alpha(G)$ denotes the size of the largest one. The two notions are tied: each colour class of a proper colouring is an independent set, so a $c$-colourable graph on $n$ vertices has $\alpha(G)\ge n/c$, and a three-colourable graph has $\alpha(G)\ge n/3$. [1]

Approximate colouring asks, for fixed $3\le k\le c$, for a proper $c$-colouring of a graph promised to be $k$-colourable. Its decision form asks to distinguish $k$-colourable graphs from graphs that are not even $c$-colourable. NP-hard means that a polynomial-time algorithm for the task would give one for every problem whose solutions can be checked quickly, which almost everyone believes impossible. [1]

The paper proves the independence version, which is stronger. A graph with small independence ratio $\alpha(G)/n$ needs many colours, since each colour class is an independent set; but a graph needing many colours can have independence ratio close to one, by adding isolated vertices. So "no large independent set" implies "not $c$-colourable", and not the other way round. [1]

<!-- uruk:visual-note
The visual on this page shows a graph the reader can colour by clicking, with a three-colouring hidden behind a button, a counter for the colours used, and a second mode that asks for a large independent set; the examples are small enough to solve, which is the point: the theorem says that the difficulty that is absent at this size cannot be avoided as graphs grow. What the visual leaves out is the construction in the proof, which turns a logical formula into a graph through objects, phase spaces and chains of questions, that have no small drawable instance. [1]
-->

## Why it stayed open

### Who asked

The problem of colouring a $k$-colourable graph with more colours is as old as the theory of NP-completeness. Garey and Johnson showed in 1976 that colouring a $k$-colourable graph with fewer than $2k-3$ colours is hard for large $k$; for $k=3$ the question whether four colours are hard was open for two more decades. The conjecture that every fixed palette $c\ge3$ is hard for three-colourable graphs is recorded as Example 2.9 of Barto, Bulín, Krokhin and Opršal's 2021 paper on promise constraint satisfaction. [1][4][7]

### What was tried

On the hardness side progress came one colour at a time. Khanna, Linial and Safra proved in 2000 that four-colouring a three-colourable graph is NP-hard; Guruswami and Khanna gave a different proof in 2004 with bounded-degree and edge-error variants; the algebraic theory of promise constraint satisfaction gave $(2k-1)$ colours for $k$-colourable graphs, hence five colours for three, in 2021. Beyond that the results were conditional. Dinur, Mossel and Regev obtained every fixed palette, and small independence density, from a variant of Khot's Unique Games conjecture in 2009; Guruswami and Sandeep showed in 2020 that the $d$-to-1 Games conjecture with perfect completeness, for any fixed $d$, implies constant-palette hardness; Krokhin, Opršal, Wrochna and Živný's 2023 arc-graph reduction brings the palette promise down to three. Dinur, Khot, Perkins and Safra proved hardness of independent sets of density $1/9$ in almost three-colourable graphs, and Hecht, Minzer and Safra extended that under randomized reductions. [1][4][5][6]

On the algorithmic side the number of colours needed crept down: Kawarabayashi, Thorup and Yoneda reached $\widetilde O(n^{0.19747})$, Bansal, Huang and Lee $O(n^{0.19539})$, and two randomized preprints posted after September 2026 report exponents $(13-\sqrt{97})/18+\epsilon$ and $4/23$. [1]

### What stood in the way

Every known hardness proof passes through a Label Cover or games instance and a gadget, and the difficulty is to keep the completeness side exactly three-colourable while driving the soundness side's independence ratio to zero. The conditional proofs borrowed the missing strength from an unproven games conjecture; the unconditional ones either lost a colour or two on the completeness side (Fei, Minzer and Wang's Corollary 1.9 gives small independence density only with an eight-colourable promise) or lost the independent-set guarantee (the three-colourable hardness obtained through the arc-graph reduction says nothing about independent sets). The 14 September paper of Fei, Minzer and Wang proved the 4-to-1 Games conjecture with perfect completeness; combined with the two reductions, that settles the colouring conjecture for every fixed palette, but not the independence form with a three-colourable promise. [1][2][3]

## What OpenAI claims

**Theorem 1.1** (OpenAI, 24 September 2026). For every fixed real $0<\delta<1/3$ there is a deterministic polynomial-time algorithm that maps each Boolean 3-CNF formula $\phi$ to a finite simple graph $G_\phi$ such that if $\phi$ is satisfiable then $G_\phi$ is three-colourable, and if $\phi$ is unsatisfiable then $\alpha(G_\phi)<\delta|V(G_\phi)|$. The running time and output size are polynomial in the length of $\phi$, with constants depending on $\delta$. [1]

**Corollary 1.2.** For every fixed pair of integers $3\le k\le c$, it is NP-hard to distinguish $k$-colourable graphs from graphs that are not $c$-colourable. The proof is three lines: choose $\delta<\min\{1/3,1/c\}$, note that a three-colourable graph is $k$-colourable and that a $c$-colourable graph has an independent set of size $n/c$, which the soundness bound excludes. [1]

Three points of scope. First, the paper is explicit that the colouring consequence was already established: Fei, Minzer and Wang's Corollary 1.7 "gives the three-colorable versus not $c$-colorable gap for every fixed $c$". What is new is the independent-set soundness together with three-colourability of the entire graph, and the fact that the proof starts from ordinary projection Label Cover, with no $d$-to-1 or fibre-size hypothesis; the release's own companion paper on 2-to-1 games with perfect completeness (family 105) gives the colouring consequence by yet another route. Second, the reduction is deterministic: the probability experiment in the analysis is expanded exactly into unweighted vertices. Third, the polynomial exponent of the reduction depends on $\delta$ and on the palette, and the paper gives no bound for it. [1][2]

## How the claimed proof goes

What follows is a map of the paper's argument from its introduction and eight sections. It is not a check of the details. The paper is about 1,540 lines of TeX, and its analysis belongs to the tradition of Fourier-analytic PCP reductions, with a continuous twist: the gadget lives on a torus rather than a Boolean cube. [1]

**The starting point: Label Cover (Section 2, Theorem 2.1).** A Label Cover instance is a bipartite collection of questions and tests, each test prescribing a projection from a left answer to a right answer. The PCP theorem with parallel repetition supplies, for every fixed rational $\sigma$, a polynomial-time reduction from 3-SAT to instances in which either every test can be satisfied or every labelling satisfies at most a $\sigma$ fraction of tests, with constant alphabets. The paper uses ordinary projections and does not need the $d$-to-1 property. [1]

**Chains and phase spaces (Section 3).** Replacing one left question at a time by a right question produces chains of question tuples, in the manner of the multilayered PCP of Dinur, Guruswami, Khot and Regev. At each tuple, a point assigns a phase in the circle $\mathbb T=\mathbb R/\mathbb Z$ to every possible product answer; a projection $\pi$ pulls a phase vector back along itself. Points are linked across a projection at length zero and within a phase space by their sup circle distance, and shortest paths through these links define a pseudometric. Edges of the output graph compare one point with the coordinatewise half-shift of another. Proposition 3.1 shows the rule produces an explicit finite unweighted graph in deterministic polynomial time; only fixed finite rational data enter. [1]

**Completeness (Lemma 3.2).** A satisfying labelling evaluates each phase assignment at one product answer. This evaluation is nonexpanding, and the edge threshold forces adjacent vertices to have circle phases more than $1/3$ apart; three equal half-open arcs of the circle therefore colour every vertex properly. This is the three-colouring of the whole graph. [1]

**Soundness, step one: juntas (Section 2, Theorem 2.2, and Section 4).** An independent set gives bounded functions on the tuple phase spaces that change sign under the half-shift and share a Lipschitz bound. Austin's dimension-independent approximation theorem, a continuous analogue of Friedgut's junta theorem, approximates such functions by functions of boundedly many answer coordinates (Lemma 2.3 gives the two dimension-independent bounds used). The obstacle is that approximation under a product measure need not survive the identification of coordinates by projections. The paper therefore chooses coordinate lists for whole small subchains, introduces independent rotation variables at every layer of each subchain, and projects the selected coordinates to the last layer so that all lists lie in a common answer set (Lemma 4.1, bounded subchain lists; Lemma 4.2, separated lists). A shared answer for two separated subchains supplies compatible answers to an intervening test, so low Label Cover value makes such intersections rare. [1]

**Soundness, step two: alignment (Section 5, proved in Section 8).** The distributional alignment lemma (Lemma 5.1) chooses a law on sets of layers before seeing the lists, such that on most selected sets each listed label can be assigned to an index shared by all its occurrences, with a bound independent of the label universe. Its proof combines a finite minimax argument, Ramsey homogenization of finite probability patterns, and an order-invariant random-array argument; the paper gives it in full in Section 8, noting antecedents in the Ramsey theory of random variables. Lemma 5.3 shows aligned pairs occur with high probability. [1]

**Soundness, step three: the coefficient test (Section 6, Proposition 6.1).** Coefficients are sampled at finitely many levels between $0$ and $1$ with geometrically decreasing probabilities, so that with enough layers some coefficient equals $1$; that layer absorbs auxiliary uniform phase shifts without changing their distribution. Alignment makes dependence on a zero-coefficient layer small, and decreasing a positive coefficient by one level bounds its probability of substantial dependence. A dimension-independent bound on influential coordinates then gives a small mean square for the sign-changing functions, hence a conditional probability at most $6\epsilon$ that a sampled vertex lies in the independent set, hence small independence density. [1]

**Parameters (Section 7).** All constants are chosen in dependency order, $\sigma$ last, and the theorem follows; the paper treats $\delta$ as rational, which loses nothing. [1]

**Where an expert would look first.** At the passage from Austin's product-measure approximation to projected coordinates (Section 4), the step the paper itself calls the difficulty; at the alignment lemma's proof in Section 8, which is the paper's longest self-contained argument and the one with no direct precedent; and at the coefficient sampling of Section 6, where the probabilities of the levels and the "$6\epsilon$" bound carry the soundness. Completeness (Lemma 3.2) is short and can be checked directly. [1]

## Consequences inside mathematics

The theorem gives, unconditionally, what Dinur, Mossel and Regev had obtained from a conjecture: three-colourable completeness with arbitrarily small independent-set soundness. It strengthens the constant-palette hardness theorem, now a human result, to a density statement, and it does so from ordinary Label Cover rather than from a games conjecture, which makes the method available where $d$-to-1 structure is absent. The remaining gap is quantitative: between hardness for every fixed palette and algorithms using about $n^{0.195}$ colours, nothing is known. [1]

## Uses outside mathematics

No known direct application. Graph colouring models scheduling, register allocation and frequency assignment, and hardness results of this kind explain why heuristics are used there; but the theorem is about worst-case instances built from logical formulas, and the paper names no application. [1]

## Has anyone checked it?

We found no named mathematician or computer scientist who has said publicly that they have read or checked OpenAI's proof. The natural readers are the authors of the surrounding results, Minzer, Guruswami, Sandeep, Krokhin and Opršal, and we found no public statement from them on this paper. Two independent trackers record the same point the paper makes about priority: AI Proof Watch dates the constant-colouring hardness to Fei, Minzer and Wang on 14 September 2026, "a human result" that "precedes the selected claim, whose additional strength is an arbitrarily small independent-set bound", and AI Proved What? writes that "the coloring consequence was already known through Fei, Minzer and Wang". VibeMathed's dataset of 1 November has no entry for this family. [2][8][9]

**Machine checking.** The release's catalogue `formalization.yaml` lists this paper, and its scope note links an 84-line comparator statement, `IndependentSets.lean`, which states Theorem 1.1 as written: for every fixed $0<\delta<1/3$, a deterministic polynomial-time reduction from binary 3-SAT formulas to finite simple graphs, three-colourable on satisfiable inputs and with largest independent set below $\delta$ times the vertex count on unsatisfiable ones, with the complete adjacency-matrix output included in the runtime bound. The formal proof behind it is about 456 files. We found no outside replay. A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval. [10]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; this paper is not among them. On 26 October it added two manuscripts and more Lean statements; nothing in this family changed. [11]

## Sources

1. OpenAI, "Hardness of finding large independent sets in three-colorable graphs", 24 September 2026. Theorem 1.1 and Corollary 1.2, Section 1.1 for the history and the comparison with Fei, Minzer and Wang, Section 1.2 for the proof overview, Sections 2 to 8. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Hardness-of-finding-large-independent-sets-in-three-colorable-graphs-September-24-2026/Hardness-of-finding-large-independent-sets-in-three-colorable-graphs-September-24-2026.pdf
2. Yumou Fei, Dor Minzer and Shuo Wang, "On the Hardness of 4-to-1 Games with Perfect Completeness", ECCC report TR26-179, published 14 September 2026, revised to 23 October 2026. Corollaries 1.7 and 1.9 as cited by the paper. https://eccc.weizmann.ac.il/report/2026/179/
3. Venkatesan Guruswami and Sai Sandeep, "$d$-to-1 Hardness of Coloring 3-Colorable Graphs with $O(1)$ Colors", 47th International Colloquium on Automata, Languages, and Programming, 2020; and Andrei Krokhin, Jakub Opršal, Marcin Wrochna and Stanislav Živný, "Topology and Adjunction in Promise Constraint Satisfaction", SIAM Journal on Computing, 2023. The two reductions through which the games theorem gives constant-palette hardness.
4. Libor Barto, Jakub Bulín, Andrei Krokhin and Jakub Opršal, "Algebraic Approach to Promise Constraint Satisfaction", Journal of the ACM 68 (2021). Five-colour hardness and Example 2.9. https://doi.org/10.1145/3457606
5. Sanjeev Khanna, Nathan Linial and Shmuel Safra, "On the Hardness of Approximating the Chromatic Number", Combinatorica 20 (2000), 393 to 415; and Venkatesan Guruswami and Sanjeev Khanna, "On the Hardness of 4-Coloring a 3-Colorable Graph", SIAM Journal on Discrete Mathematics 18 (2004), 30 to 40. https://doi.org/10.1007/s004930070013 and https://doi.org/10.1137/S0895480100376794
6. Irit Dinur, Elchanan Mossel and Oded Regev, "Conditional Hardness for Approximate Coloring", SIAM Journal on Computing 39 (2009), 843 to 873. https://doi.org/10.1137/07068062X
7. Michael R. Garey and David S. Johnson, "The complexity of near-optimal graph coloring", Journal of the ACM 23 (1976), 43 to 49. https://doi.org/10.1145/321921.321926
8. AI Proof Watch, "Hardness of large independent sets in three-colorable graphs", read 3 November 2026. The dated timeline placing Fei, Minzer and Wang before the claim. https://aiproofwatch.com/problems/three-colorable-independent-set-hardness
9. AI Proved What?, episode 106, "Three colors, no help?", read 3 November 2026. https://aiprovedwhat.com/episodes/106-coloring-three-colorable-graphs/
10. OpenAI, Lean scope note for family 106 and the comparator statement `IndependentSets.lean` at the pinned commit. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/106.md and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/IndependentSets.lean
11. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
