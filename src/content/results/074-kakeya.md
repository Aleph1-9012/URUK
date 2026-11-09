---
family: "074"
topic: "The Kakeya problem"
title: "How little room does a needle need to point in every direction?"
paperTitle: "The Kakeya maximal conjecture in three dimensions"
claim: "In three dimensions, the Kakeya maximal operator at scale δ is bounded from L³(R³) to L³(S²) with norm at most C_ε δ^(−ε) for every ε > 0. In four dimensions, every set containing a unit line segment in every direction has Hausdorff dimension four."
status: unreviewed
checked: 2026-10-17
papers:
  - preprints/The-Kakeya-maximal-conjecture-in-three-dimensions-September-23-2026/paper.pdf
  - preprints/Every-four-dimensional-Kakeya-set-has-full-Hausdorff-dimension-September-24-2026/paper.pdf
draft: false
---

In 1917 Sōichi Kakeya asked how small a region of the plane can be if a needle of length one is to be turned around inside it to point in every direction. Besicovitch answered in 1928: as small as you like. A set that contains a unit segment in every direction, now called a Kakeya set, can have area zero. But area is a crude measure. The Kakeya conjecture says that such a set, in $n$-dimensional space, must still have full dimension $n$ in the finer sense of Hausdorff, and a stronger maximal version says the same thing quantitatively, about averages over thin tubes. Davies proved the plane in 1971. Three dimensions took until February 2025, when Hong Wang and Joshua Zahl proved the set conjecture, work for which Wang received a Fields Medal in the summer of 2026. On 23 and 24 September 2026 OpenAI posted two papers claiming the next two steps: the maximal conjecture in three dimensions, which Wang and Zahl's theorem does not give, and the set conjecture in four dimensions, where the best known lower bound on the dimension had been $3.059$. [1][2][3][4][6]

As of 17 October 2026 no mathematician has said publicly that they have read or checked either paper. The status on this page is "unreviewed".

## The problem

A Kakeya set in $\mathbb R^{n}$ is a set $K$ such that for every direction $e$ on the unit sphere $S^{n-1}$ there is a unit segment $\{a_e+te:0\le t\le1\}$ inside $K$. Besicovitch's construction gives Kakeya sets of Lebesgue measure zero in every dimension, and Davies showed the needle can even be turned continuously inside a region of arbitrarily small area. So the question is not about volume. [1][2][3]

Hausdorff dimension refines volume. To measure a set at dimension $s$, cover it by countably many pieces of diameter at most $\delta$, add up the $s$th powers of the diameters, take the infimum over covers, and let $\delta\to0$. The Hausdorff dimension of $K$ is the value of $s$ at which this quantity drops from infinity to zero. A smooth curve has dimension one, a surface two, and a set of measure zero can have any dimension up to $n$. The definition needs no measurability. [2]

**The Kakeya set conjecture.** Every Kakeya set in $\mathbb R^{n}$ has Hausdorff dimension $n$. [2]

The maximal version thickens each segment into a tube. For a direction $\omega$, a point $a$ and a width $0<\delta<1$, let $T_\delta(a,\omega)$ be the cylinder of length one and radius $\delta$ around the segment through $a$ in direction $\omega$. The Kakeya maximal function of $f$ records, for each direction, the largest average of $|f|$ over any tube pointing that way:

$$
K_\delta f(\omega)=\sup_{a\in\mathbb R^{n}}\frac{1}{|T_\delta(a,\omega)|}\int_{T_\delta(a,\omega)}|f(x)|\,dx.
$$

**The Kakeya maximal conjecture.** For every $\varepsilon>0$ there is a constant $C_{\varepsilon,n}$ such that $\|K_\delta f\|_{L^{n}(S^{n-1})}\le C_{\varepsilon,n}\,\delta^{-\varepsilon}\,\|f\|_{L^{n}(\mathbb R^{n})}$ for all $f$ and all $0<\delta<1$. [1][2]

The maximal conjecture implies the set conjecture, and it is what harmonic analysts need, because overlapping tubes are the geometry behind Fourier restriction and Bochner-Riesz summability. The difference between the two shows up for indicator functions. Take a family of tubes with $\delta$-separated directions and shade a fraction $\lambda$ of each. The set conjecture needs the shaded parts to fill a volume at least $\delta^{\varepsilon}\lambda^{K}$ times the total, for some power $K$; the maximal conjecture needs exactly the power $\lambda^{3}$ in three dimensions, uniformly in how small $\lambda$ is. Wang and Zahl's theorem gives a power $K(\varepsilon)$ that depends on $\varepsilon$, and the OpenAI paper says that the need to replace it by $\lambda^{3}$ "is stated explicitly after their theorem". [1]

<!-- uruk:visual-note
A visual for this page can show Besicovitch's construction in the plane, a triangle cut into thin slivers and slid together so that area shrinks while every direction survives, and then a family of tubes in three dimensions with a slider for the shading fraction. It cannot show the theorems, which concern all configurations at once.
-->

## Why it stayed open

### A century of needles

Besicovitch's sets of measure zero made the problem a question about dimension. Davies settled the plane in 1971, and Córdoba's maximal estimates of 1977 gave the quantitative planar version. Fefferman's 1971 ball-multiplier counterexample showed that the same tube configurations govern Fourier analysis, and Bourgain's work of 1991 developed maximal estimates in higher dimensions with their Fourier consequences. Wolff's hairbrush argument of 1995 gave the bound $(n+2)/2$ on the dimension in $\mathbb R^{n}$, which is $5/2$ in three dimensions and $3$ in four. [1][2]

In three dimensions, Katz, Łaba and Tao improved the Minkowski bound beyond $5/2$ in 2000 and identified three structures in near-extremal tube families that any proof would have to handle: nearby tubes stay grouped across scales, which they called stickiness; tubes meeting near a point have nearly coplanar directions, planiness; and the union organizes into thin plates, graininess. Katz and Zahl improved the Hausdorff bound in 2019. Wang and Zahl then settled the three-dimensional set conjecture in stages: sticky sets in a 2022 preprint, Assouad dimension in 2024, and the full Hausdorff and Minkowski theorem in February 2025. Guth, Wang and Zahl published a streamlined proof in January 2026, and Guth's Bourbaki survey of April 2026 recorded that "in dimension $n\ge4$, the conjecture is currently open". [1][2][4][5][6]

In four dimensions progress was slower. Łaba and Tao pushed the Minkowski dimension above three. Guth and Zahl's polynomial Wolff axioms, with direction bounds of Zahl and of Katz and Rogers, gave Hausdorff dimension $3+1/40$ for compact sets. Katz and Zahl's planebrush, which organizes tubes around a common plane, gave $3.059$, with a separate maximal estimate at $3.049$ that Borges, Chan, Chen, Liu, Xi and Zhan later improved to about $3.0543$. Rai Choudhuri proved $13/4$ for sticky sets, and Wang and Zakharov proved a full-dimensional union estimate for a class of sticky tube families, but those hypotheses do not cover arbitrary Kakeya sets. [2]

The two claims in this family are the obvious next two questions. Both OpenAI papers state the human precedents plainly, and the four-dimensional paper takes a lemma from the three-dimensional one, which in turn rests on Guth, Wang and Zahl's estimate. [1][2]

## What OpenAI claims

**Theorem 1.1** (OpenAI, "The Kakeya maximal conjecture in three dimensions", 23 September 2026). For every $\varepsilon>0$ there is a finite constant $C_\varepsilon$ such that, for every $0<\delta<1$ and every $f\in L^{3}(\mathbb R^{3})$,

$$
\|K_\delta f\|_{L^{3}(S^{2})}\le C_\varepsilon\,\delta^{-\varepsilon}\,\|f\|_{L^{3}(\mathbb R^{3})}.
$$

[1]

**Theorem 1.1** (OpenAI, "Every four-dimensional Kakeya set has full Hausdorff dimension", 24 September 2026). Let $K\subset\mathbb R^{4}$. Suppose that for every $e\in S^{3}$ there is a point $a_e$ with $\{a_e+te:0\le t\le1\}\subset K$. Then $\dim_H K=4$. Neither $K$ nor the choice of segments need be measurable. [2]

What these do and do not say. The three-dimensional theorem is the maximal conjecture, with an arbitrarily small power loss $\delta^{-\varepsilon}$; it does not remove the loss entirely, which nobody expects at this level. It implies Nikodym maximal estimates in $\mathbb R^{3}$ and on three-dimensional spaces of constant curvature, and local estimates for curved Kakeya operators, through published transfer theorems of Gao, Liu and Xi. The four-dimensional theorem is the set conjecture, not the maximal conjecture, in $\mathbb R^{4}$; the paper derives from it that bounded Kakeya sets in $\mathbb R^{4}$ have Minkowski dimension four and that Kakeya sets in $\mathbb R^{5}$ have dimension at least four. Neither paper says anything about dimension five and above beyond that projection, and neither gives effective constants. The three-dimensional paper notes that another OpenAI manuscript, on Fourier restriction to the sphere, reaches the same maximal estimate by an independent route; it does not use that paper. [1][2]

## How the claimed proofs go

What follows is a map of the two papers, from their introductions and section plans. It is not a check of the details. The two arguments are different in kind. [1][2]

**Three dimensions: the idea.** The paper sets up an extremal problem whose answer, if positive, would mean the maximal estimate fails by a definite power. It then studies the configurations of tubes that would achieve that worst case and shows, by comparing the information they would have to carry with the information available, that they cannot exist. [1]

**A density-sensitive extremal problem.** In a coordinate chart each tube is an affine graph $M_i(t)=b_i+tu_i$ with marked time bins recording its shading. A temporal deficit profile records how far the number of marked bins falls short of full branching at each scale. The paper introduces multiplicity inequalities whose cost depends on this profile, defines the critical exponent as the least extra power of $N=\delta^{-1}$ needed to make them hold, and supposes for contradiction that it is positive, so that equality configurations exist in the limit. [1]

**Planes and plates.** An equality configuration cannot contain a local packet with too much mass, or rescaling it would improve the exponent. Together with the multilinear Kakeya theorem of Bennett, Carbery and Tao, with Guth's endpoint, this forces the directions on short blocks to lie near a common plane; the planar Furstenberg theorem of Ren and Wang then supplies density inside plates. These are the forms of planiness and graininess the argument needs. Comparing an outer cut, which removes initial scales, with an inner cut, which keeps a fine-scale model, forces a canonical temporal profile $F(s)=\beta(s-\tau)_+$: flat, then a constant deficit slope. This stationarity is what the rest of the proof exploits. [1]

**Four coordinates and two frames.** A packet has position coordinates $(X,Y)$ and velocity coordinates $(U,V)$ whose admissible widths change at four prescribed rates. Two marked events on the same tube give two frames, related by a shear in time and a shear in the normal direction. The scalar projections of this relation constrain the entropy rates of the four coordinates through the planar Furstenberg theorem, and a pinning estimate adapted from the radial-projection bootstraps of Shmerkin and Wang and of Orponen, Shmerkin and Wang handles the product slope $\Delta t\,\Delta\vartheta$. Because the two events share a tube they are dependent; the paper compares their joint law with a product law, shows that a failed rate constraint would require a positive amount of mutual information, and shows by an averaged short-gap estimate that less is available. The contradiction excludes a positive critical exponent. A final section carries the density power through from shadings to arbitrary $L^{3}$ functions. [1]

**Four dimensions: the idea.** The paper reads a hypothetical Kakeya set of dimension less than four as a weighted family of lines in which refining the resolution loses less than one power of density per unit depth, while every substantial collection of lines on which a quadratic polynomial relation holds must use time intervals of a definite shrinking length. Its basic object is a chart: a set of line pieces in a moving box and a time interval on which one quadratic test stays small, with a mass requirement so that fitting a negligible collection does not count. Charts can be nested and renormalized. The proof shows that the two properties cannot coexist. [2]

**The horizon and the comparison principle.** Writing lines as $(t,\,y_0+tV,\,w_0+tW)$ and binning the hidden coordinate $w$, the paper defines the time cost of a chart system and the horizon $H(E)$ as the infimum of such costs over substantial true terminal systems; the reduction from a counterexample gives $H(E)>0$. Local graph representations of the polynomial tests give scalar sheets, and a comparison principle says that two short lists of sheets cannot agree in value often while keeping their derivative data apart, or a polynomial endpoint map would have more volume than the density bound allows. The comparison both lengthens charts and glues local approximations. [2]

**Three regimes.** Following nested charts in a nearly extremal problem, the relative density and time profiles become linear with a rate $k$, and an optimized narrowness $\ell$ measures how much thinner one spatial axis is than the time scale. When $\ell=0$, enough separated velocities remain to build an approximate polynomial vector field, make it conservative, and obtain a potential; cubic and quartic terms that survive are encoded into a quadratic correction, restoring an admissible chart. When $0<\ell<\infty$, planar rigidity, from the restricted-triple dot product theorem of Wang and Zahl and the multiplicative convolution estimate of Orponen, de Saxcé and Shmerkin together with a graph Balog-Szemerédi-Gowers argument, forces a horizontal model $Y'=-Z+tv$ with boxes of sizes $H$ and $H^{2}$; at the critical rate $2k=1$ a path with three refreshed segments fills enough volume to improve the fit, and away from it the aim is to recover wide projected intervals, with a bootstrap when $2k<1$. When $\ell=\infty$, nested chart labels localize the trajectories over the whole interval and a scalar projection gives charts of vanishing time cost. In each regime the local improvement is upgraded to a chart system with recoverable labels in the original problem, contradicting extremality. [2]

Where would an expert look first? In the three-dimensional paper, at the closure section where the power $\lambda^{3}$ must survive the passage to general functions, at the stationarity argument, and at the mutual-information step. In the four-dimensional paper, at the reduction that produces a positive horizon from a hypothetical counterexample, at the comparison principle, and at the degree-restoration and three-leg steps, together with the paper's careful distinction between the original resolution $N_0$ and the local resolution $N$, since returned chart systems must satisfy bounds in the former. [1][2]

## Consequences inside mathematics

If both hold, the Kakeya problem is settled in three dimensions in its strong form and in four dimensions in its set form, leaving dimensions five and above, where the papers give only the projected bound. Nikodym and curved Kakeya estimates follow in three dimensions, and the four-dimensional paper lists consequences for Minkowski dimension, for arbitrary direction sets and for Nikodym sets. The maximal estimate in three dimensions is an input that restriction and Bochner-Riesz problems have waited for, though the papers in this family do not themselves draw those consequences. [1][2]

## Uses outside mathematics

No known direct application.

The Kakeya problem is pure geometry and analysis. Its connections run to other parts of mathematics, Fourier analysis above all, and through them to the theory of wave and dispersive equations, but no engineering or physical computation changes because of these theorems. [1][2]

## Has anyone checked it?

We found no named mathematician who says they are reading or checking either paper. Jared Duker Lichtman named "a solution to the four-dimensional Kakeya conjecture" among the "tens" of results he considered major, in The Verge on the day of the release; that is a judgment of importance, not of correctness. Scientific American reported the four-dimensional claim with a reminder of Wang's Fields Medal. A widely shared post on X described the release as having resolved "the Kakeya conjecture in $\mathbb R^{3}$", confusing the set conjecture, which is Wang and Zahl's theorem, with the maximal conjecture the release claims. Searches for public statements by Wang, Zahl, Guth, Katz or Tao found none. An online registry that compared both introductions with the literature found no earlier claim of either result. [7][8][9][10]

OSVerify, an automated referee from Stanford whose findings its site says are "further verified by human experts", unnamed, reported two minor issues in the four-dimensional paper, an incorrect lemma locator and a reversed description of a coordinate-map Jacobian, and no major issue; it has not reported on the three-dimensional paper. Added 20 October 2026. [13]

**Machine checking.** The release has no Lean statement, scope note or catalogue entry for either theorem. One uncatalogued file, `OAI/Analysis/Kakeya/FixedScale.lean`, defines the three-dimensional maximal conjecture as a formal proposition and proves groundwork about tube averages at a fixed scale; it does not prove the conjecture. So neither claim in this family is machine-checked. Uruk does not count kernel checks as approval in any case. [11]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; neither paper in this family is among them. On 26 October OpenAI added a manuscript on local smoothing for the wave equation, family 079, whose abstract claims the Kakeya maximal and set conjectures in every dimension; it is a separate paper, and this page describes only the two pinned papers of family 074. [12]

## Sources

1. OpenAI, "The Kakeya maximal conjecture in three dimensions", 23 September 2026. Theorem 1.1, Sections 1.1 to 1.3. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/The-Kakeya-maximal-conjecture-in-three-dimensions-September-23-2026/paper.pdf
2. OpenAI, "Every four-dimensional Kakeya set has full Hausdorff dimension", 24 September 2026. Theorem 1.1, Sections 1.1 to 1.3, Lemma 2.3 and its proof, Section 10. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Every-four-dimensional-Kakeya-set-has-full-Hausdorff-dimension-September-24-2026/paper.pdf
3. Wikipedia, "Kakeya set", read 17 October 2026. Kakeya's question, Besicovitch's construction and the statement of the conjectures. https://en.wikipedia.org/wiki/Kakeya_set
4. Hong Wang and Joshua Zahl, "Volume estimates for unions of convex sets, and the Kakeya set conjecture in three dimensions", arXiv 2502.17655, February 2025. https://arxiv.org/abs/2502.17655
5. Larry Guth, Hong Wang and Joshua Zahl, "A streamlined proof of the Kakeya set conjecture in R^3", arXiv 2601.14411, January 2026. https://arxiv.org/abs/2601.14411
6. Larry Guth, "The Kakeya conjecture, after Wang and Zahl", Bourbaki survey, arXiv 2604.03416, April 2026. The statement that the conjecture is open for n ≥ 4. https://arxiv.org/abs/2604.03416
7. Peter Hall and Joseph Howlett, "The most exciting claims from OpenAI's heap of new proofs", Scientific American, 8 October 2026, section "The Kakeya Conjecture". https://www.scientificamerican.com/article/the-most-exciting-claims-from-openais-heap-of-new-proofs/
8. The Verge, "'Pure insanity': Mathematicians will need years to make sense of OpenAI's latest drop", October 2026. Lichtman's remark. https://www.theverge.com/ai-artificial-intelligence/1008726/openai-mathematics-solutions-chaos
9. Post-Cutoff, "Rohan Pandey: 'kakeya conjecture in R^3 has been resolved'", correction entry, 6 to 7 October 2026. https://postcutoff.com/p/2026-10-06-khoomeik-kakeya-claim/
10. whataifound.org, "Kakeya maximal conjecture in three dimensions and the Kakeya set conjecture in four", entry dated 6 October 2026, read 17 October 2026. https://whataifound.org/finding/2026-10-06-kakeya-3d-maximal-4d
11. OpenAI, `lean/OAI/Analysis/Kakeya/FixedScale.lean` at the pinned commit, and the absence of a `lean/docs/074.md` and of catalogue entries in `lean/formalization.yaml`. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/OAI/Analysis/Kakeya/FixedScale.lean
12. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
13. OSVerify, "Every four-dimensional Kakeya set has full Hausdorff dimension", referee report, read 20 October 2026. https://osverify.github.io/cases/kakeya-4d.html
