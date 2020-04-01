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

// global value for animation
var animateFlag = 0;

var render = function () {
	requestAnimationFrame( render );
	gMouseCtrls.update();
	// stats.update(); 
	if (animateFlag == 1) {
		animateArm._animate(genWorkspace._tarQ[0], genWorkspace._q0);
	}

	lights[0].position.copy(camera.position);
	renderer.render(scene, camera);
};

render();

$(document).ready(function() {
	initPanel();
});