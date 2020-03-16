/**
 * routines to generate 3d things
 * 	
 * @author Jiahao Li
 */

"use strict";

var SUBTRACT = 0;
var UNION = 1;
var INTERSECT = 2;

/*
	base class for a range of geometric things
*/

class ljhThing {
	constructor(m) {
		this._g = undefined; // the original geometry, always!
		this._m = m;

		this._weight = undefined;
	}

	get g() {
		return this._g;
	}

	get gt() {
		this._m.updateMatrixWorld();
		var gTransformed = this._g.clone();
		gTransformed.applyMatrix(this._m.matrixWorld);
		return gTransformed;
	}

	get m() {
		return this._m;
	}

	static _boolean(obj1, obj2, type) {
		var objCsg1 = new THREE.CSG.fromMesh(obj1);
		var objCsg2 = new THREE.CSG.fromMesh(obj2);

		var csgBoolean = undefined;
		switch (type) {
			case SUBTRACT:
				csgBoolean = objCsg1.subtract(objCsg2);
				break;
			case UNION:
				csgBoolean = objCsg1.union(objCsg2);
				break;
			case INTERSECT:
				csgBoolean = objCsg1.intersect(objCsg2);
				break;
		}
		// csgBoolean = THREE.CSG.toMesh(csg, MATERIALNORMAL);
		return csgBoolean;
	}

	static subtract(obj1, obj2, material) {
		return ljhThing._boolean(obj1, obj2, SUBTRACT).toMesh(material == undefined ? MATERIALNORMAL.clone() : material.clone());
	}

	static union(obj1, obj2, material) {
		return ljhThing._boolean(obj1, obj2, UNION).toMesh(material == undefined ? MATERIALNORMAL.clone() : material.clone());
	}

	static intersect(obj1, obj2, material) {
		return ljhThing._boolean(obj1, obj2, INTERSECT).toMesh(material == undefined ? MATERIALNORMAL.clone() : material.clone());
	}

	/*
		draw and return a line
	*/
	static line(v, dir, mat) {
		var clr = 0xff0000;
		var geometry = new THREE.Geometry();
		geometry.vertices.push(v);
		geometry.vertices.push(v.clone().add(dir.clone().normalize().multiplyScalar(1000)));
		var material = (mat == undefined) ? new THREE.LineBasicMaterial({
			color: clr
		}) : mat;
		var line = new THREE.Line(geometry, material);
		return line;
	}
}

class ljhRectVolume extends ljhThing {
	// width, thickness, length
	constructor(w, t, l, material) {
		super();
		this._g = new THREE.BoxGeometry(w, t, l);
		this._m = new THREE.Mesh(this._g, material == undefined ? MATERIALNORMAL.clone() : material.clone())
	}
}

class ljhSphere extends ljhThing {
	constructor(r, material, highFi) {
		super();
		this._r = r;
		this._g = highFi == true ? new THREE.SphereGeometry(r, 32, 32) : new THREE.SphereGeometry(r, 8, 8);
		this._m = new THREE.Mesh(this._g, material == undefined ? MATERIALNORMAL.clone() : material.clone());
	}
}