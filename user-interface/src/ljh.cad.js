/*
	cad generation library
	@author Jiahao Li http://ljhnick.github.io
*/

function polygonExtrude(Points, depth, centerPos) {
	var poly = new THREE.Shape();
	poly.moveTo(Points[0][0], Points[0][1]);
	for (var i = 1; i < Points.length; i++) {
		var x = Points[i][0];
		var y = Points[i][1];
		poly.lineTo(x, y);
	}
	poly.lineTo(Points[0][0], Points[0][1]);

	var extrudeSettings = {
		steps: 2,
		depth: depth,
		bevelEnabled: false,
		bevelThickness: 1,
		bevelSize: 1,
		bevelOffset: 0,
		bevelSegments: 1
	};

	var geometry = new THREE.ExtrudeGeometry(poly, extrudeSettings);
	geometry.center();
	var mesh = new THREE.Mesh(geometry);
	mesh.position.copy(centerPos);
	return mesh;
}

function polygonExtrudePoints(Points, depth) {
	var poly = new THREE.Shape();
	poly.moveTo(Points[0][0], Points[0][1]);

	var center
	var x_sum = Points[0][0];
	var y_sum = Points[0][1];
	var num = 1;
	for (var i = 1; i < Points.length; i++) {
		var x = Points[i][0];
		var y = Points[i][1];
		poly.lineTo(x, y);

		x_sum += x;
		y_sum += y;
		num += 1;
	}

	var center = new THREE.Vector3(x_sum/num, y_sum/num, 0);
	poly.lineTo(Points[0][0], Points[0][1]);

	var extrudeSettings = {
		steps: 2,
		depth: depth,
		bevelEnabled: false,
		bevelThickness: 1,
		bevelSize: 1,
		bevelOffset: 0,
		bevelSegments: 1
	};

	

	var geometry = new THREE.ExtrudeGeometry(poly, extrudeSettings);
	geometry.center();
	var mesh = new THREE.Mesh(geometry);
	mesh.position.copy(center);
	return mesh;
}

function booleanGeo(obj1, obj2, type) {
	if (obj1.type != 'Mesh') {
		obj1 = new THREE.Mesh(obj1);
	}
	obj1.updateMatrixWorld();
	obj1.geometry.applyMatrix4(obj1.matrixWorld);

	if (obj2.type != 'Mesh') {
		obj2 = new THREE.Mesh(obj2);
	}
	obj2.updateMatrixWorld();
	obj2.geometry.applyMatrix4(obj2.matrixWorld);

	var objCsg1 = new ThreeBSP(obj1.geometry);
	var objCsg2 = new ThreeBSP(obj2.geometry);

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
	geoBoolean = csgBoolean.toGeometry();
	// geoBoolean.applyMatrix(obj1.matrixWorld);
	return geoBoolean;
}

function ljhBoxMesh(width, height, center, lowerz, upperz) {
	var depth = upperz - lowerz;
	var box = new THREE.BoxGeometry(width, height, depth);
	box.center();
	var mesh = new THREE.Mesh(box);
	mesh.position.copy(new THREE.Vector3(center.x, center.y, lowerz+depth/2));

	return mesh;
}

function ljhBoxMeshFromPoints(xmin, xmax, ymin, ymax, zmin, zmax) {
	var center = new THREE.Vector3((xmin+xmax)/2, (ymin+ymax)/2, (zmin+zmax)/2);
	var mesh = ljhBoxMesh(xmax-xmin, ymax-ymin, center, zmin, zmax);
	return mesh;
}

function ljhShellMesh(mesh, parentMesh) {
	var mesh1 = mesh;
	var mesh2 = parentMesh;

	var bboxParams = getBoundingBoxEverything(mesh1);

	var center = new THREE.Vector3(bboxParams.ctrx, bboxParams.ctry, bboxParams.ctrz);
	var innerMesh = ljhBoxMesh(bboxParams.lenx - 5, bboxParams.leny - 5, center, bboxParams.cmin.z, bboxParams.cmax.z);

	var geo2 = mesh2.geometry.clone();
	var bboxParamsParent = getBoundingBoxEverything(mesh2);
	for (var i = 0; i < geo2.vertices.length; i++) {
		var x = geo2.vertices[i].x;
		var y = geo2.vertices[i].y;
		geo2.vertices[i].x = x*(1-5/bboxParamsParent.lenx);
		geo2.vertices[i].y = y*(1-5/bboxParamsParent.leny);
	}
	var geo2mesh = new THREE.Mesh(geo2);
	var shellGeo = booleanGeo(geo2mesh, innerMesh, INTERSECT);
	var shellMesh = new THREE.Mesh(shellGeo);
	var mesh1Shell = booleanGeo(mesh1, shellMesh, SUBTRACT);

	return new THREE.Mesh(mesh1Shell);
}

function ljhCylinderMesh(center, radius, depth) {
	var geo = new THREE.CylinderGeometry(radius, radius, depth, 32);
	geo.center();
	geo.rotateX(Math.PI/2);
	var mesh = new THREE.Mesh(geo);
	mesh.position.copy(center);
	return mesh;
}

function ljhCylinderMeshFromPoint(x, y, zmin, zmax, radius) {
	var center = new THREE.Vector3(x, y, (zmax+zmin)/2);
	var mesh = ljhCylinderMesh(center, radius, zmax-zmin);
	return mesh;
}

function ljhCylinderMeshX(y, z, xmin, xmax, radius) {
	var depth = xmax - xmin;
	var geo = new THREE.CylinderGeometry(radius, radius, depth, 32);
	geo.center();
	geo.rotateZ(-Math.PI/2);
	var center = new THREE.Vector3((xmin+xmax)/2, y, z);
	var mesh = new THREE.Mesh(geo);
	mesh.position.copy(center);
	return mesh;
}

function ljhCylinderMeshY(x, z, ymin, ymax, radius) {
	var depth = ymax - ymin;
	var geo = new THREE.CylinderGeometry(radius, radius, depth, 32);
	geo.center();
	var center = new THREE.Vector3(x, (ymin+ymax)/2, z);
	var mesh = new THREE.Mesh(geo);
	mesh.position.copy(center);
	return mesh;
}

function roundCorner(ctrx, ctry, cornerx, cornery, zmin, zmax) {
	var dX = Math.abs(cornerx - ctrx);
	var dY = Math.abs(cornery - ctry);
	var fillet = ljhCylinderMeshFromPoint(ctrx, ctry, zmin, zmax, Math.max(dX,dY));
	var filletCube = ljhBoxMeshFromPoints(Math.min(ctrx, cornerx), Math.max(ctrx, cornerx), Math.min(ctry, cornery), Math.max(ctry, cornery), zmin, zmax);
	var filletToCut = booleanGeo(filletCube, fillet, SUBTRACT);
	return new THREE.Mesh(filletToCut);
}

function revoluteJoint(ctrx, ctry, xmin, xmax, ymin, ymax, zmin, zmax, radius) {
	var cyl = ljhCylinderMeshFromPoint(ctrx, ctry, zmin, zmax, radius);
	var prism = ljhBoxMeshFromPoints(xmin, xmax, ymin, ymax, zmin, zmax);
	var joint = booleanGeo(cyl, prism, UNION);
	return new THREE.Mesh(joint);
}

function revoluteJointX(ctry, ctrz, xmin, xmax, ymin, ymax, zmin, zmax, radius) {
	var cyl = ljhCylinderMeshX(ctry, ctrz, xmin, xmax, radius);
	var prism = ljhBoxMeshFromPoints(xmin, xmax, ymin, ymax, zmin, zmax);
	var joint = booleanGeo(cyl, prism, UNION);
	return new THREE.Mesh(joint);
}
