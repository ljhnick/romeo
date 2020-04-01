function [ min_dist, I ] = compare_res( Var )
%COMPARE_RES Summary of this function goes here
%   Detailed explanation goes here
num = numel(Var);

for i = 1:num
    min_dist{i} = 0;
    for j = 1:numel(Var{i})
        min_dist{i} = min_dist{i} + Var{i}{j}{1};
    end
    min_dist{i} = min_dist{i}/numel(Var{i});
end
% min_dist_x = 0
% for i = 1:numel(x)
%     min_dist_x = min_dist_x + x{i}{1};
% end
% min_dist_x = min_dist_x/numel(x);
% 
% min_dist_y = 0
% for i = 1:numel(x)
%     min_dist_y = min_dist_y + y{i}{1};
% end
% min_dist_y = min_dist_y/numel(y);
% 
% min_dist_z = 0
% for i = 1:numel(z)
%     min_dist_z = min_dist_z + z{i}{1};
% end
% min_dist_z = min_dist_z/numel(z);

[~, I] = min(cell2mat(min_dist));

min_dist = Var{I};

end

