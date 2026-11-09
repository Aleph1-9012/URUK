---
family: "029"
topic: "Artin's primitive-root conjecture"
title: "Is 2 a primitive root modulo infinitely many primes?"
paperTitle: "Primitive roots for every admissible integer base"
claim: "For every integer a that is neither −1 nor a perfect square, there are constants c_a > 0 and x_a such that for every x ≥ x_a at least c_a x/(log x)^2 primes p in (x, 2x) have a as a primitive root. This proves the infinitude part of Artin's conjecture for every admissible base; the predicted density is not proved. The analytic input is a zero-free region Re s > 1 − 10^(−6) for every finite-order Hecke L-function of every cyclotomic field containing the twelfth roots of unity."
status: unreviewed
checked: 2026-10-18
papers:
  - preprints/Primitive-roots-for-every-admissible-integer-base-October-4-2026/primitive-roots-all-integer-bases.pdf
  - preprints/Simultaneous-primitive-roots-a-conditional-lower-bound-for-prime-bases-October-4-2026/simultaneous-primitive-roots-conditional-lower-bound-prime-bases.pdf
draft: false
---

Divide the powers of $2$ by $11$ and keep the remainders: $2,4,8,5,10,9,7,3,6,1$. Every nonzero remainder appears before the cycle repeats, and one says that $2$ is a primitive root modulo $11$. Modulo $7$ it is not: $2,4,1$, and the cycle closes early. On 27 September 1927 Emil Artin told Helmut Hasse, who wrote it in his diary, that every integer other than $-1$ and the perfect squares should be a primitive root for infinitely many primes, and he predicted the proportion: for $2$, about $37.4$ percent of all primes. A century later nobody had proved this for a single base. Hooley proved it in 1967 assuming the generalized Riemann hypothesis; Heath-Brown proved in 1986 that it fails for at most two prime bases, so at least one of $2$, $3$ and $5$ works, without being able to say which. On 4 October 2026, two days before its release, OpenAI posted a ninety-two-page paper claiming the infinitude statement for every admissible base, with a weaker count than Artin predicted. [1][3][4][5]

As of 18 October 2026 no mathematician has said publicly that they have read or checked the proof. The status on this page is "unreviewed". The proof imports a theorem from another unreviewed paper in the same release, and adapts the method of a third; both facts are set out below.

## The problem

For a prime $p$ not dividing $a$, the multiplicative order $\operatorname{ord}_p(a)$ is the least $k\ge1$ with $a^{k}\equiv1\pmod p$. It always divides $p-1$, and $a$ is a primitive root modulo $p$ when $\operatorname{ord}_p(a)=p-1$, that is, when the powers of $a$ run through every nonzero residue. Call $a$ admissible if $a\ne-1$ and $a$ is not a perfect square; these conditions are necessary, since $-1$ has order at most $2$ and a square modulo an odd prime has order dividing $(p-1)/2$. [1]

**Artin's conjecture (1927).** Every admissible integer $a$ is a primitive root modulo infinitely many primes. Quantitatively, the number of such primes up to $x$ is asymptotic to $A(a)\,x/\log x$ for an explicit positive constant $A(a)$, which for $a=2$ is Artin's constant $0.3739\ldots$ [1][5]

Why it is hard: a prime $q$ divides the index $(p-1)/\operatorname{ord}_p(a)$ exactly when $p\equiv1\pmod q$ and $a^{(p-1)/q}\equiv1\pmod p$, which says that $p$ splits completely in the Kummer field $\mathbb Q(\mu_q,a^{1/q})$. Hooley's method counts primes that split in none of these fields by inclusion-exclusion over $q$, and needs to control the error terms uniformly in $q$. That control is exactly what the generalized Riemann hypothesis provides and what unconditional zero-free regions do not: the standard regions for Hecke $L$-functions have width shrinking with the field and allow an exceptional zero. [1][3]

<!-- uruk:visual-note
A visual for this page can show the powers of a chosen base modulo a chosen prime as points on a circle, filling it completely when the base is a primitive root and closing early otherwise, then a tally over the first few hundred primes of how often $2$ is a primitive root, hovering around Artin's $37.4$ percent. It can show the conjecture's prediction. It cannot show the theorem, whose count is a lower bound far below that prediction.
-->

## Why it stayed open

### A century of partial answers

Hooley's 1967 theorem gives Artin's full asymptotic under the Riemann hypothesis for the Dedekind zeta functions of the Kummer fields. Unconditionally, Gupta and Murty showed in 1984 that among a specific set of thirteen integers at least one is a primitive root infinitely often, and Heath-Brown sharpened this in 1986: at most two prime bases fail, at most three squarefree bases fail, and so at least one of $2,3,5$ is a primitive root modulo infinitely many primes. These are the famous results that cannot name the base. Averaging over $a$, Goldfeld and Stephens obtained the expected count for almost all bases in the 1960s, and Klurman, Shparlinski and Teräväinen recently did so for almost all $a$ in very short ranges; the exceptional set may depend on $x$, so no fixed base is settled. A curious footnote: if $p=4q+1$ with $q$ prime then $2$ is a primitive root modulo $p$, so Artin's conjecture for $2$ would follow from infinitely many such primes, which is itself open. [1][5]

## What OpenAI claims

**Theorem 1.1** (OpenAI, 4 October 2026). For every admissible integer $a$ there are constants $c_a>0$ and $x_a\ge2$ such that for every real $x\ge x_a$,

$$
\#\{p\text{ prime}:x<p<2x,\ p\nmid a,\ \operatorname{ord}_p(a)=p-1\}\ge c_a\frac{x}{(\log x)^{2}}.
$$

[1]

**Theorem 1.2.** Let $F$ be a cyclotomic number field containing the twelfth roots of unity. For every finite-order Hecke character $\eta$ of $F$, the $L$-function $L_F(s,\eta)$ has no zeros with $\operatorname{Re}s>1-10^{-6}$. The principal character is included, with its pole at $s=1$ permitted. The width is common to all such fields and characters, with no conductor or height cutoff. [1]

**Companion.** For every fixed finite set of distinct primes, at least $cx/(\log x)^{2}$ primes in $(x,2x)$ have every member of the set as a primitive root, assuming four stated analytic and sieve inputs from the main paper. [2]

What these do and do not say. Theorem 1.1 proves the infinitude assertion for each admissible base, including $2$, but its count is a logarithm short of Artin's prediction and the constants are not explicit; the predicted density remains unproved. Theorem 1.2 is a statement about $L$-functions of independent interest, with a width that does not depend on the field; constants and the point from which estimates hold may depend on $F$ and $\eta$. [1]

## How the claimed proof goes

What follows is a map of the paper's argument from its introduction and from its reduction section. It is not a check of the details. The paper is long, 92 pages, and leans on two other papers in the release. [1]

**The idea.** Hooley's 1967 proof of Artin's conjecture under the generalized Riemann hypothesis has two steps: $a$ is a primitive root modulo $p$ unless some prime $q$ divides the index $(p-1)/\mathrm{ord}_p(a)$, which happens exactly when $p$ splits completely in the Kummer field $K_q=\mathbb Q(\mu_q,a^{1/q})$; and GRH gives a uniform count of such $p$ for every $q$, good enough to sum over all $q$. The paper replaces GRH by an unconditional zero-free region of fixed width, Theorem 1.2, and replaces "all primes $p$" by a specially constructed family whose possible index divisors all lie in a range that the zero-free region controls. Then Hooley's argument runs on that family. The price is a count of $x/(\log x)^{2}$ rather than the conjectured $x/\log x$. [1]

**The two inputs (Section 2).** Proposition 2.1, primes with controlled predecessors: for fixed $M$ a multiple of $8$, $c\in\{2,4\}$ and a residue $u$ satisfying local coprimality conditions, there are at least a constant times $x/(\log x)^{2}$ primes $p\in(x,2x)$ with $p\equiv u\pmod M$ and

$$
p-1=crQ,\qquad Q>x^{0.9}\text{ prime},\qquad\text{every prime factor of }r\text{ in }\bigl(e^{(\log x)^{0.1}},e^{(\log x)^{0.3}}\bigr).
$$

Proposition 2.2, uniform bound for complete splitting: for fixed $a$ with $|a|>1$, $\delta_0=10^{-6}$, and primes $q\le\exp((\log x)^{0.3})$ large in terms of $a$, the number of $p\in(x,2x]$ splitting completely in $K_q$ is at most a constant times $x/(q(q-1)\log x)+x^{1-\delta_0}$, with constant and threshold independent of $q$; for $a=2$ every $q\ge5$ is allowed with absolute constants. The residue class $u$ is chosen so that the Legendre symbol $(a/p)=-1$, which excludes $q=2$ as an index divisor. Any remaining index divisor is a prime factor of $rQ$: the factor $Q$ gives a small elementary exceptional set, and the factors of $r$ lie exactly in the range where Proposition 2.2 applies with a saving that beats the sum over $q$. [1]

**The zero-free region (Theorem 1.2 and Sections 3 to 9).** For every cyclotomic field $F$ containing the twelfth roots of unity and every finite-order Hecke character $\eta$ of $F$, $L_F(s,\eta)$ has no zeros in $\operatorname{Re}s>1-10^{-6}$, with no conductor or height cutoff. The width is common to all fields and characters, which is what makes the splitting estimate uniform over a growing family of fields; the constants may depend on $F$ and $\eta$, the numerical saving does not. The method adapts the release's quasi-Riemann-hypothesis manuscript, family 003 on this site, which worked over $\mathbb Q(\sqrt{-3})$ with cubic theta series. Here the mechanisms are built over each fixed $F$ using Patterson's cubic theta coefficients under sextic Kummer twists, in the Kazhdan-Patterson representation with a normalized global Whittaker factorization. Two local calculations govern the comparison. In a reflected interaction between a prime of valuation one in the varying twist and a varying squarefree coefficient prime, the sextic exponents are $1$ and $-4$, whose sum is $3$ modulo $6$, so the interaction is quadratic and Heath-Brown's quadratic large sieve, in Goldmakher and Louvel's number-field form, controls the reflected moment (Section 6). On the Poisson side, a relative-norm formula identifies the cube of the cubic Gauss phase with the negative of a unitary Hecke-character value, so that the first squarefree theta term at the principal frequency is $-\eta(\mathfrak p)(N\mathfrak p)^{-\xi}$ and, with the constant term, supplies the local Euler factor of the reciprocal target $L$-function (Section 7, the Poisson probe and its Euler product). Reflection and Poisson summation thus estimate the same additive average two ways; a conductor large sieve and zero detection control the nonprincipal frequencies; the power saving continues the Mellin transform across $\operatorname{Re}s=1$ and excludes zeros (Section 8). Section 9 derives the uniform splitting estimate from the zero-free region. Using ideal norms keeps the exponents independent of the degree of $F$. [1]

**The prime family (Sections 10 to 12).** Start with weighted integers $d=crQ+1$ of the required shape and sieve out small prime factors of $d$. For a remaining composite $d=mn$ with least prime factor $n$, a marked bilinear estimate replaces the restriction on the cofactor $m$ by an explicit density and a weaker condition on its small prime factors; Buchstab's least-prime-factor identity leaves a positive margin between the initial sifted mass and the mass removed, and a separate upper bound makes the contribution of two prime factors near $\sqrt x$ smaller than that margin. The marked prime estimate is imported from another release paper, "The Poisson-Dirichlet law for the prime factors of $p-1$", Theorem 3.1; the marks are the requirement that $d-1$ have a prime factor in each of several prescribed ranges. Because a congruence condition on $d=mn$ is not invariant under removing the marked primes, the paper expands $mn\equiv u\pmod M$ in Dirichlet characters and separates it into factors $\lambda(m)\lambda(n)$, checking that fixed twists preserve the long character-sum bound. Bombieri-Vinogradov, a Brun-Hooley block sieve and the Ford-Halberstam continuous rough-number density complete the count, with the sieve lemmas adapted from a third release paper and reproved in Section 11; the marked Type II estimate is Theorem 10.1 and the construction itself is Section 12. [1]

**Assembly.** With the family in hand, a prime $p$ in it fails to have $a$ as a primitive root only if it splits completely in some $K_q$ with $q\mid rQ$; summing Proposition 2.2 over the primes $q$ in the window, whose reciprocals $1/(q(q-1))$ sum to something small once $q$ is large, and discarding the $Q$-exceptions, leaves a positive proportion of the family, hence at least $c_ax/(\log x)^{2}$ primes with $\mathrm{ord}_p(a)=p-1$. [1]

Where would an expert look first? At Theorem 1.2's uniformity, a common width for every cyclotomic field containing $\mu_{12}$ and every finite-order character, which goes far beyond what is known; at the two sextic local calculations behind it and the relative-norm identity for the Gauss phase; at the imported Theorem 3.1 from the Poisson-Dirichlet paper and whether its hypotheses are met after the character expansion; and at the Buchstab margin against the $\sqrt x$ contribution. [1]

## Consequences inside mathematics

If the proof holds, the infinitude half of Artin's conjecture is settled unconditionally for every admissible base, ninety-nine years after Artin posed it, and Heath-Brown's "one of $2,3,5$" becomes "all of them". The companion extends this to any finite set of prime bases simultaneously. Theorem 1.2, a uniform zero-free region for Hecke $L$-functions of cyclotomic fields, would be a major result in its own right, of the same character as the quasi-Riemann hypothesis of family 003. Artin's density, and the full asymptotic, remain open. [1][2]

## Uses outside mathematics

No known direct application.

Primitive roots are used in cryptography and pseudorandom number generation, where one needs a generator of the multiplicative group modulo a prime; in practice one finds a primitive root for a given prime by testing, and the existence of infinitely many primes for which $2$ works changes nothing there. [5]

## Has anyone checked it?

We found no named mathematician who says they are reading or checking this paper, and no public comment from Heath-Brown, Murty, Moree or others who have worked on Artin's conjecture. Wikipedia's article on the conjecture already records the claim, noting that it "had not been reviewed by the mathematical community" and had no Lean formalization. VibeMathed records no check by an independent mathematician and notes the dependence on two other release papers. Jared Duker Lichtman is reading family 003, whose method this paper adapts; nothing is known about 029 itself. [5][7]

Two dependencies deserve the reader's attention. The sieve imports a theorem from the release's "Poisson-Dirichlet law for the prime factors of $p-1$", which is itself unreviewed. The zero-free region adapts the construction of the quasi-Riemann-hypothesis paper, which is under review but not approved; the paper says it re-proves the mechanisms it needs over each field. If either of those papers fails, this one is affected. [1]

**Machine checking.** None. Family 029 has no Lean scope note and no comparator statement in the release. The theorem rests entirely on the written papers. [6]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; neither paper in this family is among them. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [8]

## Sources

1. OpenAI, "Primitive roots for every admissible integer base", 4 October 2026. Theorems 1.1 and 1.2, the historical context, the Hecke zero-free argument, the controlled-predecessor construction and its inputs. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Primitive-roots-for-every-admissible-integer-base-October-4-2026/primitive-roots-all-integer-bases.pdf
2. OpenAI, "Simultaneous primitive roots: a conditional lower bound for prime bases", 4 October 2026. Abstract. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Simultaneous-primitive-roots-a-conditional-lower-bound-for-prime-bases-October-4-2026/simultaneous-primitive-roots-conditional-lower-bound-prime-bases.pdf
3. Christopher Hooley, "On Artin's conjecture", Journal für die reine und angewandte Mathematik 225 (1967), 209-220. https://doi.org/10.1515/crll.1967.225.209
4. D. R. Heath-Brown, "Artin's conjecture for primitive roots", Quarterly Journal of Mathematics 37 (1986), 27-38. https://doi.org/10.1093/qmath/37.1.27
5. Wikipedia, "Artin's conjecture on primitive roots", read 18 October 2026. Hasse's diary date, Artin's constant, Heath-Brown's corollaries, the $p=4q+1$ remark and the paragraph recording the OpenAI claim. https://en.wikipedia.org/wiki/Artin%27s_conjecture_on_primitive_roots
6. OpenAI, `lean/docs/` and `lean/formalization.yaml` at the pinned commit, which contain no entry for family 029. https://github.com/openai/math/tree/4eaee87548250b2682affda7d05d947c05554bae/lean/docs
7. VibeMathed, "Artin's primitive root conjecture: infinitude for every admissible base", read 18 October 2026. https://vibemathed.com/problem/artin-primitive-root-infinitude
8. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
