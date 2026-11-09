---
family: "146"
topic: "Entropy of the standard map"
title: "Is the textbook model of chaos actually chaotic, in a way that fills space?"
paperTitle: "Positive Metric Entropy for the Standard Map at Large Parameters"
claim: "For every sufficiently large parameter k, the standard map on the two-dimensional torus has positive Kolmogorov-Sinai entropy with respect to area. Equivalently, its largest Lyapunov exponent is positive on a set of positive area."
status: unreviewed
checked: 2026-10-17
papers:
  - preprints/Positive-Metric-Entropy-for-the-Standard-Map-at-Large-Parameters-September-23-2026/paper.pdf
draft: false
---

Take a pendulum, let it swing freely, and kick it once a second with a force that depends on where it is. Record its angle and speed after each kick. This is the standard map, written down by Boris Chirikov in 1979 as the simplest model of how an orderly mechanical system falls into chaos. Pictures of it are in every textbook on dynamics: at small kick strength, neat curves; at larger strength, a growing "chaotic sea" of scattered points with islands of order floating in it. Everyone who has drawn these pictures believes the sea has positive area, meaning that a randomly chosen starting point has a real chance of landing in it. Yakov Sinai conjectured as much. Nobody could prove it for a single value of the kick strength. On 23 September 2026 OpenAI posted a paper claiming it for every sufficiently large kick. [1][3][4][6]

As of 17 October 2026 no mathematician has said publicly that they have checked the proof. One specialist who worked on the problem for a decade has looked at it and called it "just plain ugly" without saying whether it is right. The status on this page is "unreviewed".

## The problem

The standard map acts on the torus $\mathbb T^{2}=\mathbb R^{2}/\mathbb Z^{2}$, the unit square with opposite edges glued, so that both coordinates are angles. For a real parameter $k$,

$$
f_k(x,y)=\bigl(x+y+k\sin(2\pi x),\ y+k\sin(2\pi x)\bigr)\pmod{\mathbb Z^{2}}.
$$

Read $x$ as the pendulum's angle and $y$ as its speed. Each step, the kick $k\sin(2\pi x)$ changes the speed, and the new speed carries the angle forward. The map preserves area: a region of the torus is carried to a region of the same size. That is the mathematical shadow of energy conservation, and it means the natural notion of "most starting points" is area. [1][16]

At $k=0$ nothing happens to $y$, and every orbit runs around a horizontal circle. For small $k$, the Kolmogorov-Arnold-Moser theorem says most of these invariant circles survive, slightly bent. Between them, chaotic bands appear. As $k$ grows the bands widen and the last circle crossing the torus breaks at $k\approx0.1546$. Beyond that, a plot of a typical orbit fills a large irregular region, the chaotic sea, with holes around stable periodic points, the islands. [16]

The question is whether this picture is honest. "Chaotic" here has a precise meaning. The Lyapunov exponent of a point measures the exponential rate at which nearby orbits pull apart; because the map preserves area, the two exponents at a point are $\lambda_+(z)\ge0$ and $-\lambda_+(z)$. The Kolmogorov-Sinai entropy $h_m(f_k)$ measures, in bits per step, how much information about an orbit the area measure $m$ keeps generating as time runs. Pesin's formula ties the two together for area-preserving smooth maps:

$$
h_m(f_k)=\int_{\mathbb T^{2}}\lambda_+(z)\,dm(z).
$$

So the entropy is positive exactly when the Lyapunov exponent is positive on a set of positive area. That is what "the chaotic sea has positive area" means. [1][11]

Two warnings the paper itself stresses. A chaotic set can have area zero and still look impressive: a hyperbolic set of fractal dimension two still has no area. And positive topological entropy, which counts how many distinguishable orbits exist, says nothing about whether area-typical orbits see them. The pictures cannot distinguish a sea of positive area from a dense dust of area zero. [1]

<!-- uruk:visual-note
A visual for this page can plot orbits of the standard map for a slider of $k$ values, colour the chaotic sea, and show the islands shrinking as $k$ grows. It cannot show the theorem: no finite plot can tell positive area from a dense set of measure zero, which is exactly the gap the proof closes.
-->

## Why it stayed open

### Forty years of islands and seas

Chirikov introduced the map in a 1979 survey of instability in oscillator systems, and it became the standard test case for Hamiltonian chaos, used to model everything from particle beams in accelerators to the motion of comets. Sinai's conjecture, recorded in his 1994 lectures on ergodic theory, says that for large $k$ the map has positive entropy with respect to area. Berger and Turaev restated it in 2019 as the statement that the set of parameters with positive metric entropy has positive measure, which is their Conjecture 0.4. [1][3][4][5]

The difficulty is a conflict between two mechanisms. For large $k$ the map stretches almost everything by a factor of about $2\pi k$ at each step, which pushes toward positive exponents. But wherever $\cos(2\pi x)$ is near zero, along two vertical strips, the stretching turns and can cancel what came before. Orbits keep returning to these strips, and on each return some of the accumulated growth is lost. Elliptic islands, where orbits are stable and the exponent is zero, exist for arbitrarily large $k$: Pedro Duarte proved in 1994 that they are plentiful. So the exponent cannot be positive everywhere, and a proof must show that the cancellations do not win on a set of full area. [1][8]

What could be proved circled the question. Duarte constructed hyperbolic sets and tangencies for large parameters. Anton Gorodetski showed in 2012 that for a residual set of large parameters the "stochastic sea" contains transitive invariant sets of full Hausdorff dimension, but full dimension does not mean positive area, and a residual set of parameters can have measure zero. Davi Obata proved in 2021 that for large $k$ the map has a unique measure of maximal entropy, without identifying it with area; his paper states that it was "not known if there exists one parameter $k$ for which the standard map has positive metric entropy". Oliveira proved positive topological entropy for every $k\neq2/\pi$ in 2024. Berger and Turaev proved Herman's conjecture in 2019 by showing that an arbitrary small smooth conservative perturbation can make the entropy positive, including near standard maps, but the perturbation changes the map. Blumenthal, Xue and Young proved positive exponents for randomly perturbed standard maps in 2017. Noise, coupling and perturbation all change the system; the question is about the exact sine map at each large $k$. [1][6][7][8][9][10]

## What OpenAI claims

**Theorem 1.1** (OpenAI, 23 September 2026). There exists $k_0>0$ such that

$$
h_m(f_k)>0\qquad\text{for every }k\ge k_0.
$$

Equivalently, for every such $k$ the largest Lyapunov exponent of $f_k$ is positive on a set of positive area. [1]

**Corollary 1.2.** For each $k\ge k_0$ there is an invariant set $E$ of positive area on which $f_k$ is ergodic with one positive and one negative Lyapunov exponent almost everywhere, and $E$ splits into finitely many pieces permuted cyclically by $f_k$, on each of which the corresponding iterate is Bernoulli, meaning statistically indistinguishable from coin tossing. This follows from the theorem by Pesin's theory, as formulated by Katok and Burns. [1]

What this does and does not say. The theorem settles Sinai's conjecture in Berger and Turaev's formulation and more: not just a positive-measure set of parameters but every parameter beyond some threshold. The paper says explicitly that it "makes no claim of ergodicity, almost-everywhere positive exponents, or a uniform positive lower bound on entropy". It gives no value of $k_0$. It says nothing about small $k$, and nothing about the expected growth rate of the entropy, which Oliver Knill records as the standing conjecture $h\ge\log(k/2)$. Whether the islands have area tending to zero as $k$ grows, and whether the sea is a single ergodic component, remain open. [1][12]

## How the claimed proof goes

What follows is a map of the paper's argument, from its introduction and section plan. It is not a check of the details. [1]

**The idea.** Measure, at each time scale, how far orbits fall short of the maximal possible stretching. If the exponent were zero almost everywhere, this shortfall would tend to one as the time scale grows, while at any fixed time scale it tends to zero as $k$ grows. The proof shows that the shortfall cannot climb from near zero to near one without passing through intermediate shapes that two quantitative estimates forbid. [1]

**Growth as a distance.** In suitable coordinates the derivative of $f_k^{\,n}$ along an orbit is a product of determinant-one matrices $T_{i,j}$. With $M=2\pi k+4$ the largest possible one-step growth, set $g(i,j)=\log_M\|T_{i,j}\|$. Then $0\le g(i,j)\le|i-j|$, and the triangle inequality makes $g$ a semimetric on orbit time that is stationary under the area measure. The shortfall at length $n$ is $1-\mathbb E\,g(0,n)/n$. [1]

**First input: cancellations are rare.** The cancellation theorem bounds the probability that two long orbit segments each grow at nearly the maximal rate while their concatenation almost completely cancels. A cancellation produces a linearized solution that is small at both ends; matched expansion scales on its two sides give many local tests, and a uniform analytic scarcity estimate, including the degenerate case of nearly cancelling reciprocal cosines, turns those tests into exponential decay in probability. [1]

**Second input: observations across a fast bridge.** The bridge theorem gives a weighted product estimate for observations near the two ends of a rapidly growing segment. Finite Dirichlet problems construct two transverse families of contracting graphs, and uniform control of their slice Jacobians gives the estimate by change of variables. The paper stresses that this assumes neither mixing nor independence of orbit segments, and that its restriction to fast bridges is essential. [1]

**The multiscale contradiction.** Suppose arbitrarily large parameters have zero exponent almost everywhere. Choose a range of dyadic lengths over which the shortfall first increases, normalize by the small terminal shortfall, and rescale the distance arrays. The limits are measures that are locally finite away from the affine arrays $d(s,t)=w|s-t|$, in which every interval grows at one common rate. Cancellation scarcity bounds how much the shortfall can jump when the length doubles; the bridge estimate restricts which slow intervals can coexist with a fast connecting segment; a four-point inequality finishes the classification, leaving three kinds of nonaffine limit: an entirely slow array, or one with one or two exterior unit-speed rays. A capped version of the shortfall, summed over the selected lengths, telescopes to a positive terminal value. The same sum decomposes into dilates of the terminal measure, which contribute strictly less than that value because a nonzero terminal measure keeps a slow interval visible at every scale, and an invariant remainder that contributes nothing positive. The two bounds contradict each other. Passing to the limit is itself a proof obligation, because convergence away from affine arrays does not control mass that approaches them; the cap, the bridge estimate and the cancellation truncation handle the three affine speeds. [1]

The paper says that "no external standard-map entropy assertion or independence hypothesis is imported"; its quantitative ingredients are proved in the form it needs. Where would an expert look first? At the cancellation scarcity estimate and its degenerate cases, at the bridge estimate and why it needs fast bridges, and at the limit passage in the final balance, where mass near the affine arrays must be accounted for. [1]

## Consequences inside mathematics

If the proof holds, the standard map has a chaotic sea of positive area for every large parameter, with an ergodic Bernoulli component inside it, which is what the pictures have suggested since 1979. It would be the first proof of positive metric entropy for the exact standard map at any parameter. The methods are built for this family; the paper does not claim they extend to other maps, and the natural next questions, a uniform lower bound such as $\log(k/2)$, ergodicity of the sea, and the measure of the islands, are untouched. Knill writes that "every open problem solved produces 10 more open problems" and lists these. [1][12]

## Uses outside mathematics

No known direct application.

The standard map models kicked rotors, charged particles in magnetic confinement devices and beams in accelerators, and physicists have treated its large-parameter regime as chaotic for decades, on the strength of simulations. The theorem confirms that assumption for large parameters. It gives no number that a physicist could use, since $k_0$ is not computed. [3][16]

## Has anyone checked it?

Oliver Knill of Harvard, who says he spent two years almost entirely on this problem as a graduate student and worked on it for more than ten, wrote on his blog on 7 October that the release includes "the solution of a problem I had been working on for more than 10 years", that "the solutions I have looked at until now are not what one would call 'elegant'", and, of this one, that "the solution is (from what I saw until now) just plain ugly". He added that he is "frankly not that interested even in what has been written by AI". That is a specialist who has opened the paper and reacted to its style, not a report that he has checked it or found it wrong. We found no other named mathematician discussing the proof. VibeMathed records no check by an independent mathematician, and an expository article on the family says it "is not an independent verification of the complete proofs". [12][13][14]

**Machine checking.** The release has three Lean statements for this family. `StandardMapEntropy.lean` is 53 lines: it defines the standard map on the torus with the kick $k\sin(2\pi x)$, defines the metric entropy of the area measure from scratch through finite measurable partitions, and states that there is $k_0>0$ with positive entropy for all $k\ge k_0$. Two longer statements cover the positive-area set with positive Lyapunov exponent and the ergodic Bernoulli component. The formal proof runs to 274 files. Because the entropy is defined in the file rather than taken from a library, a reader must check that the definition agrees with the standard one; we have not. None of the three statements is listed in the release's catalogue `formalization.yaml`, and we found no outside replay. A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval. [2]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; none of them is this family, and the Lean statements did not change. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [15]

## Sources

1. OpenAI, "Positive Metric Entropy for the Standard Map at Large Parameters", 23 September 2026. Theorem 1.1, Corollary 1.2 and its proof, the context and proof-mechanism paragraphs of Section 1. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Positive-Metric-Entropy-for-the-Standard-Map-at-Large-Parameters-September-23-2026/paper.pdf
2. OpenAI, Lean scope note for family 146 and the comparator statements `StandardMapEntropy.lean`, `StandardMapLyapunov.lean` and `StandardMapComponents.lean` at the pinned commit. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/146.md and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/StandardMapEntropy.lean
3. B. V. Chirikov, "A universal instability of many-dimensional oscillator systems", Physics Reports 52 (1979), 263-379. https://doi.org/10.1016/0370-1573(79)90023-1
4. Ya. G. Sinai, Topics in Ergodic Theory, Princeton University Press, 1994, p. 144, as cited for the conjecture by Obata [6].
5. Pierre Berger and Dmitry Turaev, "On Herman's positive entropy conjecture", Advances in Mathematics 349 (2019), 1234-1288, Conjecture 0.4. https://doi.org/10.1016/j.aim.2019.04.002
6. Davi Obata, "Uniqueness of the measure of maximal entropy for the standard map", Commentarii Mathematici Helvetici 96 (2021), 79-111. The statement that no parameter with positive metric entropy was known. https://doi.org/10.4171/CMH/508
7. F. Oliveira, "Positive topological entropy for the Standard Map", arXiv 2404.02209, 2024. https://arxiv.org/abs/2404.02209
8. Pedro Duarte, "Plenty of elliptic islands for the standard family of area preserving maps", Annales de l'Institut Henri Poincaré, Analyse non linéaire 11 (1994), 359-409. https://www.numdam.org/item/AIHPC_1994__11_4_359_0/
9. Anton Gorodetski, "On stochastic sea of the standard map", Communications in Mathematical Physics 309 (2012), 155-192. https://doi.org/10.1007/s00220-011-1365-z
10. Alex Blumenthal, Jinxin Xue and Lai-Sang Young, "Lyapunov exponents for random perturbations of some area-preserving maps including the standard map", Annals of Mathematics 185 (2017), 285-310. https://doi.org/10.4007/annals.2017.185.1.5
11. Ya. B. Pesin, "Characteristic Lyapunov exponents and smooth ergodic theory", Russian Mathematical Surveys 32 (1977), 55-114, https://doi.org/10.1070/RM1977v032n04ABEH001639 ; and R. Mañé, "A proof of Pesin's formula", Ergodic Theory and Dynamical Systems 1 (1981), 95-102, https://doi.org/10.1017/S0143385700001188
12. Oliver Knill, "Positive entropy for Standard Map by Open AI", Quantum Calculus, 7 October 2026, updated 10 October. https://www.quantumcalculus.org/positive-entropy-for-standard-map-by-open-ai/
13. VibeMathed, "Sinai's positive metric entropy conjecture for the standard map", read 17 October 2026. https://vibemathed.com/problem/sinai-standard-map-positive-entropy
14. Latent seminar, "Positive metric entropy for the standard map at large parameters", explanatory article on family 146, read 17 October 2026. https://lowrank.github.io/latent-seminar/OpenAI-Math/146-standard-map-entropy
15. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
16. Wikipedia, "Standard map", read 17 October 2026. The kicked-rotor interpretation, area preservation, KAM curves and Greene's critical value K ≈ 0.9716 for the breakup of the last invariant circle, which is k = K/(2π) ≈ 0.1546 in the normalization used here. https://en.wikipedia.org/wiki/Standard_map
