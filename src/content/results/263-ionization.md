---
family: "263"
topic: "The ionization conjecture"
title: "How many electrons can an atom hold?"
paperTitle: "Uniform excess charge for Coulomb molecules and the outer radius of neutral atoms"
claim: "In the full nonrelativistic Schrödinger model with two electron spin states, a system of M fixed nuclei of charges at least one and total charge Z strictly binds at most Z + CM electrons, for a universal constant C. Neutral atoms have first ionization energies and outer half-electron radii bounded above and below by universal positive constants. Companion papers give Thomas-Fermi asymptotics for the energy to remove m electrons and for outer-electron radii."
status: unreviewed
checked: 2026-10-20
papers:
  - preprints/Uniform-excess-charge-for-Coulomb-molecules-and-the-outer-radius-of-neutral-atoms-September-24-2026/paper.pdf
  - preprints/Generalized-ionization-energies-for-full-Coulomb-atoms-September-24-2026/paper.pdf
draft: false
---

A nucleus of charge $Z$ attracts electrons until $Z$ of them make it neutral. Can it hold more? In the laboratory, at most one: hydrogen binds a second electron, as do most elements, and no isolated atom has ever been seen holding two extra. Chemists take this for granted, and the periodic table is built on it: the first ionization energy, the cost of removing one electron from a neutral atom, stays between about $4$ and $25$ electron volts from hydrogen to the heaviest elements instead of growing with $Z$. Proving any of this from the Schrödinger equation turned out to be very hard. Elliott Lieb showed in 1984 that an atom cannot bind $2Z+1$ electrons, which leaves room for $Z$ extra; Phan Thành Nam improved the coefficient to $1.22$ in 2012; Jan Philip Solovej proved the bounded version in 2003, but only in the Hartree-Fock approximation. The conjecture that the excess is bounded by a universal constant is Problem 9 on Barry Simon's list of open problems for the twenty-first century, and a 2025 survey of Mathieu Lewin's records it as open. On 24 September 2026 OpenAI posted three papers claiming it, together with the generalized version Solovej formulated about the outer electrons of heavy atoms. [1][3][4][5][6]

As of 20 October 2026 no mathematician has said publicly that they have read or checked the proofs. The status on this page is "unreviewed".

## The problem

Fix $M\ge1$ nuclei at distinct positions $R_1,\ldots,R_M$ in $\mathbb R^{3}$ with charges $z_1,\ldots,z_M\ge1$, total charge $Z=\sum z_j$, and Coulomb potential $V(x)=\sum_jz_j/|x-R_j|$. The state of $n$ electrons is an antisymmetric wavefunction of $n$ positions and spins, with two spin states, and its energy is governed by the Hamiltonian

$$
H_n=\sum_{i=1}^{n}\Bigl(-\tfrac12\Delta_i-V(x_i)\Bigr)+\sum_{1\le i<j\le n}\frac1{|x_i-x_j|},
$$

kinetic energy, attraction to the nuclei, and repulsion between electrons; the nuclei are fixed and their mutual repulsion is a constant left out. Let $E_n$ be the ground-state energy of $H_n$, with $E_0=0$. The $n$-th electron is strictly bound if $E_n<E_{n-1}$: adding it lowers the energy. The sequence $E_n$ is nonincreasing and eventually constant, and the question is where it stops decreasing. [1]

**The ionization conjecture (Simon's Problem 9, 2000).** For a single atom, the largest strictly binding electron number $N_c(Z)$ satisfies $N_c(Z)\le Z+C$ for a universal constant $C$. For a molecule with $M$ nuclei, $N_c\le Z+CM$. [1][3][4]

<!-- uruk:visual-note
A visual for this page can show the periodic table coloured by first ionization energy, flat rather than rising, next to the known mathematical bounds on $N_c(Z)/Z$ descending over forty years from $2$ toward $1$; and a cartoon of an atom's density with the outer half-electron radius marked, the scale on which the new theorem lives.
-->

## Why it stayed open

What was known. Lieb's 1984 bound $N_c<2Z+M$ holds for any statistics, bosons included, which is why it cannot be sharp: bosonic atoms really do bind about $0.21Z$ excess electrons. For fermions, Lieb, Sigal, Simon and Thirring proved asymptotic neutrality, $N_c(Z)/Z\to1$, in the 1980s; Fefferman and Seco and then Seco, Sigal and Solovej made the excess quantitatively sublinear; Nam's $N_c<1.22Z+3Z^{1/3}$ and Hundertmark, Pattakos and Schulz's $1.1185Z+4Z^{1/3}$ in 2025 are the best explicit bounds. In the mean-field models the conjecture is a theorem: Benguria and Lieb for Thomas-Fermi-von Weizsäcker in 1985, Solovej for Hartree-Fock in the Annals in 2003, where he also proved that the radius of an atom stays bounded as $Z\to\infty$. Solovej's method compares screened potentials across successive length scales; the obstacle in the true many-body problem is that electrons are correlated and no single density describes them. [1][5][6]

## What OpenAI claims

**Theorem** (uniform excess charge; OpenAI, 24 September 2026). There is a universal finite constant $C$ such that for every nuclear system as above and every integer $n\ge1$,

$$
E_n<E_{n-1}\quad\Longrightarrow\quad n\le Z+CM,
$$

and $E_n=E_{n-1}$ whenever $n>Z+CM$. For one nucleus this gives $n\le Z+C$ under strict binding, for every real $Z\ge1$. The constant is independent of all charges and positions, which may be arbitrarily close or far apart. [1]

**Theorem** (uniform outer half-electron radius). For a neutral atom with integer $Z\ge1$ and any normalized ground state $\Psi_Z$, let $R(\Psi_Z)$ be the smallest radius outside which the electron density has mass at most $1/2$. Then $c\le R(\Psi_Z)\le C$ for universal constants $0<c\le C$. [1]

**Corollary.** The first ionization energy $I_1(Z)=E_Z(Z-1)-E_Z(Z)$ of the neutral atom satisfies $c\le I_1(Z)\le C$ for every integer $Z\ge1$. [1]

**Companions.** The energy needed to remove $m$ electrons satisfies $I_m(Z)/m^{7/3}\to a_{\mathrm{TF}}$ when $m\to\infty$ and $Z/m\to\infty$, with $a_{\mathrm{TF}}$ the Thomas-Fermi constant; and the radius containing all but $m$ electrons of a neutral atom satisfies $m^{1/3}R_m\to(81\pi^{2}/2)^{1/3}$ in iterated limits, $Z\to\infty$ first. These are Solovej's generalized ionization conjecture. [2]

What these do and do not say. The constant $C$ is not computed; the theorem does not say an atom holds at most one or two extra electrons, only boundedly many. The model is nonrelativistic, with fixed point nuclei and no magnetic field. Strict binding is the formulation; the theorem does not exclude a ground state exactly at threshold. [1]

## How the claimed proof goes

What follows is a map of the main paper's argument from its introduction and section plan, with the key lemma of Section 5 read in full. It is not a check of the details. The paper is 84 pages in fifteen sections. [1]

**The idea.** Prove that a correlated many-electron ground state obeys, locally and on every length scale outside the nuclei, the Thomas-Fermi screening law $\rho=k(W_+)^{3/2}$ between its density $\rho$ and its screened field $W$, with $k=2^{3/2}/(3\pi^{2})$, up to controllable errors. Thomas-Fermi theory has a rigid exterior profile that forgets the nuclear charge; once the true atom is shown to follow it far out, the number of electrons outside any radius, the ionization energy and the radius are all universal. This is Solovej's strategy for Hartree-Fock, carried out for states with arbitrary correlations, and the paper's main new device is a way to give a correlated state something that behaves like a local density. [1]

**Working relative to the global minimum (Section 2).** Fixing the electron number obstructs local comparisons, because a ball may contain too many or too few electrons and its conditional core need not minimize any fixed local problem. The paper works relative to $E=\inf_nE_n$, which a coarse binding bound shows is attained at the largest strictly bound sector (Lemmas 2.1 to 2.3), and with $\delta$-states, normalized states of energy at most $E+\delta$; keeping $\delta$ visible lets local estimates survive conditioning on events, deleting particles, and reweighting by shell weights. For atoms, Lemma 2.5 supplies ground states of every sector up to the neutral one. [1]

**Localization and two quantum comparisons (Section 3).** A spatial cut records every removed electron and leaves an antisymmetric conditional core (Lemma 3.4, the conditional localization identity, an IMS-type identity with Lewin's geometric localization for correlated states). In the hole, arbitrary expected trial mass may be inserted, because each actual trial has an integer sector whose energy is at least $E$ (Lemma 3.5, trial particles in a hole). Coherent-state filling gives an upper comparison and Neumann eigenvalue counting a lower one, with the same kinetic coefficient (Lemma 3.6); their comparison produces a local Thomas-Fermi minimizer $\rho$ and its screened field $W$, controls the Coulomb discrepancy between $\rho$ and the actual fine density, and bounds the energy of that density in the negative part of $W$. [1]

**Screening and electron counts (Section 4).** A positive-field estimate for conditional states (Lemma 4.2) and a comparison in an interior ball (Lemma 4.3, in six steps from the choice of cut to an interior field bound) feed a bootstrap that closes a bound on the second moment of local electron counts (Lemma 4.4 and Proposition 4.5, uniform local counts and conditional fields). This is where the Lieb-Thirring inequality, in Rumin's spectral-splitting form, supplies the coarse density bound. [1]

**Noisy observations (Section 5).** The device that makes correlated states tractable: observe all electron positions with independent errors of width $\ell$ and forget the particle labels. Lemma 5.2, the energy cost of a data event, says that if $\Psi$ is a sector eigenstate with energy within $D_0$ of $E$ and $A$ is an observation event of probability $p$, then the reweighted state $\Psi_A=\sqrt{p_A/p}\,\Psi$ is a normalized antisymmetric vector whose position law is the conditional law given $A$, with energy at most

$$
E+D_0+C\ell^{-2}\log^{5}(e/p),
$$

a constant depending only on the noise law and not on the particle number, the number of observation arrays, or the nuclear system. The paper calls this dimension-free. It means a hypothetical failure of the local Thomas-Fermi law, which is a rare event in the observed data, can be conditioned upon at bounded energy cost and then tested by the local quantum estimates of Sections 3 and 4. Two separate conditional-expectation identities compare the field computed from the original observation posterior with the field on a fresh patch (Lemma 5.3, averaged field transfer), and the negative-field penalty controls the rare configurations needed to pass a lower field estimate to expectation. [1]

**Outward propagation, molecular case (Sections 6 to 9).** Deterministic comparison fields are built from global Thomas-Fermi problems and from fields adapted to the nuclear scale (Section 7), with barriers having a strict gap between successive scales (Lemmas 7.6 and 7.7). A positive comparison field is continued outward layer by layer: at a local maximum one chooses between a shifted nonlinear subsolution and a shifted observed field (Lemma 5.4, maximum of weak subsolutions), the inverse comparisons replace the model reaction by the actual conditional density on one more layer (Proposition 9.1, one outward step), conditional averaging forgets one observation array with convexity preserving the nonlinear inequality (Lemma 9.2), and the errors are summed through their expected integrals (Lemma 9.3). At the terminal scale, comparison with a compact source potential and its spherical mean turns the positive field into a lower bound on nuclear charge minus enclosed electron mass. For a molecule the local length measures nearby nuclear charge; empty nuclear annuli must be counted without a loss for their number of scales, and a decomposition by nested nuclear representatives (Section 6, large nuclear voids) gives a total cost proportional to $M$, which closes the bound $N\le Z+CM$. [1]

**The atomic case (Sections 10 to 14).** For an atom, local balls away from the nucleus use their distance from it, a scale that reaches inside the bulk length $Z^{-1/3}$. A simultaneous inverse comparison (Proposition 10.1, conditional density determines the field) and outward propagation (Section 11) produce an interior electron deficit for sector ground states with $n\le3Z$ and bounded energy offset. Used at offset zero, and deleting exterior particles, this gives $E_{Z-1}\le E+C$, so both the neutral and the singly ionized ground states become eligible for the fixed-offset estimates (Section 12). The neutral deficit gives the lower radius bound; a spatially averaged insertion of one electron into the singly ionized state gives the uniform positive gap $E_{Z-1}-E_Z\ge c$ (Section 13); and the gap, through a shell-weighted change of law whose weight is measurable in the revealed data, gives the exterior mass bound $C/R$ that controls the half-electron radius from above (Section 14). Section 15 records the interfaces used by the two companion papers for their Thomas-Fermi asymptotics. [1]

Where would an expert look first? At Lemma 5.2, the energy cost of a data event with its $\log^{5}(e/p)$ and no particle-number factor, since everything downstream depends on conditioning being cheap; at the two conditional-expectation identities behind the field transfer; at the outward step of Proposition 9.1 and the summation of its errors; and at the nested-representative decomposition of Section 6, which is where the claim that $C$ survives nuclei arbitrarily close together must be made good. [1]

## Consequences inside mathematics

If the proofs hold, Simon's Problem 9 is settled and with it Lewin's molecular form; the first ionization energy and the atomic radius are bounded independently of $Z$ for the true Schrödinger atom, as Solovej proved for Hartree-Fock; and the generalized ionization conjecture, Thomas-Fermi asymptotics for the outer electrons of heavy atoms, holds in the full model. The local Thomas-Fermi law for correlated states is a tool that may apply elsewhere in the mathematics of large Coulomb systems. [1][2]

## Uses outside mathematics

The statement is chemistry: it says that the Schrödinger equation predicts what the periodic table shows, that negative ions carry only a few extra electrons and that ionization energies and atomic sizes do not grow with the nuclear charge. No chemist needed the theorem to know those facts, and it gives no numbers a chemist could use; its value is that the model is now proved to agree with the table on these points. [1]

## Has anyone checked it?

We found no named mathematician or physicist who says they are reading or checking these papers, and no public comment from Solovej, Lieb, Nam, Lewin, Seiringer or Frank, whose work they build on. VibeMathed records no check by an independent mathematician. [7]

**Machine checking.** The release's Lean scope note for this family covers only the two companions. `CoulombIonization.lean`, 99 lines, states the Thomas-Fermi asymptotics for $I_m(Z)$ and is in the catalogue `formalization.yaml`; `CoulombRadii.lean`, 89 lines, states the radius asymptotics and is not. The main theorem, $N\le Z+CM$, and the bounds on the first ionization energy and the half-electron radius have no Lean statement at all. So the headline of this page rests entirely on the written paper. We found no outside replay. A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval. [8]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; none of the three papers in this family is among them. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [9]

## Sources

1. OpenAI, "Uniform excess charge for Coulomb molecules and the outer radius of neutral atoms", 24 September 2026. The model, both theorems, the corollary, the history and the common argument. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Uniform-excess-charge-for-Coulomb-molecules-and-the-outer-radius-of-neutral-atoms-September-24-2026/paper.pdf
2. OpenAI, "Generalized ionization energies for full Coulomb atoms" and "Generalized outer-electron radii of neutral Coulomb atoms", 24 September 2026, statements as summarized in the release's Lean scope note. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Generalized-ionization-energies-for-full-Coulomb-atoms-September-24-2026/paper.pdf and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Generalized-outer-electron-radii-of-neutral-Coulomb-atoms-September-24-2026/paper.pdf
3. Barry Simon, "Schrödinger operators in the twenty-first century", in Mathematical Physics 2000, Imperial College Press, 283-288, Problem 9. https://doi.org/10.1142/9781848160224_0014
4. Mathieu Lewin, "Some open mathematical problems concerning charged quantum particles", Comptes Rendus Physique 26 (2025), 369-380, Section 2.1.2. https://doi.org/10.5802/crphys.249
5. Elliott H. Lieb, "Bound on the maximum negative ionization of atoms and molecules", Physical Review A 29 (1984), 3018-3028. https://doi.org/10.1103/PhysRevA.29.3018
6. Jan Philip Solovej, "The ionization conjecture in Hartree-Fock theory", Annals of Mathematics 158 (2003), 509-576. https://doi.org/10.4007/annals.2003.158.509
7. VibeMathed, "Ionization conjecture (Simon's Problem 9)", read 20 October 2026. https://vibemathed.com/problem/ionization-conjecture-simon-problem-9
8. OpenAI, Lean scope note for family 263 and the comparator statements `CoulombIonization.lean` and `CoulombRadii.lean` at the pinned commit, with `lean/formalization.yaml`. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/263.md , https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/CoulombIonization.lean and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/CoulombRadii.lean
9. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
