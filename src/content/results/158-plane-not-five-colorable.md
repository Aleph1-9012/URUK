---
family: "158"
topic: "Chromatic number of the plane"
title: "How many colours does it take to paint the plane so that no two points one unit apart match?"
paperTitle: "The Euclidean plane is not five-colorable"
claim: "Every colouring of the Euclidean plane with five colours, with no restriction on the colour classes, contains two points at distance exactly one with the same colour. The chromatic number of the plane is therefore 6 or 7."
status: under review
checked: 2026-10-17
papers:
  - preprints/The-Euclidean-plane-is-not-five-colorable-September-23-2026/paper.pdf
draft: false
---

Take an infinite sheet of paper and a box of crayons. Colour every point, with one rule: two points exactly one centimetre apart must never share a colour. How few crayons can you get away with? Edward Nelson asked this in 1950, as a student in Chicago, and within weeks the answer was known to be four, five, six or seven. There it stayed for sixty-eight years. In 2018 Aubrey de Grey, a biologist working in his spare time, found a pattern of 1,581 points that cannot be coloured with four colours, so the answer became five, six or seven. On 23 September 2026 OpenAI posted a 62-page paper claiming the next step: five colours are not enough either. If it holds, the answer is six or seven, and the problem is settled up to one colour. [1][3][4]

The surprise is the method. Every earlier advance came from a finite pattern of points that a computer checked. This paper builds no pattern. It proves that any five-colouring, however wild, could be turned into a tame one, and then that no tame one exists. [1]

As of 17 October 2026, the mathematicians who pushed the bound to five in 2018 have begun working through the paper in public, and one specialist has said he had tried the same route. Nobody has said the proof is correct. The status on this page is "under review".

## The problem

A colouring of the plane with $k$ colours is a function $c$ from $\mathbb R^{2}$ to $\{1,\ldots,k\}$. It is proper if $c(x)\neq c(y)$ whenever the distance $\|x-y\|$ is exactly $1$. The chromatic number of the plane, written $\chi(\mathbb R^{2})$, is the least $k$ for which a proper colouring exists. No regularity is imposed: the colour classes can be any sets whatever, measurable or not. This is the Hadwiger-Nelson problem. [1]

Another way to say it: form a graph whose vertices are all the points of the plane and whose edges join the pairs at distance one, and ask for its chromatic number, the fewest colours needed so that the two ends of every edge differ. The graph has uncountably many vertices, but a 1951 theorem of de Bruijn and Erdős says that, for a fixed finite $k$, it can be properly $k$-coloured exactly when every finite piece of it can. So a lower bound can always be witnessed by a finite set of points, in principle. [1][17]

Two colours fail at once: an equilateral triangle of side one needs three. Three colours fail because of the Moser spindle, seven points joined by eleven unit segments, two rhombuses made of equilateral triangles hinged at a common point and rotated until their far tips are one unit apart. Any three-colouring forces the two far tips to share a colour, and they are at distance one. So four colours are needed. That was Nelson's lower bound. [1][18]

Seven colours suffice. Tile the plane with regular hexagons of diameter slightly less than one, and colour them in a repeating pattern of seven so that two hexagons of the same colour are always more than one unit apart. OpenAI's paper gives the exact version: hexagons of circumradius $\tfrac25$, with the seven colours assigned by an index-seven sublattice of the hexagon centres, boundary points included. Points inside one hexagon are at most $\tfrac45$ apart; points in two same-coloured hexagons are at least $(\sqrt{21}-2)\cdot\tfrac25>1$ apart. John Isbell found this in 1950, and Hadwiger had published the same seven-colouring in a different context in 1945. [1][18]

## Why it stayed open

### Seventy-six years at four

From 1950 to 2018 neither bound moved. The problem became famous as much for its resistance as for its simplicity, and Soifer's 2009 book *The Mathematical Coloring Book* devotes hundreds of pages to it. Erdős returned to it repeatedly; it is Problem 508 in Bloom's database of his problems. [8][18]

In April 2018 de Grey posted a unit-distance graph with 20,425 vertices that cannot be four-coloured, built from copies of small hexagonally symmetric pieces and checked by computer, and quickly cut it to 1,581 vertices. A Polymath project formed to shrink it further: Marijn Heule reached 553 vertices with satisfiability solvers, and Jaan Parts reached 509 in 2020 and also gave a proof a human can verify. Exoo and Ismailescu found an alternative proof of the bound five. The project set itself the next goal, a finite graph forcing six colours, and did not find one. Twelve days before OpenAI's release, de Grey asked the group whether anyone had started using AI to search for such graphs. [1][3][6][7][9]

A parallel history exists for well-behaved colourings. If every colour class must be Lebesgue measurable, meaning it has a well-defined area, far more is known. Kenneth Falconer proved in 1981 that such colourings need at least five colours, thirty-seven years before anyone could say so without the measurability condition. The reason the two problems are different is sharp. Payne showed in 2009 that the graph on the plane whose edges join points differing by a unit vector with rational coordinates can be two-coloured, but needs five colours if the classes must be measurable. So one cannot simply assume colourings are measurable. For colourings by regions with reasonable boundaries, Townsend proved six colours are needed, and Sokolov and Voronov proved seven in 2025. [1][5][11][12]

The obstacle, then, had two faces. An arbitrary colouring has no structure to work with, no density points, no boundaries. A measurable colouring has structure, but its boundaries can be too irregular to treat as a map. [1]

## What OpenAI claims

**Theorem 1.1** (OpenAI, 23 September 2026). The Euclidean plane has no proper five-colouring, even when arbitrary colour classes are allowed. Consequently

$$
6\le\chi(\mathbb R^{2})\le7.
$$

The proof works in ZFC, ordinary set theory with the axiom of choice. [1]

The theorem rests on two further results. A weak measurable $k$-colouring is a Lebesgue measurable function $c$ into $\{1,\ldots,k\}$ whose monochromatic unit pairs have measure zero: for every radius $R$,

$$
\sum_{i=1}^{k}\int_{B(0,R)}\int_{S^{1}}\mathbf 1_{A_i}(x)\,\mathbf 1_{A_i}(x+u)\,d\sigma(u)\,dx=0,
$$

where $A_i$ is the $i$th colour class and $\sigma$ is normalized arc length on the unit circle. Exceptional unit pairs are allowed, as long as they are negligible. [1]

**Theorem 1.3** (transfer). For every $k$, a proper $k$-colouring of the plane exists if and only if a weak measurable $k$-colouring exists. [1]

**Theorem 1.4.** There is no weak measurable five-colouring of the plane. [1]

Together these give Theorem 1.1. The transfer theorem is the new idea, and it holds for every number of colours, so it also says that the chromatic number of the plane equals its weak measurable chromatic number. In its weak form it answers the question left open since Falconer of whether the two problems are the same. [1]

What the theorem does not say. It does not decide between six and seven. It produces no finite six-chromatic unit-distance graph; de Bruijn and Erdős guarantee that one exists, but the paper says "the graph and the positive constant here are existential". A corollary turns this into a quantitative statement: there is a $\delta>0$ such that every five-colouring has monochromatic unit pairs in proportion at least $\delta$ under any invariant mean, but $\delta$ is not computed. The paper also notes, in a footnote, that a May 2026 manuscript announcing $\chi(\mathbb R^{2})=7$ relies on a density bound that fails for a half-open arc of the unit circle, so that question remains open. [1]

## How the claimed proof goes

What follows is a map of the paper's structure, taken from its introduction and section plan. It is not a check of the details. [1]

**The plan.** Suppose a proper five-colouring exists. Step one turns it into a weak measurable five-colouring (Theorem 1.3, the hard direction). Step two shows that a weak measurable five-colouring forces, at some point of the plane, a configuration of colour boundaries that cannot exist (Theorem 1.4). The two steps use different mathematics: the first is ergodic theory and harmonic analysis on groups, the second is geometric measure theory and planar topology. [1]

**From arbitrary labels to measurable fields.** Instead of the whole plane, start with the countable set $E$ of points whose coordinates are real algebraic numbers, and the countable group $K$ of rotations by algebraic unit complex numbers. Restrict the colouring to $E$ and average it over translations and rotations. Because this group is amenable, the averages converge to a probability law on proper labellings of $E$ that is invariant under all these symmetries. The indicator of each colour, viewed as a random variable under this law, splits by the spectral theorem into a part carried by the ordinary continuous characters $z\mapsto e^{i\xi\cdot z}$ of the plane and a remainder carried by the "wild" characters of $E$ as a discrete group. [1]

**The rigidity theorem.** The central new statement, Theorem 2.3, says that every $K$-invariant probability measure on the dual group of $E$ that gives the continuous characters measure zero must be Haar measure, the uniform distribution. Haar measure has vanishing Fourier coefficients at every nonzero point of $E$, so the wild remainder is uncorrelated with all its nonzero algebraic translates and can be thrown away without destroying the unit-distance exclusions. What is left lives on a factor where translations extend continuously to the whole plane, and a sampled version gives a measurable colouring with monochromatic unit pairs of measure zero. The paper explains why this cannot be a free lunch: Payne's rational example shows the analogue fails for rational rotations. Real algebraic rotations generate the whole field $E$; rational ones do not. [1]

The proof of rigidity uses the Furstenberg-Zimmer theory of compact extensions in ergodic theory. Along a tower of compact factors, the difference of two independently sampled characters stays wild; its Fourier coefficient is nonnegative and radial; two identities among sums of algebraic unit directions give a difference inequality; and a number-field argument turns any positive value at one radius into a positive lower bound on a whole interval of radii, contradicting vanishing line averages. [1]

**The easy direction.** Going back from weak measurable to proper uses density points. Lebesgue's density theorem gives every measurable colour class points where it has density one, and such points can carry no monochromatic unit pair. A translation places any finite configuration among typical points, and de Bruijn-Erdős compactness colours the whole plane. This adapts the method Falconer and Payne used. [1]

**From measurable to impossible.** Now fix a weak measurable five-colouring and a point $x$. Look at the colours seen on small circles around nearby points as those circles shrink toward radius one and the points converge to $x$. The set of colours appearing with positive weight in a given direction is called the palette. Section 5 shows that at every centre, almost every direction has a palette of at most two colours. Section 6 records how colours change from one direction to the next in a finite graph at each centre, and proves that the centres where this graph contains a cycle form a closed, locally finite set. Section 7 smooths the colour indicators, shows that away from small disks the result is a continuous map into the complete graph on five labels treated as a network of edges, and uses a planar covering argument to force a loop around one of the cyclic centres. That loop yields compact connected sets of colour boundary meeting at a common point, each carrying two labels, and both labels are absent from a connected annular region around each set. [1]

**The three cases.** A simple cycle on five labels has length three, four or five. Section 8 excludes each by looking at the colours allowed just inside and just outside the unit circle around $x$ in the limiting directions. A five-cycle gives incompatible angular words of six positions. A four-cycle gives two antipodal pairs of directions and an impossible parity. A three-cycle forces six alternating sectors for the two outside labels and leaves an open region using only three colours, into which the paper places all seven vertices of the Moser spindle by an explicit rational certificate. Each case is a contradiction, so no weak measurable five-colouring exists. [1]

Where would an expert look first? At Theorem 2.3 and the number-field lemma behind it, since the whole transfer rests on it and the rational counterexample shows the margin is thin; at Proposition 4.2, the passage from a proper colouring to a weak measurable one; and at the topological extraction of continua in Sections 7 and 8, where the paper assumes nothing about colour boundaries and has to build them. [1]

## Consequences inside mathematics

If the proof holds, the chromatic number of the plane is six or seven, and the measurable and unrestricted problems are the same problem in the weak sense, for every number of colours. The latter resolves in that form a question that goes back to Falconer in 1981 and to Székely's 1984 conjecture that the two chromatic numbers might differ. A finite unit-distance graph needing six colours exists, though nobody has one. James Davies posted a 47-page paper on 8 October proving by a different method that the ordinary and measurable chromatic numbers agree in dimensions four and above, with the hope of reaching dimension two by his route; he writes that he posted early because of OpenAI's release. Vsevolod Voronov reported on 9 October that colleagues have an AI-assisted argument for dimension three that "may contain errors". [1][9][10]

## Uses outside mathematics

No known direct application.

The problem is a question about the geometry of the plane, and its answer changes no computation. Unit-distance graphs appear in some frequency-assignment and sensor-placement models, but those use finite graphs and specific distances, and the theorem concerns the infinite plane at one distance. [1]

## Has anyone checked it?

The people best placed to read this paper are reading it in public. On 6 October Dustin Mixon posted the news to the eighteenth thread of the Polymath16 project, the group that shrank de Grey's graph. On 8 October Aubrey de Grey wrote: "OK guys, let's have a proper stab at understanding this paper – if anyone can do so it's us", and began with Definition 1.2 and Theorem 1.3, asking whether the transfer was "just Erdős-de Bruijn". On 9 October Vsevolod Voronov, coauthor of the 2025 seven-colour theorem for map-type colourings, explained the definition and added: "I tried to do something similar and was practically certain that this is possible for the measurable case. But since I was busy with two other problems, there was no chance to get there earlier." A third commenter, who says he is not a mathematician, posted a conditional extension to three dimensions worked out with an AI model. None of them has said the proof is correct. These are named experts working through the argument, which is what Uruk's label "under review" means. [9]

Gil Kalai reported the claim on his blog on 7 October, with the general disclaimer that the release's proofs need checking. Joshua Zelinsky commented on LessWrong that the paper's central definition is not new and that related work from 2014 goes uncited, while crediting the transfer theorem as the new idea. One reader described the proof on 7 October as "totally unbelievable alien math". VibeMathed records that no independent mathematician has checked the result. [13][14][16]

**Machine checking.** The release's Lean statement for the lower bound is fifteen lines. It defines a proper colouring as a function from the complex plane to five labels that separates every pair at distance one, and states that none exists. A second statement of twenty-one lines asserts that a proper seven-colouring exists. Both are listed in the release's catalogue `formalization.yaml`, and the formal proof behind them runs to 46 files, including modules named for the rigidity theorem, the weak colouring, the palettes and the Moser placement. The statement is short enough that anyone who reads Lean can confirm in a minute that it says what the paper says. Two outside parties report having rebuilt the development: an online tracker says it replayed the kernel check on its own machine on 14 October, and a GitHub user reports an independent rebuild with no errors on 9 October. Both are self-reported. A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval. [2][15]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; none of them is this family, and the Lean statements did not change. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [19]

## Sources

1. OpenAI, "The Euclidean plane is not five-colorable", 23 September 2026. Theorem 1.1, Definition 1.2, Theorems 1.3 and 1.4, Theorem 2.3, Corollary 1.5, the footnote on Reed's manuscript, the proof overview and the section plan. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/The-Euclidean-plane-is-not-five-colorable-September-23-2026/paper.pdf
2. OpenAI, Lean scope note for family 158 and the comparator statements `EuclideanFiveColor.lean` and `PlaneColoring.lean` at the pinned commit. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/158.md , https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/EuclideanFiveColor.lean and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/PlaneColoring.lean
3. Aubrey D. N. J. de Grey, "The chromatic number of the plane is at least 5", Geombinatorics 28 (2018), 18-31. The 20,425-vertex and 1,581-vertex graphs and the history in the introduction. https://arxiv.org/abs/1804.02385
4. Erica Klarreich, "Decades-Old Graph Problem Yields to Amateur Mathematician", Quanta Magazine, 17 April 2018. https://www.quantamagazine.org/decades-old-graph-problem-yields-to-amateur-mathematician-20180417/
5. K. J. Falconer, "The realization of distances in measurable subsets covering R^n", Journal of Combinatorial Theory, Series A 31 (1981), 184-189. https://doi.org/10.1016/0097-3165(81)90014-5
6. Marijn J. H. Heule, "Computing small unit-distance graphs with chromatic number 5", Geombinatorics 28 (2018), 32-50. https://arxiv.org/abs/1805.12181
7. Jaan Parts, "Graph minimization, focusing on the example of 5-chromatic unit-distance graphs in the plane", Geombinatorics 29 (2020), 137-166. The 509-vertex graph. https://arxiv.org/abs/2010.12665
8. Thomas Bloom, Erdős Problem #508, erdosproblems.com, last edited 22 January 2026, read 17 October 2026. https://www.erdosproblems.com/508
9. Dustin G. Mixon, "Polymath16, eighteenth thread", Short, Fat Matrices, comments of 6 to 10 October 2026 by Mixon, Aubrey de Grey, Vsevolod Voronov and Carson Crocker. https://dustingmixon.wordpress.com/2026/01/17/polymath16-eighteenth-thread-back-with-a-new-conjecture/
10. James Davies, "Measurable obstructions for unmeasurable colourings", arXiv 2610.12301, 8 October 2026. https://arxiv.org/abs/2610.12301
11. Michael S. Payne, "Unit distance graphs with ambiguous chromatic number", Electronic Journal of Combinatorics 16 (2009), N31. https://doi.org/10.37236/269
12. A. Sokolov and V. Voronov, "On the chromatic number of the plane for map-type colorings", arXiv 2502.01958, February 2025. https://arxiv.org/abs/2502.01958
13. Gil Kalai, "Updates: Sharing AI progress on mathematics (amazing!); and my lecture plans", Combinatorics and more, 7 October 2026. https://gilkalai.wordpress.com/2026/10/07/updates-sharing-ai-progress-on-mathematics-amazing-and-my-lecture-plans/
14. VibeMathed, "The Euclidean plane is not five-colorable", read 17 October 2026. https://vibemathed.com/problem/hadwiger-nelson-not-five-colorable
15. Erdős Problem a Day, entry for Problem 508, 14 October 2026, reporting an AI-run review and a kernel replay; and Sergi Galán's repository reporting an independent rebuild, 9 October 2026. Both self-reported. https://erdosproblemaday.com/day/508-openai-plane-not-five-colorable-refereed and https://github.com/decalion89/chromatic-number-of-the-plane
16. Joshua Zelinsky, comment on LessWrong, October 2026, and Dmitry Rybin, post on X, 7 October 2026, as quoted in the StratIQX case study "Five Colours Are Not Enough", read 17 October 2026. https://uc-328.stratiqx.com/
17. N. G. de Bruijn and P. Erdős, "A colour problem for infinite graphs and a problem in the theory of relations", Indagationes Mathematicae 13 (1951), 371-373.
18. Wikipedia, "Hadwiger-Nelson problem", read 17 October 2026. Nelson, Isbell and Hadwiger, the Moser spindle, the hexagonal seven-colouring and Soifer's book. https://en.wikipedia.org/wiki/Hadwiger%E2%80%93Nelson_problem
19. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
