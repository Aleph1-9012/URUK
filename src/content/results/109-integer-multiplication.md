---
family: "109"
topic: "Integer multiplication"
title: "How fast can two numbers be multiplied?"
paperTitle: "Integer multiplication below n log n"
claim: "One fixed multitape Turing machine multiplies two n-bit integers exactly, for every n, in worst-case time O(n (log n)^(1−κ)) with κ = 2^(−182). This disproves the Schönhage-Strassen conjecture that n log n is optimal in that model."
status: unreviewed
checked: 2026-10-18
papers:
  - preprints/Integer-multiplication-below-n-log-n-September-23-2026/paper.pdf
draft: false
visual: digit-square
---

The method taught in school multiplies two $n$-digit numbers in about $n^{2}$ steps: every digit of one number meets every digit of the other. In 1960 Kolmogorov conjectured that nothing fundamentally faster was possible, and within a week his student Karatsuba found a way to do it in about $n^{1.585}$ steps. A decade of improvements followed, and in 1971 Schönhage and Strassen reached $n\log n\log\log n$ using the fast Fourier transform, and proposed that $n\log n$ was the true answer. In 2019 Harvey and van der Hoeven finally achieved $n\log n$, and the field expected that to be the end: the Fourier transform does $n$ work on each of $\log n$ levels, and no one saw how to avoid any of it. On 23 September 2026 OpenAI posted a paper claiming an algorithm that runs in time $n(\log n)^{1-\kappa}$ with $\kappa=2^{-182}$. The saving is unimaginably small, and that is beside the point: if the paper is right, $n\log n$ is not a wall, and a conjecture that stood for fifty-five years is false. [1][3][4][5]

As of 18 October 2026 no mathematician has said publicly that they have read or checked the proof. The status on this page is "unreviewed".

## The problem

To say how long multiplication takes, one has to say what counts as a step. The model used by Schönhage and Strassen, and by every bound since, is the multitape Turing machine: a fixed finite alphabet, a fixed finite number of one-dimensional tapes, and a head on each tape that reads or writes one symbol and moves one cell per step. The input is two $n$-bit binary strings $x\#y$, and the output must be the exact $2n$-bit product. The running time $T(n)$ is the worst case over all inputs of length $n$. The model matters: on machines with random access to memory, multiplication is known to be faster, and those results say nothing about this one. [1]

Write $\lg n=\max\{\lceil\log_2n\rceil,1\}$. The question is the order of growth of the best possible $T(n)$ as $n\to\infty$. The known history, in this model: [1][3]

- Karatsuba and Ofman 1962, $O(n^{\log_23})\approx O(n^{1.585})$, by splitting each number in half and using three half-size multiplications instead of four.
- Toom 1963 and Cook, $n\exp(O(\sqrt{\log n}))$, by polynomial evaluation and interpolation.
- Schönhage and Strassen 1971, $O(n\log n\log\log n)$, by a fast Fourier transform in a ring where roots of unity are powers of two, so that multiplying by them is a shift.
- Fürer 2007, $n\log n\,2^{O(\log^{*}n)}$, where $\log^{*}n$ is the number of times one must take a logarithm to get below a constant.
- Harvey and van der Hoeven 2019, published in the Annals in 2021, $O(n\log n)$.

**The Schönhage-Strassen conjecture.** In the multitape Turing model, $n\log n$ is the optimal order of growth: every fixed multiplication machine has $T(n)\ge c\,n\log n$ for all large $n$. [1][3]

<!-- uruk:visual-note
A visual for this page can show the record exponents over time, from $2$ through $1.585$ to the logarithmic era, and then zoom into the $n\log n$ line to show how close to it the new bound sits: for every $n$ that will ever be written down, $(\log n)^{1-\kappa}$ and $\log n$ are indistinguishable. It cannot show the algorithm, which the paper says has "extremely large" constants and thresholds and is "intended to establish a bit-complexity bound". [1]
-->

## Why it stayed open

### Why $n\log n$ looked like the end

The fast Fourier transform computes a transform of length $n$ by recursing on halves, so it does $\Theta(n)$ arithmetic at each of $\Theta(\log n)$ levels. Every fast multiplication algorithm since 1971 is a way of making that arithmetic cheap; none avoids the $\log n$ levels, and on a Turing machine even reading an array of $n$ bits once per level costs $n\log n$. There is no proof that $n\log n$ is necessary; proving lower bounds for multiplication is far beyond current methods. But in 2025 Harvey and van der Hoeven showed that an $n\log n$ lower bound for a seemingly simpler task, transposing a binary matrix on a Turing machine, would imply one for multiplication, and in that paper they still described $n\log n$ as the expected answer. A MathOverflow answer written after the release summarizes the mood: "$n\log n$ was not merely the best known running time: it was conjectured to be optimal." [1][6][7]

The conjecture was about this model. On a storage-modification machine Schönhage obtained linear time in 1980, and Groff gave a sub-$\log n$ factor in a unit-cost random-access model in 2019 after excluded preprocessing. Neither says anything about fixed-tape machines. [1]

## What OpenAI claims

**Theorem 1.1** (OpenAI, 23 September 2026). There is one deterministic Turing machine $A$, with a fixed finite alphabet and a fixed finite number of one-dimensional tapes, that computes the exact product of every pair of $n$-bit inputs for every $n\ge1$, with worst-case running time

$$
T_A(n)=O\bigl(n(\lg n)^{1-\kappa}\bigr),\qquad\kappa=2^{-182}.
$$

[1]

**Corollary 1.2.** Exact division with remainder and the integer square root can be computed in the same time bound, by the classical Newton iterations at doubling precisions. [1]

What this does and does not say. The bound holds through all input lengths rather than along a subsequence. It refutes the Schönhage-Strassen conjecture in the ordinary multitape bit model: the paper notes that negating an eventual lower bound only requires $\liminf T(n)/(n\lg n)=0$, and the theorem gives a limit of zero. It says nothing about what a computer does: $2^{-182}$ is so small that $(\lg n)^{1-\kappa}$ differs from $\lg n$ by a factor that never leaves $1$ for any physical $n$, and the paper's constants are described as extremely large. A companion paper, family 130 in the release, gives a discrete Fourier transform in $O(n(\log n)^{1-10^{-13}})$ exact complex operations, in a different cost model; the multiplication paper says explicitly that its result is "neither a bit-complexity consequence nor a stable floating-point FFT consequence" of the DFT one. [1]

## How the claimed proof goes

What follows is a map of the argument, from the paper's introduction and from Sections 3, 5 and 9. It is not a check of the details. The paper is long, about 5,400 lines of source in eleven sections and an appendix, and the critical constructions are in Sections 3 to 5. [1]

**The idea.** Keep the Harvey-van der Hoeven pipeline, which turns multiplication into multidimensional Fourier transforms of power-of-two size and then into synthetic polynomial transforms where roots of unity act as signed shifts of a coefficient list. In that pipeline the work at each of the $\Theta(\log n)$ transform levels is address rearrangement plus two-point butterfly operations, and a single scan of the $\Theta(n)$ stored bits already costs $\Theta(n)$ per level, which is the $n\log n$ barrier. Replace both kinds of work with procedures that cost strictly less than one pass per level, by letting intermediate steps form linear combinations of data rather than merely moving it. The saving at each level is a fixed power, and the rest of the paper is the bookkeeping that shows it survives. [1]

**Two tape procedures.** Writing $V$ for the stored bit volume, the first procedure interchanges two disjoint contiguous address fields of $u$ bits, in an array whose addresses form a complete Cartesian product, in time $O(Vu^{\tau})$ for a fixed $\tau<1$. Its final effect is an exact permutation, but its intermediate steps XOR data together; the paper notes that this places it outside the pure data-movement models in which Harvey and van der Hoeven's transposition reduction gives lower bounds. The second applies the butterfly $H_0(u,v)=((u+v)/2,(u-v)/2)$ simultaneously on a selected bit position in each of at most $d$ equal-width address chunks of a numerical array, coefficientwise on records that are polynomials with complex fixed-point coefficients, in time $O(Vd^{\lambda'})$ for a fixed $\lambda'<1$; intermediate values are exact Gaussian dyadics, numbers whose real and imaginary parts have power-of-two denominators, and a single truncation follows each completed contractive layer. [1]

**Frames: how a fixed network acts on arrays.** Each procedure comes from one fixed finite linear network that exchanges two banks of values with prescribed signs and restores every auxiliary wire. To run it on an array, rows are distributed cyclically among the $W$ wire roles, so each role carries a stream of $V/W$ bits with the same local address set, and a scalar gate acts pointwise on matching addresses. The trick is that a role's array may be stored in a changed representation: at each vertex $v$ of the network an invertible linear operator $D_v$, the frame, is chosen so that the stored array is $D_vg$ when the logical array is $g$. Pointwise gates commute with a common frame, so the frames along a route cancel and only the endpoint operator $D_{\mathrm{sink}}D_{\mathrm{source}}^{-1}$ remains, together with the prescribed sign. For the bit procedure that endpoint operator is an address shear $(H,D)\mapsto(H+D,D)$ on two fields, and two more linear-cost shears complete the interchange, by the Bruhat-type factorization the paper attributes to Grigoriev; for the numerical procedure it becomes the simultaneous $H_0$ layer after diagonal phases and a dyadic scale. The frames on intermediate edges are chosen so that every edge change $D_vD_u^{-1}$ can be implemented by smaller calls to the same procedure. [1]

**Where the power comes from.** Section 3 builds the two networks with explicit numbers: $h=100$, $v=\binom h3=161700$ three-element subsets of a $100$-element set, $N=v^{3}$ data wires per bank indexed by triples of triples, and an $m=h^{3}=10^{6}$-dimensional label space $\mathcal F=F^{\otimes3}$. For the bit network $F=\mathbb Q^{h}$ with the form $\langle x,y\rangle=x^{T}(I-J/9)y$, so that indicator vectors of triples satisfy $\langle t_S,t_T\rangle=|S\cap T|-1$ and $\langle t_T,t_T\rangle=2$; for the complex network $F=\mathbb F_2^{h}$ with the dot product. These are the degree-one intersection formulas of the Frankl-Wilson construction in Alon's presentation, specialized to the prime $2$. Nondegenerate subspaces of $\mathcal F$ are attached as labels to every gate and terminal, nested along each edge, with the data roles $X_a$ running from the line $U_a$ to all of $\mathcal F$ and $Y_a$ from $0$ to $U_a^{\perp}$; gather and scatter gates create coefficients depending on intersection sizes, and auxiliary wires cancel the unwanted ones. The dimension change along an edge counts the smaller calls needed there, and the decisive property is that their total $s$ satisfies $s<Wm$. A call at parameter $mf$ then uses $s$ calls at parameter $f$ on streams of volume $V/W$, so per unit volume the cost grows by $s/W<m$ when the parameter grows by $m$. Section 3.6 makes this numerical: the relative rank deficits are $\eta_{\mathrm b}=339/22587335000000$ and $\eta_{\mathrm c}=73/19906842167500$, both exceeding $20\cdot2^{-50}$, which is enough for the fixed rational exponent $\tau=\sigma=1-2^{-50}$ since $m<2^{20}$. That is the whole power saving, and it is tiny. Restoring the scratch wires follows the transparent-computation idea of Buhrman, Cleve, Koucký, Loff and Speelman. [1]

**Butterfly layers and precision.** Section 5 turns the complex network into the Simultaneous Normalized Butterfly Layer proposition: for fixed rational parameters satisfying the layer conditions $\max\{\tau,\sigma\}<\lambda<1$, $\tau(1+c/\beta)<\lambda$ and $\sigma+\beta(1-\sigma)<\lambda'<1$, with $d$ about $p^{\varepsilon}$ chunks and $r$ about $2^{p/d}$, one fixed multitape procedure applies the layer within the stated time with the precision bookkeeping done through "phase frames" and a packed addition on selected address bits; the exact recursive contract and the guard width are stated explicitly. [1]

**From transforms back to the product.** Sections 6 to 9 put the procedures inside the multiplication reduction and account for every change of representation: a Chinese-remainder map onto distinct prime cyclic axes, implemented by triangular controlled shifts; Gaussian resampling with the source and target permutations retained in the transform identity rather than executed as separate full sorts; Bluestein's chirp identity to convert the middle transform to cyclic convolution; a phase twist that turns the last cyclic coordinate into a polynomial modulo $y^{r}+1$, whose negative wrap gives back the original cyclic wrap once the twist is removed; the two forward synthetic transforms sharing one frequency order through their pointwise product; and the polynomial products done by signed packing with the known $O(n\log n)$ multiplier called as an ordinary subroutine, not recursively. The assembly removes normalizations and digit scales, proves the recovered coefficient error is strictly below $1/2$, and propagates carries to the exact binary product. [1]

**The constant.** Section 9 fixes the parameters once: $\tau=\sigma=1-2^{-50}$, $\beta=1/2$, $\delta=1/16$, $\lambda=1-2^{-52}$, $c=2^{-56}$, $\lambda'=1-2^{-54}$, $C_1=20$, $\varepsilon=2^{-75}$ and $\kappa=2^{-182}$, described as "deliberately conservative; no optimization is claimed". The cost table has seven rows, each of the form $n(\log n)^{1-g_i}$ with the slacks $g_1>\frac12$, $g_2=2^{-181}$, $g_3=2^{-129}$, $g_4>2^{-51}$, $g_5>\frac18$, $g_6>\frac12$, $g_7=2^{-75}$; the minimum is $2^{-181}=2\kappa$, and the factor of two covers any remaining fixed power of $\log p$. That is where $\kappa=2^{-182}$ comes from. [1]

**Transposition and division.** Section 11 combines the theorem with Harvey and van der Hoeven's 2025 reduction to transpose a $k\times k$ binary matrix in $O(k^{2}(\lg k)^{1-\kappa})$ on a fixed-tape machine. Section 10 gives division and square root by Brent's Newton reductions. [1]

Where would an expert look first? At Section 3, where the finite network and the inequality $s<Wm$ live, since everything else is bookkeeping around that saving, and specifically at whether the label dimensions really count the smaller calls on every edge including the source contribution; at Section 4, to confirm the address procedure's tape cost with its XOR intermediates; at Section 5, for the precision analysis of the butterfly layers; and at the cost table in Section 9, to confirm that the seven slacks are what the parameters yield. [1]

## Consequences inside mathematics

If the proof holds, the Schönhage-Strassen conjecture is false and the complexity of integer multiplication is open again from above: the true exponent of the logarithm lies somewhere in $[0,1-2^{-182}]$ and nobody knows where. Division, square roots and binary matrix transposition on Turing machines fall below $n\log n$ with it. The lower-bound programme of Harvey and van der Hoeven is affected in a specific way: their reduction from transposition still holds, but the paper's address procedure is not a pure data-movement algorithm, so lower bounds for data movement alone cannot rule it out. The paper's companion gives an exact DFT below $n\log n$ operations in its own model. [1]

## Uses outside mathematics

No known direct application.

Fast multiplication is used everywhere large numbers are, from cryptography to computing digits of $\pi$, and the practical algorithms are Karatsuba, Toom-Cook and Schönhage-Strassen. The new algorithm is not a candidate: its saving over $n\log n$ is a factor that never leaves $1$ for any input a computer could hold, and its constants are, in the paper's words, extremely large. Harvey and van der Hoeven's $n\log n$ algorithm is likewise unimplemented for the same reason. [1][5]

## Has anyone checked it?

Reactions exist; checks do not. A MathOverflow question on which of OpenAI's results went against conventional wisdom has this as its top answer, with the explicit qualifier "assuming correctness", and a comment calling it "absolutely shocking" while noting that the paper "seems not to have been formalized in Lean, so it has not been verified in any way". We found no public statement from Harvey, van der Hoeven, Fürer or Lecerf, the people who built the algorithms this one extends, and no named expert who says they are reading it. VibeMathed records no check by an independent mathematician. [7][8]

**Machine checking.** None. Family 109 has no Lean scope note and no entry in the release's catalogue `formalization.yaml`. The release states that unformalized results may contain issues. For a 5,400-line construction with a cost table, the absence of any machine check is a reason for more caution than usual. [2]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; this paper is not among them. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [9]

## Sources

1. OpenAI, "Integer multiplication below n log n", 23 September 2026. Theorem 1.1, Corollary 1.2, Sections 1.1 to 1.4 of the introduction, the history section, the lower-bound-scope section and the companion-application section. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Integer-multiplication-below-n-log-n-September-23-2026/paper.pdf
2. OpenAI, `lean/formalization.yaml` and `lean/docs/` at the pinned commit, which contain no entry for family 109; and the release README's statement on unformalized results. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/formalization.yaml and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/README.md
3. A. Schönhage and V. Strassen, "Schnelle Multiplikation großer Zahlen", Computing 7 (1971), 281-292. https://doi.org/10.1007/BF02242355
4. A. Karatsuba and Yu. Ofman, "Multiplication of many-digital numbers by automatic computers", Doklady Akademii Nauk SSSR 145 (1962), 293-294. The Kolmogorov anecdote is from Karatsuba's later account, summarized in Wikipedia, "Karatsuba algorithm", read 18 October 2026. https://www.mathnet.ru/eng/dan26729 and https://en.wikipedia.org/wiki/Karatsuba_algorithm
5. David Harvey and Joris van der Hoeven, "Integer multiplication in time O(n log n)", Annals of Mathematics 193 (2021), 563-617. https://doi.org/10.4007/annals.2021.193.2.4
6. David Harvey and Joris van der Hoeven, "Integer multiplication is at least as hard as matrix transposition", Proceedings of the 66th IEEE Symposium on Foundations of Computer Science (2025), 1366-1381; arXiv:2503.22848. https://arxiv.org/abs/2503.22848
7. MathOverflow, "How many of the results released by OpenAI went against the conventional mathematical wisdom?", question 515849, answers and comments read 18 October 2026. https://mathoverflow.net/questions/515849/how-many-of-the-results-released-by-openai-went-against-the-conventional-mathema
8. VibeMathed, "Schönhage-Strassen n log n conjecture", read 18 October 2026. https://vibemathed.com/problem/schonhage-strassen-n-log-n-conjecture
9. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
