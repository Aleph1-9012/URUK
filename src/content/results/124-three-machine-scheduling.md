---
family: "124"
topic: "Scheduling on three machines"
title: "Three machines, jobs that must wait for other jobs: is the shortest schedule easy to find?"
paperTitle: "A polynomial-time algorithm for three-machine unit-job scheduling"
claim: "There is a deterministic polynomial-time algorithm that, given any precedence graph on unit-length jobs, constructs a schedule of minimum makespan on three identical machines, and decides exactly whether a given deadline can be met. The running time is O((L+2)^150020) on a multitape Turing machine, where L is the input length."
status: unreviewed
checked: 2026-10-18
papers:
  - preprints/A-polynomial-time-algorithm-for-three-machine-unit-job-scheduling-September-24-2026/paper.pdf
draft: false
---

You have a list of tasks that each take one hour, some of which cannot start until others finish, and a few identical workers. How quickly can everything be done? With two workers this is easy, by an algorithm of Coffman and Graham from 1972. With the number of workers as part of the input it is NP-complete, Ullman showed in 1975, which is the standard way of saying no efficient algorithm is expected. In between sits the case of exactly three workers, which Garey and Johnson listed in 1979 among the open problems in their book on NP-completeness, and which stayed there for forty-seven years: the last problem from their list whose status had not moved. Special cases were solved, approximation schemes were found, and in 2025 Nederlof, Swennenhuis and Węgrzycki gave the first exact algorithm faster than trying everything, in subexponential time. On 24 September 2026 OpenAI posted a paper claiming a polynomial-time algorithm for three machines, with a running-time exponent of $150{,}020$. [1][3][4][5]

As of 18 October 2026 no mathematician has said publicly that they have read or checked the proof. The status on this page is "unreviewed".

## The problem

The input is a directed acyclic graph $G=(V,E)$ on jobs $V=\{1,\ldots,n\}$, where an arc $(u,v)$ means $u$ must finish before $v$ starts, together with a deadline $T$. Every job takes one unit of time and cannot be interrupted. A schedule assigns each job a slot $\tau(v)\in\{1,\ldots,T\}$ so that at most three jobs share a slot (three machines) and $\tau(u)<\tau(v)$ for every arc. The makespan is the last completion time. In the standard notation the problem is $P3\mid\mathrm{prec},p_j=1\mid C_{\max}$; there are no release dates, communication delays or other resources. [1]

**Garey and Johnson's open problem OPEN8 (1979).** Is $P3\mid\mathrm{prec},p_j=1\mid C_{\max}$ solvable in polynomial time, or is it NP-complete? [1][3]

<!-- uruk:visual-note
A visual for this page can show a small precedence graph and three machine lanes, let the reader drag jobs into slots and see the makespan, then show the Coffman-Graham rule succeeding on two lanes and failing on three. It cannot show the algorithm, which the paper says makes no practical running-time claim.
-->

## Why it stayed open

What was known. For two machines, Fujii, Kasami and Ninomiya and then Coffman and Graham gave optimal polynomial algorithms; Coffman and Graham's rule labels jobs and always runs the highest-labelled available ones, and on three machines that rule can fail. Garey, Johnson, Tarjan and Yannakakis solved three machines in linear time when the precedence graph is an opposing forest; Dolev and Warmuth solved it in polynomial time when the graph has bounded height. Approximation schemes that come within a factor $1+\varepsilon$ were found by Levey and Rothvoss in 2016 and improved by Garg, Li, and Das and Wiese, in quasipolynomial time. For exact solutions, nothing better than trying all orderings was known until Nederlof, Swennenhuis and Węgrzycki's $2^{O(\sqrt{n}\log n)}$-time algorithm, published at SODA in 2025, whose authors called the problem "the last open problem from the book of Garey and Johnson" for which both upper and lower bounds had stayed essentially unchanged since 1979. [1][4][5]

## What OpenAI claims

**Theorem 1.1** (OpenAI, 24 September 2026). Let an explicitly listed finite directed acyclic graph specify the precedence constraints on $n\ge1$ unit-length jobs on three identical machines. There is a uniform deterministic algorithm that constructs a feasible schedule of minimum makespan. Given also an integer deadline $1\le T\le n$, it decides feasibility exactly and returns a schedule whenever one exists. Both tasks can be performed in

$$
O\bigl((L+2)^{150020}\bigr)
$$

steps on a deterministic multitape Turing machine, where $L$ is the total binary input length. [1]

What this does and does not say. The theorem resolves OPEN8 on the polynomial side, for exactly the classical model. The exponent is enormous, and the paper says so: "The polynomial supplied by the proof has a very large constant exponent; no practical running-time claim is made." Nothing is claimed for four or more machines, where the question remains open, and the algorithm uses the number three directly. [1]

## How the claimed proof goes

What follows is a map of the paper's argument from its introduction and from Sections 2, 3 and 9. It is not a check of the details. The source runs to more than thirty thousand lines, and the structural theorem at its heart is the kind of combinatorial statement that is checked by patience rather than insight. [1]

**The idea.** After padding the instance with isolated jobs, every time slot holds exactly three jobs. If a few slots are selected and removed from a feasible schedule, the gaps between them can be scheduled independently: reordering the jobs inside one gap does not change their temporal relation to any job outside it. That suggests a recursive search whose subproblems are the sets of jobs in the gaps. The obstacle is how many different gap sets there could be: naming a gap by its two boundary triples does not determine its jobs, and intersecting descriptions inherited from ancestors could require arbitrarily long formulas. The paper proves that this does not happen, and the proof of that structural fact is almost the whole paper. [1]

**The finite family of descriptions (Section 2).** Fix a linear extension of the precedence order and its reverse, the two frames, and a rank for each job in each frame. Let $\mathcal F$ be the family of subsets of the job set $J$ described by Boolean formulas with at most $K=10{,}000$ leaves, where a leaf is a constant, a rank threshold $\mathrm{rk}\le k$ or $\mathrm{rk}\ge k$ in either frame, or membership in a triple of jobs or in one of its four "cones", the predecessors and successors of the triple in either frame. There are $O(N^{3})$ atomic tests and a constant number of tree shapes with at most $K$ leaves, so $|\mathcal F|=O(N^{3K})$, and Lemma 2.3 says the family can be generated deterministically in polynomial time as $N$-bit vectors. A global description is a set $W=F$ with $F\in\mathcal F$; a relative description is $L=W\cap F$. [1]

**The algorithm (Section 3).** Accept or reject each $W\in\mathcal F$ in increasing order of size: reject sizes not divisible by three, accept the empty set, and for each other $W$ form states $(L,Z,R)$ with $W=L\sqcup Z\sqcup R$, $Z$ an antichain triple, $L=W\cap F$ for some $F\in\mathcal F$, keeping a state only if no job in a later part precedes a job in an earlier one. A state is initial if $L$ is accepted and final if $R$ is, and there is an edge $(L,Z,R)\to(L',Z',R')$ exactly when $L\cup Z\subseteq L'$ and the set $L'\setminus(L\cup Z)$ is accepted; all acceptance values consulted are of smaller sets. $W$ is accepted if an initial state reaches a final state, and the answer is yes exactly when $J$ is accepted. Soundness is easy: every accepted set has a full schedule, obtained by concatenating the accepted gaps around the selected triples, and the algorithm can return it. Completeness is the content of the structural theorem. [1]

**The structural theorem (Theorem 3.4).** Every feasible full three-machine schedule has a bounded-description hierarchy: a recursive decomposition into selected triples and gaps in which every gap and every marked split is described globally by a formula in $\mathcal F$, independently of the depth. The theorem adds that the predicates actually needed have fewer than $500$ leaves; the allowance $K=10{,}000$ is chosen to avoid any dependence on tight counting. [1]

**How the hierarchy is built (Sections 4 to 8).** Lexicographically minimal schedules are used only as existence witnesses, never computed. Fix a priority order extending precedence and call its current initial segment low and the rest high. A selected slot separates the cutoff when every earlier high job is a predecessor of a job in that slot and every later low job is a successor of one; within a normalized interval, jobs are promoted one at a time from high to low and a separator is moved forward, so that each pair of successive selected slots shares a common cutoff (Section 4, the shared-cutoff walk). The two sides of a centre slot are treated by one construction with time and precedence reversed (Section 5). To describe a gap without remembering all its ancestors, the construction maintains a short list of sets closed under taking successors in the current direction; Lemma 6.4 shows that every pruned list has at most five entries, at most three of them injections from the current run, which is where the capacity three of the machines enters. A global boundary condition excludes distant jobs and an exchange condition keeps that control valid after later reorderings (Section 7, Lemmas 7.1 and 7.2). At a change of direction, a paired form of the inherited entries replaces their history by a bounded formula (Section 6, local flattening and the new switch upset), and Section 8 converts the whole description of an interval and of its marked splits into formulas, with Lemma 8.3 counting the leaves. The paper notes that the distinction between a description that agrees with a set inside a known interval and one valid on all jobs is what forces the flattening step. [1]

**The running time (Section 9).** With $B=C_KN^{3K}$ enumerated sets, the state graph is explored in $O_K(BN^{4})$ steps on a deterministic multitape machine without random access; the deadline decision is run for every deadline $1,\dots,n$ for makespan minimization; and with $K=10{,}000$ everything, input processing included, fits in $O((L+2)^{150020})$ steps for input length $L$. The exponent is $3K$ plus small change, which is where $150{,}020$ comes from. [1]

**Antecedents.** Dolev and Warmuth's zero-adjusted schedules and Nederlof, Swennenhuis and Węgrzycki's proper decompositions and memoization by source and sink sets are named as the starting point; the paper proves its separator statements and the size bound on global descriptions directly and says the polynomial bound does not follow by specializing the subexponential one. [1]

Where would an expert look first? At the five-entry bound of Lemma 6.4 and the flattening at changes of direction, which together are what make the description depth-independent; at the global boundary invariants of Section 7; and at the completeness claim, that the algorithm's edges really reproduce the hierarchy's gaps. The complexity section is routine once the structural theorem is granted. [1]

## Consequences inside mathematics

If the proof holds, a forty-seven-year-old open problem from Garey and Johnson's list is settled on the side of tractability: $P3\mid\mathrm{prec},p_j=1\mid C_{\max}$ is in P. The method, bounded global descriptions of gaps in a recursive decomposition, is the kind of structural result that might extend to four machines or to related scheduling problems, though the paper claims no such extension. It also means the problem is not NP-complete unless P equals NP. [1]

## Uses outside mathematics

No known direct application.

Scheduling unit jobs with precedence constraints on a few processors is a real problem in compilers and operating systems, and it is solved there by heuristics and by the exact two-machine algorithm. An algorithm with exponent $150{,}020$ cannot be run on any input; its value is the knowledge that the problem is tractable in principle, which may guide the search for a practical one. [1]

## Has anyone checked it?

We found no named mathematician or computer scientist who says they are reading or checking this paper, and no public comment from Nederlof, Swennenhuis, Węgrzycki or Rothvoss. VibeMathed records no check by an independent mathematician. [6]

**Machine checking.** The release's Lean scope note links a statement `ThreeMachine.lean` of 100 lines, which specifies the input encoding and asserts a polynomial-time algorithm that constructs a minimum-makespan schedule and decides deadlines. That statement is not in the catalogue `formalization.yaml` at the pinned commit, so it is not among the formalizations the release presents as complete. We found no outside replay. A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval. [2]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; this paper is not among them. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [7]

## Sources

1. OpenAI, "A polynomial-time algorithm for three-machine unit-job scheduling", 24 September 2026. Theorem 1.1, the prior-work paragraphs, "Why a finite search can suffice" and the organization. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/A-polynomial-time-algorithm-for-three-machine-unit-job-scheduling-September-24-2026/paper.pdf
2. OpenAI, Lean scope note for family 124 and the comparator statement `ThreeMachine.lean` at the pinned commit, with `lean/formalization.yaml`, which does not list it. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/124.md , https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges/ThreeMachine.lean and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/formalization.yaml
3. Michael R. Garey and David S. Johnson, Computers and Intractability: A Guide to the Theory of NP-Completeness, W. H. Freeman, 1979, Appendix A13, problem OPEN8; and Wikipedia, "Garey and Johnson's list of open problems" context in "Computers and Intractability", read 18 October 2026. https://en.wikipedia.org/wiki/Computers_and_Intractability
4. E. G. Coffman Jr. and R. L. Graham, "Optimal scheduling for two-processor systems", Acta Informatica 1 (1972), 200-213. https://doi.org/10.1007/BF00288685
5. Jesper Nederlof, Céline M. F. Swennenhuis and Karol Węgrzycki, "A subexponential time algorithm for makespan scheduling of unit jobs with precedence constraints", Proceedings of SODA 2025, 535-552; journal version ACM Transactions on Algorithms (2026). The quotation is from the arXiv abstract. https://arxiv.org/abs/2312.03495
6. VibeMathed, "Three-machine precedence scheduling", read 18 October 2026. https://vibemathed.com/problem/three-machine-precedence-scheduling
7. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
