---
family: "090"
topic: "Universal optimality of the triangular lattice"
title: "Is the honeycomb of points the cheapest way to fill a plane?"
paperTitle: "Universal optimality of the triangular lattice"
claim: "The triangular lattice of covolume one minimizes the lower energy per particle among all locally finite planar configurations of centered-disk density one, for every nonnegative completely monotone function of squared distance, including every Gaussian and every inverse power and including infinite energies. Companion papers prove the planar Cohn-Elkies sharpness conjecture (the two-point Fourier bound attains the circle-packing density π/(2√3)), the Sandier-Serfaty conjecture on the Coulomb renormalized energy, and the Brauchart-Hardin-Saff linear term for logarithmic energy on the sphere."
status: unreviewed
checked: 2026-10-20
papers:
  - preprints/Universal-optimality-of-the-triangular-lattice-September-23-2026/paper.pdf
  - preprints/An-atomic-certificate-for-triangular-lattice-universal-optimality-September-26-2026/paper.pdf
draft: false
visual: cheapest-floor
---

Scatter points across a plane, one per unit of area on average, and make every pair repel with a force that weakens with distance. Which arrangement has the lowest total energy? Everyone's guess is the triangular lattice, the arrangement of cells in a honeycomb or of oranges in a flat tray, and among lattices this was proved long ago: Rankin, Cassels, Ennola and Diananda for inverse powers, Montgomery in 1988 for every Gaussian. But a lattice is a very special arrangement, and nothing prevented some irregular, non-repeating scatter from doing better. In 2007 Henry Cohn and Abhinav Kumar conjectured that the triangular lattice is "universally optimal": the cheapest configuration for every reasonable repulsion at once, in the plane, just as the $E_8$ lattice should be in eight dimensions and the Leech lattice in twenty-four. Cohn, Kumar, Miller, Radchenko and Viazovska proved the eight- and twenty-four-dimensional cases in 2022, building on Viazovska's Fields Medal work on sphere packing. The plane, the easiest to draw, stayed open. On 23 and 26 September 2026 OpenAI posted four papers claiming it, together with three related conjectures: that the Cohn-Elkies bound for circle packing is exact, Sandier and Serfaty's conjecture from the theory of superconductors, and a constant of Brauchart, Hardin and Saff for points on a sphere. [1][2][3][4]

As of 20 October 2026 no mathematician has said publicly that they have read or checked the proofs. The status on this page is "unreviewed".

## The problem

Let $A$ be the triangular lattice scaled so that each point owns one unit of area. A configuration $\mathcal C\subset\mathbb R^{2}$ is any locally finite set of points; it has centered-disk density one if the number $N_R$ of its points within distance $R$ of the origin satisfies $N_R/(\pi R^{2})\to1$. A potential $g:(0,\infty)\to[0,\infty)$ is completely monotone if $(-1)^{j}g^{(j)}\ge0$ for every $j$: nonnegative, decreasing, convex, and so on forever. Gaussians $e^{-\pi\alpha t}$ and inverse powers $t^{-p}$ qualify. The energy per particle of $\mathcal C$ for the interaction $g(|x-y|^{2})$ is

$$
E_g(\mathcal C)=\liminf_{R\to\infty}\frac1{N_R}\sum_{\substack{x,y\in\mathcal C\cap B_R\\x\ne y}}g(|x-y|^{2}),
$$

which may be infinite. [1]

**Cohn and Kumar's conjecture (2007, Conjecture 9.4).** The triangular lattice is universally optimal: for every completely monotone $g$, $E_g(\mathcal C)\ge E_g(A)$ for every configuration $\mathcal C$ of density one. [1][3]

<!-- uruk:visual-note
A visual for this page is a set of points under a repulsive potential relaxing from a random scatter toward the triangular lattice, with the energy per point plotted against time and the lattice value as a floor; the numbers for the Gaussian $e^{-\pi r^{2}}$ at density one, $0.160$ per point for the triangular lattice against $0.180$ for the square and $0.272$ for the honeycomb, make the comparison concrete. The papers ship interpolation certificates and data, from which the auxiliary function $f_\alpha$ can be drawn touching the Gaussian at the lattice radii. [1][2]
-->

## Why it stayed open

Why it was hard. The lattice results compare the triangular lattice only with other lattices, where the energy is a theta function or an Epstein zeta function and classical analysis applies. An arbitrary competitor has no periods, may have points arbitrarily close together, and may have arbitrarily many points in some small disc. Cohn and Kumar's programme asks for an auxiliary function $f$ lying below the potential, with nonnegative Fourier transform, that touches the potential exactly at the lattice distances; then Poisson summation turns the inequality into a proof. Such functions were constructed in dimensions 8 and 24 through Viazovska's modular-form interpolation; the plane has no comparable modular structure, and only restricted competitor classes, such as the honeycomb, products of one-dimensional configurations and small perturbations of the lattice, had been handled. [1]

## What OpenAI claims

**Theorem 1.1** (universal energy minimality; OpenAI, 23 September 2026). For every smooth nonnegative completely monotone $g$ on $(0,\infty)$ and every locally finite planar set $\mathcal C$ of centered-disk density one,

$$
E_g(\mathcal C)\ge\sum_{a\in A\setminus\{0\}}g(|a|^{2})=E_g(A),
$$

in the extended nonnegative reals. This includes every Gaussian and every inverse power $t^{-p}$, $p>0$, including those for which the lattice sum diverges, and imposes no separation or occupancy bound on $\mathcal C$. [1]

**Theorem 1.2** (sharp Gaussian minorants; OpenAI, 26 September 2026). For every $\alpha>0$ there is a real radial Schwartz function $f_\alpha$ with $f_\alpha\le e^{-\pi\alpha|x|^{2}}$, $\widehat f_\alpha\ge0$, equality at every nonzero lattice point, and $\widehat f_\alpha=0$ at every nonzero dual-lattice point. For $\alpha\ge1$ the construction uses two finite $20\times20$ interpolation blocks and an absolutely summable correction. [2]

**Companions.** The two-point Cohn-Elkies Fourier bound attains the optimal circle-packing density $\pi/(2\sqrt3)$, with a certificate whose sign conditions are proved by interval arithmetic; the triangular lattice minimizes the planar Coulomb renormalized energy of Sandier and Serfaty over admissible curl-free fields with a uniform unit background, which with Bétermin and Sandier's formula gives the Brauchart-Hardin-Saff constant for the linear term of the minimal logarithmic energy on the two-sphere; and the main paper also proves triangular minimality for logarithmic and Riesz renormalized energies with $0<s<2$. [1][4]

What these do and do not say. The theorem identifies the minimum value, not every minimizer. It is stated for the lower limit of centered-disk averages, Cohn, Kumar, Miller, Radchenko and Viazovska's formulation. The main paper says explicitly that it does not construct, for each mixed potential, the sharp auxiliary function that Cohn and Kumar's conjecture asks for: "That stronger per-potential quantifier is not claimed here." The energy comparison is claimed; the per-potential certificate is not. [1]

## How the claimed proof goes

What follows is a map of the argument from the two main papers' introductions and section plans. It is not a check of the details or of the shipped certificates. [1][2]

**The statement.** Theorem 1.1 of the main paper: for every smooth completely monotone $g$ on $(0,\infty)$, meaning $(-1)^{r}g^{(r)}\ge0$ for all $r$, and every locally finite planar configuration $\mathcal C$ of centered disk density one, the lower energy $E_g(\mathcal C)$ is at least $\sum_{a\in A\setminus0}g(|a|^{2})=E_g(A)$, where $A$ is the triangular lattice of covolume one. This covers every Gaussian $e^{-\pi\alpha t}$ and every inverse power $t^{-p}$, permits singular potentials and divergent lattice sums, imposes no separation or occupancy bound on $\mathcal C$, and identifies the minimum value rather than all minimizers. The energy and density conventions are those of Cohn, Kumar, Miller, Radchenko and Viazovska's $E_8$ and Leech paper. [1]

**The idea.** Prove the inequality for every Gaussian separately by a sharp Fourier certificate, then assemble a general potential from Gaussians. Section 7 writes each positive shift of a completely monotone function as a positive mixture, $g(\varepsilon+t)=\int_{[0,1]}v^{t}\,d\rho_\varepsilon(v)$ with $\rho_\varepsilon$ of total mass $g(\varepsilon)$, by Bernstein's theorem; for $0<v<1$ the kernel $v^{t}$ is a Gaussian with $\alpha=-\log v/\pi$ and $v=1$ is the constant interaction. The shift keeps the mass finite even when $g$ is singular at zero, Fatou and Tonelli transfer the Gaussian comparisons to the mixture, and the shift is removed only in the lattice sum (Proposition 7.2, positive-mixture transfer). The paper is careful that it mixes the energy inequalities, not the auxiliary functions. [1]

**The Fourier comparison (Section 6).** For the Gaussian $G_\alpha(x)=e^{-\pi\alpha|x|^{2}}$, seek a real radial Schwartz function $f_\alpha$ with

$$
f_\alpha\le G_\alpha,\qquad\widehat f_\alpha\ge0,\qquad f_\alpha(a)=G_\alpha(a)\ (a\in A\setminus0),\qquad\widehat f_\alpha(w)=0\ (w\in A^{*}\setminus0).
$$

The two inequalities give a lower bound for arbitrary competitors, and the contacts at direct and dual lattice points make it exact on $A$: Proposition 6.1, linear programming with centered disk density, proves $E_{e^{-\pi\alpha t}}(\mathcal C)\ge\widehat f_\alpha(0)-f_\alpha(0)$ for every competitor of centered disk density one, comparing the point measure in a disk with area measure in a slightly larger disk with an error that is uniform even when points cluster, while Poisson summation on $A$ gives $\widehat f_\alpha(0)-f_\alpha(0)=\sum_{a\ne0}e^{-\pi\alpha|a|^{2}}$. The competitor need not be periodic. This is the Cohn-Kumar linear programming bound, in the density-only form needed for competitors with no separation. [1]

**Building the certificate (Sections 2 to 5).** Exact contacts and signs between contacts are different requirements, and the construction separates them. Working in a rescaled squared-radius coordinate whose periodic node set contains all triangular-lattice shells, Section 2 encodes the contact set by a sine product with double zeros, multiplies it by summable double-pole and simple-pole terms to get entire functions with independently specified values and slopes at the nodes, represents each such cardinal function by a compactly supported spectral measure, and applies Gaussian damping to obtain radial Schwartz functions whose Fourier transforms are computed by transforming the Gaussian inside the integral (Theorem 2.1, the normalized Gaussian Fourier pair). Combining two cardinal functions with their transformed profiles reduces the simultaneous contacts to coupled linear equations for two summable coefficient lists, with transformed jets that become uniformly small at distant nodes. Section 3 constructs finite reference lists by positive quadrature, keeping the spectral atoms exact, and certifies explicit matrix and polynomial inequalities (Proposition 3.3, finite certificate). Since the bound on the full coupled operator is too large for a direct perturbation argument, Section 4 inverts the finite block and eliminates it, after which the small distant outputs make the remaining tail operator invertible; this solves all the exact interpolation equations and bounds the correction to the reference lists (Proposition 4.1, exact interpolation). Section 5 proves the signs $G_\alpha-f_\alpha\ge0$ and $\widehat f_\alpha\ge0$ at every radius and every parameter: near a node the value and linear term are subtracted, the result divided by the squared distance to the node and approximated by a polynomial, whose Bernstein-basis coefficients bound it on whole intervals, with rectangular bounds covering whole parameter intervals; on the unbounded tail a quadratic lower bound for the sine product puts the positive low-node terms and the small remainder on the same scale. Appendix A supplies the scalar bounds and describes the interval verifier for the exact quadrature arrays; Appendix C gives a separate rational verification whose implication is conditional on its tests passing. Section 6 then covers $\alpha\ge1$ directly and reaches $0<\alpha<1$ by a Fourier-complement construction. [1]

**The atomic certificate.** The companion makes the same construction finite and checkable: for $\alpha\ge1$, two $20\times20$ linear systems fix the values and derivatives at a finite set of lattice radii (Section 4, a finite atomic certificate, with exact evaluation in Appendix A), an absolutely summable infinite correction handles the rest (Proposition 5.1, exact interpolation and approximation), and Proposition 6.4 establishes the global signs. Its Proposition 2.3 isolates the density-only linear programming step. The certificates ship with the papers as data files and checking scripts. [2]

**The other companions.** The packing paper builds a radial Schwartz $f$ with $\widehat f(0)=1$, $f(0)=2/\sqrt3$, $\widehat f\ge0$ and $f\le0$ outside the unit disc, which is exactly the Cohn-Elkies condition for the density $\pi/(2\sqrt3)$ of the hexagonal packing, proving its signs and zeros with interval arithmetic (Proposition 4.3) and a Poisson normalization (Section 5). The Coulomb paper proves triangular minimality for the renormalized Coulomb energy by reducing to square tori (Proposition 2.4), comparing Voronoi sectors against a glued dual potential (Propositions 4.3 and 4.5), calibrating on the triangular cell (Proposition 5.4), and a finite scalar verification (Theorem 7.2). Section 8 of the main paper derives renormalized and jellium consequences. [4]

Where would an expert look first? At Proposition 6.1, the passage from Gaussian inequalities to the lower energy for configurations with no separation, which is where non-lattice competitors with clusters differ from lattices; at the tail-operator inversion of Section 4 and the summable correction, where the infinite interpolation problem is actually solved; at the sign proofs of Section 5, which must hold uniformly in the Gaussian parameter; and at the interval-arithmetic verifications in the companions. [1][2][4]

## Consequences inside mathematics

If the proofs hold, the planar case of Cohn and Kumar's conjecture joins the eight- and twenty-four-dimensional cases, so all three lattices they singled out are universally optimal, with the plane proved by a different, non-modular route. The Cohn-Elkies bound is exact in dimensions 2, 8 and 24, as conjectured. Sandier and Serfaty's conjecture gives the ground state of the two-dimensional Coulomb gas and of vortex lattices in their model, and the Brauchart-Hardin-Saff constant settles the second-order term for the logarithmic energy of points on a sphere, a problem related to Smale's seventh problem. [1][3][4]

## Uses outside mathematics

Vortices in type-II superconductors arrange themselves in a triangular pattern, the Abrikosov lattice, and Sandier and Serfaty's renormalized energy was introduced to explain why; their conjecture, now claimed, is the statement that the triangular lattice minimizes that energy. The result is a justification of an observed pattern, not a new material or a new measurement. [1][4]

## Has anyone checked it?

We found no named mathematician who says they are reading or checking these papers, and no public comment from Cohn, Kumar, Viazovska, Radchenko, Serfaty, Leblé or Bétermin, whose work they build on. VibeMathed lists the family as a candidate with review pending. [5]

**Machine checking.** The release's Lean scope note links four comparator statements, `TriangularEnergy.lean`, `AtomicGaussian.lean`, `TriangularGaussian.lean` and `PlanarPacking.lean`, covering the main theorem, the Gaussian minorants and the packing certificate. None of the four is listed in the catalogue `formalization.yaml` at the pinned commit, so no complete formal proof is presented there despite the catalogue's tag. The papers ship numerical certificates and Python checkers for the interpolation data; we did not run them. A kernel check or a certificate check is evidence about the formal statement, not a reading of the paper; Uruk does not count either as approval. [6]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; none of the four papers in this family is among them. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [7]

## Sources

1. OpenAI, "Universal optimality of the triangular lattice", 23 September 2026. Theorem 1.1, the predecessors, the Gaussian route and the explicit non-claim. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Universal-optimality-of-the-triangular-lattice-September-23-2026/paper.pdf
2. OpenAI, "An atomic certificate for triangular-lattice universal optimality", 26 September 2026. Theorems 1.1 and 1.2 and the certificate construction. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/An-atomic-certificate-for-triangular-lattice-universal-optimality-September-26-2026/paper.pdf
3. Henry Cohn and Abhinav Kumar, "Universally optimal distribution of points on spheres", Journal of the American Mathematical Society 20 (2007), 99-148, Conjecture 9.4. https://doi.org/10.1090/S0894-0347-06-00546-7
4. OpenAI, "A sharp Fourier certificate for planar circle packing" and "Triangular minimality for planar Coulomb renormalized energy", both 23 September 2026, abstracts. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/A-sharp-Fourier-certificate-for-planar-circle-packing-September-23-2026/paper.pdf and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Triangular-minimality-for-planar-Coulomb-renormalized-energy-September-23-2026/paper.pdf
5. VibeMathed, "Universal optimality of the triangular lattice in the plane (Cohn-Kumar)", read 20 October 2026. https://vibemathed.com/problem/triangular-lattice-universal-optimality
6. OpenAI, Lean scope note for family 090 and `lean/formalization.yaml` at the pinned commit, which lists none of its four comparators. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/090.md and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/formalization.yaml
7. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
