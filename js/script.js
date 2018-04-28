var camera, controls, scene, renderer, cube, line;
init();
animate();

function init() {
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
	var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
	cube = new THREE.Mesh(geometry, material);
	scene.add(cube);

	var edges = new THREE.EdgesGeometry(geometry);
	line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));
	scene.add(line);


	var geom = new THREE.Geometry(); 
	var v1 = new THREE.Vector3(0,0,10);
	var v2 = new THREE.Vector3(0,50,10);
	var v3 = new THREE.Vector3(50,50,10);

	geom.vertices.push(v1);
	geom.vertices.push(v2);
	geom.vertices.push(v3);
	geom.faces.push(new THREE.Face3( 0, 1, 2 ));

	var object = new THREE.Mesh(geom, new THREE.MeshBasicMaterial());
	scene.add(object);

	// lights
	// var light = new THREE.DirectionalLight( 0xffffff );
	// light.position.set( 1, 1, 1 );
	// scene.add( light );
	// var light = new THREE.DirectionalLight( 0x002288 );
	// light.position.set( -1, -1, -1 );
	// scene.add( light );
	var light = new THREE.AmbientLight( 0x222222 );
	scene.add(light);

	// renderer
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);
	window.addEventListener('resize', onWindowResize, false);
	render();
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	controls.handleResize();
	render();
}

function animate() {
	requestAnimationFrame(animate);
	cube.rotation.y -= 0.05;
	line.rotation.y -= 0.05;
	controls.update();
	render();
}

function render() {
	renderer.render(scene, camera);
}