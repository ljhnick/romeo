function [ output_args ] = testServer( input_args )
%TESTSERVER Summary of this function goes here
%   Detailed explanation goes here
    sym('b');
    a = input_args;
%     a = '{"type":1,"points":[{"pos":{"x":-99.97778328105028,"y":72.30532700406849,"z":12.017215735436878},"ori":{"x":-0.16217585537589102,"y":0.6782027991766856,"z":0.7167565522002616},"type":1}],"transformable":{"center":{"x":0,"y":24.62082606479067,"z":10},"lenx":90,"leny":70.75834787041866,"lenz":90},"obstacle":[{"xmax":45,"xmin":-45,"ymax":-10.75834787041866,"ymin":-60,"zmax":55,"zmin":-35}]}';
    decode = jsondecode(a);
    output_args = decode;

end

