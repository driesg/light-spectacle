"use strict";

let view = ()=> {

	var con = console;

	let pool = []; // pool not implemented... 
	let meshes = [];

	var camera, scene, renderer, composer, controls;
	var group, light, light2, ambientLight;

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
		load();

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

		camera.position.z = 300;

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

	let scaleMeshes = (time) => {
		const scaleFactor = 0.9995;
		var i, mesh, meshIndex, toRemove = [], scale, newScale, meshIndex;
		// con.log("scaleMeshes", meshes.length);
		toRemove = [];
		for (i = meshes.length - 1; i >= 0; i--) {
			mesh = meshes[i].taskObject;
			scale = mesh.scale.x;
			newScale = scale * scaleFactor;
			if (newScale > 0.2) {
				mesh.scale.set(newScale, newScale, newScale);	
			} else {
				toRemove.push(i);
			}
		}

		for(i = toRemove.length - 1; i >= 0; i--) {
			meshIndex = toRemove[i];
			try {
				mesh = meshes[meshIndex].taskObject;
				group.remove(mesh);
				meshes.splice(i, 1);
			} catch(err) { // i assume the array has to be sorted descending first... 
				con.log("toRemove", err, toRemove);
			}
		}
	}

	let animate = (time) => {
		requestAnimationFrame( animate );

		scaleMeshes(time);

		group.rotation.x += 0.001;
		group.rotation.y += 0.004;

		composer.render();
		controls.update();

	}

	let  makeTextSprite = (message) => {

		var fontsize = 32;
		var fontface = "Georgia";
		var borderThickness = 4;
		// var spriteAlignment = THREE.SpriteAlignment.topLeft;

		var canvas = document.createElement('canvas');
		canvas.width = 1024;
		canvas.height = 512;
		var context = canvas.getContext('2d');
		context.font = "Bold " + fontsize + "px " + fontface;

		// get size data (height depends only on font size)
		var metrics = context.measureText( message );
		var textWidth = metrics.width;
		// console.log("text width:", textWidth);

		context.fillStyle = "#000";
		context.strokeStyle = "#00f";
		context.lineWidth = borderThickness;
		roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
		// 1.4 is extra height factor for text below baseline: g,j,p,q.

		// text color
		context.fillStyle = "#fff";
		context.fillText( message, borderThickness, fontsize + borderThickness);

		// canvas contents will be used for a texture
		var texture = new THREE.Texture(canvas)
		texture.needsUpdate = true;

		var spriteMaterial = new THREE.SpriteMaterial( { map: texture, color:  0xffffff });
		var sprite = new THREE.Sprite( spriteMaterial );

		var baseScale = 2;
		sprite.scale.set(100 * baseScale, 50 * baseScale, 1 * baseScale);

		// sprite.position.x = textWidth * 0.3;

		// con.log(sprite.position);

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

	let addSphere = function(multipliers) {
		var geometry = new THREE.SphereGeometry( Math.random() + 0.9, Math.random() + 6, Math.random()  );
		var material = new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading } );
		var mesh = new THREE.Mesh( geometry, material );
		var scale = 0.02 * multipliers.price;
		var sphereRotationX = Math.random() * 3;
		var sphereRotationY = Math.random() * 3;
		var sphereRotationZ = Math.random() * 3;
		mesh.rotation.set( sphereRotationX, sphereRotationY, sphereRotationZ);
		mesh.scale.set(scale, scale, scale);
		return mesh;
	}

	let bananas = (ev, obj) => {
		if (obj) {
			if (obj.message && obj.message.task_id) {
				loadTask(obj.message.task_id);
			} else if (obj.name) {
				gotTask({
					task: {
						name: obj.name,
						price: obj.price
					}
				});
			}
		} else {
			con.log("progress", ev, obj);
		}
	}

	let loadTask = (id) => {
		var taskURL = config.serviceURL +  "/tasks/" + id;

		var xmlhttp = new XMLHttpRequest();

		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
				var response = JSON.parse(xmlhttp.responseText);
				gotTask(response);
			}
		};

		xmlhttp.open("GET", taskURL, true);
		xmlhttp.send();
	}

	let gotTask = (response) =>{
		var task = response.task;
		// console.log("gotTask task", task.name. task.price);

		makeObject(task);

		taskCount++;
		valueCount += task.price;

		document.getElementById("task-counter").innerHTML = taskCount;
		document.getElementById("value-counter").innerHTML = "$"+valueCount;
	}

	let makeObject = (task) => {

		var position = { x: Math.random() - 0.5, y: Math.random() - 0.5, z: Math.random() - 0.5 };
		// var position = { x: Math.random() - 0.8, y: Math.random() - 0.3, z: Math.random() - 0.3 };

		var taskObject = new THREE.Object3D();
		group.add( taskObject );
		taskObject.position.set( position.x, position.y, position.z ).normalize();
		taskObject.position.multiplyScalar(100);

		// multiplier can be either amount or price or in the future a more complex algorithm in relation to: price, comments, bids
		var multipliers = {price: task.price };
		var sphere = addSphere(multipliers);
		var spriteText = task.name + ": $" + task.price;
		var spritey = makeTextSprite(spriteText);
		
		taskObject.add(sphere);
		taskObject.add(spritey);

		meshes.push({
			taskObject: taskObject,
			sphere: sphere,
			spritey: spritey
		});

	}


	init();
	animate(0);

	return {
		log: bananas
	}
}
