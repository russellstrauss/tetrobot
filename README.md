# Tetrobot

A tetrahedral robot virtual simulation.

## Authors

* **Russell Strauss**

## Getting Started

Note: You will have to have a local web server running to load fonts due to CORS browser security policy. I have configured the graphics to still
run when font load fails, but I would recommend running a local web server to the folder containing index.html for full functionality. I will also provide a URL
link below in case you do not have a local web server available. Please contact Russell Strauss (russellstrauss@gatech.edu, 678-549-2874) if you have any questions or
need assistance running.

https://threejs.org/docs/#manual/en/introduction/How-to-run-things-locally

### Prerequisites

Node.js

### Installing

If you have Node.js installed on your machine, you can run the following commands in the root of this directory:

```
npm install
gulp
```

If it is your first time running gulp, you will need to run the following command only the first time:

```
npm install gulp -g
```

After running the gulp command, a new browser window will open with the project running.

### Running

After completing the above steps (you must re-run the 'npm install' command if the node_modules folder has been deleted), you can run the application by simply running the command 'gulp' in the root of the directory.

```
gulp
```

### Controls

* L key: roll left
* R key: roll right
* O key: roll back
* Left mouse click: rotate camera
* Right mouse click: pan camera
* Scroll: zoom

## Deployment

If you cannot run local web server, view project here: [http://jrstrauss.net/cg/tetrobot/](http://jrstrauss.net/cg/tetrobot/)

## Built With

* [Three.js](https://threejs.org/) - The WebGL JavaScript graphics framework

## Reference Materials

* [Rotate a point about an arbitrary axis (3 dimensions)](http://paulbourke.net/geometry/rotate/) - Paul Bourke
