/* 
	stats visualization 
*/
// var stats = new Stats();
// stats.domElement.style.position = 'absolute';
// stats.domElement.style.top = '0px';
// stats.domElement.style.right = '0px';
// document.body.appendChild( stats.domElement );

/*
	render set up
*/
renderer.setClearColor( BACKGROUNDCOLOR );

var render = function () {
	requestAnimationFrame( render );
	gMouseCtrls.update();
	// stats.update(); 
	lights[0].position.copy(camera.position);
	renderer.render(scene, camera);
};

render();

$(document).ready(function() {
	initPanel();
});