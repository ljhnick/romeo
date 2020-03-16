/*
	the forth step: generate stl file for each link and joint
	@author Jiahao Li http://ljhnick.github.io
*/

var MOTOR;


class CAD {
	constructor (transPt, workspace) {
		this._obj = transPt._transPt; // transformable part mesh
		this._basePos = workspace._basePos;
		this._jtType = workspace._jointType;
		this._taskType = TASKTYPE;
		this._unfoldPl = workspace._unfoldPl;
		this._bboxCenter = getBoundingBoxCenter(this._obj);
		this._init();
		this._bboxPointArrayNew();
		this._loadMotorSTL();
	}

	_init() {
		// clone the geometry
		var geoTrans = this._obj.geometry.clone();
		geoTrans.center(); // center the geometry
		switch(this._unfoldPl) {
			case 1:
				geoTrans.rotateY(Math.PI/2);
				this._initialR = ['y', Math.PI/2];
				break;
			case 2:
				geoTrans.rotateX(Math.PI/2);
				this._initialR = ['x', Math.PI/2];
				break;
			case 3:
				break;
		}
		var meshTrans = new THREE.Mesh(geoTrans);
		meshTrans.material.side = THREE.DoubleSide;
		this._meshTransNew = meshTrans;
		this._bboxParamsNew = getBoundingBoxEverything(this._meshTransNew);
	}

	_loadMotorSTL() {
        this._motor = MOTOR;
	}

	_bboxPointArrayNew() {
		var bboxPointArrayNew = [];
		var xmin = this._bboxParamsNew.cmin.x;
		var xmax = this._bboxParamsNew.cmax.x;
		var ymin = this._bboxParamsNew.cmin.y;
		var ymax = this._bboxParamsNew.cmax.y;
		bboxPointArrayNew.push([xmin, ymax]);
		bboxPointArrayNew.push([xmin, 0]);
		bboxPointArrayNew.push([xmin, ymin]);
		bboxPointArrayNew.push([0, ymin]);
		bboxPointArrayNew.push([xmax, ymin]);
		bboxPointArrayNew.push([xmax, 0]);
		bboxPointArrayNew.push([xmax, ymax]);
		bboxPointArrayNew.push([0, ymax]);
		this._bboxPointArray = bboxPointArrayNew;

	}

	rotateR(link, R){
		if (R[0] == 'z') {
			return;
		}
		if (R[0] == 'y') {
			link.rotation.y = -R[1];
			return;
		}
		if (R[0] == 'x') {
			link.rotation.x = -R[1];
		}
	}

}

class ObjFixedCAD extends CAD {
	constructor(transPt, workspace) {
		super(transPt, workspace);
		this._staticPt = transPt._staticPt;
		this._generate();
	}

	_generate() {
		this.segmentLinks();
		this.setPivot();
	}

	segmentLinks() {
		var xmin = this._bboxParamsNew.cmin.x;
		var xmax = this._bboxParamsNew.cmax.x;
		var ymin = this._bboxParamsNew.cmin.y;
		var ymax = this._bboxParamsNew.cmax.y;
		var zmin = this._bboxParamsNew.cmin.z;
		var zmax = this._bboxParamsNew.cmax.z;

		var link1Points = [[0, 0], [0, ymax], [xmin, ymax], [xmin, 0]];
		var link2Points = [[0, 0], [0, ymin], [xmin, ymin], [xmin, 0]];
		var link3Points = [[0, 0], [0, ymin], [xmax, ymin], [xmax, 0]];
		var link4Points = [[0, 0], [0, ymax], [xmax, ymax], [xmax, 0]];

		var link1Cut = polygonExtrudePoints(link1Points, zmax-zmin);
		var link2Cut = polygonExtrudePoints(link2Points, zmax-zmin);
		var link3Cut = polygonExtrudePoints(link3Points, zmax-zmin);
		var link4Cut = polygonExtrudePoints(link4Points, zmax-zmin);

		var link1 = booleanGeo(this._meshTransNew, link1Cut, INTERSECT);
		var link2 = booleanGeo(this._meshTransNew, link2Cut, INTERSECT);
		var link3 = booleanGeo(this._meshTransNew, link3Cut, INTERSECT);
		var link4 = booleanGeo(this._meshTransNew, link4Cut, INTERSECT);

		this._link1 = new THREE.Mesh(link1);
		this._link2 = new THREE.Mesh(link2);
		this._link3 = new THREE.Mesh(link3);
		this._link4 = new THREE.Mesh(link4);

	}

	setPivot() {

		var raycaster = new THREE.Raycaster();
		raycaster.set(new THREE.Vector3(0,this._bboxParamsNew.leny/2+1,0), new THREE.Vector3(0,-1,0));
		var intersects = raycaster.intersectObjects([this._meshTransNew]);
		if (intersects.length > 2) {
			var holeSizeY = intersects[1].distance - intersects[intersects.length-2].distance;
		} else {
			var holeSizeY = 0;
		}

		holeSizeY = Math.abs(holeSizeY);

		var raycaster = new THREE.Raycaster();
		raycaster.set(new THREE.Vector3(this._bboxParamsNew.lenx/2+1, 0, 0), new THREE.Vector3(-1, 0, 0));
		var intersects = raycaster.intersectObjects([this._meshTransNew]);
		if (intersects.length > 2) {
			var holeSizeX = intersects[1].distance - intersects[intersects.length-2].distance;
		} else {
			var holeSizeX = 0;
		}

		holeSizeX = Math.abs(holeSizeX);


		var xmin = this._bboxParamsNew.cmin.x;
		var xmax = this._bboxParamsNew.cmax.x;
		var ymin = this._bboxParamsNew.cmin.y;
		var ymax = this._bboxParamsNew.cmax.y;
		var zmin = this._bboxParamsNew.cmin.z;
		var zmax = this._bboxParamsNew.cmax.z;

		var pivot1 = new THREE.Group();
		var pivot2 = new THREE.Group();
		var pivot3 = new THREE.Group();
		var pivot4 = new THREE.Group();
		var pivot5 = new THREE.Group();
		var base = new THREE.Group();

		if ((xmax-holeSizeX/2) < 30 || (ymax-holeSizeY/2) < 30) {
			pivot1.position.set(0-16, (ymax+holeSizeY/2)/2, 0);
			pivot2.position.set((xmin-holeSizeX/2)/2, 0+16, 0);
			pivot3.position.set(0-16, (ymin-holeSizeY/2)/2, 0);
			pivot4.position.set((xmax+holeSizeX/2)/2, 0-16, 0);
			pivot5.position.set(0+16, (ymax+holeSizeY/2)/2, 0);
			base.position.set(0, 0, 0);
		} else {
			pivot1.position.set(0-16, ymax-14, 0);
			pivot2.position.set(xmin+14, 0+16, 0);
			pivot3.position.set(0-16, ymin+14, 0);
			pivot4.position.set(xmax-14, 0-16, 0);
			pivot5.position.set(0+16, ymax-20, 0);
			base.position.set(0, 0, 0);
		}


		this._pivot1 = pivot1;
		this._pivot2 = pivot2;
		this._pivot3 = pivot3;
		this._pivot4 = pivot4;
		this._pivot5 = pivot5;
		this._base = base;
	}

	_updateScene() {
		scene.remove(this._obj);
		// scene.remove(this._staticPt);

		// need to first center the geometry
		this.addMotor();
		this.translateGeometryStrip();
		this._link4Scene.add(this._joint5);
		this._joint4.add(this._link4Scene);
		this._link3Scene.add(this._joint4);
		this._link3Scene.add(this._motor4);
		this._joint3.add(this._link3Scene);
		this._link2Scene.add(this._joint3);
		this._link2Scene.add(this._motor3);
		this._joint2.add(this._link2Scene);
		this._link1Scene.add(this._joint2);
		this._link1Scene.add(this._motor2);
		this._joint1.add(this._link1Scene);
		this._base.add(this._joint1);
		this._base.add(this._motor1);


		this.rotateR(this._base, this._initialR);
		this._base.position.copy(this._bboxCenter);

		scene.add(this._base);
	}

	translateGeometryStrip() {
		var pivot1 = this._pivot1;
		var pivot2 = this._pivot2;
		var pivot3 = this._pivot3;
		var pivot4 = this._pivot4;
		var pivot5 = this._pivot5;

		var link1Scene = new THREE.Mesh(this._link1.geometry.clone(), MATERIALNORMAL);
		var link2Scene = new THREE.Mesh(this._link2.geometry.clone(), MATERIALGREEN);
		var link3Scene = new THREE.Mesh(this._link3.geometry.clone(), MATERIALNORMAL);
		var link4Scene = new THREE.Mesh(this._link4.geometry.clone(), MATERIALGREEN);

		var staticScene = new THREE.Mesh(this._staticPt.geometry.clone(), MATERIALOBSTACLE);
		this._staticPt.geometry.computeBoundingBox();

		link1Scene.geometry.translate(-pivot1.position.x, -pivot1.position.y, -pivot1.position.z);
		link2Scene.geometry.translate(-pivot2.position.x, -pivot2.position.y, -pivot2.position.z);
		link3Scene.geometry.translate(-pivot3.position.x, -pivot3.position.y, -pivot3.position.z);
		link4Scene.geometry.translate(-pivot4.position.x, -pivot4.position.y, -pivot4.position.z);

		// var bboxParams = getBoundingBoxEverything(link4Scene);
		staticScene.geometry.translate(-pivot5.position.x, -pivot5.position.y-this._bboxCenter.y, -pivot5.position.z);

		this._link1Scene = link1Scene;
		this._link2Scene = link2Scene;
		this._link3Scene = link3Scene;
		this._link4Scene = link4Scene;
		this._staticScene = staticScene;

		var joint1 = new THREE.Group();
		var joint2 = new THREE.Group();
		var joint3 = new THREE.Group();
		var joint4 = new THREE.Group();
		var joint5 = new THREE.Group();

		joint1.position.copy(pivot1.position.clone());
		joint2.position.copy(pivot2.position.clone().sub(pivot1.position));
		joint3.position.copy(pivot3.position.clone().sub(pivot2.position));
		joint4.position.copy(pivot4.position.clone().sub(pivot3.position));
		joint5.position.copy(pivot5.position.clone().sub(pivot4.position));

		this._joint1 = joint1;
		this._joint2 = joint2;
		this._joint3 = joint3;
		this._joint4 = joint4;
		this._joint5 = joint5;

		// translate motors
		this._motor1.geometry.translate(joint1.position.x, joint1.position.y, joint1.position.z);
		this._motor2.geometry.translate(joint2.position.x, joint2.position.y, joint2.position.z);
		this._motor3.geometry.translate(joint3.position.x, joint3.position.y, joint3.position.z);
		this._motor4.geometry.translate(joint4.position.x, joint4.position.y, joint4.position.z);

	}

	addMotor() {
		var motor1 = new THREE.Mesh(this._motor.geometry.clone(), MATERIALOBSTACLE);
		var motor2 = new THREE.Mesh(this._motor.geometry.clone(), MATERIALOBSTACLE);
		var motor3 = new THREE.Mesh(this._motor.geometry.clone(), MATERIALOBSTACLE);
		var motor4 = new THREE.Mesh(this._motor.geometry.clone(), MATERIALOBSTACLE);

		motor1.geometry.rotateZ(-Math.PI/2);
		motor1.geometry.translate(-9, 0, -12);
		switch (this._jtType) {
			case 1:
				motor2.geometry.rotateY(Math.PI/2);
				motor2.geometry.rotateX(Math.PI);
				motor2.geometry.translate(0, 9, 0);
				break;
			case 2:
				motor2.geometry.rotateZ(Math.PI/2);
				motor2.geometry.rotateX(Math.PI/2);
				motor2.geometry.translate(9, 0, 0);
				break;
			case 3:
				// motor1.geometry.rotateZ(Math.PI/2);
				motor2.geometry.rotateZ(Math.PI/2);
				motor2.geometry.translate(9, 0, 0);
				break;
		}

		motor3.geometry.rotateZ(-Math.PI/2);
		motor3.geometry.translate(-9, 0, 0);
		motor4.geometry.translate(0, -9, 0);
		// motor1.position.copy(this._joint1.position);
		// motor2.position.copy(this._joint2.position);
		// motor3.position.copy(this._joint3.position);
		// motor4.position.copy(this._joint4.position);


		this._motor1 = motor1;
		this._motor2 = motor2;
		this._motor3 = motor3;
		this._motor4 = motor4;

	}

	_animate(target_q, q0) {
		var secondIndex;
		var joint1ang = target_q[0] - q0[0];
		var joint3ang = target_q[4] - q0[4];
		var joint4ang = target_q[5] - q0[5];
		switch (this._jtType){
			case 1:
				secondIndex = 2;
				var joint2ang = target_q[secondIndex] - q0[secondIndex];
				this._joint2.rotation.x += joint2ang;
				break;
			case 2:
				secondIndex = 3;
				var joint2ang = target_q[secondIndex] - q0[secondIndex];
				this._joint2.rotation.y += joint2ang;
				break;
			case 3:
				secondIndex = 1;
				var joint2ang = target_q[secondIndex] - q0[secondIndex];
				this._joint2.rotation.z += joint2ang;
				break;
		}
		
		this._joint1.rotation.z += joint1ang;
		this._joint3.rotation.z += joint3ang;
		this._joint4.rotation.z += joint4ang;
	}

	_generateParts() {
		this._link1STL = this._linkJoint1(this._link1, this._pivot2, this._pivot1, this._jtType);
		this._link2STL = this._linkJoint2(this._link2, this._pivot3, this._pivot2, this._jtType);
		this._link3STL = this._linkJoint3(this._link3, this._pivot4, this._pivot3);
		this._link4STL = this._linkJoint4(this._link4, this._pivot5, this._pivot4, this._taskType);

		scene.add(this._link1STL);
		scene.add(this._link2STL);
		scene.add(this._link3STL);
		scene.add(this._link4STL);
	}

	_linkJoint1(link, pivot, pivot_prev, jtType) {
		// first Step: add motor shell
		var LINK = link;
		var bboxParams = getBoundingBoxEverything(link);
		var xmin = bboxParams.cmin.x;
		var xmax = bboxParams.cmax.x;
		var ymin = bboxParams.cmin.y;
		var ymax = bboxParams.cmax.y;
		var zmin = bboxParams.cmin.z;
		var zmax = bboxParams.cmax.z;

		var pvtX = pivot.position.x;
		var pvtY = pivot.position.y;
		var pvtZ = pivot.position.z;

		switch(jtType) {
			case 1:
				var motorShell = ljhBoxMeshFromPoints(pvtX-12, pvtX+12, pvtY-9, pvtY+29, pvtZ-14, pvtZ+14);
				LINK = booleanGeo(LINK, motorShell, UNION);

				var motor = ljhBoxMeshFromPoints(pvtX-12-5, pvtX+15+5, Math.min(pvtY-9, ymin), pvtY+27, pvtZ-12, pvtZ+12);
				LINK = booleanGeo(LINK, motor, SUBTRACT);

				// third step: round corner
				var prismLarge = ljhBoxMeshFromPoints(Math.min(xmin, pvtX-12-5), Math.max(xmax, pvtX+15+5), Math.min(ymin, pvtY-15), pvtY, Math.min(zmin, pvtZ-14), Math.max(zmax, pvtZ+14));
				var cylinder = ljhCylinderMeshX(pvtY, pvtZ, Math.min(xmin, pvtX-12), Math.max(xmax, pvtX+12), pvtY-ymin);
				var cutShape = booleanGeo(prismLarge, cylinder, SUBTRACT);
				LINK = booleanGeo(LINK, cutShape, SUBTRACT);

				// forth step: add space for joint to move
				var prismActive = ljhBoxMeshFromPoints(pvtX+15, pvtX+15+5, Math.min(ymin, pvtY-14), pvtY*2-ymin, Math.min(zmin, pvtZ-14), Math.max(zmax, pvtZ+14));
				var prismPassive = ljhBoxMeshFromPoints(pvtX-12-5, pvtX-12, Math.min(ymin, pvtY-14), pvtY*2-ymin, Math.min(zmin, pvtZ-14), Math.max(zmax, pvtZ+14));
				LINK = booleanGeo(LINK, prismActive, SUBTRACT);
				LINK = booleanGeo(LINK, prismPassive, SUBTRACT);

				// screw hole
				var cylinderHoleScrew = ljhCylinderMeshX(pvtY, pvtZ, Math.min(xmin, pvtX-12-5), Math.max(xmax, pvtX+15+5), 6);
				LINK = booleanGeo(LINK, cylinderHoleScrew, SUBTRACT);

				// add holes for motor rivets
				var hole1 = ljhCylinderMeshFromPoint(pvtX+9, pvtY, pvtZ+12, zmax > (pvtZ+14) ? zmax : (pvtZ+14), 2.2);
				var hole2 = ljhCylinderMeshFromPoint(pvtX-9, pvtY, pvtZ+12, zmax > (pvtZ+14) ? zmax : (pvtZ+14), 2.2);
				var hole3 = ljhCylinderMeshFromPoint(pvtX+9, pvtY+18, pvtZ+12, zmax > (pvtZ+14) ? zmax : (pvtZ+14), 2.2);
				var hole4 = ljhCylinderMeshFromPoint(pvtX-9, pvtY+18, pvtZ+12, zmax > (pvtZ+14) ? zmax : (pvtZ+14), 2.2);
				var hole5 = ljhCylinderMeshFromPoint(pvtX+9, pvtY, pvtZ+12, zmin > (pvtZ-14) ? zmin : (pvtZ-14), 2.2);
				var hole6 = ljhCylinderMeshFromPoint(pvtX-9, pvtY, pvtZ+12, zmin > (pvtZ-14) ? zmin : (pvtZ-14), 2.2);
				var hole7 = ljhCylinderMeshFromPoint(pvtX+9, pvtY+18, pvtZ+12, zmin > (pvtZ-14) ? zmin : (pvtZ-14), 2.2);
				var hole8 = ljhCylinderMeshFromPoint(pvtX-9, pvtY+18, pvtZ+12, zmin > (pvtZ-14) ? zmin : (pvtZ-14), 2.2);

				var stair1 = ljhCylinderMeshFromPoint(pvtX+9, pvtY, pvtZ+14, zmax > (pvtZ+14) ? zmax : (pvtZ+14), 3);
				var stair2 = ljhCylinderMeshFromPoint(pvtX-9, pvtY, pvtZ+14, zmax > (pvtZ+14) ? zmax : (pvtZ+14), 3);
				var stair3 = ljhCylinderMeshFromPoint(pvtX+9, pvtY+18, pvtZ+14, zmax > (pvtZ+14) ? zmax : (pvtZ+14), 3);
				var stair4 = ljhCylinderMeshFromPoint(pvtX-9, pvtY+18, pvtZ+14, zmax > (pvtZ+14) ? zmax : (pvtZ+14), 3);
				var stair5 = ljhCylinderMeshFromPoint(pvtX+9, pvtY, pvtZ-14, zmin > (pvtZ-14) ? zmin : (pvtZ-14), 3);
				var stair6 = ljhCylinderMeshFromPoint(pvtX-9, pvtY, pvtZ-14, zmin > (pvtZ-14) ? zmin : (pvtZ-14), 3);
				var stair7 = ljhCylinderMeshFromPoint(pvtX+9, pvtY+18, pvtZ-14, zmin > (pvtZ-14) ? zmin : (pvtZ-14), 3);
				var stair8 = ljhCylinderMeshFromPoint(pvtX-9, pvtY+18, pvtZ-14, zmin > (pvtZ-14) ? zmin : (pvtZ-14), 3);

				var hole = booleanGeo(hole1, hole2, UNION);
				hole = booleanGeo(hole, hole3, UNION);
				hole = booleanGeo(hole, hole4, UNION);
				hole = booleanGeo(hole, hole5, UNION);
				hole = booleanGeo(hole, hole6, UNION);
				hole = booleanGeo(hole, hole7, UNION);
				hole = booleanGeo(hole, hole8, UNION);
				hole = booleanGeo(hole, stair1, UNION);
				hole = booleanGeo(hole, stair2, UNION);
				hole = booleanGeo(hole, stair3, UNION);
				hole = booleanGeo(hole, stair4, UNION);
				hole = booleanGeo(hole, stair5, UNION);
				hole = booleanGeo(hole, stair6, UNION);
				hole = booleanGeo(hole, stair7, UNION);
				hole = booleanGeo(hole, stair8, UNION);

				LINK = booleanGeo(LINK, hole, SUBTRACT);
				break;
			case 2:
				// pvtY += 12;
				var motorShell = ljhBoxMeshFromPoints(pvtX-11, pvtX+29, pvtY-12, pvtY+14, pvtZ-14, pvtZ+14);
				LINK = booleanGeo(LINK, motorShell, UNION);

				// sceond step: subtract motor
				var motor = ljhBoxMeshFromPoints(pvtX-9, pvtX+27, Math.min(pvtY-12, ymin), pvtY+12, pvtZ-12, pvtZ+12);
				LINK = booleanGeo(LINK, motor, SUBTRACT);

				// add holes for motor rivets
				var hole1 = ljhCylinderMeshFromPoint(pvtX, pvtY+6, pvtZ+12, zmax > (pvtZ+14) ? zmax : (pvtZ+14), 2.2);
				var hole2 = ljhCylinderMeshFromPoint(pvtX, pvtY-6, pvtZ+12, zmax > (pvtZ+14) ? zmax : (pvtZ+14), 2.2);
				var hole3 = ljhCylinderMeshFromPoint(pvtX+18, pvtY+6, pvtZ+12, zmax > (pvtZ+14) ? zmax : (pvtZ+14), 2.2);
				var hole4 = ljhCylinderMeshFromPoint(pvtX+18, pvtY-6, pvtZ+12, zmax > (pvtZ+14) ? zmax : (pvtZ+14), 2.2);
				var hole5 = ljhCylinderMeshFromPoint(pvtX, pvtY, pvtZ+6, zmin > (pvtZ-14) ? zmin : (pvtZ-14), 2.2);
				var hole6 = ljhCylinderMeshFromPoint(pvtX, pvtY, pvtZ-6, zmin > (pvtZ-14) ? zmin : (pvtZ-14), 2.2);
				var hole7 = ljhCylinderMeshFromPoint(pvtX+18, pvtY+6, pvtZ+12, zmin > (pvtZ-14) ? zmin : (pvtZ-14), 2.2);
				var hole8 = ljhCylinderMeshFromPoint(pvtX+18, pvtY-6, pvtZ+12, zmin > (pvtZ-14) ? zmin : (pvtZ-14), 2.2);

				var stair1 = ljhCylinderMeshFromPoint(pvtX, pvtY+6, pvtZ+14, zmax > (pvtZ+14) ? zmax : (pvtZ+14), 3);
				var stair2 = ljhCylinderMeshFromPoint(pvtX, pvtY-6, pvtZ+14, zmax > (pvtZ+14) ? zmax : (pvtZ+14), 3);
				var stair3 = ljhCylinderMeshFromPoint(pvtX+18, pvtY+6, pvtZ+14, zmax > (pvtZ+14) ? zmax : (pvtZ+14), 3);
				var stair4 = ljhCylinderMeshFromPoint(pvtX+18, pvtY-6, pvtZ+14, zmax > (pvtZ+14) ? zmax : (pvtZ+14), 3);
				var stair5 = ljhCylinderMeshFromPoint(pvtX, pvtY+6, pvtZ-14, zmin > (pvtZ-14) ? zmin : (pvtZ-14), 3);
				var stair6 = ljhCylinderMeshFromPoint(pvtX, pvtY-6, pvtZ-14, zmin > (pvtZ-14) ? zmin : (pvtZ-14), 3);
				var stair7 = ljhCylinderMeshFromPoint(pvtX+18, pvtY+6, pvtZ-14, zmin > (pvtZ-14) ? zmin : (pvtZ-14), 3);
				var stair8 = ljhCylinderMeshFromPoint(pvtX+18, pvtY-6, pvtZ-14, zmin > (pvtZ-14) ? zmin : (pvtZ-14), 3);
				
				var hole = booleanGeo(hole1, hole2, UNION);
				hole = booleanGeo(hole, hole3, UNION);
				hole = booleanGeo(hole, hole4, UNION);
				hole = booleanGeo(hole, hole5, UNION);
				hole = booleanGeo(hole, hole6, UNION);
				hole = booleanGeo(hole, hole7, UNION);
				hole = booleanGeo(hole, hole8, UNION);
				hole = booleanGeo(hole, stair1, UNION);
				hole = booleanGeo(hole, stair2, UNION);
				hole = booleanGeo(hole, stair3, UNION);
				hole = booleanGeo(hole, stair4, UNION);
				hole = booleanGeo(hole, stair5, UNION);
				hole = booleanGeo(hole, stair6, UNION);
				hole = booleanGeo(hole, stair7, UNION);
				hole = booleanGeo(hole, stair8, UNION);

				LINK = booleanGeo(LINK, hole, SUBTRACT);
				break;
			case 3:
				var motorShell = ljhBoxMeshFromPoints(pvtX-14, pvtX+14, pvtY-9, pvtY+29, pvtZ-12, pvtZ+12);
				LINK = booleanGeo(LINK, motorShell, UNION);

				// sceond step: subtract motor
				var motor = ljhBoxMeshFromPoints(pvtX-12, pvtX+12, Math.min(ymin, pvtY-9), pvtY+27, pvtZ-12-5, pvtZ+15+5);
				LINK = booleanGeo(LINK, motor, SUBTRACT);

				// third step: round corner
				var prismLarge = ljhBoxMeshFromPoints(Math.min(xmin, pvtX-14), Math.max(xmax, pvtX+14), Math.min(ymin, pvtY-15), pvtY, Math.min(zmin, pvtZ-12-5), Math.max(zmax, pvtZ+15+5));
				var cylinder = ljhCylinderMeshFromPoint(pvtX, pvtY, Math.min(zmin, pvtZ-12-5), Math.max(zmax, pvtZ+15+5), pvtY-ymin);
				var cutShape = booleanGeo(prismLarge, cylinder, SUBTRACT);
				LINK = booleanGeo(LINK, cutShape, SUBTRACT);

				// forth step: add space for joint to move
				var prismActive = ljhBoxMeshFromPoints(Math.min(xmin, pvtX-14), Math.max(xmax, pvtX+14), Math.min(ymin, pvtY-14), pvtY*2-ymin, pvtZ+15, pvtZ+15+5);
				var prismPassive = ljhBoxMeshFromPoints(Math.min(xmin, pvtX-14), Math.max(xmax, pvtX+14), Math.min(ymin, pvtY-14), pvtY*2-ymin, pvtZ-12-5, pvtZ-12);
				LINK = booleanGeo(LINK, prismActive, SUBTRACT);
				LINK = booleanGeo(LINK, prismPassive, SUBTRACT);

				// screw hole
				var cylinderHoleScrew = ljhCylinderMeshFromPoint(pvtX, pvtY, Math.min(zmin, pvtZ-12-5), Math.max(zmax, pvtZ+15+5), 6);
				LINK = booleanGeo(LINK, cylinderHoleScrew, SUBTRACT);

				// add holes for motor rivets
				var hole1 = ljhCylinderMeshX(pvtY, pvtZ+6, pvtX+12, xmax > (pvtX+14) ? xmax : (pvtX+14), 2.2);
				var hole2 = ljhCylinderMeshX(pvtY+18, pvtZ+6, pvtX+12, xmax > (pvtX+14) ? xmax : (pvtX+14), 2.2);
				var hole3 = ljhCylinderMeshX(pvtY+18, pvtZ-6, pvtX+12, xmax > (pvtX+14) ? xmax : (pvtX+14), 2.2);
				var hole4 = ljhCylinderMeshX(pvtY, pvtZ-6, pvtX+12, xmax > (pvtX+14) ? xmax : (pvtX+14), 2.2);
				var hole5 = ljhCylinderMeshX(pvtY, pvtZ+6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-12, 2.2);
				var hole6 = ljhCylinderMeshX(pvtY+18, pvtZ+6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-12, 2.2);
				var hole7 = ljhCylinderMeshX(pvtY+18, pvtZ-6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-12, 2.2);
				var hole8 = ljhCylinderMeshX(pvtY, pvtZ-6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-12, 2.2);

				var stair1 = ljhCylinderMeshX(pvtY, pvtZ+6, pvtX+14, xmax > (pvtX+14) ? xmax : (pvtX+14), 3);
				var stair2 = ljhCylinderMeshX(pvtY+18, pvtZ+6, pvtX+14, xmax > (pvtX+14) ? xmax : (pvtX+14), 3);
				var stair3 = ljhCylinderMeshX(pvtY+18, pvtZ-6, pvtX+14, xmax > (pvtX+14) ? xmax : (pvtX+14), 3);
				var stair4 = ljhCylinderMeshX(pvtY, pvtZ-6, pvtX+14, xmax > (pvtX+14) ? xmax : (pvtX+14), 3);
				var stair5 = ljhCylinderMeshX(pvtY, pvtZ+6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-14, 3);
				var stair6 = ljhCylinderMeshX(pvtY+18, pvtZ+6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-14, 3);
				var stair7 = ljhCylinderMeshX(pvtY+18, pvtZ-6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-14, 3);
				var stair8 = ljhCylinderMeshX(pvtY, pvtZ-6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-14, 3);

				var hole = booleanGeo(hole1, hole2, UNION);
				hole = booleanGeo(hole, hole3, UNION);
				hole = booleanGeo(hole, hole4, UNION);
				hole = booleanGeo(hole, hole5, UNION);
				hole = booleanGeo(hole, hole6, UNION);
				hole = booleanGeo(hole, hole7, UNION);
				hole = booleanGeo(hole, hole8, UNION);
				hole = booleanGeo(hole, stair1, UNION);
				hole = booleanGeo(hole, stair2, UNION);
				hole = booleanGeo(hole, stair3, UNION);
				hole = booleanGeo(hole, stair4, UNION);
				hole = booleanGeo(hole, stair5, UNION);
				hole = booleanGeo(hole, stair6, UNION);
				hole = booleanGeo(hole, stair7, UNION);
				hole = booleanGeo(hole, stair8, UNION);

				LINK = booleanGeo(LINK, hole, SUBTRACT);
				break;
		}
		// fifth step: add joint for the next link
		if (pivot_prev != undefined) {
			var pvtX2 = pivot_prev.position.x;
			var pvtY2 = pivot_prev.position.y;
			var pvtZ2 = pivot_prev.position.z;

			var jtCyl = ljhCylinderMeshFromPoint(pvtX2, pvtY2, zmin-2, zmin, 9);
			LINK = booleanGeo(LINK, jtCyl, UNION);

			// add hole for screws
			var midHole = ljhCylinderMeshFromPoint(pvtX2, pvtY2, zmin-2, zmin, 1.4);
			var holeStair1 = ljhCylinderMeshFromPoint(pvtX2, pvtY2, zmin-2, zmin-1.5, 3);
			var holeStair2 = ljhCylinderMeshFromPoint(pvtX2, pvtY2, zmin, zmax, 6);
			LINK = booleanGeo(LINK, midHole, SUBTRACT);
			LINK = booleanGeo(LINK, holeStair1, SUBTRACT);
			LINK = booleanGeo(LINK, holeStair2, SUBTRACT);

			// add pin for fastening
			var pin1 = ljhCylinderMeshFromPoint(pvtX2, pvtY2+6, zmin-2-1, zmin-2, 1.75);
			var pin2 = ljhCylinderMeshFromPoint(pvtX2-6, pvtY2, zmin-2-1, zmin-2, 1.75);
			var pin3 = ljhCylinderMeshFromPoint(pvtX2, pvtY2-6, zmin-2-1, zmin-2, 1.75);
			var pin4 = ljhCylinderMeshFromPoint(pvtX2+6, pvtY2, zmin-2-1, zmin-2, 1.75);

			LINK = booleanGeo(LINK, pin1, UNION);
			LINK = booleanGeo(LINK, pin2, UNION);
			LINK = booleanGeo(LINK, pin3, UNION);
			LINK = booleanGeo(LINK, pin4, UNION);
		}

		return new THREE.Mesh(LINK, MATERIALNORMAL);
	}


	_linkJoint2(link, pivot, pivot_prev, jtType) {
		// first Step: add motor shell
		var LINK = link;
		var bboxParams = getBoundingBoxEverything(link);
		var xmin = bboxParams.cmin.x;
		var xmax = bboxParams.cmax.x;
		var ymin = bboxParams.cmin.y;
		var ymax = bboxParams.cmax.y;
		var zmin = bboxParams.cmin.z;
		var zmax = bboxParams.cmax.z;

		var pvtX = pivot.position.x;
		var pvtY = pivot.position.y;
		var pvtZ = pivot.position.z;

		var motorShell = ljhBoxMeshFromPoints(pvtX-29, pvtX+9, pvtY-14, pvtY+14, pvtZ-12, pvtZ+12);
		LINK = booleanGeo(LINK, motorShell, UNION);

		// sceond step: subtract motor
		var motor = ljhBoxMeshFromPoints(pvtX-27, xmax, pvtY-12, pvtY+12, pvtZ-12-5, pvtZ+15+5);
		LINK = booleanGeo(LINK, motor, SUBTRACT);

		// third step: round corner
		var prismLarge = ljhBoxMeshFromPoints(pvtX, Math.max(xmax, pvtX+15), Math.min(ymin, pvtY-14), Math.max(ymax, pvtY+14), zmin, zmax);
		var cylinder = ljhCylinderMeshFromPoint(pvtX, pvtY, zmin, zmax, xmax-pvtX);
		var cutShape = booleanGeo(prismLarge, cylinder, SUBTRACT);
		LINK = booleanGeo(LINK, cutShape, SUBTRACT);

		// forth step: add space for joint to move
		var prismActive = ljhBoxMeshFromPoints(pvtX*2-xmax, xmax, Math.min(ymin, pvtY-14), Math.max(ymax, pvtY+14), pvtZ+15, pvtZ+15+5);
		var prismPassive = ljhBoxMeshFromPoints(pvtX*2-xmax, xmax, Math.min(ymin, pvtY-14), Math.max(ymax, pvtY+14), pvtZ-12-5, pvtZ-12);
		LINK = booleanGeo(LINK, prismActive, SUBTRACT);
		LINK = booleanGeo(LINK, prismPassive, SUBTRACT);

		// fifth step: add joint for the next link
		if (pivot_prev != undefined) {
			var pvtX2 = pivot_prev.position.x;
			var pvtY2 = pivot_prev.position.y;
			var pvtZ2 = pivot_prev.position.z;

			switch(jtType) {
				case 1:
					var jtPrismActive = ljhBoxMeshFromPoints(pvtX2+15.5, pvtX2+15.5+3, ymax, pvtY2, pvtZ2-9, pvtZ2+9);
					var jtPrismPassive = ljhBoxMeshFromPoints(pvtX2-12.5-3, pvtX2-12.5, ymax, pvtY2, pvtZ2-9, pvtZ2+9);
					var jtCylinderActive = ljhCylinderMeshX(pvtY2, pvtZ2, pvtX2+15.5, pvtX2+15.5+3, 9);
					var jtCylinderPassive = ljhCylinderMeshX(pvtY2, pvtZ2, pvtX2+15.5, pvtX2+15.5+3, 9);

					var jtActive = booleanGeo(jtPrismActive, jtCylinderActive, UNION);
					var jtPassive = booleanGeo(jtPrismPassive, jtCylinderPassive, UNION);
					LINK = booleanGeo(LINK, jtActive, UNION);
					LINK = booleanGeo(LINK, jtPassive, UNION);

					// add hole for screws
					var midHole = ljhCylinderMeshX(pvtY2, pvtZ2, pvtX2-12.5-5, pvtX2+15.5+5, 1.4);
					var holeStair1 = ljhCylinderMeshX(pvtY2, pvtZ2, pvtX2+15.5+1.5, pvtX2+15+5, 3);
					var holeStair2 = ljhCylinderMeshX(pvtY2, pvtZ2, pvtX2-12.5-5, pvtX2-12.5-1.5, 3);
					LINK = booleanGeo(LINK, midHole, SUBTRACT);
					LINK = booleanGeo(LINK, holeStair1, SUBTRACT);
					LINK = booleanGeo(LINK, holeStair2, SUBTRACT);

					// add pin for fastening
					var pin1 = ljhCylinderMeshX(pvtY2, pvtZ2+6, pvtX2+15.5-1.5, pvtX2+15.5, 1.75);
					var pin2 = ljhCylinderMeshX(pvtY2-6, pvtZ2, pvtX2+15.5-1.5, pvtX2+15.5, 1.75);
					var pin3 = ljhCylinderMeshX(pvtY2, pvtZ2-6, pvtX2+15.5-1.5, pvtX2+15.5, 1.75);
					var pin4 = ljhCylinderMeshX(pvtY2+6, pvtZ2, pvtX2+15.5-1.5, pvtX2+15.5, 1.75);

					LINK = booleanGeo(LINK, pin1, UNION);
					LINK = booleanGeo(LINK, pin2, UNION);
					LINK = booleanGeo(LINK, pin3, UNION);
					LINK = booleanGeo(LINK, pin4, UNION);

					break;
				case 2:
					var cylinderPrev = ljhCylinderMeshY(pvtX2, pvtZ2, ymax, pvtY2-14, 9);
					// add pin for fastening
					var pin1 = ljhCylinderMeshY(pvtX2, pvtZ2+6, pvtY2-14, pvtY2-14+1.5, 1.75);
					var pin2 = ljhCylinderMeshY(pvtX2-6, pvtZ2, pvtY2-14, pvtY2-14+1.5, 1.75);
					var pin3 = ljhCylinderMeshY(pvtX2, pvtZ2-6, pvtY2-14, pvtY2-14+1.5, 1.75);
					var pin4 = ljhCylinderMeshY(pvtX2+6, pvtZ2, pvtY2-14, pvtY2-14+1.5, 1.75);

					LINK = booleanGeo(LINK, cylinderPrev, UNION);
					LINK = booleanGeo(LINK, pin1, UNION);
					LINK = booleanGeo(LINK, pin2, UNION);
					LINK = booleanGeo(LINK, pin3, UNION);
					LINK = booleanGeo(LINK, pin4, UNION);

					// hole for screwing

					var cylinderHoleScrew = ljhCylinderMeshY(pvtX2, pvtZ2, ymin, ymax, 6);
					var cylinderHole = ljhCylinderMeshY(pvtX2, pvtZ2, ymax, pvtY2-14, 1.4);
					var cylinderHoleStair = ljhCylinderMeshY(pvtX2, pvtZ2, ymax, pvtY2-14-1.5, 3);
					var HOLE = booleanGeo(cylinderHoleScrew, cylinderHole, UNION);
					HOLE = booleanGeo(HOLE, cylinderHoleStair, UNION);
					LINK = booleanGeo(LINK, HOLE, SUBTRACT);

					break;
				case 3:
					var jtPrismActive = ljhBoxMeshFromPoints(pvtX2-9, pvtX2+9, ymax, pvtY2, pvtZ2+15.5, pvtZ2+15.5+3);
					var jtPrismPassive = ljhBoxMeshFromPoints(pvtX2-9, pvtX2+9, ymax, pvtY2, pvtZ2-12.5-3, pvtZ2-12.5);
					var jtCylinderActive = ljhCylinderMeshFromPoint(pvtX2, pvtY2, pvtZ2+15.5, pvtZ2+15.5+3, 9);
					var jtCylinderPassive = ljhCylinderMeshFromPoint(pvtX2, pvtY2, pvtZ2-12.5-3, pvtZ2-12.5, 9);

					var jtActive = booleanGeo(jtPrismActive, jtCylinderActive, UNION);
					var jtPassive = booleanGeo(jtPrismPassive, jtCylinderPassive, UNION);
					LINK = booleanGeo(LINK, jtActive, UNION);
					LINK = booleanGeo(LINK, jtPassive, UNION);

					// add hole for screws
					var midHole = ljhCylinderMeshFromPoint(pvtX2, pvtY2, zmin, zmax, 1.4);
					var holeStair1 = ljhCylinderMeshFromPoint(pvtX2, pvtY2, pvtZ2+15.5+1.5, zmax, 3);
					var holeStair2 = ljhCylinderMeshFromPoint(pvtX2, pvtY2, zmin, pvtZ2-12.5-1.5, 3);
					LINK = booleanGeo(LINK, midHole, SUBTRACT);
					LINK = booleanGeo(LINK, holeStair1, SUBTRACT);
					LINK = booleanGeo(LINK, holeStair2, SUBTRACT);

					// add pin for fastening
					var pin1 = ljhCylinderMeshFromPoint(pvtX2, pvtY2+6, pvtZ2+15.5-1.5, pvtZ2+15.5, 1.75);
					var pin2 = ljhCylinderMeshFromPoint(pvtX2-6, pvtY2, pvtZ2+15.5-1.5, pvtZ2+15.5, 1.75);
					var pin3 = ljhCylinderMeshFromPoint(pvtX2, pvtY2-6, pvtZ2+15.5-1.5, pvtZ2+15.5, 1.75);
					var pin4 = ljhCylinderMeshFromPoint(pvtX2+6, pvtY2, pvtZ2+15.5-1.5, pvtZ2+15.5, 1.75);

					LINK = booleanGeo(LINK, pin1, UNION);
					LINK = booleanGeo(LINK, pin2, UNION);
					LINK = booleanGeo(LINK, pin3, UNION);
					LINK = booleanGeo(LINK, pin4, UNION);
					break;
			}
		}

		// add holes for screwdrivers
		var cylScrewdriver = ljhCylinderMeshFromPoint(pvtX, pvtY, zmin<(pvtZ-14)?zmin:(pvtZ-14), zmax>(pvtZ+14)?zmax:(pvtZ+14), 5);
		LINK = booleanGeo(LINK, cylScrewdriver, SUBTRACT);
		
		// add holes for motor rivets
		var hole1 = ljhCylinderMeshY(pvtX, pvtZ+6, pvtY+12, ymax > (pvtY+14) ? ymax : (pvtY+14), 2.2);
		var hole2 = ljhCylinderMeshY(pvtX, pvtZ-6, pvtY+12, ymax > (pvtY+14) ? ymax : (pvtY+14), 2.2);
		var hole3 = ljhCylinderMeshY(pvtX-18, pvtZ+6, pvtY+12, ymax > (pvtY+14) ? ymax : (pvtY+14), 2.2);
		var hole4 = ljhCylinderMeshY(pvtX-18, pvtZ-6, pvtY+12, ymax > (pvtY+14) ? ymax : (pvtY+14), 2.2);
		var hole5 = ljhCylinderMeshY(pvtX, pvtZ+6, ymin < (pvtY-14) ? ymin : (pvtY-14), pvtY-12, 2.2);
		var hole6 = ljhCylinderMeshY(pvtX, pvtZ-6, ymin < (pvtY-14) ? ymin : (pvtY-14), pvtY-12, 2.2);
		var hole7 = ljhCylinderMeshY(pvtX-18, pvtZ+6, ymin < (pvtY-14) ? ymin : (pvtY-14), pvtY-12, 2.2);
		var hole8 = ljhCylinderMeshY(pvtX-18, pvtZ-6, ymin < (pvtY-14) ? ymin : (pvtY-14), pvtY-12, 2.2);

		var stair1 = ljhCylinderMeshY(pvtX, pvtZ+6, pvtY+14, ymax > (pvtY+14) ? ymax : (pvtY+14), 3);
		var stair2 = ljhCylinderMeshY(pvtX, pvtZ-6, pvtY+14, ymax > (pvtY+14) ? ymax : (pvtY+14), 3);
		var stair3 = ljhCylinderMeshY(pvtX-18, pvtZ+6, pvtY+14, ymax > (pvtY+14) ? ymax : (pvtY+14), 3);
		var stair4 = ljhCylinderMeshY(pvtY-18, pvtZ-6, pvtX+14, xmax > (pvtX+14) ? xmax : (pvtX+14), 3);
		var stair5 = ljhCylinderMeshY(pvtX, pvtZ+6, ymin < (pvtY-14) ? ymin : (pvtY-14), pvtY-14, 3);
		var stair6 = ljhCylinderMeshY(pvtX, pvtZ-6, ymin < (pvtY-14) ? ymin : (pvtY-14), pvtY-14, 3);
		var stair7 = ljhCylinderMeshY(pvtX-18, pvtZ+6, ymin < (pvtY-14) ? ymin : (pvtY-14), pvtY-14, 3);
		var stair8 = ljhCylinderMeshY(pvtX-18, pvtZ-6, ymin < (pvtY-14) ? ymin : (pvtY-14), pvtY-14, 3);

		var hole = booleanGeo(hole1, hole2, UNION);
		hole = booleanGeo(hole, hole3, UNION);
		hole = booleanGeo(hole, hole4, UNION);
		hole = booleanGeo(hole, hole5, UNION);
		hole = booleanGeo(hole, hole6, UNION);
		hole = booleanGeo(hole, hole7, UNION);
		hole = booleanGeo(hole, hole8, UNION);
		hole = booleanGeo(hole, stair1, UNION);
		hole = booleanGeo(hole, stair2, UNION);
		hole = booleanGeo(hole, stair3, UNION);
		hole = booleanGeo(hole, stair4, UNION);
		hole = booleanGeo(hole, stair5, UNION);
		hole = booleanGeo(hole, stair6, UNION);
		hole = booleanGeo(hole, stair7, UNION);
		hole = booleanGeo(hole, stair8, UNION);

		LINK = booleanGeo(LINK, hole, SUBTRACT);

		return new THREE.Mesh(LINK, MATERIALNORMAL);
	}

	_linkJoint3(link, pivot, pivot_prev) {
		// first Step: add motor shell
		var LINK = link;
		var bboxParams = getBoundingBoxEverything(link);
		var xmin = bboxParams.cmin.x;
		var xmax = bboxParams.cmax.x;
		var ymin = bboxParams.cmin.y;
		var ymax = bboxParams.cmax.y;
		var zmin = bboxParams.cmin.z;
		var zmax = bboxParams.cmax.z;

		var pvtX = pivot.position.x;
		var pvtY = pivot.position.y;
		var pvtZ = pivot.position.z;

		var motorShell = ljhBoxMeshFromPoints(pvtX-14, pvtX+14, pvtY-29, pvtY+9, pvtZ-12, pvtZ+12);
		LINK = booleanGeo(LINK, motorShell, UNION);

		// sceond step: subtract motor
		var motor = ljhBoxMeshFromPoints(pvtX-12, pvtX+12, pvtY-27, Math.max(pvtY+9, ymax), pvtZ-12-5, pvtZ+15+5);
		LINK = booleanGeo(LINK, motor, SUBTRACT);

		// third step: round corner
		var prismLarge = ljhBoxMeshFromPoints(Math.min(xmin, pvtX-14), Math.max(xmax, pvtX+14), pvtY, ymax>pvtY?ymax:(pvtY+15), zmin, zmax);
		var cylinder = ljhCylinderMeshFromPoint(pvtX, pvtY, zmin, zmax, ymax-pvtY);
		var cutShape = booleanGeo(prismLarge, cylinder, SUBTRACT);
		LINK = booleanGeo(LINK, cutShape, SUBTRACT);

		// forth step: add space for joint to move
		var prismActive = ljhBoxMeshFromPoints(Math.min(xmin, pvtX-14), Math.max(xmax, pvtX+14), pvtY*2-ymax, ymax, pvtZ+15, pvtZ+15+5);
		var prismPassive = ljhBoxMeshFromPoints(Math.min(xmin, pvtX-14), Math.max(xmax, pvtX+14), pvtY*2-ymax, ymax, pvtZ-12-5, pvtZ-12);
		LINK = booleanGeo(LINK, prismActive, SUBTRACT);
		LINK = booleanGeo(LINK, prismPassive, SUBTRACT);

		// fifth step: add joint for the next link
		if (pivot_prev != undefined) {
			var pvtX2 = pivot_prev.position.x;
			var pvtY2 = pivot_prev.position.y;
			var pvtZ2 = pivot_prev.position.z;

			var jtPrismActive = ljhBoxMeshFromPoints(pvtX2, xmin, pvtY2-9, pvtY2+9, pvtZ2+15.5, pvtZ2+15.5+3);
			var jtPrismPassive = ljhBoxMeshFromPoints(pvtX2, xmin, pvtY2-9, pvtY2+9, pvtZ2-12.5-3, pvtZ2-12.5);
			var jtCylinderActive = ljhCylinderMeshFromPoint(pvtX2, pvtY2, pvtZ2+15.5, pvtZ2+15.5+3, 9);
			var jtCylinderPassive = ljhCylinderMeshFromPoint(pvtX2, pvtY2, pvtZ2-12.5-3, pvtZ2-12.5, 9);

			var jtActive = booleanGeo(jtPrismActive, jtCylinderActive, UNION);
			var jtPassive = booleanGeo(jtPrismPassive, jtCylinderPassive, UNION);
			LINK = booleanGeo(LINK, jtActive, UNION);
			LINK = booleanGeo(LINK, jtPassive, UNION);

			// add hole for screws
			var midHole = ljhCylinderMeshFromPoint(pvtX2, pvtY2, zmin, zmax, 1.4);
			var holeStair1 = ljhCylinderMeshFromPoint(pvtX2, pvtY2, pvtZ2+15.5+1.5, pvtZ2+15.5+5, 3);
			var holeStair2 = ljhCylinderMeshFromPoint(pvtX2, pvtY2, pvtZ2-12.5-5, pvtZ2-12.5-1.5, 3);
			LINK = booleanGeo(LINK, midHole, SUBTRACT);
			LINK = booleanGeo(LINK, holeStair1, SUBTRACT);
			LINK = booleanGeo(LINK, holeStair2, SUBTRACT);

			// add pin for fastening
			var pin1 = ljhCylinderMeshFromPoint(pvtX2, pvtY2+6, pvtZ2+15.5-1.5, pvtZ2+15.5, 1.75);
			var pin2 = ljhCylinderMeshFromPoint(pvtX2-6, pvtY2, pvtZ2+15.5-1.5, pvtZ2+15.5, 1.75);
			var pin3 = ljhCylinderMeshFromPoint(pvtX2, pvtY2-6, pvtZ2+15.5-1.5, pvtZ2+15.5, 1.75);
			var pin4 = ljhCylinderMeshFromPoint(pvtX2+6, pvtY2, pvtZ2+15.5-1.5, pvtZ2+15.5, 1.75);

			LINK = booleanGeo(LINK, pin1, UNION);
			LINK = booleanGeo(LINK, pin2, UNION);
			LINK = booleanGeo(LINK, pin3, UNION);
			LINK = booleanGeo(LINK, pin4, UNION);
		}

		// add holes for screwdrivers
		var cylScrewdriver = ljhCylinderMeshFromPoint(pvtX, pvtY, zmin<(pvtZ-14)?zmin:(pvtZ-14), zmax>(pvtZ+14)?zmax:(pvtZ+14), 5);
		LINK = booleanGeo(LINK, cylScrewdriver, SUBTRACT);
		
		// add holes for motor rivets
		var hole1 = ljhCylinderMeshX(pvtY, pvtZ+6, pvtX+12, xmax > (pvtX+14) ? xmax : (pvtX+14), 2.2);
		var hole2 = ljhCylinderMeshX(pvtY-18, pvtZ+6, pvtX+12, xmax > (pvtX+14) ? xmax : (pvtX+14), 2.2);
		var hole3 = ljhCylinderMeshX(pvtY-18, pvtZ-6, pvtX+12, xmax > (pvtX+14) ? xmax : (pvtX+14), 2.2);
		var hole4 = ljhCylinderMeshX(pvtY, pvtZ-6, pvtX+12, xmax > (pvtX+14) ? xmax : (pvtX+14), 2.2);
		var hole5 = ljhCylinderMeshX(pvtY, pvtZ+6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-12, 2.2);
		var hole6 = ljhCylinderMeshX(pvtY-18, pvtZ+6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-12, 2.2);
		var hole7 = ljhCylinderMeshX(pvtY-18, pvtZ-6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-12, 2.2);
		var hole8 = ljhCylinderMeshX(pvtY, pvtZ-6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-12, 2.2);

		var stair1 = ljhCylinderMeshX(pvtY, pvtZ+6, pvtX+14, xmax > (pvtX+14) ? xmax : (pvtX+14), 3);
		var stair2 = ljhCylinderMeshX(pvtY-18, pvtZ+6, pvtX+14, xmax > (pvtX+14) ? xmax : (pvtX+14), 3);
		var stair3 = ljhCylinderMeshX(pvtY-18, pvtZ-6, pvtX+14, xmax > (pvtX+14) ? xmax : (pvtX+14), 3);
		var stair4 = ljhCylinderMeshX(pvtY, pvtZ-6, pvtX+14, xmax > (pvtX+14) ? xmax : (pvtX+14), 3);
		var stair5 = ljhCylinderMeshX(pvtY, pvtZ+6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-14, 3);
		var stair6 = ljhCylinderMeshX(pvtY-18, pvtZ+6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-14, 3);
		var stair7 = ljhCylinderMeshX(pvtY-18, pvtZ-6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-14, 3);
		var stair8 = ljhCylinderMeshX(pvtY, pvtZ-6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-14, 3);

		var hole = booleanGeo(hole1, hole2, UNION);
		hole = booleanGeo(hole, hole3, UNION);
		hole = booleanGeo(hole, hole4, UNION);
		hole = booleanGeo(hole, hole5, UNION);
		hole = booleanGeo(hole, hole6, UNION);
		hole = booleanGeo(hole, hole7, UNION);
		hole = booleanGeo(hole, hole8, UNION);
		hole = booleanGeo(hole, stair1, UNION);
		hole = booleanGeo(hole, stair2, UNION);
		hole = booleanGeo(hole, stair3, UNION);
		hole = booleanGeo(hole, stair4, UNION);
		hole = booleanGeo(hole, stair5, UNION);
		hole = booleanGeo(hole, stair6, UNION);
		hole = booleanGeo(hole, stair7, UNION);
		hole = booleanGeo(hole, stair8, UNION);

		LINK = booleanGeo(LINK, hole, SUBTRACT);

		return new THREE.Mesh(LINK, MATERIALNORMAL);
	}

	_linkJoint4(link, pivot, pivot_prev, taskType) {
		// first Step: add motor shell
		var LINK = link;
		var bboxParams = getBoundingBoxEverything(link);
		var xmin = bboxParams.cmin.x;
		var xmax = bboxParams.cmax.x;
		var ymin = bboxParams.cmin.y;
		var ymax = bboxParams.cmax.y;
		var zmin = bboxParams.cmin.z;
		var zmax = bboxParams.cmax.z;

		if (taskType == PICKPLACE) {
			var pvtX = pivot.position.x;
			var pvtY = pivot.position.y;
			var pvtZ = pivot.position.z;

			var motorShell = ljhBoxMeshFromPoints(pvtX-9, pvtX+27, pvtY+12, pvtY+14, pvtZ-12, pvtZ+12);
			LINK = booleanGeo(LINK, motorShell, UNION);

			// sceond step: subtract motor
			var motor = ljhBoxMeshFromPoints(Math.min(xmin, pvtX-12), pvtX+29, Math.min(ymin, pvtY-20), pvtY+12, Math.min(zmin,pvtZ-12-5), Math.max(zmax, pvtZ+15+5));
			LINK = booleanGeo(LINK, motor, SUBTRACT);
		}

		// fifth step: add joint for the next link
		if (pivot_prev != undefined) {
			var pvtX2 = pivot_prev.position.x;
			var pvtY2 = pivot_prev.position.y;
			var pvtZ2 = pivot_prev.position.z;

			var jtPrismActive = ljhBoxMeshFromPoints(pvtX2-9, pvtX2+9, pvtY2, ymin, pvtZ2+15.5, pvtZ2+15.5+3);
			var jtPrismPassive = ljhBoxMeshFromPoints(pvtX2-9, pvtX2+9, pvtY2, ymin, pvtZ2-12.5-3, pvtZ2-12.5);
			var jtCylinderActive = ljhCylinderMeshFromPoint(pvtX2, pvtY2, pvtZ2+15.5, pvtZ2+15.5+3, 9);
			var jtCylinderPassive = ljhCylinderMeshFromPoint(pvtX2, pvtY2, pvtZ2-12.5-3, pvtZ2-12.5, 9);

			var jtActive = booleanGeo(jtPrismActive, jtCylinderActive, UNION);
			var jtPassive = booleanGeo(jtPrismPassive, jtCylinderPassive, UNION);
			LINK = booleanGeo(LINK, jtActive, UNION);
			LINK = booleanGeo(LINK, jtPassive, UNION);

			// add hole for screws
			var midHole = ljhCylinderMeshFromPoint(pvtX2, pvtY2, zmin, zmax, 1.4);
			var holeStair1 = ljhCylinderMeshFromPoint(pvtX2, pvtY2, pvtZ2+15.5+1.5, pvtZ2+15.5+5, 3);
			var holeStair2 = ljhCylinderMeshFromPoint(pvtX2, pvtY2, pvtZ2-12.5-5, pvtZ2-12.5-1.5, 3);
			LINK = booleanGeo(LINK, midHole, SUBTRACT);
			LINK = booleanGeo(LINK, holeStair1, SUBTRACT);
			LINK = booleanGeo(LINK, holeStair2, SUBTRACT);

			// add pin for fastening
			var pin1 = ljhCylinderMeshFromPoint(pvtX2, pvtY2+6, pvtZ2+15.5-1.5, pvtZ2+15.5, 1.75);
			var pin2 = ljhCylinderMeshFromPoint(pvtX2-6, pvtY2, pvtZ2+15.5-1.5, pvtZ2+15.5, 1.75);
			var pin3 = ljhCylinderMeshFromPoint(pvtX2, pvtY2-6, pvtZ2+15.5-1.5, pvtZ2+15.5, 1.75);
			var pin4 = ljhCylinderMeshFromPoint(pvtX2+6, pvtY2, pvtZ2+15.5-1.5, pvtZ2+15.5, 1.75);

			LINK = booleanGeo(LINK, pin1, UNION);
			LINK = booleanGeo(LINK, pin2, UNION);
			LINK = booleanGeo(LINK, pin3, UNION);
			LINK = booleanGeo(LINK, pin4, UNION);
		}

		return new THREE.Mesh(LINK, MATERIALNORMAL);
	}

}

class ObjMovingCAD extends CAD {
	constructor(transPt, workspace) {
		super(transPt, workspace);
		this._staticPt = transPt._staticPt;
		this._generate();
	}
	
	_generate() {
		this.segmentLinks();
		this.setPivot();
	}

	segmentLinks() {
		var xmin = this._bboxParamsNew.cmin.x;
		var xmax = this._bboxParamsNew.cmax.x;
		var ymin = this._bboxParamsNew.cmin.y;
		var ymax = this._bboxParamsNew.cmax.y;
		var zmin = this._bboxParamsNew.cmin.z;
		var zmax = this._bboxParamsNew.cmax.z;

		var link1Points = [[0, 0], [0, ymin], [xmax, ymin], [xmax, 0]];
		var link2Points = [[0, 0], [0, ymax], [xmax, ymax], [xmax, 0]];
		var link3Points = [[0, 0], [0, ymax], [xmin, ymax], [xmin, 0]];
		var link4Points = [[0, 0], [0, ymin], [xmin, ymin], [xmin, 0]];

		var link1Cut = polygonExtrudePoints(link1Points, zmax-zmin);
		var link2Cut = polygonExtrudePoints(link2Points, zmax-zmin);
		var link3Cut = polygonExtrudePoints(link3Points, zmax-zmin);
		var link4Cut = polygonExtrudePoints(link4Points, zmax-zmin);

		var link1 = booleanGeo(this._meshTransNew, link1Cut, INTERSECT);
		var link2 = booleanGeo(this._meshTransNew, link2Cut, INTERSECT);
		var link3 = booleanGeo(this._meshTransNew, link3Cut, INTERSECT);
		var link4 = booleanGeo(this._meshTransNew, link4Cut, INTERSECT);

		this._link1 = new THREE.Mesh(link1);
		this._link2 = new THREE.Mesh(link2);
		this._link3 = new THREE.Mesh(link3);
		this._link4 = new THREE.Mesh(link4);

	}

	setPivot() {
		var xmin = this._bboxParamsNew.cmin.x;
		var xmax = this._bboxParamsNew.cmax.x;
		var ymin = this._bboxParamsNew.cmin.y;
		var ymax = this._bboxParamsNew.cmax.y;
		var zmin = this._bboxParamsNew.cmin.z;
		var zmax = this._bboxParamsNew.cmax.z;

		var pivot1 = new THREE.Group();
		var pivot2 = new THREE.Group();
		var pivot3 = new THREE.Group();
		var pivot4 = new THREE.Group();
		var pivot5 = new THREE.Group();
		var base = new THREE.Group();

		pivot1.position.set(xmax/2, ymin, 0);
		pivot2.position.set(xmax/2, 0+16, 0);
		pivot3.position.set(0-16, ymax-2-9, 0);
		pivot4.position.set(xmin/2, 0-16, 0);
		pivot5.position.set(0, ymin, 0);
		base.position.set(0, 0, 0);

		this._pivot1 = pivot1;
		this._pivot2 = pivot2;
		this._pivot3 = pivot3;
		this._pivot4 = pivot4;
		this._pivot5 = pivot5;
		this._base = base;
	}

	_updateScene() {
		scene.remove(this._obj);
		scene.remove(this._staticPt);

		// need to first center the geometry
		this.translateGeometryStrip();
		this.addMotor();
		this._joint5.add(this._staticScene);
		this._link4Scene.add(this._joint5);
		this._joint4.add(this._motor4);
		this._joint4.add(this._link4Scene);
		this._link3Scene.add(this._joint4);
		this._joint3.add(this._link3Scene);
		this._joint3.add(this._motor3);
		this._link2Scene.add(this._joint3);
		this._joint2.add(this._link2Scene);
		this._joint2.add(this._motor2);
		this._link1Scene.add(this._joint2);
		this._joint1.add(this._link1Scene);
		this._joint1.add(this._motor1);
		this._base.add(this._joint1);

		// this.rotateR(this._base, this._initialR);
		this._base.position.copy(this._bboxCenter);

		scene.add(this._base);
	}

	translateGeometryStrip() {
		var pivot1 = this._pivot1;
		var pivot2 = this._pivot2;
		var pivot3 = this._pivot3;
		var pivot4 = this._pivot4;
		var pivot5 = this._pivot5;

		var link1Scene = new THREE.Mesh(this._link1.geometry.clone(), MATERIALNORMAL);
		var link2Scene = new THREE.Mesh(this._link2.geometry.clone(), MATERIALGREEN);
		var link3Scene = new THREE.Mesh(this._link3.geometry.clone(), MATERIALNORMAL);
		var link4Scene = new THREE.Mesh(this._link4.geometry.clone(), MATERIALGREEN);

		var staticScene = new THREE.Mesh(this._staticPt.geometry.clone(), MATERIALOBSTACLE);
		this._staticPt.geometry.computeBoundingBox();

		link1Scene.geometry.translate(-pivot1.position.x, -pivot1.position.y, -pivot1.position.z);
		link2Scene.geometry.translate(-pivot2.position.x, -pivot2.position.y, -pivot2.position.z);
		link3Scene.geometry.translate(-pivot3.position.x, -pivot3.position.y, -pivot3.position.z);
		link4Scene.geometry.translate(-pivot4.position.x, -pivot4.position.y, -pivot4.position.z);

		// var bboxParams = getBoundingBoxEverything(link4Scene);
		staticScene.geometry.translate(-pivot5.position.x, -pivot5.position.y-this._bboxCenter.y, -pivot5.position.z);

		this._link1Scene = link1Scene;
		this._link2Scene = link2Scene;
		this._link3Scene = link3Scene;
		this._link4Scene = link4Scene;
		this._staticScene = staticScene;

		var joint1 = new THREE.Group();
		var joint2 = new THREE.Group();
		var joint3 = new THREE.Group();
		var joint4 = new THREE.Group();
		var joint5 = new THREE.Group();

		joint1.position.copy(pivot1.position.clone());
		joint2.position.copy(pivot2.position.clone().sub(pivot1.position));
		joint3.position.copy(pivot3.position.clone().sub(pivot2.position));
		joint4.position.copy(pivot4.position.clone().sub(pivot3.position));
		joint5.position.copy(pivot5.position.clone().sub(pivot4.position));

		this._joint1 = joint1;
		this._joint2 = joint2;
		this._joint3 = joint3;
		this._joint4 = joint4;
		this._joint5 = joint5;

	}

	addMotor() {
		var motor1 = new THREE.Mesh(this._motor.geometry.clone(), MATERIALOBSTACLE);
		var motor2 = new THREE.Mesh(this._motor.geometry.clone(), MATERIALOBSTACLE);
		var motor3 = new THREE.Mesh(this._motor.geometry.clone(), MATERIALOBSTACLE);
		var motor4 = new THREE.Mesh(this._motor.geometry.clone(), MATERIALOBSTACLE);

		switch (this._jtType) {
			case 1:
				motor1.geometry.translate(0, -9, 0);
				break;
			case 2:
				motor1.geometry.rotateY(Math.PI/2);
				motor1.geometry.translate(0, -9, 0);
				break;
			case 3:
				// motor1.geometry.rotateZ(Math.PI/2);
				motor1.geometry.rotateX(Math.PI/2);
				motor1.geometry.translate(0, 12, -9);
				break;
		}
		motor2.geometry.rotateZ(Math.PI);
		motor2.geometry.translate(0, 9, 0);
		motor3.geometry.translate(0, -9, 0);
		motor4.geometry.translate(0, -9, 0);
		// motor1.position.copy(this._joint1.position);
		// motor2.position.copy(this._joint2.position);
		// motor3.position.copy(this._joint3.position);
		// motor4.position.copy(this._joint4.position);


		this._motor1 = motor1;
		this._motor2 = motor2;
		this._motor3 = motor3;
		this._motor4 = motor4;


	}

	_animate(target_q, q0) {
		var firstIndex;
		var joint2ang = target_q[3] - q0[3];
		var joint3ang = target_q[4] - q0[4];
		var joint4ang = target_q[5] - q0[5];
		switch (this._jtType){
			case 1:
				firstIndex = 2;
				var joint1ang = target_q[firstIndex] - q0[firstIndex];
				this._joint1.rotation.z += joint1ang;
				break;
			case 2:
				firstIndex = 1;
				var joint1ang = target_q[firstIndex] - q0[firstIndex];
				this._joint1.rotation.x += joint1ang;
				break;
			case 3:
				firstIndex = 0;
				var joint1ang = target_q[firstIndex] - q0[firstIndex];
				this._joint1.rotation.y += joint1ang;
				break;
		}
		
		this._joint2.rotation.z += joint2ang;
		this._joint3.rotation.z += joint3ang;
		this._joint4.rotation.z += joint4ang;


	}

	_generateParts() {
		this._link1STL = this._linkJoint1(this._link1, this._pivot1, this._pivot2, this._jtType);
		this._link2STL = this._linkJoint2(this._link2, this._pivot2, this._pivot3);
		this._link3STL = this._linkJoint3(this._link3, this._pivot3, this._pivot4);
		this._link4STL = this._linkJoint4(this._link4, this._pivot4);

		scene.add(this._link1STL);
		scene.add(this._link2STL);
		scene.add(this._link3STL);
		scene.add(this._link4STL);
	}

	_linkJoint1(link, pivot, pivot_next, jtType) {
		// first Step: add motor shell
		var LINK = link;
		var bboxParams = getBoundingBoxEverything(link);
		var xmin = bboxParams.cmin.x;
		var xmax = bboxParams.cmax.x;
		var ymin = bboxParams.cmin.y;
		var ymax = bboxParams.cmax.y;
		var zmin = bboxParams.cmin.z;
		var zmax = bboxParams.cmax.z;

		var pvtX = pivot.position.x;
		var pvtY = pivot.position.y;
		var pvtZ = pivot.position.z;

		switch(jtType) {
			case 1:
				var motorShell = ljhBoxMeshFromPoints(pvtX-14, pvtX+14, pvtY-9, pvtY+29, pvtZ-12, pvtZ+12);
				LINK = booleanGeo(LINK, motorShell, UNION);

				// sceond step: subtract motor
				var motor = ljhBoxMeshFromPoints(pvtX-12, pvtX+12, Math.min(ymin, pvtY-9), pvtY+27, pvtZ-12-5, pvtZ+15+5);
				LINK = booleanGeo(LINK, motor, SUBTRACT);

				// add holes for motor rivets
				var hole1 = ljhCylinderMeshX(pvtY, pvtZ+6, pvtX+12, xmax > (pvtX+14) ? xmax : (pvtX+14), 2.2);
				var hole2 = ljhCylinderMeshX(pvtY+18, pvtZ+6, pvtX+12, xmax > (pvtX+14) ? xmax : (pvtX+14), 2.2);
				var hole3 = ljhCylinderMeshX(pvtY+18, pvtZ-6, pvtX+12, xmax > (pvtX+14) ? xmax : (pvtX+14), 2.2);
				var hole4 = ljhCylinderMeshX(pvtY, pvtZ-6, pvtX+12, xmax > (pvtX+14) ? xmax : (pvtX+14), 2.2);
				var hole5 = ljhCylinderMeshX(pvtY, pvtZ+6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-12, 2.2);
				var hole6 = ljhCylinderMeshX(pvtY+18, pvtZ+6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-12, 2.2);
				var hole7 = ljhCylinderMeshX(pvtY+18, pvtZ-6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-12, 2.2);
				var hole8 = ljhCylinderMeshX(pvtY, pvtZ-6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-12, 2.2);

				var stair1 = ljhCylinderMeshX(pvtY, pvtZ+6, pvtX+14, xmax > (pvtX+14) ? xmax : (pvtX+14), 3);
				var stair2 = ljhCylinderMeshX(pvtY+18, pvtZ+6, pvtX+14, xmax > (pvtX+14) ? xmax : (pvtX+14), 3);
				var stair3 = ljhCylinderMeshX(pvtY+18, pvtZ-6, pvtX+14, xmax > (pvtX+14) ? xmax : (pvtX+14), 3);
				var stair4 = ljhCylinderMeshX(pvtY, pvtZ-6, pvtX+14, xmax > (pvtX+14) ? xmax : (pvtX+14), 3);
				var stair5 = ljhCylinderMeshX(pvtY, pvtZ+6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-14, 3);
				var stair6 = ljhCylinderMeshX(pvtY+18, pvtZ+6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-14, 3);
				var stair7 = ljhCylinderMeshX(pvtY+18, pvtZ-6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-14, 3);
				var stair8 = ljhCylinderMeshX(pvtY, pvtZ-6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-14, 3);

				var hole = booleanGeo(hole1, hole2, UNION);
				hole = booleanGeo(hole, hole3, UNION);
				hole = booleanGeo(hole, hole4, UNION);
				hole = booleanGeo(hole, hole5, UNION);
				hole = booleanGeo(hole, hole6, UNION);
				hole = booleanGeo(hole, hole7, UNION);
				hole = booleanGeo(hole, hole8, UNION);
				hole = booleanGeo(hole, stair1, UNION);
				hole = booleanGeo(hole, stair2, UNION);
				hole = booleanGeo(hole, stair3, UNION);
				hole = booleanGeo(hole, stair4, UNION);
				hole = booleanGeo(hole, stair5, UNION);
				hole = booleanGeo(hole, stair6, UNION);
				hole = booleanGeo(hole, stair7, UNION);
				hole = booleanGeo(hole, stair8, UNION);

				LINK = booleanGeo(LINK, hole, SUBTRACT);
				break;
			case 2:
				var motorShell = ljhBoxMeshFromPoints(pvtX-12, pvtX+12, pvtY-9, pvtY+29, pvtZ-14, pvtZ+14);
				LINK = booleanGeo(LINK, motorShell, UNION);

				var motor = ljhBoxMeshFromPoints(pvtX-12, pvtX+12, pvtY-9, pvtY+27, pvtZ-12, pvtZ+12);
				LINK = booleanGeo(LINK, motor, SUBTRACT);

				// add holes for motor rivets
				var hole1 = ljhCylinderMeshFromPoint(pvtX+9, pvtY, pvtZ+12, zmax > (pvtZ+14) ? zmax : (pvtZ+14), 2.2);
				var hole2 = ljhCylinderMeshFromPoint(pvtX-9, pvtY, pvtZ+12, zmax > (pvtZ+14) ? zmax : (pvtZ+14), 2.2);
				var hole3 = ljhCylinderMeshFromPoint(pvtX+9, pvtY+18, pvtZ+12, zmax > (pvtZ+14) ? zmax : (pvtZ+14), 2.2);
				var hole4 = ljhCylinderMeshFromPoint(pvtX-9, pvtY+18, pvtZ+12, zmax > (pvtZ+14) ? zmax : (pvtZ+14), 2.2);
				var hole5 = ljhCylinderMeshFromPoint(pvtX+9, pvtY, pvtZ+12, zmin > (pvtZ-14) ? zmin : (pvtZ-14), 2.2);
				var hole6 = ljhCylinderMeshFromPoint(pvtX-9, pvtY, pvtZ+12, zmin > (pvtZ-14) ? zmin : (pvtZ-14), 2.2);
				var hole7 = ljhCylinderMeshFromPoint(pvtX+9, pvtY+18, pvtZ+12, zmin > (pvtZ-14) ? zmin : (pvtZ-14), 2.2);
				var hole8 = ljhCylinderMeshFromPoint(pvtX-9, pvtY+18, pvtZ+12, zmin > (pvtZ-14) ? zmin : (pvtZ-14), 2.2);

				var stair1 = ljhCylinderMeshFromPoint(pvtX+9, pvtY, pvtZ+14, zmax > (pvtZ+14) ? zmax : (pvtZ+14), 3);
				var stair2 = ljhCylinderMeshFromPoint(pvtX-9, pvtY, pvtZ+14, zmax > (pvtZ+14) ? zmax : (pvtZ+14), 3);
				var stair3 = ljhCylinderMeshFromPoint(pvtX+9, pvtY+18, pvtZ+14, zmax > (pvtZ+14) ? zmax : (pvtZ+14), 3);
				var stair4 = ljhCylinderMeshFromPoint(pvtX-9, pvtY+18, pvtZ+14, zmax > (pvtZ+14) ? zmax : (pvtZ+14), 3);
				var stair5 = ljhCylinderMeshFromPoint(pvtX+9, pvtY, pvtZ-14, zmin > (pvtZ-14) ? zmin : (pvtZ-14), 3);
				var stair6 = ljhCylinderMeshFromPoint(pvtX-9, pvtY, pvtZ-14, zmin > (pvtZ-14) ? zmin : (pvtZ-14), 3);
				var stair7 = ljhCylinderMeshFromPoint(pvtX+9, pvtY+18, pvtZ-14, zmin > (pvtZ-14) ? zmin : (pvtZ-14), 3);
				var stair8 = ljhCylinderMeshFromPoint(pvtX-9, pvtY+18, pvtZ-14, zmin > (pvtZ-14) ? zmin : (pvtZ-14), 3);

				var hole = booleanGeo(hole1, hole2, UNION);
				hole = booleanGeo(hole, hole3, UNION);
				hole = booleanGeo(hole, hole4, UNION);
				hole = booleanGeo(hole, hole5, UNION);
				hole = booleanGeo(hole, hole6, UNION);
				hole = booleanGeo(hole, hole7, UNION);
				hole = booleanGeo(hole, hole8, UNION);
				hole = booleanGeo(hole, stair1, UNION);
				hole = booleanGeo(hole, stair2, UNION);
				hole = booleanGeo(hole, stair3, UNION);
				hole = booleanGeo(hole, stair4, UNION);
				hole = booleanGeo(hole, stair5, UNION);
				hole = booleanGeo(hole, stair6, UNION);
				hole = booleanGeo(hole, stair7, UNION);
				hole = booleanGeo(hole, stair8, UNION);

				LINK = booleanGeo(LINK, hole, SUBTRACT);
				break;
			case 3:

				pvtY += 12;
				var motorShell = ljhBoxMeshFromPoints(pvtX-12, pvtX+12, pvtY-12, pvtY+14, pvtZ-29, pvtZ+11);
				LINK = booleanGeo(LINK, motorShell, UNION);

				// sceond step: subtract motor
				var motor = ljhBoxMeshFromPoints(pvtX-12, pvtX+12, pvtY-12, pvtY+12, pvtZ-27, pvtZ+9);
				LINK = booleanGeo(LINK, motor, SUBTRACT);

				// add holes for motor rivets
				var hole1 = ljhCylinderMeshX(pvtY+6, pvtZ, pvtX+12, pvtX+14, 2.2);
				var hole2 = ljhCylinderMeshX(pvtY+6, pvtZ-18, pvtX+12, pvtX+14, 2.2);
				var hole3 = ljhCylinderMeshX(pvtY-6, pvtZ, pvtX+12, pvtX+14, 2.2);
				var hole4 = ljhCylinderMeshX(pvtY-6, pvtZ-18, pvtX+12, pvtX+14, 2.2);
				var hole5 = ljhCylinderMeshX(pvtY+6, pvtZ, pvtX-14, pvtX-12, 2.2);
				var hole6 = ljhCylinderMeshX(pvtY+6, pvtZ-18, pvtX-14, pvtX-12, 2.2);
				var hole7 = ljhCylinderMeshX(pvtY-6, pvtZ, pvtX-14, pvtX-12, 2.2);
				var hole8 = ljhCylinderMeshX(pvtY-6, pvtZ-18, pvtX-14, pvtX-12, 2.2);

				var stair1 = ljhCylinderMeshX(pvtY+6, pvtZ, pvtX+14, Math.max(xmax, pvtX+14), 3);
				var stair2 = ljhCylinderMeshX(pvtY+6, pvtZ-18, pvtX+14, Math.max(xmax, pvtX+14), 3);
				var stair3 = ljhCylinderMeshX(pvtY-6, pvtZ, pvtX+14, Math.max(xmax, pvtX+14), 3);
				var stair4 = ljhCylinderMeshX(pvtY-6, pvtZ-18, pvtX+14, Math.max(xmax, pvtX+14), 3);
				var stair5 = ljhCylinderMeshX(pvtY+6, pvtZ, Math.min(xmin, pvtX-14), pvtX-14, 3);
				var stair6 = ljhCylinderMeshX(pvtY+6, pvtZ-18, Math.min(xmin, pvtX-14), pvtX-14, 3);
				var stair7 = ljhCylinderMeshX(pvtY-6, pvtZ, Math.min(xmin, pvtX-14), pvtX-14, 3);
				var stair8 = ljhCylinderMeshX(pvtY-6, pvtZ-18, Math.min(xmin, pvtX-14), pvtX-14, 3);

				var hole = booleanGeo(hole1, hole2, UNION);
				hole = booleanGeo(hole, hole3, UNION);
				hole = booleanGeo(hole, hole4, UNION);
				hole = booleanGeo(hole, hole5, UNION);
				hole = booleanGeo(hole, hole6, UNION);
				hole = booleanGeo(hole, hole7, UNION);
				hole = booleanGeo(hole, hole8, UNION);
				hole = booleanGeo(hole, stair1, UNION);
				hole = booleanGeo(hole, stair2, UNION);
				hole = booleanGeo(hole, stair3, UNION);
				hole = booleanGeo(hole, stair4, UNION);
				hole = booleanGeo(hole, stair5, UNION);
				hole = booleanGeo(hole, stair6, UNION);
				hole = booleanGeo(hole, stair7, UNION);
				hole = booleanGeo(hole, stair8, UNION);

				LINK = booleanGeo(LINK, hole, SUBTRACT);
				break;
		}

		// fifth step: add joint for the next link
		if (pivot_next != undefined) {
			var pvtX2 = pivot_next.position.x;
			var pvtY2 = pivot_next.position.y;
			var pvtZ2 = pivot_next.position.z;

			var jtPrismActive = ljhBoxMeshFromPoints(pvtX2-9, pvtX2+9, ymax, pvtY2, pvtZ2+15.5, pvtZ2+15.5+3);
			var jtPrismPassive = ljhBoxMeshFromPoints(pvtX2-9, pvtX2+9, ymax, pvtY2, pvtZ2-12.5-3, pvtZ2-12.5);
			var jtCylinderActive = ljhCylinderMeshFromPoint(pvtX2, pvtY2, pvtZ2+15.5, pvtZ2+15.5+3, 9);
			var jtCylinderPassive = ljhCylinderMeshFromPoint(pvtX2, pvtY2, pvtZ2-12.5-3, pvtZ2-12.5, 9);

			var jtActive = booleanGeo(jtPrismActive, jtCylinderActive, UNION);
			var jtPassive = booleanGeo(jtPrismPassive, jtCylinderPassive, UNION);
			LINK = booleanGeo(LINK, jtActive, UNION);
			LINK = booleanGeo(LINK, jtPassive, UNION);

			// add hole for screws
			var midHole = ljhCylinderMeshFromPoint(pvtX2, pvtY2, zmin, zmax, 1.4);
			var holeStair1 = ljhCylinderMeshFromPoint(pvtX2, pvtY2, pvtZ2+15.5+1.5, zmax, 3);
			var holeStair2 = ljhCylinderMeshFromPoint(pvtX2, pvtY2, zmin, pvtZ2-12.5-1.5, 3);
			LINK = booleanGeo(LINK, midHole, SUBTRACT);
			LINK = booleanGeo(LINK, holeStair1, SUBTRACT);
			LINK = booleanGeo(LINK, holeStair2, SUBTRACT);

			// add pin for fastening
			var pin1 = ljhCylinderMeshFromPoint(pvtX2, pvtY2+6, pvtZ2+15.5-1.5, pvtZ2+15.5, 1.75);
			var pin2 = ljhCylinderMeshFromPoint(pvtX2-6, pvtY2, pvtZ2+15.5-1.5, pvtZ2+15.5, 1.75);
			var pin3 = ljhCylinderMeshFromPoint(pvtX2, pvtY2-6, pvtZ2+15.5-1.5, pvtZ2+15.5, 1.75);
			var pin4 = ljhCylinderMeshFromPoint(pvtX2+6, pvtY2, pvtZ2+15.5-1.5, pvtZ2+15.5, 1.75);

			LINK = booleanGeo(LINK, pin1, UNION);
			LINK = booleanGeo(LINK, pin2, UNION);
			LINK = booleanGeo(LINK, pin3, UNION);
			LINK = booleanGeo(LINK, pin4, UNION);
		}

		return new THREE.Mesh(LINK, MATERIALNORMAL);
	}

	_linkJoint2(link, pivot, pivot_next) {
		// first Step: add motor shell
		var LINK = link;
		var bboxParams = getBoundingBoxEverything(link);
		var xmin = bboxParams.cmin.x;
		var xmax = bboxParams.cmax.x;
		var ymin = bboxParams.cmin.y;
		var ymax = bboxParams.cmax.y;
		var zmin = bboxParams.cmin.z;
		var zmax = bboxParams.cmax.z;

		var pvtX = pivot.position.x;
		var pvtY = pivot.position.y;
		var pvtZ = pivot.position.z;

		var motorShell = ljhBoxMeshFromPoints(pvtX-14, pvtX+14, pvtY-9, pvtY+29, pvtZ-12, pvtZ+12);
		LINK = booleanGeo(LINK, motorShell, UNION);

		// sceond step: subtract motor
		var motor = ljhBoxMeshFromPoints(pvtX-12, pvtX+12, pvtY-9, pvtY+27, pvtZ-12-5, pvtZ+15+5);
		LINK = booleanGeo(LINK, motor, SUBTRACT);

		// third step: round corner
		var prismLarge = ljhBoxMeshFromPoints(xmin, xmax, ymin, pvtY, zmin, zmax);
		var cylinder = ljhCylinderMeshFromPoint(pvtX, pvtY, zmin, zmax, pvtY-ymin);
		var cutShape = booleanGeo(prismLarge, cylinder, SUBTRACT);
		LINK = booleanGeo(LINK, cutShape, SUBTRACT);

		// forth step: add space for joint to move
		var prismActive = ljhBoxMeshFromPoints(xmin, xmax, ymin, pvtY*2-ymin, pvtZ+15, pvtZ+15+5);
		var prismPassive = ljhBoxMeshFromPoints(xmin, xmax,  ymin, pvtY*2-ymin, pvtZ-12-5, pvtZ-12);
		LINK = booleanGeo(LINK, prismActive, SUBTRACT);
		LINK = booleanGeo(LINK, prismPassive, SUBTRACT);

		// fifth step: add joint for the next link
		if (pivot_next != undefined) {
			var pvtX2 = pivot_next.position.x;
			var pvtY2 = pivot_next.position.y;
			var pvtZ2 = pivot_next.position.z;

			var jtPrismActive = ljhBoxMeshFromPoints(pvtX2, xmin, pvtY2-9, pvtY2+9, pvtZ2+15.5, pvtZ2+15.5+3);
			var jtPrismPassive = ljhBoxMeshFromPoints(pvtX2, xmin, pvtY2-9, pvtY2+9, pvtZ2-12.5-3, pvtZ2-12.5);
			var jtCylinderActive = ljhCylinderMeshFromPoint(pvtX2, pvtY2, pvtZ2+15.5, pvtZ2+15.5+3, 9);
			var jtCylinderPassive = ljhCylinderMeshFromPoint(pvtX2, pvtY2, pvtZ2-12.5-3, pvtZ2-12.5, 9);

			var jtActive = booleanGeo(jtPrismActive, jtCylinderActive, UNION);
			var jtPassive = booleanGeo(jtPrismPassive, jtCylinderPassive, UNION);
			LINK = booleanGeo(LINK, jtActive, UNION);
			LINK = booleanGeo(LINK, jtPassive, UNION);

			// add hole for screws
			var midHole = ljhCylinderMeshFromPoint(pvtX2, pvtY2, zmin, zmax, 1.4);
			var holeStair1 = ljhCylinderMeshFromPoint(pvtX2, pvtY2, pvtZ2+15.5+1.5, zmax, 3);
			var holeStair2 = ljhCylinderMeshFromPoint(pvtX2, pvtY2, zmin, pvtZ2-12.5-1.5, 3);
			LINK = booleanGeo(LINK, midHole, SUBTRACT);
			LINK = booleanGeo(LINK, holeStair1, SUBTRACT);
			LINK = booleanGeo(LINK, holeStair2, SUBTRACT);

			// add pin for fastening
			var pin1 = ljhCylinderMeshFromPoint(pvtX2, pvtY2+6, pvtZ2+15.5-1.5, pvtZ2+15.5, 1.75);
			var pin2 = ljhCylinderMeshFromPoint(pvtX2-6, pvtY2, pvtZ2+15.5-1.5, pvtZ2+15.5, 1.75);
			var pin3 = ljhCylinderMeshFromPoint(pvtX2, pvtY2-6, pvtZ2+15.5-1.5, pvtZ2+15.5, 1.75);
			var pin4 = ljhCylinderMeshFromPoint(pvtX2+6, pvtY2, pvtZ2+15.5-1.5, pvtZ2+15.5, 1.75);

			LINK = booleanGeo(LINK, pin1, UNION);
			LINK = booleanGeo(LINK, pin2, UNION);
			LINK = booleanGeo(LINK, pin3, UNION);
			LINK = booleanGeo(LINK, pin4, UNION);
		}

		// add holes for screwdrivers
		var cylScrewdriver = ljhCylinderMeshFromPoint(pvtX, pvtY, zmin<(pvtZ-14)?zmin:(pvtZ-14), zmax>(pvtZ+14)?zmax:(pvtZ+14), 5);
		LINK = booleanGeo(LINK, cylScrewdriver, SUBTRACT);
		
		// add holes for motor rivets
		var hole1 = ljhCylinderMeshX(pvtY, pvtZ+6, pvtX+12, xmax > (pvtX+14) ? xmax : (pvtX+14), 2.2);
		var hole2 = ljhCylinderMeshX(pvtY+18, pvtZ+6, pvtX+12, xmax > (pvtX+14) ? xmax : (pvtX+14), 2.2);
		var hole3 = ljhCylinderMeshX(pvtY+18, pvtZ-6, pvtX+12, xmax > (pvtX+14) ? xmax : (pvtX+14), 2.2);
		var hole4 = ljhCylinderMeshX(pvtY, pvtZ-6, pvtX+12, xmax > (pvtX+14) ? xmax : (pvtX+14), 2.2);
		var hole5 = ljhCylinderMeshX(pvtY, pvtZ+6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-12, 2.2);
		var hole6 = ljhCylinderMeshX(pvtY+18, pvtZ+6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-12, 2.2);
		var hole7 = ljhCylinderMeshX(pvtY+18, pvtZ-6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-12, 2.2);
		var hole8 = ljhCylinderMeshX(pvtY, pvtZ-6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-12, 2.2);

		var stair1 = ljhCylinderMeshX(pvtY, pvtZ+6, pvtX+14, xmax > (pvtX+14) ? xmax : (pvtX+14), 3);
		var stair2 = ljhCylinderMeshX(pvtY+18, pvtZ+6, pvtX+14, xmax > (pvtX+14) ? xmax : (pvtX+14), 3);
		var stair3 = ljhCylinderMeshX(pvtY+18, pvtZ-6, pvtX+14, xmax > (pvtX+14) ? xmax : (pvtX+14), 3);
		var stair4 = ljhCylinderMeshX(pvtY, pvtZ-6, pvtX+14, xmax > (pvtX+14) ? xmax : (pvtX+14), 3);
		var stair5 = ljhCylinderMeshX(pvtY, pvtZ+6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-14, 3);
		var stair6 = ljhCylinderMeshX(pvtY+18, pvtZ+6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-14, 3);
		var stair7 = ljhCylinderMeshX(pvtY+18, pvtZ-6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-14, 3);
		var stair8 = ljhCylinderMeshX(pvtY, pvtZ-6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-14, 3);

		var hole = booleanGeo(hole1, hole2, UNION);
		hole = booleanGeo(hole, hole3, UNION);
		hole = booleanGeo(hole, hole4, UNION);
		hole = booleanGeo(hole, hole5, UNION);
		hole = booleanGeo(hole, hole6, UNION);
		hole = booleanGeo(hole, hole7, UNION);
		hole = booleanGeo(hole, hole8, UNION);
		hole = booleanGeo(hole, stair1, UNION);
		hole = booleanGeo(hole, stair2, UNION);
		hole = booleanGeo(hole, stair3, UNION);
		hole = booleanGeo(hole, stair4, UNION);
		hole = booleanGeo(hole, stair5, UNION);
		hole = booleanGeo(hole, stair6, UNION);
		hole = booleanGeo(hole, stair7, UNION);
		hole = booleanGeo(hole, stair8, UNION);

		LINK = booleanGeo(LINK, hole, SUBTRACT);

		
		return new THREE.Mesh(LINK, MATERIALNORMAL);
	}

	_linkJoint3(link, pivot, pivot_next) {
		// first Step: add motor shell
		var LINK = link;
		var bboxParams = getBoundingBoxEverything(link);
		var xmin = bboxParams.cmin.x;
		var xmax = bboxParams.cmax.x;
		var ymin = bboxParams.cmin.y;
		var ymax = bboxParams.cmax.y;
		var zmin = bboxParams.cmin.z;
		var zmax = bboxParams.cmax.z;

		var pvtX = pivot.position.x;
		var pvtY = pivot.position.y;
		var pvtZ = pivot.position.z;

		ymax = ymax > pvtY ? ymax : (pvtY+15);

		var motorShell = ljhBoxMeshFromPoints(pvtX-14, pvtX+14, pvtY-29, pvtY+9, pvtZ-12, pvtZ+12);
		LINK = booleanGeo(LINK, motorShell, UNION);

		// sceond step: subtract motor
		var motor = ljhBoxMeshFromPoints(pvtX-12, pvtX+12, pvtY-27, Math.max(pvtY+9, ymax), pvtZ-12-5, pvtZ+15+5);
		LINK = booleanGeo(LINK, motor, SUBTRACT);

		// third step: round corner
		var prismLarge = ljhBoxMeshFromPoints(xmin, xmax, pvtY, ymax>pvtY?ymax:(pvtY+15), zmin, zmax);
		var cylinder = ljhCylinderMeshFromPoint(pvtX, pvtY, zmin, zmax, xmax-pvtX);
		var cutShape = booleanGeo(prismLarge, cylinder, SUBTRACT);
		LINK = booleanGeo(LINK, cutShape, SUBTRACT);

		// forth step: add space for joint to move
		var prismActive = ljhBoxMeshFromPoints(xmin, xmax, pvtY*2-ymax, ymax, pvtZ+15, pvtZ+15+5);
		var prismPassive = ljhBoxMeshFromPoints(xmin, xmax, pvtY*2-ymax, ymax, pvtZ-12-5, pvtZ-12);
		LINK = booleanGeo(LINK, prismActive, SUBTRACT);
		LINK = booleanGeo(LINK, prismPassive, SUBTRACT);

		// fifth step: add joint for the next link
		if (pivot_next != undefined) {
			var pvtX2 = pivot_next.position.x;
			var pvtY2 = pivot_next.position.y;
			var pvtZ2 = pivot_next.position.z;

			var jtPrismActive = ljhBoxMeshFromPoints(pvtX2-9, pvtX2+9, pvtY2, ymin, pvtZ2+15.5, pvtZ2+15.5+3);
			var jtPrismPassive = ljhBoxMeshFromPoints(pvtX2-9, pvtX2+9, pvtY2, ymin, pvtZ2-12.5-3, pvtZ2-12.5);
			var jtCylinderActive = ljhCylinderMeshFromPoint(pvtX2, pvtY2, pvtZ2+15.5, pvtZ2+15.5+3, 9);
			var jtCylinderPassive = ljhCylinderMeshFromPoint(pvtX2, pvtY2, pvtZ2-12.5-3, pvtZ2-12.5, 9);

			var jtActive = booleanGeo(jtPrismActive, jtCylinderActive, UNION);
			var jtPassive = booleanGeo(jtPrismPassive, jtCylinderPassive, UNION);
			LINK = booleanGeo(LINK, jtActive, UNION);
			LINK = booleanGeo(LINK, jtPassive, UNION);

			// add hole for screws
			var midHole = ljhCylinderMeshFromPoint(pvtX2, pvtY2, zmin, zmax, 1.4);
			var holeStair1 = ljhCylinderMeshFromPoint(pvtX2, pvtY2, pvtZ2+15.5+1.5, zmax, 3);
			var holeStair2 = ljhCylinderMeshFromPoint(pvtX2, pvtY2, zmin, pvtZ2-12.5-1.5, 3);
			LINK = booleanGeo(LINK, midHole, SUBTRACT);
			LINK = booleanGeo(LINK, holeStair1, SUBTRACT);
			LINK = booleanGeo(LINK, holeStair2, SUBTRACT);

			// add pin for fastening
			var pin1 = ljhCylinderMeshFromPoint(pvtX2, pvtY2+6, pvtZ2+15.5-1.5, pvtZ2+15.5, 1.75);
			var pin2 = ljhCylinderMeshFromPoint(pvtX2-6, pvtY2, pvtZ2+15.5-1.5, pvtZ2+15.5, 1.75);
			var pin3 = ljhCylinderMeshFromPoint(pvtX2, pvtY2-6, pvtZ2+15.5-1.5, pvtZ2+15.5, 1.75);
			var pin4 = ljhCylinderMeshFromPoint(pvtX2+6, pvtY2, pvtZ2+15.5-1.5, pvtZ2+15.5, 1.75);

			LINK = booleanGeo(LINK, pin1, UNION);
			LINK = booleanGeo(LINK, pin2, UNION);
			LINK = booleanGeo(LINK, pin3, UNION);
			LINK = booleanGeo(LINK, pin4, UNION);
		}

		// add holes for screwdrivers
		var cylScrewdriver = ljhCylinderMeshFromPoint(pvtX, pvtY, zmin<(pvtZ-14)?zmin:(pvtZ-14), zmax>(pvtZ+14)?zmax:(pvtZ+14), 5);
		LINK = booleanGeo(LINK, cylScrewdriver, SUBTRACT);
		
		// add holes for motor rivets
		var hole1 = ljhCylinderMeshX(pvtY, pvtZ+6, pvtX+12, xmax > (pvtX+14) ? xmax : (pvtX+14), 2.2);
		var hole2 = ljhCylinderMeshX(pvtY-18, pvtZ+6, pvtX+12, xmax > (pvtX+14) ? xmax : (pvtX+14), 2.2);
		var hole3 = ljhCylinderMeshX(pvtY-18, pvtZ-6, pvtX+12, xmax > (pvtX+14) ? xmax : (pvtX+14), 2.2);
		var hole4 = ljhCylinderMeshX(pvtY, pvtZ-6, pvtX+12, xmax > (pvtX+14) ? xmax : (pvtX+14), 2.2);
		var hole5 = ljhCylinderMeshX(pvtY, pvtZ+6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-12, 2.2);
		var hole6 = ljhCylinderMeshX(pvtY-18, pvtZ+6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-12, 2.2);
		var hole7 = ljhCylinderMeshX(pvtY-18, pvtZ-6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-12, 2.2);
		var hole8 = ljhCylinderMeshX(pvtY, pvtZ-6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-12, 2.2);

		var stair1 = ljhCylinderMeshX(pvtY, pvtZ+6, pvtX+14, xmax > (pvtX+14) ? xmax : (pvtX+14), 3);
		var stair2 = ljhCylinderMeshX(pvtY-18, pvtZ+6, pvtX+14, xmax > (pvtX+14) ? xmax : (pvtX+14), 3);
		var stair3 = ljhCylinderMeshX(pvtY-18, pvtZ-6, pvtX+14, xmax > (pvtX+14) ? xmax : (pvtX+14), 3);
		var stair4 = ljhCylinderMeshX(pvtY, pvtZ-6, pvtX+14, xmax > (pvtX+14) ? xmax : (pvtX+14), 3);
		var stair5 = ljhCylinderMeshX(pvtY, pvtZ+6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-14, 3);
		var stair6 = ljhCylinderMeshX(pvtY-18, pvtZ+6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-14, 3);
		var stair7 = ljhCylinderMeshX(pvtY-18, pvtZ-6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-14, 3);
		var stair8 = ljhCylinderMeshX(pvtY, pvtZ-6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-14, 3);

		var hole = booleanGeo(hole1, hole2, UNION);
		hole = booleanGeo(hole, hole3, UNION);
		hole = booleanGeo(hole, hole4, UNION);
		hole = booleanGeo(hole, hole5, UNION);
		hole = booleanGeo(hole, hole6, UNION);
		hole = booleanGeo(hole, hole7, UNION);
		hole = booleanGeo(hole, hole8, UNION);
		hole = booleanGeo(hole, stair1, UNION);
		hole = booleanGeo(hole, stair2, UNION);
		hole = booleanGeo(hole, stair3, UNION);
		hole = booleanGeo(hole, stair4, UNION);
		hole = booleanGeo(hole, stair5, UNION);
		hole = booleanGeo(hole, stair6, UNION);
		hole = booleanGeo(hole, stair7, UNION);
		hole = booleanGeo(hole, stair8, UNION);

		LINK = booleanGeo(LINK, hole, SUBTRACT);

		
		return new THREE.Mesh(LINK, MATERIALNORMAL);

	}

	_linkJoint4(link, pivot, pivot_next) {
		// first Step: add motor shell
		var LINK = link;
		var bboxParams = getBoundingBoxEverything(link);
		var xmin = bboxParams.cmin.x;
		var xmax = bboxParams.cmax.x;
		var ymin = bboxParams.cmin.y;
		var ymax = bboxParams.cmax.y;
		var zmin = bboxParams.cmin.z;
		var zmax = bboxParams.cmax.z;

		var pvtX = pivot.position.x;
		var pvtY = pivot.position.y;
		var pvtZ = pivot.position.z;

		ymax = ymax > pvtY ? ymax : (pvtY+15);

		var motorShell = ljhBoxMeshFromPoints(pvtX-14, pvtX+14, pvtY-29, pvtY+9, pvtZ-12, pvtZ+12);
		LINK = booleanGeo(LINK, motorShell, UNION);

		// sceond step: subtract motor
		var motor = ljhBoxMeshFromPoints(pvtX-12, pvtX+12, pvtY-27, Math.max(pvtY+9, ymax), pvtZ-12-5, pvtZ+15+5);
		LINK = booleanGeo(LINK, motor, SUBTRACT);

		// third step: round corner
		var prismLarge = ljhBoxMeshFromPoints(xmin, xmax, pvtY, ymax>pvtY?ymax:(pvtY+15), zmin, zmax);
		var cylinder = ljhCylinderMeshFromPoint(pvtX, pvtY, zmin, zmax, ymax>pvtY?(ymax-pvtY):17);
		var cutShape = booleanGeo(prismLarge, cylinder, SUBTRACT);
		LINK = booleanGeo(LINK, cutShape, SUBTRACT);

		// forth step: add space for joint to move
		var prismActive = ljhBoxMeshFromPoints(xmin, xmax, pvtY*2-ymax, ymax, pvtZ+15, pvtZ+15+5);
		var prismPassive = ljhBoxMeshFromPoints(xmin, xmax, pvtY*2-ymax, ymax, pvtZ-12-5, pvtZ-12);
		LINK = booleanGeo(LINK, prismActive, SUBTRACT);
		LINK = booleanGeo(LINK, prismPassive, SUBTRACT);

		// fifth step: add joint for the next link
		if (pivot_next != undefined) {
			var pvtX2 = pivot_next.position.x;
			var pvtY2 = pivot_next.position.y;
			var pvtZ2 = pivot_next.position.z;

			var jtPrismActive = ljhBoxMeshFromPoints(pvtX2-9, pvtX2+9, pvtY2, ymin, pvtZ2+15.5, pvtZ2+15.5+3);
			var jtPrismPassive = ljhBoxMeshFromPoints(pvtX2-9, pvtX2+9, pvtY2, ymin, pvtZ2-12.5-3, pvtZ2-12.5);
			var jtCylinderActive = ljhCylinderMeshFromPoint(pvtX2, pvtY2, pvtZ2+15.5, pvtZ2+15.5+3, 9);
			var jtCylinderPassive = ljhCylinderMeshFromPoint(pvtX2, pvtY2, pvtZ2-12.5-3, pvtZ2-12.5, 9);

			var jtActive = booleanGeo(jtPrismActive, jtCylinderActive, UNION);
			var jtPassive = booleanGeo(jtPrismPassive, jtCylinderPassive, UNION);
			LINK = booleanGeo(LINK, jtActive, UNION);
			LINK = booleanGeo(LINK, jtPassive, UNION);

			// add hole for screws
			var midHole = ljhCylinderMeshFromPoint(pvtX2, pvtY2, zmin, zmax, 1.4);
			var holeStair1 = ljhCylinderMeshFromPoint(pvtX2, pvtY2, pvtZ2+15.5+1.5, zmax, 3);
			var holeStair2 = ljhCylinderMeshFromPoint(pvtX2, pvtY2, zmin, pvtZ2-12.5-1.5, 3);
			LINK = booleanGeo(LINK, midHole, SUBTRACT);
			LINK = booleanGeo(LINK, holeStair1, SUBTRACT);
			LINK = booleanGeo(LINK, holeStair2, SUBTRACT);

			// add pin for fastening
			var pin1 = ljhCylinderMeshFromPoint(pvtX2, pvtY2+6, pvtZ2+15.5-1.5, pvtZ2+15.5, 1.75);
			var pin2 = ljhCylinderMeshFromPoint(pvtX2-6, pvtY2, pvtZ2+15.5-1.5, pvtZ2+15.5, 1.75);
			var pin3 = ljhCylinderMeshFromPoint(pvtX2, pvtY2-6, pvtZ2+15.5-1.5, pvtZ2+15.5, 1.75);
			var pin4 = ljhCylinderMeshFromPoint(pvtX2+6, pvtY2, pvtZ2+15.5-1.5, pvtZ2+15.5, 1.75);

			LINK = booleanGeo(LINK, pin1, UNION);
			LINK = booleanGeo(LINK, pin2, UNION);
			LINK = booleanGeo(LINK, pin3, UNION);
			LINK = booleanGeo(LINK, pin4, UNION);
		}

		// add holes for screwdrivers
		var cylScrewdriver = ljhCylinderMeshFromPoint(pvtX, pvtY, zmin<(pvtZ-14)?zmin:(pvtZ-14), zmax>(pvtZ+14)?zmax:(pvtZ+14), 5);
		LINK = booleanGeo(LINK, cylScrewdriver, SUBTRACT);
		
		// add holes for motor rivets
		var hole1 = ljhCylinderMeshX(pvtY, pvtZ+6, pvtX+12, xmax > (pvtX+14) ? xmax : (pvtX+14), 2.2);
		var hole2 = ljhCylinderMeshX(pvtY-18, pvtZ+6, pvtX+12, xmax > (pvtX+14) ? xmax : (pvtX+14), 2.2);
		var hole3 = ljhCylinderMeshX(pvtY-18, pvtZ-6, pvtX+12, xmax > (pvtX+14) ? xmax : (pvtX+14), 2.2);
		var hole4 = ljhCylinderMeshX(pvtY, pvtZ-6, pvtX+12, xmax > (pvtX+14) ? xmax : (pvtX+14), 2.2);
		var hole5 = ljhCylinderMeshX(pvtY, pvtZ+6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-12, 2.2);
		var hole6 = ljhCylinderMeshX(pvtY-18, pvtZ+6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-12, 2.2);
		var hole7 = ljhCylinderMeshX(pvtY-18, pvtZ-6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-12, 2.2);
		var hole8 = ljhCylinderMeshX(pvtY, pvtZ-6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-12, 2.2);

		var stair1 = ljhCylinderMeshX(pvtY, pvtZ+6, pvtX+14, xmax > (pvtX+14) ? xmax : (pvtX+14), 3);
		var stair2 = ljhCylinderMeshX(pvtY-18, pvtZ+6, pvtX+14, xmax > (pvtX+14) ? xmax : (pvtX+14), 3);
		var stair3 = ljhCylinderMeshX(pvtY-18, pvtZ-6, pvtX+14, xmax > (pvtX+14) ? xmax : (pvtX+14), 3);
		var stair4 = ljhCylinderMeshX(pvtY, pvtZ-6, pvtX+14, xmax > (pvtX+14) ? xmax : (pvtX+14), 3);
		var stair5 = ljhCylinderMeshX(pvtY, pvtZ+6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-14, 3);
		var stair6 = ljhCylinderMeshX(pvtY-18, pvtZ+6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-14, 3);
		var stair7 = ljhCylinderMeshX(pvtY-18, pvtZ-6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-14, 3);
		var stair8 = ljhCylinderMeshX(pvtY, pvtZ-6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-14, 3);

		var hole = booleanGeo(hole1, hole2, UNION);
		hole = booleanGeo(hole, hole3, UNION);
		hole = booleanGeo(hole, hole4, UNION);
		hole = booleanGeo(hole, hole5, UNION);
		hole = booleanGeo(hole, hole6, UNION);
		hole = booleanGeo(hole, hole7, UNION);
		hole = booleanGeo(hole, hole8, UNION);
		hole = booleanGeo(hole, stair1, UNION);
		hole = booleanGeo(hole, stair2, UNION);
		hole = booleanGeo(hole, stair3, UNION);
		hole = booleanGeo(hole, stair4, UNION);
		hole = booleanGeo(hole, stair5, UNION);
		hole = booleanGeo(hole, stair6, UNION);
		hole = booleanGeo(hole, stair7, UNION);
		hole = booleanGeo(hole, stair8, UNION);

		LINK = booleanGeo(LINK, hole, SUBTRACT);

		
		return new THREE.Mesh(LINK, MATERIALNORMAL);

	}



}

class ObjStripCAD extends CAD {
	constructor(transPt, workspace) {
		super(transPt, workspace);
		this._staticPt = transPt._staticPt;
		this._generate();
	}

	_generate() {
		this.segmentLinks();
		this.setPivot();
	}

	_updateScene() {
		scene.remove(this._obj);
		scene.remove(this._staticPt);

		// need to first center the geometry
		this.translateGeometryStrip();
		this.addMotor();
		this._joint5.add(this._staticScene);
		this._link4Scene.add(this._joint5);
		this._joint4.add(this._motor4);
		this._joint4.add(this._link4Scene);
		this._link3Scene.add(this._joint4);
		this._joint3.add(this._link3Scene);
		this._joint3.add(this._motor3);
		this._link2Scene.add(this._joint3);
		this._joint2.add(this._link2Scene);
		this._joint2.add(this._motor2);
		this._link1Scene.add(this._joint2);
		this._joint1.add(this._link1Scene);
		this._joint1.add(this._motor1);
		this._base.add(this._joint1);

		// this.rotateR(this._base, this._initialR);
		this._base.position.copy(this._bboxCenter);

		scene.add(this._base);
	}

	addMotor() {
		var motor1 = new THREE.Mesh(this._motor.geometry.clone(), MATERIALOBSTACLE);
		var motor2 = new THREE.Mesh(this._motor.geometry.clone(), MATERIALOBSTACLE);
		var motor3 = new THREE.Mesh(this._motor.geometry.clone(), MATERIALOBSTACLE);
		var motor4 = new THREE.Mesh(this._motor.geometry.clone(), MATERIALOBSTACLE);

		switch (this._jtType) {
			case 1:
				motor1.geometry.translate(0, -9, 0);
				break;
			case 2:
				motor1.geometry.rotateY(Math.PI/2);
				motor1.geometry.translate(0, -9, 0);
				break;
			case 3:
				// motor1.geometry.rotateZ(Math.PI/2);
				motor1.geometry.rotateX(-Math.PI/2);
				motor1.geometry.translate(0, -12, 9);
				break;
		}
		motor2.geometry.translate(0, -9, 0);
		motor3.geometry.translate(0, -9, 0);
		motor4.geometry.translate(0, -9, 0);
		// motor1.position.copy(this._joint1.position);
		// motor2.position.copy(this._joint2.position);
		// motor3.position.copy(this._joint3.position);
		// motor4.position.copy(this._joint4.position);


		this._motor1 = motor1;
		this._motor2 = motor2;
		this._motor3 = motor3;
		this._motor4 = motor4;


	}

	translateGeometryStrip() {
		var pivot1 = this._pivot1;
		var pivot2 = this._pivot2;
		var pivot3 = this._pivot3;
		var pivot4 = this._pivot4;
		var pivot5 = this._pivot5;

		var link1Scene = new THREE.Mesh(this._link1.geometry.clone(), MATERIALNORMAL);
		var link2Scene = new THREE.Mesh(this._link2.geometry.clone(), MATERIALGREEN);
		var link3Scene = new THREE.Mesh(this._link3.geometry.clone(), MATERIALNORMAL);
		var link4Scene = new THREE.Mesh(this._link4.geometry.clone(), MATERIALGREEN);

		var staticScene = new THREE.Mesh(this._staticPt.geometry.clone(), MATERIALOBSTACLE);
		this._staticPt.geometry.computeBoundingBox();

		link1Scene.geometry.translate(-pivot1.position.x, -pivot1.position.y, -pivot1.position.z);
		link2Scene.geometry.translate(-pivot2.position.x, -pivot2.position.y, -pivot2.position.z);
		link3Scene.geometry.translate(-pivot3.position.x, -pivot3.position.y, -pivot3.position.z);
		link4Scene.geometry.translate(-pivot4.position.x, -pivot4.position.y, -pivot4.position.z);

		// var bboxParams = getBoundingBoxEverything(link4Scene);
		staticScene.geometry.translate(-pivot5.position.x, -pivot5.position.y-this._bboxCenter.y, -pivot5.position.z);

		this._link1Scene = link1Scene;
		this._link2Scene = link2Scene;
		this._link3Scene = link3Scene;
		this._link4Scene = link4Scene;
		this._staticScene = staticScene;

		var joint1 = new THREE.Group();
		var joint2 = new THREE.Group();
		var joint3 = new THREE.Group();
		var joint4 = new THREE.Group();
		var joint5 = new THREE.Group();

		joint1.position.copy(pivot1.position.clone());
		joint2.position.copy(pivot2.position.clone().sub(pivot1.position));
		joint3.position.copy(pivot3.position.clone().sub(pivot2.position));
		joint4.position.copy(pivot4.position.clone().sub(pivot3.position));
		joint5.position.copy(pivot5.position.clone().sub(pivot4.position));

		this._joint1 = joint1;
		this._joint2 = joint2;
		this._joint3 = joint3;
		this._joint4 = joint4;
		this._joint5 = joint5;

	}

	_animate(target_q, q0) {
		var firstIndex;
		var joint2ang = target_q[3] - q0[3];
		var joint3ang = target_q[4] - q0[4];
		var joint4ang = target_q[5] - q0[5];
		switch (this._jtType){
			case 1:
				firstIndex = 2;
				var joint1ang = target_q[firstIndex] - q0[firstIndex];
				this._joint1.rotation.z += joint1ang;
				break;
			case 2:
				firstIndex = 1;
				var joint1ang = target_q[firstIndex] - q0[firstIndex];
				this._joint1.rotation.x += joint1ang;
				break;
			case 3:
				firstIndex = 0;
				var joint1ang = target_q[firstIndex] - q0[firstIndex];
				this._joint1.rotation.y += joint1ang;
				break;
		}
		
		this._joint2.rotation.z += joint2ang;
		this._joint3.rotation.z += joint3ang;
		this._joint4.rotation.z += joint4ang;


	}

	segmentLinks() {
		var xmin = this._bboxParamsNew.cmin.x;
		var xmax = this._bboxParamsNew.cmax.x;
		var ymin = this._bboxParamsNew.cmin.y;
		var ymax = this._bboxParamsNew.cmax.y;
		var lenz = this._bboxParamsNew.lenz;
		var segLength = (ymax-ymin)/4;

		var link1Points = [[xmin, ymax], [xmin, ymax-segLength], [xmax, ymax-segLength], [xmax, ymax]];
		var link2Points = [[xmin, ymax-segLength], [xmin, ymax-segLength*2], [xmax, ymax-segLength*2], [xmax, ymax-segLength]];
		var link3Points = [[xmin, ymax-segLength*2], [xmin, ymax-segLength*3], [xmax, ymax-segLength*3], [xmax, ymax-segLength*2]];
		var link4Points = [[xmin, ymax-segLength*3], [xmin, ymax-segLength*4], [xmax, ymax-segLength*4], [xmax, ymax-segLength*3]];

		var link1Cut = polygonExtrudePoints(link1Points, lenz);
		var link2Cut = polygonExtrudePoints(link2Points, lenz);
		var link3Cut = polygonExtrudePoints(link3Points, lenz);
		var link4Cut = polygonExtrudePoints(link4Points, lenz);

		var link1 = booleanGeo(this._meshTransNew, link1Cut, INTERSECT);
		var link2 = booleanGeo(this._meshTransNew, link2Cut, INTERSECT);
		var link3 = booleanGeo(this._meshTransNew, link3Cut, INTERSECT);
		var link4 = booleanGeo(this._meshTransNew, link4Cut, INTERSECT);

		this._link1 = new THREE.Mesh(link1);
		this._link2 = new THREE.Mesh(link2);
		this._link3 = new THREE.Mesh(link3);
		this._link4 = new THREE.Mesh(link4);

	}

	setPivot() {
		var xmin = this._bboxParamsNew.cmin.x;
		var xmax = this._bboxParamsNew.cmax.x;
		var ymin = this._bboxParamsNew.cmin.y;
		var ymax = this._bboxParamsNew.cmax.y;
		var lenz = this._bboxParamsNew.lenz;
		var segLength = (ymax-ymin)/4;

		var pivot1 = new THREE.Group();
		var pivot2 = new THREE.Group();
		var pivot3 = new THREE.Group();
		var pivot4 = new THREE.Group();
		var pivot5 = new THREE.Group();
		var base = new THREE.Group();

		pivot1.position.set(0, ymax, 0);
		pivot2.position.set(0, ymax-segLength-16, 0);
		pivot3.position.set(0, ymax-segLength*2-16, 0);
		pivot4.position.set(0, ymax-segLength*3-16, 0);
		pivot5.position.set(0, ymin, 0);
		base.position.set(0, 0, 0);

		this._pivot1 = pivot1;
		this._pivot2 = pivot2;
		this._pivot3 = pivot3;
		this._pivot4 = pivot4;
		this._pivot5 = pivot5;
		this._base = base;

	}

	_generateParts() {

		switch (this._jtType) {
			case 1:
				this._link1STL = this._linkJointZ(this._link1, this._pivot1, this._pivot2);
				break;
			case 2:
				this._link1STL = this._linkJointX(this._link1, this._pivot1, this._pivot2);
				break;
			case 3:
				this._link1STL = this._linkJointY(this._link1, this._pivot1, this._pivot2);
				break;
		}
		this._link2STL = this._linkJointZ(this._link2, this._pivot2, this._pivot3);
		this._link3STL = this._linkJointZ(this._link3, this._pivot3, this._pivot4);
		this._link4STL = this._linkJointZ(this._link4, this._pivot4);

		scene.add(this._link1STL);
		scene.add(this._link2STL);
		scene.add(this._link3STL);
		scene.add(this._link4STL);
	}

	_linkJointX(link, pivot, pivot_next) {
		var LINK = link;
		var bboxParams = getBoundingBoxEverything(link);
		var xmin = bboxParams.cmin.x;
		var xmax = bboxParams.cmax.x;
		var ymin = bboxParams.cmin.y;
		var ymax = bboxParams.cmax.y;
		var zmin = bboxParams.cmin.z;
		var zmax = bboxParams.cmax.z;

		var pvtX = pivot.position.x;
		var pvtY = pivot.position.y;
		var pvtZ = pivot.position.z;

		var motorShell = ljhBoxMeshFromPoints(pvtX-12, pvtX+12, pvtY-29, pvtY+9, pvtZ-14, pvtZ+14);
		LINK = booleanGeo(LINK, motorShell, UNION);

		var motor = ljhBoxMeshFromPoints(pvtX-12, pvtX+12, pvtY-27, pvtY+9, pvtZ-12, pvtZ+12);
		LINK = booleanGeo(LINK, motor, SUBTRACT);

		// fifth step: add joint for the next link
		if (pivot_next != undefined) {
			var pvtX2 = pivot_next.position.x;
			var pvtY2 = pivot_next.position.y;
			var pvtZ2 = pivot_next.position.z;

			var jtPrismActive = ljhBoxMeshFromPoints(pvtX2-9, pvtX2+9, pvtY2, ymin, pvtZ2+15.5, pvtZ2+15.5+3);
			var jtPrismPassive = ljhBoxMeshFromPoints(pvtX2-9, pvtX2+9, pvtY2, ymin, pvtZ2-12.5-3, pvtZ2-12.5);
			var jtCylinderActive = ljhCylinderMeshFromPoint(pvtX2, pvtY2, pvtZ2+15.5, pvtZ2+15.5+3, 9);
			var jtCylinderPassive = ljhCylinderMeshFromPoint(pvtX2, pvtY2, pvtZ2-12.5-3, pvtZ2-12.5, 9);

			var jtActive = booleanGeo(jtPrismActive, jtCylinderActive, UNION);
			var jtPassive = booleanGeo(jtPrismPassive, jtCylinderPassive, UNION);
			LINK = booleanGeo(LINK, jtActive, UNION);
			LINK = booleanGeo(LINK, jtPassive, UNION);

			// add hole for screws
			var midHole = ljhCylinderMeshFromPoint(pvtX2, pvtY2, zmin, zmax, 1.4);
			var holeStair1 = ljhCylinderMeshFromPoint(pvtX2, pvtY2, pvtZ2+15.5+1.5, zmax, 3);
			var holeStair2 = ljhCylinderMeshFromPoint(pvtX2, pvtY2, zmin, pvtZ2-12.5-1.5, 3);
			LINK = booleanGeo(LINK, midHole, SUBTRACT);
			LINK = booleanGeo(LINK, holeStair1, SUBTRACT);
			LINK = booleanGeo(LINK, holeStair2, SUBTRACT);

			// add pin for fastening
			var pin1 = ljhCylinderMeshFromPoint(pvtX2, pvtY2+6, pvtZ2+15.5-1.5, pvtZ2+15.5, 1.75);
			var pin2 = ljhCylinderMeshFromPoint(pvtX2-6, pvtY2, pvtZ2+15.5-1.5, pvtZ2+15.5, 1.75);
			var pin3 = ljhCylinderMeshFromPoint(pvtX2, pvtY2-6, pvtZ2+15.5-1.5, pvtZ2+15.5, 1.75);
			var pin4 = ljhCylinderMeshFromPoint(pvtX2+6, pvtY2, pvtZ2+15.5-1.5, pvtZ2+15.5, 1.75);

			LINK = booleanGeo(LINK, pin1, UNION);
			LINK = booleanGeo(LINK, pin2, UNION);
			LINK = booleanGeo(LINK, pin3, UNION);
			LINK = booleanGeo(LINK, pin4, UNION);
		}

		// add holes for motor rivets
		var hole1 = ljhCylinderMeshFromPoint(pvtX+9, pvtY, pvtZ+12, zmax > (pvtZ+14) ? zmax : (pvtZ+14), 2.2);
		var hole2 = ljhCylinderMeshFromPoint(pvtX-9, pvtY, pvtZ+12, zmax > (pvtZ+14) ? zmax : (pvtZ+14), 2.2);
		var hole3 = ljhCylinderMeshFromPoint(pvtX+9, pvtY-18, pvtZ+12, zmax > (pvtZ+14) ? zmax : (pvtZ+14), 2.2);
		var hole4 = ljhCylinderMeshFromPoint(pvtX-9, pvtY-18, pvtZ+12, zmax > (pvtZ+14) ? zmax : (pvtZ+14), 2.2);
		var hole5 = ljhCylinderMeshFromPoint(pvtX+9, pvtY, pvtZ+12, zmin > (pvtZ-14) ? zmin : (pvtZ-14), 2.2);
		var hole6 = ljhCylinderMeshFromPoint(pvtX-9, pvtY, pvtZ+12, zmin > (pvtZ-14) ? zmin : (pvtZ-14), 2.2);
		var hole7 = ljhCylinderMeshFromPoint(pvtX+9, pvtY-18, pvtZ+12, zmin > (pvtZ-14) ? zmin : (pvtZ-14), 2.2);
		var hole8 = ljhCylinderMeshFromPoint(pvtX-9, pvtY-18, pvtZ+12, zmin > (pvtZ-14) ? zmin : (pvtZ-14), 2.2);

		var stair1 = ljhCylinderMeshFromPoint(pvtX+9, pvtY, pvtZ+14, zmax > (pvtZ+14) ? zmax : (pvtZ+14), 3);
		var stair2 = ljhCylinderMeshFromPoint(pvtX-9, pvtY, pvtZ+14, zmax > (pvtZ+14) ? zmax : (pvtZ+14), 3);
		var stair3 = ljhCylinderMeshFromPoint(pvtX+9, pvtY-18, pvtZ+14, zmax > (pvtZ+14) ? zmax : (pvtZ+14), 3);
		var stair4 = ljhCylinderMeshFromPoint(pvtX-9, pvtY-18, pvtZ+14, zmax > (pvtZ+14) ? zmax : (pvtZ+14), 3);
		var stair5 = ljhCylinderMeshFromPoint(pvtX+9, pvtY, pvtZ-14, zmin > (pvtZ-14) ? zmin : (pvtZ-14), 3);
		var stair6 = ljhCylinderMeshFromPoint(pvtX-9, pvtY, pvtZ-14, zmin > (pvtZ-14) ? zmin : (pvtZ-14), 3);
		var stair7 = ljhCylinderMeshFromPoint(pvtX+9, pvtY-18, pvtZ-14, zmin > (pvtZ-14) ? zmin : (pvtZ-14), 3);
		var stair8 = ljhCylinderMeshFromPoint(pvtX-9, pvtY-18, pvtZ-14, zmin > (pvtZ-14) ? zmin : (pvtZ-14), 3);

		var hole = booleanGeo(hole1, hole2, UNION);
		hole = booleanGeo(hole, hole3, UNION);
		hole = booleanGeo(hole, hole4, UNION);
		hole = booleanGeo(hole, hole5, UNION);
		hole = booleanGeo(hole, hole6, UNION);
		hole = booleanGeo(hole, hole7, UNION);
		hole = booleanGeo(hole, hole8, UNION);
		hole = booleanGeo(hole, stair1, UNION);
		hole = booleanGeo(hole, stair2, UNION);
		hole = booleanGeo(hole, stair3, UNION);
		hole = booleanGeo(hole, stair4, UNION);
		hole = booleanGeo(hole, stair5, UNION);
		hole = booleanGeo(hole, stair6, UNION);
		hole = booleanGeo(hole, stair7, UNION);
		hole = booleanGeo(hole, stair8, UNION);

		LINK = booleanGeo(LINK, hole, SUBTRACT);

		
		return new THREE.Mesh(LINK, MATERIALNORMAL);
	}

	_linkJointY(link, pivot, pivot_next) {
		// first Step: add motor shell
		var LINK = link;
		var bboxParams = getBoundingBoxEverything(link);
		var xmin = bboxParams.cmin.x;
		var xmax = bboxParams.cmax.x;
		var ymin = bboxParams.cmin.y;
		var ymax = bboxParams.cmax.y;
		var zmin = bboxParams.cmin.z;
		var zmax = bboxParams.cmax.z;

		var pvtX = pivot.position.x;
		var pvtY = pivot.position.y;
		var pvtZ = pivot.position.z;

		pvtY -= 12;

		var motorShell = ljhBoxMeshFromPoints(pvtX-12, pvtX+12, pvtY-14, pvtY+12, pvtZ-11, pvtZ+29);
		LINK = booleanGeo(LINK, motorShell, UNION);

		// sceond step: subtract motor
		var motor = ljhBoxMeshFromPoints(pvtX-12, pvtX+12, pvtY-12, pvtY+12, pvtZ-9, pvtZ+27);
		LINK = booleanGeo(LINK, motor, SUBTRACT);

		// fifth step: add joint for the next link
		if (pivot_next != undefined) {
			var pvtX2 = pivot_next.position.x;
			var pvtY2 = pivot_next.position.y;
			var pvtZ2 = pivot_next.position.z;

			var jtPrismActive = ljhBoxMeshFromPoints(pvtX2-9, pvtX2+9, pvtY2, ymin, pvtZ2+15.5, pvtZ2+15.5+3);
			var jtPrismPassive = ljhBoxMeshFromPoints(pvtX2-9, pvtX2+9, pvtY2, ymin, pvtZ2-12.5-3, pvtZ2-12.5);
			var jtCylinderActive = ljhCylinderMeshFromPoint(pvtX2, pvtY2, pvtZ2+15.5, pvtZ2+15.5+3, 9);
			var jtCylinderPassive = ljhCylinderMeshFromPoint(pvtX2, pvtY2, pvtZ2-12.5-3, pvtZ2-12.5, 9);

			var jtActive = booleanGeo(jtPrismActive, jtCylinderActive, UNION);
			var jtPassive = booleanGeo(jtPrismPassive, jtCylinderPassive, UNION);
			LINK = booleanGeo(LINK, jtActive, UNION);
			LINK = booleanGeo(LINK, jtPassive, UNION);

			// add hole for screws
			var midHole = ljhCylinderMeshFromPoint(pvtX2, pvtY2, zmin, zmax, 1.4);
			var holeStair1 = ljhCylinderMeshFromPoint(pvtX2, pvtY2, pvtZ2+15.5+1.5, zmax, 3);
			var holeStair2 = ljhCylinderMeshFromPoint(pvtX2, pvtY2, zmin, pvtZ2-12.5-1.5, 3);
			LINK = booleanGeo(LINK, midHole, SUBTRACT);
			LINK = booleanGeo(LINK, holeStair1, SUBTRACT);
			LINK = booleanGeo(LINK, holeStair2, SUBTRACT);

			// add pin for fastening
			var pin1 = ljhCylinderMeshFromPoint(pvtX2, pvtY2+6, pvtZ2+15.5-1.5, pvtZ2+15.5, 1.75);
			var pin2 = ljhCylinderMeshFromPoint(pvtX2-6, pvtY2, pvtZ2+15.5-1.5, pvtZ2+15.5, 1.75);
			var pin3 = ljhCylinderMeshFromPoint(pvtX2, pvtY2-6, pvtZ2+15.5-1.5, pvtZ2+15.5, 1.75);
			var pin4 = ljhCylinderMeshFromPoint(pvtX2+6, pvtY2, pvtZ2+15.5-1.5, pvtZ2+15.5, 1.75);

			LINK = booleanGeo(LINK, pin1, UNION);
			LINK = booleanGeo(LINK, pin2, UNION);
			LINK = booleanGeo(LINK, pin3, UNION);
			LINK = booleanGeo(LINK, pin4, UNION);
		}

		// add holes for motor rivets
		var hole1 = ljhCylinderMeshX(pvtY+6, pvtZ, pvtX+12, pvtX+14, 2.2);
		var hole2 = ljhCylinderMeshX(pvtY+6, pvtZ+18, pvtX+12, pvtX+14, 2.2);
		var hole3 = ljhCylinderMeshX(pvtY-6, pvtZ, pvtX+12, pvtX+14, 2.2);
		var hole4 = ljhCylinderMeshX(pvtY-6, pvtZ+18, pvtX+12, pvtX+14, 2.2);
		var hole5 = ljhCylinderMeshX(pvtY+6, pvtZ, pvtX-14, pvtX-12, 2.2);
		var hole6 = ljhCylinderMeshX(pvtY+6, pvtZ+18, pvtX-14, pvtX-12, 2.2);
		var hole7 = ljhCylinderMeshX(pvtY-6, pvtZ, pvtX-14, pvtX-12, 2.2);
		var hole8 = ljhCylinderMeshX(pvtY-6, pvtZ+18, pvtX-14, pvtX-12, 2.2);

		var stair1 = ljhCylinderMeshX(pvtY+6, pvtZ, pvtX+14, Math.max(xmax, pvtX+14), 3);
		var stair2 = ljhCylinderMeshX(pvtY+6, pvtZ+18, pvtX+14, Math.max(xmax, pvtX+14), 3);
		var stair3 = ljhCylinderMeshX(pvtY-6, pvtZ, pvtX+14, Math.max(xmax, pvtX+14), 3);
		var stair4 = ljhCylinderMeshX(pvtY-6, pvtZ+18, pvtX+14, Math.max(xmax, pvtX+14), 3);
		var stair5 = ljhCylinderMeshX(pvtY+6, pvtZ, Math.min(xmin, pvtX-14), pvtX-14, 3);
		var stair6 = ljhCylinderMeshX(pvtY+6, pvtZ+18, Math.min(xmin, pvtX-14), pvtX-14, 3);
		var stair7 = ljhCylinderMeshX(pvtY-6, pvtZ, Math.min(xmin, pvtX-14), pvtX-14, 3);
		var stair8 = ljhCylinderMeshX(pvtY-6, pvtZ+18, Math.min(xmin, pvtX-14), pvtX-14, 3);

		var hole = booleanGeo(hole1, hole2, UNION);
		hole = booleanGeo(hole, hole3, UNION);
		hole = booleanGeo(hole, hole4, UNION);
		hole = booleanGeo(hole, hole5, UNION);
		hole = booleanGeo(hole, hole6, UNION);
		hole = booleanGeo(hole, hole7, UNION);
		hole = booleanGeo(hole, hole8, UNION);
		hole = booleanGeo(hole, stair1, UNION);
		hole = booleanGeo(hole, stair2, UNION);
		hole = booleanGeo(hole, stair3, UNION);
		hole = booleanGeo(hole, stair4, UNION);
		hole = booleanGeo(hole, stair5, UNION);
		hole = booleanGeo(hole, stair6, UNION);
		hole = booleanGeo(hole, stair7, UNION);
		hole = booleanGeo(hole, stair8, UNION);

		LINK = booleanGeo(LINK, hole, SUBTRACT);

		
		return new THREE.Mesh(LINK, MATERIALNORMAL);

	}

	_linkJointZ(link, pivot, pivot_next) {
		// first Step: add motor shell
		var LINK = link;
		var bboxParams = getBoundingBoxEverything(link);
		var xmin = bboxParams.cmin.x;
		var xmax = bboxParams.cmax.x;
		var ymin = bboxParams.cmin.y;
		var ymax = bboxParams.cmax.y;
		var zmin = bboxParams.cmin.z;
		var zmax = bboxParams.cmax.z;

		var pvtX = pivot.position.x;
		var pvtY = pivot.position.y;
		var pvtZ = pivot.position.z;

		ymax = ymax > pvtY ? ymax : (pvtY+15);

		var motorShell = ljhBoxMeshFromPoints(pvtX-14, pvtX+14, pvtY-29, pvtY+9, pvtZ-12, pvtZ+12);
		LINK = booleanGeo(LINK, motorShell, UNION);

		// sceond step: subtract motor
		var motor = ljhBoxMeshFromPoints(pvtX-12, pvtX+12, pvtY-27, Math.max(pvtY+9, ymax), pvtZ-12-5, pvtZ+15+5);
		LINK = booleanGeo(LINK, motor, SUBTRACT);

		// third step: round corner
		var prismLarge = ljhBoxMeshFromPoints(xmin, xmax, pvtY, ymax>pvtY?ymax:(pvtY+15), zmin, zmax);
		var cylinder = ljhCylinderMeshFromPoint(pvtX, pvtY, zmin, zmax, ymax>pvtY?(ymax-pvtY):17);
		var cutShape = booleanGeo(prismLarge, cylinder, SUBTRACT);
		LINK = booleanGeo(LINK, cutShape, SUBTRACT);

		// forth step: add space for joint to move
		var prismActive = ljhBoxMeshFromPoints(xmin, xmax, pvtY*2-ymax, ymax, pvtZ+15, pvtZ+15+5);
		var prismPassive = ljhBoxMeshFromPoints(xmin, xmax, pvtY*2-ymax, ymax, pvtZ-12-5, pvtZ-12);
		LINK = booleanGeo(LINK, prismActive, SUBTRACT);
		LINK = booleanGeo(LINK, prismPassive, SUBTRACT);

		// fifth step: add joint for the next link
		if (pivot_next != undefined) {
			var pvtX2 = pivot_next.position.x;
			var pvtY2 = pivot_next.position.y;
			var pvtZ2 = pivot_next.position.z;

			var jtPrismActive = ljhBoxMeshFromPoints(pvtX2-9, pvtX2+9, pvtY2, ymin, pvtZ2+15.5, pvtZ2+15.5+3);
			var jtPrismPassive = ljhBoxMeshFromPoints(pvtX2-9, pvtX2+9, pvtY2, ymin, pvtZ2-12.5-3, pvtZ2-12.5);
			var jtCylinderActive = ljhCylinderMeshFromPoint(pvtX2, pvtY2, pvtZ2+15.5, pvtZ2+15.5+3, 9);
			var jtCylinderPassive = ljhCylinderMeshFromPoint(pvtX2, pvtY2, pvtZ2-12.5-3, pvtZ2-12.5, 9);

			var jtActive = booleanGeo(jtPrismActive, jtCylinderActive, UNION);
			var jtPassive = booleanGeo(jtPrismPassive, jtCylinderPassive, UNION);
			LINK = booleanGeo(LINK, jtActive, UNION);
			LINK = booleanGeo(LINK, jtPassive, UNION);

			// add hole for screws
			var midHole = ljhCylinderMeshFromPoint(pvtX2, pvtY2, zmin, zmax, 1.4);
			var holeStair1 = ljhCylinderMeshFromPoint(pvtX2, pvtY2, pvtZ2+15.5+1.5, zmax, 3);
			var holeStair2 = ljhCylinderMeshFromPoint(pvtX2, pvtY2, zmin, pvtZ2-12.5-1.5, 3);
			LINK = booleanGeo(LINK, midHole, SUBTRACT);
			LINK = booleanGeo(LINK, holeStair1, SUBTRACT);
			LINK = booleanGeo(LINK, holeStair2, SUBTRACT);

			// add pin for fastening
			var pin1 = ljhCylinderMeshFromPoint(pvtX2, pvtY2+6, pvtZ2+15.5-1.5, pvtZ2+15.5, 1.75);
			var pin2 = ljhCylinderMeshFromPoint(pvtX2-6, pvtY2, pvtZ2+15.5-1.5, pvtZ2+15.5, 1.75);
			var pin3 = ljhCylinderMeshFromPoint(pvtX2, pvtY2-6, pvtZ2+15.5-1.5, pvtZ2+15.5, 1.75);
			var pin4 = ljhCylinderMeshFromPoint(pvtX2+6, pvtY2, pvtZ2+15.5-1.5, pvtZ2+15.5, 1.75);

			LINK = booleanGeo(LINK, pin1, UNION);
			LINK = booleanGeo(LINK, pin2, UNION);
			LINK = booleanGeo(LINK, pin3, UNION);
			LINK = booleanGeo(LINK, pin4, UNION);
		}

		// add holes for screwdrivers
		var cylScrewdriver = ljhCylinderMeshFromPoint(pvtX, pvtY, zmin<(pvtZ-14)?zmin:(pvtZ-14), zmax>(pvtZ+14)?zmax:(pvtZ+14), 5);
		LINK = booleanGeo(LINK, cylScrewdriver, SUBTRACT);
		
		// add holes for motor rivets
		var hole1 = ljhCylinderMeshX(pvtY, pvtZ+6, pvtX+12, xmax > (pvtX+14) ? xmax : (pvtX+14), 2.2);
		var hole2 = ljhCylinderMeshX(pvtY-18, pvtZ+6, pvtX+12, xmax > (pvtX+14) ? xmax : (pvtX+14), 2.2);
		var hole3 = ljhCylinderMeshX(pvtY-18, pvtZ-6, pvtX+12, xmax > (pvtX+14) ? xmax : (pvtX+14), 2.2);
		var hole4 = ljhCylinderMeshX(pvtY, pvtZ-6, pvtX+12, xmax > (pvtX+14) ? xmax : (pvtX+14), 2.2);
		var hole5 = ljhCylinderMeshX(pvtY, pvtZ+6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-12, 2.2);
		var hole6 = ljhCylinderMeshX(pvtY-18, pvtZ+6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-12, 2.2);
		var hole7 = ljhCylinderMeshX(pvtY-18, pvtZ-6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-12, 2.2);
		var hole8 = ljhCylinderMeshX(pvtY, pvtZ-6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-12, 2.2);

		var stair1 = ljhCylinderMeshX(pvtY, pvtZ+6, pvtX+14, xmax > (pvtX+14) ? xmax : (pvtX+14), 3);
		var stair2 = ljhCylinderMeshX(pvtY-18, pvtZ+6, pvtX+14, xmax > (pvtX+14) ? xmax : (pvtX+14), 3);
		var stair3 = ljhCylinderMeshX(pvtY-18, pvtZ-6, pvtX+14, xmax > (pvtX+14) ? xmax : (pvtX+14), 3);
		var stair4 = ljhCylinderMeshX(pvtY, pvtZ-6, pvtX+14, xmax > (pvtX+14) ? xmax : (pvtX+14), 3);
		var stair5 = ljhCylinderMeshX(pvtY, pvtZ+6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-14, 3);
		var stair6 = ljhCylinderMeshX(pvtY-18, pvtZ+6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-14, 3);
		var stair7 = ljhCylinderMeshX(pvtY-18, pvtZ-6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-14, 3);
		var stair8 = ljhCylinderMeshX(pvtY, pvtZ-6, xmin < (pvtX-14) ? xmin : (pvtX-14), pvtX-14, 3);

		var hole = booleanGeo(hole1, hole2, UNION);
		hole = booleanGeo(hole, hole3, UNION);
		hole = booleanGeo(hole, hole4, UNION);
		hole = booleanGeo(hole, hole5, UNION);
		hole = booleanGeo(hole, hole6, UNION);
		hole = booleanGeo(hole, hole7, UNION);
		hole = booleanGeo(hole, hole8, UNION);
		hole = booleanGeo(hole, stair1, UNION);
		hole = booleanGeo(hole, stair2, UNION);
		hole = booleanGeo(hole, stair3, UNION);
		hole = booleanGeo(hole, stair4, UNION);
		hole = booleanGeo(hole, stair5, UNION);
		hole = booleanGeo(hole, stair6, UNION);
		hole = booleanGeo(hole, stair7, UNION);
		hole = booleanGeo(hole, stair8, UNION);

		LINK = booleanGeo(LINK, hole, SUBTRACT);

		
		return new THREE.Mesh(LINK, MATERIALNORMAL);

	}
}