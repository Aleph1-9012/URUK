---
family: "179"
topic: "Circulant Hadamard matrices and Barker codes"
title: "Why do radar codes stop at thirteen?"
paperTitle: "The circulant Hadamard conjecture"
claim: "A real circulant Hadamard matrix of order n exists if and only if n is 1 or 4. Consequently a Barker sequence of length n greater than 1 exists if and only if n is one of 2, 3, 4, 5, 7, 11 or 13."
status: unreviewed
checked: 2026-10-18
papers:
  - preprints/The-circulant-Hadamard-conjecture-September-23-2026/paper.pdf
draft: false
visual: barker-echoes
---

Write down a row of plus and minus signs. Slide a copy of it along itself by one step, two steps, three, and at each shift count the agreements minus the disagreements. A sequence is as unlike its own shifts as a sign sequence can be if every one of those counts is $0$, $1$ or $-1$. Such sequences are called Barker sequences, after R. H. Barker's 1953 paper on synchronizing digital signals, and engineers have used them for seventy years: an eleven-term Barker sequence carries the slowest modes of the IEEE 802.11b Wi-Fi standard, and the thirteen-term one is a textbook radar pulse. The catch is that nobody has ever found one longer than thirteen. Turyn and Storer proved in 1961 that no odd length beyond thirteen works. The even case turned into a separate famous problem, the circulant Hadamard conjecture attributed to Ryser in 1963, which says that a square array of signs whose rows are all cyclic shifts of one another and all mutually perpendicular can only have size one or four. On 23 September 2026 OpenAI posted a fifteen-page paper claiming to prove it, and with it the complete list of Barker lengths. [1][3][4][10]

As of 18 October 2026 no mathematician has said publicly that they have read or checked the proof. The status on this page is "unreviewed".

## The problem

A Hadamard matrix of order $n$ is an $n\times n$ matrix $H$ with entries $\pm1$ whose rows are pairwise orthogonal, so that $HH^{\mathsf T}=nI_n$. It is circulant if every row is the previous row shifted one place to the right: there are signs $h_0,\ldots,h_{n-1}$ with $H_{ij}=h_{j-i\bmod n}$. For such a matrix, define the periodic autocorrelation of the first row,

$$
P_h(t)=\sum_{j=0}^{n-1}h_j\,h_{j+t\bmod n}\qquad(0\le t<n).
$$

This is the agreements-minus-disagreements count between the row and its cyclic shift by $t$. Orthogonality of the rows says exactly that $P_h(t)=0$ for every $1\le t<n$. [1]

Two examples exist. The $1\times1$ matrix $(1)$ is one. The row $(-1,1,1,1)$ gives a $4\times4$ circulant Hadamard matrix: shifting it by one, two or three places always produces two agreements and two disagreements. Nobody has ever found another. [1][2]

**The circulant Hadamard conjecture.** A real circulant Hadamard matrix of order $n$ exists only for $n=1$ and $n=4$. [1]

A Barker sequence is the aperiodic cousin. For a sign sequence $a_0,\ldots,a_{n-1}$, the aperiodic autocorrelation at shift $t$ compares the sequence with its shift without wrapping around:

$$
C_a(t)=\sum_{j=0}^{n-t-1}a_j\,a_{j+t}\qquad(1\le t<n).
$$

The sequence is a Barker sequence if $|C_a(t)|\le1$ for every such $t$. The thirteen-term example is $+++++--++-+-+$: every nontrivial shift gives $0$ or $1$. The two notions are linked by $P_a(t)=C_a(t)+C_a(n-t)$, so for an even-length Barker sequence of length greater than two the periodic autocorrelations all vanish, and the sequence is the first row of a circulant Hadamard matrix. That is why Barker lengths beyond thirteen come down to Ryser's conjecture. [1][10]

**The Barker-sequence conjecture.** No Barker sequence has length greater than $13$. [1]

<!-- uruk:visual-note
A visual for this page can let the reader type a sign sequence, slide a copy along it, and watch the autocorrelation at every shift; then show the seven known Barker lengths and the $4\times4$ circulant Hadamard matrix. It demonstrates what the objects are. It cannot show nonexistence.
-->

## Why it stayed open

### Sixty years of narrowing

The problem turns into arithmetic as soon as one counts. If $D$ is the set of positions carrying a $-1$, with $k=|D|$, then $P_h(t)=n-4k+4N_D(t)$, where $N_D(t)$ counts pairs in $D$ at cyclic distance $t$. Summing all the autocorrelations shows that the row sum squares to $n$, so $n$ must be a perfect square, in fact $n=4u^{2}$, and $D$ must be a cyclic difference set with parameters $(4u^{2},\,2u^{2}-u,\,u^{2}-u)$, a set in which every nonzero difference occurs exactly $u^{2}-u$ times. The conjecture is therefore a statement about these difference sets. [1]

Richard Turyn's 1965 work on character sums showed that $u$ must be odd and not a prime power, which already rules out most orders. Bernhard Schmidt's field descent of 1999, and the group-ring refinements of Leung and Schmidt in 2005, 2012 and 2016, imposed stronger arithmetic conditions on the possible $u$. Logan and Mossinghoff's 2017 computation, which searched for double Wieferich prime pairs, excluded every $n$ up to $4\cdot10^{30}$ except $4{,}489$ survivors. Steinerberger showed in 2024 that if one asks only for approximate orthogonality, with all singular values between fixed multiples of $\sqrt n$, sign circulants exist in every order; the conjecture needs exact equality. [1][5][6][7][8]

Complete proofs have been claimed before. The OpenAI paper lists five, from 2016 to 2025, in journals and on arXiv, without endorsing any of them, and the problem remained open in the view of the field. That history is worth remembering when reading a sixth claim. [1]

On the Barker side, Turyn and Storer settled odd lengths in 1961, and Schmidt and Willms gave a proof yielding the exact odd list in 2016. The even case waited on the circulant question. [1][4][9]

## What OpenAI claims

**Theorem 1.1** (OpenAI, 23 September 2026). For a positive integer $n$, a real circulant Hadamard matrix of order $n$ exists if and only if $n\in\{1,4\}$. [1]

**Corollary 1.2.** For an integer $n>1$, a Barker sequence of length $n$ exists if and only if

$$
n\in\{2,3,4,5,7,11,13\}.
$$

[1]

What this does and does not say. The theorem concerns real sign matrices; complex Hadamard matrices and other alphabets are a different subject. The corollary combines the new theorem, which handles even lengths, with the classical odd-length results of Turyn and Storer and of Schmidt and Willms, which the paper uses as inputs and does not reprove. Equivalently, there is no cyclic difference set with parameters $(4u^{2},2u^{2}-u,u^{2}-u)$ for $u>1$. Nothing is said about non-cyclic Hadamard difference sets, which exist in abundance. [1]

## How the claimed proof goes

What follows is a map of the paper's argument, from its introduction and from Sections 2 to 5 of the paper. It is not a check of the details. [1]

**The idea.** Encode the first row of the matrix as an element $h$ of the group ring $\mathbb Z[C_n]$, a formal sum of $\pm1$ times group elements, so that orthogonality of all rows becomes the single identity $hh^{*}=n$, where $*$ inverts group elements. Evaluating $h$ at the characters of $C_n$ turns it into algebraic integers of absolute value $\sqrt n$. The proof shows that a certain alternating product of such values is a root of unity of odd order, then looks at the same quantities modulo a prime above $2$, where the fact that every coefficient is a sign forces the product to be exactly $1$, and finally derives a contradiction from a coefficient identity with one term too many. [1]

**Step 1: the order is $4u^{2}$ with $u$ odd.** Section 2 recovers Turyn's classical restriction in group-ring form. Writing $n=4^{a}m$, the cyclotomic basis of $\mathbb Z[\zeta]$ turns divisibility of a character value $h(\zeta)$ by a power of $2$ into divisibility of the coefficients of the polynomial representative of $h$ after division by the cyclotomic polynomial; a projection from $C_{2^{k}}$ onto $C_{2^{k-1}}$, which sends the cyclotomic polynomial to $2$, is applied repeatedly, and the sign coefficients prevent a power of two larger than $4$ from surviving. The order is therefore $4u^{2}$ with $u$ odd, and the theorem is the statement that $u=1$. [1]

**Step 2: comparing two character values at a prime dividing $u$.** This is the lemma the paper calls new relative to Turyn, who needed coprimality hypotheses. Let $A$ be a local ring whose residue characteristic is $p$, let $F,K\in A[C_{p^{e}}]$ with $FK=p^{e}b$ for a unit $b$, and let $\rho$ be a primitive $p$-th root of unity. The Character Comparison lemma (Section 3.1) says that $F(\rho)/F(1)$ and $K(\rho)/K(1)$ are units of $A[\rho]$ with residue $1$. For $e=1$ this is almost immediate: the valuations of $F(1)$ and $K(1)$ add to $1$, so one of them is a unit, and evaluation at $\rho$ agrees with evaluation at $1$ modulo $\rho-1$, which lies in the maximal ideal; the two ratios multiply to $1$, so the other follows. For $e\ge2$ the paper projects $C_{p^{e}}\to C_{p^{e-1}}$: evaluating at a primitive $p^{e}$-th root shows one factor's remainder after division by $\Phi_{p^{e}}$ has all coefficients divisible by $p$, and since the projection sends $\Phi_{p^{e}}$ to $p$, the projected factor is divisible by $p$; dividing it by $p$ gives a new pair with product $p^{e-1}b$ and the same two ratios, and induction finishes. A remark explains why the scalar's $p$-valuation cannot be allowed to exceed the group exponent: the example $F=p-2J$ in $\mathbb Z[C_p]$, with $J$ the sum of all group elements, has $FF^{*}=p^{2}$ but $F(\rho)/F(1)=-1$. [1]

**Step 3: an alternating product that is a root of unity of odd order.** Write $C_{4u^{2}}=C_4\times P$ with $P$ cyclic of order $u^{2}$, let $I$ be the set of primes dividing $u$, and for each $p\in I$ fix a character of order $p$ on the $p$-part of $P$. For $S\subseteq I$ and $x\in\mathbb Z[i][P]$ with $xx^{*}=u^{2}$, let $x_S$ be the value of $x$ at the chosen characters for $p\in S$ and the trivial character elsewhere; the norm identity gives $|x_S|=u$ under every complex embedding. Set

$$
\Delta(x)=\prod_{S\subseteq I}x_S^{\varepsilon_S},\qquad\varepsilon_S=(-1)^{|S|}.
$$

Pairing $S$ with $S\cup\{p\}$ and applying Step 2 at each maximal ideal above $p$, every factor ratio is a local unit of residue $1$, so $\Delta(x)$ is a unit at every prime of $I$ and, by the norm, at every other prime; its conjugates all have absolute value $1$. The paper proves Kronecker's criterion from scratch (Lemma 3.3(i)): in the ring $B$ generated by finitely many roots of unity, multiplication by $z$ is an integer matrix whose powers have bounded characteristic polynomials, so its eigenvalues of modulus one have finite order. Hence $\Delta(x)$ is a root of unity. Lemma 3.3(ii), that a root of unity of residue $1$ in a local domain of residue characteristic $p$ has $p$-power order, applied at each $p\in I$, makes the order of $\Delta(x)$ a power of $p$ for every $p\in I$; so it is odd, and if $u$ has two distinct prime factors it is exactly $1$ (Proposition 3.4). [1]

**Step 4: three evaluations of one sign array.** Let $Z$ generate $C_4$ and write $h=H_0+ZH_1+Z^{2}H_2+Z^{3}H_3$ with $H_j\in\mathbb Z[P]$; every coefficient of every $H_j$ is a sign. The normalized partial evaluations

$$
c=\tfrac12h|_{Z=1}=\tfrac12(H_0+H_1+H_2+H_3),\quad d=\tfrac12h|_{Z=-1},\quad g=\tfrac12h|_{Z=i}=\tfrac12(H_0-H_2)+\tfrac i2(H_1-H_3)
$$

are integral, because sums of four odd integers are even, and each satisfies $xx^{*}=u^{2}$. By Step 3, $R=\Delta(d)/\Delta(c)$ and $W=\Delta(g)/\Delta(c)$ are roots of unity of odd order. The paper notes that Turyn's Lemma 8 studied these four coset counts under an extra hypothesis on ideals that is not available here. [1]

**Step 5: working above $2$.** Choose a maximal ideal of $B$ containing $2$ and localize, with residue field $k$ of characteristic two, where $i\equiv1$ and $2$, $1+i$ lie in the maximal ideal. Every $c_S,d_S,g_S$ is a unit there, since its product with its conjugate is the odd integer $u^{2}$. Two exact differences come from the sign array: with $b=\tfrac12(H_1+H_3)$,

$$
d-c=-2b,\qquad g-c=(i-1)b-(H_2+iH_3),
$$

and since each coefficient of $H_2+iH_3$ is $\alpha+i\beta$ with $\alpha,\beta=\pm1$, hence congruent to $1+i$ modulo $2\mathbb Z[i]$, one has $H_2+iH_3=(1+i)J+2U$ with $J=\sum_{z\in P}z$. Dividing by the unit $c_S$ gives the first-order terms $L_{r,S}=(r_S-1)/2=-b_S/c_S$ and $L_{w,S}=(w_S-1)/(1+i)=ib_S/c_S-J_S/c_S-(1-i)U_S/c_S$, where $r_S=d_S/c_S$ and $w_S=g_S/c_S$. So every $r_S$ and $w_S$ has residue $1$, hence so do $R$ and $W$; having odd order in residue characteristic two, Lemma 3.3(ii) forces $R=W=1$ exactly. The paper notes a related step in Leung and Schmidt's work, which also forces an odd-order root of unity to be $1$ by reducing modulo two. [1]

**Step 6: one term too many.** Lemma 4.1 says that for a nonzero $t$ in the maximal ideal, $1+tL\mapsto L\bmod\mathfrak n$ is a group homomorphism from $1+tO$ to the additive group of $k$. Applying it with $t=2$ to $R=\prod r_S^{\varepsilon_S}=1$ and with $t=1+i$ to $W=1$ gives $\sum_S\varepsilon_SL_{r,S}\equiv0$ and $\sum_S\varepsilon_SL_{w,S}\equiv0$ in $k$. Adding the two exact formulas, the $b_S$ terms cancel modulo $\mathfrak n$ and what remains is $\sum_S\varepsilon_SJ_S/c_S\equiv0$. But for nonempty $S$ the character is nontrivial, so $J_S=0$; and for $S=\varnothing$, $J_\varnothing=|P|=u^{2}$, an odd unit. The sum has exactly one nonzero term, the unit $u^{2}/c_\varnothing$, whose residue cannot be zero. This contradiction excludes every order above four. A remark checks the argument against the genuine order-four example $(1,1,1,-1)$: there $I$ is empty, $c=d=1$, $g=i$, so $W=i$, which has residue $1$ but even order, and the deduction $W=1$ is unavailable, as it must be. [1]

**Step 7: Barker lengths.** Section 5 is short. For an even-length Barker sequence of length $n>2$, the periodic autocorrelations $P_a(t)=C_a(t)+C_a(n-t)$ vanish, so the sequence is a circulant Hadamard row and $n=4$. Odd lengths are the classical list $1,3,5,7,11,13$, and examples at every listed length are recorded. [1]

Where would an expert look first? At the Character Comparison lemma, which must hold without Turyn's coprimality assumptions, in particular the induction step for $e\ge2$; at the claim that $R$ and $W$ have odd order, which rests on Proposition 3.4 applied to each of $c,d,g$; and at the exact differences and the decomposition $H_2+iH_3=(1+i)J+2U$ in Step 5, where the sign hypothesis is used. The paper is fifteen pages, so a specialist in difference sets could read all of it. [1]

## Consequences inside mathematics

If the proof holds, two conjectures that have been open since the 1960s are settled: Ryser's on circulant Hadamard matrices and the Barker-sequence conjecture. Cyclic Hadamard difference sets with parameters $(4u^{2},2u^{2}-u,u^{2}-u)$ do not exist beyond $u=1$. The sixty years of partial exclusions, from Turyn's to Logan and Mossinghoff's, become corollaries. The paper claims nothing about complex Barker sequences, polyphase codes or Hadamard matrices in general. [1]

## Uses outside mathematics

Barker sequences are used in engineering, and this is the first result on Uruk where the mathematics meets a real device. The thirteen-term Barker code is a standard radar pulse: transmitting the code and correlating the echo against it compresses the pulse and sharpens range resolution, because the autocorrelation has a tall central peak and sidelobes of height one. The eleven-term code is the spreading sequence of the 1 and 2 megabit per second direct-sequence modes of the IEEE 802.11b wireless standard. Engineers have long designed around the absence of longer Barker codes, using compound codes and polyphase alternatives. The theorem does not change any of that. It explains, finally, that the search was hopeless: there is nothing longer to find. [10]

## Has anyone checked it?

We found no named mathematician who says they are reading or checking this proof, and no public comment from the specialists whose work it builds on. VibeMathed records no check by an independent mathematician for either the circulant Hadamard or the Barker entry. An expository article on the family states that it "is not an independent verification of the complete proofs". [11][12]

Two cautions belong here. First, this conjecture has attracted at least five published or posted claims of complete proofs since 2016, none of which the field accepted, so a short new proof deserves the same scrutiny those received. Second, the paper itself is cautious about them: it lists the claims and uses none. [1]

**Machine checking.** The release's Lean statement `CirculantHadamard.lean` is thirty lines. It defines a circulant Hadamard matrix of positive order and states that one exists exactly when the order is $1$ or $4$, with the two examples supplied. It is listed in the release's catalogue `formalization.yaml`, and the formal proof behind it runs to 68 files. A second statement, `EvenBarker.lean`, twenty-eight lines and not in the catalogue, states the even-length half of the Barker corollary: a sign sequence of even length greater than one whose nonzero aperiodic autocorrelations have absolute value at most one has length $2$ or $4$. The odd-length classification is outside the formal scope. We found no outside replay. A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval. [2]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; none of them is this family, and the Lean statements did not change. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [13]

## Sources

1. OpenAI, "The circulant Hadamard conjecture", 23 September 2026. Theorem 1.1, Corollary 1.2, the context and proof-strategy sections, Section 5. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/The-circulant-Hadamard-conjecture-September-23-2026/paper.pdf
2. OpenAI, Lean scope note for family 179 and the comparator statements `CirculantHadamard.lean` and `EvenBarker.lean` at the pinned commit. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/179.md , https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/CirculantHadamard.lean and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/EvenBarker.lean
3. Herbert J. Ryser, Combinatorial Mathematics, Carus Mathematical Monographs 14, Mathematical Association of America, 1963. https://doi.org/10.5948/UPO9781614440147
4. R. Turyn and J. Storer, "On binary sequences", Proceedings of the American Mathematical Society 12 (1961), 394-399. https://doi.org/10.1090/S0002-9939-1961-0125026-2
5. Richard J. Turyn, "Character sums and difference sets", Pacific Journal of Mathematics 15 (1965), 319-346. https://doi.org/10.2140/pjm.1965.15.319
6. Bernhard Schmidt, "Cyclotomic integers and finite geometry", Journal of the American Mathematical Society 12 (1999), 929-952. https://doi.org/10.1090/S0894-0347-99-00298-2
7. Ka Hin Leung and Bernhard Schmidt, "New restrictions on possible orders of circulant Hadamard matrices", Designs, Codes and Cryptography 64 (2012), 143-151. https://doi.org/10.1007/s10623-011-9493-1
8. Brooke Logan and Michael J. Mossinghoff, "Double Wieferich pairs and circulant Hadamard matrices", Journal of Combinatorial Mathematics and Combinatorial Computing 101 (2017), 145-156. https://combinatorialpress.com/jcmcc-articles/volume-101/double-wieferich-pairs-and-circulant-hadamard-matrices/
9. Kai-Uwe Schmidt and Jürgen Willms, "Barker sequences of odd length", Designs, Codes and Cryptography 80 (2016), 409-414. https://doi.org/10.1007/s10623-015-0104-4
10. Wikipedia, "Barker code", read 18 October 2026. The known sequences, the radar pulse-compression use and the eleven-chip spreading sequence in IEEE 802.11b. https://en.wikipedia.org/wiki/Barker_code
11. VibeMathed, "Circulant Hadamard conjecture" and "Barker sequence conjecture", read 18 October 2026. https://vibemathed.com/problem/circulant-hadamard-conjecture and https://vibemathed.com/problem/barker-sequence-conjecture
12. Latent seminar, "Circulant Hadamard matrices and Barker sequences", explanatory article on family 179, read 18 October 2026. https://lowrank.github.io/latent-seminar/OpenAI-Math/179-circulant-hadamard
13. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
