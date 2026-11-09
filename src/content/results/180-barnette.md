---
family: "180"
topic: "Barnette's conjecture"
title: "Can you always tour a polyhedron with even faces and three edges at each corner?"
paperTitle: "Paired states and Hamiltonian cycles in cubic bipartite planar graphs"
claim: "Barnette's conjecture holds: every finite simple cubic bipartite planar 3-vertex-connected graph has a Hamiltonian cycle. The proof gives more: the cycle can be chosen to avoid any prescribed edge, and in every cubic 3-connected Pfaffian bipartite graph every three-edge path lies in a Hamiltonian cycle."
status: unreviewed
checked: 2026-10-20
papers:
  - preprints/Paired-states-and-Hamiltonian-cycles-in-cubic-bipartite-planar-graphs-September-24-2026/paper.pdf
draft: false
---

Take a convex polyhedron in which exactly three edges meet at every corner and every face has an even number of sides, like a cube or a hexagonal prism. Can you always walk along its edges, visiting every corner exactly once, and return to where you started? In 1884 Tait conjectured that every polyhedron with three edges per corner has such a tour, which would have proved the four-colour theorem; Tutte found a counterexample in 1946. David Barnette asked in 1969 whether the tour exists once the faces are also required to have even length, which in graph terms means the graph is bipartite. Goodey proved it in 1975 when all faces are squares or hexagons, Feder and Subi relaxed one of three face classes in 2006, Kardoš settled the related Barnette-Goodey conjecture for faces of at most six sides in 2020, and Schnieders proved the case of faces with at most eight sides in 2025; computers had checked every graph up to a few dozen vertices. On 24 September 2026 OpenAI posted a nine-hundred-line paper claiming the conjecture in full. [1][2][3]

As of 20 October 2026 no mathematician has said publicly that they have read or checked the proof. The status on this page is "unreviewed".

## The problem

A graph is cubic if every vertex has degree three, bipartite if its vertices split into two classes with no edge inside a class, and 3-vertex-connected if it has at least four vertices and stays connected after deleting any two. Planar 3-connected graphs are exactly the skeletons of convex polyhedra, by Steinitz's theorem, and bipartite means all faces have even length. A Hamiltonian cycle visits every vertex exactly once. [1]

**Barnette's conjecture (1969).** Every cubic bipartite planar 3-vertex-connected graph has a Hamiltonian cycle. [1]

<!-- uruk:visual-note
A visual for this page is the graphs themselves: the cube, the hexagonal prism and a larger cubic bipartite polyhedron drawn in the plane, each with a Hamiltonian cycle traced; the dual picture, a triangulation with triangles coloured black and white and its vertices split into two induced trees whose boundary is the cycle; and a reader-drawn graph tested for the property. The paper has one TikZ figure. [1]
-->

## Why it stayed open

Why it is hard. A cubic graph has a spanning subgraph of degree two if and only if it has a perfect matching, and bipartite cubic graphs always do, so one easily gets a collection of disjoint cycles covering all vertices. The difficulty is to make it a single cycle: local modifications that merge two cycles may split others, and no face-by-face induction had worked beyond small face sizes. Barnette's conjecture is also known to be equivalent to several apparently stronger statements, for instance that the cycle may be required to avoid any given edge, which is what the paper proves. [1]

## What OpenAI claims

**Theorem** (OpenAI, 24 September 2026). Every finite simple undirected graph that is cubic, bipartite, planar, and 3-vertex-connected has a Hamiltonian cycle. [1]

**Strengthenings.** The dual partition theorem puts the endpoints of any chosen facial edge in one class and the edge's third triangle vertex in the other, so the Hamiltonian cycle can be chosen to avoid any single prescribed edge, which Kelmans, Hertel, and Gorsky, Steiner and Wiederrecht showed is equivalent to the conjecture; and through an equivalence of Gorsky, Steiner and Wiederrecht, every three-edge path in a finite simple cubic 3-vertex-connected Pfaffian bipartite graph lies in a Hamiltonian cycle. [1]

What this does and does not say. The argument is an existence proof through a finite weighted sum; it "does not assert a polynomial-time construction of the cycle" and places no bound on the order or face lengths. Nothing is claimed about Tait's original setting without bipartiteness, where Tutte's counterexample stands. [1]

## How the claimed proof goes

What follows is a map of the paper's argument, which is short enough to have been read in full. It is not a check of the details. [1]

**The dual problem (Section 2).** The dual of a cubic bipartite planar graph is a triangulation $T$ of the sphere whose faces are coloured black and white with opposite colours across every edge, since each original vertex becomes a triangle and the bipartition colours them. By a formulation going back to Stein and made precise by Alt, Payne, Schmidt and Wood, a Hamiltonian cycle in the original graph corresponds to a partition of the vertices of $T$ into two sets each inducing a tree (Lemma 2.1 and Theorem 2.2), where "induced" means every edge of $T$ between vertices of the set is included, so connectedness alone is not enough. The theorem is proved in the stronger form with a prescribed face $t_0$ and a prescribed edge $e_0$ of it, which is what makes the induction over separating triangles close. [1]

**States and pairs (Section 3).** Choose one black triangle $t_0$ as the outer face; its three vertices are the roots, and the remaining black triangles $A$ and the non-root vertices $X$ are equal in number by Euler's formula. A state is a bijection assigning to each $t\in A$ one of its vertices, using every non-root exactly once; these are Tutte's states from his theory of trinity. A pair $(r,s)$ is two states that disagree at every triangle. Proposition 3.1 shows a pair exists when $T$ has no separating triangle, by max-flow: it suffices that $\sum_{t\in A}\min(2,|V(t)\cap S|)\ge2|S|$ for every $S\subseteq X$, which after rewriting in terms of the complement $U$ becomes $e(U)-b(U)\le2|U|-4$, an inequality proved component by component by Euler's formula and a signed edge-side count showing that a face region of length $d$ has colour imbalance at most $d-4$. An integral flow of value $2|X|$ in the incidence network gives a degree-two subgraph, which splits into two perfect matchings. [1]

**The disk identity (Lemma 4.1).** For adjacent $v,w$ let $\delta(v,w)=\pm1$ according to whether the black face of the edge is on the left when traversed from $v$ to $w$. If $r$ is a state and in each $t\in A$ one edge is directed from $r(t)$ to another vertex of $t$, then every simple directed cycle of chosen edges avoids the roots and has $\delta$-sum exactly $-3$ if counterclockwise and $3$ if clockwise. The proof counts the disk bounded by the cycle: Euler gives $B+W=2I+h-2$ for the black and white faces, interior vertices and cycle length; signed side counting gives $3(B-W)=2l-h$ with $l$ the boundary edges whose black face is inside; and the state supplies $B=I+l$, because every interior vertex is matched to a black face inside the disk, a boundary vertex is matched to the black face of its outgoing edge, inside in exactly the $l$ counted cases, and the bijection prevents double counting. Together these force $2l-h=-3$. The paper stresses that this is more than a colour imbalance: the state bijection fixes exactly how many black faces lie inside a directed cycle. [1]

**One sum, two ways (Section 5).** For a state $s$ let $Q_s$ be the spanning subgraph consisting of the edge opposite $s(t)$ in each $t\in A$. Proposition 5.1: some pair has $Q_s$ a forest. Assign real weights $a(t,v)$ to incidences, set $\omega(s)=\sum_ta(t,s(t))$, and for a pair direct the edge in $t$ from $r(t)$ to $s(t)$; these edges form a union $D$ of vertex-disjoint simple cycles on $X$, and by the disk identity $J(r,s)=\frac13\sum_t\delta(r(t),s(t))$ is an integer. Consider

$$
Z(x)=\sum_{(r,s)\text{ pair}}i^{J(r,s)}e^{x\omega(s)}.
$$

Cancellation (Lemma 5.2): fix $s$ with $Q_s$ cyclic and choose a cycle in $Q_s$ using $s$ alone; orienting opposite edges from $r(t)$ to the third vertex $u(t)$, the chosen cycle must be directed, and replacing $r(t)$ by $u(t)$ along it gives a new partner $\tilde r$ of $s$; this is a fixed-point-free involution that reverses the cycle, and the disk identity gives $J(\tilde r,s)-J(r,s)=\pm2$, so $i^{J}$ flips sign while $e^{x\omega(s)}$ is unchanged. All terms with cyclic $Q_s$ cancel. Nonvanishing: group pairs instead by the undirected edge set $D$, as in double-dimer expansions; its group consists of the independent orientations of its cycles. Lemma 5.3 chooses the weights $a(t,v)$ as positive spoke circulations, prescribing circulation one on every bounded face of the spoke graph, so that every counterclockwise simple spoke cycle has strictly positive weight; sliding each cycle edge across its black triangle onto the two-spoke route shows $L_+(C)-L_-(C)>0$, the counterclockwise orientation of each cycle $C$ of $D$ being strictly heavier. Each cycle contributes $-i$ or $i$ to the phase by the disk identity, so the group contributes $\prod_C(-ie^{xL_+(C)}+ie^{xL_-(C)})$, which vanishes to exactly first order per cycle; in the smallest occurring number of cycles $c_{\min}$, every contributing group has phase $(-i)^{c_{\min}}$ and a strictly positive real magnitude $\prod_C(L_+(C)-L_-(C))$, and groups with more cycles have no term of that degree. So the Taylor coefficient of $Z$ in degree $c_{\min}$ is nonzero, $Z\not\equiv0$, and a pair with $Q_s$ a forest exists. [1]

**From forest to cycle (Section 6).** A forest state has one root in each of three components (Lemma 6.1); plane-tree duality turns it into a tree on the white faces that selects one edge at every face, with the prescription at $t_0$ entering through the root; the disk identity proves the selected edges acyclic (Lemma 6.2); their complementary dual is connected with degree two everywhere, and its two sides are the required induced trees. [1]

**Separating triangles (Section 7).** Induct on the number of vertices. Split along a separating $3$-cycle into two smaller sphere triangulations, each capped by a triangle; signed side counting shows the three boundary signs are equal, so the face colouring extends to the caps. Apply induction to the piece containing $t_0$; on its cap both tree labels occur, since a monochromatic cap would be a cycle in an induced tree; prescribe the same-label edge of the cap in the other piece, apply induction, and rename labels to agree. For each label the two induced trees meet in a vertex or an edge, so their union is an induced tree in $T$. Corollaries 7.1 and 7.2 give edge-avoidance and prescribed paths in Pfaffian graphs. The paper notes the kinship with Temperley's correspondence and the double-dimer model and says "neither cited correspondence is an input". [1]

Where would an expert look first? At the disk identity, specifically the matching count $B=I+l$, which is the one place the state bijection does real work; at the claim that the reversal involution in Lemma 5.2 leaves $\omega(s)$ unchanged and changes $J$ by exactly $\pm2$; at the isotopy argument that the spoke detour of a cycle stays simple and counterclockwise; and at the acyclicity of the selected edges in Lemma 6.2. The paper is short, under 850 lines of source, and can be read in full. [1]

## Consequences inside mathematics

If the proof holds, a question open since 1969 and tied to the four-colour theorem's history is settled, the partial results of Goodey, Feder and Subi, Kardoš and Schnieders are superseded, and the equivalent strengthenings catalogued by Gorsky, Steiner and Wiederrecht all hold, including the Pfaffian-path statement. The method, a cancelling exponential sum over Tutte states, is new to the problem and may apply to other Hamiltonicity questions. [1][3]

## Uses outside mathematics

No known direct application.

Hamiltonian cycles in cubic planar graphs model closed tours in networks and the design of closed paths on polyhedral surfaces; the theorem guarantees existence but gives no algorithm. [1]

## Has anyone checked it?

We found no named mathematician who says they are reading or checking this paper, and no public comment from Kardoš, Schnieders, Wood, Steiner or Wiederrecht, whose work it builds on. VibeMathed records no check by an independent mathematician. [4]

**Machine checking.** The release's Lean scope note links one statement, `BarnetteHamiltonian.lean`, asserting a Hamiltonian cycle for every such graph. It is not listed in the catalogue `formalization.yaml` at the pinned commit, so no complete formal proof is presented there despite the catalogue's tag. A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval. [5]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; this paper is not among them. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [6]

## Sources

1. OpenAI, "Paired states and Hamiltonian cycles in cubic bipartite planar graphs", 24 September 2026. The theorem, the history, "The dual problem and the proof strategy". Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Paired-states-and-Hamiltonian-cycles-in-cubic-bipartite-planar-graphs-September-24-2026/paper.pdf
2. P. R. Goodey, "Hamiltonian circuits in polytopes with even sided faces", Israel Journal of Mathematics 22 (1975), 52-56. https://doi.org/10.1007/BF02757273
3. Maximilian Gorsky, Raphael Steiner and Sebastian Wiederrecht, "Matching theory and Barnette's conjecture", Discrete Mathematics 346 (2023), 113249. https://doi.org/10.1016/j.disc.2022.113249
4. VibeMathed, "Barnette's conjecture", read 20 October 2026. https://vibemathed.com/problem/barnette-conjecture
5. OpenAI, Lean scope note for family 180 and `lean/formalization.yaml` at the pinned commit, which does not list its comparator. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/180.md and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/formalization.yaml
6. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
