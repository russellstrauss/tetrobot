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
			}
			
			tetrahedron = new THREE.Mesh(startingGeometry, wireframeMaterial);
			scene.add(tetrahedron);

			let startingOppositeMidpoint = graphics.getMidpoint(tetrahedronGeometry.vertices[0], tetrahedronGeometry.vertices[3]);
			tetrahedronGeometry.opposite = [tetrahedronGeometry.vertices[0], tetrahedronGeometry.vertices[3]];
			tetrahedronGeometry.acrossDirection = graphics.createVector(startingOppositeMidpoint, tetrahedronGeometry.vertices[1]);
			
			this.getDirectionalEdges(tetrahedronGeometry, startingOppositeMidpoint);
			
			
			let first = this.addNextStep(tetrahedronGeometry, startingOppositeMidpoint, 'opposite');
			let newTetrahedron = new THREE.Mesh(first.clone(), wireframeMaterial);
			scene.add(newTetrahedron);
			
			let directions = ['left', 'right', 'opposite'];
			let newStep;
			for (let i = 0; i < 500; i++) {
				console.log(directions[utils.randomInt(0, 2)]);
				newStep = this.addNextStep(tetrahedronGeometry, tetrahedronGeometry.oppositeMidpoint, directions[utils.randomInt(0, 2)]);
				newTetrahedron = new THREE.Mesh(newStep.clone(), wireframeMaterial);
				scene.add(newTetrahedron);
			}
		
			currentStep = startingGeometry;
		},

		isRightTurn: function(startingPoint, turningPoint, endingPoint) { // This might only work if vectors are flat on the ground since I am using y-component to determine sign

			let segment1 = graphics.createVector(startingPoint, turningPoint);
			let segment2 = graphics.createVector(turningPoint, endingPoint);

			let result = new THREE.Vector3();
			result.crossVectors(segment1, segment2);

			return result.y > 0;
		},

		addNextStep: function(tetrahedronGeometry, oppositeMidpoint, direction) {
			
			if (this.stepCount !== 0) {
				
				this.getDirectionalEdges(tetrahedronGeometry, oppositeMidpoint);
			}
			let show;
			let newO;
			if (direction === 'left') newO = tetrahedronGeometry.mL;
			if (direction === 'right') newO = tetrahedronGeometry.mL;
			if (direction === 'opposite') newO = oppositeMidpoint;

			let A = graphics.getHighestVertex(tetrahedronGeometry);
			let B = graphics.getMidpoint(tetrahedronGeometry[direction][0], tetrahedronGeometry[direction][1]);
			let normal = graphics.createVector(tetrahedronGeometry[direction][0], tetrahedronGeometry[direction][1]);
			if (direction === 'opposite' && this.settings.stepCount !== 0) B = oppositeMidpoint;
			normal.setLength(graphics.getMagnitude(tetrahedronGeometry.acrossDirection));
			normal.y = 0;
			tetrahedronGeometry.oppositeMidpoint = B;
			
			let axis = new THREE.Vector3(0, 1, 0); // rotate a vector
			if (direction === 'left') {
				normal = normal.applyAxisAngle(axis, Math.PI / 2);
			}
			if (direction === 'right') {
				normal = normal.applyAxisAngle(axis, -Math.PI / 2);
			}
			if (direction === 'opposite') {
				//normal = normal.applyAxisAngle(axis, Math.PI / 2);
				normal = new THREE.Vector3(-tetrahedronGeometry.acrossDirection.x, -tetrahedronGeometry.acrossDirection.y, -tetrahedronGeometry.acrossDirection.z);
				
			}
			let C = graphics.movePoint(B, normal);
			graphics.showPoint(C, scene, green);
			
			if (this.settings.stepCount === 2) {
				graphics.showPoint(B, scene, black);
				show = new THREE.ArrowHelper(normal.clone().normalize(), newO, graphics.getMagnitude(normal), 0x00ff00);
				scene.add(show);
			}
			
			let AB = graphics.createVector(B, A);
			let BC = graphics.createVector(B, C);
			BC.setLength(graphics.getMagnitude(AB));
			tetrahedronGeometry.direction = BC.clone();
			tetrahedronGeometry.acrossDirection = BC.clone();
			
			graphics.labelPoint(graphics.getCentroid3D(tetrahedronGeometry), this.settings.stepCount.toString(), scene, black);
			
			if (this.settings.stepCount === 2) {
				show = new THREE.ArrowHelper(AB.clone().normalize(), newO, graphics.getMagnitude(AB), new THREE.Color('purple'));
				scene.add(show);
				show = new THREE.ArrowHelper(BC.clone().normalize(), newO, graphics.getMagnitude(BC), new THREE.Color('purple'));
				scene.add(show);
				
				// show = new THREE.ArrowHelper(normal.clone().normalize(), newO, graphics.getMagnitude(normal), new THREE.Color('purple'));
				// scene.add(show);
				// show = new THREE.ArrowHelper(BC.clone().normalize(), newO, graphics.getMagnitude(BC), distinctColors[this.settings.stepCount]);
				// scene.add(show);
			}
			
			// if (this.settings.stepCount === 2) {
			// 	show = new THREE.ArrowHelper(AB.clone().normalize(), newO, graphics.getMagnitude(AB), 0x00ff00);
			// 	scene.add(show);
			// }

			let rotationAngle;
			if (direction == 'left') {
				rotationAngle = -1 * graphics.getAngleBetweenVectors(AB, BC);
			}
			if (direction == 'right') {
				rotationAngle = graphics.getAngleBetweenVectors(AB, BC);
			}
			if (direction == 'opposite') {
				if (this.settings.stepCount === 0) {
					rotationAngle = -1 * graphics.getAngleBetweenVectors(AB, BC);
				}
				else {
					rotationAngle = graphics.getAngleBetweenVectors(AB, BC);
				}
			}
			
			this.settings.stepCount++;

			let newLocationGeometry = graphics.rotateGeometryAboutLine(tetrahedronGeometry, tetrahedronGeometry[direction][0], tetrahedronGeometry[direction][1], rotationAngle);
			
			return newLocationGeometry;
		},
		
		getDirectionalEdges: function(tetrahedronGeometry, oppositeMidpoint) {
			
			let oA = graphics.movePoint(oppositeMidpoint, tetrahedronGeometry.acrossDirection);
			graphics.labelPoint(oA, 'oA', scene, orange);
			
			let oLVec = tetrahedronGeometry.acrossDirection.clone();
			let axis = new THREE.Vector3(0, 1, 0);
			oLVec.applyAxisAngle(axis, Math.PI / 2); // rotate around Y
			oLVec.setLength(graphics.getDistance(tetrahedronGeometry.vertices[0], tetrahedronGeometry.vertices[1])/2.0);
			
			let oL = graphics.movePoint(oppositeMidpoint, oLVec);
			graphics.labelPoint(oL, 'oL', scene, orange);
			
			let oRVec = tetrahedronGeometry.acrossDirection.clone();
			axis = new THREE.Vector3(0, 1, 0);
			oRVec.applyAxisAngle(axis, -Math.PI / 2); // rotate around Y
			oRVec.setLength(graphics.getDistance(tetrahedronGeometry.vertices[0], tetrahedronGeometry.vertices[1])/2.0);
			
			let oR = graphics.movePoint(oppositeMidpoint, oRVec);
			graphics.labelPoint(oR, 'oR', scene, orange);
			
			if (this.settings.stepCount !== 0) tetrahedronGeometry.opposite = [oL, oR];
			tetrahedronGeometry.right = [oR, oA];
			tetrahedronGeometry.left = [oL, oA];
			tetrahedronGeometry.oR = oR;
			tetrahedronGeometry.oL = oL;
			tetrahedronGeometry.oA = oA;
			tetrahedronGeometry.mL = graphics.getMidpoint(oL, oA);
			tetrahedronGeometry.mR = graphics.getMidpoint(oR, oA);
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