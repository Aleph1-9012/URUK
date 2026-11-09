---
family: "271"
topic: "Bloch's law and the Heisenberg ferromagnet"
title: "Why does a magnet lose its strength like T to the three halves as it warms?"
paperTitle: "Bloch's Law for Finite-Range Heisenberg Ferromagnets in Three Dimensions"
claim: "The three-dimensional quantum Heisenberg ferromagnet is magnetized at low temperature in every dimension from three up and for every spin, and in three dimensions its spontaneous magnetization falls below saturation by exactly the amount Bloch predicted in 1930, zeta(3/2)/(8 pi^{3/2} sqrt(det D)) times T^{3/2}, with the next correction and the uniform direction of the magnetization in a finite box also determined."
status: unreviewed
checked: 2026-11-03
papers:
  - preprints/Blochs-Law-for-Finite-Range-Heisenberg-Ferromagnets-in-Three-Dimensions-October-5-2026/bloch-law-heisenberg.pdf
  - preprints/Spontaneous-magnetization-in-the-quantum-Heisenberg-ferromagnet-September-24-2026/paper.pdf
  - preprints/The-first-lattice-correction-to-Blochs-law-October-5-2026/first-lattice-correction-bloch-law.pdf
  - preprints/The-spherical-magnetization-law-for-the-three-dimensional-quantum-Heisenberg-ferromagnet-October-5-2026/spherical-magnetization.pdf
draft: false
---

A bar magnet is strongest at absolute zero. Warm it a little and its magnetization drops, and in 1930 Felix Bloch worked out how: the loss grows like the temperature to the power three halves, because the cheapest disturbances of a perfectly aligned magnet are long, slow waves of tilted spins, and their number at temperature $T$ scales like $T^{3/2}$. Bloch's law is in every solid-state textbook and is confirmed by experiment. What nobody had proved is that it follows from the standard quantum model of a magnet, Heisenberg's: a lattice of quantum spins, each wanting to point the same way as its neighbours. It was not even proved that this model is magnetized at all at any positive temperature in three dimensions, a question Elliott Lieb put on his list of open problems in 1999 and Robert Seiringer called "the famous open problem" in 2025. On 24 September 2026 OpenAI posted a paper claiming the magnetization, and on 5 October three more claiming Bloch's law with its exact coefficient, the next correction term, and the uniform direction of the magnetization in a large box. [1][2][3][4]

As of 3 November 2026 no mathematician has said publicly that they have checked any of the four proofs. A Lean statement exists for the magnetization result alone and is not in the release's catalogue. The status on this page is "unreviewed". [9][10]

## The problem

Heisenberg's model places at each site $x$ of the cubic lattice $\mathbb Z^{3}$ a quantum spin of size $S$, which can be $\tfrac12,1,\tfrac32,\ldots$: a vector of three operators $\boldsymbol S_x=(S^{x}_x,S^{y}_x,S^{z}_x)$ on the space $\mathbb C^{2S+1}$. The energy of a finite box $\Lambda$ with couplings $J\ge0$ is

$$
H=-\tfrac12\sum_{x,y\in\Lambda}J(y-x)\,\boldsymbol S_x\cdot\boldsymbol S_y,
$$

which is lowest when all spins are parallel; for the nearest-neighbour model, $J(\pm e_j)=1$ and nothing else. At inverse temperature $\beta=1/T$ in a magnetic field $h$ the system's pressure is $p_\beta(h)=\lim_{\Lambda}\frac1{\beta|\Lambda|}\log\operatorname{Tr}e^{-\beta(H-hM)}$, with $M$ the total $z$-spin, and the spontaneous magnetization is the right derivative $m(\beta)=\partial_h^{+}p_\beta(0)$: switch on a tiny field, let the box grow, then let the field go to zero. At $T=0$ every spin points along the field and $m=S$. Bloch's law says that for small $T$

$$
S-m(\beta)\approx\frac{\zeta(3/2)}{8\pi^{3/2}S^{3/2}}\,T^{3/2},
$$

where $\zeta(3/2)\approx2.612$. The coefficient is the density of ideal "magnons", spin waves treated as non-interacting bosons with energy $Sk^{2}$ at wavenumber $k$. [1]

Two separate things had to be proved. First, that the model is ordered at all: that at low positive temperature there is an equilibrium state in which the spins have a nonzero average direction, which in one and two dimensions is false. Second, that the deficit from full polarization is given by the spin-wave count, which requires showing that the interactions between spin waves, which Dyson analysed in 1956, do not change the leading term. [1][2]

<!-- uruk:visual-note
The visual on this page shows a block of spins at a chosen temperature, drawn from a classical stand-in for the quantum model, with the average magnetization plotted against $T$ beside Bloch's curve; the reader can watch the long-wavelength waves appear as the temperature rises. What the visual leaves out is quantum mechanics itself, which is where the difficulty lies: the spins in the theorem do not have definite directions, and the proof works with closed loops in space and imaginary time rather than with arrows. [1]
-->

## Why it stayed open

### Who asked

Heisenberg proposed the exchange model in 1928 as the quantum mechanism of ferromagnetism. Bloch derived the $T^{3/2}$ law from spin waves in 1930; Holstein and Primakoff gave the boson representation in 1940; Dyson's 1956 papers developed the low-temperature expansion, identified the first effect of spin-wave interactions at order $T^{4}$, and estimated the higher terms, without a rigorous proof at fixed spin. The existence of spontaneous magnetization in the quantum ferromagnet appears as Problem A on Lieb's 1999 list of open problems in statistical mechanics, and on Simon's 1984 list before it. [1][2][5][6]

### What was tried

The rigorous theory split along two lines that the ferromagnet fell between. Mermin and Wagner showed in 1966 that in one and two dimensions there is no spontaneous magnetization at any positive temperature. In three and more dimensions, Fröhlich, Simon and Spencer proved ordering for classical spin models in 1976 by infrared bounds, and Dyson, Lieb and Simon extended the method in 1978 to quantum antiferromagnets, for spin at least one in three dimensions. The ferromagnet resisted: as Dyson, Lieb and Simon themselves explained, the reflection-positivity argument does not provide the needed ferromagnetic Duhamel infrared bound. The quantum ferromagnet is the case in which the classical intuition is clearest and the proof was missing. [1][2][7]

The free energy was better understood than the magnetization. Conlon and Solovej, and Tóth, obtained bounds for spin $\tfrac12$ in the early 1990s, and Correggi, Giuliani and Seiringer proved the leading low-temperature free-energy asymptotics for the nearest-neighbour model at every spin in 2015. But a zero-field free-energy estimate does not control the one-sided field derivative that defines the spontaneous magnetization, which is why that step is new. [1][8]

### What stood in the way

The spin waves that give the coefficient interact, and the interaction is strongest exactly where the count is made, at long wavelengths. Bloch's and Dyson's derivations treat the magnons as a gas and estimate the corrections; a proof must control the full quantum many-body state at a fixed positive temperature on all length scales, with the field derivative taken in the right order. The ingredients that the new papers assemble had existed for some time: Tóth's random-interchange representation of the quantum Heisenberg model as loops, Nachtergaele's extension to higher spin by splitting each spin into $2S$ slots, the negative-dependence theory of Borcea, Brändén and Liggett, and Nash's energy method for diffusion. What was missing was a way to make the loop picture yield a lower bound on magnetization, and then an exact asymptotic. [1][2]

## What OpenAI claims

Four theorems in four papers. [1][2][3][4]

**Spontaneous magnetization (24 September 2026, Theorem 1.1).** For every integer $d\ge3$ and every $S\in\{\tfrac12,1,\tfrac32,\ldots\}$ there is $\beta_0(d,S)$ such that for every $\beta\ge\beta_0$ the nearest-neighbour model on $\mathbb Z^{d}$ has a translation-invariant equilibrium state (a $\beta$-KMS state for the zero-field dynamics) with $\omega(S^{z}_0)\ge S/4$. The paper notes this is a property of the chosen state; a rotation-invariant average need not keep it. [2]

**Bloch's law (5 October 2026, Theorem 1.1).** For every fixed $S$ and every nonnegative symmetric finite-range coupling $J$ on $\mathbb Z^{3}$ whose support generates the lattice,

$$
\lim_{\beta\to\infty}\beta^{3/2}\bigl(S-m_{S,J}(\beta)\bigr)=\frac{\zeta(3/2)}{8\pi^{3/2}\sqrt{\det D_{S,J}}},
$$

where $D_{S,J}$ is the quadratic coefficient of the one-magnon dispersion $\varepsilon_{S,J}(k)=S\sum_zJ(z)(1-\cos k\cdot z)$. For nearest neighbours $D=SI$ and the formula is Bloch's. The order of limits is part of the assertion: volume, then field, then temperature. [1]

**The first lattice correction (5 October 2026, Theorem 1.1).** For the nearest-neighbour model at every spin, $S-m_S(\beta)$ agrees with the full ideal-magnon density $\int_{[-\pi,\pi]^{3}}\frac{d^{3}k}{(2\pi)^{3}(e^{\beta\varepsilon_S(k)}-1)}$ up to $o(\beta^{-5/2})$; expanding, the term after Bloch's is $3\zeta(5/2)(\beta S)^{-5/2}/(128\pi^{3/2})$. [3]

**The spherical magnetization law (5 October 2026).** In zero field on even periodic cubes, at every sufficiently low temperature, the symmetric magnetization converges in moments, as the cube grows, to a vector of deterministic length and uniformly random direction, and that length equals the right field derivative of the infinite-volume pressure. [4]

Scope. Bloch's law is proved in three dimensions only; the magnetization theorem is for all $d\ge3$ but nearest neighbours only; the correction and the spherical law are nearest-neighbour three-dimensional. The threshold temperatures $\beta_0$ are not explicit. Nothing is claimed about the critical temperature or about two dimensions, where Mermin and Wagner's theorem forbids order. [1][2][3][4]

## How the claimed proofs go

What follows is a map of the two main papers' arguments from their introductions and section plans, with the other two papers noted where they diverge. It is not a check of the details. The four papers total about 12,500 lines of TeX; the Bloch's law paper alone is seven sections. [1][2]

**Spins as loops (Bloch paper, Section 2; magnetization paper, Section 2).** Each spin-$S$ site is represented by $\ell=2S$ spin-$\tfrac12$ slots. Independent Poisson exchanges between slots over an imaginary-time period of length $\beta$, followed by a uniform permutation of the slots at each site, form directed cycles; each cycle carries one colour, up or down (Proposition 2.1 of the Bloch paper, loop representation; Proposition 2.2 of the magnetization paper, the exact spin-to-loop representation with its symmetric-slot realization, Lemma 2.1). This is Tóth's random interchange, extended to higher spin as Nachtergaele described. [1][2]

**Pins (Bloch paper, Section 2; magnetization paper, Sections 3 and 4).** Constraining all cycles through the boundary and through specified slot-time points to be "up" defines a pin law. For an unpinned point $i$ with pin set $E$, a change of weights gives its down-probability as $d_E(i)=r/(1+r)$, where $r=r(E,\{i\})$ is the probability, under the law with $i$ also pinned, that the directed line from $i$ returns to $i$ before meeting $E$ (Proposition 2.4, pin identities). The magnetization is thus controlled by return probabilities of a walk. The magnetization paper's Section 3 builds a simultaneous pin test from the stable-polynomial negative-dependence theory of Borcea, Brändén and Liggett (Proposition 3.1, with Lemmas 3.2 to 3.6 on closure operations, partial symmetrization, stable exchange symbols and presence probabilities), and its Section 4 gives the exposed-path disintegration (Proposition 4.1) and a one-particle return identity with boundary pins (Lemma 4.4). [1][2]

**The walk in an exposed environment (Bloch paper, Sections 2 and 3).** Proposition 2.5 disintegrates the law by exposing the cycles that miss the augmented pin set; the return probability $r$ is represented by a walk on the remaining slots (Propositions 2.7 and 2.8, the conditional next-pin kernel and the fresh-walk identity). The exposed environment repeats over periods while the walk uses fresh transition randomness on each traversal. Section 3 supplies the geometry: three linearly independent interaction vectors generate a finite-index sublattice on whose cosets the chosen bonds form copies of the cubic lattice, and local Nash inequalities, routed unit flows and energy estimates (Proposition 3.3, Lemma 3.4, Propositions 3.5 and 3.7) are transferred to these copies and compared with the full interaction energy. [1]

**The sparse-pin bootstrap (Bloch paper, Section 4).** Theorem 4.8 proves a uniform sparse-pin estimate by downward induction on the pin set, through blocking at deterministic times (Lemma 4.1), a component tail (Lemma 4.2), the probability of an irregular slice (Proposition 4.3), localization (Lemma 4.4) and diffusion on a good exposure (Proposition 4.5). The induction supplies enough regular time for diffusion without assuming any finite-range ordering theorem; the magnetization paper's Sections 5 and 6 do the corresponding work for nearest neighbours in every $d\ge3$, which is where $\omega(S^{z}_0)\ge S/4$ comes from. [1][2]

**Returns determine the coefficient (Bloch paper, Sections 5 and 6).** The ideal walk has site jump rates $SJ(z)$ and heat kernel $p_t(x,x)\sim\kappa t^{-3/2}$ with $\kappa=(4\pi)^{-3/2}(\det D_{S,J})^{-1/2}$. After a full traversal the slot index is uniform, so the ideal $n$-period return probability to a specified slot is $\ell^{-1}p_{n\beta}(x,x)$; summing over the $\ell$ slots at a site cancels the factor and leaves $\kappa\sum_{n\le K}n^{-3/2}$, which approaches the Bloch coefficient as $K$ grows (the sum of $n^{-3/2}$ is $\zeta(3/2)$). The main analytic difficulty is controlling arbitrarily late returns in the same repeated environment. Section 5 truncates a quadratic hitting-probability identity after $K$ periods (Lemma 5.1): a mass already spread for time comparable to $K\beta$ has a flow to infinity with energy at most $C(K\beta)^{-1/2}$, and averaging over one further period bounds the remainder by $CK^{-1/2}\beta^{-3/2}+o_K(\beta^{-3/2})$ with $C$ independent of $K$ (Proposition 5.2); the case $K=1$ first improves the exposed-slot density to $O(\beta^{-3/2})$ (Corollary 5.3). That improved density permits the comparison with the ideal walk in Section 6: the ideal path rarely meets an exposed strand over a fixed number of periods, and splitting a return at its midpoint combines that small encounter probability with diffusive smoothing to give an error $o_K(\beta^{-3/2})$ in each return entry. Passing to pressure increments and then to the field derivative, in the stated order of limits, gives Theorem 1.1. [1]

**The correction and the spherical law.** The lattice-correction paper pushes the same comparison one order further, to $o(\beta^{-5/2})$, so that the full lattice dispersion rather than its quadratic approximation determines the deficit; its coefficient is, as the paper notes, Dyson's. The spherical-magnetization paper works in the rotation-invariant periodic Gibbs state, where the question is whether the symmetric state selects a single magnetization length; it expresses the law through self-adjoint linear combinations of the spin components, so that no joint measurement of noncommuting observables is needed, and identifies the length with the field derivative of the pressure. [3][4]

**Where an expert would look first.** At the pin identities and the fresh-walk identity (Propositions 2.4 and 2.8 of the Bloch paper), which turn a quantum expectation into a return probability and must hold exactly; at the simultaneous pin test (Proposition 3.1 of the magnetization paper), where negative dependence is used; at the long-return bound (Proposition 5.2) and the uniformity of its constant in $K$, since the coefficient comes from letting $K\to\infty$ after $\beta\to\infty$; and at the order of limits in the final step from pressure increments to the one-sided derivative. The loop representation itself is standard and can be checked against Tóth's and Nachtergaele's papers. [1][2]

## Consequences inside mathematics

If the proofs hold they settle Problem A of Lieb's list, the existence of spontaneous magnetization in the quantum Heisenberg ferromagnet in three and more dimensions, and give the first rigorous derivation of Bloch's law from the microscopic model, with the next term and the direction law besides. The method is a loop representation pushed to an exact asymptotic, which may apply to other quantum spin systems where reflection positivity is unavailable, the obstruction that stopped the 1978 method. The critical temperature, the behaviour near it, and the two-dimensional XY-type models are untouched. [1][2]

## Uses outside mathematics

Bloch's law is physics, and it has been used by physicists since 1930 without a proof, to fit magnetization curves and extract spin-wave stiffness constants from experiment. The theorem confirms, for the idealised model, what measurement had already established; it provides no new formula and changes no experimental practice. We record no application beyond that, and the papers claim none. [1]

## Has anyone checked it?

We found no named mathematician or physicist who has said publicly that they have read or checked any of the four proofs. The expected readers are Seiringer, Giuliani, Correggi, Ueltschi, Björnberg and Nachtergaele, whose work the papers build on, and we found no public statement from them. VibeMathed lists the magnetization theorem as Lean-checked and Bloch's law as unreviewed, each with the note "No independent mathematician has checked this yet", and records that the family's only Lean challenge states the magnetization bound, not the $T^{3/2}$ asymptotic. [9]

**Machine checking.** The release's scope note for this family links one comparator statement, `Heisenberg.lean`, 218 lines, which states the magnetization theorem: for every $d\ge3$ and every spin, at every sufficiently low positive temperature, a translation-invariant KMS state with magnetization at least $S/4$, together with convergence of the finite-volume dynamics used in the KMS condition. The formal proof behind it is about 155 files. None of the four papers is listed in the catalogue `formalization.yaml` at the pinned commit, despite the "(Lean)" tag on the family's catalogue entry, and Bloch's law, the correction and the spherical law have no Lean statement at all. We found no outside replay. A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval. [10]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; none of the four papers in this family is among them, and three of the four are dated 5 October, the day before the release. On 26 October it added two manuscripts and more Lean statements; nothing in this family changed. [11]

## Sources

1. OpenAI, "Bloch's Law for Finite-Range Heisenberg Ferromagnets in Three Dimensions", 5 October 2026. Theorem 1.1, Section 1.2 for the history and dependencies, Section 1.3 for how returns determine the coefficient, Sections 2 to 6. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Blochs-Law-for-Finite-Range-Heisenberg-Ferromagnets-in-Three-Dimensions-October-5-2026/bloch-law-heisenberg.pdf
2. OpenAI, "Spontaneous magnetization in the quantum Heisenberg ferromagnet", 24 September 2026. Theorem 1.1, Section 1.2 for the historical context including Dyson, Lieb and Simon's explanation of the ferromagnetic obstruction, Sections 2 to 6. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Spontaneous-magnetization-in-the-quantum-Heisenberg-ferromagnet-September-24-2026/paper.pdf
3. OpenAI, "The first lattice correction to Bloch's law", 5 October 2026. Theorem 1.1 and the correction coefficient. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/The-first-lattice-correction-to-Blochs-law-October-5-2026/first-lattice-correction-bloch-law.pdf
4. OpenAI, "The spherical magnetization law for the three-dimensional quantum Heisenberg ferromagnet", 5 October 2026. Abstract and Section 1.1. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/The-spherical-magnetization-law-for-the-three-dimensional-quantum-Heisenberg-ferromagnet-October-5-2026/spherical-magnetization.pdf
5. Felix Bloch, "Zur Theorie des Ferromagnetismus", Zeitschrift für Physik 61 (1930), 206 to 219. The $T^{3/2}$ law. https://doi.org/10.1007/BF01339661
6. Freeman J. Dyson, "General Theory of Spin-Wave Interactions" and "Thermodynamic Behavior of an Ideal Ferromagnet", Physical Review 102 (1956), 1217 to 1230 and 1230 to 1244. https://doi.org/10.1103/PhysRev.102.1217 and https://doi.org/10.1103/PhysRev.102.1230
7. Freeman J. Dyson, Elliott H. Lieb and Barry Simon, "Phase transitions in quantum spin systems with isotropic and nonisotropic interactions", Journal of Statistical Physics 18 (1978), 335 to 383. The antiferromagnetic ordering theorem and the ferromagnetic obstruction. https://doi.org/10.1007/BF01106729
8. Michele Correggi, Alessandro Giuliani and Robert Seiringer, "Validity of the Spin-Wave Approximation for the Free Energy of the Heisenberg Ferromagnet", Communications in Mathematical Physics 339 (2015), 279 to 307. https://doi.org/10.1007/s00220-015-2402-0
9. VibeMathed, "Bloch's law for the quantum Heisenberg ferromagnet" and "Spontaneous magnetization in the quantum Heisenberg ferromagnet", dataset of 1 November 2026. https://vibemathed.com/problem/bloch-law-quantum-heisenberg-ferromagnet and https://vibemathed.com/problem/quantum-heisenberg-ferromagnet-spontaneous-magnetization
10. OpenAI, Lean scope note for family 271 and the comparator statement `Heisenberg.lean` at the pinned commit; `lean/formalization.yaml` at the pinned commit, which lists none of the four papers. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/271.md , https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/Heisenberg.lean and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/formalization.yaml
11. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
