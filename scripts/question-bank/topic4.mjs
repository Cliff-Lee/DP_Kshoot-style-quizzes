import {match,mc,multi,num,order,short,tf} from './helpers.mjs'

export const topic4={
'SL 4.1':[
  mc('A school wants opinions from every year group. Which method best ensures each year is represented?',['Convenience sampling','Stratified sampling by year group','Voluntary response sampling','Sampling only the oldest year'],'Stratified sampling by year group','Stratification samples from each relevant subgroup.',{tags:['sampling','stratified sampling']}),
  multi('Which variables are quantitative?',['Student height','Favourite subject','Number of siblings','Eye colour'],['Student height','Number of siblings'],'Height and counts are numerical; subject and eye colour are categorical.',{tags:['data types']}),
  tf('A large sample automatically removes bias caused by a poorly chosen sampling method.',false,'Increasing sample size reduces random variation but does not correct systematic selection bias.',{questionStyle:'misconception',tags:['sampling bias']})],
'SL 4.2':[
  num('The lower quartile is 18 and the upper quartile is 31. Find the interquartile range.',13,'IQR=Q₃−Q₁=31−18=13.',{tags:['interquartile range']}),
  mc('Which graph is most appropriate for comparing medians and spread across several groups?',['Pie chart','Box plot','Scatter diagram','Tree diagram'],'Box plot','Box plots display median, quartiles, range and potential outliers compactly.',{tags:['box plots','data presentation']}),
  tf('In a histogram with unequal class widths, bar height should represent frequency rather than frequency density.',false,'For unequal widths, area represents frequency, so height must be frequency density.',{questionStyle:'misconception',tags:['histograms','frequency density']})],
'SL 4.3':[
  num('Find the mean of 4, 6, 6, 9, 10.',7,'The total is 35 and 35/5=7.',{tags:['mean']}),
  mc('A dataset has mean 20. Every value is increased by 3. What is the new mean?',['20','23','60','Cannot be determined'],'23','Adding 3 to every observation adds 3 to the mean.',{tags:['summary statistics','transformations']}),
  multi('Select all statistics that are resistant to a single extreme outlier.',['Median','Mean','Interquartile range','Range'],['Median','Interquartile range'],'Median and IQR depend on ranks and central positions rather than extreme magnitudes.',{questionStyle:'conceptual',tags:['outliers','dispersion']})],
'SL 4.4':[
  mc('A Pearson correlation coefficient of r=−0.92 indicates what?',['Strong positive linear association','Strong negative linear association','Weak negative association','No association'],'Strong negative linear association','The magnitude is close to 1 and the sign is negative.',{tags:['correlation']}),
  num('A regression line is y=1.8x+4. Predict y when x=10.',22,'Substitute x=10: y=18+4=22.',{tags:['regression','prediction']}),
  tf('A strong correlation between two variables proves that one causes the other.',false,'Correlation alone does not establish causation; lurking variables may explain the association.',{questionStyle:'misconception',tags:['correlation','causation']})],
'SL 4.5':[
  num('A fair die is rolled 60 times. Find the expected number of sixes.',10,'The expected count is 60(1/6)=10.',{tags:['expected occurrences']}),
  mc('If P(A)=0.37, find P(Aᶜ).',['0.37','0.63','1.37','Cannot be determined'],'0.63','Complementary probabilities sum to 1.',{tags:['complements']}),
  match('Match each experiment to the size of its equally likely sample space.',[{left:'One fair coin toss',right:'2 outcomes'},{left:'Two fair coin tosses',right:'4 outcomes'},{left:'One fair die roll',right:'6 outcomes'}],'List all possible outcomes or multiply independent stage counts.',{questionStyle:'recall',tags:['sample spaces']})],
'SL 4.6':[
  mc('Events A and B satisfy P(A)=0.6, P(B)=0.5 and P(A∩B)=0.2. Find P(A∪B).',['0.3','0.7','0.9','1.3'],'0.9','P(A∪B)=0.6+0.5−0.2=0.9.',{tags:['probability rules']}),
  num('Given P(A∩B)=0.18 and P(B)=0.30, find P(A|B).',0.6,'P(A|B)=0.18/0.30=0.6.',{tags:['conditional probability']}),
  multi('P(A)=0.4, P(B)=0.5 and P(A∩B)=0.2. Select all true statements.',['A and B are independent.','A and B are mutually exclusive.','P(A∪B)=0.7.','P(A|B)=0.4.'],['A and B are independent.','P(A∪B)=0.7.','P(A|B)=0.4.'],'P(A)P(B)=0.2, the union is 0.7, and P(A|B)=0.2/0.5=0.4.',{questionStyle:'conceptual',tags:['independence','conditional probability']})],
'SL 4.7':[
  num('A discrete random variable X has P(X=0)=0.2, P(X=1)=0.5 and P(X=2)=0.3. Find E(X).',1.1,'E(X)=0(0.2)+1(0.5)+2(0.3)=1.1.',{tags:['discrete random variables','expected value']}),
  mc('A probability distribution lists probabilities 0.15, 0.35, k and 0.20. Find k.',['0.20','0.25','0.30','0.70'],'0.30','Probabilities sum to 1, so k=1−0.70=0.30.',{tags:['probability distributions']}),
  tf('The expected value of a discrete random variable must be one of its possible observed values.',false,'An expectation is a weighted long-run average and need not be attainable in one trial.',{questionStyle:'misconception',tags:['expected value']})],
'SL 4.8':[
  mc('Which conditions define a binomial model?',['Fixed trials, two outcomes, constant p, independent trials','Any repeated experiment with a mean','Sampling without replacement from a small group','Outcomes with changing probabilities'],'Fixed trials, two outcomes, constant p, independent trials','These are the four binomial assumptions.',{tags:['binomial distribution','conditions']}),
  num('For X~B(20,0.3), find E(X).',6,'The binomial mean is np=20(0.3)=6.',{tags:['binomial mean']}),
  num('For X~B(10,0.4), find Var(X).',2.4,'Variance=np(1−p)=10(0.4)(0.6)=2.4.',{tags:['binomial variance']})],
'SL 4.9':[
  mc('In a normal distribution, approximately what percentage lies within one standard deviation of the mean?',['50%','68%','95%','99.7%'],'68%','The empirical 68–95–99.7 rule gives about 68%.',{tags:['normal distribution']}),
  num('For X~N(80,12²), find the z-score when X=104.',2,'z=(104−80)/12=2.',{tags:['normal distribution','standardization']}),
  tf('For any normal distribution, the mean, median and mode are equal.',true,'A normal density is symmetric and unimodal about its mean.',{questionStyle:'conceptual',tags:['normal distribution','symmetry']})],
'SL 4.10':[
  mc('To predict x from a measured value of y, which regression line should be used?',['The y-on-x line','The x-on-y line','Either line always gives the same result','The line y=x'],'The x-on-y line','Regression direction must match the variable being predicted.',{tags:['x-on-y regression']}),
  num('An x-on-y regression line is x=0.5y+8. Predict x when y=20.',18,'x=0.5(20)+8=18.',{tags:['regression prediction']}),
  tf('The x-on-y regression line is generally obtained by algebraically rearranging the y-on-x regression line.',false,'The two least-squares regressions minimize different residuals and are not generally rearrangements.',{questionStyle:'misconception',tags:['regression direction']})],
'SL 4.11':[
  num('Given P(A∩B)=0.12 and P(B)=0.30, find P(A|B).',0.4,'P(A|B)=P(A∩B)/P(B)=0.12/0.30=0.4.',{tags:['conditional probability']}),
  mc('Events A and B are independent with P(A)=0.7 and P(B)=0.2. Find P(A∩B).',['0.09','0.14','0.50','0.90'],'0.14','For independent events, multiply probabilities: 0.7(0.2)=0.14.',{tags:['independence']}),
  tf('If events A and B are mutually exclusive and both have positive probability, then they are independent.',false,'Mutually exclusive events have P(A∩B)=0, while independence would require P(A)P(B)>0.',{questionStyle:'misconception',tags:['independence','mutual exclusivity']})],
'SL 4.12':[
  num('A score of 74 comes from a distribution with mean 62 and standard deviation 6. Find its z-score.',2,'z=(74−62)/6=2.',{tags:['z-scores']}),
  mc('A value has z=−1.5. What does this mean?',['It is 1.5 standard deviations below the mean.','It is 1.5 units below zero.','It is 1.5 standard deviations above the mean.','Its probability is −1.5.'],'It is 1.5 standard deviations below the mean.','A negative z-score lies below the mean by that many standard deviations.',{tags:['standardization','interpretation']}),
  num('A normal variable has standard deviation 4. The value 30 has z=2. Find the mean.',22,'2=(30−μ)/4, so 30−μ=8 and μ=22.',{tags:['unknown mean','z-scores']})],
'AHL 4.13':[
  mc('A disease affects 1% of people. A test is 90% sensitive and has a 5% false-positive rate. Which information is needed for P(disease|positive)?',['Bayes’ theorem using both positive pathways','Only the sensitivity','Only the prevalence','The sample mean'],'Bayes’ theorem using both positive pathways','The posterior compares true positives with all positive results.',{tags:['Bayes theorem']}),
  num('Machines A and B make 60% and 40% of items. Their defect rates are 2% and 5%. Find P(B|defect).',0.625,'P(B|D)=0.4(0.05)/[0.6(0.02)+0.4(0.05)]=0.02/0.032=0.625.',{calculator:'allowed',questionStyle:'application',tags:['Bayes theorem','conditional probability']},0.001),
  order('Order the steps in a Bayes calculation.',['Divide the chosen joint probability by the total evidence probability','Compute each pathway joint probability','Identify the prior and conditional probabilities','Add pathways that produce the evidence'],['Identify the prior and conditional probabilities','Compute each pathway joint probability','Add pathways that produce the evidence','Divide the chosen joint probability by the total evidence probability'],'Bayes’ theorem normalizes the desired pathway by all pathways producing the evidence.',{questionStyle:'procedural',tags:['Bayes theorem','method']})],
'AHL 4.14':[
  num('A continuous density is f(x)=kx on 0≤x≤2 and 0 otherwise. Find k.',0.5,'Total area is ∫₀²kx dx=2k=1, so k=0.5.',{tags:['probability density functions']}),
  mc('For a continuous random variable X, what is P(X=3)?',['0','f(3)','1','Cannot be determined'],'0','A single point has zero area under a continuous density.',{tags:['continuous random variables']}),
  num('If E(X)=4 and Var(X)=9, find Var(2X−5).',36,'Var(aX+b)=a²Var(X), so Var(2X−5)=4(9)=36.',{tags:['variance','linear transformations']})],
}
