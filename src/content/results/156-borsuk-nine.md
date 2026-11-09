---
family: "156"
topic: "Borsuk’s problem"
title: "Can every shape in nine dimensions be cut into ten smaller pieces?"
paperTitle: "A nine-dimensional counterexample to Borsuk's covering assertion"
claim: "The set of rank-one orthogonal projectors onto lines in R^4, a compact subset of the nine-dimensional space of trace-one symmetric 4×4 matrices with the Frobenius metric, has diameter √2 and cannot be covered by ten sets of diameter strictly less than √2. Borsuk's conjecture therefore fails in dimension nine."
status: unreviewed
checked: 2026-10-18
papers:
  - preprints/A-nine-dimensional-counterexample-to-Borsuks-covering-assertion-September-23-2026/paper.pdf
draft: false
---

Take a disc. Can you cut it into two pieces each narrower than the disc? No: any two pieces of a disc, one of them contains two diametrically opposite points. Three pieces suffice. In 1933 Karol Borsuk asked whether every bounded set in $d$-dimensional space can be cut into $d+1$ pieces of strictly smaller diameter, as the disc can be cut into three and a ball into four. The answer is yes in dimensions one, two and three, and for sixty years it was believed to be yes always. Then in 1993 Jeff Kahn and Gil Kalai found counterexamples in dimension $1{,}325$ and every dimension above $2{,}014$, and a race began to find the smallest dimension where Borsuk fails: $946$, $561$, $323$, $298$, then in 2014 $65$ and $64$, and in 2026 a human note at $63$. On 23 September 2026 OpenAI posted an eighteen-page paper claiming a counterexample in dimension nine, built from the lines through the origin in four-dimensional space. [1][3][4][5]

As of 18 October 2026 no mathematician has said publicly that they have read or checked the proof. The status on this page is "unreviewed".

## The problem

For a bounded set $Y$ in $\mathbb R^{d}$ with positive diameter, let $b(Y)$ be the least number of subsets of strictly smaller diameter needed to cover it. Covers and partitions give the same number, since overlaps can be removed without increasing diameters. A regular simplex with $d+1$ vertices needs $d+1$ pieces, because any two of its vertices are at full diameter. [1]

**Borsuk's question (1933).** Is $b(Y)\le d+1$ for every bounded $Y\subset\mathbb R^{d}$ of positive diameter? [1][3]

## Why it stayed open

What was known. True for $d=2$ and $d=3$, and for all smooth convex bodies in every dimension by Hadwiger. Kahn and Kalai's 1993 counterexample used a theorem of Frankl and Wilson on forbidden intersections of finite sets to build a finite set of points, the vectors $x\otimes x$ for sign vectors $x$, that needs about $1.2^{\sqrt d}$ pieces, far more than $d+1$ when $d$ is large. Every later counterexample has also been a finite set: Nilli's in dimension $946$, Raigorodskii's $561$, Weissbach's $560$, then Hinrichs and Pikhurko using spherical codes and the Leech lattice down to $298$, then Bondarenko's two-distance set from a strongly regular graph in dimension $65$ and Jenrich and Brouwer's refinement to $64$, and in 2026 Grinsztajn's note at $63$. Between $4$ and $63$ nothing was known. [1][4][5]

## What OpenAI claims

Let $\operatorname{Sym}_4(\mathbb R)$ be the real symmetric $4\times4$ matrices with the Frobenius norm $\|A\|_F^{2}=\operatorname{tr}(A^{2})$. The matrices of trace one form a nine-dimensional Euclidean space. For a unit vector $u\in\mathbb R^{4}$, $uu^{\mathsf T}$ is the orthogonal projector onto the line through $u$.

**Theorem 1.1** (OpenAI, 23 September 2026). The compact set

$$
X=\{uu^{\mathsf T}:u\in\mathbb R^{4},\ \|u\|=1\}\subset\{A\in\operatorname{Sym}_4(\mathbb R):\operatorname{tr}A=1\},
$$

with the Frobenius metric, has diameter $\sqrt2$ and cannot be covered by ten subsets of diameter strictly less than $\sqrt2$. [1]

Thus Borsuk's assertion fails in dimension nine, and by adding one far-away point per extra dimension, in every dimension $d\ge9$. The paper does not determine the smallest dimension where Borsuk fails or the exact value of $b(X)$. The distance between two projectors is $\sqrt2$ times the sine of the angle between their lines, so two points of $X$ are at full diameter exactly when the lines are perpendicular. The set $X$ is the image of real projective three-space, and unlike every previous counterexample it is infinite; the paper says the projector embedding itself is classical, described by Kalai and used by Conway, Hardin and Sloane for Grassmannian packings, and that "our contribution is the covering obstruction for the projector set associated with $\mathbb R^{4}$". [1]

## How the claimed proof goes

What follows is a map of the paper's argument from its introduction and from Sections 2 to 7. It is not a check of the details. [1]

**The idea.** Unlike every previous counterexample, which was a finite set of points taken from a lattice, a code or a strongly regular graph, the witness here is a whole compact manifold: the set $X$ of rank-one projectors $uu^{T}$ for unit vectors $u\in\mathbb R^{4}$, which is real projective three-space embedded in the nine-dimensional space of trace-one symmetric $4\times4$ matrices. Two projectors are at the diameter distance $\sqrt2$ exactly when their lines are orthogonal. A hypothetical cover of $X$ by ten pieces of smaller diameter is converted into a map from $\mathbb{RP}^{3}$ to the nine-simplex whose positive coordinates never coincide on orthogonal lines; topology then forces that map's "support complex" into a rigid shape, and combinatorics shows no complex of that shape exists. The paper notes that Walkup's eleven-vertex minimum for triangulations of $\mathbb{RP}^{3}$ cannot be applied directly, since the faces here are supports of a map, not simplices of a triangulation; deriving enough face structure from the map is the central difficulty. [1]

**Step 1: from covers to maps (Section 2).** The Projector Geometry lemma fixes the metric: $x\mapsto P_x$ embeds $\mathbb P(\mathbb R^{k})$ in the trace-one affine subspace of symmetric matrices, Euclidean of dimension $N_k-1=k(k+1)/2-1$, so $N_4-1=9$, and $\|P_x-P_y\|_F^{2}=2(1-\cos^{2}\theta)$ for the angle $\theta$ between the lines, so the diameter $\sqrt2$ is attained exactly at orthogonal pairs. A cover by ten sets of diameter strictly below $\sqrt2$ can be fattened to an open cover with the same property (Lemma 2.4, the strict-gap reduction), and a smooth partition of unity subordinate to it gives nonnegative $f_1,\dots,f_{10}$ on $\mathbb{RP}^{3}$ summing to one such that orthogonal lines have disjoint sets of positive coordinates; the paper calls such a map admissible. The support complex has a set of labels as a face when all those coordinates are positive at some line. [1]

**Step 2: the odd map (Section 3).** Set $H(v)=\|v\|^{2}f([v])$, a degree-two homogeneous map on $\mathbb R^{k}$, and extend $f$ to positive semidefinite operators by $E(Q)=k\int_{S(V)}H(Q^{1/2}u)\,d\mu(u)$ against the rotation-invariant probability measure on the sphere. For a symmetric matrix $A$ with positive and negative parts $A_\pm$, the difference $E(A_+)-E(A_-)$ is an odd map whose output coordinates have absolute sum equal to the sum of the absolute eigenvalues of $A$, because orthogonal spectral subspaces give disjoint sets of labels. Normalizing both sums gives an odd map between spheres, which by Borsuk-Ulam has odd degree modulo two (Lemma 3.2, the odd sphere map). [1]

**Step 3: equality forces tetrahedra and a cycle (Section 4).** Proposition 4.1 bounds the number of labels: an admissible map on $\mathbb{RP}^{k-1}$ needs at least $k(k+1)/2$ of them, so ten on $\mathbb{RP}^{3}$ is the threshold case. Theorem 4.3, supports at equality: at the threshold, a maximal support with fewer than $k$ labels would give a positive-dimensional regular level set inside one affine chart of projective space; applying the matrix extension on the orthogonal complement of each line produces a map on a sphere bundle over that level set; the odd degree of the original extension forces an odd preimage count for this map, while the chart trivialization makes the same count even through the induced map on the projective bundle. So every maximal support has exactly $k=4$ labels, and the remaining odd local counts (Lemma 4.2, local counting) determine the coefficients of the facet cycle: the sum of the tetrahedral faces is a cycle modulo two. [1]

**Step 4: six-label triangle systems (Section 5).** The same degree argument in $\mathbb R^{3}$, where the threshold is six labels on $\mathbb{RP}^{2}$, produces a rigid structure: a six-label triangle system is a collection $\mathcal T$ of triples from a six-element set such that exactly one of each complementary pair $T$, $C\setminus T$ belongs to $\mathcal T$ and every pair of labels lies in exactly two members. Lemma 5.2 derives such a system on the six labels complementary to any tetrahedral face of the ten-label complex, and Lemma 5.3 lists its properties. [1]

**Step 5: the obstruction on ten labels (Section 6).** Following the triangle systems across adjacent tetrahedra, the lemmas on facet complements, two tetrahedra, short links and partner blocks constrain the cycles around edges and organize a subset of the labels into $t$ small blocks containing $4+t$ labels, with $1\le t\le4$ and $|R|=6-t$ labels outside them. Theorem 6.5: no admissible map $\mathbb{RP}^{3}\to\Delta^{9}$ exists. The proof fixes a tetrahedron $S$, rules out $t=4$ because $S$ would meet each two-element block in one element, shows there is no triangle inside $R$ by purity, and derives a contradiction from the fact that every four labels outside $S$ contain a triangle. [1]

**Step 6: back to the cover (Section 7).** The diameter obstruction follows: ten sets of diameter below $\sqrt2$ would give an admissible map, which does not exist. Corollary 7.1 extends the construction to compact counterexamples in every dimension $d\ge9$. [1]

Where would an expert look first? At the parity argument of Theorem 4.3, where the odd degree and the chart trivialization give conflicting counts, and at the claim that the level set is regular and positive-dimensional; at the strict-gap reduction from arbitrary covering sets to functions with disjoint supports on orthogonal lines; and at the combinatorial case analysis of Section 6, which is finite and checkable by hand or by computer. [1]

## Consequences inside mathematics

If the proof holds, the smallest dimension where Borsuk's conjecture fails drops from somewhere in $[64,\ldots]$, or $63$ if Grinsztajn's note is accepted, to at most nine, and the open range becomes $4\le d\le8$. The method is topological rather than combinatorial, and the counterexample is a compact set rather than a finite one; Kalai posed on 11 October the question of whether the finite and infinite Borsuk numbers are always equal, which is exactly the question this paper's example raises, since the best finite counterexample remains far higher. [1][6]

## Uses outside mathematics

No known direct application.

## Has anyone checked it?

We found no named mathematician who says they are reading or checking this paper. Gil Kalai, coauthor of the first counterexample, posted "Test Your Intuition 60: The Finite and Infinite Borsuk's Conjecture" on 11 October, asking whether every finite set needs as many pieces as every set; the post does not mention the paper, and its comments discuss compactness arguments rather than the proof. VibeMathed records no check by an independent mathematician. [6][7]

**Machine checking.** The release's Lean statement `BorsukNine.lean` is 34 lines and is listed in the catalogue `formalization.yaml`. It states that the projector set in the nine-dimensional trace-one space has diameter $\sqrt2$ and no cover by ten sets of smaller diameter. At that length a reader can check the formal definitions directly. We found no outside replay. A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval. [2]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; this paper is not among them. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [8]

## Sources

1. OpenAI, "A nine-dimensional counterexample to Borsuk's covering assertion", 23 September 2026. Theorem 1.1, Corollary 7.1, the history and method section and the proof overview. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/A-nine-dimensional-counterexample-to-Borsuks-covering-assertion-September-23-2026/paper.pdf
2. OpenAI, Lean scope note for family 156 and the comparator statement `BorsukNine.lean` at the pinned commit. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/156.md and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/BorsukNine.lean
3. Karol Borsuk, "Drei Sätze über die n-dimensionale euklidische Sphäre", Fundamenta Mathematicae 20 (1933), 177-190. https://doi.org/10.4064/fm-20-1-177-190
4. Jeff Kahn and Gil Kalai, "A counterexample to Borsuk's conjecture", Bulletin of the American Mathematical Society 29 (1993), 60-62. https://doi.org/10.1090/S0273-0979-1993-00398-7
5. Thomas Jenrich and Andries E. Brouwer, "A 64-dimensional counterexample to Borsuk's conjecture", Electronic Journal of Combinatorics 21 (2014), P4.29; and Wikipedia, "Borsuk's conjecture", read 18 October 2026, for the sequence of dimensions and the cases $d\le3$. https://doi.org/10.37236/4069 and https://en.wikipedia.org/wiki/Borsuk%27s_conjecture
6. Gil Kalai, "Test Your Intuition 60: The Finite and Infinite Borsuk's Conjecture", Combinatorics and more, 11 October 2026, with comments through 15 October. https://gilkalai.wordpress.com/2026/10/11/test-your-intuition-60-the-finite-and-infinite-borsuks-conjecture/
7. VibeMathed, "Borsuk's conjecture fails in dimension nine", read 18 October 2026. https://vibemathed.com/problem/borsuk-conjecture-dimension-nine
8. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
