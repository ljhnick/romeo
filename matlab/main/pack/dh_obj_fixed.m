function [ DH, q0, q ] = dh_obj_fixed( length, width )
%GENERATE_DH Summary of this function goes here
%   Detailed explanation goes here

% segment the plane
a1 = length/2;
a2 = length - a1;
b1 = width/2;
b2 = width - b1;

interval = 0.45;

% generate dh parameters
DH(1) = Link([0 0 0 0 0], 'modified');
DH(2) = Link([0 0 -sqrt(a1^2+b1^2) 0 0], 'modified');
DH(3) = Link([0 0 0 -pi/2 0], 'modified');
DH(4) = Link([0 b2 0 -pi/2 0], 'modified');
DH(5) = Link([0 0 a1 -pi/2 0], 'modified');
DH(6) = Link([0 0 sqrt(a2^2+b2^2) 0 0], 'modified');
DH(7) = Link([0 0 sqrt(a2^2+b1^2) 0 0], 'modified');

% DH.display
% Arm = SerialLink(DH);

q1_0 = atan2(b1,a1);
q2_0 = atan2(a1,b1);
q3_0 = pi/2;
q4_0 = pi/2;
q5_0 = atan2(b2,a2);
q6_0 = atan2(a2,b1)+atan2(a2,b2);
q7_0 = 0;

q0 = [q1_0, q2_0, q3_0, q4_0, q5_0, q6_0, q7_0];

% -pi/2 < q1 < q1_0
% -pi/2 < q2 < q2_0
% q3_0-pi/2 < q3 < q3_0+pi/2 
% q4_0-pi/2 < q4 < q4_0+pi/2
% -pi/2 < q5 < q5_0
% -pi/2 < q6 < q6_0
% q7 = 0

q1 = (-pi/1.5:interval:0)+q0(1);
q2 = (-pi/1.5:interval:0)+q0(2);
q3 = (-pi/2:interval:pi/2)+q0(3);
q4 = (-pi:interval:pi)+q0(4);
q5 = (-pi/1.5:interval:0)+q0(5);
q6 = (-pi/1.5:interval:0)+q0(6);
q7 = 0+q0(7);

q = {q1, q2, q3, q4, q5, q6, q7};


end

