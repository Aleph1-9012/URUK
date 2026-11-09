---
family: "248"
topic: "Thompson's group F"
title: "Can Thompson's group be averaged?"
paperTitle: "Thompson's group F is nonamenable"
claim: "Thompson's group F, the group of increasing piecewise linear homeomorphisms of [0,1] with dyadic breakpoints and slopes that are powers of two, is not amenable."
status: approved
checked: 2026-10-18
link: https://arxiv.org/abs/2610.18360
papers:
  - preprints/Thompsons-group-F-is-nonamenable-September-23-2026/paper.pdf
draft: false
---

In 1965 Richard Thompson wrote down a group of simple-looking maps: stretch and squeeze the unit interval piecewise, bending only at points like $1/2$, $3/8$ or $5/16$, with every slope a power of two. The group is called $F$, and it has been a test case for every idea in geometric group theory since. One question about it became famous. A group is amenable if it admits a fair way to average, an invariant mean, and John von Neumann's 1929 notion splits groups into the tame and the paradoxical: the free group on two letters is paradoxical, which is why the Banach-Tarski sphere can be cut and reassembled into two. Ross Geoghegan conjectured in 1979 that $F$ is not amenable. For fifty years nobody could decide, and the problem acquired a reputation: false proofs of amenability and of non-amenability have appeared, by one expert's count, about once a year, including a 2012 claim by Justin Moore that he withdrew after a competitor found the error. On 23 September 2026 OpenAI posted a short paper claiming that $F$ is not amenable. [1][3][4][5]

Three weeks later two experts in exactly this area, Sang-hyun Kim and Yash Lodha, posted a human-written proof of the theorem on arXiv, built on OpenAI's idea and simplified, with no AI involved. On that basis the status on this page is "approved", the first on Uruk, with the reasoning set out below. [2]

## The problem

Thompson's group $F$ consists of the homeomorphisms $g$ of $[0,1]$ that are increasing, piecewise linear with finitely many pieces, whose breakpoints are dyadic rationals, numbers of the form $k/2^{n}$, and whose slopes are powers of two. Composition is the group operation. Two generators suffice: $x_0$, which maps $[0,1/2]$ to $[0,1/4]$ and compensates on the rest, and $x_1$, which does the same inside $[1/2,1]$. The group is torsion-free, finitely presented, and contains no free subgroup on two letters, a 1985 theorem of Brin and Squier. [1][3]

A discrete group $G$ is amenable if there is a positive, normalized, left-invariant mean on its bounded functions: a linear functional $M:\ell^{\infty}(G)\to\mathbb R$ with $M(1)=1$, $M(\varphi)\ge0$ when $\varphi\ge0$, and $M(\varphi(h\,\cdot))=M(\varphi)$ for every $h\in G$. Finite groups are amenable (average over the group), abelian groups are amenable, and so is anything built from them by subgroups, quotients, extensions and unions; von Neumann observed that a free group on two generators is not. Følner's criterion gives the working test: $G$ is amenable exactly when for every finite set $S\subset G$ and $\varepsilon>0$ there is a finite nonempty $A\subset G$ with

$$
\frac{|hA\,\triangle\,A|}{|A|}<\varepsilon\qquad(h\in S),
$$

a set that barely moves when translated by the elements of $S$. [1]

**Geoghegan's conjecture (1979).** $F$ is not amenable. [1][3]

Why it is hard: the two standard routes fail. $F$ has no free subgroup, so von Neumann's obstruction does not apply; and $F$ is not elementary amenable, by Cannon, Floyd and Parry, so it cannot be shown amenable by assembling it from finite and abelian pieces. Moore proved in 2013 that any Følner sets for $F$ must be enormous, their size growing like a tower of exponentials, and gave a Ramsey-theoretic reformulation of the question; neither decided it. [1][7][8]

## Why it stayed open

### Fifty years of claims

The problem's history is a history of near misses. Shavgulidze announced in 2009 that $F$ is amenable; Moore identified errors in that approach. Moore himself announced a proof of amenability in 2012, twelve pages long, checked line by line, which many people believed for several weeks until Akhmedov, who had a competing claim of non-amenability, found an error in its Lemma 4.13, and Moore withdrew it. Akhmedov's own 2021 claim of non-amenability, by a height-function criterion, was not accepted. Mark Sapir, writing in 2014 about yet another attempt, observed that false proofs appear about once a year, half in each direction. The OpenAI paper lists these claims and uses none of them. [1][4][5][6]

Moore has written about what the problem meant to him: he bought a bottle of cognac in 2010 to be opened when it was solved, and after the 2012 error "it took a toll on me psychologically for a while, with me lacking confidence that I could ever really check my own (or anyone else's) work." [5]

## What OpenAI claims

**Theorem 1.1** (OpenAI, 23 September 2026). Thompson's group $F$ is not amenable. [1]

What this does and does not say. It confirms Geoghegan's conjecture and closes the amenability problem for $F$. It says nothing about Thompson's groups $T$ and $V$, which were already known to be non-amenable because they contain free subgroups, and nothing about the many other open questions about $F$. It also shows, as Moore noted, that the approaches aimed at proving amenability were doomed. [1][5]

## How the claimed proof goes

What follows is a map of the paper's argument from its introduction, its Section 2 and its appendix, together with the shape of Kim and Lodha's rewrite. It is not a check of the details. [1][2]

**The idea.** Suppose $F$ were amenable. Følner's criterion gives finite sets $A\subset F$ that barely move under any chosen finite set of group elements. The paper uses such a set to average Hilbert-space-valued "colors" attached to dyadic partitions of the interval, and shows that the average would be an approximate fixed point of a Lipschitz map $f$ on the unit ball of an infinite-dimensional Hilbert space. But Benyamini and Sternfeld proved in 1983 that every infinite-dimensional normed space carries a Lipschitz self-map of its ball that moves every point by at least a fixed $\delta>0$, something impossible in finite dimensions by Brouwer's theorem (Lemma 1.2). Contradiction. The whole proof is thus a quantitative statement: for every finite $A$, some element of a fixed finite set $S$ moves a definite fraction of $A$. [1]

**The map without fixed points (appendix).** Rather than cite Benyamini and Sternfeld, the paper constructs the map on $H=L^{2}([0,1];\mathbb R^{2})$ with $\delta=1/2$. A curve $\gamma(t)=a(t)v(t)$ is built with $v(t)(w)=(\cos(\theta(t)w),\sin(\theta(t)w))$, a straight segment for $t\le1$ and a tail of norm at most $5/16$ for $t\ge1$ that keeps points at parameter distance one uniformly separated (Lemma A.2), so a tube of fixed radius fits around the whole curve. A Lipschitz map $G:B\to H$ bounded away from zero and equal to the identity for $\|x\|\ge1/2$ is built from this tube, and $f(x)=-G(x)/\|G(x)\|$ has $\|f(x)\|=1$ and $\|f(x)-x\|\ge1/2$ (Proposition A.1). All Lipschitz constants are computed. [1]

**The recursive coloring (Section 2).** Fix $f$ with Lipschitz constant $L$ and a large integer $D$. A basic interval is a cell of a uniform dyadic partition; a basic partition is a finite partition into such cells. Choose $D$ basic intervals with positive gaps and endpoints in $(0,1)$, the parents $I_1,\dots,I_D$, and put an affine copy of the whole family inside each parent, the descendants $I_i\cdot I_j$. Restricting a partition to a parent that is a union of its cells and stretching back to $[0,1]$ gives a normalized restriction. Each basic partition is colored recursively: apply $f$ to the mean of the colors of its $D$ parent restrictions when all are defined, and color it zero otherwise; since restriction decreases the number of cells, the recursion is well founded. For $g\in F$ and a partition level $n$ fine enough that $(n,g)$ is "admissible", the image partition under $g$ has parent colors $X_i$ and descendant colors $Y_{ij}$ with

$$
m=\frac1D\sum_iX_i,\qquad z_i=\frac1D\sum_jY_{ij},\qquad X_i=f(z_i).
$$

[1]

**Transport and the uniform boundary bound (Section 2.3).** $F$ can carry any ordered pair of separated basic intervals affinely onto any other such pair (Lemma 2.2, affine transport). For each ordered pair $I<J$ of parents and descendants choose $h_{I,J}\in F$ carrying $I,J$ onto a fixed reference pair $I_1,I_2$, and let $S$ be this finite set, chosen before $A$. Proposition 2.3 is the theorem in quantitative form: for every nonempty finite $A\subset F$,

$$
\max_{h\in S}\frac{|hA\triangle A|}{|A|}\ \ge\ \frac{\delta^{2}/L^{2}-4/D}{4(1-1/D)}>0.
$$

Its proof fixes one level $n$ admissible for all of $A\cup SA$, which is possible because that set is finite, and writes $\mathbb E_A$ for the average over $A$. Comparing correlations: admissibility of $g$ and $h_{I,J}g$ gives $X_I(g)=X_{I_1}(h_{I,J}g)$ and $X_J(g)=X_{I_2}(h_{I,J}g)$, so the scalar correlation $\varphi_{I,J}(g)=\langle X_I(g),X_J(g)\rangle$ equals $\varphi_{I_1,I_2}(h_{I,J}g)$; the elementary cancellation $|\mathbb E_A\varphi(h\cdot)-\mathbb E_A\varphi|\le|hA\triangle A|/|A|$ for $\varphi$ with values in $[-1,1]$ then gives $|\mathbb E_A\langle X_I,X_J\rangle-\alpha|\le\eta$ for every strictly separated pair, with $\alpha=\mathbb E_A\varphi_{I_1,I_2}$ one common value and $\eta$ the maximal relative $S$-boundary; nested pairs are unconstrained. The variance estimate: expand $\mathbb E_A\|z_i-m\|^{2}$; the common value $\alpha$ cancels between the cross terms, the diagonal and nested pairs occupy only a fraction $1/D$ of each sum and are controlled by unit-ball bounds, so the average is at most a constant times $D^{-1}+\eta$. Since $m$ is also the mean of the $f(z_i)$, convexity and Lipschitz continuity give $\mathbb E_A\|m-f(m)\|^{2}\le CL^{2}(D^{-1}+\eta)$, while $\|m-f(m)\|\ge\delta$ pointwise. Solving for $\eta$ gives the displayed bound. For $D$ large the bound is positive, so no Følner sequence exists. [1]

**Kim and Lodha's version.** Their note reorganizes the argument around a standard tool, extensive amenability. It suffices to show that the action of $F$ on the dyadic rationals is not extensively amenable, since every action of an amenable group is. Assuming an invariant mean on the finite subsets of the dyadic rationals with the required fullness property, they fix two separated dyadic intervals $I_0,I_1$ with affine maps $s_0,s_1$ onto them, build a map from finite sets $P$ into the unit ball of $\ell^{2}$ through the pieces $P_i=s_i^{-1}(P\cap I_i)$ and $P_{ij}$, and use three group elements of $F$ that carry the pieces onto one another. A Lipschitz constant $L<\sqrt2$ and Apollonius's identity for the parallelogram law force the expected squared displacements to be zero, contradicting the fixed-point-free map. The proof is two pages. They then state a generalization, Theorem 2.7, for any group acting on a set with two disjoint "copies" of itself and the three required bijections. [2]

Where would an expert look first? At the correlation-comparison step, where all correlations of separated colors are claimed to agree up to $\eta$ through one reference pair, and at the admissibility bookkeeping that lets one level $n$ serve all of $A\cup SA$; at the variance expansion, where the nested and diagonal terms must really be only a $1/D$ fraction; and in Kim and Lodha, at Lemma 2.5 and the constant $L<\sqrt2$, which is where the contradiction gets its room. [1][2]

## Consequences inside mathematics

If the proof holds, and two experts have now written it out themselves, the amenability problem for $F$ is closed after fifty years. Since $F$ has no free subgroups, it becomes a finitely presented example of a non-amenable group with no free subgroup; Olshanskii's 1980 examples and later ones were not finitely presented, and finitely presented ones were constructed only in 2003 by Olshanskii and Sapir, so $F$ joins a short list with a far more natural definition. Kim and Lodha's Theorem 2.7 extends the argument to a class of groups acting on sets with self-similar structure. The dichotomy question for $F$ raised by Haagerup and Olesen, who showed that simplicity of the reduced $C^{*}$-algebra of $T$ would imply non-amenability of $F$, now has its conclusion established directly. [1][2]

## Uses outside mathematics

No known direct application.

Amenability underlies ergodic theory and the Banach-Tarski paradox and has echoes in statistical physics and computer science, but Thompson's group $F$ is an object of pure mathematics. [1]

## Has anyone checked it?

On 13 October Sang-hyun Kim, of the Korea Institute for Advanced Study, and Yash Lodha, of Purdue University, posted "A note on the proof of nonamenability of F" on arXiv. Both work on groups of piecewise linear homeomorphisms; Lodha's doctoral thesis grew out of a problem Moore brought home from a seminar on his own, later withdrawn, proof. Their abstract: "The goal of this note is to provide a human written exposition of OpenAI's recent proof that Thompson's group $F$ is nonamenable." The text says: "Using the same idea, we give a streamlined proof, and describe a generalization in Theorem 2.7. All the arguments here are based on simplifications of those in the OpenAI announcement, and no novelty is claimed here. No part of this writing, including the references, was produced by AI." The note states the theorem, credits it to OpenAI, proves it in two pages, and ends "The proof is complete." [2]

Uruk's rule for "approved" is that a named expert in the field publicly says they checked the proof and it holds. Kim and Lodha do not use those words. They did something stronger: they rewrote the proof as their own and published it under their names. We count that as approval and say so plainly, so the reader can disagree. What it is not: a journal acceptance, a check of OpenAI's own text line by line, or a consensus. Justin Moore, who has worked on the problem for nineteen years, wrote on 8 October that he will open his cognac "once a group of peers I trust all agrees that the proof is correct and once we collectively understand the proof", and that he feels "much less in a rush to read an AI proof". That consensus has not been announced. [2][5]

**Machine checking.** The release's Lean statement `ThompsonNonamenability.lean` is 89 lines and is listed in the catalogue `formalization.yaml`. It defines $F$ and amenability itself, so a reader should check that the formal definitions match the standard ones. We found no outside replay. A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval, and the label above rests on Kim and Lodha, not on Lean. [9]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; this paper is not among them. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [10]

## Sources

1. OpenAI, "Thompson's group F is nonamenable", 23 September 2026. Theorem 1.1, the context and prior-work paragraphs, the proof strategy and the appendix. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Thompsons-group-F-is-nonamenable-September-23-2026/paper.pdf
2. Sang-hyun Kim and Yash Lodha, "A note on the proof of nonamenability of F", arXiv:2610.18360, 13 October 2026. https://arxiv.org/abs/2610.18360
3. J. W. Cannon, W. J. Floyd and W. R. Parry, "Introductory notes on Richard Thompson's groups", L'Enseignement Mathématique 42 (1996), 215-256. Geoghegan's conjecture is recorded on page 227. https://www.imo.universite-paris-saclay.fr/~emmanuel.breuillard/Cannon.pdf
4. Mark Sapir, "Another false proof of nonamenability of the R. Thompson group F", blog post, 16 August 2014. https://marksapir.wordpress.com/2014/08/16/another-false-proof-of-nonamenability-of-the-r-thompson-group-f/
5. Justin Tatch Moore, "My reaction to October 6th, 2026", written 8 October 2026, read 18 October 2026. https://justintatchmoore.github.io/homepage/10-6-2026.html
6. MathOverflow, "Is Thompson's Group F amenable?", question 26821, for the Shavgulidze and Akhmedov claims and their reception. https://mathoverflow.net/questions/26821/is-thompsons-group-f-amenable
7. Justin Tatch Moore, "Fast growth in the Følner function for Thompson's group F", Groups, Geometry, and Dynamics 7 (2013), 633-651. https://doi.org/10.4171/GGD/201
8. Justin Tatch Moore, "Amenability and Ramsey theory", Fundamenta Mathematicae 220 (2013), 263-280. https://doi.org/10.4064/fm220-3-6
9. OpenAI, Lean scope note for family 248 and the comparator statement `ThompsonNonamenability.lean` at the pinned commit. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/248.md and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/ThompsonNonamenability.lean
10. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
