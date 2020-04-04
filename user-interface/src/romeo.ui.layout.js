/**
 * user interface layout
 * 
 * @author Jiahao Li
 */

var container = $('<div class="container"></div>');
container.css('width', "100%");
container.css('height', '100%');
container.css('color', '#000000');
// container.css('background-color', 'rgba(192, 192, 192, 0.5)');
container.css('top', '0px');
container.css('position', 'absolute');
container.css('font-family', 'Helvetica');
container.css('font-size', '12px');
container.css('overflow', 'auto');

var title = $('<h3></h3>');
title.html('ROMEO');
container.append(title);

/*
	4 buttons
*/

// first button: 
// select transformable parts
var selTransPtDiv = $('<div class="transPt"></div>');
var selTransPtBtn = $('<button id="transPt">Transformable Part</button>');
selTransPtBtn.css('background-color', 'rgba(192, 192, 192, 0.5)');
selTransPtDiv.append(selTransPtBtn);

container.append(selTransPtDiv);

// second button: 
// specify spatial point
var specPtDiv = $('<div class="specPt"></div>');
var specPtBtn = $('<button id="specPt">Specify Point (object fixed)</button>');
var specPtBtn1 = $('<button id="specPt">Specify Point (object moving)</button>');
specPtBtn.css('background-color', 'rgba(192, 192, 192, 0.5)');
specPtBtn1.css('background-color', 'rgba(192, 192, 192, 0.5)');
specPtDiv.append(specPtBtn);
specPtDiv.append(specPtBtn1);

container.append(specPtDiv);


// third button: 
// generate robotic arm
var genArmDiv = $('<div class="genArm"></div>');
var genArmBtn = $('<button id="genArm">Generate</button>');
genArmBtn.css('background-color', 'rgba(192, 192, 192, 0.5)');
genArmDiv.append(genArmBtn);

container.append(genArmDiv);


// forth button:
// animation
var animateDiv = $('<div class="animate"></div>');
var animateBtn = $('<button id="animate">Animate</button>');
var animateBtn1 = $('<button id="animate">Start!</button>');
animateBtn.css('background-color', 'rgba(192, 192, 192, 0.5)');
animateBtn1.css('background-color', 'rgba(192, 192, 192, 0.5)');
animateDiv.append(animateBtn);
animateDiv.append(animateBtn1);


container.append(animateDiv);

// fifth button:
// animation
var exportDiv = $('<div class="export"></div>');
var exportBtn = $('<button id="export">Export</button>');
exportBtn.css('background-color', 'rgba(192, 192, 192, 0.5)');
exportDiv.append(exportBtn);

container.append(exportDiv);


// option menue:
var optionMenu = $('<div class="optionMenu"></div>');
optionMenu.css('position', 'absolute');
optionMenu.css('width', '100%');
optionMenu.css('height', '100%');
optionMenu.css('top', '0px');
optionMenuList = $('<ul id="optionMenu"></ul>');
optionMenuList.append($('<li id="pickplace">pick/place</li>'));
optionMenuList.append($('<li id="traj">trajectory following</li>'));

optionMenuAttach = $('<li id="attachment">attachment</li>')
optionMenuAttachList = $('<ul id="secondary"></ul>');
optionMenuAttachList.append($('<li id="att-cyl">cylinder</li>'));
optionMenuAttachList.append($('<li id="att-rect">rectangular prism</li>'));
optionMenuAttachList.append($('<li id="att-flat">flat plane</li>'));
optionMenuAttach.append(optionMenuAttachList);
optionMenuList.append(optionMenuAttach);


optionMenu.append(optionMenuList);

container.append(optionMenu);

