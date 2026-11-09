---
family: "224"
topic: "Planar Voronoi percolation"
title: "Does a random mosaic cross a shape with the same probability as a perfect grid?"
paperTitle: "Cardy's formula for critical Poisson-Voronoi percolation"
claim: "For critical Poisson-Voronoi percolation in the plane, with cells coloured black or white with probability 1/2, the annealed probability that black cells connect two opposite arcs of any bounded Jordan domain converges, as the point intensity grows, to Cardy's formula F(x) evaluated at the conformal cross-ratio of the four marked boundary points. Companion papers derive the pivotal-cell amplitude ε^(−3/4) and show that the quenched near-critical crossing thresholds have the same universal joint law as on the triangular lattice."
status: unreviewed
checked: 2026-10-20
papers:
  - preprints/Cardys-formula-for-critical-Poisson-Voronoi-percolation-September-23-2026/paper.pdf
  - preprints/From-critical-crossings-to-quenched-near-critical-universality-in-Voronoi-percolation-October-5-2026/critical-crossings-quenched-near-critical-universality-voronoi-percolation.pdf
draft: false
---

Throw points at random onto the plane and give each one the region of the plane closer to it than to any other point. The result is a Voronoi tessellation, the random mosaic that models cell walls, grains in a metal and the territories of animals. Now colour each cell black or white by a fair coin. Bollobás and Riordan proved in 2006 that one half is exactly the critical colour density: at that point black regions are on the edge of spanning the plane. Physicists predicted in the 1990s, and Smirnov proved in 2001 for the triangular lattice, that at criticality the probability that a black path crosses a given shape from one side to another depends only on the conformal geometry of the shape, through Cardy's formula, and not on the microscopic details. The Voronoi mosaic is the test case with no lattice at all: no preferred directions, no symmetry to exploit. Oded Schramm listed its conformal invariance as Problem 2.12 in his 2006 list of open problems; Tassion proved the crossing estimates at every scale in 2016; Vanneuville and others proved quenched concentration results. The limiting formula itself was not known. On 23 September 2026 OpenAI posted a paper claiming Cardy's formula for the Poisson-Voronoi model in every Jordan domain, followed on 5 October by two papers on pivotal cells and near-critical universality. [1][2][3][4]

As of 20 October 2026 no mathematician has said publicly that they have read or checked the proofs. The status on this page is "unreviewed".

## The problem

Let $\eta$ be a Poisson point process of intensity $\varepsilon^{-2}$ in the plane, and for each $v\in\eta$ let $\mathcal V_v$ be its closed Voronoi cell. Colour the sites black or white independently with probability $1/2$, give each cell its site's colour, and let $\mathcal B_\varepsilon$ be the union of the black cells. For a bounded Jordan domain $D$ with four distinct boundary points $a,b,c,d$ in counterclockwise order, let $\mathcal C_\varepsilon(D;a,b,c,d)$ be the event that $\mathcal B_\varepsilon\cap\overline D$ contains a connected set meeting both the arc $ab$ and the arc $cd$. The conformal map of $D$ onto the upper half-plane sending $a,c,d$ to $0,1,\infty$ sends $b$ to a number $x\in(0,1)$, the cross-ratio. [1]

**Cardy's prediction (1992), Schramm's Problem 2.12 (2006).** As $\varepsilon\to0$, the crossing probability converges to

$$
F(x)=\frac{\int_0^{x}[u(1-u)]^{-2/3}\,du}{\int_0^{1}[u(1-u)]^{-2/3}\,du},
$$

the same function as for every other critical planar percolation model. [1]

<!-- uruk:visual-note
A visual for this page is the mosaic: Poisson points, their Voronoi cells, a fair colouring, and a black crossing of a square highlighted; then the crossing frequency over many samples plotted against the aspect ratio of a rectangle, on top of Cardy's curve $F(x)$; and the same experiment on the triangular lattice to show the curves agree. The three papers contain thirteen TikZ figures of cells, circuits and rims.
-->

## Why it stayed open

What was known. Smirnov's proof for the triangular lattice uses colour-switching identities that depend on the lattice being made of equilateral triangles. Benjamini and Schramm proved a different kind of conformal invariance for Voronoi percolation at high intensity, with the sampling measure fixed. Bollobás and Riordan found the critical point, Tassion the box-crossing estimates, Ahlberg, Griffiths, Morris and Tassion and later Vanneuville the quenched concentration and arm estimates, which say that the crossing probability is nearly deterministic given the mosaic; none of this identified the limit. Beffara had shown how to separate the colour-switching identity from the geometric defect of a non-equilateral embedding for periodic triangulations; the Poisson-Delaunay triangulation is random and irregular. [1]

## What OpenAI claims

**Theorem** (annealed Voronoi crossing law; OpenAI, 23 September 2026). For every bounded Jordan domain $D$ and every four distinct counterclockwise boundary marks $a,b,c,d$,

$$
\lim_{\varepsilon\downarrow0}\mathbb P\bigl(\mathcal C_\varepsilon(D;a,b,c,d)\bigr)=F(x).
$$

[1]

**Companions.** Taking this theorem as input, the expected number of colour-pivotal cells for a unit-square crossing is asymptotic to a positive constant times $\varepsilon^{-3/4}$; and under the monotone coupling in which the colour density is raised continuously, the near-critical crossing thresholds of all rational polygonal quadrilaterals, conditional on the tessellation, converge in probability to the same joint law as on the triangular lattice, each model normalized by its own mean pivotal count. [2][4]

What these do and do not say. The main theorem is annealed: the probability averages over both the random mosaic and the colours. It does not assert convergence of the interface to SLE$_6$, nor of the full loop ensemble, nor a quenched crossing limit for arbitrary Jordan domains; for rectangles the known concentration gives a quenched $L^{2}$ limit as a corollary. The Jordan hypothesis is the only regularity assumed on the boundary. The square-lattice Cardy theorem of family 223 is "not used in our proof". [1]

## How the claimed proof goes

What follows is a map of the main paper's argument from its introduction, which lays out the route from circuit identities to the crossing law, with the main statements of Sections 2 to 9. It is not a check of the details. [1]

**The idea.** Smirnov's proof of Cardy's formula on the triangular lattice rests on exact local identities that hold because every face is an equilateral triangle. Poisson-Voronoi percolation lives on the Delaunay triangulation of a random point set, whose triangles are random and irregular, so those identities fail. The paper's strategy is to measure the defect from equilateral geometry triangle by triangle, prove an exact identity for it on closed cluster boundaries, "open" that identity so it holds along the open boundary arcs that a crossing event involves, and show that what remains in the limit is a Cauchy-Riemann equation whose unique solution is the conformal map to an equilateral triangle, Carleson's form of Cardy's formula. Beffara had separated a colour-switching identity from a geometric defect for periodic triangulations; here the geometry is random, and the relation is recovered by transport along random boundaries. The probabilistic estimates of Bollobás-Riordan, Tassion and Vanneuville, stated at the exact hypotheses used (Proposition 3.1, established input), control crossings and exceptional geometry; identifying the limit is the new work. [1]

**Circuits, components and rims (Section 2).** Join the sites of neighbouring cells to form the triangular graph and take its dual. Dual edges separating opposite colours form the cluster-boundary circuits $L$. For each circuit, delete all its points and retain every connected component $C$ of the remaining dual graph, labelled by the pair $(L,C)$; an unused edge with both endpoints on $L$ leaves an isolated open-edge component. Apart from those, each component has a simple one-colour primal boundary, its rim $P$, oriented with the component on the left. Keeping the full label, isolated edges included, is what makes the exact orthogonality identity hold (Proposition 2.2, finite orthogonality). [1]

**Measuring the defect.** Each Delaunay triangle is the image of a reference equilateral triangle under an orientation-preserving real-affine map, which splits into a complex-linear and an antilinear part, and these split each clockwise side vector into two terms. For a smooth test function $f$, sum the contributions of the side belonging to $P$ in each triangle to its right, weighted by $f$ at the barycentre: the complex-linear terms give $U_P(f)$, the antilinear terms $Q_P(f)$, and $V_P(f)=U_P(f)+Q_P(f)$ is the weighted tangent displacement. So $Q$ records exactly the departure from equilateral geometry. Orthogonality gives a separate exact second-moment identity for each Fourier field when summed over all component labels. The complete tangent sum $V_P(1)$ vanishes on every closed rim, and stationarity of the Poisson process makes the macroscopic closed-rim sums of $Q$ small (Proposition 2.6, closed-sum tail). [1]

**Opening the identity (Sections 4 to 7).** The main task is to pass from closed rims to open arcs: along a common microscopic subsequence, the paper proves

$$
Q_P(f)-aV_P(f)\longrightarrow0
$$

in probability, uniformly over rims extending beyond a fixed collar of the support of $f$, with a scalar $a$ independent of the test and the bulk patch (Theorem 4.1, bulk transport). The mechanism retains the local coloured configurations near the endpoints of an arc in deterministic regions called plugs, joins them by separated two-colour corridors into closed experiments, and uses surrounding circuits and the absence of an alternative monochromatic path to force agreement when the exterior is changed; conditional resampling then produces, for each fixed connector, a function of the two endpoint states whose sum around each fixed cycle is small. Comparing closures and inserting intermediate plugs decomposes this function into an affine displacement, two local endpoint potentials and a controlled remainder (Section 5, Propositions 5.1 and 5.5). Returning to actual rims raises two issues. The local geometry and colours have already selected the arc, so the comparison must keep their conditioning: at each comparison scale, arm estimates provide a finite menu of plug models densely along every relevant rim (Proposition 6.4, density of qualified pins) and a finite family of connecting patterns, and the comparison is made with unnormalized subprobabilities dominated by the original law, with no division by a configuration-dependent fitting probability. And the fields are signed, so a small change in coefficients is not controlled by path length: deterministic spatial refinement, a near-return bound and the orthogonality identity supply that control (Proposition 7.4, transport on a real arc). [1]

**Nondegeneracy and the observable (Sections 8 and 9).** Proposition 8.1 proves $1-2\operatorname{Re}a>0$, so in particular $1-a\ne0$. Complete a finite discrete disk by three exterior marked vertices; a component observable at this closing triangle records which boundary connection occurs, and one of its boundary coefficients is exactly the crossing probability (Proposition 9.2). Orthogonality and the transport relation give the contour cancellation needed for a holomorphic limit (Proposition 9.4, holomorphy); the scalar $a$ never needs to be identified, since once $1-a\ne0$ it disappears from the limiting Cauchy-Riemann equation. The resulting boundary-value problem has the conformal map to an equilateral triangle as its unique solution, which identifies every subsequential crossing limit. A deterministic comparison at fixed buffers in a Schoenflies chart transfers the crossing law to the exact closed-cell event in arbitrary Jordan domains (Proposition 9.6). A corollary gives a quenched Cardy limit for fixed rectangles: the crossing probability given the geometry converges in probability. [1]

**The October companions.** The quenched paper upgrades this to quenched near-critical universality, through chordal exploration and oriented loop convergence (Propositions 3.1 and 3.11), an absolutely convergent expansion in sites (Proposition 5.1), and replacement of a site by a mesoscopic square (Proposition 6.2). The pivotal-amplitude paper derives the four-arm amplitude from Cardy's formula through an annular transmission limit, its spectrum and a fixed-ratio transfer. [2][3]

Where would an expert look first? At the bulk transport theorem and its proof across Sections 4 to 7, where the identity valid on closed circuits is shown to survive on open arcs of a random boundary under the arc's own conditioning; at the nondegeneracy $1-2\operatorname{Re}a>0$ of Section 8; at the role of the isolated-edge components in the orthogonality identity; and at the generality of the Jordan hypothesis in Proposition 9.6. [1]

## Consequences inside mathematics

If the proofs hold, Schramm's Problem 2.12 is settled in its crossing-probability form: conformal invariance of critical percolation does not need a lattice, and Cardy's function is universal across the triangular lattice, the square lattice and the Poisson-Voronoi mosaic. The pivotal amplitude and the quenched threshold universality carry Garban, Pete and Schramm's near-critical theory to a lattice-free model. The interface and loop limits for Voronoi percolation remain open. [1][2][4]

## Uses outside mathematics

No known direct application.

Voronoi tessellations model polycrystalline materials, foams, biological tissues and wireless coverage, and percolation on them is used as a model of conductivity and fracture in such disordered media; the theorem says the critical crossing statistics of such media are universal, which is what applied models already assume. [1]

## Has anyone checked it?

We found no named mathematician who says they are reading or checking these papers, and no public comment from Tassion, Vanneuville, Ahlberg, Bollobás, Riordan, Garban or Pete, whose work they build on. VibeMathed records no check by an independent mathematician. [5]

**Machine checking.** None. Family 224 has no Lean scope note and no comparator statement in the release. [6]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; none of the three papers in this family is among them. Two are dated 5 October, the day before the release. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [7]

## Sources

1. OpenAI, "Cardy's formula for critical Poisson-Voronoi percolation", 23 September 2026. The theorem, the prior work and "From circuit identities to the crossing law". Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Cardys-formula-for-critical-Poisson-Voronoi-percolation-September-23-2026/paper.pdf
2. OpenAI, "From critical crossings to quenched near-critical universality in Voronoi percolation", 5 October 2026. Abstract and introduction. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/From-critical-crossings-to-quenched-near-critical-universality-in-Voronoi-percolation-October-5-2026/critical-crossings-quenched-near-critical-universality-voronoi-percolation.pdf
3. Béla Bollobás and Oliver Riordan, "The critical probability for random Voronoi percolation in the plane is 1/2", Probability Theory and Related Fields 136 (2006), 417-468; and Vincent Tassion, "Crossing probabilities for Voronoi percolation", Annals of Probability 44 (2016), 3385-3398. https://doi.org/10.1007/s00440-005-0490-z and https://doi.org/10.1214/15-AOP1052
4. OpenAI, "A pivotal amplitude for Voronoi percolation from Cardy's formula", 5 October 2026, abstract. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/A-Pivotal-Amplitude-for-Voronoi-Percolation-from-Cardys-Formula-October-5-2026/voronoi-pivotal-amplitude.pdf
5. VibeMathed, "Cardy's formula for Poisson-Voronoi percolation", read 20 October 2026. https://vibemathed.com/problem/cardy-formula-poisson-voronoi-percolation
6. OpenAI, `lean/docs/` and `lean/formalization.yaml` at the pinned commit, which contain no entry for family 224. https://github.com/openai/math/tree/4eaee87548250b2682affda7d05d947c05554bae/lean/docs
7. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
