---
family: "039"
topic: "Nagata's conjecture"
title: "How low can a curve's degree go if it must pass through ten scattered points, each many times over?"
paperTitle: "Nagata's conjecture for plane curves"
claim: "For r at least 10 points in very general position in the plane, every nonzero curve of degree d passing through the points with multiplicities m_1, ..., m_r satisfies m_1 + ... + m_r < d sqrt(r). This is Nagata's 1959 conjecture in its strict form for arbitrary multiplicities. Companion papers prove the corresponding maximality of multipoint Seshadri constants on every polarized surface and in higher dimensions, for sufficiently many points."
status: approved
checked: 2026-11-03
link: https://arxiv.org/abs/2610.30050
papers:
  - preprints/Nagatas-Conjecture-for-Plane-Curves-September-23-2026/main.pdf
  - preprints/Maximal-Seshadri-Constants-on-Arbitrary-Polarized-Surfaces-September-23-2026/main.pdf
  - preprints/Maximal-Multipoint-Seshadri-Constants-in-Higher-Dimensions-October-5-2026/main.pdf
  - preprints/Maximal-multipoint-Seshadri-constants-in-positive-characteristic-October-5-2026/seshadri-positive-characteristic.pdf
draft: false
visual: curve-budget
---

Mark $r$ points in the plane and ask for an algebraic curve that passes through each of them $m$ times over, meaning the curve has a singular point of multiplicity $m$ there. A curve of degree $d$ has about $d^{2}/2$ free coefficients and each multiple point costs about $m^{2}/2$ of them, so counting suggests that curves exist once $d$ exceeds $m\sqrt r$ and not before. In 1959 Masayoshi Nagata, in the paper that settled Hilbert's fourteenth problem in the negative, conjectured that for ten or more points in general position the count is the truth: no curve does better than $d>m\sqrt r$. He proved it when $r$ is a perfect square at least 16. For every other $r$, ten included, it stayed open for sixty-seven years. On 23 September 2026 OpenAI posted a proof for every $r\ge10$, with unequal multiplicities allowed, and three companion papers extending the same principle to arbitrary surfaces and higher dimensions. [1][2][3]

On 21 October 2026 Jenia Tevelev, an algebraic geometer at UMass Amherst, posted lecture notes giving a reorganised and simplified account of the plane-curve proof, which he calls "remarkably simple", and proving the conjecture from it; he writes that he has not studied the companion papers in detail. A named expert has worked through the argument and presents it as a proof, which is this site's standard for "approved". The label applies to the plane-curve theorem; the three companions are unreviewed. [1][6]

## The problem

A plane curve of degree $d$ is the zero set of a nonzero homogeneous polynomial of degree $d$ in three variables, on the projective plane $\mathbb P^{2}$; the polynomial may factor, so the curve may have repeated or several components. Its multiplicity at a point $p$ is the order of vanishing of the polynomial there: $1$ for a smooth point, $2$ for a node or cusp, and so on. Points $p_1,\ldots,p_r$ are in very general position if they avoid a countable union of proper algebraic subsets of the space of $r$-tuples; almost every random choice qualifies. [1]

**Nagata's conjecture.** For $r\ge10$ very general points and every nonzero curve of degree $d$ with multiplicity at least $m_i$ at $p_i$,

$$
m_1+\cdots+m_r<d\sqrt r.
$$

The threshold $10$ is sharp: five points lie on a conic ($d=2$, $\sum m_i=5>2\sqrt5$) and nine points lie on a cubic ($\sum m_i=9=3\sqrt9$), so the strict inequality fails at $r=9$. The conjecture is the statement that from ten points on, the naive count of coefficients against conditions is exactly right, for every degree and every multiplicity at once. [1][3]

<!-- uruk:visual-note
The visual on this page lets the reader place points, choose multiplicities, and see whether a curve of degree $d$ exists by solving the linear conditions, with the line $d=m\sqrt r$ drawn on a plot of $(m,d)$ pairs; for nine points the reader can find the cubic, for ten the gap opens. What the visual leaves out is the quantifier "every multiplicity": a computer can check small $m$, and the theorem is about all $m$ at once, which is where the difficulty lies, since the dependencies among the conditions grow with $m$. [1]
-->

## Why it stayed open

### Who asked

Nagata stated the conjecture in "On the 14-th problem of Hilbert" (1959), where plane curves through many points with high multiplicity supplied his counterexample to Hilbert's question about finite generation of invariant rings; he proved the square cases $r\ge16$ there and in his Tata lectures of 1965. [1][5]

### What was tried

The conjecture became the central open problem about linear systems of plane curves, and the literature attacked it from several sides. Roé obtained, for equal multiplicities, the uniform bound $d>m(\sqrt{r-1}-\pi/8)$ for $r\ge10$ by specialising to configurations with infinitely near points; Harbourne sharpened rational lower bounds and proved further cases in restricted multiplicity ranges. For ten points, degeneration methods give $d/m\ge117/37\approx3.162$ against the conjectured $\sqrt{10}\approx3.1623$: Eckl's Seshadri estimate and the analysis of Ciliberto, Dumitrescu, Miranda and Roé both reach it. Ciliberto, Harbourne, Miranda and Roé's survey connects the conjecture to the cones of effective and nef divisors on the blow-up of the plane at the points, and more recently Ciliberto, Miranda and Roé constructed irrational nef rays of self-intersection zero on those blow-ups for every $r\ge10$, without reaching the equal-weight class that Nagata's conjecture concerns. Dumnicki, Harbourne, Küronya, Roé and Szemberg studied an analogue for monomial valuations; Nivoche related the conjecture to interpolation by entire functions. [1]

### What stood in the way

The bounds that stop just short of $\sqrt r$ are the whole story: every method lost a little, and the loss had to be zero. Nagata's own proof for square $r$ uses the fact that $\sqrt r$ is an integer, so that the class $\sqrt r\,H-\sum E_i$ on the blow-up is an honest divisor class whose nefness can be tested; for nonsquare $r$ the class is irrational and no finite test suffices. The conjecture also equals a statement about Seshadri constants, measures of local positivity introduced by Demailly: it says the multipoint Seshadri constant of a line at $r$ very general points is exactly $1/\sqrt r$, the largest value the self-intersection allows. Biran and Szemberg conjectured the same maximality on every polarized surface and in higher dimensions once $r$ is large; nothing was known in general. [1][2]

## What OpenAI claims

**Theorem 1.1** (OpenAI, 23 September 2026). For every integer $r\ge10$ there is a countable union $E_r$ of proper Zariski-closed subsets of the configuration space of $r$ distinct points of $\mathbb P^{2}_{\mathbb C}$, with nonempty complement, such that for every tuple outside $E_r$, every nonzero effective curve $C$ of degree $d\ge1$ and all $m_i\ge0$ with $\operatorname{mult}_{p_i}C\ge m_i$ satisfy $d\sqrt r>\sum_im_i$. [1]

The exceptional set is chosen once for all degrees and multiplicity vectors; reducible and nonreduced curves are included. Corollaries 6.1 and 6.2 extend the theorem to every uncountable algebraically closed field of characteristic zero and read off the consequence for positivity: on the blow-up at such a tuple, the real class $\sqrt r\,H-\sum E_i$ is nef with self-intersection zero, and the multipoint Seshadri constant is $1/\sqrt r$, irrational for nonsquare $r$. [1]

**The companions.** On every smooth complex projective surface $S$ with an ample line bundle $L$, the multipoint Seshadri constant at $r$ very general points equals $\sqrt{L^{2}/r}$ for every $r\ge r_0(S,L)$ (23 September); on every smooth complex projective variety of dimension $n\ge3$ it equals $(L^{n}/r)^{1/n}$ for $r\ge r_0(X,L)$ (5 October); and the same holds in positive characteristic at the geometric generic tuple (5 October). These are the qualitative Nagata-Biran-Szemberg assertions; the thresholds $r_0$ are not explicit and depend on the variety. [2][3][4]

Scope. The plane theorem is for very general points, not for every configuration, and says nothing about the stronger Segre-Harbourne-Gimigliano-Hirschowitz conjecture on the dimension of the linear systems. [1][3]

## How the claimed proof goes

What follows is a map of the plane-curve paper's argument from its introduction and six sections, with Tevelev's notes as a second guide. It is not a check of the details. The paper is about 1,800 lines of TeX; its route is a degeneration to an elliptic curve followed by an exact computation with theta functions and a combinatorial interpolation lemma. [1][6]

**From a failure to a universal system (Section 2).** Closed incidence loci turn a failure at very general points into a system of curves existing at every configuration (Lemma 2.1). A product over cyclic permutations of the points makes the multiplicities equal, so one may write $d$ and $m$ for the degree and common multiplicity. Moving the points towards a smooth curve gives a nonzero polynomial on its normal line bundle with order at least $m$ at arbitrary normal displacements (Proposition 2.2, the necessary normal polynomial). For square $r$ the two highest coefficients already exclude $d/m\le\sqrt r$, equality included (Proposition 2.3), which recovers Nagata's cases; Lemma 2.4 excludes degree at most $3m$ outright. [1]

**The elliptic stage (Section 3).** For nonsquare $r$ take the smooth curve to be a cubic $E$ and set nine of the normal displacements to zero. Dividing out the forced coefficient zeros and changing the fibre coordinate gives a finite-dimensional space of polynomial sections on the normal ruled surface of $E$ whose first $m+1$ coefficient bundles have equal degree (Proposition 3.1). Tevelev's notes work directly on this ruled surface, without the elementary transformations the paper uses. [1][6]

**Colliding points (Section 4).** On a fixed elliptic curve the remaining $q=r-9$ points collide along a horizontal coordinate line (Lemma 4.1). After $b<m$ fibre derivatives, a section must then have base order at least $q(m-b)$, so a particular finite jet map has a nonzero kernel. A separate degeneration gives explicit normalised theta bases (Lemma 4.2) whose expressions in logarithmic base and fibre coordinates $(x,y)$ tend to $e^{Kx+jy}$, with $j$ the fibre degree and $K$ a Laurent exponent; their mixed derivatives give the limiting matrix $(K^{\ell}j^{b})$, $0\le b<m$, $0\le\ell<q(m-b)$, with columns indexed by exponent pairs $(j,K)$ (Proposition 4.3). Only these numerical matrices are compared across curves; no simultaneous family of kernel vectors is chosen. Tevelev describes this step as the novelty: the asymptotics of theta functions as the cubic develops a node, together with interpolation duality, reduce the problem to interpolation on a triangle of lattice points. [1][6]

**Interpolation on the exponent set (Section 5).** To exclude the kernel, a count of exponent pairs is not enough. The paper groups them into horizontal rows of fixed $K$ with $j$ varying, and interpolates one row at a time: the matrix has full column rank if no row has more than $m$ points and at most $q(m-t+1)$ rows have at least $t$ points (Lemma 5.1, with Lemma 5.3 giving the slice profile of the polygon in which the exponent pairs lie, and Lemma 5.4 the integer row counts). Since $d/m$ is rational and $r$ is nonsquare, the strict gap $d/m<\sqrt r$ permits a contraction of the polygon, and taking a common power of the original curve absorbs the integer endpoint error. Full rank persists for small positive degeneration parameter, which contradicts the kernel on each fixed curve (Proposition 5.5). [1]

**Fields and positivity (Section 6).** Corollary 6.1 passes from $\mathbb C$ to any uncountable algebraically closed field of characteristic zero; Corollary 6.2 draws the nef class and the Seshadri constant. [1]

**The companions, briefly.** The surface paper proves the nefness of $\pi^{*}L-\sqrt{L^{2}/r}\sum E_i$ for large $r$ by an algebraic route the plane paper does not need; the higher-dimensional and positive-characteristic papers extend it. Tevelev chose to follow the complex-geometric plane proof and writes that he has not studied these in detail. [2][3][4][6]

**Where an expert would look first.** At Proposition 4.3, where the theta-function asymptotics must produce exactly the matrix $(K^{\ell}j^{b})$ with the stated index ranges; at Lemma 5.1 and the polygon profile of Lemma 5.3, where the row counts must match the contraction permitted by the gap $d/m<\sqrt r$; and at Lemma 2.1, the reduction that lets one argue at every configuration. Tevelev's notes rework exactly these three steps and are the natural companion for a reader of the paper. [1][6]

## Consequences inside mathematics

The theorem settles Nagata's conjecture, the best-known open problem about linear systems of plane curves, and with the companions the qualitative form of the Nagata-Biran-Szemberg conjecture on Seshadri constants. On the blow-up of the plane at $r\ge10$ very general points it exhibits an irrational nef class of self-intersection zero in the equal-weight direction, which the cone constructions of Ciliberto, Miranda and Roé had not reached. Tevelev's notes show that the same calculation determines the nef and pseudoeffective cones of a weighted blow-up of $\mathbb P^{2}$ at one point for very general local parameters when the ratio of weights exceeds nine, a case of a conjecture of Dumnicki, Harbourne, Küronya, Roé and Szemberg. The stronger Segre-Harbourne-Gimigliano-Hirschowitz conjecture remains open. [1][3][6]

## Uses outside mathematics

No known direct application. The interpolation problem behind the conjecture, fitting polynomials to prescribed derivatives at scattered points, arises in approximation theory and computer-aided design, but those uses concern specific small configurations where the answer was computable already; the papers name no application. [1]

## Has anyone checked it?

Jenia Tevelev, a professor of mathematics at UMass Amherst working in algebraic geometry, posted on 21 October 2026 "On OpenAI's proof of the Nagata conjecture", an expanded account of a talk, in its tenth version by the arXiv submission. He writes that the notes "are not intended as a definitive account, and I claim no originality. I have reorganized and simplified the argument by working directly on the normal ruled surface of a smooth plane cubic"; his Section 3 "transfers the problem to the plane and proves Nagata's conjecture". He calls the OpenAI proof "remarkably simple" and the released manuscripts "a stunning achievement", and adds that they "seemed almost entirely unedited", that he wondered "whether I might be their first human reader", and that absorbing such arguments "will require a considerable editorial effort from the community". He followed the complex-geometric proof of the plane paper and says of the companion manuscripts that he has "not studied [them] in detail". [6]

That is a named expert working through the proof in full and presenting it, in his own reorganised form, as a proof of the theorem. He does not use the words "checked" and "correct"; writing out a complete simplified proof is a stronger act than those words, and this site counts it as approval of the plane-curve theorem, in the same way it treated Kim and Lodha's re-proof of the nonamenability of Thompson's group. The approval does not extend to the three companion papers, which no named expert has discussed in public. VibeMathed lists the plane theorem as Lean-checked with the note "No independent mathematician has checked this yet", a record that predates the notes. [6][7]

**Machine checking.** The release's catalogue `formalization.yaml` lists the plane-curve paper and the surface paper. The scope note links two comparator statements: `Nagata.lean`, 372 lines, which states the strict inequality simultaneously for all curves and multiplicity vectors outside one countable union of proper Zariski-closed sets, in both effective-curve and homogeneous-polynomial forms, including the passage between them; and `MaximalSeshadriConstants.lean` for the surface theorem. The volunteer repository oai-math-revised records comparator runs of 26 October accepting both. The higher-dimensional and positive-characteristic papers are not catalogued. A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval. [8][9]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; none of the four papers in this family is among them, and two are dated 5 October, the day before the release. On 26 October it added two manuscripts and more Lean statements; nothing in this family changed. [10]

## Sources

1. OpenAI, "Nagata's conjecture for plane curves", 23 September 2026. Theorem 1.1, Section 1.2 for prior work, Section 1.3 for the proof strategy, Sections 2 to 6. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Nagatas-Conjecture-for-Plane-Curves-September-23-2026/main.pdf
2. OpenAI, "Maximal Seshadri constants on arbitrary polarized surfaces", 23 September 2026. Theorem 1.1 and the introduction. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Maximal-Seshadri-Constants-on-Arbitrary-Polarized-Surfaces-September-23-2026/main.pdf
3. OpenAI, "Maximal multipoint Seshadri constants in higher dimensions", 5 October 2026. Abstract and introduction. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Maximal-Multipoint-Seshadri-Constants-in-Higher-Dimensions-October-5-2026/main.pdf
4. OpenAI, "Maximal multipoint Seshadri constants in positive characteristic", 5 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Maximal-multipoint-Seshadri-constants-in-positive-characteristic-October-5-2026/seshadri-positive-characteristic.pdf
5. Masayoshi Nagata, "On the 14-th problem of Hilbert", American Journal of Mathematics 81 (1959), 766 to 772. The conjecture and the square cases. https://doi.org/10.2307/2372927
6. Jenia Tevelev, "On OpenAI's proof of the Nagata conjecture", arXiv:2610.30050, submitted 21 October 2026, lecture notes, version 10. The scope paragraph, the reorganised proof, the remarks on the release, and the weighted blow-up application. https://arxiv.org/abs/2610.30050
7. VibeMathed, "Nagata's conjecture for plane curves", dataset of 1 November 2026. https://vibemathed.com/problem/nagata-conjecture-plane-curves
8. OpenAI, Lean scope note for family 039 and the comparator statements `Nagata.lean` and `MaximalSeshadriConstants.lean` at the pinned commit, with `lean/formalization.yaml`. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/039.md , https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/Nagata.lean and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/MaximalSeshadriConstants.lean
9. oai-math-revised, page for "Nagata's conjecture for plane curves", with the comparator runs of 26 October 2026, read 3 November 2026. https://mathcommunity.github.io/oai-math-revised/papers/Nagatas-Conjecture-for-Plane-Curves-September-23-2026/
10. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
