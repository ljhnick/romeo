clear;
clc;
clear L
%             th    d       a    alpha
% L(1) = Link([ 0     0        0   0        0]);%????
% L(2) = Link([ 0     0       5    pi/2     0]);
% L(3) = Link([ 0     10      0    pi/4     0]);
% L(4) = Link([ 0     0       5   -pi/2     0]);
% L(5) = Link([ 0     0       5    0        0]);
% L(6) = Link([ 0     0       5    0        0]);
% L(7) = Link([ 0     0       2    0        0]);
% bot = SerialLink(L, 'name', 'Stanford arm');%????
% 
% bot.plot([0 0 pi/2 pi/2 0 0 0])
% T = transl(1,2,3)*trotz(60)*troty(30)*trotz(90);
% inverse_kinematics=bot.ikine6s(T,'pinv');%?????
% theta1=inverse_kinematics(1);
% theta2=inverse_kinematics(2);
% d3=inverse_kinematics(3);
% theta4=inverse_kinematics(4);
% theta5=inverse_kinematics(5);
% theta6=inverse_kinematics(6);
% forward_kinematics=bot.fkine([theta1 theta2 d3 theta4 theta5 theta6])%??????????????.
% bot.plot([theta1 theta2 0 theta4 theta5 theta6]);

%% Arm ZYZZ
%{
DH(1) = Link([0 0 0 0 0], 'modified')
DH(2) = Link([0 50 -50 pi/2 0], 'modified');
DH(3) = Link([0 50 0 0 0], 'modified')
DH(4) = Link([0 0 50 -pi/2 0], 'modified');
DH(5) = Link([0 0 70 0 0], 'modified');
DH(6) = Link([0 0 70 0 0], 'modified')

th1 = (-pi:0.2:0) ;
th2 = 0;
th3 = (-pi/2:0.3:pi/2);
th4 = (-pi/2:0.2:pi/4);
th5 = 0;
th6 = 0;
q = {th1,th2,th3, th4, th5, th6};
figure('name', 'workspace')
plotworkspace(DH, q)

%}
%% Arm ZZZZ
% DH(1) = Link([0 0 0 0 0], 'modified')
% DH(2) = Link([0 0 -70 0 0], 'modified');
% DH(3) = Link([0 50 0 pi/2 0], 'modified')
% DH(4) = Link([0 0 50 -pi/2 0], 'modified');
% DH(5) = Link([0 0 70 0 0], 'modified');
% DH(6) = Link([0 0 70 0 0], 'modified')
% 
% DH.display
% 
% arm = SerialLink(DH);
% % arm.display
% figure('name', 'arm')
% arm.plot([pi/4 -pi/4 0 0 0 0], 'jvec', 'base')
% 
% th1 = (-pi/2:0.2:0) ;
% th2 = (-pi/2:0.2:pi/2);
% th3 = (-pi/2:0.2:pi/2);
% th4 = (-pi/2:0.2:pi/2);
% th5 = 0;
% q = {th1,th2,th3, th4, th5};
% figure('name', 'workspace')
% plotworkspace(DH, q)

%% ZZXYZZ
% DH(1) = Link([0 0 0 0 0], 'modified')
% DH(2) = Link([0 0 -70 0 0], 'modified');
% DH(3) = Link([0 0 0 -pi/2 0], 'modified')
% DH(4) = Link([0 50 0 -pi/2 0], 'modified');
% DH(5) = Link([0 0 50 -pi/2 0], 'modified');
% DH(6) = Link([0 0 70 0 0], 'modified')
% DH(7) = Link([0 0 70 0 0], 'modified')

DH(1) = Link([0 0 0 0 0], 'modified');
DH(2) = Link([0 0 0 pi/2 0], 'modified');
DH(3) = Link([0 0 0 pi/2 0], 'modified');
DH(4) = Link([0 0 70 0 0], 'modified');
DH(5) = Link([0 0 70 0 0], 'modified');
DH(6) = Link([0 0 70 0 0], 'modified');
DH(7) = Link([0 0 70 0 0], 'modified');

arm = SerialLink(DH);
% arm.display
figure('name', 'arm')
arm.plot([pi -pi/2 0 0 0 0 0], 'jvec', 'base')

% desired_point1 = [-200, -50, -50];
desired_point1 = [0, -50, 0];

% ZZZZ
th1 = (-pi/2:0.2:pi/4);
th2 = (-pi/2:0.2:pi/4);
th3 = pi/2;
th4 = pi/2;
th5 = (-pi/2:0.2:pi/4);
% th6 = (-pi/2:0.2:pi/2);
th6 = pi/2;
th7 = 0;
q = {th1,th2,th3, th4, th5, th6, th7};
% figure('name', 'workspace ZZZZ')
[X, Y, Z] = plotworkspace(DH, q);
desire_X = desired_point1(1)*ones(size(X));
desire_Y = desired_point1(2)*ones(size(X));
desire_Z = desired_point1(3)*ones(size(X));
dist = sqrt((desire_X-X).^2 + (desire_Y-Y).^2 + (desire_Z-Z).^2);
min_dist = min(min(min(dist)));
display(min_dist)




% ZYZZ
th1 = (-pi/2:0.2:pi/4);
th2 = pi/4;
th3 = pi/2;
th4 = (0:0.2:pi);
th5 = (-pi/2:0.2:pi/4);
th6 = pi/2;
th7 = 0;
q = {th1,th2,th3, th4, th5, th6, th7};
% figure('name', 'workspace ZYZZ')
[X, Y, Z] = plotworkspace(DH, q);
desire_X = desired_point1(1)*ones(size(X));
desire_Y = desired_point1(2)*ones(size(X));
desire_Z = desired_point1(3)*ones(size(X));
dist = sqrt((desire_X-X).^2 + (desire_Y-Y).^2 + (desire_Z-Z).^2);
min_dist2 = min(min(min(dist)));
display(min_dist2)

% ZXZZ
th1 = (-pi/2:0.2:pi/4);
th2 = pi/4;
th3 = (0:0.2:pi);
th4 = pi/2;
th5 = (-pi/2:0.2:pi/4);
th6 = pi/2;
th7 = 0;
q = {th1,th2,th3, th4, th5, th6, th7};
% figure('name', 'workspace ZXZZ')
[X, Y, Z] = plotworkspace(DH, q);
desire_X = desired_point1(1)*ones(size(X));
desire_Y = desired_point1(2)*ones(size(X));
desire_Z = desired_point1(3)*ones(size(X));
dist = sqrt((desire_X-X).^2 + (desire_-Y-Y).^2 + (desire_Z-Z).^2);
min_dist3 = min(min(min(dist)));
display(min_dist3)

% 
% arm.ikine_sym(3)

% arm.plot([0 0 0 0])

