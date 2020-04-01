function [ min_dist_p ] = nearest_point( ws, ori_z, desire_p, des_ori )
%NEAREST_POINT Summary of this function goes here
%   Detailed explanation goes here
X = ws{1};
Y = ws{2};
Z = ws{3};

des_X = desire_p(1)*ones(size(X));
des_Y = desire_p(2)*ones(size(X));
des_Z = desire_p(3)*ones(size(X));

dist = sqrt((des_X-X).^2 + (des_Y-Y).^2 + (des_Z-Z).^2);

layer_num = numel(size(X));
dist_min = dist;
for i = 1:layer_num
    dist_min = min(dist_min);
end

% I = [a, b, c];
if layer_num == 3
    [a, ~] = find(dist == dist_min);
    [b, c] = find(squeeze(min(dist)) == dist_min);
    X_val = X(a, b, c);
    Y_val = Y(a, b, c);
    Z_val = Z(a, b, c);
    I = [a, b, c];
elseif layer_num == 4
    [a, ~] = find(dist == dist_min);
    [b, ~] = find(squeeze(min(dist)) == dist_min);
    [c, d] = find(squeeze(min(min(dist))) == dist_min);
    X_val = X(a, b, c, d);
    Y_val = Y(a, b, c, d);
    Z_val = Z(a, b, c, d);
    I = [a, b, c, d];
end



nearest_p = [X_val, Y_val, Z_val];

min_dist_p = {dist_min, nearest_p, I};

end

