import {fill,match,mc,multi,num,order,short,tf} from './helpers.mjs'

export const topic1={
'SL 1.1':[
  mc('Write 0.000562 in scientific notation.',['5.62 × 10⁻⁴','5.62 × 10⁻³','56.2 × 10⁻⁴','0.562 × 10⁻³'],'5.62 × 10⁻⁴','Move the decimal four places right to obtain 5.62, so the power is −4.',{tags:['scientific notation']}),
  num('Evaluate (3 × 10⁵)(2 × 10⁻³).',600,'Multiply the coefficients and add the powers: 6 × 10²=600.',{tags:['scientific notation','operations']}),
  tf('The sum 4 × 10³ + 7 × 10³ equals 1.1 × 10⁴.',true,'The powers already match, so the coefficients add: 11 × 10³=1.1 × 10⁴.',{questionStyle:'conceptual',tags:['scientific notation','addition']})],
'SL 1.2':[
  num('The arithmetic sequence 5, 8, 11, … continues. Find its 10th term.',32,'u₁₀=5+9(3)=32.',{tags:['arithmetic sequence']}),
  num('Find the sum of the first 20 terms of 3, 7, 11, … .',820,'The 20th term is 79, so S₂₀=20(3+79)/2=820.',{tags:['arithmetic series']}),
  order('Order the steps used to find the sum of an arithmetic series.',['Substitute into Sₙ=n(a+l)/2','Find the last term','Identify a, d and n','Evaluate the sum'],['Identify a, d and n','Find the last term','Substitute into Sₙ=n(a+l)/2','Evaluate the sum'],'The parameters determine the last term, after which the finite-sum formula can be used.',{questionStyle:'procedural',tags:['arithmetic series','method']})],
'SL 1.3':[
  num('A geometric sequence begins 3, 6, 12, … . Find its 6th term.',96,'u₆=3(2⁵)=96.',{tags:['geometric sequence']}),
  num('Find the sum of the first five terms of 2, 6, 18, … .',242,'S₅=2(3⁵−1)/(3−1)=242.',{tags:['geometric series']}),
  multi('A geometric sequence has first term 8 and common ratio −0.5. Select all true statements.',['Its terms alternate in sign.','Its term magnitudes decrease.','Its fourth term is −1.','Its common difference is −0.5.'],['Its terms alternate in sign.','Its term magnitudes decrease.','Its fourth term is −1.'],'A negative ratio alternates signs; |r|<1 decreases magnitudes; u₄=8(−0.5)³=−1.',{questionStyle:'conceptual',tags:['geometric sequence','common ratio']})],
'SL 1.4':[
  num('A deposit of $1000 earns 5% compound interest per year. Find its value after 2 years.',1102.5,'1000(1.05)²=1102.50.',{calculator:'allowed',questionStyle:'application',tags:['compound interest']}),
  mc('A car worth $20 000 depreciates by 20% each year. What is its value after 3 years?',['$10 240','$12 000','$12 800','$16 000'],'$10 240','The annual multiplier is 0.8, so 20000(0.8)³=10240.',{calculator:'allowed',tags:['depreciation']}),
  tf('A 10% annual depreciation is modelled by multiplying the current value by 0.90 each year.',true,'Depreciating by 10% leaves 90% of the current value.',{questionStyle:'conceptual',tags:['financial models','depreciation']})],
'SL 1.5':[
  mc('Evaluate log₁₀(1000).',['2','3','10','100'],'3','10³=1000, so log₁₀(1000)=3.',{tags:['logarithms']}),
  num('Solve 2ˣ=32.',5,'32=2⁵, so x=5.',{tags:['exponents']}),
  match('Match each exponential equation to its logarithmic equivalent.',[{left:'10²=100',right:'log₁₀(100)=2'},{left:'e³=k',right:'ln(k)=3'},{left:'2⁵=32',right:'log₂(32)=5'}],'A logarithm states the exponent required to produce a given value.',{questionStyle:'conceptual',tags:['exponential form','logarithmic form']})],
'SL 1.6':[
  mc('Which expression proves that the sum of two odd integers is even?',['(2m+1)+(2n+1)=2(m+n+1)','(2m+1)(2n+1)=2mn+1','m+n is even','Two examples are both even'],'(2m+1)+(2n+1)=2(m+n+1)','The result is twice an integer, which is the definition of even.',{tags:['deductive proof','parity']}),
  order('Order the algebraic steps proving (n+1)²−(n−1)²=4n.',['Expand both squares','Start with the left-hand side','Collect like terms','Conclude that the identity holds'],['Start with the left-hand side','Expand both squares','Collect like terms','Conclude that the identity holds'],'Work from one side: n²+2n+1−(n²−2n+1)=4n.',{tags:['algebraic proof','identity']}),
  tf('Checking an identity for ten different integers proves it for every integer.',false,'Examples can support a conjecture but do not prove a universal statement.',{questionStyle:'misconception',tags:['proof','counterexample']})],
'SL 1.7':[
  num('Evaluate 27^(2/3).',9,'The cube root of 27 is 3, and 3²=9.',{tags:['rational exponents']}),
  num('Evaluate log₂(32).',5,'2⁵=32.',{tags:['logarithms']}),
  mc('Solve 3^(x+1)=81.',['2','3','4','5'],'3','Since 81=3⁴, x+1=4 and x=3.',{tags:['exponential equations']})],
'SL 1.8':[
  num('Find the sum to infinity of 12+6+3+… .',24,'The ratio is 1/2, so S∞=12/(1−1/2)=24.',{tags:['infinite geometric series']}),
  mc('For which value of r does a geometric series have a finite sum to infinity?',['r=1.2','r=−1','r=0.8','r=2'],'r=0.8','A geometric series converges when |r|<1.',{tags:['convergence']}),
  multi('Select every convergent infinite geometric series.',['5+2.5+1.25+…','3−6+12−…','8−4+2−…','1+1+1+…'],['5+2.5+1.25+…','8−4+2−…'],'Their ratios are 0.5 and −0.5, both with magnitude below 1.',{questionStyle:'conceptual',tags:['convergence','geometric series']})],
'SL 1.9':[
  mc('Which is the expansion of (1+x)³?',['1+3x+3x²+x³','1+x+x²+x³','1+3x+6x²+x³','1+3x−3x²+x³'],'1+3x+3x²+x³','The coefficients are the third row of Pascal’s triangle: 1,3,3,1.',{tags:['binomial theorem','expansion']}),
  num('Find the coefficient of x³ in (2+x)⁴.',8,'The x³ term is C(4,3)2x³=8x³.',{tags:['binomial expansion']}),
  multi('For the expansion of (x+2)⁴, select all true statements.',['Its degree is 4.','Its constant term is 16.','The coefficient of x³ is 8.','It contains exactly four non-zero terms.'],['Its degree is 4.','Its constant term is 16.','The coefficient of x³ is 8.'],'The expansion is x⁴+8x³+24x²+32x+16, which has five non-zero terms.',{questionStyle:'conceptual',tags:['binomial theorem','interpretation']})],
'AHL 1.10':[
  num('How many ordered two-letter arrangements can be made from 7 distinct letters without repetition?',42,'There are 7P2=7×6=42 arrangements.',{tags:['permutations']}),
  num('Evaluate C(8,3).',56,'C(8,3)=8!/(3!5!)=56.',{tags:['combinations']}),
  mc('What is the coefficient of x² in the expansion of (1+x)⁻²?',['−3','−2','2','3'],'3','The expansion begins 1−2x+3x²−4x³+… .',{tags:['extended binomial theorem']})],
'AHL 1.11':[
  mc('Decompose (5x+1)/(x(x+1)) as A/x+B/(x+1). What are A and B?',['A=1, B=4','A=4, B=1','A=1, B=5','A=−1, B=6'],'A=1, B=4','5x+1=A(x+1)+Bx. Setting x=0 gives A=1, then A+B=5 gives B=4.',{tags:['partial fractions']}),
  num('In (3x+5)/((x+1)(x+2))=A/(x+1)+B/(x+2), find A.',2,'Set x=−1: 2=A, so A=2.',{tags:['partial fractions','cover-up']}),
  match('Match each denominator factor to the required partial-fraction terms.',[{left:'(x−1)(x+2)',right:'A/(x−1)+B/(x+2)'},{left:'(x−1)²',right:'A/(x−1)+B/(x−1)²'},{left:'x(x²+1)',right:'A/x+(Bx+C)/(x²+1)'}],'Linear repeated factors need a term for each power; irreducible quadratics need a linear numerator.',{questionStyle:'conceptual',tags:['partial fractions','decomposition forms']})],
'AHL 1.12':[
  num('Find the modulus of 3+4i.',5,'|3+4i|=√(3²+4²)=5.',{tags:['complex numbers','modulus']}),
  num('Find the real part of (2+i)(1−3i).',5,'The product is 5−5i, so its real part is 5.',{tags:['complex multiplication']}),
  multi('Let z=2−3i. Select all true statements.',['z̄=2+3i','|z|=√13','z+z̄=4','Im(z)=3'],['z̄=2+3i','|z|=√13','z+z̄=4'],'Conjugation changes the sign of the imaginary part; |z|=√(4+9), and z+z̄=4.',{questionStyle:'conceptual',tags:['conjugate','modulus']})],
'AHL 1.13':[
  mc('If |z|=3 and |w|=4, what is |zw|?',['1','7','12','24'],'12','Moduli multiply: |zw|=|z||w|=12.',{tags:['polar form','modulus']}),
  mc('What is the principal argument of 1+i?',['π/6','π/4','π/2','3π/4'],'π/4','The point (1,1) lies at angle π/4 from the positive real axis.',{tags:['argument','complex plane']}),
  fill('Complete Euler’s identity: e^(iπ)=___.','−1',['-1','−1'],'Euler’s formula gives e^(iπ)=cosπ+i sinπ=−1.',{questionStyle:'recall',tags:['Euler form']})],
'AHL 1.14':[
  mc('Using De Moivre’s theorem, (cos θ+i sin θ)³ equals which expression?',['cos(3θ)+i sin(3θ)','3cos θ+3i sin θ','cos(θ³)+i sin(θ³)','cos(3θ)−i sin(3θ)'],'cos(3θ)+i sin(3θ)','De Moivre’s theorem multiplies the argument by the integer power.',{tags:['De Moivre theorem']}),
  mc('Solve z²=−16.',['z=±4','z=±4i','z=4i only','z=±8i'],'z=±4i','Since i²=−1, (±4i)²=−16.',{tags:['complex roots']}),
  multi('Select all true statements about the cube roots of 1.',['There are three distinct roots.','They are equally spaced on the unit circle.','Their arguments differ by 2π/3.','They are all real.'],['There are three distinct roots.','They are equally spaced on the unit circle.','Their arguments differ by 2π/3.'],'The cube roots lie at arguments 0, 2π/3 and 4π/3.',{questionStyle:'conceptual',tags:['roots of unity']})],
'AHL 1.15':[
  mc('Which result is enough to disprove the claim “n²+n+41 is prime for every positive integer n”?',['One value of n that gives a composite number','Ten values of n that give primes','An induction hypothesis','A graph of the expression'],'One value of n that gives a composite number','A single counterexample disproves a universal claim.',{tags:['counterexample','proof']}),
  order('Order the main steps in a proof by mathematical induction.',['Prove the statement for k+1','Assume the statement for k','Verify the base case','Conclude it holds for all required integers'],['Verify the base case','Assume the statement for k','Prove the statement for k+1','Conclude it holds for all required integers'],'Induction requires a base case and a valid implication from k to k+1.',{tags:['mathematical induction']}),
  tf('In a proof by contradiction, one begins by assuming the negation of the statement to be proved.',true,'The negated assumption is shown to lead to an impossibility.',{questionStyle:'recall',tags:['proof by contradiction']})],
'AHL 1.16':[
  num('Solve x+y=5 and x−y=1. Find x.',3,'Adding the equations gives 2x=6, so x=3.',{tags:['simultaneous equations']}),
  mc('The equations x+2y=4 and 2x+4y=8 have how many solutions?',['None','Exactly one','Exactly two','Infinitely many'],'Infinitely many','The second equation is twice the first, so both describe the same line.',{tags:['linear systems','dependent equations']}),
  order('Order these elimination steps for a three-equation linear system.',['Back-substitute to find the remaining variables','Eliminate one variable from two pairs of equations','Solve the resulting two-variable system','Write the equations in aligned form'],['Write the equations in aligned form','Eliminate one variable from two pairs of equations','Solve the resulting two-variable system','Back-substitute to find the remaining variables'],'Systematic elimination reduces the system before back-substitution.',{questionStyle:'procedural',tags:['linear systems','elimination']})],
}
