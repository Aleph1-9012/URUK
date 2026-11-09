---
family: "237"
topic: "Self-avoiding walks on the honeycomb lattice"
title: "How far does a path that never crosses itself wander?"
paperTitle: "Mass and covering exponents for fixed-length honeycomb walks"
claim: "A uniformly random n-step self-avoiding walk on the honeycomb lattice has diameter between n^(3/4−δ) and n^(3/4+δ) for every large n, except with probability smaller than any fixed power of n; simultaneously, every ball of radius s around a point of the walk contains about min(n, s^(4/3)) of its vertices and the walk needs about 1 + n s^(−4/3) balls of radius s to cover it. This is the diameter form of Nienhuis's predicted exponent 3/4, with mass dimension 4/3."
status: unreviewed
checked: 2026-10-20
papers:
  - preprints/Mass-and-covering-exponents-for-fixed-length-honeycomb-walks-September-26-2026/main.pdf
  - preprints/Cylinder-loop-weights-and-planar-nesting-September-26-2026/main.pdf
draft: false
---

A self-avoiding walk is a path on a grid that never visits the same point twice. It is the simplest model of a polymer chain, a molecule that cannot pass through itself, and it is notoriously hard: nobody knows a formula for the number of such paths of length $n$, let alone their shape. An ordinary random walk of $n$ steps wanders a distance of about $\sqrt n$; a straight line goes $n$. In 1949 the chemist Paul Flory guessed, and in 1982 the physicist Bernard Nienhuis derived from the Coulomb-gas picture of statistical physics, that a planar self-avoiding walk wanders about $n^{3/4}$, and computer enumerations agree to many digits. Rigorously, almost nothing was known. On the honeycomb lattice, where Nienhuis also predicted the growth rate of the number of walks, Duminil-Copin and Smirnov proved that prediction in 2012, $\sqrt{2+\sqrt2}$ per step, in the paper that made the honeycomb the one lattice where exact tools exist; but the best bound on the spread of a typical walk, by Krachun and Panagiotis in 2023, was still only "less than $n$ by a logarithm". On 26 September 2026 OpenAI posted thirteen papers, about 1,067 pages, whose headline claims the exponent $3/4$ for the diameter of the typical honeycomb walk at every large length. [1][2][3][4]

As of 20 October 2026 no mathematician has said publicly that they have read or checked the proofs. An automated referee run by a Stanford group has reported one major issue, with a proposed repair, in one of the thirteen papers that the headline depends on. The status on this page is "unreviewed"; see below.

## The problem

Let $\mathbb H$ be the honeycomb lattice, the planar dual of the equilateral triangular tiling with side one, and fix a vertex $o$. Let $\mathcal W_n$ be the set of self-avoiding walks of $n$ steps from $o$ and $\mathbb P_n$ the uniform law on it. For a walk $\gamma$ write $V(\gamma)$ for its set of vertices, $D(\gamma)$ for its Euclidean diameter, $M_\gamma(z,s)$ for the number of its vertices within distance $s$ of a point $z$, and $\mathcal N_\gamma(s)$ for the least number of balls of radius $s$ needed to cover it. [1]

**Nienhuis's prediction (1982).** A typical $n$-step planar self-avoiding walk has spatial extent $n^{3/4+o(1)}$; equivalently its trace has mass dimension $4/3$, so a region of size $s$ holds about $s^{4/3}$ of its points. [1][3]

<!-- uruk:visual-note
A visual for this page is the walk itself: self-avoiding walks on the honeycomb lattice sampled live, with the diameter against the length on logarithmic axes converging to slope $3/4$, next to an ordinary random walk converging to slope $1/2$; and a ball of radius $s$ sliding along a walk with the count of enclosed vertices against $s^{4/3}$. The thirteen papers contain sixty-one TikZ figures of bridges, strips, cylinders and polygons.
-->

## Why it stayed open

Why it was hard. The exact solvability of the honeycomb lattice comes from Smirnov's parafermionic observable, a discrete holomorphic function that gives identities for weighted sums of walks at the critical weight $\rho=(2+\sqrt2)^{-1/2}$. These identities control sums over walks of all lengths, not the uniform law on walks of one fixed length, and they give masses and mean lengths, not the shape of an individual walk. Passing from "weighted sums of bridges across a strip" to "the diameter of a typical walk of length $n$" was the open gap; Lawler, Schramm and Werner's conjectured scaling limit, $\mathrm{SLE}_{8/3}$, would give the same exponent but is also unproved. [1][2]

## What OpenAI claims

**Theorem 1.1** (fixed-length mass and covering exponents; OpenAI, 26 September 2026). For every $\delta>0$ and $k>0$ there are constants $C_{\delta,k}$ and $n_0(\delta,k)$ such that for every integer $n\ge n_0$, an event of $\mathbb P_n$-probability at least $1-C_{\delta,k}n^{-k}$ has

$$
n^{3/4-\delta}\le D(\gamma)\le n^{3/4+\delta},
$$

$$
n^{-\delta}\min\{n,s^{4/3}\}\le M_\gamma(z,s)\le n^{\delta}\min\{n,s^{4/3}\},\qquad n^{-\delta}(1+ns^{-4/3})\le\mathcal N_\gamma(s)\le n^{\delta}(1+ns^{-4/3}),
$$

the last two simultaneously for every $z\in V(\gamma)$ and every $s\in[1,n]$. [1]

**Corollaries.** The projection of the walk onto each of the three lattice normal directions has span at least $n^{3/4-\delta}$; the covering dimension at polynomially separated scales converges to $4/3$ in probability; the radius of gyration is $n^{3/4+o(1)}$, and $\mathbb E_n[D^{p}]=n^{3p/4+o(1)}$ for every $p>0$. [1]

**Companions.** The twelve other papers prove the exact lattice inputs and related laws: the mass of walks crossing a strip of height $N$ is comparable to $N^{-1/4}$; the nesting exponents on a cylinder and in the plane are $1/6$ and $1/12$; polygons of diameter at most $H$ have squared-length mass at most $H^{2/3+o(1)}$; bridges across a strip of width $R$ have mean length $R^{4/3+o(1)}$; chords across a hexagon or triangle of side $R$ have length $R^{4/3+o(1)}$; and the end-to-end distance of a uniform walk has the $3/4$ lower law on a set of lengths of density one. [2][4]

What these do and do not say. The paper lists its non-claims: no convergence to a continuum curve, no continuum Hausdorff dimension, no universality across lattices, and no fixed-length lower bound on the distance between the two endpoints, since "a lower bound for the diameter does not imply that the two endpoints are far apart"; the endpoint law is proved only on a density-one set of lengths. The exponents come with slack $n^{\pm\delta}$ and no limiting constants. [1][4]

## How the claimed proof goes

What follows is a map of the headline paper's argument from its introduction and its Section 2, which states exactly what it imports from the companions. It is not a check of the details. [1]

**What is claimed, precisely.** Theorem 1.1 of the headline paper: for every $\delta>0$ and $k>0$, for all large $n$, outside an event of probability $O(n^{-k})$ under the uniform law on $n$-step self-avoiding walks, the diameter satisfies $n^{3/4-\delta}\le D(\gamma)\le n^{3/4+\delta}$, the number of visited vertices within distance $s$ of any visited vertex is $n^{\pm\delta}\min\{n,s^{4/3}\}$, and the number of $s$-balls needed to cover the walk is $n^{\pm\delta}(1+ns^{-4/3})$, simultaneously for all $s\in[1,n]$. Corollaries give span at least $n^{3/4-\delta}$ in every lattice normal direction, covering dimension $4/3$ at polynomially separated scales, and radius of gyration $n^{3/4+o(1)}$ with all moments. The paper stresses that $n^{a+o(1)}$ always has a stated probability meaning and never asserts a limiting constant. [1]

**Critical weights first.** The proof works first with the critical activity $\rho=(2+\sqrt2)^{-1/2}$, the reciprocal of the connective constant, giving each path the weight $\rho^{\ell}$, where $\ell$ counts edges for a vertex-rooted walk and visited vertices for a path between ports, the midpoints of edges; a mass is a sum of such weights before normalization, and the convention lets pieces in adjacent open strips concatenate with exactly the product weight. A bridge crosses a strip without visiting either boundary elsewhere, and is irreducible if no intermediate lattice line parallel to the boundaries is crossed exactly once. [1]

**The five imported inputs (Section 2).** The headline paper proves the geometric passage from exact lattice observables to the fixed-length law, and imports the observables from the companions, stating them as Theorems 2.2 to 2.6. Boundary flux and strip mass (Theorem 2.2, from the strip-crossing paper): for every simply connected union $D$ of tiles and boundary port $a$, $\sum_b\sum_{\gamma:a\to b}\rho^{|\gamma|}e^{3iW(\gamma)/8}=1$, where $W$ is the total signed turning, the Smirnov parafermionic observable; and for the $h$-band strip the arch and bridge masses satisfy $cA_h+B_h=1$, $B_h\asymp(1+h)^{-1/4}$, and the mean bridge length $m_h\asymp h^{3/4}$. Length and nesting (Theorem 2.3, from the cylinder-loop paper): the ordered-chord mass through an interior mid-edge is comparable to the nesting mass of polygons around its two adjacent faces, and the whole-plane nesting mass with diameters at most $r$ is $r^{1/12+o(1)}$. Raw strip first-length mass (Theorem 2.4): the length-weighted mass of arches and bridges from a bottom port of the $h$-strip is at most $h^{13/12+o(1)}$. Polygon length-square mass (Theorem 2.5, from the marked-polygon paper): $\sum\rho^{|\ell|}|\ell|^{2}\le H^{2/3+o(1)}$ over polygons of diameter at most $H$ modulo translation. And a uniform one-arc bound (Theorem 2.6) on the critical mass of arcs joining two marked ports on a cylinder, with rhombus parameters $\pi/8$ and $\pi/4$, bounded by a power of the cylinder size. [1][2]

**Obstacle one: localized bridges (Sections 3 to 5).** A bridge used to modify a path must fit in a corridor that avoids the rest of the path, and a strip mass or mean length gives no such guarantee. Section 3 bounds the critical mass of paths confined to a box (Proposition 3.1, full-box susceptibility). Section 4 sews smaller bridges together and recovers the sewing lines from the resulting path, which controls the multiplicity of the sewing; this yields localized first and second moments of bridge length (Proposition 4.7, localized strip second moment, and Proposition 4.10, a localized bridge length lower bound), and by Cauchy-Schwarz a subpower chance of seeing a long bridge, matching the companions' $h^{3/4}$ mean for bridges confined to diameter a fixed multiple of their height. Section 5 amplifies that chance by independent renewal trials and uses an exact conditioning identity to transfer it to a bridge of a specified height (Theorem 5.2, typical finite-bridge length). The elementary renewal process is developed locally; no change-of-ensemble theorem is assumed. [1]

**Obstacle two: controlling every subpath (Sections 6 to 8).** One bridge estimate must control all subpaths of an arbitrary walk. Section 6 runs ordered tests on adjacent renewal paths (Theorem 6.2, ordered probes, allowing one or two "giant" ends), and when two tests meet the same irreducible piece its weight enters once, which the paper says is essential when the number of turns grows with the scale. Section 7 amplifies against fast travel (Theorem 7.4, fast bridges), and Section 8 bounds excess length in a small region and repeated visits to one ball by a separate estimate for many disjoint crossings (Theorem 8.1, uniform local length bound; Propositions 8.6 and 8.7, uniform local mass and temporal modulus). The upshot, for rooted walks of any length confined to diameter a fixed multiple of $H$ and any $\tau>0$: every subwalk $\sigma$ has length at most $H^{\tau}(1+\operatorname{diam}\sigma)^{4/3}$, diameter at most $H^{\tau}(1+|\sigma|)^{3/4}$, and at most $H^{\tau}s^{4/3}$ vertices in any $s$-ball, and the total critical mass of walks violating any of these is at most $C_{\tau,A}H^{-A}$ for every $A$. The paper calls this absolute estimate strong enough to survive summation over all possible subpaths. [1]

**Obstacle three: from critical weight to fixed length (Section 9).** Submultiplicativity and the polynomial strip lower bound give $c_n\rho^{n}\ge1$ for the number $c_n$ of $n$-step walks. Taking $H$ proportional to $n$ and dividing an exceptional critical mass by this fixed-length partition function preserves arbitrary polynomial decay, so the diameter, local mass and covering conclusions all hold on one simultaneous event under the uniform law. An appendix retains an independent asynchronous-renewal proof of adjacent-arm avoidance (Theorem A.3). [1]

**The chain of dependence.** The thirteen papers form a graph: the headline rests on the strip-crossing, nesting, polygon and cylinder papers, which in turn share the parafermionic and transfer-matrix machinery. A reader checking the result must check the chain, and the first flagged issue, described below, lies in one of the inputs. [1][2]

Where would an expert look first? At the sewing and multiplicity control of Section 4, where the modification of a path has to be undone; at the "weight enters once" rule for shared irreducibles in Section 6; at the passage from critical to fixed-length laws in Section 9, in particular the claim that $c_n\rho^{n}\ge1$ suffices; and at the nesting paper's Lemma 3.9, where the automated referee found its issue. [1][2][5]

## Consequences inside mathematics

If the proofs hold, this is the first rigorous $3/4$ law for self-avoiding walk on any planar lattice, forty-four years after Nienhuis's prediction, and the mass dimension $4/3$ matches the dimension of $\mathrm{SLE}_{8/3}$, the conjectured scaling limit; the laws for bridges, chords and polygons settle the corresponding exponents of the two-dimensional $O(0)$ model on the honeycomb. The square lattice, the scaling limit and the constants remain open. [1][3]

## Uses outside mathematics

The self-avoiding walk is the standard model of a linear polymer in a good solvent, and the exponent $3/4$ in two dimensions is Flory's value for how a polymer chain's size scales with its length, confirmed experimentally for polymers adsorbed on surfaces. The theorem proves the model's prediction; it does not change what polymer physicists measure. [3]

## Has anyone checked it?

OSVerify, an automated "one-sided verifier" from Stanford that proposes and validates errors in mathematical papers, reviewed three of the thirteen. In "Cylinder loop weights and planar nesting" it reports one major issue: in the proof of Lemma 3.9, the paper bounds the integral of the second circle kernel by $C/d(s)$, but the exact integral is $4\theta'(s)/\sin\theta(s)$, which does not vanish at $s=0$, so the stated global bound is too strong. OSVerify proposes the corrected bound $C(1+1/d(s))$ and says the existing $L^{2}$ term absorbs the extra contribution, "preserving the upper comparison ... and its use in the subsequent gap and counting argument". The same referee reports one minor issue in each of two other companions: a strict inequality that becomes an equality in the stated range, and wrong proposition numbers in a citation. OSVerify's site says its findings are "further verified by human experts" but does not name them, and it adds that its findings "do not necessarily establish that the paper's main theorem is false". Under Uruk's rules a dispute needs a named expert, so this is recorded here rather than as a change of label. The headline paper depends on the nesting paper. [5]

We found no named mathematician who says they are reading or checking these papers, and no public comment from Duminil-Copin, Smirnov, Lawler, Slade or Panagiotis. VibeMathed lists the family as a partial result, unreviewed. [6]

**Machine checking.** The release's Lean scope note links statements for finiteness of the bridge measures, existence of the free energy, and the $N^{-1/4}$ strip-crossing law, and says these are "supporting summability statements"; the $3/4$ laws "are outside them". On 26 October a fourth statement was added for the prescribed-endpoint companion, bounding the strict bridge mass by $(1+h)^{-1/4}$ from both sides; the scope note says the companion's chord-length law "and the remaining moment and renewal conclusions are outside this supporting comparison". That fourth statement is the only one of the family listed in the catalogue `formalization.yaml` at the pinned commit. A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval. [7]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; none of the thirteen papers in this family is among them. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements, among them one for this family's prescribed-endpoint companion, described above. [8]

## Sources

1. OpenAI, "Mass and covering exponents for fixed-length honeycomb walks", 26 September 2026. Theorem 1.1, the corollaries, the non-claims and "Critical weights and the geometric argument". Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Mass-and-covering-exponents-for-fixed-length-honeycomb-walks-September-26-2026/main.pdf
2. OpenAI, "Cylinder loop weights and planar nesting" and "Critical strip crossing mass on the honeycomb lattice", 26 September 2026, abstracts. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Cylinder-loop-weights-and-planar-nesting-September-26-2026/main.pdf and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Critical-strip-crossing-mass-on-the-honeycomb-lattice-September-26-2026/main.pdf
3. Hugo Duminil-Copin and Stanislav Smirnov, "The connective constant of the honeycomb lattice equals √(2+√2)", Annals of Mathematics 175 (2012), 1653-1665. The introduction gives Nienhuis's predictions and the polymer background. https://doi.org/10.4007/annals.2012.175.3.14
4. OpenAI, "Renewal and changes of law for critical honeycomb walks", 26 September 2026, abstract. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Renewal-and-changes-of-law-for-critical-honeycomb-walks-September-26-2026/main.pdf
5. OSVerify, "Cylinder loop weights and planar nesting", referee report, with the project's results page listing the other two reports, read 20 October 2026. https://osverify.github.io/cases/cylinder-loop-weights-and-planar-nesting.html and https://osverify.github.io/case-studies.html
6. VibeMathed, "Nienhuis's 3/4 exponent for self-avoiding walk on the honeycomb lattice, in diameter form", read 20 October 2026. https://vibemathed.com/problem/honeycomb-saw-three-quarter-exponent-diameter
7. OpenAI, Lean scope note for family 237 and `lean/formalization.yaml` at the pinned commit. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/237.md and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/formalization.yaml
8. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
