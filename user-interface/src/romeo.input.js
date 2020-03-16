
/**
 * mouse event handlers for the operation in the various steps
 *
 * @author Xiang 'Anthony' Chen http://xiangchen.me
 */

// mouse controls
gMouseCtrls.rotateSpeed = 5.0;
gMouseCtrls.zoomSpeed = 0.5;
gMouseCtrls.panSpeed = 2;

gMouseCtrls.noZoom = false;
// gMouseCtrls.noPan = true;

gMouseCtrls.staticMoving = true;
gMouseCtrls.dynamicDampingFactor = 0.3;

// TODO: make them jquery fashion
document.addEventListener('mousedown', onMouseDownStep, false);
document.addEventListener('mousemove', onMouseMoveStep, false);
document.addEventListener('mouseup', onMouseUpStep, false);
document.addEventListener('keydown', onKeyDownStep, false);
// document.addEventListener('mousemove', onMouseDownStep, false);
// document.addEventListener('mouseover', onMouseOverStep, false);

// global variable of mouse down coordinates
var ptDown = [];

// whether should respond to mouse move in a sticky fashion (rather than requiring dragging)
var gSticky = false;


function onMouseDownStep(e) {
	if (e.which != LEFTMOUSE) {
		return;
	}

	switch (gStep) {
		case 1:
			axisBboxUI.mousedown(e);
			break;
		case 2:
			tarPoints.mousedown(e);
			break;

	}
}

function onMouseMoveStep(e) {
	if (e.which != LEFTMOUSE) {
		switch (gStep) {
			case 1:
				axisBboxUI.mousehover(e);
				break;
			case 2:
				tarPoints.mousemove(e);
				break;
		}
		return;
	}

	switch (gStep) {
		case 1:
			axisBboxUI.mousemove(e);
			break;
		case 2:
			break;
	}
}

function onMouseUpStep(e) {
	if (e.which != LEFTMOUSE) {
		return;
	}

	switch (gStep) {
		case 1:
			axisBboxUI.mouseup(e);
			break;
		case 2:
			tarPoints.mouseup(e);
			break;
	}
}

function onKeyDownStep(e) {
	switch (gStep) {
		case 1:
			axisBboxUI.keydown(e);
			break;
		case 2:
			tarPoints.keydown(e);
			break;
	}
}	
