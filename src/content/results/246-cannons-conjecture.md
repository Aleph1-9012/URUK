---
family: "246"
topic: "Cannon's conjecture"
title: "Does a sphere at infinity determine a group's geometry?"
paperTitle: "A Modulus Proof of Cannon's Conjecture"
claim: "Every word-hyperbolic group whose boundary is homeomorphic to the two-sphere admits a proper cocompact isometric action on hyperbolic three-space with finite kernel. In the torsion-free case, the group is the fundamental group of a closed hyperbolic three-manifold, possibly nonorientable."
status: approved
checked: 2026-11-07
link: https://sites.google.com/g.ucla.edu/quasiworld/
papers:
  - preprints/A-Modulus-Proof-of-Cannons-Conjecture-September-23-2026/paper.pdf
draft: false
visual: boundary-sphere
---

An infinite finitely generated group can be drawn as an infinite network of moves. Its boundary records the different directions in which a shortest path can escape to infinity. Cannon's conjecture asks whether, for a hyperbolic group, a boundary shaped like a sphere forces the whole group to act as symmetries of hyperbolic three-dimensional space. OpenAI's paper dated 23 September 2026 claims a positive answer. Its argument turns the topology of that distant sphere into a quantitative bound on how paths cross increasingly fine coverings. [1]

This paper has a named specialist's positive assessment. Mario Bonk devoted his 22 October Quasiworld seminar to the proof, including both of its growth cases. His abstract says the proof "seems to be correct", and his published slides present the conjecture as proved. On that evidence, checked on 7 November, Uruk labels the result "approved". The review section gives the scope and qualifications of that assessment separately from the reported Lean check. [12][13][14]

## The problem

A group is a collection of operations that can be composed and undone. A finite generating set is a finite list of operations from which all the others can be built. Its Cayley graph puts a vertex at every group element and an edge wherever applying one generator takes you from one element to another. Give every edge length one. Shortest-path distance then measures the fewest moves needed to get between two vertices. [1]

A group is word-hyperbolic when triangles made of shortest paths are uniformly thin. There is one constant $\delta$ such that every point on any side lies within distance $\delta$ of one of the other two sides, however large the triangle is. A tree is the extreme example: its triangles fold onto branches and have zero thickness. Ordinary square-grid geometry has arbitrarily fat triangles and does not satisfy this condition. [1]

Now follow a shortest ray from the identity vertex forever. Two rays represent the same boundary point when they stay a bounded distance apart. The boundary $\partial G$ consists of these asymptotic directions, with a topology that makes rays close when they travel together for a long time before separating. Its homeomorphism type does not depend on the chosen finite generating set. [1][3]

The boundary hypothesis is

$$
\partial G\cong S^2.
$$

Here $S^2$ is the ordinary two-dimensional sphere. The symbol means there is a continuous bijection with continuous inverse, a homeomorphism. It says nothing by itself about distances, angles or areas. A visual metric measures closeness using how long rays travel together. In that metric, a topological sphere need not look round and need not have Hausdorff dimension two. The conjecture asks whether the group action supplies the missing geometric control. [1][5][7]

Hyperbolic three-space $\mathbb H^3$ is the simply connected three-dimensional geometry of constant curvature $-1$. Its boundary at infinity is a sphere. A closed hyperbolic three-manifold is obtained by identifying points of $\mathbb H^3$ under a suitable group of symmetries; "closed" means compact and without boundary. Its fundamental group records loops up to continuous deformation and acts on the covering space $\mathbb H^3$. Such groups supply the model examples behind Cannon's question. [1][3]

The difficult direction starts with an abstract group and only the topological shape of its boundary. One must recover an action on $\mathbb H^3$ that fills the space without accumulating infinitely many group motions in a bounded region. [1]

## Why it stayed open

James Cannon's question goes back to his early-1990s programme. Haïssinsky's later account cites Conjecture 11.34 in Cannon's 1991 chapter. Cannon and Swenson gave a precise group-boundary formulation and a conformality criterion in their 1998 paper. The issue was already the gap between a topological sphere and a sphere with enough analytic structure to recover hyperbolic geometry. [3][9]

Cannon's 1994 combinatorial Riemann mapping theorem constructed quasiconformal coordinates from suitable discrete-modulus conditions on surface coverings. Cannon, Floyd and Parry simplified the required conditions in 1999 to the existence of sufficiently rich families of annular rings. These theorems explained which quantitative information would suffice. They did not prove that every sphere-boundary hyperbolic group supplies it. [2][4]

Bonk and Kleiner's 2002 uniformization theory expressed the problem in metric terms. A quasisymmetry is a homeomorphism that controls ratios of distances from a point; it gives more information than topology but need not preserve lengths. Their two-dimensional regularity theorem assumes that the measure of a radius-$r$ ball is comparable to $r^2$ at all points and scales, as well as the stated local topological control. A visual boundary cannot simply be assumed to have that measure scaling. [5]

Their 2005 result gave another sufficient condition: the Ahlfors regular conformal dimension must be attained. This dimension is the infimum of exponents $Q$ for which a metric in the visual metric's quasisymmetric class has ball measures comparable to $r^Q$. An infimum need not be a minimum. The theorem applies when an actual minimizing metric exists; finding a sequence of better and better metrics is not enough. It does not assume in advance that the minimizing exponent equals two. [7]

Bourdon and Kleiner's 2013 Corollary 3.5 supplied the particular criterion used in the new proof. For an approximately self-similar metric sphere, a uniform upper bound on the combinatorial $2$-modulus of all paths of a fixed sufficiently small minimum diameter gives a parametrization by the round sphere with controlled cross-ratio distortion. Approximate self-similarity means that small balls, rescaled to unit size, resemble open subsets of the whole space with uniformly bounded metric distortion. This general criterion has no Coxeter-group hypothesis, even though the paper also studies that special class. The remaining task was to establish the bound for every hyperbolic group with sphere boundary. [6]

Algebraic approaches required different additional structure. Marković's 2013 criterion uses enough quasiconvex surface subgroups, with controlled geometry inside the ambient group, to separate every pair of distinct boundary points. In the faithful, orientation-preserving setting this gives a Kleinian realization. One surface subgroup alone does not meet the condition. Haïssinsky's 2015 theorem relates virtual Kleinian realization of groups with planar boundary to actions on CAT(0) cube complexes, spaces assembled from cubes with a specified nonpositive-curvature condition. The required cubical action remains a hypothesis. [8][9]

The 2026 revision of *Drilling hyperbolic groups* provides a more recent conditional route, using residual finiteness and the Toral Relative Cannon Conjecture. Residual finiteness means that finite quotients can distinguish every nonidentity element. Those assumptions are not part of Cannon's original boundary hypothesis. The new paper follows the analytic route instead, attempting to prove the needed modulus estimate directly. [1][10]

## What OpenAI claims

**Theorem 1.1.** Let $G$ be a word-hyperbolic group with boundary homeomorphic to $S^2$. There is a homomorphism

$$
\rho:G\longrightarrow\operatorname{Isom}(\mathbb H^3)
$$

whose action is proper and cocompact and whose kernel is finite. A homomorphism preserves composition, so the assigned isometries obey the group's multiplication rules. The full isometry group is allowed, including orientation-reversing symmetries. [1]

Properness means that for every compact set $K\subset\mathbb H^3$, only finitely many $g\in G$ satisfy $\rho(g)K\cap K\ne\varnothing$. Cocompactness means that the translates of one compact set cover all of $\mathbb H^3$. The kernel consists of group elements acting as the identity everywhere. The theorem permits finitely many such elements; it does not assert that every group in the statement embeds faithfully into the isometry group. [1]

If $G$ is torsion-free, its identity is its only element of finite order. Every point stabilizer is finite, and so is the kernel; torsion-freeness makes them trivial. Corollary 8.1 concludes that $\mathbb H^3/G$ is a closed hyperbolic three-manifold with fundamental group $G$. The manifold may be nonorientable. For groups with torsion, the general action statement remains the appropriate conclusion; the same quotient need not be a manifold. [1]

The theorem assumes neither a specially regular boundary metric, a pre-existing cubical action, nor enough surface subgroups to apply earlier recognition results. It also does not treat arbitrary planar boundaries or higher-dimensional boundary spheres. The claimed new step is a uniform modulus bound obtained from hyperbolicity and the two-sphere topology alone. [1]

## How the claimed proof goes

The argument assumes that the needed bound fails and produces a continuous real-valued function with many separating level sets but vanishing discrete energy. It then shows that the group action makes such a function impossible. The map below follows the complete pinned TeX and checks statement numbers against the printed PDF. It explains the submitted proof rather than providing an independent verification. [1]

### Measure the cost of blocking every large path

Choose a visual metric on $Z=\partial G$ and a scale factor $a>1$. At scale $r_n=a^{-n}$, choose a maximal set $T_n$ whose points are at least $r_n$ apart. The balls $B(q,2r_n)$ centered there cover $Z$. Assign a nonnegative weight $\omega(q)$ to each ball, requiring every continuous path of diameter at least a fixed small $d_0>0$ to meet balls whose total weight is at least one. Each ball contributes once when a path meets it. [1]

The combinatorial $2$-modulus is the cheapest sum of squared weights satisfying that condition:

$$
M(n)=\min_{\omega}\sum_{q\in T_n}\omega(q)^2.
$$

For an elementary comparison, divide a square into an $m$-by-$m$ grid and consider left-to-right crossings. Weight $1/m$ on every cell makes every crossing collect at least one, while the total squared weight is $m^2/m^2=1$. Refining this grid does not increase that admissible cost. This calculation illustrates the bound sought on the much less regular boundary coverings; it is not an assumption that those coverings are square grids. [1][5][6]

Theorem 2.5 invokes Bonk-Kleiner and Bourdon-Kleiner to reduce the problem to $\sup_nM(n)<\infty$. Their criterion also needs approximate self-similarity and controlled paths. Lemmas 2.1-2.4 establish these for the visual boundary. In particular, moving backward along a long group ray magnifies a small boundary ball by roughly the reciprocal of its radius. Away from that ball, the image concentrates near one boundary point, later called a puncture. Packing bounds control how many separated balls fit in a larger one. [1][5][6]

### Turn a failure of the bound into a scalar function

Suppose $M(n)$ is unbounded. The sequence need not increase steadily. Section 3 selects record indices $N$ for which

$$
M(N-\ell)\le\lambda^{-\ell}M(N),\qquad 0\le\ell\le N.
$$

If $\limsup M(n)^{1/n}>1$, choose $\lambda>1$ below that limsup; otherwise choose $\lambda=1$. In either case the selected $M(N)$ tend to infinity. This keeps control of all earlier relative scales without assuming an exponential rate limit exists. [1]

Lemma 3.1 localizes a definite fraction of the modulus to left-to-right crossings of one coordinate rectangle. Lemma 3.3 uses planar crossing duality to obtain weights $\rho_q$ for top-to-bottom crossings with

$$
\sum_q\rho_q^2\le\frac{C}{M(N)}.
$$

Thus expensive crossings in one direction produce cheap transverse weights. The finite-dimensional argument takes the least-norm point in the convex hull of crossing incidence vectors, which record the cells a crossing meets. Every transverse crossing intersects every lateral crossing, supplying the required dual inequality. [1]

From these weights the paper builds a function measuring the cheapest path cost from the top edge, clipped between zero and one. Interpolation makes it continuous, but continuity alone does not provide the particular separating levels needed later. Lemma 3.4 applies two path envelopes: one takes the least possible maximum on a route to the top, and the other the greatest possible minimum on a route to the bottom. The resulting $H_N$ retains the small oscillation energy and has a large connected level set for every value between zero and one. [1]

These level sets are continua, meaning nonempty compact connected sets. They need not be smooth curves or even path connected. Each selected level continuum crosses the rectangle laterally and meets every path whose endpoint values straddle its level. That stronger intersection property is why the regularization matters. [1]

### Preserve both the limit and its low-energy approximations

Lemma 3.6 bounds the oscillation across a small ball using weighted energy in a surrounding annulus. Magnifying the annulus changes the relative mesh from $N$ to $N-\ell$, so its estimate contains $M(N-\ell)$. The record inequality controls that factor. Summing over disjoint annuli gives enough uniform continuity to take a limit. [1]

Proposition 3.7 obtains a continuous nonconstant function $u$ on an open rectangle region $U$ and a finite measure $\mu$. The top and bottom bands keep values zero and one, preventing the limit from becoming constant. If $\lambda>1$, the continuity is stronger: locally, differences are bounded by a constant times a positive power of distance, the Hölder condition. In both cases, for centers in any fixed compact subset of $U$ and all sufficiently small radii $s$,

$$
\bigl(\operatorname{osc}_{\overline B(x,s)}u\bigr)^2
\le C\mu\bigl(\overline B(x,C_\mu s)\bigr).
$$

Oscillation is the maximum minus the minimum. The measure therefore puts a finite budget on squared variation in small balls. It is not asserted to be invariant under the group. The approximants $H_N$ also remain essential: their sums of squared cell oscillations tend to zero after each fixed group transformation, locally on compact subsets of the transformed domain. [1]

Lemma 3.8 explains how that can force a contradiction. Suppose a family of level continua of a function $f$, indexed by an interval $I$, all lie in a fixed compact region, and another function $w$ changes by at least $b>0$ along each continuum. Sweeping through the levels gives

$$
b|I|\le\sum_q
\operatorname{osc}_{\overline B(q,2r_N)}f\,
\operatorname{osc}_{\overline B(q,2r_N)}w.
$$

Cauchy-Schwarz makes the right side tend to zero if both discrete energies vanish. The proof integrates finitely many range-interval indicators, so it needs no measurable choice of a continuum for each level. Lemma 3.9 lets a continuum be stopped at a prescribed sphere while staying outside the corresponding open ball. This keeps later comparisons inside compact regions where both functions are defined. [1]

### Exponential growth gives two incompatible magnifications

When $\lambda>1$, Hölder continuity allows the proof to magnify smaller regions where $u$ varies and normalize their value differences. Lemma 4.1 produces a nonconstant limit $W$ on the boundary sphere with one point $b$ removed. The missing point is the limiting puncture, where the part of the sphere outside the chosen small region has concentrated. [1]

Lemma 4.2 chooses the approximating mesh only after fixing each magnification and its normalization. This order preserves vanishing energy for transformed approximants even though the magnifications themselves vary. A fixed-transformation estimate cannot simply be assumed uniform over a changing sequence of group elements. [1]

The level comparison then constrains different magnifications. If $gb\ne b$, Lemma 4.3 says that $W\circ g^{-1}$ takes one constant value wherever $W$ is not locally constant, away from the other puncture. Otherwise, levels of the first function would carry a definite amount of variation of the second, contradicting the vanishing-energy inequality. [1]

The proof magnifies variation once more. Lemma 4.4 bounds the possible accumulation directions of the subgroup fixing $b$ by two; choosing a variation region away from them yields distinct punctures. Two fixed disks can then be chosen with disjoint value ranges, while every sufficiently late magnification varies inside both. The preceding comparison forces another magnification to take the same value at a variation point in each disk. Their disjoint ranges make that impossible. Proposition 4.5 excludes the exponential-growth case. [1]

### Subexponential growth distributes variation through a tree

The remaining case lacks the Hölder estimate. Section 5 instead builds a tree recording where the function varies and which interval of values it covers. At each node, a ball of radius $R$ carries an interval $J$ of length $\Delta$ strictly inside the function's range on a controlled enlargement. Children have radius $a^{-D}R$ for one fixed integer $D$. Their value intervals are nested inside $J$, but their spatial balls lie around the parent in an annulus and are not required to be nested. [1]

A node is called good when two small regions carry separated lower and upper portions of its value interval. Their magnified images then provide two distinct regions of variation. If a node is not good, Lemma 5.1 finds many separated children, each retaining at least an eighth of the parent interval. Lemma 5.2 supplies enough total capacity to assign transition probabilities at every node. Its intermediate-scale estimate uses subexponential modulus growth, and it integrates over the value interval before choosing $D$. This makes the same subdivision depth work even for arbitrarily short intervals. [1]

Write $t$ for a child's interval length divided by its parent's, and $p$ for its conditional probability. The construction obtains a linear bound $p\le a^{-\gamma D}t$ at every node, for a fixed $\gamma>0$. It also obtains quadratic bounds

$$
p\le a^{-D/2}t^2\quad\text{at a node that is not good},
\qquad
p\le a^{D/20}t^2\quad\text{at a good node}.
$$

The linear bound makes branch probabilities small. The quadratic bounds compare probability with squared interval length, which the finite measure controls. At each generation the enlarged source balls are disjoint, so the sum of those squared lengths is bounded. Multiplying probabilities down the tree and applying Jensen's inequality shows that the average probability on nodes that are not good is at most $1/11+o(1)$. Lemma 5.3 consequently supplies arbitrarily deep generations with at least half their probability on good nodes. Proposition 5.4 collects these properties. [1]

### Compare many expansions at the same depth

Section 6 selects many good nodes at a common depth $k=k_0+Dn$, all with comparable probabilities and the same pair of target regions. Their source scale is $R=a^{-k}$. Each node has an expansion $h_i$ and puncture $p_i=h_i z_0$ for one fixed distant point $z_0$. Lemmas 6.2 and 6.3 use both the source and inverse geodesic prefixes to bound repeated or nearby punctures. A positive fraction of the selected pairs have puncture distance $d_{ij}>a^{-\ell}$, much larger than $R$. [1]

For each such pair, Lemma 6.4 forces one transformed function to vary near the other's puncture by a fixed fraction of its own interval length. Otherwise the two shared target regions and separating levels would violate Lemma 3.8. The pair is fixed before the approximating mesh tends to zero; no convergence rate uniform over every pair is assumed. [1]

Pulling a puncture neighborhood back under $h_i$ gives a source ball of radius comparable to

$$
\frac{R^2}{d_{ij}^2}.
$$

The oscillation-measure inequality charges that ball, after a fixed enlargement, at least a constant times $\Delta_i^2$ of $\mu$-mass. The enlargement still maps into a ball of radius comparable to $R$ around $p_j$. This permits a separate overlap bound for partners $j$ at a fixed source index $i$, and for possible source indices at a fixed point. No invariance of $\mu$ is used. [1]

The number of pairs matters quantitatively. If the selected class has $m$ nodes with probabilities between $P_*$ and $2P_*$, its retained mass gives $mP_*\ge c/k$. The linear transition bound telescopes to $\Delta_i\ge\Delta_0a^{\gamma Dn}P_*$, where $\Delta_0$ is the root interval length. A fixed proportion of the $m^2$ pairs must each pay at least a constant times that squared amount, giving total charge at least $c k^{-2}a^{2\gamma Dn}$. [1]

For the upper bound, the charged balls lie within distance $CRa^\ell$ of their source centers, which are separated by a fixed multiple of $R$. Packing allows at most $Ca^{Q\ell}$ such source neighborhoods through any point; puncture multiplicity bounds the number of partners for each source. Thus the total charge is at most $Ca^{Q\ell}\mu(Z)$. Here $Q$ is the packing exponent, and $\ell$ is chosen so that $Q\ell\le\gamma Dn$. The result would be

$$
a^{\gamma Dn}\le C'k^2,\qquad k=k_0+Dn,
$$

for arbitrarily large $n$. An exponential cannot stay below this quadratic. Proposition 6.1 excludes the subexponential case, completing the uniform bound on $M(n)$. [1]

### Recover the hyperbolic action

Theorem 2.5 now gives a boundary homeomorphism to the round sphere with controlled distortion of distance cross-ratios. Proposition 2.6 transfers the group action to uniformly quasiconformal maps, which have uniformly bounded infinitesimal distortion. The Sullivan-Tukia method produces an invariant measurable conformal structure, and the measurable Riemann mapping theorem changes coordinates so that all group elements become Möbius or anti-Möbius maps. These extend to isometries of $\mathbb H^3$. [1]

The proof retains orientation-reversing elements by working with unoriented conformal structures. Properness and cocompactness follow from the boundary action on ordered triples of distinct points and then pass to hyperbolic space. A kernel element fixes every point, so properness makes the kernel finite. This closes the chain from the modulus bound to Theorem 1.1. [1]

The points requiring closest scrutiny are the separating-level construction, the order of the magnification and approximation limits, the uniform subdivision depth for all value intervals, and the overlap estimate for enlarged pair-cost balls. The first construction supports both growth cases; the uniform subdivision and pair counting carry the subexponential argument. These are the estimates that turn the boundary topology and group action into the required geometric control. [1]

## Consequences inside mathematics

For torsion-free groups, Corollary 8.1 turns a boundary recognition problem into a closed hyperbolic three-manifold realization. Corollary 8.2 then imports established three-manifold results. Some finite-index subgroup, meaning one with only finitely many cosets, has the form

$$
\pi_1(\Sigma)\rtimes\mathbb Z,
$$

where $\Sigma$ is a closed connected orientable surface. Geometrically, a finite cover of the manifold fibers over a circle, with surface fibers transported around that circle. The semidirect product records how this transport acts on the surface group. In particular, some finite-index subgroup maps onto $\mathbb Z$, giving positive virtual first Betti number. [1][11]

The paper also concludes, in this torsion-free setting, that $G$ is virtually compact special and residually finite. The first property places a finite-index subgroup in the established theory of compact special cube complexes. The second says that every nonidentity element remains nonidentity in some finite quotient. These are consequences of the manifold realization together with existing cubulation and virtual-structure theorems; the paper does not reprove those earlier results. [1][11]

## Uses outside mathematics

No known direct application of this claimed theorem is documented. Its immediate contribution is a recognition result connecting infinite groups, boundaries and three-manifolds. It does not provide a computationally practical procedure for constructing a hyperbolic manifold from a finite group presentation, and it gives no runtime bound for such a task. General uses of hyperbolic geometry in other fields do not establish an application of this particular theorem. [1]

## Has anyone checked it?

The "approved" label is based on Mario Bonk's public mathematical assessment, checked on 7 November 2026. Bonk is a specialist in the boundary uniformization theory used by this proof. His 22 October Quasiworld seminar addressed both the exponential and subexponential cases, with Bruce Kleiner as guest chair. The abstract gives a qualified positive verdict, and the slides present the conjecture as proved. The final technical part of the slides is explicitly an outline, so this is not a claim that the presentation reproduces every detail of the manuscript. [12]

The recording's automatic captions give his opening assessment as: "The proof, as far as I can tell, is actually correct." That qualification is part of the verdict. We read the captioned statement alongside the author-linked slides and seminar abstract; we did not independently check the proof or listen through the recording. Bonk also criticizes the paper's terminology and lack of explanation. Those comments concern exposition and do not retract his mathematical assessment. We found no journal acceptance or later named error report overturning it. [12]

**Machine checking.** The pinned release's `CannonGeometricAction` target states the full proper, cocompact action on $\mathbb H^3$ with finite kernel, using a thin-triangle Cayley graph and a boundary homeomorphism to $S^2$. It includes the full isometry group and imposes no torsion-free hypothesis. The target does not separately state the manifold and virtual-structure corollaries. Carlos Toledo's ledger reports acceptance by both Lean and nanoda on 10 October at commit `fd4aeeb2ee4fc729c18d98444fed42fd0529eeeb`. The Cannon implementation subtree and target files are unchanged at Uruk's pin, but we did not audit every external dependency or rerun either checker. This reported machine result is separate from the human basis for approval. [13][14]

The source here remains the approved commit `4eaee87548250b2682affda7d05d947c05554bae`. The release's `formalization.yaml` omits Cannon despite the actual scope note, target and implementation. We checked those files directly. A comparator target contains a placeholder because its role is to specify the statement checked against a separately named implementation; the placeholder alone is not evidence of a missing proof. [13]

## Sources

1. OpenAI, *A Modulus Proof of Cannon's Conjecture*, 23 September 2026. Theorem 1.1, the full modulus argument, boundary-action reduction and Corollaries 8.1-8.2. Statement numbers checked against the printed PDF. [Pinned paper](https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/A-Modulus-Proof-of-Cannons-Conjecture-September-23-2026/paper.pdf).
2. James W. Cannon, William J. Floyd and Walter R. Parry, *Sufficiently rich families of planar rings*, Annales Academiae Scientiarum Fennicae Mathematica 24, 1999, 265-304. Axiom 0, Theorem 8.2 and the earlier conformality programme. [Journal PDF](https://www.acadsci.fi/mathematica/Vol24/cannon.pdf).
3. James W. Cannon and Eric L. Swenson, *Recognizing constant curvature discrete groups in dimension 3*, Transactions of the American Mathematical Society 350, 1998, 809-849. Group-boundary conjecture and conformality criterion. [DOI](https://doi.org/10.1090/S0002-9947-98-02107-2), [institutional record](https://scholarsarchive.byu.edu/facpub/650/).
4. James W. Cannon, *The combinatorial Riemann mapping theorem*, Acta Mathematica 173, 1994, 155-234. Discrete modulus conditions supplying analytic coordinates, with the general group problem left open. [DOI](https://doi.org/10.1007/BF02398434), [paper scan](https://archive.ymsc.tsinghua.edu.cn/pacm_download/117/6505-11511_2006_Article_BF02398434.pdf).
5. Mario Bonk and Bruce Kleiner, *Quasisymmetric parametrizations of two-dimensional metric spheres*, Inventiones Mathematicae 150, 2002, 127-183. Quantitative sphere uniformization, the Ahlfors regularity hypothesis and modulus criteria. [DOI](https://doi.org/10.1007/s00222-002-0233-z), [preprint](https://arxiv.org/abs/math/0107171).
6. Marc Bourdon and Bruce Kleiner, *Combinatorial modulus, the combinatorial Loewner property, and Coxeter groups*, Groups, Geometry, and Dynamics 7, 2013, 39-107. Published Corollary 3.5 is the general sphere criterion used by the new proof. [DOI](https://doi.org/10.4171/GGD/177), [published PDF](https://ems.press/content/serial-article-files/29637?nt=1).
7. Mario Bonk and Bruce Kleiner, *Conformal dimension and Gromov hyperbolic groups with 2-sphere boundary*, Geometry & Topology 9, 2005, 219-246. Theorem 1.1 requires attainment of Ahlfors regular conformal dimension. [DOI](https://doi.org/10.2140/gt.2005.9.219), [published PDF](https://msp.org/gt/2005/9-1/gt-v9-n1-p07-p.pdf).
8. Vladimir Marković, *Criterion for Cannon's conjecture*, Geometric and Functional Analysis 23, 2013, 1035-1061. The boundary-separating surface-subgroup criterion. [DOI](https://doi.org/10.1007/s00039-013-0228-5), [preprint](https://arxiv.org/abs/1205.5747).
9. Peter Haïssinsky, *Hyperbolic groups with planar boundaries*, Inventiones Mathematicae 201, 2015, 239-307. Theorem 1.10 on cubulation and virtual Kleinian realization; Conjecture 1.8 cites Cannon's 1991 Conjecture 11.34. [DOI](https://doi.org/10.1007/s00222-014-0552-x), [preprint](https://arxiv.org/abs/1302.2219).
10. Daniel Groves, Peter Haïssinsky, Jason F. Manning, Damian Osajda, Alessandro Sisto and Genevieve S. Walsh, *Drilling hyperbolic groups*, first posted 2024, version 2 dated 11 March 2026. Theorem A and Corollary C give a conditional route through residual finiteness and the Toral Relative Cannon Conjecture. [Version 2](https://arxiv.org/abs/2406.14667v2).
11. Ian Agol, *The virtual Haken conjecture*, with an appendix by Agol, Groves and Manning, Documenta Mathematica 18, 2013, 1045-1087. Virtual specialness and virtual fibering, applied after the manifold realization. [DOI](https://doi.org/10.4171/DM/421), [preprint](https://arxiv.org/abs/1204.2810).
12. Mario Bonk, *The AI proof of Cannon's conjecture*, Quasiworld seminar, 22 October 2026. Named specialist assessment and exposition of both growth cases; see slides 3, 9 and 24-45, and the recording's opening assessment around 1:45. [Seminar abstract](https://sites.google.com/g.ucla.edu/quasiworld/), [author-linked slides](https://drive.google.com/file/d/1K57KfpGqZLZnAHI-MrTXOR1kroMz-ZFs/view), [timestamped recording](https://www.youtube.com/watch?v=L2DU0VupdlU&t=105s).
13. OpenAI, Cannon formalization material at the approved pin. The full geometric-action target and its separately supplied implementation; no separate corollary target asserted here. [Scope note](https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/246.md), [target](https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/CannonGeometricAction.lean), [implementation entry](https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/OAI/Geometry/Cannon/Main.lean).
14. Carlos Toledo, cert-machine kernel ledger at commit `9814e4c06281e34a113ce853d7d99ccce160b750`. Reports the 10 October 2026 Lean and stock nanoda acceptance of `CannonGeometricAction` at OpenAI commit `fd4aeeb2ee4fc729c18d98444fed42fd0529eeeb`. [Pinned ledger](https://github.com/carlostoledo1891/cert-machine/blob/9814e4c06281e34a113ce853d7d99ccce160b750/certs/openai-math-kernel.json), [report](https://carlostoledo.co/reports/openai-math.html).
