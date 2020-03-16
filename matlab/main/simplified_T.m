function [ T, all ] = simplified_T( DH )
%SIMPLIFIED_T Summary of this function goes here
%   Detailed explanation goes here

r = SerialLink(DH);
% r.display()
[~,n] = size(DH);
var = sym('q',[n 1]);
assume(var,'real');

% T = simplify(vpa(r.fkine(var),3));
[T, all] = r.fkine(var);
end

