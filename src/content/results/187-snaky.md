---
family: "187"
topic: "The Snaky game"
title: "Can the first player always draw the snake?"
paperTitle: "Snaky in 21 Maker moves"
claim: "In the Maker-Breaker achievement game on the empty infinite square board, where players alternately claim cells and Maker wins by owning a copy of the six-cell Snaky polyomino up to rotation and reflection, there is a single legal Maker strategy that wins within 21 Maker moves against every Breaker reply. The same bound holds on a 17×17 board, and Maker can confine all its moves to a fixed 251-cell region."
status: unreviewed
checked: 2026-10-20
papers:
  - preprints/Snaky-in-21-Maker-moves-September-25-2026/article.pdf
draft: false
---

Two players take turns claiming squares on an unlimited sheet of graph paper. One of them, Maker, is trying to own all six squares of a particular shape, in any position, rotated or reflected; the other, Breaker, wants only to stop this. For which shapes can Maker always win? Frank Harary posed this family of games in the 1970s for every polyomino, and over the following decades every shape of up to six cells was settled, with one exception. The shape is Snaky, a row of four squares with a two-square tail stepping up at one end. It was known that Maker wins in three dimensions, that Maker cannot win on an $8\times8$ board, that no simple pairing strategy can defend it, and that Maker wins if given an extra stone at the start; Nándor Sieben, who proved that Snaky is a winner in forty-one dimensions, described the ordinary planar game as undecided in 2008. On 25 September 2026 OpenAI posted a paper claiming that Maker wins on the plane in at most 21 moves, with the strategy written out as a finite certificate of 728 conditions and a checker program. [1][2][3][4]

As of 20 October 2026 no mathematician has said publicly that they have read or checked the proof. The status on this page is "unreviewed".

## The problem

The board is $\mathbb Z^{2}$, initially empty. Maker moves first and the players alternate, each claiming one unclaimed cell, permanently. The target is

$$
S=\{(0,0),(1,0),(2,0),(3,0),(3,1),(4,1)\},
$$

and an allowed copy is $t+R(S)$ for a translation $t$ and one of the eight rotations and reflections $R$ of the square. Maker wins on owning every cell of an allowed copy; Breaker never needs a copy of anything, which is why this is the weak, or Maker-Breaker, achievement game. A strategy may consult the whole history. [1]

**Harary's question for Snaky.** Does Maker have a winning strategy on the empty plane, and if so in how many moves? [1][2]

<!-- uruk:visual-note
A visual for this page is the game itself: the Snaky shape and its eight orientations; a board where the reader plays Breaker and the page plays the certified Maker moves, with the move counter running to 21; and the 251-cell envelope outlined to show that Maker never leaves it. The paper ships its certificates as text and a checker, and contains six TikZ figures. The certificate is a proof, not a policy table, so a playable version needs the paper's Section "strategy" translated into code.
-->

## Why it stayed open

What was known. Harary, Harborth and Seemann gave strategies with a handicap of two extra stones; Sieben in 2004 showed there is no pairing defence for Breaker, so Breaker cannot win by a simple scheme, and proved Maker wins in dimension 41; Halupczok and Schlage-Puchta in 2007 proved Maker wins in three dimensions, loses on an $8\times8$ board, and wins on the plane with a handicap of one; Ito and Miyagawa gave another handicap-one construction; Sieben in 2008 introduced proof trees for weak achievement games and gave a finite proof sequence for the handicap case. Computer searches of finite boards using quantified Boolean formulas treated only small boards. The empty plane with no handicap resisted because Breaker may play anywhere on an infinite board, so a finite computation has to cover infinitely many replies. [1]

## What OpenAI claims

**Theorem 1** (OpenAI, 25 September 2026). In the game above there is one globally legal Maker policy that completes an allowed copy of $S$ within at most 21 actual Maker claims against every legal continuation of Breaker; equivalently, Maker wins no later than the 41st individual turn. The same bound holds on a finite $17\times17$ board, and Maker can confine its claims to a fixed board of 251 cells. [1]

What this does and does not say. The count is of Maker's actual claims, including any replacement moves used in the proof. The paper does not assert that 21 is optimal, that 251 cells or $17\times17$ is minimal, or anything about the strong game in which both players try to make the shape. Three constructions are given, with bounds 21, 25 and 35, kept separate because "their content is not determined by the empty-board move bounds alone". [1]

## How the claimed proof goes

What follows is a map of the paper's argument from Sections 2 to 6, which are short and were read in full. It is not a check of the certificate data. [1]

**The idea.** A finite certificate of Maker's win must say something about every possible Breaker reply, including replies far away on the infinite board. The paper's device is a notion of "valid claim" that is insensitive to where Breaker plays outside a finite envelope, and one combination rule that builds larger valid claims from smaller ones. The 21-move certificate is then 722 applications of that rule, starting from six trivial bases, and a Python script reconstructs the finite sets involved. The method is Sieben's proof trees and situations, restated at Maker's turn, with arbitrary prior ownership tracked explicitly, and with every actual fresh Maker claim counted. [1]

**Valid claims (Section 2).** Let $M,B\subset\mathbb Z^{2}$ be the finite disjoint sets currently owned by Maker and Breaker. For finite $A\subseteq T$ and an integer $h\ge1$, the triple $(A,T,h)$ is a valid claim if, at every position with Maker to move in which $A\subseteq M$ and $B\cap T=\varnothing$, Maker has already completed a Snaky or can complete one within $h$ further actual Maker moves. Nothing is assumed about extra Maker cells, about Breaker cells outside the envelope $T$, or about how the position was reached. A placement is an affine map $x\mapsto Rx+t$ with $R$ one of the eight signed coordinate permutations, and valid claims are transported by placements with the same height. [1]

**The combination rule (Lemma 3).** Given valid claims $(A_i,T_i,h_i)$ for $1\le i\le r$ and a pivot cell $p$, set

$$
T=\{p\}\cup\bigcup_iT_i,\qquad A=\Bigl(\bigcup_iA_i\cup\bigcap_iT_i\Bigr)\setminus\{p\},\qquad h=1+\max_ih_i.
$$

Then $(A,T,h)$ is valid. The proof: Maker claims $p$ if it is free, otherwise any free cell, which exists because the board is infinite and ownership finite; either way Maker now owns $\bigcup A_i\cup\bigcap T_i$. Breaker's next cell $b$ is not owned by Maker, so $b\notin\bigcap T_i$, and some child envelope $T_i$ avoids it; the older Breaker cells avoid $T_i\subseteq T$ too; so the child claim $(A_i,T_i,h_i)$ applies and Maker wins within $1+h_i\le h$ moves. The replacement move, when $p$ was already Maker's, is a real move and is counted. A Breaker reply outside $T$ misses every child envelope, so distant play needs no case analysis; this is what removes any board cutoff. A Breaker-turn variant says that if Maker already owns $A\cup\{p\}$ and Breaker is to move, Maker wins within $h-1$. The six bases (Lemma 4) are the claims $(S\setminus\{s_j\},S,1)$: if Maker owns five cells of a Snaky placement and Breaker none of the six, one move completes it. [1]

**The certificate (Section 3 and Appendix D).** Cells are encoded as two characters from the alphabet 0 to G, so coordinates run from $0$ to $16$; a reference `j:sUV` means card $j$ transformed by the signed permutation $R_s$ and translated by the point `UV`. Proposition 5: the data have exactly $722$ numbered lines with indices $6$ to $727$, every line has a nonempty child list, every reference uses an allowed placement of an earlier card, and every parenthesized inline expression is a finite nonempty combination; together with the six bases they produce $728$ valid claims of height at most $21$, and the last card has pivot $p_{727}=(8,8)$, required set $A_{727}=\varnothing$, an envelope of $251$ cells inside $\{0,\dots,16\}^{2}$, and height $21$. An empty required set and an envelope with no Breaker cells is exactly the empty board, so card 727 is the theorem. The 21-move construction uses $4{,}089$ references and $1{,}620$ combination nodes, $898$ of them inline. [1]

**One strategy (Section 4).** The recursive certificate is turned into a single policy fixed before play: enumerate $\mathbb Z^{2}$ by increasing sup-norm then lexicographically; start from card 727 in the identity placement; at an active combination with placement $F$, claim $F(p)$ if free, otherwise the first free cell in the enumeration; after Breaker's reply, pass to the first child in the printed order whose placed envelope avoids it, composing placements; at a base card, claim the one missing cell. Each nonterminal step spends one Maker move and strictly decreases the height, so the game ends within $21$ Maker moves. [1]

**Two further constructions and a local lemma.** Appendices A and B give a 25-move construction with reduced envelopes ($2{,}010$ rows, Propositions 8 and 9) and a 35-move construction ($610$ rows, Theorem 11), each with its own table and orientation codes; the three are independent routes to weaker bounds. Section 5 proves a local statement (Proposition 7): with Maker to move, four Maker stones in a row and at most three Breaker cells in a $10\times9$ box around them, Maker wins, a perpendicular attack related to Halupczok and Schlage-Puchta's four-in-a-row tactics; it explains some of the geometry behind the certificate's threats but is not used in the main proof. [1]

**What the machine checks (Section 6 and Appendices C and G).** The paper separates three things: the game-theoretic soundness of the combination rule, which is Lemma 3 and is proved by hand; the exact finite sets produced by the certificate data, which a program using only the Python standard library reconstructs, parsing the grammar and backward references, applying placements and recomputing every required set, envelope and height, with a second independent implementation for each dialect; and the identity of the distributed files, which a checksum covers. The checker does not play the game or search; it verifies that the certificate is a valid instance of the proved rule. [1]

Where would an expert look first? At Lemma 3, in particular the envelope-intersection claim and the counting of replacement moves; at the passage from the recursive certificate to a single legal policy in Section 4; and at running the checker, which is the only way to confirm that the $722$ rows really chain to an empty required set at height $21$. [1]

## Consequences inside mathematics

If the proof holds, the last undecided polyomino of Harary's planar achievement games is a Maker win, and the handicap results of the 2000s are superseded; the certificate format, finite conditional positions covering an infinite board, is a reusable tool for other weak achievement games. The optimal move count and the strong game remain open. [1]

## Uses outside mathematics

No known direct application.

Maker-Breaker games are a standard model in the theory of positional games and have been used to study Hex, tic-tac-toe variants and the complexity of planning; QBF solvers are tested on them. The theorem settles a specific puzzle rather than a general method. [1]

## Has anyone checked it?

We found no named mathematician who says they are reading or checking this paper, and no public comment from Sieben, Halupczok, Schlage-Puchta or Pluhár, whose work it builds on. VibeMathed records no check by an independent mathematician. [5]

**Machine checking.** The release's Lean scope note links three comparator statements: `SnakyTwentyOne.lean`, a legal winning strategy within 21 Maker moves that checks disjointness and move counts throughout play; `SnakyConditional.lean`, the four conditional templates; and `SnakyCertificate.lean`, a reconstruction of the 35-move certificate. None of the three is in the catalogue `formalization.yaml` at the pinned commit. The paper's own Python checker verifies the certificate data; we did not run it. A kernel check or a certificate check is evidence about the formal statement, not a reading of the paper; Uruk does not count either as approval. [6]

The pinned commit is the repository as it stood on 29 October 2026. On 7 October OpenAI withdrew three manuscripts and revised fourteen; this paper is not among them. On 26 October OpenAI added two manuscripts, on the Exponential Time Hypothesis and on local smoothing for the wave equation, and more Lean statements; nothing in this family changed. [7]

## Sources

1. OpenAI, "Snaky in 21 Maker moves", 25 September 2026. The rules, Theorem 1, earlier results, the proof overview and "Finite verification and its scope"; the certificates and checker ship in the paper's `verification/` folder. Paper at the pinned commit: https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Snaky-in-21-Maker-moves-September-25-2026/article.pdf
2. Nándor Sieben, "Snaky is a 41-dimensional winner", Integers 4 (2004), G5. https://math.colgate.edu/~integers/vol4.html
3. Immanuel Halupczok and Jan-Christoph Schlage-Puchta, "Achieving Snaky", Integers 7 (2007), G2. https://math.colgate.edu/~integers/vol7.html
4. Nándor Sieben, "Proof trees for weak achievement games", Integers 8 (2008), G7. https://math.colgate.edu/~integers/vol8.html
5. VibeMathed, "Snaky achievement game", read 20 October 2026. https://vibemathed.com/problem/snaky-achievement-game
6. OpenAI, Lean scope note for family 187 and `lean/formalization.yaml` at the pinned commit. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/187.md and https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/formalization.yaml
7. OpenAI, `history.md` in openai/math, entries for 7, 26 and 29 October 2026. https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/history.md
