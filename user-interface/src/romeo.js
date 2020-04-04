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

var render = function () {
	requestAnimationFrame( render );
	gMouseCtrls.update();
	// stats.update(); 

	// below is for the tranformation animation
	if (animateFlag == 1) {
		var qLength = animateArm._animation(animateIndex);
		if (animateIndex == qLength-1) {
			animateIndex = 0;
		} else {
			animateIndex ++;
		}
	}

	lights[0].position.copy(camera.position);
	renderer.render(scene, camera);
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