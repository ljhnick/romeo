/*
	get the geometry from a mesh with transformation matrix applied
*/
function gettg(mesh) {
	mesh.updateMatrixWorld();
	var gt = mesh.geometry.clone();
	gt.applyMatrix4(mesh.matrixWorld);
	return gt;
}

/*
get the bounding box of a geometry
*/

function getBoundingBoxDimensions(obj) {
	var g = gettg(obj);// obj.geometry;
	g.computeBoundingBox();

	var lx = (g.boundingBox.max.x - g.boundingBox.min.x);
	var ly = (g.boundingBox.max.y - g.boundingBox.min.y);
	var lz = (g.boundingBox.max.z - g.boundingBox.min.z);

	return [lx, ly, lz];
}

function getBoundingBoxCenter(obj) {
	var g = obj.geometry;
	g.computeBoundingBox();
	var x = 0.5 * (g.boundingBox.max.x + g.boundingBox.min.x);
	var y = 0.5 * (g.boundingBox.max.y + g.boundingBox.min.y);
	var z = 0.5 * (g.boundingBox.max.z + g.boundingBox.min.z);
	return new THREE.Vector3(x, y, z);
}

function getBoundingSphereRadius(obj) {
	var gt = gettg(obj);
	gt.computeBoundingSphere();
	return gt.boundingSphere.radius;
}

function getBoundingBoxEverything(obj) {
	var gt = gettg(obj);
	gt.computeBoundingBox();
	var cmax = gt.boundingBox.max;
	var cmin = gt.boundingBox.min;
	var lenx = cmax.x - cmin.x;
	var leny = cmax.y - cmin.y;
	var lenz = cmax.z - cmin.z;
	var ctrx = 0.5 * (cmax.x + cmin.x);
	var ctry = 0.5 * (cmax.y + cmin.y);
	var ctrz = 0.5 * (cmax.z + cmin.z);

	return {
		cmax: cmax,
		cmin: cmin,
		lenx: lenx,
		leny: leny,
		lenz: lenz,
		ctrx: ctrx,
		ctry: ctry,
		ctrz: ctrz
	};
}

/*
	rotate an object towards a given direction
*/
function rotateObjTo(obj, dir, isReversed) {
	var yUp = new THREE.Vector3(0, 1, 0);
	var angleToRotate = yUp.angleTo(dir);
	var axisToRotate = new THREE.Vector3().crossVectors(yUp, dir).normalize();
	obj.rotateOnAxis(axisToRotate, isReversed == true ? angleToRotate * -1 : angleToRotate);
}


/*
	calculate the boolean operation of two object
*/
function boolean(obj1, obj2, type) {
	var objCsg1 = new ThreeBSP(obj1);
	var objCsg2 = new ThreeBSP(obj2);

	var csgBoolean = undefined;
	var meshBoolean = undefined;
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
	meshBoolean = csgBoolean.toMesh(csgBoolean, MATERIALNORMAL);
	return meshBoolean;
}
