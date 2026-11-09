---
family: "325"
topic: "Crouzeix conjecture"
title: "Can one region control a whole matrix calculation?"
paperTitle: "The complete Crouzeix theorem: optimal similarity and a common positive boundary representation"
claim: "For every complex matrix A and every polynomial P with matrix coefficients, ‖P[A]‖ ≤ 2 max over z in W(A) of ‖P(z)‖, with the constant 2 sharp and independent of all dimensions and the degree. The principal paper extends this to every bounded operator on a complex Hilbert space."
status: unreviewed
checked: 2026-10-15
papers:
  - preprints/The-complete-Crouzeix-theorem-September-23-2026/paper.pdf
  - preprints/A-direct-proof-of-the-complete-Crouzeix-inequality-September-26-2026/paper.pdf
draft: false
visual: factor-two
---

Every square matrix comes with a region of the complex plane called its numerical range. In 2004 Michel Crouzeix conjectured that this region controls the size of any polynomial in the matrix, to within a factor of two. Twenty-two years later, in the summer of 2026, that conjecture was proved, more than once, by people working with AI models, and the first of those proofs has been checked by Crouzeix himself. The complete Crouzeix conjecture is the stronger statement that the same factor two survives when the polynomial's coefficients are matrices too, in any dimension. That is what OpenAI claimed on 23 September 2026, in two papers with different proofs, and extended from matrices to bounded operators on arbitrary Hilbert spaces. [1][2][9]

As of 15 October 2026 no mathematician has said publicly that they have checked either OpenAI proof. The status on this page is "unreviewed". The expert check of the scalar conjecture does not transfer to this one.

## The problem

### The objects

A matrix $A$ with $n$ rows and columns turns vectors in $\mathbb{C}^{n}$ into other vectors. Its norm, $\|A\|$, is the most it can stretch any vector of length one. Its eigenvalues are the numbers $\lambda$ for which some nonzero vector satisfies $Ax=\lambda x$; they describe directions the matrix only stretches or shrinks. For a normal matrix, one that commutes with its conjugate transpose, the eigenvalues tell you everything: the norm is the largest $|\lambda|$, and for any polynomial $p$ the norm of $p(A)$ is the largest $|p(\lambda)|$. [2]

Most matrices are not normal, and for them the eigenvalues can be badly misleading. The paper's own example is

$$
A=\begin{pmatrix}0&2\\0&0\end{pmatrix}.
$$

Both eigenvalues are zero, so "the largest $|p(\lambda)|$" would predict that $p(A)$ is tiny for every $p$ with $p(0)=0$. But $A$ sends the vector $(0,1)$ to $(2,0)$, so $\|A\|=2$. A matrix whose eigenvalues are all zero can still double the length of a vector. This gap between eigenvalues and actual behaviour is the reason the subject exists. [2]

The numerical range repairs it. For a matrix $A$,

$$
W(A)=\{\,x^{*}Ax:\ x\in\mathbb{C}^{n},\ x^{*}x=1\,\},
$$

where $x^{*}$ is the conjugate transpose of $x$, so $x^{*}Ax$ is a single complex number. Taking every unit vector $x$ sweeps out a region of the plane. Toeplitz and Hausdorff proved in 1918 and 1919 that this region is always convex, and it is compact and contains every eigenvalue. For a normal matrix it is exactly the convex hull of the eigenvalues. For the example above it is the closed disk of radius one centred at the origin: the eigenvalues sit at the centre, but the region knows about the $2$. [1][2]

The question is whether $W(A)$ is a reliable yardstick. Crouzeix's conjecture, from 2004, says that for every square complex matrix $A$ and every polynomial $p$,

$$
\|p(A)\|\le2\max_{z\in W(A)}|p(z)|.
$$

The factor cannot be lower than $2$, because of the example: with $p(z)=z$, the left side is $\|A\|=2$ and the right side is $2\cdot1$. In the language of the field, the conjecture says that $W(A)$ is a $2$-spectral set for $A$. Von Neumann's inequality of 1951, that $\|p(A)\|\le\max_{|z|\le1}|p(z)|$ whenever $\|A\|\le1$, is the model result of this kind, with the unit disk in place of the numerical range and the factor $1$. [2][7]

### What "complete" adds

Now let the coefficients of the polynomial be matrices. If $P(z)=\sum_{k=0}^{d}B_kz^{k}$ with each $B_k$ an $m\times m$ matrix, then $P(z)$ is an $m\times m$ matrix for each number $z$, and $P[A]$ is defined as

$$
P[A]=\sum_{k=0}^{d}A^{k}\otimes B_k,
$$

an $nm\times nm$ matrix built from the Kronecker products, with $A$'s coordinates listed first. The complete Crouzeix conjecture asks whether

$$
\|P[A]\|\le2\max_{z\in W(A)}\|P(z)\|
$$

holds with the same factor $2$ for every $n$, every $m$ and every degree $d$. When $m=1$ it is the scalar conjecture. [1][2]

Why is this harder? Because matrix coefficients need not commute. A scalar proof is free to rearrange products, and the known scalar proofs do; Lorist and Schwenninger point out in their own paper exactly where their argument uses commutation and why it does not pass to matrix coefficients. Bounding each entry of $P[A]$ separately does not work either, since entrywise bounds lose a factor that grows with $m$. The complete statement has to be proved in a way that never swaps the order of two coefficient matrices. [1][2]

There is a structural reason to care about the complete version specifically. Paulsen's similarity theorem of 1984 identifies the best constant in a complete bound with the best condition number of a similarity: a set is a complete $K$-spectral set for $A$ exactly when there is an invertible $S$ with $\|S\|\|S^{-1}\|\le K$ such that the conformal image of $SAS^{-1}$ is a contraction. So the complete factor $2$ is equivalent to a geometric statement about changing the inner product on $\mathbb{C}^{n}$, and OpenAI's principal paper proves it in that form. [1]

## Why it stayed open

Crouzeix posed the scalar question in 2004 and in 2007 proved a universal bound, complete and valid for every matrix, with the constant $11.08$. The positive boundary representations of Delyon and Delyon from 1999 were a central tool. In 2017 Crouzeix and Palencia combined a positive double-layer potential with a Cauchy transform of conjugate boundary data to bring the complete constant down to $1+\sqrt2\approx2.414$, and Ransford and Schwenninger simplified the final step the following year. [1][2][3][4][6]

That left a gap between $2.414$ and $2$ that no refinement closed, and Ransford and Schwenninger showed why: the abstract norm lemma behind the Crouzeix-Palencia argument cannot do better than $1+\sqrt2$ on its own terms. Reaching $2$ needed a different input. [4]

Special cases were known. Badea, Crouzeix and Delyon proved the complete constant $2$ for all $2\times2$ matrices in 2006, by building an explicit similarity of condition number at most $2$ from the numerical-range ellipse. Åhag, Czyż and Virtanen extended the complete bound to base matrices of size at most $3$ in 2026. Crouzeix and Greenbaum proved it for weighted shift matrices in 2025. [2][5]

Then, in the summer of 2026, the scalar conjecture fell. Shanmu Jin, a neurosurgery resident, posted a proof on 27 July whose key theorem came out of an autonomous run of GPT-5.6 Sol; Alex Townsend and Anne Greenbaum wrote in August that they and Crouzeix "have checked the proof thoroughly and believe that Dr. Jin's manuscript is correct". Emiel Lorist and Felix Schwenninger posted a different five-page proof on 4 August, covering bounded operators as well, and Luo posted a third. All three are scalar: they fix $m=1$. The complete conjecture remained open until OpenAI's release, and the direct-proof paper lists all three as the state of the art it goes beyond. [2][9]

## What OpenAI claims

**Theorem 1.1** (the direct proof, OpenAI, 26 September 2026). For every pair of positive integers $n,m$, every $A\in M_n(\mathbb{C})$, every nonnegative integer $d$, and every polynomial $P(z)=\sum_{k=0}^{d}B_kz^{k}$ with $B_k\in M_m(\mathbb{C})$,

$$
\|P[A]\|\le2\max_{z\in W(A)}\|P(z)\|.
$$

The constant two cannot be decreased uniformly over $n$, $m$ and $d$. The estimate includes matrices whose numerical range is a point or a line segment. [2]

The principal paper of 23 September claims more. For every bounded operator $A$ on any complex Hilbert space, separable or not, and every matrix polynomial $P$, the same inequality holds with the supremum over $W(A)$. The closure of $W(A)$ is a complete $2$-spectral set, and the bound extends to matrix-valued functions holomorphic near that closure and to rational functions with poles outside it. For a finite matrix and any bounded convex domain $\Omega$ containing $W(A)$ with regular real-analytic boundary, the optimal similarity that makes the conformal image of $A$ a contraction is attained with condition number $\kappa\le2$, and for the similar matrix one continuous positive boundary density of total mass the identity represents the evaluation of every matrix-valued function holomorphic near $\overline\Omega$, for every coefficient size at once. [1]

What the theorems do not say. They do not improve the constant for any particular matrix; $2$ is the worst case and is attained. They do not change any numerical algorithm. The $2\times2$ case, which is what any small illustration can show, was already known in 2006; the new content is the uniformity over all sizes and the passage to infinite dimensions. [1][2]

## How the claimed proofs go

Two papers, two routes. This is a map of each, from their introductions, not a check. The direct paper is twelve pages; the principal paper is twenty-two. [1][2]

**The direct route: estimate one polynomial at a time.**

*Enclose the range.* Place $W(A)$ strictly inside a bounded convex domain $\Omega$ with real-analytic boundary. An exterior conformal map $h$ parametrizes $\partial\Omega$ by the unit circle. The final section shrinks such domains down to an arbitrary numerical range, including degenerate ones. [2]

*Build the right polynomials.* Expanding the Cauchy kernel at infinity defines scalar polynomials $b_k$ of degree $k$, Faber-type polynomials adapted to $\Omega$. On the boundary, $b_k\circ h$ has the positive Fourier term $\lambda^{k}$ and an otherwise negative expansion. A nonnegative kernel with unit integrals makes the map from the positive part to the negative part a contraction on $L^{2}$. Consequently, for $G=\sum_kb_kC_k$ with matrix coefficients $C_k$, the squared boundary Hilbert-Schmidt norm of $G$ lies between the sum of the squared coefficient norms and that sum with weight two on every nonconstant coefficient. [2]

*Look where the stretch is largest.* Normalize the polynomial $F$ to have boundary operator norm one, and take a top singular pair $x,y$ for $F[A]$, unit vectors with $F[A]x$ as long as possible in the direction $y$. The resolvent $R(\lambda)=\lambda h'(\lambda)(h(\lambda)I-A)^{-1}$ represents three functionals, $y^{*}G[A]x$, $x^{*}G[A]x$ and $y^{*}G[A]y$, as coefficient arrays. The first is bounded by a coefficient Hilbert norm; testing it on $FG$ and on $GF$ separately, never exchanging them, bounds the other two. Their dual norms carry reciprocal weights, one on the constant coefficient and one half on the rest, which match the weights in the previous step after a common factor of four. [2]

*Use positivity to get two.* The numerical-range condition makes $R+R^{*}$ positive. Compressing it to a $2\times2$ block bounds the off-diagonal boundary norm by the two diagonal norms, with the cross term keeping every coefficient of the first functional. The resulting inequality is the sharp bound $2$. [2]

*Shrink and show sharpness.* Analytic convex neighbourhoods shrink to any $W(A)$, points and segments included. The nilpotent $2\times2$ matrix above shows that no constant below $2$ works for every matrix. [2]

**The structural route: fix one metric first.**

Take an admissible $\Omega\supset W(A)$ with interior conformal map $f:\Omega\to\mathbb{D}$ and set $T=f(A)$. Minimize $\tau$ over Hermitian $H$ with $I\preceq H\preceq\tau I$ and $T^{*}HT\preceq H$; the minimum $\kappa^{2}$ is attained, and $S=H^{1/2}$ is a similarity making $f(SAS^{-1})$ a contraction. The paper proves $\kappa\le2$ by extracting extremal vectors from the $\kappa$ and $1$ eigenspaces, realizing a contractive disk function that maps one to the other, and comparing two positive density systems on the boundary: positivity bounds twice the squared cross density by the sum of the squared diagonal densities, a vanishing matrix mean separates two projected cross terms into orthogonal Fourier subspaces, and the factor $\kappa$ falls out as at most $2$. The same minimizing metric yields one continuous positive density $\Lambda$ on the circle with $\int\Lambda\,d\sigma=I$ and

$$
v[SAS^{-1}]=\int_{\mathbb{T}}\Lambda(t)\otimes v(G(t))\,d\sigma(t)
$$

for every matrix-valued $v$ holomorphic near $\overline\Omega$, which gives $\|v[A]\|\le\kappa\max_{\overline\Omega}\|v\|$ for all coefficient sizes at once. Finite compressions and holomorphic approximation then carry the inequality to bounded operators on arbitrary Hilbert spaces. [1]

The two papers state that they have separate complete proof paths and share only some local boundary calculations. Their cited inputs are published: Delyon and Delyon, Crouzeix and Palencia, Ransford and Schwenninger, Badea, Crouzeix and Delyon, Paulsen, Arveson, and the classical conformal mapping and reflection theorems that an appendix assembles. [1][2]

Where would an expert look first? In the direct paper, the coefficient estimate for the Faber-type polynomials and the two-order argument with $FG$ and $GF$; in the principal paper, the attainment of the minimizing metric and the comparison of the two positive density systems that yields $\kappa\le2$; in both, the passage from analytic domains to degenerate numerical ranges and, in the principal paper, from matrices to operators.

## Uses outside mathematics

No known direct application of the complete theorem.

The scalar bound and its predecessors are already used in numerical analysis, where they turn a bound on a function over a region into a bound on the matching matrix computation. Crouzeix and Greenbaum's 2019 paper applies numerical-range estimates to the convergence of GMRES, the standard iterative method for large linear systems, and to rational Krylov methods for computing functions of a matrix applied to a vector. Townsend and Greenbaum's account of Jin's proof lists the same kinds of use. In each case the bound is an error estimate; a smaller constant tightens the estimate without changing the method or its cost. We found no computation that needs the complete, matrix-coefficient version as such, and we do not count uses of the scalar theorem as uses of this one. [8][9]

## Has anyone checked it?

We found no named mathematician who says they have read either OpenAI paper. Townsend and Greenbaum's statement that they and Crouzeix checked Jin's proof concerns the scalar theorem, and we have found no public comment from any of the three on the complete papers. An explanatory article on the release's functional-analysis results states that it is "not an independent verification of the complete proofs". VibeMathed records that no independent mathematician has checked the complete result. [9][10][11]

**Machine checking.** The release lists five Lean comparator statements for this family, covering the finite-matrix inequality and sharpness, the bounded-operator theorem on arbitrary Hilbert spaces, and the structural similarity and density results. We have not audited those statements against the papers' theorems, and we found no public replay of them. Uruk does not count a kernel check as approval in any case. [12]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; none of them is this family. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [13]

## Sources

1. OpenAI, "The complete Crouzeix theorem: optimal similarity and a common positive boundary representation", 23 September 2026. Abstract, Section 1, Theorems 1.2 and 1.3, and the operator passage. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/The-complete-Crouzeix-theorem-September-23-2026/paper.pdf. TeX source: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/The-complete-Crouzeix-theorem-September-23-2026/build/main.tex
2. OpenAI, "A direct proof of the complete Crouzeix inequality", 26 September 2026. Theorem 1.1, the history of earlier bounds, the two-order argument and the sharpness example. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/A-direct-proof-of-the-complete-Crouzeix-inequality-September-26-2026/paper.pdf. TeX source: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/A-direct-proof-of-the-complete-Crouzeix-inequality-September-26-2026/build/main.tex
3. Michel Crouzeix and César Palencia, "The Numerical Range is a (1 + √2)-Spectral Set", SIAM Journal on Matrix Analysis and Applications 38 (2017), 649-655. https://doi.org/10.1137/17M1116672
4. Thomas Ransford and Felix L. Schwenninger, "Remarks on the Crouzeix-Palencia proof that the numerical range is a (1 + √2)-spectral set", SIAM Journal on Matrix Analysis and Applications 39 (2018). https://arxiv.org/abs/1708.08633
5. Catalin Badea, Michel Crouzeix and Bernard Delyon, "Convex domains and K-spectral sets", Mathematische Zeitschrift 252 (2006). The 2 × 2 case. https://doi.org/10.1007/s00209-005-0857-y
6. Michel Crouzeix, "Numerical range and functional calculus in Hilbert space", Journal of Functional Analysis 244 (2007), 668-690. The constant 11.08. https://doi.org/10.1016/j.jfa.2006.10.013
7. John von Neumann, "Eine Spektraltheorie für allgemeine Operatoren eines unitären Raumes", Mathematische Nachrichten 4 (1951), 258-281. Von Neumann's inequality. https://doi.org/10.1002/mana.3210040124
8. Michel Crouzeix and Anne Greenbaum, "Spectral Sets: Numerical Range and Beyond", SIAM Journal on Matrix Analysis and Applications 40 (2019), 1087-1101. GMRES and rational Krylov applications. https://doi.org/10.1137/18M1198417
9. Alex Townsend and Anne Greenbaum, "The Neurosurgery Resident Who Proved Crouzeix's Conjecture", August 2026. The expert check of Jin's scalar proof and its uses. https://alextownsend.net/essays/SIAMNews_CrouzeixConjecture.pdf
10. Latent Seminar, "The complete Crouzeix inequality", 6 October 2026. Explanatory article with an explicit verification disclaimer. https://lowrank.github.io/latent-seminar/OpenAI-Math/325-complete-crouzeix
11. VibeMathed, "The complete Crouzeix conjecture: the numerical range is a complete 2-spectral set", read 15 October 2026. https://vibemathed.com/problem/complete-crouzeix-conjecture
12. OpenAI, Lean scope note for family 325 at the pinned commit. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/325.md
13. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
