// set up canvas bg //
geoJelly('rgba(255,255,255,0.5)', 'rgba(255,255,255,0.5)', '#gallery-canvas');

// navigation //

var slider = document.getElementById('slider');
var slides = document.querySelectorAll('.slide');
var currentSlide = 0;
var selectedSlide = 0;
var slideCount = slides.length;
console.log('slideCount: '+slideCount)

var nav = document.querySelectorAll('.nav')
for (var i=0; i <nav.length; i++) {
  nav[i].addEventListener('click',onNavPress)
}
window.addEventListener( 'mousewheel', function(e){
  onMouseWheel(e)
});
window.addEventListener( 'DOMMouseScroll', function(e) {
  onMouseWheel(e)
});

// set nav arrows
function setNavControls(n) {
  console.log('n: '+n)
  if (n == 0) {
    nav[0].classList = 'nav hidden';
    nav[1].classList = 'nav';
  } else if (n == slideCount-1) {
    nav[0].classList = 'nav';
    nav[1].classList = 'nav hidden';
  } else {
    nav[0].classList = nav[1].classList = 'nav';
  }
}

// scroll handler
var onMouseWheel = debounce(function(e) {
  e = e ? e : window.e;
    //console.log('delta: ' + e.wheelDelta);
    var scroll = ( e.detail ? e.detail : e.wheelDelta );
    if (scroll > 50  & currentSlide > 1) {
      prevSlide();
    } else if (scroll < -50 & currentSlide < slideCount) {
      nextSlide();
    }
}, 20);

// nav button press handler
function onNavPress(e) {
  e = e ? e : window.e;
  console.log('press');

  var dir = e.target.id;// | e.target.parentElement.id;
  dir = (!dir) ? e.target.parentElement.id : '';

  if (dir == 'nav-prev' & currentSlide > 0) {
    prevSlide()
  } else if (dir == 'nav-next' & currentSlide < slideCount-1) {
    nextSlide()
  }
}

function gotoSlide(n) {
  currentSlide = n;
  slider.classList = 'slide-' + currentSlide
  setNavControls(currentSlide);
  for (var i=0; i < slides.length; i++) {
    slides[i].classList = 'slide';
  }
  document.getElementById('slide-'+currentSlide).classList.add('active-slide')
}

// goto to previous
function prevSlide() {
  currentSlide--
  gotoSlide(currentSlide)
}

// goto to next
function nextSlide() {
  currentSlide++
  gotoSlide(currentSlide)
}


function toggleGallery(test, selectedSlide) {
  console.log('toggle '+test);
  if (test == true) {
    document.body.classList.add('gallery-active');
    console.log('selectedSlide: '+selectedSlide)
    gotoSlide(selectedSlide)


  } else if (test == false){
    for (var i=0; i < slides.length; i++) {
      slides[i].classList = 'slide';
    }
    document.body.classList.remove('gallery-active');
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    slider.classList = 'slide-0';

  }
}


setNavControls(currentSlide || selectedSlide)



document.querySelector('.gallery-container-toggle').addEventListener('click',function(e){
  toggleGallery(false);
})





/// THREEJS

var container;

var camera, scene, renderer;

var clock = new THREE.Clock;

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var points, uniforms;
var colors, positions, sizes, geometry1;
var cloudTexture, logoTexture, landAlpha, waterNormals;
var biplaneObj, blimp, ship, rocks;
//var sphereEnd = []
var biplanes = []
var texts = []
var banners = []
var lines = []
var ships = []

var galleryNames = [
  'Grahamortho',
  'Black Cordon Vineyards',
  'another site',
  'another site',
  'another site',
  'another site',
]

var targetList =[];
var outlineList = []
var raycaster, intersects = [];
var mouse, INTERSECTED;

var postprocessing = {};
var postprocess = false;

var galleryCount = 6; // no. of images in gallery/biplanes/banners

var font;

var loadedItems = 0;

(function(){

  load();
  //init();
})()

function load() {

  var texLoader = new THREE.TextureLoader();
//texLoader.load('assets/images/gg_guestandguest-txt_logo.png', function(tex){
  //texLoader.load('assets/images/ground1024.jpg', function(tex){
  texLoader.load('assets/images/clouds.png', function(tex){
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.offset.set(0.25,0.25);
    tex.repeat.set(4,4);
    tex.needsUpdate = true;
    cloudTexture = tex;
    checkLoading()
  })
  texLoader.load('assets/images/gg_logo_grey.png', function(tex){
    tex.offset.set(-0.1,-1.8);
    tex.repeat.set(1.5,3.5);
    logoTexture = tex;
    checkLoading()
  })
  texLoader.load('assets/images/land-alpha.png'),function(tex){
    tex.repeat.set(5,1)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    landAlpha = tex;
    checkLoading()
  }
  texLoader.load('assets/images/waternormals.jpg', function(tex){;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    waterNormals = tex;
    checkLoading()
  })

  var OBJLoader = new THREE.OBJLoader();
  OBJLoader.load( 'assets/biplane-simple.obj', function ( object ) {
    biplaneObj = object;
    checkLoading()
  });
  OBJLoader.load( './assets/blimp.obj', function ( object ) {
    blimp = object;
    checkLoading()
  })
  OBJLoader.load( './assets/ship/cargo-ship.obj', function ( object ) {
    ship = object;
    checkLoading()
  })


  var fontLoader = new THREE.FontLoader().load( 'assets/fonts/EB_Garamond_Regular-full.json', function ( response ) {


    console.log(response)

    font = response;
    checkLoading()
  })
}

function checkLoading() {
  console.log(loadedItems)
  loadedItems ++;
  if (loadedItems > 6) {
    init();
  } else {
    return;
  }
}

function init() {

  var testPage = document.getElementById('portfolio')
  var threeElement = document.createElement('div');
  container = testPage.appendChild( threeElement );

//----------------------------------------//
// CAMERA                                 //
//----------------------------------------//
  camera = new THREE.PerspectiveCamera( 85, window.innerWidth / window.innerHeight, 1, 12000 );
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
  //scene.fog = new THREE.Fog( 0x88bffe, 1000, 10000 );


//----------------------------------------//
//  LIGHTS                                //
//----------------------------------------//
  var ambient = new THREE.AmbientLight( 0xcccccc );
  scene.add( ambient );

  var directionalLight = new THREE.DirectionalLight( 0xdececf );
  directionalLight.position.set( 0, -30, 100 );
  scene.add( directionalLight );

  var light2	= new THREE.DirectionalLight( 0xdececf, 1 );
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
  //renderer.setFaceCulling('back','cw')
  container.appendChild( renderer.domElement );

  renderer.shadowMap.enabled = true;

// TEMPORARY //


//----------------------------------------//
//  MATERIALS                             //
//----------------------------------------//

  var material = new THREE.MeshPhongMaterial({
    //shading: THREE.FlatShading,
    shininess: 20,
    specular: new THREE.Color(0xdececf),
    color: new THREE.Color(0xdececf),
    map: logoTexture,
    //lightMap: tex,
    lightMapIntensity: 0.9,
    //depthWrite: false,
    transparent: false,
    //anisotropy:100
  })

  var bannerMaterials = [];

  for (var i=0; i<galleryCount; i++) {
    var bannerMaterial = new THREE.MeshLambertMaterial({
      shading: THREE.FlatShading,
      color: new THREE.Color(0xffffff),
      map: new THREE.TextureLoader().load('assets/images/portfolio/thumbnail-'+ i + '.jpg', function(text){
        text.offset.set(0,0.25);
        text.repeat.set(1,0.75);
      }),
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
  var testMaterial =new THREE.MeshPhongMaterial({
    //shading: THREE.FlatShading,
    color: new THREE.Color(0x88bffe)
  })
  var lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 2
  });
  var lineMaterial2 = new THREE.LineBasicMaterial({
      color: 0xbbbbbb,
      linewidth: 1
  });



  var landMaterial = new THREE.MeshLambertMaterial( {
    color: 0xaaaaaa,
    transparent: true,
    alphaMap: landAlpha,
    refractionRatio: 0,
    reflectivity: 0,
  });

  var biplaneMaterial = new THREE.MeshPhongMaterial( {
    color: 0xff5555,
    shininess: 50,
    //map: tex
    //emissive:  0xffffff,
  });

  var pointsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.5,
  })


  var groundMaterial = new THREE.MeshPhongMaterial( {
    color: 0x333333,
    shading: THREE.FlatShading,
    //wireframe: true,
    shininess: 0,
    //map: tex
    //emissive:  0xffffff,
  });

  var cloudMaterial = new THREE.MeshPhongMaterial( {
    shading: THREE.FlatShading,
    //wireframe: true,
    shininess: 0,
    map: cloudTexture,
    transparent: true,
    //emissive:  0xffffff,
  });
//----------------------------------------//
//  GROUND                                //
//----------------------------------------//

//   var maxAnisotropy = renderer.getMaxAnisotropy();
//
  var planeGeometry = new THREE.PlaneBufferGeometry( 5000,500, 1,1);
  plane = new THREE.Mesh( planeGeometry, landMaterial);
  //plane.rotation.x = -Math.PI/2
  plane.material.side= THREE.DoubleSide
  plane.position.set(-2000,-190,2000);
  plane.rotation.set(0,-Math.PI/4,0)
//  plane.receiveShadow = true;
  //plane.scale.set(5000,5000,1);
  //scene.add( plane );



  function getTerrainPixelData(){
    var img = document.getElementById('heightmap');
    var canvas = document.createElement('canvas');
    canvas.id = 'heightmapCanvas';
    document.body.appendChild(canvas);

    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);

    var data = canvas.getContext('2d').getImageData(0,0, img.width,img.height).data;
    var normPixels = []
    //data.unshift(0);
    var dataArr = new Array(data)
    for (var i = 0, n = data.length; i < n; i += 4) {
   // get the average value of R, G and B.

      normPixels.push((data[i] + data[i+1] + data[i+2])/3);
    }

    return normPixels;
  }

  function addGround() {
    var numSegments = 63;

    var geometry = new THREE.PlaneGeometry(500, 500, numSegments, numSegments+1);
    var terrain = getTerrainPixelData();

   // if you have 100 segments, the image must have 101 pixels.
    for (var i = 0, l = geometry.vertices.length; i < l; i++) {
      var terrainValue = terrain[i] / 255;
      geometry.vertices[i].z = geometry.vertices[i].z + terrainValue * 	100 ;
    }


    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    rocks = new THREE.Object3D;

    for (var i=0; i<10; i++) {

      var rock = new THREE.Mesh(geometry.clone(), groundMaterial);
      var random1 = (Math.random()-0.5)*4000 + 0;
      var random2= (Math.random()-0.5)*4000 + 4000;

      rock.position.set(random1,-220,random2);
      rock.rotation.set(-Math.PI/2,0,Math.random()*Math.PI)
      rock.scale.set(Math.random()*3,Math.random()*3,1)

      // rocks.castShadow = true;
      // rocks.receiveShadow = true;
      //scene.add(rock)
      rocks.add(rock)

    }
    scene.add(rocks)


  }

  addGround();


  //----------------------------------------//
  //  clouds                                //
  //----------------------------------------//

  //   var maxAnisotropy = renderer.getMaxAnisotropy();
  //
    var planeGeometry = new THREE.PlaneBufferGeometry( 7000,7000, 1,1);
    clouds = new THREE.Mesh( planeGeometry, cloudMaterial);
    //plane.rotation.x = -Math.PI/2
    clouds.material.side= THREE.DoubleSide
    clouds.position.set(0,500,0);
    clouds.rotation.set(-Math.PI/2,0,0);
    scene.add(clouds)

//----------------------------------------//
//  SKYBOX                                //
//----------------------------------------//
  function loadSkyBox() {
    var path = 'assets/images/skybox/';
    var cubeMap = new THREE.CubeTextureLoader().load([
      path + '3.jpg',
      path + '1.jpg',
      path + 'roof.jpg',
      path + 'roof.jpg',
      path + '2.jpg',
      path + '4.jpg'
    ]);
    cubeMap.format = THREE.RGBFormat;

    var skyShader = THREE.ShaderLib['cube'];
    skyShader.uniforms['tCube'].value = cubeMap;

    var skyBoxMaterial = new THREE.ShaderMaterial({
      fragmentShader: skyShader.fragmentShader,
      vertexShader: skyShader.vertexShader,
      uniforms: skyShader.uniforms,
      depthWrite: false,
      side: THREE.BackSide
    });

    var skybox = new THREE.Mesh(
      new THREE.BoxGeometry(10000, 10000, 10000),
      skyBoxMaterial
    );
    skybox.rotation.set(0, Math.PI/2,0);

    skybox.position.set(0,1400,0)

    scene.add(skybox);

    // skybox roof


    var planeGeo = new THREE.PlaneBufferGeometry( 10000, 10000, 1, 1 );

    var plane = new THREE.Mesh(planeGeo, new THREE.MeshBasicMaterial({color: 0x888888}));
    plane.material.side = THREE.DoubleSide;
    plane.rotation.set( -Math.PI/2, 0, 0 );
    plane.position.set( 0, 200, 0 );
    plane.receiveShadow = true;
    //scene.add( plane );

  }

  loadSkyBox()



  /////////////// WATER



	// Create the water effect
	water = new THREE.Water(renderer, camera, scene, {
		textureWidth: 256,
		textureHeight: 256,
		waterNormals: waterNormals,
		alpha: 	1.0,
		sunDirection: light2.position.normalize(),
		sunColor: 0xffffee,
		waterColor: 0x001e0f,
		waterColor: 0x00265f,
		betaVersion: 0,
		side: THREE.DoubleSide
	});
	var meshMirror = new THREE.Mesh(
    //   new THREE.CircleBufferGeometry( 10000, 32 ),
		new THREE.PlaneBufferGeometry(9000,9000,1,1),
		water.material
	);
	meshMirror.add(water);
	meshMirror.rotation.x = - Math.PI * 0.5;
  meshMirror.rotation.y = Math.PI;

	meshMirror.position.y = -200;
	scene.add(meshMirror);

//----------------------------------------//
//  TEXT                                  //
//----------------------------------------//


//----------------------------------------//
//  BLIMP                                 //
//----------------------------------------//

  var scale = 0.4;
  var offsetY = 10;//-40;
  var positions, colors, sizes;

  blimp.traverse( function ( child ) {

    if ( child instanceof THREE.Mesh ) {

      child.material = material
      child.material.side = THREE.Frontside;
      child.castShadow = true;
    }

  });

  blimp.position.y = offsetY;
  blimp.rotation.y = -Math.PI * 3/4
  blimp.scale.set(scale,scale,scale)
  blimp.castShadow = true;
  blimp.receiveShadow = true;
  scene.add( blimp );

  //----------------------------------------//
  //  BIPLANES  / BANNERS / TEXT            //
  //----------------------------------------//


  var biplaneGeo  = biplaneObj.children[0].geometry;

    for ( var i = 0; i < galleryCount; i ++ ) {
      var biplane = new THREE.Mesh(biplaneGeo, biplaneMaterial)

      biplane.position.set(-i*50+230, offsetY-50, 100)
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
      banner.position.set(-i*50+100, offsetY-50, -30);
      //banner.position.set(-i*50+0, offsetY-50, -0);
      banner.rotation.set(0,Math.PI*3/4,0);


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
      lineGeometry.vertices.push(new THREE.Vector3(biplane.position.x,biplane.position.y+6,biplane.position.z));
      lineGeometry.vertices.push(new THREE.Vector3(banner.position.x-1,banner.position.y,banner.position.z));
      var line = new THREE.Line(lineGeometry, lineMaterial2);
      line.geometry.verticesNeedUpdate = true;
      lines.push(line);
      scene.add(line);
      //
      var text = galleryNames[i];
      var textGeo = new THREE.TextGeometry( text, {
				font: font,
        weight: 'normal',
				size: 6,
				height: 0.1,
			});
      textGeo.name = text
      var textMesh = new THREE.Mesh( textGeo, textMaterial );
      textMesh.position.set(banner.position.x,banner.position.y -30,banner.position.z);
      textMesh.rotation.set(banner.rotation.x, banner.rotation.y, banner.rotation.z);
      texts.push(textMesh);
      scene.add(textMesh)


    } // end for loop

    //----------------------------------------//
    //  SHIP                                 //
    //----------------------------------------//

    ship.traverse( function ( child ) {

      if ( child instanceof THREE.Mesh ) {

        child.material = biplaneMaterial
        child.material.side = THREE.Frontside;

      }
    })
    scene.add(ship)
    ship.position.set(0,-185,0)
    ship.rotation.set(0,5*Math.PI/4,0)
    ships.push(ship);


    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    // TEMPORARY //

    window.addEventListener( 'resize', onWindowResize, false );

    if (postprocess) {
      initPostprocessing();
      renderer.autoClear = false;
      renderer.setClearColor(0x99ccff, 1);
    }

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();




    animate();

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

// function onPortfolioMouseDown() {
//   console.log('INTERSECTED0: '+INTERSECTED)
//
//   //var handler = function() {
//       console.log('INTERSECTED: '+INTERSECTED)
//       toggleGallery(true, INTERSECTED)
//       container.removeEventListener( 'click', onPortfolioMouseDown, false );
//   //}
//   //return handler;
//
// }

//----------------------------------------//
//  ANIMATE/RENDER                        //
//----------------------------------------//
function animate() {
  //if (activePage == 'portfolio') {
    requestAnimationFrame( animate );
    water.render();
    render();
  //}

}



function render() {

  var timer = 0.001 * Date.now();

  var elapsed = clock.getElapsedTime();
  //console.log(elapsed)
  //camera.position.x += ( mouseX - camera.position.x ) * 0.05;
  //scamera.position.y += ( - mouseY - (camera.position.y-100) )*1.8;
  //camera.position.z += ( - mouseY - camera.position.y -100) * 0.01;
  camera.position.x = - mouseX +100;
  camera.position.y = - mouseY +200;
  camera.position.z = -200;
  //camera.position.set(0,0,0);

  //console.log(mouse.x);
  //texture.needsUpdate = true;

  rocks.position.x -= elapsed * 0.1;
  rocks.position.z -= elapsed * 0.1

  cloudTexture.offset.x += 0.0005;// * elapsed
  cloudTexture.offset.y -= 0.0005;
//  texture.offset.x += 0.001;// * elapsed
//  texture.offset.y -= 0.0005;
  //console.log(texture.offset.x);
  blimp.position.x -= 0.2 * Math.cos(elapsed)
  blimp.position.z -= 0.15 * Math.cos(elapsed/2)

  //biplanes[4].position.x -= 0.1 * Math.cos(elapsed)
  // banners[4].position.x -= 0.1 * Math.cos(elapsed)


  lines[4].geometry.vertices[0].x -= 0.2 * Math.cos(elapsed)
  lines[4].geometry.vertices[1].x += 0.2 * Math.cos(elapsed)
  lines[4].geometry.verticesNeedUpdate = true;
  ships[0].position.x = ships[0].position.z = 1000 - 50*elapsed;

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
    if (INTERSECTED != null || INTERSECTED !=0) {
      console.log(INTERSECTED);
      document.body.style.cursor = 'pointer'

      //intersects[ 0 ].object.scale.set(1.2,1.2,1);
      outlineList[INTERSECTED].scale.set(1.1,1.1,1)
      texts[INTERSECTED].visible = true;
      //container.addEventListener( 'click', onPortfolioMouseDown, false );
      container.addEventListener('click', function onPortfolioMouseDown() {
          console.log('INTERSECTED: '+INTERSECTED)
          if (INTERSECTED != null) {
            container.removeEventListener('click',onPortfolioMouseDown)
            toggleGallery(true, INTERSECTED)
          }
      });

    }
  } else {
    document.body.style.cursor = 'all-scroll'

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
    postprocessing.composer.render( 0.1 );
  } else {
    renderer.render( scene, camera );
  }
  // water
  //var timer = Date.now() * 0.0005;
  water.material.uniforms.time.value += 1.0 / 60.0;


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
