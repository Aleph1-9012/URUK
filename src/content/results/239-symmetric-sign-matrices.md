---
family: "239"
topic: "Singularity of random symmetric matrices"
title: "How often is a symmetric matrix of coin flips singular?"
paperTitle: "The sharp exponential rate of singularity for symmetric Bernoulli matrices"
claim: "For a real symmetric matrix with independent fair signs on and above the diagonal, the probability of singularity is (1/2 + o(1))^n. A companion claims exponential rate p^2 + (1-p)^2 for each fixed non-half bias p."
status: unreviewed
checked: 2026-11-07
papers:
  - preprints/The-sharp-exponential-rate-of-singularity-for-symmetric-Bernoulli-matrices-October-3-2026/symmetric-bernoulli-singularity.pdf
  - preprints/The-sharp-singularity-rate-for-biased-symmetric-sign-matrices-October-4-2026/biased-symmetric-sign-singularity.pdf
draft: false
---

Fill the upper half of a square grid, including its diagonal, with independent coin flips: $+1$ for heads and $-1$ for tails. Reflect each off-diagonal entry across the diagonal. The resulting symmetric matrix can encode a system of linear equations. Sometimes those equations are dependent, so the matrix loses information about its input. Two identical rows are one obvious way for this to happen. How much more likely is dependence when every possible cause is counted? OpenAI's papers dated 3 and 4 October 2026 claim a sharp answer at the exponential scale, first for fair coins and then for each fixed biased coin. [1][2]

The fair-coin claim is $2^{-n+o(n)}$ for an $n$-by-$n$ matrix. Earlier work had proved exponential decay without identifying this rate. In our search on 7 November 2026, we found no public expert verification of either complete proof. A Columbia seminar announcement discusses the new claim as part of its history, while explicitly separating it from established results. The label here is "unreviewed". [6][10]

## The problem

A matrix is a rectangular array of numbers. Here it is square, with $n$ rows and $n$ columns, and symmetric: $a_{ij}=a_{ji}$. Only the $n(n+1)/2$ entries on and above the diagonal are chosen independently. The entries below it repeat choices already made. The diagonal entries are random signs too. Fixing them to zero would give a different model. [1][2]

Multiplying a column of unknowns $x$ by the matrix $A$ produces the left sides of a system $Ax=y$. A nonsingular, or invertible, matrix determines exactly one $x$ for every right side $y$. A singular matrix has a nonzero vector $v$ with $Av=0$, called a kernel vector. Adding $v$ to any solution leaves its right side unchanged. Thus a singular system has either no solution or more than one, depending on $y$. The determinant, written $\det A$, is zero exactly when the square matrix is singular. These are the equivalent descriptions used in the papers. [1][2]

For example, the matrix

$$
\begin{pmatrix}1&1\\1&1\end{pmatrix}
$$

asks for $x_1+x_2$ twice and sends $(1,-1)^{\mathsf T}$ to zero. Replacing its bottom-right entry by $-1$ gives the two equations $x_1+x_2=y_1$ and $x_1-x_2=y_2$, which determine both unknowns. These small examples illustrate dependence; the theorem concerns the probability as the size tends to infinity. [1]

There is an elementary reason to expect the fair-coin probability to be at least $2^{-n}$. Require the first two rows to agree. Outside their shared two-by-two corner, $n-2$ independent pairs of signs must match, each with probability $1/2$. At the corner, the three independently chosen entries $a_{11},a_{12},a_{22}$ must all agree, an event of probability $1/4$. Multiplying gives $2^{-(n-2)}/4=2^{-n}$. Opposite rows also force singularity and have the same probability for a specified pair. [1][2]

The difficult direction is the upper bound. A matrix can have dependent rows without any two being equal or opposite. A kernel vector can involve all $n$ coordinates with unequal coefficients. One must account for all such dependencies at once, rather than check a list of obvious coincidences. [1][3]

## Why it stayed open

János Komlós proved in 1967 that a random matrix with independent fair $0/1$ entries is nonsingular with probability tending to one. That model chooses every entry independently. In a symmetric matrix, exposing a row also exposes entries of the rows still to come. The independent-row argument cannot simply be reused. [3][4]

Kevin Costello, Terence Tao and Van Vu addressed the symmetric problem in a 2005 preprint, published in 2006. They traced the earlier nonsingularity question to Weiss in the early 1990s, with an explicit qualification about that attribution. Their initial bound was polynomial. In Section 7 they switched to sign entries and stated the sharp-rate conjecture explicitly as Conjecture 7.4. Their method controlled how often quadratic expressions in random variables take a specified value, an extension of Littlewood-Offord theory. Quadratic expressions arise because a newly exposed row also supplies its matching column. [3]

Successive estimates made singularity rarer, but symmetry continued to obstruct the sharp exponent. Marcelo Campos, Matthew Jenssen, Marcus Michelen and Julian Sahasrabudhe finally proved an upper bound $e^{-cn}$ for some absolute $c>0$ in a 2021 preprint, published in 2025. Their argument used information from conditioned random walks to handle the reused randomness. This established exponential decay. It left open whether the leading constant in $-\log\Pr(\det A=0)$ is $\log 2$. [6]

Meanwhile, Konstantin Tikhomirov obtained $(1/2+o(1))^n$ for independent fair sign entries in work posted in 2018 and published in 2020. Vishesh Jain, Ashwin Sah and Mehtaab Sawhney later determined more precise asymptotics for independent entries with fixed nonuniform finite distributions, including biased signs. Those results concern matrices with independent rows. They provide context and tools for the present papers, but do not establish their symmetric claims. [5][7]

The new approach studies the arithmetic of smaller symmetric matrices inside the original one. It relates the number of columns that could complete a singular matrix to integer lattices and finite groups. The remaining task is probabilistic: matrices with arithmetic that permits many such columns must themselves be sufficiently rare. That second requirement matters because an estimate valid for most matrices can still miss an exceptional set larger than the singularity probability being sought. [1][2]

## What OpenAI claims

**Fair signs, Theorem 1.1 of the 3 October paper.** Let $A_n$ be real symmetric, with independent uniform signs on and above its diagonal. Then

$$
\Pr(\det A_n=0)=\left(\frac12+o(1)\right)^n=2^{-n+o(n)}.
$$

Equivalently, the $n$th root of this probability tends to $1/2$. The notation $o(n)$ denotes a quantity whose ratio to $n$ tends to zero. It allows multiplicative factors such as $n^2$ or even $2^{\sqrt n}$. Such factors are called subexponential. The claim therefore identifies the exponential rate, not the precise factor multiplying $2^{-n}$. It does not prove that almost every singular matrix has two equal or opposite rows. [1]

**Biased signs, Theorem 1.1 of the 4 October paper.** Fix $p\in(0,1)$ with $p\ne1/2$. Choose each upper-triangular entry, including the diagonal, to be $+1$ with probability $p$ and $-1$ with probability $1-p$. For the resulting symmetric matrix $A_n^{(p)}$, the claim is

$$
\lim_{n\to\infty}\Pr\bigl(\det A_n^{(p)}=0\bigr)^{1/n}
=p^2+(1-p)^2.
$$

Write $Q=p^2+(1-p)^2$. This is the probability that two independent signs from the biased coin agree. The event that two specified rows agree has probability

$$
\bigl(p^3+(1-p)^3\bigr)Q^{n-2}.
$$

The first factor comes from their shared corner. For fixed $p$, it does not affect the exponential rate. The theorem says that adding every other cause of singularity leaves that rate at $Q$. Its error and thresholds may depend on $p$; it gives no uniform conclusion for a bias that changes with $n$. The companion uses results from the fair paper, so it is not an independent confirmation of that argument. [2]

For orientation, $p=3/4$ gives $Q=5/8$. This substitution illustrates the claimed rate, rather than predicting an accurate failure percentage for a particular finite matrix. Neither paper supplies such a percentage through its asymptotic statement. [2]

## How the claimed proofs go

The central question is how many new columns can turn an invertible smaller matrix into a singular larger one. The fair paper bounds their expected number using arithmetic structure. The biased companion must also account for their unequal probabilities. The following map follows the pinned TeX, with the numbered reductions, estimates and final assembly checked against the source. It explains the arguments and their dependencies; it is not an independent verification of either proof. [1][2]

### Fair signs: count the columns that could cause dependence

**1. Change signs to bits without changing singularity.** Multiply the matrix by a global sign and change matching row and column signs so that the first row and column consist entirely of ones. Eliminate that first coordinate by subtracting its contribution from the remaining block. This operation, a Schur complement, leaves $-2$ times a random symmetric $0/1$ matrix. Fairness means the remaining bits are still independent and uniform after conditioning on the first row. Lemma 2.1 gives an exact equality of singularity probabilities between the sign model in size $n$ and the bit model in size $N=n-1$. [1]

**2. Reduce to one direction of dependence.** The dimension of the kernel is the corank. Lemma 2.3 makes large corank exceptionally unlikely: once a maximal invertible principal block is fixed, the remaining entries are forced. For smaller corank, flipping a suitable few diagonal bits leaves precisely one kernel direction. Lemma 2.4 bounds the number of possible preimages of this operation by $2^{o(N)}$. This loses only a subexponential factor, which the target permits. A principal submatrix here means keeping the same set of row and column indices. [1]

For a matrix of corank one, delete a coordinate where a kernel vector has largest absolute value. The remaining principal matrix $B$ is invertible. If $z$ is the deleted column restricted to the remaining indices, and $a$ its diagonal bit, the kernel equation gives

$$
a=z^{\mathsf T}B^{-1}z,
\qquad \|B^{-1}z\|_\infty\le1.
$$

The superscript $\mathsf T$ means transpose, and the infinity norm is the largest absolute coordinate. Call a bit column admissible when it satisfies this bound and its quadratic expression is either $0$ or $1$. Write $\mathcal S(B)$ for the set of such columns, taking it empty for singular $B$. Lemma 2.5 yields

$$
\Pr(\operatorname{corank}\mathbf B_N=1)
\le N\,2^{-N}\,\mathbb E|\mathcal S(\mathbf B_{N-1})|,
$$

where $\mathbf B_m$ denotes a random symmetric bit matrix of size $m$. Each admissible column fixes its required diagonal bit, and the factor $N$ accounts for the deleted index. The desired upper bound will follow if the expected number of admissible columns is $2^{o(N)}$. [1]

**3. Measure the arithmetic that permits many columns.** Integer vectors that differ by an integer combination of $B$'s columns form the same class in the finite group $G_B=\mathbb Z^m/B\mathbb Z^m$. Its size is $|\det B|$. This group records denominator information in $B^{-1}z$. It also carries the pairing $x^{\mathsf T}B^{-1}y$ modulo integers. An admissible column has integer self-pairing, which restricts its class. [1]

The paper decomposes this group into cyclic groups of prime-power order. A cyclic group is generated by repeatedly adding one element. For a prime $q$ and exponent $e$, a layer counts how many cyclic factors have order divisible by $q^e$. A weighted sum of layer sizes defines a quantity $\Psi(B)$ between zero and one. Layers involving only one cyclic factor contribute nothing. Repeated arithmetic factors are the ones charged. Proposition 2.6 claims that, outside an exceptionally small set,

$$
|\mathcal S(B)|\le2^{N(\Psi(B)+o(1))}.
$$

The failure probability is smaller than $2^{-cN}$ for every fixed $c>0$ once $N$ is large enough. That strength is needed for a target already exponentially small. The task is now to justify the column estimate and control the large values of $\Psi$. [1]

**4. Turn many admissible columns into incompatible determinant bounds.** A lattice is the set of integer combinations of independent vectors. Its determinant measures the volume of a fundamental cell. Section 6 groups admissible columns according to their finite-group pairings. Within each class, the denominators of pairings are controlled. If a class is large, Lemma 3.7 extracts a subset that remains spread across its affine span, the smallest flat space containing it. No substantially smaller flat space contains a large fraction of the subset. [1]

Apply the map $x\mapsto(x,B^{-1}x)$ to those differences. The admissibility bound keeps the resulting vectors short, and the lattice tools bound the volume of their difference lattice. On the resulting graph, the expression $x^{\mathsf T}B^{-1}y$ defines a bilinear form, a quantity linear in each of its two vector inputs. The lattice volume and the controlled pairing denominators give a lower bound on this form's determinant after removing directions that pair to zero with everything. Rank and eigenvalue estimates give an upper bound on the same determinant. Comparing them limits the number of independent differences, hence the number of bit columns in the class. The bit cube is simply the set of all $0/1$ vectors. This is the mechanism behind Proposition 2.6. [1]

The subspace in this argument is chosen from the observed columns. Bounds for one predetermined subspace would not suffice. Theorem 4.1 constructs a finite cover for subspaces spanned by rational vectors whose integer lattices have controlled determinant. Proposition 5.1 then makes the required rank tests hold simultaneously. The lattice estimates also use Regev and Stephens-Davidowitz's reverse Minkowski theorem, which bounds short vectors after suitable lower bounds on sublattice determinants. These steps control the cost of choosing the subspace after seeing the matrix. [1][9]

**5. Make large arithmetic contributions pay a probability cost.** The required conclusion is an expectation bound, rather than a bound that holds only for most matrices. Proposition 2.7 asserts

$$
\mathbb E\!\left[
\mathbf1_{\{\det B\ne0\}}\,2^{N\Psi(B)}
\right]\le2^{o(N)},
\qquad B=\mathbf B_{N-1}.
$$

The indicator is one when $B$ is invertible and zero otherwise. To prove this, grow invertible principal submatrices by one or two coordinates. Lemma 7.1 ensures such paths exist. When two coordinates are needed, both new cross columns must be admissible for the smaller matrix $C$. Conditional on $C$, those columns are independent. If $C$ has size $m$, the probability that both qualify is exactly $(|\mathcal S(C)|/2^m)^2$. The column estimate controls this extra requirement. [1]

At a one-coordinate step, the old and new finite groups have a common quotient, a smaller group formed by identifying elements that differ by specified generators. Keeping many arithmetic layers through that quotient forces the new column into a particular integer lattice. Proposition 8.1 bounds cube intersections for all the relevant lattices simultaneously. Proposition 9.1 counts partial records of retained layers, balancing the probability of satisfying the record against the number of possible records. Lemma 10.1 supplies the numerical inequality that makes this cost compensate for an increase in $\Psi$. Together these prove the conditional estimate in Proposition 7.2. [1]

**6. Control the whole path without losing independence.** Section 11 uses a long initial path to rule out excessive weight in very high layers. It then studies a much shorter final window. If $\Psi$ is small anywhere in that window, the one-step estimate controls its final exponential weight. Otherwise the proof tracks the layers beyond the two largest cyclic factors, with a smaller contribution from those beyond the largest factor. Each ordinary step decreases this statistic by a controlled amount. Since it stays between zero and one, persistent positive potential requires many exceptional steps, each with a small conditional probability. This bounds the remaining contribution. The short window is needed so that the errors in successive local estimates still add up to $o(N)$. [1]

The backwards construction chooses a path from the completed matrix. Conditioning on that choice would change the law of future columns. The paper instead sums over a fixed collection of index paths and exposes each forwards, retaining independence of the new entries. The number of paths is $2^{o(N)}$. Combining this with the column estimate gives the required expectation, then $2^{-N+o(N)}$ singularity in the bit model, and finally $2^{-n+o(n)}$ for fair signs. [1]

### Biased signs: count columns and retain their probabilities

**7. Choose a row that is both algebraically useful and probabilistically typical.** Negating the matrix exchanges $p$ and $1-p$, so the companion assumes $p<1/2$ and puts $b=1-p$. Lemma 2.1 again reduces to corank one, now allowing for the probability change from flipping diagonal signs. Lemma 2.2 handles kernel vectors whose normalized coordinates away from the largest one lie close to a sparse vector, meaning one supported on few coordinates. Independent tests outside that support give the required rate $Q$. [2]

For the remaining vectors, many coordinates are large enough to use for deletion. Lemma 2.5 shows that most original rows have close to their expected proportion $p$ of positive signs. A suitable coordinate has both properties. The anchor is an index of largest absolute kernel coordinate. After conditioning on its row and changing signs, Lemma 2.3 gives a bit matrix with independent upper-triangular entries whose success probabilities are $p$ or $b$. Deletion leaves admissible columns satisfying a quadratic condition and a bound $\|B^{-1}z\|_2\le L_0\sqrt N$, where the norm is Euclidean length and $L_0$ is fixed. The typical count refers to the original signs, not to the transformed bits. [2]

**8. Rule out many admissible columns except at the cost of two rare constraints.** Proposition 2.4 bounds their number by $2^{\varepsilon_0N}$ outside an event of probability at most $2^{-N(2a-10\varepsilon_0)}$, where $a=-\log_2b$. This is an upper bound with an adjustable small loss in the exponent, not an asymptotic equality with $b^{2N}$. The constant $\varepsilon_0>0$ can be chosen sufficiently small. This needs a stronger lattice estimate than the fair proof. Theorem 4.1 says an intermediate lattice of sufficiently large index has fewer than $2^{\alpha N}$ cube points in each translate, for any fixed $\alpha>0$, simultaneously over the relevant lattices. Its proof uses a finite description of linear tests from a dual lattice, whose vectors have integer inner products with the original lattice. The chance that independent groups of entries satisfy those tests must beat the number of possible descriptions. [2]

Proposition 5.1 then bounds admissible columns when the total logarithmic size of the group's cyclic factors beyond its two largest is small. Paths of principal submatrices handle the other cases. In the final window, Lemma 6.7 forces either two rare column constraints at separate steps or a two-column extension where both columns are rare. Successive conditional bounds pay for both. The argument does not assume that randomly selected steps are independent. It imports the fair paper's lattice and pairing results as well as adapting its path method. [2]

**9. Compare both costs with the claimed rate.** A specified biased column could have probability as large as $b^N$, which is too large to reach $Q^N$. For a column with its typical number of positive signs, the proof instead obtains a bound $2^{-N(H_2(p)-\delta)}$ with a chosen small tolerance $\delta>0$, where

$$
H_2(p)=-p\log_2p-(1-p)\log_2(1-p).
$$

For fixed $p\ne1/2$, the two strict inequalities

$$
b^2<Q,
\qquad H_2(p)>-\log_2 Q
$$

leave room for the counting errors. Exceptional minors pay the bound with exponent close to that of $b^{2N}$; the few compatible columns of the other minors pay the entropy cost. The nearly sparse kernel case already has rate $Q$. The equal-row event supplies the matching lower bound. At $p=1/2$ the entropy margin disappears, so this argument does not settle the fair case. That case has its own proof; the biased argument imports its deterministic lemmas. [2]

The main dependencies for an expert to examine are the simultaneous lattice estimates, the arithmetic determinant comparison, and the conditional probability accounting along fixed paths. In the biased companion, the choice of a typical original row and the two-constraint estimate are additional points on which the claimed rate depends. Naming them identifies where the argument does its work; it is not a report of a gap. [1][2]

## Consequences inside mathematics

The fair theorem would settle the sharp exponential-rate conjecture stated by Costello, Tao and Vu. It would identify the exponential probability of an exact zero eigenvalue in this symmetric sign model. An eigenvalue is a scalar $\lambda$ for which $Av=\lambda v$ for some nonzero $v$; zero is an eigenvalue exactly when the matrix is singular. The biased theorem would identify how that rate changes with a fixed coin bias. [1][2][3]

More precise questions remain. The results do not determine a polynomial prefactor or characterize the typical singular matrix. They do not give the distribution of eigenvalues close to zero or the sharp probability of repeated nonzero eigenvalues. Those are different questions even though they concern the same matrices. The hypotheses also include a random diagonal and a fixed entry law; conclusions for other symmetric ensembles need their own arguments. [1][2][8]

## Uses outside mathematics

No known direct application of this sharper exponential rate was found in the papers and application sources checked for this article. A connection to solving linear systems helps explain both the interest and the limit. Exact nonsingularity guarantees a unique solution. Numerical stability also depends on how close the matrix is to being singular. [1][2][8]

The least singular value measures the smallest output length $\|Ax\|_2$ among inputs of length one. It is zero for a singular matrix and can be tiny for an invertible one. Campos, Jenssen, Michelen and Sahasrabudhe's separate least-singular-value work addresses this near-singularity problem and relates its history to numerical linear algebra. Family 239 concerns exact singularity. Its sharp asymptotic rate alone gives neither a new stable solver nor a finite-size reliability guarantee. [8]

## Has anyone checked it?

**Unreviewed, checked 7 November 2026.** We searched for public assessments of both manuscripts, including work and statements by researchers associated with the earlier singularity bounds. We found no named expert verification of either complete proof, journal acceptance, or named mathematical error report. This records the evidence found in that search, not what may be happening privately. [1][2]

There is public attention to the fair-sign claim. Columbia's Student Probability Seminar listed Jiahe Shen on 8 October for a historical survey of Bernoulli-matrix singularity. Its abstract includes the new symmetric sharp-rate claim and distinguishes it from established published results. It emphasizes the progression of bounds rather than technical proofs. The announcement does not report checking either proof, and does not explicitly identify the biased companion. It therefore supplies no verification verdict for either manuscript. [10]

**Machine checking.** Neither paper has a formalization listed in the release's Lean catalogue at the approved commit. No Lean proof or numerical certificate was run for this article. The mathematical content checks used to prepare the page check formula rendering and references; they do not verify the probability estimates or the proofs. [11]

Both papers are read at commit `4eaee87548250b2682affda7d05d947c05554bae`, dated 29 October 2026. The upstream main branch still pointed to that commit when checked on 7 November. The pinned change history records no withdrawal or revision of these two manuscripts. Their status concerns the stated symmetric models and does not inherit approval from earlier independent-entry theorems. [5][7][11]

## Sources

1. OpenAI, *The sharp exponential rate of singularity for symmetric Bernoulli matrices*, 3 October 2026. Main model and Theorem 1.1; reduction in Section 2; lattice and pairing estimates in Sections 3 to 6; conditional and path estimates in Sections 7 to 11. [Pinned paper](https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/The-sharp-exponential-rate-of-singularity-for-symmetric-Bernoulli-matrices-October-3-2026/symmetric-bernoulli-singularity.pdf), [TeX source](https://github.com/openai/math/tree/4eaee87548250b2682affda7d05d947c05554bae/preprints/The-sharp-exponential-rate-of-singularity-for-symmetric-Bernoulli-matrices-October-3-2026/build).
2. OpenAI, *The sharp singularity rate for biased symmetric sign matrices*, 4 October 2026. Fixed-bias Theorem 1.1; equal-row lower bound and entropy reduction in Section 2; lattice, pairing and path estimates in Sections 3 to 6. [Pinned paper](https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/The-sharp-singularity-rate-for-biased-symmetric-sign-matrices-October-4-2026/biased-symmetric-sign-singularity.pdf), [TeX source](https://github.com/openai/math/tree/4eaee87548250b2682affda7d05d947c05554bae/preprints/The-sharp-singularity-rate-for-biased-symmetric-sign-matrices-October-4-2026/build).
3. Kevin Costello, Terence Tao and Van Vu, *Random symmetric matrices are almost surely non-singular*, preprint 9 May 2005; *Duke Mathematical Journal* 135, 2006, 395 to 413. Earlier nonsingularity question, the symmetric dependence obstacle, and the sign-model sharp-rate Conjecture 7.4. [Preprint](https://arxiv.org/abs/math/0505156), [full text](https://arxiv.org/html/math/0505156).
4. János Komlós, *On the determinant of (0-1) matrices*, *Studia Scientiarum Mathematicarum Hungarica* 2, 1967, 7 to 21. Asymptotic nonsingularity in the independent-entry model. [Rutgers institutional record and scan](https://scholarship.libraries.rutgers.edu/esploro/outputs/journalArticle/On-the-determinant-of-0-1-matrices/991031550043104646).
5. Konstantin Tikhomirov, *Singularity of random Bernoulli matrices*, preprint 2018; *Annals of Mathematics* 191, 2020, 593 to 634. Sharp exponential rate for independent fair signs. [Preprint](https://arxiv.org/abs/1812.09016), [journal record](https://annals.math.princeton.edu/2020/191-2/p06).
6. Marcelo Campos, Matthew Jenssen, Marcus Michelen and Julian Sahasrabudhe, *The singularity probability of a random symmetric matrix is exponentially small*, preprint 2021; *Journal of the American Mathematical Society* 38, 2025, 179 to 224. The bound $e^{-cn}$ and the preceding symmetric-model obstacle. [Preprint](https://arxiv.org/abs/2105.11384), [journal DOI](https://doi.org/10.1090/jams/1042).
7. Vishesh Jain, Ashwin Sah and Mehtaab Sawhney, *Singularity of discrete random matrices*, preprint 2020, revised 2021. Independent nonuniform finite-support models, including biased signs; prior use of the entropy gap. [Paper](https://arxiv.org/abs/2010.06554).
8. Marcelo Campos, Matthew Jenssen, Marcus Michelen and Julian Sahasrabudhe, *The least singular value of a random symmetric matrix*, preprint 2022; *Forum of Mathematics, Pi* 12, 2024, e3. Near-singularity, the distinction from exact invertibility, and the numerical-linear-algebra history in Section 1.2. [Paper](https://arxiv.org/abs/2203.06141), [journal DOI](https://doi.org/10.1017/fmp.2023.29).
9. Oded Regev and Noah Stephens-Davidowitz, *A reverse Minkowski theorem*, *Annals of Mathematics* 199, 2024, 1 to 49. Short-vector bounds under sublattice determinant hypotheses, used in the fair paper's lattice tools. [Journal record](https://annals.math.princeton.edu/2024/199-1/p01).
10. Columbia University, Student Probability Seminar, fall 2026 schedule. Jiahe Shen's 8 October historical survey announcement discusses the new symmetric sharp-rate claim without reporting a proof check. [Schedule](https://www.math.columbia.edu/~jshen/26fall.html), accessed 7 November 2026.
11. OpenAI mathematics release, commit `4eaee87548250b2682affda7d05d947c05554bae`, 29 October 2026. Family identity, listed formalizations and upstream changes. [Catalogue](https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/CONTENTS.md), [Lean catalogue](https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/formalization.yaml), [change history](https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md).
