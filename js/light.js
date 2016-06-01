//variables for all the different lights
var ambientLight;
var directionalLight;
var pointLight;


//sets up a default light for the scene
function setupLight(){

	//an ambient light for "basic" illumination
	ambientLight = new THREE.AmbientLight( 0x444444 );
	scene.add( ambientLight );

	//a directional light for some nicer additional illumination
	directionalLight = new THREE.DirectionalLight( 0xffeedd );
	directionalLight.position.set( 0, 0, 1 ).normalize();
	scene.add( directionalLight );

	//set up the point light but without adding it to the scene
	pointlight = new THREE.PointLight( 0x444444, 2, 30 );
	pointLight.position.set( 0, 0, 37 );

}

//removes all lights from the scene
function removeAllLights(){

	scene.remove(ambientLight);
	scene.remove(directionalLight);
	scene.remove(pointLight);

}

//add light parameters to the parameter object

//ambient light
params.ambientLight = true;
params.ambientLightColor = "#444444";

//directional light
params.directionalLight = true;
params.directionalLightColor = "#ffeedd";
params.directionalLightX = 0;
params.directionalLightY = 1;
params.directionalLightZ = 1;

//point light
params.pointLight = false;
params.pointLightColor = "#ffeedd";
params.pointLightX = 0;
params.pointLightY = 0;
params.pointLightZ = 37;
params.pointLightDistance = 30;
params.pointLightIntensity = 2;

//reset light
params.resetLight = function(){
	removeAllLights();
	setupLight();

	//set the gui parameters to default
	params["ambientLight"] = true;
	params["directionalLight"] = true;
	params["pointLight"] = false;
	
};

//----------------GUI CONTROLS-----------------------

//a root folder for all light controls
var lightFolder = gui.addFolder('Lights');


//ambient light
var ambientLightFolder = lightFolder.addFolder("Ambient Light"); //gui folder

//turn on and off
ambientLightFolder.add(params, 'ambientLight').listen().onChange(function(){
	if (params.ambientLight) {
		scene.add( ambientLight );
	} else if (!params.ambientLight){
		scene.remove( ambientLight );
	}
});

//color of ambient light
ambientLightFolder.addColor(params, 'ambientLightColor').onChange(function(){
	ambientLight.color.setStyle( params.ambientLightColor );
});

//directional light
var directionalLightFolder = lightFolder.addFolder("Directional Light");

//turn on and off
directionalLightFolder.add(params, "directionalLight").listen().onChange(function(){
	if (params.directionalLight) {
		scene.add( directionalLight );
	} else if (!params.directionalLight){
		scene.remove( directionalLight );
	}
})


//color of directional light
directionalLightFolder.addColor(params, 'directionalLightColor').onChange(function(){
	directionalLight.color.setStyle( params.directionalLightColor );
});

//x coordinate
directionalLightFolder.add(params, "directionalLightX", -10, 10).onChange(function(){
	directionalLight.position.x = params.directionalLightX;
})

//y coordinate
directionalLightFolder.add(params, "directionalLightY", -10, 10).onChange(function(){
	directionalLight.position.y = params.directionalLightY;
})

//z coordinate
directionalLightFolder.add(params, "directionalLightZ", -10, 10).onChange(function(){
	directionalLight.position.z = params.directionalLightZ;
})

//pointlight
var pointLightFolder = lightFolder.addFolder("Point Light");

//turn on and off
pointLightFolder.add(params, "pointLight").listen().onChange(function(){
	if (params.pointLight) {
		scene.add( pointLight );
	} else if (!params.pointLight){
		scene.remove( pointLight );
	}
})

//color of point light
pointLightFolder.addColor(params, 'pointLightColor').onChange(function(){
	pointLight.color.setStyle( params.pointLightColor );
});

//x coordinate
pointLightFolder.add(params, "pointLightX", -20, 20).onChange(function(){
	pointLight.position.x = params.pointLightX;
})

//y coordinate
pointLightFolder.add(params, "pointLightY", -20, 20).onChange(function(){
	pointLight.position.y = params.pointLightY;
})

//z coordinate
pointLightFolder.add(params, "pointLightZ", 17, 50).onChange(function(){
	pointLight.position.z = params.pointLightZ;
})

//point light distance
pointLightFolder.add(params, "pointLightDistance", 0, 70).onChange(function(){
	pointLight.distance = params.pointLightDistance;
})

//point light intensity
pointLightFolder.add(params, "pointLightIntensity", 0, 10).onChange(function(){
	pointLight.intensity = params.pointLightIntensity;
})

// reset light
lightFolder.add(params, 'resetLight');


//run the setupLight function to create the default lights for the scene
setupLight();