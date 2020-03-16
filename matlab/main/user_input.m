% input = {type_of_transformable, {transformable part}, {obstacle alphaShpae}, {target points}, 
% {target orientation},}

% 1 for object fix, 2 for object tracking
type = 1; 

% x, y, z value of the bounding box, origin locates in the middle
% transformable = [80, 100, 40]; 
transformable = [100, 100, 60];

% obstacle bounding box, 3D
x11 = 50; x12 = -50; y11 = 50; y12 = -50; z11 = 30; z12 = 70;
x21 = 50; x22 = -50; y21 = 50; y22 = -50; z21 = -30; z22 = -70;
col1 = alphaShape([x11, x11, x12, x12, x11, x11, x12, x12]', [y11, y12, y12, y11, y11, y12, y12, y11]', [z11, z11, z11, z11, z12, z12, z12, z12]');
col2 = alphaShape([x21, x21, x22, x22, x21, x21, x22, x22]', [y21, y22, y22, y21, y21, y22, y22, y21]', [z21, z21, z21, z21, z22, z22, z22, z22]');
obstacle = {col1, col2}; 

% target points
tar_p = {[0, -150, -60], [-30, 0, 90]}; 
% tar_p = {[-100, 0, -40]};

% target ori, [0,0,0] for no requirement
% tar_ori = {[0, 1, 0;0, 0, -1; -1, 0, 0]}; 
tar_ori = {[0, 0, 0], [0, 0, 0]};


input = {type, transformable, obstacle, tar_p, tar_ori};