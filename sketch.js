let sqr = [ [0, -1], [1, 0], [0, 1], [-1, 0] ];
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
	createCanvas(400, 400);
	noFill();
	// noLoop();
}

let shapes = [[], [], [], [],];
let brush
brush = [
	sscale([sqr],5),
	sscale([sqr],15),
	sscale([sqr],25),
	sscale([sqr],35),
]
let brushTranslated

function draw() {
	background(220);
	brushTranslated = brush.map((s) => strans(s, [mouseX, mouseY]))
	strokeWeight(.5);
	brushTranslated.map((s) => drawShape(s, "#F000"));
	strokeWeight(2);
	shapes.map((s) => drawShape(s, "#00F0"));
}


function mousePressed(){
	shapes = shapes.map((s,i) => unionShape(s, brushTranslated[i]))
}

function keyPressed(){
	removeRandomContour()
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


function isOuter(poly) {
	let sum = 0;
	for (let i = 0; i < poly.length; i++) {
		const currentVertex = poly[i];
		const nextVertex = poly[(i + 1) % poly.length];
		sum += (nextVertex[0] - currentVertex[0]) * (nextVertex[1] + currentVertex[1]);
	}
	return sum < 0;
}


function unionShape(shape1, shape2) {
	let shape = sscale(shape1,1)
	let polys = [...shape1,...shape2]
	console.log('polys:',JSON.stringify(polys))

	let counter = 0
	while(true){
		let hopeToMerge = false
		if(counter>10000) {
			console.error("infinite loop")
			return []
		}
		console.log(counter++)
		for(let i=0;i<polys.length;i++){
			if(hopeToMerge) break
			for(let j=i+1;j<polys.length;j++){
				if(hopeToMerge) break
				let p1 = polys[i]
				let p2 = polys[j]
				let u = unionPoly(p1,p2)
				console.log('i,j:',i,j, u.length)
				if(u.length>0){
					polys.splice(j,1)
					polys.splice(i,1)
					polys.push(...u)
					hopeToMerge = true
				}
			}
		}
		if(!hopeToMerge) break
	}
	// for(let p2 of shape2){
	// 	for(let p of shape){
	// 		if(!isOuter(p1) && !isOuter(p2)) continue
	// 		let u = unionPoly(p1,p2)
	// 		console.log('u:',u)
	// 		if(u.length>0) shape.push(...u)
	// 		else {
	// 			shape.push(p1,p2)
	// 		}
	// 	}
	// }
	// console.log('shape:',shape)
	console.log('polys:',JSON.stringify(polys))
	console.log('polys:',polys)
	return polys
}

function unionPoly(poly1,poly2,foo=1.){
	let [poly1New, poly2New] = addIntersections(poly1, poly2);

	// strokeWeight(2);
	// stroke(255, 0, 0);
	// drawPoly(poly1New, "#F005");
	// stroke(0, 0, 255);
	// drawPoly(poly2New, "#00F5");
	// //  stroke(0, 255, 0);
	// //drawPoly(poly3New, "#00F5");

	let outs = poly1New.filter((p) => p[2] && p[2]*foo > 0);
	// console.log(outs);

	let shape = [];
	let polys = [poly1New, poly2New];
	let counter = 0;
	while (outs.length > 0) {
		shape.push([]);
		let out = outs.pop();
		let current = out;
		let pid = 0;
		let i = polys[pid].findIndex((v) => v === out);
		do {
			push(); fill(0);text(counter, current[0], current[1]); pop()
			if (counter++ > 10000) {
				console.error("infinite loop");
				return;
			}
			i++;
			i = i % polys[pid].length;
			current = polys[pid][i];
			shape[shape.length - 1].push([current[0],current[1]])

			if (current[2]) {
				pid = 1 - pid;
				i = polys[pid].findIndex((v) => v === current);
			}
		} while (current !== out);
	}

	return shape;

}

function lineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
	let den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
	if (den === 0) {
		return null; // Parallel lines or coincident lines
	}

	let t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
	let u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

	if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
		let intersectionX = x1 + t * (x2 - x1);
		let intersectionY = y1 + t * (y2 - y1);
		return [intersectionX, intersectionY];
	}

	return null; // No intersection point found
}

// Function to add intersections between two polygons
function addIntersections(poly1, poly2) {
	let intersections = [];
	let insert1 = [...Array(poly1.length)].map((_) => []);
	let insert2 = [...Array(poly2.length)].map((_) => []);

	// Loop through each edge of poly1
	for (let i = 0; i < poly1.length; i++) {
		let [x1, y1] = poly1[i];
		let [x2, y2] = poly1[(i + 1) % poly1.length];
		let d1 = [x2 - x1, y2 - y1];

		// Loop through each edge of poly2
		for (let j = 0; j < poly2.length; j++) {
			let [x3, y3] = poly2[j];
			let [x4, y4] = poly2[(j + 1) % poly2.length];
			let d2 = [x4 - x3, y4 - y3];

			// Compute intersection point
			let intersection = lineIntersection(x1, y1, x2, y2, x3, y3, x4, y4);
			if (intersection) {
				intersections.push(intersection);
				let vert = [...intersection, cross(d1, d2)];
				insert1[i].push(vert);
				insert2[j].push(vert);
				// circle(...intersection, 5);
			}
		}
	}

	fill(0)
	// let c1 = 0
	// let c2 = 0
	let poly1New = [];// ← 1
	for (let i = 0; i < poly1.length; i++) {
		let [x, y] = poly1[i];
		poly1New.push([x, y]);
		insert1[i].sort(
			(a, b) => Math.hypot(a[0] - x, a[1] - y) - Math.hypot(b[0] - x, b[1] - y)
		);
		insert1[i].forEach((v) => {
			// text(c1++, ...v);
		})
		poly1New.push(...insert1[i]);
	}
	let poly2New = [];
	for (let j = 0; j < poly2.length; j++) {
		let [x, y] = poly2[j];
		poly2New.push([x, y]);
		insert2[j].sort(
			(a, b) => Math.hypot(a[0] - x, a[1] - y) - Math.hypot(b[0] - x, b[1] - y)
		);
		insert2[j].forEach((v) => {
			// text(c2++, ...v);
		})
		poly2New.push(...insert2[j]);
	}
	noFill()

	// debug
	// for (let i = 0; i < poly2New.length; i++) {
	// 	let x1 = poly2New[i][0]+random(-5,5);
	// 	let y1 = poly2New[i][1]+random(-5,5);
	// 	let x2 = poly2New[(i + 1)%poly2New.length][0]+random(-5,5);
	// 	let y2 = poly2New[(i + 1)%poly2New.length][1]+random(-5,5);
	// 	line(x1, y1, x2, y2);
	// }
	// for (let j = 0; j < poly2New.length - 1; j++) {
	// 	line(...poly2New[j].map(d=>d+random(-5,5)), ...poly2New[j + 1].map(d=>d+random(-5,5)));
	// }

	return [poly1New, poly2New];
}

function drawPoly(poly, textFill = 0) {
	beginShape();
	for (let i = 0; i < poly.length; i++) {
		vertex(poly[i][0], poly[i][1]);
		if (poly[i][2]) if (poly[i][2] > 0) circle(poly[i][0], poly[i][1], 20);
		push();
		noStroke();
		fill(textFill);
		text(i, ...poly[i]);
		pop();
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
