function [ arm ] = transformPart( type, transformable, obstacle, tar_p, tar_ori )
%TRANSFORMPART Summary of this function goes here
%   Detailed explanation goes here
length = transformable(1);
width = transformable(2);

if type == 1
    [DH, q0, q] = dh_obj_fixed(length, width); % generalized dh parameters
    
elseif type == 2
    [DH, q0, q] = dh_obj_moving(length, width); % generalized dh parameters
end
    
arm = {1};

end

