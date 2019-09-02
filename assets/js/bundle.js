(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

module.exports = function () {
  var tetrahedron, renderer, scene, camera, controls;
  var stats = new Stats();
  return {
    settings: {
      activateLightHelpers: false,
      axesHelper: {
        activateAxesHelper: true,
        axisLength: 10
      },
      tetrahedron: {
        size: 5
      }
    },
    init: function init() {
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
        stats.update(); //tetrahedron.rotation.z += .001;
        // tetrahedron.rotation.x += .001;
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
      controls.screenSpacePanning = false;
      controls.minDistance = 10;
      controls.maxDistance = 500;
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
    addTetrahedron: function addTetrahedron() {
      var self = this;
      var geometry = new THREE.TetrahedronGeometry(self.settings.tetrahedron.size, 0);
      var wireframeMaterial = new THREE.MeshBasicMaterial({
        wireframe: true,
        color: 0x08CDFA
      });
      var shadeMaterial = new THREE.MeshPhongMaterial({
        color: 0x08CDFA,
        side: THREE.DoubleSide
      }); // tetrahedron.rotation.z = Math.PI / 4;

      geometry.applyMatrix(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, -1).normalize(), Math.atan(Math.sqrt(2)))); // Rotate to be flat on floor

      geometry.rotateY(Math.PI / 4); // rotate to line up with x-axis
      //tetrahedron.position.y += self.settings.tetrahedron.size / 2;
      // Calculating centroid of a tetrahedron: https://www.youtube.com/watch?v=Infxzuqd_F4
      // Next step: write method to calculate centroid location from 4 current vertices locations

      var centroidOfBottomFace = {};
      centroidOfBottomFace.x = (geometry.vertices[0].x + geometry.vertices[1].x + geometry.vertices[3].x) / 3;
      centroidOfBottomFace.y = (geometry.vertices[0].y + geometry.vertices[1].y + geometry.vertices[3].y) / 3;
      centroidOfBottomFace.z = (geometry.vertices[0].z + geometry.vertices[1].z + geometry.vertices[3].z) / 3; //self.showPoint(centroidOfBottomFace_x, centroidOfBottomFace_y, centroidOfBottomFace_z, 0x0000ff);

      var tetrahedronHeight = self.getDistance(centroidOfBottomFace, geometry.vertices[2]); // Calulate centroid

      var centroid = self.calculateCentroidLocation(geometry.vertices); //self.showPoint(centroid.x, centroid.y, centroid.z, 0x000000);
      // move vertices

      for (var i = 0; i < geometry.vertices.length; i++) {
        var colors = [0xCE3611, 0x00CE17, 0x03BAEE, 0x764E8C]; // 				[red, 		green, 		blue, 		purple]

        geometry.vertices[i].y += tetrahedronHeight / 4;
        geometry.verticesNeedUpdate = true;
        self.showPoint(geometry.vertices[i], colors[i]);
      } // Let's try to draw a triangle face


      var triangleGeometry = self.createTriangle(geometry.vertices[0], geometry.vertices[1], geometry.vertices[3]);
      self.drawLine(geometry.vertices[1], geometry.vertices[3]);
      var midpoint = self.getMidpoint(geometry.vertices[1], geometry.vertices[3]);
      self.showPoint(midpoint, 0x0000ff);
      var halfSideLength = self.getDistance(geometry.vertices[1], midpoint);
      var hypotenuse = self.getDistance(geometry.vertices[1], geometry.vertices[3]);
      var height = hypotenuse - halfSideLength; // pythagorean

      var triangleMesh = new THREE.Mesh(triangleGeometry, wireframeMaterial);
      scene.add(triangleMesh); //self.rotateOnAxis(triangleMesh, geometry.vertices[1], geometry.vertices[3], Math.PI);

      var tetrahedron = new THREE.Mesh(geometry, wireframeMaterial);
      scene.add(tetrahedron);
      self.rotateOnAxis(triangleMesh, geometry.vertices[0], geometry.vertices[1], Math.PI); //self.rotateOnAxis(tetrahedron, geometry.vertices[0], geometry.vertices[1], Math.PI / 2);
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
    showPoint: function showPoint(pt, color) {
      color = color || 0xff0000;
      var dotGeometry = new THREE.Geometry();
      dotGeometry.vertices.push(new THREE.Vector3(pt.x, pt.y, pt.z));
      var dotMaterial = new THREE.PointsMaterial({
        size: 10,
        sizeAttenuation: false,
        color: color
      });
      var dot = new THREE.Points(dotGeometry, dotMaterial);
      scene.add(dot);
    },
    showVector: function showVector(vector, origin, color) {
      color = color || 0xff0000;
      var arrowHelper = new THREE.ArrowHelper(vector, origin, origin.distanceTo(vector), color);
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
    calculateCentroidLocation: function calculateCentroidLocation(geometryVertices) {
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
      self.labelAxes();
    },
    labelAxes: function labelAxes() {
      var self = this;
      var loader = new THREE.FontLoader();
      loader.load('../assets/vendors/js/three.js/examples/fonts/helvetiker_regular.typeface.json', function (font) {
        var fontStyle = {
          font: font,
          size: 1,
          height: 0,
          curveSegments: 1
        };
        var textGeometry = new THREE.TextGeometry('Y', fontStyle);
        var textMaterial = new THREE.MeshBasicMaterial({
          color: 0x00ff00
        });
        var mesh = new THREE.Mesh(textGeometry, textMaterial);
        textGeometry.translate(0, self.settings.axesHelper.axisLength, 0);
        scene.add(mesh);
        textGeometry = new THREE.TextGeometry('X', fontStyle);
        textMaterial = new THREE.MeshBasicMaterial({
          color: 0xff0000
        });
        mesh = new THREE.Mesh(textGeometry, textMaterial);
        textGeometry.translate(self.settings.axesHelper.axisLength, 0, 0);
        scene.add(mesh);
        textGeometry = new THREE.TextGeometry('Z', fontStyle);
        textMaterial = new THREE.MeshBasicMaterial({
          color: 0x0000ff
        });
        mesh = new THREE.Mesh(textGeometry, textMaterial);
        textGeometry.translate(0, 0, self.settings.axesHelper.axisLength);
        scene.add(mesh);
      });
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
      }
    };
  }();

  module.exports = window.utils;
})();

},{}]},{},[2]);
