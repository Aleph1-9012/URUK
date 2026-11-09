---
family: "366"
topic: "The Mumford-Shah conjecture"
title: "What do the edges of an optimally segmented image look like?"
paperTitle: "Interior regularity of planar Mumford-Shah minimizers"
claim: "For every reduced absolute minimizer (u, K) of the planar Mumford-Shah functional with bounded data g in a bounded Lipschitz domain, every point of the discontinuity set K has a neighbourhood in which K is a single C^(1,α) arc, an arc ending at that point, or three such arcs meeting at 120 degrees; and only finitely many connected components of K meet any relatively compact open subset. This is the interior regularity assertion of the Mumford-Shah conjecture."
status: unreviewed
checked: 2026-10-20
papers:
  - preprints/Interior-regularity-of-planar-Mumford-Shah-minimizers-September-24-2026/Interior-regularity-of-planar-Mumford-Shah-minimizers-September-24-2026.pdf
draft: false
---

In 1989 David Mumford and Jayant Shah proposed a way to segment an image into regions: find a smooth approximation $u$ of the picture $g$, allowed to jump across a set $K$ of edges, that minimizes the sum of three costs, the roughness of $u$ away from the edges, the total length of the edges, and the distance from the original image. The model became the foundation of variational image processing. Its mathematics is a free discontinuity problem, where both the function and the set where it jumps are unknown, and Mumford and Shah conjectured what the optimal edge set looks like: in the interior of the image, a finite union of smooth arcs, each either continuing, ending at a free "crack tip", or meeting two others at exactly $120$ degrees, like the junctions in a soap foam. Existence of minimizers was proved by De Giorgi, Carriero and Leaci; Bonnet introduced the blow-up approach in 1996 and classified the global minimizers whose edge set is connected; David, and Ambrosio, Fusco and Pallara, proved that most of the edge set is smooth; Bonnet and David proved the crack tip is a global minimizer; De Lellis and Focardi wrote the monograph. The last obstacle was to exclude a bounded piece of edge floating in a blow-up limit. In September 2026 two proofs appeared within two days: a preprint by Francesco Deangelis of Münster, who writes that he obtained it with ChatGPT and was still checking it, and on 24 September a paper from OpenAI's release. [1][2][3]

As of 20 October 2026 no mathematician has said publicly that they have read or checked either proof. The status on this page is "unreviewed".

## The problem

Let $\Omega\subset\mathbb R^{2}$ be a bounded Lipschitz domain and $g\in L^{\infty}(\Omega)$ the image. A pair $(u,K)$ is admissible if $K\subset\Omega$ is relatively closed with finite length $\mathcal H^{1}(K)<\infty$, $u\in L^{2}(\Omega)$, and $u$ is in the Sobolev space $W^{1,2}$ off $K$. The energy on an open set $V$ is

$$
\mathcal F_g(u,K;V)=\int_{V\setminus K}|\nabla u|^{2}\,dx+\mathcal H^{1}(K\cap V)+\int_V|u-g|^{2}\,dx.
$$

An absolute minimizer beats every competitor that differs from it only inside a compact subset of $V$; it is reduced if $K$ carries positive length near each of its points, which removes invisible pieces of zero length. [1]

**The Mumford-Shah conjecture (1989), interior part.** For a reduced minimizer in the plane, $K$ is locally a finite union of $C^{1}$ arcs with free endpoints and triple junctions at $120$ degrees, and nothing else. [1][2]

<!-- uruk:visual-note
A visual for this page is an image segmented by the Mumford-Shah model, with its edge set coloured by type, regular arc, crack tip and $120$-degree triple junction; a zoom into a crack tip showing the gradient blowing up like the inverse square root of the distance; and a diagram of a blow-up limit with a floating bounded component that the proof forbids. The paper has one TikZ figure, of the compact translation. [1]
-->

## Why it stayed open

What was known. The special-BV framework of De Giorgi and Ambrosio gives existence; David and Ambrosio-Fusco-Pallara proved that $K$ is a smooth arc near almost every point and David developed the triple-junction theory; Bonnet's blow-up and monotonicity method classifies the global minimizers whose edge set is connected as a line, a half-line (the crack tip) or a triod; David and Léger showed a global minimizer whose edge disconnects the plane is a line or a triod. By the theory assembled in De Lellis and Focardi's 2025 monograph, the interior conjecture is equivalent to classifying the blow-up limits, and the one remaining case is a limit whose edge set has connected complement but may contain a bounded connected component. Labourie and Lemenant proved in 2026 that minimizers have finitely many traces. [1]

Why that case is hard. A bounded component of a global minimizer's edge would be a closed curve, or a bounded tree, across which the function jumps, floating at positive distance from the rest of the edge; one must show that removing it, or moving it, lowers the energy, without any assumption on its shape. [1]

## What OpenAI claims

**Theorem** (OpenAI, 24 September 2026). Let $(u,K)$ be a reduced absolute minimizer in a bounded Lipschitz domain $\Omega\subset\mathbb R^{2}$ with $g\in L^{\infty}(\Omega)$. Every $x\in K$ has an interior neighbourhood in which $K$ is, with $C^{1,\alpha}$ arcs for some $\alpha>0$, (i) a single embedded arc with $x$ in its interior, (ii) a single embedded arc ending at $x$, or (iii) three embedded arcs meeting only at $x$ with pairwise angles of $120$ degrees. Moreover, for every open $U$ compactly contained in $\Omega$, only finitely many global connected components of $K$ meet $U$. [1]

**Corollary.** $\nabla u\in L^{4,\infty}_{\mathrm{loc}}(\Omega)$ and $\nabla u\in L^{p}_{\mathrm{loc}}$ for every $p<4$, the exponent reflecting the inverse-square-root gradient at a crack tip. [1]

What this does and does not say. The theorem is interior: nothing is asserted about finiteness or regularity up to the boundary of $\Omega$. The components counted are components of $K$ itself, not of a truncation. The arcs are $C^{1,\alpha}$; higher regularity is not part of the statement. [1]

## How the claimed proof goes

What follows is a map of the paper's argument from its introduction and from Sections 2 to 6, which were read in full. It is not a check of the details. [1]

**The statement.** Theorem 1.1: for a reduced absolute minimizer $(u,K)$ of the Mumford-Shah functional in a bounded Lipschitz domain $\Omega\subset\mathbb R^{2}$ with bounded data $g$, every point $x\in K$ has an interior neighbourhood in which $K$ is a single embedded $C^{1,\alpha}$ arc through $x$, a single arc ending at $x$, or three arcs meeting only at $x$ at $120$-degree angles; and every open $U$ compactly inside $\Omega$ meets only finitely many global connected components of $K$. The compact-set qualification is essential: nothing is asserted up to the boundary of $\Omega$, and the components counted are components of $K$, not of $K\cap U$. [1]

**Reduction (Section 2).** The paper first passes from the finite-length formulation to a locally bounded rectifiable minimizing pair without changing it (Proposition 2.1, reduction to a rectifiable pair), by clipping $u$ in disks and a Dirichlet comparison with smooth approximations of the boundary trace (Lemma 2.2, the smooth-data Dirichlet input). This is where the hypothesis $g\in L^{\infty}$ is used. [1]

**Blow-up and what is imported (Section 3).** At an interior point $x$ and scales $r_j\downarrow0$, the rescaled pairs $K_j=(K-x)/r_j$, $u_j(y)=u(x+r_jy)/\sqrt{r_j}$ have, along a subsequence, a global generalized limit $(v,H,\{p_{kl}\})$: a closed rectifiable set $H$ of locally finite length containing the origin, a function $v$ in $W^{1,2}$ off $H$ on bounded sets, and additive constants $p_{kl}$ recording the differences between complementary components (Proposition 3.1(i), from De Lellis and Focardi). If $\mathbb R^{2}\setminus H$ is connected, $(v,H)$ is an absolute minimizer of the zero-fidelity energy $E_0$ under every compactly supported change, including changes whose support meets $H$ (Proposition 3.1(ii)). The remaining items of Proposition 3.1 collect the planar theory used: the length measure of $H$ is concentrated on points with arc neighbourhoods, a limit whose set disconnects the plane is already classified, at most one component is unbounded, and the energy grows at most linearly, $\int_{B_R}|\nabla v|^{2}\le C(1+R)$. So the classification reduces to excluding a bounded component of $H$ when the complement is connected. [1]

**Isolating a compact piece (Section 4).** Lemma 4.1 enlarges a hypothetical bounded component to a compact piece $A\subset H$ of positive length at positive distance from the closed remainder $B=H\setminus A$, and since length is concentrated on arc points, $A$ contains an open subarc of $H$ that is an embedded $C^{1}$ arc. [1]

**Excluding the piece (Section 5).** Proposition 5.1: under these hypotheses no such $A$ exists. The idea is electrostatic, and the paper cites Earnshaw's no-stable-equilibrium principle as the motivating analogy while noting it gives no sign rule for bounded-domain variations. Choose a smooth cutoff $\chi$ equal to one near $A$ and supported away from $B$; Lemma 5.2 projects the compactly supported function $\chi v$ onto a potential $\phi$ whose gradient is square-integrable on the whole plane, and the gradient is split as $v=f+F$ with $F=\chi v-\phi$, which carries the jumps across $A$ and decays at infinity, and $f=(1-\chi)v+\phi$, which is harmonic across $A$. Translating $A$ together with $F$ leaves the length of $A$ and the Dirichlet energy of $F$ unchanged, and $f$ can be held fixed; Lemma 5.3 justifies the finite-disk comparisons by returning to the original function far away, and Lemma 5.4 shows that the interaction $I_p(t)=\langle p_t,\nabla f\rangle$ between the translated jump field and the harmonic field is harmonic in the translation parameter $t$, by the identity $\Delta_t\langle p_t,\zeta G\rangle=-\langle\operatorname{curl}p_t,\operatorname{curl}(\zeta G)\rangle=0$, since $\operatorname{curl}p_t$ is supported on $A_t$ where $\zeta G$ is curl-free. Minimality says $t=0$ is a minimum of a harmonic function, so the interaction is constant. Then independent changes of the jump values along the regular subarc of $A$, tested against this constancy, force the harmonic potential to be affine; the linear energy growth bound makes its gradient zero; the value-variation identity makes the remaining field zero; and removing $A$ saves positive length at no energy cost, a contradiction. The paper contrasts this with Deangelis's route through relaxed second variations, equality in a planar Hodge identity and holomorphic rigidity, noting that both use whole-plane projections and value variations with independently prescribed one-sided traces on a regular arc. [1][3]

**Back to the minimizer (Section 6).** Corollary 6.1 classifies every global generalized limit: empty, a line, a half-line, or a $120$-degree triod. The proof: if $H$ disconnects the plane the imported classification applies; otherwise $(v,H)$ is absolutely minimizing, a bounded component would give an isolated compact piece containing a regular arc, Proposition 5.1 excludes it, so $H$ has no bounded component and at most one unbounded one, hence is empty or connected, and the imported classification finishes. Epsilon regularity, from David and from Ambrosio, Fusco and Pallara, transfers the three models to the original minimizer near $x$; a finite cover of $K\cap\overline U$ by such neighbourhoods gives the component count; and Corollary 6.3 records a local weak-$L^{4}$ gradient bound. [1]

Where would an expert look first? At Lemma 5.4, the harmonicity of the interaction in the translation parameter, and at the step from its constancy plus jump-value variations to the affine conclusion, which is the whole new content; at the exact hypotheses of the De Lellis-Focardi and Ambrosio-Fusco-Pallara theorems invoked in Proposition 3.1 for bounded measurable data; and at the reduction to a rectifiable pair. The paper is short enough to read in full and to compare line by line with Deangelis's Proposition 3.1. [1][3]

## Consequences inside mathematics

If the proof holds, the Mumford-Shah conjecture is settled in the plane in its interior form, completing a programme that occupied the calculus of variations for thirty-five years and confirming that the classification of global minimizers, line, crack tip and triod, is complete. The boundary behaviour and the higher-dimensional conjecture, where the edge set should be a union of smooth hypersurfaces with prescribed singularities, remain open. [1]

## Uses outside mathematics

The Mumford-Shah functional is used in image segmentation, denoising and inpainting, in fracture mechanics, where $K$ is a crack and the $120$-degree junctions and inverse-square-root crack-tip gradients are the physical expectations, and in materials science through the Ambrosio-Tortorelli phase-field approximation. The theorem says the model's minimizers have exactly the local structure these applications assume; it does not change the algorithms, which compute approximate minimizers numerically. [1][2]

## Has anyone checked it?

Two days before OpenAI's paper, Francesco Deangelis of the University of Münster posted "Solution of the Mumford-Shah conjecture" with an author's note saying he obtained the proof on 9 September 2026 "using ChatGPT Astra", had been checking it and planned to improve it, and released the "AI-generated draft" after OpenAI's 21 September announcement "to document the chronology". OpenAI's paper cites his preprint. So the conjecture has two AI-generated proofs, by different arguments, and neither has a public check by a named expert; we found no comment from De Lellis, Focardi, David, Lemenant, Labourie or Figalli. VibeMathed records no check by an independent mathematician. [3][4]

**Machine checking.** None. Family 366 has no Lean scope note and no comparator statement in the release. [5]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; this paper is not among them. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [6]

## Sources

1. OpenAI, "Interior regularity of planar Mumford-Shah minimizers", 24 September 2026. The problem, the main theorem, the history and the proof strategy. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Interior-regularity-of-planar-Mumford-Shah-minimizers-September-24-2026/Interior-regularity-of-planar-Mumford-Shah-minimizers-September-24-2026.pdf
2. David Mumford and Jayant Shah, "Optimal approximations by piecewise smooth functions and associated variational problems", Communications on Pure and Applied Mathematics 42 (1989), 577-685. https://doi.org/10.1002/cpa.3160420503
3. Francesco Deangelis, "Solution of the Mumford-Shah conjecture", arXiv:2609.26732, 22 September 2026, with its author's note. https://arxiv.org/abs/2609.26732
4. VibeMathed, "The Mumford-Shah conjecture, planar interior regularity", read 20 October 2026. https://vibemathed.com/problem/mumford-shah-conjecture-planar-interior
5. OpenAI, `lean/docs/` and `lean/formalization.yaml` at the pinned commit, which contain no entry for family 366. https://github.com/openai/math/tree/4eaee87548250b2682affda7d05d947c05554bae/lean/docs
6. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
