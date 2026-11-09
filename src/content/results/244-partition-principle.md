---
family: "244"
topic: "The Partition Principle and the Axiom of Choice"
title: "If a set has no more pieces than points, can you always choose one point from each piece?"
paperTitle: "The Partition Principle does not imply Choice"
claim: "If ZF is consistent, so is ZF together with the Partition Principle, Choice for ordinal-indexed families, and the failure of the Axiom of Choice. The Partition Principle therefore does not imply Choice."
status: unreviewed
checked: 2026-10-18
papers:
  - preprints/The-Partition-Principle-does-not-imply-Choice-September-24-2026/partition-principle-without-choice.pdf
draft: false
---

Cut a set into pieces. The Axiom of Choice lets you pick one point from every piece at once, however many pieces there are. A weaker-sounding statement, the Partition Principle, says only that there are never more pieces than points: some one-to-one map sends each piece to a point, though the point need not lie in its own piece. Beppo Levi stated the principle in 1902; Bertrand Russell claimed without proof that it implies Choice; and whether it does has been open ever since, in what Asaf Karagila, the problem's leading specialist, has called the oldest open problem in set theory. Three preprints in 2025 and 2026 claimed a model in which the principle holds and Choice fails, and all three were withdrawn. On 24 September 2026 OpenAI posted a forty-four-page paper claiming such a model. [1][3][4]

As of 18 October 2026 the paper has been read by one expert, Karagila, who rejected its exposition in strong terms, reported no mathematical error, and said he will not read further. Under Uruk's rules that is neither a check nor a dispute, so the status on this page is "unreviewed", with his words quoted below. [3]

## The problem

Set theory is done in the axioms of Zermelo and Fraenkel, ZF. The Axiom of Choice, AC, says that for every family of nonempty sets there is a function picking one element from each. It is independent of ZF: Gödel showed it cannot be refuted, Cohen in 1963 that it cannot be proved. A whole subject studies which consequences of AC are weaker than AC and which are secretly equivalent to it. [1]

The Partition Principle is the statement

$$
\mathrm{PP}:\quad\forall X\,\forall Y\,\bigl[(\exists f:X\twoheadrightarrow Y)\Longrightarrow(\exists j:Y\hookrightarrow X)\bigr],
$$

a surjection from $X$ onto $Y$ implies an injection from $Y$ into $X$. Equivalently, every partition of a set injects into the set. AC implies PP: pick one point in each fiber $f^{-1}(y)$ and send $y$ there. The converse is not obvious, because the injection PP provides need not satisfy $f\circ j=\mathrm{id}$; it may send a piece to a point outside it. For six points cut into pieces of sizes one, two and three there are $120$ injections from pieces to points and only six of them pick from inside; for infinite sets the gap between the two is the whole question. [1][4]

**The question (Levi 1902, Russell).** Does PP imply AC over ZF? [1][4]

What was known. PP implies a good deal of choice already: Choice for well-orderable families, written $\mathrm{AC}_{\mathrm{WO}}$, which says that any family of nonempty sets indexed by an ordinal has a choice function; the argument is attributed to Pincus and recorded by Ryan-Smith. [2] Banaschewski and Moore related PP to the dual Cantor-Bernstein theorem in 1990. Blass and Kulshreshtha's August 2026 paper on cardinal well-foundedness still lists the implication as open. Between November 2025 and January 2026 Frank Gilson posted three preprints claiming a model of PP without AC; by September 2026 he had withdrawn all three. [1][4]

<!-- uruk:visual-note
A visual for this page is hard, and the site should say so rather than fake one. A finite picture can show pieces and points, the many injections, and the few that choose from inside; it cannot show a model of set theory. The honest illustration is the dependency diagram of choice principles, with PP sitting between $\mathrm{AC}_{\mathrm{WO}}$ and AC and the claimed theorem cutting the arrow to AC.
-->

## Why it stayed open

To show that PP does not imply AC one needs a model of ZF in which PP holds and AC fails. The standard tool is a symmetric submodel of a forcing extension: add new sets by forcing, then keep only the names fixed by a group of symmetries, which typically destroys AC. The difficulty is that PP quantifies over all sets of all ranks, and a symmetric model built to break choice at one set tends to break PP somewhere else. The paper credits Blass's "small violations of choice" and Ryan-Smith's 2025 local-to-global reductions for showing how a statement about all sets can be reduced to a statement about one controlling set $A$, and Holy and Schilhan's 2025 product of Cohen forcing with almost-disjoint towers as the closest antecedent construction. None of these produced PP. [1]

## What OpenAI claims

**Theorem 1.1** (OpenAI, 24 September 2026). If ZF is consistent, then so is $\mathrm{ZF}+\mathrm{PP}+\mathrm{AC}_{\mathrm{WO}}+\neg\mathrm{AC}$. [1]

**Theorem 1.2.** Let $V$ be a countable transitive model of ZFC. There are a set forcing $\mathbb Q\in V$, a $V$-generic filter $G$ and a transitive symmetric submodel $W$ with $V\subseteq W\subseteq V[G]$, the same ordinals as $V$, and $W\models\mathrm{ZF}+\mathrm{PP}+\mathrm{AC}_{\mathrm{WO}}+\neg\mathrm{AC}$. Every countable sequence of elements of $V$ that lies in $W$ already lies in $V$. [1]

What these do and do not say. Theorem 1.1 is an ordinary relative-consistency statement and answers the question negatively. The presence of $\mathrm{AC}_{\mathrm{WO}}$ adds nothing beyond PP, since PP implies it; the paper includes it to record the order of the construction. No atoms and no large cardinals are used in Theorem 1.1. The paper's remarks derive consequences for the dual Cantor-Schröder-Bernstein principle and the Weak Partition Principle. [1]

## How the claimed proof goes

What follows is a map of the paper's argument from its introduction and from Sections 3, 4 and 7. It is not a check of the details, and the one expert who has read the paper found its structure hard to follow. [1][3]

**The idea.** Build a model of ZF by forcing and symmetry in which the Axiom of Choice fails but the Partition Principle holds. The witness to the failure of Choice is a set $A$ of distinct generic subsets of $\omega_1$ that cannot be well-ordered. The Partition Principle is then reduced to one structural property of $A$:

$$
\text{every non-well-orderable surjective image of }A\text{ is in bijection with }A,
$$

together with choice for ordinal-indexed families, $\mathrm{AC}_{\mathrm{WO}}$. The difficulty, which the paper names as such, is that the bijections must exist inside the symmetric model: they must be coherent across overlapping supports and invariant under the symmetries. [1]

**The setup (Section 3).** Work over a ground model of ZFC with $\kappa=\aleph_1$, $\mathfrak c=2^{\aleph_0}$, $\mu=\mathfrak c^{+}$ and a set $I$ of label indices of size $\mu^{+}$; in the constructible ground used for the consistency theorem, $\kappa=\aleph_1$ and $\mu=\aleph_2$, and the slightly more general choice lets the argument run over any given transitive choice ground. The forcing is a product $\mathbb Q=\mathbb R\times\mathbb P$: $\mathbb R=\mathrm{Add}(\kappa,I)$ adds a Cohen subset of $\omega_1$ for each label, by countable partial functions, and $\mathbb P$ is the "diagram forcing", whose conditions are injective maps $r:T\to I$ from a fixed monoid $T$ into the labels, larger diagrams being stronger. A diagram supports those names whose definitions are fixed by all permutations of labels outside its range; the symmetric model is built from the hereditarily symmetric names for this system (Theorem 3.3, the symmetric-model theorem). The paper notes a related Cohen-and-tower product in Holy and Schilhan's work, with the monoid and the diagram order specified here. [1]

**Stage one: a geometry of diagrams (Section 2).** The left-cancellative monoid $T$ is constructed with a distinguished element $e\ne1$ and a "local rearrangement" property (Theorem 2.2); the subdiagram of $r$ at $n\in T$ is $r_n(x)=r(nx)$. Two extension operations drive everything: finite amalgamation, which joins independently placed diagrams, and an operation that inserts many copies with prescribed intersection patterns (the probe and merger lemmas). These give the forcing its compatibility and its support-descent properties (Lemmas 3.4 and 3.5, decision over a supporting diagram and support descent). Height and cost functions reduce the availability patterns of the next stage to countable cofinal paths, and a rearrangement of the same construction later bounds the symmetries that survive along such a path. [1]

**What the forcing gives directly.** Orbit maps of names show that every nonempty set of the model is a surjective image of $A\times\eta$ for some ordinal $\eta$, with no restriction on rank (Proposition 3.6, coding arbitrary sets by labels). The forcing also lets one well-orderable part of $A$ meet every member of any ordinal-indexed family of nonempty subsets of $A$, which with the presentation of arbitrary sets yields $\mathrm{AC}_{\mathrm{WO}}$ (Proposition 3.7). Symmetry prevents $A$ from being well-ordered (Proposition 3.8), and the model has no new countable sequences of ground-model objects (Proposition 3.9). [1]

**Stage two: exact availability fibers (Section 4).** Fix one equivalence relation on $A$ whose quotient is not well-orderable. For each diagram, record which quotient elements can be named at it; an element's availability pattern is the set of subdiagrams at which it can still be named, and labels have analogous patterns determined by which subdiagrams contain their indices. The copying and support-descent lemmas show that for each exact pattern the available labels and the available quotient elements have the same cardinality (Lemma 4.1, local quotient bound; Lemma 4.3, exact fibers), and restricting to a subdiagram in that pattern identifies the corresponding fibers canonically. These identifications group the fibers into components and are compatible with one another; the choices of bijections between label fibers and quotient fibers are not yet. [1]

**Stage three: covariant choices (Sections 5 and 6).** Lemma 5.2 shows the stabilizer quotient is countable, and Theorem 6.3, the quotient classification, is the central property itself. Each component has a countable cofinal chain of nested diagrams. Codes along the chain give a preliminary bijection compatible with every permutation that fixes a sufficiently late diagram pointwise; modulo these, the remaining symmetries form a countable group, and countably many bounded initial segments of the Cohen subsets are used to distinguish its elements and to select among the transported preliminary bijections. Transport between components then gives assignments that agree under restriction and respect all the required permutations, and their union is one hereditarily symmetric graph of a bijection for the fixed quotient. The paper stresses that this selection is performed between moved Cohen generics and does not require the permutations to act as automorphisms of a single fixed extension. [1]

**From the property to PP (Section 7).** Given a surjection onto a set $X$, partition $X$ into ordinal-indexed disjoint nonempty pieces with disjoint source pieces mapping onto them. A well-orderable target piece admits a reverse injection by $\mathrm{AC}_{\mathrm{WO}}$; otherwise both pieces are in bijection with $A$ by the central property. A further application of $\mathrm{AC}_{\mathrm{WO}}$ chooses the piecewise injections, and their union is the injection PP demands (Lemma 7.1, the all-set reduction). Section 7.3 adds an elementary ZF lemma (Lemma 7.4) identifying an explicit family without a choice function: if $A$ is not well-orderable then $\mathcal P(A)\setminus\{\varnothing\}$ has none, by a Hartogs-ordinal recursion. Section 8 gives the metatheory: the ordinary consistency deduction over $L$, and the separate statement over an arbitrary countable transitive model of ZFC, which is why there are two theorems. [1]

Where would an expert look first? Karagila singled out Lemmas 7.4 and 8.1 as statements one would not expect to see; the first is the elementary ZF lemma just mentioned and the second is the consistency lemma for the constructible ground, which is where a specialist might start. After that, Stage three, since the paper itself calls the coherence of the bijections the difficult part: the claim that the surviving symmetries form a countable group, and the equivariant selection between moved Cohen generics. A reader should also check the catalogued Lean statement, which assumes an inaccessible cardinal the paper does not. [1][3]

## Consequences inside mathematics

If the proof holds, a question open since 1902 is settled: the Partition Principle is strictly weaker than the Axiom of Choice. The dual Cantor-Schröder-Bernstein principle and the Weak Partition Principle inherit consequences spelled out in the paper's remarks. The result belongs to the fine structure of choice principles and does not change mathematics done with AC. [1]

## Uses outside mathematics

No known direct application.

## Has anyone checked it?

Asaf Karagila of the University of Leeds, who has worked on the Axiom of Choice for fifteen years and had promised a bottle of whisky to whoever solved this problem, wrote on 8 October: "I took a brief look at the preprint released by OpenAI (not at the Lean code, since I know very little of the actual usage of Lean, and that code was enormous). It sucked. It is unclear, muddled, and has a strange structure. The terminology is 'a bit off', there are theorems that I would not expect to be proved, that are also stated in a very strange manner." He objected to citations of unpublished lecture notes and a miscited paper of his own, and concluded: "if this was an academic paper submitted to a journal, it should be issued a desk rejection for the quality." He said he will not be sending the whisky and does not plan to read the paper, and called the release "the equivalent of a Denial of Service" on working mathematicians. He reported no error in the mathematics. [3]

Under Uruk's rules this is not "disputed", since no gap is identified, and not "under review", since the expert declines to review. It is the strongest negative verdict on exposition that any result on this site has received, from the person best placed to give it, and the reader should weigh it accordingly. [3]

**Machine checking.** The release's Lean scope note links two statements. The catalogued one, `PartitionPrinciple.lean` (277 lines, in `formalization.yaml`), constructs a transitive model of PP without Choice from a countable transitive ground model that, in the release's own words, contains "an internal strongly inaccessible cardinal", an assumption Theorem 1.1 does not make. The relative-consistency statement matching Theorem 1.1, `PartitionConsistency.lean` (324 lines), is linked but not in the catalogue. Karagila's follow-up post of 10 October explains why he will not rely on the Lean development: kernel soundness bugs are known, a formalized statement may not mean what the paper says, and millions of machine-generated lines cannot be audited; he adds that for this particular statement "the formalisation of the statement itself is easy enough to do right". We found no outside replay. A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval. [5][6]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; this paper is not among them. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [7]

## Sources

1. OpenAI, "The Partition Principle does not imply Choice", 24 September 2026. Theorems 1.1 and 1.2, the history section and the proof strategy. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/The-Partition-Principle-does-not-imply-Choice-September-24-2026/partition-principle-without-choice.pdf
2. Calliope Ryan-Smith, "Local reflections of choice", Acta Mathematica Hungarica 176 (2025), 244-257. Proposition 3.17 records the Pincus argument that PP implies choice for well-orderable families. https://doi.org/10.1007/s10474-025-01533-3
3. Asaf Karagila, "OpenAI, the Partition Principle, and mathematics", 8 October 2026, read 18 October 2026. https://karagila.org/2026/openai-pp/
4. AI Proved What?, episode 244, read 18 October 2026, for Levi 1902, Russell's claim, Karagila's "oldest open problem" description and Gilson's withdrawn preprints; the paper's own bibliography cites Gilson's September 2026 corrections. https://aiprovedwhat.com/episodes/244-partition-principle-not-choice/
5. OpenAI, Lean scope note for family 244 and the comparator statements `PartitionPrinciple.lean` and `PartitionConsistency.lean` at the pinned commit. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/244.md , https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/PartitionPrinciple.lean and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/PartitionConsistency.lean
6. Asaf Karagila, "Why I don't trust Lean code from AI", 10 October 2026, read 18 October 2026. https://karagila.org/2026/lean/
7. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
