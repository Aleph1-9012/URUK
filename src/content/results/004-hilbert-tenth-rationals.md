---
family: "004"
topic: "Hilbert's tenth problem over the rationals"
title: "Can a computer always tell whether an equation has a solution in fractions?"
paperTitle: "Hilbert's tenth problem over the rational numbers"
claim: "There is no algorithm which, given a polynomial with integer coefficients in any number of variables, decides whether it has a zero in the rational numbers."
status: unreviewed
checked: 2026-10-17
papers:
  - preprints/Hilberts-tenth-problem-over-the-rational-numbers-October-6-2026/main.pdf
  - preprints/A-pointwise-2-converse-for-elliptic-curves-with-rational-two-torsion-October-7-2026/paper.pdf
draft: false
---

In 1900 David Hilbert asked for a procedure that decides, for any polynomial equation with whole-number coefficients, whether it has a solution in whole numbers. Seventy years later Yuri Matiyasevich, building on work of Martin Davis, Hilary Putnam and Julia Robinson, proved that no such procedure can exist. The same question for solutions in fractions then stayed open for fifty-six more years, and the obvious way to transfer the answer was blocked by a conjecture of Barry Mazur. On 24 September 2026 OpenAI posted a paper claiming that the answer for fractions is also no. The proof does not go through the blocked route. It leans on two other unrefereed papers from the same release, one of them a major theorem in its own right. [1][2][5]

As of 17 October 2026 no mathematician has said publicly that they have checked the proof. One specialist has commented on its strategy. The status on this page is "unreviewed".

## The problem

A Diophantine equation is a polynomial equation with integer coefficients, such as $x^{2}+y^{2}=2$. Its rational solutions are those in fractions. Some equations have none: $x^{2}=2$ has no rational solution, because $\sqrt2$ is irrational. Some gain solutions when fractions are allowed. The equation $x^{3}+y^{3}=6$ has no solution in integers, since every cube leaves remainder $0$, $1$ or $8$ on division by $9$, so a sum of two cubes leaves $0$, $1$, $2$, $7$ or $8$, never $6$. But it does have one in fractions: $\bigl(\tfrac{17}{21}\bigr)^{3}+\bigl(\tfrac{37}{21}\bigr)^{3}=\tfrac{4913+50653}{9261}=6$. Others look similar and have none. $x^{2}+y^{2}=3$ has no rational solution: clearing denominators gives $a^{2}+b^{2}=3c^{2}$ in integers with no common factor, and since squares leave remainder $0$ or $1$ on division by $3$, both $a$ and $b$ must be multiples of $3$, so $9$ divides $3c^{2}$, $3$ divides $c$, and the three numbers had a common factor after all.

**Hilbert's tenth problem over $\mathbb Q$.** Is there an algorithm that takes any polynomial $f\in\mathbb Z[X_1,\ldots,X_n]$, with $n$ part of the input, and decides whether $f$ has a zero in $\mathbb Q^{n}$? [1]

Half of such an algorithm is easy. List all tuples of fractions in some order and test each one. If a solution exists, the search finds it. But if none exists, the search runs forever and never says so. The problem is whether something can always certify that there is no solution. For $x^{2}+y^{2}=3$ the remainder argument above is such a certificate. The question is whether a certificate always exists and can always be found. [1]

<!-- uruk:visual-note
A visual for this page can let the reader type an equation in two variables and watch a search through fractions of growing size, marking any solutions it finds on a plane. For $x^{3}+y^{3}=6$ it finds $(\tfrac{17}{21},\tfrac{37}{21})$ quickly. For $x^{2}+y^{2}=3$ it finds nothing, and the reader can see that a finite search cannot tell "none yet" from "none ever". That is the gap the theorem is about. The visual says nothing about why no algorithm can close the gap.
-->

## Why it stayed open

### A century of the question

Hilbert posed the integer problem as the tenth of his twenty-three problems in 1900. Davis, Putnam and Robinson proved in 1961 that every computably listable set of integers can be described by an equation that also uses exponentiation. Matiyasevich removed the exponentiation in 1970. The result, often called the MRDP theorem, says that integer polynomial equations can imitate any computer program, so deciding them would decide which programs halt, which Turing showed is impossible. [1][5][6]

For fractions the obvious plan is to reuse this. If the integers could be picked out inside the rationals by a polynomial equation, that is, if some equation had a rational solution in its extra variables exactly when its first variable was an integer, then every integer equation could be turned into a rational one, and the integer theorem would transfer. Logicians call such a description an existential definition of $\mathbb Z$ in $\mathbb Q$, and they made steady progress on defining $\mathbb Z$ with more complicated formulas. Julia Robinson showed in 1949 that the integers are definable in the rationals by a first-order formula, which already makes the full first-order theory of the rationals undecidable. Bjorn Poonen found a definition with two universal quantifiers followed by existential ones in 2009, and Jochen Koenigsmann found a purely universal one in 2016. None of these is existential, which is what the transfer needs. [1][7][8][9]

There is a reason to think none ever will be. Barry Mazur conjectured in the 1990s that for any variety over $\mathbb Q$, the closure of its rational points in its real points has only finitely many connected pieces. He observed that this would rule out an existential definition of $\mathbb Z$ in $\mathbb Q$, and Cornelissen and Zahidi showed in 2000 that it would rule out even an existential model of integer arithmetic in some power of $\mathbb Q$. If Mazur is right, the problem needs a different idea. [1][5]

Meanwhile neighbouring rings fell. Poonen proved in 2003 that the problem is undecidable for large subrings of $\mathbb Q$, rings of fractions whose denominators use only primes from a set of density one. For the rings of integers of number fields, a long programme using elliptic curves of rank one was recently completed by Koymans and Pagano, using additive combinatorics, and by a different route by Alpöge, Bhargava, Ho and Shnidman. Those rings are finitely generated algebras, which $\mathbb Q$ is not. In 2025 Garcia-Fritz, Pasten and Vidaux proved undecidability for the rationals with an extra predicate comparing the heights of fractions, where the height of $a/b$ in lowest terms is $\log\max(|a|,|b|)$, a measure of how complicated the fraction is. [1][10][11][12]

## What OpenAI claims

**Theorem 1.1** (OpenAI, 24 September 2026). There is no algorithm which, given a polynomial $f\in\mathbb Z[X_1,\ldots,X_n]$, with $n$ part of the input, decides whether $f$ has a zero in $\mathbb Q^{n}$. [1]

**Corollary** (Section 7). The set of integer polynomials with a rational zero has Turing degree $0'$, the degree of the halting problem. The same holds when the input is restricted to polynomials of total degree at most four, or to sums of squares of polynomials of degree at most two. [1]

What it does and does not say. The reduction from integer equations is a Turing reduction, which may ask the hypothetical rational oracle many questions, not a translation of each integer equation into one rational equation. The paper says explicitly that it "gives no single existential definition of $\mathbb Z$ in $\mathbb Q$", so it neither proves nor contradicts Mazur's conjecture. It gives no bound on the number of variables, so it says nothing about equations in a few variables, such as curves. And undecidability for the whole class does not make any particular equation hard. [1]

## How the claimed proof goes

What follows is a map of the paper's strategy, from its introduction and section plan. It is not a check of the details. [1]

**The idea in one paragraph.** Instead of a single equation that picks out the integers, the proof uses an endless list of finite tests, each of which a rational-solvability oracle could answer. An integer equation passes every test exactly when it has an integer solution. The hard direction is to show that if an equation has no integer solution, some test fails. The proof does this by supposing all tests pass, building from that an abstract number system in which the equation does have a solution, and then showing that the solution is forced to consist of ordinary integers after all, through a comparison of two ways of measuring size. [1]

**Finite tests instead of a definition.** For each nonconstant integer polynomial $f$, the paper builds a computable list of finite tests, each answerable by finitely many questions of the form "does this equation have a rational solution?". It arranges that $f$ has an integer zero exactly when every test succeeds. Given a rational oracle, one could then run two searches side by side, one for an integer zero and one for a failing test. Exactly one of them would finish, and that would decide integer equations, which is impossible. So the work is to show that a failing test exists whenever $f$ has no integer zero. [1]

**A model where everything passes.** Suppose all the tests pass. By the compactness theorem of logic, there is then a ring $R$ containing a zero $\mathbf a=(a_1,\ldots,a_n)$ of $f$, sitting inside an enlarged copy of the rationals that satisfies all the same first-order statements as $\mathbb Q$ but whose integers ${}^{*}\mathbb Z$ may include infinitely large elements. The tests attach to each $a\in R$ a point on a fixed elliptic curve,

$$
E:\ y^{2}=x^{3}-d^{2}x\quad\text{over}\quad F=\mathbb Q(\sqrt2),\qquad d=75-53\sqrt2,
$$

whose group of points over $F$ has rank one, meaning that every point is a multiple of one generator $P$ plus one of finitely many points of finite order. The tests place the attached point among the multiples of $P$, so it is $\eta(a)P$ for an index $\eta(a)\in{}^{*}\mathbb Z$. The map $\eta$ adds correctly and is injective, but it need not respect multiplication, so the zero of $f$ in $R$ does not directly give a zero among the indices. [1]

**Local comparisons and a height bound.** At suitable primes, comparisons through the curve's formal logarithm, and a second comparison on the conjugate curve, force each ring element to agree locally with its index. A five-point height estimate says that for a fraction $s$ outside five fixed points of the projective line, $h(s)\le H\,M(s)^{c}$, where $M(s)$ is the product of the primes at which $s$ meets those points to odd order. A parity condition, proved through two-descent, controls which primes can occur, and a prime-pattern theorem built on Green, Tao and Ziegler's work on linear equations in primes supplies the primes the tests need. [1]

**The squeeze.** Let $B$ be the largest of the indices $|\eta(a_j)|$. If $f(\eta(a_1),\ldots,\eta(a_n))\neq0$, the local agreement and the height estimate show that every element of $R$ has height at most a fixed constant times $B$. But the height of the $x$-coordinate of $\eta(a_j)P$ grows like a constant times $\eta(a_j)^{2}$. A quantity that grows like $B^{2}$ cannot stay below a constant times $B$ unless $B$ is an ordinary bounded integer. Then the indices are ordinary integers, additivity and injectivity identify them with the $a_j$, and $f$ vanishes at those integers, contradicting $f(\eta(a_1),\ldots,\eta(a_n))\neq0$. So that value is zero, and $f$ has an ordinary integer zero. In other words, if every test passes then $f$ has an integer zero, which is the direction the reduction needed. [1]

**What the proof leans on.** Two steps use other manuscripts from the same release, and we checked how. The parity step applies Theorem 1.1 of the companion "A pointwise 2-converse for elliptic curves with rational two-torsion": an elliptic curve over $\mathbb Q$ with a rational point of order two whose $2$-power Selmer group has corank zero or one has a finite Tate-Shafarevich group. Its proof is self-contained with respect to the release; it says the broader converse in family 006 "is not an input". The paper notes that family 006's unrestricted 2-converse could replace it. The height estimate applies Theorem 1.1 of "Fontaine-Mazur modularity at the prime 2", from family 010, a claimed proof of the odd, regular, two-dimensional Fontaine-Mazur conjecture over $\mathbb Q$ at the prime $2$ with no condition on the residual representation. That paper cites no other release manuscript as an input, but it relies on recent outside results, including theorems of Thorne, Zhang, Pan and Paškūnas-Tung. None of these three OpenAI manuscripts has a Lean formalization or a published expert check. [1][2][3][4][15]

Where would an expert look first? At the Fontaine-Mazur paper, because a residually unrestricted modularity theorem at the prime $2$ would be a major result by itself and everything in the height estimate depends on it; at the transfer of the height estimate and the local comparisons into the nonstandard model, in Sections 2 and 4; and at the parity argument of Section 3, where a Selmer class has to be realized by an actual rational point.

## Consequences inside mathematics

The corollary places rational solvability exactly at the level of the halting problem, and shows that equations of total degree four already carry the full difficulty when the number of variables is free. For integers, degree four was known to suffice since the 1970s, through the same circuit trick the paper uses. [1][6]

The companion theorem is a result in its own right, in the Birch and Swinnerton-Dyer circle of problems. For an elliptic curve over $\mathbb Q$ with a rational point of order two, it says that if the $2$-power Selmer group has corank $0$ or $1$, then the rank of the curve, the order of vanishing of its $L$-function at $s=1$, and that corank all agree, and the Tate-Shafarevich group is finite. It covers curves with and without complex multiplication and allows any reduction type at $2$; the earlier pointwise results at the prime $2$ that the paper surveys concern special families such as curves with complex multiplication. [2]

What stays open. Mazur's conjecture, and with it the question of whether $\mathbb Z$ has an existential definition in $\mathbb Q$, is untouched. The same question for other number fields $K$, whether rational solvability over $K$ is undecidable, is not addressed beyond what follows from known results. Nor is the question of how many variables are needed: over the integers, eleven variables are known to suffice for undecidability, and the paper gives no analogue. [1][5][15]

## Uses outside mathematics

No known direct application.

The theorem limits general-purpose methods. No program can decide rational solvability for every polynomial. It does not make any particular equation hard. Equations in one variable are decided by the rational root theorem, and a single quadratic equation by the Hasse-Minkowski theorem; the paper's corollary shows that degree four is already enough for undecidability once the number of variables is unbounded. It gives no new algorithm and no running-time estimate. [1][13]

## Has anyone checked it?

No named mathematician has said they are reading or checking this proof or its two inputs. The closest is Hector Pasten of the Pontifical Catholic University of Chile, a coauthor of the 2025 height-predicate result. Scientific American reported that the proof uses two of his ideas from different areas and quoted him: "It's extremely surprising to me that they connect" and "Their general strategy is original." That is an expert's comment on the method, not a report that the proof holds. Whether it counts as experts "discussing" the proof, which Uruk's rules allow for the label "under review", is a judgment call; this page uses the stricter reading, under which a named expert must say they are reading or checking it. VibeMathed records that no independent mathematician has checked the result and, noting the two unrefereed companion manuscripts it uses, that "the result is only as solid as they are". [14][15]

**Machine checking.** There is none. The release lists no Lean formalization for this theorem, for the pointwise 2-converse or for the Fontaine-Mazur paper, and there is no scope note for family 004. [15]

The pinned commit is the repository as it stood on 29 October 2026, and its catalogue lists the editions of 6 and 7 October for this paper and the pointwise 2-converse, which the links above follow. The editions read for this page are those of 24 September, which the pinned commit also keeps. We compared the TeX sources: in this paper, the pointwise 2-converse, the Fontaine-Mazur paper and family 006's 2-converse, the only changes are the date and citations updated to point at revised companion editions; the mathematics is unchanged. On 7 October OpenAI withdrew three manuscripts and revised fourteen; none of them is in this family. On 26 October it added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [16]

## Sources

1. OpenAI, "Hilbert's tenth problem over the rational numbers", 24 September 2026, with a citation-only edition of 6 October. Theorem 1.1, Section 1 including the historical setting and proof strategy, Sections 3 to 6, and Section 7 for the Turing degree and quartic form. Both editions at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Hilberts-tenth-problem-over-the-rational-numbers-September-24-2026/main.pdf and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Hilberts-tenth-problem-over-the-rational-numbers-October-6-2026/main.pdf
2. OpenAI, "A pointwise 2-converse for elliptic curves with rational two-torsion", 24 September 2026, with a citation-only edition of 7 October, the companion in family 004. Theorem 1.1 and the remark that the broader converse is not an input. Both editions at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/A-pointwise-2-converse-for-elliptic-curves-with-rational-two-torsion-September-24-2026/paper.pdf and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/A-pointwise-2-converse-for-elliptic-curves-with-rational-two-torsion-October-7-2026/paper.pdf
3. OpenAI, "Fontaine-Mazur modularity at the prime 2", family 010, 23 September 2026. Theorem 1.1 and the background section listing its external inputs. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Fontaine-Mazur-modularity-at-the-prime-2-September-23-2026/paper.pdf
4. OpenAI, "Goldfeld's analytic density conjecture and the 2-converse for elliptic curves", family 006, 23 September 2026. The alternative input named in the remark in Section 3 of [1]. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Goldfelds-analytic-density-conjecture-and-the-2-converse-for-elliptic-curves-September-23-2026/paper.pdf
5. Wikipedia, "Hilbert's tenth problem", read 17 October 2026. Hilbert's wording, the MRDP history and Mazur's conjecture over the rationals. https://en.wikipedia.org/wiki/Hilbert%27s_tenth_problem
6. Martin Davis, "Hilbert's Tenth Problem is Unsolvable", American Mathematical Monthly 80 (1973), 233-269. https://doi.org/10.1080/00029890.1973.11993265
7. Julia Robinson, "Definability and decision problems in arithmetic", Journal of Symbolic Logic 14 (1949), 98-114. https://doi.org/10.2307/2266510
8. Bjorn Poonen, "Characterizing integers among rational numbers with a universal-existential formula", American Journal of Mathematics 131 (2009), 675-682. https://doi.org/10.1353/ajm.0.0057
9. Jochen Koenigsmann, "Defining Z in Q", Annals of Mathematics 183 (2016), 73-93. https://doi.org/10.4007/annals.2016.183.1.2
10. Bjorn Poonen, "Hilbert's Tenth Problem and Mazur's Conjecture for large subrings of Q", Journal of the American Mathematical Society 16 (2003), 981-990. https://doi.org/10.1090/S0894-0347-03-00433-8
11. Peter Koymans and Carlo Pagano, "Hilbert's tenth problem via additive combinatorics", Journal of the American Mathematical Society 40 (2026), 195-234, https://doi.org/10.1090/jams/1081 ; and Levent Alpöge, Manjul Bhargava, Wei Ho and Ari Shnidman, "Rank stability in quadratic extensions and Hilbert's tenth problem for the ring of integers of a number field", Inventiones Mathematicae 243 (2026), 1129-1139, https://doi.org/10.1007/s00222-025-01392-3
12. Natalia Garcia-Fritz, Hector Pasten and Xavier Vidaux, "Effectivity for existence of rational points is undecidable", Journal of Number Theory 276 (2025), 81-97. https://doi.org/10.1016/j.jnt.2025.01.023
13. Wikipedia, "Hasse-Minkowski theorem", read 17 October 2026. https://en.wikipedia.org/wiki/Hasse%E2%80%93Minkowski_theorem
14. Peter Hall and Joseph Howlett, "The most exciting claims from OpenAI's heap of new proofs", Scientific American, 8 October 2026. Pasten's quotations in the section on Hilbert's tenth problem. https://www.scientificamerican.com/article/the-most-exciting-claims-from-openais-heap-of-new-proofs/
15. VibeMathed, "Hilbert's tenth problem over the rational numbers" and "The odd regular two-dimensional Fontaine-Mazur conjecture over Q at p = 2", read 17 October 2026. https://vibemathed.com/problem/hilberts-tenth-problem-over-q and https://vibemathed.com/problem/fontaine-mazur-two-dimensional-p-2
16. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026, and the version notes of the October editions, at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md , https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Hilberts-tenth-problem-over-the-rational-numbers-October-6-2026/README.md and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/A-pointwise-2-converse-for-elliptic-curves-with-rational-two-torsion-October-7-2026/README.md
