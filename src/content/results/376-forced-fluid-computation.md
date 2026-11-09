---
family: "376"
topic: "Computation in forced Navier-Stokes flows"
title: "Can a controlled fluid flow run any computer program?"
paperTitle: "Finite Instructions and Solenoidal Shear Flows"
claim: "For any finite Turing machine and input, a finite algorithm constructs smooth mean-zero solenoidal forcing on the fixed flat three-torus, from rest, such that one fixed particle reaches one fixed open strip if and only if the machine halts. The main construction has bounded mixed derivatives and repeats after loading; companion constructions give different time dependence, geometry and velocity-field detectors."
status: unreviewed
checked: 2026-11-07
papers:
  - preprints/Finite-Instructions-and-Solenoidal-Shear-Flows-September-27-2026/manuscript.pdf
  - preprints/A-Fixed-Particle-Test-for-Computation-in-a-Forced-Viscous-Flow-September-27-2026/manuscript.pdf
  - preprints/Universal-Computation-with-Eventually-Stationary-Navier-Stokes-Forcing-September-27-2026/manuscript.pdf
  - preprints/Geometric-Programs-for-Solenoidal-Forcing-September-27-2026/manuscript.pdf
  - preprints/Prefix-Instructions-and-Incompressible-Flows-September-27-2026/manuscript.pdf
  - preprints/Computation-under-Rapidly-Vanishing-Navier-Stokes-Forcing-September-27-2026/manuscript.pdf
  - preprints/Velocity-Field-Detection-of-Computation-in-Forced-Navier-Stokes-Flows-September-27-2026/manuscript.pdf
  - preprints/Scalar-Potentials-and-Slow-Clocks-for-Forced-Fluid-Computation-September-27-2026/manuscript.pdf
  - preprints/Incompressible-Box-Transport-and-Finite-Computation-October-6-2026/manuscript.pdf
draft: false
---

Mark one particle in a fluid initially at rest. Apply a force specified by a finite program, and watch a fixed region. Can the particle enter that region exactly when the program finishes? OpenAI's family of nine papers claims such constructions for smooth viscous flows. The force carries the instructions; the fluid's exact motion carries the computation. Some constructions repeat their forcing, some eventually hold it constant, and others let it decay. A separate companion reads the answer from the velocity field itself. [1][2][3][4][5][6][7][8][9]

These are particular flows designed to remain smooth for all time. They do not settle the general Navier-Stokes existence and smoothness problem. The selected papers are dated 27 September 2026, except the box-transport paper, dated 6 October. Our search on 7 November found public discussion and reported machine checks, but no public specialist verification of these proofs. The human-review label remains "unreviewed"; the discussion and the limited scope of the formalized statements are described below. [17][18][19][20][21]

## The problem

A Turing machine is a finite instruction table acting on an unbounded tape. At each step it reads one symbol, changes a symbol and state, and moves its head. A finite input starts a run that may halt after finitely many steps or continue forever. There is no algorithm that always finishes and correctly decides which outcome occurs for every machine and input. This is the halting problem. [10]

A flow can encode a machine state in a particle's position. For example, successive digits of a coordinate can represent successive tape symbols. A map that removes one leading digit and adds another can implement a tape operation. The challenge is to make these maps arise from the specified fluid equation, using a force whose description can be produced without first discovering the outcome of the computation. [1][11]

The equation here is the incompressible Navier-Stokes equation

$$
\partial_tu+(u\cdot\nabla)u=-\nabla p+\nu\Delta u+f,
\qquad \nabla\cdot u=0,
\qquad u(0,x)=0.
$$

The vector $u(t,x)$ is velocity, $p(t,x)$ is pressure, $\nu>0$ is viscosity, and $f(t,x)$ is an externally imposed force per unit mass. The term $(u\cdot\nabla)u$ describes transport by the fluid's own motion; $\nu\Delta u$ describes viscous diffusion. Zero divergence means that small moving volumes keep their volume. A vector field with zero divergence is also called solenoidal. The starting fluid is at rest. [1]

The main paper works on the unit flat three-torus $\mathbb T^3=\mathbb R^3/\mathbb Z^3$. Opposite faces of a unit cube are identified, so a particle leaving one face returns through the opposite face. The geometry is locally Euclidean and has no outer wall. A material particle starting at $a$ follows

$$
\dot X(t;a)=u(t,X(t;a)),\qquad X(0;a)=a.
$$

The question is whether a compiler can turn any finite machine and input into a force such that this one particle eventually enters a prescribed open set exactly when the machine halts. "Eventually" means at some finite time, with no universal upper limit on how long one must wait. [1]

The papers allow an effective smooth force. Its finite description must permit evaluation, including its derivatives, to any requested rational accuracy. This does not mean a laboratory can manufacture arbitrarily fine features. It does mean that the description cannot conceal the halting answer in an unknown real number or in a prerecorded trajectory obtained by running the program to completion. [1][2][6]

## Why it stayed open

Turing established undecidable machine questions in 1936. In 1990 and 1991, Cristopher Moore developed ways to embed computation into low-dimensional dynamical systems using symbolic shifts. Long-term questions about continuous motion could therefore inherit the impossibility of a general halting algorithm. That result does not automatically survive the additional requirements of incompressibility, viscosity, a fixed geometry and a specified observation. [10][11]

There is also an information problem. An ordinary instruction may overwrite a symbol and discard what was there before. A smooth flow over a finite time interval has an invertible flow map, so two distinct starting particles cannot merge into the same particle. Charles Bennett's 1973 work on reversible computation supplies the relevant idea: retain enough history to recover each previous instruction. In these papers the history has to fit an exact geometric encoding whose complete instruction domains remain separated. [1][9][12]

Fluid computation already had substantial precedents. Cardona, Miranda, Peralta-Salas and Presas constructed a stationary Euler flow on the three-sphere in 2021 whose particle trajectories simulate computation. Euler's equation describes the inviscid case, without viscosity. Their metric, which specifies distances, is adapted to the construction. Cardona, Miranda and Peralta-Salas later obtained a Euclidean Beltrami flow, a special stationary Euler flow whose curl is proportional to its velocity, with universal computation, but infinite energy and a noncompact computational region. Their flat-torus construction robustly simulates machines with a fixed tape bound. Those geometric, energy and memory qualifications matter. [14][15]

For the Beltrami eigenfields used in those constructions, an exponentially decaying multiple gives a viscous solution. This creates another difficulty. The particle travels through only a finite amount of the original flow's internal time. A larger initial amplitude allows more computation, but does not by itself supply one unlimited simulation from rest. The 2021 and 2023 papers explain this limitation. [14][15]

In 2026, Dyhr, González-Prieto, Miranda and Peralta-Salas proved a different viscous universality theorem. On suitable compact three-manifolds, they deform the metric to construct unforced stationary Navier-Stokes flows whose particles compute. They use the Hodge Laplacian as their chosen viscous operator and a harmonic velocity for which that term vanishes. This is an earlier viscous computation result, with a different metric and nonzero initial flow. Family 376's issue is how to combine a fixed flat geometry, startup from rest, a finite force prescription and an exact detector. [16]

Terence Tao's 2014 discussion of fluid logic gates belongs to a further question: whether a robust, self-reproducing fluid construction could create finite-time breakdown. His proved blowup theorem concerns an averaged modification of Navier-Stokes. Encoding an arbitrary program in the ordinary forced equation does not supply the shrinking, self-reproducing mechanism that this programme would require. [13]

The elementary freedom to choose a force leaves considerable work. One must compile all possible instructions into a single smooth field, preserve volume and information, rule out accidental visits to the detector between instructions, and retain the promised bounds for an arbitrarily long run. Each companion changes one part of that problem. [1][3][6][7][9]

## What OpenAI claims

Theorem 1.1 of *Finite Instructions and Solenoidal Shear Flows* fixes any positive computable viscosity $\nu$, the unit flat three-torus, the particle

$$
a_*=(1/8,3/8,1/2),
\qquad O=\{x\in\mathbb T^3:1/2<x_1<1\}.
$$

For every finite deterministic one-tape machine $M$ and finite input $w$, it claims an effective smooth force $f_{M,w}$ with the following properties. [1]

- The force has zero divergence and zero spatial mean. The constructed solution is $(U,0)$, with zero initial velocity and pressure identically zero.
- Every fixed mixed derivative in time and space of $U$ and $f_{M,w}$ is bounded for all time. The bounds may depend on the machine, input, viscosity and derivative order. Kinetic energy stays bounded.
- Velocity and force repeat with period one after a one-unit loading interval. For a fixed machine, the repeated part does not depend on the input.
- In the stated periodic classical solution class, the velocity and normalized pressure are unique.
- The exact equivalence is

$$
\exists t\ge0:\ X(t;a_*)\in O
\quad\Longleftrightarrow\quad
M\text{ halts on }w.
$$

The classical comparison class requires the velocity, its time derivative, its spatial derivatives through order two, the pressure and its gradient to be continuous on every finite closed space-time cylinder. Pressure has zero spatial mean to remove the freedom to add a function of time. This is a uniqueness statement for the explicitly constructed smooth solution, with these regularity assumptions. [1]

The point and detector are fixed before the input is supplied. The force is allowed to depend on the input. That order of choices is essential. The nine papers provide the following related constructions; their strongest properties do not all hold for a single force. [1][2][3][4][5][6][7][8][9]

| Paper | Role in the family |
|---|---|
| *Finite Instructions and Solenoidal Shear Flows* [1] | Reversible tape instructions realized by transverse shears. The main force is solenoidal, has zero mean and repeats after loading. |
| *A Fixed Particle Test for Computation in a Forced Viscous Flow* [2] | Stores history in a third coordinate and stretches successive instruction times. All mixed derivative supremum norms are bounded and square integrable in time. |
| *Universal Computation with Eventually Stationary Navier-Stokes Forcing* [3] | Uses a spatial clock. After startup the force is independent of time, while particles continue to compute. |
| *Geometric Programs for Solenoidal Forcing* [4] | Gives periodic forcing from time zero and realizes positive diagonal maps on coding sheets. Normal motion compensates changes in sheet area. |
| *Prefix Instructions and Incompressible Flows* [5] | Develops retained histories, full rectangles, thin boxes and invariant coding planes, with separate loading and clock choices. |
| *Computation under Rapidly Vanishing Navier-Stokes Forcing* [6] | Shrinks spatial memory so that every mixed force derivative decays faster than every inverse power of time, with computation continuing. |
| *Velocity-Field Detection of Computation in Forced Navier-Stokes Flows* [7] | Detects halting through a velocity threshold or an integrated velocity, using advection and diffusion estimates. |
| *Scalar Potentials and Slow Clocks for Forced Fluid Computation* [8] | Builds compactly supported flows from scalar potentials and changes their speed without losing late halting events. |
| *Incompressible Box Transport and Finite Computation* [9] | Moves whole solid boxes by determinant-one affine maps and applies this to a balanced three-stack computer in Euclidean space. |

## How the claimed proofs go

The common plan is to prescribe a divergence-free velocity that performs the computation, then calculate the force needed to sustain it. The map below follows the complete pinned sources of all nine papers. It explains the submitted arguments; it is not an independent proof verification. The first route gives the main torus theorem, followed by the distinct mechanisms behind the companions. [1][2][3][4][5][6][7][8][9]

### Keep enough history to make every instruction reversible

A machine instruction can destroy information. The compiler in Lemma 2.1 of the shear-flow paper attaches a history track and a moving frontier to the work tape. It marks the working position, records the old instruction in fresh history space, and returns to continue the simulation. Each original instruction becomes finitely many local steps. The distance to the growing history determines the cost; there is no claim of a constant number of local steps per original instruction. [1]

The inverse must work on every tape allowed by a local rule, including arbitrary unseen tails. Showing reversibility only on the specially initialized run would not suffice. In the fluid construction each rule acts on a whole region of positions. Its inverse has to distinguish all predecessors in that region, so different rule images must remain disjoint throughout their full domains. Marks, frontier symbols and separate return states distinguish otherwise ambiguous incoming instructions. [1]

### Turn tape operations into maps of separated rectangles

Write the left and right tape halves as radix expansions, using separated odd digits in a base $B=2m+1$ for an alphabet with $m$ symbols. Fixing a finite prefix fixes a closed interval; unused digits leave positive gaps between incompatible prefixes. Two coordinates therefore give rectangles for the finitely many instruction branches. Moving the tape head transfers a digit between coordinates and produces reciprocal scales of the form

$$
(x,y)\longmapsto(a+\lambda x,b+\lambda^{-1}y).
$$

Their determinant is one, so area is preserved. Lemma 4.1 proves separate disjointness of the full source rectangles and the full target rectangles. It does not require every source to avoid every target. The initial tape is eventually blank, so its infinite tail sums to a rational coordinate that the compiler can calculate. The outcome is not hidden in the initial digits. [1]

### Realize the rectangle maps without viscous or geometric shortcuts

Theorem 3.2 raises each rectangle to its own height, performs four planar shears, translates it, and lowers it into its target. A shear moves parallel layers sideways without compressing them. Lemma 3.1 factors the reciprocal diagonal scaling into four such operations and bounds every intermediate displacement. If the endpoint offsets from the rectangle centers are at most $h$, the intermediate offsets stay within $2h$, even for large $\lambda$. This bound provides room for the surrounding smooth cutoffs. [1]

Each cutoff equals the exact required function on a neighborhood of the moving rectangle and vanishes outside a larger region. Compensation away from the coded paths makes the fields have zero spatial mean. Time pulses have disjoint supports and stop to every derivative order at their endpoints, so concatenating and repeating them produces a smooth field. At each stage the velocity moves only in directions on which its coefficients do not depend. Consequently

$$
\nabla\cdot U=0,\qquad (U\cdot\nabla)U=0.
$$

For this particular construction the required force simplifies to $f=\partial_tU-\nu\Delta U$. It is itself divergence free and mean zero, with pressure zero. General constructions elsewhere in the family must keep the nonlinear transport term. [1][4]

### Protect the detector between instruction times

At integer times the particle must encode the correct machine state. That alone does not prove the observation theorem. A nonhalting particle could cross the detector while travelling between two safe endpoints. [1]

The shear bounds give a stronger statement. All ordinary nonhalting paths stay to the left of the observation strip throughout every pulse, while a halted code lies strictly inside it. The one-time loader from $a_*$ to the rational input code satisfies the same exclusion. Induction at instruction times identifies the run, and the continuous path bounds exclude false signals between those times. Corollary 3.3 supplies the geometric observation control used in this assembly. Initially halted inputs are covered by the loader entering their halted code. [1]

### Derive the force and prove the specified uniqueness

For any prescribed smooth divergence-free $U$ starting at rest, define its Navier-Stokes residual

$$
F_\nu[U]=\partial_tU+(U\cdot\nabla)U-\nu\Delta U.
$$

Then $(U,0)$ solves the equation with force $F_\nu[U]$. The construction's substance lies in the finite instruction geometry and its estimates. This identity transfers those properties to an actual forced solution. [1][5][9]

To compare with another permitted solution $v$, put $w=v-U$. Incompressibility cancels the transport and pressure pairings in the energy calculation, leaving

$$
\frac12\frac{d}{dt}\|w\|_2^2+\nu\|\nabla w\|_2^2
\le \|\nabla U\|_\infty\|w\|_2^2.
$$

Here $\|w\|_2^2$ is the spatial integral of squared velocity difference. Since it starts at zero and the coefficient is bounded on every finite interval, Gronwall's inequality forces it to remain zero. Whole-space variants specify Sobolev and pressure assumptions that justify this integration. For example, Theorem 4.1 of the box paper uses velocity continuous in $H^2$, continuously differentiable in time into $L^2$, bounded velocity and gradient on finite intervals, and pressure represented in $C_tH^1$ up to spatial constants. The spaces $H^k$ require square-integrable spatial derivatives through order $k$. These assumptions must not be replaced by uniqueness among arbitrary weak solutions. [1][9]

Effectivity also needs checking. A finite table lists all branches, and the field activates them according to position. Smooth flat cutoffs come with computable error bounds. Evaluation uses finite bounds on potentially active pieces rather than an exact test of whether a computable real lies on a cutoff endpoint. It never needs to discover which branches the selected run will eventually visit. [1][2][6]

### Use sheets, or move whole boxes

A map may change area on a two-dimensional coding sheet while preserving volume in three dimensions. Theorem 1.2 of *Geometric Programs* realizes arbitrary positive diagonal sheet scales by compensating in the normal direction. Theorem 1.1 separately gives a machine construction whose force is periodic from time zero. Its initialization is built into the placement or repeated instruction table, rather than appended as a nonperiodic first interval. [4]

*Prefix Instructions* makes the distinction between sheets and solid boxes explicit. Its retained history tags can change the total encoded prefix length, so the planar determinant need not be one. Lemma 3.3 supplies the reciprocal normal scale. Lemma 5.1 acts on actual thick boxes, but allows their thickness to change. A different construction in Lemmas 6.1 and 6.2 preserves only a coding plane: for a planar field $b$ and a smooth scalar $h$ with $h(z_0)=0$ and $h'(z_0)=1$, it uses

$$
U(t,x,y,z)=\bigl(h'(z)b_1(t,x,y),h'(z)b_2(t,x,y),-h(z)\operatorname{div}_{x,y}b(t,x,y)\bigr).
$$

The last component cancels planar divergence and vanishes on $z=z_0$. Thus the plane carries the desired motion, but the formula promises no particular affine action away from it. The paper's Theorem 10.2 collects twelve constructions with different histories, loaders and observers. Their agreement as symbolic computations does not identify their surrounding fluid paths. [5]

The whole-box route in Theorems 3.4 and 4.1 of *Incompressible Box Transport* uses three stacks for left tape, right tape and history. Every local rule preserves the sum of the three replaced prefix lengths. Its three radix scale factors therefore multiply to one. The processor borrows a fresh blank from the work tape's filler, transfers it to the history stack and replaces it with an instruction record. This balances the added history with movement of blank symbols and work data. Full-domain inverses again separate the target boxes. [9]

To move the boxes, the proof first separates their centers and changes their dimensions with determinant-one scalings. It then sends all sources to remote storage, delivers them to separated target centers, and brings those centers to their final positions. Emptying the source locations before delivery permits source-target overlap. Rational detours and positive clearances keep each moving box away from stationary boxes. A cutoff curl realizes each local affine velocity exactly on a neighborhood of the entire box. Because a curl has zero divergence, the cutoff corrections outside that neighborhood preserve incompressibility. [9]

This yields a Euclidean construction with fixed particle $(4,0,0)$ and observer $(-1,2)^3$. Every branch with a nonhalting target stays in $x_1>2$ for the full transition, while halted codes enter $(0,1)^3$. Velocity and general residual force share a compact spatial support, have bounded mixed derivatives, and repeat after loading. The theorem's support and derivative constants need not be uniform over every machine and input. [9]

General residual forces need not be solenoidal. Proposition 2.4 of *Prefix Instructions* gives a torus alternative: solve $\Delta\phi=\nabla\cdot f$ with mean-zero $\phi$ and replace $f$ by $f-\nabla\phi$. The velocity stays the same, while the pressure becomes $-\phi$. This projection does not establish compact spatial support for a force on Euclidean space. [5]

### Slow time while keeping every finite stage reachable

The second paper takes a different approach to history. It stores successive instruction records in a third coordinate and reads the newest record through a periodically repeated selector. The selector frequency grows like $\Lambda^n$ at step $n$, where $\Lambda$ exceeds the number of possible records. Every fixed spatial derivative therefore has an exponentially growing cost. Each step uses two intervals of length $S_n=2^{n^2}$, one to write the record and one to move according to it. Stretching both intervals makes the speed and time derivatives small enough to dominate the spatial derivative cost. Theorem 1 obtains bounded, time-square-integrable supremum norms for every mixed derivative of velocity and force. Later steps take longer, but each still takes finite time. [2]

A change of clock provides another route. Lemma 3.1 of *Scalar Potentials* sets $u(t,x)=s'(t)W(s(t),x)$ for an increasing clock $s$ that covers all nonnegative internal times. Particle paths are the original paths evaluated at $s(t)$. The logarithmic choice

$$
s(t)=\log(1+t),\qquad u(t,x)=\frac{W(\log(1+t),x)}{1+t}
$$

preserves every finite computation stage while slowing it down. Theorem 1.1 builds the compact Euclidean template using three scalar potentials, whose curls give divergence-free transport. Its velocity and force, after $k$ time derivatives and any fixed number of spatial derivatives, decay at least as $C(1+t)^{-1-k}$. Compact support makes these derivatives square integrable in space and time. Proposition 5.1 gives distinct root-clock choices. [8]

An onto clock is essential. If $s(t)$ approached a finite limit, a machine halting later than that internal time would never trigger. Nor can slowing a fixed recurring processor alone give an arbitrarily rapidly decaying nonnegative speed: such a speed is integrable and accumulates only finite internal time. [6][8]

### Put the instruction clock into space

A force can become stationary while a particle continues to pass through different instructions. Theorem 4.1 of the stationary-forcing paper first constructs a periodic planar processor by Hamiltonian motions, which preserve area. Ordered extraction, separate parking positions and ordered insertion keep the full rectangles apart. Nonhalting paths remain outside the observed strip at every phase. [3]

Section 5 uses the third spatial coordinate as that phase. It constructs an autonomous field, meaning a field independent of time,

$$
W(X,Y,Z)=\bigl(V_1(Z,X,Y),V_2(Z,X,Y),g(X,Y)\bigr).
$$

The clock speed $g$ equals one on the whole tracked corridor. Away from it, compensating values make its spatial mean zero. Along the selected path, $Z$ therefore advances through the planar program's phase, and the mean-zero requirement holds on the torus as a whole. [3]

A smooth amplitude $\alpha(t)$ starts at zero and equals one after time one. Set $U=\alpha W$ and

$$
f=\alpha'W+\alpha^2(W\cdot\nabla)W-\nu\alpha\Delta W.
$$

After startup, both $U$ and $f$ are stationary. Their particle trajectories continue indefinitely. Theorem 1.1 uses the fixed label $(1/4,1/4,0)$ and the strip $1/32<Y<1/8$. The input changes the compiled geometry, while those observation data stay fixed. A solenoidal projection is available as a separate force choice with changed pressure. [3]

The simpler suspension in Proposition 7.3 of *Scalar Potentials* instead gives the clock coordinate unit speed everywhere. Its startup force has nonzero spatial mean. *Prefix Instructions*, Theorem 14.1, gives another autonomous processor with a decaying amplitude; its detector also checks a quiet clock phase, when horizontal transport has finished. These distinctions prevent the stationary, mean-zero and decaying claims from being inadvertently merged. [5][8]

### Shrink memory to make the force decay rapidly

The rapidly vanishing-force paper avoids the finite-clock obstruction by changing the spatial representation itself. Each new computation step moves over a much smaller distance. Theorem 3.1 gives an addressed-memory construction on $\mathbb R^3$, Theorem 4.1 alternates between two memory coordinates, and Theorem 5.1 gives a spatially periodic lattice construction on $\mathbb T^3$. Spatial periodicity here does not mean that the force repeats in time. [6]

In the addressed construction, a finite configuration is represented by an integer $k_n<M_n$. At stage $n$, the field includes a gate for every possible address and applies the machine's one-step transition there. It does not obtain the actual address by running the selected computation in advance. The accumulated history has the form

$$
y_n=\sum_{j\le n}\delta_j k_j.
$$

Divisibility between the scales $\delta_j$ makes the older records multiples of $M_n$ after division by $\delta_n$. Thus the remainder $k_n=(y_n/\delta_n)\bmod M_n$ reads the newest record while retaining the older records in the same coordinate. The construction installs finitely many localized curl fields at the possible grid addresses. The next displacement is at most $b_n=\delta_{n+1}M_{n+1}$, and the scales are chosen so that $b_n\le\delta_n^{n+10}$. A spatial derivative of a localized gate costs a power of $\delta_n^{-1}$, but the much smaller displacement eventually dominates every fixed derivative cost. Disjoint supports avoid multiplying the bound by the number of addresses. The residual force needs two extra spatial derivatives; the same scale choice accommodates them. [6]

Each stage occupies a unit time interval after loading. For every time order $j$, spatial derivative index $\beta$ and power $N$, the theorem obtains bounds of the form

$$
\sup_x\left|\partial_t^j\partial_x^\beta f(t,x)\right|
\le C_{j,\beta,N}(1+t)^{-N},
$$

and analogous bounds for velocity. Compact support also gives rapid spatial decay in the Euclidean constructions. The alternating-memory version writes the next record using one coordinate while the other holds the address being read. The lattice version compensates planar area change by normal motion. [6]

Halting changes which side of an exact boundary the particle occupies. The crossing can be arbitrarily small for a late halt. Finite total travel distance is consistent with unlimited symbolic memory because that memory uses ever finer position differences. The theorem supplies no fixed measurement tolerance that distinguishes all halting events. [6]

### Read the answer from velocity despite diffusion

Following a labelled particle and measuring the velocity field are different experiments. Theorem 1.1 of *Velocity-Field Detection* addresses the second. Let $a(t,x,y)$ be a planar divergence-free velocity and let a nonnegative scalar $w$ solve

$$
\partial_tw+a\cdot\nabla w=\nu\Delta w+h,\qquad w(0)=0.
$$

Then $U=(a_1,a_2,w)$, independent of the third coordinate, is a three-dimensional incompressible velocity. Its force has the horizontal residual of $a$ and prescribed vertical component $h$. The force does not need the unknown scalar solution as input. Diffusion now acts directly on the quantity being observed, so a material-trajectory argument alone is insufficient. [7]

On the torus, Theorem 3.1 repeatedly injects a small bump of height one, runs longer prefixes of the planar processor in increasingly short stirring bursts, and waits for heat diffusion to spread older contributions. A halting prefix carries a fresh bump into the strip. Bounds on the forward and inverse processor maps control its Laplacian, and a maximum-principle estimate keeps the diffusion error below $1/16$ during the burst. Heat-kernel bounds from Lemma 3.3 keep old mass small everywhere after a wait. [7]

The resulting velocity exceeds $15/16$ at a halting observation, whereas the nonhalting bound stays below $1/2$ at every time. The fixed event is whether $u_3>1/2$ anywhere in $1/32<y<1/8$. This uses a fixed region, not a fixed observation point. The bursts can become stronger indefinitely; derivative bounds are asserted on each finite time interval, not uniformly over all time. [7]

On $\mathbb R^2\times\mathbb T$, Section 5 instead injects total mass one and transports it through an expanding array of address locations. Increasing distances, wider gates and longer gate times allow all force derivatives to stay globally bounded. A moving cutoff follows the selected packet in the proof. Its transport derivative cancels on an exact translation region, and its diffusion loss is at most a constant times $\nu/R_n^2$ per unit time, where $R_n$ is the growing gate radius. The paper makes the sum of these losses less than $1/24$. [7]

A halted packet carries more than $3/4$ of the mass into the upper half-plane, while a nonhalting packet leaves less than $1/4$ there. Thus the fixed integral threshold $1/2$ separates the outcomes. Force support is compact horizontally on each finite time interval, but expands over the full run. Diffusing velocity has tails outside that support. Compact forcing must not be confused with compact support of the entire solution. [7]

An expert examining these arguments would need to check the full-domain inverses, separation of whole instruction regions, cutoff clearances and all-time observation bounds. The clock constructions additionally depend on unbounded accumulated internal time; the rapid-decay construction depends on the derivative estimates at shrinking scales; the velocity detectors depend on quantitative diffusion control. These are the steps that connect a finite symbolic program to the exact fluid event. [1][3][6][7][9]

## Consequences inside mathematics

If the main theorem holds, an algorithm deciding the fixed particle event for every force produced by the compiler would decide the halting problem. Corollary 4.2 of the shear-flow paper draws this contradiction. The same reduction applies separately to the precisely stated stationary, rapidly decaying and velocity-detection constructions. It establishes undecidability of an exact, unlimited-time question in those classes. It does not say that every individual trajectory or every finite-time prediction is inaccessible. [1][3][6][7]

Smoothness, bounded energy and a finite force description do not by themselves guarantee an algorithm for every long-term property. Conversely, undecidable reachability does not imply a singularity. These examples are constructed to stay smooth. The official Clay problem asks for global regularity for arbitrary allowed initial data, or an allowed breakdown example. Some breakdown alternatives permit rapidly decaying forces, so the mere presence of forcing is not the distinction. Family 376 supplies particular global smooth solutions, neither general regularity nor breakdown. [1][6][17]

The geometric lemmas also stand on their own. They extend finite, separately disjoint collections of prescribed sheet or box maps to smooth incompressible motions with effective neighborhoods and bounds. Their applicability depends on the exact object being moved: a sheet can change area through normal compensation, while a full solid box must retain volume. [4][5][9]

## Uses outside mathematics

No known direct application of these claimed results is documented. They give exact mathematical models of computation in controlled fluid equations, rather than a tested fluid computer or an improved numerical solver. The finite force program describes all local instructions, but implementing its arbitrarily fine spatial information and observing an arbitrarily small late signal are separate physical problems. [1][6][7][8]

A positive detector event would announce a halt. If the detector never fires, continued waiting does not generally provide a finite certificate of nonhalting. Every simulated finite stage occurs at finite physical time, but the constructions do not finish infinitely many computational steps in finite time. Their exact undecidability result therefore does not furnish a laboratory procedure that solves the halting problem. [1][3][6][8][10]

## Has anyone checked it?

As of 7 November 2026, we found no public specialist statement accepting these proofs, no journal acceptance, and no identified mathematical error in this family. Public discussion does exist. In a signed 7 October comment, Warren D. Smith names the stationary-forcing manuscript, argues that his earlier hydrodynamics work was overlooked, and questions whether the claimed improvements in rigor and setup were achieved. He identifies no faulty lemma or computation and does not report undertaking a proof check. His priority comparison is his claim; we have not established equivalence between the hypotheses of the two constructions. [18]

Ying Xie's 12 October survey discusses this family in Section 9.4.8, including residual forcing, reversible memory and precision limits. The survey explicitly describes AI-assisted extraction and review, and limits its own checks rather than certifying every proof or replaying the formalizations. Under Uruk's current convention, novelty discussion and this qualified analysis do not establish specialist proof engagement sufficient to change the "unreviewed" label. They must still be reported rather than described as an absence of public attention. [19]

**Machine checking.** The pinned release has six formal proof targets, called comparator challenges, for family 376. They represent five distinct statement groups: solenoidal coding-sheet realization, full-box routing, the alternating-memory rapid-decay theorem, the two velocity detectors, and the balanced three-stack particle theorem. Two challenge names target that same last theorem. Some statements include complete halting equivalences; the set does not cover every claim in all nine manuscripts. Carlos Toledo's pinned ledger reports acceptance by the Lean and nanoda proof checkers for all six on 10 October at release commit `fd4aeeb2ee4fc729c18d98444fed42fd0529eeeb`. That is a reported external replay at an earlier commit, not a run performed by Uruk or a human proof verdict. We read the current comparator statements and scope material but did not rerun Lean. [20][21]

This article uses OpenAI's approved source commit `4eaee87548250b2682affda7d05d947c05554bae`. The catalogue selects the 6 October box-transport manuscript, although the Lean scope note retains an older September path. Family 376 is also omitted from `formalization.yaml` despite its linked comparator files. Those documentation discrepancies warrant checking the actual targets; neither proves a mathematical error or authorizes calling the whole family formally verified. [9][20]

## Sources

1. OpenAI, *Finite Instructions and Solenoidal Shear Flows*, 27 September 2026. Theorem 1.1, reversible compiler, rectangle realization, detector and undecidability corollary. [Pinned manuscript](https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Finite-Instructions-and-Solenoidal-Shear-Flows-September-27-2026/manuscript.pdf).
2. OpenAI, *A Fixed Particle Test for Computation in a Forced Viscous Flow*, 27 September 2026. Theorem 1, third-coordinate history, stretched stages and time-square-integrable derivative bounds. [Pinned manuscript](https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/A-Fixed-Particle-Test-for-Computation-in-a-Forced-Viscous-Flow-September-27-2026/manuscript.pdf).
3. OpenAI, *Universal Computation with Eventually Stationary Navier-Stokes Forcing*, 27 September 2026. Theorems 1.1 and 4.1, mean-zero spatial clock, stationary forcing and separate slower clocks. [Pinned manuscript](https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Universal-Computation-with-Eventually-Stationary-Navier-Stokes-Forcing-September-27-2026/manuscript.pdf).
4. OpenAI, *Geometric Programs for Solenoidal Forcing*, 27 September 2026. Periodic initialization, shear realization, sheets, box alternatives and finite interpreter. [Pinned manuscript](https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Geometric-Programs-for-Solenoidal-Forcing-September-27-2026/manuscript.pdf).
5. OpenAI, *Prefix Instructions and Incompressible Flows*, 27 September 2026. Prefix histories, sheet and thick-box geometry, force projection, the twelve-variant table and spatial clock. [Pinned manuscript](https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Prefix-Instructions-and-Incompressible-Flows-September-27-2026/manuscript.pdf).
6. OpenAI, *Computation under Rapidly Vanishing Navier-Stokes Forcing*, 27 September 2026. Addressed, alternating and lattice memories, derivative estimates and exact observers. [Pinned manuscript](https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Computation-under-Rapidly-Vanishing-Navier-Stokes-Forcing-September-27-2026/manuscript.pdf).
7. OpenAI, *Velocity-Field Detection of Computation in Forced Navier-Stokes Flows*, 27 September 2026. Theorem 1.1, torus injection and heat estimates, expanding-array mass detector and scalar existence. [Pinned manuscript](https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Velocity-Field-Detection-of-Computation-in-Forced-Navier-Stokes-Flows-September-27-2026/manuscript.pdf).
8. OpenAI, *Scalar Potentials and Slow Clocks for Forced Fluid Computation*, 27 September 2026. Compact scalar-potential construction, onto clocks, prefix lift and separate periodic or stationary suspensions. [Pinned manuscript](https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Scalar-Potentials-and-Slow-Clocks-for-Forced-Fluid-Computation-September-27-2026/manuscript.pdf).
9. OpenAI, *Incompressible Box Transport and Finite Computation*, 6 October 2026. Theorems 3.4 and 4.1, full-box geometry, balanced histories, comparison classes and separate later realizations. [Pinned manuscript](https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/preprints/Incompressible-Box-Transport-and-Finite-Computation-October-6-2026/manuscript.pdf).
10. Alan M. Turing, *On computable numbers, with an application to the Entscheidungsproblem*, Proceedings of the London Mathematical Society 42, 1936-1937, 230-265. Section 8 establishes undecidable machine questions; modern halting is an equivalent formulation. [DOI](https://doi.org/10.1112/plms/s2-42.1.230), [paper](https://theory.stanford.edu/~trevisan/cs172-07/turing36.pdf).
11. Cristopher Moore, *Unpredictability and undecidability in dynamical systems*, Physical Review Letters 64, 1990, 2354-2357; and *Generalized shifts: unpredictability and undecidability in dynamical systems*, Nonlinearity 4, 1991, 199-230. Computation in continuous dynamics and positional symbolic encodings. [1990 DOI](https://doi.org/10.1103/PhysRevLett.64.2354), [1991 author PDF](https://sites.santafe.edu/~moore/nonlinearity-gs.pdf).
12. Charles H. Bennett, *Logical reversibility of computation*, IBM Journal of Research and Development 17, 1973, 525-532. Retained history and reversible simulation. [DOI](https://doi.org/10.1147/rd.176.0525).
13. Terence Tao, *Finite time blowup for an averaged three-dimensional Navier-Stokes equation*, preprint 2014, Journal of the American Mathematical Society 29, 2016, 601-674. The averaged-equation theorem and the distinct fluid-computer programme. [Preprint](https://arxiv.org/abs/1402.0290), [author's 4 February 2014 explanation](https://terrytao.wordpress.com/2014/02/04/finite-time-blowup-for-an-averaged-three-dimensional-navier-stokes-equation/).
14. Robert Cardona, Eva Miranda, Daniel Peralta-Salas and Francisco Presas, *Constructing Turing complete Euler flows in dimension 3*, PNAS 118, 2021, e2026818118. Theorem 7.1 and the viscous internal-time limitation in Section 7.2. [DOI](https://doi.org/10.1073/pnas.2026818118), [full text](https://arxiv.org/html/2012.12828).
15. Robert Cardona, Eva Miranda and Daniel Peralta-Salas, *Computability and Beltrami fields in Euclidean space*, Journal de Mathématiques Pures et Appliquées 169, 2023, 50-81. Euclidean infinite-energy universality, tape-bounded flat-torus computation and Remark 29 on viscosity. [DOI](https://doi.org/10.1016/j.matpur.2022.11.007), [full text](https://arxiv.org/html/2111.03559v3).
16. Søren Dyhr, Ángel González-Prieto, Eva Miranda and Daniel Peralta-Salas, *Turing complete Navier-Stokes steady states via cosymplectic geometry*, PNAS Nexus 5, 2026, pgag131; preprint posted July 2025. Theorem A, metric deformation and the Hodge viscosity operator. [DOI](https://doi.org/10.1093/pnasnexus/pgag131), [published text](https://pmc.ncbi.nlm.nih.gov/articles/PMC13148646/).
17. Charles L. Fefferman, *Existence and smoothness of the Navier-Stokes equation*, official Clay Millennium problem statement. Alternatives A-D, including permitted forcing in breakdown examples. [Official PDF](https://www.claymath.org/wp-content/uploads/2022/06/navierstokes.pdf).
18. Warren D. Smith, signed comment dated 7 October 2026 on OpenAI's manuscript announcement. Names the stationary-forcing paper, claims omitted prior work and questions scope and rigor without identifying a proof error. [Primary comment](https://community.openai.com/t/first-look-at-mathematics-manuscripts-from-an-internal-frontier-model-at-openai/1403886/6), [earlier manuscript record linked by Smith](https://vixra.org/abs/2503.0157).
19. Ying Xie, *What the Machine Invented: Mining New Mathematical Instruments from OpenAI's October 2026 Release of AI-Generated Mathematics*, arXiv:2610.17090v1, 12 October 2026. Section 9.4.8 discusses family 376; Section 11 and the acknowledgments state the review and AI-assistance limits. [Version 1](https://arxiv.org/html/2610.17090v1).
20. OpenAI, family 376 formalization scope and actual comparator targets at the approved pin. Six challenges, five distinct statement groups; scope is not all nine manuscripts. [Scope note](https://github.com/openai/math/blob/4eaee87548250b2682affda7d05d947c05554bae/lean/docs/376.md), [comparator directory](https://github.com/openai/math/tree/4eaee87548250b2682affda7d05d947c05554bae/lean/ComparatorChallenges).
21. Carlos Toledo, cert-machine kernel ledger at commit `9814e4c06281e34a113ce853d7d99ccce160b750`. Reports 10 October 2026 Lean and nanoda acceptance for the six challenges at OpenAI commit `fd4aeeb2ee4fc729c18d98444fed42fd0529eeeb`. [Pinned ledger](https://github.com/carlostoledo1891/cert-machine/blob/9814e4c06281e34a113ce853d7d99ccce160b750/certs/openai-math-kernel.json), [report](https://carlostoledo.co/reports/openai-math.html).
