var camera, scene, renderer;
var uniforms;
var previousTime;

/*************/
var getScrollbarWidth = function() {
    var outer = document.createElement("div");
    outer.style.visibility = "hidden";
    outer.style.width = "100px";
    document.body.appendChild(outer);
    
    var widthNoScroll = outer.offsetWidth;
    // force scrollbars
    outer.style.overflow = "scroll";
    
    // add innerdiv
    var inner = document.createElement("div");
    inner.style.width = "100%";
    outer.appendChild(inner);        
    
    var widthWithScroll = inner.offsetWidth;
    
    // remove divs
    outer.parentNode.removeChild(outer);
    
    return widthNoScroll - widthWithScroll;
}

/*************/
var getRenderSize = function() {
  return [window.innerWidth - getScrollbarWidth(), (window.innerWidth - getScrollbarWidth()) / 4];
}

/*************/
var init = function() {
  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-4, 4, 1, -1, 1, 1000);
  camera.position.set(0, 0, 10);
  camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));
  scene.add(camera);

  var geom = new THREE.PlaneGeometry(8, 2);
  //var mat = new THREE.MeshLambertMaterial({color: 0xFFFFFF});

  uniforms = {
    time: {type: "f", value: 1.0},
    resolution: {type: "v2", value: new THREE.Vector2()}
  };
  var mat = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: shadersHolder.vertex,
    fragmentShader: shadersHolder.fragment
  });
  var mesh = new THREE.Mesh(geom, mat);
  scene.add(mesh);

  var ambientLight = new THREE.AmbientLight(0xAAAAAA);
  scene.add(ambientLight);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(getRenderSize()[0], getRenderSize()[1]);
  document.getElementById("webgl").appendChild(renderer.domElement);

  uniforms.resolution.value.x = getRenderSize()[0];
  uniforms.resolution.value.y = getRenderSize()[1];
}

/*************/
window.onresize = function() {
  renderer.setSize(getRenderSize()[0], getRenderSize()[1]);
  uniforms.resolution.value.x = getRenderSize()[0];
  uniforms.resolution.value.y = getRenderSize()[1];
}

/*************/
var animate = function(timestamp) {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
  uniforms.time.value = timestamp / 1000.0;
}

/*************/
// Shader loading stuff
// (from http://lab.aerotwist.com/webgl/easing/js/ShaderLoader.js)
var vertexShaders       = $('script[type="x-shader/x-vertex"]');
var fragmentShaders     = $('script[type="x-shader/x-fragment"]');
var shadersLoaderCount  = Math.min(vertexShaders.length, 1) + Math.min(fragmentShaders.length, 1);

var shadersHolder = { vertex: '', fragment: '' };

function loadShader(shader, type) {
    var $shader = $(shader);
    if ($shader[0] === undefined)
      return;

    $.ajax({
        url: $shader[0].src,
        dataType: 'text',
        context: {
            name: $shader.data('name'),
            type: type
        },
        complete: processShader
    });
}

function processShader( jqXHR, textStatus ) {
    shadersLoaderCount--;
    shadersHolder[this.type] = jqXHR.responseText;

    if ( !shadersLoaderCount ) {
        shadersLoadComplete();
    }
}

function shadersLoadComplete() {
  init();
  animate();
}

// WebGL detector
var supportsWebGL = ( function () {
  try { 
    return !! window.WebGLRenderingContext && !! document.createElement( 'canvas' ).getContext( 'experimental-webgl' );
  }
  catch( e ) {
    return false;
  } 
} )();

if (supportsWebGL) {
  loadShader(vertexShaders[0], 'vertex');
  loadShader(fragmentShaders[0], 'fragment');
}
