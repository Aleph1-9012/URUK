---
family: "165"
topic: "Crossing numbers of complete graphs"
title: "Join every dot to every other dot. How few times must the lines cross?"
paperTitle: "The crossing number of complete graphs"
claim: "For every n ≥ 3 the crossing number of the complete graph K_n is ¼⌊n/2⌋⌊(n−1)/2⌋⌊(n−2)/2⌋⌊(n−3)/2⌋, and for all m, n ≥ 1 the crossing number of the complete bipartite graph K_{m,n} is ⌊m/2⌋⌊(m−1)/2⌋⌊n/2⌋⌊(n−1)/2⌋. The classical drawings are optimal among all drawings with continuous edges."
status: unreviewed
checked: 2026-10-18
papers:
  - preprints/The-crossing-number-of-complete-graphs-September-23-2026/paper.pdf
  - preprints/The-crossing-number-of-complete-bipartite-graphs-September-23-2026/paper.pdf
draft: false
---

In 1944 Pál Turán was doing forced labour in a brick factory near Budapest. Bricks were moved on rail trucks from kilns to storage yards, every kiln was connected to every yard, and wherever two rails crossed the trucks jumped and bricks fell. He asked how the rails could be laid to minimize the crossings. That is the crossing number of the complete bipartite graph: $m$ kilns, $n$ yards, every kiln joined to every yard, drawn in the plane with as few crossings as possible. Zarankiewicz published a drawing and a formula in 1955 and claimed it was optimal, but his proof had a gap, and the formula became a conjecture. Harary and Hill asked the matching question for the complete graph, every dot joined to every other, in 1963, with a formula from Hill's drawings. Both formulas have been checked for small cases and believed for sixty years. On 23 September 2026 OpenAI posted two short papers, thirteen and sixteen pages, claiming to prove both. [1][2][4]

As of 18 October 2026 no mathematician has said publicly that they have read or checked either proof. The status on this page is "unreviewed".

## The problem

A drawing of a graph puts its vertices at distinct points of the plane and represents each edge by a simple continuous curve between its endpoints that avoids the other vertices. Edges may cross, but only finitely often, two at a time, and transversally, with no tangencies or shared stretches. The crossing number $\operatorname{cr}(G)$ is the smallest number of crossing points in any drawing of $G$, counting every crossing point separately when two edges cross more than once. There is no restriction on where vertices go or how edges are routed. Other conventions exist, counting crossing pairs of edges, or only pairs that cross an odd number of times, and they can differ; both papers use the point count. [1][2]

The complete graph $K_n$ has $n$ vertices and an edge between every pair. The complete bipartite graph $K_{m,n}$ has two groups of $m$ and $n$ vertices and an edge between every vertex of one group and every vertex of the other. $K_4$ can be drawn with no crossings, as a triangle with a point inside; $K_5$ needs one crossing; $K_{3,3}$ needs one, which is why the puzzle of connecting three houses to three utilities without crossing pipes has no solution. [1][2][4]

Hill's drawing of $K_n$ places half the vertices on each of two concentric circles and routes edges around a cylinder; a two-page drawing puts all vertices on a line and draws each edge as an arc above or below it. Both achieve

$$
Z(n)=\frac14\Bigl\lfloor\frac n2\Bigr\rfloor\Bigl\lfloor\frac{n-1}2\Bigr\rfloor\Bigl\lfloor\frac{n-2}2\Bigr\rfloor\Bigl\lfloor\frac{n-3}2\Bigr\rfloor
$$

crossings: $0,0,1,3,9,18,36,60,100,150$ for $n=3,\ldots,12$. Zarankiewicz's drawing of $K_{m,n}$ puts the $m$ kilns on the $x$-axis, split evenly on either side of the origin, the $n$ yards on the $y$-axis the same way, and joins them by straight segments. It has $d_md_n$ crossings, where $d_r=\lfloor r/2\rfloor\lfloor(r-1)/2\rfloor$. The conjectures say nobody can do better. [1][2]

**Harary-Hill conjecture.** $\operatorname{cr}(K_n)=Z(n)$ for every $n$. **Zarankiewicz conjecture.** $\operatorname{cr}(K_{m,n})=d_md_n$ for all $m,n$. [1][2]

<!-- uruk:visual-note
A visual for this page can build Hill's drawing from $K_5$ upward, counting crossings as vertices are added, and let the reader drag the vertices of a small complete or complete bipartite graph to try to beat the formula. On small graphs the reader will fail, because those cases are proved. It cannot show the general theorem.
-->

## Why it stayed open

### Eighty years of almost

Zarankiewicz's 1955 argument was found to be incomplete by Ringel and Kainen, as Guy recounted in 1969, and the formula has been a conjecture since. Kleitman proved it in 1970 when one side has at most six vertices, with a permutation argument that already used the cyclic order of edges around each vertex. Woodall developed that idea into cyclic-order graphs and verified $K_{7,7}$ and $K_{7,9}$ by computer in 1993. Semidefinite programming, from de Klerk, Maharry, Pasechnik, Richter and Salazar in 2006 onward, gave asymptotic lower bounds, and in 2023 Balogh, Lidický, Norin, Pfender, Salazar and Spiro used flag algebras to show that $\operatorname{cr}(K_{n,n})$ is at least $0.9118$ times the conjectured value for large $n$. [2][4]

For complete graphs, Guy published the first upper bound in 1960 and Harary and Hill stated the conjecture in 1963. Exact values were pushed up by computer: Pan and Richter proved $\operatorname{cr}(K_{11})=100$ in 2007, which gives $K_{12}$ as well, and Aichholzer reported $\operatorname{cr}(K_{13})=225$ in 2021. Asymptotically, Balogh, Lidický and Salazar showed in 2019 that the ratio of the true crossing number to $Z(n)$ tends to at least $0.98559895$. In another direction, Ábrego, Aichholzer, Fernández-Merchant, Ramos and Salazar proved the formula for every two-page drawing in 2013 and then for the larger class of shellable drawings, which includes Hill's cylindrical ones; Streltsova and Wagner proved it in 2025 for drawings on the sphere with shortest-arc edges. All of these restrict how the edges may be routed. Both OpenAI papers also mention a 2018 publication claiming both formulas, and point out that counting crossings in particular drawings gives only upper bounds. [1][4][5][6][7]

Why the lower bound is hard: a drawing can route edges anywhere, cross the same pair of edges many times, and has no structure to count. The restricted classes above all supply structure, a line, a cylinder, a shelling, which a general drawing lacks. [1][2]

## What OpenAI claims

**Theorem 1.1** (OpenAI, "The crossing number of complete graphs", 23 September 2026). For every integer $n\ge3$,

$$
\operatorname{cr}(K_n)=Z(n)=\frac14\Bigl\lfloor\frac n2\Bigr\rfloor\Bigl\lfloor\frac{n-1}2\Bigr\rfloor\Bigl\lfloor\frac{n-2}2\Bigr\rfloor\Bigl\lfloor\frac{n-3}2\Bigr\rfloor.
$$

In parity-specific form, $Z(2s+1)=\binom s2^{2}$ and $Z(2s)=s(s-1)^{2}(s-2)/4$. [1]

**Theorem 1.1** (OpenAI, "The crossing number of complete bipartite graphs", 23 September 2026). For all positive integers $m$ and $n$,

$$
\operatorname{cr}(K_{m,n})=d_md_n,\qquad d_r=\Bigl\lfloor\frac r2\Bigr\rfloor\Bigl\lfloor\frac{r-1}2\Bigr\rfloor=\binom{\lfloor r/2\rfloor}2+\binom{\lceil r/2\rceil}2.
$$

[2]

What these do and do not say. Both are for the ordinary crossing number, counting crossing points of continuous drawings with no restriction on routes; the pair-counting and odd-crossing variants are not addressed. The complete-graph paper says its lower bound "does not depend on the bipartite crossing-number formula", although it borrows an idea from the companion. The rectilinear crossing number, where edges must be straight segments, is a different and larger quantity for $K_n$ and is not touched. [1][2]

## How the claimed proofs go

What follows is a map of the two papers, from their introductions and their main sections. It is not a check of the details. Both are short enough that a specialist could read them in full. [1][2]

**The idea.** Both proofs are algebraic, in the tradition of Tutte's 1970 theory of crossing numbers and of Woodall's cyclic-order graphs, which already used the orders of edges around vertices to bound crossings in bipartite drawings. Instead of counting crossings, the papers attach a sign to each crossing according to its orientation, add a correction that depends on the cyclic order in which edges leave a shared vertex, and observe that the resulting pairing vanishes whenever both arguments are closed cycles, because a closed curve has algebraic intersection zero with another closed curve in the plane. That one identity is then fed into linear algebra: polynomial interpolation turns it into a dimension count, and the dimension count is a crossing count. [1][2]

**Normalizing the drawing.** An appendix in each paper shows that a minimum drawing can be taken polygonal, straight near every vertex and crossing, and free of crossings between edges that share an endpoint; independent edges may still cross more than once. This is a standard reduction, proved here for the continuous-arc definition the papers use. [1][2]

**The cycle pairing.** Orient every edge. For two oriented edges $e,f$ let $I(e,f)$ be the sum of the signs of their interior crossings, positive when the ordered tangent directions give the positive orientation of the plane. At each vertex $w$, choose a gap in the circular order of the spokes and list the incident edges counterclockwise from it; let $T_w(e,f)=\pm1$ according to which of $e,f$ comes first and let $\sigma_{we}=\pm1$ record whether $e$ points out of or into $w$. The corrected pairing is

$$
J(e,f)=I(e,f)+\tfrac12\sum_{w\text{ an endpoint of both}}\sigma_{we}\sigma_{wf}T_w(e,f),
$$

extended bilinearly to the edge space. The Cycle Pairing lemma (Section 2 of the complete-graph paper, Lemma 3.1 of the bipartite one) says $J(z,z')=0$ for any two cycles. The proof reduces to simple graph cycles via a spanning forest, replaces the first cycle by a closed polygonal walk and the second by two closed walks $\eta_\pm$ pushed to either side inside small vertex discs, and checks that the average of the signed intersection numbers with $\eta_\pm$ is exactly $J$: crossings outside the discs contribute $I$, and the averaged contributions inside the discs are the half-order terms. [1][2]

**Complete graphs, odd $n=2s+1$: the test polynomials.** Give each vertex a distinct real label $t_i$, let $F(t)=\prod(t-t_i)$ and $w_i=1/F'(t_i)$, the Lagrange weights. The interpolation identity $\sum_iw_iA(t_i)=0$ for $\deg A\le n-2$ makes every chain $z_{a,b}=\sum_{i,p}w_iw_pt_i^{a}t_p^{b}[ip]$ a cycle when $a,b\le n-2$. Feeding these into the cycle pairing gives the Polynomial Cycle Tests lemma: for every polynomial $H(x,u,y,v)$ of degree at most $n-2$ in each variable separately,

$$
\sum_{i,p,k,q}J([ip],[kq])\,w_iw_pw_kw_q\,H(t_i,t_p,t_k,t_q)=0.
$$

Now let $\mathcal S$ be the polynomials of degree at most $s-2$ in each variable, symmetric within the pair $(x,u)$ and within $(y,v)$ but not between pairs; a basis is indexed by exponent pairs $0\le a\le b\le s-2$ for each pair, so $\dim\mathcal S=\binom s2^{2}=Z(2s+1)$, which is exactly the conjectured crossing number. Let $\mathcal T$ be the set of ordered pairs of disjoint edges with nonzero signed crossing count, and $E:\mathcal S\to\mathbb R^{\mathcal T}$ the evaluation map at the four endpoint labels. Since each unordered pair in $\mathcal T$ needs at least one crossing, $c(D)\ge|\mathcal T|/2$. [1]

**Injectivity: the even-node detector.** The paper must show $E$ has zero kernel. Section 3 builds a detector from the interpolation weights: for $2s$ distinct nodes, evaluation on the index set $L_s$ of pairs $(p,q)$ with $q<p\le s$ or $s<p<q$ is an isomorphism from each of the two degree rectangles $\mathcal P_{s-1,s-2}$ and $\mathcal P_{s-2,s-1}$ onto $\mathbb R^{L_s}$ (Two-Triangle Interpolation), and the pairing $M$ built from the half-comparison-sign matrix $S(p,q)=\frac12-\mathbf 1_{q<p}$ of any prescribed order is nonsingular between the two rectangles (Order Detection). Adding row-plus-column terms to $S$ does not change $M$, because they vanish under the weighted sums, which is what lets the detector read the local spoke order out of the cycle identity regardless of which gap was chosen. Applied at a shared endpoint, the detector forces any $P$ in the kernel of $E$ to vanish whenever an endpoint of one edge coincides with an endpoint of the other; the resulting factors $(x-y)$ and their symmetric companions can be divided out while preserving the kernel property and the within-pair symmetries, and repeating would lower the degree indefinitely, so the kernel is zero. [1]

**Isotropy and the odd lower bound.** Let $\Delta=(x-u)(y-v)(x-y)(x-v)(u-y)(u-v)$, the product of all six endpoint differences. For $P,Q\in\mathcal S$ the polynomial $PQ\Delta$ has degree at most $2(s-2)+3=2s-1=n-2$ in each variable, so the cycle tests apply to it, and every term with a common endpoint is killed by $\Delta$. After symmetrizing over the four orientation choices of each pair, the identity reads $\sum_{\alpha\in\mathcal T}a_\alpha E(P)_\alpha E(Q)_\alpha=0$ with $a_\alpha=J\cdot w_iw_pw_kw_q\cdot\Delta$ all nonzero: the image of $E$ is totally isotropic for a nondegenerate symmetric diagonal form on $\mathbb R^{\mathcal T}$. A totally isotropic subspace has dimension at most half the ambient dimension, so $Z(2s+1)=\dim\mathcal S\le|\mathcal T|/2\le c(D)$ (Proposition "Odd lower bound"). The paper stresses that this form is not the skew form $J$ itself. Even $n$ follows by deleting a vertex and averaging, as in Kleitman. [1]

**The matching drawing.** Section 5 counts the crossings of the two-page book drawing from de Klerk, Pasechnik and Salazar's exposition, after Blažek and Koman: vertices $0,\dots,n-1$ on a line, edge $ij$ drawn as a semicircle above or below according to the colour of $i+j\bmod n$, with the two colour classes the residues below and above $\lfloor n/2\rfloor$. Two semicircles on the same side cross exactly when their endpoints alternate, because the difference of $y^{2}=(x-a)(b-x)$ for two chords is affine in $x$. The count equals $Z(n)$ exactly. [1]

**Complete bipartite graphs: a statement with no graphs in it.** The bipartite paper's engine is the Subspace Intersection Bound (Section 2): if $U_1,\dots,U_m$ and $V_1,\dots,V_m$ are subspaces of an $N$-dimensional real space with $U_i\cap V_i=0$ for every $i$, then $\sum_{i,j}\dim(U_i\cap V_j)\le\lfloor m^{2}/4\rfloor N$. The proof encodes the subspaces as polynomial evaluation constraints, filters by degree, bounds the evaluated rank at each node by disjointness, reads off the vanishing order of a polynomial minor, and compares with its degree. A corollary applies it to matrices of the difference form $X_i-Y_k$ with invertible diagonal blocks. [2]

**The rank detector.** For $n=2s+1$ and $d=s^{2}$, Section 4 builds a linear map $\Phi:\mathbb R^{n\times n}\to\mathbb R^{d\times d}$ with three properties: it annihilates every row-plus-column matrix and every diagonal matrix; it sends each coordinate matrix $E_{pq}$, $p\ne q$, to a rank-one matrix; and for every strict linear order $\prec$ on $\{1,\dots,n\}$ it sends the half-comparison matrix $S_\prec$ to an invertible matrix, with one map working for all orders at once. The construction is the odd-node two-triangle interpolation that the complete-graph paper mirrors. [2]

**Reading the drawing.** Orient every edge from the $m$ kilns $a_i$ to the $n$ yards $b_p$, record the counterclockwise order of spokes at each vertex, and form the signed-intersection matrix $J$, cut into $n\times n$ blocks $J^{ik}$ indexed by pairs of kilns. The Additive Block Relation lemma applies the cycle pairing to two four-cycles through kilns $i,1$ and $k,1$ and finds that $J^{ik}-J^{i1}-J^{1k}+J^{11}$ is a row-plus-column matrix. Hence $R_{ik}=\Phi(J^{ik})$ has the difference form $X_i-Y_k$ with $X_i=R_{i1}$ and $Y_k=R_{11}-R_{1k}$. Since no two spokes at $a_i$ cross and all point outward, $J^{ii}$ is exactly half the sign matrix of the spoke order at $a_i$, so $R_{ii}$ is invertible of rank $d$; for $i\ne k$, the off-diagonal entries of $J^{ik}$ are pure signed crossing counts $I(ip,kq)$ and each nonzero one costs at least one crossing and contributes rank at most one, so $\operatorname{rank}R_{ik}\le c_{ik}$, the number of crossings between the two stars. The corollary of the subspace bound gives $2d_md\le\sum_{i\ne k}\operatorname{rank}R_{ik}\le\sum_{i\ne k}c_{ik}=2c(D)$, hence $\operatorname{cr}(K_{m,n})\ge d_md_n$ for odd $n$; the paper notes the estimate counts crossing points correctly even when edges cross repeatedly, since cancellation in a signed sum only reduces nonzero entries. Even $n$ uses Kleitman's vertex-deletion count, and Zarankiewicz's drawing is the upper bound. [2]

Where would an expert look first? In the complete-graph paper, at the cycle pairing's proof via the two pushed-off walks, at the descent step in the Injectivity lemma, and at the claim that the diagonal form's coefficients $a_\alpha$ are all nonzero. In the bipartite paper, at the proof of the subspace inequality, which is the paper's only genuinely new estimate, at property (iii) of the rank detector for all orders simultaneously, and at the half-sign identification of $J^{ii}$. In both, at whether the point-count convention is used consistently through the normalization. [1][2]

## Consequences inside mathematics

If both proofs hold, two of the oldest conjectures in graph drawing are theorems, and Turán's brickyard problem is solved eighty-two years after it was posed. Every drawing of a graph containing $K_n$ or $K_{m,n}$ inherits the corresponding number of crossings, which gives unconditional lower bounds for crossing numbers of larger graphs. The methods are linear-algebraic and self-contained; the papers do not claim they extend to other graph families or to the rectilinear crossing number. [1][2]

## Uses outside mathematics

No known direct application.

Crossing minimization is a real task in circuit layout and in drawing diagrams by computer, but those problems concern specific graphs and are solved by heuristics; the exact crossing number of complete graphs is not a quantity an engineer needs. Turán's bricks are the one practical origin, and the trucks stopped jumping long ago. [4]

## Has anyone checked it?

We found no named mathematician who says they are reading or checking either paper, and no public comment from the researchers whose partial results they cite. VibeMathed records no check by an independent mathematician for either conjecture. The proofs are short, thirteen and sixteen pages, so this may change quickly. [8]

**Machine checking.** Both theorems have Lean statements in the release's catalogue `formalization.yaml`. `CompleteCrossing.lean` is 89 lines and `BipartiteCrossing.lean` 67; each has to build its own model of a plane drawing with continuous edges and proper crossings, which is where a reader should check that the formal statement says what the paper says. The release's scope note says the formalization proves the lower bound and constructs matching drawings in both cases, counting crossings as spatial points. The formal proofs run to 46 and 339 files. We found no outside replay. A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval. [3]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; neither paper in this family is among them. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [9]

## Sources

1. OpenAI, "The crossing number of complete graphs", 23 September 2026. Theorem 1.1, the introduction, Sections 2 to 5 and the appendix. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/The-crossing-number-of-complete-graphs-September-23-2026/paper.pdf
2. OpenAI, "The crossing number of complete bipartite graphs", 23 September 2026. Theorem 1.1 and the introduction. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/The-crossing-number-of-complete-bipartite-graphs-September-23-2026/paper.pdf
3. OpenAI, Lean scope note for family 165 and the comparator statements `CompleteCrossing.lean` and `BipartiteCrossing.lean` at the pinned commit. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/165.md , https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/CompleteCrossing.lean and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/BipartiteCrossing.lean
4. Wikipedia, "Turán's brick factory problem" and "Crossing number (graph theory)", read 18 October 2026. The 1944 story, Zarankiewicz's gap, the small values and the three-utilities puzzle. https://en.wikipedia.org/wiki/Tur%C3%A1n%27s_brick_factory_problem and https://en.wikipedia.org/wiki/Crossing_number_(graph_theory)
5. Shengjun Pan and R. Bruce Richter, "The crossing number of K_11 is 100", Journal of Graph Theory 56 (2007), 128-134. https://doi.org/10.1002/jgt.20249
6. József Balogh, Bernard Lidický and Gelasio Salazar, "Closing in on Hill's conjecture", SIAM Journal on Discrete Mathematics 33 (2019), 1261-1276. https://doi.org/10.1137/17M1158859
7. Bernardo M. Ábrego, Oswin Aichholzer, Silvia Fernández-Merchant, Pedro Ramos and Gelasio Salazar, "The 2-page crossing number of K_n", Discrete and Computational Geometry 49 (2013), 747-777. https://doi.org/10.1007/s00454-013-9514-0
8. VibeMathed, "Zarankiewicz crossing-number conjecture" and "Harary-Hill conjecture", read 18 October 2026. https://vibemathed.com/problem/zarankiewicz-crossing-number-conjecture and https://vibemathed.com/problem/harary-hill-conjecture
9. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
