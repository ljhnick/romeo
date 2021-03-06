/**
 * 3d ui widgets for selecting or specifying objects
 * 	
 * @author Xiang 'Anthony' Chen http://xiangchen.me
 */

"use strict";

/*
	a base class for a range of bounding box based UI
*/

class BboxUI {
	constructor(obj) {
		this._obj = obj;
		this._bboxParams = getBoundingBoxEverything(obj);
		this._update(this._bboxParams);
	}

	_addPlane(lx, ly, lz, nml, cx, cy, cz) {
		var pl = new ljhRectVolume(lx, ly, lz, this._visible == true ? MATERIALGREEN : MATERIALCONTRAST);
		// scaleAroundCenter(pl.m, 1.1);
		rotateObjTo(pl.m, nml);
		pl.m.normal = nml;
		pl.m.position.copy(new THREE.Vector3(cx, cy, cz));
		scene.add(pl.m);
		pl.m.selector = this;
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
		var transPartBbox = new THREE.BoxGeometry(this._bboxParams.lenx, this._bboxParams.leny, this._bboxParams.lenz);
		var position = new THREE.Vector3(this._bboxParams.ctrx, this._bboxParams.ctry, this._bboxParams.ctrz);
		var transPt = new THREE.Mesh(transPartBbox, MATERIALNORMAL);
		transPt.position.copy(position);
		var geoObj = new THREE.Geometry().fromBufferGeometry(this._obj.geometry);
		var meshObj = new THREE.Mesh(geoObj, MATERIALNORMAL);

		this._transPt = boolean(meshObj, transPt, INTERSECT);

		// scene.add(this._transPt)
	}

	endStep() {
		this.clearAll();
		this._transPt.material = MATERIALNORMAL;
		var geoObj = new THREE.Geometry().fromBufferGeometry(this._obj.geometry);
		var meshObj = new THREE.Mesh(geoObj, MATERIALNORMAL);

		var transPartBbox = new THREE.BoxGeometry(this._bboxParams.lenx, this._bboxParams.leny, this._bboxParams.lenz);
		var position = new THREE.Vector3(this._bboxParams.ctrx, this._bboxParams.ctry, this._bboxParams.ctrz);
		var transPt = new THREE.Mesh(transPartBbox, MATERIALNORMAL);
		transPt.position.copy(position);

		this._staticPt = boolean(meshObj, transPt, SUBTRACT);
		this._staticPt.material = MATERIALCONTRAST;
		scene.add(this._transPt);
		scene.add(this._staticPt);
	}

	clearAll() {
		this.clear();
		for (var i = this._axis.length - 1; i >= 0; i--) {
			scene.remove(this._axis[i]);
		}
		scene.remove(this._obj);
	}
}