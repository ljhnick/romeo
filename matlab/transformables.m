clear;
clc;


tic
user_input;
%% information from the interaction part
% calculate the unfolding plane bounding box
length = 100;
width = 100;

% desire_points = {[50, -120 ,-30], [0, -50, -10]};
desire_points = {[-250, 0 ,-30], [0, -30, 100]};
des_ori = {[0, 0, 1], [0, 0, 0]};

interval = 0.2;
type_of_movement = 2;
%% calculate workspace for different configuration of the robotic arm
% object fixed configuration

if type_of_movement == 1
    [DH, q0] = dh_obj_fixed(length, width); % generalized dh parameters
    
    transformable_arm = SerialLink(DH);
    
    T = simplified_T(DH);
    % transformable_arm.plot(q0)
    
    q1 = (-pi:interval:0)+q0(1);
    q2 = (-pi:interval:0)+q0(2);
    q3 = (-pi/2:interval:pi/2)+q0(3);
    q4 = (-pi/2:interval:pi/2)+q0(4);
    q5 = (-pi:interval:0)+q0(5);
    q6 = (-pi:interval:0)+q0(6);
    q7 = 0+q0(7);
    
    % ZZZZ
    q_z = {q1, q2, q0(3), q0(4), q5, q6, q7};
    [ws_z, ori_end_z, Q_z] = plotworkspace(DH, q_z, T);
    
    for i = 1:numel(desire_points)
        min_dist_p_z{i} = nearest_point(ws_z, ori_end_z, desire_points{i});
    end
    
    % ZXZZ
    q_x = {q1, q0(2), q3, q0(4), q5, q6, q7};
    [ws_x, Q_x] = plotworkspace(DH, q_x, T);
    
    for i = 1:numel(desire_points)
        min_dist_p_x{i} = nearest_point(ws_x, desire_points{i});
    end
    
    % ZYZZ
    q_y = {q1, q0(2), q0(3), q4, q5, q6, q7};
    [ws_y, Q_y] = plotworkspace(DH, q_y, T);
    
    for i = 1:numel(desire_points)
        min_dist_p_y{i} = nearest_point(ws_y, desire_points{i});
    end
    
    % compare results
    
    [min_dist, I] = compare_res({min_dist_p_x, min_dist_p_y, min_dist_p_z});
    Q_all = {Q_x, Q_y, Q_z};
    Q = Q_all{I};
    
    for i = 1:numel(Q)
        Q{i} = squeeze(Q{i});
    end
    
    % find the indices of the corresponding point and angles
    
    n = min_dist{1}{3}(1);
    m = min_dist{1}{3}(2);
    k = min_dist{1}{3}(3);
    j = min_dist{1}{3}(4);
    
    for i = 1:7
        q(i) = Q{i}(n,m,k,j);
    end
    
    transformable_arm.plot(q);
    hold on
    plot3(desire_points{1}(1), desire_points{1}(2), desire_points{1}(3), 'r.', 'MarkerSize',50);
    hold off
    
    display(I)
    toc
end
%% object moving configuration
if type_of_movement == 2
    
    [DH_moving, q0_moving , q] = dh_obj_moving(length, width); % generalized dh parameters
    
    transformable_arm_moving = SerialLink(DH_moving);
    % transformable_arm_moving.plot(q0_moving , 'jvec', 'base');
    T = simplified_T(DH_moving);
    

    
    % Y
    q_obj_y = {q1, q0_moving(2), q0_moving(3), q4, q5, q6, q7};
    
    [ws_obj_y, Q_obj_y] = plotworkspace(DH_moving, q_obj_y, T);
    for i = 1:numel(desire_points)
        min_dist_p_y{i} = nearest_point(ws_y, desire_points{i});
    end
    
    % X
    q_obj_x = {q0_moving(1), q2, q0_moving(3), q4, q5, q6, q7};
    
    [ws_obj_x, Q_obj_x] = plotworkspace(DH_moving, q_obj_x, T);
    for i = 1:numel(desire_points)
        min_dist_p_x{i} = nearest_point(ws_x, desire_points{i});
    end
    
    % Z
    q_obj_z = {q0_moving(1), q0_moving(2), q3, q4, q5, q6, q7};
    
    [ws_obj_z, Q_obj_z] = plotworkspace(DH_moving, q_obj_z, T);
    for i = 1:numel(desire_points)
        min_dist_p_z{i} = nearest_point(ws_z, desire_points{i});
    end
    
    % compare results
    [min_dist, I] = compare_res({min_dist_p_x, min_dist_p_y, min_dist_p_z});
    Q_all = {Q_x, Q_y, Q_z};
    Q = Q_all{I};
    
    for i = 1:numel(Q)
        Q{i} = squeeze(Q{i});
    end
    
    % find the indices of the corresponding point and angles
    
    n = min_dist{1}{3}(1);
    m = min_dist{1}{3}(2);
    k = min_dist{1}{3}(3);
    j = min_dist{1}{3}(4);
    
    for i = 1:7
        q(i) = Q{i}(n,m,k,j);
    end
    
    transformable_arm.plot(q);
    hold on
    plot3(desire_points{1}(1), desire_points{1}(2), desire_points{1}(3), 'r.', 'MarkerSize',50);
    hold off
    
    display(I)
    toc
    
end









