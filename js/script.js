var camera, controls, scene, renderer;
var cube, line;

//------------------------------
//   COORDINATE TRANSFORMS
//------------------------------

var car_to_sph = function(x,y,z) {
	r = Math.sqrt(x**2 + y**2 + z**2);
	phi = Math.atan(y/x);
	if (x==y && y==0) {phi = 0;}
	if (y<0) {phi += Math.pi;}
	theta = Math.acos(z/r);
	return [r, phi, theta];
}

var sph_to_car = function(r,phi,theta) {
	x = r*Math.sin(theta)*Math.cos(phi);
	y = r*Math.sin(theta)*Math.sin(phi);
	z = r*Math.cos(theta);
	return [x, y, z];
}

var test = function(x,y,z) {
	[p,q,r] = car_to_sph(x,y,z);
	[a,b,c] = sph_to_car(p,q,r);
	console.log(a,b,c);
}

//------------------------------
//   FUNCTION GENERATORS
//------------------------------

var fact = function(n) {
	if (n==0) {return 1;}
	if (n<=50) {return Array(n).fill().map((_, i) => i+1).reduce(function(a,_){return a*_},1);}
	var k = Math.sqrt(2*Math.PI*n)*(n/Math.E)**n;
	return Math.round(k*(1 + 1/(12*n) + 1/(288*n**2) - 139/(51840*n**3)));
}

var P = function(m, l) {
	var a = Math.abs(m);
	var coeff = "1/("+(2**l)+"*"+fact(l)+")*(";
	var f = "(u^2-1)^"+l;
	var g = "(1-u^2)^("+a+"/2)*";
	for (var i=0; i<l+a; i++) {
		f = math.derivative(f, "u").toString();
	}
	return math.simplify(coeff+g+f+")").toString();
}

var Y = function(m, l) {
	var a = Math.abs(m);
	var eta = -1;
	if (m<0 || m%2==0) {eta = 1;}
	var k1 = (2*l+1)*fact(l-a);
	var k2 = fact(l+a);
	var y = eta+"*sqrt("+k1+"/(4*pi*"+k2+"))*"+P(m,l)+"*e^("+m+"*i*f)";
	return math.simplify(y).toString();
}

//------------------------------
//   MESH CREATION
//------------------------------

var add_triangle = function(p0, p1, p2, c) {
	var g = new THREE.Geometry(); 
	var v1 = new THREE.Vector3(p0[0], p0[1], p0[2]);
	var v2 = new THREE.Vector3(p1[0], p1[1], p1[2]);
	var v3 = new THREE.Vector3(p2[0], p2[1], p2[2]);
	g.vertices.push(v1);
	g.vertices.push(v2);
	g.vertices.push(v3);
	g.faces.push(new THREE.Face3(0, 1, 2));
	var tri = new THREE.Mesh(g, new THREE.MeshPhongMaterial({ color: c }));
	scene.add(tri);

	var edges = new THREE.EdgesGeometry(g);
	line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));
	scene.add(line);
}

var generate_points = function(m, l, ndt, ndf, isReal) {
	//ndt = number of dtheta in the full pi rotation
	//ndf = number of dphi in the full pi rotation
	var harm = math.parse(Y(m,l));
	var dt = Math.PI/ndt;
	var df = 2*Math.PI/ndf;
	var points = [];
	for (var idf=0; idf<ndf; idf++) {
		var slice = [];
		var fi = idf*df;
		for (var idt=0; idt<ndt; idt++) {
			var ti = idt*dt;
			isReal ? (r = harm.eval({u:Math.cos(ti), f:fi}).re) : (r = harm.eval({u:Math.cos(ti), f:fi}).im);
			console.log(harm.toString());
			slice.push(sph_to_car(r, fi, ti));
		}
		points.push(slice);
	}
	return points;
}

var add_points = function(points, ndt, ndf, c) {
	var si, sj;
	for (var idf=0; idf<ndf-1; idf++) {
		si = points[idf];
		sj = points[idf+1];
		for (var i=0; i<ndt-1; i++) {add_triangle(si[i], si[i+1], sj[i], c);} //upper triangle
		for (var i=1; i<ndt; i++) {add_triangle(si[i], sj[i], sj[i-1], c);} //lower triangle
	}
	//wrapping around
	si = points[ndf-1];
	sj = points[0];
	for (var i=0; i<ndt-1; i++) {add_triangle(si[i], si[i+1], sj[i], c);} //upper triangle
	for (var i=1; i<ndt; i++) {add_triangle(si[i], sj[i], sj[i-1], c);} //lower triangle
	console.log(sj[ndt-1]);
}

var add_harmonic = function(m, l, ndt, ndf, cr, ci) {
	var p_real = generate_points(m, l, ndt, ndf, true);
	var p_im = generate_points(m, l, ndt, ndf, false);
	add_points(p_real, ndt, ndf, cr);
	add_points(p_im, ndt, ndf, ci);
}

//------------------------------
//   WORLD HANDLING
//------------------------------

var init = function() {
	//camera
	camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
	camera.position.z = 2;
	controls = new THREE.TrackballControls(camera);
	controls.rotateSpeed = 1;
	controls.zoomSpeed = 1;
	controls.panSpeed = 1;
	controls.noZoom = false;
	controls.noPan = false;
	controls.staticMoving = true;
	controls.addEventListener('change', render);

	// world
	scene = new THREE.Scene();

	/*var geometry = new THREE.SphereGeometry(2, 100, 100);
	var material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
	cube = new THREE.Mesh(geometry, material);
	scene.add(cube);

	var edges = new THREE.EdgesGeometry(geometry);
	line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));
	scene.add(line);*/


	// lights
	// var light = new THREE	.DirectionalLight( 0xffffff );
	// light.position.set( 1, 1, 1 );
	// scene.add( light );
	var light = new THREE.DirectionalLight( 0xffffff );
	light.position.set(-1, -1, -1);
	scene.add( light );
	var light = new THREE.AmbientLight( 0xaaaaaa );
	scene.add(light);

	// renderer
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);
	window.addEventListener('resize', onWindowResize, false);
	render();
};

var onWindowResize = function() {
	camera.aspect = window.innerWidth/window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	controls.handleResize();
	render();
}

var animate = function() {
	requestAnimationFrame(animate);
	controls.update();
	render();
}

var render = function() {
	renderer.render(scene, camera);
}

//------------------------------
//   FUNCTION CALLS
//------------------------------

init();
animate();