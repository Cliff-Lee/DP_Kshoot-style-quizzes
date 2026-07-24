-- Seeded from Mathematics: analysis and approaches guide, first assessment 2021,
-- syllabus content pages 28-69. Titles are concise labels; descriptions summarize
-- the guide's Content column rather than its non-examinable Connections prompts.

insert into public.plans(id,slug,name,monthly_price,yearly_price,limits,features) values
  ('10000000-0000-0000-0000-000000000001','free','Free teacher',0,0,'{"classes":2,"students":60,"private_questions":100,"import_batch":5,"report_export":0,"prompt_generation":20}','{"live_quiz":true,"basic_reports":true,"advanced_reports":false,"school_bank":false}'),
  ('10000000-0000-0000-0000-000000000002','premium','Premium teacher',14,140,'{"classes":null,"students":null,"private_questions":null,"import_batch":null,"report_export":null,"prompt_generation":null}','{"live_quiz":true,"basic_reports":true,"advanced_reports":true,"exports":true,"recommendations":true}'),
  ('10000000-0000-0000-0000-000000000003','school','School',89,890,'{"classes":null,"students":null,"private_questions":null,"import_batch":null,"report_export":null,"prompt_generation":null}','{"advanced_reports":true,"exports":true,"school_bank":true,"school_admin":true,"central_billing":true}')
on conflict (slug) do update set name=excluded.name,monthly_price=excluded.monthly_price,yearly_price=excluded.yearly_price,limits=excluded.limits,features=excluded.features;

insert into public.courses(id,slug,name,exam_board,subject,level,active) values
  ('20000000-0000-0000-0000-000000000001','ib-mathematics-aa','IB Mathematics: Analysis and Approaches','International Baccalaureate','Mathematics','SL + HL',true)
on conflict (slug) do update set name=excluded.name,exam_board=excluded.exam_board,subject=excluded.subject,level=excluded.level,active=excluded.active;

with seed as (
  select * from jsonb_to_recordset($seed$
  [
    {"code":"SL 1.1","topic_number":1,"level":"SL","title":"Scientific notation","description":"Operations with numbers in the form a × 10^k, where 1 ≤ a < 10 and k is an integer."},
    {"code":"SL 1.2","topic_number":1,"level":"SL","title":"Arithmetic sequences and series","description":"nth term and finite sums, sigma notation, applications, interpretation and prediction."},
    {"code":"SL 1.3","topic_number":1,"level":"SL","title":"Geometric sequences and series","description":"nth term and finite sums, sigma notation and applications."},
    {"code":"SL 1.4","topic_number":1,"level":"SL","title":"Financial applications","description":"Compound interest and annual depreciation using geometric sequences and series."},
    {"code":"SL 1.5","topic_number":1,"level":"SL","title":"Integer exponents and logarithms","description":"Laws of exponents; base-10 and natural logarithms; numerical evaluation using technology."},
    {"code":"SL 1.6","topic_number":1,"level":"SL","title":"Simple deductive proof","description":"Numerical and algebraic proof, LHS-to-RHS layout, equality and identity."},
    {"code":"SL 1.7","topic_number":1,"level":"SL","title":"Rational exponents and logarithm laws","description":"Exponent and logarithm laws, change of base and solving exponential equations."},
    {"code":"SL 1.8","topic_number":1,"level":"SL","title":"Infinite geometric sequences","description":"Sum of infinite convergent geometric sequences."},
    {"code":"SL 1.9","topic_number":1,"level":"SL","title":"Binomial theorem","description":"Expansion for natural-number indices using Pascal's triangle and combinations."},
    {"code":"AHL 1.10","topic_number":1,"level":"AHL","title":"Counting and extended binomial theorem","description":"Permutations, combinations, and binomial expansion with fractional and negative indices."},
    {"code":"AHL 1.11","topic_number":1,"level":"AHL","title":"Partial fractions","description":"Decomposition into partial fractions."},
    {"code":"AHL 1.12","topic_number":1,"level":"AHL","title":"Complex numbers in Cartesian form","description":"i, Cartesian form, real and imaginary parts, conjugate, modulus, argument and the complex plane."},
    {"code":"AHL 1.13","topic_number":1,"level":"AHL","title":"Polar and Euler forms","description":"Modulus-argument and Euler forms; sums, products and quotients with geometric interpretation."},
    {"code":"AHL 1.14","topic_number":1,"level":"AHL","title":"Complex roots and De Moivre's theorem","description":"Conjugate roots, De Moivre's theorem, powers and roots of complex numbers."},
    {"code":"AHL 1.15","topic_number":1,"level":"AHL","title":"Extended proof","description":"Mathematical induction, contradiction and counterexample."},
    {"code":"AHL 1.16","topic_number":1,"level":"AHL","title":"Systems of linear equations","description":"Up to three equations in three unknowns, including unique, infinite and no-solution cases."},
    {"code":"SL 2.1","topic_number":2,"level":"SL","title":"Straight lines","description":"Forms of a straight-line equation, gradients, intercepts, parallel and perpendicular lines."},
    {"code":"SL 2.2","topic_number":2,"level":"SL","title":"Functions and inverses","description":"Domain, range, graph, function notation, mathematical models and inverse functions."},
    {"code":"SL 2.3","topic_number":2,"level":"SL","title":"Graphs of functions","description":"Sketching from information or context and graphing sums and differences with technology."},
    {"code":"SL 2.4","topic_number":2,"level":"SL","title":"Key features and intersections","description":"Determine graph features and find intersections using technology."},
    {"code":"SL 2.5","topic_number":2,"level":"SL","title":"Composite and inverse functions","description":"Composite functions, identity function and finding an inverse."},
    {"code":"SL 2.6","topic_number":2,"level":"SL","title":"Quadratic functions","description":"Forms and graph features of quadratic functions, including intercepts, axis and vertex."},
    {"code":"SL 2.7","topic_number":2,"level":"SL","title":"Quadratic equations and inequalities","description":"Solutions, quadratic formula, discriminant and nature of roots."},
    {"code":"SL 2.8","topic_number":2,"level":"SL","title":"Reciprocal and rational functions","description":"Graphs and asymptotes of reciprocal and linear-over-linear rational functions."},
    {"code":"SL 2.9","topic_number":2,"level":"SL","title":"Exponential and logarithmic functions","description":"Graphs of exponential, natural exponential, logarithmic and natural logarithmic functions."},
    {"code":"SL 2.10","topic_number":2,"level":"SL","title":"Solving equations","description":"Graphical, analytical and technological methods in mathematical and real-life contexts."},
    {"code":"SL 2.11","topic_number":2,"level":"SL","title":"Transformations of graphs","description":"Translations, reflections, stretches and composite transformations."},
    {"code":"AHL 2.12","topic_number":2,"level":"AHL","title":"Polynomials","description":"Polynomial functions, zeros, roots, factors, factor and remainder theorems, sums and products of roots."},
    {"code":"AHL 2.13","topic_number":2,"level":"AHL","title":"Advanced rational functions","description":"Graphs and properties of linear-over-quadratic and quadratic-over-linear rational functions."},
    {"code":"AHL 2.14","topic_number":2,"level":"AHL","title":"Odd, even and inverse functions","description":"Odd/even functions, domain restriction, inverses and self-inverse functions."},
    {"code":"AHL 2.15","topic_number":2,"level":"AHL","title":"Graphical and analytical inequalities","description":"Solutions of g(x) ≥ f(x), graphically and analytically."},
    {"code":"AHL 2.16","topic_number":2,"level":"AHL","title":"Modulus and transformed functions","description":"Graphs involving modulus, reciprocal and squared functions; modulus equations and inequalities."},
    {"code":"SL 3.1","topic_number":3,"level":"SL","title":"Three-dimensional geometry","description":"Distance and midpoint in 3D, solids, and angles between lines and planes."},
    {"code":"SL 3.2","topic_number":3,"level":"SL","title":"Right and non-right triangle trigonometry","description":"Sine, cosine and tangent ratios; sine rule, cosine rule and triangle area."},
    {"code":"SL 3.3","topic_number":3,"level":"SL","title":"Applications of trigonometry","description":"Pythagoras, elevation and depression, and diagrams from written statements."},
    {"code":"SL 3.4","topic_number":3,"level":"SL","title":"Radians and circles","description":"Radian measure, arc length and sector area."},
    {"code":"SL 3.5","topic_number":3,"level":"SL","title":"Unit circle and exact values","description":"Definitions from the unit circle, exact values and ambiguous sine-rule cases."},
    {"code":"SL 3.6","topic_number":3,"level":"SL","title":"Trigonometric identities","description":"Pythagorean identity, double-angle identities and relationships between ratios."},
    {"code":"SL 3.7","topic_number":3,"level":"SL","title":"Circular functions and graphs","description":"Graphs, amplitude, periodicity, transformations and real-life contexts."},
    {"code":"SL 3.8","topic_number":3,"level":"SL","title":"Trigonometric equations","description":"Graphical and analytical solutions in finite intervals, including quadratic forms."},
    {"code":"AHL 3.9","topic_number":3,"level":"AHL","title":"Reciprocal and inverse trigonometry","description":"Reciprocal ratios, Pythagorean identities, inverse functions, domains, ranges and graphs."},
    {"code":"AHL 3.10","topic_number":3,"level":"AHL","title":"Compound-angle identities","description":"Compound-angle identities and the double-angle identity for tangent."},
    {"code":"AHL 3.11","topic_number":3,"level":"AHL","title":"Trigonometric symmetry","description":"Relationships between trigonometric functions and symmetry properties of their graphs."},
    {"code":"AHL 3.12","topic_number":3,"level":"AHL","title":"Vectors and vector operations","description":"Position and displacement vectors, components, basis vectors and algebraic/geometric operations."},
    {"code":"AHL 3.13","topic_number":3,"level":"AHL","title":"Scalar product","description":"Scalar product, angle between vectors, perpendicular and parallel vectors."},
    {"code":"AHL 3.14","topic_number":3,"level":"AHL","title":"Vector equations of lines","description":"Lines in two and three dimensions, angle between lines and kinematic applications."},
    {"code":"AHL 3.15","topic_number":3,"level":"AHL","title":"Relationships between lines","description":"Coincident, parallel, intersecting and skew lines; points of intersection."},
    {"code":"AHL 3.16","topic_number":3,"level":"AHL","title":"Vector product","description":"Definition, properties and geometric interpretation of the vector product."},
    {"code":"AHL 3.17","topic_number":3,"level":"AHL","title":"Vector equations of planes","description":"Parametric, normal and Cartesian forms of planes."},
    {"code":"AHL 3.18","topic_number":3,"level":"AHL","title":"Intersections and angles in 3D","description":"Line-plane and plane-plane intersections; angles between lines and planes."},
    {"code":"SL 4.1","topic_number":4,"level":"SL","title":"Data and sampling","description":"Populations, samples, data types, reliability, bias, outliers and sampling techniques."},
    {"code":"SL 4.2","topic_number":4,"level":"SL","title":"Presenting data","description":"Frequency tables, histograms, cumulative frequency, percentiles, IQR and box plots."},
    {"code":"SL 4.3","topic_number":4,"level":"SL","title":"Summary statistics","description":"Central tendency, grouped estimates, dispersion, variance and standard deviation."},
    {"code":"SL 4.4","topic_number":4,"level":"SL","title":"Correlation and regression","description":"Pearson correlation, scatter diagrams, best-fit and y-on-x regression for prediction."},
    {"code":"SL 4.5","topic_number":4,"level":"SL","title":"Probability concepts","description":"Trials, outcomes, sample spaces, events, complements and expected occurrences."},
    {"code":"SL 4.6","topic_number":4,"level":"SL","title":"Probability diagrams and rules","description":"Venn, tree and sample-space diagrams; combined, conditional and independent events."},
    {"code":"SL 4.7","topic_number":4,"level":"SL","title":"Discrete random variables","description":"Probability distributions, expected value and applications."},
    {"code":"SL 4.8","topic_number":4,"level":"SL","title":"Binomial distribution","description":"Binomial probabilities, mean and variance."},
    {"code":"SL 4.9","topic_number":4,"level":"SL","title":"Normal distribution","description":"Properties, diagrams, probability and inverse-normal calculations."},
    {"code":"SL 4.10","topic_number":4,"level":"SL","title":"Regression of x on y","description":"Equation and use of the x-on-y regression line for prediction."},
    {"code":"SL 4.11","topic_number":4,"level":"SL","title":"Conditional probability","description":"Formal definitions of conditional probability and independence."},
    {"code":"SL 4.12","topic_number":4,"level":"SL","title":"Standardization","description":"z-values and inverse-normal calculations with unknown mean or standard deviation."},
    {"code":"AHL 4.13","topic_number":4,"level":"AHL","title":"Bayes' theorem","description":"Use of Bayes' theorem for a maximum of three events."},
    {"code":"AHL 4.14","topic_number":4,"level":"AHL","title":"Random variables and density functions","description":"Variance; continuous density functions; mode, median, mean and transformations."},
    {"code":"SL 5.1","topic_number":5,"level":"SL","title":"Limits and the derivative","description":"Introduction to limits; derivative as gradient function and rate of change."},
    {"code":"SL 5.2","topic_number":5,"level":"SL","title":"Increasing and decreasing functions","description":"Graphical interpretation of positive, zero and negative derivatives."},
    {"code":"SL 5.3","topic_number":5,"level":"SL","title":"Differentiating integer powers","description":"Power rule for integer exponents and sums of polynomial terms."},
    {"code":"SL 5.4","topic_number":5,"level":"SL","title":"Tangents and normals","description":"Equations of tangents and normals at a point."},
    {"code":"SL 5.5","topic_number":5,"level":"SL","title":"Introduction to integration","description":"Antidifferentiation, constants, definite integrals with technology and positive area."},
    {"code":"SL 5.6","topic_number":5,"level":"SL","title":"Differentiation rules","description":"Derivatives of standard functions; chain, product and quotient rules."},
    {"code":"SL 5.7","topic_number":5,"level":"SL","title":"Second derivative and graph behaviour","description":"Relationship between graphs of a function and its first and second derivatives."},
    {"code":"SL 5.8","topic_number":5,"level":"SL","title":"Optimization and inflexion","description":"Local extrema, tests, optimization and points of inflexion."},
    {"code":"SL 5.9","topic_number":5,"level":"SL","title":"Kinematics","description":"Displacement, velocity, acceleration and total distance travelled."},
    {"code":"SL 5.10","topic_number":5,"level":"SL","title":"Indefinite integration","description":"Standard integrals, linear composites, inspection and substitution."},
    {"code":"SL 5.11","topic_number":5,"level":"SL","title":"Definite integration and areas","description":"Analytical definite integrals, signed area and areas between curves."},
    {"code":"AHL 5.12","topic_number":5,"level":"AHL","title":"Continuity and first principles","description":"Continuity, differentiability, convergence, first-principles derivatives and higher derivatives."},
    {"code":"AHL 5.13","topic_number":5,"level":"AHL","title":"Limits and l'Hôpital's rule","description":"Evaluation of limits using l'Hôpital's rule or Maclaurin series."},
    {"code":"AHL 5.14","topic_number":5,"level":"AHL","title":"Implicit differentiation and related rates","description":"Implicit differentiation, related rates and optimization."},
    {"code":"AHL 5.15","topic_number":5,"level":"AHL","title":"Advanced derivatives and integrals","description":"Inverse trig, reciprocal trig, exponential and logarithmic derivatives and integrals; partial fractions."},
    {"code":"AHL 5.16","topic_number":5,"level":"AHL","title":"Integration techniques","description":"Substitution, integration by parts and repeated integration by parts."},
    {"code":"AHL 5.17","topic_number":5,"level":"AHL","title":"Areas and volumes","description":"Area against the y-axis and volumes of revolution about coordinate axes."},
    {"code":"AHL 5.18","topic_number":5,"level":"AHL","title":"Differential equations","description":"Euler's method, separable and homogeneous equations, and integrating factors."},
    {"code":"AHL 5.19","topic_number":5,"level":"AHL","title":"Maclaurin series","description":"Standard expansions and derivation by substitution, products, integration, differentiation and differential equations."}
  ]
  $seed$::jsonb) as x(code text,topic_number integer,level text,title text,description text)
), numbered as (
  select *, row_number() over(order by topic_number, split_part(code,' ',1) desc, split_part(split_part(code,' ',2),'.',2)::integer) as sort_order from seed
)
insert into public.syllabus_points(id,course_id,code,topic_number,topic_name,level,title,description,sort_order,active)
select
  format('30000000-0000-0000-0000-%s',lpad(sort_order::text,12,'0'))::uuid,
  '20000000-0000-0000-0000-000000000001', code, topic_number,
  case topic_number when 1 then 'Number and algebra' when 2 then 'Functions' when 3 then 'Geometry and trigonometry' when 4 then 'Statistics and probability' else 'Calculus' end,
  level::public.syllabus_level,title,description,sort_order,true
from numbered
on conflict(course_id,code) do update set topic_number=excluded.topic_number,topic_name=excluded.topic_name,level=excluded.level,title=excluded.title,description=excluded.description,sort_order=excluded.sort_order,active=true;
