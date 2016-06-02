var container, stats;
var camera, controls, scene, renderer;
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var helper;
var obj;
var textureLoader = new THREE.TextureLoader();
var mesh;
var geometry;
var helper;
var colorsNeedUpdate;
var chosenBrushColor = "dc47b8";
var chosenSkinColor;
var mouseDown;
var rainbow = false;
var gradient = false;
var erase = false;

init();
animate();

//Parameters used in control interface
var params = {
  faceColor: "#ffffcc",
  brushColor: "#dc47b8",
  Rainbow: false,
  Gradient: false,
  Erase: false,
  Clear: function() {
    for (i = 0; i < mesh.geometry.faces.length; i++) {
      face = mesh.geometry.faces[i];
      numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
      for (j = 0; j < numberOfSides; j++) {
        mesh.geometry.faces[ i ].vertexColors[ j ].setHex( 0xffffff );
      }
      mesh.geometry.colorsNeedUpdate = true;
      mesh.geometry.elementsNeedUpdate = true;
      mesh.geometry.faces.needsUpdate = true;
    }
  }
};

var gui = new dat.GUI();

//Function for updating "skin color" (general color of mesh)
var updateSkinColor = function () {
    var facecolorObj = new THREE.Color( params.faceColor );
    var hex = facecolorObj.getHexString();
    chosenSkinColor = hex;
    mesh.material.color.setHex("0x" + hex);
};

//function for updating the brush, color and "type" of brush
var updateBrushColor = function() {

  //if either rainbow or gradient is checked, remove the eraser checker from the gui
  if (params.Rainbow || params.Gradient){
    params['Erase'] = false;
  }

  //rainbow brush, for a rainbow effect
  if (params.Rainbow == true) {
    var hexes = ["f20e0e", "430ef2", "0ef2e4", "0ef286", "5ef20e", "f2f10e", "f2a10e", "f20ec9", "772fde"];
    var randHex = hexes[Math.floor(Math.random() * 8)];
    chosenBrushColor = randHex;
    helper.material.color.setHex("0x" + chosenBrushColor);
    rainbow = true;
  } else {
    //if rainbow is set to false, reset to the previous brush color
    rainbow = false;
    var facecolorObj = new THREE.Color( params.brushColor );
    var hex = facecolorObj.getHexString();
    chosenBrushColor = hex;
    helper.material.color.setHex("0x" + chosenBrushColor);
  }

  //when graident is checked, toggle the gradient boolean
  if (params.Gradient == true) {
    gradient = true;
  } else {
    gradient = false;
  }

}

//function controlling the eraser
function updateErase(){

  if (params.Erase){
      //set rainbow and gradient to false if eraser is checked
      params['Gradient'] = false;
      params['Rainbow'] = false;

      gradient = false;
      rainbow = false;

      //set brush color to white to get an erasing effect
      chosenBrushColor = "ffffff";
      helper.material.color.setHex("0x" + chosenBrushColor);
      console.log(helper.material.color);
  } else if(!params.Erase){
      //if eraser is unchecked, go back to the previous brush color
      chosenBrushColor = new THREE.Color(params.brushColor).getHexString();
      helper.material.color.setStyle(params.brushColor);
  }

}

//add controllers to the gui
gui.addColor(params, 'faceColor').onChange(updateSkinColor);
gui.addColor(params, 'brushColor').onChange(updateBrushColor);
gui.add(params, 'Rainbow').listen().onChange(updateBrushColor);
gui.add(params, 'Gradient').listen().onChange(updateBrushColor);
gui.add(params, 'Erase').listen().onChange(updateErase);
gui.add(params, 'Clear');


function init() {

  //Loading manager used for the loading animation before mesh is complete.
  manager = new THREE.LoadingManager();

  manager.onProgress = function(item, loaded, total) {
    console.log(item, loaded, total);
  }

  manager.onLoad = function() {
    console.log('all items loaded');
    document.getElementsByClassName('loader')[0].style.display='none';
  }

  manager.onError = function() {
    console.log('ERROR loading');
  }

  container = document.createElement( 'div' );
  document.body.appendChild( container );

  // Camera 
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 2000 );
  camera.position.z = 100;
  
  // Scene
  scene = new THREE.Scene();

  loadLeePerrySmith();
  helper();

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );
  container.addEventListener( 'mousedown', onDocumentMouseDown, false );
  container.addEventListener( 'mouseup', onDocumentMouseUp, false );
  container.addEventListener( 'mousemove', onDocumentMouseMove, false );

  //controls, after the renderer
  controls = new THREE.OrbitControls( camera, renderer.domElement );
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  //controls.enableZoom = true;
  controls.minDistance = 70;
  controls.maxDistance = 160; // börjar här

  window.addEventListener( 'resize', onWindowResize, false );
}

//load the 3D model
function loadLeePerrySmith( callback ) {
  console.log("Loading...");
  var loader = new THREE.JSONLoader(manager);
  loader.load( 'js/leeperrysmith.js', function( geometry ) {
    var material = new THREE.MeshPhongMaterial( {
      color: THREE.Color,
      vertexColors: THREE.VertexColors,
      specular: 0x111111,
      map: textureLoader.load( 'lee-perry-smith-head-scan-threejs/Face_Color.jpg' ),
      specularMap: textureLoader.load( 'lee-perry-smith-head-scan-threejs/Face_Disp.jpg' ),
      normalMap: textureLoader.load( 'lee-perry-smith-head-scan-threejs/Infinite-Level_02_Tangent_SmoothUV.jpg' ),
      normalScale: new THREE.Vector2( 0.75, 0.75 ),
      shininess: 25
    } );

    // Setting color of all mesh-faces to white
    for (i = 0; i < geometry.faces.length; i++) {
      face = geometry.faces[i];
      numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
      for (j = 0; j < numberOfSides; j++) {
        geometry.faces[ i ].vertexColors[ j ] = new THREE.Color( 0xffffff );
      }
    }

    mesh = new THREE.Mesh( geometry, material );

    scene.add( mesh );
    mesh.scale.set( 14, 14, 14 );
  } );
}

//the brush helper (a cone following the 3D surface)
function helper() {
  var geometry = new THREE.CylinderGeometry( 0, 1, 8, 5 );
  geometry.translate( 0, 4, 0 ); //needs to be changed based on cylinder measurments!
  geometry.rotateX( Math.PI / 2 );
  helper = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial() );
  helper.material.color.setHex("0x" + chosenBrushColor); //changes color based on chosen brush color
  scene.add( helper );
}

function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseDown( event ) {
  mouseDown = true;
  draw();
}

function onDocumentMouseUp( event ) {
  mouseDown = false;
}

function onDocumentMouseMove( event ) {
  draw();
  
}

//draw function for coloring the 3D model
function draw() {
  mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
  raycaster.setFromCamera( mouse, camera );

  // See if the ray from the camera in the mouse direction hits mesh
  var intersects = raycaster.intersectObject( mesh );
  
  // Check if there was an intersection
  if ( intersects.length > 0 ) {
    controls.enabled = false;
    helper.visible = true;
    document.body.style.cursor = 'none';
    helper.position.set( 0, 0, 0 );
    helper.lookAt( intersects[ 0 ].face.normal );
    helper.position.copy( intersects[ 0 ].point );

    //Looping through all faces and comparing their normals to the one intersected in order to find the correct face.
    if ( mouseDown == true ) {
      for (i = 0; i < mesh.geometry.faces.length; i++) {

        if (mesh.geometry.faces[i].normal == intersects[0].face.normal) {
          face = mesh.geometry.faces[i];
          numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
          for (j = 0; j < numberOfSides; j++) {
            if ( rainbow == true ) {
              if ( gradient == true ) {
                mesh.geometry.faces[i].vertexColors[ j ].setHSL( Math.random(), 0.5, 0.5 ); //Random colored vertices (gradient)
              } else {     
                mesh.geometry.faces[i].vertexColors[ j ].setHex( "0x" + chosenBrushColor ); //Rainbow colored vertices
              }
            }
            else {
              if ( gradient == true ) { // Coloring first and second vertex in chosen color, the last is white creating gradient
                mesh.geometry.faces[i].vertexColors[ 0 ].setHex( "0x" + chosenBrushColor ); 
                mesh.geometry.faces[i].vertexColors[ 1 ].setHex( "0x" + chosenBrushColor );
                mesh.geometry.faces[i].vertexColors[ 2 ].setHex( 0xffffff );
              } else {
                mesh.geometry.faces[i].vertexColors[ j ].setHex( "0x" + chosenBrushColor ); // Chosen brush colored vertices
              }
            }
          }
        }
      }
      
      //if rainbow is enabled, the color of the brush has to be updated with each "stroke"
      if (rainbow) {
         updateBrushColor();
      }
     
      mesh.geometry.colorsNeedUpdate = true;
      mesh.geometry.elementsNeedUpdate = true;
      mesh.geometry.faces.needsUpdate = true;
    }
  } else {
    controls.enabled = true;
    helper.visible = false;
    document.body.style.cursor = 'default';
  }

}

//
function animate() {
  requestAnimationFrame( animate ); 
  controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true
  render();
}

function render() {
  camera.lookAt( scene.position );
  renderer.render( scene, camera );
}

//toggles the about text on the main page
var showAbout = false;

//when clicking on "about", toggle visibility of the text
function toggleAbout(){
  if (showAbout){
    document.getElementById("about").style.visibility = "visible";
  } else {
    document.getElementById("about").style.visibility = "hidden";
  }

  showAbout = !showAbout;
}

