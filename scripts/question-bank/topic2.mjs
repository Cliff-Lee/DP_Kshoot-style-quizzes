import {drag,fill,match,mc,multi,num,order,short,tf} from './helpers.mjs'

export const topic2={
'SL 2.1':[
  num('Find the gradient of the line through (2,3) and (6,11).',2,'m=(11−3)/(6−2)=2.',{tags:['straight lines','gradient']}),
  mc('Which equation is perpendicular to y=2x+5 and passes through the origin?',['y=−2x','y=−x/2','y=x/2','y=2x'],'y=−x/2','A perpendicular gradient is the negative reciprocal, −1/2.',{tags:['perpendicular lines']}),
  multi('For the line 3x+2y=12, select all true statements.',['Its y-intercept is 6.','Its x-intercept is 4.','Its gradient is −3/2.','It is parallel to y=3x−1.'],['Its y-intercept is 6.','Its x-intercept is 4.','Its gradient is −3/2.'],'Rearranging gives y=−3x/2+6; setting y=0 gives x=4.',{questionStyle:'conceptual',tags:['line features']})],
'SL 2.2':[
  mc('What is the domain of f(x)=1/(x−3)?',['All real x','x>3','All real x except 3','x≠0'],'All real x except 3','The denominator cannot be zero, so x≠3.',{tags:['domain','functions']}),
  short('Find f⁻¹(x) for f(x)=2x−3.','(x+3)/2',['(x + 3)/2','0.5(x+3)','(x+3)÷2'],'Write y=2x−3, swap x and y, then solve for y.',{tags:['inverse functions']}),
  tf('The function f(x)=x² has an inverse function on the unrestricted domain of all real numbers.',false,'It is not one-to-one on all real numbers; a domain restriction such as x≥0 is needed.',{questionStyle:'misconception',tags:['inverse functions','one-to-one']})],
'SL 2.3':[
  num('At x=2, f(2)=5 and g(2)=−3. Find (f+g)(2).',2,'(f+g)(2)=f(2)+g(2)=5−3=2.',{tags:['function graphs','sum of functions']}),
  mc('The graph of h(x)=f(x)−g(x) crosses the x-axis when which condition holds?',['f(x)=0','g(x)=0','f(x)=g(x)','f(x)=−g(x)'],'f(x)=g(x)','An x-intercept of h occurs when f(x)−g(x)=0.',{tags:['difference of functions','intersections']}),
  match('Match each function to the key shape of its graph.',[{left:'y=x²',right:'Upward-opening parabola'},{left:'y=|x|',right:'V-shape'},{left:'y=1/x',right:'Two reciprocal branches'}],'Recognizing parent graphs supports accurate sketches and transformations.',{questionStyle:'recall',tags:['parent graphs']})],
'SL 2.4':[
  num('The graphs y=x² and y=2x+3 intersect when x²=2x+3. Find the positive x-coordinate of intersection.',3,'x²−2x−3=(x−3)(x+1)=0, so the positive solution is 3.',{questionStyle:'exam_style',tags:['intersections']}),
  mc('For f(x)=−(x−2)²+7, what is the maximum value?',['−2','2','7','9'],'7','The vertex is (2,7) and the parabola opens downward.',{tags:['graph features','vertex']}),
  multi('A graph has a local minimum at (1,−4) and x-intercepts −1 and 3. Select all true statements.',['Its minimum value is −4.','f(1)=−4.','f(−1)=0.','Its axis of symmetry must be x=0.'],['Its minimum value is −4.','f(1)=−4.','f(−1)=0.'],'Coordinates of extrema and intercepts translate directly into function values.',{questionStyle:'conceptual',tags:['graph interpretation']})],
'SL 2.5':[
  num('Let f(x)=2x+3 and g(x)=x². Find (f∘g)(2).',11,'g(2)=4 and f(4)=11.',{tags:['composite functions']}),
  short('Find the inverse of f(x)=3x+6.','(x−6)/3',['(x-6)/3','x/3-2','(x − 6)/3'],'Swap input and output in y=3x+6 and solve for y.',{tags:['inverse functions']}),
  tf('For invertible functions f and g, (f∘g)⁻¹=f⁻¹∘g⁻¹.',false,'The order reverses: (f∘g)⁻¹=g⁻¹∘f⁻¹.',{questionStyle:'misconception',tags:['inverse composition']})],
'SL 2.6':[
  mc('What is the vertex of y=(x−3)²−5?',['(−3,−5)','(3,−5)','(3,5)','(−3,5)'],'(3,−5)','Vertex form y=(x−h)²+k has vertex (h,k).',{tags:['quadratic functions','vertex']}),
  num('Find the y-intercept of y=2x²−5x+7.',7,'At the y-intercept x=0, so y=7.',{tags:['quadratic functions','intercept']}),
  multi('For y=−2(x+1)²+8, select all true statements.',['The axis is x=−1.','The maximum value is 8.','The graph opens downward.','The vertex is (1,8).'],['The axis is x=−1.','The maximum value is 8.','The graph opens downward.'],'The vertex is (−1,8) and the negative leading coefficient makes it open downward.',{questionStyle:'conceptual',tags:['quadratic graph features']})],
'SL 2.7':[
  num('Find the discriminant of 2x²−3x+5=0.',-31,'b²−4ac=9−40=−31.',{tags:['discriminant']}),
  mc('How many distinct real roots does x²−6x+9=0 have?',['0','1','2','3'],'1','The discriminant is zero and the quadratic is (x−3)².',{tags:['quadratic roots']}),
  tf('If b²−4ac<0, the quadratic equation ax²+bx+c=0 has two distinct real solutions.',false,'A negative discriminant gives no real solutions.',{questionStyle:'misconception',tags:['discriminant','nature of roots']})],
'SL 2.8':[
  mc('What is the vertical asymptote of y=3/(x−2)+1?',['x=−2','x=2','y=1','y=2'],'x=2','The denominator is zero at x=2.',{tags:['reciprocal functions','asymptotes']}),
  mc('For y=(2x+1)/(x−3), what is the horizontal asymptote?',['y=0','y=1','y=2','x=3'],'y=2','For equal-degree numerator and denominator, divide the leading coefficients: 2/1=2.',{tags:['rational functions','asymptotes']}),
  multi('For y=1/x, select all true statements.',['x=0 is a vertical asymptote.','y=0 is a horizontal asymptote.','The graph passes through (1,1).','The graph has a y-intercept.'],['x=0 is a vertical asymptote.','y=0 is a horizontal asymptote.','The graph passes through (1,1).'],'The function is undefined at x=0, so it has no y-intercept.',{questionStyle:'conceptual',tags:['reciprocal graph']})],
'SL 2.9':[
  mc('Which point lies on y=2ˣ?',['(0,0)','(0,1)','(1,1)','(2,2)'],'(0,1)','Any non-zero exponential satisfies a⁰=1.',{tags:['exponential graphs']}),
  num('Solve ln x=2. Give x correct to three decimal places.',7.389,'Exponentiating gives x=e²≈7.389.',{calculator:'allowed',tags:['logarithmic equations']},0.001),
  tf('The graph of y=ln x has domain x>0 and vertical asymptote x=0.',true,'Natural logarithm is defined only for positive inputs and tends to −∞ as x approaches 0 from the right.',{questionStyle:'conceptual',tags:['logarithmic graph']})],
'SL 2.10':[
  num('Solve 3x−7=11.',6,'3x=18, so x=6.',{tags:['solving equations']}),
  mc('The equation x³+x=1 is best solved in a live quiz using which method?',['Factorising by grouping','Reading the intersection of y=x³+x and y=1','Taking square roots','Completing the square'],'Reading the intersection of y=x³+x and y=1','The equation has no simple factorization; a graph or numerical solver locates the root.',{calculator:'allowed',questionStyle:'conceptual',tags:['graphical solutions']}),
  order('Order the steps for solving 2^(x)=7 using logarithms.',['Divide by ln 2','Take natural logs of both sides','Write x ln 2=ln 7','State x=ln 7/ln 2'],['Take natural logs of both sides','Write x ln 2=ln 7','Divide by ln 2','State x=ln 7/ln 2'],'Logarithm laws bring the exponent down as a multiplier.',{questionStyle:'procedural',tags:['exponential equations']})],
'SL 2.11':[
  mc('The graph y=f(x−4)+2 is obtained from y=f(x) by which translations?',['4 left and 2 up','4 right and 2 up','4 right and 2 down','2 right and 4 up'],'4 right and 2 up','A change inside f acts oppositely on x; +2 outside shifts upward.',{tags:['graph transformations']}),
  multi('Let y=f(x) contain the point (2,5). Which statements are true for y=3f(x−4)−1?',['The corresponding point is (6,14).','The corresponding point is (−2,14).','The graph is translated 4 units right.','The vertical scale factor is 3.'],['The corresponding point is (6,14).','The graph is translated 4 units right.','The vertical scale factor is 3.'],'The x-coordinate becomes 2+4=6 and the y-coordinate becomes 3(5)−1=14.',{questionStyle:'conceptual',tags:['graph transformations','coordinates']}),
  drag('Classify each expression by its transformation of y=f(x).',['Vertical translation','Horizontal translation','Vertical stretch'],[{text:'f(x)+4',correctZone:'Vertical translation'},{text:'f(x−3)',correctZone:'Horizontal translation'},{text:'2f(x)',correctZone:'Vertical stretch'}],'Changes outside f affect y-values; changes inside f affect x-values.',{questionStyle:'procedural',tags:['graph transformations','classification']})],
'AHL 2.12':[
  mc('The polynomial p(x)=x³−4x²+x+6 has x=2 as a root. Which factorisation is correct?',['(x−2)(x²−2x−3)','(x+2)(x²−6x+3)','(x−2)(x²+2x+3)','(x−3)(x²−x−2)'],'(x−2)(x²−2x−3)','Dividing by x−2 gives x²−2x−3.',{tags:['polynomials','factor theorem']}),
  num('Find the remainder when p(x)=2x³−x+5 is divided by x−2.',19,'By the remainder theorem, the remainder is p(2)=16−2+5=19.',{tags:['remainder theorem']}),
  multi('A monic cubic has roots 1, 2 and −3. Select all true statements.',['The sum of the roots is 0.','The product of the roots is −6.','x−1 is a factor.','Its constant term is −6.'],['The sum of the roots is 0.','The product of the roots is −6.','x−1 is a factor.'],'The polynomial is (x−1)(x−2)(x+3); its constant term is +6.',{questionStyle:'conceptual',tags:['roots','factors']})],
'AHL 2.13':[
  mc('For f(x)=(x+1)/(x²−4), which values are excluded from the domain?',['x=−1 only','x=±2','x=2 only','x=0 and x=4'],'x=±2','x²−4=(x−2)(x+2), so the denominator is zero at ±2.',{tags:['rational functions','domain']}),
  mc('What is the horizontal asymptote of y=(3x²+1)/(x²−5)?',['y=0','y=1','y=3','x=3'],'y=3','The numerator and denominator have equal degree; the leading-coefficient ratio is 3.',{tags:['rational functions','asymptotes']}),
  tf('The function (x²−1)/(x−1) has a vertical asymptote at x=1.',false,'It simplifies to x+1 for x≠1, so x=1 is a removable hole, not a vertical asymptote.',{questionStyle:'misconception',tags:['holes','asymptotes']})],
'AHL 2.14':[
  tf('The function f(x)=x³ is odd.',true,'f(−x)=−x³=−f(x).',{tags:['odd functions']}),
  mc('Which domain restriction makes f(x)=x² invertible while keeping non-negative outputs?',['x≤0 only','x≥0 only','all real x','x≠0'],'x≥0 only','On x≥0 the function is one-to-one and its inverse is √x.',{tags:['domain restriction','inverse functions']}),
  multi('Select all self-inverse functions.',['f(x)=−x','f(x)=1/x on x≠0','f(x)=x+2','f(x)=x³'],['f(x)=−x','f(x)=1/x on x≠0'],'Applying −x twice or taking a reciprocal twice returns x.',{questionStyle:'conceptual',tags:['self-inverse functions']})],
'AHL 2.15':[
  mc('Solve x²≥4.',['−2≤x≤2','x≤−2 or x≥2','x≥−2','x≤2'],'x≤−2 or x≥2','The parabola x²−4 is non-negative outside its roots −2 and 2.',{tags:['quadratic inequalities']}),
  multi('For f(x)=x² and g(x)=2x+3, select every interval on which f(x)≥g(x).',['x≤−1','−1<x<3','x≥3','0≤x≤2'],['x≤−1','x≥3'],'x²−2x−3=(x+1)(x−3) is non-negative outside [−1,3].',{tags:['function inequalities']}),
  order('Order the steps for solving (x−1)(x+4)<0.',['Choose the interval where the product is negative','Mark the critical values −4 and 1','Write the solution −4<x<1','Make a sign chart'],['Mark the critical values −4 and 1','Make a sign chart','Choose the interval where the product is negative','Write the solution −4<x<1'],'Critical values split the number line into intervals with fixed signs.',{questionStyle:'procedural',tags:['inequalities','sign chart']})],
'AHL 2.16':[
  mc('Solve |x−3|=5.',['x=8 only','x=−2 only','x=−2 or x=8','x=2 or x=8'],'x=−2 or x=8','x−3=±5, giving x=8 or x=−2.',{tags:['modulus equations']}),
  multi('For y=|f(x)|, select all true statements.',['Parts of y=f(x) below the x-axis reflect upward.','All y-values are non-negative.','The x-intercepts stay unchanged.','The graph always becomes one-to-one.'],['Parts of y=f(x) below the x-axis reflect upward.','All y-values are non-negative.','The x-intercepts stay unchanged.'],'Absolute value changes negative outputs to positive but does not guarantee one-to-one behaviour.',{questionStyle:'conceptual',tags:['modulus graphs']}),
  mc('Solve |2x−1|<3.',['−1<x<2','x<−1 or x>2','−2<x<1','0<x<2'],'−1<x<2','−3<2x−1<3 gives −2<2x<4 and hence −1<x<2.',{tags:['modulus inequalities']})],
}
