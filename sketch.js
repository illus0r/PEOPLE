// let sqr = [ [0, -1], [1, 0], [0, 1], [-1, 0] ];
let S,R,t,i
S = new Uint32Array([4, 1, ss = t = 2, 3].map(i => parseInt('0x8571027db178A535d56335Adb0580abd2fF29274'.substr(i * 8, 8), 16))); R = _ => (t = S[3], S[3] = S[2], S[2] = S[1], S[1] = ss = S[0], t ^= t << 11, S[0] ^= t ^ t >>> 8 ^ ss >>> 19, S[0] / 2 ** 32); 'tx piter'
Math.random = R

let sqr = [ [-1,-1], [1,-1], [1,1], [-1,1] ]
let F=(n,f)=>[...Array(n|0)].map((_,i)=>f(i))
let N = 30
// let g = F(N, (i) => F(N, (j) => Math.random() > 0.1 ? 1 : 0))
let g = F(N, (i) => F(N, (j) => 0))
// g[2][3] = 1
// g[3][4] = 1
// g[4][2] = 1
let sz = 20
// g[3][2] = 1
// g[3][3] = 1
// g[4][1] = 1
console.log('g:',g)
let poly1 = [];
let poly2 = [];
let numVertices = 3; // Number of vertices for each polygon
let rot = (x, y, angle) => {
	let c = Math.cos(angle),
		s = Math.sin(angle);
	return [x * c - y * s, x * s + y * c];
};
let vadd = (a, b) => a.map((d, i) => d + b[i]);
let vdot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
let vsub = (a, b) => a.map((d, i) => d - b[i]);
let vmul = (a, s) => a.map((d) => d * s);
let vnorm = (a) => {
	let l = Math.sqrt(vdot(a, a));
	return a.map((d) => d / l);
};
let sscale = (s, m) => s.map((c) => c.map((p) => p.map((x) => x * m)));
let strans = (s, v) => s.map((c) => c.map((p) => p.map((x, i) => x + v[i])));
let srot = (s, a) => s.map((c) => c.map((p) => rot(...p, a)));

function setup() {
	createCanvas(800, 800);
	noFill();
	noLoop();

 	background(220);
	paintGrid()
	drawShapes()
}

let shapes = [[], [], [], []];
let brush
brush = [
	sscale([sqr],.999*sz*2./8*.5),
	sscale([sqr],.999*sz*2./8*1.5),
	sscale([sqr],.999*sz*2./8*2.5),
	sscale([sqr],.999*sz*2./8*3.5),
]
let brushTranslated

// function draw() {
// 	background(220);
// 	brushTranslated = brush.map((s) => strans(s, [mouseX, mouseY]))
// 	strokeWeight(.5);
// 	brushTranslated.map((s) => drawShape(s, "#F000"));
// 	strokeWeight(2);
// 	shapes.map((s) => drawShape(s, "#00F0"));
// }

function ditherShape(shape){
		return shape.map((c) => c.map((p) => p.map((x) => x+(Math.random()-.5)*.0001)))
}

function mousePressed(){
	let [i,j] = xy2ij(mouseX,mouseY)
	if(i<0 || j<0 || i>=N || j>=N) return
	g[j][i] = 1-g[j][i]
	paintGrid()
	drawShapes()
}
function drawShapes(){
	background(220);
	strokeWeight(2);
	shapes.map((s) => drawShape(s, "#00F2"));
}

function paintGrid(){
	shapes = [[],[],[],[]];
	for(let i=0;i<N;i++){
		for(let j=0;j<N;j++){
			if(g[j][i]>0)	paintCell(i,j)
		}
	}
}

function xy2ij(x,y){
	let i = Math.floor(x/sz+.5)
	let j = Math.floor(y/sz+.5)
	return [i,j]
}

function ij2xy(i,j){
	let x = i*sz
	let y = j*sz
	return [x,y]
}

function paintCell(i,j){
	let [x,y] = ij2xy(i,j)
	brushTranslated = brush.map((s) => strans(s, [x, y]))
	shapes = shapes.map((s,i) => unionShape(s, brushTranslated[i]))
	// shapes = shapes.map(s => ditherShape(s))
}

function keyPressed(){
	// removeRandomContour()
	// console.log('shapes:',shapes)
	// shapes = shapes.map(s => ditherShape(s))
	// console.log('shapes:',shapes)
	// drawShapes()
}

function removeRandomContour(){
	let rndi=-1, rndj=-1
	let counter = 0
	shapes.forEach((s,i) => {
		s.forEach((c,j) => {
			if(Math.random()<1/(counter+1)){
				rndi = i
				rndj = j
			}
			counter++
		})
	})
	if(rndi>=0){
		shapes[rndi].splice(rndj,1)
	}
}

function unionShape(shape1, shape2) {
    let clipper = new ClipperLib.Clipper();

    // Scale up the shapes if necessary
    let scale = 100;
    let subj_paths = shape1.map(poly => poly.map(point => ({ X: point[0] * scale, Y: point[1] * scale })));
    let clip_paths = shape2.map(poly => poly.map(point => ({ X: point[0] * scale, Y: point[1] * scale })));

    // Add the paths to the clipper
    clipper.AddPaths(subj_paths, ClipperLib.PolyType.ptSubject, true);
    clipper.AddPaths(clip_paths, ClipperLib.PolyType.ptClip, true);

    // Perform union operation
    let solution_paths = new ClipperLib.Paths();
    clipper.Execute(ClipperLib.ClipType.ctUnion, solution_paths);

    // Convert the solution paths back to your format
    let resultShape = solution_paths.map(poly => poly.map(point => [point.X / scale, point.Y / scale]));

    return resultShape;
}

function drawPoly(poly, textFill = 0) {
	beginShape();
	for (let i = 0; i < poly.length; i++) {
		vertex(poly[i][0], poly[i][1]);
		if (poly[i][2]) if (poly[i][2] > 0) circle(poly[i][0], poly[i][1], 20);
		// push();
		// noStroke();
		// fill(textFill);
		// text(i, ...poly[i]);
		// pop();
	}
	endShape(CLOSE);
}

function drawShape(shape, textFill = 0) {
	for (let c of shape) {
		drawPoly(c, textFill);
	}
}

let cross = (a, b) => a[0] * b[1] - a[1] * b[0];
function generatePoly(numVertices) {
	let poly = [];
	for (let i = 0; i < numVertices; i++) {
		let x = random(width); // Random x within first quarter of canvas width
		let y = random(height);
		poly.push([x, y]);
	}
	poly = polyCCW(poly);
	return poly;
}

function polyCCW(poly) {
	// Calculate cross product of the first two edges
	let firstEdge = [poly[1][0] - poly[0][0], poly[1][1] - poly[0][1]];
	let secondEdge = [poly[2][0] - poly[1][0], poly[2][1] - poly[1][1]];
	let crossProduct = cross(firstEdge, secondEdge);

	// If cross product is negative, reverse the polygon
	if (crossProduct < 0) {
		poly.reverse();
	}

	return poly;
}
