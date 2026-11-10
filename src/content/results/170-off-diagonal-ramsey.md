---
family: "170"
topic: "Off-diagonal Ramsey numbers"
title: "How large a party guarantees five mutual friends or a crowd of strangers?"
paperTitle: "The sharp logarithmic exponent of r(5,t)"
claim: "For every fixed s ≥ 5, r(s,t) = t^(s−1)/(log t)^(s−2+o(1)) as t → ∞: the lower bound t^(s−1)/(log t)^(s−2+ε) holds for every ε > 0 and all large t, and the upper bound C_s t^(s−1)/(log t)^(s−2) is classical. This determines the logarithmic exponent of every off-diagonal Ramsey number with s ≥ 5."
status: unreviewed
checked: 2026-10-18
papers:
  - preprints/The-Sharp-Logarithmic-Exponent-of-r-5-t-September-24-2026/paper.pdf
  - preprints/Sharp-Logarithmic-Exponents-for-Fixed-Off-Diagonal-Ramsey-Numbers-September-24-2026/paper.pdf
draft: false
visual: party-gap
---

Among any six people, three are mutual acquaintances or three are mutual strangers; five people are not enough. That is the Ramsey number $r(3,3)=6$, the first case of a theorem Frank Ramsey proved in 1930 on the way to a problem in logic. The general number $r(s,t)$ is the smallest party size that forces $s$ mutual acquaintances or $t$ mutual strangers, and almost nothing exact is known: $r(5,5)$ lies somewhere between $43$ and $46$. Mathematicians therefore ask how $r(s,t)$ grows when $s$ is fixed and $t$ gets large. Erdős and Szekeres showed in 1935 that it grows no faster than $t^{s-1}$; in 1980 Ajtai, Komlós and Szemerédi shaved off a power of $\log t$, giving $t^{s-1}/(\log t)^{s-2}$. Whether that is the truth took decades to settle case by case: Kim proved it for $s=3$ in 1995, Mattheus and Verstraete found the power of $t$ for $s=4$ in 2023, and in May 2026 Bradač found the power of $t$ for every $s$, leaving a gap only in the power of the logarithm. On 24 September 2026 OpenAI posted two papers claiming to close that gap for every $s\ge5$. [1][2][3][4][5][6]

As of 18 October 2026 no mathematician has said publicly that they have read or checked the proofs. The status on this page is "unreviewed".

## The problem

A graph is a set of vertices with some pairs joined by edges; think of people and acquaintance. A clique of order $s$ is a set of $s$ vertices all joined to one another, and an independent set of order $t$ is a set of $t$ vertices none of which are joined. The Ramsey number $r(s,t)$ is the least $N$ such that every graph on $N$ vertices contains a clique of order $s$ or an independent set of order $t$. Ramsey's theorem says it is finite. The symmetric case $r(t,t)$ is called diagonal; this page is about the off-diagonal case, where $s$ is fixed and $t\to\infty$. All logarithms are natural. [1][2][3]

The classical bounds. Erdős and Szekeres proved $r(s,t)\le\binom{s+t-2}{s-1}$, which for fixed $s$ is $O(t^{s-1})$. Ajtai, Komlós and Szemerédi improved this to $O(t^{s-1}/(\log t)^{s-2})$ by analyzing a greedy algorithm for independent sets, and Li, Rousseau and Zang showed the leading constant can be taken as $1+o(1)$. On the other side, random graphs give lower bounds: Spencer's local-lemma construction gives $r(s,t)\ge c(t/\log t)^{(s+1)/2}$, and Bohman and Keevash's analysis of the random $K_s$-free process improved the logarithm. For $s\ge4$ these lower bounds do not even reach the right power of $t$. [1][2]

**The question.** For fixed $s$, is $r(s,t)=t^{s-1}/(\log t)^{s-2+o(1)}$? That is, is the upper bound of Ajtai, Komlós and Szemerédi correct to within $(\log t)^{o(1)}$? [1][2]

<!-- uruk:visual-note
A visual for this page can show a small complete graph with edges colored two ways and let the reader hunt for a monochromatic triangle, then plot the known bounds on $r(s,t)$ for $s=3,4,5$ on logarithmic axes with the gaps as shaded bands, and show the bands closing: Kim's in 1995, Bradač's in 2026, and the claimed closure for $s\ge5$. It cannot show the construction, which lives in a projective space over a finite field.
-->

## Why it stayed open

### From three to every $s$

Kim's 1995 theorem $r(3,t)=\Theta(t^{2}/\log t)$ was the first case where upper and lower bounds met in order of magnitude, and it took a delicate random construction. For $s=4$ the random methods were stuck at $t^{5/2}$ for decades. In 2023 Mattheus and Verstraete proved $r(4,t)\ge ct^{3}/(\log t)^{4}$, which determines the power of $t$ and settled a conjecture of Erdős; their construction came from finite geometry, Hermitian unitals in a projective plane, randomly modified to be $K_4$-free, and the paper appeared in the Annals in 2024. Mubayi and Verstraete had earlier shown what pseudorandom $K_s$-free graphs would give if they existed. [1][2][5]

In May 2026 Bradač's preprint "Off-diagonal Ramsey numbers" gave a construction in every dimension: an ordered graph on incident point-hyperplane pairs of the projective space $\mathrm{PG}(d,q)$ over the field with $q$ elements, which proves

$$
r(s,t)\ge c_s\frac{t^{s-1}}{(\log t)^{2s-4}}\qquad(s\ge3).
$$

This settles the power of $t$ for every $s$. The remaining difference between $(\log t)^{2s-4}$ below and $(\log t)^{s-2}$ above is the logarithmic gap. For $s=5$ it is $(\log t)^{6}$ against $(\log t)^{3}$. [1][2][6]

Why the gap is hard: in Bradač's graph an independent set is a sequence of flags obeying an ordered consistency rule, and bounding the independence number means showing that no long consistent sequence exists in a random stream of flags. Bradač's counting of the exceptional positions costs $O(q\sigma^{2})$ bits of information, with $\sigma=\log q$, and that is too coarse by exactly the logarithmic factor at stake. [1][2]

## What OpenAI claims

**Theorem 1.1** (OpenAI, "The sharp logarithmic exponent of $r(5,t)$", 24 September 2026). There is an absolute constant $C>0$ such that for every $\varepsilon>0$ and all sufficiently large $t$,

$$
\frac{t^{4}}{(\log t)^{3+\varepsilon}}\le r(5,t)\le C\frac{t^{4}}{(\log t)^{3}}.
$$

Consequently $\bigl(4\log t-\log r(5,t)\bigr)/\log\log t\to3$. [1]

**Theorem 1.1** (OpenAI, "Sharp logarithmic exponents for fixed off-diagonal Ramsey numbers", 24 September 2026). For every fixed integer $s\ge6$ there is $C_s>0$ such that for every $\varepsilon>0$ and all sufficiently large $t$,

$$
\frac{t^{s-1}}{(\log t)^{s-2+\varepsilon}}\le r(s,t)\le C_s\frac{t^{s-1}}{(\log t)^{s-2}},
$$

so the logarithmic exponent is $s-2$. [2]

What these do and do not say. Both papers are explicit that they determine the exponent of the logarithm and not the constant: the general paper "does not assert that $r(s,t)$ is bounded below by a positive constant times $t^{s-1}/(\log t)^{s-2}$", and the $r(5,t)$ paper "leaves open a constant-factor asymptotic". The case $s=4$ is not covered: there the lower bound remains Mattheus and Verstraete's $(\log t)^{4}$ against the upper bound's $(\log t)^{2}$. The upper bounds are classical; the $r(5,t)$ paper includes its own elementary proof of one with an absolute constant. [1][2]

## How the claimed proofs go

What follows is a map of the two arguments, from the papers' introductions and from the general paper's Sections 2 to 7. It is not a check of the details. [1][2]

**The idea.** Use Bradač's graph unchanged and prove a far better bound on its independence number, by an entropy argument: any long independent set selected from the random stream of flags must carry a certain minimum amount of information, and the papers describe such sets in fewer bits than that, a contradiction. The lower bound on $r(s,t)$ is then the standard conversion from a $K_s$-free graph with small independence number, and the matching upper bound is the classical Ajtai-Komlós-Szemerédi estimate, reproved. [1][2]

**The construction.** Fix $d\ge5$ (so $s=d+1$), a large prime $q$, and $\sigma=\log q$. A point of $\mathrm{PG}(d,q)$ is a line through the origin in $\mathbb F_q^{d+1}$ and a dual point is a hyperplane; write $a\perp b$ when the point $a$ lies on the hyperplane $b$, and call $(a,b)$ with $a\perp b$ an incident flag. Choose $N=\lfloor q^{d}\sigma\rfloor$ flags independently and uniformly, in order, and join positions $i<j$ when $a_i\perp b_j$ and $a_j\not\perp b_i$. Linear independence of $d+1$ points on each other's hyperplanes is impossible, so the graph has no $K_{d+1}$. An independent set, read in its original order, is a sequence in which $a_i\perp b_j$ forces $a_j\perp b_i$ whenever $i<j$; the papers call this consistency, and note that reversing the order and swapping points with hyperplanes preserves it. Theorem 1.2 of the general paper: for every $0<\eta<1/10$ and large prime $q$, this graph has $|V|=\lfloor q^{d}\sigma\rfloor$ vertices, no $K_{d+1}$, and independence number below $k=\lfloor q\sigma^{1+\eta}\rfloor$. Converting from prime $q$ to arbitrary large $t$ (Section 7.2) gives $r(s,t)\ge t^{s-1}/(\log t)^{s-2+o(1)}$. [2]

**The entropy lower bound.** Suppose every stream contained a consistent sequence of length $k$. Selecting one by a fixed rule may bias its law heavily, but a counting argument (Selected-Tuple Entropy, Section 2) still gives any selected sequence $F$ of deterministic length $\ell=\Theta(k)$

$$
H(F)\ge d\sigma\ell+\eta\ell\log\sigma-O(k),
$$

and the bound survives any fixed number of restrictions to events of probability bounded below. The leading term $d\sigma\ell$ is what it costs to name $\ell$ flags outright, since there are about $q^{d}$ flags per position; the surplus $\eta\ell\log\sigma$ is what must be beaten. [2]

**Why Bradač's count stops short.** Consistency lets one mark all but $O(q\log q)$ positions of a consistent sequence as belonging to explicitly known flag domains of size $O(q^{d})$ (the Marking lemma, Section 5, adapting Bradač's Claim 2.13). Bradač's direct count records the $O(q\sigma)$ expensive positions at $O(\sigma)$ bits each, an allowance of $O(q\sigma^{2})$, and this is too coarse: it exceeds the surplus $\eta\ell\log\sigma$ when $\ell=\Theta(q\sigma^{1+\eta})$. The papers' answer is to shrink the flag domains in stages, so that the excess cost of the expensive positions beyond the $d\sigma$ allowance per flag falls, replacing the old description at each stage instead of carrying its history. [2]

**Component one: describing a sparse pair.** Given point sets $S,T$ in opposite point systems of $\mathrm{PG}(j,q)$, $2\le j\le d$, with $|S||T|$ close on a logarithmic scale to $q^{j+1}$ but incidence density much smaller than $1/q$, the Sparse-Pair Description lemma (Section 3) produces a short message naming a set that captures a fixed fraction of the smaller support and is not much larger than it; separate validation samples then cut small domains on both sides that retain almost all of $S$ and $T$. Repeated projection (Proposition 3.4) reduces dimensions $j\ge4$ to two and three. In those dimensions the decoding uses independent Poisson batches of sample points and a score that accepts many training points and few ambient ones; a moment argument controls the decoded set's size, and the geometric input is a polynomial bound on rich lines with the field characteristic kept larger than the polynomial degrees involved, adapting Dvir, Guth-Katz and Elekes-Kaplan-Sharir while controlling the positive-characteristic obstructions of Ellenberg and Hablicsek. [1][2]

**Component two: finding the supports.** The entropy deficit inside the marked domains bounds the dependence between suitable representative positions and the rest of the sequence, so most representative pairs have almost no one-way incidence conflict. In the "reciprocal" classes, where the two prescribed endpoint-domain sizes multiply to $O(q^{d+1})$, a geometric argument turns this into sparse incidence between endpoint supports, with exact coincidences charged to small occupied flag rectangles (Section 5, Low-Conflict Geometry). The other classes have large endpoint ranks and are described directly from two independent sample rows, using a bound on the union of rich subspaces that follows from Nie and Wang's finite-degree closure inequality (Section 4, Short-Row Description). [2]

**Component three: iterating without old information.** For reciprocal supports, the representative pairs are arranged in time order and the description is applied along a balanced binary tree of windows; each successful node restricts one endpoint domain for each child, fresh validation samples bound the loss from each restriction before any later success is imposed, and an additive potential bounds the total message length (Section 6, One Compression Stage). The decoder for the new stage starts from the full projective spaces and reads only the new message, never the previous context or the hidden conditional laws. Section 7.1 iterates a bounded number $T+1$ of stages with explicit budgets $\Lambda,\Delta$ for context entropy and domain size, showing $\Lambda_*/k=o(1)$ and $\Delta_*q\sigma/k=o(1)$ at the end, and stresses that all constants are fixed before $q$ without enumerating conditional histories. A final marking scan then bounds the entropy of the whole tuple by $d\sigma\ell+O(k)$, contradicting the lower bound. The sampling tables used to select description samples are public auxiliary randomness; the papers bound message length, not search time. [2]

**The $r(5,t)$ paper.** The companion treats $d=4$ with the same architecture, and is where the selected-law entropy and the low-dimensional sparse-pair machinery were first developed: its predictor is built from a Poisson score over typical hyperplanes, with exceptional hyperplanes defined by deviations of incidence counts, and its compression runs along the same tree of windows. The general paper says it supplies all needed arguments locally and that neither the repeated projection nor the high-rank construction is inferred from the five-clique case. [1][2]

**The upper bound.** Section 7.3 reproves the Ajtai-Komlós-Szemerédi estimate from a triangle-free independence bound, $\alpha(H)\ge n\log(D_0+1)/(8(D_0+1))$ for maximum degree $D_0$, by Alon's uniform-independent-set argument, followed by sampling and deletion. [2]

Where would an expert look first? At the Selected-Tuple Entropy lemma and the claim that the lower bound survives selection and a bounded number of conditionings; at the loss accounting in one compression stage, where the saving must exceed the surplus $\eta\ell\log\sigma$ and where fresh validation is used before later successes are imposed; at the rich-line and rich-subspace bounds in Sections 3 and 4, including the characteristic restriction; and at the bookkeeping of Section 7.1 that fixes all constants independently of $q$. [1][2]

## Consequences inside mathematics

If the proofs hold, the order of growth of every off-diagonal Ramsey number $r(s,t)$ with $s\ge5$ is known up to $(\log t)^{o(1)}$, and the sixty-year-old upper bound of Ajtai, Komlós and Szemerédi is sharp in its logarithmic power. Combined with Kim for $s=3$, only $s=4$ keeps a logarithmic gap. The constant-factor question, whether $r(s,t)\asymp t^{s-1}/(\log t)^{s-2}$, stays open for every $s\ge4$, and the papers say so. The diagonal numbers $r(t,t)$, where Campos, Griffiths, Morris and Sahasrabudhe gave the first exponential improvement in 2023, are a different problem. [1][2]

## Uses outside mathematics

No known direct application.

Ramsey theory is the mathematics of unavoidable structure, and its ideas appear in theoretical computer science, but the asymptotics of $r(s,t)$ for fixed $s$ are a question about mathematics itself. [3]

## Has anyone checked it?

We found no named mathematician who says they are reading or checking either paper, and no public comment from Verstraete, Mattheus or Bradač, whose constructions the proofs use. An AI-generated library page on erdosproblems.ai summarizes the general paper section by section; it is not review. VibeMathed records no check by an independent mathematician. [7][8]

**Machine checking.** The release has a Lean scope note for this family and two comparator statements, `RamseyFive.lean` (30 lines) and `SharpLogRamsey.lean` (37 lines), each defining the Ramsey number as the least $N$ with the Ramsey property and stating the two-sided bounds and the limit; formal proofs of 450 and 408 files sit behind them. Neither statement is listed in the release's catalogue `formalization.yaml` at the pinned commit, which is the same situation as the standard-map and hot-spots families. We do not know why. We found no outside replay. A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval. [9]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; neither paper in this family is among them. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [10]

## Sources

1. OpenAI, "The sharp logarithmic exponent of r(5,t)", 24 September 2026. Theorem 1.1 and the history section. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/The-Sharp-Logarithmic-Exponent-of-r-5-t-September-24-2026/paper.pdf
2. OpenAI, "Sharp logarithmic exponents for fixed off-diagonal Ramsey numbers", 24 September 2026. Theorems 1.1 and 1.2, the background section, the construction and its entropy obstruction. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Sharp-Logarithmic-Exponents-for-Fixed-Off-Diagonal-Ramsey-Numbers-September-24-2026/paper.pdf
3. Wikipedia, "Ramsey's theorem", read 18 October 2026. The party example, the known small values and the bounds $43\le r(5,5)\le46$. https://en.wikipedia.org/wiki/Ramsey%27s_theorem
4. Jeong Han Kim, "The Ramsey number R(3,t) has order of magnitude t²/log t", Random Structures and Algorithms 7 (1995), 173-207. https://doi.org/10.1002/rsa.3240070302
5. Sam Mattheus and Jacques Verstraete, "The asymptotics of r(4,t)", Annals of Mathematics 199 (2024), 919-941; arXiv:2306.04007. https://arxiv.org/abs/2306.04007
6. Domagoj Bradač, "Off-diagonal Ramsey numbers", arXiv:2605.28793, version 3, 16 June 2026. https://arxiv.org/abs/2605.28793
7. Erdős Problems AI library page on the general paper, read 18 October 2026. https://erdosproblems.ai/wiki/library/ramsey_theory/openai_2026_sharp_logarithmic_exponents_fixed_off_diagonal_ramsey_numbers
8. VibeMathed, "Off-diagonal Ramsey logarithmic exponent", read 18 October 2026. https://vibemathed.com/problem/off-diagonal-ramsey-log-exponent
9. OpenAI, Lean scope note for family 170, the comparator statements `RamseyFive.lean` and `SharpLogRamsey.lean`, and `lean/formalization.yaml` at the pinned commit, which does not list them. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/170.md , https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/RamseyFive.lean , https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/SharpLogRamsey.lean and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/formalization.yaml
10. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
