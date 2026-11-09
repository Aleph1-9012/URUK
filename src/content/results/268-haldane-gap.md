---
family: "268"
topic: "Haldane gap"
title: "Does a chain of spin-one magnets have an energy gap?"
paperTitle: "The periodic spin-one Haldane gap"
claim: "For the pure antiferromagnetic spin-one Heisenberg chain on even periodic rings of L sites, the ground state is unique for every even L ≥ 60 and the spectral gap exceeds (4/105)·log(80/79) for even L ≥ 60 and log(20)/784 for even L ≥ 2304, so the gap stays bounded away from zero as L → ∞. A companion proves a uniform gap above log(10)/392 for odd open chains with a field of 3/5 at both ends, which supplies the hypothesis of Tasaki's index theorem and gives index −1 for the resulting infinite-chain states."
status: under review
checked: 2026-10-20
papers:
  - preprints/The-periodic-spin-one-Haldane-gap-September-24-2026/paper.pdf
  - preprints/A-boundary-field-gap-for-the-spin-one-Heisenberg-chain-September-24-2026/paper.pdf
draft: false
visual: gap-ladder
---

Line up quantum spins in a ring and let each one prefer to point opposite to its neighbours. For spin one half, the lowest excitations cost almost nothing on a long chain; the system is gapless, as Lieb, Schultz and Mattis proved in 1961. In 1983 Duncan Haldane predicted, against the intuition of the time, that for spin one, and for every integer spin, the story is different: there is a gap, a minimum excitation energy that does not shrink however long the chain. The prediction was confirmed numerically to five digits, observed by neutron scattering in a nickel compound, and became one of the founding results of topological phases of matter, for which Haldane shared the 2016 Nobel Prize in Physics. Mathematically, Affleck, Kennedy, Lieb and Tasaki proved a gap in 1987, but for a modified chain with an extra biquadratic term; the pure Heisenberg chain, the one Haldane wrote about, resisted every attempt, and in 2025 Hal Tasaki wrote that a rigorous proof seemed far beyond reach. On 24 September 2026 OpenAI posted two papers claiming the gap for the pure spin-one chain, on even rings and on odd open chains with boundary fields, with explicit lower bounds. [1][2][3][4]

As of 20 October 2026 one named expert, Hal Tasaki, has studied the analytic part of the main proof closely, called it "remarkably simple and elegant", and published two sets of expository notes on it, while saying he has not checked its computer-assisted estimates. The status on this page is "under review"; see below.

## The problem

Let $S^{x},S^{y},S^{z}$ be the spin-one matrices, $3\times3$ self-adjoint matrices with $[S^{\alpha},S^{\beta}]=i\sum_\eta\varepsilon_{\alpha\beta\eta}S^{\eta}$ and $\sum_\alpha(S^{\alpha})^{2}=2$. For even $L\ge4$, on the Hilbert space $(\mathbb C^{3})^{\otimes L}$ the Hamiltonian of the antiferromagnetic Heisenberg ring is

$$
H_L=\sum_{j=0}^{L-1}\sum_{\alpha=x,y,z}S_j^{\alpha}S_{j+1}^{\alpha},\qquad S_L^{\alpha}=S_0^{\alpha}.
$$

Let $E_0(L)$ be its lowest energy, $E_1(L)$ the next distinct energy, $\gamma_L=E_1(L)-E_0(L)$ the gap, and $\Delta_1=\liminf_{L\text{ even}}\gamma_L$. [1]

**Haldane's conjecture for spin one (1983).** $\Delta_1>0$: the gap does not close as the chain grows. [1]

## Why it stayed open

What was known. For half-integer spin the Lieb-Schultz-Mattis theorem and its extension by Affleck and Lieb forbid a unique gapped ground state. For spin one, the AKLT chain, whose bond interaction is $h+\frac13h^{2}$ with $h=\mathbf S_j\cdot\mathbf S_{j+1}$ instead of $h$ itself, has an exactly known ground state and a proven gap, and Yarotsky showed the gap survives small perturbations of it; but no gapped path from AKLT to the pure chain was known. The finite-size criteria of Knabe and Nachtergaele need frustration-free models, which the Heisenberg chain is not. White and Huse's density-matrix renormalization group gave the gap as $0.41050(2)$ in 1993. A proposed proof by Batista and Ortiz in 2001 relied on a perturbative identification without a remainder estimate. Tasaki's 2025 index theorem assumed a gap for odd open chains with endpoint fields, which nobody could supply. [1]

## What OpenAI claims

**Theorem** (OpenAI, 24 September 2026). For the Hamiltonians $H_L$ above, the ground state is unique for every even $L\ge60$, and

$$
\gamma_L>\frac4{105}\log\frac{80}{79}\ \text{ for every even }L\ge60,\qquad\gamma_L>\frac{\log20}{784}\ \text{ for every even }L\ge2304.
$$

Consequently $\Delta_1\ge\log(20)/784>0$. A corollary gives the same lower bound for local excitations in every subsequential thermodynamic limit of the periodic ground states. [1]

**Theorem** (companion). For odd open chains of $2L+1$ sites with the field $h=3/5$ applied at both ends, the gap exceeds $\log(10)/392$ for every $L\ge960$; Tasaki's index theorem then gives index $-1$ for every subsequential local limit of these boundary-selected ground states. [2]

What these do and do not say. The bounds are about $0.0005$, $0.004$ and $0.006$, far below the numerical gap of $0.41$; the papers prove positivity, not the value. The first theorem is for even periodic rings, the second for odd open chains with one specific field; odd rings, free ends and other fields are not treated, nor spin two and higher, nor uniqueness of the infinite-volume ground state. The companion's field $3/5$ differs from the value Tasaki had suggested, and the paper says his boundary hypotheses "require a separate argument from the even-periodic estimates". [1][2]

## How the claimed proof goes

What follows is a map of the main paper's argument from its introduction and from Sections 3 to 5, which were read in full. It is not a check of the details. [1]

**The statement.** Theorem 1.1: for the periodic spin-one antiferromagnetic Heisenberg chain of even length $L$, the ground state is unique for every even $L\ge60$, with gap $\gamma_L>\frac4{105}\log\frac{80}{79}$ for even $L\ge60$ and $\gamma_L>\frac{\log20}{784}$ for even $L\ge2304$; hence the infinite-volume gap satisfies $\Delta_1\ge(\log20)/784\approx0.0038$. The numbers are far below the true gap of about $0.41$, and the paper does not try to optimize them. [1]

**Two probability distributions for one number (Section 3).** Write $Z_n(b)=\operatorname{Tr}e^{-b(H_n+anI)}$ for the partition function of the ring of length $n$ at inverse temperature $b$, with an energy shift $a$. Proposition 3.1, spatial transfer: there is a Hilbert space $\mathcal K_b$, a compact self-adjoint Hilbert-Schmidt operator $X_b$, and a unitary representation of the symmetry group commuting with it, such that $Z_n(b,g)=\operatorname{Tr}(X_b^{n}U_g)$ for all $n\ge4$; so $Z_n(b)=\sum_i\lambda_i(b)^{n}$ over the real eigenvalues of $X_b$. The construction is an ordered bond expansion in the manner of Aizenman and Nachtergaele: a bond history is an ordered list of times in $(0,b)$ with labels $x,y,z$, and the transfer operator acts spatially, from site to site, as a kernel on histories; this is the quantum transfer-matrix idea made rigorous. For even $n$, $Z_n(b)$ is thus both a sum of positive physical Boltzmann weights $e^{-b(\varepsilon_k+an)}$ over the eigenvalues of $H_n$ and a sum of nonnegative spatial weights $|\lambda_i(b)|^{n}$. One number carries two probability distributions. [1]

**Purities and squaring (Section 4).** For even $n$ define the spatial and physical purities

$$
S(n,b)=\frac{Z_{2n}(b)}{Z_n(b)^{2}},\qquad T(n,b)=\frac{Z_n(2b)}{Z_n(b)^{2}};
$$

each is $\sum_iw_i^{2}$ for the corresponding distribution, the shift $a$ cancels, and purity near one means one weight carries almost all the mass, which for the physical distribution means the ground state dominates. Lemma 4.1, squaring probabilities: normalizing the squares of a distribution with purity $P$ gives purity $P'$ with $1-P'\le f(1-P)$, $f(u)=u^{2}/(2(1-u)^{2})$, by the elementary estimate $2\sum_{i<j}w_i^{2}w_j^{2}\le2(\sum_{i<j}w_iw_j)^{2}$. Squaring the spatial weights doubles $n$ and squaring the physical weights doubles $b$, so $1-S(2n,b)\le f(1-S(n,b))$ and $1-T(n,2b)\le f(1-T(n,b))$: once a defect is small it shrinks quadratically. The two purities are coupled because they are built from the same partition functions; direct cancellation gives $S(n,2b)=S(n,b)^{2}T(2n,b)/T(n,b)^{2}$ and $T(4n,b)=T(2n,b)^{2}S(2n,2b)/S(2n,b)^{2}$, with denominators at most one, and Lemma 4.2, the coupled update, turns a pair of defect bounds at $(n,b)$ into a pair at $(2n,2b)$, allowing upward rounding. [1]

**The gap criterion (Proposition 4.3).** The paper states the bootstrap abstractly, for any family of non-scalar self-adjoint Hamiltonians whose partition functions are spatial moments: if for some even $n_0$ and $b_0$ both $S(n_0,b_0)$ and $T(2n_0,b_0)$ are at least $1-u_0$ with $u_0<1/6$ and explicit constants $C,r=Cu_0<1$, then along the doubling sequence $n_j=2^{j}n_0$, $b_j=2^{j}b_0$ the defects are at most $u_j=C^{-1}r^{2^{j}}$, doubly exponentially small. Intermediate even lengths $n_j\le L\le2n_j$ are filled in by the moment inequality $\sum a_i^{q}\le(\sum a_i^{p})^{q/p}$ applied to the spatial eigenvalues, which gives $T(L,b)\ge[T(2n,b)S(n,b)^{2}]^{L/(2n)}$, hence $T(L,b_j)\ge1-3u_j>1/2$. Finally the largest physical weight is at least the purity, so the ratio of any excited weight to the ground weight is bounded, which bounds the excited-to-ground probability ratio and gives a gap $\gamma_L\ge b_j^{-1}\log(\ldots)$ uniform in $L$. The criterion is reusable for other models. [1]

**The finite inputs (Section 5 and the appendices).** The doubling needs a spatial purity at length $n$ and a physical purity at length $2n$ at one inverse temperature. Two initializations are provided: at $(n_0,b_0)=(60,105/4)$, giving the bound for $L\ge60$, and at $(2304,784)$, giving the better eventual bound. Both are derived from a few short-chain partition functions and one periodic trial vector: rigorous interval enclosures of $Z_n(b,g)$ for $n=6,8,10$ at $b=21/2$ and $b=49/4$ in the three symmetry sectors (Lemma 5.1, finite thermal inputs, with centres tabulated to $10^{-6}$ and errors below $10^{-5}$ and $3\cdot10^{-5}$), computed in Appendices A and B by a conditioned Poisson polynomial in a contraction with explicit error bounds; and variational energy estimates from periodic matrix-product vectors with explicit integer matrices (Appendix C). Propositions 5.4 and 5.5 convert these into the two initial purity pairs. These computations are the computer-assisted part and ship with the paper; Section 6 assembles the theorem. [1]

**The companion.** The second paper treats the open chain with boundary fields, proving a gap by the same transfer and concentration method with endpoint fields (Proposition 2.1, open-chain transfer; Proposition 4.2, coupled boundary update), importing the periodic concentration estimates (Proposition 3.3), and constructing the boundary-selected infinite-volume state in its Section 7. [2]

Where would an expert look first? Tasaki has covered the analytic argument. The remaining places are the computer-assisted inputs, the thermal trace enclosures of Appendices A and B and the matrix-product energies of Appendix C, which Tasaki says he did not check; the construction of the spatial transfer operator in Proposition 3.1, in particular that its eigenvalues are real so that $|\lambda_i|^{n}$ are the weights for even $n$; and the interpolation inequality that extends the gap from the doubling lengths to every even $L$. [1][4]

## Consequences inside mathematics

If the proofs hold, Haldane's conjecture is a theorem for spin one in the periodic formulation, forty-three years after the prediction, and the boundary-field version gives Tasaki's topological index its missing hypothesis, so that the Haldane phase of the pure chain is rigorously a nontrivial symmetry-protected topological phase. The bootstrap criterion is a new general method for proving gaps in models that are not frustration-free, which is most of them. Higher integer spins and the gap's value remain open. [1][2]

## Uses outside mathematics

The Haldane gap is a measured quantity: neutron scattering on the nickel compounds CsNiCl$_3$ and NENP showed it in the 1980s, and the spin-one chain is the textbook example of a symmetry-protected topological phase, the class of matter whose study was recognized by the 2016 Nobel Prize. The theorems prove what experiment and numerics had established; they give no new number that a physicist could compare with data. [1][3]

## Has anyone checked it?

Hal Tasaki of Gakushuin University, a coauthor of the AKLT construction and of the index theorem the companion paper completes, wrote on a page dated 18 October: "I carefully studied the analytic argument in the first paper, which proves the Haldane conjecture for the S = 1 antiferromagnetic Heisenberg chain in the standard periodic-chain formulation. I found the argument remarkably simple and elegant, and wanted to share it with others interested in the problem." He published two 34-page expository notes on the analytic part of the proof, one following OpenAI's continuous-time transfer-operator construction and one discrete-time version whose criterion, he says, needs only first-year calculus and linear algebra. He adds: "The complete proof also uses computer-assisted estimates, which I have not independently checked." This is the closest reading by a named expert that we have found for any result in the release after Thompson's group F, and it stops short of the whole proof, so under Uruk's rules the label is "under review" rather than "approved". [4]

A secondary site reports that Tasaki has revised his 2025 index paper to build on the boundary-field preprint, noting no logical gap so far in the portions examined, and that OpenAI's verification programs ran and passed on its machine; we have not confirmed the first against his revised paper, and the second is a machine check, not a human one. VibeMathed lists the family as unreviewed. [5][6]

**Machine checking.** None in Lean: family 268 has no Lean scope note and no comparator statement. The papers ship their interval-arithmetic certificates, thermal-run outputs and error bounds in a `verification/computations/` folder; we did not run them. [7]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; neither paper in this family is among them. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [8]

## Sources

1. OpenAI, "The periodic spin-one Haldane gap", 24 September 2026. The theorem, the historical context and "How the proof works". Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/The-periodic-spin-one-Haldane-gap-September-24-2026/paper.pdf
2. OpenAI, "A boundary-field gap for the spin-one Heisenberg chain", 24 September 2026, abstract. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/A-boundary-field-gap-for-the-spin-one-Heisenberg-chain-September-24-2026/paper.pdf
3. Ian Affleck, Tom Kennedy, Elliott H. Lieb and Hal Tasaki, "Rigorous results on valence-bond ground states in antiferromagnets", Physical Review Letters 59 (1987), 799-802. https://doi.org/10.1103/PhysRevLett.59.799
4. Hal Tasaki, "OpenAI's proof of the Haldane gap in the S = 1 antiferromagnetic Heisenberg chain", with two expository notes (continuous-time and discrete-time versions), published 18 October 2026, revised 19 October, read 20 October 2026. https://haltasaki.github.io/writings/AI/OpenAI_Haldane.html
5. AI Proved What?, "A gap for spin one, proved at last? The Haldane gap for the Heisenberg chain", episode 268, last checked 17 October 2026, read 20 October 2026. https://aiprovedwhat.com/episodes/268-haldane-gap-spin-one/
6. VibeMathed, "Haldane gap for the spin-one Heisenberg chain", read 20 October 2026. https://vibemathed.com/problem/haldane-gap-spin-one
7. OpenAI, `lean/docs/` and `lean/formalization.yaml` at the pinned commit, which contain no entry for family 268; the papers' `verification/computations/` folder at the same commit. https://github.com/openai/math/tree/4eaee87548250b2682affda7d05d947c05554bae/preprints/The-periodic-spin-one-Haldane-gap-September-24-2026/verification
8. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
