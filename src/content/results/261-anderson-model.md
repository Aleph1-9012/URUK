---
family: "261"
topic: "Anderson model"
title: "In a disordered crystal, does an electron get stuck or travel freely?"
paperTitle: "Absolutely Continuous Spectrum for Weak-Disorder Anderson Models in Dimensions at Least Three"
claim: "For the Anderson model with independent uniform site potentials: in two dimensions, every positive disorder strength gives almost surely pure-point spectrum throughout the spectrum, with a complete basis of eigenvectors. In every fixed dimension d ≥ 3, every sufficiently small positive disorder strength gives purely absolutely continuous spectrum, with nonzero weight, on a fixed open energy interval."
status: under review
checked: 2026-10-17
papers:
  - preprints/Absolutely-Continuous-Spectrum-for-Weak-Disorder-Anderson-Models-in-Dimensions-at-Least-Three-September-23-2026/paper.pdf
  - preprints/Pure-Point-Spectrum-for-the-Two-Dimensional-Anderson-Model-at-Every-Positive-Disorder-September-23-2026/paper.pdf
draft: false
visual: trapped-waves
---

In a perfect crystal an electron moves freely; the material conducts. Add random impurities and, Philip Anderson argued in 1958, the electron's wave can get trapped in a small region and never leave; the material insulates. This is Anderson localization, and it earned him a share of the 1977 Nobel Prize. Physicists then worked out when it should happen. In one and two dimensions, any disorder at all should trap everything. In three dimensions and above, weak disorder should leave some electrons free to travel, with trapped and free states separated by an energy called the mobility edge. Mathematicians could prove the trapping at strong disorder and at extreme energies in any dimension, but never the two headline predictions: trapping at every disorder in two dimensions, and free states at weak disorder in three. Barry Simon listed both in 2000 as the first two of his fifteen problems for the century. On 23 September 2026 OpenAI posted two papers claiming both. [1][2][4][5][6]

As of 17 October 2026 nobody has said the proofs are correct. Two leading experts in the field have worked through the final step of the three-dimensional argument in a note of their own, so the status on this page is "under review". The two-dimensional paper has drawn no such engagement that we found.

## The problem

The Anderson model is a quantum particle hopping on a grid with random energies at the sites. On the lattice $\mathbb Z^{d}$, a state of the particle is a square-summable function $\psi$ on the grid points, and the Hamiltonian, the operator that drives its evolution, is

$$
(H\psi)(x)=\sum_{|y-x|=1}\psi(y)+V_x\,\psi(x),
$$

where the sum runs over the $2d$ nearest neighbours of $x$ and $V_x$ is the random potential at $x$. In this family the potentials are independent and uniformly distributed on an interval $[-h,h]$, with $h$ the disorder strength. At $h=0$ the operator is the free Laplacian, every state spreads out as a wave, and the energies fill the band $[-2d,2d]$. [1][2][19]

The question is what the random potential does to the spectrum of $H$, meaning the set of possible energies and the type of states that carry them. Spectral theory sorts states into three kinds. Pure point spectrum means that $H$ has a complete set of eigenvectors, states with sharp energies that stay where they are forever: localized states. Absolutely continuous spectrum means that the states spread out and carry transport: extended states. Singular continuous spectrum is a third possibility, neither of the above, that occasionally appears in exotic models and that the papers also have to rule out. For a random operator the spectral type is almost surely the same for every realization of the randomness, so one asks what it is with probability one. [1][2][19]

**Simon's Problem 2.** Show that in two dimensions, for every $h>0$, $H$ almost surely has pure point spectrum throughout its spectrum. [2][6]

**Simon's Problem 1.** Show that in dimension $d\ge3$, for suitably small $h>0$, there is an energy interval on which the spectrum of $H$ is almost surely purely absolutely continuous. [1][6]

The two problems point in opposite directions, and that contrast is the point. The scaling theory of Abrahams, Anderson, Licciardello and Ramakrishnan, from 1979, predicts that two dimensions is the borderline: any disorder localizes everything there, while three dimensions supports a metal. Simon's third problem, diffusion, asks for the dynamical version of the metallic behaviour and is not addressed by this family. [1][2][5][6]

## Why it stayed open

### Sixty-eight years of half-answers

Anderson's 1958 paper gave the physical argument but not a proof, and he himself used a flat distribution of site energies, the uniform law this family treats. The rigorous theory began in 1983, when Fröhlich and Spencer introduced multiscale analysis, an inductive control of the resolvent on larger and larger boxes, and proved absence of diffusion at large disorder or at energies near the band edges. Fröhlich, Martinelli, Scoppola and Spencer upgraded this to pure point spectrum with exponentially decaying eigenfunctions in 1985, and Delyon, Lévy and Souillard did the same by another route. Simon and Wolff supplied the general mechanism that turns fixed-energy estimates into a statement about spectral type, by averaging over the random value at one site. Aizenman and Molchanov's fractional-moment method of 1993 gave a second, shorter path to localization in the same regimes. Every one of these results needs either large disorder or an energy near the edge of the band. None reaches the middle of the band at weak disorder in two dimensions, which is where Problem 2 lives. The best two-dimensional results for weak disorder are near the band edge only, by Ding and Smart in 2020 and Hurtado in 2026. [1][2][7][8][9][10][13]

Extended states were harder still. The only setting where anyone could prove absolutely continuous spectrum for a random Anderson model was the Bethe lattice, an infinite tree with no loops, where Abel Klein did it in 1994 and 1998. Aizenman, Sims and Warzel, and later Aizenman and Warzel, extended the tree results, and Aggarwal and Lopatto found a mobility edge on trees of high degree in 2025. A tree is not a lattice: its lack of loops is exactly what makes the recursion work. On $\mathbb Z^{d}$ there was no proof of absolutely continuous spectrum for any $d$. Erdős, Salmhofer and Yau proved in 2007 that the dynamics look like diffusion over long but disorder-dependent times as the coupling tends to zero, and Black, Drogin and Hernández gave quantitative versions for Gaussian disorder in 2025, but a limit as the disorder vanishes is not a statement at a fixed disorder. In September 2026 Jaksic, Last and Warzel posted a criterion on $\mathbb Z^{d}$ that would give absolutely continuous spectrum if a certain lower bound held, without proving the bound. [1][11][12][14][17]

Simon's 2000 list made the two questions precise and famous. The three-dimensional one, extended states for the lattice model, has been called the central open problem of the subject. [6]

## What OpenAI claims

**Theorem 1.1** (OpenAI, "Pure-Point Spectrum for the Two-Dimensional Anderson Model at Every Positive Disorder", 23 September 2026). Let $d=2$ and let the potentials $v_x$ be independent and uniform on $[-h,h]$. For each fixed $h>0$, almost surely $H$ has pure point spectral type, admits a complete orthonormal basis of eigenvectors, and has spectrum $[-4-h,4+h]$, in which its eigenvalues are dense. [2]

**Theorem 1.1** (OpenAI, "Absolutely Continuous Spectrum for Weak-Disorder Anderson Models in Dimensions at Least Three", 23 September 2026). Write the operator as $-\sum_{|y-x|=1}\psi(y)+\lambda V_x\psi(x)$ with $V_x$ uniform on $[-1,1]$; the sign of the hopping term is immaterial. There is a number $e_2\in(0,\tfrac1{100})$ such that for every fixed $d\ge3$ there is $\lambda_d>0$ with the following property. Set

$$
I_d=\begin{cases}(-6+e_2/2,\ -6+e_2),&d=3,\\[2pt] -2d+(\tfrac1{200},\tfrac1{100}),&d\ge4.\end{cases}
$$

Then for every fixed $0<\lambda<\lambda_d$, almost surely $I_d$ lies in the spectrum of $H$ and the spectral projection onto $I_d$ maps into the absolutely continuous subspace. In particular the spectrum on $I_d$ is purely absolutely continuous and has nonzero weight. [1]

**Corollary 1.2** (coexistence). At the same fixed $d\ge3$ and $\lambda<\lambda_d$, a known theorem of Elgart and Klein gives a second interval $J$, just above the bottom of the spectrum at $-2d-\lambda$, on which the spectrum is almost surely pure point with exponentially decaying eigenfunctions. Both intervals carry spectrum, so localized and extended states coexist in the same operator. [1][15]

What these do and do not say. The two-dimensional theorem covers arbitrarily weak disorder and the whole spectrum, but it does not assert exponential decay of the eigenfunctions, dynamical localization, estimates uniform in energy, or one probability-one event for all $h$ at once. The three-dimensional theorem gives one fixed interval of extended states near, but not at, the bottom of the free band; it does not find the mobility edge, say anything about the rest of the band, or address diffusion. Its disorder threshold $\lambda_d$ is existential: for $d\ge4$ it has the form $\sqrt3\cdot2^{-n_*(d)}$ where $n_*(d)$ is defined by an infinite family of conditions on finite matrices and no numerical value is given, and for $d=3$ only existence is claimed. Nothing is uniform in the dimension. Both papers treat the uniform distribution only; Bernoulli and other laws are not covered. [1][2]

## How the claimed proofs go

What follows is a map of the two papers, from their introductions and section plans. It is not a check of the details. The two arguments are unrelated in method. [1][2]

**Three dimensions and up: the idea.** Extended states are detected by the resolvent $(H-E-i\eta)^{-1}$: if its diagonal entries keep a positive imaginary part as the regularization $\eta$ shrinks to zero, the spectrum at energy $E$ is absolutely continuous. The paper builds, on a large finite periodic box, a certificate that this happens at a positive fraction of sites, then transfers the certificate to the infinite lattice and upgrades it to purity. [1]

**Building the certificate.** Start from the free operator with small artificial damping on at least half the sites. Each uniform potential is written as a series of independent binary digits. Revealing a digit replaces part of the artificial damping by true randomness, and the proof tracks three controls through the revelations: an entrywise square of the rescaled resolvent, a bound on fourth moments of its rows so that no row concentrates on a few sites, and a Ward identity that turns squared resolvent entries into a discrete Laplacian whose inverse gives a spatial energy norm. Updates are tested on finite tiles; a failed trial is rolled back and its sites are marked pending. At later scales small clusters of pending sites are cleared by a scattering-matrix argument: a unitary matrix records how a core interacts with its exterior, and unitarity bounds the damage completing the core can do. Two inductions, one deterministic and one probabilistic, show that with high probability no pending site survives and the final sweep inserts every remaining true digit, so the finished potentials are the original uniform variables. The paper states that dimension enters through three estimates only, a Fourier bound, a packing exponent chosen inversely to $d$, and a separation of scales. [1]

**From certificate to spectrum.** A rank cut by a narrow spectral projection compares the certified resolvent with the true one; averaging over the own-site potential bounds the expected rank and gives a positive expectation for the boundary imaginary part. Ergodicity and rank-one changes of a single potential propagate positivity to every site, almost surely, at almost every energy. Conditioning on the operator with one site removed produces an exceptional energy set independent of that site's value, absolute continuity holds off it, and spectral averaging removes any mass on it. That final step is the one Jaksic and Last have already proposed to shorten, below. [1][11]

**Two dimensions: the idea.** The paper reads localization off a scattering problem. On finite tori with absorbing terms, it opens "ports" and defines a Dirichlet energy on port data from squared scattering amplitudes. Localization amounts to showing that this energy, for affine data, vanishes in the limit of large tori and sparse ports. [2]

**Where dimension two enters.** The first ingredient is a family of rare resonant cells with impedance and transmission estimates that hold against arbitrary exterior data, embedded in the original product law by an acceptance likelihood. The second is a comparison along a hierarchy of increasingly sparse ports, with screening estimates at every stage, which defines a limiting scattering energy $d$. The decisive step forces $d=0$ using two-dimensional capacity: a logarithmic voltage profile separates interior ports from an annulus of weak probes at arbitrarily small cost, which is possible only in the plane. If $d$ were positive, an analytic test of the scattering matrix would have a nonzero value at the centre of a disk while shifts of the potentials make its boundary moments arbitrarily small, contradicting the submean property of analytic functions. Vanishing affine energy is then bootstrapped to a fractional-moment estimate for the true Green function at fixed energy, in the tradition of Aizenman and Molchanov, and Simon and Wolff's rank-one averaging converts fixed-energy information into pure point spectral type. [2][9][10]

Where would an expert look first? In the three-dimensional paper, at the pending-site bookkeeping and the clearing step, since a union bound over all sites and scales is too expensive and the whole certificate depends on the rollback accounting; then at the spectral readout, where two experts have already started. In the two-dimensional paper, at the vanishing step, which is where the plane is used, and at the resonant-cell estimates that feed it. [1][2]

## Consequences inside mathematics

If both proofs hold, the two headline predictions of the physics are theorems for the uniform-disorder lattice model: complete localization in two dimensions at any disorder, and a band of extended states in three dimensions and above at weak disorder, coexisting with localized states at the band edge. The first resolves the pure point assertion of Simon's Problem 2 and the second the purely absolutely continuous energy-range question of Simon's Problem 1. The mobility edge itself, the full spectral diagram, dynamical localization in two dimensions and quantum diffusion in three remain open, and the papers say so. [1][2][6]

## Uses outside mathematics

No known direct application.

Anderson localization is real physics. It governs the metal-insulator transition in disordered conductors, and it has been observed directly for light in disordered media and for cold atoms in optical speckle potentials. But physicists have believed both predictions for decades, on the strength of the scaling theory and of numerical simulation, and have built on them. The theorems, if correct, make the mathematical model agree with the physics. They give no new number, since the three-dimensional threshold is not computed, and they change no experiment. [5][19]

## Has anyone checked it?

Vojkan Jaksic of McGill University and Yoram Last of the Hebrew University, two of the leading figures in the spectral theory of random operators, posted a note to arXiv on 8 October, "Extended States on the Bethe Lattice Revisited". Its abstract ends: "We also observe that the same structural argument shortens the final passage from boundary positivity to purity in the recent OpenAI preprint on the weak-disorder Anderson model on $\mathbb Z^{d}$, $d\ge3$." Its Appendix B, which they say was "written on October 7, 2026 ... one day after OpenAI publicly released the preprint", takes a specific displayed equation of the OpenAI paper, its equation (177), as the input and shows that two corollaries of their own 2000 paper give purity directly from it. That is a close reading of one step of the three-dimensional proof by the right people. It is not an endorsement of the rest, and they describe the preprint as "claiming to prove" its theorem. Under Uruk's definitions, named experts working through a proof with no verdict is "under review", and the label applies to the family on the strength of this engagement with the three-dimensional paper. We found no named expert discussing the two-dimensional paper. [11]

An expository article on the family states that it "is not an independent verification of the complete proofs". VibeMathed records no check by an independent mathematician for either theorem. [16][18]

**Machine checking.** The release's only Lean statement for this family concerns the two-dimensional model and does not state either theorem. `PlanarAndersonSpectrum.lean` is 35 lines: it constructs the Anderson operator on $\mathbb Z^{2}$ with uniform potentials, asserts that it is almost surely a bounded self-adjoint operator, and identifies its spectrum as the interval $[-4-h,4+h]$. The release's own scope note says this "does not assert the pure-point spectral type claimed in the accompanying paper". There is no Lean statement for the three-dimensional theorem. The formal proof of the spectrum statement is one file, and it is not listed in the release's catalogue `formalization.yaml`. So for this family, machine checking covers a preliminary fact and neither headline claim. Uruk does not count kernel checks as approval in any case. [3]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; neither paper in this family is among them. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [20]

## Sources

1. OpenAI, "Absolutely Continuous Spectrum for Weak-Disorder Anderson Models in Dimensions at Least Three", 23 September 2026. Theorem 1.1, Corollary 1.2 and its proof, Sections 1.2 and 1.3. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Absolutely-Continuous-Spectrum-for-Weak-Disorder-Anderson-Models-in-Dimensions-at-Least-Three-September-23-2026/paper.pdf
2. OpenAI, "Pure-Point Spectrum for the Two-Dimensional Anderson Model at Every Positive Disorder", 23 September 2026. Theorem 1.1, the context and proof-mechanism sections. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Pure-Point-Spectrum-for-the-Two-Dimensional-Anderson-Model-at-Every-Positive-Disorder-September-23-2026/paper.pdf
3. OpenAI, Lean scope note for family 261 and the comparator statement `PlanarAndersonSpectrum.lean` at the pinned commit. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/261.md and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/PlanarAndersonSpectrum.lean
4. P. W. Anderson, "Absence of diffusion in certain random lattices", Physical Review 109 (1958), 1492-1505. https://doi.org/10.1103/PhysRev.109.1492
5. E. Abrahams, P. W. Anderson, D. C. Licciardello and T. V. Ramakrishnan, "Scaling theory of localization: absence of quantum diffusion in two dimensions", Physical Review Letters 42 (1979), 673-676. https://doi.org/10.1103/PhysRevLett.42.673
6. Barry Simon, "Schrödinger operators in the twenty-first century", in Mathematical Physics 2000, Imperial College Press, 2000, 283-288. Problems 1, 2 and 3.
7. Jürg Fröhlich and Thomas Spencer, "Absence of diffusion in the Anderson tight binding model for large disorder or low energy", Communications in Mathematical Physics 88 (1983), 151-184. https://doi.org/10.1007/BF01209475
8. J. Fröhlich, F. Martinelli, E. Scoppola and T. Spencer, "Constructive proof of localization in the Anderson tight binding model", Communications in Mathematical Physics 101 (1985), 21-46. https://doi.org/10.1007/BF01212355
9. Michael Aizenman and Stanislav Molchanov, "Localization at large disorder and at extreme energies: an elementary derivation", Communications in Mathematical Physics 157 (1993), 245-278. https://doi.org/10.1007/BF02099760
10. Barry Simon and Tom Wolff, "Singular continuous spectrum under rank one perturbations and localization for random Hamiltonians", Communications on Pure and Applied Mathematics 39 (1986), 75-90. https://doi.org/10.1002/cpa.3160390105
11. Vojkan Jaksic and Yoram Last, "Extended States on the Bethe Lattice Revisited", arXiv 2610.11611, 8 October 2026. The abstract and Appendix B. https://arxiv.org/abs/2610.11611
12. Abel Klein, "Extended states in the Anderson model on the Bethe lattice", Advances in Mathematics 133 (1998), 163-184. https://doi.org/10.1006/aima.1997.1688
13. Jian Ding and Charles K. Smart, "Localization near the edge for the Anderson Bernoulli model on the two dimensional lattice", Inventiones Mathematicae 219 (2020), 467-506. https://doi.org/10.1007/s00222-019-00910-4
14. László Erdős, Manfred Salmhofer and Horng-Tzer Yau, "Quantum diffusion for the Anderson model in the scaling limit", Annales Henri Poincaré 8 (2007), 621-685. https://doi.org/10.1007/s00023-006-0318-0
15. Alexander Elgart and Abel Klein, "Eigensystem multiscale analysis for Anderson localization in energy intervals", Journal of Spectral Theory 9 (2019), 711-765. The edge localization used in Corollary 1.2. https://doi.org/10.4171/JST/261
16. Latent seminar, "Anderson models: spectral type, disorder, and dimension", explanatory article on family 261, read 17 October 2026. https://lowrank.github.io/latent-seminar/OpenAI-Math/261-anderson-localization-delocalization
17. Vojkan Jaksic, Yoram Last and Simone Warzel, "A Note on Extended States on the Bethe Lattice", arXiv 2609.06987, 7 September 2026. https://arxiv.org/abs/2609.06987
18. VibeMathed, "Simon's Problem 1" and "Simon's Problem 2" entries, read 17 October 2026. https://vibemathed.com/problem/anderson-extended-states-simon-problem-1 and https://vibemathed.com/problem/anderson-localization-2d-simon-problem-2
19. Wikipedia, "Anderson localization", read 17 October 2026. The physical picture, the scaling theory and the experiments with light and cold atoms. https://en.wikipedia.org/wiki/Anderson_localization
20. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
