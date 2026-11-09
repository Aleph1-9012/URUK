---
family: "304"
topic: "The Hilbert-Smith conjecture"
title: "Which groups can move a space around continuously?"
paperTitle: "The Hilbert-Smith conjecture in every finite dimension"
claim: "Every locally compact second-countable Hausdorff group acting faithfully and jointly continuously on a connected second-countable topological manifold without boundary, of any finite dimension, is a Lie group. Equivalently, the p-adic integers admit no faithful continuous action on any such manifold."
status: unreviewed
checked: 2026-10-18
papers:
  - preprints/The-Hilbert-Smith-conjecture-in-every-finite-dimension-September-23-2026/paper.pdf
draft: false
---

The symmetries of a circle form a circle; the rotations of a sphere form a three-dimensional group; these are Lie groups, smooth objects on which one can do calculus. In 1900 Hilbert asked, as the fifth of his twenty-three problems, whether the smoothness is automatic: if a group of transformations is merely continuous, must it be a Lie group? For groups that are themselves manifolds the answer is yes, proved by Gleason, Montgomery and Zippin in 1952. The sharper form, named for Hilbert and for Paul Smith, asks about any locally compact group that acts faithfully on a connected manifold, and the structure theory reduces it to a single strange case: can the $p$-adic integers, a compact group that looks like a Cantor set, act faithfully by homeomorphisms on a manifold? For dimensions one and two the answer was classical; John Pardon proved it for three-manifolds in 2013; for smooth, Lipschitz or quasiconformal actions it was known in all dimensions. The general topological case in dimension four and up stayed open. On 23 September 2026 OpenAI posted a paper claiming it in every dimension. [1][3][4]

As of 18 October 2026 no mathematician has said publicly that they have read or checked the proof. The status on this page is "unreviewed".

## The problem

A topological group is locally compact if every point has a compact neighbourhood; the real line, the circle, every Lie group and the $p$-adic integers all qualify. An action of a group $G$ on a manifold $M$ is a continuous map $G\times M\to M$ compatible with the group law; it is faithful if no element other than the identity fixes every point. Faithful does not mean free: individual points may have large stabilizers. [1]

**Hilbert-Smith conjecture.** A locally compact group acting faithfully and continuously on a connected topological manifold is a Lie group. [1][3]

The reduction. By the structure theory of Gleason, Montgomery, Zippin and Yamabe, a locally compact group that is not a Lie group contains a copy of the $p$-adic integers

$$
\mathbb Z_p=\varprojlim_k\mathbb Z/p^{k}\mathbb Z
$$

for some prime $p$, the completion of the integers in which two numbers are close when their difference is divisible by a high power of $p$. So the conjecture is equivalent to: $\mathbb Z_p$ has no faithful continuous action on a connected manifold. Equivalently, every continuous action of $\mathbb Z_p$ factors through a finite quotient $\mathbb Z/p^{k}\mathbb Z$. [1][3]

<!-- uruk:visual-note
A visual for this page can show the $p$-adic integers as a tree of nested discs, $p$ branches at each level, with the group operation as a carry; and the question as an attempt to let that tree act on a surface, where every finite level acts by a periodic map and the limit must do something impossible. The theorem cannot be drawn.
-->

## Why it stayed open

What was known. The cases of one- and two-manifolds are classical and were given a modern account by Pardon in 2019. Pardon's 2013 proof for three-manifolds finds an invariant set that looks like a genus-two handlebody, extracts a surface that is its approximate boundary, and obtains a cyclic subgroup of the surface's mapping class group that contradicts a theorem of Nielsen. [2] In all dimensions the conjecture holds under regularity assumptions on the transformations: differentiable actions by Bochner and Montgomery in 1946, Lipschitz actions on Riemannian manifolds by Repovš and Ščepin in 1997 [4], Hölder actions with exponent above $n/(n+2)$ by Maleshich, quasiconformal actions by Martin in 1999, and, recently, actions by Hamiltonian-type homeomorphisms of certain symplectic manifolds by Shelukhin. A faithful $\mathbb Z_p$-action would have an orbit space of larger cohomological dimension than the manifold, by work of Yang and of Bredon, Raymond and Williams, which is what the metric arguments exploit; a merely continuous action gives no metric to average. [1][3]

## What OpenAI claims

**Theorem** (OpenAI, 23 September 2026; the Hilbert-Smith conjecture). Let $n\ge1$. A locally compact second-countable Hausdorff group acting faithfully and jointly continuously on a connected Hausdorff second-countable topological $n$-manifold without boundary is a Lie group. [1]

**Theorem** ($p$-adic exclusion). For every $n\ge1$ and prime $p$, every jointly continuous action of $\mathbb Z_p$ on a connected Hausdorff second-countable topological $n$-manifold without boundary has nonzero kernel, hence factors through a finite quotient. [1]

What these do and do not say. The manifold may be noncompact, nonorientable or nontriangulable, and arbitrary stabilizers and fixed points are allowed; no dimension bound on the orbit space is assumed. Manifolds with boundary are not covered by the statement as given. A corollary stated in the introduction settles a conjecture of Pardon on dynamics: if a homeomorphism $f$ generates a group with compact closure, some iterate $f^{m}$ is the time-one map of a continuous flow. [1]

## How the claimed proof goes

What follows is a map of the paper's argument from its introduction and section plan. It is not a check of the details. The tools are sheaf theory and Witt groups, a different toolkit from any previous attack on the problem. [1]

**The idea.** A faithful action of the $p$-adic integers $\mathbb Z_p$ on an $n$-manifold would, for every $k$, let one chop a certain integer-valued invariant into $p^{k}$ equal pieces. The invariant lives in a fixed lattice, with denominators bounded by an integer $L_d$ chosen before $k$. So the pieces are $(4/p^{k})$ times a generator, which is not in the lattice once $p^{k}>4L_d$. The invariant is a signature-like Witt class of the direct image of a constant sheaf under a continuous map into a sphere, and the whole paper is the construction of that invariant, the proof that it has bounded denominators, and the proof that a $p$-adic action chops it. [1]

**The local reduction.** Newman's 1931 theorem says a finite-order homeomorphism of a connected manifold that fixes a nonempty open set pointwise is the identity. Following Pardon's local reduction, a small open subgroup $G\cong\mathbb Z_p$ acts faithfully, preserving orientation, on a connected invariant open subset $O$ of one coordinate chart in $\mathbb R^{n}$, with no regularity imposed on the transformations or on the boundary of $O$. Choose an odd $d>n$, $d\ge3$, and let $G$ act on $W=O\times\mathbb R^{d-n}\subset\mathbb R^{d}$ trivially in the added coordinates; this odd stabilization is the only dimensional choice, and both odd residues of $d$ modulo $4$ are treated. [1]

**The invariant (Section 2).** For a finite polyhedron $X$, let $\mathcal T(X)$ be the thick subcategory of the bounded derived category of real sheaves on $X$ generated by the direct images $Rf_*\mathbb R_B$ of compact polyhedra $B$ under arbitrary continuous maps $f:B\to X$: everything obtained from these by finite sums, shifts, cones and summands. The stalks of such objects need not be finite-dimensional and the objects need not be constructible, but Proposition 2.3 shows that Verdier duality restricts to $\mathcal T(X)$, proved from simplex generators (Lemma 2.2). Then $E_r(X)=W_r(\mathcal T(X))$ is the Witt group of nonsingular symmetric forms for the shifted duality $[-r]\mathbb D_X$, in Balmer's triangular framework, with forms that admit a lagrangian set to zero; this makes the invariant additive while keeping the integrality of ordinary signature. Theorem 2.9 proves homotopy invariance through products with the interval and a comparison of the two endpoint forms. The named antecedents are Woolf's constructible Witt groups and cylinder relation and Ranicki and Weiss's chain-level rational Pontryagin classes. [1]

**The lattice (Sections 3 and 4).** On the test sphere, $E_d(S^{d})\otimes\mathbb Q$ is one-dimensional, spanned by an orientation class $\bar u_d$, and the image of the integral group lies in $L_d^{-1}\mathbb Z\bar u_d$ (Theorem 4.7, the fixed sphere lattice). To bound the denominators, compare with the subcategory generated by semialgebraic maps, where finite Witt relations can be evaluated by ordinary integral signatures on a chosen oriented ball (Proposition 4.6, signature on a finite semialgebraic relation). Two arguments transfer that integrality to the continuous category. Cutting off the polyhedral sources identifies quotient morphisms with germs near a closed set (Theorem 3.3, the germ description). And a full dense triangulated inclusion with duality, in which every object of the larger category is a summand of one from the smaller, admits a map on Witt groups in the reverse direction whose two composites are multiplication by $2$, so the kernel and cokernel have exponent two; this is Hornbostel and Schlichting's cofinality theorem (Theorem 3.6, dense doubling). Localization on a finite cover of the sphere bounds the comparison by a fixed power of $2$ in every degree, which is $L_d$. The paper notes that rational equivalence alone would lose the denominator bound, and that neither step requires the images of arbitrary continuous maps to be constructible. [1]

**How the action chops the class (Sections 5 and 6).** Form the one-point compactification $W^{+}$, its orbit space $Y=W^{+}/G$, and maps $S^{d}\xrightarrow{c}W^{+}\xrightarrow{q}Y\xrightarrow{t}X$ into a compact polyhedron $X$, with the image point $b$ of $\infty$ having contractible neighbourhoods. Put $f_t=tqc$ and $A_t=Rf_{t*}\mathbb C_{S^{d}}$, with $\mathbb C$ as a real plane carrying the pairing $\operatorname{Re}(z\bar w)$; pushing forward the pairing with the orientation gives a degree-$d$ form $\alpha_t$ on $A_t$. Away from $b$ the map is proper from an oriented open subset of $W$, and the characters of $G$, identified with the $p$-power roots of unity $\Lambda$, split $A_t$ there into character parts; a finite partition of $\Lambda$ into $m$ pieces gives orthogonal projectors $e_i$. A projector need not extend over $b$, so the paper works in the quotient by objects compactly supported in a contractible neighbourhood of $b$, where the self-adjoint involutions $2e_i-1$ give forms $[A_t,\alpha_t]+[A_t,\alpha_t(2e_i-1)]$; an integral localization isomorphism (Proposition 4.9, a contractible open set can be localized away) lifts these to classes $z_i(t)\in E_d(X)$ with $\sum_iz_i(t)=2[A_t,\alpha_t]$ by an explicit matrix isometry. [1]

**Equal parts (Sections 5 and 6).** Averaging a map supported in a ball gives a test $a:Y\to S^{d}$ with $\deg(aqc)=1$ (Lemma 5.3). For each $k$, faithfulness gives a nonempty open region $V\subset W/G$ over which $W/(p^{k}G)\to W/G$ is a covering by $p^{k}$ labelled sheets. Serre's results on the homotopy groups of odd spheres provide a self-map $D_s$ of $S^{d}$ of degree $s>0$ such that $D_sa$ is homotopic to a map constant outside $V$; over $V$ a locally constant coefficient isometry permutes $p^{k}$ chosen character parts cyclically. Covariance and homotopy invariance equate the rational images $s\bar z_i(a)$, and cancelling the nonzero scalar $s$ equates the $\bar z_i(a)$ while the integral classes stay in the fixed lattice. Their sum is $4\bar u_d$ (Proposition 6.4), one factor of $2$ from the real coefficient plane and one from the involution construction; Propositions 6.5 to 6.7 give covariance, homotopy invariance and the equality of the parts, and Theorem 6.8 the contradiction. Each is therefore $(4/p^{k})\bar u_d$, outside the lattice for $p^{k}>4L_d$. The paper remarks that only the manifold sources and the test spaces carry Verdier duality; the orbit spaces, whose dimension is not controlled, enter only through ordinary direct images, averaging and Čech cohomology. [1]

Where would an expert look first? At Proposition 2.3, the claim that Verdier duality restricts to the category generated by arbitrary continuous images, which is where the paper departs from constructible sheaf theory; at the dense-doubling and cutoff arguments that produce $L_d$, and at whether the finite cover of the sphere really gives a bound independent of everything else; and at the construction of the classes $z_i$ through the localization isomorphism and the odd-sphere degree argument that makes them equal. [1]

## Consequences inside mathematics

If the proof holds, the Hilbert-Smith conjecture is settled in every finite dimension, completing the programme that began with Hilbert's fifth problem and the Gleason-Montgomery-Zippin theorem; Pardon's three-dimensional theorem becomes a special case. Pardon's dynamical conjecture about almost periodic homeomorphisms follows. The signature-lattice invariant built from continuous images of polyhedra is new and may have other uses in the topology of manifolds without smooth structure. [1]

## Uses outside mathematics

No known direct application.

## Has anyone checked it?

We found no named mathematician who says they are reading or checking this paper, and no public comment from Pardon, Repovš, Martin or Shelukhin. A MathOverflow question posted and closed within days of the release came from a user who had worked on the problem in the past and had produced an AI-assisted audit that, in their words, "just seemed to find places for 'experts in certain areas' to look further"; the single answer advised waiting for expert consensus. Wikipedia's article on the conjecture records the claim. VibeMathed records no check by an independent mathematician and gives this family the highest significance score of any in week 5. [3][5][6]

**Machine checking.** None. Family 304 has no Lean scope note and no comparator statement in the release. [7]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; this paper is not among them. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [8]

## Sources

1. OpenAI, "The Hilbert-Smith conjecture in every finite dimension", 23 September 2026. Both theorems, the predecessors section, the duality and signatures section and the lattice obstruction. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/The-Hilbert-Smith-conjecture-in-every-finite-dimension-September-23-2026/paper.pdf
2. John Pardon, "The Hilbert-Smith conjecture for three-manifolds", Journal of the American Mathematical Society 26 (2013), 879-899. https://doi.org/10.1090/S0894-0347-2013-00766-3
3. Wikipedia, "Hilbert-Smith conjecture", read 18 October 2026. The reduction to $\mathbb Z_p$, the Repovš-Ščepin, Martin and Pardon results, and the paragraph recording the OpenAI claim. https://en.wikipedia.org/wiki/Hilbert%E2%80%93Smith_conjecture
4. Dušan Repovš and Evgenij Ščepin, "A proof of the Hilbert-Smith conjecture for actions by Lipschitz maps", Mathematische Annalen 308 (1997), 361-364. https://doi.org/10.1007/s002080050080
5. MathOverflow, "How to complete an AI generated verification of an OpenAI proof for the Hilbert-Smith Conjecture", question 515824 (closed), read 18 October 2026. https://mathoverflow.net/questions/515824/how-to-complete-an-ai-generated-verification-of-an-openai-proof-for-the-hilbert
6. VibeMathed, "Hilbert-Smith conjecture", read 18 October 2026. https://vibemathed.com/problem/hilbert-smith-conjecture
7. OpenAI, `lean/docs/` and `lean/formalization.yaml` at the pinned commit, which contain no entry for family 304. https://github.com/openai/math/tree/4eaee87548250b2682affda7d05d947c05554bae/lean/docs
8. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
