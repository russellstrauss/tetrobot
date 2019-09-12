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
			activateLightHelpers: false,
			axesHelper: {
				activateAxesHelper: true,
				axisLength: 10
			},
			tetrahedron: {
				size: 5
			},
			font: {
				enable: true,
				fontStyle: {
					font: null,
					size: 1,
					height: 0,
					curveSegments: 1
				}
			},
			defaultCameraLocation: {
				x: -20,
				y: 20,
				z: 20
			},
			stepCount: 0,
			messageDuration: 2000,
			errorLogging: false
		},
		
		init: function() {

			let self = this;
			self.loadFont();
			self.setUpButtons();
		},
		
		begin: function() {
			
			let self = this;
			
			self.setUpScene();
			self.addFloor();
			self.enableStats();
			self.enableControls();
			self.resizeRendererOnWindowResize();
			self.setUpLights();
			self.addTetrahedron();
			self.setCameraLocation(self.settings.defaultCameraLocation);
			
			var animate = function() {

				requestAnimationFrame(animate);
				renderer.render(scene, camera);
				controls.update();
				stats.update();
			};
			
			animate(); 
		},
		
		setCameraLocation: function(pt) {
			camera.position.x = pt.x;
			camera.position.y = pt.y;
			camera.position.z = pt.z;
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
			controls.enablePan = !utils.mobile();
			controls.minDistance = 10;
			controls.maxDistance = 100;
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
		
		resetScene: function() {
			
			let self = this;
			
			self.settings.stepCount = 0;
			
			for (let i = scene.children.length - 1; i >= 0; i--) {
				let obj = scene.children[i];
				scene.remove(obj);
			}
			
			self.addFloor();
			self.addTetrahedron();
			self.setUpLights();
			self.setCameraLocation(self.settings.defaultCameraLocation);
		},
		
		goLeft: function(tetrahedronGeometry, bottomFace) {
			
			let self = this;
			let geometry = tetrahedronGeometry.clone();
			geometry = self.rotateGeometryAboutLine(geometry, bottomFace.vertices[1], bottomFace.vertices[1],  Math.PI/6);
			
			self.showPoint(bottomFace.vertices[2], distinctColors[self.settings.stepCount]);
			self.showPoint(bottomFace.vertices[1], distinctColors[self.settings.stepCount]);
			
			let material = new THREE.MeshBasicMaterial({ wireframe: true, color: distinctColors[self.settings.stepCount] });
			let mesh = new THREE.Mesh(geometry, wireframeMaterial);
			scene.add(mesh);
			
			return geometry;
		},
		
		goRight: function(tetrahedronGeometry, bottomFace) {
			
			let self = this;
			let geometry = tetrahedronGeometry.clone();
			geometry = self.rotateGeometryAboutLine(geometry, bottomFace.vertices[0], bottomFace.vertices[1], 1.910633236249);
			
			self.showPoint(bottomFace.vertices[0], distinctColors[self.settings.stepCount]);
			self.showPoint(bottomFace.vertices[1], distinctColors[self.settings.stepCount]);
			
			let material = new THREE.MeshBasicMaterial({ wireframe: true, color: distinctColors[self.settings.stepCount] });
			let mesh = new THREE.Mesh(geometry, material);
			scene.add(mesh);
			
			// rotate so next move is correct
			let centroid = self.getCentroid(geometry);
			let top = self.getHighestVertex(geometry);
			self.drawLine(centroid, top);
			geometry = self.rotateGeometryAboutLine(geometry, centroid, top, 2 * Math.PI / 3);
			bottomFace = self.rotateGeometryAboutLine(bottomFace, centroid, top, 4 * Math.PI / 3);

			return geometry;
		},
		
		goBack: function(tetrahedronGeometry, triangleGeometry) {
			
			let self = this;
			let geometry = tetrahedronGeometry.clone();
			self.rotateGeometryAboutLine(geometry, triangleGeometry.vertices[2], triangleGeometry.vertices[0], 1.910633236249);
			//geometry.rotateX(Math.PI);
			
			let material = new THREE.MeshBasicMaterial({ wireframe: true, color: distinctColors[self.settings.stepCount] });
			
			let mesh = new THREE.Mesh(geometry, wireframeMaterial);
			scene.add(mesh);
			
			return geometry;
		},
		
		step: function(tetrahedronGeometry, direction) {
			
			let self = this;
			let bottomFace = self.getBottomFace(tetrahedronGeometry);
			
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
			previousRollEdge = self.getSharedVertices(tetrahedronGeometry, bottomFace);
			self.showPoints(previousRollEdge, 0x00ff00);

			bottomFace = self.getBottomFace(nextStep);
			self.labelDirections(currentStep, bottomFace);
			
			self.settings.stepCount += 1;
			return nextStep;
		},
		
		addTetrahedron: function() {
			
			let self = this;
			tetrahedronGeometry = new THREE.TetrahedronGeometry(self.settings.tetrahedron.size, 0);
			tetrahedronGeometry.applyMatrix( new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 1, 0, -1 ).normalize(), Math.atan( Math.sqrt(2)) ) ); // Rotate to be flat on floor
			tetrahedronGeometry.rotateY(Math.PI/4); // rotate to line up with x-axis
			
			let centroidOfBottomFace = self.getCentroidOfBottomFace(tetrahedronGeometry);
			let tetrahedronHeight = self.getDistance(centroidOfBottomFace, tetrahedronGeometry.vertices[2]);
			
			tetrahedronGeometry.translate(0 , tetrahedronHeight / 4, 0);
			triangleGeometry = self.getBottomFace(tetrahedronGeometry);
			
			let startingGeometry = tetrahedronGeometry.clone();
			
			for (let i = 0; i < tetrahedronGeometry.vertices.length; i++) {
				
				let colors = 	[0xCE3611, 	0x00CE17, 	0x03BAEE, 	0x764E8C]; 
				// 				[red, 		green, 		blue, 		purple]
				
				tetrahedronGeometry.verticesNeedUpdate = true;
				self.showPoint(tetrahedronGeometry.vertices[i], colors[i]);
			}
			
			tetrahedron = new THREE.Mesh(tetrahedronGeometry, shadeMaterial);
			scene.add(tetrahedron);
			
			let ogTetrahedron = new THREE.Mesh(startingGeometry, wireframeMaterial);
			scene.add(ogTetrahedron);
			
			currentStep = startingGeometry;
			
			//self.labelDirections(triangleGeometry);
		},
		
		getBottomFace: function(tetrahedronGeometry) {
			
			let self = this;
			let bottomFace = new THREE.Geometry();
			
			tetrahedronGeometry.vertices.forEach(function(vertex) {
				
				if (self.roundHundreths(vertex.y) === 0) { // Relies on there being no rounding errors
					
					bottomFace.vertices.push(vertex);
				}
			});
			
			return bottomFace;
		},
		
		rotatePointAboutLine: function(pt, axisPt1, axisPt2, angle) {
			
			let self = this;
			
			// uncomment to visualize endpoints of rotation axis
			// self.showPoint(axisPt1, new THREE.Color('red'));
			// self.showPoint(axisPt2, new THREE.Color('red'));
			
			let u = new THREE.Vector3(0, 0, 0), rotation1 = new THREE.Vector3(0, 0, 0), rotation2 = new THREE.Vector3(0, 0, 0);
			let d = 0.0;
			
			// Move rotation axis to origin
			rotation1.x = pt.x - axisPt1.x;
			rotation1.y = pt.y - axisPt1.y;
			rotation1.z = pt.z - axisPt1.z;
		 
			// Get unit vector equivalent to rotation axis
			u.x = axisPt2.x - axisPt1.x;
			u.y = axisPt2.y - axisPt1.y;
			u.z = axisPt2.z - axisPt1.z;
			u.normalize();
			d = Math.sqrt(u.y*u.y + u.z*u.z);
			
			// Rotation onto first plane
			if (d != 0) {
			   rotation2.x = rotation1.x;
			   rotation2.y = rotation1.y * u.z / d - rotation1.z * u.y / d;
			   rotation2.z = rotation1.y * u.y / d + rotation1.z * u.z / d;
			}
			else {
			   rotation2 = rotation1;
			}
			
			// Rotation rotation onto second plane
			rotation1.x = rotation2.x * d - rotation2.z * u.x;
			rotation1.y = rotation2.y;
			rotation1.z = rotation2.x * u.x + rotation2.z * d;
			
			// Oriented to axis, now perform original rotation
			rotation2.x = rotation1.x * Math.cos(angle) - rotation1.y * Math.sin(angle);
			rotation2.y = rotation1.x * Math.sin(angle) + rotation1.y * Math.cos(angle);
			rotation2.z = rotation1.z;
		 
			// Undo rotation 1
			rotation1.x =   rotation2.x * d + rotation2.z * u.x;
			rotation1.y =   rotation2.y;
			rotation1.z = - rotation2.x * u.x + rotation2.z * d;
		 
			// Undo rotation 2
			if (d != 0) {
			   rotation2.x =   rotation1.x;
			   rotation2.y =   rotation1.y * u.z / d + rotation1.z * u.y / d;
			   rotation2.z = - rotation1.y * u.y / d + rotation1.z * u.z / d;
			}
			else {
			   rotation2 = rotation1;
			}
		 
			// Move back into place
			rotation1.x = rotation2.x + axisPt1.x;
			rotation1.y = rotation2.y + axisPt1.y;
			rotation1.z = rotation2.z + axisPt1.z;

			return rotation1;
		},
		
		rotateGeometryAboutLine: function(geometry, axisPt1, axisPt2, angle) {
			
			let self = this;
			
			for (let i = 0; i < geometry.vertices.length; i++) {
				geometry.vertices[i] = self.rotatePointAboutLine(geometry.vertices[i], axisPt1, axisPt2, angle);
			}
			
			return geometry;
		},
		
		showPoints: function(geometry, color, opacity) {
			
			let self = this;
			
			for (let i = 0; i < geometry.vertices.length; i++) {
				self.showPoint(geometry.vertices[i], color, opacity);
			}
		},
		
		showPoint: function(pt, color, opacity) {
			color = color || 0xff0000;
			opacity = opacity || 1;
			let dotGeometry = new THREE.Geometry();
			dotGeometry.vertices.push(new THREE.Vector3(pt.x, pt.y, pt.z));
			let dotMaterial = new THREE.PointsMaterial({ 
				size: 10,
				sizeAttenuation: false,
				color: color,
				opacity: opacity,
				transparent: true
			});
			let dot = new THREE.Points(dotGeometry, dotMaterial);
			scene.add(dot);
		},
		
		showVector: function(vector, origin, color) {
			
			color = color || 0xff0000;
			let arrowHelper = new THREE.ArrowHelper(vector, origin, vector.length(), color);
			scene.add(arrowHelper);
		},
		
		drawLine: function(pt1, pt2) {
			
			let material = new THREE.LineBasicMaterial({ color: 0x0000ff });
			let geometry = new THREE.Geometry();
			geometry.vertices.push(new THREE.Vector3(pt1.x, pt1.y, pt1.z));
			geometry.vertices.push(new THREE.Vector3(pt2.x, pt2.y, pt2.z));
			
			let line = new THREE.Line(geometry, material);
			scene.add(line);
		},
		
		getDistance: function(pt1, pt2) { // create point class?
			
			let squirt = Math.pow((pt2.x - pt1.x), 2) + Math.pow((pt2.y - pt1.y), 2) + Math.pow((pt2.z - pt1.z), 2);
			return Math.sqrt(squirt);
		},
		
		createVector: function(pt1, pt2) {
			return new THREE.Vector3(pt2.x - pt1.x, pt2.y - pt2.y, pt2.z - pt1.z);
		},
		
		getMidpoint: function(pt1, pt2) {
			
			let midpoint = {};
			
			midpoint.x = (pt1.x + pt2.x) / 2;
			midpoint.y = (pt1.y + pt2.y) / 2;
			midpoint.z = (pt1.z + pt2.z) / 2;
			
			return midpoint;
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
		
		getCentroidOfBottomFace: function(tetrahedronGeometry) {
			
			let centroidOfBottomFace = {};
			centroidOfBottomFace.x = (tetrahedronGeometry.vertices[0].x + tetrahedronGeometry.vertices[1].x + tetrahedronGeometry.vertices[3].x) / 3;
			centroidOfBottomFace.y = (tetrahedronGeometry.vertices[0].y + tetrahedronGeometry.vertices[1].y + tetrahedronGeometry.vertices[3].y) / 3;
			centroidOfBottomFace.z = (tetrahedronGeometry.vertices[0].z + tetrahedronGeometry.vertices[1].z + tetrahedronGeometry.vertices[3].z) / 3;
			
			return centroidOfBottomFace;
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
		
		activateAxesHelper: function() {
			
			let self = this;
			let axesHelper = new THREE.AxesHelper(self.settings.axesHelper.axisLength);
			scene.add(axesHelper);
		},

		getSharedVertices: function(geometry1, geometry2) {

			let self = this;

			let result = new THREE.Geometry();
			geometry1.vertices.forEach(function(geometry1Vertex) {
				
				geometry2.vertices.forEach(function(geometry2Vertex) {
					
					if (self.roundHundreths(geometry1Vertex.x) === self.roundHundreths(geometry2Vertex.x) && 
						self.roundHundreths(geometry1Vertex.y) === self.roundHundreths(geometry2Vertex.y) &&
						self.roundHundreths(geometry1Vertex.z) === self.roundHundreths(geometry2Vertex.z))
					{
						result.vertices.push(geometry2Vertex);
					}
				});
			});

			return result;
		},
		
		// Input: triangle geometry of the tetrahedron face that is currently on the floor, then will label midpoint directions for left, right, and opposite

		// try passing in previous edge to label new direction
		labelDirections: function(triangleGeometry, bottomFace) {
			
			let self = this;
			let midpoints = [];

			// Get shared edge with parameters and set midpoint to O
			let oppositeSide = self.getSharedVertices(triangleGeometry, bottomFace);
			let oppositeMidpoint = self.getMidpoint(oppositeSide.vertices[0], oppositeSide.vertices[1]);
			self.showPoint(oppositeMidpoint, black)
			self.labelPoint(oppositeMidpoint, 'O', black);

			// midpoints.push(self.getMidpoint(triangleGeometry.vertices[0], triangleGeometry.vertices[1]));
			// midpoints.push(self.getMidpoint(triangleGeometry.vertices[1], triangleGeometry.vertices[2]));
			// midpoints.push(self.getMidpoint(triangleGeometry.vertices[2], triangleGeometry.vertices[0]));
			
			// let labels = ['R', 'L','O'];
			
			// let colors = [new THREE.Color( 'black' ), new THREE.Color( 'black' ), new THREE.Color( 'black' )]; 
			// for (let i = 0; i < midpoints.length; i++) {

			// 	self.showPoint(midpoints[i], colors[i]);
			// 	self.labelPoint(midpoints[i], labels[i], new THREE.Color(0x000000));
			// }
		},
		
		labelAxes: function() {
			
			let self = this;
			if (self.settings.font.enable) {
				let textGeometry = new THREE.TextGeometry('Y', self.settings.font.fontStyle);
				let textMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
				let mesh = new THREE.Mesh(textGeometry, textMaterial);
				textGeometry.translate(0, self.settings.axesHelper.axisLength, 0);
				scene.add(mesh);
				
				textGeometry = new THREE.TextGeometry('X', self.settings.font.fontStyle);
				textMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
				mesh = new THREE.Mesh(textGeometry, textMaterial);
				textGeometry.translate(self.settings.axesHelper.axisLength, 0, 0);
				scene.add(mesh);
				
				textGeometry = new THREE.TextGeometry('Z', self.settings.font.fontStyle);
				textMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
				mesh = new THREE.Mesh(textGeometry, textMaterial);
				textGeometry.translate(0, 0, self.settings.axesHelper.axisLength);
				scene.add(mesh);
			}
		},
		
		loadFont: function() {
			
			let self = this;
			let loader = new THREE.FontLoader();
			let fontPath = '';
			fontPath = 'assets/vendors/js/three.js/examples/fonts/helvetiker_regular.typeface.json';

			loader.load(fontPath, function(font) { // success event
				
				if (self.settings.errorLogging) console.log('Fonts loaded successfully.');
				self.settings.font.fontStyle.font = font;
				
				self.begin();
				if (self.settings.axesHelper.activateAxesHelper) self.labelAxes();
			},
			function(event) { // in progress event.
				if (self.settings.errorLogging) console.log('Attempting to load font JSON now...');
			},
			function(event) { // error event
				
				if (self.settings.errorLogging) console.log('Error loading fonts. Webserver required due to CORS policy.');
				self.settings.font.enable = false;
				self.begin();
			});
		},
		
		/* 	Inputs: pt - point in space to label, in the form of object with x, y, and z properties; label - text content for label; color - optional */
		labelPoint: function(pt, label, color) {
			
			let self = this;
			if (self.settings.font.enable) {
				color = color || 0xff0000;
				let textGeometry = new THREE.TextGeometry(label, self.settings.font.fontStyle);
				let textMaterial = new THREE.MeshBasicMaterial({ color: color });
				let mesh = new THREE.Mesh(textGeometry, textMaterial);
				textGeometry.translate(pt.x, pt.y, pt.z);
				scene.add(mesh);
			}
		},
		
		getHighestVertex: function(geometry) {
			
			let self = this;
			let highest = new THREE.Vector3();
			geometry.vertices.forEach(function(vertex) {
				if (vertex.y > highest.y) {
					highest = vertex;
				}
			});
			
			return highest;
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
		},
		
		roundHundreths: function(num) {
			return Math.round(num * 100) / 100;
		}
	}
}