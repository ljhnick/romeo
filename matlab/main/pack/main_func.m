function [ output_data ] = main_func( input )
%MAIN_FUNC Summary of this function goes here
%   Detailed explanation goes here

% user_input; % load user input from the interface

input_data = jsondecode(input);
result = parseData(input_data);

type = result.type;
transformable = result.transformable;
obstacle = result.obstacle;
target_points = result.targetPoints;
target_ori = result.targetOri;
T_final = result.T_final;
IFSTRIP = result.IFSTRIP;
POSITION = result.POSITION;
center = result.center;
unfolding = result.unfoldingPl;


%% generate the transformable arm
% trans_arm = transformPart(type, transformable, obstacle, target_points, target_ori);
length = transformable(1)*0.8;
width = transformable(2)*0.8;
% based on the 

if IFSTRIP == 0
    if type == 1
        P0 = [0, width/2, 0];
    else
        P0 = [0, 0, -width/2];
    end
    
    for i = 1:numel(target_points)
%         target_points{i} = target_points{i}-P0;
    end

    if type == 1
        [DH, q0, q] = dh_obj_fixed(length, width); % generalized dh parameters
    elseif type == 2
        [DH, q0, q] = dh_obj_moving(length, width); % generalized dh parameters
    end
    
elseif IFSTRIP == 1
    if type == 2
        P0 = [0, 0, width/2];
    end
    
    for i = 1:numel(target_points)
        target_points{i} = target_points{i}-P0;
    end
    
    [DH, q0, q] = dh_obj_strip(length, width);
end

% trans_arm = SerialLink(DH);
% [T, T_all] = simplified_T(DH);

% test for different configuration
% X
[ws_x, ori_x, Q_x] = generateWorkspace(type, DH, q, q0, 'x', P0, obstacle, IFSTRIP);
min_dist_x = findNearestPoint(ws_x, ori_x, target_points, target_ori);

% Y
[ws_y, ori_y, Q_y] = generateWorkspace(type, DH, q, q0, 'y', P0, obstacle, IFSTRIP);
min_dist_y = findNearestPoint(ws_y, ori_y, target_points, target_ori);

% Z
[ws_z, ori_z, Q_z] = generateWorkspace(type, DH, q, q0, 'z', P0, obstacle, IFSTRIP);
min_dist_z = findNearestPoint(ws_z, ori_z, target_points, target_ori);

[min_dist, I] = compare_res({min_dist_x, min_dist_y, min_dist_z});
Q_all = {Q_x, Q_y, Q_z};
Q = Q_all{I};
ws_all = {ws_x, ws_y, ws_z};
WS = ws_all{I};
WS = T_final\[WS{1}+center(1);WS{2}+center(2);WS{3}+center(3)];
WS = {WS(1,:), WS(2,:), WS(3,:)};

for i = 1:numel(Q)
    Q{i} = reshape(Q{i}, 1, []);
end
% find the indices of the corresponding point and angles

for i = 1:numel(min_dist)
    n = min_dist{i}{3}(1);

    for index = 1:7
        q_target{i}(index) = Q{index}(n);
    end
    
    nearestPoint{i} = (T_final\(min_dist{i}{2}+center)')';
%     figure(i);
%     trans_arm.plot(q_target{i});
end



output_data = struct('workspace', {WS}, ...
                     'jointType', I, ...
                     'allQ', {Q}, ...
                     'targetQ', {q_target}, ...
                     'q0', q0, ...
                     'basePos', POSITION, ...
                     'unfoldingPl', unfolding, ...
                     'IFSTRIP', IFSTRIP, ...
                     'nearestPoint', {nearestPoint});

end

