import {match,mc,multi,num,order,short} from './helpers.mjs'

export const extras={
'SL 1.2':[
  mc('A student saves $250 in month 1 and increases the amount by $40 each month. How much is saved over 12 months?',['$3 000','$5 160','$5 640','$8 280'],'$5 640','S₁₂=12[2(250)+11(40)]/2=$5 640.',{difficulty:'extension',questionStyle:'application',calculator:'allowed',estimatedTimeSeconds:90,marksEstimate:3,tags:['arithmetic series','finance']}),
  short('The 5th term of an arithmetic sequence is 18 and the 9th term is 34. Find the common difference.','4',['4'],'Four term-steps increase the value by 16, so d=16/4=4.',{difficulty:'standard',questionStyle:'procedural',tags:['arithmetic sequence']})],
'SL 1.5':[
  num('A population doubles every 3 hours. The model gives 2^(t/3)=10. Find t in hours, correct to three decimal places.',9.966,'Taking logarithms gives t=3ln(10)/ln(2)≈9.966 hours.',{difficulty:'extension',questionStyle:'application',calculator:'allowed',estimatedTimeSeconds:75,marksEstimate:3,tags:['logarithms','exponential models']},0.001)],
'AHL 1.16':[
  match('Match each pair of equations to the number of solutions.',[
    {left:'x+y=4 and 2x+2y=8',right:'Infinitely many solutions'},
    {left:'x+y=4 and 2x+2y=9',right:'No solution'},
    {left:'x+y=4 and x−y=2',right:'One unique solution'},
  ],'Equivalent equations describe the same line, inconsistent parallel equations never meet, and independent lines meet once.',{difficulty:'extension',questionStyle:'conceptual',estimatedTimeSeconds:75,marksEstimate:3,tags:['linear systems','solution classification']})],
'SL 2.9':[
  num('A population is modelled by N(t)=800e^(0.12t), where t is in hours. Find N(6), rounded to the nearest whole number.',1644,'N(6)=800e^0.72≈1643.55, which rounds to 1644.',{difficulty:'extension',questionStyle:'application',calculator:'allowed',estimatedTimeSeconds:60,marksEstimate:2,tags:['exponential models','interpretation']},0.5)],
'SL 2.11':[
  order('For y=2f(x−3)+4, order these transformations from y=f(x).',['Translate up 4','Translate right 3','Stretch vertically by factor 2'],['Translate right 3','Stretch vertically by factor 2','Translate up 4'],'The inside change moves right; output values are then doubled and increased by 4.',{difficulty:'standard',questionStyle:'procedural',tags:['graph transformations','order']}),
  short('The point (1,5) lies on y=f(x). Give its image on y=f(x−2)+3.','(3,8)',['(3, 8)','3,8','3, 8'],'Translate 2 right and 3 up, so (1,5) maps to (3,8).',{difficulty:'extension',questionStyle:'exam_style',tags:['graph transformations','coordinates']})],
'AHL 2.12':[
  num('The polynomial p(x)=x³+ax²−5x+3 has x=1 as a root. Find a.',1,'By the factor theorem p(1)=0, so 1+a−5+3=0 and a=1.',{difficulty:'extension',questionStyle:'exam_style',estimatedTimeSeconds:60,marksEstimate:2,tags:['polynomials','factor theorem']})],
'SL 3.4':[
  match('Match each expression to its meaning.',[{left:'rθ',right:'Arc length'},{left:'½r²θ',right:'Sector area'},{left:'π radians',right:'180°'}],'In radian measure, s=rθ and A=½r²θ.',{difficulty:'standard',questionStyle:'conceptual',tags:['radians','formulae']}),
  mc('A wheel of radius 0.4 m turns through 15 radians. How far does a point on its rim travel?',['3.75 m','6 m','15.4 m','37.5 m'],'6 m','Arc length s=rθ=0.4(15)=6 m.',{difficulty:'extension',questionStyle:'application',calculator:'allowed',tags:['radians','arc length']})],
'SL 3.7':[
  multi('The temperature in a greenhouse is modelled by T(t)=18+6cos(πt/12), where t is measured in hours. Select all true statements.',[
    'The midline temperature is 18°C.',
    'The period is 24 hours.',
    'The minimum temperature is 12°C.',
    'At t=0 the temperature is 18°C.',
  ],['The midline temperature is 18°C.','The period is 24 hours.','The minimum temperature is 12°C.'],'The vertical shift is 18, the amplitude is 6, and the period is 2π÷(π/12)=24. At t=0, T=24°C.',{difficulty:'extension',questionStyle:'application',calculator:'neutral',estimatedTimeSeconds:75,marksEstimate:3,tags:['sinusoidal models','parameter interpretation']})],
'AHL 3.18':[
  num('A line has direction vector (1,2,2) and a plane has normal vector (2,−1,2). Find the acute angle between the line and the plane, in degrees, correct to one decimal place.',26.4,'The angle α between the direction and normal satisfies cosα=4/9, so α≈63.6°. The line-plane angle is 90°−α≈26.4°.',{difficulty:'extension',questionStyle:'exam_style',calculator:'allowed',estimatedTimeSeconds:90,marksEstimate:3,tags:['vectors','line-plane angle']},0.1)],
'SL 4.6':[
  match('Match each probability expression to its interpretation.',[{left:'P(A∩B)',right:'A and B both occur'},{left:'P(A∪B)',right:'A or B or both occur'},{left:'P(A|B)',right:'A occurs given B'}],'Intersection means both, union means at least one, and the vertical bar means given.',{difficulty:'foundation',questionStyle:'recall',tags:['probability notation']}),
  num('A bag contains 3 red and 2 blue counters. Two are drawn without replacement. Find the probability both are red.',0.3,'P(RR)=3/5×2/4=6/20=0.3.',{difficulty:'extension',questionStyle:'application',tags:['tree diagrams','without replacement']},0.001)],
'SL 4.4':[
  multi('For a dataset, Pearson’s correlation coefficient is r=0.82 and the y-on-x regression line is used for prediction. Select all justified statements.',[
    'There is a strong positive linear association.',
    'The value of r proves that increasing x causes y to increase.',
    'A prediction inside the observed x-range is generally safer than a distant extrapolation.',
    'The x-on-y regression line should be used to predict y from x.',
  ],['There is a strong positive linear association.','A prediction inside the observed x-range is generally safer than a distant extrapolation.'],'A large positive r indicates strong positive linear association, not causation. Predict y from x with the y-on-x line and avoid unsupported extrapolation.',{difficulty:'extension',questionStyle:'conceptual',calculator:'neutral',estimatedTimeSeconds:75,marksEstimate:3,tags:['correlation','regression','extrapolation']})],
'AHL 4.14':[
  num('A continuous random variable has density f(x)=2x for 0≤x≤1. Find its median, correct to three decimal places.',0.707,'The median m satisfies ∫₀ᵐ2x dx=m²=0.5, so m=√0.5≈0.707.',{difficulty:'extension',questionStyle:'exam_style',calculator:'allowed',estimatedTimeSeconds:75,marksEstimate:3,tags:['probability density','median']},0.001)],
'SL 5.8':[
  match('Match each derivative sign pattern to the stationary-point classification.',[{left:'f′ changes + to −',right:'Local maximum'},{left:'f′ changes − to +',right:'Local minimum'},{left:'f′ does not change sign',right:'Stationary inflexion possible'}],'The first-derivative sign change determines local behaviour.',{difficulty:'standard',questionStyle:'conceptual',tags:['stationary points']}),
  num('A closed square-based box has volume 32 cm³. Its surface area is S(x)=2x²+128/x, where x is the base side. Find the positive stationary value of x.',3.174802,'S′(x)=4x−128/x²=0 gives x³=32 and x=∛32≈3.174802.',{difficulty:'extension',questionStyle:'application',calculator:'allowed',estimatedTimeSeconds:120,marksEstimate:4,tags:['optimization','surface area']},0.00001)],
'SL 5.9':[
  num('A particle has displacement s(t)=t³−3t² metres for 0≤t≤4. Find the total distance travelled in metres.',24,'The velocity 3t(t−2) changes sign at t=2. Since s(0)=0, s(2)=−4 and s(4)=16, the distance is 4+20=24 m.',{difficulty:'extension',questionStyle:'exam_style',calculator:'not_allowed',estimatedTimeSeconds:90,marksEstimate:4,tags:['kinematics','total distance']})],
'AHL 5.18':[
  num('A quantity satisfies dy/dx=−0.4y with y(0)=100. Find y(5), correct to three decimal places.',13.534,'The solution is y=100e^(−0.4x), so y(5)=100e^(−2)≈13.534.',{difficulty:'extension',questionStyle:'application',calculator:'allowed',estimatedTimeSeconds:75,marksEstimate:3,tags:['differential equations','exponential decay']},0.001)],
}
