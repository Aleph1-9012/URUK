---
family: "167"
topic: "Unit distances"
title: "How many links can have the same length?"
paperTitle: "A power saving for planar unit distances"
claim: "There are absolute constants C > 0 and 1 ≤ β < 4/3 such that every set of n points in the plane has at most C n^β pairs at distance exactly one."
status: unreviewed
checked: 2026-10-15
papers:
  - preprints/A-power-saving-for-planar-unit-distances-September-23-2026/paper.pdf
draft: false
---

Paul Erdős asked this in 1946, and it became one of the best known problems in combinatorial geometry: simple to state, open for eighty years, with a \$500 prize attached. The upper bound of Spencer, Szemerédi and Trotter from 1984, that the count is at most a constant times $n^{4/3}$, was never improved, and there was a known reason why the standard methods could not improve it. In May 2026 an OpenAI model produced a construction that overturned Erdős's own guess about the answer, a result nine mathematicians then checked and wrote up. On 23 September 2026 OpenAI posted a separate paper claiming the other direction: that the exponent $\tfrac43$ can be lowered by some fixed amount. [1][2][3]

As of 15 October 2026 no mathematician has said publicly that they have checked this September proof. The status on this page is "unreviewed". The May result is different, and its approval does not transfer.

## The problem

Place $n$ distinct points in the plane. Draw a line between every two of them that are exactly one unit apart. How many lines can there be? Formally, for a finite set $X\subset\mathbb{R}^{2}$,

$$
u(X)=\#\big\{\{x,y\}\subset X:\ \|x-y\|=1\big\},\qquad u(n)=\max_{|X|=n}u(X).
$$

Pairs are unordered and their two points are distinct. The choice of the number one is only a choice of units: scale any configuration and whichever distance you like becomes the unit distance. The question is how many times a single distance can repeat among $n$ points. [1]

Some arrangements do better than others. Four points at the corners of a unit square give four unit pairs. Arrange them instead as two equilateral triangles sharing an edge and you get five. A square grid of $k\times k$ points gives about $2k^{2}=2n$ unit pairs, and a triangular grid about $3n$. Erdős's observation in 1946 was that a square grid scaled so that its unit distance is a number with many representations as a sum of two squares does much better: his lattice construction gives

$$
u(n)\ \ge\ n^{1+c/\log\log n}
$$

for a positive constant $c$ and large $n$. That is barely more than linear, but it is more, and nobody found anything better for eighty years. Erdős conjectured that it was the truth, that $u(n)=n^{1+o(1)}$, and offered \$500 for a proof or disproof. [1][2]

In the other direction, there is a one-paragraph proof that $u(n)=O(n^{3/2})$, and it rests on a fact that will matter below. Draw a circle of radius one around every point. Two points are at unit distance exactly when each lies on the other's circle. Two distinct circles of the same radius meet in at most two points, so any two points have at most two common unit neighbours. A graph in which every pair of vertices has at most two common neighbours has $O(n^{3/2})$ edges, and that is the bound. [2]

## Why it stayed open

### The $\tfrac43$ wall

Spencer, Szemerédi and Trotter brought the exponent down to $\tfrac43$ in 1984. Székely gave a short proof in 1997 using the crossing number inequality of Ajtai, Chvátal, Newborn and Szemerédi and of Leighton: any drawing of a graph with many edges must have many crossing pairs of edges, and a drawing built from arcs of unit circles cannot have too many, because two circles cross at most twice. Székely's argument is a general theorem about incidences between points and curves, and it uses only two properties of unit circles: two circles meet in at most two points, and two points lie on at most two circles. [1][2]

That generality is exactly the problem. Valtr constructed a different way of measuring distance in the plane, a norm whose unit circle is not round, together with sets of $n$ points having on the order of $n^{4/3}$ unit pairs in that norm. The Spencer-Szemerédi-Trotter and Székely proofs go through unchanged for Valtr's norm, because its unit circles have the same two properties. So in Valtr's geometry $\tfrac43$ is the right answer, and any proof that does better for ordinary Euclidean distance must use something about round circles that the incidence method ignores. Thomas Bloom's record of the problem states this plainly: "some special feature of the Euclidean metric must be exploited". [1][2]

Work since then sharpened the constant (Ágoston and Pálvölgyi, 2022), described the structure of configurations near the extremal incidence scale (Katz and Silier, 2026), and connected the problem to rigidity theory, obtaining a logarithmic improvement conditional on a rigidity conjecture (Pach, Raz and Solymosi, 2026). None lowered the exponent. [1]

### What happened in May

In May 2026 an internal OpenAI model produced point sets with at least $n^{1+\varepsilon}$ unit distances, for a fixed $\varepsilon>0$, along an unbounded sequence of sizes $n$. That disproves Erdős's conjecture. The construction is number-theoretic rather than geometric: it builds an infinite tower of number fields using the Golod-Shafarevich inequality, with many fixed primes forced to split, and extracts from the resulting lattices exponentially many elements of absolute value one. Noga Alon, Thomas Bloom, Timothy Gowers, Daniel Litt, Will Sawin, Arul Shankar, Jacob Tsimerman, Victor Wang and Melanie Matchett Wood published a "short, digested, human-verified version" of the proof on 20 May and traced its ideas to work of Michel, Soundararajan, Ellenberg and Venkatesh. Sawin sharpened the exponent to $u(n)\gg n^{1.014114}$ along a sequence. Bloom wrote that "we can unambiguously say that the AI has solved a \$500 Erdős problem". [1][3][4][5]

These are lower bounds. They say the count can be at least a certain size. The September paper is about the upper bound: how large the count can possibly be. After both, the truth lies somewhere between $n^{1.014}$ and $n^{4/3-\delta}$, and the two exponents do not meet. [1]

## What OpenAI claims

**Theorem 1.1** (OpenAI, 23 September 2026). There are absolute constants $0<C<\infty$ and $1\le\beta<\tfrac43$ such that $u(n)\le Cn^{\beta}$ for every nonnegative integer $n$. [1]

Equivalently, $u(n)=O(n^{4/3-\delta})$ for some absolute $\delta>0$. The constants do not depend on the configuration. [1]

Two things the theorem does not do. It gives no number. The paper's introduction ends by saying that the argument "establishes the existence of a fixed positive gap without estimating its size", and no value of $\beta$, $\delta$ or $C$ appears anywhere in it. This page therefore does not state one either, and any chart that draws a curve below $n^{4/3}$ with a specific exponent is drawing something the paper does not claim. And it is an asymptotic statement about growth, not a bound on any particular small configuration; the constant $C$ is unspecified. [1]

Family 167 in OpenAI's release contains a second paper, "The weak pinned planar distance theorem", about how many distinct distances most individual points determine. It is a different theorem with a different proof and is not discussed here. [6]

## How the claimed proof goes

The paper is 53 pages. What follows is a map of its introduction and section structure, not a check of its arguments. [1]

**Assume the opposite.** Suppose no fixed power saving exists. Then there is a sequence of configurations whose unit-pair counts approach the exponent $\tfrac43$. Write $n=t^{3}$ along this sequence, so the ordered unit pairs number $t^{4-o(1)}$. The proof derives a contradiction from such a sequence. Because the counterexamples are only assumed to exist, the proof learns nothing about how far below $\tfrac43$ the true exponent lies. [1]

**Points, circles and a regular piece.** Take two copies of the configuration, one as points and one as centres of unit circles, and join a point to a centre when they are at unit distance. This is the same incidence graph as in the Székely proof. The coordinates can be assumed algebraic, since the unit-distance equations and the distinctness conditions survive specialization. Random cuttings, in the framework of Clarkson and Shor, isolate a piece of the graph with controlled degrees and an expansion property that limits how many edges a small set of vertices can capture. [1]

**Information.** Sample a random centre, then two of its neighbours independently; the paper calls this a wedge. The first new ingredient is that the two endpoints of a wedge share very little information: the mutual information between them is $o(\log t)$. Entropy arguments of this kind go back to Tardos and to Katz and Tardos in the distinct-distances problem. [1]

**Prediction from a short history.** A test assigns a finite code to each point; a history records a point's codes at a short list of previous tests. The prediction lemma says that, given a point, one can resample a prediction from the point distribution conditioned on sharing its history, and the information bound guarantees a history for which the prediction answers a fresh, independent test compatibly with a neighbouring centre. The resampling keeps the original marginal, which is the Katz-Tardos conditional-copy principle. This is the mechanism that later turns rough statistical control into exact algebraic relations. [1]

**The Euclidean feature: arithmetic of the jumps.** Here is where round circles enter. In complex coordinates $z=x+iy$ and $w=x-iy$, the unit-distance condition $|p-q|^{2}=1$ factors as $(z_p-z_q)(w_p-w_q)=1$. So each unit edge has a jump $d=z_p-z_q$ in one coordinate and the reciprocal jump $d^{-1}$ in the other. Since the coordinates are algebraic numbers, these jumps have heights, a standard measure of arithmetic complexity, and the product formula ties together the sizes of an algebraic number at all absolute values. The paper defines a scale $S$ that measures how much the logarithmic jump profiles vary across the edges, integrated over thresholds and summed over places. This factorization is a property of the round circle, the kind of Euclidean feature that Valtr's example says any improvement has to use. [1][2]

**The bounded case.** If $S$ stays bounded along the sequence, the product formula transfers that control to the heights of normalized point coordinates. Quantization tests at a fresh complex embedding then produce a predicted point, separated from the original, that nearly satisfies the unit equations at three of its neighbours while those three jumps stay separated. A determinant calculation shows this is impossible. [1]

**The unbounded case: common and rare levels.** If $S\to\infty$, the thresholds give each vertex two labels, one per coordinate, and across each unit edge exactly one label agrees. Levels where both outcomes are frequent are called common; levels where one is rare are called rare. Scores assigned to pairs of edges sharing a point or a centre, with the product formula bounding their integrals, show that common levels contribute negligibly, while a positive amount of exceptional mass remains on rare levels. [1]

**Extraction and the algebraic obstruction.** The remaining mass yields many pairs of wedge endpoints $(p,r)$ with a chosen centre $q$ and ratio $\lambda_{pr}=(z_p-z_q)/(z_r-z_q)$. On a dense graph of such pairs, each individual ratio has large height, at least $J/3$ with $J\to\infty$, while every alternating product $\lambda_{pr}\lambda_{p'r'}/(\lambda_{pr'}\lambda_{p'r})$ over a rectangle has height $o(J)$. The last section rules this out. In a field built from the sequence, the elements of height $o(J)$ form a relatively algebraically closed subfield; the rectangle products lie in it while the individual ratios are transcendental over it. Differentiating the unit equations over this subfield gives a finite system involving square roots, and for each radicand the paper constructs a valuation that is odd on it and zero on the others, so the signs of the square roots can be flipped independently. An unused sign change contradicts the differentiated equations. Pairs on circles through many points are removed beforehand to make the square-class independence hold. [1]

The paper's cited inputs are published: Clarkson and Shor's sampling, the Katz-Tardos entropy method, and the product formula with the associated absolute height. No other OpenAI paper is an input to the proof. [1]

Where would an expert look first? The prediction lemma and its conditional laws, since so much depends on preserving the marginal under resampling with history-dependent tests; the transfer lemma that moves concentration from predicted states to actual points; and the final valuation construction, where the independence of the square roots has to survive the adjunction of one side's data.

## Uses outside mathematics

No known direct application.

This is a worst-case counting bound in pure geometry. It does not locate the best arrangement, pin down $u(n)$, or improve any algorithm that works with points and distances. Discrete geometry has applications in general; this theorem has none that anyone has documented, and the paper claims none. [1]

## Has anyone checked it?

We found no named mathematician who says they have read this proof, let alone checked it. Thomas Bloom's Erdős Problems record for Problem 90, which was updated on 20 May to record the disproof, still listed $O(n^{4/3})$ as the best known upper bound and no proof claims when read on 15 October. VibeMathed records that no independent mathematician has checked the result. An expository card on the Erdős Problems wiki summarizes the manuscript and states that its prose proof is not reviewed. [2][7][8]

The human verification of the May construction by Alon and eight coauthors is real and is why this problem is famous this year. It concerns a lower bound proved by a completely different argument. It is not evidence about the September paper. [3]

OSVerify, an automated referee from Stanford whose findings its site says are "further verified by human experts", unnamed, reported on its results page one major issue in this paper: at the end of Section 8.2 the paper asserts that a point generic over a coefficient field stays generic after adjoining other grid points, and the report gives a counterexample where adjoining one grid point lowers the transcendence degree. Its human expert comment reads: "The reported issue and the suggested fix are both correct. So the statement in the paper is false as stated, but this error is fixable." The proposed repair restricts the automatic preservation to adjoining grid points over the base field and keeps the explicit genericity hypothesis elsewhere, which the report says the later applications already satisfy. Under Uruk's rules a dispute needs a named expert, so the label is unchanged; the finding is recorded here, added 20 October 2026. [11]

**Machine checking.** The situation is unclear, and we say so. The release tree at the pinned commit contains a Lean statement file for this theorem and a forty-file directory, `lean/OAI/Geometry/UnitDistances/`, whose section names follow the paper's and which ends with a theorem of the stated form. But the release's own catalogue of formalizations, `formalization.yaml`, lists only the pinned-distance companion for this family, at the pinned commit as after each of the 7 and 26 October updates, and the family's scope note contradicts itself: one paragraph says "The separate unit-distance power-saving theorem is not included" and the next describes that theorem as formalized. Until the catalogue lists it and someone outside OpenAI replays it, this page does not describe the theorem as machine-checked. Even if it were, a kernel check is not a human reading; Uruk does not count it as approval. [6][9]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; none of them is this family. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [10]

## Sources

1. OpenAI, "A power saving for planar unit distances", 23 September 2026. Theorem 1.1, Sections 1.1 and 1.2, and the proof outline. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/A-power-saving-for-planar-unit-distances-September-23-2026/paper.pdf. Introduction source: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/A-power-saving-for-planar-unit-distances-September-23-2026/build/sections/00-introduction.tex
2. Thomas F. Bloom, Erdős Problem #90, read 15 October 2026. The 1946 question, the prizes, the $O(n^{3/2})$ and $O(n^{4/3})$ bounds, Valtr's example and the May disproof. https://www.erdosproblems.com/90
3. Noga Alon, Thomas F. Bloom, W. T. Gowers, Daniel Litt, Will Sawin, Arul Shankar, Jacob Tsimerman, Victor Wang and Melanie Matchett Wood, "Remarks on the disproof of the unit distance conjecture", 20 May 2026. Bloom's section is the source of his quotation. https://arxiv.org/abs/2605.20695
4. OpenAI, "Planar Point Sets with Many Unit Distances", May 2026. The construction. https://cdn.openai.com/pdf/74c24085-19b0-4534-9c90-465b8e29ad73/unit-distance-proof.pdf
5. Will Sawin, sharpened lower bound, arXiv:2605.20579, May 2026. https://arxiv.org/abs/2605.20579
6. OpenAI, Lean scope note for family 167 at the pinned commit, unchanged since the 6 October release. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/167.md
7. VibeMathed, "A power saving for planar unit distances", read 15 October 2026. https://vibemathed.com/problem/planar-unit-distances-power-saving
8. Erdős Problems wiki, claim card for OpenAI's September 2026 power saving, read 15 October 2026. https://erdosproblems.ai/wiki/problems/distance_problems/E1085/claims/2026_09_23_openai
9. OpenAI, comparator statement `PlanarUnitDistances.lean` and the catalogue `formalization.yaml` at the pinned commit. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/PlanarUnitDistances.lean and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/formalization.yaml
10. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
11. OSVerify, "A power saving for planar unit distances", referee report with human expert comment, read 20 October 2026. https://osverify.github.io/cases/planar-unit-distances.html
