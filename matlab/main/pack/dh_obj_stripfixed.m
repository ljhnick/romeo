
function [DH, q0, q] = dh_obj_stripfixed( length, width )
%DH 此处显示有关此函数的摘要
%   此处显示详细说明

%GENERATE_DH Summary of this function goes here
%   Detailed explanation goes here

% segment the plane
len = max(length, width);
seg = len/4;

interval = 0.4;

% generate dh parameters
DH(1) = Link([0 0 0 0 0], 'modified');
DH(2) = Link([0 0 0 pi/2 0], 'modified');
DH(3) = Link([0 0 0 pi/2 0], 'modified');
DH(4) = Link([0 0 seg 0 0], 'modified');
DH(5) = Link([0 0 seg 0 0], 'modified');
DH(6) = Link([0 0 seg 0 0], 'modified');
DH(7) = Link([0 0 seg+60 0 0], 'modified');

% DH.display
% Arm = SerialLink(DH);

q1_0 = pi;
q2_0 = -pi/2;
q3_0 = 0;
q4_0 = 0;
q5_0 = 0;
q6_0 = 0;
q7_0 = 0;

q0 = [q1_0, q2_0, q3_0, q4_0, q5_0, q6_0, q7_0];

% -pi/2 < q1 < q1_0
% -pi/2 < q2 < q2_0
% q3_0-pi/2 < q3 < q3_0+pi/2 
% q4_0-pi/2 < q4 < q4_0+pi/2
% -pi/2 < q5 < q5_0
% -pi/2 < q6 < q6_0
% q7 = 0

q1 = (-pi/2:interval:pi/2)+q0(1);
q2 = (-pi/2:interval:pi/2)+q0(2);
q3 = (-pi/2:interval:pi/2)+q0(3);
q4 = (-pi/2:interval:pi/2)+q0(4);
q5 = (-pi/2:interval:pi/2)+q0(5);
q6 = (-pi/2:interval:pi/2)+q0(6);
q7 = 0+q0(7);

q1(end+1) = pi/2+q0(1);
q2(end+1) = pi/2+q0(2);
q3(end+1) = pi/2+q0(3);
q4(end+1) = pi/2+q0(4);
q5(end+1) = pi/2+q0(5);
q6(end+1) = pi/2+q0(6);


q = {q1, q2, q3, q4, q5, q6, q7};

end

