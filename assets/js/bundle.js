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
        fontStyle: {
          font: null,
          size: 1,
          height: 0,
          curveSegments: 1
        }
      }
    },
    init: function init() {
      var self = this;
      self.loadFont();
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
      camera.position.x = -20;
      camera.position.y = 20;
      camera.position.z = 20;

      var animate = function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
        controls.update();
        stats.update(); //self.threeStepRotation(tetrahedronGeometry, new THREE.Vector3(triangleGeometry.vertices[1].x, triangleGeometry.vertices[1].y, triangleGeometry.vertices[1].z), new THREE.Vector3(triangleGeometry.vertices[2].x, triangleGeometry.vertices[2].y, triangleGeometry.vertices[2].z), 0);
      };

      animate();
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
      controls.minDistance = 18;
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
    // Next steps: 
    // Determine, or randomly assign L, R, O directions.
    // Write method to easily calculate each triangle based on the L, R, O direction input.
    // Future: Structure in a way that allows to loop through list of L, R, O inputs and cycle through them in sequence.
    goLeft: function goLeft(tetrahedronGeometry, triangleGeometry) {
      var self = this;
      var geometry = tetrahedronGeometry.clone();
      self.threeStepRotation(geometry, triangleGeometry.vertices[1], triangleGeometry.vertices[0], 0);
      var mesh = new THREE.Mesh(geometry, wireframeMaterial);
      scene.add(mesh);
      return geometry;
    },
    goRight: function goRight(tetrahedronGeometry, triangleGeometry) {
      var self = this;
      var geometry = tetrahedronGeometry.clone();
      self.threeStepRotation(geometry, triangleGeometry.vertices[0], triangleGeometry.vertices[1], 0);
      var mesh = new THREE.Mesh(geometry, wireframeMaterial);
      scene.add(mesh);
      return geometry;
    },
    goBack: function goBack(tetrahedronGeometry, triangleGeometry) {
      var self = this;
      var geometry = tetrahedronGeometry.clone();
      self.threeStepRotation(geometry, triangleGeometry.vertices[2], triangleGeometry.vertices[0], Math.PI);
      geometry.rotateX(Math.PI);
      var mesh = new THREE.Mesh(geometry, wireframeMaterial);
      scene.add(mesh);
      return geometry;
    },
    addTetrahedron: function addTetrahedron() {
      var self = this;
      tetrahedronGeometry = new THREE.TetrahedronGeometry(self.settings.tetrahedron.size, 0);
      tetrahedronGeometry.applyMatrix(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, -1).normalize(), Math.atan(Math.sqrt(2)))); // Rotate to be flat on floor

      tetrahedronGeometry.rotateY(Math.PI / 4); // rotate to line up with x-axis

      var centroidOfBottomFace = self.calculateCentroidOfBottomFace(tetrahedronGeometry);
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
      var stepSequence = ['R', 'L', 'R'];
      var currentStep = startingGeometry;

      for (var _i = 0; _i < stepSequence.length; _i++) {
        currentStep = self.step(currentStep, stepSequence[_i]);
      }

      self.labelDirections(triangleGeometry);
    },
    getBottomFace: function getBottomFace(tetrahedronGeometry) {
      var self = this;
      var bottomFace = new THREE.Geometry();
      tetrahedronGeometry.vertices.forEach(function (vertex) {
        if (vertex.y === 0) {
          // Relies on there being no rounding errors
          bottomFace.vertices.push(vertex);
        }
      });
      return bottomFace;
    },
    step: function step(tetrahedronGeometry, direction) {
      var self = this;
      var bottomFace = self.getBottomFace(tetrahedronGeometry);
      self.labelDirections(bottomFace);
      var nextStep;

      if (direction === 'L') {
        nextStep = self.goLeft(tetrahedronGeometry, bottomFace);
      } else if (direction === 'R') {
        nextStep = self.goRight(tetrahedronGeometry, bottomFace);
      } else if (direction === 'O') {
        nextStep = self.goBack(tetrahedronGeometry, bottomFace);
      }

      var sharedEdge = {};
      sharedEdge.vertices = [];
      tetrahedronGeometry.vertices.forEach(function (vertex1, i) {
        nextStep.vertices.forEach(function (vertex2, j) {
          if (self.roundHundreths(vertex1.x) === self.roundHundreths(vertex2.x) && self.roundHundreths(vertex1.y) === self.roundHundreths(vertex2.y) && self.roundHundreths(vertex1.z) === self.roundHundreths(vertex2.z)) {
            sharedEdge.vertices.push(vertex2);
          }
        });
      }); // console.log(bottomFace);
      // console.log(sharedEdge);
      //self.labelDirections(bottomFace);

      self.showPoints(sharedEdge, new THREE.Color('black'));
      return nextStep;
    },
    threeStepRotation: function threeStepRotation(geometry, axisPt1, axisPt2, angle) {
      // Something is wrong with this math
      var self = this; // uncomment to visualize endpoints of roatation axis
      // self.showPoint(axisPt1, new THREE.Color('red'));
      // self.showPoint(axisPt2, new THREE.Color('red'));

      var v = new THREE.Vector3(axisPt2.x - axisPt1.x, axisPt2.y - axisPt1.y, axisPt2.z - axisPt1.z);
      v.normalize();
      var theta = Math.atan(v.x / v.z);
      v.applyAxisAngle(new THREE.Vector3(0, 1, 0), -1 * theta);
      var phi = Math.atan(v.y / Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.z, 2)));
      v.applyAxisAngle(new THREE.Vector3(1, 0, 0), phi);
      v.applyAxisAngle(new THREE.Vector3(0, 0, 1), angle);
      geometry.translate(-1 * axisPt1.x, -1 * axisPt1.y, -1 * axisPt1.z);
      geometry.rotateZ(angle);
      geometry.rotateX(-1 * phi);
      geometry.rotateY(theta);
      geometry.translate(axisPt1.x, axisPt1.y, axisPt1.z);
    },
    showPoints: function showPoints(geometry, color, opacity) {
      var self = this;

      for (var i = 0; i < geometry.vertices.length; i++) {
        self.showPoint(geometry.vertices[i], color, opacity);
      }
    },
    rotateOnAxis: function rotateOnAxis(object, axisPt1, axisPt2, angle) {
      var self = this;
      var pivotPoint = self.getMidpoint(axisPt1, axisPt2);
      var rotationAxis = self.createVector(axisPt1, axisPt2);
      rotationAxis.normalize();
      object.position.sub(pivotPoint); // remove the offset

      object.position.applyAxisAngle(rotationAxis, angle); // rotate the POSITION

      object.position.add(pivotPoint); // re-add the offset

      object.rotateOnAxis(rotationAxis, angle); // rotate the OBJECT
    },
    showPoint: function showPoint(pt, color, opacity) {
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
    calculateCentroidOfBottomFace: function calculateCentroidOfBottomFace(tetrahedronGeometry) {
      var centroidOfBottomFace = {};
      centroidOfBottomFace.x = (tetrahedronGeometry.vertices[0].x + tetrahedronGeometry.vertices[1].x + tetrahedronGeometry.vertices[3].x) / 3;
      centroidOfBottomFace.y = (tetrahedronGeometry.vertices[0].y + tetrahedronGeometry.vertices[1].y + tetrahedronGeometry.vertices[3].y) / 3;
      centroidOfBottomFace.z = (tetrahedronGeometry.vertices[0].z + tetrahedronGeometry.vertices[1].z + tetrahedronGeometry.vertices[3].z) / 3;
      return centroidOfBottomFace;
    },
    calculateCentroidLocation: function calculateCentroidLocation(geometryVertices) {
      // Calculating centroid of a tetrahedron: https://www.youtube.com/watch?v=Infxzuqd_F4
      var result = {};
      var x = 0,
          y = 0,
          z = 0;

      for (var i = 0; i < geometryVertices.length; i++) {
        x += geometryVertices[i].x;
        y += geometryVertices[i].y;
        z += geometryVertices[i].z;
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
    // Input: triangle geometry of the tetrahedron face that is currently on the floor
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
    },
    loadFont: function loadFont() {
      var self = this;
      var loader = new THREE.FontLoader();
      var fontPath = '';
      if (window.location.hostname.indexOf('localhost') !== -1) fontPath = '../assets/vendors/js/three.js/examples/fonts/helvetiker_regular.typeface.json';else fontPath = 'http://jrstrauss.net/cg/tetrobot/assets/vendors/js/three.js/examples/fonts/helvetiker_regular.typeface.json';
      loader.load(fontPath, function (font) {
        self.settings.font.fontStyle.font = font;
        self.begin();
        if (self.settings.axesHelper.activateAxesHelper) self.labelAxes();
      });
    },

    /* 	Inputs: 
    *	pt - point in space to label, in the form of object with x, y, and z properties
    *	label - text content for label
    */
    labelPoint: function labelPoint(pt, label, color) {
      var self = this;
      color = color || 0xff0000;
      var textGeometry = new THREE.TextGeometry(label, self.settings.font.fontStyle);
      var textMaterial = new THREE.MeshBasicMaterial({
        color: color
      });
      var mesh = new THREE.Mesh(textGeometry, textMaterial);
      textGeometry.translate(pt.x, pt.y, pt.z);
      scene.add(mesh);
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
