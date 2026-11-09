---
family: "354"
topic: "Isoperimetry in the cubic three-torus"
title: "What encloses a given volume with the least surface area in a repeating cube?"
paperTitle: "The Isoperimetric Conjecture for the Cubic Flat Three-Torus"
claim: "In the unit cubic flat three-torus, the least perimeter at volume V is min{(36π)^(1/3)v^(2/3), 2√(πv), 2}, where v = min(V, 1-V). Every minimizer is a ball, a circular tube around a shortest closed geodesic, a coordinate slab, or a complement, with exactly the adjacent types tied at 4π/81 and 1/π."
status: unreviewed
checked: 2026-11-07
papers:
  - preprints/The-Isoperimetric-Conjecture-for-the-Cubic-Flat-Three-Torus-September-24-2026/article.pdf
draft: false
---

In ordinary three-dimensional space, a ball encloses a given volume with the least surface area. Now make the space periodic. Leaving a cube through one face brings you back through the opposite face. A region can wrap around this space, so it has options that an isolated ball does not. The expected sequence is a ball for small volume, a circular tube that wraps around one direction for intermediate volume, and a slab for larger volume. OpenAI's paper dated 24 September 2026 claims that these are all the minimizers, including exactly which shapes tie when one type gives way to another. [1][2][3]

The two transitions occur at volume fractions $4\pi/81$, about $15.5\%$, and $1/\pi$, about $31.8\%$. Earlier work established parts of this sequence and reduced much of the remaining problem to those transitions. The new argument claims to exclude every other minimizer there. A separate 6 October preprint by Bin Deng, Jiahuan Li and Yilu Liu claims the related cube classification and quantitative stability. It does not assess OpenAI's manuscript. Our search on 7 November found no public specialist verification of OpenAI's complete proof, so its human-review label here is "unreviewed". [1][6][12]

## The problem

The space is the unit cubic flat three-torus, written $\mathbb T^3=\mathbb R^3/\mathbb Z^3$. Start with Euclidean space and identify points whose coordinates differ by integers. A unit cube represents the whole space, with opposite faces joined. It has total volume one, no outer boundary, and ordinary Euclidean distances locally. The word "torus" here describes a three-dimensional space, not the two-dimensional surface of a doughnut. [1][3]

Choose a region $E$ of volume $V$. Its perimeter $P(E)$ means boundary area in this three-dimensional problem. The cube's drawn faces contribute no extra area merely because a region crosses them. The isoperimetric profile $I(V)$ is the smallest possible perimeter among all regions of volume $V$. The theorem allows finite-perimeter regions, a measure-theoretic class that includes irregular regions as long as their boundary area, defined through variation of the indicator function, is finite. It does not assume that every competitor starts smooth or resembles one of the proposed answers. [1]

The proposed competitors have elementary area formulas. A ball of radius $r$ has volume $4\pi r^3/3$ and area $4\pi r^2$. Eliminating $r$ gives $(36\pi)^{1/3}V^{2/3}$. A solid circular tube around a shortest closed straight path has length one. Because it wraps around the space, it has no end caps: its volume is $\pi r^2$ and its boundary area is $2\pi r=2\sqrt{\pi V}$. A slab of width $V$ has two flat boundary surfaces, each of area one, so its perimeter is $2$. [1]

Here a shortest closed geodesic means a straight path that returns to its starting point after one unit of travel. In the cubic torus it runs along a coordinate direction. Longer slanted closed paths are possible, but at fixed enclosed volume their circular tubes cost more area. The same issue occurs for slanted planar boundaries. Choosing only coordinate tubes and slabs is part of the claimed classification. [1]

A region and its complement have the same boundary. Thus the minimum for volume $V$ equals the minimum for volume $1-V$, and it is enough to understand $0<V\le1/2$. Above half volume, the answer describes the empty part instead. A ball-shaped hole, for example, is the complement of a small ball. [1]

Calculating where the three proposed area formulas cross is straightforward. Proving that their lower envelope is the true answer is the difficult part. A region can have handles, tunnels and several connected pieces. Comparing the familiar candidates does not rule those out. [1][2]

## Why it stayed open

The ball, tube and slab prediction appears explicitly in Laurent Hauswirth, Joaquín Pérez, Pascal Romon and Antonio Ros's *The periodic isoperimetric problem*, published in 2004, and in Ros's subsequent survey. It belongs to a wider programme of isoperimetric problems in flat spaces. The cubic case asks for the best region without imposing an extra symmetry group in advance; results for specially symmetric surfaces or for spaces periodic in only one or two directions do not settle it. [2][3]

Several parts were already known. Hadwiger proved the half-volume coordinate-cut result for the cube in 1972; Barthe and Maurey recovered it by a comparison with Gaussian measure in 2000. Through reflection, this corresponds to the half-volume slab in the periodic setting. Morgan and Johnson's 2000 small-volume theorem gives balls for sufficiently small volumes in a compact flat manifold. Acerbi, Fusco and Morini proved in 2013 that slabs are the only minimizers sufficiently close to half volume in the cubic three-torus. These results did not reach the proposed transition fractions with explicit bounds. [4][5][7]

Emanuel Milman's work, first posted in 2024 and published in 2026, gave effective ranges. For the cubic case, it established the spherical prediction up to volume fraction $0.120582$, still short of $4\pi/81\approx0.155140$. His more extensive spherical result for boxes with one side at most $0.919431$ times the others does not apply to the cube, whose side ratios are all one. The same work explains a two-transition reduction based on the differential comparison method of Hauswirth and collaborators. Knowing the proposed profile values there controls the smooth branches between them; excluding additional minimizers exactly at the transitions requires more. [6]

The obstruction is geometric. Earlier structure theorems restrict a nonstandard minimizing boundary to a connected surface with several handles, but do not eliminate it. Slicing such a region into planar sections gives lower bounds on each slice's perimeter. Those bounds can be too generous: the optimal planar regions at different areas may not fit inside one another as the slices of a single region must. The new paper turns this nesting constraint into a quantitative extra-area estimate at the tube-to-slab transition. [1]

## What OpenAI claims

**Theorem 1.1.** For $V\in(0,1)$, put $v=\min(V,1-V)$. Among all finite-perimeter subsets of $\mathbb R^3/\mathbb Z^3$ with volume $V$, the claimed minimum perimeter is

$$
I(V)=\min\left\{(36\pi)^{1/3}v^{2/3},\;2\sqrt{\pi v},\;2\right\}.
$$

For volumes up to one half, the claimed complete list is as follows. [1]

| Volume | Minimizing region |
|---|---|
| $0<V\le4\pi/81$ | A ball of radius $(3V/(4\pi))^{1/3}$. |
| $4\pi/81\le V\le1/\pi$ | A solid circular tube of radius $\sqrt{V/\pi}$ around a shortest closed geodesic. |
| $1/\pi\le V\le1/2$ | A slab of width $V$ between coordinate tori. |

Both adjacent types minimize at each shared endpoint. The paper claims there are no additional equality cases. For $V>1/2$, take complements of the corresponding smaller-volume regions. Classification is up to an ambient isometry, a distance-preserving transformation of the torus, and changes on sets of volume zero. These qualifications allow translations and coordinate symmetries without treating the translated region as a different geometric answer. [1]

At the first transition the ball has radius $1/3$, while the competing tube has radius $2/9$. They have equal volume and area, not equal radius. Their common perimeter is $4\pi/9$. At the second transition the tube radius is $1/\pi$ and its perimeter is $2$, matching a slab. These values follow by substitution into the candidate formulas. All the balls and tubes used in their claimed ranges fit without intersecting themselves. [1]

This is an exact classification for the cubic flat torus and its perimeter functional. It does not establish the corresponding answer for arbitrary rectangular boxes, other translation lattices, or higher dimensions. Nor does it classify every stationary surface: a surface can resist small changes and still fail to be the global minimum. [1][6]

## How the claimed proof goes

The proof excludes all nonstandard minimizers at the two transition volumes, then uses a comparison argument to obtain every volume and every equality case. The map below follows the full pinned TeX, including the two appendices. It is an explanation of the submitted argument, not an independent verification of the theorem. [1]

**1. Fix the scale and use the known structure of minimizers.** The proof doubles lengths and works on $\mathbb R^3/(2\mathbb Z^3)$. It divides both physical volume and physical boundary area by eight. The normalized volume is still $V$, but the normalized area $A$ is half the original unit-torus perimeter. Thus a coordinate slab has $A=1$. The variable $h$ denotes the sum of the two principal curvatures, the surface's two principal bending rates, in this doubled metric. [1]

Existence and regularity give a minimizing region at every volume, with a smooth embedded boundary of constant mean curvature. Stability means that a volume-preserving perturbation cannot decrease area to second order. The classical results collected in Theorem 2.1 say that the boundary is either a union of parallel planar surfaces or connected. Connected boundaries of genus zero or one, meaning zero or one handle, have the standard geometry. A nonstandard minimizer must have genus at least two and at most four, and it satisfies $h^2A\le\pi$. Lemma 2.2 separately checks the standard candidates and their equality cases, including why longer tubes and slanted slabs do not tie. [1]

**2. Reduce the problem to classifying the two transitions.** Let $J(V)$ be the profile in the proof's normalized area, and let $F(V)$ be the lower envelope of the standard competitors, half the formula in the theorem. The candidates show $J\le F$. Lemma 2.3 varies a minimizing surface by moving it a small distance along its normals. The areas of these nearby competitors give a smooth local function $C$ above $J$, touching it at the chosen volume. At contact, for a connected boundary of genus $g$,

$$
C'=h,\qquad C^2C''=-h^2C+\pi(1-g).
$$

The second identity comes from the variation formulas and Gauss-Bonnet, which relates total curvature to topology. If $J-F$ dipped below zero inside a smooth candidate branch, its negative minimum would force incompatible curvature inequalities for $C$ and $F$ when $g\ge2$. The same comparison excludes a nonstandard region tying the known profile inside a branch. Proposition 2.4 therefore reduces the full theorem to showing that every minimizer at $4\pi/81$ and $1/\pi$ is standard. Merely showing the correct area at the endpoints would leave the extra equality cases unresolved. [1]

**3. Prove symmetry of the original region.** Lemma 3.1 cuts the torus into two halves containing equal occupied volume and reflects each half. The two reflected regions are competitors of the same volume. Their average perimeter is the original minimum, so both minimize too. There is no extra perimeter along a reflecting seam because the occupied traces match. [1]

A reflected competitor shares an open boundary patch with the original. The relevant boundaries are connected and real analytic, meaning they are locally described by convergent power series. The paper uses analytic continuation to propagate the shared patch across the whole boundary, then checks that the occupied sides agree as well. The original minimizer is consequently reflection invariant after translating the coordinate origins. This step matters for the equality claim: producing one symmetric minimizer would not classify all the others. [1]

**4. Restrict the geometry to two corner patterns.** Inside the reflected cube $[0,1]^3$, Lemma 3.2 uses stability to give each coordinate component of the outward normal a fixed sign. These normal components satisfy a linear equation obtained by differentiating translations of the surface. If one changed sign too often, suitable pieces would combine into a volume-preserving zero-energy variation vanishing on an open patch, contradicting analytic continuation. [1]

After orienting the axes, the region is a down-set: moving any coordinate toward the occupied origin keeps a point in the region. This is a monotonicity property, not an assumption of convexity. Proposition 3.3 reduces a nonstandard region to two possible occupied-vertex patterns: the origin and two neighbouring vertices, or the origin and all three neighbouring vertices. The other patterns force sphere or tube topology, or a disconnected boundary already excluded by the structure theorem. [1]

**5. Use slice identities to remove the easier configurations.** Write $w(z)$ for the area of the horizontal slice and $p(z)$ for the length of its separating curve; the square's outer edges do not count. Higher slices lie inside lower ones. Lemma 4.1 proves that $w$ is absolutely continuous and has only finitely many exceptional heights. This permits an integral over height to be rewritten as an integral over slice area without losing contributions at the exceptional levels. [1]

First variation and the coarea formula, which integrates a surface through its slices, tie these lengths to the surface's constant curvature and projected area. In the three-vertex pattern the upper slices are empty. Lemma 4.2 then gives the particularly useful identity

$$
\int_{\partial E_z}\sqrt{1-N_z^2}\,d\ell=h\,w(z),
$$

where $N_z$ is the vertical component of the outward unit normal and $d\ell$ measures length along the slice curve. The left side records the curve's length weighted by the surface orientation. The bottom curve has positive length, which forces $h>0$ and identifies the occupied side as the smaller-volume side. This side choice does not follow just from counting vertices. [1]

Proposition 5.1 combines planar corner-area bounds, projection and curvature estimates to exclude the four-vertex pattern at both transitions; Lemma A.1 supplies its final scalar contradiction. Proposition 5.2 similarly excludes the three-vertex pattern at $4\pi/81$. At $1/\pi$, Proposition 5.3 leaves a possible three-vertex region with $A\le1$ and curvature $0.64\le h\le2.25$. If $s$ is the bottom slice's area, it also gives $s\ge t(h)$, where $t(h)$ is the positive solution of $h^2t^2=\pi(1-t)$. The rest of the proof addresses this case. [1]

**6. Extract the area cost of nested sections.** A section can be a corner region, a strip across the square, or the complement of a corner region. The elementary planar bound is

$$
p\ge p_*(w)=\min\{\sqrt{\pi w},\;1,\;\sqrt{\pi(1-w)}\}.
$$

Lemmas 6.1 and 6.2 combine this with the flux identity and Jensen's inequality, which bounds the average of a convex function by its value at the average. They obtain a baseline bound $A-1\ge B(h)$, together with a positive contribution if the bottom slice is larger than its minimum permitted size. But $B(h)$ is negative near $h=1.46$. The planar estimate alone is insufficient. [1]

The bottom slice's missing corner extends a distance $L$ along either of its two edges. Lemma 6.3 estimates the curve's length by integrating its projection onto a carefully chosen unit vector field. Such a length comparison is called a calibration. It gives, separately for each edge extent,

$$
hs\ge\frac{1-s}{L}+\frac{\pi L}{4}.
$$

No equality of the two extents is assumed. Each higher strip must fit inside the bottom slice, so its endpoint is restricted by the missing corner. Lemma 6.4 turns that restriction into an extra-length bound on a selected interval of intermediate slice areas. The gain can vanish at the interval's endpoints, and the interval itself can collapse. The estimate covers both strip orientations and sections that change to either corner type. This is the geometric improvement absent from treating every slice independently. [1]

**7. Combine the two ways to pay for the bottom slice.** If the bottom area $s$ is well above the lower bound $t(h)$, the baseline already gives extra area. If it is close to that bound, the nesting restriction is stronger. Lemmas 6.5 and 6.6 turn the extra slice length into an integrated area gain, with explicit constants. Proposition 6.7 minimizes the combined gain over the unknown bottom-area excess. The outcome is

$$
A-1\ge B(h)+S(h)\quad\text{for }1.02\le h\le1.62,
$$

and $A-1\ge B(h)$ outside this central interval. Here $S$ is an explicit nonnegative scalar function accounting for the trade-off between the two gains. Computing it is a one-variable minimization, not a search over surfaces. [1]

**8. Prove positivity between the numerical sample points as well as at them.** Proposition B.1 asserts $B>0$ on the two outer curvature intervals and $B+S>0$ on the central one. Appendix B gives a cubic Taylor approximation with a bounded remainder, a formula for $S$, and outward arithmetic enclosures for the necessary square roots and trigonometric values. Its 24 listed knots cover the curvature range through 23 intervening intervals. [1]

The interpolation uses an upper bound $K$ on the second derivative, interpreted to remain valid where formulas change. For an interval $[a,b]$, this yields

$$
f(h)\ge\min\{f(a),f(b)\}-\frac{K(b-a)^2}{8}.
$$

Thus positivity at the knots is combined with a controlled allowance for how far the function could fall between them. The smallest claimed uniform margin is $9/100000$. A plot of sampled values would not establish that conclusion. The pinned source contains the arithmetic prescription and tables, with no standalone numerical checker. For this article we recomputed the 23 final rational interpolation margins from the stated knot bounds and obtained the published margins; this does not check the knot enclosures or the geometric arguments supplying them. [1]

Strict positivity contradicts the possible region's $A\le1$, excluding the last endpoint configuration. Section 7 returns to the two-volume reduction, obtains the profile and all equality cases, then multiplies normalized area by two to restore the unit-torus formula. [1]

The dependencies a specialist would need to examine include the reflection argument for the original region, the use of volume-constrained stability, the handling of exceptional slicing levels, and the nesting gain for both strip orientations. The final interval bounds must also be checked together with their analytic error estimates. These are the places where the classification is established, rather than evidence that a mathematical error has been found. [1]

## Consequences inside mathematics

The claimed result supplies both the isoperimetric profile and all its equality cases. At the two transition volumes, ball and tube or tube and slab have the same area, while the theorem excludes additional minimizing geometries. Between them, the argument excludes nonstandard regions that might tie as well as regions that might improve the area. This is stronger than checking that the familiar candidates have the expected formulas. [1]

Reflection also connects the result with the relative isoperimetric problem in a cube, where only the interface inside the cube counts. The corresponding candidates are an eighth of a ball at a corner, a quarter cylinder along an edge, and a coordinate cut. The area normalization changes, so the unit-torus formula cannot be copied unchanged into that formulation. The connection concerns this specified relative-perimeter problem, not arbitrary energies assigned to contact with physical walls. [1][6]

The theorem does not establish how quickly an evolving surface reaches a minimizer, whether it becomes trapped near a different stationary surface, or a quantitative estimate saying how close every nearly minimizing region is to the listed shapes. Those questions require further arguments. [1]

## Uses outside mathematics

There is a specific connection to simulations of liquid and vapour in a periodic box. Prestipino and collaborators studied the sphere-to-cylinder-to-slab sequence in a 2015 capillarity model whose interface energy is proportional to area. In a cubic cell their formulas give the same transition fractions, $4\pi/81$ and $1/\pi$. They compared the model with Monte Carlo simulations and discussed other observed shapes as metastable states. [10]

If the new theorem is correct, it would justify the global least-area geometry underlying that idealized model, including exclusion of unlisted equal-area competitors. This is an implication for the model, not a demonstrated improvement in a simulation method. Wilding's separate work explains why these geometry changes can obstruct sampling and affect measurements of vapour-liquid surface tension. [1][11]

Real-fluid predictions require additional assumptions. The capillarity calculation neglects effects such as curvature-dependent surface tension and anisotropy, and its periodic boundary conditions matter. The mathematical result alone does not determine molecular behaviour, thermal rounding, transition kinetics or droplet shapes against container walls. [10][11]

## Has anyone checked it?

**Unreviewed, checked 7 November 2026.** We searched for public assessments by specialists associated with the cubic-torus problem and its earlier results. We found no named specialist statement verifying the complete proof, no journal acceptance of this manuscript, and no named mathematical gap report. This records the evidence located, rather than ruling out private or unindexed work.

Deng, Li and Liu's 6 October preprint states an unconditional classification for the relative cube problem, with both transition ties and further stability estimates. It presents a separate proof and acknowledges ChatGPT assistance; the authors state that they checked their own mathematical content. It neither cites OpenAI's manuscript nor reports verifying its argument. We record this parallel claim without transferring that declaration to the selected paper. [12]

**Machine checking.** The pinned release links a Lean statement covering the full finite-perimeter profile and minimizer classification, including both transition ties, despite omitting the family from `formalization.yaml`. Carlos Toledo's cert-machine ledger reports acceptance by Lean and the separate nanoda kernel on 10 October 2026 at OpenAI commit `fd4aeeb2ee4fc729c18d98444fed42fd0529eeeb`. We inspected the stated scope and replay report but did not rerun the proof. A kernel check of a formal statement is distinct from a specialist's assessment of the manuscript and its correspondence to that statement. [8][9]

The final arithmetic in Appendix B is also a separate matter. Its instructions and tables are present in the TeX, but the pinned paper directory contains no separate numerical program. Recomputing the interpolation margins from the supplied bounds checks a limited arithmetic step. It does not establish the preceding enclosures or verify the full theorem. [1]

The article uses commit `4eaee87548250b2682affda7d05d947c05554bae`, dated 29 October 2026. The upstream main branch still pointed to this commit when checked on 7 November. The pinned history lists no withdrawal or revision of family 354. [8]

## Sources

1. OpenAI, *The Isoperimetric Conjecture for the Cubic Flat Three-Torus*, 24 September 2026. Theorem 1.1, the all-minimizer endpoint reduction, reflection and slice arguments, and the arithmetic bounds in Appendices A and B. [Pinned paper](https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/The-Isoperimetric-Conjecture-for-the-Cubic-Flat-Three-Torus-September-24-2026/article.pdf), [TeX source](https://github.com/openai/math/tree/4eaee87548250b2682affda7d05d947c05554bae/preprints/The-Isoperimetric-Conjecture-for-the-Cubic-Flat-Three-Torus-September-24-2026/build).
2. Laurent Hauswirth, Joaquín Pérez, Pascal Romon and Antonio Ros, *The periodic isoperimetric problem*, *Transactions of the American Mathematical Society* 356, 2004, 2025 to 2047. The periodic conjecture and earlier structural results, with attention to the symmetry class imposed. [Journal DOI](https://doi.org/10.1090/S0002-9947-03-03362-2).
3. Antonio Ros, *The isoperimetric problem*, in *Global Theory of Minimal Surfaces*, Clay Mathematics Proceedings 2, 2005, 175 to 209. Classical isoperimetry, the cube and periodic problems, and the coordinate-graph observation. [Publisher-hosted volume](https://www.claymath.org/wp-content/uploads/2022/03/cmip02.pdf).
4. Frank Morgan and David L. Johnson, *Some sharp isoperimetric theorems for Riemannian manifolds*, *Indiana University Mathematics Journal* 49, 2000. Theorem 4.4 supplies the small-volume comparison used for compact flat manifolds. [Author manuscript](https://www.lehigh.edu/~dlj0/papers/morgan-johnson.pdf), [journal DOI](https://doi.org/10.1512/iumj.2000.49.1929).
5. Emilio Acerbi, Nicola Fusco and Massimiliano Morini, *Minimality via second variation for a nonlocal isoperimetric problem*, *Communications in Mathematical Physics* 322, 2013, 515 to 557. Theorem 5.3 gives the cubic-torus slab classification near half volume. [Paper](https://arxiv.org/abs/1211.0164), [journal DOI](https://doi.org/10.1007/s00220-013-1733-y).
6. Emanuel Milman, *Isoperimetric inequalities on slabs with applications to cubes and Gaussian slabs*, preprint 2024; *Communications on Pure and Applied Mathematics* 79, 2026, 1012 to 1072. Effective prior volume ranges, the distinction between cubes and thinner boxes, the transition reduction and the cube-reflection relation. [Paper](https://arxiv.org/abs/2403.06602), [journal DOI](https://doi.org/10.1002/cpa.70020).
7. Franck Barthe and Bernard Maurey, *Some remarks on isoperimetry of Gaussian type*, *Annales de l'Institut Henri Poincaré, Probabilités et Statistiques* 36, 2000, 419 to 434. Theorem 7 and the following discussion recover Hadwiger's half-volume cube result. [Published article](https://www.numdam.org/item/AIHPB_2000__36_4_419_0/).
8. OpenAI mathematics release at commit `4eaee87548250b2682affda7d05d947c05554bae`. Formal-statement scope, catalogue distinction and upstream changes. [Family scope note](https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/354.md), [comparator statement](https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/CubicTorus.lean), [formalization catalogue](https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/formalization.yaml), [change history](https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md).
9. Carlos Toledo, cert-machine audit of OpenAI's mathematics release. The `CubicTorus` entry records a 10 October 2026 Lean and nanoda replay at commit `fd4aeeb2ee4fc729c18d98444fed42fd0529eeeb`; this is reported machine evidence, not a specialist proof verdict. [Pinned replay ledger](https://github.com/carlostoledo1891/cert-machine/blob/9814e4c06281e34a113ce853d7d99ccce160b750/certs/openai-math-kernel.json), [audit report](https://carlostoledo.co/reports/openai-math.html), inspected 7 November 2026.
10. Santi Prestipino, Carlo Caccamo, Dino Costa, Gianpietro Malescio and Gianmarco Munaò, *Shapes of a liquid droplet in a periodic box*, *Physical Review E* 92, 2015, 022141. The capillarity model, transition fractions and comparison with molecular simulations, including the model's limits. [Paper](https://arxiv.org/abs/1509.02324), [journal DOI](https://doi.org/10.1103/PhysRevE.92.022141).
11. Nigel B. Wilding, *Improved grand canonical sampling of vapour-liquid transitions*, preprint 2015; *Journal of Physics: Condensed Matter* 28, 2016, 414016. Periodic droplet transitions, sampling barriers and surface-tension measurement. [Paper](https://arxiv.org/abs/1511.07639), [journal DOI](https://doi.org/10.1088/0953-8984/28/41/414016).
12. Bin Deng, Jiahuan Li and Yilu Liu, *Relative isoperimetry in the three-dimensional cube: classification and quantitative stability*, preprint 6 October 2026. A separate cube-classification and stability claim; Theorem 1.1, the cube/torus profile relation in Lemma 2.1, and the authors' AI-use declaration. This is not a review of OpenAI's manuscript. [Preprint](https://arxiv.org/abs/2610.08644), [version read](https://arxiv.org/html/2610.08644v1).
