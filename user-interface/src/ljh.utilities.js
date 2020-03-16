

/*
 *	function for performing raycasting
 */
function rayCast(x, y, objs) {
	var rayCaster = new THREE.Raycaster();
	var vector = new THREE.Vector3();
	vector.set((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1, 0.5);
	var projector = new THREE.Projector();
	vector.unproject(camera);
	// controlPanel.log(vector);
	// vector.unproject( camera );
	rayCaster.ray.set(camera.position, vector.sub(camera.position).normalize());
	return rayCaster.intersectObjects(objs);
}


/*
	load models from stl binary/ascii data
*/
function loadStl(data) {
	var stlLoader = new THREE.STLLoader();
	var geometry = stlLoader.parse(data);
	var object = new THREE.Mesh(geometry, MATERIALNORMAL);
	scene.add(object);

	var dims = getBoundingBoxDimensions(object);
	var ctr = getBoundingBoxCenter(object);

	// reposition the ground & grid
	gGround.position.y -= dims[1] * 0.55;
	gGrid.position.y -= dims[1] * 0.55;

	// relocate the camera
	var r = Math.max(25, getBoundingSphereRadius(object));
	camera.position.copy(gPosCam.clone().normalize().multiplyScalar(r * 2));

	// re-lookAt for the camera
	gMouseCtrls.target = new THREE.Vector3(0, 0, 0);

	// store the object
	objects.push(object);

	var loader = new THREE.STLLoader();
	loader.load( 'stl/motor.stl', function ( geometry ) {
	    var mesh = new THREE.Mesh( geometry, MATERIALOBSTACLE );
	    MOTOR = mesh;
	});	

}

/*
	add axis onto the mesh
*/
function addAxisHelper(object, length) {
	var origin = new THREE.Vector3(object.position.x, object.position.y, object.position.z);

	// add X Y Zaxis
	var dirX = new THREE.Vector3(1, 0, 0);
	var dirY = new THREE.Vector3(0, 1, 0);
	var dirZ = new THREE.Vector3(0, 0, 1);

	// add color for different axes
	var hexX = 0xff0000;
	var hexY = 0x00ff00;
	var hexZ = 0x0000ff;

	var axisX = new THREE.ArrowHelper(dirX, origin, length, hexX, length/2, length/3);
	var axisY = new THREE.ArrowHelper(dirY, origin, length, hexY, length/2, length/3);
	var axisZ = new THREE.ArrowHelper(dirZ, origin, length, hexZ, length/2, length/3);

	scene.add(axisX);
	scene.add(axisY);
	scene.add(axisZ);

	var axisHelp = [axisX, axisY, axisZ];

	return axisHelp;

}

/*
	add an arrow
*/
function addAnArrow (center, vector) {
	var len = vector.length();
	vector.normalize();
	var color = 0xff0000;
	var arrow = new THREE.ArrowHelper(vector, center, len*2, color, len/2, len/5);
	return arrow;
}

/*
	select and highlight the hovering axis
*/
function highlightAxis(x, y, axis) {
	// select an axis, if there is any
	var intsX = rayCast(x, y, axis[0].children);
	var intsY = rayCast(x, y, axis[1].children);
	var intsZ = rayCast(x, y, axis[2].children);
	
	var axisSel = '';
	if (intsX.length > 0) {
		axisSel = 'x';
	} else if (intsY.length > 0) {
		axisSel = 'y';
	} else if (intsZ.length > 0) {
		axisSel = 'z';
	} else {
		axisSel = undefined;
	}

	if (axisSel == 'x') {
		axisBboxUI._axis[1].visible = false;
		axisBboxUI._axis[2].visible = false;
	} else if (axisSel == 'y') {
		axisBboxUI._axis[0].visible = false;
		axisBboxUI._axis[2].visible = false;
	} else if (axisSel == 'z') {
		axisBboxUI._axis[0].visible = false;
		axisBboxUI._axis[1].visible = false;
	} else {
		axisBboxUI._axis[0].visible = true;
		axisBboxUI._axis[1].visible = true;
		axisBboxUI._axis[2].visible = true;
	}

	return axisSel;
}


/*
 *	function for performing raycasting
 */
function rayCast(x, y, objs) {
	var mouse = new THREE.Vector2();
	mouse.x = (x / window.innerWidth) * 2 - 1;
	mouse.y = - (y / window.innerHeight) * 2 + 1;

	var raycaster = new THREE.Raycaster();
	raycaster.setFromCamera(mouse, camera);

	var intersects = raycaster.intersectObjects(objs);
	return intersects
}

/*
	hide a ui element
*/
function hideElm(elm) {
	if (elm.is(":visible") == true) {
		elm.hide();
	}
}

/*
	show a ui element
*/
function showElm(elm, actionUponShow) {
	if (elm.is(":visible") == false) {
		elm.show('slow');
		try {
			actionUponShow();
		} catch (e) {

		}
	}
}

/*
	find obstacle area
*/

function findObstacle (target, obj, normal) {
	var obs = [];
	var tarBboxParams = getBoundingBoxEverything(target);
	var objBboxParams = getBoundingBoxEverything(obj);
	var tar_x_max = tarBboxParams.cmax.x;
	var tar_y_max = tarBboxParams.cmax.y;
	var tar_z_max = tarBboxParams.cmax.z;
	var tar_x_min = tarBboxParams.cmin.x;
	var tar_y_min = tarBboxParams.cmin.y;
	var tar_z_min = tarBboxParams.cmin.z;

	var obj_x_max = objBboxParams.cmax.x;
	var obj_y_max = objBboxParams.cmax.y;
	var obj_z_max = objBboxParams.cmax.z;
	var obj_x_min = objBboxParams.cmin.x;
	var obj_y_min = objBboxParams.cmin.y;
	var obj_z_min = objBboxParams.cmin.z;

	var nml = [normal.x, normal.y, normal.z];
	var axis = nml.findIndex((element) => element != 0);
	switch (axis) {
		case 0:
			if (tar_x_max != obj_x_max) {
				var obs1 = {'xmax': obj_x_max,
							'xmin': tar_x_max,
							'ymax': obj_y_max,
							'ymin': obj_y_min,
							'zmax': obj_z_max,
							'zmin': obj_z_min};
				obs.push(obs1);
			}

			if (tar_x_min != obj_x_min) {
				var obs2 = {'xmax': tar_x_min,
							'xmin': obj_x_min,
							'ymax': obj_y_max,
							'ymin': obj_y_min,
							'zmax': obj_z_max,
							'zmin': obj_z_min};
				obs.push(obs2);
			}
			break;
		case 1:
			if (tar_y_max != obj_y_max) {
				var obs1 = {'xmax': obj_x_max,
							'xmin': obj_x_min,
							'ymax': obj_y_max,
							'ymin': tar_y_max,
							'zmax': obj_z_max,
							'zmin': obj_z_min};
				obs.push(obs1);
			}
			if (tar_y_min != obj_y_min) {
				var obs2 = {'xmax': obj_x_max,
							'xmin': obj_x_min,
							'ymax': tar_y_min,
							'ymin': obj_y_min,
							'zmax': obj_z_max,
							'zmin': obj_z_min};
				obs.push(obs2)
			}
			break;
		case 2:
			if (tar_z_max != obj_z_max) {
				var obs1 = {'xmax': obj_x_max,
							'xmin': obj_x_min,
							'ymax': obj_y_max,
							'ymin': obj_y_min,
							'zmax': obj_z_max,
							'zmin': tar_z_max};
				obs.push(obs1);
			}
			if (tar_z_min != obj_z_min) {
				var obs2 = {'xmax': obj_x_max,
							'xmin': obj_x_min,
							'ymax': obj_y_max,
							'ymin': obj_y_min,
							'zmax': tar_z_min,
							'zmin': obj_z_min};
				obs.push(obs2);
			}
			break;
	}
	return obs;
}

/*
	round an array
*/
function roundArray(array, scale) {
	for (var i = 0; i < array.length; i++) {
		array[i] = Math.round(array[i]/scale)*scale;
	}
	return array;
}

/*
	remove duplicate coordinates
*/
function reduceNum(x, y, z) {
	var coor = [];
	for (var i = 0; i < x.length; i++) {
		var local = JSON.stringify([x[i], y[i], z[i]]);
		coor.push(local);
	}

	var removedCoor = Array.from(new Set(coor));
	for (var i = 0; i < removedCoor.length; i++) {
		removedCoor[i] = JSON.parse(removedCoor[i]);
	}
	return removedCoor;
}

// save file
function save( blob, filename ) {

	saveSTL.href = URL.createObjectURL( blob );
	saveSTL.download = filename;
	saveSTL.click();

}

