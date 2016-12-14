//(function(){
//(function(){

  window.setTimeout(function(){
    document.body.classList.add('loaded')
  },1000);
  document.getElementById('load').addEventListener('click',function(){
  document.body.classList.toggle('loaded')
  })


var str = document.querySelector('.text').innerHTML;
 // str=str.trim().replace(/ /g, );

for (var i=0; i<str.length; i++) {

  var span = document.createElement('span')
  span.textContent = str[i];
  document.getElementById('title').appendChild(span);

  var delay = i*0.15 + 4
  span.style.transition = 'transform 0.3s ease-out '+ delay + 's';

}

var strokes = document.querySelectorAll('.page-container#homepage-0 .st0');
for (var i=0; i<strokes.length; i++) {
  var width = 1 + Math.random()
 strokes[i].style.strokeWidth = width;
 // strokes[i].setAttribute('strokeWidth',width)
}

//}())

  var wHeight = window.innerHeight|| document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight;


  var activePage = 'home';
  var menuImg = document.getElementById('menu-img');

  // menu //
  s6 = [1000, 0,    1000, 750,    0, 750,   0, 700,      0 ,510,   0, 410,   0, 0,   1000, 0]
  s5 = [1000, 0,    1000, 750,    73, 750,  92,636,      20, 452,  0, 322,   0, 0,   1000, 0]
  s4 = [1000, 0,    1000, 750,    309, 750,  233,527,    83, 265,  82, 263,  125, 0,  1000, 0]
  s3 = [1000, 0,    1000, 750,   500, 750,  354, 588,   301, 263,  281, 220,   150,0,  1000, 0]
  s2 = [1000, 52,   1000, 750,   659, 698,  500, 497,   569, 375,  635, 116,  700,50,  1000, 22]
  s1 = [1000, 52,   1000, 750,   856, 544,  692, 497,   765, 252,  796, 122,  900, 100,  1000, 52]
  s0 = [1000, 300,   1000, 480,    976, 435,  957, 375,    970, 330, 980, 320,  990, 310,  1000, 300]

  var sInit = Snap('#menu-icon');
  sInit.attr({viewBox:'0 0 70 180'});
  var menuPoly = sInit.polygon([70,0, 70,180, 26,135,  7,75, 30,30]).attr({ fill: '#333'});

  var burger1 = sInit.polyline([20, 70, 60, 70]).attr({ stroke: 'white',strokeWidth: 2})
  var burger2 = sInit.polyline([25, 90, 50, 90]).attr({ stroke: 'white',strokeWidth: 2})
  var burger3 = sInit.polyline([30, 110, 55, 110]).attr({ stroke: 'white',strokeWidth: 2})

  //var menuInit = sInit.polygon(s0);
  //<polyline points="2,2 50,50 98,2" fill="none" stroke="white" stroke-width="2"	/>
  // <circle cx="2" cy="2" r="2" fill="white"/>
  // <circle cx="50" cy="50" r="2" fill="white"/>
  // <circle cx="98" cy="2" r="2" fill="white"/>
  //menuPoly.attr({ fill: '#333'});


  var s = Snap('#menu');
  s.attr({preserveAspectRatio: 'none',viewBox:'0 0 1000 750'});


  var paper = Snap(200,200);
  //var pattern = s.image('assets/images/menu-bg2.jpg',0,0,1000,750)
  //   .pattern(0,0,1000,750);
  //var path = paper.path("M0,0h200v200h-200z").attr("fill", pattern);

  //var poly = s.polygon(s0).attr({ fill: pattern});

  var poly = s.polygon(s0).attr({ fill: '#333'});

  var type = mina.linear
  var dur = 140

  var frames = [
    { animation: { points: s0 }, dur: dur },
    { animation: { points: s1 }, dur: dur },
    { animation: { points: s2 }, dur: dur },
    { animation: { points: s3  }, dur: dur },
    { animation: { points: s4  }, dur: dur },
    { animation: { points: s5  }, dur: dur },
    { animation: { points: s6  }, dur: dur }
  ];


  function nextFrame ( el, frameArr, n ) {
     if( n >= frameArr.length ) {
       activateMenuItems();
       return;
     }

     el.animate( frameArr[n].animation, frameArr[n].dur, nextFrame.bind( null, el, frameArr, n + 1 ) );
  	 //setTimeout(menuInProgress(false),1000);

  }

  function lastFrame ( el, frameArr, n ) {
     if( n < 0 ) { return }
     el.animate( frameArr[n].animation, frameArr[n].dur, lastFrame.bind( null, el, frameArr, n - 1 ));
  }




  function menuInProgress(test) {
  	test ? document.body.classList.add('animating') : document.body.classList.remove('animating')
  }

  function activateMenuItems() {
  		document.body.classList.toggle('activated');
  }

  document.getElementById('menu-icon').addEventListener('click', function(){
  	menuInProgress(true);
    nextFrame(poly, frames, 0);
  	setTimeout(function() { menuInProgress(false)},dur*10);

  })

  document.getElementById('menu-container-close').addEventListener('click', function(){
  	 menuInProgress(true);
  	 lastFrame(poly, frames, 5);
  	 activateMenuItems();
  	 setTimeout(function() { menuInProgress(false) },dur*10);
  })

  // menu clicks //
  var menuItems = document.querySelectorAll('#menu-list li a');
  for (var i=0; i < menuItems.length; i++) {
  	menuItems[i].addEventListener('click',onMenuPress)
  }

  function onMenuPress(e) {
  	e.preventDefault();

  	e = e ? e : window.e;
    var target = 'home';
    if (e.target.hash) {
  	   target = e.target.hash.slice(1);
    } else {
      console.log(this.getAttribute('data-target') || this.getAttribute('href'))
      target = this.getAttribute('data-target') || this.getAttribute('href')
      window.open(target, '_blank');
    }

  	if (target != 'home') {
  		document.body.classList = 'loaded activated active-' +target;
  		if (target == 'portfolio') {
  			document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  			window.addEventListener( 'resize', onWindowResize, false );
  			activePage = 'portfolio';
  		} else {
        activePage = 'home';
        document.getElementById('homepage-scroller').classList = target
      }
  	} else {
  		document.body.classList = 'loaded activated';
  		activePage = 'home';
      document.getElementById('homepage-scroller').classList = 'homepage-0'
  	}
  	menuInProgress(true);
  	lastFrame(poly, frames, 5);
  	activateMenuItems();
  	setTimeout(function() { menuInProgress(false) },dur*10);
  }
  window.addEventListener('resize',function(){
     wHeight = window.innerHeight|| document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight;
  })


  var homepageScroller = document.getElementById('homepage-scroller');
  var homepage = 0;
  var homepageCount = 4;
  //document.getElementById('index-canvas')
  var homepageNext = document.getElementById('homepage-next')
  var homepagePrev = document.getElementById('homepage-prev')

  homepageNext.addEventListener('click',function(e){
    e.preventDefault();

    if (homepage == 0) {
      console.log('float')
      floatAway()
    }
    //scrollTo(wHeight,'',1000);
    if (homepage < homepageCount -1) {
      homepage ++;
      gotoHomepage(homepage)
    }
  })
  homepagePrev.addEventListener('click',function(e){
    e.preventDefault();
    if (homepage > 0) {
      homepage --;
      gotoHomepage(homepage)
    }
  })


  function gotoHomepage(n) {
      if (homepage == 3) {
        blimpContainer.classList.add('hidden');
      } else {
        blimpContainer.classList.remove('hidden');
      }
      console.log(n);
      homepageScroller.classList = 'homepage-'+n
      setHomepageControls(n)
  }

  function setHomepageControls(n) {
    console.log('n: '+n)
    if (n == 0) {
      homepagePrev.classList.add('hidden');
      homepageNext.classList.remove('hidden');
    } else if (n == homepageCount-1) {
      homepagePrev.classList.remove('hidden');
      homepageNext.classList.add('hidden');
    } else {
      homepagePrev.classList.remove('hidden')
      homepageNext.classList.remove('hidden');
    }
  }

  setHomepageControls(homepage)
