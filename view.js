"use strict";

let view = (options) => {

	const con = console;
	const model = options.model;
	let pool = []; // pool not implemented...
	let tasks = [];

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

		// disabled dot screen shader for now
		// var effect = new THREE.ShaderPass( THREE.DotScreenShader );
		// effect.uniforms[ 'scale' ].value = 16;
		// effect.uniforms[ 'tDiffuse' ].value = 0.8;
		// composer.addPass( effect );

		this.effectRGB = new THREE.ShaderPass( THREE.RGBShiftShader );
		this.effectRGB.uniforms[ 'amount' ].value = 0.0015;
		this.effectRGB.uniforms[ 'angle' ].value = 0 ;
		this.effectRGB.renderToScreen = true;
		composer.addPass( this.effectRGB );

	}

	let reload = () => {
		load();
	}

	function createVector(x, y, z, camera, width, height) {
        var p = new THREE.Vector3(x, y, z);
        var vector = p.project(camera);
        vector.x = (vector.x + 1) / 2 * width;
        vector.y = -(vector.y - 1) / 2 * height;
        return vector;
    }


	let scaleMeshes = (time) => {
		const scaleFactor = 0.9995;
		// const scaleFactor = 0.99;
		var i, taskGroup, task, taskIndex, toRemove, scale, newScale;
		// con.log("scaleMeshes", tasks.length);
		toRemove = [];
		for (i = tasks.length - 1; i >= 0; i--) {
			tasks[i].bids.rotation.z += 0.1;
			tasks[i].comments.rotation.y -= 0.1;
			taskGroup = tasks[i].taskGroup;
			scale = taskGroup.scale.x;
			newScale = scale * scaleFactor;
			// con.log("i, newScale", i, newScale);
			if (newScale > 0.1) {
				taskGroup.scale.set(newScale, newScale, newScale);
			} else {
				// con.log("i, newScale", i, newScale);
				toRemove.push(i);
			}
		}

		toRemove.sort();
		for(i = toRemove.length - 1; i >= 0; i--) {
			taskIndex = toRemove[i];
			try {
				taskGroup = tasks[taskIndex].taskGroup;
				group.remove(taskGroup);
				task = tasks[taskIndex].task;
				model.remove(task);
				tasks.splice(taskIndex, 1);
				con.log("toRemove success", tasks);
			} catch(err) {
				con.log("toRemove fail", err, toRemove, taskIndex, tasks);
			}
		}
	}

	var currentTime = 0;
	const frameRate = 1000 / 12;
	let animate = (time) => {
		// requestAnimationFrame( animate );

		// con.log(tasks.length);

		scaleMeshes(time);

		group.rotation.x += 0.005;
		group.rotation.y += 0.04;

		composer.render();
		controls.update();
		setTimeout(function() {
			currentTime += 0.1;
			animate(currentTime);
		}, frameRate);
	}

	let makeTextSprite = (message) => {

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

	let addSphere = function(size, colour) {
		// var geometry = new THREE.SphereGeometry(Math.random() + 0.9, Math.random() + 6, Math.random()  );
		var geometry = new THREE.SphereGeometry(size, 6, 6);
		var material = new THREE.MeshPhongMaterial( { color: colour, shading: THREE.FlatShading } );
		var mesh = new THREE.Mesh( geometry, material );
		var sphereRotationX = Math.random() * 3;
		var sphereRotationY = Math.random() * 3;
		var sphereRotationZ = Math.random() * 3;
		mesh.rotation.set(sphereRotationX, sphereRotationY, sphereRotationZ);
		return mesh;
	}

	let makeObject = (task) => {

		var position = { x: Math.random() - 0.5, y: Math.random() - 0.5, z: Math.random() - 0.5 };
		// var position = { x: Math.random() - 0.8, y: Math.random() - 0.3, z: Math.random() - 0.3 };
		var scale = 0.02 * task.price;
		con.log(scale);

		var taskGroup = new THREE.Object3D();
		group.add( taskGroup );
		taskGroup.position.set( position.x, position.y, position.z ).normalize();
		taskGroup.position.multiplyScalar(100);
		taskGroup.scale.set(scale, scale, scale);

		// multiplier can be either amount or price or in the future a more complex algorithm in relation to: 
		// price, comments, bids
		// this used to be multiplier, now passing in scale
		var sphere = addSphere(4, task.colour);
		var spriteText = task.name + ": $" + task.price;
		var spritey = makeTextSprite(spriteText);

		var angle, radius, x, y, z, bidSphere, commentSphere;
		var bidRadius = 15 * scale;
		var commentRadius = 13 * scale;
		var bids = new THREE.Object3D();
		for (var i = 0; i < task.bids_count; i++) {
			// con.log('bids', task.id, i);
			bidSphere = addSphere(3, task.colour);//, 0xff0000);
			bids.add(bidSphere);
			angle = i / task.bids_count * Math.PI * 2;
			x = Math.sin(angle) * bidRadius;
			y = Math.cos(angle) * bidRadius;
			z = 0;
			bidSphere.position.set(x, y, z);
		}
		var comments = new THREE.Object3D();
		for (var j = 0; j < task.comments_count; j++) {
			// con.log('comments', task.id, j);
			commentSphere = addSphere(3, task.colour);//, 0x00ff00);
			comments.add(commentSphere);
			angle = j / task.comments_count * Math.PI * 2;
			x = Math.sin(angle) * commentRadius;
			y = 0;
			z = Math.cos(angle) * commentRadius;
			commentSphere.position.set(x, y, z);
		}

		taskGroup.add(bids);
		taskGroup.add(comments);
		taskGroup.add(sphere);
		taskGroup.add(spritey);

		tasks.push({
			task: task,
			taskGroup: taskGroup,
			sphere: sphere,
			spritey: spritey,
			bids: bids,
			comments: comments
		});

	}

	let gotTask = (task) =>{
		// console.log("view gotTask task", task);
		console.log("gotTask task", task.name, task.price, task.bids_count, task.comments_count);

		makeObject(task);

		taskCount++;
		valueCount += task.price;

		document.getElementById("task-counter").innerHTML = taskCount;
		document.getElementById("value-counter").innerHTML = "$"+valueCount;
	}

	let handleChangeTask = (task) => {
		con.log("view. handleChangeTask", task);
	}

	model.on("newtask", gotTask);
	model.on("changetask", handleChangeTask);
	init();
	animate(0);

	return {
		gotTask: gotTask
	}
}
