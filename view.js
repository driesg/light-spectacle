"use strict";


let view = ()=> {
	let init = () => {

		// renderer = new THREE.WebGLRenderer();
		renderer = new THREE.WebGLRenderer( { antialias:true, alpha: true } );
		// renderer.setClearColor( 0x000000, 1);
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( renderer.domElement );

		camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
		// camera.position.z = 400;
		scene = new THREE.Scene();

		light = new THREE.DirectionalLight( 0xffffff );
		light.position.set( 1, 1, 1 );

		light2 = new THREE.DirectionalLight( 0xffffff );
		light2.position.set( 5, 2,2 );
		light2.intensity = 1;

		scene.add( light );
		scene.add( light2 );

		// scene.add( new THREE.AmbientLight( 0x888888 ) );
		// ambientLight =  new THREE.AmbientLight( 0x3f3f3f );
		// ambientLight.intensity = 10;
		// scene.add(ambientLight);
		load()

		window.addEventListener( 'resize', onWindowResize, false );
		renderer.domElement.addEventListener('click', reload, false);
	}

	let onWindowResize = () => {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );

	}

  let load = () => {
		scene.remove(object);

		light.intensity = 0.3;
		object = new THREE.Object3D();
		scene.add( object );

		// for ( var i = 0; i < 10; i ++ ) {
    //
		// 	var geometry = new THREE.SphereGeometry( Math.random() + 0.9, Math.random() + 6, Math.random()  );
		// 	var material = new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading } );
		// 	var mesh = new THREE.Mesh( geometry, material );
		// 	mesh.position.set( Math.random() - 0.5, Math.random() - 0.6, Math.random() - 0.5 ).normalize();
		// 	mesh.position.multiplyScalar( Math.random() * 300 );
		// 	mesh.rotation.set( Math.random() * 3, Math.random() * 3, Math.random() * 3 );
		// 	mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 46;
		// 	object.add( mesh );
    //
		// }

		camera.position.z = 400;

		composer = new THREE.EffectComposer( renderer );
		composer.addPass( new THREE.RenderPass( scene, camera ) );

		var effect = new THREE.ShaderPass( THREE.DotScreenShader );

		effect.uniforms[ 'scale' ].value = 13;
		effect.uniforms[ 'tDiffuse' ].value = 0.8;
		composer.addPass( effect );

		this.effectRGB = new THREE.ShaderPass( THREE.RGBShiftShader );
		this.effectRGB.uniforms[ 'amount' ].value = 0.0015;
		this.effectRGB.uniforms[ 'angle' ].value = 0 ;
		this.effectRGB.renderToScreen = true;
		composer.addPass( this.effectRGB );

		console.log("rgb effect uniforms value", this.effectRGB.uniforms[ 'amount' ].value );
	}

  let reload = () => {
		load();
	}

	let animate = () => {
		// console.log("ANIMATE rgb effect value", this.effectRGB.uniforms[ 'amount' ].value );

		requestAnimationFrame( animate );
		object.rotation.x += 0.001;
		object.rotation.y += 0.001;

		composer.render();

	}

  let addObject = (ev, obj) => {
		var geometry = new THREE.SphereGeometry( Math.random() + 0.9, Math.random() + 6, Math.random()  );
		var material = new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading } );
		var mesh = new THREE.Mesh( geometry, material );
		mesh.position.set( Math.random() - 0.5, Math.random() - 0.6, Math.random() - 0.5 ).normalize();
		mesh.position.multiplyScalar( Math.random() * 300 );
		mesh.rotation.set( Math.random() * 3, Math.random() * 3, Math.random() * 3 );
		mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 46;
		object.add( mesh );
  }

	var camera, scene, renderer, composer;
	var object, light, light2, ambientLight;

	init();
	animate();

  let customLog = (ev, status) => {
    var div = document.createElement("div");
    div.innerHTML = "### " + ev + " " + status;
    document.body.appendChild(div);
  }

  let otherLog = (ev, status) => {
    console.log(ev, status);
    addObject(ev, status);
  }

  return {
    log: otherLog
  }
}
