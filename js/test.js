

/// THREEJS

var container;

var camera, scene, renderer;

var clock = new THREE.Clock;

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var points, uniforms;
var colors, positions, sizes, geometry1;
var plane, blimp;
//var sphereEnd = []
var biplanes = []
var texts = []
var banners = []
var lines = []

var galleryNames = [
  'another site',
  'another site',
  'another site',
  'another site',
  'black cordon vineyards',
  'grahamortho',
]

var targetList =[];
var outlineList = []
var raycaster, intersects = [];
var mouse, INTERSECTED;

var postprocessing = {};
var postprocess = false;

var galleryCount = 6; // no. of images in gallery/biplanes/banners


(function(){
  load();
  //init();
})()

function load() {

  var texLoader = new THREE.TextureLoader();
//texLoader.load('assets/images/gg_guestandguest-txt_logo.png', function(tex){
  texLoader.load('assets/images/ground1024.jpg', function(tex){
    tex.offset.x = 0
    tex.repeat.set(8,8);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    texture = tex;
    //texture.offset.x =0;
    tex.needsUpdate = true;
    texture.needsUpdate = true;
    init(tex);
  });

}

function init(tex) {



  var testPage = document.getElementById('test')
  var threeElement = document.createElement('div');
  container = testPage.appendChild( threeElement );

//----------------------------------------//
// CAMERA                                 //
//----------------------------------------//
  camera = new THREE.PerspectiveCamera( 85, window.innerWidth / window.innerHeight, 1, 5000 );
  camera.position.z = -100;
  camera.position.y = 300;
  camera.position.x = 30;
  camera.lookAt(0,0,0);

//----------------------------------------//
//  SCENE                                 //
//----------------------------------------//

  scene = new THREE.Scene();

  //scene.fog = new THREE.FogExp2( 0x48b1e7, 0.0004 );
  //scene.fog = new THREE.FogExp2( 0xdddddd, 0.0004 );

//----------------------------------------//
//  LIGHTS                                //
//----------------------------------------//
  var ambient = new THREE.AmbientLight( 0xaaaaaa );
  scene.add( ambient );

  var directionalLight = new THREE.DirectionalLight( 0xffeedd );
  directionalLight.position.set( 0, -30, 100 );
  scene.add( directionalLight );

  var light2	= new THREE.DirectionalLight( 0xFAEDFF, 1 );
  light2.shadow.camera.left = -200; // or whatever value works for the scale of your scene
  light2.shadow.camera.right = 200;
  light2.shadow.camera.top = 200;
  light2.shadow.camera.bottom = -200;
  light2.shadow.camera.near = 1;
  light2.shadow.camera.far = 1500;
  light2.shadow.camera.fov = 130;
  light2.shadow.camera.position.x = 0;
  light2.shadow.mapSize.width = 2048;
  light2.shadow.mapSize.height = 2048;
  light2.castShadow = true;
  light2.shadow.darkness = 0.5;
  light2.position.set(50,100,0);
  light2.scale.set(100,100,100);
  light2.target.position.set( 0, 0, 0 );

  //light2.shadow.camera.position.set( 0, 100, -40 );
  scene.add(light2.target);

  scene.add(light2);
  var helper = new THREE.CameraHelper( light2.shadow.camera );
  //scene.add( helper );

//----------------------------------------//
//  RENDERER                              //
//----------------------------------------//

  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setClearColor( 0xffffff, 0 );
  container.appendChild( renderer.domElement );
  renderer.shadowMap.enabled = true;

// TEMPORARY //


//----------------------------------------//
//  MATERIALS                             //
//----------------------------------------//

  var material = new THREE.MeshPhongMaterial({
    shading: THREE.FlatShading,
    shininess: 20,
    specular: new THREE.Color(0xffffff),
    color: new THREE.Color(0xffffff),
    map: new THREE.TextureLoader().load('assets/images/gg_logo_grey.png', function(text){
      text.offset.set(-0.1,-1.8);
      text.repeat.set(1.5,3.5);
      texture = tex;
    }),
    //lightMap: tex,
    lightMapIntensity: 0.9,
    //depthWrite: false,
    transparent: false,
    //anisotropy:100
  })

  var bannerMaterials = [];

  for (var i=0; i<galleryCount;i++) {
    var bannerMaterial = new THREE.MeshLambertMaterial({
      shading: THREE.FlatShading,
      color: new THREE.Color(0xffffff),
      map: new THREE.TextureLoader().load('assets/images/portfolio/thumbnail-'+ i + '.jpg', function(text){
        text.offset.set(0,0.25);
        text.repeat.set(1,0.75);
      }),
      //lightMap: tex,
      lightMapIntensity: 0.9,
      //depthWrite: false,
      transparent: false,
      //anisotropy:100
    })
    bannerMaterials.push(bannerMaterial);
  }

  var textMaterial = new THREE.MeshLambertMaterial({
    shading: THREE.FlatShading,
    color: new THREE.Color(0xffffff)
  })

  var lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 2
  });
  var lineMaterial2 = new THREE.LineBasicMaterial({
      color: 0xbbbbbb,
      linewidth: 1
  });

  var discMaterial = new THREE.MeshPhongMaterial( {
    color: 0xaaaaaa,
    shininess: 1,
    map: tex
    //emissive:  0xffffff,
  });

  var biplaneMaterial = new THREE.MeshPhongMaterial( {
    color: 0xff5555,
    shininess: 50,
    map: tex
    //emissive:  0xffffff,
  });

  var pointsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.5,
  })

//----------------------------------------//
//  GROUND                                //
//----------------------------------------//

  var planeGeometry = new THREE.PlaneBufferGeometry( 1,1, 1);
  plane = new THREE.Mesh( planeGeometry, discMaterial);
  plane.rotation.x = -Math.PI/2
  plane.position.set(0000,-490,8000);
  plane.receiveShadow = true;
  plane.scale.set(20000,20000,1);
  scene.add( plane );
//----------------------------------------//
//  TEXT                                  //
//----------------------------------------//
var font;
  var loader = new THREE.FontLoader().load( 'assets/fonts/helvetiker_bold.typeface.json', function ( response ) {
    font = response;
  })

//----------------------------------------//
//  BLIMP                                 //
//----------------------------------------//

  var scale = 0.4;
  var offsetY = -10;//-40;
  var positions, colors, sizes;

  var particlesGeo = new THREE.Geometry()

  var loader = new THREE.OBJLoader();
  loader.load( './assets/blimp.obj', function ( object ) {

    object.traverse( function ( child ) {

      if ( child instanceof THREE.Mesh ) {

        child.material = material
        child.material.side = THREE.Frontside;
        //child.material.color.setHex( 0xffffff )
        child.castShadow = true;
      }
      blimp = object;


    });

    blimp.position.y = offsetY;
    blimp.rotation.y = -Math.PI * 3/4
    blimp.scale.set(scale,scale,scale)
    blimp.castShadow = true;
    blimp.receiveShadow = true;
    scene.add( blimp );

    var loader = new THREE.OBJLoader();
    loader.load( './assets/biplane-simple.obj', function ( object ) {

      object.traverse( function ( child ) {

        if ( child instanceof THREE.Mesh ) {

          child.material = biplaneMaterial
          child.material.side = THREE.Frontside;
          //child.material.color.setHex( 0xffffff )
          child.castShadow = true;

          for ( var i = 0; i < galleryCount; i ++ ) {
            var biplane = new THREE.Mesh(child.geometry,biplaneMaterial)
            //console.log(biplane)
            biplane.position.set((i-galleryCount/5)*60, offsetY-50, 100)
            biplane.rotation.y = Math.PI * 3/4
            biplane.scale.set(10,10,10);
            biplane.castShadow = true;
            //biplane.geometry.verticesNeedUpdate = true;

            biplanes.push( biplane );
            scene.add(biplane)
            //

            //
            var bannerMesh = new THREE.BoxGeometry(50,37.5,0.01)
            var banner = new THREE.Mesh(bannerMesh, bannerMaterials[i]);
            banner.material.side = THREE.DoubleSide;
            banner.rotation.set(0,Math.PI*3/4,0);//(0,-Math.PI/4,-Math.PI/4)
            banner.position.set((i-galleryCount/5)*60-130, offsetY-50, -30);
            banner.receiveShadow = true;
            banner.castShadow = true;
            banner.name = 'banner-'+i
            banner.index = i;
            banners.push(banner)
            targetList.push(banner);
            scene.add( banner );
            //
            var outlineMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.BackSide } );
            var outlineMesh = new THREE.Mesh( bannerMesh, outlineMaterial );
            outlineMesh.position.set(banner.position.x, banner.position.y,banner.position.z);
            outlineMesh.rotation.set(banner.rotation.x, banner.rotation.y, banner.rotation.z);
	          outlineMesh.scale.set(1,1,0.5);
            outlineMesh.name = 'banner-'+i
            outlineList.push(outlineMesh);
	          scene.add( outlineMesh );
            //
            var lineGeometry = new THREE.Geometry();
            lineGeometry.vertices.push(new THREE.Vector3(biplane.position.x,biplane.position.y,biplane.position.z));
            lineGeometry.vertices.push(new THREE.Vector3(banner.position.x-10,banner.position.y,banner.position.z));
            var line = new THREE.Line(lineGeometry, lineMaterial2);
            line.geometry.verticesNeedUpdate = true;
            //line.position.set((i-galleryCount/5)*60, offsetY-45, 100)
            lines.push(line);
            scene.add(line);
            //
            var text = galleryNames[i];

              var textGeo = new THREE.TextGeometry( text, {
      					font: font,
      					size: 6,
      					height: 0.1,
      				});
              textGeo.name = text
              console.log(textGeo)
              var textMesh = new THREE.Mesh( textGeo, textMaterial );
              //console.log(textMesh)
              textMesh.position.set(banner.position.x,banner.position.y -30,banner.position.z);
              textMesh.rotation.set(banner.rotation.x, banner.rotation.y, banner.rotation.z);
              texts.push(textMesh);
              scene.add(textMesh)


          } // end for loop

        }

      })


      document.addEventListener( 'mousemove', onDocumentMouseMove, false );
      // TEMPORARY //

      window.addEventListener( 'resize', onWindowResize, false );

      // biplane.position.set(-250, offsetY,100)
      // biplane.rotation.y = Math.PI * 3/4
      // biplane.scale.set(10,10,10)
      // scene.add(plane)
      if (postprocess) {
        initPostprocessing();
      //renderer.autoClear = false;
        renderer.setClearColor(0x99ccff, 1);
      }

      raycaster = new THREE.Raycaster();
      mouse = new THREE.Vector2();



      console.log(lines[4])

      animate();

    });





    //console.log(targetList);


  });

}




//----------------------------------------//
//  EVENT LISTENERS                       //
//----------------------------------------//


function onWindowResize() {

  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentMouseMove( event ) {
  //event.preventDefault();
  mouseX = ( event.clientX - windowHalfX ) / 2;
  mouseY = ( event.clientY - windowHalfY ) / 2;
  //console.log(raycaster)

  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y =  - ( event.clientY / window.innerHeight ) * 2 + 1;

  //mouseX = mouse.x
  //mouseY = mouse.y
  //mouse.x = ( event.clientX - windowHalfX ) * 0.1;
  //mouse.y = ( event.clientY - windowHalfY ) * 0.1;

}

function onDocumentMouseDown() {
  console.log('click')
  toggleGallery(true)
  document.removeEventListener( 'mousedown', onDocumentMouseDown, false );

}

//----------------------------------------//
//  ANIMATE/RENDER                        //
//----------------------------------------//
function animate() {

  requestAnimationFrame( animate );
  render();
}

function initPostprocessing() {
	var renderPass = new THREE.RenderPass( scene, camera );
	var bokehPass = new THREE.BokehPass( scene, camera, {
		focus: 		1.0,
		aperture:	0.025,
		maxblur:	0.6,
		width: window.innerWidth,
		height: window.innerHeight
	} );
	bokehPass.renderToScreen = true;
	var composer = new THREE.EffectComposer( renderer );
	composer.addPass( renderPass );
	composer.addPass( bokehPass );
	postprocessing.composer = composer;
	postprocessing.bokeh = bokehPass;
}

function render() {
  var timer = 0.001 * Date.now();

  var elapsed = clock.getElapsedTime();
  //console.log(elapsed)
  //camera.position.x += ( mouseX - camera.position.x ) * 0.05;
  //scamera.position.y += ( - mouseY - (camera.position.y-100) )*1.8;
  //camera.position.z += ( - mouseY - camera.position.y -100) * 0.01;
  camera.position.x = - mouseX +100;
  camera.position.y = - mouseY +100;
  camera.position.z = -200;
  //camera.position.set(0,0,0);

  //console.log(mouse.x);
  //texture.needsUpdate = true;

  texture.offset.x += 0.0005;// * elapsed
  texture.offset.y -= 0.0005;
  //console.log(texture.offset.x);
  blimp.position.x -= 0.2 * Math.cos(elapsed)
  blimp.position.z -= 0.15 * Math.cos(elapsed/2)

  biplanes[4].position.x -= 0.2 * Math.cos(elapsed)
  banners[4].position.x += 0.2 * Math.cos(elapsed)

  lines[4].geometry.vertices[0].x -= 0.2 * Math.cos(elapsed)
  lines[4].geometry.vertices[1].x += 0.2 * Math.cos(elapsed)

  console.log(lines[4].geometry.vertices[0].x)
  lines[4].geometry.verticesNeedUpdate = true;


  camera.lookAt( scene.position );
  camera.updateMatrixWorld();

  raycaster.setFromCamera( mouse, camera );
  //console.log(mouse.y);

  intersects = raycaster.intersectObjects( targetList );
  //raycaster.recursive = true;
  //console.log(intersects)
  if ( intersects.length > 0 ) {
    INTERSECTED = intersects[ 0 ].object.index;
    //console.log(INTERSECTED)
    if (INTERSECTED != null| 0) {
      console.log(INTERSECTED);
      document.body.style.cursor = 'pointer'

      //intersects[ 0 ].object.scale.set(1.2,1.2,1);
      outlineList[INTERSECTED].scale.set(1.1,1.1,1)
      texts[INTERSECTED].visible = true;
      //document.addEventListener( 'mousedown', onDocumentMouseDown, false );


    }
  } else {
    document.body.style.cursor = 'default'

    outlineList.forEach(function(mesh){
      mesh.scale.set(1.025,1.025,1)
    })
    texts.forEach(function(mesh){
      mesh.visible = false
    })
    INTERSECTED = null;
  }



  //renderer.render( scene, camera );
  if (postprocess) {
    //postprocessing.composer.render( 0.1 );
  } else {
    renderer.render( scene, camera );
  }


}



//----------------------------------------//
//  UTILITY                               //
//----------------------------------------//


function randomPoint() {
  return new THREE.Vector3( THREE.Math.randFloat( - 1, 1 ), THREE.Math.randFloat( - 1, 1 ), THREE.Math.randFloat( - 1, 1 ) );
}



// debounce scroll etc
function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};
