/*------------------------------------------------------------
Created by JPPernin, 21 June 2013, V001
RULES : 
1. A view is added to the object <pObject> by method addView (<pObject>, <htmlCode>);For example = addView (this, ....).
Automatically following references must be used.
3. View id = "animal1"
4. View class = "animal"
--------------------------------------------------------------*/
//var pObjectNumber = 0;
//-------------------- ALL THE MVC CODE IS HERE  ------------------
// ? Transform in POO style : Object.addView ?

function addView(pObject, pHTMLCode) {
	var vModel = pObject;
	//Create a div for the view and add to document
	var vView = document.createElement("div");
	vView.setAttribute("class",vModel.className);
	vView.innerHTML=pHTMLCode;
	document.body.appendChild(vView);

	//attach model to view
	vView._model= vModel;

	//attach views as an array element in model 
	if (isNaN(vModel.instanceNb)) { // The first instanciation, creating an array
		vModel.instanceNb=0;
		vView.setAttribute("id", vModel.className+"_view"+vModel.instanceNb+"_id"+vModel.id);
		var viewArray = new Array();
		viewArray [0]=vView;
		vModel._view = viewArray;
		vModel._view = new Array();
		vModel._view [0]=vView;	
	} else {                      // The other instanciations
		vModel.instanceNb+=1
		vView.setAttribute("id", vModel.className+"_view"+vModel.instanceNb+"_id"+vModel.id);
		vModel._view [vModel.instanceNb]=vView.id;
	}
	return (vView);
}
/* 
Object.prototype.addView = function(pHTMLCode) {
	var vModel = this;
	// Create a div for the view and add to document
	var vView = document.createElement("div");
	vView.setAttribute("class",vModel.className);
	vView.innerHTML=pHTMLCode;
	document.body.appendChild(vView);

	// attach model to view
	vView._model= vModel;

// attach views as an array element in model 
	if (isNaN(vModel.instanceNb)) { // The first instanciation, creating an array
		vModel.instanceNb=0;
		vView.setAttribute("id", vModel.className+"_view"+vModel.instanceNb+"_id"+vModel.id);
		var viewArray = new Array();
		viewArray [0]=vView;
		vModel._view = viewArray;
		// vModel._view = new Array();
		// vModel._view [0]=vView;	
	} else {                      // The other instanciations
		vModel.instanceNb+=1
		vView.setAttribute("id", vModel.className+"_view"+vModel.instanceNb+"_id"+vModel.id);
		vModel._view [vModel.instanceNb]=vView.id;
	}
	return (null);
}
 */
//----------------- UTILITIES -----------------------------------------------
function className(pArguments) {
   var vName = pArguments.callee.toString();
   vName = vName.substr('function '.length);
   vName = vName.substr(0, vName.indexOf('('));
   return(vName);
}
function attach_css_file (pFileName) {
	var headID = document.getElementsByTagName("head")[0]; 
	var cssNode = document.createElement("link");cssNode.type = "text/css";
	cssNode.rel = "stylesheet";cssNode.href = pFileName ;
	headID.appendChild(cssNode);
}
function attach_class (pClassName) {
	var headID = document.getElementsByTagName("head")[0]; 
	var cssNode = document.createElement("link");cssNode.type = "text/css";
	cssNode.rel = "stylesheet";cssNode.href = pFileName ;
	headID.appendChild(cssNode);
}
