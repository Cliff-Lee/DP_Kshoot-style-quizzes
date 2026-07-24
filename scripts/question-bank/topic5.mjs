import {fill,match,mc,multi,num,order,short,tf} from './helpers.mjs'

export const topic5={
'SL 5.1':[
  num('Evaluate lim(x→2) (x²−4)/(x−2).',4,'Factor to x+2 for x≠2, then substitute x=2.',{tags:['limits']}),
  mc('What does f′(3) represent?',['The y-intercept of f','The gradient of the tangent to y=f(x) at x=3','The area under f from 0 to 3','The value f(3)'],'The gradient of the tangent to y=f(x) at x=3','A derivative is the instantaneous rate of change or tangent gradient.',{tags:['derivative','gradient']}),
  tf('A function can have a finite limit at x=a even if it is not defined at x=a.',true,'A removable hole can have matching one-sided limits despite no function value.',{questionStyle:'conceptual',tags:['limits','continuity']})],
'SL 5.2':[
  mc('If f′(x)>0 throughout an interval, what is f doing there?',['Increasing','Decreasing','Constant','Undefined'],'Increasing','A positive derivative means positive local gradient.',{tags:['increasing functions','derivative sign']}),
  multi('A graph of f′ crosses from positive to negative at x=2. Select all valid conclusions.',['f has a local maximum at x=2.','f is increasing just before x=2.','f is decreasing just after x=2.','f has a local minimum at x=2.'],['f has a local maximum at x=2.','f is increasing just before x=2.','f is decreasing just after x=2.'],'The sign change + to − makes f rise then fall.',{tags:['stationary points','derivative sign']}),
  tf('If f′(a)=0, then f must have a local maximum or minimum at x=a.',false,'A stationary point can be an inflexion, such as f(x)=x³ at x=0.',{questionStyle:'misconception',tags:['stationary points']})],
'SL 5.3':[
  fill('If f(x)=5x⁴−3x²+7, then f′(x)=___.','20x³−6x',['20x^3-6x','20*x^3-6*x','20x³ - 6x'],'Differentiate term by term using the power rule.',{tags:['power rule']}),
  short('Differentiate f(x)=6x⁴−2x²+9.','24x³−4x',['24x^3-4x','24x³−4x','24x³ - 4x'],'The derivative is 24x³−4x.',{tags:['polynomial differentiation']}),
  mc('Which is the derivative of x⁻²?',['−2x⁻³','2x⁻¹','−x⁻¹','x⁻³'],'−2x⁻³','Use d(xⁿ)/dx=nxⁿ⁻¹ with n=−2.',{tags:['power rule','negative exponents']})],
'SL 5.4':[
  num('For f(x)=x², find the gradient of the tangent at x=3.',6,'f′(x)=2x, so f′(3)=6.',{tags:['tangents']}),
  mc('The tangent to y=x² at x=1 has equation which?',['y=2x−1','y=x+1','y=−2x+3','y=2x+1'],'y=2x−1','The point is (1,1), gradient 2, so y−1=2(x−1).',{tags:['tangent equations']}),
  short('Find the equation of the normal to y=x² at x=1.','y=−x/2+3/2',['y=-x/2+3/2','y=−0.5x+1.5','y = -0.5x + 1.5'],'The tangent gradient is 2, so the normal gradient is −1/2 through (1,1).',{tags:['normal equations']})],
'SL 5.5':[
  fill('Complete the antiderivative: ∫6x² dx=___+C.','2x³',['2x^3','2x³'],'Increase the power to 3 and divide by 3.',{tags:['antidifferentiation']}),
  num('Evaluate ∫₀² 3x² dx.',8,'An antiderivative is x³; x³ evaluated from 0 to 2 is 8.',{tags:['definite integrals']}),
  tf('Every antiderivative of 2x is exactly x².',false,'The family is x²+C, where C is any constant.',{questionStyle:'misconception',tags:['constant of integration']})],
'SL 5.6':[
  mc('Differentiate y=(3x+1)⁵.',['5(3x+1)⁴','15(3x+1)⁴','15(3x+1)⁵','(3x+1)⁴'],'15(3x+1)⁴','The chain rule multiplies by the inner derivative 3.',{tags:['chain rule']}),
  short('Differentiate y=x²sinx.','2x sinx+x² cosx',['2xsinx+x^2cosx','2x sin x + x² cos x','2*x*sin(x)+x^2*cos(x)'],'Apply the product rule u′v+uv′.',{tags:['product rule']}),
  mc('Which is d/dx [ln(x²+1)]?',['1/(x²+1)','2x/(x²+1)','2/(x²+1)','ln(2x)'],'2x/(x²+1)','Use the chain rule: derivative of ln u is u′/u.',{tags:['chain rule','logarithmic derivative']})],
'SL 5.7':[
  mc('At x=a, f′(a)=0 and f″(a)>0. What is indicated?',['A local maximum','A local minimum','A vertical asymptote','No stationary point'],'A local minimum','Positive second derivative means concave up at the stationary point.',{tags:['second derivative','stationary points']}),
  multi('On an interval f′(x)>0 and f″(x)<0. Select all true statements.',['f is increasing.','f is concave down.','The gradient is decreasing.','f is decreasing.'],['f is increasing.','f is concave down.','The gradient is decreasing.'],'Positive first derivative means increasing; negative second derivative means slopes decrease.',{tags:['graph behaviour','derivatives']}),
  tf('If f″(a)=0, then x=a must be a point of inflexion.',false,'A sign change in concavity is required; f″(a)=0 alone is insufficient.',{questionStyle:'misconception',tags:['points of inflexion']})],
'SL 5.8':[
  mc('At x=a, f′(a)=0 and f″(a)<0. What can be concluded?',['f has a local minimum at x=a','f has a local maximum at x=a','x=a must be a point of inflexion','No conclusion is possible'],'f has a local maximum at x=a','A negative second derivative means the graph is concave down.',{tags:['optimization','second derivative test']}),
  order('Order the main steps in a one-variable optimization problem.',['Check the solution in context','Differentiate the objective','Define an objective function','Solve for stationary points'],['Define an objective function','Differentiate the objective','Solve for stationary points','Check the solution in context'],'Model, differentiate, solve, then interpret and verify.',{tags:['optimization','method']}),
  num('A rectangle has perimeter 20 m. Find its maximum possible area in m².',25,'With sides x and 10−x, A=x(10−x), maximized at x=5.',{calculator:'allowed',questionStyle:'application',tags:['optimization','application']})],
'SL 5.9':[
  num('A particle has displacement s(t)=t³−3t² metres. Find its velocity at t=2.',0,'v=ds/dt=3t²−6t, so v(2)=0.',{tags:['kinematics','velocity']}),
  mc('If velocity is negative while acceleration is positive, which statement must be true at that instant?',['The particle moves in the positive direction.','The particle moves in the negative direction and is slowing down.','The particle is stationary.','Its displacement is negative.'],'The particle moves in the negative direction and is slowing down.','Velocity gives direction; acceleration opposite to velocity reduces speed.',{tags:['kinematics','sign interpretation']}),
  tf('Total distance travelled over an interval always equals the magnitude of the displacement.',false,'Direction changes make total distance larger than the magnitude of net displacement.',{questionStyle:'misconception',tags:['distance','displacement']})],
'SL 5.10':[
  fill('Complete: ∫(3x²+4) dx=___.','x³+4x+C',['x^3+4x+C','x³+4x+C','x³ + 4x + C'],'Integrate each term and include the constant of integration.',{tags:['indefinite integration']}),
  short('Evaluate ∫2x(x²+1)⁴ dx.','(x²+1)⁵/5+C',['(x^2+1)^5/5+C','1/5(x²+1)⁵+C','((x²+1)⁵)/5 + C'],'Let u=x²+1, du=2x dx, then integrate u⁴.',{tags:['substitution']}),
  mc('Which antiderivative differentiates to cos(3x)?',['sin(3x)','3sin(3x)','(1/3)sin(3x)','−(1/3)sin(3x)'],'(1/3)sin(3x)','Differentiating (1/3)sin(3x) gives cos(3x).',{tags:['linear composites']})],
'SL 5.11':[
  num('Evaluate ∫₁³ 2x dx.',8,'[x²]₁³=9−1=8.',{tags:['definite integration']}),
  mc('The integral ∫₀²(x−1) dx equals 0. What does this mean geometrically?',['There is no area between the graph and axis.','Positive and negative signed areas cancel.','The graph never crosses the axis.','The total area is negative.'],'Positive and negative signed areas cancel.','A definite integral is signed area; geometric area would be positive.',{tags:['signed area']}),
  num('Find the area between y=x and y=x² on 0≤x≤1.',0.166667,'Area=∫₀¹(x−x²)dx=1/2−1/3=1/6.',{calculator:'allowed',questionStyle:'exam_style',tags:['area between curves']},0.00001)],
'AHL 5.12':[
  mc('Which condition is required for f to be continuous at x=a?',['f(a) exists only','lim(x→a)f(x) exists only','lim(x→a)f(x)=f(a)','f′(a)=0'],'lim(x→a)f(x)=f(a)','Continuity requires the limit to exist and equal the function value.',{tags:['continuity']}),
  num('Using first principles, the derivative of f(x)=x² at x=3 is what value?',6,'[(3+h)²−9]/h=6+h, whose limit is 6.',{questionStyle:'exam_style',tags:['first principles','derivative']}),
  tf('Every differentiable function is continuous at the point of differentiability.',true,'Differentiability implies continuity, though the converse is false.',{questionStyle:'conceptual',tags:['differentiability','continuity']})],
'AHL 5.13':[
  num('Evaluate lim(x→0) sinx/x.',1,'This standard limit equals 1.',{tags:['limits']}),
  mc('Using l’Hôpital’s rule, lim(x→∞)(3x²+1)/(2x²−5) equals what?',['0','1','3/2','∞'],'3/2','Differentiate numerator and denominator or compare leading coefficients.',{tags:['L’Hopital rule']}),
  tf('l’Hôpital’s rule may be applied directly to any quotient limit, including one whose substitution gives 2/3.',false,'It is intended for indeterminate forms such as 0/0 or ∞/∞.',{questionStyle:'misconception',tags:['L’Hopital rule','indeterminate forms']})],
'AHL 5.14':[
  short('For x²+y²=25, find dy/dx.','−x/y',['-x/y','−x/y','-(x/y)'],'Implicit differentiation gives 2x+2y(dy/dx)=0.',{tags:['implicit differentiation']}),
  num('A circle’s radius increases at 2 cm/s. Find dA/dt when r=3 cm, in terms of π by entering the coefficient of π.',12,'A=πr², so dA/dt=2πr(dr/dt)=12π.',{questionStyle:'application',tags:['related rates']}),
  mc('At the point (3,4) on x²+y²=25, what is the tangent gradient?',['−4/3','−3/4','3/4','4/3'],'−3/4','dy/dx=−x/y=−3/4.',{tags:['implicit differentiation','tangent']})],
'AHL 5.15':[
  mc('Differentiate y=arctan x.',['1/(1+x²)','−1/(1+x²)','1/√(1−x²)','sec²x'],'1/(1+x²)','This is the standard derivative of arctan x.',{tags:['inverse trigonometric derivatives']}),
  short('Differentiate y=x ln x.','lnx+1',['ln x + 1','ln(x)+1','1+lnx'],'The product rule gives 1·lnx+x(1/x)=lnx+1.',{tags:['logarithmic derivatives','product rule']}),
  mc('Evaluate ∫1/(1+x²) dx.',['ln|1+x²|+C','arctanx+C','arcsinx+C','−1/(1+x)+C'],'arctanx+C','The derivative of arctanx is 1/(1+x²).',{tags:['inverse trigonometric integrals']})],
'AHL 5.16':[
  mc('Which method is most direct for ∫x eˣ dx?',['Integration by parts','Partial fractions','Trigonometric substitution','Long division'],'Integration by parts','The integrand is a product of an algebraic and exponential factor.',{tags:['integration by parts']}),
  short('Evaluate ∫2x cos(x²) dx.','sin(x²)+C',['sin(x^2)+C','sin(x²) + C','sin(x²)+C'],'Let u=x², so du=2x dx.',{tags:['integration by substitution']}),
  order('Order the steps for integration by parts.',['Substitute into ∫u dv=uv−∫v du','Choose u and dv','Integrate dv to find v','Differentiate u to find du'],['Choose u and dv','Differentiate u to find du','Integrate dv to find v','Substitute into ∫u dv=uv−∫v du'],'Choose factors, form du and v, then apply the formula.',{questionStyle:'procedural',tags:['integration by parts','method']})],
'AHL 5.17':[
  num('The region under y=x from x=0 to x=2 is revolved about the x-axis. Find the volume as a coefficient of π.',2.666667,'V=π∫₀²x²dx=8π/3.',{calculator:'allowed',questionStyle:'application',tags:['volume of revolution']},0.00001),
  mc('To find the area between x=y² and x=2y for 0≤y≤2, which integral is correct?',['∫₀²(2y−y²)dy','∫₀²(y²−2y)dy','∫₀²(2y−y²)dx','∫₀²(y−y²)dy'],'∫₀²(2y−y²)dy','Against the y-axis, integrate right x minus left x with respect to y.',{tags:['area against y-axis']}),
  tf('When a region is revolved about the y-axis and x is given as a function of y, the disc method uses V=π∫x² dy.',true,'The radius is the horizontal distance x from the y-axis.',{questionStyle:'conceptual',tags:['volume of revolution']})],
'AHL 5.18':[
  mc('Solve dy/dx=3y by separation. Which general solution is correct?',['y=3x+C','y=Ce^(3x)','y=Cx³','y=e^x+3'],'y=Ce^(3x)','dy/y=3dx gives lny=3x+C and hence y=Ce^(3x).',{tags:['differential equations','separation']}),
  num('Euler’s method uses yₙ₊₁=yₙ+h f(xₙ,yₙ). If y₀=1, h=0.1 and f=2y, find y₁.',1.2,'y₁=1+0.1(2·1)=1.2.',{tags:['Euler method']}),
  order('Order the steps for solving a first-order linear differential equation y′+P(x)y=Q(x).',['Multiply through by the integrating factor','Integrate both sides','Find μ=e^(∫P dx)','Recognize the left side as (μy)′'],['Find μ=e^(∫P dx)','Multiply through by the integrating factor','Recognize the left side as (μy)′','Integrate both sides'],'The integrating factor converts the left side to a product derivative.',{questionStyle:'procedural',tags:['integrating factors']})],
'AHL 5.19':[
  mc('Which is the Maclaurin expansion of eˣ up to x³?',['1+x+x²/2+x³/6','1−x+x²−x³','x−x³/6','1+x²/2'],'1+x+x²/2+x³/6','eˣ=Σxⁿ/n!.',{tags:['Maclaurin series']}),
  fill('Complete the Maclaurin expansion: sinx=x−___+… .','x³/6',['x^3/6','x³/6','(x³)/6'],'sinx=x−x³/3!+x⁵/5!−… .',{tags:['Maclaurin series','sine']}),
  num('Using 1/(1−x)=1+x+x²+…, approximate 1/0.9 with terms through x² by setting x=0.1.',1.11,'1+0.1+0.01=1.11.',{questionStyle:'application',tags:['Maclaurin series','approximation']},0.001)],
}
