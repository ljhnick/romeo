/**
 * user interface layout
 *
 * @author Jiahao Li
 */

var container = $('<div class="container"></div>');

container.css("box-sizing", "border-box");
container.css("display", "flex");
container.css("flex-direction", "column");
container.css("align-items", "center");
container.css("background-color", "white");

container.css("width", "100%");
container.css("height", "100%");

container.css("overflow", "auto");

/*
	title
*/

var title = $("<h3></h3>");
title.html("ROMEO");
title.css("font-family", "Helvetica");
title.css("font-size", "24px");
title.css("font-weight", "bold");
title.css("box-sizing", "border-box");
title.css("box-shadow", "0 5px 4px -4px #888888");
title.css("padding", "1em 2em");
title.css("width", "100vw");
title.css("top", "0");
title.css("position", "absolute");
title.css("margin", "0");
container.append(title);

/*
	4 buttons
*/

var buttonContainer = $('<div class="buttons"></div>');

buttonContainer.css("box-sizing", "border-box");
buttonContainer.css("display", "flex");
buttonContainer.css("justify-content", "center");
buttonContainer.css("background-color", "#D9D9D9");
buttonContainer.css("padding", "1em");
buttonContainer.css("width", "40%");
buttonContainer.css("border-radius", "5px");
buttonContainer.css("position", "absolute");
buttonContainer.css("bottom", "2em");
container.append(buttonContainer);

// first button:
// select transformable parts
var selTransPtDiv = $('<div class="transPt"></div>');
var selTransPtBtn = $(
  '<button id="transPt"><img src = "./buttons/transformable.svg"/></button>'
);
selTransPtBtn.css("border-style", "hidden");
selTransPtBtn.css("background-color", "#D9D9D9");

selTransPtDiv.append(selTransPtBtn);

buttonContainer.append(selTransPtDiv);

// second button:
// specify spatial point
var specPtDiv = $('<div class="specPt"></div>');
var specPtBtn = $('<button id="specPt">Specify Point (object fixed)</button>');
var specPtBtn1 = $(
  '<button id="specPt">Specify Point (object moving)</button>'
);
specPtBtn.css("background-color", "rgba(192, 192, 192, 0.5)");
specPtBtn1.css("background-color", "rgba(192, 192, 192, 0.5)");
specPtDiv.append(specPtBtn);
specPtDiv.append(specPtBtn1);

buttonContainer.append(specPtDiv);

// third button:
// generate robotic arm
var genArmDiv = $('<div class="genArm"></div>');
var genArmBtn = $(
  '<button id="genArm"><img src="./buttons/generateArm.svg"/></button>'
);
genArmBtn.css("border-style", "hidden");
genArmBtn.css("background-color", "#D9D9D9");

genArmDiv.append(genArmBtn);

buttonContainer.append(genArmDiv);

// forth button:
// animation
var animateDiv = $('<div class="animate"></div>');
var animateBtn = $(
  '<button id="animate"><img src="./buttons/start.svg"/></button>'
);
animateBtn.css("border-style", "hidden");
animateBtn.css("background-color", "#D9D9D9");

animateDiv.append(animateBtn);

buttonContainer.append(animateDiv);

// fifth button:
// animation
var exportDiv = $('<div class="export"></div>');
var exportBtn = $(
  '<button id="export"><img src="./buttons/export.svg"/></button>'
);
exportBtn.css("border-style", "hidden");
exportBtn.css("background-color", "#D9D9D9");

exportDiv.append(exportBtn);

buttonContainer.append(exportDiv);

// option menue:
var optionMenu = $('<div class="optionMenu"></div>');
optionMenu.css("position", "absolute");
optionMenu.css("width", "100%");
optionMenu.css("height", "100%");
optionMenu.css("top", "0px");
optionMenuList = $('<ul id="optionMenu"></ul>');
optionMenuList.append($('<li id="pickplace">pick/place</li>'));
optionMenuList.append($('<li id="traj">trajectory following</li>'));

optionMenuAttach = $('<li id="attachment">attachment</li>');
optionMenuAttachList = $('<ul id="secondary"></ul>');
optionMenuAttachList.append($('<li id="att-cyl">cylinder</li>'));
optionMenuAttachList.append($('<li id="att-rect">rectangular prism</li>'));
optionMenuAttachList.append($('<li id="att-flat">flat plane</li>'));
optionMenuAttach.append(optionMenuAttachList);
optionMenuList.append(optionMenuAttach);

optionMenu.append(optionMenuList);

buttonContainer.append(optionMenu);
