var camera, controls, scene, renderer;
var cube, line;

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

var fact = function(n) {
	if (n==0) {return 1;}
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
	return math.simplify(coeff+g+f+")");
}

var Y = function(m, l) {
	var a = Math.abs(m);
	var eta = -1;
	if (m<0 || m%2==0) {eta = 1;}
}

var init = function() {
	//camera
	camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
	camera.position.z = 5;
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

	var geometry = new THREE.SphereGeometry(2, 10, 10);
	var material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
	cube = new THREE.Mesh(geometry, material);
	scene.add(cube);

	var edges = new THREE.EdgesGeometry(geometry);
	line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));
	//scene.add(line);


	var geom = new THREE.Geometry(); 
	var v1 = new THREE.Vector3(0,0,10);
	var v2 = new THREE.Vector3(0,50,10);
	var v3 = new THREE.Vector3(50,50,10);
	var v4 = new THREE.Vector3(80,50,10);

	geom.vertices.push(v1);
	geom.vertices.push(v2);
	geom.vertices.push(v3);
	geom.vertices.push(v4);
	geom.faces.push(new THREE.Face3(0, 1, 2, 3));

	var object = new THREE.Mesh(geom, new THREE.MeshPhongMaterial());
	scene.add(object);

	// lights
	// var light = new THREE	.DirectionalLight( 0xffffff );
	// light.position.set( 1, 1, 1 );
	// scene.add( light );
	var light = new THREE.DirectionalLight( 0xffffff );
	light.position.set(-1, -1, -1);
	scene.add( light );
	var light = new THREE.AmbientLight( 0x222222 );
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
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	controls.handleResize();
	render();
}

var animate = function() {
	requestAnimationFrame(animate);
	cube.rotation.y -= 0.05;
	line.rotation.y -= 0.05;
	controls.update();
	render();
}

var render = function() {
	renderer.render(scene, camera);
}

init();
animate();