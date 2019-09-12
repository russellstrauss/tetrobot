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
    init: function init() {
      var self = this;
      self.loadFont();
      self.setUpButtons();
    },
    begin: function begin() {
      var self = this;
      self.setUpScene();
      self.addFloor();
      self.enableStats();
      self.enableControls();
      self.resizeRendererOnWindowResize();
      self.setUpLights();
      self.addTetrahedron();
      self.setCameraLocation(self.settings.defaultCameraLocation);

      var animate = function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
        controls.update();
        stats.update();
      };

      animate();
    },
    setCameraLocation: function setCameraLocation(pt) {
      camera.position.x = pt.x;
      camera.position.y = pt.y;
      camera.position.z = pt.z;
    },
    resizeRendererOnWindowResize: function resizeRendererOnWindowResize() {
      window.addEventListener('resize', utils.debounce(function () {
        if (renderer) {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        }
      }, 250));
    },
    enableControls: function enableControls() {
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
    enableStats: function enableStats() {
      document.body.appendChild(stats.dom);
    },
    setUpLights: function setUpLights() {
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

      if (self.settings.activateLightHelpers) {
        self.activateLightHelpers(lights);
      }
    },
    activateLightHelpers: function activateLightHelpers(lights) {
      for (var i = 0; i < lights.length; i++) {
        var helper = new THREE.DirectionalLightHelper(lights[i], 5, 0x00000);
        scene.add(helper);
      }
    },
    addFloor: function addFloor() {
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
    setUpScene: function setUpScene() {
      var self = this;
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
    resetScene: function resetScene() {
      var self = this;
      self.settings.stepCount = 0;

      for (var i = scene.children.length - 1; i >= 0; i--) {
        var obj = scene.children[i];
        scene.remove(obj);
      }

      self.addFloor();
      self.addTetrahedron();
      self.setUpLights();
      self.setCameraLocation(self.settings.defaultCameraLocation);
    },
    goLeft: function goLeft(tetrahedronGeometry, triangleGeometry) {
      var self = this;
      var geometry = tetrahedronGeometry.clone(); //self.rotateGeometryAboutLine(geometry, triangleGeometry.vertices[1], triangleGeometry.vertices[1],  1.910633236249);

      geometry = self.rotateGeometryAboutLine(geometry, triangleGeometry.vertices[1], triangleGeometry.vertices[1], Math.PI / 6); // self.showPoint(triangleGeometry.vertices[2]);
      // self.showPoint(triangleGeometry.vertices[1]);

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
      geometry = self.rotateGeometryAboutLine(geometry, bottomFace.vertices[0], bottomFace.vertices[1], 1.910633236249);
      self.showPoint(bottomFace.vertices[0], distinctColors[self.settings.stepCount]);
      self.showPoint(bottomFace.vertices[1], distinctColors[self.settings.stepCount]);
      var material = new THREE.MeshBasicMaterial({
        wireframe: true,
        color: distinctColors[self.settings.stepCount]
      });
      var mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh); // rotate so next move is correct

      var centroid = self.getCentroid(geometry);
      console.log(centroid);
      var top = self.getHighestVertex(geometry); //self.showPoints(geometry, black);
      //self.showPoint(centroid, new THREE.Color('green'));

      self.drawLine(centroid, top); //self.showPoint(top, new THREE.Color('green'));

      geometry = self.rotateGeometryAboutLine(geometry, centroid, top, 2 * Math.PI / 3);
      bottomFace = self.rotateGeometryAboutLine(bottomFace, centroid, top, 4 * Math.PI / 3);
      return geometry;
    },
    goBack: function goBack(tetrahedronGeometry, triangleGeometry) {
      var self = this;
      var geometry = tetrahedronGeometry.clone();
      self.rotateGeometryAboutLine(geometry, triangleGeometry.vertices[2], triangleGeometry.vertices[0], 1.910633236249); //geometry.rotateX(Math.PI);

      var material = new THREE.MeshBasicMaterial({
        wireframe: true,
        color: distinctColors[self.settings.stepCount]
      });
      var mesh = new THREE.Mesh(geometry, wireframeMaterial);
      scene.add(mesh);
      return geometry;
    },
    step: function step(tetrahedronGeometry, direction) {
      var self = this;
      var bottomFace = self.getBottomFace(tetrahedronGeometry);

      if (direction === 'L') {
        nextStep = self.goLeft(tetrahedronGeometry, bottomFace);
      } else if (direction === 'R') {
        nextStep = self.goRight(tetrahedronGeometry, bottomFace);
      } else if (direction === 'O') {
        nextStep = self.goBack(tetrahedronGeometry, bottomFace);
      } // Calculate which edge of the tetrahedron shares the previous step--the 'O' edge--by comparing which two vertices coincide


      tetrahedronGeometry.vertices.forEach(function (tetVertex) {
        bottomFace.vertices.forEach(function (triVertex) {
          if (self.roundHundreths(tetVertex.x) === self.roundHundreths(triVertex.x) && self.roundHundreths(tetVertex.y) === self.roundHundreths(triVertex.y) && self.roundHundreths(tetVertex.z) === self.roundHundreths(triVertex.z)) {
            previousRollEdge.vertices.push(triVertex);
          }
        });
      });
      bottomFace = self.getBottomFace(nextStep);
      self.labelDirections(nextStep);
      self.settings.stepCount += 1;
      return nextStep;
    },
    addTetrahedron: function addTetrahedron() {
      var self = this;
      tetrahedronGeometry = new THREE.TetrahedronGeometry(self.settings.tetrahedron.size, 0);
      tetrahedronGeometry.applyMatrix(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, -1).normalize(), Math.atan(Math.sqrt(2)))); // Rotate to be flat on floor

      tetrahedronGeometry.rotateY(Math.PI / 4); // rotate to line up with x-axis

      var centroidOfBottomFace = self.getCentroidOfBottomFace(tetrahedronGeometry);
      var tetrahedronHeight = self.getDistance(centroidOfBottomFace, tetrahedronGeometry.vertices[2]);
      tetrahedronGeometry.translate(0, tetrahedronHeight / 4, 0);
      triangleGeometry = self.getBottomFace(tetrahedronGeometry);
      var startingGeometry = tetrahedronGeometry.clone();

      for (var i = 0; i < tetrahedronGeometry.vertices.length; i++) {
        var colors = [0xCE3611, 0x00CE17, 0x03BAEE, 0x764E8C]; // 				[red, 		green, 		blue, 		purple]

        tetrahedronGeometry.verticesNeedUpdate = true;
        self.showPoint(tetrahedronGeometry.vertices[i], colors[i]);
      }

      tetrahedron = new THREE.Mesh(tetrahedronGeometry, shadeMaterial);
      scene.add(tetrahedron);
      var ogTetrahedron = new THREE.Mesh(startingGeometry, wireframeMaterial);
      scene.add(ogTetrahedron);
      currentStep = startingGeometry; //self.labelDirections(triangleGeometry);
    },
    getBottomFace: function getBottomFace(tetrahedronGeometry) {
      var self = this;
      var bottomFace = new THREE.Geometry();
      tetrahedronGeometry.vertices.forEach(function (vertex) {
        if (self.roundHundreths(vertex.y) === 0) {
          // Relies on there being no rounding errors
          bottomFace.vertices.push(vertex);
        }
      });
      return bottomFace;
    },
    rotatePointAboutLine: function rotatePointAboutLine(pt, axisPt1, axisPt2, angle) {
      var self = this; // uncomment to visualize endpoints of rotation axis
      //console.log('axisPt1: ', axisPt1, 'axisPt2: ', axisPt2);

      self.showPoint(axisPt1, new THREE.Color('red'));
      self.showPoint(axisPt2, new THREE.Color('red'));
      var u = new THREE.Vector3(0, 0, 0),
          q1 = new THREE.Vector3(0, 0, 0),
          q2 = new THREE.Vector3(0, 0, 0);
      var d = 0.0;
      /* Step 1 */

      q1.x = pt.x - axisPt1.x;
      q1.y = pt.y - axisPt1.y;
      q1.z = pt.z - axisPt1.z;
      u.x = axisPt2.x - axisPt1.x;
      u.y = axisPt2.y - axisPt1.y;
      u.z = axisPt2.z - axisPt1.z;
      u.normalize();
      d = Math.sqrt(u.y * u.y + u.z * u.z);
      /* Step 2 */

      if (d != 0) {
        q2.x = q1.x;
        q2.y = q1.y * u.z / d - q1.z * u.y / d;
        q2.z = q1.y * u.y / d + q1.z * u.z / d;
      } else {
        q2 = q1;
      }
      /* Step 3 */


      q1.x = q2.x * d - q2.z * u.x;
      q1.y = q2.y;
      q1.z = q2.x * u.x + q2.z * d;
      /* Step 4 */

      q2.x = q1.x * Math.cos(angle) - q1.y * Math.sin(angle);
      q2.y = q1.x * Math.sin(angle) + q1.y * Math.cos(angle);
      q2.z = q1.z;
      /* Inverse of step 3 */

      q1.x = q2.x * d + q2.z * u.x;
      q1.y = q2.y;
      q1.z = -q2.x * u.x + q2.z * d;
      /* Inverse of step 2 */

      if (d != 0) {
        q2.x = q1.x;
        q2.y = q1.y * u.z / d + q1.z * u.y / d;
        q2.z = -q1.y * u.y / d + q1.z * u.z / d;
      } else {
        q2 = q1;
      }
      /* Inverse of step 1 */


      q1.x = q2.x + axisPt1.x;
      q1.y = q2.y + axisPt1.y;
      q1.z = q2.z + axisPt1.z;
      return q1;
    },
    rotateGeometryAboutLine: function rotateGeometryAboutLine(geometry, axisPt1, axisPt2, angle) {
      var self = this;

      for (var i = 0; i < geometry.vertices.length; i++) {
        geometry.vertices[i] = self.rotatePointAboutLine(geometry.vertices[i], axisPt1, axisPt2, angle);
      }

      return geometry;
    },
    showPoints: function showPoints(geometry, color, opacity) {
      var self = this;

      for (var i = 0; i < geometry.vertices.length; i++) {
        self.showPoint(geometry.vertices[i], color, opacity);
      }
    },
    showPoint: function showPoint(pt, color, opacity) {
      color = color || 0xff0000;
      opacity = opacity || 1;
      var dotGeometry = new THREE.Geometry();
      dotGeometry.vertices.push(new THREE.Vector3(pt.x, pt.y, pt.z));
      var dotMaterial = new THREE.PointsMaterial({
        size: .25,
        sizeAttenuation: true,
        color: color,
        opacity: opacity,
        transparent: true
      });
      var dot = new THREE.Points(dotGeometry, dotMaterial);
      scene.add(dot);
    },
    showVector: function showVector(vector, origin, color) {
      color = color || 0xff0000;
      var arrowHelper = new THREE.ArrowHelper(vector, origin, vector.length(), color);
      scene.add(arrowHelper);
    },
    drawLine: function drawLine(pt1, pt2) {
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
    createVector: function createVector(pt1, pt2) {
      return new THREE.Vector3(pt2.x - pt1.x, pt2.y - pt2.y, pt2.z - pt1.z);
    },
    getMidpoint: function getMidpoint(pt1, pt2) {
      var midpoint = {};
      midpoint.x = (pt1.x + pt2.x) / 2;
      midpoint.y = (pt1.y + pt2.y) / 2;
      midpoint.z = (pt1.z + pt2.z) / 2;
      return midpoint;
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
    getCentroidOfBottomFace: function getCentroidOfBottomFace(tetrahedronGeometry) {
      var centroidOfBottomFace = {};
      centroidOfBottomFace.x = (tetrahedronGeometry.vertices[0].x + tetrahedronGeometry.vertices[1].x + tetrahedronGeometry.vertices[3].x) / 3;
      centroidOfBottomFace.y = (tetrahedronGeometry.vertices[0].y + tetrahedronGeometry.vertices[1].y + tetrahedronGeometry.vertices[3].y) / 3;
      centroidOfBottomFace.z = (tetrahedronGeometry.vertices[0].z + tetrahedronGeometry.vertices[1].z + tetrahedronGeometry.vertices[3].z) / 3;
      return centroidOfBottomFace;
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
    activateAxesHelper: function activateAxesHelper() {
      var self = this;
      var axesHelper = new THREE.AxesHelper(self.settings.axesHelper.axisLength);
      scene.add(axesHelper);
    },
    // Input: triangle geometry of the tetrahedron face that is currently on the floor, then will label midpoint directions for left, right, and opposite
    labelDirections: function labelDirections(triangleGeometry) {
      var self = this;
      var midpoints = [];
      midpoints.push(self.getMidpoint(triangleGeometry.vertices[0], triangleGeometry.vertices[1]));
      midpoints.push(self.getMidpoint(triangleGeometry.vertices[1], triangleGeometry.vertices[2]));
      midpoints.push(self.getMidpoint(triangleGeometry.vertices[2], triangleGeometry.vertices[0]));
      var labels = ['R', 'L', 'O'];
      var colors = [new THREE.Color('black'), new THREE.Color('black'), new THREE.Color('black')];

      for (var i = 0; i < midpoints.length; i++) {
        self.showPoint(midpoints[i], colors[i]);
        self.labelPoint(midpoints[i], labels[i], new THREE.Color(0x000000));
      }
    },
    labelAxes: function labelAxes() {
      var self = this;

      if (self.settings.font.enable) {
        var textGeometry = new THREE.TextGeometry('Y', self.settings.font.fontStyle);
        var textMaterial = new THREE.MeshBasicMaterial({
          color: 0x00ff00
        });
        var mesh = new THREE.Mesh(textGeometry, textMaterial);
        textGeometry.translate(0, self.settings.axesHelper.axisLength, 0);
        scene.add(mesh);
        textGeometry = new THREE.TextGeometry('X', self.settings.font.fontStyle);
        textMaterial = new THREE.MeshBasicMaterial({
          color: 0xff0000
        });
        mesh = new THREE.Mesh(textGeometry, textMaterial);
        textGeometry.translate(self.settings.axesHelper.axisLength, 0, 0);
        scene.add(mesh);
        textGeometry = new THREE.TextGeometry('Z', self.settings.font.fontStyle);
        textMaterial = new THREE.MeshBasicMaterial({
          color: 0x0000ff
        });
        mesh = new THREE.Mesh(textGeometry, textMaterial);
        textGeometry.translate(0, 0, self.settings.axesHelper.axisLength);
        scene.add(mesh);
      }
    },
    loadFont: function loadFont() {
      var self = this;
      var loader = new THREE.FontLoader();
      var fontPath = '';
      fontPath = 'assets/vendors/js/three.js/examples/fonts/helvetiker_regular.typeface.json';
      loader.load(fontPath, function (font) {
        // success event
        if (self.settings.errorLogging) console.log('Fonts loaded successfully.');
        self.settings.font.fontStyle.font = font;
        self.begin();
        if (self.settings.axesHelper.activateAxesHelper) self.labelAxes();
      }, function (event) {
        // in progress event.
        if (self.settings.errorLogging) console.log('Attempting to load font JSON now...');
      }, function (event) {
        // error event
        if (self.settings.errorLogging) console.log('Error loading fonts. Webserver required due to CORS policy.');
        self.settings.font.enable = false;
        self.begin();
      });
    },

    /* 	Inputs: pt - point in space to label, in the form of object with x, y, and z properties; label - text content for label; color - optional */
    labelPoint: function labelPoint(pt, label, color) {
      var self = this;

      if (self.settings.font.enable) {
        color = color || 0xff0000;
        var textGeometry = new THREE.TextGeometry(label, self.settings.font.fontStyle);
        var textMaterial = new THREE.MeshBasicMaterial({
          color: color
        });
        var mesh = new THREE.Mesh(textGeometry, textMaterial);
        textGeometry.translate(pt.x, pt.y, pt.z);
        scene.add(mesh);
      }
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
          self.resetScene();
          message.textContent = 'Reset scene';
          setTimeout(function () {
            message.textContent = '';
          }, self.settings.messageDuration);
        }
      });
    },
    roundHundreths: function roundHundreths(num) {
      return Math.round(num * 100) / 100;
    }
  };
};

},{}],2:[function(require,module,exports){
"use strict";

var Scene = require('./components/scene.js');

var Utilities = require('./utils.js');

(function () {
  document.addEventListener("DOMContentLoaded", function () {
    Scene().init();
  });
})();

},{"./components/scene.js":1,"./utils.js":3}],3:[function(require,module,exports){
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
      }
    };
  }();

  module.exports = window.utils;
})();

},{}]},{},[2]);
