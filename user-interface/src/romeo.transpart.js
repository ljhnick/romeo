/**
  the first step after importing the model
  users select the transformable part
  @author Jiahao Li http://ljhnick.github.io
 */

"use strict";


// gloabl value for the transformable part
var transPtParams = [];
var transPlNormal = undefined;


/*
	a base class for setting up the bounding box UI
*/

class BboxUI {
	constructor(obj) {
		this._obj = obj;
		this._bboxParams = getBoundingBoxEverything(obj);
		this._bboxInit = getBoundingBoxEverything(obj);
		this._update(this._bboxParams);
	}

	_addPlane(lx, ly, lz, nml, cx, cy, cz) {
		var pl = new ljhRectVolume(lx, ly, lz, this._visible == true ? MATERIALYELLOW : MATERIALCONTRAST);
		// scaleAroundCenter(pl.m, 1.1);
		rotateObjTo(pl.m, nml);
		pl.m.normal = nml;
		pl.m.position.copy(new THREE.Vector3(cx, cy, cz));
		scene.add(pl.m);
		pl.m.selector = this;
		pl.m.renderOrder = 1;
		return pl.m;
	}

	// return the mesh of the box
	get box() {
		return this._box;
	}

	// update all the planes
	_update(bb) {
		var boxNew = [];
		boxNew.push(this._addPlane(bb.lenx, 0.1, bb.lenz, new THREE.Vector3(0, 1, 0), bb.ctrx, bb.cmax.y, bb.ctrz));
		boxNew.push(this._addPlane(bb.lenx, 0.1, bb.lenz, new THREE.Vector3(0, -1, 0), bb.ctrx, bb.cmin.y, bb.ctrz));
		boxNew.push(this._addPlane(bb.leny, 0.1, bb.lenz, new THREE.Vector3(1, 0, 0), bb.cmax.x, bb.ctry, bb.ctrz));
		boxNew.push(this._addPlane(bb.leny, 0.1, bb.lenz, new THREE.Vector3(-1, 0, 0), bb.cmin.x, bb.ctry, bb.ctrz));
		boxNew.push(this._addPlane(bb.lenx, 0.1, bb.leny, new THREE.Vector3(0, 0, 1), bb.ctrx, bb.ctry, bb.cmax.z));
		boxNew.push(this._addPlane(bb.lenx, 0.1, bb.leny, new THREE.Vector3(0, 0, -1), bb.ctrx, bb.ctry, bb.cmin.z));

		if (this._box != undefined && this._box.length > 0) {
			for (var i = this._box.length - 1; i >= 0; i--) {
				if (this._box[i] != this._pl) {
					scene.remove(this._box[i]);
					// scene.remove(boxNew[i]);
					this._box[i] = boxNew[i];
				} else {
					scene.remove(boxNew[i]);
				}
			}
		} else {
			this._box = boxNew;
		}
	}

	// update the planes while selecting the transformable parts
	_updateSelPl(bb, axis) {
		var boxNewSelAxis = [];
		var xPlRight = this._addPlane(bb.leny, 0.1, bb.lenz, new THREE.Vector3(1, 0, 0), bb.cmax.x, bb.ctry, bb.ctrz);
		var xPlLeft = this._addPlane(bb.leny, 0.1, bb.lenz, new THREE.Vector3(-1, 0, 0), bb.cmin.x, bb.ctry, bb.ctrz);
		var yPlUp = this._addPlane(bb.lenx, 0.1, bb.lenz, new THREE.Vector3(0, 1, 0), bb.ctrx, bb.cmax.y, bb.ctrz);
		var yPlDown = this._addPlane(bb.lenx, 0.1, bb.lenz, new THREE.Vector3(0, -1, 0), bb.ctrx, bb.cmin.y, bb.ctrz);
		var zPlFront = this._addPlane(bb.lenx, 0.1, bb.leny, new THREE.Vector3(0, 0, 1), bb.ctrx, bb.ctry, bb.cmax.z);
		var zPlBack = this._addPlane(bb.lenx, 0.1, bb.leny, new THREE.Vector3(0, 0, -1), bb.ctrx, bb.ctry, bb.cmin.z);
		

		var boxNew = [];
		boxNew.push(xPlRight);
		boxNew.push(xPlLeft);
		boxNew.push(yPlUp);
		boxNew.push(yPlDown);
		boxNew.push(zPlFront);
		boxNew.push(zPlBack);

		if (axis == 'x') {
			boxNewSelAxis.push(xPlRight);
			boxNewSelAxis.push(xPlLeft);
		} else if (axis == 'y') {
			boxNewSelAxis.push(yPlUp);
			boxNewSelAxis.push(yPlDown);
		} else if (axis == 'z') {
			boxNewSelAxis.push(zPlFront);
			boxNewSelAxis.push(zPlBack);
		}

		if (this._box != undefined && this._box.length > 0) {
			for (var i = this._box.length - 1; i >= 0; i--) {
				scene.remove(this._box[i]);
				// scene.remove(boxNew[i]);
				this._box[i] = boxNew[i];
			}
		} else {
			this._box = boxNew;
		}

		this._boxSel = boxNewSelAxis;
	}

	// remove the box from the scene
	clear() {
		for (var i = this._box.length - 1; i >= 0; i--) {
			scene.remove(this._box[i]);
		}
	}
}

class AxisBboxUI extends BboxUI {
	constructor(obj, axis) {
		super(obj);
		this._obj = obj;
		this._axis = axis;
		this._needUpdate = true;
		this._boxSel = [];
	}

	mousehover(e) {
		// hover on the axis and highlight it
		if (this._needUpdate) {
			this._axisSel = highlightAxis(e.clientX, e.clientY, this._axis);
		}
	}

	mousedown(e) {
		if (this._axisSel != undefined && this._visible != true) {
			this._needUpdate = false; // stop raycasting axes
			this.clear();
			this._visible = true;
			this._updateSelPl(this._bboxParams, this._axisSel);
		}
		var ints = rayCast(e.clientX, e.clientY, this._boxSel);
		// console.log(ints);
		// console.log(this._boxSel[0], this._boxSel[1]);
		if (ints.length > 0) {
			this._pl = ints[0].object; // the plane being moved
			this._point = ints[0].point; // intersecting point
			this._normal = this._pl.normal; // the normal of this plane

			var dragPlane = new ljhRectVolume(1000, 1000, 0.1, MATERIALINVISIBLE);
			rotateObjTo(dragPlane.m, this._normal);
			// console.log(this._normal);
			dragPlane.m.position.copy(this._point);
			scene.add(dragPlane.m);

			this._dragPlane = dragPlane.m;
			dragPlane.m.material.side = THREE.DoubleSide;

			transPlNormal = this._normal;
		}
		
	}

	mousemove(e) {
		if (e.which != LEFTMOUSE || this._pl == undefined) {
			return;
		}

		var ints = rayCast(e.clientX, e.clientY, [this._dragPlane]);
		if (ints.length > 0 ) {
			var dirDrag = ints[0].point.clone().sub(this._point);

			var lenOff = dirDrag.dot(this._normal);
			var vecOff = this._normal.clone().multiplyScalar(lenOff);
			var sign = dirDrag.angleTo(this._normal) < Math.PI / 2 ? 1 : -1;
			var posNew = this._pl.position.clone().add(vecOff);

			this._pl.position.copy(posNew);

			this._bboxParams.ctrx += vecOff.x / 2;
			this._bboxParams.ctry += vecOff.y / 2;
			this._bboxParams.ctrz += vecOff.z / 2;

			this._bboxParams.lenx += sign * Math.abs(vecOff.x);
			this._bboxParams.leny += sign * Math.abs(vecOff.y);
			this._bboxParams.lenz += sign * Math.abs(vecOff.z);

			this._bboxParams.cmin.x = this._bboxParams.ctrx - this._bboxParams.lenx * 0.5;
			this._bboxParams.cmax.x = this._bboxParams.ctrx + this._bboxParams.lenx * 0.5;
			this._bboxParams.cmin.y = this._bboxParams.ctry - this._bboxParams.leny * 0.5;
			this._bboxParams.cmax.y = this._bboxParams.ctry + this._bboxParams.leny * 0.5;
			this._bboxParams.cmin.z = this._bboxParams.ctrz - this._bboxParams.lenz * 0.5;
			this._bboxParams.cmax.z = this._bboxParams.ctrz + this._bboxParams.lenz * 0.5;

			this._point.add(vecOff);

			this._updateSelPl(this._bboxParams, this._axisSel);
		}
	}

	mouseup(e) {
		this._pl = undefined;
		this._point = undefined;
		this._normal = undefined;
		// scene.remove(this._transPt);

		// compute the bounding box of the transformable part
		// var transPartBbox = new THREE.BoxGeometry(this._bboxParams.lenx, this._bboxParams.leny, this._bboxParams.lenz);
		// var position = new THREE.Vector3(this._bboxParams.ctrx, this._bboxParams.ctry, this._bboxParams.ctrz);
		// var transPt = new THREE.Mesh(transPartBbox, MATERIALNORMAL);
		// transPt.position.copy(position);
		// var geoObj = new THREE.Geometry().fromBufferGeometry(this._obj.geometry);
		// var meshObj = new THREE.Mesh(geoObj, MATERIALNORMAL);

		// this._transPt = boolean(meshObj, transPt, INTERSECT);

		// scene.add(this._transPt)
	}

	endStep() {

		// // compute the bounding box first
		// var transPartBbox = new THREE.BoxGeometry(this._bboxParams.lenx, this._bboxParams.leny, this._bboxParams.lenz);
		// var position = new THREE.Vector3(this._bboxParams.ctrx, this._bboxParams.ctry, this._bboxParams.ctrz);
		// var transPt = new THREE.Mesh(transPartBbox, MATERIALNORMAL);
		// transPt.position.copy(position);
		// var geoObj = new THREE.Geometry().fromBufferGeometry(this._obj.geometry);
		// var meshObj = new THREE.Mesh(geoObj, MATERIALNORMAL);

		// var tranGeo = booleanGeo(meshObj, transPt.clone(), INTERSECT);
		// var tranMesh = new THREE.Mesh(tranGeo);


		// switch(this._axisSel) {
		// 	case 'x':
		// 		break;
		// 	case 'y':
		// 		var ymax_init = this._bboxInit.cmax.y;
		// 		var ymin_init = this._bboxInit.cmin.y;
		// 		var ymax = this._bboxParams.cmax.y;
		// 		var ymin = this._bboxParams.cmin.y;
		// 		var lenx = this._bboxParams.lenx;
		// 		if (ymax < ymax_init && ymin > ymin_init) {
		// 			var bboxTransPt = getBoundingBoxEverything(tranMesh);

		// 			var r = (bboxTransPt.lenx-70)/2;
		// 			var midPillar = new THREE.CylinderGeometry(r, r, ymax_init-ymin_init, 32);
		// 			midPillar = new THREE.Mesh(midPillar);
		// 			// midPillar.translate(0, this._bboxParams.ctry, 0);
		// 			// midPillar.translate(bboxTransPt.ctrx, bboxTransPt.ctry, bboxTransPt.ctrz);
		// 			midPillar.position.set(bboxTransPt.ctrx, bboxTransPt.ctry, bboxTransPt.ctrz)
		// 			transPt = booleanGeo(transPt, midPillar, SUBTRACT);
		// 		}
		// 		break;
		// 	case 'z':
		// 		break;
		// }

		// var transPart = booleanGeo(meshObj, transPt, INTERSECT);
		// this._transPt = new THREE.Mesh(transPart, MATERIALNORMAL);

		// this.clearAll();

		// this._staticPt = booleanGeo(meshObj, transPart, SUBTRACT);
		// this._staticPt = new THREE.Mesh(this._staticPt);
		// this._staticPt.material = MATERIALOBSTACLE;
		// scene.add(this._transPt);
		// scene.add(this._staticPt);
		// transPtParams.push(this._transPt);
		// transPtParams.push(this._staticPt);

		// compute the bounding box first
		var transPartBbox = new THREE.BoxGeometry(this._bboxParams.lenx, this._bboxParams.leny, this._bboxParams.lenz);
		var position = new THREE.Vector3(this._bboxParams.ctrx, this._bboxParams.ctry, this._bboxParams.ctrz);
		var transPt = new THREE.Mesh(transPartBbox, MATERIALNORMAL);
		transPt.position.copy(position);
		var geoObj = new THREE.Geometry().fromBufferGeometry(this._obj.geometry);
		var meshObj = new THREE.Mesh(geoObj, MATERIALNORMAL);

		var tranBoxGeo = transPartBbox.clone();
		var tranBoxMesh = new THREE.Mesh(tranBoxGeo);
		tranBoxMesh.position.copy(position);

		var tranGeo = booleanGeo(meshObj.geometry.clone(), tranBoxMesh, INTERSECT);
		var tranMesh = new THREE.Mesh(tranGeo);


		switch(this._axisSel) {
			case 'x':
				break;
			case 'y':
				var ymax_init = this._bboxInit.cmax.y;
				var ymin_init = this._bboxInit.cmin.y;
				var ymax = this._bboxParams.cmax.y;
				var ymin = this._bboxParams.cmin.y;
				var lenx = this._bboxParams.lenx;
				if (ymax < ymax_init && ymin > ymin_init) {
					var bboxTransPt = getBoundingBoxEverything(tranMesh);
					var r = (Math.min(bboxTransPt.lenx, bboxTransPt.lenz)-70)/2;
					var midPillar = new THREE.CylinderGeometry(r, r, ymax_init-ymin_init, 32);
					midPillar.translate(bboxTransPt.ctrx, this._bboxParams.ctry, bboxTransPt.ctrz);
					transPt = booleanGeo(transPt, midPillar, SUBTRACT);
				}
				break;
			case 'z':
				break;
		}

		var transPart = booleanGeo(meshObj, transPt, INTERSECT);
		this._transPt = new THREE.Mesh(transPart, MATERIALNORMAL);

		// 
		this.clearAll();
		// this._transPt.material = MATERIALNORMAL;
		// var geoObj = new THREE.Geometry().fromBufferGeometry(this._obj.geometry);
		// var meshObj = new THREE.Mesh(geoObj, MATERIALNORMAL);

		// var transPartBbox = new THREE.BoxGeometry(this._bboxParams.lenx, this._bboxParams.leny, this._bboxParams.lenz);
		// var position = new THREE.Vector3(this._bboxParams.ctrx, this._bboxParams.ctry, this._bboxParams.ctrz);
		// var transPt = new THREE.Mesh(transPartBbox, MATERIALNORMAL);
		// transPt.position.copy(position);

		this._staticPt = booleanGeo(meshObj, transPart, SUBTRACT);
		this._staticPt = new THREE.Mesh(this._staticPt);
		this._staticPt.material = MATERIALOBSTACLE;
		scene.add(this._transPt);
		scene.add(this._staticPt);
		transPtParams.push(this._transPt);
		transPtParams.push(this._staticPt);

	}

	clearAll() {
		this.clear();
		for (var i = this._axis.length - 1; i >= 0; i--) {
			scene.remove(this._axis[i]);
		}
		scene.remove(this._obj);
	}
}