---
family: "130"
topic: "Exact Fourier transforms"
title: "Is the fast Fourier transform as fast as a Fourier transform can be?"
paperTitle: "An explicit power saving for the exact discrete Fourier transform"
claim: "A single deterministic algorithm computes the exact discrete Fourier transform of length n, for every n, in O(n (log n)^θ (log log n)^(4−θ)) operations with an explicit θ < 1, hence in O(n (log n)^(1−10^(−13))) = o(n log n), in a model of exact complex arithmetic with unrestricted coefficients and one supplied root of unity. A companion proves that exact Fourier circuits of size o(n log n) exist along an unbounded sequence of lengths."
status: unreviewed
checked: 2026-10-18
papers:
  - preprints/An-explicit-power-saving-for-the-exact-discrete-Fourier-transform-September-25-2026/main.pdf
  - preprints/Finite-tensor-savings-and-exact-Fourier-circuits-September-25-2026/main.pdf
draft: false
---

The fast Fourier transform is the most used algorithm in the world. It turns a signal of $n$ samples into its $n$ frequencies in about $n\log n$ operations instead of $n^{2}$, and it is inside every phone call, image file and radio receiver. Cooley and Tukey published it in 1965, Gauss had it in 1805, and since then the only question has been the constant in front of $n\log n$; a 2023 paper of Alman and Rao that shaved the constant for power-of-two lengths was news. Whether the $n\log n$ itself could be beaten was believed impossible, and in restricted models it is: Morgenstern proved in 1973 that any algorithm using only bounded multipliers needs $n\log n$ operations. On 25 September 2026 OpenAI posted two papers. One shows that in the unrestricted model, where any complex number may be used as a multiplier, Fourier circuits smaller than $n\log n$ exist for infinitely many lengths. The other gives a single algorithm that computes the exact transform at every length in $n(\log n)^{1-10^{-13}}$ operations. [1][2][3][4]

As of 18 October 2026 no mathematician has said publicly that they have read or checked the proofs. The status on this page is "unreviewed".

## The problem

For $d\ge1$ let $\zeta_d=e^{2\pi i/d}$ and let $F_d=(\zeta_d^{jk})_{0\le j,k<d}$ be the unnormalized discrete Fourier matrix. Computing $F_nx$ for $x\in\mathbb C^{n}$ by the definition takes $n^{2}$ multiplications. The Cooley-Tukey factorization does it in $O(n\log n)$ arithmetic operations when $n$ is highly composite, Good's and Thomas's constructions handle coprime factors, and Bluestein's chirp identity reduces any length to a convolution and so gives $O(n\log n)$ at every length. [1]

**The question.** In the unrestricted exact-arithmetic model, can the discrete Fourier transform be computed in $o(n\log n)$ operations? [1][2]

<!-- uruk:visual-note
A visual for this page can show the butterfly diagram of the Cooley-Tukey algorithm for $n=8$, with its $\log_2n$ layers of $n/2$ butterflies, and let the reader count operations; then show the record constants in front of $n\log n$ and the new bound sitting indistinguishably close to the line, as for the multiplication result in family 109.
-->

## Why it stayed open

Whether this can be improved depends entirely on what counts as an operation. In a model where the multipliers are bounded, Morgenstern's determinant argument gives a lower bound of order $n\log n$; Ailon's entropy argument gives one for circuits of unitary $2\times2$ gates. In the unrestricted linear-circuit model, where every gate adds two values or multiplies one by an arbitrary fixed complex scalar, no lower bound beyond linear was known, and the question of whether $n\log n$ is optimal there was open. [1][2]

## What OpenAI claims

Define the absolute constants $m=10^{6}$, $W_*=2^{71}$, $\Delta=6871402692000000$, $\lambda=m-\Delta/W_*$ and $\theta=\log_m\lambda$, so that

$$
\theta=0.99999999999978935615699598\ldots<1.
$$

**Theorem 1.1** (OpenAI, "An explicit power saving for the exact discrete Fourier transform", 25 September 2026). There is a single deterministic algorithm which, for every positive integer $n$ and every $x\in\mathbb C^{n}$, computes $F_nx$ exactly, in running time

$$
O\bigl(n(\log n)^{\theta}(\log\log n)^{4-\theta}\bigr)
$$

in the model described below, including scalar preparation, schedule construction and index work. It suffices to supply one specified root of unity $\zeta_{D_*}$ for an explicitly computable $D_*<1024n^{3}$. Consequently the transform is computable at every length in $O(n(\log n)^{1-10^{-13}})=o(n\log n)$ time, and so is exact linear convolution, equivalently multiplication of complex polynomials. [1]

**Companion** (OpenAI, "Finite tensor savings and exact Fourier circuits", 25 September 2026). There are exact nonuniform Fourier circuits of size $o(n\log n)$ along an unbounded sequence of lengths, counting every addition, subtraction and scalar multiplication. This refutes the $\Omega(n\log n)$ lower bound in the unrestricted complex linear-circuit model. [2]

The model, and what the theorem does not say. Complex field operations cost one unit; on the input only addition, subtraction and multiplication by prepared, input-independent scalars are used; integer operations on $O(\log n)$-bit words cost one unit; there is no bound on coefficients or intermediate magnitudes and no numerical-stability assertion. The paper says the constants are enormous, that these are "asymptotic existence and explicitness results, with no useful crossover estimate", and that the conclusion "does not assert a corresponding improvement for stable floating-point FFTs or for bit complexity". The multiplication paper of family 109 shares a component with this one but states that neither result is a consequence of the other. [1]

## How the claimed proof goes

What follows is a map of the main paper's construction and of the companion's existence argument, from their introductions and the sections they point to. It is not a check of the details. [1][2]

**The idea.** A finite saving for one fixed small matrix, iterated through tensor powers, gives a power saving in the exponent of the logarithm: if $A^{\otimes k}$ can be applied with $O(q^{k}(k+1)^{\theta})$ operations instead of the obvious $kq^{k-1}$ calls to $A$, for a fixed $\theta<1$, then anything built from tensor powers of $A$ inherits the exponent $\theta$. The difficulty is to make such a saving survive three transitions: using all coordinates during recursive batching without allocating fresh zero workspace at each level, compiling small Fourier matrices $F_r$ without widening them to a power of two, and organizing a product of many coordinate sets with linear array work, all while charging for the preparation of scalars and schedules, which the paper insists on. [1]

**The constants.** The main paper fixes $m=10^{6}$ binary coordinates per block, $W_*=2^{71}$ arrays, a saving $\Delta=6871402692000000$, the recurrence multiplier $\lambda=m-\Delta/W_*$, and $\theta=\log_m\lambda=0.99999999999978935\ldots$; the decimal is given only to show the size of the saving. The theorem's running time is $O(n(\log n)^{\theta}(\log\log n)^{4-\theta})$, hence eventually $O(n(\log n)^{1-10^{-13}})$. [1]

**The tensor network (Section 2).** A fixed finite network computes tensor powers of

$$
C=\frac12\begin{pmatrix}1+i&1-i\\1-i&1+i\end{pmatrix}
$$

in $O(2^{k}(k+1)^{\theta})$ operations. It is the complex phase network of the integer-multiplication paper of the same release, reproduced here with its own uniform array implementation: a scalar network with arbitrary auxiliary values, binary labels that prescribe changes of frame between the scalar gates and turn binary dimensions into directional operations, a dimension budget for the residual subspaces (Lemma 2.3), and a finite network interface (Proposition 2.4) that transforms every physical role including those used as temporary storage. Padding the number of roles to a power of two makes the recursive batching exact, linear-time address changes keep the indexing cheap (Lemma 2.5), and Theorem 2.6 states the resulting tensor bound with its critical exponent. [1]

**The compiler (Section 3).** Independently of the network, Newton interpolation factors every Fourier matrix $F_r$ into diagonal factors and a triangular Toeplitz matrix with its transpose (Lemma 3.2, Newton reduction). Triangular Toeplitz multiplication is a convolution, and convolutions are computed recursively with "borrowed" coordinates that may hold arbitrary data and are restored by cancellation (Lemma 3.3, replay with arbitrary borrowed coordinates). The result is a word of $O(1+\log^{4}r)$ layers on exactly $r$ coordinates, each layer monomial or a disjoint union of invertible two-coordinate maps, valid at every primitive root (Lemma 3.5). The compiler chooses chunk sizes by counting the registers its own convolution programs need, the measured workspace rule, and all compilation and scalar preparation take polynomial time in $r$. [1]

**The schedule (Sections 4 and 5).** Choose a working length within a factor of two of $2n$ as a product of small odd primes supplemented by one power of two (Lemma 5.1, enough small pairwise coprime factors). Chinese-remainder permutations turn $F_N$ into a tensor product of the $F_r$ over the prime-power factors; the compiled words are synchronized across the axes so that each simultaneous pair layer decomposes into sectors carrying tensor powers of $C$, a concrete sector-address formula packs all sectors with linear array work (Lemma 4.1, Proposition 4.2), and a chirp convolution gives the transform at every requested length from the working length. The $(\log\log n)^{4-\theta}$ factor comes from the $O(1+\log^{4}r)$ layers per prime and the number of odd primes being of order $\log n/\log\log n$. The paper says the role-preserving recurrence, the measured-fit compiler and the linear-time traversal are what prevent three possible losses: fresh workspace at every recursive use, scalar preparation treated as free, and one operation per coordinate per layer. [1]

**The companion: why a finite win must exist.** The second paper proves, in a non-uniform circuit model with unrestricted coefficients, that $\liminf L(n)/(n\log_2n)=0$ along an unbounded sequence of lengths. A finite win is an exact word for $A^{\otimes b}$ using fewer than $bq^{b-1}$ calls to a nonmonomial $q\times q$ matrix $A$, with permutations and diagonal maps allowed between calls. Part (i), transfer: one fixed positive-call pattern with adjustable monomial factors realizes every invertible matrix of the same width (Lemma 2.2, positive generation), so a finite win amplifies to $O(q^{k}(k+1)^{\alpha})$ gates for $A^{\otimes k}$ (Lemma 2.3); the exact-width Fourier layers and synchronization across prime factors then carry the saving to $F_n$ (Proposition 3.4). Part (ii), existence: suppose no finite win exists for any matrix. Comparing tensor-axis computations with words over a finite collection of matrix types, several comparisons that together save calls to every type could be placed on disjoint tensor sectors and scheduled as one block-diagonal matrix, giving a win; so by separation and compactness there is a price function $p$, positive on nonmonomial matrices, with exact tensor and direct-sum laws (Theorem 4.1, global prices under the no-win assumption). Theorem 5.1, invertible corners, shows an invertible corner costs no more than its containing matrix, by a time cascade with a negligible initial-state correction. Normalizing a shear to price one and applying basis exchanges to signed bit-coordinate matrices gives involutions of width $w(d)$ and price $dw$; their $+1$ eigenspace is the graph of an invertible matrix, and the orthogonal reflection $R$ in that graph has price at least $dw-O(w)$ by one description and at most $\tfrac34dw+O(w)$ by another, through a sparse symmetric matrix with at most $(d/2+1)w$ off-diagonal pairs and generic two-coordinate perturbations costing $3/2$ each. The two bounds are incompatible for large $d$, so a finite win exists (Theorem 8.3); the feedback law and algebraic specialization of Section 6 and the pivot inequalities of Section 7 supply the intermediate price comparisons. The paper stresses that the two parts meet only at the definition of a finite word and that no finite win is needed for every matrix. [2]

Where would an expert look first? At the finite tensor saving and its explicit constants in the main paper's Section 2 (the saving $\Delta$ against $W_*m$), which is the source of everything; at the companion's price-function construction and the two incompatible bounds on $p(R)$; at the accounting of scalar preparation and address work; and at the restoration of borrowed coordinates in the compiler. [1][2]

## Consequences inside mathematics

If the proofs hold, $n\log n$ is not a lower bound for the discrete Fourier transform in the unrestricted linear-circuit model, which separates that model sharply from the bounded-coefficient model where Morgenstern's bound holds, and the saving can be made uniform across all lengths. Exact polynomial multiplication inherits the bound. Together with the integer-multiplication result of family 109, it suggests that the $n\log n$ barrier for transform-based algorithms was a feature of the models rather than of the problems. Nothing follows for floating-point FFTs. [1][2]

## Uses outside mathematics

No known direct application.

The FFTs in signal processing run in floating point with bounded multipliers, where this theorem says nothing and Morgenstern's lower bound still applies; and the constants here are, in the paper's words, enormous. [1]

## Has anyone checked it?

We found no named mathematician who says they are reading or checking either paper. The result was noticed alongside the multiplication result on 7 October, in posts that discussed the models rather than the proofs. VibeMathed records no check by an independent mathematician. [5][6]

**Machine checking.** The release's catalogue `formalization.yaml` lists two Lean statements for this family. `ExactFourier.lean`, 62 lines, proves the companion's subsequential claim: for every $c>0$ and every cutoff there is a length with an exact Fourier circuit of fewer than $cn\log_2n$ gates. `UniformFourier.lean`, 336 lines, was added on 26 October; it defines its own machine model (tapes, a work-unit bill for every operation, the paper's constants $m=10^{6}$ and $W_*=2^{71}$) and states fixed deterministic programs computing the exact transform and the exact convolution of two length-$n$ vectors at every length $n$, with work $O(n(\log n)^{1-10^{-13}})$, the root of unity supplied. The scope note says the synthesis appendix's extraction and search are outside it. Because the statement defines its own cost model, a reader should check that model against the paper's. We found no outside replay. A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval. [7]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; neither paper in this family is among them. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements, among them the uniform statement for this family described above. [8]

## Sources

1. OpenAI, "An explicit power saving for the exact discrete Fourier transform", 25 September 2026. The introduction, the arithmetic model, Theorem 1.1, Corollaries 1.2 and 1.3 and the construction overview. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/An-explicit-power-saving-for-the-exact-discrete-Fourier-transform-September-25-2026/main.pdf
2. OpenAI, "Finite tensor savings and exact Fourier circuits", 25 September 2026. Abstract. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Finite-tensor-savings-and-exact-Fourier-circuits-September-25-2026/main.pdf
3. James W. Cooley and John W. Tukey, "An algorithm for the machine calculation of complex Fourier series", Mathematics of Computation 19 (1965), 297-301; the Gauss attribution is standard and summarized in Wikipedia, "Fast Fourier transform", read 18 October 2026. https://doi.org/10.1090/S0025-5718-1965-0178586-1 and https://en.wikipedia.org/wiki/Fast_Fourier_transform
4. Jacques Morgenstern, "Note on a lower bound on the linear complexity of the fast Fourier transform", Journal of the ACM 20 (1973), 305-306. https://doi.org/10.1145/321752.321761
5. FindGoodAI, "OpenAI put multiplication and Fourier transforms below n log n", 7 October 2026, read 18 October 2026, as an example of the early reaction. https://www.findgoodai.com/ai-outpost/openai-math-below-n-log-n-multiplication-fft/
6. VibeMathed, "DFT n log n lower bound", read 18 October 2026. https://vibemathed.com/problem/dft-n-log-n-lower-bound
7. OpenAI, Lean scope note for family 130 and the comparator statements `ExactFourier.lean` and `UniformFourier.lean` at the pinned commit. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/130.md , https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/ExactFourier.lean and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/UniformFourier.lean
8. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
