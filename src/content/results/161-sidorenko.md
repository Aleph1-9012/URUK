---
family: "161"
topic: "Sidorenko’s conjecture"
title: "Is a random graph always the worst case for counting a bipartite pattern?"
paperTitle: "A counterexample to Sidorenko's conjecture"
claim: "Sidorenko's conjecture is false: for the bipartite incidence graph H of 22 triples on 13 points, with 35 vertices and 66 edges, there is a finite simple graph G whose homomorphism density t(H,G) is strictly smaller than p(G)^66, where p(G) is the edge density. The same H disproves the forcing conjecture: at a fixed density p there is a nonconstant kernel with edge density p and H-density exactly p^66."
status: unreviewed
checked: 2026-10-20
papers:
  - preprints/A-counterexample-to-Sidorenkos-conjecture-September-23-2026/paper.pdf
draft: false
---

Take a small pattern graph $H$ and a large graph $G$, and drop the vertices of $H$ onto the vertices of $G$ at random, allowing repeats. The chance that every edge of $H$ lands on an edge of $G$ is the homomorphism density $t(H,G)$. If $G$ is a random graph with edge density $p$, that chance is about $p^{e(H)}$. In 1991 Alexander Sidorenko conjectured, following a question of Erdős and Simonovits about supersaturation, that for every bipartite pattern $H$ the random graph is the worst case: every $G$ of edge density $p$ has at least $p^{e(H)}$ density of copies of $H$. For trees, even cycles and complete bipartite graphs the inequality is classical, and over thirty years it was proved for ever wider classes by Conlon, Fox and Sudakov, Hatami, Szegedy, Li, Kim, Lee, Coregliano, Razborov and others; it became one of the best-known open problems in extremal graph theory, and almost everyone expected it to be true. On 23 September 2026 OpenAI posted a paper claiming a counterexample: a specific bipartite graph on 35 vertices for which the random graph is not the worst case. [1][2][3]

As of 20 October 2026 no mathematician has said publicly that they have read or checked the proof. The status on this page is "unreviewed".

## The problem

For finite simple graphs $H$ and $G$, let $\mathrm{Hom}(H,G)$ be the number of edge-preserving maps from $V(H)$ to $V(G)$, not necessarily injective, and set

$$
t(H,G)=\frac{\mathrm{Hom}(H,G)}{|V(G)|^{|V(H)|}},\qquad p(G)=\frac{2|E(G)|}{|V(G)|^{2}}.
$$

**Sidorenko's conjecture (1991).** For every bipartite $H$ with at least one edge and every $G$, $t(H,G)\ge p(G)^{|E(H)|}$. [1]

**The forcing conjecture (Skokan and Thoma; Conlon, Fox and Sudakov).** For bipartite $H$ containing a cycle, a sequence of graphs with edge density tending to $p$ and $H$-density tending to $p^{|E(H)|}$ must be quasirandom. [1]

## Why it stayed open

What was known. The inequality holds for trees, even cycles, complete bipartite graphs, graphs with a vertex adjacent to the whole other side (Conlon, Fox, Sudakov), hypercubes and all weakly norming graphs (Hatami, after an observation of Szegedy), reflection trees and graphs built by gluing (Li and Szegedy, Szegedy's entropy method), tree-arrangeable graphs (Kim, Lee, Lee), strong tree decompositions and subdivisions (Conlon, Kim, Lee, Lee; Im, Li, Liu), and, by Conlon and Lee, a sufficiently large one-sided blow-up of every bipartite graph. Coregliano and Razborov reduced the host side to biregular kernels. Every result pointed the same way, and no bipartite graph was known to fail. [1]

Why a counterexample is hard to find. A bipartite graph that fails must be "incompressible": none of the gluing, blow-up, or norming arguments may apply to it, and the failing host must be a structured, highly non-random graph whose structure correlates negatively with the pattern. Small candidates are ruled out by the positive theorems, and the deficit, if any, is tiny and must be certified exactly. [1]

## What OpenAI claims

**Theorem 1.1** (OpenAI, 23 September 2026). Let $H$ be the incidence graph of the 22 triples on 13 points in the paper's Table 1, a connected bipartite graph with 35 vertices and 66 edges. There is a finite simple undirected graph $G$ with at least one edge such that

$$
t(H,G)<p(G)^{66}.
$$

[1]

**Corollaries.** Tensor powers of the host make $t(H,F)/p(F)^{66}$ arbitrarily small, with the host density allowed to vary; balanced blow-ups retain a fixed deficit in injective labelled copies at one positive limiting edge density; and at one fixed $p\in(0,1)$ there is a nonconstant symmetric $[0,1]$-valued kernel with mean $p$ and $H$-density exactly $p^{66}$, whose sampled graphs have edge and $H$-densities converging to those values while their four-cycle density converges to something strictly larger than $p^{4}$, which refutes the forcing conjecture. [1]

What this does and does not say. The theorem counts all homomorphisms, repeated images included, which is Sidorenko's formulation. It is an existence statement for $G$, obtained by sampling from a kernel, not an explicit small host. Nothing is said about whether $H$ is the smallest counterexample, or about how far the conjecture fails for other graphs. [1]

## How the claimed proof goes

What follows is a map of the paper's argument from its introduction, which explains the negative correlation in detail, and from the main statements of Sections 2 to 8. It is not a check of the details. [1]

**The statement.** Theorem 1.1: let $H$ be the incidence graph of the $22$ triples on $13$ points listed in the paper's Table 1, a bipartite graph with $35$ vertices and $66$ edges. There is a finite simple graph $G$ with at least one edge such that $t(H,G)<p(G)^{66}$, where $t$ is the homomorphism density and $p$ the edge density. Corollary 1.2 amplifies this: tensor powers make $t(H,F)/p(F)^{66}$ arbitrarily small, and balanced blow-ups give a sequence of hosts with one positive limiting edge density and a fixed deficit in injective labeled copies, which contradicts the Erdős-Simonovits random-graph benchmark in its injective form. Corollary 1.3 draws a consequence for the forcing conjecture. [1]

**The complex (Section 2).** Proposition 2.1 certifies by hand the properties of the triple system that everything uses: every one of its $33$ point pairs lies in exactly two faces and the face-adjacency graph is connected; for each bit position the two classes of $11$ faces each cover all $13$ points and can be ordered so that each face after the first shares a pair with an earlier one and introduces one new point; and colour refinement of $H$, starting with one colour per part, eventually distinguishes all vertices within either part. The double occurrence of every pair is the engine. [1]

**The negative correlation.** Attach a sign $\xi_{ij}$ to each chosen active incidence $(i,j)$ and an independent fair sign $\eta_e$ to each point pair $e$. A finite-field lemma compares an averaged matrix product with a sign model carrying a factor $1+c_0\eta_e\xi_{ij}\xi_{kj}$ whenever both incidences of $e=\{i,k\}$ on a face $j$ are active. If $j,l$ are the two faces containing $e$, averaging over $\eta_e$ gives

$$
\mathbb E_{\eta_e}(1+c_0\eta_e\xi_{ij}\xi_{kj})(1+c_0\eta_e\xi_{il}\xi_{kl})=1+\xi_{ij}\xi_{kj}\xi_{il}\xi_{kl},
$$

while a factor used on only one face averages to $1$. So the model retains the parity of four incidence signs exactly when both face occurrences are selected. This is the finite correlation that the kernel construction turns negative. [1]

**Kernels first (Section 3).** The paper constructs a strict density gap for a finite nonnegative kernel $W(x,y)$ on two finite probability spaces, one for the point side and one for the face side, where the $H$-density is the expectation of the product of $W$ over the $66$ incidences with independent samples, and then transfers the gap to a finite simple graph sampled from a symmetric $[0,1]$-valued kernel built from $W$ and its transpose (Lemma 3.6, transfer to a finite simple host; Proposition 3.5 is the kernel gap). Lemmas 3.1 to 3.4, the rank-layer limit, coordinate expansion, support forcing and pinning by vertex and pair scores, are the steps that identify the limiting density. [1]

**The matrix model (Sections 4 and 5).** The kernel uses one independent coordinate per incidence, each a symmetric matrix over $\mathbb F_q$, $q$ an odd prime, of a large fixed even dimension $D=2r$; a symmetric matrix difference is prescribed to have rank $r$ and a prescribed determinant sign of its nondegenerate quotient form. Half rank is the geometric constraint: when the difference of two point matrices is nonsingular, the two rank-$r$ images through a common centre are complementary (Lemma 4.4), which relates their determinant signs, and on configurations with nonsingular point differences the normalized centre integrals approximate the sign model in averaged $L^{1}$ with uniformly bounded local factors (Lemma 4.5). Lemma 4.6 and Proposition 4.7 show the determinant signs on the $33$ pairs are asymptotically independent, which supplies the $\eta_e$. A "type" names the point or face a sampled vertex is intended to represent; at an incident type pair, two choices of active coordinate set have opposite sign biases, cancelling every nonconstant first sign moment while retaining a signed overlap moment; the chosen supports permit exactly one collection of nonempty pair labels at the intended type assignment, with negative product of overlap moments, and colour-refinement scores make that assignment dominate every other part-preserving type map, repetitions included. Section 5 supplies the Lagrangian counting formulas and the mass of ordered triple orbits that the estimates need. [1]

**Making the product less than one.** The limiting density in one orientation has a negative correction. Adding an inactive point type makes that correction carry a factor $\varepsilon^{13}$, one per point, while the uncontrolled correction in the opposite orientation carries $\varepsilon^{22}$, one per face. Choosing $\varepsilon$ small and then $q$ large makes the product of the two oriented densities less than one, and a crossed product of the rectangular kernel with its transpose gives a symmetric kernel with the same strict deficit. Section 6 proves the local bounds from the planted law (Proposition 6.3, three active incidences; Lemma 6.4, at most two). [1]

**The singular tail (Section 7).** Singular point differences have probability $O(1/q)$, but the normalized rank indicators can grow as a power of $q$, so their weighted contribution needs a separate bound. The graph $\{(v,Xv)\}$ of a symmetric matrix is a Lagrangian subspace of $\mathbb F_q^{D}\oplus\mathbb F_q^{D}$ for the standard symplectic form, and the intersection of two such graphs projects onto the kernel of the difference, so rank defects become intersection dimensions. Proposition 7.1 bounds the probability of each point-intersection profile against the gain from conditioning on intersections with a face centre, using three partitions of the face set; if that does not give decay, a coercivity estimate (Lemma 7.3) forces any large pair intersection to propagate through the connected complex until one pair's extra separation makes the profile too costly; the remaining bounded cases reduce, after fixing $D$, to a short list of integer equalities settled by a strict span inequality (Lemma 7.5), and Proposition 7.7 shows the singular contribution vanishes. All finite parameters are fixed before $q\to\infty$. [1]

Where would an expert look first? At the finite-field comparison and the asymptotic independence of the determinant signs in Section 4; at the domination argument for the intended type assignment, Lemma 3.4; at the $\varepsilon^{13}$ against $\varepsilon^{22}$ count, which is where the two parts of the bipartite graph are treated asymmetrically; and at the singular-tail bound of Section 7. Table 1 and the double-occurrence property can be checked by hand in minutes. [1]

## Consequences inside mathematics

If the proof holds, Sidorenko's conjecture is false and the thirty-year programme of proving it for wider classes becomes a programme of classifying which bipartite graphs satisfy it; the forcing conjecture falls with it, so matching a pattern's density to the random value does not force quasirandomness. The positive theorems all stand, and the smallest counterexample and the largest Sidorenko class become the new questions. The MathOverflow discussion of which release results went against conventional wisdom lists this one. [1][3]

## Uses outside mathematics

No known direct application.

Homomorphism densities are the mathematics of motif counting in networks, and the conjecture says that random networks have the fewest copies of any bipartite motif; the counterexample is a warning that this intuition can fail for structured motifs, not a tool. [1]

## Has anyone checked it?

A MathOverflow question titled "Is Sidorenko's Conjecture false?" asked whether the proof is correct and was closed without an answer that reports a check. A speedrun site tracks claimed improvements to an internal constant in the paper's orbit-counting step, which are themselves unchecked. We found no named mathematician who says they are reading or checking the paper, and no public comment from Sidorenko, Conlon, Fox, Sudakov, Lee, Szegedy, Coregliano or Zhao, whose work it builds on. VibeMathed records no check by an independent mathematician. [4][5]

**Machine checking.** The release's Lean scope note links one statement, `SidorenkoCounterexample.lean`, which constructs a nonempty finite simple host with $t(H,G)<t(K_2,G)^{66}$ for the paper's fixed $H$; the forcing consequence is outside it. The file is not listed in the catalogue `formalization.yaml` at the pinned commit, so no complete formal proof is presented there despite the catalogue's tag. A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval. [6]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; this paper is not among them. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [7]

## Sources

1. OpenAI, "A counterexample to Sidorenko's conjecture", 23 September 2026. Theorem 1.1, the corollaries, "The negative correlation", the history, and Table 1 in "The finite complex". Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/A-counterexample-to-Sidorenkos-conjecture-September-23-2026/paper.pdf
2. David Conlon, Jacob Fox and Benny Sudakov, "An approximate version of Sidorenko's conjecture", Geometric and Functional Analysis 20 (2010), 1354-1366. https://doi.org/10.1007/s00039-010-0097-0
3. MathOverflow, "How many of the results released by OpenAI went against the conventional mathematical wisdom?", question 515849, read 20 October 2026. https://mathoverflow.net/questions/515849
4. MathOverflow, "Is Sidorenko's Conjecture false?", question 515955, closed, read 20 October 2026. https://mathoverflow.net/questions/515955
5. VibeMathed, "Sidorenko's conjecture", read 20 October 2026. https://vibemathed.com/problem/sidorenko-conjecture
6. OpenAI, Lean scope note for family 161 and `lean/formalization.yaml` at the pinned commit, which does not list its comparator. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/161.md and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/formalization.yaml
7. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
