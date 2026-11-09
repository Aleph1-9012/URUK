---
family: "107"
topic: "Matrix multiplication"
title: "How fast can two grids of numbers be multiplied?"
paperTitle: "An Upper Bound of 9/4 for the Matrix Multiplication Exponent"
claim: "The exponent of matrix multiplication over the complex numbers is at most 9/4: for every ε > 0, two n × n complex matrices can be multiplied with O(n^(9/4+ε)) arithmetic operations."
status: under review
checked: 2026-10-15
papers:
  - preprints/Matrix-Multiplication-Nine-Fourths-October-2-2026/paper.pdf
draft: false
---

Multiplying two matrices is the most common heavy computation in the world. Every neural network does it billions of times, and so does every weather model and every physics simulation. How many arithmetic operations it needs, as the matrices grow, is measured by a single number called $\omega$. Since 1969 the best known upper bound on $\omega$ has crept from $3$ down to $2.371177$, with most of the movement in the first twenty years and almost none in the last thirty-five. On 2 October 2026 OpenAI posted a thirteen-page proof that $\omega\le\tfrac94=2.25$. If it holds, it is the largest single improvement since 1981, and it comes by a route nobody had used. [1]

As of 15 October 2026 one expert in the area has rebuilt the proof's formal version and extended it. No one has published a verdict on the written paper. The status on this page is "under review".

## The problem

A matrix is a rectangular grid of numbers. To multiply two $n\times n$ matrices $A$ and $B$, the method taught in school computes each entry of the product as a dot product of a row of $A$ with a column of $B$:

$$
(AB)_{ik}=\sum_{j=1}^{n}A_{ij}B_{jk}.
$$

There are $n^{2}$ entries and each needs $n$ multiplications, so the whole job takes $n^{3}$ multiplications and about as many additions. Double the size of the matrices and the work goes up eightfold. [3]

In 1969 Volker Strassen found that two $2\times2$ matrices can be multiplied with seven multiplications instead of eight, at the cost of eighteen extra additions. That sounds like a poor trade until you notice that the trick works on blocks. Split a large matrix into four quarters, apply Strassen's seven products to the quarters, and apply it again inside each product. After $k$ levels the multiplications number $7^{k}$ rather than $8^{k}$. For $n\times n$ matrices this gives about $n^{\log_27}\approx n^{2.807}$ operations, and for large $n$ that beats $n^{3}$ by any margin you like. [2][4]

The exponent of matrix multiplication, $\omega$, is defined as the smallest number such that for every $\varepsilon>0$, two $n\times n$ matrices can be multiplied with $O(n^{\omega+\varepsilon})$ arithmetic operations. The $\varepsilon$ is there because the infimum need not be attained. The school method gives $\omega\le3$ and Strassen gives $\omega\le\log_27$. In the other direction, $\omega\ge2$, because the answer has $n^{2}$ entries that all have to be written down. Many researchers suspect that $\omega=2$. Nobody knows. [1][3]

Two more points about what $\omega$ measures. It counts arithmetic operations, additions and multiplications of numbers, not bit operations, and it says nothing about memory, parallelism or numerical stability. And it is an asymptotic statement, about how the cost grows as $n$ goes to infinity, with no promise about any particular $n$. Both points matter for the question of applications below. [1]

## Why it stayed open

### Fifty-seven years of records

Strassen's $2.807$ stood for nine years. Then came a burst. Pan reached $2.796$ in 1978. Bini, Capovani, Romani and Lotti introduced approximate algorithms, later called border rank, and reached $2.78$ in 1979. Schönhage's asymptotic sum inequality of 1981 showed how to turn efficient simultaneous computation of several independent small products into bounds on $\omega$, and gave $2.522$. Coppersmith and Winograd reached $2.496$ the same year, and Strassen's laser method of 1986, which extracts independent products from powers of a single tensor, gave $2.479$. In 1990 Coppersmith and Winograd combined the laser method with a particular starting tensor and a construction from additive combinatorics to reach $2.3755$. [1][3][7]

Then the subject slowed down. Every record since has come from analyzing higher powers of the same Coppersmith-Winograd tensor more carefully: Stothers in 2010, Vassilevska Williams in 2012, Le Gall in 2014, Alman and Vassilevska Williams in 2020, Duan, Wu and Zhou in 2022, Vassilevska Williams, Xu, Xu and Zhou in 2024, Alman and five coauthors the same year, and in August 2026 Dupont and nine coauthors, who credit the AI system AlphaEvolve for part of the optimization and reached $2.371177$. Thirty-six years of work moved the third decimal place. François Le Gall told Quanta that the gains since 1987 had been "small and ... extremely difficult to obtain". [3][5][8]

There are theorems explaining why. Ambainis, Filmus and Le Gall showed in 2015 that the laser method applied to powers of the Coppersmith-Winograd tensor cannot get below $2.3725$, and that a broad family of variations cannot get below $2.3078$. Later barrier results showed that still wider generalizations of the known methods cannot reach $2$. The claimed $2.25$ is below all of these barriers, so whatever the proof does, it is not a refinement of the laser method. [3][6][9]

## What OpenAI claims

**Theorem 1.1** (OpenAI, 2 October 2026). For every $\varepsilon>0$, two $n\times n$ complex matrices can be multiplied using $O_{\varepsilon}(n^{9/4+\varepsilon})$ arithmetic operations. In particular, $\omega\le\tfrac94$. [1]

The statement is over the complex numbers. The paper's method uses roots of unity, and one step needs them in a form that does not exist in every field (see the review section for who found which step). The theorem gives $\omega\le2.25$, a rational number, where every previous record was an irrational decimal from a numerical optimization. The paper says plainly that its proof "does not specify a competitive finite matrix size", and in fact the proof never writes down an algorithm at all. It shows that fast algorithms exist. [1]

## How the claimed proof goes

The argument is short and, apart from one piece of theory, elementary. What follows is a map of it. We have read the paper in full and found nothing wrong, but we are not referees and have not written a referee report. [1]

**Tensors and characters.** The product of two $n\times n$ matrices is encoded by the trilinear form $T_n=\sum_{i,j,k}x_{ij}y_{jk}z_{ki}$, a tensor with three groups of variables, called legs. Tensors can be added (full direct sum, with disjoint variables on every leg), multiplied (tensor product, which pairs variable indices leg by leg) and compared: $A\ge B$ when $B$ is obtained from $A$ by linear substitutions, called restriction. The tensor rank $\mathrm R(A)$ is the least $m$ with $m\ge A$, where the integer $m$ stands for $m$ independent scalar products. Let $\nu=\inf_{n\ge2}\log_n\mathrm R(T_n)$; then $2\le\nu\le3$, and a bound on $\nu$ becomes a bound on $\omega$ by the recursive block argument above. [1]

Strassen showed in the 1980s that these comparisons are governed by a family of numerical invariants. A tensor character is a map $\lambda$ from tensors to nonnegative reals that is additive on direct sums, multiplicative on tensor products, monotone under restriction, and sends the scalar tensor to $1$. The three flattening ranks, obtained by viewing a tensor as a matrix with one leg against the other two, are examples; there are many more. Strassen's theorem is that the characters together detect asymptotic restriction. The paper needs only one consequence, which it reproves in an appendix using compactness and a fixed-point theorem: for every $d\ge2$ and every $k<d^{\nu}$ there is a character with $\lambda(T_d)\ge k$. So to bound $\nu$ it suffices to bound $\lambda(T_d)$ for every character $\lambda$. [1][10]

Each character gives matrix multiplication a clean value. Writing $B_X(m)=x\sum_i y_iz_i$ for the dot product with one leg trivial, multiplicativity forces $\lambda(B_X(m))=m^{p_X}$ for some $p_X\in[0,1]$, and likewise for the other two legs. Since $B_XB_YB_Z$ is $T_m$, one gets $\lambda(T_m)=m^{3t}$ with $t=(p_X+p_Y+p_Z)/3$. The whole proof is an argument that $t\le\tfrac34$ for every character, which gives $\lambda(T_d)\le d^{9/4}$, hence $\nu\le\tfrac94$. [1]

**The new idea: separating a shared leg.** A recurring obstacle in tensor constructions is that useful pieces share variables. Suppose $A=\sum_{h=1}^{M}A_h$ where the blocks $A_h$ have disjoint variables on the second and third legs but all share the first. The paper's Proposition 2.4 makes them fully independent. A finite Fourier projection, using roots of unity, attaches a tentative block label to the shared leg, and a degeneration whose weight is the square of the label mismatch keeps exactly the matching terms. The cost of the Fourier copies is paid back at the exponential scale by the number of output blocks. The consequence (Corollary 2.5) is an entropy-type inequality for any tensor with this block structure. [1]

**Polynomial multiplication as the test case.** Multiplying a polynomial with $a$ coefficients by one with $b$ coefficients is the tensor $C(a,b)=\sum_{i,j}x_iy_jz_{i+j}$, with output length $a+b-1$. For a fixed character, the paper measures $C(a,b)$ by a profile $P(a,b)$, a normalized geometric mean of the character's values on $C(a,b)$ under all six permutations of the legs. Three facts about $P$ are established. Evaluating polynomials at $a+b-1$ points and interpolating shows that $\mathrm R(C(a,b))\le a+b-1$, hence $P(a,b)\le(a+b-1)^{1/t}$. A determinant filtration that every multiplication map preserves gives discrete concavity: the increments of $P$ in each argument never increase (Lemma 3.3). And a three-sector decomposition of the grid of products, the paper's Figure 3.1, shows that crossing out some products splits $C(a,3h+a-1)$ into three independent copies of $C(a,h)$ once the shared leg is separated, giving $P(a,3h+a-1)\ge3P(a,h)$ (Lemma 3.4). [1]

**The squeeze.** An elementary lemma (Lemma 4.1) shows that any symmetric positive $P$ with $P(1,b)=b$, nonincreasing increments and the tripling inequality must satisfy $P(a,a)\ge a^{4/3}$. Combined with the interpolation bound,

$$
a^{4/3}\le P(a,a)\le(2a-1)^{1/t},
$$

and letting $a\to\infty$ forces $t\le\tfrac34$. That is the whole arithmetic. The last page converts $\nu\le\tfrac94$ into an algorithm: the definition of $\nu$ supplies, for each $\delta>0$, some $u$ and an exact rank decomposition of $T_u$ of length below $u^{9/4+\delta}$, whose bilinear identities apply to blocks and recurse. The decomposition is known to exist; the paper does not construct it. [1]

The published inputs are Strassen's papers of 1969 and 1986 to 1988, Bini's interpolation argument, the asymptotic-spectrum paper of Christandl, Vrana and Zuiddam, and the Schauder-Tychonoff fixed-point theorem. No other OpenAI paper is an input. [1]

Where would an expert look first? The appendix that reproves the detecting-character lemma, against Strassen's original 1988 paper; Proposition 2.4, which is the one genuinely new mechanism and which everything downstream uses; and Lemma 3.3, where the block from the input kernel to the output quotient has to vanish for every first-input slice.

## Uses outside mathematics

No known direct application.

Matrix multiplication is used everywhere, and Strassen's 1969 algorithm is used in real software for matrices larger than about a hundred rows. Everything after Strassen is different. The record-setting methods are what computer scientists call galactic algorithms: their constants and crossover sizes are so large that they only win on matrices far too big for any machine. One recent paper on the leading constants notes that the asymptotically best methods start from block sizes where $n^{2}$ exceeds the number of atoms in the visible universe. The $\tfrac94$ proof is further still from practice, because it establishes the existence of a fast algorithm without exhibiting one. It will not make a graphics card, a phone or a language model faster. [3][11]

What it would change, if correct, is inside the theory: a rational exponent, a new technique that bypasses all the known barriers to the laser method, and a plausible path toward further improvements. Two follow-ups appeared within days of the release, one extending the bound to rectangular matrices and one, discussed next, to every field.

## Has anyone checked it?

Jeroen Zuiddam of the University of Amsterdam, a coauthor of the asymptotic-spectrum paper that this proof builds on, has published a Lean repository that rebuilds OpenAI's formal proof over the complex numbers and extends it to every field. His README identifies the single step that uses more than algebraic closure, the Fourier separation, which needs a primitive root of unity of an order that can vanish in positive characteristic, and replaces it with a period that always exists. Of the 143 Lean modules his theorem imports, 99 are copied unchanged, 41 modified with change headers, and 3 new. The repository reports that the proof is accepted by Lean's kernel with only the three standard axioms. This is a named expert in the field who has worked through the formal proof closely enough to generalize its one field-specific step. He has not published a statement that he checked the written paper, and his repository does not claim to. On Uruk's scale that is "under review", not "approved". [12]

Sela Navot published a separate extension of the Lean proof to all fields, written with the help of GPT-6 models, and Przemysław Uznański posted an AI-written extension of the bound to rectangular matrices on arXiv on 7 October. Building on a result is not the same as checking it. [13][14]

Steven Strogatz of Cornell compared the jump to Bob Beamon's 1968 long jump record; Lance Fortnow listed the result among the release's computer-science highlights and wrote that "these proofs haven't been fully verified"; Scott Aaronson noted that it uses "a completely different approach" from the laser method. Praise and interest are not approval. VibeMathed, a database that tracks AI-produced results, records that no independent mathematician has checked this proof. [15][16][17][18]

**Machine checking.** The release's Lean statement for this theorem is 132 lines and self-contained. It defines straight-line arithmetic programs in which constants are free and each addition, subtraction or multiplication costs one, requires correctness on all inputs, and defines $\omega$ as the infimum of admissible exponents. That is the standard definition. The admissible set contains $3$ and is bounded below, so Lean's infimum is the real one. The formal proof is about 510 files. Zuiddam's rebuild is the only outside replay we know of. A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval. [19][12]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; none of them is this family. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [20]

## Sources

1. OpenAI, "An Upper Bound of 9/4 for the Matrix Multiplication Exponent", 2 October 2026. Theorem 1.1, Sections 1 to 4 and Appendix A. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Matrix-Multiplication-Nine-Fourths-October-2-2026/paper.pdf
2. Volker Strassen, "Gaussian elimination is not optimal", Numerische Mathematik 13 (1969), 354-356. https://doi.org/10.1007/BF02165411
3. Wikipedia, "Computational complexity of matrix multiplication", read 15 October 2026. The table of records, each entry of which links its original paper, and the practical crossover for Strassen's algorithm. https://en.wikipedia.org/wiki/Computational_complexity_of_matrix_multiplication
4. Shmuel Winograd, "On multiplication of 2 × 2 matrices", Linear Algebra and its Applications 4 (1971), 381-388. Seven multiplications is optimal. https://doi.org/10.1016/0024-3795(71)90009-7
5. Steve Nadis, "New Breakthrough Brings Matrix Multiplication Closer to Ideal", Quanta Magazine, 7 March 2024. Le Gall quote. https://www.quantamagazine.org/new-breakthrough-brings-matrix-multiplication-closer-to-ideal-20240307/
6. Josh Alman, Ran Duan, Virginia Vassilevska Williams, Yinzhan Xu, Zixuan Xu and Renfei Zhou, "More Asymmetry Yields Faster Matrix Multiplication", Section 1. The history of the laser method and its barriers. https://arxiv.org/abs/2404.16349
7. Don Coppersmith and Shmuel Winograd, "Matrix multiplication via arithmetic progressions", Journal of Symbolic Computation 9 (1990), 251-280. https://doi.org/10.1016/S0747-7171(08)80013-2
8. Emilien Dupont and coauthors, "Improving the Matrix Multiplication Exponent with Modern Optimization and AlphaEvolve", August 2026. The previous record. https://arxiv.org/abs/2608.16884
9. Andris Ambainis, Yuval Filmus and François Le Gall, "Fast Matrix Multiplication: Limitations of the Coppersmith-Winograd Method", STOC 2015. https://doi.org/10.1145/2746539.2746554
10. Volker Strassen, "The asymptotic spectrum of tensors", Journal für die reine und angewandte Mathematik 384 (1988), 102-152. https://doi.org/10.1515/crll.1988.384.102
11. "Improving the Leading Constant of Matrix Multiplication", introduction. The atoms-in-the-universe remark. https://arxiv.org/abs/2410.20538
12. Jeroen Zuiddam, "omega-nine-quarters-all-fields", Lean repository, October 2026. README read 15 October 2026. https://github.com/jzuiddam/omega-nine-quarters-all-fields
13. Sela Navot, "matrix-multiplication-all-fields". https://github.com/selanavot/matrix-multiplication-all-fields
14. Przemysław Uznański, extension to rectangular matrices, arXiv, 7 October 2026. https://arxiv.org/abs/2610.10494
15. Steven Strogatz on X, 6 October 2026, as collected by Techmeme. https://www.techmeme.com/261006/p42
16. Lance Fortnow, selection of the release's computer science results, 7 October 2026. https://lance.fortnow.com/openai-math-tcs.htm
17. Scott Aaronson, "The Mathocalypse", Shtetl-Optimized, 7 October 2026. https://scottaaronson.blog/?p=10169
18. VibeMathed, "The matrix multiplication exponent: is omega at most 9/4?", read 15 October 2026. https://vibemathed.com/problem/matrix-multiplication-exponent-9-4
19. OpenAI, comparator statement `MatrixMultiplication.lean` and the scope note for family 107 at the pinned commit. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/MatrixMultiplication.lean and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/107.md
20. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
