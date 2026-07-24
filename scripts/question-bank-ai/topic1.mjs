import {fill,match,mc,multi,num,order,short,tf} from '../question-bank/helpers.mjs'

export const aiTopic1={
'SL 1.1':[
  mc('Write 0.0000725 in scientific notation.',['7.25 × 10⁻⁵','7.25 × 10⁻⁴','72.5 × 10⁻⁵','0.725 × 10⁻⁴'],'7.25 × 10⁻⁵','Move the decimal five places right to obtain 7.25, so the exponent is −5.',{tags:['scientific notation']}),
  num('Evaluate (4 × 10⁶)(3 × 10⁻²).',120000,'Multiply 4 by 3 and add the exponents: 12×10⁴=1.2×10⁵=120000.',{tags:['scientific notation','operations']}),
  multi('Select all quantities written in valid scientific notation.',['6.2 × 10⁷','0.45 × 10³','9.01 × 10⁻⁴','12 × 10²'],['6.2 × 10⁷','9.01 × 10⁻⁴'],'The leading number must be at least 1 and less than 10.',{questionStyle:'conceptual',tags:['scientific notation','form']})],
'SL 1.2':[
  num('The arithmetic sequence 14, 19, 24, … continues. Find its 18th term.',99,'u₁₈=14+17(5)=99.',{tags:['arithmetic sequences']}),
  num('A theatre has 22 seats in the first row and 3 more seats in each later row. Find the total number of seats in the first 15 rows.',645,'The last row has 22+14(3)=64 seats, so S₁₅=15(22+64)/2=645.',{questionStyle:'application',tags:['arithmetic series','modelling']}),
  order('A set of measurements is modelled by an arithmetic sequence. Order the steps used to predict the 20th value.',['Substitute n=20','Estimate the common difference','Identify the first value','Evaluate a+19d'],['Identify the first value','Estimate the common difference','Substitute n=20','Evaluate a+19d'],'An arithmetic prediction uses uₙ=a+(n−1)d after estimating a and d.',{questionStyle:'procedural',tags:['arithmetic model','prediction']})],
'SL 1.3':[
  num('A geometric sequence begins 160, 80, 40, … . Find its sixth term.',5,'The ratio is 1/2, so u₆=160(1/2)⁵=5.',{tags:['geometric sequences']}),
  num('Find the sum of the first six terms of 3, 6, 12, … .',189,'S₆=3(2⁶−1)/(2−1)=189.',{tags:['geometric series']}),
  multi('A population model has first value 500 and common ratio 1.08. Select all true statements.',['It represents 8% growth per step.','The values form a geometric sequence.','The third value is 583.2.','The population increases by exactly 40 each step.'],['It represents 8% growth per step.','The values form a geometric sequence.','The third value is 583.2.'],'A constant multiplier of 1.08 gives geometric growth; 500(1.08)²=583.2.',{questionStyle:'conceptual',tags:['geometric models','growth']})],
'SL 1.4':[
  num('An investment of $2400 earns 3.5% compound interest annually. Find its value after 4 years, to the nearest cent.',2754.06,'2400(1.035)⁴≈2754.06.',{calculator:'allowed',questionStyle:'application',tags:['compound interest']},0.01),
  mc('A machine worth $18 000 depreciates by 12% per year. Which expression gives its value after 5 years?',['18000(1.12)⁵','18000(0.88)⁵','18000−5(0.12)','18000(0.12)⁵'],'18000(0.88)⁵','A 12% depreciation leaves a multiplier of 0.88 each year.',{calculator:'neutral',tags:['depreciation','model']}),
  multi('Select all changes that increase the future value of a fixed investment.',['A higher positive interest rate','More compounding periods at the same nominal annual rate','A longer investment time','A higher annual depreciation rate'],['A higher positive interest rate','More compounding periods at the same nominal annual rate','A longer investment time'],'Higher growth, more frequent compounding and more time increase the future value; depreciation reduces it.',{questionStyle:'conceptual',tags:['financial mathematics','interpretation']})],
'SL 1.5':[
  mc('Evaluate ln(e⁴).',['1','4','e⁴','4e'],'4','The natural logarithm and exponential functions are inverses.',{tags:['logarithms']}),
  num('Solve 10ˣ=250, giving x correct to three decimal places.',2.398,'x=log₁₀(250)≈2.398.',{calculator:'allowed',tags:['logarithmic equations']},0.001),
  match('Match each expression to an equivalent value.',[{left:'log₁₀(100)','right':'2'},{left:'ln(e⁻³)','right':'−3'},{left:'5⁰','right':'1'}],'Logarithms return exponents, and every non-zero base raised to zero is 1.',{questionStyle:'conceptual',tags:['exponents','logarithms']})],
'SL 1.6':[
  num('A length is recorded as 8.4 cm correct to the nearest 0.1 cm. Enter its upper bound.',8.45,'Values from 8.35 up to but not including 8.45 round to 8.4.',{tags:['upper bounds','rounding']}),
  num('A mass is measured as 48 g instead of its true value 50 g. Find the percentage error.',4,'Percentage error=|48−50|/50×100=4%.',{tags:['percentage error']}),
  multi('A radius is 2.5 cm correct to the nearest 0.1 cm. Select all true statements.',['The lower bound is 2.45 cm.','The upper bound is 2.55 cm.','The maximum possible area uses radius 2.55 cm.','Every possible radius is at least 2.50 cm.'],['The lower bound is 2.45 cm.','The upper bound is 2.55 cm.','The maximum possible area uses radius 2.55 cm.'],'The interval is 2.45≤r<2.55; the largest possible area is approached using the upper bound.',{questionStyle:'conceptual',tags:['bounds','measurement']})],
'SL 1.7':[
  mc('A loan statement shows a balance of $12 480 immediately before a $520 payment. What is the balance immediately after the payment?',['$11 960','$12 000','$12 480','$13 000'],'$11 960','Subtract the payment: 12480−520=11960.',{questionStyle:'application',tags:['amortization','loan balance']}),
  num('A financial calculator gives an annuity future value of $18 742 after deposits totalling $16 800. How much interest was earned?',1942,'Interest earned is future value minus deposits: 18742−16800=1942.',{calculator:'allowed',questionStyle:'application',tags:['annuities','technology output']}),
  multi('For a fixed-rate repayment loan, select all changes that generally reduce the total interest paid.',['Increase each repayment.','Make repayments more frequently.','Extend the loan term.','Make an extra early repayment.'],['Increase each repayment.','Make repayments more frequently.','Make an extra early repayment.'],'Faster principal reduction lowers later interest; extending the term usually increases total interest.',{questionStyle:'conceptual',tags:['amortization','financial decisions']})],
'SL 1.8':[
  num('Technology solves x+y=11 and 2x−y=4. Find x.',5,'Adding the equations gives 3x=15, so x=5.',{calculator:'allowed',tags:['linear systems']}),
  mc('A graphing tool shows that x³−4x=0 has x-intercepts at −2, 0 and 2. How many real roots does the equation have?',['0','1','2','3'],'3','Each x-intercept represents a real root.',{calculator:'allowed',tags:['polynomial equations','graphical solutions']}),
  tf('If two curves intersect at exactly two points, the equation formed by setting their y-values equal has exactly two displayed real solutions.',true,'Solutions of f(x)=g(x) are the x-coordinates of the intersections.',{questionStyle:'conceptual',tags:['technology','intersections']})],
'AHL 1.9':[
  fill('Complete the logarithm law: ln(xy)=___ for x,y>0.','lnx+lny',['ln x + ln y','ln(x)+ln(y)','lnx + lny'],'The logarithm of a product is the sum of the logarithms.',{tags:['logarithm laws']}),
  num('Given ln x=2 and ln y=5, find ln(x²/y).',-1,'ln(x²/y)=2lnx−lny=4−5=−1.',{tags:['logarithm laws','evaluation']}),
  multi('Select all expressions equal to 3ln x for x>0.',['ln(x³)','lnx+lnx+lnx','ln(3x)','lnx³'],['ln(x³)','lnx+lnx+lnx','lnx³'],'The power law gives ln(x³)=3lnx; ln(3x)=ln3+lnx.',{questionStyle:'conceptual',tags:['logarithm laws','equivalence']})],
'AHL 1.10':[
  num('Evaluate 81^(3/4).',27,'The fourth root of 81 is 3, and 3³=27.',{tags:['rational exponents']}),
  short('Simplify x^(5/2)÷x^(1/2), for x>0.','x²',['x^2','x²'],'Subtract the exponents: x^(5/2−1/2)=x².',{tags:['rational exponents','simplification']}),
  mc('Which expression is equal to x^(−3/2) for x>0?',['1/(x√x)','1/x³','√x/x','−x√x'],'1/(x√x)','x^(3/2)=x√x, and a negative exponent takes the reciprocal.',{questionStyle:'conceptual',tags:['negative rational exponents']})],
'AHL 1.11':[
  num('Find the sum to infinity of 18−6+2−… .',13.5,'The common ratio is −1/3, so S∞=18/[1−(−1/3)]=13.5.',{tags:['infinite geometric series']}),
  num('A ball rebounds to 60% of its previous height. Starting from 5 m, find the total upward distance after the first bounce and all later bounces.',7.5,'The upward heights form 3+1.8+… with sum 3/(1−0.6)=7.5 m.',{questionStyle:'application',tags:['geometric series','bouncing ball']}),
  multi('Select all infinite geometric series that converge.',['4+2+1+…','5−6+7.2−…','9−3+1−…','2+2+2+…'],['4+2+1+…','9−3+1−…'],'Their ratios have magnitude below 1: 0.5 and −1/3.',{questionStyle:'conceptual',tags:['convergence']})],
'AHL 1.12':[
  num('Find the modulus of z=5−12i.',13,'|z|=√(5²+12²)=13.',{tags:['complex numbers','modulus']}),
  short('Write (3+2i)(1−i) in Cartesian form.','5−i',['5-i','5 − i','5-i'],'Expanding gives 3−3i+2i−2i²=5−i.',{tags:['complex multiplication']}),
  multi('Let z=−2+3i. Select all true statements.',['z̄=−2−3i','|z|=√13','Re(z)=−2','Arg(z) lies in quadrant IV.'],['z̄=−2−3i','|z|=√13','Re(z)=−2'],'The point (−2,3) lies in quadrant II, not quadrant IV.',{questionStyle:'conceptual',tags:['conjugate','Argand diagram']})],
'AHL 1.13':[
  mc('What is the principal argument of −1+i?',['π/4','3π/4','−3π/4','5π/4'],'3π/4','The point (−1,1) is in quadrant II with reference angle π/4.',{tags:['polar form','argument']}),
  num('If |z|=4 and |w|=2.5, find |zw|.',10,'Moduli multiply, so |zw|=4(2.5)=10.',{tags:['complex products','modulus']}),
  match('Match the complex operation to its geometric effect.',[{left:'Multiply by 2','right':'Stretch from the origin by factor 2'},{left:'Multiply by i','right':'Rotate anticlockwise by π/2'},{left:'Take the conjugate','right':'Reflect in the real axis'}],'Complex multiplication changes modulus and argument; conjugation reverses the argument.',{questionStyle:'conceptual',tags:['complex geometry','transformations']})],
'AHL 1.14':[
  mc('Let A be 2×3 and B be 3×4. What is the order of AB?',['2×4','3×3','3×4','AB is undefined'],'2×4','The inner dimensions match and the outer dimensions give 2×4.',{tags:['matrix multiplication','order']}),
  num('Find the determinant of the matrix [[4,1],[2,3]].',10,'The determinant is 4(3)−1(2)=10.',{tags:['matrices','determinant']}),
  multi('Select all true statements about square matrices.',['AI=IA=A.','Matrix multiplication is generally non-commutative.','A matrix with determinant 0 has no inverse.','Every square matrix has an inverse.'],['AI=IA=A.','Matrix multiplication is generally non-commutative.','A matrix with determinant 0 has no inverse.'],'Only non-singular square matrices are invertible.',{questionStyle:'conceptual',tags:['matrix properties','inverse']})],
'AHL 1.15':[
  num('Find the larger eigenvalue of the diagonal matrix [[3,0],[0,−2]].',3,'The eigenvalues of a diagonal matrix are its diagonal entries, 3 and −2.',{tags:['eigenvalues']}),
  short('For A=[[2,0],[0,5]], give an eigenvector corresponding to eigenvalue 2.','(1,0)',['(1,0)','(1, 0)','[1,0]','[1, 0]'],'A(1,0)=(2,0)=2(1,0). Any non-zero multiple is also an eigenvector.',{tags:['eigenvectors']}),
  multi('Select all true statements about an eigenvector v with Av=λv.',['The direction of v is unchanged by A.','Its magnitude may be scaled by |λ|.','v must be the zero vector.','If λ<0, its direction is reversed.'],['The direction of v is unchanged by A.','Its magnitude may be scaled by |λ|.','If λ<0, its direction is reversed.'],'Eigenvectors are non-zero invariant directions; a negative eigenvalue reverses orientation.',{questionStyle:'conceptual',tags:['eigenvectors','interpretation']})],
}
