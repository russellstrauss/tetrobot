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

			labelAxes: function() {
			
				let self = this;
				if (graphics.appSettings.font.enable) {
					let textGeometry = new THREE.TextGeometry('Y', graphics.appSettings.font.fontStyle);
					let textMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
					let mesh = new THREE.Mesh(textGeometry, textMaterial);
					textGeometry.translate(0, self.appSettings.axesHelper.axisLength, 0);
					scene.add(mesh);
					
					textGeometry = new THREE.TextGeometry('X', graphics.appSettings.font.fontStyle);
					textMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
					mesh = new THREE.Mesh(textGeometry, textMaterial);
					textGeometry.translate(self.appSettings.axesHelper.axisLength, 0, 0);
					scene.add(mesh);
					
					textGeometry = new THREE.TextGeometry('Z', graphics.appSettings.font.fontStyle);
					textMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
					mesh = new THREE.Mesh(textGeometry, textMaterial);
					textGeometry.translate(0, 0, self.appSettings.axesHelper.axisLength);
					scene.add(mesh);
				}
			},
		}
	})();
	
	module.exports = window.graphics;
})();