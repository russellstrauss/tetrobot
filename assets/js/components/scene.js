module.exports = function() {
	
	var tetrahedron, renderer, scene, camera, controls;
	var stats = new Stats();
	
	return {
		
		settings: {
			activateLightHelpers: false,
			axesHelper: {
				activateAxesHelper: true,
				axisLength: 10
			},
			tetrahedron: {
				size: 5
			}
		},
		
		init: function() {

			let self = this;

			self.setUpScene();
			self.addFloor();
			self.enableStats();
			self.enableControls();
			self.resizeRendererOnWindowResize();
			self.setUpLights();
			self.addTetrahedron();
			
			camera.position.x = -20;
			camera.position.y = 20;
			camera.position.z = 20;
			
			var animate = function() {

				requestAnimationFrame(animate);
				renderer.render(scene, camera);
				controls.update();
				stats.update();
				
				//tetrahedron.rotation.z += .001;
				// tetrahedron.rotation.x += .001;
			};
			
			animate();
		},

		resizeRendererOnWindowResize: function() {

			window.addEventListener('resize', utils.debounce(function() {
				
				if (renderer) {
	
					camera.aspect = window.innerWidth / window.innerHeight;
					camera.updateProjectionMatrix();
					renderer.setSize(window.innerWidth, window.innerHeight);
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
			light2.position.set(0, 2, -8);
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

		addFloor: function() {
			var planeGeometry = new THREE.PlaneBufferGeometry(100, 100);
			planeGeometry.rotateX(-Math.PI / 2);
			var planeMaterial = new THREE.ShadowMaterial({ opacity: 0.2 });

			var plane = new THREE.Mesh(planeGeometry, planeMaterial);
			plane.position.y = -1;
			plane.receiveShadow = true;
			scene.add(plane);

			var helper = new THREE.GridHelper(1000, 100);
			helper.material.opacity = .25;
			helper.material.transparent = true;
			scene.add(helper);
		},

		setUpScene: function() {

			let self = this;
			scene = new THREE.Scene();
			scene.background = new THREE.Color(0xf0f0f0);
			camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
			renderer = new THREE.WebGLRenderer();
			renderer.setSize(window.innerWidth, window.innerHeight);
			document.body.appendChild(renderer.domElement);

			if (self.settings.axesHelper.activateAxesHelper) {

				self.activateAxesHelper();
			}
		},

		addTetrahedron: function() {
			
			let self = this;
			let geometry = new THREE.TetrahedronGeometry(self.settings.tetrahedron.size, 0);
			let material = new THREE.MeshBasicMaterial({wireframe: true, color: 0x08CDFA });
			//let material = new THREE.MeshPhongMaterial({color: 0x08CDFA });
			
			
			
			
			
			// tetrahedron.rotation.z = Math.PI / 4;
			geometry.applyMatrix( new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 1, 0, -1 ).normalize(), Math.atan( Math.sqrt(2)) ) );
			
			
			//tetrahedron.position.y += self.settings.tetrahedron.size / 2;
			
			
			console.log(geometry.vertices);
			
			for (let i = 0; i < geometry.vertices.length; i++) {
				
				geometry.vertices[i].y += self.settings.tetrahedron.size / 2;
				geometry.verticesNeedUpdate = true;
				
				let color = 0xff0000;
				if (i === 2) color = 0x00ff00;
				
				self.showPoint(geometry.vertices[i].x, geometry.vertices[i].y, geometry.vertices[i].z, color);
			}
			
			let centroidOfBottomFace_x = (geometry.vertices[0].x + geometry.vertices[1].x + geometry.vertices[3].x) / 3;
			let centroidOfBottomFace_y = (geometry.vertices[0].y + geometry.vertices[1].y + geometry.vertices[3].y) / 3;
			let centroidOfBottomFace_z = (geometry.vertices[0].z + geometry.vertices[1].z + geometry.vertices[3].z) / 3;
			self.showPoint(centroidOfBottomFace_x, centroidOfBottomFace_y, centroidOfBottomFace_z, 0x0000ff);
			
			
			tetrahedron = new THREE.Mesh(geometry, material);
			//tetrahedron.rotation.y = Math.PI / 4;
			//geometry.verticesNeedUpdate = true;
			scene.add(tetrahedron);
			
			// var material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
			// var geometry = new THREE.Geometry();
			// geometry.vertices.push(new THREE.Vector3( -10, 0, 0) );
			// geometry.vertices.push(new THREE.Vector3( 0, 10, 0) );
		},
		
		showPoint: function(x, y, z, color) {
			let dotGeometry = new THREE.Geometry();
			dotGeometry.vertices.push(new THREE.Vector3(x, y, z));
			let dotMaterial = new THREE.PointsMaterial({ size: 10, sizeAttenuation: false, color: color });
			let dot = new THREE.Points(dotGeometry, dotMaterial);
			scene.add(dot);
		},
		
		activateAxesHelper: function() {
			let self = this;
			let axesHelper = new THREE.AxesHelper(self.settings.axesHelper.axisLength);
			scene.add(axesHelper);

			self.labelAxes();
		},

		labelAxes: function() {

			let self = this;
			var loader = new THREE.FontLoader();
			loader.load('../assets/vendors/js/three.js/examples/fonts/helvetiker_regular.typeface.json', function (font) {
				
				let fontStyle = {
					font: font,
					size: 1,
					height: 0,
					curveSegments: 1
				};
				
				let textGeometry = new THREE.TextGeometry('Y', fontStyle);
				let textMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
				let mesh = new THREE.Mesh(textGeometry, textMaterial);
				textGeometry.translate(0, self.settings.axesHelper.axisLength, 0);
				scene.add(mesh);
				
				textGeometry = new THREE.TextGeometry('X', fontStyle);
				textMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
				mesh = new THREE.Mesh(textGeometry, textMaterial);
				textGeometry.translate(self.settings.axesHelper.axisLength, 0, 0);
				scene.add(mesh);
				
				textGeometry = new THREE.TextGeometry('Z', fontStyle);
				textMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
				mesh = new THREE.Mesh(textGeometry, textMaterial);
				textGeometry.translate(0, 0, self.settings.axesHelper.axisLength);
				scene.add(mesh);
			});
		}
	}
}