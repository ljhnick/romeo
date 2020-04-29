% msg = '{"type":1,"points":[{"pos":{"x":-99.97778328105028,"y":72.30532700406849,"z":12.017215735436878},"ori":{"x":-0.16217585537589102,"y":0.6782027991766856,"z":0.7167565522002616},"type":1}],"transformable":{"center":{"x":0,"y":24.62082606479067,"z":10},"lenx":90,"leny":70.75834787041866,"lenz":90, "axis":{"x":0,"y":-1,"z":0}},"obstacle":[{"xmax":45,"xmin":-45,"ymax":-10.75834787041866,"ymin":-60,"zmax":55,"zmin":-35}]}';
% msg = '{"type":1,"points":[{"pos":{"x":-99.1108919434389,"y":70.28354697784673,"z":4.335207283513554},"type":1},{"pos":{"x":-66.63603327614362,"y":-4.8580590681566775,"z":91.88202714490136},"ori":{"x":-0.37487163548581354,"y":-0.873071804863296,"z":0.3117962162389696},"type":1}],"transformable":{"center":{"x":0,"y":40.014385498593626,"z":10},"lenx":90,"leny":39.97122900281275,"lenz":90,"axis":{"x":0,"y":-1,"z":0}},"obstacle":[{"xmax":45,"xmin":-45,"ymax":20.02877099718725,"ymin":-60,"zmax":55,"zmin":-35}]}'
tic
% msg = '{"type":1,"points":[{"pos":{"x":-111.34682266547867,"y":66.20324857035783,"z":21.308390276024284},"ori":{"x":-0.12565845300120929,"y":0.9547237075644378,"z":0.26965273112608484},"type":1},{"pos":{"x":-24.569963759192802,"y":-30.11999404280337,"z":97.43519866584225},"ori":{"x":-0.5843713616305837,"y":-0.023482295357293344,"z":0.8111465302340697},"type":1}],"transformable":{"center":{"x":0,"y":35.20102342783167,"z":10},"lenx":90,"leny":49.597953144336664,"lenz":90,"axis":{"x":0,"y":-1,"z":0}},"obstacle":[{"xmax":45,"xmin":-45,"ymax":10.402046855663336,"ymin":-60,"zmax":55,"zmin":-35}]}';
% msg = '{"type":1,"points":[{"pos":{"x":-76.30041128641776,"y":100.21247900754473,"z":-23.395158793351612},"ori":{"x":0,"y":0,"z":0},"type":1},{"pos":{"x":12.088241488968265,"y":9.725802157111048,"z":95.87841005178956},"ori":{"x":0.12285101573562601,"y":0.9862361954660753,"z":-0.11066071879997054},"type":1}],"transformable":{"center":{"x":0,"y":38.105800733086056,"z":10},"lenx":90,"leny":43.78839853382789,"lenz":90,"axis":{"x":0,"y":-1,"z":0}},"obstacle":[{"xmax":45,"xmin":-45,"ymax":16.211601466172112,"ymin":-60,"zmax":55,"zmin":-35}]}';

% msg = '{"type":2,"points":[{"pos":{"x":-265.82958462285734,"y":39.967534941225765,"z":30.98606625513105},"ori":{"x":-0.9941236641335705,"y":-0.09193369156167909,"z":-0.05715187455793572},"type":1}],"transformable":{"center":{"x":0,"y":38.114953614945264,"z":10},"lenx":90,"leny":43.77009277010947,"lenz":90,"axis":{"x":0,"y":-1,"z":0}},"obstacle":[{"xmax":45,"xmin":-45,"ymax":16.22990722989053,"ymin":-60,"zmax":55,"zmin":-35}]}';
% msg = '{"type":2,"points":[{"pos":{"x":-220.24354610433667,"y":25.747945323899472,"z":6.908299912863498},"ori":{"x":0,"y":0,"z":0},"type":3}],"transformable":{"center":{"x":0,"y":19.814932843110142,"z":10},"lenx":90,"leny":80.37013431377972,"lenz":90,"axis":{"x":0,"y":-1,"z":0}},"obstacle":[{"xmax":45,"xmin":-45,"ymax":-20.370134313779715,"ymin":-60,"zmax":55,"zmin":-35}]}'

% msg = '{"type":1,"points":[{"pos":{"x":-49.602067691963626,"y":-52.0806175662557,"z":114.78337987977409},"ori":{"x":-0.12923879316148723,"y":0.07086399473961406,"z":0.9890781711228422},"type":1},{"pos":{"x":-22.634679978380216,"y":106.44784243354067,"z":1.982170811172093},"ori":{"x":0,"y":0,"z":0},"type":1}],"transformable":{"center":{"x":-0.008335901851250327,"y":16.53662730611802,"z":0.06912293080929643},"lenx":108.42010424857787,"leny":56.18553161621094,"lenz":108.98393679831952,"axis":{"x":0,"y":1,"z":0}},"obstacle":[{"xmax":66.07958221435547,"xmin":-66.48841094970703,"ymax":95.51214599609375,"ymin":44.62939311422349,"zmax":55.16474533081055,"zmin":-55.1375846862793},{"xmax":66.07958221435547,"xmin":-66.48841094970703,"ymax":-11.556138501987448,"ymin":-95.52058410644531,"zmax":55.16474533081055,"zmin":-55.1375846862793}]}';

% STAMP example
% msg = '{"type":2,"points":[{"pos":{"x":-91.5304837294428,"y":-56.47557412538278,"z":-3.9800737720786543},"ori":{"x":-0.2750973421952965,"y":-0.9352027875960521,"z":0.2229735374201551},"type":2},{"pos":{"x":2.4100535198498445,"y":-55.93135006790007,"z":-95.80927025342854},"ori":{"x":0.15146918250659902,"y":-0.9766386512333106,"z":-0.15242713560243332},"type":2}],"transformable":{"center":{"x":-0.0000013705039165756716,"y":11.880938799855144,"z":9.5367431640625e-7},"lenx":65.49629791308767,"leny":89.23812240028971,"lenz":45.00000190734863,"axis":{"x":0,"y":-1,"z":0}},"obstacle":[{"xmax":40,"xmin":-40,"ymax":-32.73812240028971,"ymin":-56.5,"zmax":25.000001907348633,"zmin":-25}]}';

% Spatula example
% msg = '{"type":2,"points":[{"pos":{"x":-66.98206977568972,"y":-51.386928123474135,"z":-0.7468848628156621},"ori":{"x":0,"y":0,"z":0},"type":2},{"pos":{"x":-8.435659263171345,"y":-46.591540131782864,"z":-56.35338902323173},"ori":{"x":0,"y":0,"z":0},"type":2}],"transformable":{"center":{"x":0,"y":35.59593107343488,"z":0},"lenx":30,"leny":147.51744266270055,"lenz":40,"axis":{"x":0,"y":-1,"z":0}},"obstacle":[{"xmax":30,"xmin":-30,"ymax":-38.16279025791539,"ymin":-109.35465240478516,"zmax":20,"zmin":-20}]}';

% Stamp
% msg = '{"type":2,"points":[{"pos":{"x":-102.52109913089622,"y":-11.243779804715892,"z":0.7550548302646831},"ori":{"x":-0.38447313831358676,"y":-0.8838969583224298,"z":0.2662828815069761},"type":2},{"pos":{"x":-10.22981418285108,"y":-8.212989118601335,"z":-90.7885386810855},"ori":{"x":0.12849036518485646,"y":-0.8762473149634539,"z":-0.4644145444255597},"type":2}],"transformable":{"center":{"x":0,"y":6.278869957546696,"z":0},"lenx":64,"leny":94.94226008490661,"lenz":45,"axis":{"x":0,"y":-1,"z":0}},"obstacle":[{"xmax":40,"xmin":-40,"ymax":-41.19226008490661,"ymin":-53.75,"zmax":25,"zmin":-25}]}';

% paper towel container
% msg = '{"type":1,"points":[{"pos":{"x":-3.2773848109034702,"y":223.3897663183704,"z":61.0922584139262},"ori":{"x":0.32373572968739067,"y":-0.055540363530127375,"z":-0.9445159846941258},"type":2}],"transformable":{"center":{"x":0.0000019073486328125,"y":106.33621824127471,"z":0},"lenx":119.72023010253906,"leny":37.327563517450585,"lenz":120,"axis":{"x":0,"y":-1,"z":0}},"obstacle":[{"xmax":59.86011505126953,"xmin":-59.860111236572266,"ymax":87.67243648254941,"ymin":-125,"zmax":60,"zmin":-60}]}';
% msg = '{"type":1,"points":[{"pos":{"x":-54.178405323496776,"y":173.60093857451625,"z":35.83876029419241},"ori":{"x":0.6505878940400911,"y":0.3109553230573562,"z":-0.6928507625677945},"type":2}],"transformable":{"center":{"x":0.0000019073486328125,"y":97.16166338292658,"z":0},"lenx":119.72023010253906,"leny":55.67667323414685,"lenz":120,"axis":{"x":0,"y":-1,"z":0}},"obstacle":[{"xmax":59.86011505126953,"xmin":-59.860111236572266,"ymax":69.32332676585315,"ymin":-125,"zmax":60,"zmin":-60}]}';

% piggy bank
% msg = '{"type":1,"points":[{"pos":{"x":-225.48344759687663,"y":78.16430982673157,"z":83.85159163664434},"ori":{"x":-0.9944221655956155,"y":-0.06132502921968909,"z":-0.08581257112644253},"type":1},{"pos":{"x":-24.8513733652279,"y":217.7938433831495,"z":-66.10682509775432},"ori":{"x":-0.05251229261118668,"y":-0.2199668381490773,"z":0.974092936654103},"type":1}],"transformable":{"center":{"x":0.0000019073486328125,"y":92.25374511810313,"z":0},"lenx":119.72023010253906,"leny":65.49250976379375,"lenz":120,"axis":{"x":0,"y":-1,"z":0}},"obstacle":[{"xmax":59.86011505126953,"xmin":-59.860111236572266,"ymax":59.50749023620625,"ymin":-125,"zmax":60,"zmin":-60}]}';

% paper towel
% msg = '{"type":1,"points":[{"pos":{"x":-72.15253398379559,"y":4.821547466996861,"z":56.87082419778102},"ori":{"x":0,"y":0,"z":0},"type":2}],"transformable":{"center":{"x":0,"y":-146.48598979948224,"z":0},"lenx":200,"leny":42.97197959896451,"lenz":200,"axis":{"x":0,"y":-1,"z":0}},"obstacle":[{"xmax":100,"xmin":-100,"ymax":175,"ymin":-125,"zmax":100,"zmin":-100},{"xmax":100,"xmin":-100,"ymax":-167.9719795989645,"ymin":-175,"zmax":100,"zmin":-100}]}';

% spatula z90
% msg = '{"type":2,"points":[{"pos":{"x":0.9055138958360658,"y":-67.79858662702887,"z":76.60415484370202},"ori":{"x":0,"y":0,"z":0},"type":2},{"pos":{"x":-0.5260034023401658,"y":-0.4869326186097922,"z":77.81852776285729},"ori":{"x":0,"y":0,"z":0},"type":2},{"pos":{"x":0.0737863322414114,"y":35.6798328307222,"z":76.43090006744688},"ori":{"x":0,"y":0,"z":0},"type":2},{"pos":{"x":-3.805486925496183,"y":77.66017103800081,"z":79.27600390900528},"ori":{"x":0,"y":0,"z":0},"type":2}],"transformable":{"center":{"x":0,"y":35.60013729392744,"z":0},"lenx":30,"leny":199.7107361543326,"lenz":44,"axis":{"x":0,"y":-1,"z":0}},"obstacle":[{"xmax":45,"xmin":-45,"ymax":-64.25523078323887,"ymin":-135.45550537109375,"zmax":22,"zmin":-22}]}';

% tissue box
% msg = '{"type":1,"points":[{"pos":{"x":-1.3872846029619978,"y":135.17214017900181,"z":8.70378567805733},"ori":{"x":0,"y":0,"z":0},"type":1},{"pos":{"x":-72.87990869365652,"y":6.121710882387717,"z":194.90254540261344},"ori":{"x":0,"y":0,"z":0},"type":2},{"pos":{"x":-1.3405808478719337,"y":9.931621262695032,"z":199.6909532391274},"ori":{"x":0,"y":0,"z":0},"type":2}],"transformable":{"center":{"x":0,"y":49.72184597392372,"z":0},"lenx":190,"leny":40.55630805215255,"lenz":190,"axis":{"x":0,"y":-1,"z":0}},"obstacle":[{"xmax":95,"xmin":-95,"ymax":29.443691947847448,"ymin":-70,"zmax":95,"zmin":-95}]}';

% paper towel
msg = '{"type":1,"points":[{"pos":{"x":87.21810524049326,"y":-147.2467314284242,"z":128.41689895285452},"ori":{"x":0,"y":0,"z":0},"type":2},{"pos":{"x":6.578781254568355,"y":18.566867816168497,"z":41.714150173563894},"ori":{"x":0,"y":0,"z":0},"type":2}],"transformable":{"center":{"x":0,"y":-147.35771711401935,"z":0},"lenx":200,"leny":44.715434228038674,"lenz":200,"axis":{"x":0,"y":-1,"z":0}},"obstacle":[{"xmax":10,"xmin":-10,"ymax":1000,"ymin":-1000,"zmax":10,"zmin":-10}]}';

% test
% msg = '{"type":1,"points":[{"pos":{"x":0.30167162812412585,"y":-72.3838539962683,"z":103.99302878830153},"ori":{"x":0,"y":0,"z":0},"type":2},{"pos":{"x":90.9931256737548,"y":-72.29266328068312,"z":6.556314016513568},"ori":{"x":0,"y":0,"z":0},"type":2},{"pos":{"x":-1.6565320523777416,"y":-72.2103619205104,"z":-87.08075100292797},"ori":{"x":0,"y":0,"z":0},"type":2}],"transformable":{"center":{"x":0,"y":33.37401748250349,"z":0},"lenx":30,"leny":204.16297577718052,"lenz":44,"axis":{"x":0,"y":-1,"z":0}},"obstacle":[{"xmax":45,"xmin":-45,"ymax":-68.70747040608677,"ymin":-135.45550537109375,"zmax":22,"zmin":-22}]}';

result = main_func(msg);
toc
