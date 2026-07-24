import {drag,fill,match,mc,multi,num,order,short,tf} from './helpers.mjs'

export const topic3={
'SL 3.1':[
  num('Find the distance from (0,0,0) to (3,4,12).',13,'Distance=√(3²+4²+12²)=√169=13.',{tags:['3D geometry','distance']}),
  short('Find the midpoint of (2,−1,4) and (6,3,10).','(4,1,7)',['(4, 1, 7)','4,1,7','4, 1, 7'],'Average corresponding coordinates.',{tags:['3D geometry','midpoint']}),
  tf('If a line is perpendicular to a plane, it is perpendicular to every line lying in that plane.',false,'It is perpendicular to every line in the plane that passes through the foot of the perpendicular, not every line anywhere in the plane.',{questionStyle:'misconception',tags:['lines and planes']})],
'SL 3.2':[
  num('A right triangle has legs 6 cm and 8 cm. Find its hypotenuse.',10,'By Pythagoras, c=√(6²+8²)=10.',{tags:['right triangles']}),
  num('Two sides of a triangle are 5 cm and 7 cm with included angle 60°. Find the area in cm².',15.155,'Area=½(5)(7)sin60°≈15.155.',{calculator:'allowed',questionStyle:'exam_style',tags:['triangle area']},0.001),
  mc('Which rule should be used first when three side lengths of a non-right triangle are known and one angle is required?',['Sine rule','Cosine rule','Tangent ratio','Pythagoras only'],'Cosine rule','The cosine rule relates three sides directly to an angle.',{questionStyle:'conceptual',tags:['cosine rule']})],
'SL 3.3':[
  num('From a point 20 m from a vertical tower, the angle of elevation to its top is 45°. Find the tower height in metres.',20,'tan45°=h/20=1, so h=20.',{questionStyle:'application',tags:['angle of elevation']}),
  mc('A bearing of 135° is measured from which direction and in which sense?',['From north, clockwise','From north, anticlockwise','From east, clockwise','From south, clockwise'],'From north, clockwise','Three-figure bearings are measured clockwise from north.',{tags:['bearings']}),
  tf('An angle of depression from a horizontal line equals the corresponding angle of elevation because the horizontal lines are parallel.',true,'Alternate interior angles are equal.',{questionStyle:'conceptual',tags:['elevation','depression']})],
'SL 3.4':[
  num('A sector has radius 6 cm and angle 1.2 radians. Find its arc length in centimetres.',7.2,'s=rθ=6(1.2)=7.2.',{tags:['radians','arc length']}),
  num('A sector has radius 4 m and angle 1.5 radians. Find its area in m².',12,'Area=½r²θ=½(16)(1.5)=12.',{tags:['radians','sector area']}),
  fill('Complete the conversion: 150°=___ radians.','5π/6',['5pi/6','5π/6','(5π)/6'],'Multiply degrees by π/180: 150π/180=5π/6.',{questionStyle:'procedural',tags:['radian conversion']})],
'SL 3.5':[
  mc('Find the exact value of sin(π/6).',['0','1/2','√2/2','√3/2'],'1/2','The unit-circle point at π/6 has y-coordinate 1/2.',{tags:['unit circle','exact values']}),
  multi('Select all angles θ in 0≤θ≤2π for which cosθ=0.',['0','π/2','π','3π/2'],['π/2','3π/2'],'Cosine is the x-coordinate on the unit circle and is zero on the vertical axis.',{tags:['unit circle','cosine']}),
  tf('Using the sine rule with two sides and a non-included angle can sometimes produce two possible triangles.',true,'The ambiguous case occurs because sinθ=sin(π−θ).',{questionStyle:'conceptual',tags:['ambiguous case','sine rule']})],
'SL 3.6':[
  fill('Complete the identity: sin²θ+cos²θ=___.','1',['1'],'This is the fundamental Pythagorean identity.',{tags:['trigonometric identities']}),
  mc('Which expression is equal to sin(2θ)?',['2sinθ cosθ','sin²θ−cos²θ','2sinθ','sinθ+cosθ'],'2sinθ cosθ','The sine double-angle identity is sin2θ=2sinθcosθ.',{tags:['double-angle identities']}),
  mc('If tanθ=3/4 and θ is acute, find sinθ.',['3/4','4/5','3/5','5/3'],'3/5','A 3-4-5 triangle gives opposite/hypotenuse=3/5.',{tags:['trigonometric ratios','identity']})],
'SL 3.7':[
  mc('For y=3sin(2x)−1, what is the amplitude?',['1','2','3','4'],'3','Amplitude is the absolute value of the coefficient of sine.',{tags:['circular functions','amplitude']}),
  mc('What is the period of y=cos(3x)?',['2π','3π','2π/3','π/3'],'2π/3','For cos(bx), period=2π/|b|.',{tags:['circular functions','period']}),
  multi('For h(t)=2sin(πt/6)+5, select all true statements.',['The midline is h=5.','The amplitude is 2.','The period is 12.','The maximum value is 5.'],['The midline is h=5.','The amplitude is 2.','The period is 12.'],'The maximum is 7; period=2π/(π/6)=12.',{questionStyle:'conceptual',tags:['sinusoidal models']})],
'SL 3.8':[
  multi('Solve sinx=1/2 for 0≤x≤2π.',['π/6','5π/6','7π/6','11π/6'],['π/6','5π/6'],'Sine is positive in quadrants I and II with reference angle π/6.',{tags:['trigonometric equations']}),
  mc('Solve 2cos²x−1=0 for 0≤x≤π.',['x=π/4 only','x=3π/4 only','x=π/4 or 3π/4','x=0 or π'],'x=π/4 or 3π/4','cos²x=1/2, so cosx=±√2/2.',{tags:['quadratic trigonometric equations']}),
  tf('If tanx=1, then every solution is x=π/4+2kπ.',false,'Tangent has period π, so x=π/4+kπ.',{questionStyle:'misconception',tags:['trigonometric equations','periodicity']})],
'AHL 3.9':[
  mc('If cosθ=4/5, what is secθ?',['4/5','5/4','3/5','5/3'],'5/4','secθ=1/cosθ.',{tags:['reciprocal trigonometry']}),
  mc('What is the principal range of arccos x?',['[−π/2,π/2]','[0,π]','[0,2π]','(−π,π)'],'[0,π]','Restricting cosine to [0,π] makes it one-to-one.',{tags:['inverse trigonometry']}),
  multi('Select all identities that are true wherever defined.',['1+tan²x=sec²x','1+cot²x=csc²x','secx=1/sinx','cotx=cosx/sinx'],['1+tan²x=sec²x','1+cot²x=csc²x','cotx=cosx/sinx'],'secx=1/cosx, not 1/sinx.',{questionStyle:'conceptual',tags:['reciprocal identities']})],
'AHL 3.10':[
  mc('Which expression equals sin(A+B)?',['sinA cosB+cosA sinB','sinA sinB+cosA cosB','sinA cosB−cosA sinB','cosA cosB−sinA sinB'],'sinA cosB+cosA sinB','This is the sine compound-angle identity.',{tags:['compound-angle identities']}),
  num('Given tanA=1/2 and tanB=1/3, find tan(A+B).',1,'tan(A+B)=(1/2+1/3)/(1−1/6)=(5/6)/(5/6)=1.',{tags:['tangent compound angle']}),
  tf('cos(A−B)=cosA cosB−sinA sinB.',false,'cos(A−B)=cosAcosB+sinAsinB; the minus sign belongs to cos(A+B).',{questionStyle:'misconception',tags:['compound-angle identities']})],
'AHL 3.11':[
  mc('Which identity expresses the odd symmetry of sine?',['sin(−x)=sinx','sin(−x)=−sinx','sin(π−x)=−sinx','sin(x+π)=sinx'],'sin(−x)=−sinx','Sine is an odd function.',{tags:['trigonometric symmetry']}),
  multi('Select all true symmetry relationships.',['cos(−x)=cosx','sin(π−x)=sinx','cos(π−x)=−cosx','tan(−x)=tanx'],['cos(−x)=cosx','sin(π−x)=sinx','cos(π−x)=−cosx'],'Tangent is odd, so tan(−x)=−tanx.',{tags:['trigonometric symmetry']}),
  match('Match each function to a distinguishing symmetry property.',[{left:'sinx',right:'Odd with period 2π'},{left:'cosx',right:'Even with y-axis symmetry'},{left:'tanx',right:'Odd with period π'}],'Sine and tangent are odd, cosine is even, and tangent has the shorter period.',{questionStyle:'conceptual',tags:['odd and even trig functions']})],
'AHL 3.12':[
  short('Find the displacement vector from A(1,2,−1) to B(4,−2,5).','(3,−4,6)',['(3,-4,6)','(3, −4, 6)','3,-4,6'],'B−A=(4−1,−2−2,5−(−1))=(3,−4,6).',{tags:['vectors','displacement']}),
  num('Find the magnitude of vector (2,−3,6).',7,'Magnitude=√(4+9+36)=7.',{tags:['vectors','magnitude']}),
  multi('Let a=(1,2) and b=(−3,4). Select all true statements.',['a+b=(−2,6)','2a=(2,4)','a−b=(4,−2)','b−a=(−2,2)'],['a+b=(−2,6)','2a=(2,4)','a−b=(4,−2)'],'Vector operations are performed component by component.',{questionStyle:'conceptual',tags:['vector operations']})],
'AHL 3.13':[
  num('Find (2,−1,3)·(4,2,0).',6,'The scalar product is 2(4)+(−1)(2)+3(0)=6.',{tags:['scalar product']}),
  mc('If non-zero vectors a and b satisfy a·b=0, what follows?',['They are parallel','They are perpendicular','They have equal magnitude','They point in opposite directions'],'They are perpendicular','a·b=|a||b|cosθ=0 implies cosθ=0.',{tags:['scalar product','perpendicular vectors']}),
  num('Find the angle in degrees between (1,0) and (1,1).',45,'cosθ=1/(1·√2)=1/√2, so θ=45°.',{calculator:'allowed',tags:['angle between vectors']},0.01)],
'AHL 3.14':[
  mc('Which vector equation describes the line through (1,2,3) parallel to (2,−1,4)?',['r=(1,2,3)+λ(2,−1,4)','r=(2,−1,4)+λ(1,2,3)','r=λ(3,1,7)','r=(1,2,3)·(2,−1,4)'],'r=(1,2,3)+λ(2,−1,4)','A line is a fixed position vector plus a scalar multiple of its direction.',{tags:['vector line equations']}),
  num('A particle has r=(1,2)+t(3,−1). Find its x-coordinate when t=4.',13,'x=1+3(4)=13.',{tags:['vector kinematics']}),
  tf('Multiplying a line’s direction vector by −2 changes the geometric line.',false,'Any non-zero scalar multiple gives the same direction line.',{questionStyle:'misconception',tags:['vector lines','direction vectors']})],
'AHL 3.15':[
  mc('Two lines have direction vectors (1,2,−1) and (−2,−4,2). What is their directional relationship?',['Perpendicular','Parallel','Skew','Intersecting at the origin'],'Parallel','The second direction vector is −2 times the first.',{tags:['relationships between lines']}),
  tf('Two non-parallel lines in three dimensions must intersect.',false,'Non-parallel lines in 3D can be skew.',{tags:['skew lines']}),
  order('Order the steps for testing whether two vector lines intersect.',['Check the third coordinate for consistency','Equate corresponding coordinates','Solve two equations for the parameters','State whether a common point exists'],['Equate corresponding coordinates','Solve two equations for the parameters','Check the third coordinate for consistency','State whether a common point exists'],'All three coordinate equations must hold for the same parameter values.',{questionStyle:'procedural',tags:['line intersections']})],
'AHL 3.16':[
  short('Find i×j.','k',['k','(0,0,1)','(0, 0, 1)'],'The standard right-handed basis satisfies i×j=k.',{tags:['vector product']}),
  num('Find the magnitude of (1,0,0)×(0,3,0).',3,'The vectors are perpendicular, so |a×b|=|a||b|=3.',{tags:['vector product','area']}),
  multi('Select all true statements about a×b.',['It is perpendicular to a.','It is perpendicular to b.','Its magnitude is |a||b|sinθ.','a×b=b×a.'],['It is perpendicular to a.','It is perpendicular to b.','Its magnitude is |a||b|sinθ.'],'The vector product is anti-commutative: b×a=−a×b.',{questionStyle:'conceptual',tags:['vector product','properties']})],
'AHL 3.17':[
  mc('Which is a normal vector to the plane 2x−3y+z=7?',['(2,−3,1)','(2,3,1)','(7,0,0)','(1,1,1)'],'(2,−3,1)','The Cartesian coefficients give a normal vector.',{tags:['plane equations','normal vector']}),
  num('Does the point (1,2,3) lie on x+2y−z=2? Enter 1 for yes or 0 for no.',1,'1+2(2)−3=2, so the point lies on the plane.',{tags:['planes','point test']}),
  match('Match each plane form to its characteristic data.',[{left:'r=a+λu+μv',right:'Point and two directions'},{left:'r·n=d',right:'Normal vector'},{left:'Ax+By+Cz=D',right:'Cartesian coefficients'}],'Each form exposes different geometric information about the plane.',{questionStyle:'conceptual',tags:['plane equations']})],
'AHL 3.18':[
  mc('A line has direction d and a plane has normal n. The line is parallel to the plane when which condition holds?',['d·n=0','d×n=0','d=n','|d|=|n|'],'d·n=0','A direction parallel to a plane is perpendicular to its normal.',{tags:['line-plane angle']}),
  num('Find the acute angle in degrees between planes with normals (1,0,0) and (1,1,0).',45,'The angle between planes is the acute angle between normals: cosθ=1/√2.',{calculator:'allowed',questionStyle:'exam_style',tags:['angle between planes']},0.01),
  tf('The direction of the line of intersection of two non-parallel planes is parallel to the cross product of their normals.',true,'n₁×n₂ is perpendicular to both normals and therefore lies in both planes.',{questionStyle:'conceptual',tags:['plane intersections']})],
}
