var container, stats;
var camera, scene, renderer;
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var helper;
var obj;
var textureLoader = new THREE.TextureLoader();
var mesh;
var helper;
var colorsNeedUpdate;
var light;

init();
animate();

var params = {
  faceColor: "#ffffcc",
  brushColor: "#1861b3",
  brushSize: 10,
  opacity: 1,
};

var gui = new dat.GUI();

var update = function () {
    var facecolorObj = new THREE.Color( params.faceColor );
    var hex = facecolorObj.getHexString();
    //var css = facecolorObj.getStyle();
    mesh.material.color.setHex("0x" + hex);
};

gui.addColor(params, 'faceColor').onChange(update);
gui.addColor(params, 'brushColor').onChange(update);
gui.add(params, 'brushSize', 0, 20).onChange(update);
gui.add(params, 'opacity', 0, 1).onChange(update);

function init() {
  container = document.createElement( 'div' );
  document.body.appendChild( container );

  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 2000 );
  camera.position.z = 100;
  //camera.position.x = 8;
  //camera.position.y = 8;

  // scene
  scene = new THREE.Scene();
  
  light = new THREE.AmbientLight( 0x444444 );
  scene.add( light );
  
  var directionalLight = new THREE.DirectionalLight( 0xffeedd );
  directionalLight.position.set( 0, 0, 1 ).normalize();
  scene.add( directionalLight );

  // BEGIN Clara.io JSON loader code
  // var objectLoader = new THREE.ObjectLoader();
  // objectLoader.load("lee-perry-smith-head-scan-threejs/lee-perry-smith-head-scan.json", function ( obj ) {
  //   var mesh = new THREE.Mesh(obj);
  //   scene.add( mesh );
  //   // obj.rotation.y = Math.PI; // Rotate to face camera
  //   // obj.position.y = -2; // Move down
  //   mesh.scale.set( 10, 10, 10 );
  // } );

  loadLeePerrySmith();

  helper();

  // END Clara.io JSON loader code
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );
  container.addEventListener( 'mousemove', onDocumentMouseMove, false );
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
    //geometry.faces[ faceIndex ].vertexColors[ vertexIndex ] = new THREE.Color( 0xff0000 );
    mesh = new THREE.Mesh( geometry, material );
    // for (i = 0; i < mesh.geometry.faces.length; i++) {
    //   mesh.geometry.faces[i].color = new THREE.Color("rgb(255, 0, 0)");
    // }
    scene.add( mesh );
    console.dir(mesh);
    mesh.scale.set( 10, 10, 10 );

    // gui.add(mesh.rotation.x, 'x').min(0.0).max(0.1).step(0.01);
    // gui.add(mesh.rotation.y, 'y', 0.1, 10, 0.1);
    // gui.add(mesh.scale, 'z', 0.1, 10, 0.1);
    //scene.add( new THREE.FaceNormalsHelper( mesh, 1 ) );
    //scene.add( new THREE.VertexNormalsHelper( mesh, 1 ) );
  } );
}

function helper() {
  var geometry = new THREE.CylinderGeometry( 0, 1, 8, 5 ); // Right now hardcoded measurments.
  geometry.translate( 0, 4, 0 ); //needs to be changed based on cylinder measurments!
  geometry.rotateX( Math.PI / 2 );
  helper = new THREE.Mesh( geometry, new THREE.MeshNormalMaterial() );
  scene.add( helper );
}

function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseMove( event ) {

  mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
  raycaster.setFromCamera( mouse, camera );
  // See if the ray from the camera into the world hits mesh
  var intersects = raycaster.intersectObject( mesh );
  // Toggle rotation bool for meshes that we clicked
  if ( intersects.length > 0 ) {
    helper.position.set( 0, 0, 0 );
    helper.lookAt( intersects[ 0 ].face.normal );
    helper.position.copy( intersects[ 0 ].point );

    intersectedFaceId = intersects[0].face.id;
    //intersects[0].face.vertexColors = new THREE.Color("rgb(255, 0, 0)");
    //mesh.geometry.faces[i].color = new THREE.Color("rgb(255, 0, 0)");

    for (i = 0; i < mesh.geometry.faces.length; i++) {
      //mesh.geometry.faces[i].vertexColors = new THREE.Color("rgb(255, 0, 0)");
      //console.log(mesh.geometry.faces[i].normal);
      if (mesh.geometry.faces[i].normal == intersects[0].face.normal) {
        //console.log("INTERSECT: ", intersects[0].face.normal);
        //console.log("MESH: ", mesh.geometry.faces[i].normal);
        mesh.geometry.faces[i].color.setHex(0x00ffff); //= new THREE.Color("rgb(255, 0, 0)");
        //console.log("RESULT: ", mesh.geometry.faces[i]);
      }
    }
    mesh.geometry.colorsNeedUpdate = true;
    //console.log(intersects[0].face);
    //mesh.paintFace(intersectedFaceId);
  }
  //mouseX = ( event.clientX - windowHalfX ) / 2;
  //mouseY = ( event.clientY - windowHalfY ) / 2;
}

//
function animate() {
  requestAnimationFrame( animate );
  render();
}

function render() {
  //camera.position.x += ( mouseX - camera.position.x ) * .05;
  //camera.position.y += ( - mouseY - camera.position.y ) * .05;
  camera.lookAt( scene.position );
  renderer.render( scene, camera );
}


document.onkeydown = changeLight;

function changeLight(e){
  
  e = e || window.event;

          if (e.keyCode == '38') {
            //up
              light.position.y += 0.5;
          }
          else if (e.keyCode == '40') {
            //down
               light.position.y -= 0.5;

          }
          else if (e.keyCode == '37') {
            //left
              light.position.x -= 0.5;
 
          }
          else if (e.keyCode == '39') {
            //right
              light.position.x += 0.5;

          }
          else if(e.keyCode == '65'){
            //a = ambient
            scene.remove(light);
            light = new THREE.AmbientLight( 0x444444 );
            scene.add( light );

          }
          else if(e.keyCode == '68'){
            //d = directional
            scene.remove(light);
            light = new THREE.DirectionalLight( 0xffffff );
            light.position.set( 0, 1, 1 ).normalize();
            scene.add(light);
          }  else if (e.keyCode =='80'){
            //p = point
            scene.remove(light);
            light = new THREE.PointLight( (params, 'brushColor'), 1, 100 );
            light.position.set( 0, 1, 1 ).normalize();
            scene.add( light );
          } else if (e.keyCode == '72'){
            //h = hemisphere
            scene.remove(light);
            light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
            scene.add( light );
          }
}

