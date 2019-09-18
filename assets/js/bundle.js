(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

module.exports = function () {
  var tetrahedron, renderer, scene, camera, controls;
  var tetrahedronGeometry;
  var triangleGeometry;
  var stats = new Stats();
  var wireframeMaterial = new THREE.MeshBasicMaterial({
    wireframe: true,
    color: 0x08CDFA
  });
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
    init: function init() {
      var self = this;
      self.loadFont();
      self.setUpButtons();
    },
    begin: function begin() {
      var self = this;
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

      var animate = function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
        controls.update();
        stats.update();
      };

      animate();
    },
    goLeft: function goLeft(tetrahedronGeometry, bottomFace) {
      var self = this;
      var geometry = tetrahedronGeometry.clone();
      geometry = graphics.rotateGeometryAboutLine(geometry, bottomFace.vertices[2], bottomFace.vertices[1], -1.910633236249); // graphics.showPoint(bottomFace.vertices[2], distinctColors[self.settings.stepCount]);
      // graphics.showPoint(bottomFace.vertices[1], distinctColors[self.settings.stepCount]);

      var material = new THREE.MeshBasicMaterial({
        wireframe: true,
        color: distinctColors[self.settings.stepCount]
      });
      var mesh = new THREE.Mesh(geometry, wireframeMaterial);
      scene.add(mesh);
      return geometry;
    },
    goRight: function goRight(tetrahedronGeometry, bottomFace) {
      var self = this;
      var geometry = tetrahedronGeometry.clone();
      geometry = graphics.rotateGeometryAboutLine(geometry, bottomFace.vertices[0], bottomFace.vertices[1], 1.910633236249); // graphics.showPoint(bottomFace.vertices[0], distinctColors[self.settings.stepCount]);
      // graphics.showPoint(bottomFace.vertices[1], distinctColors[self.settings.stepCount]);

      var material = new THREE.MeshBasicMaterial({
        wireframe: true,
        color: distinctColors[self.settings.stepCount]
      });
      var mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh); // rotate so next move is correct

      var centroid = graphics.getCentroid(geometry);
      var top = graphics.getHighestVertex(geometry);
      graphics.drawLine(centroid, top, scene);
      geometry = graphics.rotateGeometryAboutLine(geometry, centroid, top, 2 * Math.PI / 3);
      bottomFace = graphics.rotateGeometryAboutLine(bottomFace, centroid, top, 4 * Math.PI / 3);
      return geometry;
    },
    goBack: function goBack(tetrahedronGeometry, bottomFace) {
      var self = this;
      var geometry = tetrahedronGeometry.clone();
      geometry = graphics.rotateGeometryAboutLine(geometry, bottomFace.vertices[2], bottomFace.vertices[0], 1.910633236249);
      var material = new THREE.MeshBasicMaterial({
        wireframe: true,
        color: distinctColors[self.settings.stepCount]
      });
      var mesh = new THREE.Mesh(geometry, wireframeMaterial);
      scene.add(mesh);
      return geometry;
    },
    getDirectionVector: function getDirectionVector(oppositeMidpoint, top) {
      var self = this;
      top.y = 0;
      currentStep.direction = new THREE.Vector3(); //currentStep.direction.subVectors(top, oppositeMidpoint).normalize();

      graphics.drawLine(oppositeMidpoint, top, scene);
    },
    step: function step(tetrahedronGeometry, direction) {
      var self = this;
      var bottomFace = graphics.getBottomFace(tetrahedronGeometry);

      if (direction === 'L') {
        nextStep = self.goLeft(tetrahedronGeometry, bottomFace);
      } else if (direction === 'R') {
        nextStep = self.goRight(tetrahedronGeometry, bottomFace);
      } else if (direction === 'O') {
        nextStep = self.goBack(tetrahedronGeometry, bottomFace);
      } // Calculate which edge of the tetrahedron shares the previous step--the 'O' edge--by comparing which two vertices coincide


      previousRollEdge = graphics.getSharedVertices(tetrahedronGeometry, bottomFace);
      graphics.showPoints(previousRollEdge, scene, 0x00ff00);
      bottomFace = graphics.getBottomFace(nextStep);
      self.labelDirections(currentStep, bottomFace);
      self.settings.stepCount += 1;
      return nextStep;
    },
    addTetrahedron: function addTetrahedron() {
      var self = this;
      tetrahedronGeometry = new THREE.TetrahedronGeometry(self.settings.tetrahedron.size, 0);
      tetrahedronGeometry.applyMatrix(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, -1).normalize(), Math.atan(Math.sqrt(2)))); // Rotate to be flat on floor

      tetrahedronGeometry.rotateY(Math.PI / 4); // rotate to line up with x-axis

      var centroidOfBottomFace = graphics.getCentroidOfBottomFace(tetrahedronGeometry);
      var tetrahedronHeight = graphics.getDistance(centroidOfBottomFace, tetrahedronGeometry.vertices[2]);
      tetrahedronGeometry.translate(0, tetrahedronHeight / 4, 0);
      triangleGeometry = graphics.getBottomFace(tetrahedronGeometry);
      var startingGeometry = tetrahedronGeometry.clone();

      for (var i = 0; i < tetrahedronGeometry.vertices.length; i++) {
        var colors = [0xCE3611, 0x00CE17, 0x03BAEE, 0x764E8C]; // 				[red, 		green, 		blue, 		purple]

        tetrahedronGeometry.verticesNeedUpdate = true; //graphics.showPoint(tetrahedronGeometry.vertices[i], colors[i]);
      }

      tetrahedron = new THREE.Mesh(tetrahedronGeometry, shadeMaterial);
      scene.add(tetrahedron);
      var ogTetrahedron = new THREE.Mesh(startingGeometry, wireframeMaterial);
      scene.add(ogTetrahedron);
      currentStep = startingGeometry; // let pt1 = new THREE.Vector3(0, 2, 0);
      // let pt2 = new THREE.Vector3(2, 0, 0);
      // let vertex = new THREE.Vector3(0, 0, 0);
      // graphics.showPoint(pt1, scene, new THREE.Color('purple'));
      // graphics.showPoint(pt2, scene, new THREE.Color('purple'));
      // graphics.showPoint(vertex, scene, new THREE.Color('red'));
      // graphics.drawLine(pt1, vertex, scene);
      // graphics.drawLine(pt2, vertex, scene);
      //console.log(graphics.calculateAngle(pt1, pt2, vertex));
    },
    labelDirections: function labelDirections(triangleGeometry, bottomFace) {
      var self = this;
      var midpoints = []; // Get shared edge with parameters and set midpoint to O

      var oppositeEdge = graphics.getSharedVertices(triangleGeometry, bottomFace);
      var oppositeMidpoint = graphics.getMidpoint(oppositeEdge.vertices[0], oppositeEdge.vertices[1]);
      graphics.showPoint(oppositeMidpoint, scene, black);
      graphics.labelPoint(oppositeMidpoint, 'O', scene, black);
      currentStep.oppositeEdge = oppositeEdge;
      currentStep.direction = self.getDirectionVector(oppositeMidpoint, graphics.getHighestVertex(currentStep)); // midpoints.push(graphics.getMidpoint(triangleGeometry.vertices[0], triangleGeometry.vertices[1]));
      // midpoints.push(graphics.getMidpoint(triangleGeometry.vertices[1], triangleGeometry.vertices[2]));
      // midpoints.push(graphics.getMidpoint(triangleGeometry.vertices[2], triangleGeometry.vertices[0]));
      // let labels = ['R', 'L','O'];
      // let colors = [new THREE.Color( 'black' ), new THREE.Color( 'black' ), new THREE.Color( 'black' )]; 
      // for (let i = 0; i < midpoints.length; i++) {
      // 	graphics.showPoint(midpoints[i], colors[i]);
      // 	graphics.labelPoint(midpoints[i], labels[i], scene, new THREE.Color(0x000000));
      // }
    },
    loadFont: function loadFont() {
      var self = this;
      var loader = new THREE.FontLoader();
      var fontPath = '';
      fontPath = 'assets/vendors/js/three.js/examples/fonts/helvetiker_regular.typeface.json';
      loader.load(fontPath, function (font) {
        // success event
        if (graphics.appSettings.errorLogging) console.log('Fonts loaded successfully.');
        graphics.appSettings.font.fontStyle.font = font;
        self.begin();
        if (graphics.appSettings.axesHelper.activateAxesHelper) graphics.labelAxes(scene);
      }, function (event) {
        // in progress event.
        if (graphics.appSettings.errorLogging) console.log('Attempting to load font JSON now...');
      }, function (event) {
        // error event
        if (graphics.appSettings.errorLogging) console.log('Error loading fonts. Webserver required due to CORS policy.');
        graphics.appSettings.font.enable = false;
        self.begin();
      });
    },
    setUpButtons: function setUpButtons() {
      var self = this;
      var message = document.getElementById('message');
      document.addEventListener('keyup', function (event) {
        var L = 76;
        var R = 82;
        var O = 79;
        var esc = 27;

        if (event.keyCode === L) {
          currentStep = self.step(currentStep, 'L');
          message.textContent = 'Roll left';
          setTimeout(function () {
            message.textContent = '';
          }, self.settings.messageDuration);
        }

        if (event.keyCode === R) {
          currentStep = self.step(currentStep, 'R');
          message.textContent = 'Roll right';
          setTimeout(function () {
            message.textContent = '';
          }, self.settings.messageDuration);
        }

        if (event.keyCode === O) {
          currentStep = self.step(currentStep, 'O');
          message.textContent = 'Roll back';
          setTimeout(function () {
            message.textContent = '';
          }, self.settings.messageDuration);
        }

        if (event.keyCode === esc) {
          graphics.resetScene(self, scene);
          message.textContent = 'Reset scene';
          setTimeout(function () {
            message.textContent = '';
          }, self.settings.messageDuration);
        }
      });
    }
  };
};

},{}],2:[function(require,module,exports){
"use strict";

(function () {
  var appSettings;

  window.graphics = function () {
    return {
      appSettings: {
        activateLightHelpers: false,
        axesHelper: {
          activateAxesHelper: false,
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
      activateAxesHelper: function activateAxesHelper(scene) {
        var self = this;
        var axesHelper = new THREE.AxesHelper(graphics.appSettings.axesHelper.axisLength);
        scene.add(axesHelper);
      },
      activateLightHelpers: function activateLightHelpers(scene, lights) {
        for (var i = 0; i < lights.length; i++) {
          var helper = new THREE.DirectionalLightHelper(lights[i], 5, 0x00000);
          scene.add(helper);
        }
      },
      addFloor: function addFloor(scene) {
        var planeGeometry = new THREE.PlaneBufferGeometry(100, 100);
        planeGeometry.rotateX(-Math.PI / 2);
        var planeMaterial = new THREE.ShadowMaterial({
          opacity: 0.2
        });
        var plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.position.y = -1;
        plane.receiveShadow = true;
        scene.add(plane);
        var helper = new THREE.GridHelper(1000, 100);
        helper.material.opacity = .25;
        helper.material.transparent = true;
        scene.add(helper);
      },
      createVector: function createVector(pt1, pt2) {
        return new THREE.Vector3(pt2.x - pt1.x, pt2.y - pt2.y, pt2.z - pt1.z);
      },
      getSharedVertices: function getSharedVertices(geometry1, geometry2) {
        var result = new THREE.Geometry();
        geometry1.vertices.forEach(function (geometry1Vertex) {
          geometry2.vertices.forEach(function (geometry2Vertex) {
            if (utils.roundHundreths(geometry1Vertex.x) === utils.roundHundreths(geometry2Vertex.x) && utils.roundHundreths(geometry1Vertex.y) === utils.roundHundreths(geometry2Vertex.y) && utils.roundHundreths(geometry1Vertex.z) === utils.roundHundreths(geometry2Vertex.z)) {
              result.vertices.push(geometry2Vertex);
            }
          });
        });
        return result;
      },
      getHighestVertex: function getHighestVertex(geometry) {
        var self = this;
        var highest = new THREE.Vector3();
        geometry.vertices.forEach(function (vertex) {
          if (vertex.y > highest.y) {
            highest = vertex;
          }
        });
        return highest;
      },
      getMidpoint: function getMidpoint(pt1, pt2) {
        var midpoint = {};
        midpoint.x = (pt1.x + pt2.x) / 2;
        midpoint.y = (pt1.y + pt2.y) / 2;
        midpoint.z = (pt1.z + pt2.z) / 2;
        return midpoint;
      },
      getBottomFace: function getBottomFace(tetrahedronGeometry) {
        var self = this;
        var bottomFace = new THREE.Geometry();
        tetrahedronGeometry.vertices.forEach(function (vertex) {
          if (utils.roundHundreths(vertex.y) === 0) {
            // Relies on there being no rounding errors
            bottomFace.vertices.push(vertex);
          }
        });
        return bottomFace;
      },
      getCentroidOfBottomFace: function getCentroidOfBottomFace(tetrahedronGeometry) {
        var centroidOfBottomFace = {};
        centroidOfBottomFace.x = (tetrahedronGeometry.vertices[0].x + tetrahedronGeometry.vertices[1].x + tetrahedronGeometry.vertices[3].x) / 3;
        centroidOfBottomFace.y = (tetrahedronGeometry.vertices[0].y + tetrahedronGeometry.vertices[1].y + tetrahedronGeometry.vertices[3].y) / 3;
        centroidOfBottomFace.z = (tetrahedronGeometry.vertices[0].z + tetrahedronGeometry.vertices[1].z + tetrahedronGeometry.vertices[3].z) / 3;
        return centroidOfBottomFace;
      },
      rotatePointAboutLine: function rotatePointAboutLine(pt, axisPt1, axisPt2, angle) {
        var self = this; // uncomment to visualize endpoints of rotation axis
        // self.showPoint(axisPt1, new THREE.Color('red'));
        // self.showPoint(axisPt2, new THREE.Color('red'));

        var u = new THREE.Vector3(0, 0, 0),
            rotation1 = new THREE.Vector3(0, 0, 0),
            rotation2 = new THREE.Vector3(0, 0, 0);
        var d = 0.0; // Move rotation axis to origin

        rotation1.x = pt.x - axisPt1.x;
        rotation1.y = pt.y - axisPt1.y;
        rotation1.z = pt.z - axisPt1.z; // Get unit vector equivalent to rotation axis

        u.x = axisPt2.x - axisPt1.x;
        u.y = axisPt2.y - axisPt1.y;
        u.z = axisPt2.z - axisPt1.z;
        u.normalize();
        d = Math.sqrt(u.y * u.y + u.z * u.z); // Rotation onto first plane

        if (d != 0) {
          rotation2.x = rotation1.x;
          rotation2.y = rotation1.y * u.z / d - rotation1.z * u.y / d;
          rotation2.z = rotation1.y * u.y / d + rotation1.z * u.z / d;
        } else {
          rotation2 = rotation1;
        } // Rotation rotation onto second plane


        rotation1.x = rotation2.x * d - rotation2.z * u.x;
        rotation1.y = rotation2.y;
        rotation1.z = rotation2.x * u.x + rotation2.z * d; // Oriented to axis, now perform original rotation

        rotation2.x = rotation1.x * Math.cos(angle) - rotation1.y * Math.sin(angle);
        rotation2.y = rotation1.x * Math.sin(angle) + rotation1.y * Math.cos(angle);
        rotation2.z = rotation1.z; // Undo rotation 1

        rotation1.x = rotation2.x * d + rotation2.z * u.x;
        rotation1.y = rotation2.y;
        rotation1.z = -rotation2.x * u.x + rotation2.z * d; // Undo rotation 2

        if (d != 0) {
          rotation2.x = rotation1.x;
          rotation2.y = rotation1.y * u.z / d + rotation1.z * u.y / d;
          rotation2.z = -rotation1.y * u.y / d + rotation1.z * u.z / d;
        } else {
          rotation2 = rotation1;
        } // Move back into place


        rotation1.x = rotation2.x + axisPt1.x;
        rotation1.y = rotation2.y + axisPt1.y;
        rotation1.z = rotation2.z + axisPt1.z;
        return rotation1;
      },
      rotateGeometryAboutLine: function rotateGeometryAboutLine(geometry, axisPt1, axisPt2, angle) {
        var self = this;

        for (var i = 0; i < geometry.vertices.length; i++) {
          geometry.vertices[i] = graphics.rotatePointAboutLine(geometry.vertices[i], axisPt1, axisPt2, angle);
        }

        return geometry;
      },
      setUpScene: function setUpScene(scene, renderer) {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);

        if (graphics.appSettings.axesHelper.activateAxesHelper) {
          graphics.activateAxesHelper(scene);
        }

        return scene;
      },
      setUpRenderer: function setUpRenderer(renderer) {
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
        return renderer;
      },
      setUpCamera: function setUpCamera(camera) {
        camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
        return camera;
      },
      showPoints: function showPoints(geometry, scene, color, opacity) {
        var self = this;

        for (var i = 0; i < geometry.vertices.length; i++) {
          graphics.showPoint(geometry.vertices[i], scene, color, opacity);
        }
      },
      showPoint: function showPoint(pt, scene, color, opacity) {
        color = color || 0xff0000;
        opacity = opacity || 1;
        var dotGeometry = new THREE.Geometry();
        dotGeometry.vertices.push(new THREE.Vector3(pt.x, pt.y, pt.z));
        var dotMaterial = new THREE.PointsMaterial({
          size: 10,
          sizeAttenuation: false,
          color: color,
          opacity: opacity,
          transparent: true
        });
        var dot = new THREE.Points(dotGeometry, dotMaterial);
        scene.add(dot);
      },
      showVector: function showVector(vector, origin, scene, color) {
        color = color || 0xff0000;
        var arrowHelper = new THREE.ArrowHelper(vector, origin, vector.length(), color);
        scene.add(arrowHelper);
      },

      /* 	Inputs: pt - point in space to label, in the form of object with x, y, and z properties; label - text content for label; color - optional */
      labelPoint: function labelPoint(pt, label, scene, color) {
        var self = this;

        if (graphics.appSettings.font.enable) {
          color = color || 0xff0000;
          var textGeometry = new THREE.TextGeometry(label, self.appSettings.font.fontStyle);
          var textMaterial = new THREE.MeshBasicMaterial({
            color: color
          });
          var mesh = new THREE.Mesh(textGeometry, textMaterial);
          textGeometry.translate(pt.x, pt.y, pt.z);
          scene.add(mesh);
        }
      },
      drawLine: function drawLine(pt1, pt2, scene) {
        var material = new THREE.LineBasicMaterial({
          color: 0x0000ff
        });
        var geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(pt1.x, pt1.y, pt1.z));
        geometry.vertices.push(new THREE.Vector3(pt2.x, pt2.y, pt2.z));
        var line = new THREE.Line(geometry, material);
        scene.add(line);
      },
      getDistance: function getDistance(pt1, pt2) {
        // create point class?
        var squirt = Math.pow(pt2.x - pt1.x, 2) + Math.pow(pt2.y - pt1.y, 2) + Math.pow(pt2.z - pt1.z, 2);
        return Math.sqrt(squirt);
      },
      labelAxes: function labelAxes(scene) {
        var self = this;

        if (graphics.appSettings.font.enable) {
          var textGeometry = new THREE.TextGeometry('Y', graphics.appSettings.font.fontStyle);
          var textMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00
          });
          var mesh = new THREE.Mesh(textGeometry, textMaterial);
          textGeometry.translate(0, graphics.appSettings.axesHelper.axisLength, 0);
          scene.add(mesh);
          textGeometry = new THREE.TextGeometry('X', graphics.appSettings.font.fontStyle);
          textMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000
          });
          mesh = new THREE.Mesh(textGeometry, textMaterial);
          textGeometry.translate(graphics.appSettings.axesHelper.axisLength, 0, 0);
          scene.add(mesh);
          textGeometry = new THREE.TextGeometry('Z', graphics.appSettings.font.fontStyle);
          textMaterial = new THREE.MeshBasicMaterial({
            color: 0x0000ff
          });
          mesh = new THREE.Mesh(textGeometry, textMaterial);
          textGeometry.translate(0, 0, graphics.appSettings.axesHelper.axisLength);
          scene.add(mesh);
        }
      },
      setCameraLocation: function setCameraLocation(camera, pt) {
        camera.position.x = pt.x;
        camera.position.y = pt.y;
        camera.position.z = pt.z;
      },
      resizeRendererOnWindowResize: function resizeRendererOnWindowResize(renderer, camera) {
        window.addEventListener('resize', utils.debounce(function () {
          if (renderer) {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
          }
        }, 250));
      },
      resetScene: function resetScene(scope, scene) {
        scope.settings.stepCount = 0;

        for (var i = scene.children.length - 1; i >= 0; i--) {
          var obj = scene.children[i];
          scene.remove(obj);
        }

        graphics.addFloor(scene);
        scope.addTetrahedron();
        graphics.setUpLights(scene);
        graphics.setCameraLocation(camera, self.settings.defaultCameraLocation);
      },
      enableControls: function enableControls(controls, renderer, camera) {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 0, 0);
        controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled

        controls.dampingFactor = 0.05;
        controls.zoomSpeed = 2;
        controls.enablePan = !utils.mobile();
        controls.minDistance = 10;
        controls.maxDistance = 100;
        controls.maxPolarAngle = Math.PI / 2;
        return controls;
      },
      enableStats: function enableStats(stats) {
        document.body.appendChild(stats.dom);
      },
      setUpLights: function setUpLights(scene) {
        var self = this;
        var lights = [];
        var color = 0xFFFFFF;
        var intensity = 1;
        var light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        scene.add(light);
        lights.push(light);
        var light2 = new THREE.DirectionalLight(color, intensity);
        light2.position.set(0, 2, -8);
        scene.add(light2);
        lights.push(light2);

        if (graphics.appSettings.activateLightHelpers) {
          graphics.activateLightHelpers(lights);
        }
      },
      createTriangle: function createTriangle(pt1, pt2, pt3) {
        // return geometry
        var triangleGeometry = new THREE.Geometry();
        triangleGeometry.vertices.push(new THREE.Vector3(pt1.x, pt1.y, pt1.z));
        triangleGeometry.vertices.push(new THREE.Vector3(pt2.x, pt2.y, pt2.z));
        triangleGeometry.vertices.push(new THREE.Vector3(pt3.x, pt3.y, pt3.z));
        triangleGeometry.faces.push(new THREE.Face3(0, 1, 2));
        triangleGeometry.computeFaceNormals();
        return triangleGeometry;
      },
      getCentroid: function getCentroid(geometry) {
        // Calculating centroid of a tetrahedron: https://www.youtube.com/watch?v=Infxzuqd_F4
        var result = {};
        var x = 0,
            y = 0,
            z = 0;

        for (var i = 0; i < geometry.vertices.length; i++) {
          x += geometry.vertices[i].x;
          y += geometry.vertices[i].y;
          z += geometry.vertices[i].z;
        }

        x = x / 4;
        y = y / 4;
        z = z / 4;
        result = {
          x: x,
          y: y,
          z: z
        };
        return result;
      },
      getAngleBetweenVectors: function getAngleBetweenVectors(vector1, vector2) {
        var dot = vector1.dot(vector2);
        var length1 = vector1.length();
        var length2 = vector2.length();
        var angle = Math.acos(dot / (length1 * length2));
        return angle;
      },
      calculateAngle: function calculateAngle(endpoint1, endpoint2, vertex) {
        var vector1 = new THREE.Vector3(endpoint1.x - vertex.x, endpoint1.y - vertex.y, endpoint1.z - vertex.z);
        var vector2 = new THREE.Vector3(endpoint2.x - vertex.x, endpoint2.y - vertex.y, endpoint2.z - vertex.z);
        var angle = vector1.angleTo(vector2);
        return angle;
      }
    };
  }();

  module.exports = window.graphics;
})();

},{}],3:[function(require,module,exports){
"use strict";

var Scene = require('./components/scene.js');

var Utilities = require('./utils.js');

var Graphics = require('./graphics.js');

(function () {
  document.addEventListener("DOMContentLoaded", function () {
    Scene().init();
  });
})();

},{"./components/scene.js":1,"./graphics.js":2,"./utils.js":4}],4:[function(require,module,exports){
"use strict";

(function () {
  var appSettings;

  window.utils = function () {
    return {
      appSettings: {
        breakpoints: {
          mobileMax: 767,
          tabletMin: 768,
          tabletMax: 991,
          desktopMin: 992,
          desktopLargeMin: 1200
        }
      },
      mobile: function mobile() {
        return window.innerWidth < this.appSettings.breakpoints.tabletMin;
      },
      tablet: function tablet() {
        return window.innerWidth > this.appSettings.breakpoints.mobileMax && window.innerWidth < this.appSettings.breakpoints.desktopMin;
      },
      desktop: function desktop() {
        return window.innerWidth > this.appSettings.breakpoints.desktopMin;
      },
      getBreakpoint: function getBreakpoint() {
        if (window.innerWidth < this.appSettings.breakpoints.tabletMin) return 'mobile';else if (window.innerWidth < this.appSettings.breakpoints.desktopMin) return 'tablet';else return 'desktop';
      },
      debounce: function debounce(func, wait, immediate) {
        var timeout;
        return function () {
          var context = this,
              args = arguments;

          var later = function later() {
            timeout = null;
            if (!immediate) func.apply(context, args);
          };

          var callNow = immediate && !timeout;
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
          if (callNow) func.apply(context, args);
        };
      },

      /* Purpose: Detect if any of the element is currently within the viewport */
      anyOnScreen: function anyOnScreen(element) {
        var win = $(window);
        var viewport = {
          top: win.scrollTop(),
          left: win.scrollLeft()
        };
        viewport.right = viewport.left + win.width();
        viewport.bottom = viewport.top + win.height();
        var bounds = element.offset();
        bounds.right = bounds.left + element.outerWidth();
        bounds.bottom = bounds.top + element.outerHeight();
        return !(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom);
      },

      /* Purpose: Detect if an element is vertically on screen; if the top and bottom of the element are both within the viewport. */
      allOnScreen: function allOnScreen(element) {
        var win = $(window);
        var viewport = {
          top: win.scrollTop(),
          left: win.scrollLeft()
        };
        viewport.right = viewport.left + win.width();
        viewport.bottom = viewport.top + win.height();
        var bounds = element.offset();
        bounds.right = bounds.left + element.outerWidth();
        bounds.bottom = bounds.top + element.outerHeight();
        return !(viewport.bottom < bounds.top && viewport.top > bounds.bottom);
      },
      secondsToMilliseconds: function secondsToMilliseconds(seconds) {
        return seconds * 1000;
      },

      /*
      * Purpose: This method allows you to temporarily disable an an element's transition so you can modify its proprties without having it animate those changing properties.
      * Params:
      * 	-element: The element you would like to modify.
      * 	-cssTransformation: The css transformation you would like to make, i.e. {'width': 0, 'height': 0} or 'border', '1px solid black'
      */
      getTransitionDuration: function getTransitionDuration(element) {
        var $element = $(element);
        return utils.secondsToMilliseconds(parseFloat(getComputedStyle($element[0])['transitionDuration']));
      },
      isInteger: function isInteger(number) {
        return number % 1 === 0;
      },
      rotate: function rotate(array) {
        array.push(array.shift());
        return array;
      },
      roundHundreths: function roundHundreths(num) {
        return Math.round(num * 100) / 100;
      }
    };
  }();

  module.exports = window.utils;
})();

},{}]},{},[3]);
