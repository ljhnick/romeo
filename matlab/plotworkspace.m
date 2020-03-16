function [ws, ori_zaxis, Q] = plotworkspace(DH,q,T)
% drawworkspace
%{
This function plots a workspace for a planar n-DOF revolute or prismatic
given DH parameters and the constraints of all variables.
This function uses Robotics Toolbox by Peter Corke which can be
downloaded from :
https://petercorke.com/wordpress/toolboxes/robotics-toolbox
----------------------------------------------
Inputs
DH    DH parameters each row is a link
q     a cell input contains constraints for all variables
        ordered from first link to last link.
---------------------------------------------------------------------
Example
a1 = 0.5; 
a2 = 0.3; 
a3 = 0.2;
DH(1) = Link([0 0 a1 0]);
DH(2) = Link([0 0 a2 0]);
DH(3) = Link([0 0 a3 0]);
th1 = (-pi/6:0.05:pi/6) ;
th2 = (-2*pi/3:0.05:2*pi/3);
th3 = (-pi/2:0.05:pi/2) ;
q = {th1,th2,th3};
All copyrights go to Mohammad Al-Fetyani
University of Jordan
%}
% L = Link([Th d a alpha])
r = SerialLink(DH);
% r.display()
[~,n] = size(DH);
var = sym('q',[n 1]);
assume(var,'real')
% generate a grid of theta1 and theta2,3,4 values
[Q{1:numel(q)}] = ndgrid(q{:}); 
% tic
T = simplify(vpa(r.fkine(var),3));
T = r.fkine(var);
Pos = T.tv;
x(var(:)) = Pos(1);
X = matlabFunction(x);
X = X(Q{:});
y(var(:)) = Pos(2);
Y = matlabFunction(y);
Y = Y(Q{:});
z(var(:)) = Pos(3);
Z = matlabFunction(z);
Z = Z(Q{:});

Ori = T.a;
z_x(var(:)) = Ori(1);
Z_X = matlabFunction(z_x);
Z_X = Z_X(Q{:});
z_y(var(:)) = Ori(2);
Z_Y = matlabFunction(z_y);
Z_Y = Z_Y(Q{:});
z_z(var(:)) = Ori(1);
Z_Z = matlabFunction(z_z);
Z_Z = Z_Z(Q{:});

Z_X = squeeze(Z_X);
Z_Y = squeeze(Z_Y);
Z_Z = squeeze(Z_Z);

ori_zaxis = {Z_X, Z_Y, Z_Z};



X = squeeze(X);
Y = squeeze(Y);
Z = squeeze(Z);
ws = {X, Y, Z};
% dim = size(Z);
% layer = dim(3);

% hold on
% for i = 1:layer
%     surf(X(:,:,i),Y(:,:,i),Z(:,:,i))
%     xlabel('X')
%     ylabel('Y')
% end
end
