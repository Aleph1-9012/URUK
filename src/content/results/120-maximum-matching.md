---
family: "120"
topic: "Maximum matching in general graphs"
title: "How fast can a computer pair everyone up?"
paperTitle: "Almost-Linear-Time Maximum-Cardinality Matching in General Graphs"
claim: "One randomized algorithm finds a maximum matching, a largest set of edges sharing no endpoint, in any simple graph with n vertices and m edges in (n+m)^{1+o(1)} time, with the time bound holding on every run and the answer correct with probability at least 2/3. The same holds for finding a spanning subgraph with prescribed vertex degrees, or deciding that none exists."
status: unreviewed
checked: 2026-11-03
papers:
  - preprints/Almost-Linear-Time-Maximum-Cardinality-Matching-in-Sparse-General-Graphs-September-24-2026/main.pdf
draft: false
visual: pairs-rings
---

Take a network of people and the pairs who are willing to work together, and pair up as many as possible, each person in at most one pair. This is maximum matching, one of the oldest problems in algorithms. Jack Edmonds solved it in polynomial time in 1965, with the paper that first proposed polynomial time as the meaning of "efficient"; Micali and Vazirani brought the time down to about $m\sqrt n$ for $m$ edges and $n$ people in 1980. For sparse networks, where $m$ is a few times $n$, that bound stood for forty-six years, while the easier case with two kinds of people, the bipartite case, fell to almost-linear time in 2022 through a revolution in network-flow algorithms. The obstacle in general networks is odd cycles. On 24 September 2026 OpenAI posted an 86-page paper claiming an algorithm that runs in time $(n+m)^{1+o(1)}$ on every graph: essentially the time it takes to read the input. [1][2]

As of 3 November 2026 no computer scientist has said publicly that they have checked the proof, and the release contains no Lean formalization of it. The status on this page is "unreviewed". [1][7]

## The problem

A graph has vertices and edges joining pairs of them. A matching is a set of edges no two of which share a vertex, and a maximum matching is one with as many edges as possible; a perfect matching covers every vertex. For a graph given as adjacency lists, with $n$ vertices and $m$ edges, the input has size about $p=n+m$ words, and an algorithm is almost linear if it runs in time $p^{1+o(1)}$, that is, $p^{1+\epsilon}$ for every $\epsilon>0$ once $p$ is large. [1]

Berge's criterion from 1957 says a matching is maximum exactly when there is no augmenting path, a path that alternates between non-matching and matching edges and starts and ends at unmatched vertices; flipping such a path adds one edge. [4] In a bipartite graph, where vertices split into two sides and every edge crosses, augmenting paths are found by flow methods. In a general graph an odd cycle can hide an augmenting path from a simple search: on a triangle, giving each edge the value $\tfrac12$ satisfies every vertex's constraint, yet only one edge can be matched. Edmonds's blossom algorithm shrinks odd cycles to single points and expands them later, and his matching polytope theorem explains the phenomenon through constraints on odd sets of vertices. [1][2][5]

<!-- uruk:visual-note
The visual on this page shows a small graph in which the reader matches vertices by clicking edges, with augmenting paths highlighted on request and an odd cycle that blocks the obvious search; a second panel plots the running-time bounds, $m\sqrt n$ against $(n+m)^{1+o(1)}$, on sparse graphs as $n$ grows. What the visual leaves out is the machinery of the proof, which does not look like Edmonds's blossoms: ledgers of fractional allocations, flows, and a data structure for circulations in a changing forest. The $o(1)$ in the exponent is not a number anyone could set in a program. [1]
-->

## Why it stayed open

### Who asked

The question of a fast algorithm for matching in general graphs goes back to Edmonds's "Paths, trees, and flowers" of 1965, which gave the first polynomial algorithm and framed the polynomial-time criterion itself. Nobody posed "almost-linear time" as a conjecture; it became the target once the bipartite case reached it in 2022. [1][2]

### What was tried

Three lines of attack. Combinatorial: Hopcroft and Karp, and independently Karzanov, batched shortest augmenting paths to get $O(m\sqrt n)$ for bipartite graphs in 1973, and Micali and Vazirani extended this to general graphs in 1980, the bound that stood until now; Gabow and Tarjan reached it by weighted scaling, Gabow by a direct weighted search, and Goldberg and Karzanov shaved a logarithm on dense graphs. Algebraic: random evaluation of Tutte's matrix connects matching to linear algebra, and Mucha and Sankowski, then Harvey, construct maximum matchings in matrix-multiplication time $O(n^{\omega})$, which beats $m\sqrt n$ only on dense graphs. Continuous: for bipartite graphs the unit-capacity flow formulation let Mądry's electrical-flow interior-point method, then van den Brand and coauthors, then the almost-linear exact flow algorithms of Chen, Kyng, Liu, Peng, Probst Gutenberg and Sachdeva (2022) and of van den Brand and coauthors, yield almost-linear bipartite matching. [1][2][3]

### What stood in the way

Flow does not see odd cycles. The continuous methods optimise over the fractional matching polytope defined by vertex constraints, and in a general graph that polytope has vertices that are not matchings, half-integral points on odd cycles; the odd-set constraints that cut them off are exponentially many. Every fast method for general graphs therefore needed some version of blossom contraction, and no one had found how to combine contraction with the almost-linear flow machinery without scanning the odd blocks again and again as the matching changed. The paper's own summary of the difficulty is "to repair this representation after structural changes without repeatedly scanning all its odd blocks". [1]

## What OpenAI claims

**Theorem 1.1** (OpenAI, 24 September 2026). There are a single uniform randomized word-RAM algorithm, constants $c_0\ge2$ and $C\ge1$, and a nonincreasing function $\eta$ with $\eta(q)\to0$ such that for every simple graph with $p=n+m$ the algorithm halts on every computation path in at most $Cp^{1+\eta(p)}$ instructions and, with probability at least $2/3$, outputs an explicit maximum matching. [1]

The model is spelled out: a word RAM with words of $\lceil c_0\log_2(n+2)\rceil$ bits, unit-cost arithmetic and random bits, all preprocessing, allocation and output included, no oracle or advice. On graphs with $m\le\kappa n$ this is $C_\kappa n^{1+\eta(n)}$; at the dense extreme it is $n^{2+o(1)}$. A corollary gives the same guarantees for $f$-factors: given a target degree $f(v)$ at every vertex, decide whether a spanning subgraph with exactly those degrees exists and return one if it does, through a witness-preserving reduction of only logarithmic expansion in the incidences. [1]

Three points of scope. The algorithm is Monte Carlo: it may fail with probability up to $1/3$, though its running time is bounded on every path; repetition drives the failure probability down. The function $\eta$ is not explicit, so the result is asymptotic rather than a practical running time; Micali and Vazirani remains the algorithm anyone would run. Weighted matching is not addressed. [1]

## How the claimed proof goes

What follows is a map of the paper's argument from its introduction and its ten sections. It is not a check of the details. The paper is about 6,400 lines of TeX, and most of it builds a data structure; the matching-specific ideas are in Sections 3 and 4. [1]

**Reduction to subcubic perfect matching (Section 9).** The central subproblem is to find a perfect matching in a graph of maximum degree three. Section 9 reduces exact cardinality queries to this subproblem while retaining the original edge identifiers, so that an answer can be decoded into a matching of the input graph; a threshold search with a summable error budget finds the cardinality. [1]

**The matching state (Section 3).** The perfect-matching procedure keeps the current matching through a partition of the vertices. Odd blocks, called bins, come with internal matchings after any prescribed vertex is left exposed; some outside singleton vertices, called rows, are assigned along original edges to distinct bins, and each assigned bin matches its exposed vertex to its row. The remaining vertices sit in matched pairs. This representation lets the exposure of a bin change without expanding a nested block, which is the standard cost of blossom methods. [1]

**Ledgers and debt (Sections 3 and 4).** A ledger allocates a fixed amount from each row among its neighbouring bins; a bin's residual is its capacity minus its allocated load. Several ledgers impose residual margins proportional to bin size (Definition 3.1, the ledger invariant), and a nonnegative debt lets a margin fail temporarily. At each settled state the lowest ledger has no debt and certifies a strict Hall surplus for every nonempty set of bins (Lemma 3.2); the highest ledger carries a logarithmic objective that must admit progress whenever a perfect matching exists and no structural operation is available (Lemma 3.4, top maintenance; Lemma 3.6, the tight-set alternative, which gives factor-critical contraction when progress is blocked). [1]

**Repairs paid by debt (Section 4).** A repair is an exact flow problem on row-bin incidences, explored first at bins whose debt is large relative to their size (Lemma 4.1, local exact projection). An unexplored boundary bin accepts an optimistic amount of flow; if enough arrives it is explored and an amount proportional to its size is locked in. Total available flow is bounded by the starting debt, so the locks bound the number of vertices examined. If the requested margin is infeasible the repair removes a set of bins instead, and the gap between adjacent margins makes the removal decrease debt in every coarser ledger by an amount proportional to the removed size (Lemmas 4.2 to 4.4). Debt thus pays both for exploration and for removing blocks. Integral cut inequalities turn a point whose total violation is below one into an exact feasibility certificate (Lemma 2.2), and a final local cut recovers the residual source-reachable set the repair needs (Lemma 4.3). Theorem 4.7 is the fixed-parameter subcubic perfect-matching search: for parameters $a\ge1000$, it halts with a checked perfect matching, a negative answer or a suspension, never a false positive, and answers negatively on a graph with a perfect matching with probability at most $2^{-\sigma}S^{-5}$. [1]

**Priced steps (Section 5).** Both the matching objective and the flow tests use one interface: search for a circulation direction with enough objective increase relative to its weighted length, then take a small exact dyadic step (Lemma 5.1). The direction is represented by edges and paths in a changing forest, so a long path is not expanded at every step; signed coordinate changes and absolute motion are recorded separately, the latter controlling when a coordinate must be read and repriced (Lemmas 5.2 to 5.4). The paper credits the use of approximate minimum-ratio circulations as optimisation directions to the almost-linear flow framework of Chen and coauthors. [1][3]

**The cycle backend (Sections 6 to 8).** This is the bulk of the paper, and it is built in full rather than cited. A static routing sparsifier (Section 6) provides short routes whose total use of specified resources is bounded, using the cut-matching structure of Khandekar, Rao and Vazirani and hierarchical random-walk embeddings after Ghaffari, Kuhn and Su. During an interval of updates, a frozen collection of forests (Section 7) decomposes every current circulation into local correction cycles and a circulation in one smaller graph; a hierarchy of routing snapshots limits the new representative edges; prebuilt copies of the paths lift the smaller graph's forest back to the current graph, and when recursive occurrences change at unaffected labels the copies keep their identities, preserving the exact accumulated values the priced-step implementation needs (Section 8). The paper relates this to the fully dynamic minimum-ratio-cycle theorem of Chen and coauthors and to constructions of Rozhoň and coauthors and of Kyng, Meierhans and Probst Gutenberg. [1]

**One uniform program (Section 9).** For each fixed parameter $a$ the ingredients give time $S^{1+O(1/a)+o_a(1)}$ on a reduced graph of size at most $S$. Instruction-level dovetailing over parameters, with summable error budgets, turns the family of fixed-parameter guarantees into the single algorithm and single exponent envelope $\eta$ of Theorem 1.1, with no convergence rate and no input-dependent table of thresholds. Section 10 then reduces $f$-factors to perfect matching by Tutte's incidence-port construction, with rearrangeable networks in place of complete connections so that high-degree hosts do not blow up the instance. [1]

**Where an expert would look first.** At Lemma 3.6, the tight-set alternative, which is where blossom contraction enters and must interact correctly with the ledgers; at Lemma 4.4 and Lemma 4.5, the debt accounting that bounds total work and rules out false stalls; at the correctness of the priced-step interface under forest changes (Lemma 5.3); and at Section 9's dovetailing, which has to make a single program out of infinitely many parameter branches without an explicit rate. The backend of Sections 6 to 8 is long and derivative of known constructions, so a reader could check its interfaces first and its internals later. [1]

## Consequences inside mathematics

If the proof holds, maximum matching in general graphs joins maximum flow and bipartite matching among the problems solvable in almost-linear time, closing the gap that opened in 2022. The $f$-factor corollary extends this to prescribed-degree subgraphs, previously at Gabow's $O(n^{2/3}m)$. The method's new element, the ledger-and-debt repair of a blossom-like state, is a technique rather than a theorem, and whether it extends to weighted matching, which the paper does not treat, is the obvious next question. [1]

## Uses outside mathematics

Matching is used in practice: assigning residents to hospitals, kidney exchanges, pairing jobs with workers, and inside compilers and routers. All of these run Edmonds-type algorithms or specialised solvers at sizes where the new bound's unspecified $o(1)$ exponent and large constants would make it slower, not faster. The result changes what is known to be possible, not what anyone runs; the paper claims no practical use. [1]

## Has anyone checked it?

We found no named computer scientist who has said publicly that they have read or checked the proof. The natural readers, Vazirani, Pettie, Kyng, Probst Gutenberg, Sachdeva and the authors of the almost-linear flow algorithms, have not commented in any source we found. VibeMathed lists the result as unreviewed, "No independent mathematician has checked this yet". The volunteer repository oai-math-revised records three human papers worth comparing against, among them Dani, Hayes and Pettie's September 2026 preprint on regular graphs and Huang and Pettie's bounds for $f$-factors, which the paper's introduction does not cite. [6][7]

**Machine checking.** The release contains no Lean statement for this family: there is no scope note and the paper is not in the catalogue `formalization.yaml`. Everything rests on the written proof. [8]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; this paper is not among them. On 26 October it added two manuscripts and more Lean statements; nothing in this family changed. [9]

## Sources

1. OpenAI, "Almost-Linear-Time Maximum-Cardinality Matching in General Graphs", 24 September 2026. Theorem 1.1, Section 1.1 for the model, Section 1.2 for the context, Section 1.3 for the main ideas and the interface table, Sections 2 to 10. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Almost-Linear-Time-Maximum-Cardinality-Matching-in-Sparse-General-Graphs-September-24-2026/main.pdf
2. Jack Edmonds, "Paths, trees, and flowers", Canadian Journal of Mathematics 17 (1965), 449 to 467; and Silvio Micali and Vijay V. Vazirani, "An $O(\sqrt{|V|}\,|E|)$ algorithm for finding maximum matching in general graphs", 21st IEEE Symposium on Foundations of Computer Science, 1980, 17 to 27. https://doi.org/10.4153/CJM-1965-045-4 and https://doi.org/10.1109/SFCS.1980.12
3. Li Chen, Rasmus Kyng, Yang P. Liu, Richard Peng, Maximilian Probst Gutenberg and Sushant Sachdeva, "Maximum Flow and Minimum-Cost Flow in Almost-Linear Time", 63rd IEEE Symposium on Foundations of Computer Science, 2022. The almost-linear flow algorithm behind bipartite matching. https://arxiv.org/abs/2203.00671
4. Claude Berge, "Two theorems in graph theory", Proceedings of the National Academy of Sciences 43 (1957), 842 to 844. The augmenting-path criterion. https://doi.org/10.1073/pnas.43.9.842
5. Jack Edmonds, "Maximum matching and a polyhedron with 0,1-vertices", Journal of Research of the National Bureau of Standards B 69 (1965), 125 to 130. The matching polytope and odd-set constraints. https://doi.org/10.6028/jres.069B.013
6. oai-math-revised, page for "Almost-Linear-Time Maximum-Cardinality Matching in General Graphs", read 3 November 2026. The comparison papers of Dani, Hayes and Pettie, Huang and Pettie, and Izumi, Kitamura and Yamaguchi. https://mathcommunity.github.io/oai-math-revised/papers/Almost-Linear-Time-Maximum-Cardinality-Matching-in-Sparse-General-Graphs-September-24-2026/
7. VibeMathed, "Maximum-cardinality matching in general graphs in almost-linear time", dataset of 1 November 2026. https://vibemathed.com/problem/almost-linear-general-graph-matching
8. OpenAI, `lean/formalization.yaml` and `lean/docs/` at the pinned commit, which contain no entry for family 120. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/formalization.yaml
9. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
