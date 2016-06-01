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
var light;
var chosenBrushColor = "dc47b8";
var chosenSkinColor;
var mouseDown;
var rainbow = false;
var gradient = false;
var lightColor =  0x444444;
var directionalLight;

init();
animate();

var params = {
  faceColor: "#ffffcc",
  brushColor: "#dc47b8",
  Rainbow: false,
  Gradient: false,
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

var updateSkinColor = function () {
    var facecolorObj = new THREE.Color( params.faceColor );
    var hex = facecolorObj.getHexString();
    chosenSkinColor = hex;
    mesh.material.color.setHex("0x" + hex);
};

var updateBrushColor = function() {

  if (params.Rainbow == true) {
    var hexes = ["f20e0e", "430ef2", "0ef2e4", "0ef286", "5ef20e", "f2f10e", "f2a10e", "f20ec9", "772fde"];
    var randHex = hexes[Math.floor(Math.random() * 8)];
    chosenBrushColor = randHex;
    helper.material.color.setHex("0x" + chosenBrushColor);
    rainbow = true;
  } else {
    rainbow = false;
    var facecolorObj = new THREE.Color( params.brushColor );
    var hex = facecolorObj.getHexString();
    chosenBrushColor = hex;
    helper.material.color.setHex("0x" + chosenBrushColor);
  }
  if (params.Gradient == true) {
    gradient = true;
  } else {
    gradient = false;
  }
}

gui.addColor(params, 'faceColor').onChange(updateSkinColor);
gui.addColor(params, 'brushColor').onChange(updateBrushColor);
gui.add(params, 'Rainbow').onChange(updateBrushColor);
gui.add(params, 'Gradient').onChange(updateBrushColor);
gui.add(params, 'Clear');

function init() {
  container = document.createElement( 'div' );
  document.body.appendChild( container );

  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 2000 );
  camera.position.z = 100;
  
  // scene
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
  controls.enableZoom = false;

  //
  window.addEventListener( 'resize', onWindowResize, false );
}

function loadLeePerrySmith( callback ) {
  var loader = new THREE.JSONLoader();
  loader.load( 'js/leeperrysmith.js', function( geometry ) {
    var material = new THREE.MeshPhongMaterial( {
      color: THREE.Color, //0x00ffff,
      vertexColors: THREE.VertexColors,
      specular: 0x111111,
      map: textureLoader.load( 'lee-perry-smith-head-scan-threejs/Face_Color.jpg' ),
      specularMap: textureLoader.load( 'lee-perry-smith-head-scan-threejs/Face_Disp.jpg' ),
      normalMap: textureLoader.load( 'lee-perry-smith-head-scan-threejs/Infinite-Level_02_Tangent_SmoothUV.jpg' ),
      normalScale: new THREE.Vector2( 0.75, 0.75 ),
      shininess: 25
    } );

    for (i = 0; i < geometry.faces.length; i++) {
      face = geometry.faces[i];
      numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
      for (j = 0; j < numberOfSides; j++) {
        geometry.faces[ i ].vertexColors[ j ] = new THREE.Color( 0xffffff );
      }
    }

    mesh = new THREE.Mesh( geometry, material );

    scene.add( mesh );
    //console.dir(mesh);
    mesh.scale.set( 14, 14, 14 );
  } );
}

function helper() {
  var geometry = new THREE.CylinderGeometry( 0, 1, 8, 5 ); // Right now hardcoded measurments.
  geometry.translate( 0, 4, 0 ); //needs to be changed based on cylinder measurments!
  geometry.rotateX( Math.PI / 2 );
  helper = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial() );
  helper.material.color.setHex("0x" + chosenBrushColor);
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

function draw() {
  mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
  raycaster.setFromCamera( mouse, camera );

  //console.log(mesh.geometry);
  // See if the ray from the camera into the world hits mesh
  var intersects = raycaster.intersectObject( mesh );
  // Toggle rotation bool for meshes that we clicked
  if ( intersects.length > 0 ) {
    controls.enabled = false;
    helper.visible = true;
    document.body.style.cursor = 'none';
    helper.position.set( 0, 0, 0 );
    helper.lookAt( intersects[ 0 ].face.normal );
    helper.position.copy( intersects[ 0 ].point );

    //intersectedFaceId = intersects[0].face.id;
    if ( mouseDown == true ) {
      for (i = 0; i < mesh.geometry.faces.length; i++) {

        if (mesh.geometry.faces[i].normal == intersects[0].face.normal) {
          // initialize color variable
          face = mesh.geometry.faces[i];
          numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
          for (j = 0; j < numberOfSides; j++) {
            if ( rainbow == true ) {
              if ( gradient == true ) {
                color = new THREE.Color( 0xffffff );
                //color.setHSL(0.125 * j/mesh.geometry.faces.length, 1.0, 0.5);
                color.setHex( Math.random() * 0xffffff );
                mesh.geometry.faces[i].vertexColors[ j ].setHSL( Math.random(), 0.5, 0.5 ); //= color;
                //console.log(mesh.geometry.faces[i].vertexColors);
              } else {     
                mesh.geometry.faces[i].vertexColors[ j ].setHex( "0x" + chosenBrushColor );
              }
            }
            else {
              if ( gradient == true ) {
                color = new THREE.Color( 0xffffff );
                color.setHex( "0x" + chosenBrushColor );
                mesh.geometry.faces[i].vertexColors[ 0 ].setHex( "0x" + chosenBrushColor );//setHSL( Math.random(), 0.5, 0.5 );
                mesh.geometry.faces[i].vertexColors[ 1 ].setHex( "0x" + chosenBrushColor );
                mesh.geometry.faces[i].vertexColors[ 2 ].setHex( 0xffffff );
                //mesh.geometry.faces[i].color.setHex("0x" + chosenBrushColor);
              } else {
                color = new THREE.Color( 0xffffff );
                color.setHex( "0x" + chosenBrushColor );
                mesh.geometry.faces[i].vertexColors[ j ].setHex( "0x" + chosenBrushColor );//setHSL( Math.random(), 0.5, 0.5 );
                //mesh.geometry.faces[i].color.setHex("0x" + chosenBrushColor);
              }
            }
          }
        }
      }
      
      updateBrushColor();
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
  requestAnimationFrame( animate );  //HÄRRRR
  controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true
  render();
}

function render() {
  //camera.position.x += ( mouseX - camera.position.x ) * .05;
  //camera.position.y += ( - mouseY - camera.position.y ) * .05;
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

