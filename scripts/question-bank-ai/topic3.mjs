import {drag,match,mc,multi,num,order,short,tf} from '../question-bank/helpers.mjs'

export const aiTopic3={
'SL 3.1':[
  num('Find the distance between (1,2,3) and (4,6,3).',5,'Distance=√[(4−1)²+(6−2)²+(3−3)²]=5.',{tags:['3D geometry','distance']}),
  short('Find the midpoint of (−2,4,6) and (8,0,−2).','(3,2,2)',['(3,2,2)','(3, 2, 2)','3,2,2'],'Average corresponding coordinates to get (3,2,2).',{tags:['3D geometry','midpoint']}),
  mc('A closed cylinder has radius 3 cm and height 10 cm. Which expression gives its total surface area?',['30π','60π','78π','90π'],'78π','Total surface area=2πr²+2πrh=18π+60π=78π.',{questionStyle:'application',tags:['surface area','cylinder']})],
'SL 3.2':[
  num('A right triangle has hypotenuse 13 cm and one leg 5 cm. Find the other leg.',12,'By Pythagoras, the other leg is √(13²−5²)=12.',{tags:['Pythagoras']}),
  num('Two sides of a triangle are 8 cm and 11 cm with included angle 50°. Find its area in cm², correct to one decimal place.',33.7,'Area=½(8)(11)sin50°≈33.7 cm².',{calculator:'allowed',tags:['triangle area']},0.1),
  mc('A triangle has sides 7, 9 and 12. Which rule directly finds the angle opposite side 12?',['Sine rule','Cosine rule','Tangent ratio','Arc-length formula'],'Cosine rule','All three sides are known, so the cosine rule directly finds an angle.',{questionStyle:'conceptual',tags:['cosine rule','method selection']})],
'SL 3.3':[
  num('From a point 30 m from a tower, the angle of elevation to the top is 38°. Find the tower height, to one decimal place.',23.4,'h=30tan38°≈23.4 m.',{calculator:'allowed',questionStyle:'application',tags:['angle of elevation']},0.1),
  mc('A ship travels on a bearing of 225°. In which general direction is it moving?',['North-east','South-east','South-west','North-west'],'South-west','Bearings are measured clockwise from north; 225° points south-west.',{tags:['bearings']}),
  tf('The angle of depression from a horizontal line equals the corresponding angle of elevation because the horizontals are parallel.',true,'The two angles are alternate interior angles.',{questionStyle:'conceptual',tags:['elevation','depression']})],
'SL 3.4':[
  num('A circle has radius 9 cm. Find the arc length subtended by 80°, correct to two decimal places.',12.57,'Arc length=(80/360)(2π·9)=4π≈12.57 cm.',{calculator:'allowed',tags:['arc length','degrees']},0.01),
  num('A sector has radius 6 m and central angle 120°. Find its area as a coefficient of π.',12,'Area=(120/360)π(6²)=12π, so the coefficient is 12.',{tags:['sector area','degrees']}),
  match('Match each central angle to its fraction of a full circle.',[{left:'90°','right':'1/4'},{left:'120°','right':'1/3'},{left:'225°','right':'5/8'}],'Divide each angle by 360°.',{questionStyle:'conceptual',tags:['sectors','angle fractions']})],
'SL 3.5':[
  mc('What is the gradient of the perpendicular bisector of the segment joining (0,0) and (4,2)?',['2','1/2','−2','−1/2'],'−2','The segment gradient is 1/2, so the perpendicular gradient is −2.',{tags:['perpendicular bisectors']}),
  short('Find the equation of the perpendicular bisector of the segment from (0,0) to (6,0).','x=3',['x=3','x = 3'],'The midpoint is (3,0) and the segment is horizontal, so its perpendicular bisector is vertical.',{tags:['perpendicular bisectors','equations']}),
  multi('Point P lies on the perpendicular bisector of AB. Select all statements that must be true.',['PA=PB.','P is the midpoint of AB.','P is equidistant from A and B.','∠APB=90° in every case.'],['PA=PB.','P is equidistant from A and B.'],'The perpendicular bisector is the locus of points equidistant from the segment endpoints.',{questionStyle:'conceptual',tags:['loci','perpendicular bisectors']})],
'SL 3.6':[
  mc('Sites A=(0,0) and B=(8,0) share a Voronoi edge. Which point lies on their boundary?',['(2,0)','(4,3)','(6,0)','(8,4)'],'(4,3)','The boundary is the perpendicular bisector x=4; every point on it is equally distant from A and B.',{tags:['Voronoi diagrams','boundaries']}),
  num('Two Voronoi sites are (2,1) and (10,1). Enter the x-coordinate of their perpendicular-bisector boundary.',6,'The midpoint x-coordinate is (2+10)/2=6, and the boundary is x=6.',{tags:['Voronoi diagrams','perpendicular bisector']}),
  multi('Select all true statements about a Voronoi diagram.',['Every point in a cell is closest to that cell’s site.','An edge contains points equidistant from two neighbouring sites.','A vertex can be equidistant from three or more sites.','Every cell must be a triangle.'],['Every point in a cell is closest to that cell’s site.','An edge contains points equidistant from two neighbouring sites.','A vertex can be equidistant from three or more sites.'],'Voronoi cells can have many polygonal shapes; edges and vertices represent equal-distance boundaries.',{questionStyle:'conceptual',tags:['Voronoi diagrams','interpretation']})],
'AHL 3.7':[
  num('Convert 210° to radians by entering the coefficient of π.',1.166667,'210°×π/180°=7π/6, whose coefficient is 7/6≈1.166667.',{tags:['radians','conversion']},0.00001),
  num('A wheel of radius 0.75 m turns through 8 radians. How far does a point on its rim travel?',6,'Arc length=rθ=0.75(8)=6 m.',{tags:['radians','arc length']}),
  mc('A sector has radius r and angle θ radians. Which expression gives its area?',['rθ','2rθ','½r²θ','πr²θ'],'½r²θ','For θ in radians, sector area is ½r²θ.',{questionStyle:'conceptual',tags:['radians','sector area']})],
'AHL 3.8':[
  mc('Find the exact value of cos(2π/3).',['−1','−1/2','1/2','√3/2'],'−1/2','The unit-circle x-coordinate at 120° is −1/2.',{tags:['unit circle','exact values']}),
  multi('Solve sinx=−√2/2 for 0≤x<2π.',['π/4','3π/4','5π/4','7π/4'],['5π/4','7π/4'],'Sine is negative in quadrants III and IV with reference angle π/4.',{tags:['trigonometric equations']}),
  tf('The equation cosx=cos(−x) illustrates that cosine is an even function.',true,'Cosine is symmetric about the y-axis, so cos(−x)=cosx.',{questionStyle:'conceptual',tags:['trigonometric symmetry']})],
'AHL 3.9':[
  mc('Which matrix represents a reflection in the y-axis?',['[[−1,0],[0,1]]','[[1,0],[0,−1]]','[[0,−1],[1,0]]','[[2,0],[0,2]]'],'[[−1,0],[0,1]]','A y-axis reflection changes x to −x and leaves y unchanged.',{tags:['matrix transformations']}),
  short('Apply the transformation matrix [[0,−1],[1,0]] to the point (3,1).','(−1,3)',['(-1,3)','(−1,3)','(−1, 3)'],'Matrix multiplication gives (−1,3), a 90° anticlockwise rotation.',{tags:['matrix transformations','rotation']}),
  multi('An iterated-function fractal repeatedly applies contraction transformations. Select all plausible consequences.',['Smaller self-similar copies appear.','The same rules are applied repeatedly.','Every transformation must preserve area.','The limiting pattern can have fine detail at many scales.'],['Smaller self-similar copies appear.','The same rules are applied repeatedly.','The limiting pattern can have fine detail at many scales.'],'Contractions and repeated rules create self-similarity; area need not be preserved.',{questionStyle:'conceptual',tags:['fractals','iteration']})],
'AHL 3.10':[
  short('Find the vector from A(−1,4) to B(5,−2).','(6,−6)',['(6,-6)','(6,−6)','(6, −6)'],'B−A=(5−(−1),−2−4)=(6,−6).',{tags:['vectors','displacement']}),
  num('Find the magnitude of the vector (−2,3,6).',7,'Magnitude=√(4+9+36)=7.',{tags:['vectors','magnitude']}),
  multi('Let a=(2,−1) and b=(3,4). Select all true statements.',['a+b=(5,3)','2a=(4,−2)','b−a=(1,5)','a·b=(6,−4)'],['a+b=(5,3)','2a=(4,−2)','b−a=(1,5)'],'Vector addition and scalar multiplication are component-wise; a dot product is a scalar.',{questionStyle:'conceptual',tags:['vector arithmetic']})],
'AHL 3.11':[
  mc('Which vector equation describes the line through (2,−1,3) parallel to (4,0,−2)?',['r=(2,−1,3)+λ(4,0,−2)','r=(4,0,−2)+λ(2,−1,3)','r=λ(6,−1,1)','r=(2,−1,3)·(4,0,−2)'],'r=(2,−1,3)+λ(4,0,−2)','A line is a point position vector plus a scalar multiple of a direction vector.',{tags:['vector lines']}),
  num('On r=(1,5)+t(3,−2), find the y-coordinate when t=4.',-3,'y=5−2(4)=−3.',{tags:['parametric lines']}),
  tf('Replacing a line’s direction vector d by −3d changes its geometric line.',false,'Any non-zero scalar multiple gives the same direction and hence the same line through the fixed point.',{questionStyle:'misconception',tags:['vector lines','direction']})],
'AHL 3.12':[
  num('A particle has position r(t)=(2t, t²). Find the x-component of its velocity at t=3.',2,'v(t)=r′(t)=(2,2t), so the x-component is always 2.',{tags:['vector kinematics','velocity']}),
  short('A particle starts at (1,−2) with constant velocity (3,4). Give its position after 5 seconds.','(16,18)',['(16,18)','(16, 18)'],'r=(1,−2)+5(3,4)=(16,18).',{questionStyle:'application',tags:['vector kinematics','position']}),
  multi('For a particle moving with constant velocity vector v, select all true statements.',['Its path is a straight line.','Its acceleration is zero.','Equal time intervals give equal displacement vectors.','Its speed must increase.'],['Its path is a straight line.','Its acceleration is zero.','Equal time intervals give equal displacement vectors.'],'Constant velocity has fixed magnitude and direction, so acceleration is zero.',{questionStyle:'conceptual',tags:['vector motion','constant velocity']})],
'AHL 3.13':[
  num('Find (1,−2,3)·(4,5,−1).',-9,'The dot product is 1(4)+(−2)(5)+3(−1)=−9.',{tags:['scalar product']}),
  num('Find the magnitude of (1,0,0)×(0,5,0).',5,'The vectors are perpendicular, so |a×b|=|a||b|=5.',{tags:['vector product','area']}),
  multi('Select all true statements about non-zero vectors a and b.',['a·b=0 implies they are perpendicular.','a×b is perpendicular to both vectors.','|a×b| gives the parallelogram area.','a×b=b×a.'],['a·b=0 implies they are perpendicular.','a×b is perpendicular to both vectors.','|a×b| gives the parallelogram area.'],'The cross product is anti-commutative: b×a=−a×b.',{questionStyle:'conceptual',tags:['dot product','cross product']})],
'AHL 3.14':[
  mc('A simple graph has vertex degrees 2,2,3,3. How many edges does it have?',['4','5','8','10'],'5','The degree sum is 10, which equals twice the number of edges.',{tags:['graph theory','degree']}),
  num('A connected graph has 8 vertices and 7 edges and contains no cycles. How many edges would its spanning tree have?',7,'A tree with n vertices has n−1 edges, so 8 vertices require 7 edges.',{tags:['trees','graph theory']}),
  multi('Select all true statements about a complete graph K₅.',['Every pair of vertices is adjacent.','Each vertex has degree 4.','It has 10 edges.','It is a tree.'],['Every pair of vertices is adjacent.','Each vertex has degree 4.','It has 10 edges.'],'K₅ has 5·4/2=10 edges and contains many cycles, so it is not a tree.',{questionStyle:'conceptual',tags:['complete graphs','degree']})],
'AHL 3.15':[
  mc('In an undirected simple graph, what does a 1 in position (i,j) of the adjacency matrix mean?',['Vertex i has degree 1','Vertices i and j are adjacent','There is exactly one vertex','The graph is complete'],'Vertices i and j are adjacent','Adjacency-matrix entries record whether the corresponding vertices share an edge.',{tags:['adjacency matrices']}),
  num('For adjacency matrix A, the entry (A²)₁₃ is 4. How many walks of length 2 go from vertex 1 to vertex 3?',4,'The (i,j) entry of Aⁿ counts walks of length n from i to j.',{tags:['matrix powers','walks']}),
  multi('Select all properties of the adjacency matrix of a simple undirected graph.',['It is symmetric.','Its diagonal entries are zero.','The sum of row i is the degree of vertex i.','Every entry must be 1.'],['It is symmetric.','Its diagonal entries are zero.','The sum of row i is the degree of vertex i.'],'Undirected adjacency is symmetric, and a simple graph has no loops on the diagonal.',{questionStyle:'conceptual',tags:['adjacency matrices','graph properties']})],
'AHL 3.16':[
  mc('Which algorithm constructs a minimum spanning tree by repeatedly adding the cheapest edge that does not create a cycle?',['Kruskal’s algorithm','Nearest-neighbour algorithm','Euler’s algorithm','Dijkstra’s rule'],'Kruskal’s algorithm','Kruskal orders edges by weight and rejects any edge that would form a cycle.',{tags:['Kruskal algorithm','minimum spanning tree']}),
  order('Order the main steps of Prim’s algorithm.',['Add the cheapest edge joining the tree to a new vertex','Choose a starting vertex','Repeat until every vertex is included','Compare eligible boundary edges'],['Choose a starting vertex','Compare eligible boundary edges','Add the cheapest edge joining the tree to a new vertex','Repeat until every vertex is included'],'Prim grows one connected tree by adding the cheapest eligible boundary edge.',{tags:['Prim algorithm','minimum spanning tree']}),
  multi('Select all graphs that have an Eulerian circuit.',['A connected graph with every vertex of even degree','A connected graph with exactly two odd-degree vertices','A cycle graph C₆','A disconnected graph whose components are cycles'],['A connected graph with every vertex of even degree','A cycle graph C₆'],'An Eulerian circuit requires connectedness and even degree at every vertex.',{questionStyle:'conceptual',tags:['Eulerian circuit','graph algorithms']})],
}
