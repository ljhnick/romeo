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
var OBJECTTYPE = OBJFIX;

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

		this._center = center;
		this._basePlane = basePlane.m;
		this._grid = grid;
	}

	_addVerPlane(point) {
		var normalX = new THREE.Vector3(1, 0, 0);
		var normalY = new THREE.Vector3(0, 1, 0);
		var normalZ = new THREE.Vector3(0, 0, 1);
		if (normalY.dot(this._normal) == 0) {
			this._verPlNormal = normalY;
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
		this._oriArrow = [];
		this._objectType = OBJECTTYPE;
		this._targetPointsLine = [];
		this._targetPointsLineCone = [];
		this.pointIndex = 0;
		this.preventDuplicate = 1;
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
		var cubeMesh = new THREE.Mesh(cube, MATERIALSOLID);
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
				var ints = rayCast(e.clientX/0.7, e.clientY, [this._basePlane]);
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
					// var center = new THREE.Vector3(this._bboxParams.ctrx, this._grid.position.y, this._bboxParams.ctrz);
					var center = this._basePlane.position.clone();
					var length = point.distanceTo(center);
					var dir = center.sub(point);
					dir.normalize();
					// var hex = 0x65E604;
					var hex = 0x000000;
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
				var ints = rayCast(e.clientX/0.7, e.clientY, [this._verticalPlane]);
				if (ints.length > 0) {
					var cubeNew = this._addAPoint(ints[0].point);
					scene.add(cubeNew);
					this._cubeDraw[0] = cubeNew;

					// add an arrow reference
					var origin = cubeNew.position.clone();
					var center = new THREE.Vector3(this._bboxParams.ctrx, origin.y, this._bboxParams.ctrz);
					// var center = new THREE.Vector3(this._grid.position.x, origin.y, this._grid.position.z);
					// var center = this._grid.position.clone();
					var length = origin.distanceTo(center);
					var dir = center.sub(origin);
					var hex = 0x000000;
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
				var ints = rayCast(e.clientX/0.7, e.clientY, [this._sphereOri]);
				if (ints.length > 0) {
					var fstPoint = ints[0].point;
					var center = this._sphereOri.position;
					var vec = fstPoint.sub(center);
					var arrow = addAnArrow(center, vec, 0x000000);
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

			case 'attach':
				// scene.remove(this._attachSurface);
				var ints = rayCast(e.clientX/0.7, e.clientY, [this._attachOri]);
				if (ints.length > 0) {
					var fstPoint = ints[0].point;
					var center = this._attachOri.position;
					var vec = fstPoint.sub(center);
					vec.normalize();

					var _axis = new THREE.Vector3;
					_axis.set(vec.z, 0, - vec.x).normalize();
					var radians = Math.acos(vec.y);

					this._attachSurface.quaternion.setFromAxisAngle(_axis, radians);
				}
				break;

		}
	}

	mousedown(e) {
		switch (this._addMode) {
			case '2d':
				var ints = rayCast(e.clientX/0.7, e.clientY, [this._basePlane]);
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
				var ints = rayCast(e.clientX/0.7, e.clientY, [this._verticalPlane]);
				if (ints.length > 0) {
					var addAPt = this._addAPoint(ints[0].point);
					addAPt.material = MATERIALSOLID;
					addAPt.index = this.pointIndex;
					this.pointIndex ++;

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
				this.connectPoints();

				scene.remove(this._sphereOri);
				this._oriArrow.push(this._sphereOriArrow);
				this._sphereOriArrow = [];
				this._addMode = 'option';
				this._basePlane.position.copy(this._pointsMesh[this._pointsMesh.length-1].position);
				this._grid.position.y = this._basePlane.position.y;
				break;

			case 'option':
				this._basePlane.visible = true;
				// this._basePlane.position.copy(this._pointsMesh[this._pointsMesh.length-1].position);
				this._grid.visible = true;
				// this._grid.position.copy(this._basePlane.position);
				break;

			case 'attach':
				this._addMode = '2d';
				scene.remove(this._attachOri);
				this.preventDuplicate = 1;
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
					_self._addMode = '2d';
				});

				/*
					trajectory following task
				*/
				$('#traj').on('click', function(event) {
					event.preventDefault();
					/* Act on the event */
					_self._points[_self._points.length-1].type = TRAJFOLLOW;
					$('#optionMenu').hide();
					TASKTYPE = TRAJFOLLOW;
					_self._addMode = '2d';
				});


				// for attachment
				/*
					attach cylinder
				*/
				$('#att-cyl').on('click', function(event) {
					event.preventDefault();
					/* Act on the event */
					if (_self.preventDuplicate) {
						_self._points[_self._points.length-1].type = ATTACHMENT;
						$('#optionMenu').hide();
						TASKTYPE = ATTACHMENT;

						// create surface represent
						_self._addMode = 'attach';
						var cylinder = new THREE.CylinderGeometry(10, 10, 100, 32);
						var cylinderMesh = new THREE.Mesh(cylinder, MATERIALNORMAL);
						// cylinderMesh.position.copy(_self._points[_self._points.length-1].pos);
						scene.add(cylinderMesh);
						cylinderMesh.position.copy(_self._points[_self._points.length-1].pos);
						_self._attachSurface = cylinderMesh;

						var sphere = new ljhSphere(75, MATERIALCONTRAST, true);
						sphere.m.position.copy(cylinderMesh.position);
						sphere.m.material = MATERIALCONTRAST;
						_self._attachOri = sphere.m;
						scene.add(_self._attachOri);

						_self.preventDuplicate = 0;
					}
				});

				/*
					attach rectangle prism
				*/
				$('#att-rect').on('click', function(event) {
					event.preventDefault();
					/* Act on the event */
					_self._points[_self._points.length-1].type = ATTACHMENT;
					$('#optionMenu').hide();
					_self._addMode = 'attach';

					if (_self.preventDuplicate) {
						var prism = new THREE.BoxGeometry(10, 100, 10);
						var prismMesh = new THREE.Mesh(prism, MATERIALNORMAL);
						// cylinderMesh.position.copy(_self._points[_self._points.length-1].pos);
						scene.add(prismMesh);
						prismMesh.position.copy(_self._points[_self._points.length-1].pos);
						_self._attachSurface = prismMesh;

						var sphere = new ljhSphere(75, MATERIALCONTRAST, true);
						sphere.m.position.copy(prismMesh.position);
						sphere.m.material = MATERIALCONTRAST;
						_self._attachOri = sphere.m;
						scene.add(_self._attachOri);

						_self.preventDuplicate = 0;
					}
				});

				/*
					attach flat plane
				*/
				$('#att-flat').on('click', function(event) {
					event.preventDefault();
					/* Act on the event */
					_self._points[_self._points.length-1].type = ATTACHMENT;
					$('#optionMenu').hide();
					_self._addMode = 'attach';

					if (_self.preventDuplicate) {
						var prism = new THREE.BoxGeometry(100, 1, 100);
						var prismMesh = new THREE.Mesh(prism, MATERIALNORMAL);
						// cylinderMesh.position.copy(_self._points[_self._points.length-1].pos);
						scene.add(prismMesh);
						prismMesh.position.copy(_self._points[_self._points.length-1].pos);
						_self._attachSurface = prismMesh;

						var sphere = new ljhSphere(75, MATERIALCONTRAST, true);
						sphere.m.position.copy(prismMesh.position);
						sphere.m.material = MATERIALCONTRAST;
						_self._attachOri = sphere.m;
						scene.add(_self._attachOri);

						_self.preventDuplicate = 0;
					}
				});
			}
	}

	doubleClick(e) {
		var ints = rayCast(e.clientX, e.clientY, this._pointsMesh);
		if (ints.length > 0) {
			var index = ints[0].object.index;
			ints[0].object.material = MATERIALPOINT;
			ints[0].object.position.copy(genWorkspace._snapToPoint[index]);
			this.connectPoints();
		}
	}

	connectPoints() {
		if (this._points.length < 2) {
			return;
		}

		for (var i = 0; i < this._targetPointsLine.length; i++) {
			scene.remove(this._targetPointsLine[i]);
			scene.remove(this._targetPointsLineCone[i]);
		}

		this._targetPointsLine = [];
		this._targetPointsLineCone = [];

		this.checkLoop();

		for (var i = 1; i < this._points.length; i++) {
			var startIndex = i-1;
			var endIndex = i;
			var lineStart = this._pointsMesh[startIndex].position;
			var lineEnd = this._pointsMesh[endIndex].position;

			var geometry = new THREE.Geometry();
			geometry.vertices.push(lineStart, lineEnd);

			// var line = new THREE.Line(geometry, new THREE.LineMaterial({color: 0xffffff, linewidth: 5}));
			// var line = new THREE.Line(geometry, MATERIALLINE);

			var lineMesh = new MeshLine();
			lineMesh.setGeometry(geometry);

			var mat = new MeshLineMaterial({color: 0x000000, lineWidth: 2});
			// mat.color = COLORNORMAL;
			// mat.lineWidth = 5;

			var line = new THREE.Mesh(lineMesh.geometry, mat);
			scene.add(line);
			// var lineGeo = new THREE.LineGeometry();
			// lineGeo.setPositions([lineStart, lineEnd]);

			// var line = new 

			// add reference cone
			var center = lineStart.clone().add(lineEnd);
			center.divideScalar(2);

			var dir = lineEnd.clone().sub(lineStart);
			dir.normalize();

			var _axis = new THREE.Vector3;
			_axis.set(dir.z, 0, - dir.x).normalize();
			var radians = Math.acos(dir.y);

			var coneGeo = new THREE.ConeGeometry(3, 15, 32);
			var cone = new THREE.Mesh(coneGeo, MATERIALSOLID);
			cone.quaternion.setFromAxisAngle(_axis, radians);
			cone.position.copy(center);

			scene.add(line);
			scene.add(cone);			

			this._targetPointsLine.push(line);
			this._targetPointsLineCone.push(cone);
		}

		if (this._isloop) {
			var lineStart = this._pointsMesh[this._points.length-1].position;
			var lineEnd = this._pointsMesh[0].position;
			var geometry = new THREE.Geometry();
			geometry.vertices.push(lineStart, lineEnd);
			var line = new THREE.Line(geometry, MATERIALLINE);
			scene.add(line);

			// add reference cone
			var center = lineStart.clone().add(lineEnd);
			center.divideScalar(2);

			var dir = lineEnd.clone().sub(lineStart);
			dir.normalize();

			var _axis = new THREE.Vector3;
			_axis.set(dir.z, 0, - dir.x).normalize();
			var radians = Math.acos(dir.y);

			var coneGeo = new THREE.ConeGeometry(2, 10, 32);
			var cone = new THREE.Mesh(coneGeo, MATERIALSOLID);
			cone.quaternion.setFromAxisAngle(_axis, radians);
			cone.position.copy(center);
			scene.add(cone);

			this._targetPointsLine.push(line);
			this._targetPointsLineCone.push(cone);
		}
	}

	endStep() {
		// this.checkLoop();
		this._basePlane.visible = false;
		this._grid.visible = false;
		this._addMode = 'end';
		if (this._cubeDraw.length > 0) {
			scene.remove(this._cubeDraw[0]);
			scene.remove(this._arrowRef);
		}
		scene.remove(this._line);
		scene.remove(this._sphereOri);
		if (this._points.length != this._pointsMesh.length) {
			scene.remove(this._pointsMesh[this._pointsMesh.length-1])
			this._pointsMesh.pop();
		}
		this.packData();

	}

	restart() {
		this.endStep();
		// clean scene first
		for (var i = 0; i < this._pointsMesh.length; i++) {
			scene.remove(this._pointsMesh[i]);
		}

		for (var i = 0; i < this._targetPointsLine.length; i++) {
			scene.remove(this._targetPointsLine[i]);
			scene.remove(this._targetPointsLineCone[i]);
		}

		for (var i = 0; i < this._oriArrow.length; i++) {
			scene.remove(this._oriArrow[i]);
		}
		


	}

	checkLoop() {
		var dist = this._points[0].pos.distanceTo(this._points[this._points.length-1].pos);
		if (dist <= 50) {
			this._isloop = true;
		} else {
			this._isloop = false;
		}
	}

	packData() {
		this._objectType = OBJECTTYPE;
		var points = this._points;
		var center = this._center;
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