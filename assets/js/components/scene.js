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
			
			scene = graphics.setUpScene(scene);
			renderer = graphics.setUpRenderer(renderer);
			camera = graphics.setUpCamera(camera);
			graphics.addFloor(scene);
			graphics.enableStats(stats);
			controls = graphics.enableControls(controls, renderer, camera);
			graphics.resizeRendererOnWindowResize(renderer, camera);
			graphics.setUpLights(scene);
			self.addTetrahedron();
			graphics.setCameraLocation(camera, self.settings.defaultCameraLocation);
			
			var animate = function() {

				requestAnimationFrame(animate);
				renderer.render(scene, camera);
				controls.update();
				stats.update();
				
				tetrahedron.geometry = graphics.rotateGeometryAboutLine(tetrahedron.geometry, tetrahedron.geometry.vertices[0], tetrahedron.geometry.vertices[1],  .00000001);
				tetrahedron.verticesNeedUpdate = true;
			};
			
			animate(); 
		},
		
		goLeft: function(tetrahedronGeometry, bottomFace) {
			
			let self = this;
			let geometry = tetrahedronGeometry.clone();
			geometry = graphics.rotateGeometryAboutLine(geometry, bottomFace.vertices[2], bottomFace.vertices[1],  -1.910633236249);

			let material = new THREE.MeshBasicMaterial({ wireframe: true, color: distinctColors[self.settings.stepCount] });
			let mesh = new THREE.Mesh(geometry, wireframeMaterial);
			scene.add(mesh);
			
			return geometry;
		},
		
		goRight: function(tetrahedronGeometry, bottomFace) {
			
			let self = this;
			let geometry = tetrahedronGeometry.clone();
			geometry = graphics.rotateGeometryAboutLine(geometry, bottomFace.vertices[0], bottomFace.vertices[1], 1.910633236249);
			
			let material = new THREE.MeshBasicMaterial({ wireframe: true, color: distinctColors[self.settings.stepCount] });
			let mesh = new THREE.Mesh(geometry, material);
			scene.add(mesh);
			
			// rotate so next move is correct
			let centroid = graphics.getCentroid(geometry);
			let top = graphics.getHighestVertex(geometry);
			graphics.drawLine(centroid, top, scene);
			geometry = graphics.rotateGeometryAboutLine(geometry, centroid, top, 2 * Math.PI / 3);
			bottomFace = graphics.rotateGeometryAboutLine(bottomFace, centroid, top, 4 * Math.PI / 3);

			return geometry;
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

		getDirectionVector: function(oppositeMidpoint, top) {

			let self = this;
			top.y = 0;

			currentStep.direction = new THREE.Vector3();

			//currentStep.direction.subVectors(top, oppositeMidpoint).normalize();
			graphics.drawLine(oppositeMidpoint, top, scene);

			
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
			graphics.showPoints(previousRollEdge, scene, 0x00ff00);

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
				graphics.labelPoint(tetrahedronGeometry.vertices[i], i.toString(), scene, colors[i]);
			}
			
			tetrahedron = new THREE.Mesh(startingGeometry, wireframeMaterial);
			scene.add(tetrahedron);

			let startingOppositeEnpoint = graphics.getMidpoint(tetrahedronGeometry.vertices[0], tetrahedronGeometry.vertices[3]);
			graphics.showPoint(startingOppositeEnpoint, scene, new THREE.Color('purple'));
			console.log(this.isRightTurn(tetrahedronGeometry.vertices[3], tetrahedronGeometry.vertices[1], tetrahedronGeometry.vertices[0]));

			
			this.addNextStep(tetrahedronGeometry);

			currentStep = startingGeometry;
		},

		isRightTurn: function(startingPoint, turningPoint, endingPoint) { // This might only work if vectors are flat on the ground since I am using y-component to determine sign

			let segment1 = graphics.createVector(startingPoint, turningPoint);
			let segment2 = graphics.createVector(turningPoint, endingPoint);

			let result = new THREE.Vector3();
			result.crossVectors(segment1, segment2);

			// let showResult = new THREE.ArrowHelper(result.clone().normalize(), startingPoint, graphics.getMagnitude(result), 0x00ff00);
			// scene.add(showResult);

			return result.y > 0;
		},

		addNextStep: function(tetrahedronGeometry, oppositeMidpoint, direction) {

			let A = graphics.getHighestVertex(tetrahedronGeometry);
			let B = graphics.getMidpoint(tetrahedronGeometry.vertices[0], tetrahedronGeometry.vertices[1]);
			graphics.showPoint(A, scene, new THREE.Color('orange'));
			graphics.showPoint(B, scene, new THREE.Color('black'));
			
			let normal = graphics.createVector(tetrahedronGeometry.vertices[0], tetrahedronGeometry.vertices[1]);
			normal.y = 0;
			let axis = new THREE.Vector3(0, 1, 0); // rotate a vector
			let C = normal.applyAxisAngle(axis, -Math.PI / 2);
			
			
			let AB = graphics.createVector(B, A);
			let BC = graphics.createVector(B, C);
			BC.setLength(graphics.getMagnitude(AB));
			
			let showAB = new THREE.ArrowHelper(AB.clone().normalize(), B, graphics.getMagnitude(AB), 0xff0000);
			scene.add(showAB);

			let showBC = new THREE.ArrowHelper(BC.clone().normalize(), B, graphics.getMagnitude(BC), 0xff0000);
			scene.add(showBC);

			let rotationAngle = graphics.getAngleBetweenVectors(AB, BC);

			let newLocationGeometry = graphics.rotateGeometryAboutLine(tetrahedronGeometry, tetrahedronGeometry.vertices[0], tetrahedronGeometry.vertices[1], rotationAngle);
			let newTetrahedron = new THREE.Mesh(newLocationGeometry, wireframeMaterial);
			scene.add(newTetrahedron);

			return newLocationGeometry;
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
				graphics.appSettings.font.enable = false;
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
					
					graphics.resetScene(self, scene);
					
					message.textContent = 'Reset scene';
					setTimeout(function() {
						message.textContent = '';
					}, self.settings.messageDuration);
				}
			});
		}
	}
}