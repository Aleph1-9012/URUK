---
family: "017"
topic: "The irrationality exponent of pi"
title: "How well can fractions approximate π?"
paperTitle: "The irrationality exponent of π is 2"
claim: "The irrationality exponent of π is 2: for every ν > 2 there is a threshold Q(ν) such that |π − p/q| ≥ q^(−ν) for all integers p and all q ≥ Q(ν). As a consequence the Flint Hills series, the sum of 1/(n³ sin² n), converges."
status: unreviewed
checked: 2026-10-17
papers:
  - preprints/The-irrationality-exponent-of-pi-is-2-September-24-2026/paper.pdf
draft: false
visual: fraction-rulers
---

Most people learn $\tfrac{22}{7}$ at school, and some learn $\tfrac{355}{113}$, which is right to six decimal places. How good such fractions can get, measured against the size of their denominators, is captured by a single number attached to $\pi$, its irrationality exponent. Almost every real number has exponent $2$, and $\pi$ was expected to, but proving it is another matter. Kurt Mahler gave the first bound, $42$, in 1953, and in the words of Zeilberger and Zudilin it then "became a competitive sport to find lower and lower upper bounds". After seventy years the record stood at about $7.1$. On 24 September 2026 OpenAI posted a 23-page paper claiming the exact value, $2$, by a method unlike the ones that produced the records. A curious consequence settles a question from recreational mathematics: the series $\sum 1/(n^{3}\sin^{2}n)$, whose terms spike whenever a whole number lands close to a multiple of $\pi$, adds up to a finite number. [1][2][3]

As of 17 October 2026 no mathematician has said publicly that they have checked the proof. Three mathematicians have posted a paper adapting its method to other constants. The status on this page is "unreviewed".

## The problem

Any real number can be approximated by fractions. Decimal expansions are fractions with denominators $10,100,1000,\ldots$, and with denominator $q$ you can always get within $1/(2q)$ of any target. The interesting question is how much better than that you can do, infinitely often. [3]

For an irrational number $x$, the irrationality exponent $\mu(x)$ is the largest $\nu$, in the sense of a supremum, such that

$$
0<\Bigl|x-\frac pq\Bigr|<\frac1{q^{\nu}}
$$

has infinitely many solutions in fractions $p/q$. A large exponent means $x$ sits unusually close to fractions with small denominators. [1][3]

Dirichlet's approximation theorem shows that every irrational number has $\mu(x)\ge2$: there are always infinitely many fractions with $|x-p/q|<1/q^{2}$. A probability argument shows that almost every real number has $\mu=2$ exactly. Roth proved in 1955 that every irrational algebraic number, such as $\sqrt2$ or the golden ratio, has $\mu=2$. The number $e$ has $\mu=2$ too, because its continued fraction $[2;1,2,1,1,4,1,1,6,\ldots]$ follows a simple pattern. At the other extreme, Liouville numbers such as $\sum10^{-n!}$ have $\mu=\infty$. For most famous constants nobody knows the value. [3]

The best fractions for $\pi$ come from its continued fraction, $\pi=[3;7,15,1,292,1,1,1,2,\ldots]$, whose truncations give the convergents $3,\ \tfrac{22}{7},\ \tfrac{333}{106},\ \tfrac{355}{113},\ \tfrac{103993}{33102},\ldots$. For each convergent one can compute the exponent it achieves on its own, $\nu=-\log|\pi-p/q|/\log q$. [4]

| Fraction | Error | Exponent achieved |
|---|---|---|
| $22/7$ | $1.26\times10^{-3}$ | $3.43$ |
| $333/106$ | $8.32\times10^{-5}$ | $2.01$ |
| $355/113$ | $2.67\times10^{-7}$ | $3.20$ |
| $103993/33102$ | $5.78\times10^{-10}$ | $2.04$ |
| $5419351/1725033$ | $2.21\times10^{-14}$ | $2.19$ |
| $1783366216531/567663097408$ | $1.23\times10^{-24}$ | $2.03$ |

We computed these from $\pi$ to two hundred digits. $\tfrac{355}{113}$ is exceptional because the next term of the continued fraction, $292$, is large. The connection is exact. If $x=[a_0;a_1,a_2,\ldots]$ has convergents $p_n/q_n$, then

$$
\mu(x)=2+\limsup_{n\to\infty}\frac{\log a_{n+1}}{\log q_n}.
$$

So $\mu(\pi)=2$ says that the terms of the continued fraction of $\pi$ are eventually smaller than any fixed power $q_n^{\varepsilon}$ of the denominator before them. Large terms like $292$ can keep appearing, but they must become small relative to the size of the denominators. The theorem claims that for every $\nu>2$ only finitely many fractions beat $q^{-\nu}$, however far one goes. [3]

<!-- uruk:visual-note
A visual for this page can plot each convergent as a point, denominator against exponent achieved, with a slider for a horizontal line at height $\nu$. The theorem says that for any line above $2$, only finitely many points lie above it. No finite plot can show "only finitely many", and the paper's threshold $Q(\nu)$ is not computable from its proof, so the visual cannot say where the last point above the line is.
-->

## Why it stayed open

### Seventy years of bounds

Lambert proved in 1761 that $\pi$ is irrational, which says nothing about $\mu(\pi)$, since irrationality alone allows any exponent up to infinity. Mahler gave the first finite bound in 1953: $\mu(\pi)\le42$ for every denominator, and $30$ eventually. Mignotte reached $20$ in 1974. Chudnovsky brought Hermite-Padé approximations to exponential functions to bear in 1982. Masayoshi Hata's integral constructions gave $8.016$ in 1993. Vladislav Salikhov reached $7.606$ in 2008, and Doron Zeilberger and Wadim Zudilin, after computer experiments followed by a rigorous human proof, reached $7.103$ in 2020. A September 2026 preprint by Yufei Bai claims $7.1019$. The value $2$ was the conjectured answer, recorded by Michel Waldschmidt in his 2004 survey of open Diophantine problems. [1][2][5]

Each of these bounds came from an explicit construction: polynomial combinations of logarithms, Hermite-Padé approximations or integrals that are small and have controlled denominators. Each improvement came from a better construction, and the numbers moved slowly. OpenAI's argument is of a different kind. It does not improve any of these constructions, and the paper says it uses none of the earlier bounds. [1][2]

The series came from a different direction. In his 2002 book *The Mathematics of Oz* Clifford Pickover defined the Flint Hills series, named after Flint Hills, Kansas, and asked whether

$$
\sum_{n\ge1}\frac1{n^{3}\sin^{2}n}
$$

converges, with $n$ in radians. Max Alekseyev showed in 2011 that convergence would force $\mu(\pi)\le\tfrac52$, far below the bounds then known. In 2022 Alex Meiburg proved the converse direction: $\mu(\pi)<\tfrac52$ is enough. Why $\tfrac52$? If $n=p$ is close to $q\pi$, then $|\sin p|\approx|p-q\pi|=q\,|\pi-p/q|$. A fraction with $|\pi-p/q|\approx q^{-\nu}$ therefore makes the term about $1/\bigl(p^{3}q^{2}q^{-2\nu}\bigr)$, which is roughly $q^{2\nu-5}$ since $p\approx\pi q$. If $\nu>\tfrac52$ happens infinitely often, infinitely many terms are large and the series cannot converge. Below $\tfrac52$ the near misses are too rare and too weak to matter. The difficulty is easy to see numerically. The terms are tiny except where $n$ is close to a multiple of $\pi$, and there $\sin n$ is small. By our computation the partial sum is about $4.81$ after $354$ terms and jumps to $29.41$ at $n=355$, because $355$ is within $3\times10^{-5}$ of $113\pi$. It is $30.3145$ after ten thousand terms and still $30.3145$ after two million. A finite computation cannot rule out a later jump. [1][6][7]

Earlier claims exist. A 2025 convergence claim by Mantzakouras and López Zapata was withdrawn in September 2026. N. A. Carella's preprint claims both exponent $2$ and the stronger statement that $\pi$'s continued-fraction terms stay bounded; OpenAI's paper uses neither and points out a sign error in the proof of the stronger claim. [1]

## What OpenAI claims

**Theorem 1.1** (OpenAI, 24 September 2026). The irrationality exponent of $\pi$ is $2$. More precisely, for every real $\nu>2$ there is an integer $Q(\nu)$ such that

$$
\Bigl|\pi-\frac pq\Bigr|\ge q^{-\nu}\qquad\text{for all }p\in\mathbb Z\text{ and all }q\ge Q(\nu).
$$

[1]

**Corollary 1.2.** The Flint Hills series converges. [1]

Section 5 proves more: for fixed $a,b>0$, the series $\sum_{n\ge1}1/(n^{a}|\sin n|^{b})$ converges if and only if $a>\max\{1,b\}$. [1]

What these do and do not say. The threshold $Q(\nu)$ depends on $\nu$, and the argument "does not give it effectively", so the theorem yields no explicit inequality for any particular denominator. Exponent $2$ is weaker than a bound of the form $c/q^{2}$, which would mean the continued-fraction terms of $\pi$ are bounded; the paper does not claim that. The corollary gives no value for the sum. [1]

## How the claimed proof goes

What follows is a map of the paper, from its outline and section structure. It is not a check of the details. [1]

**The idea of the method.** The proof is by contradiction, and its engine is a single number estimated in two incompatible ways. Assume that some fixed $\nu>2$ admits infinitely many exceptionally good approximations to $\pi$. Choose finitely many of them, $p_1/q_1,\ldots,p_m/q_m$, one after another with rapidly growing denominators. Build a large matrix from them, and take the determinant of a certain square piece of it. On one hand this determinant is a nonzero number built from fractions, so once denominators are cleared it is a nonzero integer and cannot be smaller than $1$ in absolute value. On the other hand, because the fractions are so close to multiples of $\pi$, the determinant must be very small. For large enough parameters the two estimates conflict. This is an interpolation-determinant argument, a technique from transcendence theory. [1]

**Prescribing coefficients.** The rows of the matrix come from polynomials in variables $Y,X_1,\ldots,X_m$ with weights, keeping only monomials below one weighted degree. Near points $(1,c_{j1},\ldots,c_{jm})$ the paper substitutes

$$
Y=1+t,\qquad X_i=c_{ji}+u_i+\log(1+t),
$$

so that $t$ runs along a logarithmic curve and the $u_i$ are transverse displacements. The centers are $c_{ji}=2\pi\mathrm i\,j\,p_i/q_i$, approximations to the periods $2\pi\mathrm i\,j$ of the exponential function. The main geometric theorem, Section 2, says that every packet of Taylor coefficients below the weighted cutoff can be prescribed at all centers simultaneously. It is proved by a multiplicity comparison, a curve inequality bounding total weighted contact by weighted degree, and positivity on a blowup, with antecedents in Philippon's zero estimates and in the separated degrees of Roth's method. [1]

**Two estimates for one determinant.** Interpolation gives a matrix over $\mathbb Q(\mathrm i)$ with independent rows, so some full square minor is nonzero; clearing denominators gives an arithmetic lower bound. For the upper bound, Section 3 translates each row to the exact periods and expands. Rows that test the same entire function and repeat a Taylor degree cancel, and distinct degrees force a saving quadratic in the group size. If many rows have small transverse index, that saving wins; if few do, the many large indices contribute powers of the small approximation errors. Section 4 chooses dimension, weights and approximations in a fixed order so that the margins work for each $\nu>2$, and only then sends the polynomial degree to infinity. [1]

The paper states its inputs: Bézout's theorem with local multiplicities, ordinary blowups, Serre vanishing, smooth models of curves. It assumes no earlier irrationality bound for $\pi$. Where would an expert look first? At the interpolation theorem of Section 2, which must hold at centers whose locations are not known when the weights are chosen; at the collision estimate in Section 3, which supplies the saving that beats exponent $2$; and at the order of choices in Section 4, where an ineffective argument must avoid circularity. [1]

## Consequences inside mathematics

The exact value of $\mu(\pi)$ closes a line of records that began with Mahler, and it decides the whole family of sine-denominator series at once. By Section 5's criterion, $\sum1/(n^{3}\sin^{2}n)$ converges because $3>\max\{1,2\}$, while $\sum1/(n^{2}\sin^{2}n)$ and $\sum1/(n^{3}|\sin n|^{3})$ diverge, because $2$ and $3$ are not larger than $\max\{1,b\}$. Mahler had already linked approximation estimates for $\pi$ to series of this kind in 1953. The theorem does not decide whether the continued-fraction terms of $\pi$ are bounded, and it says nothing about other constants such as $\pi^{2}$ or $\zeta(3)$; the paper makes no such claims. [1]

The method may travel, though. Within days of the release, two independent adaptations claimed $\mu(\log r)=2$ for every positive rational $r\neq1$, including $\log2$, by following the same interpolation argument with the exponential map linking the two settings. Both are described below. Neither is a verified result, and neither changes what the $\pi$ paper itself claims. [12][13]

## Uses outside mathematics

No known direct application.

Computing digits of $\pi$ does not depend on its irrationality exponent, and because the threshold $Q(\nu)$ is ineffective, the theorem gives no explicit error bound that a computation could use. The Flint Hills series is a curiosity from recreational mathematics; knowing that it converges does not give its value. [1]

## Has anyone checked it?

We found no named number theorist who says they are reading or checking this proof. VibeMathed records that no independent mathematician has checked it, and the same for the Flint Hills corollary. [8]

The closest thing to engagement by mathematicians is a follow-up. On 7 October Jingwen Liu, Kai Jiang and Pingwen Zhang posted "Irrationality exponents of logarithms of positive rational numbers" to arXiv, revised on 8 October. It claims $\mu(\log r)=2$ for every positive rational $r\neq1$ and states that "the present proof adapts the separated-weight method of [1, Section 2]", where [1] is OpenAI's $\pi$ paper. Its revised version adds "a discussion of the connection with the argument for pi through the exponential map". Adapting Section 2 of the proof is evidence that the authors read it closely. It is not a statement that the proof is correct, and their own result is unreviewed. We therefore keep the label at "unreviewed" and flag this as a borderline case. [12]

The release includes an abridged summary of the model's reasoning for this result. It says the work went in two parts. The first claimed a bound $\mu(\pi)\le\tfrac{62}{25}$, which is below $\tfrac52$ and so enough for the series. The second claimed exponent $2$ "explicitly without assuming the earlier approximation bound". It also says the model took ideas from the determinants in OpenAI's own Catalan's-constant paper, family 005. This is context, not evidence of correctness. [9]

**Machine checking.** The release's Lean statement is 19 lines and uses only Mathlib's definition of $\pi$. It states both forms of the theorem: for every $\nu>2$ there is a $Q\ge2$ with $q^{-\nu}\le|\pi-p/q|$ for all integers $p$ and $q\ge Q$, and the supremum of the exponents achieved infinitely often equals $2$. Anyone who reads Lean can audit it in a few minutes. The formal proof is about 870 files. VibeMathed notes that the formal library also contains a theorem stating that the Flint Hills series is summable, though it is not one of the checked targets. The statement is not listed in the release's catalogue `formalization.yaml`. We found no outside replay, but we found an outside modification: on 9 October a pseudonymous author, "Dan Brown" on GitHub as jdb19937, published a Lean development claiming $\mu(\log\alpha)=2$ for every positive rational $\alpha\neq1$, described as "a module-by-module modification of OpenAI's formalization of $\mu(\pi)=2$". Modifying a development module by module means rebuilding it, which is some evidence that OpenAI's files compile as released, but the author is anonymous and we have not checked the modified proof. A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval. [8][10][13]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; none of them is this family, and the Lean statement did not change. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [11]

## Sources

1. OpenAI, "The irrationality exponent of π is 2", 24 September 2026. Theorem 1.1, Corollary 1.2, Section 1.1 on earlier bounds and claims, Section 1.2 for the outline, Sections 2 to 5. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/The-irrationality-exponent-of-pi-is-2-September-24-2026/paper.pdf
2. Doron Zeilberger and Wadim Zudilin, "The irrationality measure of π is at most 7.103205334137...", Moscow Journal of Combinatorics and Number Theory 9 (2020), 407-419. The history of bounds from Mahler to Salikhov and the "competitive sport" remark in the introduction. https://arxiv.org/abs/1912.06345
3. Wikipedia, "Irrationality measure", read 17 October 2026. The definition, Dirichlet's lower bound, almost every number, Roth's theorem, the continued fraction of e, Liouville numbers and the continued-fraction formula for the exponent. https://en.wikipedia.org/wiki/Irrationality_measure
4. OEIS A001203, "Simple continued fraction expansion of Pi". https://oeis.org/A001203
5. Michel Waldschmidt, "Open Diophantine problems", Moscow Mathematical Journal 4 (2004), 245-305, p. 265. https://arxiv.org/abs/math/0312440
6. Max A. Alekseyev, "On convergence of the Flint Hills series", arXiv, 2011. Pickover's definition and the name, with his reference to C. A. Pickover, *The Mathematics of Oz*, Cambridge University Press, 2002, chapter 25; and the bound 5/2. https://arxiv.org/abs/1104.5100
7. Alex Meiburg, "Bounds on irrationality measures and the Flint-Hills series", arXiv, 2022. https://arxiv.org/abs/2208.13356
8. VibeMathed, "The irrationality exponent of pi is 2" and "Convergence of the Flint Hills series", read 17 October 2026. https://vibemathed.com/problem/irrationality-exponent-of-pi and https://vibemathed.com/problem/flint-hills-series-convergence
9. OpenAI, "Summarized chain of thought (The irrationality exponent of π is 2)", reasoning summary at the pinned commit. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/reasoning_traces/irrationality-exponent-of-pi.pdf
10. OpenAI, comparator statement `PiExponent.lean` and the scope note for family 017 at the pinned commit. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/PiExponent.lean and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/017.md
11. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
12. Jingwen Liu, Kai Jiang and Pingwen Zhang, "Irrationality exponents of logarithms of positive rational numbers", arXiv 2610.10192, 7 October 2026, v2 of 8 October. The abstract, the comments field and the introduction's statement that the proof adapts OpenAI's Section 2. https://arxiv.org/abs/2610.10192
13. "Dan Brown" (GitHub jdb19937), "The irrationality measure of the logarithm of a rational number is 2", project page with Lean sources, read 17 October 2026. https://jdb19937.github.io/log-irrationality-measure/
