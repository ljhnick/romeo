function [ ws, ori, Q ] = generateWorkspace( type, DH, T, T_all, q1, q0, axis, P0, obs )
%GENERATEWORKSPACE Summary of this function goes here
%   Detailed explanation goes here
if type == 1
    if axis == 'x'
        q = {q1{1}, q0(2), q1{3}, q0(4), q1{5}, q1{6}, q1{7}};
    elseif axis == 'y'
        q = {q1{1}, q0(2), q0(3), q1{4}, q1{5}, q1{6}, q1{7}};
    elseif axis == 'z'
        q = {q1{1}, q1{2}, q0(3), q0(4), q1{5}, q1{6}, q1{7}};
    end
elseif type == 2
    if axis == 'x'
        q = {q0(1), q0(2), q1{3}, q1{4}, q1{5}, q1{6}, q1{7}};
    elseif axis == 'y'
        q = {q0(1), q1{2}, q0(3), q1{4}, q1{5}, q1{6}, q1{7}};
    elseif axis == 'z'
        q = {q1{1}, q0(2), q0(3), q1{4}, q1{5}, q1{6}, q1{7}};
    end
end

[~,n] = size(DH);
var = sym('q',[n 1]);
assume(var,'real')
[Q{1:numel(q)}] = ndgrid(q{:}); 

q_var = [Q{1}(:), Q{2}(:), Q{3}(:), Q{4}(:), Q{5}(:), Q{6}(:), Q{7}(:)];

%% XYZ of the end-effector
Pos = T.tv;
x(var(:)) = Pos(1);
X = matlabFunction(x);
X = X(Q{:})+P0(1);
y(var(:)) = Pos(2);
Y = matlabFunction(y);
Y = Y(Q{:})+P0(1);
z(var(:)) = Pos(3);
Z = matlabFunction(z);
Z = Z(Q{:})+P0(1);

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
for i = 2:numel(T_all)
    
%     var1 = sym('q',[i 1]);
%     assume(var1,'real');
%     [Q1{1:i}] = ndgrid(q{1:i}); 
    
    T1 = T_all(i);
    Pos = T1.tv;
    x_joint(var(:)) = Pos(1);
    X_joint = matlabFunction(x_joint);
    X_joint = X_joint(Q{1:i})+P0(1);
    
    y_joint(var(:)) = Pos(2);
    Y_joint = matlabFunction(y_joint);
    Y_joint = Y_joint(Q{1:i})+P0(2);
    
    z_joint(var(:)) = Pos(3);
    Z_joint = matlabFunction(z_joint);
    Z_joint = Z_joint(Q{1:i})+P0(3);
    
%     X_joint = squeeze(X_joint);
%     Y_joint = squeeze(Y_joint);
%     Z_joint = squeeze(Z_joint);
    
    if isscalar(Z_joint)
        Z_joint = Z_joint*ones(size(X_joint));
    end
    
    for j = 1:numel(obs)
        isCollide = inShape(obs{j}, X_joint, Y_joint, Z_joint);
        X(isCollide == 1) = NaN;
        Y(isCollide == 1) = NaN;
        Z(isCollide == 1) = NaN;
    end
    
end

%% save workspace

X = squeeze(X);
Y = squeeze(Y);
Z = squeeze(Z);
ws = {X, Y, Z};

%% orientation of the end-effector
% z rotation column
ORI_Z = T.a;
z_x(var(:)) = ORI_Z(1);
Z_X = matlabFunction(z_x);
ORI_Z_X = Z_X(Q{:});
z_y(var(:)) = ORI_Z(2);
Z_Y = matlabFunction(z_y);
ORI_Z_Y = Z_Y(Q{:});
z_z(var(:)) = ORI_Z(3);
Z_Z = matlabFunction(z_z);
ORI_Z_Z = Z_Z(Q{:});

ORI_Z_X = squeeze(ORI_Z_X);
ORI_Z_Y = squeeze(ORI_Z_Y);
ORI_Z_Z = squeeze(ORI_Z_Z);

ori_zaxis = {ORI_Z_X, ORI_Z_Y, ORI_Z_Z};

% y rotation column
ORI_Y = T.o;
y_x(var(:)) = ORI_Y(1);
Y_X = matlabFunction(y_x);
ORI_Y_X = Y_X(Q{:});
y_y(var(:)) = ORI_Y(2);
Y_Y = matlabFunction(y_y);
ORI_Y_Y = Y_Y(Q{:});
y_z(var(:)) = ORI_Y(3);
Y_Z = matlabFunction(y_z);
ORI_Y_Z = Y_Z(Q{:});

ORI_Y_X = squeeze(ORI_Y_X);
ORI_Y_Y = squeeze(ORI_Y_Y);
ORI_Y_Z = squeeze(ORI_Y_Z);

ori_yaxis = {ORI_Y_X, ORI_Y_Y, ORI_Y_Z};

% x rotation column
ORI_X = T.n;
x_x(var(:)) = ORI_X(1);
X_X = matlabFunction(x_x);
ORI_X_X = X_X(Q{:});
x_y(var(:)) = ORI_X(2);
X_Y = matlabFunction(x_y);
ORI_X_Y = X_Y(Q{:});
x_z(var(:)) = ORI_X(3);
X_Z = matlabFunction(x_z);
ORI_X_Z = X_Z(Q{:});

ORI_X_X = squeeze(ORI_X_X);
ORI_X_Y = squeeze(ORI_X_Y);
ORI_X_Z = squeeze(ORI_X_Z);

ori_xaxis = {ORI_X_X, ORI_X_Y, ORI_X_Z};

ori = {ori_xaxis, ori_yaxis, ori_zaxis};





end

