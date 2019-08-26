module.exports = function() {
	
	var tetrahedron, renderer, scene, camera, controls;
	var stats = new Stats();
	
	return {
		
		settings: {
			activateLightHelpers: false,
			axesHelper: {
				activateAxesHelper: true,
				axisLength: 10
			}
		},
		
		init: function() {

			let self = this;

			self.setUpScene();
			self.addFloor();
			self.enableStats();
			self.enableControls();
			self.resizeRendererOnWindowResize();
			self.loadFonts();
			self.setUpLights();
			self.addTetrahedron();
			
			camera.position.x = -10;
			camera.position.y = 10;
			camera.position.z = 10;
			
			var animate = function() {

				requestAnimationFrame(animate);
				renderer.render(scene, camera);
				controls.update();
				stats.update();
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
			controls = new THREE.OrbitControls(camera, renderer.domElement);
			controls.target.set(0, 0, 0);
			controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
			controls.dampingFactor = 0.05;
			controls.zoomSpeed = 6;
			controls.screenSpacePanning = false;
			controls.minDistance = 10;
			controls.maxDistance = 500;
			controls.maxPolarAngle = Math.PI / 2;
		},

		enableStats: function() {
			document.body.appendChild(stats.dom);
		},

		setUpLights: function() {

			let self = this;
			let lights = [];
			const color = 0xFFFFFF;
			const intensity = 1;
			const light = new THREE.DirectionalLight(color, intensity);
			light.position.set(-1, 2, 4);
			scene.add(light);
			lights.push(light);

			const light2 = new THREE.DirectionalLight(color, intensity);
			light2.position.set(10, 6, 8);
			scene.add(light2);
			lights.push(light2)
			
			if (self.settings.activateLightHelpers) {
				self.activateLightHelpers(lights);
			}
		},

		activateLightHelpers: function(lights) {

			for (let i = 0; i < lights.length; i++) {
				let helper = new THREE.DirectionalLightHelper(lights[i], 5, 0x00000);
				scene.add(helper);
			}
		},

		activateAxesHelper: function() {
			let self = this;
			let axesHelper = new THREE.AxesHelper(self.settings.axesHelper.axisLength);
			scene.add(axesHelper);

		// 	var  textGeo = new THREE.TextGeometry('Y', {
		// 		size: 5,
		// 		height: 2,
		// 		curveSegments: 6,
		// 		font: "helvetiker",
		// 		style: "normal"       
		//    });
		   
		//    var  color = new THREE.Color();
		//    color.setRGB(255, 250, 250);
		//    var  textMaterial = new THREE.MeshBasicMaterial({ color: color });
		//    var  text = new THREE.Mesh(textGeo , textMaterial);
		   
		//    text.position.x = axis.geometry.vertices[1].x;
		//    text.position.y = axis.geometry.vertices[1].y;
		//    text.position.z = axis.geometry.vertices[1].z;
		//    text.rotation = camera.rotation;
		//    scene.add(text);
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

			let self = this;
			scene = new THREE.Scene();
			scene.background = new THREE.Color(0xf0f0f0);
			camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 1, 1000);
			renderer = new THREE.WebGLRenderer();
			renderer.setSize(window.innerWidth, window.innerHeight);
			document.body.appendChild(renderer.domElement);

			if (self.settings.axesHelper.activateAxesHelper) {

				self.activateAxesHelper();
			}
		},

		addTetrahedron: function() {
			var geometry = new THREE.TetrahedronGeometry(5, 0);
			var material = new THREE.MeshBasicMaterial({wireframe: true, color: 0x08CDFA });
			var material = new THREE.MeshPhongMaterial({color: 0x08CDFA });
			tetrahedron = new THREE.Mesh(geometry, material);
			tetrahedron.position.y = 5.0 / 2;
			tetrahedron.rotation.x = Math.PI / 2;
			scene.add(tetrahedron);
		},

		loadFonts: function() {

			let self = this;
			var loader = new THREE.FontLoader();
			loader.load('http://localhost:3000/assets/vendors/js/three.js/examples/fonts/helvetiker_regular.typeface.json', function (font) {
				
				let fontStyle = {
					font: font,
					size: .25,
					height: 0,
					curveSegments: 1
				};
				
				let textGeometry = new THREE.TextGeometry('Y-axis', fontStyle);
				let textMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
				let mesh = new THREE.Mesh(textGeometry, textMaterial);
				textGeometry.translate(0, self.settings.axesHelper.axisLength, 0);
				scene.add(mesh);
				
				textGeometry = new THREE.TextGeometry('X-axis', fontStyle);
				mesh = new THREE.Mesh(textGeometry, textMaterial);
				textGeometry.translate(self.settings.axesHelper.axisLength, 0, 0);
				scene.add(mesh);
				
				textGeometry = new THREE.TextGeometry('Z-axis', fontStyle);
				mesh = new THREE.Mesh(textGeometry, textMaterial);
				textGeometry.translate(0, 0, self.settings.axesHelper.axisLength);
				scene.add(mesh);
			});
		}
	}
}