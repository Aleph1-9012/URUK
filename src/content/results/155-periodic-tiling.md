---
family: "155"
topic: "Periodic tiling in three dimensions"
title: "If a shape can fill space, must it be able to fill space in a repeating pattern?"
paperTitle: "A translational tile with no fully periodic tiling in dimension three"
claim: "There is a finite set T in Z^3 that tiles Z^3 by translations but admits no fully periodic tiling, and its unit-cube thickening tiles R^3 by translations, even with arbitrary real translation vectors, without any fully periodic tiling. This disproves the periodic tiling conjecture in dimension three, the smallest lattice dimension where it can fail."
status: unreviewed
checked: 2026-10-18
papers:
  - preprints/A-translational-tile-with-no-fully-periodic-tiling-in-dimension-three-September-23-2026/paper.pdf
draft: false
---

Take a shape, make endless copies, and slide them around without turning until they cover all of space with no gaps and no overlaps. Squares do this, hexagons do this, so do many stranger shapes. Every shape anyone had found that can fill space this way can also do it in a repeating pattern, like wallpaper. The periodic tiling conjecture, stated explicitly by Lagarias and Wang in 1996, says that is always so: if a shape tiles by translation at all, it tiles periodically. It is true on a line, by a 1977 theorem of Newman, and true in the plane, by a 2020 theorem of Bhattacharya. In 2022 Rachel Greenfeld and Terence Tao shocked the field by disproving it in some enormous unspecified number of dimensions, using a tile whose tilings must solve a Sudoku-like puzzle that has no periodic solution. The question became whether the conjecture could fail in the first dimension where it was open, our own three. On 23 September 2026 OpenAI posted a twenty-six-page paper claiming a three-dimensional counterexample. [1][3][4][5][6]

As of 18 October 2026 no mathematician has said publicly that they have read or checked the proof. The status on this page is "unreviewed".

## The problem

Work first in the integer grid $\mathbb Z^{3}$, the set of points with whole-number coordinates. A finite set $T$ of grid points is a translational tile if there is a set $A$ of translation vectors such that every grid point is $a+t$ for exactly one $a\in A$ and one $t\in T$; one writes $A\oplus T=\mathbb Z^{3}$. The tiling is fully periodic if $A$ is unchanged by shifting along every vector of some subgroup of finite index, which in $\mathbb Z^{3}$ means along three independent directions. In ordinary space $\mathbb R^{3}$, a bounded measurable set tiles by translation if its translates partition space up to sets of measure zero, and full periodicity means the translation set is invariant under a lattice of full rank. [1]

A tile can have both kinds of tilings. Dominoes laid in rows, with each row shifted at random, repeat sideways but not vertically; aligned rows repeat both ways. The conjecture is about the tile, not a particular tiling: it asks whether at least one periodic tiling exists. [1]

**The periodic tiling conjecture.** Every translational tile admits a fully periodic tiling. [1][3]

What was known. Newman proved in 1977 that every tiling of $\mathbb Z$ by a finite tile is periodic. Bhattacharya proved in 2020 that every finite tile of $\mathbb Z^{2}$ admits a periodic tiling, and Greenfeld and Tao gave a quantitative version and a structure theorem for planar tilings. In $\mathbb R^{2}$, the conjecture is known for polyominoes without holes and for rational polygonal sets, but not for arbitrary measurable tiles. Greenfeld and Tao's 2024 Annals paper disproved the conjecture in sufficiently large dimension, both in $\mathbb Z^{d}$ and in $\mathbb R^{d}$. So dimension three was the smallest lattice dimension where the answer was unknown. [1][4][5][6]

This is a different question from the famous "einstein" problem solved in 2023 by the hat tile, which tiles the plane only aperiodically. The hat is allowed to rotate and reflect; here copies may only slide. For translations alone, no aperiodic tile exists in the planar integer grid, by Bhattacharya's theorem, and none among rational polygons. [1][4][10]

<!-- uruk:visual-note
A visual for this page can show a tile and its translates filling a region, then a periodic translation set as a lattice of dots, then a non-periodic one; a second view can show the Sudoku array, columns with no repeating pattern down them, that the construction encodes. The paper describes the tile only implicitly, as a union of component shapes with a large common part, so a faithful picture would have to be built from Section 7.
-->

## Why it stayed open

### Why dimension three was hard

Greenfeld and Tao's counterexample first lives in $\mathbb Z^{2}\times G_0$, where $G_0$ is a finite abelian group of order a power of two, and is then lifted to a lattice. The lift costs dimensions: a group that needs several generators needs several extra integer coordinates. Their construction encodes a Sudoku rule, an arithmetic constraint along every line of integer slope through a rectangular array, with the property that solutions exist but none is periodic in the vertical direction, and turns the rule into a system of tiling equations that all share the same unknown translation set. Combining several equations into one is their trick, and the undecidability paper that followed gave a $p$-adic version of the Sudoku. To get to $\mathbb Z^{3}$ one needs the finite group to be cyclic, so that it can be represented by a single third coordinate; a 2025 note of Meyerovitch, Sanadhya and Solomon makes precise why $\mathbb Z^{2}\times(\text{cyclic})$ is the right quotient of $\mathbb Z^{3}$. Nobody had managed to carry out the whole encoding with a cyclic group. [1][5][7][8]

## What OpenAI claims

**Theorem 1.1** (OpenAI, 23 September 2026). There is a finite nonempty set $T\subset\mathbb Z^{3}$ such that:

1. $T$ tiles $\mathbb Z^{3}$ by translations, but no translation set $A$ with $A\oplus T=\mathbb Z^{3}$ is invariant under a subgroup of finite index in $\mathbb Z^{3}$;
2. the set $\Omega=T+[0,1]^{3}$ tiles $\mathbb R^{3}$ by translations up to null sets, but no such tiling has a translation set invariant under a lattice of full rank in $\mathbb R^{3}$. [1]

What this does and does not say. "Periodic" means fully periodic, in three independent directions; the paper does not claim that the tile has no tiling with a single period, and it does not claim the tile is connected. The Euclidean statement allows arbitrary real translation vectors rather than integer ones alone, which requires its own argument. The paper uses Newman's and Bhattacharya's theorems only to say that three is the least possible lattice dimension; it reproves neither. [1]

## How the claimed proof goes

What follows is a map of the argument, from the paper's introduction and from Sections 2 to 7. It is not a check of the details. [1]

**The idea.** Follow Greenfeld and Tao's strategy, a Sudoku-like rule whose solutions cannot be periodic, encoded as tiling equations, consolidated into a single tile, but design the encoding so that the finite group factor is cyclic at every stage. Then the tile lives in $\mathbb Z^{2}\times\mathbb Z/Q$, which is a quotient of $\mathbb Z^{3}$, and a direct rigidification argument lifts the counterexample to $\mathbb Z^{3}$ and to its unit-cube thickening in $\mathbb R^{3}$. Greenfeld and Tao's original construction lands in $\mathbb Z^{2}\times G_0$ with $G_0$ a finite abelian $2$-group needing many generators, which is why their dimension was large; keeping the factor cyclic is the paper's central technical point. [1]

**Step 1: the word rule (Section 2).** Fix a prime $p>200$, set $N=p^{2}$, alphabet $\Sigma=\mathbb F_p^{\times}$ and column interval $I=\{0,\dots,N-1\}$. A word $w:I\to\Sigma$ is allowed if there are integers $a,b$, not both divisible by $p$, with $w(n)\equiv an+b$ when $p\nmid an+b$, $w(n)\equiv(an+b)/p$ when $p$ divides $an+b$ exactly once, and arbitrary when $p^{2}\mid an+b$: the word reads off the last nonzero base-$p$ digit of an affine function. An array $W:I\times\mathbb Z\to\Sigma$ satisfies the line rule if $n\mapsto W(n,dn+e)$ is allowed for every integer slope $d$ and intercept $e$; this is the two-digit $p$-adic Sudoku rule of Greenfeld and Tao. The Global Affine Approximation lemma finds $A,B,C\in\mathbb F_p$, not all zero, with $W(n,m)=An+Bm+C$ wherever that form is nonzero, by locating a $4\times4$ square free of exceptional cells for the three slopes $0,\pm1$ and propagating. The Vertical-Period Obstruction (Proposition 2.4) then shows that no array satisfying the line rule with every column nonconstant has a positive vertical period: take a minimal period $M$, normalize the affine approximation to $Bm$ by a shear $W(n,m+un+v)$ that preserves the line rule, pass to $W_1(n,m)=W(n,pm)$, which again satisfies the rule and has a nonzero approximation with $B_1\ne0$, and descend; $p\mid M$ at each stage, so the minimal period cannot exist. A last-nonzero-digit model (Lemma 2.5) shows that an array with every column nonconstant does exist. [1]

**Step 2: a cyclic encoding (Section 3).** The channels are the $N$ ordinary positions plus two seeds $\eta_1,\eta_2$. To each channel $i$ are attached two primes $a_i,b_i$ and the group $P_i=\mathbb Z/a_i\times\mathbb Z/b_i$, with $a_{\eta_1}=2$, $a_{\eta_2}=3$ and the seed $b$'s larger than $D=p^{4}$, the number of residue pairs of the horizontal variable; to each input digit $j\in J_i=\Sigma$ a further prime $r_{ij}=A_{ij}a_i+B_{ij}b_i$ with nonnegative integer coefficients, which exists by the Frobenius coin argument since there are arbitrarily large primes outside any finite set. All these primes are distinct, so the product $K\times P$ of the cyclic groups $\mathbb Z/r_{ij}$ and $P_i$ is itself cyclic. A symbol $j$ is active at position $i$ in a given solution when changing the digit in coordinate $r_{ij}$ can change the output; a solution may activate several symbols at once, and every constraint is imposed on every resulting choice. The Exclusion lemma (3.2) is a cycle test ruling out forbidden simultaneous dependencies, so that the active symbols along any line form an allowed word. [1]

**Step 3: forcing activity and excluding periodicity (Section 4).** A shift list with two fibre orderings and "activation tiles" built on the product of the two prime-order groups, with uniform coordinate counts, force at least one active symbol at every ordinary position (Ordinary Activation) and force the seeds to display the constant words $1$ and $2$ somewhere, which makes every column of the extracted array nonconstant (Seed Activation). Proposition 4.4 then extracts from any fully periodic common solution a line array satisfying the word rule with nonconstant columns and a vertical period, which Step 1 forbids. [1]

**Step 4: a common solution (Section 5).** The system consists of several tiling equations with the same unknown translation set, and separate solutions would not do. Section 5 constructs one explicit common solution: labelled blocks with an inverse map (Block Inverse lemma), seed regions with one common output function used by both seed tests, and a case analysis according to whether the seed is active at the source, ending in Theorem 5.2 that all the equations are compatible. The explicit solution activates exactly one symbol at each position. This is what proves the tile actually tiles. [1]

**Step 5: stacking (Section 6).** Following Greenfeld and Tao's consolidation of simultaneous tiling equations into one, the finitely many equations are stacked along a fresh prime cyclic group $\mathbb Z/q$: Lemma 6.1 gives, for every $s$ and every finite set of excluded primes, a prime $q$ and a partition $\mathbb Z/q=E_1\sqcup\dots\sqcup E_s$ with $E_\nu-E_\nu=\mathbb Z/q$ for every part, and Proposition 6.2 shows that the stacked tile in $\mathbb Z^{2}\times\mathbb Z/Q$ tiles exactly when the system has a common solution and is fully periodic exactly when the solution is. Since $q$ is a fresh prime, the finite factor stays cyclic. [1]

**Step 6: to $\mathbb Z^{3}$ and $\mathbb R^{3}$ (Section 7).** With $\pi:\mathbb Z^{3}\to\mathbb Z^{2}\times\mathbb Z/Q$ the reduction of the third coordinate and $w=(0,0,Q)$ generating its kernel, choose a transversal $U\subset\mathbb Z^{3}$ mapping bijectively onto the tile $F$, with "rigid representatives" chosen so that its difference set is large (Lemma 7.1). Proposition 7.2 shows the lifted tile tiles $\mathbb Z^{3}$. For the Euclidean statement the tile has two component shapes with the same large common part $\Omega_*$ and one displaced marked cube. In a hypothetical tiling of $\mathbb R^{3}$ by real translates that is invariant under a full-rank lattice, Lemma 7.4 shows the set of centres is a translated grid $c_0+m\mathbb Z^{3}$: two copies cannot share a centre because both contain the positive-volume common part, and a difference of centres that is not in $m\mathbb Z^{3}$ would be within distance one of a difference of two common-part cubes, forcing an overlap. Coverage of the marked cubes then forces invariance under the kernel $\mathbb Zw$, so the tiling descends to the quotient, where Step 5 has excluded it (Proposition 7.5, kernel invariance and descent). This is why the theorem covers arbitrary real translation vectors, integer or not. [1]

Where would an expert look first? At the cyclic encoding in Section 3, to confirm that the cycle and activation tests force exactly the word rule while every group factor stays coprime; at the explicit common solution in Section 5, which is where tileability is proved; at the grid-centres lemma in Section 7, since the Euclidean statement rests on it; and at the vertical-period obstruction's rescaling step, where $B_1\ne0$ must be shown. [1]

## Consequences inside mathematics

If the proof holds, the periodic tiling conjecture is false in $\mathbb Z^{3}$ and $\mathbb R^{3}$, and since it is true in dimensions one and two, the dividing line is exactly known for lattices. A corollary of Greenfeld and Tao's framework is that the translational tiling problem is undecidable in high dimension; whether undecidability also descends to dimension three is a separate question that this paper does not claim to answer. In $\mathbb R^{2}$ the conjecture remains open for general measurable tiles. [1][5][7]

## Uses outside mathematics

No known direct application.

Aperiodic tilings have physical cousins, the quasicrystals, but those come from rotational constraints and from shapes that may be turned, not from a translational tile in the integer grid. [10]

## Has anyone checked it?

We found no named mathematician who says they are reading or checking this paper. Terence Tao, whose work with Greenfeld the proof follows, posted a four-part thread on 6 October about what he called "Math 1.0" and "Math 2.0" in the age of AI-solved problems; it names no result and does not mention this one. We found nothing from Greenfeld, Bhattacharya or Lagarias. A video presenter has built models of the tile in Minecraft using an AI's reading of the paper; that is illustration, not review. VibeMathed records no check by an independent mathematician. [9][11]

**Machine checking.** The release's Lean statement `PeriodicTilingThree.lean` is 66 lines and is listed in the catalogue `formalization.yaml`. It defines tiling, full periodicity, the unit-cube thickening and almost-everywhere tiling of $\mathbb R^{3}$, states both parts of Theorem 1.1, and adds a clause the paper does not prove: that $3$ is the least dimension with such a tile. The formal development behind it, 122 files, therefore has to contain its own proofs for dimensions one and two, which are Newman's and Bhattacharya's theorems; files named `OneDimensional`, `PlanarPeriodicity` and `LowerDimensions` are present. A reader who wants to know what has been machine-checked should look there. We found no outside replay. A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval. [2]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; this paper is not among them. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [12]

## Sources

1. OpenAI, "A translational tile with no fully periodic tiling in dimension three", 23 September 2026. Abstract, Theorem 1.1 and the introduction. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/A-translational-tile-with-no-fully-periodic-tiling-in-dimension-three-September-23-2026/paper.pdf
2. OpenAI, Lean scope note for family 155 and the comparator statement `PeriodicTilingThree.lean` at the pinned commit, with the proof directory `lean/OAI/Geometry/PeriodicTiling/`. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/155.md , https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/PeriodicTilingThree.lean and https://github.com/openai/math/tree/4eaee87548250b2682affda7d05d947c05554bae/lean/OAI/Geometry/PeriodicTiling
3. Jeffrey C. Lagarias and Yang Wang, "Tiling the line with translates of one tile", Inventiones Mathematicae 124 (1996), 341-365. The conjecture is stated on page 346. https://doi.org/10.1007/s002220050056
4. Siddhartha Bhattacharya, "Periodicity and decidability of tilings of Z²", American Journal of Mathematics 142 (2020), 255-266. https://doi.org/10.1353/ajm.2020.0006
5. Rachel Greenfeld and Terence Tao, "A counterexample to the periodic tiling conjecture", Annals of Mathematics 200 (2024), 301-363. https://doi.org/10.4007/annals.2024.200.1.5
6. Donald J. Newman, "Tesselation of integers", Journal of Number Theory 9 (1977), 107-111. https://doi.org/10.1016/0022-314X(77)90054-3
7. Rachel Greenfeld and Terence Tao, "Undecidability of translational monotilings", Journal of the European Mathematical Society (2025); arXiv:2309.09504. https://arxiv.org/abs/2309.09504
8. Tom Meyerovitch, Shrey Sanadhya and Yaar Solomon, "A note on reduction of tiling problems", Israel Journal of Mathematics 267 (2025), 421-435. https://doi.org/10.1007/s11856-025-2716-3
9. Terence Tao, Mathstodon thread of 6 October 2026 on "Math 1.0" and "Math 2.0", as summarized with quotations by Techmeme and AI/TLDR, read 18 October 2026. https://www.techmeme.com/261006/p42
10. David Smith, Joseph Samuel Myers, Craig S. Kaplan and Chaim Goodman-Strauss, "An aperiodic monotile", arXiv:2303.10798 (2023). https://arxiv.org/abs/2303.10798
11. VibeMathed, "Periodic tiling conjecture, dimension three", read 18 October 2026. https://vibemathed.com/problem/periodic-tiling-conjecture-dimension-three
12. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
