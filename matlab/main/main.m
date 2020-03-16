clear;
clc;
tic

user_input; % load user input from the interface

% extract the values
type = input{1};
transformable = input{2};
obstacle = input{3};
target_points = input{4};
target_ori = input{5};


%% generate the transformable arm
% trans_arm = transformPart(type, transformable, obstacle, target_points, target_ori);
length = transformable(1);
width = transformable(2);

% based on the 
if type == 1
    P0 = [0, width/2, 0];
else
    P0 = [0, 0, -width/2];
end

for i = 1:numel(target_points)
    target_points{i} = target_points{i}-P0;
end

if type == 1
    [DH, q0, q] = dh_obj_fixed(length, width); % generalized dh parameters
elseif type == 2
    [DH, q0, q] = dh_obj_moving(length, width); % generalized dh parameters
end

trans_arm = SerialLink(DH);
[T, T_all] = simplified_T(DH);

% test for different configuration
% X
[ws_x, ori_x, Q_x] = generateWorkspace(type, DH, T, T_all, q, q0, 'x', P0, obstacle);
min_dist_x = findNearestPoint(ws_x, ori_x, target_points, target_ori);

% Y
[ws_y, ori_y, Q_y] = generateWorkspace(type, DH, T, T_all, q, q0, 'y', P0, obstacle);
min_dist_y = findNearestPoint(ws_y, ori_y, target_points, target_ori);

% Z
[ws_z, ori_z, Q_z] = generateWorkspace(type, DH, T, T_all, q, q0, 'z', P0, obstacle);
min_dist_z = findNearestPoint(ws_z, ori_z, target_points, target_ori);

[min_dist, I] = compare_res({min_dist_x, min_dist_y, min_dist_z});
Q_all = {Q_x, Q_y, Q_z};
Q = Q_all{I};

for i = 1:numel(Q)
    Q{i} = squeeze(Q{i});
end

toc
% find the indices of the corresponding point and angles

for i = 1:numel(min_dist)
    n = min_dist{i}{3}(1);
    m = min_dist{i}{3}(2);
    k = min_dist{i}{3}(3);
    j = min_dist{i}{3}(4);

    for index = 1:7
        q1(index) = Q{index}(n,m,k,j);
    end
    figure;
%     trans_arm.plot(q1);
end








