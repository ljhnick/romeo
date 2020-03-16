/*
	the third step: generate robotic arm and visualize workspace
	@author Jiahao Li http://ljhnick.github.io
*/


class Workspace {
	constructor(target) {
		this._target = target;
		this._data = target._data;
		this._update(this._data);
		this._wsVoxel = [];
	}

	_update(data) {
		var _self = this;
		// var recMsgMat;
		// A new XMLHttpRequest object
    	var request = new XMLHttpRequest();
    	//Use MPS RESTful API to specify URL
    	var url = "http://localhost:9910/version5_nopos/main_func";
  	 	// var url = "http://localhost:9910/version5_noncol/main_func";
  	 	// var url = "http://localhost:9910/test3/testServer";

  	 	request.open("POST", url);

  	 	//Use MPS RESTful API to set Content-Type
    	request.setRequestHeader("Content-Type", "application/json");
    	var params = { "nargout":1,
                   "rhs": [JSON.stringify(tarPoints._data)] };

        request.onload = function()
	    {   //Use MPS RESTful API to check HTTP Status
	        if (request.status == 200) 
	        {
	            // Deserialization: Converting text back into JSON object
	            // Response from server is deserialized 
	            var result = JSON.parse(request.responseText);
	            console.log('success');
	            // console.log(result);
	            _self._recMsgMat = result;
	            _self._parseMatlabData(result);
	            _self._generateWorkspace(_self._ws);
	            
	        }

	    }
	    //Serialization: Converting JSON object to text prior to sending request
	    request.send(JSON.stringify(params));
	}

	_parseMatlabData(data) {
		var allData = data.lhs[0].mwdata;
		var allQ = allData.allQ[0].mwdata;
		var ws = allData.workspace[0].mwdata;
		var tarQ = allData.targetQ[0].mwdata;
		var q0 = allData.q0[0].mwdata;
		var jointType = allData.jointType[0].mwdata[0];
		var basePos = allData.basePos[0].mwdata[0];
		var unfoldPl = allData.unfoldingPl[0].mwdata[0];
		var IFSTRIP = allData.IFSTRIP[0].mwdata[0];

		var allQArray = [];
		for (var i = 0; i < 7; i++) {
			var Q = allQ[i].mwdata;
			allQArray.push(Q);
		}
		this._allQ = allQArray;

		var tarQArray = [];
		for (var i = 0; i < tarQ.length; i++) {
			tarQArray.push(tarQ[i].mwdata);
		}
		this._tarQ = tarQArray;

		// var q0Array = [];
		// for (var i = 0; i < q0.length; i++) {
		// 	q0Array.push(q0[i].mwdata);
		// }
		this._q0 = q0;

		this._ws = {'x': ws[0].mwdata,
					'y': ws[1].mwdata,
					'z': ws[2].mwdata};
		this._jointType = jointType;
		this._basePos = basePos;
		this._unfoldPl = unfoldPl;
		this._IFSTRIP = IFSTRIP;

	}

	_generateWorkspace(ws) {
		var x = ws.x;
		var y = ws.y;
		var z = ws.z;
		var scale = 15;
		x = roundArray(x, scale);
		y = roundArray(y, scale);
		z = roundArray(z, scale);
		var voxCoor = reduceNum(x, y, z);
		this._wsCoor = voxCoor;
		this._plotVoxel(this._wsCoor, scale);
	}

	_plotVoxel(voxelData, scale) {
		for (var i = 0; i < voxelData.length; i++) {
			var x = voxelData[i][0];
			var y = voxelData[i][1];
			var z = voxelData[i][2];

			// var center = new THREE.Vector3(x+scale/2, y+scale/2, z+scale/2);
			var center = new THREE.Vector3(x, y, z);
			// var voxel = new THREE.BoxGeometry(scale, scale, scale);
			var voxel = new THREE.SphereGeometry(2, 4, 2);
			var voxMesh = new THREE.Mesh(voxel, MATERIALVOXEL);
			voxMesh.position.copy(center);
			this._wsVoxel.push(voxMesh);
			scene.add(voxMesh);
		}
	}

	clear() {
		for (var i = 0; i < this._wsVoxel.length; i++) {
			scene.remove(this._wsVoxel[i]);
		}

	}

}