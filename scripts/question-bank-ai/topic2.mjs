import {match,mc,multi,num,order,short,tf} from '../question-bank/helpers.mjs'

export const aiTopic2={
'SL 2.1':[
  num('Find the gradient of the line through (−2,5) and (4,−1).',-1,'m=(−1−5)/(4−(−2))=−6/6=−1.',{tags:['straight lines','gradient']}),
  short('Find the equation of the line with gradient 3 through (2,−1).','y=3x−7',['y=3x-7','y = 3x − 7','3x-y=7'],'Using y+1=3(x−2) gives y=3x−7.',{tags:['straight lines','equations']}),
  multi('For the line 2x−5y=10, select all true statements.',['Its gradient is 2/5.','Its y-intercept is −2.','Its x-intercept is 5.','It is perpendicular to y=(2/5)x+1.'],['Its gradient is 2/5.','Its y-intercept is −2.','Its x-intercept is 5.'],'Rearranging gives y=(2/5)x−2; a perpendicular line would have gradient −5/2.',{questionStyle:'conceptual',tags:['line features']})],
'SL 2.2':[
  mc('What is the domain of f(x)=√(x−4)?',['x≥4','x>0','x≤4','All real x'],'x≥4','The expression under the square root must be non-negative.',{tags:['functions','domain']}),
  short('Find f⁻¹(x) for f(x)=5x−2.','(x+2)/5',['(x+2)/5','(x + 2) / 5','0.2(x+2)'],'Swap x and y in y=5x−2 and solve for y.',{tags:['inverse functions']}),
  tf('The inverse of a one-to-one function is its reflection in the line y=x.',true,'Swapping input and output coordinates reflects the graph in y=x.',{questionStyle:'conceptual',tags:['inverse functions','graphs']})],
'SL 2.3':[
  mc('A graphing tool displays y=−2x²+8. What is the y-intercept?',['−2','0','4','8'],'8','Set x=0 to obtain y=8.',{calculator:'allowed',tags:['graphing','intercepts']}),
  num('For f(x)=x³−4x, find f(2).',0,'f(2)=8−8=0.',{tags:['function values','graphs']}),
  match('Match each function to its characteristic graph shape.',[{left:'y=3ˣ','right':'Increasing exponential curve'},{left:'y=1/x','right':'Two reciprocal branches'},{left:'y=|x|','right':'V-shaped graph'}],'Parent-function shapes support graph identification and modelling.',{questionStyle:'conceptual',tags:['parent functions','graph shape']})],
'SL 2.4':[
  num('The graphs y=x² and y=3x+4 intersect when x²−3x−4=0. Find the positive x-coordinate of intersection.',4,'x²−3x−4=(x−4)(x+1), so the positive solution is 4.',{tags:['graph intersections']}),
  mc('For y=−(x−5)²+12, what is the maximum value?',['−5','5','12','17'],'12','The vertex is (5,12) and the graph opens downward.',{tags:['graph features','maximum']}),
  multi('A graph has x-intercepts −2 and 6 and a local minimum at (2,−9). Select all true statements.',['f(−2)=0.','f(6)=0.','The minimum value is −9.','The y-intercept must be 0.'],['f(−2)=0.','f(6)=0.','The minimum value is −9.'],'Intercepts and extrema give function values; the y-intercept is not determined by this information alone.',{questionStyle:'conceptual',tags:['graph interpretation']})],
'SL 2.5':[
  mc('Data increase by approximately the same percentage in each time interval. Which model is most appropriate?',['Linear','Quadratic','Exponential','Inverse variation'],'Exponential','A nearly constant multiplicative change indicates exponential behaviour.',{tags:['model selection']}),
  num('A taxi fare is modelled by C(d)=4.5+1.8d, where d is distance in km. Find the cost of a 12 km trip.',26.1,'C(12)=4.5+1.8(12)=26.1.',{questionStyle:'application',tags:['linear models','interpretation']}),
  match('Match each model feature to the most suitable family.',[{left:'Constant first differences','right':'Linear model'},{left:'Constant second differences','right':'Quadratic model'},{left:'Constant ratios','right':'Exponential model'}],'Differences and ratios help distinguish common model families.',{questionStyle:'conceptual',tags:['model selection','data patterns']})],
'SL 2.6':[
  mc('A height model is fitted using data for children aged 5 to 15. Which prediction is the least reliable?',['Height at age 10','Height at age 12','Height at age 14','Height at age 35'],'Height at age 35','Age 35 is far outside the observed domain, so this is unsupported extrapolation.',{tags:['modelling','extrapolation']}),
  num('A linear model y=ax+b passes through (2,7) and (6,19). Find a.',3,'a=(19−7)/(6−2)=3.',{tags:['model parameters']}),
  multi('Select all questions that should be checked before accepting a model.',['Does its domain make sense in context?','Are the residuals reasonably small and pattern-free?','Does it predict impossible values?','Does it have the longest formula?'],['Does its domain make sense in context?','Are the residuals reasonably small and pattern-free?','Does it predict impossible values?'],'Model quality depends on fit, domain and contextual reasonableness, not formula length.',{questionStyle:'conceptual',tags:['model validation','residuals']})],
'AHL 2.7':[
  num('Let f(x)=x+4 and g(x)=x². Find (g∘f)(3).',49,'f(3)=7, then g(7)=49.',{tags:['composite functions']}),
  short('Find the inverse of f(x)=(x−1)/3.','3x+1',['3x+1','3x + 1'],'From y=(x−1)/3, swap x and y and solve: y=3x+1.',{tags:['inverse functions']}),
  tf('For invertible f and g, (f∘g)⁻¹=g⁻¹∘f⁻¹.',true,'Inverse operations undo the composition in reverse order.',{questionStyle:'conceptual',tags:['inverse composition']})],
'AHL 2.8':[
  mc('The graph y=f(x+3)−2 is obtained from y=f(x) by which translation?',['3 right and 2 up','3 left and 2 down','3 right and 2 down','2 left and 3 down'],'3 left and 2 down','The inside +3 shifts left; −2 outside shifts down.',{tags:['graph transformations']}),
  short('The point (4,−1) lies on y=f(x). Give its image on y=2f(x−3)+5.','(7,3)',['(7,3)','(7, 3)','7,3'],'The x-coordinate shifts right to 7 and the y-coordinate becomes 2(−1)+5=3.',{tags:['graph transformations','coordinates']}),
  multi('For y=−f(2x)+4, select all true statements.',['There is a reflection in the x-axis.','There is a horizontal compression by factor 1/2.','There is a translation up 4.','There is a vertical stretch by factor 2.'],['There is a reflection in the x-axis.','There is a horizontal compression by factor 1/2.','There is a translation up 4.'],'The coefficient inside f changes horizontal scale; the outside minus reflects outputs.',{questionStyle:'conceptual',tags:['combined transformations']})],
'AHL 2.9':[
  mc('A population approaches a limiting value as time increases. Which model is most appropriate?',['Linear','Logistic','Quadratic','Direct variation'],'Logistic','A logistic model levels off at its carrying capacity.',{tags:['logistic models','model selection']}),
  num('A radioactive sample follows M(t)=80(0.5)^(t/6). Find M after 18 hours.',10,'After three half-lives, M=80(0.5)³=10.',{questionStyle:'application',tags:['half-life','exponential models']}),
  multi('For L(t)=500/(1+9e^(−0.4t)), select all true statements.',['The carrying capacity is 500.','The initial value is 50.','The model is logistic.','The population grows without bound.'],['The carrying capacity is 500.','The initial value is 50.','The model is logistic.'],'L(0)=500/(1+9)=50, and the horizontal limiting value is 500.',{questionStyle:'conceptual',calculator:'allowed',tags:['logistic models','parameters']})],
'AHL 2.10':[
  mc('If y=abˣ, which plot is linear?',['y against x²','ln y against x','y against ln x','1/y against x'],'ln y against x','Taking logarithms gives ln y=ln a+x ln b, a straight line.',{tags:['linearization','semi-log plots']}),
  num('A plot of ln y against x has gradient 0.7. For y=abˣ, find b correct to three decimal places.',2.014,'The gradient is ln b, so b=e^0.7≈2.014.',{calculator:'allowed',tags:['linearization','parameter estimation']},0.001),
  multi('Select all true statements about a log-log plot of y=axᵏ.',['Its gradient is k.','Its vertical intercept is log a.','A straight line supports a power model.','Its gradient is always a.'],['Its gradient is k.','Its vertical intercept is log a.','A straight line supports a power model.'],'Taking logs gives log y=log a+k log x.',{questionStyle:'conceptual',tags:['log-log plots','power models']})],
}
