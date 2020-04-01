/*
	the second step: add target points for the robotic tasks
	@author Jiahao Li http://ljhnick.github.io
*/

// global value for task type
var PICKPLACE = 1;
var TRAJFOLLOW = 2;
var ATTACHMENT = 3;

// object type (1 for object is fix, 2 for object is moving (handheld));
var OBJFIX = 1;
var OBJMOV = 2;

class TargetPoints {
	constructor(obj, normal) {
		this._obj = obj;
		this._normal = normal;
		this._bboxParams = getBoundingBoxEverything(obj);
		this._addBasePlane();
	}

	_addBasePlane() {
		var ctrx = this._bboxParams.ctrx;
		var ctry = this._bboxParams.ctry;
		var ctrz = this._bboxParams.ctrz;
		var center = new THREE.Vector3(ctrx, ctry, ctrz);
		var nml = new THREE.Vector3(0, 1, 0);

		var basePlane = new ljhRectVolume(1000, 0.1, 1000, MATERIALINVISIBLE);
		rotateObjTo(basePlane.m, nml);
		basePlane.m.position.copy(center);
		scene.add(basePlane.m);

		var grid = drawGrid(ctry);
		scene.add(grid);

		this._basePlane = basePlane.m;
		this._grid = grid;
	}

	_addVerPlane(point) {
		var normalX = new THREE.Vector3(1, 0, 0);
		var normalZ = new THREE.Vector3(0, 0, 1);
		if (normalX.dot(this._normal) == 0) {
			this._verPlNormal = normalX;
		} else {
			this._verPlNormal = normalZ;
		}

		var verticalPlane = new ljhRectVolume(1000, 0.1, 1000, MATERIALINVISIBLE);
		rotateObjTo(verticalPlane.m, this._verPlNormal);
		verticalPlane.m.position.copy(point);
		scene.add(verticalPlane.m);
		this._verticalPlane = verticalPlane.m;
		this._verticalPlanePos = point;
	}
}

class AddPoints extends TargetPoints {
	constructor(obj, normal) { // obj is the transformable part
		super(obj, normal);
		this._points = []; // pos and ori information
		this._pointsMesh = []; // target points mesh
		this._cubeDraw = [];
		this._optionMode = false; // option means choosing task type
		this._addMode = '2d';
		this._sphereOriArrow = [];
		this._objectType = OBJECTTYPE;
		this._targetPointsLine = [];
	}

	_addAPoint(point) {
		var pl = this._verticalPlane;
		var normal = new THREE.Vector3(0, 1, 0);
		var oriPt = this._verticalPlanePos;

		var dir = point.clone().sub(oriPt);
		var len = dir.dot(normal);
		var vecOff = normal.clone().multiplyScalar(len);
		var posNew = oriPt.add(vecOff);

		var cube = new THREE.SphereGeometry(3, 32, 32);
		var cubeMesh = new THREE.Mesh(cube, MATERIALGREEN);
		cubeMesh.position.copy(posNew);
		var cubeAtPoint = cubeMesh;

		return cubeAtPoint;
	}

	mousemove(e) {
		switch (this._addMode){
			case '2d':
				if (this._cubeDraw.length > 0) {
					scene.remove(this._cubeDraw[0]);
					scene.remove(this._arrowRef);
				}
				var ints = rayCast(e.clientX, e.clientY, [this._basePlane]);
				if (ints.length > 0) {
					var point = ints[0].point;
					var cube = new THREE.SphereGeometry(3,32,32);
					var cubeM = new THREE.Mesh(cube, MATERIALPOINT);
					var pointGrd = point.clone();
					pointGrd.y = point.y + 3;
					cubeM.position.copy(pointGrd);
					scene.add(cubeM);
					this._cubeDraw[0] = cubeM;

					// add an arrow reference
					var center = new THREE.Vector3(this._bboxParams.ctrx, this._bboxParams.ctry, this._bboxParams.ctrz);
					var length = point.distanceTo(center);
					var dir = center.sub(point);
					var hex = 0x65E604;
					var arrowRef = new THREE.ArrowHelper(dir, point, length, hex, 20);
					scene.add(arrowRef);
					this._arrowRef = arrowRef;
				}
				break;

			case '3d':
				if (this._cubeDraw.length > 0) {
					scene.remove(this._cubeDraw[0]);
					scene.remove(this._arrowRef);
				}
				var ints = rayCast(e.clientX, e.clientY, [this._verticalPlane]);
				if (ints.length > 0) {
					var cubeNew = this._addAPoint(ints[0].point);
					scene.add(cubeNew);
					this._cubeDraw[0] = cubeNew;

					// add an arrow reference
					var origin = cubeNew.position.clone();
					var center = new THREE.Vector3(this._bboxParams.ctrx, origin.y, this._bboxParams.ctrz);
					var length = origin.distanceTo(center);
					var dir = center.sub(origin);
					var hex = COLORNORMAL;
					var arrowRef = new THREE.ArrowHelper(dir, origin, length, hex, 20);
					scene.add(arrowRef);
					this._arrowRef = arrowRef;

				}
				break;

			case 'ori':
				if (this._escape) {
					scene.remove(this._sphereOri);
					break;
				}
				scene.remove(this._sphereOriArrow[0]);
				var ints = rayCast(e.clientX, e.clientY, [this._sphereOri]);
				if (ints.length > 0) {
					var fstPoint = ints[0].point;
					var center = this._sphereOri.position;
					var vec = fstPoint.sub(center);
					var arrow = addAnArrow(center, vec, COLORNORMAL);
					scene.add(arrow);
					this._movingOri = vec;
					this._sphereOriArrow[0] = arrow;
				} else {
					this._sphereOriArrow = [];
					this._movingOri = new THREE.Vector3(0,0,0);
				}
				break;

			case 'option':
				break;

		}
	}

	mousedown(e) {
		switch (this._addMode) {
			case '2d':
				var ints = rayCast(e.clientX, e.clientY, [this._basePlane]);
				if (ints.length > 0) {
					this._basePlane.visible = false;
					// this._grid.visible = false;
					this._addVerPlane(ints[0].point);
					this._addMode = '3d';
					// add z axis reference line
					var p0 = ints[0].point.clone();
					p0.set(p0.x, -1000, p0.z);
					var p1 = ints[0].point.clone();
					var p2 = ints[0].point.clone();
					p2.set(p2.x, 1000, p2.z);
					var points = [];
					points.push(p0);
					points.push(p1);
					points.push(p2);

					var geo = new THREE.BufferGeometry().setFromPoints(points);
					this._line = new THREE.Line(geo, MATERIALLINE);
					scene.add(this._line);

					scene.remove(this._arrowRef);
					// console.log(ints[0].point);
				}
				break;

			case '3d':
				var ints = rayCast(e.clientX, e.clientY, [this._verticalPlane]);
				if (ints.length > 0) {
					var addAPt = this._addAPoint(ints[0].point);
					addAPt.material = MATERIALSOLID;
					scene.add(addAPt);
					this._pointsMesh.push(addAPt);

					if (this._cubeDraw.length > 0) {
						scene.remove(this._cubeDraw[0]);
						scene.remove(this._arrowRef);
					}
					this._optionMode = true;
					this._addMode = 'ori';
					var sphere = new ljhSphere(20, MATERIALCONTRAST, true);
					var spherePos = addAPt.position.clone();
					sphere.m.position.copy(spherePos);
					sphere.m.material = MATERIALCONTRAST;
					this._sphereOri = sphere.m;

					this._escape = false;
					scene.add(this._sphereOri);
					scene.remove(this._line);
				}
				break;

			case 'ori':
				// if (this._sphereOriArrow == undefined) {
				// 	this._addMode = 'option';
				// 	break;
				// }
				var pos = this._sphereOri.position;
				var ori = this._movingOri;
				var point = {'pos': pos, 'ori': ori};
				this._points.push(point);
				this.connectPoints(this._points);

				scene.remove(this._sphereOri);
				this._sphereOriArrow = [];
				this._addMode = 'option';
				break;

			case 'option':
				this._addMode = '2d';
				this._basePlane.visible = true;
				this._grid.visible = true;
				break;

		}

		
	}

	mouseup(e) {
		var _self = this;
		switch (this._addMode) {
			case ('option'):
				var left = e.pageX;
				var top = e.pageY;
				// show menuws
				$('#optionMenu').show();
				$('#optionMenu').css("top", top);
				$('#optionMenu').css("left", left);
				$('#attachment').hover(function(){ $('#secondary').show(); }, function() {
					$('#secondary').hide();});

				// click event
				/*
					pick and place task
				*/
				$('#pickplace').on('click', function(event) {
					event.preventDefault();
					/* Act on the event */
					_self._points[_self._points.length-1].type = PICKPLACE;
					$('#optionMenu').hide();
					TASKTYPE = PICKPLACE;
				});

				/*
					trajectory following task
				*/
				$('#traj').on('click', function(event) {
					event.preventDefault();
					/* Act on the event */
					tarPoints._points[tarPoints._points.length-1].type = TRAJFOLLOW;
					$('#optionMenu').hide();
					TASKTYPE = TRAJFOLLOW;
				});

				/*
					attach cylinder
				*/
				$('#att-cyl').on('click', function(event) {
					event.preventDefault();
					/* Act on the event */
					tarPoints._points[tarPoints._points.length-1].type = ATTACHMENT;
					$('#optionMenu').hide();
					TASKTYPE = ATTACHMENT;
				});

				/*
					attach rectangle prism
				*/
				$('#att-rect').on('click', function(event) {
					event.preventDefault();
					/* Act on the event */
					tarPoints._points[tarPoints._points.length-1].type = ATTACHMENT;
					$('#optionMenu').hide();
				});

				/*
					attach flat plane
				*/
				$('#att-flat').on('click', function(event) {
					event.preventDefault();
					/* Act on the event */
					tarPoints._points[tarPoints._points.length-1].type = ATTACHMENT;
					$('#optionMenu').hide();
				});



			}
	}

	connectPoints(points) {
		if (points.length < 2) {
			return;
		}
		var startIndex = points.length - 2;
		var endIndex = points.length - 1;
		var lineStart = new THREE.Vector3(points[startIndex].pos.x, points[startIndex].pos.y, points[startIndex].pos.z);
		var lineEnd = new THREE.Vector3(points[endIndex].pos.x, points[endIndex].pos.y, points[endIndex].pos.z);

		var geometry = new THREE.Geometry();
		geometry.vertices.push(lineStart, lineEnd);
		var line = new THREE.Line(geometry, MATERIALLINE);
		scene.add(line);
		this._targetPointsLine.push(line);
	}

	endStep() {
		this._basePlane.visible = false;
		this._grid.visible = false;
		this._addMode = 'end';
		if (this._cubeDraw.length > 0) {
			scene.remove(this._cubeDraw[0]);
			scene.remove(this._arrowRef);
		}
		scene.remove(this._line);
		this.packData();

	}

	packData() {
		var points = this._points;
		var center = this._basePlane.position;
		var trnsfmble = {'center': center,
						 'lenx': this._bboxParams.lenx,
						 'leny': this._bboxParams.leny,
						 'lenz': this._bboxParams.lenz,
						 'axis': this._normal};
		var obstacle = findObstacle(this._obj, objects[0], this._normal);
		var data = {'type': this._objectType,
					'points': points,
					'transformable': trnsfmble,
					'obstacle': obstacle};
		this._data = data;
	}
}