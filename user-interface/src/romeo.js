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
var animateIndex = 0;
var waitIndex = 0;
var waitSec = 2;

var render = function () {
	requestAnimationFrame( render );
	gMouseCtrls.update();
	// stats.update(); 

	renderScene();

	// lights[0].position.copy(camera.position);
	// renderer.render(scene, camera);
};

function interpQ(q1, q0, inv) {
	var q = [];
	for (var i = 0; i < inv; i++) {
		var q_temp = [];
		for (var j = 0; j < q1.length; j++) {
			q_temp.push(q0[j]+(q1[j]-q0[j])/inv*i);
		}
		q.push(q_temp);
	}
	return q;
}

render();

$(document).ready(function() {
	initPanel();
});