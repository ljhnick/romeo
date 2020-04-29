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


// generate workspace
var genWorkspace;
var genWorkspaceDisabled = false;

// animate global value
var animateArm;

var initPanel = function () {
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //
  //	Step 1 - import model
  //
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  $(document).on("dragover", function (e) {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer = e.originalEvent.dataTransfer;
    e.dataTransfer.dropEffect = "copy";
  });

  $(document).on("drop", function (e) {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer = e.originalEvent.dataTransfer;
    var files = e.dataTransfer.files;

    for (var i = files.length - 1; i >= 0; i--) {
      var reader = new FileReader();
      reader.onload = function (e) {
        loadStl(e.target.result);
      };
      reader.readAsBinaryString(files[i]);
    }
  });

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //
  //	Step 2 - select transformable part
  //
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  selTransPtBtn.on("click", function (event) {
    event.preventDefault();
    /* Act on the event */
    gStep = 1;
    var object = objects[0];
    var dims = getBoundingBoxDimensions(object);

    var axisHelp = addAxisHelper(object, dims);
    // specifying accessible area
    axisBboxUI = new AxisBboxUI(object, axisHelp);
  });

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //
  //	Step 3 - specifying target points for robotic tasks
  //
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  specPtBtn.on("click", function (event) {
  	gStep = 2;
    axisBboxUI.endStep();

    tarPoints = new AddPoints(transPtParams[0], transPlNormal);
    event.preventDefault();
  });

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //
  //	Step 4 - generate workspace (and arm)
  //
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  objFixBtn.on("click", function (event) {
    event.preventDefault();
    /* Act on the event */
    OBJECTTYPE = OBJFIX;

    if (gStep == 4) {
      scene.remove(animateArm._base);
      animateFlag = 0;
    }

    gStep = 3;
    tarPoints.endStep();

    if (genWorkspace != undefined) {
    	genWorkspace.clear();
    }
    if (!genWorkspaceDisabled) {
      genWorkspace = new Workspace(tarPoints);  
      objFixBtn.hide();
      objMoveBtn.show();
      genWorkspaceDisabled = true;
    }
    

    

  });

  objFixBtn.on("mousedown", function (event) {
    event.preventDefault();
    /* Act on the event */
    if (event.which == RIGHTMOUSE) {
	    objFixBtn.hide();
	    objMoveBtn.show();
    }

  });

  objMoveBtn.on("click", function (event) {
    event.preventDefault();
    /* Act on the event */
    OBJECTTYPE = OBJMOV;

    if (gStep == 4) {
      scene.remove(animateArm._base);
      animateFlag = 0;
    }

    gStep = 3;
    tarPoints.endStep();


    if (genWorkspace != undefined) {
    	genWorkspace.clear();
    }

    if (!genWorkspaceDisabled) {
      genWorkspace = new Workspace(tarPoints);  
      objFixBtn.show();
      objMoveBtn.hide();
      genWorkspaceDisabled = true;
    }

  });

  objMoveBtn.on("mousedown", function (event) {
    event.preventDefault();
    /* Act on the event */
    if (event.which == RIGHTMOUSE) {
	    objFixBtn.show();
	    objMoveBtn.hide();
    }

  });

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //
  //	Step 4 - generate and visualize workspace
  //
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // genSpaceBtn.on("click", function (event) {
  //   event.preventDefault();
  //   /* Act on the event */
  //   gStep = 3;
  //   tarPoints.endStep();

  //   genWorkspace = new Workspace(tarPoints);
  //   // if all the points are inside the workspace
  //   // skip showing the workspace
  // });

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //
  //	Step 5 - ANIMATION
  //
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// genArmBtn.on("click", function (event) {
//     event.preventDefault();
//     /* Act on the event */
//     if (gStep != 4) {
//     	gStep = 4;
// 	    genWorkspace.clear();

// 	    switch (genWorkspace._IFSTRIP) {
// 	      case 1:
// 	        animateArm = new ObjStripCAD(axisBboxUI, genWorkspace);
// 	        animateArm._updateScene();
// 	        break;
// 	      case 0:
// 	        switch (OBJECTTYPE) {
// 	          case OBJFIX:
// 	            animateArm = new ObjFixedCAD(axisBboxUI, genWorkspace);
// 	            break;
// 	          case OBJMOV:
// 	            animateArm = new ObjMovingCAD(axisBboxUI, genWorkspace);
// 	            break;
// 	        }
// 	        animateArm._updateScene();
// 	        break;
// 	    }
//     }
    
//     // animateArm = new ObjFixedCAD(axisBboxUI._transPt, genWorkspace._basePos, genWorkspace._jointType, 0, TRAJFOLLOW, genWorkspace._unfoldPl);
//     // animateArm._animate(genWorkspace._tarQ[0], genWorkspace._q0);
//   });


  animateBtn.on("click", function (event) {
    event.preventDefault();
    /* Act on the event */
    if (gStep != 4) {
    	gStep = 4;
	    genWorkspace.clear();

	    switch (genWorkspace._IFSTRIP) {
	      case 1:
	        animateArm = new ObjStripCAD(axisBboxUI, genWorkspace);
	        animateArm._updateScene();
	        break;
	      case 0:
	        switch (OBJECTTYPE) {
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
    }

    animateFlag = 1;
  });

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //
  //	Step 6 - SAVE STL
  //
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  exportBtn.on("click", function (event) {
    event.preventDefault();
    /* Act on the event */

    exporter = new THREE.STLExporter();
    animateArm._generateParts();
    var link1stl = exporter.parse(animateArm._link1STL, { binary: true });
    var link2stl = exporter.parse(animateArm._link2STL, { binary: true });
    var link3stl = exporter.parse(animateArm._link3STL, { binary: true });
    var link4stl = exporter.parse(animateArm._link4STL, { binary: true });
    var staticstl = exporter.parse(animateArm._staticPt, { binary: true });

    var dataForDeploy = {q0: genWorkspace._q0, tarQ: genWorkspace._tarQ, transPt: tarPoints._bboxParams, tarPoints: tarPoints._points};

    save(
      new Blob([link1stl], { type: "application/octet-stream" }),
      "link1.stl"
    );
    save(
      new Blob([link2stl], { type: "application/octet-stream" }),
      "link2.stl"
    );
    save(
      new Blob([link3stl], { type: "application/octet-stream" }),
      "link3.stl"
    );
    save(
      new Blob([link4stl], { type: "application/octet-stream" }),
      "link4.stl"
    );
    save(
      new Blob([staticstl], { type: "application/octet-stream" }),
      "static.stl"
    );

    save(
      new Blob([JSON.stringify(dataForDeploy)], { type: "text/plain" }),
      "data.txt"
    );

    gStep = 5;
  });


 /////////////////////////////////
 ///// restart
 /////////////////////////////////
  restartBtn.on("click", function (event) {
    event.preventDefault();
    /* Act on the event */
    switch (gStep) {
    	case 1:
    		axisBboxUI.endStep();
    		break;
    	case 2:
    		tarPoints.restart();
    		tarPoints = new AddPoints(transPtParams[0], transPlNormal);
    		break;
    }
  });
};

