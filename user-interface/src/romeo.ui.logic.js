/*
	ui logic
	@author Jiahao Li http://ljhnick.github.io
*/


$(document.body).append(container);
// $(document.body).append(optionMenu);


// specify bounding box ui
var axisBboxUI = [];

// create points
var tarPoints = [];
var OBJECTTYPE;

// generate workspace
var genWorkspace;

// animate global value
var animateArm;

var initPanel = function() {

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	//	Step 1 - import model
	//
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	$(document).on('dragover', function(e) {
		e.stopPropagation();
		e.preventDefault();
		e.dataTransfer = e.originalEvent.dataTransfer;
		e.dataTransfer.dropEffect = 'copy';
	});

	$(document).on('drop', function(e) {
		e.stopPropagation();
		e.preventDefault();
		e.dataTransfer = e.originalEvent.dataTransfer;
		var files = e.dataTransfer.files;

		for (var i = files.length - 1; i >= 0; i--) {
			var reader = new FileReader();
			reader.onload = (function(e) {
				loadStl(e.target.result);
			});
			reader.readAsBinaryString(files[i]);
		}
	});	

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	//	Step 2 - select transformable part
	//
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	selTransPtBtn.on('click', function(event) {
		event.preventDefault();
		/* Act on the event */
		gStep = 1;
		var object = objects[0];
		var dims = getBoundingBoxDimensions(object);

		var axisHelp = addAxisHelper(object, dims[0]);
		// specifying accessible area
		axisBboxUI = new AxisBboxUI(object, axisHelp);
	});

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	//	Step 3 - specifying target points for robotic tasks
	//
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	specPtBtn.on('click', function(event) {
		event.preventDefault();
		/* Act on the event */
		// console.log(event.which);
		OBJECTTYPE = OBJFIX;
		gStep = 2;
		axisBboxUI.endStep();

		tarPoints = new AddPoints(transPtParams[0], transPlNormal);
	});

	specPtBtn1.on('click', function(event) {
		event.preventDefault();
		/* Act on the event */
		// console.log(event.which);
		OBJECTTYPE = OBJMOV;
		gStep = 2;
		axisBboxUI.endStep();

		tarPoints = new AddPoints(transPtParams[0], transPlNormal);
	});

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	//	Step 4 - generate and visualize workspace
	//
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	genArmBtn.on('click', function(event) {
		event.preventDefault();
		/* Act on the event */
		gStep = 3;
		tarPoints.endStep();

		genWorkspace = new Workspace(tarPoints);

	});


	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	//	Step 5 - ANIMATION
	//
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////


	animateBtn.on('click', function(event) {
		event.preventDefault();
		/* Act on the event */
		gStep = 4;
		genWorkspace.clear();

		switch (genWorkspace._IFSTRIP) {
			case 1:
				animateArm = new ObjStripCAD(axisBboxUI, genWorkspace);
				animateArm._updateScene();
				break;
			case 0:
				switch(OBJECTTYPE) {
					case OBJFIX:
						animateArm = new ObjFixedCAD(axisBboxUI, genWorkspace);
						break;
					case OBJMOV:
						animateArm = new ObjMovingCAD(axisBboxUI, genWorkspace);
						break;
				}
				animateArm._updateScene();
				break;
		}
		// animateArm = new ObjFixedCAD(axisBboxUI._transPt, genWorkspace._basePos, genWorkspace._jointType, 0, TRAJFOLLOW, genWorkspace._unfoldPl);
		// animateArm._animate(genWorkspace._tarQ[0], genWorkspace._q0);

	});

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	//	Step 6 - SAVE STL
	//
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////


	exportBtn.on('click', function(event) {
		event.preventDefault();
		/* Act on the event */

		exporter = new THREE.STLExporter();
		animateArm._generateParts();
		var link1stl = exporter.parse(animateArm._link1STL, { binary: true });
		var link2stl = exporter.parse(animateArm._link2STL, { binary: true });
		var link3stl = exporter.parse(animateArm._link3STL, { binary: true });
		var link4stl = exporter.parse(animateArm._link4STL, { binary: true });
		var staticstl = exporter.parse(animateArm._staticPt, { binary: true });

		save( new Blob( [ link1stl ], { type: 'application/octet-stream' } ), 'link1.stl' );
		save( new Blob( [ link2stl ], { type: 'application/octet-stream' } ), 'link2.stl' );
		save( new Blob( [ link3stl ], { type: 'application/octet-stream' } ), 'link3.stl' );
		save( new Blob( [ link4stl ], { type: 'application/octet-stream' } ), 'link4.stl' );
		save( new Blob( [ staticstl ], { type: 'application/octet-stream' } ), 'static.stl' );

		gStep = 5;
	});



} 


