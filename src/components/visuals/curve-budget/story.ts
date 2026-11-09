import { createTimeline } from '../../plate/timeline';

export const CUES = [
  {"at": 0, "title": "Curves through pins", "text": "Mark points in the plane and look for a curve through all of them. Five points lie on a conic, and nine points lie on a cubic.", "sources": [1]},
  {"at": 7500, "title": "Coefficients to spend", "text": "A curve of degree $d$ has about $d^2/2$ free coefficients, and making it pass through a point uses some of them up.", "sources": [1]},
  {"at": 14500, "title": "Passing twice", "text": "Ask it to pass through a point $m$ times over, as a node passes twice, and that point costs about $m^2/2$ coefficients.", "sources": [1]},
  {"at": 21500, "title": "The counting threshold", "text": "Counting suggests the threshold $d\\approx m\\sqrt r$. Nagata asks whether every curve through $r$ very general points must stay strictly above it.", "sources": [1]},
  {"at": 28500, "title": "Nagata’s question", "text": "Nagata conjectured in 1959 that for ten or more very general points, every curve passing $m$ times through each has $d>m\\sqrt r$.", "sources": [1, 5]},
  {"at": 36000, "title": "Why ten is sharp", "text": "Ten is sharp. Nine points lie on a cubic, with $d=3=1\\sqrt9$, so for nine points the strict inequality fails.", "sources": [1, 3]},
  {"at": 43000, "title": "A finite computation", "text": "For ten points, solving the conditions for small $m$ finds every curve above the line. The theorem is about every $m$ at once, which is the hard part.", "sources": [1]},
  {"at": 52000, "title": "Squares and irrational slopes", "text": "Nagata proved it for perfect squares from 16, where $\\sqrt r$ is a whole number. For every other $r$, ten included, it stayed open for sixty-seven years.", "sources": [1, 5]},
  {"at": 61000, "title": "The remaining gap", "text": "Methods came close and always lost a little: for ten points the best bound was $d/m\\ge117/37\\approx3.162$, against $\\sqrt{10}\\approx3.1623$.", "sources": [1]},
  {"at": 68000, "title": "The plane-curve result", "text": "On 23 September 2026 OpenAI posted a proof for every $r\\ge10$, with unequal multiplicities allowed.", "sources": [1]},
  {"at": 74000, "title": "Points on a pinched cubic", "text": "The proof supposes a curve below the line and moves the points onto a cubic, which is then pinched until it develops a node.", "sources": [1, 6]},
  {"at": 81500, "title": "Rows of exponent pairs", "text": "In that limit, theta functions turn the question into interpolation on a triangle of lattice points, done one row at a time.", "sources": [1, 6]},
  {"at": 89000, "title": "The contradiction", "text": "The gap below $\\sqrt r$ leaves room to shrink the triangle, every row then interpolates in full, and the supposed curve cannot exist.", "sources": [1]},
  {"at": 97000, "title": "Tevelev’s proof notes", "text": "Jenia Tevelev, an algebraic geometer, reworked the proof in lecture notes, calls it remarkably simple, and presents it as a proof.", "sources": [6]},
  {"at": 105500, "title": "Approval and its scope", "text": "Approved, for the plane curves: the three companion papers, on other surfaces and higher dimensions, are unreviewed.", "sources": [1, 6]},
] as const;

export const FILM_DURATION = 120000;

export const TIMELINE = createTimeline(CUES, FILM_DURATION, 250);
