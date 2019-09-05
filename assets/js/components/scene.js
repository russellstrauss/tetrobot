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
	var distinctColors = [new THREE.Color('#e6194b'), new THREE.Color('#3cb44b'), new THREE.Color('#ffe119'), new THREE.Color('#4363d8'), new THREE.Color('#f58231'), new THREE.Color('#911eb4'), new THREE.Color('#46f0f0'), new THREE.Color('#f032e6'), new THREE.Color('#bcf60c'), new THREE.Color('#fabebe'), new THREE.Color('#008080'), new THREE.Color('#e6beff'), new THREE.Color('#9a6324'), new THREE.Color('#fffac8'), new THREE.Color('#800000'), new THREE.Color('#aaffc3'), new THREE.Color('#808000'), new THREE.Color('#ffd8b1'), new THREE.Color('#000075'), new THREE.Color('#808080'), new THREE.Color('#ffffff'), new THREE.Color('#000000')];
	var currentStep;
	var nextStep, top, center; // testing
	
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
			controls.enablePan = !utils.mobile();
			controls.minDistance = 18;
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
		
		goLeft: function(tetrahedronGeometry, triangleGeometry) {
			
			let self = this;
			let geometry = tetrahedronGeometry.clone();
			self.threeStepRotation(geometry, triangleGeometry.vertices[1], triangleGeometry.vertices[0], 0);
			
			let material = new THREE.MeshBasicMaterial({ wireframe: true, color: distinctColors[self.settings.stepCount] });
			let mesh = new THREE.Mesh(geometry, wireframeMaterial);
			scene.add(mesh);
			
			return geometry;
		},
		
		goRight: function(tetrahedronGeometry, triangleGeometry) {
			
			let self = this;
			let geometry = tetrahedronGeometry.clone();
			self.threeStepRotation(geometry, triangleGeometry.vertices[0], triangleGeometry.vertices[1], 0);
			
			let material = new THREE.MeshBasicMaterial({ wireframe: true, color: distinctColors[self.settings.stepCount] });
			let mesh = new THREE.Mesh(geometry, wireframeMaterial);
			scene.add(mesh);
			
			return geometry;
		},
		
		goBack: function(tetrahedronGeometry, triangleGeometry) {
			
			let self = this;
			let geometry = tetrahedronGeometry.clone();
			self.threeStepRotation(geometry, triangleGeometry.vertices[2], triangleGeometry.vertices[0], Math.PI);
			geometry.rotateX(Math.PI);
			
			let material = new THREE.MeshBasicMaterial({ wireframe: true, color: distinctColors[self.settings.stepCount] });
			
			let mesh = new THREE.Mesh(geometry, wireframeMaterial);
			scene.add(mesh);
			
			return geometry;
		},
		
		addTetrahedron: function() {
			
			let self = this;
			tetrahedronGeometry = new THREE.TetrahedronGeometry(self.settings.tetrahedron.size, 0);
			tetrahedronGeometry.applyMatrix( new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 1, 0, -1 ).normalize(), Math.atan( Math.sqrt(2)) ) ); // Rotate to be flat on floor
			tetrahedronGeometry.rotateY(Math.PI/4); // rotate to line up with x-axis
			
			let centroidOfBottomFace = self.calculateCentroidOfBottomFace(tetrahedronGeometry);
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
			
			self.labelDirections(triangleGeometry);
		},
		
		getBottomFace: function(tetrahedronGeometry) {
			
			let self = this;
			let bottomFace = new THREE.Geometry();
			
			tetrahedronGeometry.vertices.forEach(function(vertex) {
				
				if (vertex.y === 0) { // Relies on there being no rounding errors
					
					bottomFace.vertices.push(vertex);
				}
			});
			
			return bottomFace;
		},
		
		step: function(tetrahedronGeometry, direction) {
			
			let self = this;
			let bottomFace = self.getBottomFace(tetrahedronGeometry);
			
			if (direction === 'L') {
				let copy = tetrahedronGeometry.clone();
				nextStep = self.goLeft(copy, bottomFace);
			}
			else if (direction === 'R') {
				nextStep = self.goRight(tetrahedronGeometry, bottomFace);
			}
			else if (direction === 'O') {
				nextStep = self.goBack(tetrahedronGeometry, bottomFace);
			}
			
			// Calculate which edge of the tetrahedron shares the previous step--the 'O' edge--by comparing which two vertices coincide
			// let oppositeSide = {};
			// oppositeSide.vertices = [];
			// tetrahedronGeometry.vertices.forEach(function(tetVertex) {
				
			// 	bottomFace.vertices.forEach(function(triVertex) {
					
			// 		if (tetVertex.x === triVertex.x && tetVertex.y === triVertex.y && tetVertex.z === triVertex.z) { // WARNING will break with rounding errors
			// 			oppositeSide.vertices.push(triVertex);
			// 		}
			// 	});
			// });
			// self.labelDirections(bottomFace);
			
			self.settings.stepCount += 1;
			return nextStep;
		},
		
		threeStepRotation: function(geometry, axisPt1, axisPt2, angle) {
			
			let self = this;
			
			// uncomment to visualize endpoints of rotation axis
			// self.showPoint(axisPt1, new THREE.Color('red'));
			// self.showPoint(axisPt2, new THREE.Color('red'));
			
			let v = new THREE.Vector3(axisPt2.x - axisPt1.x, axisPt2.y - axisPt1.y, axisPt2.z - axisPt1.z);
			v.normalize();
			let theta = Math.atan(v.x/v.z); // is there a problem using arctan here? theta does not have a zero value when passing in a 0-angle of rotation
			v.applyAxisAngle(new THREE.Vector3(0, 1, 0), -1 * theta);
			let phi = Math.atan(v.y/Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.z, 2)))
			v.applyAxisAngle(new THREE.Vector3(1, 0, 0), phi);
			v.applyAxisAngle(new THREE.Vector3(0, 0, 1), angle);
			
			geometry.translate(-1 * axisPt1.x, -1 * axisPt1.y, -1 * axisPt1.z);
			geometry.rotateZ(angle);
			geometry.rotateX(-1 * phi);
			geometry.rotateY(theta);
			geometry.translate(axisPt1.x, axisPt1.y, axisPt1.z);
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
		
		calculateCentroidOfBottomFace: function(tetrahedronGeometry) {
			
			let centroidOfBottomFace = {};
			centroidOfBottomFace.x = (tetrahedronGeometry.vertices[0].x + tetrahedronGeometry.vertices[1].x + tetrahedronGeometry.vertices[3].x) / 3;
			centroidOfBottomFace.y = (tetrahedronGeometry.vertices[0].y + tetrahedronGeometry.vertices[1].y + tetrahedronGeometry.vertices[3].y) / 3;
			centroidOfBottomFace.z = (tetrahedronGeometry.vertices[0].z + tetrahedronGeometry.vertices[1].z + tetrahedronGeometry.vertices[3].z) / 3;
			
			return centroidOfBottomFace;
		},
		
		calculateCentroidLocation: function(geometryVertices) { // Calculating centroid of a tetrahedron: https://www.youtube.com/watch?v=Infxzuqd_F4
			
			let result = {};
			let x = 0, y = 0, z = 0;
			
			for (let i = 0; i < geometryVertices.length; i++) {
				
				x += geometryVertices[i].x;
				y += geometryVertices[i].y;
				z += geometryVertices[i].z;
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
		
		// Input: triangle geometry of the tetrahedron face that is currently on the floor, then will label midpoint directions for left, right, and opposite
		labelDirections: function(triangleGeometry) {
			
			let self = this;
			let midpoints = [];
			midpoints.push(self.getMidpoint(triangleGeometry.vertices[0], triangleGeometry.vertices[1]));
			midpoints.push(self.getMidpoint(triangleGeometry.vertices[1], triangleGeometry.vertices[2]));
			midpoints.push(self.getMidpoint(triangleGeometry.vertices[2], triangleGeometry.vertices[0]));
			
			let labels = ['R', 'L','O'];
			
			let colors = [new THREE.Color( 'black' ), new THREE.Color( 'black' ), new THREE.Color( 'black' )]; 
			for (let i = 0; i < midpoints.length; i++) {

				self.showPoint(midpoints[i], colors[i]);
				self.labelPoint(midpoints[i], labels[i], new THREE.Color(0x000000));
			}
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
				
				console.log('Fonts loaded successfully.');
				self.settings.font.fontStyle.font = font;
				
				self.begin();
				if (self.settings.axesHelper.activateAxesHelper) self.labelAxes();
			}, function(event) { // in progress event.
				console.log('Attempting to load fonts.')
			}, function(event) { // error event
				
				console.log('Error loading fonts. Webserver required due to CORS policy.');
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
			
			self.showPoint(highest);
			return highest;
		},
		
		setUpButtons: function() {
			
			let self = this;
			let message = document.getElementById('message');
			
			document.addEventListener('keyup', function(event) {
				
				let L = 76;
				let R = 82;
				let O = 79;
				
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
			});
		}
	}
}