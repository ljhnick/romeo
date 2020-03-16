function [ ws, ori, Q ] = generateWorkspace( type, DH, q1, q0, axis, P0, obs, IFSTRIP )
%GENERATEWORKSPACE Summary of this function goes here
%   Detailed explanation goes here
if type == 1
    if IFSTRIP == 0
        if axis == 'x'
            q = {q1{1}, q0(2), q1{3}, q0(4), q1{5}, q1{6}, q1{7}};
        elseif axis == 'y'
            q = {q1{1}, q0(2), q0(3), q1{4}, q1{5}, q1{6}, q1{7}};
        elseif axis == 'z'
            q = {q1{1}, q1{2}, q0(3), q0(4), q1{5}, q1{6}, q1{7}};
        end
    else
        if axis == 'x'
            q = {q1{1}, q1(2), q0{3}, q0(4), q1{5}, q1{6}, q1{7}};
        elseif axis == 'y'
            q = {q1{1}, q0(2), q1(3), q0{4}, q1{5}, q1{6}, q1{7}};
        elseif axis == 'z'
            q = {q1{1}, q0{2}, q0(3), q1(4), q1{5}, q1{6}, q1{7}};
        end
    end
elseif type == 2
    if IFSTRIP == 0
        if axis == 'x'
            q = {q0(1), q0(2), q1{3}, q1{4}, q1{5}, q1{6}, q1{7}};
        elseif axis == 'y'
            q = {q0(1), q1{2}, q0(3), q1{4}, q1{5}, q1{6}, q1{7}};
        elseif axis == 'z'
            q = {q1{1}, q0(2), q0(3), q1{4}, q1{5}, q1{6}, q1{7}};
        end
    else
        if axis == 'x'
            q = {q0(1), q0(2), q1{3}, q1{4}, q1{5}, q1{6}, q1{7}};
        elseif axis == 'y'
            q = {q0(1), q1{2}, q0(3), q1{4}, q1{5}, q1{6}, q1{7}};
        elseif axis == 'z'
            q = {q1{1}, q0(2), q0(3), q1{4}, q1{5}, q1{6}, q1{7}};
        end
    end
end

% [~,n] = size(DH);
% var = sym('q',[n 1]);
% assume(var,'real')
[Q{1:numel(q)}] = ndgrid(q{:}); 

q_var = [Q{1}(:), Q{2}(:), Q{3}(:), Q{4}(:), Q{5}(:), Q{6}(:), Q{7}(:)];
arm = SerialLink(DH);
T_num = arm.fkine(q_var);

%% XYZ of the end-effector
Pos = T_num.tv;
X = Pos(1,:)+P0(1);
Y = Pos(2,:)+P0(2);
Z = Pos(3,:)+P0(3);

%% XYZ of the end-effector
% Pos = T.tv;
% x(var(:)) = Pos(1);
% X = matlabFunction(x);
% X = X(Q{:})+P0(1);
% y(var(:)) = Pos(2);
% Y = matlabFunction(y);
% Y = Y(Q{:})+P0(1);
% z(var(:)) = Pos(3);
% Z = matlabFunction(z);
% Z = Z(Q{:})+P0(1);

% X = squeeze(X);
% Y = squeeze(Y);
% Z = squeeze(Z);

for i = 1:numel(obs)
    obstacle = obs{i};
    isCollided{i} = inShape(obstacle, X, Y, Z);
end
for i = 1:numel(obs)
    X(isCollided{i} == 1) = NaN;
    Y(isCollided{i} == 1) = NaN;
    Z(isCollided{i} == 1) = NaN;
end


%% XYZ of each joint
for i = 2:(numel(DH)-1)
    arm_sub = SerialLink(DH(1:i));
    T_num_local = arm_sub.fkine(q_var(:,1:i));
    Pos_local = T_num_local.tv;
    X_joint = Pos_local(1,:)+P0(1);
    Y_joint = Pos_local(2,:)+P0(2);
    Z_joint = Pos_local(3,:)+P0(3);
    
    for j = 1:numel(obs)
        isCollide = inShape(obs{j}, X_joint, Y_joint, Z_joint);
        X(isCollide == 1) = NaN;
        Y(isCollide == 1) = NaN;
        Z(isCollide == 1) = NaN;
    end
    
end

%% save workspace

% X = squeeze(X);
% Y = squeeze(Y);
% Z = squeeze(Z);
ws = {X, Y, Z};

%% orientation of the end-effector
ORI = T_num.R;
% ORI_X = ORI(:,1,:);
oriX_x = squeeze(ORI(1,1,:))';
oriX_y = squeeze(ORI(2,1,:))';
oriX_z = squeeze(ORI(3,1,:))';

ori_xaxis = {oriX_x, oriX_y, oriX_z};

oriY_x = squeeze(ORI(1,2,:))';
oriY_y = squeeze(ORI(2,2,:))';
oriY_z = squeeze(ORI(3,2,:))';

ori_yaxis = {oriY_x, oriY_y, oriY_z};

oriZ_x = squeeze(ORI(1,3,:))';
oriZ_y = squeeze(ORI(2,3,:))';
oriZ_z = squeeze(ORI(3,3,:))';

ori_zaxis = {oriZ_x, oriZ_y, oriZ_z};
% 
% % z rotation column
% ORI_Z = T.a;
% z_x(var(:)) = ORI_Z(1);
% Z_X = matlabFunction(z_x);
% ORI_Z_X = Z_X(Q{:});
% z_y(var(:)) = ORI_Z(2);
% Z_Y = matlabFunction(z_y);
% ORI_Z_Y = Z_Y(Q{:});
% z_z(var(:)) = ORI_Z(3);
% Z_Z = matlabFunction(z_z);
% ORI_Z_Z = Z_Z(Q{:});
% 
% ORI_Z_X = squeeze(ORI_Z_X);
% ORI_Z_Y = squeeze(ORI_Z_Y);
% ORI_Z_Z = squeeze(ORI_Z_Z);
% 
% ori_zaxis = {ORI_Z_X, ORI_Z_Y, ORI_Z_Z};
% 
% % y rotation column
% ORI_Y = T.o;
% y_x(var(:)) = ORI_Y(1);
% Y_X = matlabFunction(y_x);
% ORI_Y_X = Y_X(Q{:});
% y_y(var(:)) = ORI_Y(2);
% Y_Y = matlabFunction(y_y);
% ORI_Y_Y = Y_Y(Q{:});
% y_z(var(:)) = ORI_Y(3);
% Y_Z = matlabFunction(y_z);
% ORI_Y_Z = Y_Z(Q{:});
% 
% ORI_Y_X = squeeze(ORI_Y_X);
% ORI_Y_Y = squeeze(ORI_Y_Y);
% ORI_Y_Z = squeeze(ORI_Y_Z);
% 
% ori_yaxis = {ORI_Y_X, ORI_Y_Y, ORI_Y_Z};
% 
% % x rotation column
% ORI_X = T.n;
% x_x(var(:)) = ORI_X(1);
% X_X = matlabFunction(x_x);
% ORI_X_X = X_X(Q{:});
% x_y(var(:)) = ORI_X(2);
% X_Y = matlabFunction(x_y);
% ORI_X_Y = X_Y(Q{:});
% x_z(var(:)) = ORI_X(3);
% X_Z = matlabFunction(x_z);
% ORI_X_Z = X_Z(Q{:});
% 
% ORI_X_X = squeeze(ORI_X_X);
% ORI_X_Y = squeeze(ORI_X_Y);
% ORI_X_Z = squeeze(ORI_X_Z);
% 
% ori_xaxis = {ORI_X_X, ORI_X_Y, ORI_X_Z};

ori = {ori_xaxis, ori_yaxis, ori_zaxis};





end

