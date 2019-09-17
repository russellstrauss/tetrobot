(function () {

	var appSettings;
	
	window.graphics = (function() {
		
		return {

			appSettings: {
				activateLightHelpers: false,
				axesHelper: {
					activateAxesHelper: true,
					axisLength: 10
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
				errorLogging: false
			},

			activateAxesHelper: function(scene) {
			
				let self = this;
				let axesHelper = new THREE.AxesHelper(graphics.appSettings.axesHelper.axisLength);
				scene.add(axesHelper);
			},

			addFloor: function(scene) {
				
				console.log(scene);

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

			createVector: function(pt1, pt2) {
				return new THREE.Vector3(pt2.x - pt1.x, pt2.y - pt2.y, pt2.z - pt1.z);
			},
			
			getSharedVertices: function(geometry1, geometry2) {

				let result = new THREE.Geometry();
				geometry1.vertices.forEach(function(geometry1Vertex) {
					
					geometry2.vertices.forEach(function(geometry2Vertex) {
						
						if (utils.roundHundreths(geometry1Vertex.x) === utils.roundHundreths(geometry2Vertex.x) && 
							utils.roundHundreths(geometry1Vertex.y) === utils.roundHundreths(geometry2Vertex.y) &&
							utils.roundHundreths(geometry1Vertex.z) === utils.roundHundreths(geometry2Vertex.z))
						{
							result.vertices.push(geometry2Vertex);
						}
					});
				});
	
				return result;
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

			getMidpoint: function(pt1, pt2) {
			
				let midpoint = {};
				
				midpoint.x = (pt1.x + pt2.x) / 2;
				midpoint.y = (pt1.y + pt2.y) / 2;
				midpoint.z = (pt1.z + pt2.z) / 2;
				
				return midpoint;
			},

			getBottomFace: function(tetrahedronGeometry) {
			
				let self = this;
				let bottomFace = new THREE.Geometry();
				
				tetrahedronGeometry.vertices.forEach(function(vertex) {
					
					if (utils.roundHundreths(vertex.y) === 0) { // Relies on there being no rounding errors
						
						bottomFace.vertices.push(vertex);
					}
				});
				
				return bottomFace;
			},

			getCentroidOfBottomFace: function(tetrahedronGeometry) {
			
				let centroidOfBottomFace = {};
				centroidOfBottomFace.x = (tetrahedronGeometry.vertices[0].x + tetrahedronGeometry.vertices[1].x + tetrahedronGeometry.vertices[3].x) / 3;
				centroidOfBottomFace.y = (tetrahedronGeometry.vertices[0].y + tetrahedronGeometry.vertices[1].y + tetrahedronGeometry.vertices[3].y) / 3;
				centroidOfBottomFace.z = (tetrahedronGeometry.vertices[0].z + tetrahedronGeometry.vertices[1].z + tetrahedronGeometry.vertices[3].z) / 3;
				
				return centroidOfBottomFace;
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
					geometry.vertices[i] = graphics.rotatePointAboutLine(geometry.vertices[i], axisPt1, axisPt2, angle);
				}
				
				return geometry;
			},

			setUpScene: function(scene, camera, renderer) {

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

			showPoints: function(geometry, color, opacity) {
			
				let self = this;
				
				for (let i = 0; i < geometry.vertices.length; i++) {
					graphics.showPoint(geometry.vertices[i], color, opacity);
				}
			},

			showPoint: function(pt, scene, color, opacity) {
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

			showVector: function(vector, origin, scene, color) {
			
				color = color || 0xff0000;
				let arrowHelper = new THREE.ArrowHelper(vector, origin, vector.length(), color);
				scene.add(arrowHelper);
			},

			/* 	Inputs: pt - point in space to label, in the form of object with x, y, and z properties; label - text content for label; color - optional */
			labelPoint: function(pt, label, scene, color) {
				
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

			drawLine: function(pt1, pt2, scene) {
			
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

			labelAxes: function(scene) {
			
				let self = this;
				if (graphics.appSettings.font.enable) {
					let textGeometry = new THREE.TextGeometry('Y', graphics.appSettings.font.fontStyle);
					let textMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
					let mesh = new THREE.Mesh(textGeometry, textMaterial);
					textGeometry.translate(0, graphics.appSettings.axesHelper.axisLength, 0);
					scene.add(mesh);
					
					textGeometry = new THREE.TextGeometry('X', graphics.appSettings.font.fontStyle);
					textMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
					mesh = new THREE.Mesh(textGeometry, textMaterial);
					textGeometry.translate(graphics.appSettings.axesHelper.axisLength, 0, 0);
					scene.add(mesh);
					
					textGeometry = new THREE.TextGeometry('Z', graphics.appSettings.font.fontStyle);
					textMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
					mesh = new THREE.Mesh(textGeometry, textMaterial);
					textGeometry.translate(0, 0, graphics.appSettings.axesHelper.axisLength);
					scene.add(mesh);
				}
			},

			setCameraLocation: function(camera, pt) {
				camera.position.x = pt.x;
				camera.position.y = pt.y;
				camera.position.z = pt.z;
			},

			resizeRendererOnWindowResize: function(renderer, camera) {

				window.addEventListener('resize', utils.debounce(function() {
					
					if (renderer) {
		
						camera.aspect = window.innerWidth / window.innerHeight;
						camera.updateProjectionMatrix();
						renderer.setSize(window.innerWidth, window.innerHeight);
					}
				}, 250));
			},

			enableControls: function(controls, renderer, camera) {
				controls = new THREE.OrbitControls(camera, renderer.domElement);
				controls.target.set(0, 0, 0);
				controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
				controls.dampingFactor = 0.05;
				controls.zoomSpeed = 6;
				controls.enablePan = !utils.mobile();
				controls.minDistance = 10;
				controls.maxDistance = 100;
				controls.maxPolarAngle = Math.PI / 2;
				return controls;
			},
		}
	})();
	
	module.exports = window.graphics;
})();