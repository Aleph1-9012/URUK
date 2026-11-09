---
family: "003"
topic: "Quasi-Riemann hypothesis"
title: "How close can the zeros get to the edge?"
paperTitle: "The Quasi-Riemann Hypothesis: A Zero-Free Half-Plane Re(s) > 7/8"
claim: "Every Dirichlet L-function, the Riemann zeta function included, has no zeros with real part greater than 7/8, and the same holds for every finite-order Hecke L-function over Q(√−3). A separate short paper in the family proves the special case that matters most: Landau-Siegel zeros do not exist."
status: approved
checked: 2026-11-02
link: https://arxiv.org/abs/2610.15483
papers:
  - preprints/The-Quasi-Riemann-Hypothesis-September-30-2026/paper.pdf
  - preprints/The-Quasi-Riemann-Hypothesis-October-5-2026/paper2.pdf
draft: false
---

The Riemann hypothesis says that the zeros of one particular function all lie on a single vertical line. Nobody has proved that. On 30 September 2026 OpenAI posted a proof of something weaker and still unprecedented: that no zero lies in the right-hand eighth of the strip where they could be. If the argument holds, it settles what number theorists call the quasi-Riemann hypothesis, rules out the Landau-Siegel zeros that have obstructed the subject for ninety years, and does both for a whole family of related functions at once. [1]

This family contains two claims in two states. The short 1 October proof that Landau-Siegel zeros do not exist has been verified line by line by William Banks, a number theorist who published his own account of it with explicit constants, and has been rewritten more simply by Bryce Kerr and Ben Green; Terence Tao calls the problem solved. The 7/8 half-plane itself is still being worked through: several named experts, mostly reading the shorter 11/12 version, are reported by Quanta to agree it is correct, but none has yet said in public that he has checked the argument and that it holds. The status on this page, "approved", follows the stronger evidence and applies to the Siegel-zero theorem; the section "Has anyone checked it?" says what is and is not covered.

## The problem

### The function and its zeros

Start with the sum

$$
\zeta(s)=\sum_{n\ge1}\frac{1}{n^{s}}=1+\frac{1}{2^{s}}+\frac{1}{3^{s}}+\cdots
$$

For a real number $s>1$ this adds up to something finite. For $s=2$ it is $\pi^{2}/6$. Euler noticed in 1737 that the same sum can be written as a product over the primes,

$$
\zeta(s)=\prod_{p\ \mathrm{prime}}\frac{1}{1-p^{-s}},
$$

which is just the fundamental theorem of arithmetic written as an identity: every $n$ factors uniquely into primes, so expanding the product recovers every $1/n^{s}$ exactly once. This is the first sign that $\zeta$ knows where the primes are. [3]

Riemann's idea in 1859 was to feed the function complex numbers. Write $s=\sigma+it$, with $\sigma$ the real part and $t$ the imaginary part, which on this page we call the height. The sum still converges when $\sigma>1$. Riemann showed how to extend $\zeta$ to the whole complex plane, apart from a single pole (a point where it blows up) at $s=1$, in a way that is forced: there is exactly one such extension that is complex-differentiable. He also found a symmetry, the functional equation, relating the value at $s$ to the value at $1-s$. [3]

A zero is an input where the output is exactly zero. There are easy ones at $s=-2,-4,-6,\dots$, called trivial. Every other zero lies in the critical strip $0<\sigma<1$, and the functional equation plus the symmetry $\zeta(\bar s)=\overline{\zeta(s)}$ means they come in sets of four: if $\sigma+it$ is a zero, so are $\sigma-it$, $1-\sigma+it$ and $1-\sigma-it$. The lowest one above the real axis is at $\tfrac12+14.134725\ldots i$. [5]

The Riemann hypothesis (RH) is the statement that every nontrivial zero has $\sigma=\tfrac12$. By the four-fold symmetry, that is the same as saying no zero has $\sigma>\tfrac12$.

### Why the zeros control the primes

Write $\pi(x)$ for the number of primes up to $x$. The prime number theorem, proved in 1896, says $\pi(x)$ is well approximated by the logarithmic integral $\mathrm{Li}(x)=\int_2^x dt/\log t$. The question is how good the approximation is. Riemann's explicit formula expresses the error as a sum over the zeros, with each zero $\rho=\beta+i\gamma$ contributing a term of size about $x^{\beta}$. So the error is governed by the largest real part any zero can have. [2][3]

Concretely, if every nontrivial zero satisfies $\beta\le\theta$ for some fixed $\theta<1$, then

$$
\pi(x)=\mathrm{Li}(x)+O\!\left(x^{\theta}\log x\right).
$$

Under RH, $\theta=\tfrac12$ and the error is essentially the square root of $x$. Before this release, no fixed $\theta<1$ was known for $\zeta$ at all. The error bounds in use decayed more slowly than any power of $x$ below $x^{1}$. [2][6]

The same story runs for primes in arithmetic progressions. To count primes of the form $4k+1$ against those of the form $4k+3$, Dirichlet in 1837 attached a function $L(s,\chi)=\sum\chi(n)n^{-s}$ to each character $\chi$ modulo $q$, a periodic multiplicative function that separates the residue classes. The zeros of $L(s,\chi)$ control the primes in the classes modulo $q$ in just the way the zeros of $\zeta$ control all primes; $\zeta$ is the case $q=1$. [1]

## Why it stayed open

Hadamard and de la Vallée Poussin proved independently in 1896 that $\zeta$ has no zeros on the line $\sigma=1$. That is exactly what the prime number theorem needs. In 1899 de la Vallée Poussin pushed a little way into the strip: there is a constant $c>0$ such that $\zeta(\sigma+it)\neq0$ whenever

$$
\sigma>1-\frac{c}{\log|t|}\qquad(|t|\ge3).
$$

The region is a sliver next to the line $\sigma=1$ that gets thinner as the height grows. With explicit constants, Mossinghoff and Trudgian's version has width $1/(5.573412\log|t|)$. [4] Vinogradov and Korobov in 1958 widened it to $c/\big((\log|t|)^{2/3}(\log\log|t|)^{1/3}\big)$, and Ford made that constant explicit in 2002. [2] Every one of these regions still shrinks to nothing at the top. None gives a vertical line that all zeros stay to the left of.

For Dirichlet $L$-functions the situation was worse in one specific way. The classical region, due to Gronwall and Titchmarsh, has the same shape with $\log(q(|t|+3))$ in the denominator, but with one permitted exception for each quadratic character: a single real zero very close to $1$. Nobody could rule such a zero out. Siegel proved in 1935 that if it exists it is not too close to $1$, but his constant is ineffective, meaning the proof gives no way to compute it. These hypothetical zeros, called Landau-Siegel zeros, are the reason many theorems about primes in progressions carry an unwanted "unless an exceptional zero exists" clause. [2]

A different line of work counts zeros instead of excluding them. Zero-density estimates bound how many zeros can lie to the right of a given line $\sigma=\sigma_0$ up to height $T$. Larry Guth and James Maynard improved these bounds in 2024, the most recent notable advance on the problem before this one. As the OpenAI paper points out, a density bound limits the number of zeros in a region but does not show that the number is zero. [1][9][10]

The quasi-Riemann hypothesis, as a named target, asks for a single $\sigma_0<1$ such that $\zeta(s)\neq0$ for all $\sigma>\sigma_0$, at every height. The uniform version for Dirichlet $L$-functions asks for one $\sigma_0$ that works for every character and every modulus. Both were open. [1][2]

## What OpenAI claims

Let $F=\mathbb{Q}(\sqrt{-3})$, the field obtained by adjoining $\sqrt{-3}$ to the rationals, whose integers are the Eisenstein integers $\mathbb{Z}[\omega]$ with $\omega=e^{2\pi i/3}$. A finite-order Hecke character $\eta$ over $F$ is a character of a ray class group modulo some ideal $\mathfrak f$, extended by zero to ideals not coprime to $\mathfrak f$, and its $L$-function is $L_F(s,\eta)=\sum_{\mathfrak a}\eta(\mathfrak a)(N\mathfrak a)^{-s}$, summed over nonzero ideals with their norms. These are the number-field analogues of Dirichlet $L$-functions. [1]

**Theorem 1.1** (OpenAI, 30 September 2026). Every finite-order Hecke $L$-function over $\mathbb{Q}(\sqrt{-3})$ has no zero in $\operatorname{Re}s>\tfrac78$. The same holds for every Dirichlet $L$-function, including $\zeta(s)$. A pole at $s=1$ for a principal character is allowed. [1]

Three points of scope matter.

The line $\sigma=\tfrac78$ itself is not covered; the statement is about the open half-plane to its right. By the functional equation, every nontrivial zero of a primitive Dirichlet $L$-function then lies in the closed strip $\tfrac18\le\sigma\le\tfrac78$. [1]

The theorem does not prove the Riemann hypothesis, and the paper says so. RH would put every zero on $\sigma=\tfrac12$. This result leaves a strip of width $\tfrac38$ on either side of that line in which zeros are not excluded. [1]

Landau-Siegel zeros are excluded as a special case: a real zero in $(\tfrac78,1)$ would contradict the theorem. OpenAI also released a separate short paper on 1 October that rules out Siegel zeros by an unrelated method. Maynard called the appearance of two independent proofs of that statement "completely mind-blowing". [1][10]

The release also contains a 5 October companion that proves the weaker boundary $\tfrac{11}{12}$ by a shorter route, with a clearer five-step outline. Its README says it was written with human assistance. For $\tfrac{11}{12}$ it spells out the prime-counting consequence: uniformly for all moduli $q\le x$ and all residues $a$ coprime to $q$,

$$
\Big|\pi(x;q,a)-\frac{1}{\varphi(q)}\mathrm{Li}(x)\Big|\ll x^{11/12}\log x,
$$

with an absolute, effective constant. The same standard argument with the $\tfrac78$ theorem gives $x^{7/8}\log x$. [2]

## How the claimed proof goes

What follows is a map of the argument, taken from the paper's own overview. It is not a check of the proof. The paper is about 16,700 lines of TeX, and no one outside OpenAI has said publicly that they have read the technical sections. [1]

**Work in the bigger family.** The proof does not study $\zeta$ on its own. It studies all finite-order Hecke $L$-functions over $\mathbb{Q}(\sqrt{-3})$ together, and only at the end transfers the conclusion down to Dirichlet $L$-functions. This is not a stylistic choice. The argument keeps turning one member of the family into another, so it has to control all of them at once. The paper states this directly: the whole family is needed even for the consequence about $\zeta$, because the Poisson rows (below) introduce Hecke twists of the target. [1]

**A common continuation principle.** Let $\beta_*$ be the largest real part of any zero in the family. If $\beta_*$ exceeded the proposed boundary, the task would be to show that $1/L(s,\eta)$ continues analytically a fixed distance to the left of $\beta_*$ for every target $\eta$. The paper reduces this to two estimates on a certain normalized character sum: a direct bound on the sum, and a power-saving bound on the difference between the sum and a Mellin integral containing $1/L(s,\eta)$. Only the positive exponent margins must be independent of $\eta$; constants may depend on it. [1]

**Write one sum two ways.** The sum in question is built from the Fourier coefficients of Kubota's cubic theta function, which by Patterson's theorem are cubic Gauss sums, averaged against sextic residue characters and the target character. It has two exact representations. One comes from a reflection formula for the theta function. The other comes from Poisson summation in the averaging variable. Equating them is the engine of the proof. [1]

**Turn $1/L$ into a zero detector.** On the Poisson side, the nonzero frequencies are organized into rows indexed by sixth-power-free elements $u$. Each row's contribution is a quotient of Hecke $L$-functions times a controlled Euler product, and the principal row $u=1$ contains $1/L(s,\eta)$ itself. A zero of $L$ near a row produces a large Dirichlet polynomial with Möbius coefficients, representing a truncated reciprocal. Counting how many rows can carry such a polynomial, using Heath-Brown's cubic large sieve and the sextic specialization the paper proves, bounds the total contribution of all rows other than the principal one. [1]

**Stage one reaches $\tfrac{11}{12}$.** With both averaging scales set to $Z^{1/2}$, a quadratic large sieve on the reflected side and the row count on the Poisson side verify the continuation criterion at $\tfrac{11}{12}$. The 5 October companion contains this stage on its own. [1][2]

**Stage two reaches $\tfrac78$.** The second part modifies the base sum with a local prime compensation that cancels an unwanted Euler factor, uses unequal averaging scales, and needs two more moment estimates: a second moment for the Möbius-weighted polynomial times sums over disjoint prime sets, and a mean square for products of two plain polynomials. Each is proved by its own induction, shortening the range at each step with finite Poisson transformations. [1]

**Come back down to $\zeta$.** Composing a Dirichlet character $\chi$ with the ideal norm gives a Hecke character over $F$, and away from finitely many Euler factors its $L$-function factors as $L(s,\chi)L(s,\chi\chi_{-3})$, where $\chi_{-3}$ is the quadratic character of $F/\mathbb{Q}$. A zero-free half-plane for the Hecke family therefore gives one for every Dirichlet $L$-function, with the pole at $s=1$ handled separately. [1]

The inputs the proof says it relies on are all published: Patterson's coefficient formula and the explicit cusp expansions recorded by Dunn and Radziwiłł, Heath-Brown's cubic large sieve, the character large sieves of Goldmakher and Louvel and of Blomer, Goldmakher and Louvel, and Thorner and Zaman's Chebotarev bounds. The paper cites another OpenAI preprint on cubic Gauss sums and states that it is not used. [1]

Where would an expert look first? The identity that absorbs the Möbius function into Gauss sums, the cubic theta transformation with its roughly six hundred lines of normalizations, the uniformity of the exponent margins at every step, and the longest subsection of the second part, on the canonical reduction and its induction.

## Consequences inside mathematics

Inside number theory the consequences come in a cascade, and the two papers list them. [1][2]

The least quadratic nonresidue modulo an odd prime $p$ is the smallest positive integer that is not a square modulo $p$. Vinogradov conjectured a century ago that it is at most $p^{\varepsilon}$ for every $\varepsilon>0$. The $\tfrac78$ paper derives, as Corollary 1.2, that it is at most $C(\log p)^{A}$ for absolute constants, which is far stronger, by feeding the zero-free half-plane into a theorem of Bhargava, Ivanyos, Mittal and Saxena. [1][8]

From that bound, the paper gets a deterministic algorithm that finds square roots modulo $p$ in time polynomial in $\log p$. The known fast methods, such as Tonelli-Shanks, need a quadratic nonresidue to start from, and finding one deterministically was the missing piece. The $\tfrac{11}{12}$ paper adds that Miller's 1976 primality test becomes deterministic polynomial time, while noting that primality was already known to be in P by the Agrawal-Kayal-Saxena algorithm. [1][2]

The $\tfrac{11}{12}$ paper also draws an effective lower bound on class numbers of imaginary quadratic fields, $h(D)\gg\sqrt{|D|}/\log\log|D|$ with a computable constant, and from that, through work of Elsenhans, Klüners and Nicolae and Grube's characterization, the completeness of Euler's list of 65 idoneal numbers, a question dating to 1778. [2]

## Uses outside mathematics

No known direct application.

The algorithmic consequences above are statements about worst-case guarantees. Half the nonzero residues modulo $p$ are nonresidues, so a random search finds one in about two tries, and every piece of software that needs square roots modulo a prime already does this. A proof that the deterministic search also finishes fast does not change what runs. This page makes no claim about cryptography, and the papers make none either. [1][2]

## Has anyone checked it?

Jared Duker Lichtman, a number theorist at Stanford, posted on 6 October: "While reading their proof, important note: The cubic family of L-functions appear to be essential for the proof, even for the corollary to the Riemann zeta function". That is a named expert working through the argument. He has not said whether it holds. Quanta later quoted him calling the result "the most significant AI-for-math achievement so far, by quite a margin". [7][16]

By 19 October the reading had become organised. Quanta reported that Peter Sarnak of Princeton had repurposed the course he is teaching this term to study the proof, that Maksym Radziwiłł of New York University "can now sketch the proof's arguments in half a page", and that longer write-ups by other mathematicians, of seven to thirteen pages, were circulating privately; "these experts largely agree that the result is correct". Two qualifications matter for this page. First, the experts have mostly set aside the 199-page 7/8 paper for the 49-page 11/12 companion, which Radziwiłł said is the one "people look mostly at" because it is shorter; he called both papers "horribly written" by the standards of the field. Second, Sarnak said he will not be satisfied that it is "a Theorem" until humans check and understand all the details. Alexander Dunn of Georgia Tech, whose 2021 formula with Radziwiłł is an ingredient of the proof, told his university that he believes the 11/12 manuscript is correct and is working with other mathematicians to review it and its sources. Terence Tao wrote on 19 October that the quasi-Riemann arguments "are still in the process of being fully digested". Named experts are reading; none has yet published a verdict on either paper. That is the definition of "under review" on this site. [16][17][18]

The companion statement that Siegel zeros do not exist is in a different position. William Banks, an analytic number theorist writing from the Max Planck Institute in Bonn, posted on 11 October a nineteen-page account of OpenAI's 1 October argument, rearranged as a direct proof with explicit constants ($q_0=10^{10}$, $\delta_0=3.0\times10^{-3}$). He writes that the aim is "to make that argument more accessible and to confirm it", that he prepared the draft with the help of the language model Claude, and that "every line of the paper has been verified by the author, who believes the argument to be sound and takes full responsibility". Bryce Kerr of UNSW Canberra posted a simpler proof on 15 October, replacing the interpolation determinant with the pigeonhole principle and a theorem of Masser, with ChatGPT's assistance acknowledged. Ben Green of Oxford deposited a five-page variant on Hexagon on 17 October, with the provenance note that "the mathematical arguments are all due to ChatGPT, prompted in various ways by the author". Tao's 19 October blog post opens "Recently, the Siegel zero problem has been solved in a number of ways" and sketches Green's version. For the Siegel-zero statement a named expert has checked the proof and said it holds, which meets this site's "approved" rule, and that is what the label on this page records. It does not extend to the 7/8 half-plane, whose proof is a different and much longer argument that none of these papers examines; a reader who wants the status of the 7/8 theorem should take the two paragraphs above as the answer. [19][20][21][18]

James Maynard, a 2022 Fields Medallist whose 2024 work with Guth was the previous landmark, told Science the result is "groundbreaking" and that "within analytic number theory, it's obviously the best headline result for the past 100 years in the field". DongA Science reported him adding that the proofs still need careful scrutiny by the community. Alex Kontorovich of Rutgers said, "I didn't think I would live to see this result, and I'm not that old a guy". These are judgments of importance, not reports of a completed check. [10][11]

Baiying Liu posted a preprint to arXiv on 8 October that re-optimizes three parameters in the $\tfrac78$ argument and moves the boundary to $0.874957\ldots$, "following the same strategy". It builds on the OpenAI proof and inherits its main estimates; it is not a verification of them. [12]

**Machine checking.** OpenAI's release includes a Lean formalization. The statement for $\zeta$ is nine lines long and uses Mathlib's own definition of the zeta function, so anyone who reads Lean can confirm in a minute that it says what the paper says. The Dirichlet statement is similar. The Hecke statement is 245 lines and builds its own definition of the Hecke $L$-function, because Mathlib has none; whether that definition matches the usual one has not been independently confirmed. The formal proof behind these statements runs to about 2,900 files. Dave Goldblatt re-ran the check on 7 October under both Lean's kernel and the independent nanoda checker, and it passed. A kernel check establishes that the formal statement follows from Lean's axioms. It does not establish that the written paper is correct, and no one has yet compared the two. Uruk does not count machine checks as approval. [13][14]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; none of them is this family. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [15]

## Sources

1. OpenAI, "The Quasi-Riemann Hypothesis: A Zero-Free Half-Plane Re(s) > 7/8", 30 September 2026. Theorem 1.1, the introduction, the proof overview and Corollary 1.2. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/The-Quasi-Riemann-Hypothesis-September-30-2026/paper.pdf
2. OpenAI, "The Quasi-Riemann Hypothesis", 5 October 2026. The 11/12 theorem, Corollary 1.2 on primes in progressions, the consequences in Section 1, the prior-work section with the classical and Vinogradov-Korobov regions, and the five-step outline in Section 2. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/The-Quasi-Riemann-Hypothesis-October-5-2026/paper2.pdf
3. Clay Mathematics Institute, "Riemann Hypothesis". Problem statement and history. https://www.claymath.org/millennium/riemann-hypothesis/
4. Michael J. Mossinghoff and Timothy S. Trudgian, "Nonnegative trigonometric polynomials and a zero-free region for the Riemann zeta-function", Theorem 1.1. The explicit constant 5.573412. https://ar5iv.labs.arxiv.org/html/1410.3926
5. Andrew Odlyzko, "Tables of zeros of the Riemann zeta function". The first zero's height. https://www-users.cse.umn.edu/~odlyzko/zeta_tables/
6. John D. Cook, "Consequences of progress toward the Riemann Hypothesis", 7 October 2026. The prime-counting error in terms of the zero-free boundary. https://www.johndcook.com/blog/2026/10/07/consequences-of-qrh/
7. Jared Duker Lichtman, public post, 6 October 2026. https://x.com/jdlichtman/status/2107616346850927090
8. V. Bhargava, G. Ivanyos, R. Mittal and N. Saxena, "Irreducibility and deterministic r-th root finding over finite fields", ISSAC 2017, Theorem 6.7. https://doi.org/10.1145/3087604.3087620
9. Larry Guth and James Maynard, "New large value estimates for Dirichlet polynomials", 2024. The zero-density improvement the paper contrasts itself with. https://arxiv.org/abs/2405.20552
10. Science, "AI edges closer to solving the Riemann hypothesis, one of math's hardest problems", October 2026. Maynard and Kontorovich quotes. https://www.science.org/content/article/ai-edges-closer-solving-riemann-hypothesis-one-math-s-hardest-problems
11. DongA Science, "OpenAI pushes AI-generated proof toward Riemann Hypothesis breakthrough", October 2026. Maynard on the need for scrutiny. https://www.dongascience.com/en/news/80339
12. Baiying Liu, "Improved zero-free half-planes for the quasi-Riemann hypothesis", arXiv:2610.12234, submitted 8 October 2026, revised 12 October. https://arxiv.org/abs/2610.12234
13. OpenAI, Lean scope note for family 003 and the comparator statements `QuasiRiemannHypothesis.lean`, `DirichletSevenEighths.lean` and `HeckeSevenEighths.lean` at the pinned commit. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/003.md
14. Dave Goldblatt, "openai-zeta-proof-check", 7 October 2026. Independent replay under two kernels. https://github.com/davegoldblatt/openai-zeta-proof-check
15. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. Withdrawals and revisions. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
16. Konstantin Kakaes, "AI Proved the Quasi-Riemann Hypothesis. What Happens Now?", Quanta Magazine, 19 October 2026. Lichtman, Radziwiłł, Dunn and Sarnak quotes; the private write-ups; the focus on the 11/12 paper. https://www.quantamagazine.org/ai-proved-the-quasi-riemann-hypothesis-what-happens-now-20261019/
17. Georgia Institute of Technology, School of Mathematics, "Dunn's Research Contributes to OpenAI's Proof of the Quasi-Riemann Hypothesis", October 2026. Dunn on the 11/12 manuscript and the ongoing review. https://math.gatech.edu/news/dunns-research-contributes-openais-proof-quasi-riemann-hypothesis
18. Terence Tao, "A sketch of the proof of non-existence of Siegel zeroes", What's new, 19 October 2026. The quasi-Riemann papers "still in the process of being fully digested"; the Siegel-zero problem "solved in a number of ways"; Green's formulation. https://terrytao.wordpress.com/2026/10/19/a-sketch-of-the-proof-of-non-existence-of-siegel-zeroes/
19. William D. Banks, "On the OpenAI proof that Landau-Siegel zeros do not exist", arXiv:2610.15483, 11 October 2026. Introduction and acknowledgments for the verification statement and the use of Claude; Theorem 1 for the constants. https://arxiv.org/abs/2610.15483
20. Bryce Kerr, "A simpler proof that there are no Landau-Siegel zeros", arXiv:2610.21099, 15 October 2026. https://arxiv.org/abs/2610.21099
21. Ben Green, "On Landau-Siegel zeros", Hexagon preprint 2610.00311, version 2, 17 to 18 October 2026, with its provenance statement. https://hexagonmath.org/2610.00311v2
