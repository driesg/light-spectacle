"use strict";


let view = ()=> {

	var con = console;

	var camera, scene, renderer, composer, controls;
	var group, light, light2, ambientLight;
	let meshes = [];

	var taskCount = 0;
	var valueCount = 0;



	let init = () => {
		// renderer = new THREE.WebGLRenderer();
		renderer = new THREE.WebGLRenderer( { antialias:true, alpha: true } );
		// renderer.setClearColor( 0x000000, 1);
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( renderer.domElement );

		camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );
		// camera.position.z = 400;
		scene = new THREE.Scene();
		controls = new THREE.OrbitControls( camera, renderer.domElement );

		light = new THREE.DirectionalLight( 0xffffff );
		light.position.set( 1, 1, 1 );
		light.intensity = 1;

		light2 = new THREE.DirectionalLight( 0xffffff );
		light2.position.set( 5, 2,2 );
		light2.intensity = 2;

		scene.add( light );
		scene.add( light2 );

		// scene.add( new THREE.AmbientLight( 0x888888 ) );
		// ambientLight =  new THREE.AmbientLight( 0x3f3f3f );
		// ambientLight =  new THREE.AmbientLight( 0xf0f0f0 );
		// ambientLight.intensity = 0.1;
		// scene.add(ambientLight);
		load()

		window.addEventListener( 'resize', onWindowResize, false );
		document.getElementById("info").addEventListener('click', reload, false);
	}

	let onWindowResize = () => {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );

	}

	let load = () => {
		taskCount = 0;
		valueCount = 0;
		scene.remove(group);

		light.intensity = 0.3;
		group = new THREE.Object3D();
		scene.add( group );

		// for ( var i = 0; i < 10; i ++ ) {
	//
		// 	var geometry = new THREE.SphereGeometry( Math.random() + 0.9, Math.random() + 6, Math.random()  );
		// 	var material = new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading } );
		// 	var mesh = new THREE.Mesh( geometry, material );
		// 	mesh.position.set( Math.random() - 0.5, Math.random() - 0.6, Math.random() - 0.5 ).normalize();
		// 	mesh.position.multiplyScalar( Math.random() * 300 );
		// 	mesh.rotation.set( Math.random() * 3, Math.random() * 3, Math.random() * 3 );
		// 	mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 46;
		// 	group.add( mesh );
	//
		// }

		camera.position.z = 400;

		composer = new THREE.EffectComposer( renderer );
		composer.addPass( new THREE.RenderPass( scene, camera ) );

		//disabled dot screen shader for now
		var effect = new THREE.ShaderPass( THREE.DotScreenShader );

		effect.uniforms[ 'scale' ].value = 16;
		effect.uniforms[ 'tDiffuse' ].value = 0.8;

		composer.addPass( effect );

		this.effectRGB = new THREE.ShaderPass( THREE.RGBShiftShader );
		this.effectRGB.uniforms[ 'amount' ].value = 0.0015;
		this.effectRGB.uniforms[ 'angle' ].value = 0 ;
		this.effectRGB.renderToScreen = true;
		composer.addPass( this.effectRGB );

	}

	let reload = () => {
		load();
	}

	let checkObjects = (time) => {
		// con.log("checkObjects", meshes.length);
		for (var i = meshes.length - 1; i >= 0; i--) {
			var mesh = meshes[i].taskObject;
			var scale = mesh.scale.x;
			var newScale = scale * 0.999;
			if (newScale > 0.1) {
				mesh.scale.set(newScale, newScale, newScale);	
			}
		}
	}

	let animate = (time) => {
		// console.log("ANIMATE rgb effect value", this.effectRGB.uniforms[ 'amount' ].value );

		requestAnimationFrame( animate );

		checkObjects(time);

		group.rotation.x += 0.001;
		group.rotation.y += 0.001;

		composer.render();
		controls.update();

	}

	function makeTextSprite( message, parameters, position)
	{
		console.log("<<<<<< maketextsprite check position >>>>>>>>", position)
		if ( parameters === undefined ) parameters = {};

		var fontface = parameters.hasOwnProperty("fontface") ?
			parameters["fontface"] : "Arial";

		var fontsize = parameters.hasOwnProperty("fontsize") ?
			parameters["fontsize"] : 18;

		var borderThickness = parameters.hasOwnProperty("borderThickness") ?
			parameters["borderThickness"] : 4;

		var borderColor = parameters.hasOwnProperty("borderColor") ?
			parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };

		var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
			parameters["backgroundColor"] : { r:0, g:0, b:0, a:1.0 };

		// var spriteAlignment = THREE.SpriteAlignment.topLeft;

		var canvas = document.createElement('canvas');
		canvas.width = 1024;
		canvas.height = 512;
		var context = canvas.getContext('2d');
		context.font = "Bold " + fontsize + "px " + fontface;

		// get size data (height depends only on font size)
		var metrics = context.measureText( message );
		var textWidth = metrics.width;
		console.log("text width:", textWidth)


		// background color
		context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
									  + backgroundColor.b + "," + backgroundColor.a + ")";
		// border color
		context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
									  + borderColor.b + "," + borderColor.a + ")";

		context.lineWidth = borderThickness;
		roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
		// 1.4 is extra height factor for text below baseline: g,j,p,q.

		// text color
		context.fillStyle = "rgba(255, 255, 255, 1.0)";

		context.fillText( message, borderThickness, fontsize + borderThickness);

		// canvas contents will be used for a texture
		var texture = new THREE.Texture(canvas)
		texture.needsUpdate = true;

		var spriteMaterial = new THREE.SpriteMaterial( { map: texture, color:  0xffffff });
		var sprite = new THREE.Sprite( spriteMaterial );
		sprite.scale.set(100,50,1.0);



		// sprite.position.setX(posX);
		// sprite.position.setY(posY);
		// sprite.position.setZ(posZ);
		sprite.position.set(position.x, position.y, position.z).normalize();
		sprite.position.multiplyScalar(100);


		console.log("sprite properties", sprite)

		return sprite;
	}

	// function for drawing rounded rectangles
	function roundRect(ctx, x, y, w, h, r)
	{
		ctx.beginPath();
		ctx.moveTo(x+r, y);
		ctx.lineTo(x+w-r, y);
		ctx.quadraticCurveTo(x+w, y, x+w, y+r);
		ctx.lineTo(x+w, y+h-r);
		ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
		ctx.lineTo(x+r, y+h);
		ctx.quadraticCurveTo(x, y+h, x, y+h-r);
		ctx.lineTo(x, y+r);
		ctx.quadraticCurveTo(x, y, x+r, y);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	}

	let addObject = function(multipliers, position) {
		console.log("<<<< add group position >>>>>", position);

		var geometry = new THREE.SphereGeometry( Math.random() + 0.9, Math.random() + 6, Math.random()  );
		var material = new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading } );
		var mesh = new THREE.Mesh( geometry, material );

		mesh.position.set( position.x, position.y, position.z ).normalize();
		// mesh.position.multiplyScalar( Math.random() * 300 );
		mesh.position.multiplyScalar(100);

		var sphereRotationX =  Math.random() * 3;
		var sphereRotationY =  Math.random() * 3;
		var sphereRotationZ =  Math.random() * 3;
		mesh.rotation.set( sphereRotationX, sphereRotationY, sphereRotationZ);

		//set multi
		// mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * multipliers.price;

		mesh.scale.x = mesh.scale.y = mesh.scale.z = 0.1 * multipliers.price;

		console.log("mesh properties", mesh);

		return mesh;
	}

	let addObjectPusher = (ev, obj) => {

		// addObject(ev, obj);
		// Only add object when task exists
		//First generate the shared position of the sphere and text
		// var position = { x: Math.random() - 0.5, y: Math.random() - 0.5, z: Math.random() - 0.5 };
		var position = { x: Math.random() - 0.8, y: Math.random() - 0.3, z: Math.random() - 0.3 };

		if (typeof obj != "undefined") {
			if (typeof obj.message != "undefined") {
				console.log("create object");
				if (typeof obj.message.task_id != "undefined") {
					serviceGetTaskAddObject(obj.message.task_id, position);
					// console.log("multiplier", multipliers);

				}



				//these values actually need to be the same as the sphere
				// var posX =  Math.random() - 10;
				// var posY =  Math.random() - 10;
				// var posZ =  Math.random() - 10;
				// spritey.position.set(spherePositionX,spherePositionY,spherePositionZ);
				// spritey.position.setX(posX);
				// spritey.position.setY(posY);
				// spritey.position.setZ(posZ);

				// var spritey = makeTextSprite( obj.message.title, { fontsize: 32, fontface: "Georgia", borderColor: {r:0, g:0, b:255, a:1.0} }, position);
				// group.add(spritey);

				console.log( "create sprite");
			}
		}
	}

	let serviceGetTaskAddObject = (id, position) => {
		var serviceURL = "https://www.airtasker.com/api/v2/tasks/"+id;

		var xmlhttp = new XMLHttpRequest();

		xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
		var response = JSON.parse(xmlhttp.responseText);
		myFunction(response);
		}
		};

		xmlhttp.open("GET", serviceURL, true);
		xmlhttp.send();

		function myFunction(response) {
			console.log("response", response)

			var taskObject = new THREE.Object3D();
			group.add( taskObject );

			var task = response.task;
			// multiplier can be either amount or price or in the future a more complex algorithm in relation to: price, comments, bids
			var amount = task.amount;
			var price =	task.price;
			// addObject(ev, obj);
			var multipliers = { amount: task.amount, price: task.price };
			var sphere = addObject(multipliers, position);
			var spriteText = task.name + ": $" + price;
			var spritey = makeTextSprite(spriteText, { fontsize: 32, fontface: "Georgia", borderColor: {r:0, g:0, b:255, a:1.0} }, position);
			
			taskObject.add(sphere);
			taskObject.add(spritey);

			meshes.push({
				taskObject: taskObject,
				sphere: sphere,
				spritey: spritey
			});

			taskCount++;
			valueCount+=price;

			document.getElementById("task-counter").innerHTML = taskCount;
			document.getElementById("value-counter").innerHTML = "$"+valueCount;
		}

	}

  // let addObjectGenerator = (ev, obj) => {
		// addObject();

		// var spherePositionX =  Math.random() - 0.5;
		// var spherePositionY =  Math.random() - 0.6;
		// var spherePositionZ =  Math.random() - 0.5;

		// var spritey = makeTextSprite( obj.name, { fontsize: 32, fontface: "Arial", borderColor: {r:0, g:0, b:255, a:1.0}, borderThickness: 0 } );
		// spritey.position.set(spherePositionX,spherePositionY,spherePositionZ);
		// group.add( spritey );

  // }


	init();
	animate(0);

	let customLog = (ev, status) => {
		var div = document.createElement("div");
		div.innerHTML = "### " + ev + " " + status;
		document.body.appendChild(div);
	}

	let otherLog = (ev, status) => {
		console.log(ev, status);
			// if random is true use addObjectGenerator

		addObjectPusher(ev, status);
	}

	return {
		log: otherLog
	}
}
