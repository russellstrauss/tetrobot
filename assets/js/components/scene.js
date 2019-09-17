module.exports = function() {
	
	var tetrahedron, renderer, scene, camera, controls;
	var tetrahedronGeometry;
	var triangleGeometry;
	var stats = new Stats();
	var wireframeMaterial = new THREE.MeshBasicMaterial({ wireframe: true, color: 0x08CDFA });
	var shadeMaterial = new THREE.MeshPhongMaterial({
		color: 0x08CDFA,
		side: THREE.DoubleSide,
		opacity: .5,
		transparent: true
	});
	var degradingMaterial = new THREE.MeshBasicMaterial({
		wireframe: true,
		color: 0x08CDFA,
		opacity: 1,
		transparent: true
	});
	var distinctColors = [new THREE.Color('#e6194b'), new THREE.Color('#3cb44b'), new THREE.Color('#ffe119'), new THREE.Color('#4363d8'), new THREE.Color('#f58231'), new THREE.Color('#911eb4'), new THREE.Color('#46f0f0'), new THREE.Color('#f032e6'), new THREE.Color('#bcf60c'), new THREE.Color('#fabebe'), new THREE.Color('#008080'), new THREE.Color('#e6beff'), new THREE.Color('#9a6324'), new THREE.Color('#fffac8'), new THREE.Color('#800000'), new THREE.Color('#aaffc3'), new THREE.Color('#808000'), new THREE.Color('#ffd8b1'), new THREE.Color('#000075'), new THREE.Color('#808080'), new THREE.Color('#ffffff'), new THREE.Color('#000000')];
	var currentStep;
	var nextStep, top, center; // testing
	var black = new THREE.Color('black');
	var previousRollEdge = {};
	previousRollEdge.vertices = [];
	
	return {
		
		settings: {
			tetrahedron: {
				size: 5
			},
			defaultCameraLocation: {
				x: -20,
				y: 20,
				z: 20
			},
			stepCount: 0,
			messageDuration: 2000
		},
		
		init: function() {

			let self = this;
			self.loadFont();
			self.setUpButtons();
		},
		
		begin: function() {
			
			let self = this;
			
			self.setUpScene();
			graphics.addFloor(scene);
			self.enableStats();
			controls = graphics.enableControls(controls, renderer, camera);
			graphics.resizeRendererOnWindowResize(renderer, camera);
			self.setUpLights();
			self.addTetrahedron();
			graphics.setCameraLocation(camera, self.settings.defaultCameraLocation);
			
			var animate = function() {

				requestAnimationFrame(animate);
				renderer.render(scene, camera);
				controls.update();
				stats.update();
			};
			
			animate(); 
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
			
			if (graphics.appSettings.activateLightHelpers) {
				graphics.activateLightHelpers(lights);
			}
		},

		activateLightHelpers: function(lights) {

			for (let i = 0; i < lights.length; i++) {
				let helper = new THREE.DirectionalLightHelper(lights[i], 5, 0x00000);
				scene.add(helper);
			}
		},

		setUpScene: function() {

			let self = this;
			scene = new THREE.Scene();
			scene.background = new THREE.Color(0xf0f0f0);
			camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
			renderer = new THREE.WebGLRenderer();
			renderer.setSize(window.innerWidth, window.innerHeight);
			document.body.appendChild(renderer.domElement);

			if (graphics.appSettings.axesHelper.activateAxesHelper) {

				graphics.activateAxesHelper(scene);
			}
		},
		
		resetScene: function() {
			
			let self = this;
			
			self.settings.stepCount = 0;
			
			for (let i = scene.children.length - 1; i >= 0; i--) {
				let obj = scene.children[i];
				scene.remove(obj);
			}
			
			graphics.addFloor(scene);
			self.addTetrahedron();
			self.setUpLights();
			graphics.setCameraLocation(camera, self.settings.defaultCameraLocation);
		},
		
		goLeft: function(tetrahedronGeometry, bottomFace) {
			
			let self = this;
			let geometry = tetrahedronGeometry.clone();
			
			geometry = graphics.rotateGeometryAboutLine(geometry, bottomFace.vertices[2], bottomFace.vertices[1],  -1.910633236249);
			
			// graphics.showPoint(bottomFace.vertices[2], distinctColors[self.settings.stepCount]);
			// graphics.showPoint(bottomFace.vertices[1], distinctColors[self.settings.stepCount]);
			
			let material = new THREE.MeshBasicMaterial({ wireframe: true, color: distinctColors[self.settings.stepCount] });
			let mesh = new THREE.Mesh(geometry, wireframeMaterial);
			scene.add(mesh);
			
			return geometry;
		},
		
		goRight: function(tetrahedronGeometry, bottomFace) {
			
			let self = this;
			let geometry = tetrahedronGeometry.clone();
			geometry = graphics.rotateGeometryAboutLine(geometry, bottomFace.vertices[0], bottomFace.vertices[1], 1.910633236249);
			
			// graphics.showPoint(bottomFace.vertices[0], distinctColors[self.settings.stepCount]);
			// graphics.showPoint(bottomFace.vertices[1], distinctColors[self.settings.stepCount]);
			
			let material = new THREE.MeshBasicMaterial({ wireframe: true, color: distinctColors[self.settings.stepCount] });
			let mesh = new THREE.Mesh(geometry, material);
			scene.add(mesh);
			
			// rotate so next move is correct
			let centroid = self.getCentroid(geometry);
			let top = graphics.getHighestVertex(geometry);
			graphics.drawLine(centroid, top, scene);
			geometry = graphics.rotateGeometryAboutLine(geometry, centroid, top, 2 * Math.PI / 3);
			bottomFace = graphics.rotateGeometryAboutLine(bottomFace, centroid, top, 4 * Math.PI / 3);

			return geometry;
		},

		getDirectionVector: function(oppositeMidpoint, top) {

			let self = this;
			top.y = 0;

			currentStep.direction = new THREE.Vector3();

			//currentStep.direction.subVectors(top, oppositeMidpoint).normalize();
			graphics.drawLine(oppositeMidpoint, top, scene);

			
		},
		
		goBack: function(tetrahedronGeometry, bottomFace) {
			
			let self = this;
			let geometry = tetrahedronGeometry.clone();
			geometry = graphics.rotateGeometryAboutLine(geometry, bottomFace.vertices[2], bottomFace.vertices[0], 1.910633236249);
			
			let material = new THREE.MeshBasicMaterial({ wireframe: true, color: distinctColors[self.settings.stepCount] });
			let mesh = new THREE.Mesh(geometry, wireframeMaterial);
			scene.add(mesh);
			
			return geometry;
		},
		
		step: function(tetrahedronGeometry, direction) {
			
			let self = this;
			let bottomFace = graphics.getBottomFace(tetrahedronGeometry);
			
			if (direction === 'L') {
				nextStep = self.goLeft(tetrahedronGeometry, bottomFace);
			}
			else if (direction === 'R') {
				nextStep = self.goRight(tetrahedronGeometry, bottomFace);
				
			}
			else if (direction === 'O') {
				nextStep = self.goBack(tetrahedronGeometry, bottomFace);
			}
			
			// Calculate which edge of the tetrahedron shares the previous step--the 'O' edge--by comparing which two vertices coincide
			previousRollEdge = graphics.getSharedVertices(tetrahedronGeometry, bottomFace);
			graphics.showPoints(previousRollEdge, 0x00ff00);

			bottomFace = graphics.getBottomFace(nextStep);
			self.labelDirections(currentStep, bottomFace);
			
			self.settings.stepCount += 1;
			return nextStep;
		},
		
		addTetrahedron: function() {
			
			let self = this;
			tetrahedronGeometry = new THREE.TetrahedronGeometry(self.settings.tetrahedron.size, 0);
			tetrahedronGeometry.applyMatrix( new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 1, 0, -1 ).normalize(), Math.atan( Math.sqrt(2)) ) ); // Rotate to be flat on floor
			tetrahedronGeometry.rotateY(Math.PI/4); // rotate to line up with x-axis
			
			let centroidOfBottomFace = graphics.getCentroidOfBottomFace(tetrahedronGeometry);
			let tetrahedronHeight = graphics.getDistance(centroidOfBottomFace, tetrahedronGeometry.vertices[2]);
			
			tetrahedronGeometry.translate(0 , tetrahedronHeight / 4, 0);
			triangleGeometry = graphics.getBottomFace(tetrahedronGeometry);
			
			let startingGeometry = tetrahedronGeometry.clone();
			
			for (let i = 0; i < tetrahedronGeometry.vertices.length; i++) {
				
				let colors = 	[0xCE3611, 	0x00CE17, 	0x03BAEE, 	0x764E8C]; 
				// 				[red, 		green, 		blue, 		purple]
				
				tetrahedronGeometry.verticesNeedUpdate = true;
				//graphics.showPoint(tetrahedronGeometry.vertices[i], colors[i]);
			}
			
			tetrahedron = new THREE.Mesh(tetrahedronGeometry, shadeMaterial);
			scene.add(tetrahedron);
			
			let ogTetrahedron = new THREE.Mesh(startingGeometry, wireframeMaterial);
			scene.add(ogTetrahedron);
			
			currentStep = startingGeometry;
			
			//self.labelDirections(triangleGeometry);
		},
		
		createTriangle: function(pt1, pt2, pt3) { // return geometry
			let triangleGeometry = new THREE.Geometry();
			triangleGeometry.vertices.push(new THREE.Vector3(pt1.x, pt1.y, pt1.z));
			triangleGeometry.vertices.push(new THREE.Vector3(pt2.x, pt2.y, pt2.z));
			triangleGeometry.vertices.push(new THREE.Vector3(pt3.x, pt3.y, pt3.z));
			triangleGeometry.faces.push(new THREE.Face3(0, 1, 2));
			triangleGeometry.computeFaceNormals();
			return triangleGeometry;
		},
		
		getCentroid: function(geometry) { // Calculating centroid of a tetrahedron: https://www.youtube.com/watch?v=Infxzuqd_F4
			
			let result = {};
			let x = 0, y = 0, z = 0;
			
			for (let i = 0; i < geometry.vertices.length; i++) {
				
				x += geometry.vertices[i].x;
				y += geometry.vertices[i].y;
				z += geometry.vertices[i].z;
			}
			
			x = x / 4;
			y = y / 4;
			z = z / 4;
			result = { x: x, y: y, z: z};
			return result;
		},
		
		getAngleBetweenVectors: function(vector1, vector2) {

			let dot = vector1.dot(vector2);
			let length1 = vector1.length();
			let length2 = vector2.length();			
			let angle = Math.acos(dot / (length1 * length2));
			return angle;
		},
		
		labelDirections: function(triangleGeometry, bottomFace) {
			
			let self = this;
			let midpoints = [];

			// Get shared edge with parameters and set midpoint to O
			let oppositeEdge = graphics.getSharedVertices(triangleGeometry, bottomFace);
			let oppositeMidpoint = graphics.getMidpoint(oppositeEdge.vertices[0], oppositeEdge.vertices[1]);
			graphics.showPoint(oppositeMidpoint, scene, black)
			graphics.labelPoint(oppositeMidpoint, 'O', scene, black);

			currentStep.oppositeEdge = oppositeEdge;

			currentStep.direction = self.getDirectionVector(oppositeMidpoint, graphics.getHighestVertex(currentStep));

			// midpoints.push(graphics.getMidpoint(triangleGeometry.vertices[0], triangleGeometry.vertices[1]));
			// midpoints.push(graphics.getMidpoint(triangleGeometry.vertices[1], triangleGeometry.vertices[2]));
			// midpoints.push(graphics.getMidpoint(triangleGeometry.vertices[2], triangleGeometry.vertices[0]));
			
			// let labels = ['R', 'L','O'];
			
			// let colors = [new THREE.Color( 'black' ), new THREE.Color( 'black' ), new THREE.Color( 'black' )]; 
			// for (let i = 0; i < midpoints.length; i++) {

			// 	graphics.showPoint(midpoints[i], colors[i]);
			// 	graphics.labelPoint(midpoints[i], labels[i], scene, new THREE.Color(0x000000));
			// }
		},
		
		loadFont: function() {
			
			let self = this;
			let loader = new THREE.FontLoader();
			let fontPath = '';
			fontPath = 'assets/vendors/js/three.js/examples/fonts/helvetiker_regular.typeface.json';

			loader.load(fontPath, function(font) { // success event
				
				if (graphics.appSettings.errorLogging) console.log('Fonts loaded successfully.');
				graphics.appSettings.font.fontStyle.font = font;
				
				self.begin();
				if (graphics.appSettings.axesHelper.activateAxesHelper) graphics.labelAxes(scene);
			},
			function(event) { // in progress event.
				if (graphics.appSettings.errorLogging) console.log('Attempting to load font JSON now...');
			},
			function(event) { // error event
				
				if (graphics.appSettings.errorLogging) console.log('Error loading fonts. Webserver required due to CORS policy.');
				self.settings.font.enable = false;
				self.begin();
			});
		},
		
		setUpButtons: function() {
			
			let self = this;
			let message = document.getElementById('message');
			
			document.addEventListener('keyup', function(event) {
				
				let L = 76;
				let R = 82;
				let O = 79;
				let esc = 27;
				
				if (event.keyCode === L) {
					
					currentStep = self.step(currentStep, 'L');
					
					message.textContent = 'Roll left';
					setTimeout(function() {
						message.textContent = '';
					}, self.settings.messageDuration);
				}
				if (event.keyCode === R) {
					
					currentStep = self.step(currentStep, 'R');
					
					message.textContent = 'Roll right';
					setTimeout(function() {
						message.textContent = '';
					}, self.settings.messageDuration);
				}
				if (event.keyCode === O) {
					
					currentStep = self.step(currentStep, 'O');
					
					message.textContent = 'Roll back';
					setTimeout(function() {
						message.textContent = '';
					}, self.settings.messageDuration);
				}
				if (event.keyCode === esc) {
					
					self.resetScene();
					
					message.textContent = 'Reset scene';
					setTimeout(function() {
						message.textContent = '';
					}, self.settings.messageDuration);
				}
			});
		}
	}
}