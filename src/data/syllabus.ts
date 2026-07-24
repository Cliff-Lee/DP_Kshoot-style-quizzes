import type { SyllabusPoint } from '../types'
import { COURSE_IDS, courseIdsInScope, getCourse } from './courses'
import { aiSyllabusPoints } from './aiSyllabus'

const topics: Record<number, string> = {
  1: 'Number and algebra', 2: 'Functions', 3: 'Geometry and trigonometry',
  4: 'Statistics and probability', 5: 'Calculus',
}

const rows: Array<[string, string, string]> = [
  ['SL 1.1','Scientific notation','Operations with numbers in the form a × 10^k, where 1 ≤ a < 10 and k is an integer.'],
  ['SL 1.2','Arithmetic sequences and series','nth term and finite sums, sigma notation, applications, interpretation and prediction.'],
  ['SL 1.3','Geometric sequences and series','nth term and finite sums, sigma notation and applications.'],
  ['SL 1.4','Financial applications','Compound interest and annual depreciation using geometric sequences and series.'],
  ['SL 1.5','Integer exponents and logarithms','Laws of exponents; base-10 and natural logarithms; numerical evaluation using technology.'],
  ['SL 1.6','Simple deductive proof','Numerical and algebraic proof, LHS-to-RHS layout, equality and identity.'],
  ['SL 1.7','Rational exponents and logarithm laws','Exponent and logarithm laws, change of base and solving exponential equations.'],
  ['SL 1.8','Infinite geometric sequences','Sum of infinite convergent geometric sequences.'],
  ['SL 1.9','Binomial theorem','Expansion for natural-number indices using Pascal’s triangle and combinations.'],
  ['AHL 1.10','Counting and extended binomial theorem','Permutations, combinations, and binomial expansion with fractional and negative indices.'],
  ['AHL 1.11','Partial fractions','Decomposition into partial fractions.'],
  ['AHL 1.12','Complex numbers in Cartesian form','i, Cartesian form, real and imaginary parts, conjugate, modulus, argument and the complex plane.'],
  ['AHL 1.13','Polar and Euler forms','Modulus-argument and Euler forms; sums, products and quotients with geometric interpretation.'],
  ['AHL 1.14','Complex roots and De Moivre’s theorem','Conjugate roots, De Moivre’s theorem, powers and roots of complex numbers.'],
  ['AHL 1.15','Extended proof','Mathematical induction, contradiction and counterexample.'],
  ['AHL 1.16','Systems of linear equations','Up to three equations in three unknowns, including unique, infinite and no-solution cases.'],
  ['SL 2.1','Straight lines','Forms of a straight-line equation, gradients, intercepts, parallel and perpendicular lines.'],
  ['SL 2.2','Functions and inverses','Domain, range, graph, function notation, mathematical models and inverse functions.'],
  ['SL 2.3','Graphs of functions','Sketching from information or context and graphing sums and differences with technology.'],
  ['SL 2.4','Key features and intersections','Determine graph features and find intersections using technology.'],
  ['SL 2.5','Composite and inverse functions','Composite functions, identity function and finding an inverse.'],
  ['SL 2.6','Quadratic functions','Forms and graph features of quadratic functions, including intercepts, axis and vertex.'],
  ['SL 2.7','Quadratic equations and inequalities','Solutions, quadratic formula, discriminant and nature of roots.'],
  ['SL 2.8','Reciprocal and rational functions','Graphs and asymptotes of reciprocal and linear-over-linear rational functions.'],
  ['SL 2.9','Exponential and logarithmic functions','Graphs of exponential, natural exponential, logarithmic and natural logarithmic functions.'],
  ['SL 2.10','Solving equations','Graphical, analytical and technological methods in mathematical and real-life contexts.'],
  ['SL 2.11','Transformations of graphs','Translations, reflections, stretches and composite transformations.'],
  ['AHL 2.12','Polynomials','Polynomial functions, zeros, roots, factors, factor and remainder theorems, sums and products of roots.'],
  ['AHL 2.13','Advanced rational functions','Graphs and properties of linear-over-quadratic and quadratic-over-linear rational functions.'],
  ['AHL 2.14','Odd, even and inverse functions','Odd/even functions, domain restriction, inverses and self-inverse functions.'],
  ['AHL 2.15','Graphical and analytical inequalities','Solutions of g(x) ≥ f(x), graphically and analytically.'],
  ['AHL 2.16','Modulus and transformed functions','Graphs involving modulus, reciprocal and squared functions; modulus equations and inequalities.'],
  ['SL 3.1','Three-dimensional geometry','Distance and midpoint in 3D, solids, and angles between lines and planes.'],
  ['SL 3.2','Right and non-right triangle trigonometry','Sine, cosine and tangent ratios; sine rule, cosine rule and triangle area.'],
  ['SL 3.3','Applications of trigonometry','Pythagoras, elevation and depression, and diagrams from written statements.'],
  ['SL 3.4','Radians and circles','Radian measure, arc length and sector area.'],
  ['SL 3.5','Unit circle and exact values','Definitions from the unit circle, exact values and ambiguous sine-rule cases.'],
  ['SL 3.6','Trigonometric identities','Pythagorean identity, double-angle identities and relationships between ratios.'],
  ['SL 3.7','Circular functions and graphs','Graphs, amplitude, periodicity, transformations and real-life contexts.'],
  ['SL 3.8','Trigonometric equations','Graphical and analytical solutions in finite intervals, including quadratic forms.'],
  ['AHL 3.9','Reciprocal and inverse trigonometry','Reciprocal ratios, Pythagorean identities, inverse functions, domains, ranges and graphs.'],
  ['AHL 3.10','Compound-angle identities','Compound-angle identities and the double-angle identity for tangent.'],
  ['AHL 3.11','Trigonometric symmetry','Relationships between trigonometric functions and symmetry properties of their graphs.'],
  ['AHL 3.12','Vectors and vector operations','Position and displacement vectors, components, basis vectors and algebraic/geometric operations.'],
  ['AHL 3.13','Scalar product','Scalar product, angle between vectors, perpendicular and parallel vectors.'],
  ['AHL 3.14','Vector equations of lines','Lines in two and three dimensions, angle between lines and kinematic applications.'],
  ['AHL 3.15','Relationships between lines','Coincident, parallel, intersecting and skew lines; points of intersection.'],
  ['AHL 3.16','Vector product','Definition, properties and geometric interpretation of the vector product.'],
  ['AHL 3.17','Vector equations of planes','Parametric, normal and Cartesian forms of planes.'],
  ['AHL 3.18','Intersections and angles in 3D','Line-plane and plane-plane intersections; angles between lines and planes.'],
  ['SL 4.1','Data and sampling','Populations, samples, data types, reliability, bias, outliers and sampling techniques.'],
  ['SL 4.2','Presenting data','Frequency tables, histograms, cumulative frequency, percentiles, IQR and box plots.'],
  ['SL 4.3','Summary statistics','Central tendency, grouped estimates, dispersion, variance and standard deviation.'],
  ['SL 4.4','Correlation and regression','Pearson correlation, scatter diagrams, best-fit and y-on-x regression for prediction.'],
  ['SL 4.5','Probability concepts','Trials, outcomes, sample spaces, events, complements and expected occurrences.'],
  ['SL 4.6','Probability diagrams and rules','Venn, tree and sample-space diagrams; combined, conditional and independent events.'],
  ['SL 4.7','Discrete random variables','Probability distributions, expected value and applications.'],
  ['SL 4.8','Binomial distribution','Binomial probabilities, mean and variance.'],
  ['SL 4.9','Normal distribution','Properties, diagrams, probability and inverse-normal calculations.'],
  ['SL 4.10','Regression of x on y','Equation and use of the x-on-y regression line for prediction.'],
  ['SL 4.11','Conditional probability','Formal definitions of conditional probability and independence.'],
  ['SL 4.12','Standardization','z-values and inverse-normal calculations with unknown mean or standard deviation.'],
  ['AHL 4.13','Bayes’ theorem','Use of Bayes’ theorem for a maximum of three events.'],
  ['AHL 4.14','Random variables and density functions','Variance; continuous density functions; mode, median, mean and transformations.'],
  ['SL 5.1','Limits and the derivative','Introduction to limits; derivative as gradient function and rate of change.'],
  ['SL 5.2','Increasing and decreasing functions','Graphical interpretation of positive, zero and negative derivatives.'],
  ['SL 5.3','Differentiating integer powers','Power rule for integer exponents and sums of polynomial terms.'],
  ['SL 5.4','Tangents and normals','Equations of tangents and normals at a point.'],
  ['SL 5.5','Introduction to integration','Antidifferentiation, constants, definite integrals with technology and positive area.'],
  ['SL 5.6','Differentiation rules','Derivatives of standard functions; chain, product and quotient rules.'],
  ['SL 5.7','Second derivative and graph behaviour','Relationship between graphs of a function and its first and second derivatives.'],
  ['SL 5.8','Optimization and inflexion','Local extrema, tests, optimization and points of inflexion.'],
  ['SL 5.9','Kinematics','Displacement, velocity, acceleration and total distance travelled.'],
  ['SL 5.10','Indefinite integration','Standard integrals, linear composites, inspection and substitution.'],
  ['SL 5.11','Definite integration and areas','Analytical definite integrals, signed area and areas between curves.'],
  ['AHL 5.12','Continuity and first principles','Continuity, differentiability, convergence, first-principles derivatives and higher derivatives.'],
  ['AHL 5.13','Limits and l’Hôpital’s rule','Evaluation of limits using l’Hôpital’s rule or Maclaurin series.'],
  ['AHL 5.14','Implicit differentiation and related rates','Implicit differentiation, related rates and optimization.'],
  ['AHL 5.15','Advanced derivatives and integrals','Inverse trig, reciprocal trig, exponential and logarithmic derivatives and integrals; partial fractions.'],
  ['AHL 5.16','Integration techniques','Substitution, integration by parts and repeated integration by parts.'],
  ['AHL 5.17','Areas and volumes','Area against the y-axis and volumes of revolution about coordinate axes.'],
  ['AHL 5.18','Differential equations','Euler’s method, separable and homogeneous equations, and integrating factors.'],
  ['AHL 5.19','Maclaurin series','Standard expansions and derivation by substitution, products, integration, differentiation and differential equations.'],
]

export const aaSyllabusPoints: SyllabusPoint[] = rows.map(([code, title, description], index) => {
  const topicNumber = Number(code.match(/[1-5]/)?.[0] ?? 1)
  const level=code.startsWith('AHL')?'AHL':'SL'
  return {
    id: `30000000-0000-0000-0000-${String(index + 1).padStart(12, '0')}`,
    courseId:level==='AHL'?COURSE_IDS.aaHl:COURSE_IDS.aaSl,
    courseFamily:'analysis_approaches',
    code, topicNumber, topicName: topics[topicNumber], level,
    title, description, sortOrder: index + 1,
  }
})

export const syllabusPoints:SyllabusPoint[]=[...aaSyllabusPoints,...aiSyllabusPoints]
export const topicColors: Record<number, string> = { 1: '#2F6FED', 2: '#1F9D72', 3: '#ED812F', 4: '#E64D6F', 5: '#5A55D6' }
export const syllabusById = new Map(syllabusPoints.map(point=>[point.id,point]))
export const syllabusByKey = new Map(syllabusPoints.map(point=>[`${point.courseFamily}|${point.code.toUpperCase()}`,point]))
export const syllabusByCode = new Map(aaSyllabusPoints.map(point => [point.code.toUpperCase(), point]))

export function findSyllabusPoint(courseFamily:SyllabusPoint['courseFamily'],code:string){
  return syllabusByKey.get(`${courseFamily}|${code.toUpperCase()}`)
}

export function syllabusForCourse(courseId:string){
  const course=getCourse(courseId)
  const ids=new Set(courseIdsInScope(courseId))
  return syllabusPoints.filter(point=>point.courseFamily===course.courseFamily&&ids.has(point.courseId))
}

export function pointIsInCourse(point:SyllabusPoint,courseId:string){
  return syllabusForCourse(courseId).some(candidate=>candidate.id===point.id)
}
