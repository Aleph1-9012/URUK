---
family: "362"
topic: "The relativistic Vlasov-Maxwell system"
title: "Can a hot plasma tear itself apart in finite time?"
paperTitle: "Global classical solutions of the three-dimensional relativistic Vlasov-Maxwell system"
claim: "Every smooth, compactly supported, nonnegative initial particle density, together with smooth finite-energy initial fields satisfying the Gauss constraints, generates a unique global classical solution of the three-dimensional one-species relativistic Vlasov-Maxwell system, smooth on every finite time interval with compact momentum support there. No smallness or symmetry is assumed."
status: unreviewed
checked: 2026-10-18
papers:
  - preprints/Global-classical-solutions-of-the-three-dimensional-relativistic-Vlasov-Maxwell-system-September-23-2026/paper.pdf
draft: false
---

A plasma is a gas of charged particles. Each particle moves under the electric and magnetic fields, and the fields are created by the particles, so the whole thing feeds back on itself. When collisions are rare, as in a fusion reactor or the solar wind, the standard model is the Vlasov-Maxwell system: a transport equation for the density of particles in position and velocity, coupled to Maxwell's equations. Whether its smooth solutions stay smooth forever, or can develop a singularity in finite time, has been open since 1986, when Glassey and Strauss showed that the only way a solution can break down is for some particles to be accelerated to arbitrarily high momentum, and proved that this does not happen for sufficiently dilute plasmas. Forty years of work settled lower-dimensional versions, small data, and in July 2026 large data with cylindrical symmetry. On 23 September 2026 OpenAI posted a paper claiming the general case: for every smooth initial state with compactly supported particles, the three-dimensional relativistic system has a unique smooth solution for all time. [1][3][4]

As of 18 October 2026 no mathematician has said publicly that they have read or checked the proof. The status on this page is "unreviewed".

## The problem

The unknowns are a density $f(t,x,v)\ge0$ of particles at position $x\in\mathbb R^{3}$ with momentum $v\in\mathbb R^{3}$, and the electric and magnetic fields $E(t,x)$ and $B(t,x)$. A particle with momentum $v$ has relativistic velocity $u(v)=v/\sqrt{1+|v|^{2}}$, always below the speed of light, which is $1$ here. The one-species relativistic Vlasov-Maxwell system is

$$
\partial_tf+u(v)\cdot\nabla_xf+\bigl(E+u(v)\times B\bigr)\cdot\nabla_vf=0,
$$

$$
\partial_tE-\nabla\times B=-j_f,\qquad\partial_tB+\nabla\times E=0,\qquad\nabla\cdot E=\rho_f,\qquad\nabla\cdot B=0,
$$

where the charge density $\rho_f=\int f\,dv$ and the current $j_f=\int u(v)f\,dv$ are built from $f$. The first line says particles stream freely and are pushed by the Lorentz force; the second is Maxwell. There is no background charge. [1]

A smooth admissible datum is a triple $(f_0,E_0,B_0)$ with $f_0$ smooth, nonnegative and compactly supported in $(x,v)$, the fields smooth with all spatial derivatives bounded and square-integrable, and the two divergence constraints satisfied at time zero. A classical solution on $[0,T)$ is a $C^{1}$ triple solving the system pointwise, with finite-energy fields and with the support of $f$ compact on every compact time interval. Local existence and uniqueness go back to Wollman in 1984; the question is whether the local solution lives forever. [1]

**The global regularity problem.** Does every smooth admissible datum generate a classical solution for all time? [1]

<!-- uruk:visual-note
A visual for this page can run a one-dimensional caricature: particles on a line, their density, and the field they generate, with the user able to raise the temperature and watch whether the fastest particles run away. It can also show the geometry of the proof's main estimate, the backward light cone of one particle and the source particles crossing it. It cannot show the theorem.
-->

## Why it stayed open

### Forty years of partial answers

Glassey and Strauss proved in 1986 that a classical solution can be continued as long as the momentum support of $f$ stays bounded: breakdown requires particles accelerated without limit. In 1987 they proved global existence for initially dilute plasmas. Global existence was then proved in reduced settings, "one and one-half" and "two and one-half" dimensions and the planar case, by Glassey and Schaeffer, and for small data in many forms: Schaeffer, Bigorgne, Wang, and Wei and Yang, each with a smallness assumption on the particle density. New proofs of the continuation criterion came from Klainerman and Staffilani by Fourier methods and from Bouchut, Golse and Pallard in physical space, and Luk and Strain showed in 2014 that it suffices to control the momentum support after projection to a plane. In July 2026 Wang proved global existence for large data with cylindrical symmetry, in a different data class. DiPerna and Lions had shown global existence of weak solutions in 1989, but weak solutions need not be unique or smooth. [1][3][4]

Why the general case is hard: the field at a point is determined by particles on its backward light cone, through the retarded representation, and the most singular part of the force comes from source particles moving almost exactly along the light ray toward the receiver. Absolute-value estimates of that contribution lose a factor that grows with the receiver's energy, and that loss is what prevented a bound on the momentum support. [1]

## What OpenAI claims

**Theorem 1.1** (OpenAI, 23 September 2026). Every smooth admissible datum generates a unique global classical solution of the relativistic Vlasov-Maxwell system. For every finite $T$,

$$
f\in C^{\infty}([0,T]\times\mathbb R^{3}_x\times\mathbb R^{3}_v),\qquad E,B\in C^{\infty}([0,T]\times\mathbb R^{3}_x;\mathbb R^{3}),
$$

$f$ has compact phase-space support on $[0,T]$, and the two divergence constraints hold for all time. [1]

What this does and does not say. There is no size or symmetry restriction, a nonzero total charge with its Coulomb tail is allowed, and only spatial derivatives of the initial fields need be bounded. The bound on momentum support holds on each finite interval and may grow with it; the paper does not claim uniform-in-time bounds or describe the solution's behaviour as $t\to\infty$. It treats one species of particle and no background, and does not cover the nonrelativistic system or several species. [1]

## How the claimed proof goes

What follows is a map of the paper's argument from its introduction and from its Sections 2, 5 and 9. It is not a check of the details. [1]

**The idea.** By the Glassey-Strauss continuation criterion, in the $H^{5}$ form quoted by Luk and Strain, a classical solution extends past any finite time at which the particle momenta stay bounded. So blow-up requires a particle whose momentum becomes unbounded in finite time, and the proof shows this cannot happen: the time needed to double the largest momentum from $2^{n-1}$ to $2^{n}$ is at least $c/\log(2+1024\cdot2^{n})$, and the sum of these lower bounds diverges. The novelty is the estimate behind that bound, which concerns the signed change of a particle's momentum rather than the absolute size of the force. [1]

**The signed estimate (Section 2).** Fix a horizon $T_0$ and a classical solution on $[0,t_*]$. Along a characteristic $(X(t),V_X(t))$, the receiver, with $X'=u(V_X)$ and $V_X'=E+u(V_X)\times B$, the impulse is

$$
V_X(t_2)-V_X(t_1)=\int_{t_1}^{t_2}\bigl(E+u(V_X)\times B\bigr)(t,X(t))\,dt,
$$

and the norm is taken after integrating. Choose a dyadic $P\ge1024$ times the largest momentum on $[0,t_*]$, and write $L=\log(2+P)$ and $S(w)=P^{2}L/w$. Proposition 2.1: for each smooth admissible datum and finite $T_0$ there are constants $M,A\ge1$, independent of $t_*$ and $P$, such that on every interval $[t_1,t_2]$ on which the receiver's energy stays within a factor $8$ of a dyadic scale $w=2^{k}$,

$$
|V_X(t_2)-V_X(t_1)|\le MP\sqrt{t_2-t_1}+A(t_2-t_1)S(w).
$$

**Why it closes.** Suppose $T_{\max}<\infty$; then the momentum support is unbounded, so for large $n$ there is a first time $t_n$ at which the maximal energy $Q$ reaches $2^{n}$, and along the label attaining it a last earlier time $s_n$ at energy $2^{n-1}$. Applying the proposition on $[s_n,t_n]$ with $P=1024\cdot2^{n}$, $w=2^{n}$, and using that $q$ is $1$-Lipschitz, $2^{n-1}\le1024M\,2^{n}\sqrt{\Delta_n}+1024^{2}A\,2^{n}\Delta_n\log(2+1024\cdot2^{n})$, so one of the two terms is at least $2^{n-2}$ and $\Delta_n=t_n-s_n\ge c/\log(2+1024\cdot2^{n})$. Since $s_n\ge t_{n-1}$, the gaps $t_n-t_{n-1}$ have a divergent sum, contradicting $t_n<T_{\max}$. [1]

**The retarded force and the direct bounds (Sections 3 to 5).** The fields at the receiver are written by the retarded representation as integrals over the sources at their intersections with the receiver's backward light cone, with explicit electric and magnetic kernels (Proposition 3.3). The source contribution is divided into bins by momentum, distance $r$, and the angles between the source velocity $u$, the receiver velocity $a$ and the light-ray direction $n$; energy flux through the cone (Lemma 3.1, transport and cone energy) and bounds on the time sources spend in each bin ("occupation", Section 4, Proposition 4.3, with a joint energy budget across distance and source-angle bins) give the direct, absolute-value estimates of Section 5. At receiver energy $w$ these come with an extra factor $\sqrt w$ relative to what the signed estimate needs, and the loss is localized: it occurs when the source velocity is much closer to the light-ray direction than the receiver velocity is. [1]

**Cancellation along the source (Section 6).** In that narrow angular region the paper integrates the retarded force along the source trajectory before taking absolute values. The Signed Force Identity (Lemma 6.1) rewrites the two interior kernel terms, the one carrying the source acceleration and the transport term, as a total derivative $-(k_0/(rd))'$ along the source path plus two less singular bulk terms: one, $\mathcal R$, with the geometric factor $n/(q_X^{2}D)-a$, and one, $\mathcal A$, proportional to the receiver's acceleration $a_t$. The part of the force without source acceleration cancels a term produced by differentiating the cone geometry, which is the point of the identity. The receiver acceleration is expressed through $V_X'$, so $\mathcal A$ becomes an error proportional to the receiver force itself, and the proof must control its coefficient along with the integration-by-parts boundary terms; smooth cutoffs confine the whole manoeuvre to the small angular sector, and a weighted signed formula (Proposition 6.3) carries a time weight that vanishes at the interval endpoints. [1]

**Two uses of the identity (Sections 7 and 8).** Both run under an assumed bound on all signed increments, the bootstrap hypothesis. First, projected perpendicular to a particle's momentum, the identity bounds the number of changes of direction of a prescribed angular size, using only the preliminary occupation and direct estimates (Lemma 7.1). When both source and receiver momenta are large, this direction control improves the occupation bound at intermediate relative angles, since between direction changes the relative motion crosses the contributing region monotonically (Lemma 7.2). Second, Section 8 selects only the bins whose direct estimates exceed a summable threshold; the rest already satisfy the required bound. On the selected bins the coefficient multiplying the receiver force sums to at most a constant times $w^{-1/2}$, which exactly compensates the $\sqrt w$ loss, and the selection inequalities push any possible obstruction to this bound into the angular window where the improved occupation rules it out. [1]

**Closing the bootstrap (Section 9).** With $\mathcal B_w(I)=MP\sqrt I+AIS(w)$ the target bound on an interval of length $I$, the case $\mathcal B_w(I)\ge32w$ is trivial since momenta are at most $8w$; otherwise $I\le(w/P)^{2}$ and the weighted estimate applies with a Lipschitz cutoff $\psi$ equal to one away from two edge intervals of length $\eta I$. The assumed signed bound restores the short endpoint intervals, the constants give a strict improvement of the bootstrap hypothesis uniformly on the compact interval, and continuity removes the assumption. [1]

**Continuation for the paper's field class (Section 10).** The theorem allows initial fields that are smooth, bounded and of finite energy but not in the Sobolev spaces the Luk-Strain criterion assumes. The paper keeps the initial Coulomb field, cuts off the vector potentials of the divergence-free remainders, and observes that the removed part evolves as a vacuum Maxwell field that vanishes throughout the particle region for the chosen horizon (the smooth finite-energy vacuum fields lemma of Section 10), so the particle dynamics are unchanged while the criterion's hypotheses are met; the reasoning summary released with the paper describes this Coulomb decomposition as a step that was needed. [1][2]

Where would an expert look first? At the Signed Force Identity and its application in the narrow sector, which is what distinguishes the signed estimate from the classical absolute one; at the selection argument of Section 8, where the coefficient of the receiver force must sum to $O(w^{-1/2})$; at the occupation bounds with a joint energy budget; and at the continuation section, where the criterion is applied to fields that are only bounded with square-integrable values. [1]

## Consequences inside mathematics

If the proof holds, the large-data global regularity problem for the three-dimensional relativistic Vlasov-Maxwell system is settled, closing the question left open by Glassey and Strauss in 1986 and the most studied open problem in collisionless kinetic theory. Uniqueness among classical solutions comes with it. The signed-impulse method may apply to related systems, though the paper claims nothing beyond the one-species relativistic case; the nonrelativistic Vlasov-Maxwell system and multi-species models remain open. [1]

## Uses outside mathematics

No known direct application.

The Vlasov-Maxwell system is the working model of collisionless plasmas in fusion devices, the magnetosphere and the solar wind, and the theorem says that the model never predicts a singularity from smooth initial data. That is a statement about the model's self-consistency. Plasma physicists simulate the equations numerically whatever their regularity theory says, and the theorem gives no quantitative bounds they could use. [3]

## Has anyone checked it?

We found no named mathematician who says they are reading or checking this paper, and no public comment from Luk, Strain, Klainerman, Pallard, Bigorgne or Glassey, whose work it builds on. VibeMathed records no check by an independent mathematician and notes that the Lean statement's hand-written definitions have not been audited against the paper. [5]

**Machine checking.** The release's Lean statement `VlasovMaxwell.lean` is 112 lines and is listed in the catalogue `formalization.yaml`. It defines the system itself from Mathlib's derivative and integral primitives, including admissible data, classical solutions and the Gauss constraints, and states global existence, smoothness on finite intervals, compact support and uniqueness. Because every definition is self-built, a reader should check them against the paper before trusting what was formalized. This family also has one of the ten reasoning summaries OpenAI released, which narrates the search for the signed estimate. We found no outside replay. A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval. [2][6]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; this paper is not among them. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [7]

## Sources

1. OpenAI, "Global classical solutions of the three-dimensional relativistic Vlasov-Maxwell system", 23 September 2026. Theorem 1.1, the historical context and the proof strategy. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Global-classical-solutions-of-the-three-dimensional-relativistic-Vlasov-Maxwell-system-September-23-2026/paper.pdf
2. OpenAI, "Summarized chain of thought (Global classical solutions of the three-dimensional relativistic Vlasov-Maxwell system)", reasoning summary in openai/math. https://raw.githubusercontent.com/openai/math/master/reasoning_traces/relativistic-vlasov-maxwell.pdf
3. Robert T. Glassey and Walter A. Strauss, "Singularity formation in a collisionless plasma could occur only at high velocities", Archive for Rational Mechanics and Analysis 92 (1986), 59-90. https://doi.org/10.1007/BF00250732
4. Jonathan Luk and Robert M. Strain, "A new continuation criterion for the relativistic Vlasov-Maxwell system", Communications in Mathematical Physics 331 (2014), 1005-1027. The abstract calls global existence for regular finite-energy data "a longstanding open problem". https://doi.org/10.1007/s00220-014-2108-8
5. VibeMathed, "Global classical solutions of the 3D relativistic Vlasov-Maxwell system for large data", read 18 October 2026. https://vibemathed.com/problem/relativistic-vlasov-maxwell-global-regularity
6. OpenAI, Lean scope note for family 362 and the comparator statement `VlasovMaxwell.lean` at the pinned commit. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/362.md and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/VlasovMaxwell.lean
7. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
