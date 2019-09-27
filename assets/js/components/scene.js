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
	var green = new THREE.Color('green');
	var blue = new THREE.Color('blue');
	var orange = new THREE.Color('orange');
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

		getDirectionVector: function(oppositeMidpoint, top) {

			let self = this;
			top.y = 0;

			currentStep.direction = new THREE.Vector3();

			//currentStep.direction.subVectors(top, oppositeMidpoint).normalize();
			graphics.drawLine(oppositeMidpoint, top, scene);

			
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
				//graphics.labelPoint(tetrahedronGeometry.vertices[i], i.toString(), scene, colors[i]);
			}
			
			tetrahedron = new THREE.Mesh(startingGeometry, wireframeMaterial);
			scene.add(tetrahedron);

			let startingOppositeMidpoint = graphics.getMidpoint(tetrahedronGeometry.vertices[0], tetrahedronGeometry.vertices[3]);
			tetrahedronGeometry.opposite = [tetrahedronGeometry.vertices[0], tetrahedronGeometry.vertices[3]];
			
			
			
			
			
			
			let firstRight = this.addNextStep(tetrahedronGeometry, startingOppositeMidpoint, 'left');
			
			let newTetrahedron = new THREE.Mesh(firstRight.clone(), wireframeMaterial);
			scene.add(newTetrahedron);
			
			this.setDirections(firstRight, firstRight.oppositeMidpoint);

			currentStep = startingGeometry;
		},
		
		setDirections(tetrahedronGeometry, oppositeMidpoint) {
			
			let bottomFace = graphics.getBottomFace(tetrahedronGeometry);
			
			// show step number
			if (this.settings.stepCount === 1) {
				let bottomFaceCentroid = graphics.getCentroid2D(bottomFace, scene);
				graphics.showPoint(bottomFaceCentroid, scene, black);
				graphics.labelPoint(bottomFaceCentroid, this.settings.stepCount.toString(), scene, black);
			}
			
			if (this.isRightTurn(oppositeMidpoint, bottomFace.vertices[2], bottomFace.vertices[1])) {
				tetrahedronGeometry.right = [bottomFace.vertices[2], bottomFace.vertices[1]];
			}
			else {
				tetrahedronGeometry.left = [bottomFace.vertices[2], bottomFace.vertices[1]];
			}
			if (this.isRightTurn(oppositeMidpoint, bottomFace.vertices[0], bottomFace.vertices[1])) {
				tetrahedronGeometry.right = [bottomFace.vertices[0], bottomFace.vertices[1]];
			}
			else {
				tetrahedronGeometry.left = [bottomFace.vertices[0], bottomFace.vertices[1]];
			}
			
			if (tetrahedronGeometry.direction) {
				
				// let showBC = new THREE.ArrowHelper(tetrahedronGeometry.direction.clone().normalize(), oppositeMidpoint, graphics.getMagnitude(tetrahedronGeometry.direction), 0x0000ff);
				// scene.add(showBC);
				this.getDirectionalEdges(tetrahedronGeometry, oppositeMidpoint);
			}
			
			
			graphics.labelPoint(graphics.getMidpoint(tetrahedronGeometry.left[0], tetrahedronGeometry.left[1]), 'L', scene);
			graphics.labelPoint(graphics.getMidpoint(tetrahedronGeometry.right[0], tetrahedronGeometry.right[1]), 'R', scene);
			if (this.settings.stepCount === 1) {
				graphics.labelPoint(oppositeMidpoint, 'O', scene, distinctColors[this.settings.stepCount]);
			}
		},

		isRightTurn: function(startingPoint, turningPoint, endingPoint) { // This might only work if vectors are flat on the ground since I am using y-component to determine sign

			let segment1 = graphics.createVector(startingPoint, turningPoint);
			let segment2 = graphics.createVector(turningPoint, endingPoint);

			let result = new THREE.Vector3();
			result.crossVectors(segment1, segment2);

			return result.y > 0;
		},

		addNextStep: function(tetrahedronGeometry, oppositeMidpoint, direction) {
			
			this.setDirections(tetrahedronGeometry, oppositeMidpoint);

			let A = graphics.getHighestVertex(tetrahedronGeometry);
			let B;
			let normal;
			
			B = graphics.getMidpoint(tetrahedronGeometry[direction][0], tetrahedronGeometry[direction][1]);
			normal = graphics.createVector(tetrahedronGeometry[direction][0], tetrahedronGeometry[direction][1]);
			normal.y = 0;
			tetrahedronGeometry.oppositeMidpoint = B;

			// graphics.showPoint(A, scene, new THREE.Color('orange'));
			// graphics.showPoint(B, scene, new THREE.Color('black'));
			
			let axis = new THREE.Vector3(0, 1, 0); // rotate a vector
			let C;
			if (direction === 'left') {
				C = normal.applyAxisAngle(axis, Math.PI / 2);
			}
			if (direction === 'right') {
				C = normal.applyAxisAngle(axis, -Math.PI / 2);
			}
			if (direction === 'opposite') {
				C = normal.applyAxisAngle(axis, Math.PI / 2);
			}
			
			let AB = graphics.createVector(B, A);
			let BC = graphics.createVector(B, C);
			BC.setLength(graphics.getMagnitude(AB));
			tetrahedronGeometry.direction = BC.clone();

			let rotationAngle;
			if (direction == 'left') {
				rotationAngle = -1 * graphics.getAngleBetweenVectors(AB, BC);
			}
			if (direction == 'right') {
				rotationAngle = graphics.getAngleBetweenVectors(AB, BC);
			}
			if (direction == 'opposite') {
				rotationAngle = -1 * graphics.getAngleBetweenVectors(AB, BC);
			}
			
			this.settings.stepCount++;

			let newLocationGeometry = graphics.rotateGeometryAboutLine(tetrahedronGeometry, tetrahedronGeometry[direction][0], tetrahedronGeometry[direction][1], rotationAngle);
			
			return newLocationGeometry;
		},
		
		getDirectionalEdges: function(tetrahedronGeometry, oppositeMidpoint) {
			
			let oA = graphics.movePoint(oppositeMidpoint, tetrahedronGeometry.direction);
			graphics.labelPoint(oA, 'oA', scene, orange);
			graphics.showPoint(oppositeMidpoint, scene, blue);
			
			let showBC = new THREE.ArrowHelper(tetrahedronGeometry.direction.clone().normalize(), oppositeMidpoint, graphics.getMagnitude(tetrahedronGeometry.direction), 0x0000ff);
			scene.add(showBC);
			
			let oLVec = tetrahedronGeometry.direction.clone();
			let axis = new THREE.Vector3(0, 1, 0);
			oLVec.applyAxisAngle(axis, Math.PI / 2); // rotate around Y
			oLVec.setLength(graphics.getDistance(tetrahedronGeometry.vertices[0], tetrahedronGeometry.vertices[1])/2.0);
			
			let oL = graphics.movePoint(oppositeMidpoint, oLVec);
			graphics.labelPoint(oL, 'oL', scene, orange);
			
			let oRVec = tetrahedronGeometry.direction.clone();
			axis = new THREE.Vector3(0, 1, 0);
			oRVec.applyAxisAngle(axis, -Math.PI / 2); // rotate around Y
			oRVec.setLength(graphics.getDistance(tetrahedronGeometry.vertices[0], tetrahedronGeometry.vertices[1])/2.0);
			
			let oR = graphics.movePoint(oppositeMidpoint, oRVec);
			graphics.labelPoint(oR, 'oR', scene, orange);
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
										
					message.textContent = 'Roll left';
					setTimeout(function() {
						message.textContent = '';
					}, self.settings.messageDuration);
				}
				if (event.keyCode === R) {
										
					message.textContent = 'Roll right';
					setTimeout(function() {
						message.textContent = '';
					}, self.settings.messageDuration);
				}
				if (event.keyCode === O) {
										
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