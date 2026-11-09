---
family: "223"
topic: "Scaling limits of random-cluster interfaces"
title: "Do the boundaries of random clusters on a grid become the same curves at every scale?"
paperTitle: "Square-lattice FK interfaces and nested loops for 1 ≤ q < 4"
claim: "For every fixed cluster weight 1 ≤ q ≤ 4, the Dobrushin interface of the critical square-lattice random-cluster model converges to chordal SLE_κ with κ = 4π/arccos(−√q/2), in every bounded Jordan domain under uniform marked boundary approximation, and the complete nested collection of loops converges to whole-plane CLE_κ retaining multiplicities and traversals; at q = 1 this gives Cardy's formula for square-lattice bond percolation with free boundary edges. Companions treat 0 < q < 1, the natural parametrization, weakly disordered FK-Ising and massive FK-Ising interfaces."
status: unreviewed
checked: 2026-10-20
papers:
  - preprints/Square-lattice-FK-interfaces-and-nested-loops-for-1-leq-q-lt-4-September-23-2026/paper.pdf
  - preprints/Conformal-Limits-of-Critical-Square-Lattice-Random-Cluster-Interfaces-October-5-2026/paper.pdf
draft: false
---

Open each edge of a square grid at random, and weight the result by $q$ to the power of the number of clusters it creates. For $q=1$ this is ordinary percolation; for $q=2$ it is the Ising model of magnetism in disguise; for integer $q$ it is the $q$-state Potts model. This is the random-cluster model of Fortuin and Kasteleyn, and at its critical point the boundaries between clusters are fractal curves that, physicists predicted, look the same at every scale and in every shape of domain: conformally invariant. In 2000 Oded Schramm found what those limiting curves must be, a one-parameter family now called SLE$_\kappa$, and Rohde and Schramm predicted the parameter for each $q$. Proving it is another matter. Smirnov did it in 2001 for percolation on the triangular lattice, in work that brought him a Fields Medal, and in 2010 for the Ising case $q=2$; both proofs rest on a discrete holomorphic observable that exists only for those two models. For every other $q$, and for percolation on the square lattice rather than the triangular one, the convergence stayed open, and it is one of the central problems of two-dimensional probability. Between 23 September and 5 October 2026 OpenAI posted six papers, roughly 62,000 lines of source, claiming the convergence for every cluster weight from $0$ to $4$, the full ensemble of nested loops, and Cardy's crossing formula for square-lattice percolation. [1][2][3][4]

As of 20 October 2026 no mathematician has said publicly that they have read or checked the proofs. The status on this page is "unreviewed".

## The problem

Fix $q\ge1$ and let $p_q=\sqrt q/(1+\sqrt q)$, the self-dual point that Beffara and Duminil-Copin proved critical. On a finite piece $G=(V,E)$ of $\mathbb Z^{2}$ with boundary conditions $\xi$, the random-cluster law gives a set $A$ of open edges probability proportional to $p^{|A|}(1-p)^{|E\setminus A|}q^{k_\xi(A)}$, where $k_\xi(A)$ counts clusters. With Dobrushin boundary conditions, wired on one boundary arc and free on the other, there is a unique interface from one marked boundary point to the other separating the wired cluster from the dual cluster. The conjectured limit as the mesh goes to zero is chordal SLE$_{\kappa(q)}$ with

$$
\kappa(q)=\frac{4\pi}{\arccos(-\sqrt q/2)},
$$

so that $\kappa(1)=6$, $\kappa(2)=16/3$ and $\kappa(4)=4$. [1]

**The conjecture (Rohde and Schramm, after Schramm 2000).** For every $q\in(0,4]$ the critical random-cluster interface converges to SLE$_{\kappa(q)}$, and the collection of all cluster boundaries converges to the conformal loop ensemble CLE$_{\kappa(q)}$. [1]

<!-- uruk:visual-note
A visual for this page is the model itself: critical random-cluster configurations sampled at $q=1$, $2$ and $3$, with the interface traced in colour and the nested loops shaded; the same picture in a disc and a rectangle to show conformal invariance; and the curve $\kappa(q)$ from $8$ down to $4$. The six papers contain thirty-six TikZ figures of domains, boundary changes and transfer diagrams.
-->

## Why it stayed open

What was known. Smirnov's 2001 proof of Cardy's formula and SLE$_6$ convergence is for site percolation on the triangular lattice, where a colour-switching symmetry gives the needed observable; Camia and Newman built the full loop limit. For $q=2$, Smirnov's fermionic observable, Chelkak and Smirnov's isoradial analysis, and Chelkak, Duminil-Copin, Hongler, Kemppainen and Smirnov's 2014 paper gave convergence to SLE$_{16/3}$, with Kemppainen and Smirnov adding the loops. For general $q$ in $[1,4]$, Duminil-Copin, Kozlowski, Krachun, Manolescu and Oulamara proved asymptotic rotational invariance in 2026, without identifying the limit. Two earlier preprints claimed square-lattice percolation under extra conditions; the paper describes them as narrower. [1]

Why it was hard. Smirnov's parafermionic observable satisfies, for every $q$, local identities that mimic the Cauchy-Riemann equations, but, as Riva and Cardy stressed, local winding identities are not continuum holomorphicity, which needs regularity; for $q\ne2$ there are only half the equations. Closing that gap is what blocked the programme for fifteen years. [1]

## What OpenAI claims

**Theorem** (interfaces and loops; OpenAI, 23 September 2026). For every fixed $1\le q<4$, critical square-lattice random-cluster Dobrushin interfaces converge as ordered curves to chordal SLE$_{\kappa(q)}$ in every bounded Jordan domain under uniform marked boundary approximation, and the complete nested plane loop collections converge to whole-plane CLE$_{\kappa(q)}$ in a topology retaining multiplicities and traversals. At $q=1$ this gives Cardy's formula for square-lattice bond percolation with free boundary edges. [1]

**Theorem** (the endpoint; 5 October 2026). The same holds for every $1\le q\le4$, including $q=4$ with $\kappa=4$. [2]

**Companions.** For $0<q<1$ the interface converges to SLE$_\kappa$ with $\kappa\in(6,8)$; the rescaled number of steps of the interface converges, jointly with the curve, to the Minkowski-content measure of its SLE limit, for $1\le q<4$; FK-Ising interfaces with sufficiently weak independent two-valued bond disorder converge to SLE$_{16/3}$; and off-critical FK-Ising interfaces on isoradial lattices converge, for every fixed nonzero mass, to a massive SLE$_{16/3}$. [3][4]

What these do and do not say. The theorems are for the nearest-neighbour square lattice in its ordinary embedding with the original random-cluster law. The paper distinguishes four different conclusions, convergence of driving functions, of ordered curves, of loop sets, and of loop collections with multiplicity, and claims the strongest. Nothing is claimed for $q>4$, where the transition is discontinuous and the picture is different. [1][2]

## How the claimed proof goes

What follows is a map of the main paper's argument from its introduction, which contains a section-by-section account of the proof structure. It is not a check of the details. The paper has sixteen sections. [1]

**The statement.** Theorem 1.1, for every fixed real $1\le q<4$: (i) in every bounded Jordan domain with two marked boundary points, under Dobrushin boundary conditions, the interface converges in law to chordal $\mathrm{SLE}_{\kappa(q)}$ along every mesh sequence; (ii) under the free infinite-volume law, the full collection of interface loops converges to the nested whole-plane $\mathrm{CLE}_{\kappa(q)}$ in a spherical collection topology, with a Möbius-invariant limit. Here $\sqrt q=2\cos\lambda$ with $0<\lambda\le\pi/3$, and $\kappa(q)=4\pi/\arccos(-\sqrt q/2)$ decreases from $6$ at $q=1$ toward $4$ as $q\to4$. No uniformity in $q$ is asserted, and $q=4$ is outside the paper's scope because the strict angular and six-arm estimates are used only at fixed $q<4$. Theorem 1.2 states Cardy's formula for square-lattice bond percolation, the case $q=1$ with all edges, boundary included, sampled freely. [1]

**Step 1: positive comparisons (Sections 2 and 3).** Section 2 identifies a capped tile law exactly with the random-cluster law and proves the collar and passage-count comparisons used later, keeping actual components distinct from boundary partition blocks; bulk box-crossing at $q\le4$ and the stronger up-to-boundary crossing estimates at $q<4$ have different roles. Section 3 derives the local exponent inequalities that control corner, tip and source factors (Proposition 3.2, three logarithmic comparisons). All complex currents are estimated afterwards inside these positive laws. The probabilistic inputs are the FKG inequality, the self-dual critical point of Beffara and Duminil-Copin, the continuity and crossing estimates of Duminil-Copin, Sidoravicius and Tassion, the isoradial crossing estimates of Duminil-Copin, Li and Manolescu, and the rough-quad and six-arm estimates of Duminil-Copin, Manolescu and Tassion, each with its parameter range stated. [1]

**Step 2: the four-change observable and holomorphicity (Sections 4 to 9).** The target is an alternating-boundary connection probability: four marked points cut the boundary into arcs $A,B,C,D$, alternately coloured, and one asks for an actual path of the first colour from $A$ to $C$. Section 6 defines an auxiliary finite law with four unmatched medial ends and no extra pairing weights, the "four-change observable", extending Smirnov's parafermionic observable and Chelkak-Smirnov's four-change construction for $q=2$ to all $1\le q<4$; it computes the limiting probability $f(\chi)$ when the marks sit at $0,\chi,1,\infty$, and completing two arcs by deterministic wires gives $f/(f+d(1-f))$ with $d=\sqrt q$. The observable is a discrete complex field depending on an interior probe whose boundary values can be computed exactly; the main analytic task, in the paper's words, is to close the regularity gap between the local winding identities and continuum holomorphicity. Sections 4 and 5 supply an angular decay estimate from finite row and path calculations (Theorem 4.1, angular transfer, and Proposition 5.3, extraction in a clear slab). It is applied to two copies of the field on opposite sides of a wall, one probed inside and one outside; repeated reflections keep the external states in their norms, the logarithmic estimates pay the costs, and the mixed difference estimate tends to zero after division by the mesh squared (Proposition 9.2, mixed derivative saving). Closing finitely many wall gaps (Proposition 8.1) and separating the distant exterior copy yields $\bar\partial h\,\partial_jJ=0$ in distributions for any subsequential limit $h$ and the limiting exterior field $J$; since the prescribed boundary values make $J$ nonconstant, a suitable exterior test forces $\bar\partial h=0$ (Theorem 9.3, holomorphic disk limit; Proposition 6.5 identifies the limit). The boundary-value calculation then identifies the connection probability. [1]

**Step 3: from polygons to Jordan domains (Section 10).** The calculation is first made in rational orthogonal polygons with specified corner parities. Proposition 10.1 extends it to arbitrary uniform marked Jordan approximations by drawing easier and harder comparison quads on the same lattice and sandwiching the crossing probability between their limits using monotonicity and a deterministic comparison of actual paths. This step also proves the $q=1$ Cardy statement. [1]

**Step 4: moving domains and the driver (Sections 11 and 12).** The fixed-shape formula must remain useful after a random exploration. Section 11 proves this transfer (Theorem 11.3, the moving four-change test) using a finite chart approximation and an averaged six-arm estimate under the original law, without needing a uniform six-arm theorem in every explored domain. Section 12 normalizes a shrinking test into a bounded martingale and transfers it to the true Dobrushin law; two tests identify the Loewner driving function and its quadratic variation (Proposition 12.2, driving convergence), and tightness with a separate traversal argument gives the uniform-curve conclusion (Theorem 12.9, Dobrushin convergence for $1\le q<4$). [1]

**Step 5: all the loops (Sections 13 to 15).** Sections 13 and 14 construct a target tree by peeling along uniform monochromatic walls, establishing the reflected angular dynamics, excluding forcepoint variation supported on endpoint times, and identifying independent continuation noises after separation (Proposition 13.4, tests away from coincidence; Propositions 14.3 and 14.4, the endpoint convention and the joint target tree). The resulting branching-SLE description is matched to the discrete loops in Section 15: winding information determines loop labels, further estimates determine full traversal order, and an escape bound upgrades convergence in bounded windows to the spherical topology for every nesting generation (Theorem 15.8, nested full-plane convergence for $q<4$). The continuum loop laws come from branching SLE and imaginary geometry, with the nonsimple regime $\kappa>4$ supplied by Miller, Watson and Wilson and by Gwynne, Miller and Qian. Section 16 derives square-lattice bond exponents. [1]

**Conventions.** Every theorem is for fixed $q$; constants may depend on $q$, on macroscopic shapes and separations, and on a fixed finite set of tests; auxiliary parameters are removed in a stated order; and a claim uniform over random exploration histories is made only where the corresponding comparison has been proved. [1]

Where would an expert look first? At the reflection argument of Sections 7 to 9 that turns the angular estimate into $\bar\partial h=0$ away from $q=2$, which the paper identifies as the crux; at the moving four-change test of Section 11, where the formula must survive exploration; at the loop-ensemble identification with multiplicities in Section 15; at the $q=4$ endpoint in the October paper; and at the $q<1$ paper, where the FKG inequality is not available. [1][2][3]

## Consequences inside mathematics

If the proofs hold, the conformal invariance of the critical random-cluster model is a theorem for every cluster weight up to four, including the Potts models $q=3$ and $q=4$ and square-lattice percolation; Cardy's formula holds on the square lattice; the SLE and CLE descriptions predicted by Rohde, Schramm, Sheffield and Werner are confirmed in the models they were designed for; and the natural parametrization gives the scaling limit of the interface's length. It would be the largest single advance in two-dimensional critical phenomena since Smirnov. [1][2][3]

## Uses outside mathematics

No known direct application.

The $q$-state Potts models describe magnets, adsorbed gases and the statistics of polymers, and conformal field theory, which these theorems make rigorous for the random-cluster family, is the physicists' standard tool for two-dimensional critical points; the theorems confirm the tool rather than add to it. [1]

## Has anyone checked it?

We found no named mathematician who says they are reading or checking these papers, and no public comment from Duminil-Copin, Smirnov, Chelkak, Manolescu, Kemppainen, Werner or Sheffield, whose work they build on. Duminil-Copin told the French Mathematical Society on 8 October that sixteen results in the release answered questions he had worked on, without naming them. We found no VibeMathed entry for this family. [5]

**Machine checking.** None. Family 223 has no Lean scope note and no comparator statement in the release. [6]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; none of the six papers in this family is among them. Four of the six are dated 5 October, the day before the release. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [7]

## Sources

1. OpenAI, "Square-lattice FK interfaces and nested loops for 1 ≤ q < 4", 23 September 2026. The theorem, the history, the four-change observable and the inputs. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Square-lattice-FK-interfaces-and-nested-loops-for-1-leq-q-lt-4-September-23-2026/paper.pdf
2. OpenAI, "Conformal limits of critical square-lattice random-cluster interfaces", 5 October 2026, abstract and introduction. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Conformal-Limits-of-Critical-Square-Lattice-Random-Cluster-Interfaces-October-5-2026/paper.pdf
3. OpenAI, "Self-dual random-cluster interfaces below one", 23 September 2026, and "Natural occupation measures for critical square-lattice FK interfaces", 5 October 2026, abstracts. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Self-dual-random-cluster-interfaces-below-one-September-23-2026/paper.pdf and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Natural-Occupation-Measures-for-Critical-Square-Lattice-FK-Interfaces-October-5-2026/natural-occupation-measures-critical-square-lattice-fk-interfaces.pdf
4. OpenAI, "Quenched SLE universality for weakly disordered FK-Ising interfaces" and "Thermal FK-Ising interfaces and massive SLE", 5 October 2026, abstracts. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Quenched-SLE-Universality-for-Weakly-Disordered-FK-Ising-Interfaces-October-5-2026/quenched-fk-ising.pdf and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Thermal-FK-Ising-interfaces-and-massive-SLE-October-5-2026/paper.pdf
5. Jacob Koshy, "As inscrutable AI proofs emerge, mathematicians wait in the dark", The Hindu, 16 October 2026. Duminil-Copin's remarks to the French Mathematical Society on 8 October. https://www.thehindu.com/sci-tech/science/openai-as-inscrutable-ai-proofs-emerge-mathematicians-wait-in-the-dark/article71587373.ece
6. OpenAI, `lean/docs/` and `lean/formalization.yaml` at the pinned commit, which contain no entry for family 223. https://github.com/openai/math/tree/4eaee87548250b2682affda7d05d947c05554bae/lean/docs
7. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
