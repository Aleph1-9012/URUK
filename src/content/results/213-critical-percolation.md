---
family: "213"
topic: "Percolation at criticality"
title: "At the tipping point, does the random grid already reach infinity?"
paperTitle: "No percolation at criticality on quasi-transitive graphs"
claim: "On every infinite, connected, locally finite, quasi-transitive graph whose critical probability is below one, critical Bernoulli bond percolation almost surely has no infinite cluster. A companion paper proves the same for both bond and site percolation on the cubic lattice."
status: unreviewed
checked: 2026-10-17
papers:
  - preprints/No-percolation-at-criticality-on-quasi-transitive-graphs-September-24-2026/paper.pdf
  - preprints/Critical-bond-and-site-percolation-on-the-cubic-lattice-September-24-2026/paper.pdf
draft: false
visual: glued-clusters
---

Build an endless grid of points. For each link between neighbouring points, toss a biased coin: keep the link with probability $p$, delete it otherwise. When $p$ is small, every connected piece of what survives is finite. When $p$ is large, one piece runs off to infinity. In between sits a sharp tipping point, the critical probability. The question this family answers is what happens exactly there. Does an infinite piece already exist at the threshold, or does it appear only once the threshold is passed? Benjamini, Lyons, Peres and Schramm called this "the main long-standing open question in percolation theory". It had been answered for flat grids in 1980 and for grids of eleven or more dimensions in 2017, and for nothing in between, including the three-dimensional grid that models real materials. [3]

The answer is no, according to two OpenAI papers dated 24 September 2026: no infinite piece on the cubic grid, and none on any graph with enough symmetry. Part of this was not new. On 28 August, Justin Leder of Anthropic had published a machine-checked proof for the cubic grid and every other grid $\mathbb Z^{d}$, and both OpenAI papers credit it. What is new is the general theorem, which covers every sufficiently symmetric graph at once. [1][2][12]

As of 17 October 2026, no mathematician has said publicly that they have checked either OpenAI paper. The status on this page is "unreviewed".

## The problem

A graph is a set of points, called vertices, joined by links, called edges. The cubic lattice $\mathbb Z^{3}$ has a vertex at every point with whole-number coordinates and an edge between any two vertices at distance one, so every vertex has six neighbours. Fix $p$ between $0$ and $1$. Independently for every edge, keep it with probability $p$ and delete it otherwise. Kept edges are called open. The result is a random graph, and the model is called Bernoulli bond percolation. The open cluster of a vertex is the set of vertices it can reach along open edges. [1][3]

The name comes from Broadbent and Hammersley, who introduced the model in 1957 to describe a fluid seeping through a porous stone. Open edges are channels. The question was whether the fluid can get arbitrarily far from where it entered. [4]

Write $\theta(p)$ for the probability that the origin belongs to an infinite open cluster. Keeping more edges can only help, so $\theta$ never decreases as $p$ grows. The critical probability is the point where it first becomes positive:

$$
p_c=\inf\{p\in[0,1]:\theta(p)>0\}.
$$

Below $p_c$ every cluster is finite with probability one. Above it an infinite cluster exists with probability one. On the square grid $\mathbb Z^{2}$ the threshold for bond percolation is exactly $p_c=\tfrac12$, a theorem of Kesten from 1980. On the cubic grid nobody knows an exact value. Rigorous computer-assisted intervals put the bond threshold between $0.2485$ and $0.2490$ and the site threshold, defined below, between $0.3110$ and $0.3118$. [3][6][16]

The question is what happens at $p=p_c$ exactly. Is $\theta(p_c)=0$? A 1987 theorem of Aizenman, Kesten and Newman, which shows that the infinite cluster is unique whenever it exists, implies that $\theta$ is continuous at every $p$ except possibly $p_c$. So the question is the same as asking whether the transition is continuous, with the infinite cluster growing from nothing, or whether it appears with a jump. [3][17]

Two variations matter here. In site percolation the vertices, not the edges, are kept with probability $p$, and an open path must pass only through open vertices. And the grid can be replaced by any graph with enough symmetry. A symmetry of a graph is a way of relabelling its vertices that preserves which pairs are joined. A graph is quasi-transitive if its symmetries divide the vertices into finitely many types, so that the graph looks the same, up to finitely many choices, from every vertex. Every lattice is quasi-transitive, and so is every Cayley graph of a finitely generated group. Locally finite means each vertex has finitely many edges. The condition $p_c<1$ rules out graphs such as a single infinite line, where one missing edge cuts the line in two and the only way to percolate is to keep everything. [1]

<!-- uruk:visual-note
A visual for this page can sample a box of the cubic grid, let the reader move $p$ through $0.25$, and colour the largest cluster. It shows the change in connectivity. It cannot show an infinite cluster, because any computer picture is finite, and a large cluster spanning a finite box at $p_c$ is fully consistent with the theorem.
-->

## Why it stayed open

### Seventy years of the question

In two dimensions the problem is old and settled. Harris proved in 1960 that $\theta(\tfrac12)=0$ on the square grid, and Kesten's 1980 proof that $p_c=\tfrac12$ completed the bond case. Russo treated site percolation on the square grid in 1981. All of these arguments use planarity. In the plane, a closed loop of missing edges around a vertex blocks every path out, and such loops are what the proofs count. There is no analogue in three dimensions, where a path can go around any surface. [2][5][6]

In very high dimensions a different method works. Hara and Slade's lace expansion of 1990 showed that critical percolation behaves like its mean-field approximation, in which the geometry hardly matters, once the dimension is large enough. Fitzner and van der Hofstad pushed the nearest-neighbour bond case down to $d\ge11$ in 2017. Mean-field behaviour cannot hold in dimensions five and below, so this method could not reach the cubic grid even in principle. [3][7][8]

The dimensions in between resisted. Grimmett and Marstrand proved in 1990 that thick slabs of the lattice have thresholds converging to the full one, and Duminil-Copin, Sidoravicius and Tassion proved in 2016 that critical percolation on each fixed slab has no infinite cluster. As both OpenAI papers note, those two facts together still do not give the full lattice. Hugo Duminil-Copin built his 2018 ICM lecture, "Sixty years of percolation", around this problem. [2][3][18]

Benjamini and Schramm widened the question in 1996. Their paper "Percolation beyond $\mathbb Z^{d}$" collected conjectures for general symmetric graphs, and its Conjecture 4 asks for $\theta(p_c)=0$ on every quasi-transitive graph with $p_c<1$. Progress came in pieces. Benjamini, Lyons, Peres and Schramm proved it in 1999 for nonamenable graphs with a unimodular symmetry group. Tom Hutchcroft proved it in 2016 for every quasi-transitive graph of exponential growth, meaning the number of vertices within distance $r$ of a point grows like $c^{r}$ for some $c>1$. Hermon and Hutchcroft added certain groups of intermediate growth in 2021. Graphs that grow more slowly than exponentially, a class that includes every lattice, remained open in general. [1][9][10]

In 2024 Gady Kozma and Shahaf Nitzan proposed a route. They conjectured a correlation inequality for percolation on arbitrary finite graphs and proved that even its weakest version, their Conjecture 3, would give $\theta(p_c)=0$ on $\mathbb Z^{d}$ for every $d\ge2$. Gil Kalai wrote that the conjecture "was so general that many of us expected a counterexample to be discovered before long". [11][13]

Then events moved fast. On 28 August 2026 Justin Leder of Anthropic committed a public Lean development, generated with Anthropic's language models, that proves Kozma and Nitzan's Conjecture 3 and so $\theta(p_c)=0$ for bond percolation on $\mathbb Z^{d}$ in every dimension $d\ge2$. Kalai blogged about it on 3 September. Expositions produced by AI systems prompted by Ahmed Bou-Rabee, posted on 5 September, extended the argument to site percolation for $d\ge3$. Scientific American reported the result on 30 September. On 7 October, the day after OpenAI's release, Arthur Blanc-Renaudie posted a nine-page human-written proof of the Kozma-Nitzan inequalities, reconstructed from the AI's ideas. [12][13][14][15][22]

So by the time OpenAI's papers appeared on 6 October, the cubic bond case had already been claimed, with a formal proof, by another lab. The general theorem had not.

## What OpenAI claims

**Theorem 1.1** (OpenAI, "No percolation at criticality on quasi-transitive graphs", 24 September 2026). Let $G$ be an infinite, connected, locally finite, quasi-transitive graph. If $p_c(G)<1$, then

$$
\mathbb P_{p_c(G)}(\text{there is an infinite open cluster})=0.
$$

Equivalently, every vertex has probability zero of lying in an infinite cluster at $p_c$. A corollary records the case of $\mathbb Z^{d}$ for every $d\ge2$. The paper describes this as resolving the Benjamini-Schramm criticality conjecture "positively for Bernoulli bond percolation". [1]

**Theorem 1.1** (OpenAI, "Critical bond and site percolation on the cubic lattice", 24 September 2026). Nearest-neighbour bond percolation on $\mathbb Z^{3}$ has almost surely no infinite cluster at its critical parameter, and so does nearest-neighbour site percolation at its own critical parameter. [2]

What these do and do not say. The general theorem is about bond percolation; it does not settle the site form of the conjecture on general quasi-transitive graphs. The cubic paper's site statement is not a corollary of the bond theorem, because, in the paper's words, "independent site bits become independent hyperedges, and their endpoint convention must be preserved". Neither paper computes $p_c$, a critical exponent or a rate of decay. Both papers state the earlier work plainly. The cubic paper says Leder's formal account "reports critical bond nonpercolation on every nearest-neighbor lattice", that its key comparison "already implies the finite joint connection inequality for bonds", and that its own purpose is "a self-contained cubic argument". What is new relative to August is the general graph theorem, which covers every slow-growing symmetric graph at once. [1][2][3]

## How the claimed proof goes

What follows is a map of the two papers, built from their introductions and section structure. It is not a check of the details. [1][2]

**One finite inequality.** Both papers rest on a statement about connections in a finite random graph. Say the walk starts at a vertex $o$, must pass through some set $A$ of relay vertices, and aims at a target set $T$. The inequality says that if every relay reaches the target with high probability, then reaching the relays almost guarantees reaching the target:

$$
\mathbb P(o\leftrightarrow A,\ o\leftrightarrow T)\ \ge\ \mathbb P(o\leftrightarrow A)\,\min_{a\in A}\mathbb P(a\leftrightarrow T).
$$

If each relay reaches $T$ with probability at least $1-b$, the chance of reaching the relays but missing $T$ is at most $b$. Taking the target to be a single vertex recovers the multiplicative gluing inequality that Kozma and Nitzan conjectured. The cubic paper proves it for independent hyperedges, which handles bond and site percolation together, and shows that it keeps holding after any set of bits has been revealed. That last property is what lets it be used inside a step-by-step exploration, where later choices depend on what has been seen. [2][11]

**The shape of the contradiction.** Suppose an infinite cluster exists at $p_c$. Then large finite boxes connect to far-away pieces of their surroundings with probability close to one. Each such event depends on finitely many edges, and a probability that depends on finitely many edges changes continuously with $p$, so the same estimates still hold at some $q$ slightly below $p_c$. The proof then uses them to build an infinite cluster at $q$. That contradicts the definition of $p_c$. So no infinite cluster can exist at $p_c$. [2]

**The cubic grid.** Here is how the building works on $\mathbb Z^{3}$. Seed boxes connect, with high probability, to each of the 24 quarter-faces of a surrounding cube. A sequence of thirteen elementary geometric moves passes a connection from the inner box of one coarse cube to that of its neighbour, using the finite inequality to extend through fresh territory. The coarse cubes are indexed by a copy of the plane, and an exploration visits them one at a time while keeping each untested cube's conditional chance of success high. A planar counting argument then shows that with positive probability infinitely many cubes succeed. The architecture follows Grimmett and Marstrand's 1990 renormalisation. [2][18]

**General graphs.** The quasi-transitive paper splits by how fast balls in the graph grow. Exponential growth is Hutchcroft's 2016 theorem, used whole. If the growth is slower than exponential but faster than every polynomial, the paper argues that two large clusters must sit close together, repeatedly bisects a path between them until they are adjacent, and contradicts a bound saying that two distinct clusters of size at least $s$ on either side of a fixed edge have probability at most $Cs^{-1/2}$. Relative entropy controls the cost of the adaptive search. If the growth is polynomial along some sequence of radii, a structure theorem of Tessera and Tointon supplies a nilpotent group acting on the graph and two integer coordinates. The paper then lays corridors along those coordinates and runs the same kind of gluing exploration as on the cubic grid. [1][10][19]

Where would an expert look first? At the conditional form of the gluing inequality, because high marginal probabilities alone do not give coarse percolation and the exploration must reveal only the bits each step needs. Then at the two-cluster bound and its entropy accounting, in the 505-line section `two-cluster-dfs-entropy.tex`. Then at the structural step that lifts the Tessera-Tointon quotient back to the original graph, in `structure.tex`. [1][20]

## Consequences inside mathematics

On the cubic grid the theorem means $\theta(p)\to0$ as $p$ decreases to $p_c$: the infinite cluster grows continuously from nothing. The cubic paper derives this in a paragraph. Most of the critical exponents, the power laws physicists use to describe percolation near $p_c$, are only well defined if the transition is continuous, so the theorem is a precondition for that theory rather than a new prediction within it. The general theorem settles one of the central conjectures of Benjamini and Schramm's 1996 programme for bond percolation. Family 214 in the same release claims another, $p_c<p_u$ on nonamenable graphs. That is a separate paper and is not covered here. [1][2][3][9]

## Uses outside mathematics

No known direct application.

Percolation is a working model in physics and materials science, which is where Broadbent and Hammersley started. But physicists have long assumed that the transition is continuous, and the theorem does not compute a threshold, an exponent or a probability that anyone could compare with an experiment. It confirms an assumption rather than changing a number. [3][4]

## Has anyone checked it?

We found no named mathematician who says they are reading or checking either OpenAI paper. VibeMathed, a database that tracks AI-produced results, records for the quasi-transitive theorem that "No independent mathematician has checked this yet". An expository article on the family states that it "is not an independent verification of the complete proofs". [20][21]

The leading expert on the problem has reacted in public without reporting a check. The Hindu reported that Hugo Duminil-Copin, who won the 2022 Fields Medal for his work on phase transitions and whose ICM lecture was built around this problem, told a French Mathematical Society video call on 8 October that years of his research agenda had been "wiped out", that sixteen of the claimed results answered questions he had spent years trying to solve, and that his field had been "annihilated". The report does not say which results he meant or whether he has read any of the proofs. We record it as a reaction, not a review. [25]

The lattice statement has a separate and more advanced record, and it is important not to blur the two. The Anthropic development by Leder proves $\theta(p_c)=0$ on $\mathbb Z^{d}$ through Kozma and Nitzan's reduction, by an argument different from OpenAI's in its details. Blanc-Renaudie's human-written notes of 7 October reconstruct the key inequalities from that AI work and describe the state of checking frankly: "Even the specialists who checked the proof were unsure about the details or why the proof works as a whole." That is real human engagement with the theorem on lattices. It is not a reading of OpenAI's manuscripts, and it says nothing about the general quasi-transitive theorem, which is the new part of this family. [12][14]

**Machine checking.** The release has Lean statements for both theorems. `CriticalPercolation.lean` is 63 lines and self-contained. It defines a graph with labelled bonds, allowing loops and parallel bonds, local finiteness counted by bonds, quasi-transitivity as finitely many vertex orbits under automorphisms, the product Bernoulli law from Mathlib, and $p_c$ as an infimum, and it states that the probability of an infinite cluster at $p_c$ is zero when $p_c<1$. `CriticalZ3.lean`, also 63 lines, states the cubic bond and site theorem. The formal proofs run to about 630 and 34 files. The release's catalogue `formalization.yaml` lists the cubic statement but not the general one, which we found only through the family's scope note. We found no outside replay of either. A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval. [23]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; none of them is in this family, and neither Lean statement changed. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [24]

## Sources

1. OpenAI, "No percolation at criticality on quasi-transitive graphs", 24 September 2026. Theorem 1.1, the corollary in the section "Completion and the lattice consequence", Sections 1.1 and 1.2. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/No-percolation-at-criticality-on-quasi-transitive-graphs-September-24-2026/paper.pdf
2. OpenAI, "Critical bond and site percolation on the cubic lattice", 24 September 2026. Theorem 1.1, the history paragraph and proof overview in Section 1. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Critical-bond-and-site-percolation-on-the-cubic-lattice-September-24-2026/paper.pdf
3. Wikipedia, "Dying percolation conjecture", read 17 October 2026. Definitions, the equivalent continuity formulation, the Benjamini et al. quotation, Duminil-Copin's ICM framing, the high-dimensional results and the physicists' expectation. https://en.wikipedia.org/wiki/Dying_percolation_conjecture
4. S. R. Broadbent and J. M. Hammersley, "Percolation processes. I. Crystals and mazes", Proceedings of the Cambridge Philosophical Society 53 (1957), 629-641. https://doi.org/10.1017/S0305004100032680
5. Theodore E. Harris, "A lower bound for the critical probability in a certain percolation process", Proceedings of the Cambridge Philosophical Society 56 (1960), 13-20. https://doi.org/10.1017/S0305004100034241
6. Harry Kesten, "The critical probability of bond percolation on the square lattice equals 1/2", Communications in Mathematical Physics 74 (1980), 41-59. https://doi.org/10.1007/BF01197577
7. Takashi Hara and Gordon Slade, "Mean-field critical behaviour for percolation in high dimensions", Communications in Mathematical Physics 128 (1990), 333-391. https://doi.org/10.1007/BF02108785
8. Robert Fitzner and Remco van der Hofstad, "Mean-field behavior for nearest-neighbor percolation in d > 10", Electronic Journal of Probability 22 (2017), paper 43. https://doi.org/10.1214/17-EJP56
9. Itai Benjamini and Oded Schramm, "Percolation beyond Z^d, many questions and a few answers", Electronic Communications in Probability 1 (1996), 71-82, Conjecture 4. https://doi.org/10.1214/ECP.v1-978
10. Tom Hutchcroft, "Critical percolation on any quasi-transitive graph of exponential growth has no infinite clusters", Comptes Rendus Mathématique 354 (2016), 944-947. https://doi.org/10.1016/j.crma.2016.07.013
11. Gady Kozma and Shahaf Nitzan, "A reduction of the θ(p_c)=0 problem to a conjectured inequality", arXiv, January 2024. https://arxiv.org/abs/2401.12397
12. Justin Leder, "θ(p_c)=0 for Bernoulli bond percolation on Z^d in all dimensions d ≥ 2: a guide to the Lean formalization", anthropics/formal-math at commit 795efb8, August 2026. https://github.com/anthropics/formal-math/blob/795efb86f191735c5481675763537cfb4ff37e55/percolation/summary.pdf
13. Gil Kalai, "Amazing: There is no Percolation at the Critical Probability in all Dimensions", Combinatorics and more, 3 September 2026. https://gilkalai.wordpress.com/2026/09/03/amazing-there-is-no-percolation-at-the-critical-probability-in-all-dimensions-solved-by-ai-via-a-conjecture-of-gady-kozma-and-shahaf-nitzan/
14. Arthur Blanc-Renaudie, "Notes on Kozma and Nitzan's proof of θ(p_c)=0", arXiv, 7 October 2026. https://arxiv.org/abs/2610.10502
15. Expositions produced by AI systems prompted by Ahmed Bou-Rabee, updated 5 September 2026: on the Kozma-Nitzan inequalities, https://nitromannitol.github.io/kn1-verification-b80e9/ and on site percolation, https://nitromannitol.github.io/site-percolation-7d3f2/
16. N. Ball, "Rigorous confidence intervals on critical thresholds in 3 dimensions", arXiv, 2013. The bond and site intervals at 99.9999% confidence. https://arxiv.org/abs/1312.0961
17. M. Aizenman, H. Kesten and C. M. Newman, "Uniqueness of the infinite cluster and continuity of connectivity functions for short and long range percolation", Communications in Mathematical Physics 111 (1987), 505-531. https://doi.org/10.1007/BF01219071
18. G. R. Grimmett and J. M. Marstrand, "The supercritical phase of percolation is well behaved", Proceedings of the Royal Society A 430 (1990), 439-457, https://doi.org/10.1098/rspa.1990.0100 ; and Hugo Duminil-Copin, Vladas Sidoravicius and Vincent Tassion, "Absence of infinite cluster for critical Bernoulli percolation on slabs", Communications on Pure and Applied Mathematics 69 (2016), 1397-1411, https://doi.org/10.1002/cpa.21641
19. Romain Tessera and Matthew C. H. Tointon, "A finitary structure theorem for vertex-transitive graphs of polynomial growth", Combinatorica 41 (2021), 263-298. https://doi.org/10.1007/s00493-020-4295-6
20. Latent seminar, "Critical percolation and finite connection inequalities", explanatory article on family 213, read 17 October 2026. https://lowrank.github.io/latent-seminar/OpenAI-Math/213-critical-percolation
21. VibeMathed, "The Benjamini-Schramm criticality conjecture for bond percolation on quasi-transitive graphs", read 17 October 2026. https://vibemathed.com/problem/benjamini-schramm-criticality-bond
22. Manon Bischoff, "AI solves a 'holy grail' problem from probability theory", Scientific American, 30 September 2026. https://www.scientificamerican.com/article/ai-solves-a-holy-grail-problem-from-probability-theory/
23. OpenAI, comparator statements `CriticalPercolation.lean` and `CriticalZ3.lean` and the scope note for family 213 at the pinned commit. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/CriticalPercolation.lean , https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/CriticalZ3.lean and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/213.md
24. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
25. Jacob Koshy, "As inscrutable AI proofs emerge, mathematicians wait in the dark", The Hindu, 16 October 2026. Duminil-Copin's remarks to the French Mathematical Society on 8 October. https://www.thehindu.com/sci-tech/science/openai-as-inscrutable-ai-proofs-emerge-mathematicians-wait-in-the-dark/article71587373.ece
