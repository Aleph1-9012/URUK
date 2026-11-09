---
family: "197"
topic: "Kaplansky's direct-finiteness conjecture"
title: "Can a one-sided inverse exist in a group algebra, and a cellular automaton be one-to-one without being onto?"
paperTitle: "A Torsion-Free Group Algebra That Is Not Directly Finite"
claim: "There is a finitely presented torsion-free group G and elements a, b of its group algebra over the two-element field with ab = 1 but ba not 1, disproving Kaplansky's direct-finiteness conjecture. The same construction gives a linear cellular automaton on the configurations of a nonsofic group that is injective but not surjective, refuting Gottschalk's surjunctivity conjecture, and a matrix over an integral group ring with Fuglede-Kadison determinant strictly between 0 and 1, refuting the determinant conjecture."
status: unreviewed
checked: 2026-11-03
papers:
  - preprints/A-Torsion-Free-Group-Algebra-That-Is-Not-Directly-Finite-October-4-2026/direct-finiteness.pdf
  - preprints/A-Counterexample-to-Kaplanskys-Direct-Finiteness-Conjecture-in-Characteristic-Two-September-23-2026/paper.pdf
  - preprints/A-Counterexample-to-Kaplanskys-Direct-Finiteness-Conjecture-in-Odd-Characteristic-September-26-2026/paper.pdf
  - preprints/A-Counterexample-to-the-Group-Ring-Determinant-Conjecture-September-23-2026/paper.pdf
draft: false
---

In ordinary arithmetic, and for square matrices, a left inverse is a right inverse: if $ab=1$ then $ba=1$. Irving Kaplansky asked in the 1950s whether the same holds in every group algebra, the ring of finite formal sums of group elements with coefficients in a field; he proved it over the complex numbers, and the question for fields of positive characteristic became one of three famous "Kaplansky conjectures" about group rings. Walter Gottschalk asked a cousin of it in 1973 about cellular automata, rules like Conway's Game of Life played on the cells of a group: if such a rule never sends two different configurations to the same one, must every configuration be reachable? Both questions were known to have the answer yes for every sofic group, a vast class containing every group anyone could write down, and for twenty-five years the obstacle was that nobody knew a group outside it. In the summer of 2026 an OpenAI model produced the first nonsofic group, with heavy use of recent work of Gábor Kun and Andreas Thom; on 23 September and 4 October OpenAI posted papers claiming that over such groups both conjectures fail, the second even for a torsion-free group, and that a third conjecture about determinants falls with them. [1][2][4][6]

As of 3 November 2026 no mathematician has said publicly that they have checked these particular proofs, though the nonsofic construction they rest on has been studied, strengthened and publicly discussed by named experts. The status on this page is "unreviewed". [6][7][8]

## The problem

For a field $K$ and a group $G$, the group algebra $K[G]$ consists of finite sums $\sum_gc_gg$ with $c_g\in K$, multiplied by the group law. It is directly finite if $ab=1$ implies $ba=1$ for all $a,b\in K[G]$, and stably finite if the same holds for all square matrices over it. Kaplansky's direct-finiteness conjecture asserts that every $K[G]$ is directly finite. For finite groups this is linear algebra; for fields of characteristic zero Kaplansky proved it by embedding $\mathbb C[G]$ in a von Neumann algebra with a faithful trace. The positive-characteristic case is the conjecture. [2]

A cellular automaton on a group $G$ with a finite alphabet $A$ is a map $A^{G}\to A^{G}$ that computes each cell's new state from the states of finitely many neighbouring cells, the same rule everywhere. Gottschalk's surjunctivity conjecture says that an injective cellular automaton is surjective: no such rule can compress the space of configurations. For $G=\mathbb Z^{2}$ this is the Garden of Eden theorem of Moore and Myhill from 1962. A linear cellular automaton over $K$ is the same as right multiplication by an element of $K[G]$ acting on $K^{G}$, which is how the two conjectures connect: a left-invertible, non-right-invertible element gives an injective, non-surjective automaton. [2]

A group is sofic, in Gromov's 1999 sense, if every finite piece of its multiplication table can be approximated by permutations of a finite set with few errors; amenable groups and residually finite groups are sofic. Gromov proved surjunctivity for sofic groups, and Elek and Szabó proved direct finiteness and the determinant conjecture for them. Whether a nonsofic group exists was asked by Weiss and stayed open until 2026. [2][4]

<!-- uruk:visual-note
The visual on this page runs a reversible-looking linear cellular automaton on a grid and lets the reader try to find two configurations with the same image or a configuration with no preimage; on $\mathbb Z^{2}$ neither exists, by Moore and Myhill. What the visual leaves out is the group: the counterexample lives on a nonsofic group whose Cayley graph cannot be drawn as a grid and whose construction is a terminating prescription that the paper says "need not be computationally practical and has not been executed". [2]
-->

## Why it stayed open

### Who asked

Kaplansky posed the direct-finiteness problem in print in "Fields and Rings" (1969), Part II, Problem 2, after raising it at a 1956 conference; Gottschalk stated surjunctivity in 1973; the determinant conjecture is Conjecture 13.2 of Lück's 2002 book on $L^{2}$-invariants, extending the fact that a nonsingular integer matrix has determinant at least $1$ to matrices over $\mathbb Z[G]$. Gromov's question about sofic groups dates from 1999 and Weiss's formulation from 2000. [1][2][4]

### What was tried

The positive results covered ever larger classes without a counterexample in sight. Kaplansky's complex-number argument gives characteristic zero; Montgomery gave a short $C^{*}$-algebra proof. Ara, O'Meara and Perera proved stable finiteness over any division ring for free-by-amenable groups using Sylvester rank functions. Elek and Szabó extended it to all sofic groups in 2004, the same year they proved the determinant conjecture for them. Dykema and Juschenko showed that a matrix counterexample yields a scalar one after passing to a product with a finite group, which is why a construction of matrices $AB=I\ne BA$ is not the end of the story. On the dynamical side, Gromov and Weiss proved surjunctivity for sofic groups, and Ceccherini-Silberstein and Coornaert's book organised the whole circle of ideas around soficity. [1][2]

### What stood in the way

Every known route to a counterexample needed a nonsofic group, and every group anyone could construct turned out sofic or of unknown status. The breakthrough came from outside these papers. On 31 July 2026 a result circulated, produced by an OpenAI model, constructing the first nonsofic group; its key Proposition 2.3 connects Kun's 2016 theorem on expander decompositions of approximate actions of property (T) groups with the Kun-Thom "centraliser rigidity" of 2019. Henry Bradford and colleagues, who studied it, judged the criterion for nonsoficity to be the hard part and the construction of a group satisfying it comparatively easy. Vadim Alekseev and Andreas Thom had been circulating a strengthening of Kun-Thom at the same time, and Kun and Thom then combined it with the OpenAI proposition into a more robust criterion that gives further examples, such as permutational wreath products over infranormal property (T) subgroups. A post on Terence Tao's blog on 11 September 2026 recounts the episode from the human side. The three papers on this page take a nonsofic group as their starting material and build the algebra on top of it. [2][6][7][8]

## What OpenAI claims

**Theorem 1.1** (characteristic two, 23 September 2026). There exist a finite field $K$ of characteristic two, a finitely presented group $G$ containing an element of odd prime order, and $a,b\in K[G]$ with $ab=1$ and $ba\ne1$. The field, group and elements are specified by a terminating prescription with algebraic certificates for both product assertions. The group is nonsofic, and the same elements define a cellular automaton on $K^{G}$ that is injective but not surjective, refuting Gottschalk's conjecture (Section 7). [2]

**Theorem 1.1** (torsion-free, 4 October 2026). There exist a finitely presented torsion-free group $G$ and $a,b,c\in\mathbb F_2[G]$ with $ab=1$, $ac=0$ and $c\ne0$, so $ba\ne1$; $G$ has a finite two-dimensional classifying complex. This is the sharper statement: it removes torsion and takes the smallest field. [1]

**Odd characteristic** (26 September 2026). The analogous counterexample over finite fields of odd characteristic. **Determinant** (23 September 2026). A finitely generated group $G$ and a square matrix over $\mathbb Z[G]$, invertible over $\mathbb Q[G]$, whose Fuglede-Kadison determinant lies strictly between $0$ and $1$, refuting Lück's determinant conjecture; the paper depends on the characteristic-two companion. [3][4]

Scope. The constructions are existence proofs with explicit recipes that have not been run; no small example is written down. Nothing is claimed about Kaplansky's other two conjectures, on zero divisors and units for torsion-free groups, which concern a different mechanism. [1][2]

## How the claimed proofs go

What follows is a map of the two main papers' arguments from their introductions, with the companions noted. It is not a check of the details. The characteristic-two paper is about 1,900 lines of TeX and the torsion-free paper about 2,350. [1][2]

**From soficity to direct finiteness, reversed.** Elek and Szabó's theorem says sofic groups have directly finite group algebras; the papers run the logic backwards. The characteristic-two paper first produces a matrix pair $AB=I\ne BA$ over a group algebra of a nonsofic group, then embeds that matrix algebra in a larger group algebra to obtain scalar elements, in the manner of Dykema and Juschenko's reduction. The group is finitely presented and contains an element of odd prime order, used in the embedding. Soficity enters as the obstruction that must be absent: the paper states, in the finite-map formulation of Elek and Szabó, the property that its group lacks. [2]

**Certificates independent of the word problem.** Both product identities, $ab=1$ and $ba\ne1$, are established by algebraic certificates, so that no decision procedure for the group's word problem is needed; the prescription that produces the data is proved to terminate, which is what the Lean statements for this family record. [2][9]

**The torsion-free construction.** The 4 October paper removes the torsion by a different group, finitely presented, torsion-free, with a finite two-dimensional classifying complex, and works over $\mathbb F_2$ itself; the auxiliary element $c$ with $ac=0$, $c\ne0$ certifies failure of $ba=1$ in one line, since $ba=1$ would give $c=(ba)c=b(ac)=0$. [1]

**Surjunctivity and the determinant.** Section 7 of the characteristic-two paper reads the coefficients of $b$ as a linear cellular automaton on $K^{G}$ with left inverse given by $a$, hence injective, and shows it is not surjective. The determinant paper takes a matrix over $\mathbb Z[G]$ invertible over $\mathbb Q[G]$, computes the spectral measure of $T_A^{*}T_A$ with respect to the group trace, and shows the logarithmic integral is finite and negative, which is the failure of Lück's Conjecture 13.2. [2][4]

**Where an expert would look first.** At the nonsofic group itself, since every conclusion on this page rests on it: its construction is outside these four papers, and the Lean statements explicitly exclude nonsoficity. Then at the embedding step that turns a matrix counterexample into a scalar one, and at the certificates for $ab=1$ and $ba\ne1$, which must be checkable without solving the word problem. [2][9]

## Consequences inside mathematics

If the proofs hold, three conjectures that organised the theory of group rings and of cellular automata on groups are false in general, and the dividing line is soficity: Elek and Szabó's theorems become the sharp statement of where direct finiteness and the determinant conjecture hold. The torsion-free counterexample shows that torsion is not the mechanism. Lück's determinant conjecture has consequences for $L^{2}$-torsion and for the approximation of $L^{2}$-Betti numbers, which now need soficity or another hypothesis. The nonsofic groups themselves, including the Kun-Thom examples that followed, open a subject that did not exist a year ago. [1][2][4][7]

## Uses outside mathematics

No known direct application. Cellular automata are used as models in physics and computation, but surjunctivity was a structural question about which groups can host a compressing rule, and the counterexamples live on groups with no physical realisation. [2]

## Has anyone checked it?

We found no named mathematician who has said publicly that they have read or checked any of the four papers on this page. VibeMathed lists all three conjectures as Lean-checked with the note "No independent mathematician has checked this yet", and records the dependence of the determinant paper on the characteristic-two companion. [8]

The nonsofic construction underneath them is a different matter, and worth stating carefully because it is not one of the four papers. It circulated on 31 July 2026, was studied by Henry Bradford and colleagues, who concluded that its criterion for nonsoficity is new and its reliance on Kun's and Kun-Thom's theorems heavy; Kun and Thom, together with Alekseev and Thom's independent strengthening, extended the criterion and produced further nonsofic groups; the Rényi Institute published an account of its researchers' role; and a post on Terence Tao's blog on 11 September gave an expert's view of the proof's key proposition. That is substantial named engagement with the group's existence. It does not transfer to the algebra built on it here, which no named expert has discussed. [5][6][7]

**Machine checking.** The release's catalogue `formalization.yaml` lists the characteristic-two, odd-characteristic and determinant papers; the torsion-free paper is not catalogued. The scope note links statements `KaplanskyDirectFiniteness.lean`, `KaplanskyFinitelyPresented.lean`, `OddKaplansky.lean` and `GroupRingDeterminant.lean`: a finite field of characteristic two and a group algebra violating the implication, once for a finitely generated group and once with the finitely presented group with odd torsion and its terminating prescription; and the determinant statement. The scope note says plainly that "the further conclusion that the group is nonsofic is outside these statements". We found no outside replay. A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval. [9]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; none of the four papers in this family is among them. On 26 October it added two manuscripts and more Lean statements; nothing in this family changed. [10]

## Sources

1. OpenAI, "A Torsion-Free Group Algebra That Is Not Directly Finite", 4 October 2026. Theorem 1.1 and the history section. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/A-Torsion-Free-Group-Algebra-That-Is-Not-Directly-Finite-October-4-2026/direct-finiteness.pdf
2. OpenAI, "A Counterexample to Kaplansky's Direct-Finiteness Conjecture in Characteristic Two", 23 September 2026. Theorem 1.1, the history and soficity paragraphs, Section 7 for surjunctivity. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/A-Counterexample-to-Kaplanskys-Direct-Finiteness-Conjecture-in-Characteristic-Two-September-23-2026/paper.pdf
3. OpenAI, "A Counterexample to Kaplansky's Direct-Finiteness Conjecture in Odd Characteristic", 26 September 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/A-Counterexample-to-Kaplanskys-Direct-Finiteness-Conjecture-in-Odd-Characteristic-September-26-2026/paper.pdf
4. OpenAI, "A Counterexample to the Group-Ring Determinant Conjecture", 23 September 2026. Theorem 1.1 and the statement of Lück's Conjecture 13.2. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/A-Counterexample-to-the-Group-Ring-Determinant-Conjecture-September-23-2026/paper.pdf
5. HUN-REN Alfréd Rényi Institute of Mathematics, "An OpenAI breakthrough uses Rényi researchers' results", 2026, read 3 November 2026. Elek, Szabó, Kun and the sofic background. https://renyi.hu/en/news/openai-mathematical-breakthrough-builds-renyi-researchers-work
6. Plus magazine, "AI versus mathematics? An account of a turbulent summer", 2026, read 3 November 2026. Henry Bradford and colleagues on the nonsofic proof's two parts and its reliance on Kun and Kun-Thom. https://plus.maths.org/ai-versus-mathematics
7. Proofs and Prompts, "From non-sofic to non-hyperlinear groups: the new messiness of discovering and announcing big results", 25 September 2026; and "On the existence of non-sofic groups", post on Terence Tao's blog What's new, 11 September 2026. The Alekseev-Thom and Kun-Thom follow-ups and the 31 July circulation. https://proofsandprompts.com/2026/09/25/from-non-sofic-to-non-hyperlinear-groups-the-new-messiness-of-discovering-and-announcing-big-results/ and https://terrytao.wordpress.com/2026/09/11/on-the-existence-of-non-sofic-groups/
8. VibeMathed, "Kaplansky's direct finiteness conjecture", "Gottschalk's surjunctivity conjecture" and "The group-ring determinant conjecture", dataset of 1 November 2026. https://vibemathed.com/problem/kaplansky-direct-finiteness-conjecture , https://vibemathed.com/problem/gottschalk-surjunctivity-conjecture and https://vibemathed.com/problem/group-ring-determinant-conjecture
9. OpenAI, Lean scope note for family 197 and the comparator statements `KaplanskyDirectFiniteness.lean`, `KaplanskyFinitelyPresented.lean`, `OddKaplansky.lean` and `GroupRingDeterminant.lean` at the pinned commit. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/197.md
10. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
