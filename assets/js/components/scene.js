module.exports = function() {
	
	var tetrahedron, renderer, scene, camera, controls;
	var tetrahedronGeometry;
	var stats = new Stats();
	var wireframeMaterial = new THREE.MeshBasicMaterial({ wireframe: true, color: 0x08CDFA });
	var shadeMaterial = new THREE.MeshPhongMaterial({
		color: 0x08CDFA,
		side: THREE.DoubleSide,
		opacity: .5,
		transparent: true
	});

	var body = new THREE.TetrahedronGeometry(5/3.0, 0);
	var bodyMesh = new THREE.Mesh(body, shadeMaterial);
	var arrowHelper;
	var legs = [];
	var rolling = false;
	var rollDirection;
	var animationSpeed = .05;
	var rotated = 0;
	var rotationAngle;
	
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
			
			var tetGeo = new THREE.TetrahedronGeometry(4, 0);
			var tetMesh = new THREE.Mesh(tetGeo, shadeMaterial);
			
			var animate = function() {

				requestAnimationFrame(animate);
				renderer.render(scene, camera);
				controls.update();
				stats.update();
				
				
				// if (rolling) {
				// 	console.log(rotated, rotationAngle);
				// 	let complete;
				// 	if (rotationAngle < -1) {
				// 		complete = rotated < rotationAngle;
				// 	}
				// 	else {
				// 		complete = rotated > rotationAngle;
				// 	}
				// 	if (!complete) {
				// 		self.doRoll(rollDirection, .01);
				// 	}
				// 	// else {
				// 	// 	rotated = 0;
				// 	// 	rolling = false;
				// 	// }
				// 	rotated += animationSpeed;
				// }
				
				tetrahedronGeometry.verticesNeedUpdate = true;
				body.verticesNeedUpdate = true;

				if (legs.length) {
					legs.forEach(function(legGeometry) {
						legGeometry.verticesNeedUpdate = true;
					});
				}
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
			
			tetrahedron = new THREE.Mesh(tetrahedronGeometry, wireframeMaterial);
			scene.add(tetrahedron);

			tetrahedronGeometry.oppositeMidpoint = graphics.getMidpoint(tetrahedronGeometry.vertices[0], tetrahedronGeometry.vertices[3]);
			tetrahedronGeometry.opposite = [tetrahedronGeometry.vertices[0], tetrahedronGeometry.vertices[3]];
			tetrahedronGeometry.acrossDirection = graphics.createVector(tetrahedronGeometry.oppositeMidpoint, tetrahedronGeometry.vertices[1]);
			
			this.getDirectionalEdges(tetrahedronGeometry, tetrahedronGeometry.oppositeMidpoint);			
			this.addBody(tetrahedronGeometry);
		},

		isRightTurn: function(startingPoint, turningPoint, endingPoint) { // This might only work if vectors are flat on the ground since I am using y-component to determine sign

			let segment1 = graphics.createVector(startingPoint, turningPoint);
			let segment2 = graphics.createVector(turningPoint, endingPoint);

			let result = new THREE.Vector3();
			result.crossVectors(segment1, segment2);

			return result.y > 0;
		},

		addNextStep: function(tetrahedronGeometry, oppositeMidpoint, direction) {
			
			this.getDirectionalEdges(tetrahedronGeometry, oppositeMidpoint);

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
				normal = new THREE.Vector3(-tetrahedronGeometry.acrossDirection.x, -tetrahedronGeometry.acrossDirection.y, -tetrahedronGeometry.acrossDirection.z);
				
			}
			let C = graphics.movePoint(B, normal);
			
			let AB = graphics.createVector(B, A);
			let BC = graphics.createVector(B, C);
			BC.setLength(graphics.getMagnitude(AB));
			tetrahedronGeometry.direction = BC.clone();
			tetrahedronGeometry.acrossDirection = BC.clone();
			
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
			
			this.doRoll(direction, rotationAngle);
			this.settings.stepCount++;
		},
		
		doRoll: function(direction, rotationAngle) {
			graphics.rotateGeometryAboutLine(tetrahedronGeometry, tetrahedronGeometry[direction][0], tetrahedronGeometry[direction][1], rotationAngle);
			graphics.rotateGeometryAboutLine(body, tetrahedronGeometry[direction][0], tetrahedronGeometry[direction][1], rotationAngle);
			legs.forEach(function(legGeometry) {
				graphics.rotateGeometryAboutLine(legGeometry, tetrahedronGeometry[direction][0], tetrahedronGeometry[direction][1], rotationAngle);
			});
		},
		
		getDirectionalEdges: function(tetrahedronGeometry, oppositeMidpoint) {
			
			let oA = graphics.movePoint(oppositeMidpoint, tetrahedronGeometry.acrossDirection);
			
			let oLVec = tetrahedronGeometry.acrossDirection.clone();
			let axis = new THREE.Vector3(0, 1, 0);
			oLVec.applyAxisAngle(axis, Math.PI / 2); // rotate around Y
			oLVec.setLength(graphics.getDistance(tetrahedronGeometry.vertices[0], tetrahedronGeometry.vertices[1])/2.0);
			
			let oL = graphics.movePoint(oppositeMidpoint, oLVec);
			
			let oRVec = tetrahedronGeometry.acrossDirection.clone();
			axis = new THREE.Vector3(0, 1, 0);
			oRVec.applyAxisAngle(axis, -Math.PI / 2); // rotate around Y
			oRVec.setLength(graphics.getDistance(tetrahedronGeometry.vertices[0], tetrahedronGeometry.vertices[1])/2.0);
			
			let oR = graphics.movePoint(oppositeMidpoint, oRVec);
			
			if (this.settings.stepCount !== 0) tetrahedronGeometry.opposite = [oL, oR];
			tetrahedronGeometry.right = [oR, oA];
			tetrahedronGeometry.left = [oL, oA];
			tetrahedronGeometry.oR = oR;
			tetrahedronGeometry.oL = oL;
			tetrahedronGeometry.oA = oA;
			tetrahedronGeometry.mL = graphics.getMidpoint(oL, oA);
			tetrahedronGeometry.mR = graphics.getMidpoint(oR, oA);
		},
		
		addBody: function(tetrahedronGeometry) {
			
			body.applyMatrix( new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 1, 0, -1 ).normalize(), Math.atan( Math.sqrt(2)) ) ); // Rotate to be flat on floor
			body.rotateY(Math.PI/4); // rotate to line up with x-axis
			let centroidOfBottomFace = graphics.getCentroidOfBottomFace(body);
			let tetrahedronHeight = graphics.getDistance(centroidOfBottomFace, body.vertices[2]);
			
			let centroid = graphics.getCentroid3D(tetrahedronGeometry);
			body.translate(0 , centroid.y, 0);
			
			scene.add(bodyMesh);
			this.addLegs();
		},
		
		addLegs: function() {
			
			let bodyTop = graphics.getHighestVertex(body);
			
			var material = new THREE.LineBasicMaterial({
				color: 0xff0000
			});
			for (let i = 0; i < body.vertices.length; i++) {
				
				var legGeometry = new THREE.Geometry();
				let midpoint = graphics.getMidpoint(body.vertices[i], tetrahedronGeometry.vertices[i]);
				legGeometry.vertices.push(
					new THREE.Vector3( body.vertices[i].x, body.vertices[i].y, body.vertices[i].z ),
					new THREE.Vector3(midpoint.x, midpoint.y + 1, midpoint.z),
					new THREE.Vector3( tetrahedronGeometry.vertices[i].x, tetrahedronGeometry.vertices[i].y, tetrahedronGeometry.vertices[i].z ),
				);
				var line = new THREE.Line( legGeometry, material );
				scene.add( line );
				legs.push(legGeometry);
			}
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
					
					rollDirection = 'left';
					//rolling = true;
					self.addNextStep(tetrahedronGeometry, tetrahedronGeometry.oppositeMidpoint, rollDirection);
										
					message.textContent = 'Roll left';
					setTimeout(function() {
						message.textContent = '';
					}, self.settings.messageDuration);
				}
				if (event.keyCode === R) {
					
					rollDirection = 'right';
					//rolling = true;
					self.addNextStep(tetrahedronGeometry, tetrahedronGeometry.oppositeMidpoint, rollDirection);
										
					message.textContent = 'Roll right';
					setTimeout(function() {
						message.textContent = '';
					}, self.settings.messageDuration);
				}
				if (event.keyCode === O) {
					
					rollDirection = 'opposite';
					//rolling = true;
					self.addNextStep(tetrahedronGeometry, tetrahedronGeometry.oppositeMidpoint, rollDirection);
					
					message.textContent = 'Roll back';
					setTimeout(function() {
						message.textContent = '';
					}, self.settings.messageDuration);
				}
				// if (event.keyCode === esc) {
					
				// 	graphics.resetScene(self, scene);
					
				// 	message.textContent = 'Reset scene';
				// 	setTimeout(function() {
				// 		message.textContent = '';
				// 	}, self.settings.messageDuration);
				// }
			});
		}
	}
}