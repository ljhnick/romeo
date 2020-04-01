function [ min_dist ] = findNearestPoint( ws, ori, tar_p, tar_ori )
%FINDNEARESTPOINT Summary of this function goes here
%   Detailed explanation goes here

num_cell = numel(tar_p);

for i = 1:num_cell
    X = ws{1};
    Y = ws{2};
    Z = ws{3};
    
    tar_X = tar_p{i}(1)*ones(size(X));
    tar_Y = tar_p{i}(2)*ones(size(X));
    tar_Z = tar_p{i}(3)*ones(size(X));
    
    if norm(tar_ori{i}) ~= 0
        % extract the orientation of the workspace
        for j = 1:1
            ORI_X = ori{j}{1};
            ORI_Y = ori{j}{2};
            ORI_Z = ori{j}{3};

%             tar_ori_X = tar_ori{i}(1,j)*ones(size(X));
%             tar_ori_Y = tar_ori{i}(2,j)*ones(size(X));
%             tar_ori_Z = tar_ori{i}(3,j)*ones(size(X));
            tar_ori_X = tar_ori{i}(1)*ones(size(X));
            tar_ori_Y = tar_ori{i}(2)*ones(size(X));
            tar_ori_Z = tar_ori{i}(3)*ones(size(X));
            % it's unit vector, so the angle different is almost equal to the
            % vector distance
            diff_ori = sqrt((tar_ori_X-ORI_X).^2 + (tar_ori_Y-ORI_Y).^2 + (tar_ori_Z-ORI_Z).^2);

            % the error should be less than 15 degree which is pi/12
            % delete the workspace that has large error
            error = pi/12;
            X(diff_ori > error) = NaN;
            Y(diff_ori > error) = NaN;
            Z(diff_ori > error) = NaN;
        end
    end
    
    dist = sqrt((tar_X-X).^2 + (tar_Y-Y).^2 + (tar_Z-Z).^2);
    
    
    % check if there is a target orientation
%     layer_num = numel(size(X));
    [dist_min, index] = min(dist);
%     for j = 1:layer_num
%         dist_min = min(dist_min);
%     end
    X_val = X(index);
    Y_val = Y(index);
    Z_val = Z(index);
%     
%     if layer_num == 3
%         [a, ~] = find(dist == dist_min);
%         [b, c] = find(squeeze(min(dist)) == dist_min);
%         X_val = X(a, b, c);
%         Y_val = Y(a, b, c);
%         Z_val = Z(a, b, c);
%         I = [a, b, c];
%     elseif layer_num == 4
%         [a, ~] = find(dist == dist_min);
%         [b, ~] = find(squeeze(min(dist)) == dist_min);
%         [c, d] = find(squeeze(min(min(dist))) == dist_min);
%         X_val = X(a, b, c, d);
%         Y_val = Y(a, b, c, d);
%         Z_val = Z(a, b, c, d);
%         if isempty(a)
%             I = [];
%         else
%             I = [a, b, c, d];
%         end
%     end
%     
    nearest_p = [X_val, Y_val, Z_val];
    
    min_dist{i} = {dist_min, nearest_p, index};
    
    
    
end


end

