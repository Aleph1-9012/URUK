---
family: "266"
topic: "Mutually unbiased bases in dimension six"
title: "How many ways can a six-level quantum system be measured so that each measurement tells you nothing about the others?"
paperTitle: "The maximum number of mutually unbiased bases in dimension six"
claim: "The maximum number of pairwise mutually unbiased orthonormal bases in C^6 is three: three exist, and a certified computation under stated floating-point conditions excludes four. A companion proves by exact arithmetic the Matolcsi-Ruzsa-Weiner Fourier-vanishing conjecture for order-six complex Hadamard matrices and an upper bound of five."
status: unreviewed
checked: 2026-10-18
papers:
  - preprints/The-maximum-number-of-mutually-unbiased-bases-in-dimension-six-September-24-2026/The-maximum-number-of-mutually-unbiased-bases-in-dimension-six-September-24-2026.pdf
  - preprints/Exact-Fourier-certificates-for-complex-Hadamard-matrices-of-order-six-September-24-2026/Exact-Fourier-certificates-for-complex-Hadamard-matrices-of-order-six-September-24-2026.pdf
draft: false
---

Position and momentum are the classic pair: knowing one exactly leaves the other completely uncertain. For a quantum system with finitely many levels, $d$ of them, the analogue is a pair of measurement bases in which a definite outcome in one makes every outcome in the other equally likely. Such bases are called mutually unbiased, and they are the raw material of quantum state tomography and quantum key distribution. At most $d+1$ bases can be pairwise unbiased, and when $d$ is a prime power, like $2$, $3$, $4$, $5$, $7$, $8$ or $9$, that many exist. The first dimension that is not a prime power is six, and there nobody has ever found more than three, although seven would be allowed. Gerhard Zauner conjectured in his 1991 diploma thesis that three is the maximum. Thirty-five years of numerical search and partial exclusions left the answer somewhere in $\{3,4,5,7\}$. On 24 September 2026 OpenAI posted two papers: one claims, by a certified computation, that four unbiased bases do not exist in dimension six; the other proves by exact arithmetic that seven do not and settles a related conjecture about $6\times6$ Hadamard matrices. [1][2][3][4]

As of 18 October 2026 no mathematician has said publicly that they have checked the proofs. One independent researcher has re-run the computation from the text of the paper. The status on this page is "unreviewed".

## The problem

Two orthonormal bases $\mathcal B$ and $\mathcal C$ of $\mathbb C^{d}$ are mutually unbiased if

$$
|\langle b,c\rangle|^{2}=\frac1d\qquad\text{for every }b\in\mathcal B,\ c\in\mathcal C.
$$

In physical terms, if the system is prepared in a state of $\mathcal B$ and measured in $\mathcal C$, every outcome has probability $1/d$. Let $N(d)$ be the largest number of pairwise mutually unbiased bases in $\mathbb C^{d}$. A counting argument gives $N(d)\le d+1$, and Wootters and Fields showed in 1989 that $d+1$ is attained in every prime-power dimension and that such a complete set is optimal for determining an unknown state. [1][3]

In dimension six, three unbiased bases are easy: take the tensor product of a complete set in dimension two with one in dimension three. Nobody has found a fourth. Up to a common unitary change of coordinates, the first basis is the standard one and the second is the column basis of $H/\sqrt6$ for a complex Hadamard matrix $H$, a $6\times6$ matrix with all entries of absolute value one and $HH^{*}=6I$. The question is whether some $H$ admits two more bases unbiased to both and to each other. [1]

**Zauner's conjecture (1991).** $N(6)=3$. [1]

<!-- uruk:visual-note
A visual for this page can show two unbiased bases in dimension two on the Bloch sphere, then the overlap table $|\langle b,c\rangle|^{2}$ for a triple in dimension six, all entries $1/6$, and then the graph search of the proof: candidate vectors as vertices, possible orthogonality and possible unbiasedness as two kinds of edge, and the pattern of two disjoint six-cliques that never appears.
-->

## Why it stayed open

What was known. Grassl showed in 2004 that the standard basis and the Fourier basis cannot be part of four. Jaming, Matolcsi, Móra, Szöllősi and Weiner proved in 2009, by a certified computer search, that the standard basis together with any member of the two-parameter Fourier family of Hadamard matrices cannot be extended to four, and later outlined a program for the general case. Numerical searches by Butterley and Hall in 2007 and by Brierley and Weigert in 2008 never found a fourth basis and kept stalling at the same value of their objective. Weiner's completion theorem rules out exactly six bases, so before this release $N(6)$ was known to lie in $\{3,4,5,7\}$. The difficulty is that complex Hadamard matrices of order six form a continuous family that has not been classified, so the second basis cannot be enumerated. [1][2][4]

## What OpenAI claims

**Theorem 1.1** (OpenAI, "The maximum number of mutually unbiased bases in dimension six", 24 September 2026, labelled computer-assisted). Under the arithmetic and compiler conditions stated in the paper's appendix, the fresh complete execution documented in the paper certifies that there are no four pairwise mutually unbiased orthonormal bases in $\mathbb C^{6}$. Consequently $N(6)=3$. [1]

**Companion** (OpenAI, "Exact Fourier certificates for complex Hadamard matrices of order six", 24 September 2026). Every complex Hadamard matrix of order six outside Tao's cubic equivalence class has a vanishing character sum at every permutation of $(1,1,1,-1,-1,-1)$, proving the Fourier-vanishing conjecture of Matolcsi, Ruzsa and Weiner. An exact certificate excludes seven mutually unbiased bases in $\mathbb C^{6}$, which with Weiner's theorem gives $N(6)\le5$. Both certificates use only integer and rational arithmetic. [2]

What these do and do not say. The main theorem is a computer-assisted proof whose validity depends on the stated conditions: that the machine performed IEEE binary64 arithmetic correctly and the compiler behaved as documented, for one recorded run. The companion's results are exact and need no such assumption, but reach only $N(6)\le5$. Nothing is claimed about dimension ten or other non-prime-power dimensions, about the classification of order-six Hadamard matrices, or about Zauner's other conjecture on symmetric informationally complete measurements. [1][2]

## How the claimed proof goes

What follows is a map of the main paper's five-stage argument and of the companion's exact certificates, from their introductions and from the sections they point to. It is not a check of the details or of the code. [1][2]

**The idea.** Without loss of generality the first basis is the standard one, so the second basis is a complex Hadamard matrix $H$ of order six, a unitary all of whose entries have modulus $1/\sqrt6$. The paper covers all possible $H$ by finitely many small balls in the space of their phases, and in each ball excludes two further bases by a finite search with certified error bounds. Since $H$ moves within each ball, every test must hold uniformly across the ball; every rejection uses a necessary condition with an explicit safety margin, and a failed certification leaves an unresolved region rather than a false exclusion. The paper stresses the distinction between proposing a numerical object and certifying it: a floating-point centre need not be an exact Hadamard matrix, a computed eigenspace need not parametrize a component, and a numerical linear solve is accepted only when a separate bound verifies the required inequality. The closest antecedent is the certified discretization of Jaming, Matolcsi, Móra, Szöllősi and Weiner, who in 2009 excluded four bases when the second basis belongs to the two-parameter Fourier family; here the cover is of arbitrary second bases. [1]

**Stage 0: the lower bound.** Three mutually unbiased bases exist, by the tensor product $\mathbb C^{6}=\mathbb C^{2}\otimes\mathbb C^{3}$: with $A_0=I_2$, $A_1$ the $2\times2$ Fourier matrix and $A_2=\frac1{\sqrt2}\bigl(\begin{smallmatrix}1&1\\i&-i\end{smallmatrix}\bigr)$, and $B_0=I_3$, $B_1=F_3$, $B_2=\mathrm{diag}(1,\omega,\omega)F_3$, the columns of $U_r=A_r\otimes B_r$ are three bases with $|\langle\cdot,\cdot\rangle|^{2}=\frac12\cdot\frac13=\frac16$ across bases. This is kept separate from the computer-assisted exclusion of a fourth. [1]

**Stage 1: seeds.** Rephasing rows and columns makes the first row and column of $H$ equal to one, leaving nine free phases in the first two rows and columns. A symmetry reduction and necessary interval tests cover their possible values by finitely many seed balls; the five-bin lists for the seed cover number at most $\binom{116}5=160{,}389{,}488$ before filtering. [1]

**Stage 2 (A): completion over a seed.** Write $H$ in blocks with row and column sizes $2+4$. The seed fixes the upper-left, upper-right and lower-left blocks up to their displacements; the lower-right $4\times4$ block is unknown. At a seed centre passing the frame checks, the upper-right block and the conjugate transpose of the lower-left block have rank two, hence two-dimensional kernels in $\mathbb C^{4}$; compressing the unknown block between these kernels gives a $2\times2$ matrix, and the Hadamard equations bound its distance from $\sqrt6$ times its unitary polar factor (Polar Comparison lemma). A closed cover of $U(2)$ therefore accounts for every feasible completion, and uniform Taylor bounds on each cell either exclude it (Norm Exclusion, Directional Exclusion) or place all its exact completions in certified phase balls. The frames stay fixed at the seed centre, which need not itself be feasible. The finite recursion refines the unitary grid to depth 512 under an explicit node cap; reaching the cap records an unresolved seed rather than a success. [1]

**Stage 3 (B): refinement.** Each ball carries numerical directions approximating the tangent directions of the Hadamard equations; a verified residual identity bounds the error in representing every exact solution displacement by these directions, so covering the tangent coordinates while keeping the normal bound gives smaller balls that still cover all the exact solutions. No manifold parametrization is needed. [1]

**Stage 4 (C): exclusion in a ball.** A phase-bin search covers every vector unbiased to the first two bases by small closed vector balls (Certified Clustering, Distinct Labels). These are the vertices of two graphs: an edge in $\mathcal O$ records that the pair could be orthogonal, an edge in $\mathcal U$ that it could be unbiased, and necessary tests, including edge Taylor equations and a joint test with one tangent variable, remove only impossible edges. Two further bases would be two disjoint six-cliques in $\mathcal O$ with all $36$ cross edges in $\mathcal U$; the Complete Graph Search finds no such pattern, giving a Local Exclusion Certificate for the ball. [1]

**Stage 5: execution.** Section 7 specifies the programs, the binary64 arithmetic and its conservative rounding, the finite control flow with its explicit caps (grid depth, extra-node cap of $1{,}000{,}000$, record counts capped at $2{,}000{,}000$), and the recorded certificate. The complete run accounts for every seed, every refined ball and every initially unresolved record; a fallback finishes with none unresolved. The appendix states the arithmetic contract under which the run is a proof, and the theorem is stated conditionally on it. [1]

**The companion: exact certificates.** The second paper proves two things with exact rational arithmetic and no floating point. The Fourier Vanishing theorem: for every complex Hadamard matrix of order six, certain character sums $g_H(\alpha)$ over its phases vanish, by averaging monomials in the entries over distinct row and column indices, using orthogonality to express a row's moment through moments with merged rows, and adding an auxiliary absolute square to $|g_H(\alpha)g_H(q)|^{2}$ so that a finite average of nonnegative terms is zero; two choices of $q$ force a dichotomy, either all permuted characters vanish or the entrywise square $H^{\circ2}$ is itself Hadamard, in which case Newton's identities and a five-cycle classify the matrix as the cubic matrix $T$. The No Complete Family theorem: seven mutually unbiased bases cannot exist in $\mathbb C^{6}$, first excluding a cubic transition matrix by an exact character calculation, then, in the remaining case, averaging products of character sums over ordered pairs and triples of bases and exhibiting six positive quadratic forms whose combined expansion has a negative constant term dominating all other coefficients, contradicting positivity since every moment has modulus at most one. Modular elimination locates the certificates and exact integer multiplication verifies them. By Weiner's completion theorem, six bases would extend to seven, so this gives $N(6)\le5$ exactly; the sharper $N(6)=3$ comes only from the main paper's certified computation. The companion also notes that Matolcsi, Matszangosz, Varga and Weiner had conjectured exactly this vanishing as a route to $N(6)=3$. [2]

Where would an expert look first? At the rounding appendix and the arithmetic contract, and whether the margins are sufficient; at the completeness of the $U(2)$ cover and the Polar Comparison bound in Stage A; at the claim that every edge test is a necessary condition; and, for the exact part, at the equality-pattern expansion that turns products of character sums into injective moments. An independent re-run from the paper's text, which exists, addresses the code but not the mathematics of the reduction. [1][2][6]

## Consequences inside mathematics

If the computation and its reduction hold, Zauner's dimension-six conjecture is settled and the first non-prime-power dimension has strictly fewer than $d+1$ mutually unbiased bases, which bears on the long-standing question of whether complete sets exist only in prime-power dimensions. The companion's exact results stand on their own: the Matolcsi-Ruzsa-Weiner conjecture on Fourier vanishing for order-six Hadamard matrices, and $N(6)\le5$ without floating point. [1][2]

## Uses outside mathematics

Mutually unbiased bases are used in quantum key distribution protocols and in quantum state tomography, where complete sets give optimal measurements. Dimension six is small enough to matter for designed systems: knowing that only three unbiased bases exist tells an experimenter what cannot be built. No application of the theorem itself is documented; the practical protocols use prime-power dimensions, where complete sets have been known since 1989. [3]

## Has anyone checked it?

On 13 October Manvir Jaswal, who gives his affiliation as independent researcher in Toronto, deposited on Zenodo "An independent certified computation excluding four mutually unbiased bases in dimension six", with the programs, logs and data. Its abstract says the programs "are written from the text of the preprint, and we prove every statement of the preprint that our proof uses", with every inequality decided in exact integer arithmetic or interval arithmetic with outward rounding, under the assumption that the machine's binary64 arithmetic was correct. This is an independent replication of the computation, which for a computer-assisted proof is meaningful evidence. It is not a check by a named expert in the field, and Uruk counts it the way it counts an outside Lean replay. We found no public statement from Grassl, Bengtsson, Weigert, Matolcsi, Weiner or Zauner. VibeMathed lists the result as a candidate with review pending. [6][7]

**Machine checking.** The release's Lean scope note is candid: the linked statement `MUBSix.lean` "proves a weaker family bound: every family in its mutually unbiased bases model has at most five members", together with the Fourier-vanishing theorem, and "does not establish the paper's upper bound of three or its computer-assisted exclusion of four arbitrary bases". That statement is not in the catalogue `formalization.yaml` either. So the headline $N(6)=3$ rests on the written reduction plus the recorded computation and Jaswal's replication, with no Lean behind it. A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval. [5]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; neither paper in this family is among them. On 26 October OpenAI restored the C++ source and the saved numerical records of the main paper's computation, with a Python checker for their consistency and coverage; the papers themselves did not change. [8]

## Sources

1. OpenAI, "The maximum number of mutually unbiased bases in dimension six", 24 September 2026. Theorem 1.1, the historical context and the covering and exclusion strategy. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/The-maximum-number-of-mutually-unbiased-bases-in-dimension-six-September-24-2026/The-maximum-number-of-mutually-unbiased-bases-in-dimension-six-September-24-2026.pdf
2. OpenAI, "Exact Fourier certificates for complex Hadamard matrices of order six", 24 September 2026. Abstract. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Exact-Fourier-certificates-for-complex-Hadamard-matrices-of-order-six-September-24-2026/Exact-Fourier-certificates-for-complex-Hadamard-matrices-of-order-six-September-24-2026.pdf
3. William K. Wootters and Brian D. Fields, "Optimal state-determination by mutually unbiased measurements", Annals of Physics 191 (1989), 363-381. https://doi.org/10.1016/0003-4916(89)90322-9
4. Philippe Jaming, Máté Matolcsi, Péter Móra, Ferenc Szöllősi and Mihály Weiner, "A generalized Pauli problem and an infinite family of MUB-triplets in dimension 6", Journal of Physics A 42 (2009), 245305. https://doi.org/10.1088/1751-8113/42/24/245305
5. OpenAI, Lean scope note for family 266 and the comparator statement `MUBSix.lean` at the pinned commit. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/266.md and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/MUBSix.lean
6. Manvir Jaswal, "An independent certified computation excluding four mutually unbiased bases in dimension six", Zenodo, 13 October 2026. https://doi.org/10.5281/zenodo.23255858
7. VibeMathed, "Zauner's conjecture: at most three mutually unbiased bases in dimension six", read 18 October 2026. https://vibemathed.com/problem/mutually-unbiased-bases-dimension-six
8. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
