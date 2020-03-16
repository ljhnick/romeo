function [type_mat, transformable_mat, obstacle_mat, target_points_mat, target_ori_mat, T_final, IFSTRIP, POSITION, center, unfoldingPl] = parseData(input)
%PARSEDATA 此处显示有关此函数的摘要
%   此处显示详细说明

%% extract data
type = input.type;
transformable = input.transformable;
obstacle = input.obstacle;
points = input.points;

%% type
type_mat = type;
IFSTRIP = 0;
POSITION = 1;
unfoldingPl = 3;


center = transformable.center;
center = [center.x, center.y, center.z];

lenx = transformable.lenx;
leny = transformable.leny;
lenz = transformable.lenz;
%% check if it is a long strip object
% check if it is a long strip part
if lenx < 35
    if leny > lenz*3
        unfoldingPl = 3;
        IFSTRIP = 1;
    elseif lenz > leny*3
        unfoldingPl = 2;
        IFSTRIP = 1;
    end
elseif leny < 35
    if lenx > lenz*3
        unfoldingPl = 3;
        IFSTRIP = 1;
    elseif lenz > lenx*3
        unfoldingPl = 1;
        IFSTRIP = 1;
    end
elseif lenz < 35
    if lenx > leny*3
        unfoldingPl = 2;
        IFSTRIP = 1;
    elseif leny > lenx*3
        unfoldingPl = 1;
        IFSTRIP = 1;
    end
end


%% if it is a long strip object
if IFSTRIP == 1
    if unfoldingPl == 1
        T = roty(-90);
    end
    if unfoldingPl == 2
        T = rotx(90);
    end
    if unfoldingPl == 3
        T = eye(3);
    end
    
    if type == 2
        T_final = rotz(90)*rotx(90)*T;
    else
        T_final = T;
    end

    bounding = [lenx, leny, lenz];
    
    transformable_mat = abs(T*bounding')';
    
    center = (T_final*center')';
    
    num = length(points);

    for i = 1:num
        p = [points(i).pos.x, points(i).pos.y, points(i).pos.z];
        p = (T_final*p')';
        target_p{i} = p - center;
    end
    
    for i = 1:num
        ori = [points(i).ori.x, points(i).ori.y, points(i).ori.z];
        ori = (T_final*ori')';
        target_ori{i} = ori;
    end
    
    % obstacle type 2
    num_obs = length(obstacle);
    for i = 1:num_obs
        obs_max = [obstacle(i).xmax*0.9, obstacle(i).ymax*0.9, obstacle(i).zmax*0.9];
        obs_min = [obstacle(i).xmin*0.9, obstacle(i).ymin*0.9, obstacle(i).zmin*0.9];
        obs_max = (T_final*obs_max')';
        obs_min = (T_final*obs_min')';

        xmax = obs_max(1)-center(1);
        ymax = obs_max(2)-center(2);
        zmax = obs_max(3)-center(3);
        xmin = obs_min(1)-center(1);
        ymin = obs_min(2)-center(2);
        zmin = obs_min(3)-center(3);

        obs{i} = alphaShape([xmax, xmax, xmin, xmin, xmax, xmax, xmin, xmin]', [ymax, ymin, ymin, ymax, ymax, ymin, ymin, ymax]', [zmax, zmax, zmax, zmax, zmin, zmin, zmin, zmin]'); 
    end

    
    
    target_points_mat = target_p;
    target_ori_mat = target_ori;
    obstacle_mat = obs;
    
    return;
end

    %% if it is not a long strip object
if type == 1
    % transformable part
    center = transformable.center;
    center = [center.x, center.y, center.z];

    lenx = transformable.lenx;
    leny = transformable.leny;
    lenz = transformable.lenz;

    bounding = [lenx, leny, lenz];

    axis = transformable.axis;
    axis = [axis.x, axis.y, axis.z];
    
    index = find(axis~=0);
    if index == 1
        T = roty(-90);
        bounding = (roty(-90)*bounding')';
        center = (roty(-90)*center')';
        unfoldingPl = 1;
    elseif index == 2
        T = rotx(90);
        bounding = (rotx(90)*bounding')';
        center = (rotx(90)*center')';
        unfoldingPl = 2;
    else
        T = eye(3);
        unfoldingPl = 3;
    end

    transformable_mat = abs(bounding);
    
    

    % target points
    num = length(points);

    for i = 1:num
        p = [points(i).pos.x, points(i).pos.y, points(i).pos.z];
        p = (T*p')';
        target_p{i} = p - center;
    end
    
    for i = 1:numel(target_p)
        index1(i) = target_p{i}(1) > 0 && target_p{i}(2) > 0;
        index2(i) = target_p{i}(1) < 0 && target_p{i}(2) > 0;
        index3(i) = target_p{i}(1) < 0 && target_p{i}(2) < 0;
        index4(i) = target_p{i}(1) > 0 && target_p{i}(2) < 0;
    end
    
    if numel(find(index1)) == 0
        T_1 = eye(3);
        POSITION = 1;
    elseif numel(find(index2)) == 0
        T_1 = rotz(-90);
        POSITION = 2;
    elseif numel(find(index3)) == 0
        T_1 = rotz(-180);
        POSITION = 3;
    elseif numel(find(index4)) == 0
        T_1 = rotz(90);
        POSITION = 4;
    else
        T_1 = eye(3);
    end
    
    T_final = T_1*T;

    for i = 1:numel(target_p)
        target_p{i} = (T_1*target_p{i}')';
    end
    
    % target orientation
    for i = 1:num
        ori = [points(i).ori.x, points(i).ori.y, points(i).ori.z];
        ori = (T_final*ori')';
        target_ori{i} = ori;
    end

    
    % obstacle

    num_obs = length(obstacle);
    for i = 1:num_obs
        obs_max = [obstacle(i).xmax*0.9, obstacle(i).ymax*0.9, obstacle(i).zmax*0.9];
        obs_min = [obstacle(i).xmin*0.9, obstacle(i).ymin*0.9, obstacle(i).zmin*0.9];
        obs_max = (T_final*obs_max')';
        obs_min = (T_final*obs_min')';

        xmax = obs_max(1)-center(1);
        ymax = obs_max(2)-center(2);
        zmax = obs_max(3)-center(3);
        xmin = obs_min(1)-center(1);
        ymin = obs_min(2)-center(2);
        zmin = obs_min(3)-center(3);

        obs{i} = alphaShape([xmax, xmax, xmin, xmin, xmax, xmax, xmin, xmin]', [ymax, ymin, ymin, ymax, ymax, ymin, ymin, ymax]', [zmax, zmax, zmax, zmax, zmin, zmin, zmin, zmin]'); 
    end

    
    
    target_points_mat = target_p;
    target_ori_mat = target_ori;
    obstacle_mat = obs;
    

elseif type == 2
    %% type 2
    center = transformable.center;
    center = [center.x, center.y, center.z];

    lenx = transformable.lenx;
    leny = transformable.leny;
    lenz = transformable.lenz;

    bounding = [lenx, leny, lenz];

    axis = transformable.axis;
    axis = [axis.x, axis.y, axis.z];
    
    num_obs = length(obstacle);
    
    
%     if num_obs > 1
%         % more than 1 obstacle, means the transformable part is in the
%         % middle, therefor the select plane is the unfolding plane
%         index = find(axis~=0);
%         if index == 1
%             T = roty(-90);
%         elseif index == 2
%             T = rotx(90);
%         else
%             T = eye(3);
%         end
%         T1 = rotz(90)*rotx(90)*T;
%     else
        % less than 1 obstacle
    index = find(axis~=0);
    if index == 1
        if leny > lenz
            T = eye(3);
            unfoldingPl = 3;
        else
            T = rotx(90);
            unfoldingPl = 2;
        end
    elseif index == 2
        if lenx > lenz
            T = eye(3);
            unfoldingPl = 3;
        else
            T = roty(-90);
            unfoldingPl = 1;
        end
    else
        if lenx > leny
            T = rotx(90);
            unfoldingPl = 2;
        else
            T = roty(-90);
            unfoldingPl = 1;
        end
    end

    T1 = rotz(90)*rotx(90)*T;
%     end
    
    transformable_mat = abs((T*bounding')');
    bounding = (T1*bounding')';
    center = (T1*center')';
    
    % target points type 2
    num = length(points);

    for i = 1:num
        p = [points(i).pos.x, points(i).pos.y, points(i).pos.z];
        p = (T1*p')';
        target_p{i} = p - center;
    end
    
%     for i = 1:numel(target_p)
%         index1(i) = target_p{i}(1) > 0 && target_p{i}(2) > 0;
%         index2(i) = target_p{i}(1) < 0 && target_p{i}(2) > 0;
%         index3(i) = target_p{i}(1) < 0 && target_p{i}(2) < 0;
%         index4(i) = target_p{i}(1) > 0 && target_p{i}(2) < 0;
%     end
    
%     if numel(find(index1)) == 0
%         T_1 = eye(3);
%     elseif numel(find(index2)) == 0
%         T_1 = rotz(-90);
%     elseif numel(find(index3)) == 0
%         T_1 = rotz(-pi);
%     elseif numel(find(index4)) == 0
%         T_1 = rotz(90);
%     else
%         T_1 = eye(3);
%     end
    T_1 = eye(3);
    T_final = T_1*T1;

%     for i = 1:numel(target_p)
%         target_p{i} = (T_1*target_p{i}')';
%     end
    
    % target orientation type 2
    for i = 1:num
        ori = [points(i).ori.x, points(i).ori.y, points(i).ori.z];
        ori = (T_final*ori')';
        target_ori{i} = ori;
    end
    
    % obstacle type 2
    for i = 1:num_obs
        obs_max = [obstacle(i).xmax*0.9, obstacle(i).ymax*0.9, obstacle(i).zmax*0.9];
        obs_min = [obstacle(i).xmin*0.9, obstacle(i).ymin*0.9, obstacle(i).zmin*0.9];
        obs_max = (T_final*obs_max')';
        obs_min = (T_final*obs_min')';

        xmax = obs_max(1)-center(1);
        ymax = obs_max(2)-center(2);
        zmax = obs_max(3)-center(3);
        xmin = obs_min(1)-center(1);
        ymin = obs_min(2)-center(2);
        zmin = obs_min(3)-center(3);

        obs{i} = alphaShape([xmax, xmax, xmin, xmin, xmax, xmax, xmin, xmin]', [ymax, ymin, ymin, ymax, ymax, ymin, ymin, ymax]', [zmax, zmax, zmax, zmax, zmin, zmin, zmin, zmin]'); 
    end

    
    
    target_points_mat = target_p;
    target_ori_mat = target_ori;
    obstacle_mat = obs;

    
end
