%% Left Arm
%             Theta d     a           alpha r/p  theta offset
tic 

Ll(1) = Link ([0    0.27035  0.069   -pi/2  0    0], 'standard'); % start at joint s0 and move to joint s1
Ll(2) = Link ([0    0        0        pi/2  0    pi/2], 'standard');        % start at joint s1 and move to joint e0
Ll(3) = Link ([0    0.36435  0.0690  -pi/2  0    0], 'standard'); % start at joint e0 and move to joint e1
Ll(4) = Link ([0    0        0        pi/2  0    0], 'standard');           % start at joint e1 and move to joint w0
Ll(5) = Link ([0    0.37429  0.010   -pi/2  0    0], 'standard');  % start at joint w0 and move to joint w1
Ll(6) = Link ([0    0        0        pi/2  0    0], 'standard');           % start at joint w1 and move to joint w2
Ll(7) = Link ([0    0.229525 0         0     0    0], 'standard');         % start at joint w2 and move to end-effector
Baxter_Left = SerialLink(Ll, 'name', 'Baxter Left Arm', 'base' , ...
                      transl(0.024645, 0.219645, 0.118588) * trotz(pi/4)...
                      * transl(0.055695, 0, 0.011038));
%%
% hold on;
N=300000; 
for n=1:1:300000 
                                %
theta1=-141/180*pi+(141/180*pi+51/180*pi)*rand(N,1); %limit of joint1
theta2=-123/180*pi+(123/180*pi+60/180*pi)*rand(N,1);   %limit of joint2
theta3=-173/180*pi+(173/180*pi+173/180*pi)*rand(N,1);  %limit of joint3
theta4=-3/180*pi+(3/180*pi+150/180*pi)*rand(N,1); %limit of joint4
theta5=-175/180*pi+(175/180*pi+175/180*pi)*rand(N,1); %limit of joint5
theta6=-90/180*pi+(90/180*pi+120/180*pi)*rand(N,1); %limit of joint6
theta7=-175/180*pi+(175/180*pi+175/180*pi)*rand(N,1);%limit of joint7
qq=[theta1(n),theta2(n),theta3(n),theta4(n),theta5(n),theta6(n),theta7(n)];
Mricx=Baxter_Left.fkine(qq);
% hold on;
% drawnow;
% plot3(Mricx.t(1),Mricx.t(2),Mricx.t(3),'b.','MarkerSize',0.5);
% pause(0.001)
end
toc