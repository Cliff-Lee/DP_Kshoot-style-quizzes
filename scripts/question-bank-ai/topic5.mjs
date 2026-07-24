import {fill,match,mc,multi,num,order,short,tf} from '../question-bank/helpers.mjs'

export const aiTopic5={
'SL 5.1':[
  num('Evaluate lim(x→3) (x²−9)/(x−3).',6,'For x≠3 the expression simplifies to x+3, whose limit at 3 is 6.',{tags:['limits']}),
  mc('What does f′(8)=−2 mean in context?',['f is decreasing at 2 units per input unit when x=8','f(8)=−2','The area under f is −2','f has a minimum at x=8'],'f is decreasing at 2 units per input unit when x=8','The derivative is the instantaneous rate of change; its negative sign indicates decrease.',{tags:['derivative','rate of change']}),
  tf('A function may have a finite limit at x=a even when f(a) is undefined.',true,'A removable discontinuity can have matching one-sided limits without a defined function value.',{questionStyle:'conceptual',tags:['limits','discontinuity']})],
'SL 5.2':[
  mc('If f′(x)<0 on 2<x<7, what is f doing on that interval?',['Increasing','Decreasing','Constant','Undefined'],'Decreasing','A negative derivative means the graph has negative local gradient.',{tags:['derivative sign','decreasing']}),
  multi('The graph of f′ changes from negative to positive at x=4. Select all valid conclusions.',['f has a local minimum at x=4.','f decreases just before x=4.','f increases just after x=4.','f has a local maximum at x=4.'],['f has a local minimum at x=4.','f decreases just before x=4.','f increases just after x=4.'],'The sign change from − to + means f falls and then rises.',{tags:['derivative graph','stationary points']}),
  tf('If f′(a)=0, then f must have a maximum or minimum at x=a.',false,'A stationary point can be an inflexion, such as x³ at x=0.',{questionStyle:'misconception',tags:['stationary points']})],
'SL 5.3':[
  fill('If f(x)=4x⁵−7x²+3, then f′(x)=___.','20x⁴−14x',['20x^4-14x','20x⁴−14x','20x⁴ - 14x'],'Differentiate term by term using the power rule.',{tags:['power rule']}),
  short('Differentiate y=3x⁻²+5x.','−6x⁻³+5',['-6x^-3+5','−6x⁻³+5','5-6x^-3'],'The power rule gives 3(−2)x⁻³+5.',{tags:['power rule','negative exponents']}),
  mc('Which derivative is correct?',['d(x⁴)/dx=4x³','d(x⁴)/dx=x³','d(x⁻¹)/dx=x⁻²','d(7)/dx=7'],'d(x⁴)/dx=4x³','The power rule gives nxⁿ⁻¹, and constants differentiate to zero.',{questionStyle:'conceptual',tags:['differentiation','misconceptions']})],
'SL 5.4':[
  num('For f(x)=x²−3x, find the tangent gradient at x=4.',5,'f′(x)=2x−3, so f′(4)=5.',{tags:['tangents','gradient']}),
  short('Find the tangent to y=x² at x=2.','y=4x−4',['y=4x-4','y = 4x − 4','4x-y=4'],'The point is (2,4), the gradient is 4, and y−4=4(x−2).',{tags:['tangent equations']}),
  mc('The tangent gradient at a point is 1/3. What is the normal gradient?',['3','−3','−1/3','1/3'],'−3','Perpendicular non-vertical gradients multiply to −1.',{questionStyle:'conceptual',tags:['normals','perpendicular gradients']})],
'SL 5.5':[
  fill('Complete the antiderivative: ∫8x³ dx=___+C.','2x⁴',['2x^4','2x⁴'],'Increase the power to 4 and divide by 4.',{tags:['antidifferentiation']}),
  num('Evaluate ∫₀³2x dx.',9,'An antiderivative is x², so the value is 3²−0²=9.',{tags:['definite integrals']}),
  tf('If F′(x)=f(x), then F(x)+7 is also an antiderivative of f.',true,'Adding a constant does not change the derivative.',{questionStyle:'conceptual',tags:['constant of integration']})],
'SL 5.6':[
  mc('A graphing tool gives f′(x)=3(x−2)(x+1). Which x-values are stationary points of f?',['−1 and 2','1 and −2','−3 and 2','0 and 3'],'−1 and 2','Stationary points occur where f′(x)=0.',{calculator:'allowed',tags:['stationary points']}),
  num('For f(x)=x³−3x², find the positive stationary x-value.',2,'f′(x)=3x²−6x=3x(x−2), giving x=0 and x=2.',{tags:['stationary points','differentiation']}),
  multi('Select all true statements.',['A local maximum need not be the greatest value on the whole domain.','A stationary point has f′(x)=0.','Every stationary point is a local extremum.','Technology can help solve f′(x)=0.'],['A local maximum need not be the greatest value on the whole domain.','A stationary point has f′(x)=0.','Technology can help solve f′(x)=0.'],'Stationary inflexion points show that not every stationary point is an extremum.',{questionStyle:'conceptual',tags:['stationary points','interpretation']})],
'SL 5.7':[
  mc('A rectangular pen uses 40 m of fencing for all four sides. Which dimensions maximize its area?',['5 m by 15 m','8 m by 12 m','10 m by 10 m','4 m by 16 m'],'10 m by 10 m','For a fixed perimeter, a rectangle has maximum area when it is a square.',{questionStyle:'application',tags:['optimization','area']}),
  num('A profit model is P(x)=−2x²+80x−300. Find the x-value that maximizes profit.',20,'The vertex occurs at x=−b/(2a)=−80/[2(−2)]=20.',{calculator:'allowed',questionStyle:'application',tags:['optimization','profit']}),
  order('Order the main steps of a contextual optimization problem.',['Solve for critical values','Define the objective function','Check endpoints and context','Differentiate the objective'],['Define the objective function','Differentiate the objective','Solve for critical values','Check endpoints and context'],'A complete solution models, differentiates, solves, then checks the feasible context.',{questionStyle:'procedural',tags:['optimization','method']})],
'SL 5.8':[
  num('Use one trapezoid to estimate the area under y=x² from x=0 to x=2.',4,'Area≈(2/2)[f(0)+f(2)]=1(0+4)=4.',{tags:['trapezoidal rule']}),
  num('Values of f at x=0,1,2,3 are 2,5,6,10. Use the trapezoidal rule with width 1 to estimate ∫₀³f(x)dx.',17,'Estimate=(1/2)[2+2(5+6)+10]=17.',{tags:['trapezoidal rule','table']}),
  multi('Select all true statements about the trapezoidal rule.',['It approximates a curve by straight-line segments.','Equal-width data can be used directly.','More subintervals often improve accuracy for a smooth curve.','It always gives the exact area.'],['It approximates a curve by straight-line segments.','Equal-width data can be used directly.','More subintervals often improve accuracy for a smooth curve.'],'The method is approximate unless the graph is linear on every subinterval.',{questionStyle:'conceptual',tags:['trapezoidal rule','accuracy']})],
'AHL 5.9':[
  mc('Differentiate y=e^(3x).',['e^(3x)','3e^(3x)','e^(x³)','3xe^(3x)'],'3e^(3x)','The chain rule multiplies by the inner derivative 3.',{tags:['chain rule','exponential derivative']}),
  short('Differentiate y=x²lnx.','2xlnx+x',['2x ln x + x','2xln(x)+x','x(2lnx+1)'],'The product rule gives 2xlnx+x²(1/x)=2xlnx+x.',{tags:['product rule','logarithmic derivative']}),
  mc('A sphere’s radius increases at 0.4 cm/s. Which expression gives dV/dt when V=(4/3)πr³?',['4πr²(0.4)','(4/3)πr²','4πr(0.4)','πr²(0.4)'],'4πr²(0.4)','Differentiate with respect to time: dV/dt=4πr²dr/dt.',{questionStyle:'application',tags:['related rates']})],
'AHL 5.10':[
  mc('At x=a, f′(a)=0 and f″(a)<0. What is indicated?',['Local minimum','Local maximum','No stationary point','Vertical asymptote'],'Local maximum','The graph is concave down at the stationary point.',{tags:['second derivative test']}),
  multi('On an interval f′(x)>0 and f″(x)<0. Select all true statements.',['f is increasing.','f is concave down.','The gradient is decreasing.','f is decreasing.'],['f is increasing.','f is concave down.','The gradient is decreasing.'],'Positive first derivative means increasing; negative second derivative means slopes decrease.',{tags:['concavity','derivative signs']}),
  tf('The condition f″(a)=0 alone proves that x=a is a point of inflexion.',false,'Concavity must change sign; f″(a)=0 is not sufficient.',{questionStyle:'misconception',tags:['points of inflexion']})],
'AHL 5.11':[
  fill('Complete: ∫e^(4x)dx=___+C.','(1/4)e^(4x)',['e^(4x)/4','(1/4)e^(4x)','0.25e^(4x)'],'Reverse the chain rule by dividing by the inner derivative 4.',{tags:['integration','exponential functions']}),
  short('Evaluate ∫2x(x²+3)⁵dx.','(x²+3)⁶/6+C',['(x^2+3)^6/6+C','(x²+3)⁶/6 + C'],'Let u=x²+3, so du=2x dx and integrate u⁵.',{tags:['substitution']}),
  mc('Which antiderivative differentiates to sec²(5x)?',['tan(5x)','5tan(5x)','(1/5)tan(5x)','−(1/5)tan(5x)'],'(1/5)tan(5x)','Differentiating (1/5)tan(5x) gives sec²(5x).',{questionStyle:'conceptual',tags:['integration','trigonometric functions']})],
'AHL 5.12':[
  num('Find the area between y=x and the x-axis from x=−2 to x=2.',4,'Geometric area is two congruent triangles, each of area 2, giving 4.',{tags:['area','signed integrals']}),
  num('The region under y=x from x=0 to x=3 is revolved about the x-axis. Find the volume as a coefficient of π.',9,'V=π∫₀³x²dx=π[x³/3]₀³=9π.',{questionStyle:'application',tags:['volume of revolution']}),
  multi('Select all correct setup statements.',['About the x-axis, a disc radius is a y-value.','About the y-axis with x=g(y), use π∫x²dy.','Negative definite integrals represent negative signed area.','Geometric area is always the raw definite integral.'],['About the x-axis, a disc radius is a y-value.','About the y-axis with x=g(y), use π∫x²dy.','Negative definite integrals represent negative signed area.'],'Geometric area requires absolute/partitioned areas when a curve crosses an axis.',{questionStyle:'conceptual',tags:['areas','volumes']})],
'AHL 5.13':[
  num('A particle has displacement s(t)=2t³−9t²+12t. Find its acceleration at t=2.',6,'v=6t²−18t+12 and a=12t−18, so a(2)=6.',{tags:['kinematics','acceleration']}),
  mc('A particle has negative velocity and negative acceleration. What happens to its speed at that instant?',['It increases','It decreases','It is zero','It cannot be determined'],'It increases','Velocity and acceleration have the same sign, so the magnitude of velocity increases.',{tags:['kinematics','sign interpretation']}),
  tf('Total distance over an interval is ∫|v(t)|dt, not the magnitude of ∫v(t)dt when direction changes.',true,'Absolute velocity accumulates every travelled segment, while the signed integral gives displacement.',{questionStyle:'conceptual',tags:['distance','displacement']})],
'AHL 5.14':[
  mc('A population grows at a rate proportional to its size P. Which differential equation models this?',['dP/dt=kP','dP/dt=k/P','dP/dt=P+k','dP/dt=kt'],'dP/dt=kP','Proportional growth means the rate is a constant multiple of the current population.',{tags:['differential equation models']}),
  short('Solve dy/dx=2y by separation, given y(0)=3.','y=3e^(2x)',['3e^(2x)','y=3e^(2x)','3e^{2x}'],'Separating gives lny=2x+C; the initial condition gives C=ln3.',{tags:['separation of variables']}),
  multi('Select all contexts that can be modelled by dy/dt=−ky with k>0.',['Radioactive decay','Newton-style cooling difference under fixed conditions','Unrestricted exponential growth','Drug elimination at a rate proportional to amount'],['Radioactive decay','Newton-style cooling difference under fixed conditions','Drug elimination at a rate proportional to amount'],'The negative proportional rate creates exponential decay.',{questionStyle:'conceptual',tags:['differential equations','decay models']})],
'AHL 5.15':[
  mc('For dy/dx=x−y, what is the slope at the point (2,−1)?',['−3','1','2','3'],'3','Substitute x=2 and y=−1: slope=2−(−1)=3.',{tags:['slope fields']}),
  match('Match each differential equation to its slope-field feature.',[{left:'dy/dx=0','right':'All segments horizontal'},{left:'dy/dx=x','right':'Slope depends only on horizontal position'},{left:'dy/dx=y','right':'Slope is zero on the x-axis'}],'A slope field records the derivative value at each point.',{tags:['slope fields','interpretation']}),
  multi('Select all true statements about a solution curve drawn on a slope field.',['It is tangent to local direction segments.','It follows the indicated derivative at each point.','Two distinct solutions through the same point are always required.','Horizontal segments indicate zero derivative.'],['It is tangent to local direction segments.','It follows the indicated derivative at each point.','Horizontal segments indicate zero derivative.'],'A solution curve follows the local slopes; under standard uniqueness conditions one solution passes through a given point.',{questionStyle:'conceptual',tags:['slope fields','solution curves']})],
'AHL 5.16':[
  num('Use one Euler step for dy/dx=x+y from (0,1) with step size h=0.2. Find the new y-value.',1.2,'y₁=1+0.2(0+1)=1.2.',{tags:['Euler method']}),
  num('Euler’s method uses h=0.1 for dy/dx=2y with y(0)=3. Find y(0.2) after two steps.',4.32,'First y₁=3+0.1(6)=3.6; then y₂=3.6+0.1(7.2)=4.32.',{tags:['Euler method','iteration']}),
  order('Order the operations in one Euler step.',['Evaluate f(xₙ,yₙ)','Advance x by h','Add h f(xₙ,yₙ) to yₙ','Read the current point (xₙ,yₙ)'],['Read the current point (xₙ,yₙ)','Evaluate f(xₙ,yₙ)','Add h f(xₙ,yₙ) to yₙ','Advance x by h'],'Euler follows the current tangent slope for one horizontal step.',{questionStyle:'procedural',tags:['Euler method','algorithm']})],
'AHL 5.17':[
  mc('A linear system has two real eigenvalues of opposite signs. What type of equilibrium is the origin?',['Stable node','Unstable node','Saddle point','Centre'],'Saddle point','Opposite-sign eigenvalues produce attraction along one eigendirection and repulsion along the other.',{tags:['phase portraits','stability']}),
  multi('Select all true statements about eigenvalues and phase portraits.',['Negative real parts indicate motion toward the origin.','Positive real parts indicate motion away from the origin.','Pure imaginary eigenvalues can produce closed curves.','Every complex eigenvalue gives a saddle.'],['Negative real parts indicate motion toward the origin.','Positive real parts indicate motion away from the origin.','Pure imaginary eigenvalues can produce closed curves.'],'Complex eigenvalues produce spirals when their real part is non-zero, not saddles.',{tags:['phase portraits','eigenvalues']}),
  match('Match each eigenvalue pattern to the qualitative phase portrait.',[{left:'Both real and negative','right':'Stable node'},{left:'Real with opposite signs','right':'Saddle point'},{left:'Complex with positive real part','right':'Outward spiral'}],'Eigenvalue signs and real parts determine local stability and trajectory shape.',{questionStyle:'conceptual',tags:['phase portraits','classification']})],
'AHL 5.18':[
  mc('To rewrite x″+3x′+2x=0 as a first-order system using y=x′, which equation is correct?',['y′=−3y−2x','y′=3y+2x','y′=−3x−2y','y′=x'],'y′=−3y−2x','Since x″=y′ and x′=y, the equation gives y′+3y+2x=0.',{tags:['second-order differential equations']}),
  num('For x″=−4x, let y=x′. At a point where x=3 and y=−2, find y′.',-12,'The coupled system is x′=y and y′=−4x, so y′=−12.',{tags:['coupled systems','second-order equations']}),
  multi('Select all true statements about converting x″=f(x,x′,t) to a first-order system.',['Set y=x′.','Then x′=y.','Then y′=f(x,y,t).','The second-order equation is discarded.'],['Set y=x′.','Then x′=y.','Then y′=f(x,y,t).'],'The substitution represents the same second-order dynamics as two coupled first-order equations.',{questionStyle:'conceptual',tags:['second-order equations','coupled systems']})],
}
