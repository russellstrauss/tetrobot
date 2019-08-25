module.exports = function() {
	
	var settings;
	var cube, renderer, scene, camera, controls;
	var stats = new Stats();
	
	return {
		
		settings: {
			
		},
		
		init: function() {

			let self = this;

			self.setUpScene();
			self.addFloor();
			self.enableStats();
			self.enableControls();
			this.resizeRendererOnWindowResize();

			self.addCube();
			
			camera.position.x = -10;
			camera.position.y = 10;
			camera.position.z = 10;
			
			var animate = function () {

				requestAnimationFrame(animate);
				renderer.render(scene, camera);
				controls.update();
				stats.update();
				
				// cube.rotation.x += 0.01;
				// cube.rotation.y += 0.01;
			};
			
			animate();
		},

		resizeRendererOnWindowResize: function() {

			window.addEventListener('resize', utils.debounce(function() {
				
				if (renderer) {
	
					camera.aspect = window.innerWidth / window.innerHeight;
					camera.updateProjectionMatrix();
					renderer.setSize(window.innerWidth, window.innerHeight);
					controls.handleResize();
				}
			}, 250));
		},

		enableControls: function() {
			controls = new THREE.TrackballControls(camera, renderer.domElement);
			controls.target.set(0, 0, 0)
			controls.rotateSpeed = 5;
			controls.zoomSpeed = 6;
			controls.panSpeed = 0.8;
			controls.noZoom = false;
			controls.noPan = false;
			controls.staticMoving = true;
			controls.dynamicDampingFactor = 0.3;
			controls.keys = [ 65, 83, 68 ];
		},

		enableStats: function() {
			document.body.appendChild(stats.dom);
		},

		setUpLights: function() {
			var light = new THREE.DirectionalLight(0xffffff);
			light.position.set(1, 1, 1);
			scene.add(light);

			var light = new THREE.DirectionalLight(0x002288);
			light.position.set(- 1, - 1, - 1);
			scene.add(light);

			var light = new THREE.AmbientLight(0x222222);
			scene.add(light);
		},

		addFloor: function() {
			var planeGeometry = new THREE.PlaneBufferGeometry(2000, 2000);
			planeGeometry.rotateX(- Math.PI / 2);
			var planeMaterial = new THREE.ShadowMaterial({ opacity: 0.2 });

			var plane = new THREE.Mesh(planeGeometry, planeMaterial);
			plane.position.y = 0;
			plane.receiveShadow = true;
			scene.add(plane);

			var helper = new THREE.GridHelper(2000, 100);
			helper.position.y = -1;
			helper.material.opacity = 0.25;
			helper.material.transparent = true;
			scene.add(helper);
		},

		setUpScene: function() {
			scene = new THREE.Scene();
			scene.background = new THREE.Color(0xf0f0f0);
			camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
			renderer = new THREE.WebGLRenderer();
			renderer.setSize(window.innerWidth, window.innerHeight);
			document.body.appendChild(renderer.domElement);
		},

		addCube: function() {
			var geometry = new THREE.BoxGeometry(10, 10, 10);
			var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
			cube = new THREE.Mesh(geometry, material);
			cube.position.y = 4;
			scene.add(cube);
		}
	}
}