
// GLOBAL VARIABLES : To improve
var gClassNodeInstanceNumber=0; // Used to name new nodes by default
var gCurrentNodeCopyRef = null; // Used to paste
var gCurrentPastedElementNb = 0; // Used to name pasted nodes by default

/*=================================================================
CLASS NODE
==================================================================*/

function node (	// PARAMETERS
	pNodeName, // A  String
	pInfoObject, // a javascript Object
	pNodeType // A  String : seq for sequence, par for parallel or fre for free order
) {
	// 1. MODEL ATTRIBUTES ==================================================================
	
	this.className=className(arguments); // MANDATORY, TO IMPROVE
	this.id = 0;
	this.nodeName = pNodeName;
	
	if (pNodeType!=null) {this.nodeType = pNodeType;} else {this.nodeType="seq"};
	this.rootNode = this;
	this.expanded = true;
	this.selected = false;
	this.nodeDepth = 0;
	this.parentNode = null;
	if (pInfoObject!=null) {
		this.data=pInfoObject;
	} else {
		this.data=null;
	}
	this.childNodes = [];

	/*=================================================================/
	TWO MAIN METHODS : insertChildAtIndex and removeChildAtIndex
	=================================================================*/
	this.insertChildAtIndex = function(pNodeRef, pIndex, pUndo) {
		if (pUndo == null) {	pUndo = true; }
		var vChildrenNb = this.childNodes.length;
		if (pIndex>vChildrenNb) {console.log ("error : Inserting impossible at index <"+pIndex+">. Currrent lenght is <"+vChildrenNb+">");}

		this.childNodes.splice(pIndex,0,pNodeRef);
		pNodeRef.parentNode=this;
		pNodeRef.nodeDepth=this.nodeDepth+1;

		// Store undo command
		if (pUndo) {
			while(document.undoCommandStack.length-1>document.undoCommandStackCurrentIndex) {
				document.undoCommandStack.pop ();
				document.undoCommandStackCurrentIndex-1;
			}
			document.undoObjectsStack.push(this);
			document.undoObjectsStack.push(pNodeRef);
			document.redoCommandStack.push(
				"document.undoObjectsStack["+(document.undoObjectsStack.length-2)+"].insertChildAtIndex(document.undoObjectsStack["+
				(document.undoObjectsStack.length-1)+"],"+pIndex+", false)");
			document.undoCommandStack.push("(document.undoObjectsStack["+(document.undoObjectsStack.length-2)+"]).removeChildAtIndex("+pIndex+", false)");
			document.undoCommandStackCurrentIndex++;
		}

		getRootNode(this).renumberTree();
		return (pNodeRef);
	}

	/*=================================================================*/
	this.removeChildAtIndex = function(pIndex, pUndo ) {
		if (pUndo == null) {	pUndo = true; }
		var vChildrenNb = this.childNodes.length;
		if (pIndex>vChildrenNb) {console.log ("error : Removing impossible at index <"+pIndex+">. Currrent lenght is <"+vChildrenNb+">");}
		vNodeToRemove= this.childNodes[pIndex];
		vNodeToRemoveView = vNodeToRemove._view[0];
		this.childNodes.splice(pIndex,1);// DELETE MODEL 
		vNodeToRemoveView.parentNode.removeChild(vNodeToRemoveView);// DELETE VIEW 

		// Store undo command
		if (pUndo) {
			while(document.undoCommandStack.length-1>document.undoCommandStackCurrentIndex) {
				document.undoCommandStack.pop ();
				document.undoCommandStackCurrentIndex-1;
			}
			document.undoObjectsStack.push(this);
			document.undoObjectsStack.push(vNodeToRemove);
			document.redoCommandStack.push("(document.undoObjectsStack["+(document.undoObjectsStack.length-2)+"]).removeChildAtIndex("+pIndex+", false)");
			document.undoCommandStack.push(
				"document.undoObjectsStack["+(document.undoObjectsStack.length-2)+"].insertChildAtIndex(document.undoObjectsStack["+
				(document.undoObjectsStack.length-1)+"],"+pIndex+", false)");
			document.undoCommandStackCurrentIndex++;
		}
		getRootNode(this).renumberTree();
		return (vNodeToRemove);
	}

	/*=================================================================*/
	this.appendChild = function(pNodeRef) {
		var vChildrenNb = this.childNodes.length;
		this.insertChildAtIndex (pNodeRef, this.childNodes.length);
		return (pNodeRef);
	}

	/*=================================================================*/
	this.insertBefore = function(pTarget) {
		vIndexToInsert=getChildIndex (pTarget);
		pTarget.parentNode.insertChildAtIndex (this, vIndexToInsert);
	}

	/*=================================================================*/
	this.moveChildAtIndex = function(pNodeRef, pTargetIndex) {
		vOriginIndex=getChildIndex(pNodeRef);
		vCurrentParent=pNodeRef.parentNode;
		vTargetParent=this;
		if (!((vCurrentParent==vTargetParent)&&(pTargetIndex==vOriginIndex))){
			var vChildrenNb = this.childNodes.length;
			if (pTargetIndex>vChildrenNb) {
				console.log ("error : Inserting impossible at index <"+pTargetIndex+">. Currrent lenght is <"+vChildrenNb+">");
			}
			if (vCurrentParent!= null) {
				vNodeToMove=vCurrentParent.removeChildAtIndex (vOriginIndex);
				if (vOriginIndex>pTargetIndex) {
					this.insertChildAtIndex (vNodeToMove, pTargetIndex);
				} else {
					this.insertChildAtIndex (vNodeToMove, pTargetIndex-1);
				}
			}
		} else {
		// alert("impossible");
		}
	}
	
	/*=================================================================*/
	this.copy = function(pRootNode, pNodeName) {
		
		var vNewObject = new node (pNodeName);
		// COPY RELEVANT FIELDS EXCEPT REFERENCES
		vNewObject.data=this.data;
		vNewObject.nodeType = this.nodeType;
		vNewObject.rootNode = pRootNode;
		vNewObject.expanded = true;
		vNewObject.parentNode = null;
		
		for (var i=0;i<this.childNodes.length;i++) {
			var vChild = this.childNodes[i];
			vCopyChild=vChild.copy (pRootNode);
			vNewObject.insertChildAtIndex (vCopyChild, i);
		}

		return vNewObject;
	}

	/*=================================================================*/
	this.paste = function () {
		gCurrentPastedElementNb++;
		var vNewCopy=gCurrentNodeCopyRef.copy (vNewCopy, gCurrentNodeCopyRef.nodeName+"("+gCurrentPastedElementNb+")");
		vNewCopy.nodeName +="("+gCurrentPastedElementNb+")";
		this.insertChildAtIndex(vNewCopy, this.childNodes.length); // ADD AT END OF CHILDREN LIST
	}
	
	/*=================================================================*/
	this.renumberTree = function () {
		getRootNode(this).nbNodes=0;
		getRootNode(this).renumberNodeId ();
		return null;
	}
	
	this.renumberNodeId = function(	){
		var vCurrentIndex=getRootNode(this).nbNodes;
		this.id=getRootNode(this).nbNodes;
		(getRootNode(this).nbNodes)++;
		for ( var i=0;i<this.childNodes.length;i++) {
			this.childNodes[i].renumberNodeId ();
		}
		return null;
	}

	/*=================================================================*/
	this.toJSON = function () {
		return {
			activite:this.id,
			parentNodeId:getParentId(this),
			className:this.className,
			nodeType:this.nodeType,
			nodeName:this.nodeName,
			childIndex:getChildIndex(this),
			expanded:this.expanded,
			rootNodeId:getRootNode(this).id,
			nodeDepth:this.nodeDepth,
			selected:this.selected,
			data:this.data,
			children:this.childNodes
		} 
	}

	//2. VIEW ==================================================================
	vView0 = addView (this, 
		"<div id='parent_operator'></div>"+
		"<div id='tool_expand' class=\"no_expand\"></div>"+
		"<div id='content'>"+
			"<div id='title'></div>"+
			"<div id='top_area'></div>"+
			"<div id='bottom_area'></div>"+
			"<div id='right_area'></div>"+
			"<div id='tools'>"+
					"<div id='tool_add_child'></div>"+
					"<div id='tool_add_sibling'></div>"+
					"<div id='tool_copy'></div>"+
					"<div id='tool_paste'></div>"+
					"<div id='tool_remove'></div>"+
					"<div id='tool_edit'></div>"+
					"<div id='tool_view'></div>"+
			"</div>"+
		"</div>"
	);
	
	/*=================================================================*/
	this.draw = function(pViewNumber) {
		if (pViewNumber==null) {pViewNumber=0}//
		eval("this.draw"+pViewNumber+"()");
	}

	this.draw0 = function() {
		var vNodeView=this._view[0];
		vNodeView.style.display = "block";
		var vParent=this.parentNode;
		
		// NESTING DIVS
		if (vParent!=null) { 
			vParentView = vParent._view[0];
			$(vParentView).append ($(vNodeView));
			$(vNodeView).css({"visibility":"visible"});
		} else { 
			vParentView = null;
			$(vNodeView).css({"visibility":"visible"});
		}
		
		// DRAW OPERATOR
		if (vParent!=null) {
			var $tool_parent_operator=$(vNodeView).find ("#parent_operator");
			var vParentOperator= vParent.nodeType;
			switch (vParentOperator) {
				case "seq" : 
					if (getChildIndex(this) == vParent.childNodes.length-1) {
						$tool_parent_operator.removeClass().addClass('op_sequence');
					} else {
						$tool_parent_operator.removeClass().addClass('op_sequence_last');
					}
					break;
				case "par" : 
					if (getChildIndex(this) != vParent.childNodes.length-1) {
						$tool_parent_operator.removeClass().addClass('op_parallel');
					} else {
						$tool_parent_operator.removeClass().addClass('op_parallel_last');
					}
					break;
				case "fre" : 
					if (getChildIndex(this) != vParent.childNodes.length-1) {
						$tool_parent_operator.removeClass().addClass('op_free');
					} else {
						$tool_parent_operator.removeClass().addClass('op_free_last');
					}
					break;
			}
		}
		// DRAW TITLE 
		$(vNodeView).find ("#title").contenteditable=true;
		$(vNodeView).find ("#title").html ("id"+this.id+":"+this.nodeName);

		// DRAW SPECIFIC TOOLS IF NOT ROOT NODE
		var $tool_remove=$(vNodeView).find ("#tool_remove");
		var $tool_add_sibling=$(vNodeView).find ("#tool_add_sibling");
		if (this.parentNode != null) {
			$tool_remove.css("display","inline-block")
			$tool_add_sibling.css("display","inline-block")
		} else {
			$tool_remove.css("display","none")
			$tool_add_sibling.css("display","none")
		}

		// DRAW GENERIC TOOLS 
		var $tool_expand=$(vNodeView).find ("#tool_expand");
		if (this.childNodes.length==0) {
				$tool_expand.removeClass().addClass('no_expand');
		} else {
			if (this.expanded) {
				$tool_expand.removeClass().addClass('expanded');
			} else {
				$tool_expand.removeClass().addClass('collapsed');
			}
		}
		for (var i=0;i<this.childNodes.length;i++) {
			vChildView=this.childNodes [i]._view[0]; 			
			if (this.expanded) {
				this.childNodes [i]._view[0].style.display = "block";
				this.childNodes [i].draw();
			} else {
				this.childNodes [i]._view[0].style.display = "none";
			}
		}

		// BUILD JSON Tree
		var vJSONtree = JSON.stringify(this.rootNode ,"", " ")

		// SPECIFIC FOR TESTING
		$("#texte").html("<pre>"+vJSONtree+"</pre>");
		
		return vJSONtree;
	}
	
	// 3. CONTROLLERS  ==================================================================	
	this.controller = function(pViewNumber) {
		if (pViewNumber==null) {pViewNumber=0}//
		eval("this.controller"+pViewNumber+"()");
	}

	this.controller0 = function() {
		// GET ALL DIV COMPONENTS REFERENCES
		var $vViewObject=$(this._view[0]);
		var $vContent=$vViewObject.find ("#content");
		var $vTopArea=$vViewObject.find ("#top_area");
		var $vBottomArea=$vViewObject.find ("#bottom_area");
		var $vRightArea=$vViewObject.find ("#right_area");
		var $parent_operator=$vViewObject.find ("#parent_operator");
		var $tool_add_child=$vViewObject.find ("#tool_add_child");
		var $tool_add_sibling=$vViewObject.find ("#tool_add_sibling");
		var $tool_remove=$vViewObject.find ("#tool_remove");
		var $tool_copy=$vViewObject.find ("#tool_copy");
		var $tool_paste=$vViewObject.find ("#tool_paste");
		var $tool_edit=$vViewObject.find ("#tool_edit");
		var $tool_view=$vViewObject.find ("#tool_view");
		var $tool_expand=$vViewObject.find ("#tool_expand");

		// ---- interaction on Main View object
		$vViewObject.draggable({
			opacity:0.5,
			revert:true,
			zIndex: 999
		});

		// ---- interaction on Right Area
		$vRightArea.droppable({
			hoverClass: "ui-state-active",
			tolerance : "pointer",
			drop : function (event, ui) {
				event.stopPropagation();
				vDraggedModel=ui.draggable.context._model;
				vTargetModel=$(this).closest('.node')[0]._model;
				
				vTargetModel.moveChildAtIndex (vDraggedModel,0);
				vTargetModel.expanded=true;
				getRootNode(vTargetModel).draw();
			},
		});

		// ---- interaction on Top Area
		$vTopArea.droppable({
			hoverClass: "ui-state-active",
			tolerance : "pointer",
			drop : function (event, ui) {
				event.stopPropagation();
				vDraggedModel=ui.draggable.context._model;
				vTargetModel=$(this).closest('.node')[0]._model;
				if (vTargetModel.parentNode!=null) {
					vTargetModel.parentNode.moveChildAtIndex (vDraggedModel,getChildIndex(vTargetModel));
				} else {
					alert("Impossible : the root must be unique");
				}
				getRootNode(vTargetModel).draw();
			},
		});
		
		// ---- interaction on Bottom Area
		$vBottomArea.droppable({
			hoverClass: "ui-state-active",
			tolerance : "pointer",
			drop : function (event, ui) {
				event.stopPropagation();
				var vDraggedModel=ui.draggable.context._model;
				vTargetModel=$(this).closest('.node')[0]._model;
				if (vTargetModel.parentNode!=null) {
					vTargetModel.parentNode.moveChildAtIndex (vDraggedModel,getChildIndex(vTargetModel)+1);
				} else {
					alert("Impossible : the root must be unique");
				}
				getRootNode(vTargetModel).draw();
			},
		});		

		// ---- interaction on Content Area
		$vContent.mouseover(function(event) {
			vObjectModel=$(this).closest('.node')[0]._model;
			($(this).find (">#tools")).css("visibility","visible");;// ("visibility","visible");
			var vData =(JSON.stringify(vObjectModel.data,""," "));
			if (vData!="null") {
				$("#situation").html(// A EVITER FAIT REFERENCE A UN OBJET $("#situation") EXTERNE : A METTRE DANS LE MAIN ? 
					vObjectModel.nodeName+"<br>SITUATION D'INTERACTION : <br>"+vData
				); 
			} else {
				$("#situation").html(vObjectModel.nodeName+"<br>SITUATION D'INTERACTION : <br><input type='button' value='select a pattern ' onclick='alert(\"\")'>");
			}
			// $("#situation").show();
			getRootNode(vObjectModel).draw();
			event.stopPropagation();
		});

		$vContent.mouseout(function(event) {
			vObjectModel=$(this).closest('.node')[0]._model;
			($(this).find (">#tools")).css("visibility","hidden");;// ("visibility","visible");
			getRootNode(vObjectModel).draw();
			// $("#situation").html("");//vObjectModel.data);
			// $("#situation").hide();
			event.stopPropagation();
		});

		$vContent.click(function(event) {
			vObjectModel=$(this).closest('.node')[0]._model;
			if (vObjectModel.childNodes.length>0) {
				vObjectModel.expanded=!vObjectModel.expanded;
			} else {
				vObjectModel.expanded=true;
			}
			getRootNode(vObjectModel).draw();
			event.stopPropagation();
		});

		// ---- interaction on Tools
		$tool_add_child.click(function(event) {
			vObjectModel=$(this).closest('.node')[0]._model;// GET OBJECT MODEL
			do {
				vNodeName = prompt (gClassNodeInstanceNumber+" Nom :", "Node"+eval(gClassNodeInstanceNumber+1));
			} while (vNodeName==""); 
			vObjectModel.insertChildAtIndex(new node (vNodeName), 0);//vObjectModel.childNodes.length); // ADD AT END OF CHILDREN LIST
			vObjectModel.expanded=true;
			getRootNode(vObjectModel).draw();
			event.stopPropagation();
		});

		$tool_add_sibling.click(function(event) {
			vObjectModel=$(this).closest('.node')[0]._model;// GET OBJECT MODEL

			if (vObjectModel.parentNode!=null) { // THE ROOT NODE MUST BE UNIQUE
				vParentModel=vObjectModel.parentNode;// GET PARENT MODEL
				do {
					vNodeName = prompt (gClassNodeInstanceNumber+" Nom :", "Node"+eval(gClassNodeInstanceNumber+1));
				} while (vNodeName==""); 
				vParentModel.insertChildAtIndex(new node (vNodeName), getChildIndex(vObjectModel)+1); 
				vObjectModel.expanded=true;
				getRootNode(vObjectModel).draw();
			}
			event.stopPropagation();
		});

		$tool_remove.click(function(event) {
			vObjectModel=$(this).closest('.node')[0]._model; // GET OBJECT MODEL
			if (vObjectModel.parentNode!=null) { // THE ROOT NODE IS NOT REMOVABLE
				var vObjectIndex = getChildIndex (vObjectModel)
				var vParentModel=vObjectModel.parentNode;
				if (confirm ("remove"+vObjectModel.nodeName+ " and all the hierarchy")) {
					getRootNode(vObjectModel).draw();
					vParentModel.removeChildAtIndex (vObjectIndex);
					getRootNode(vObjectModel).draw();
				}
			} // else {
				// alert(""):
			// }
			event.stopPropagation();
		});

		
		$tool_copy.click(function(event) {
			gCurrentPastedElementNb=0;
			vObjectModel=$(this).closest('.node')[0]._model; // GET OBJECT MODEL
			gCurrentNodeCopyRef=vObjectModel.copy (vObjectModel,vObjectModel.nodeName+"_copy" );
			event.stopPropagation();
		});

		$tool_paste.click(function(event) {
			vObjectModel=$(this).closest('.node')[0]._model; // GET OBJECT MODEL

			vObjectModel.paste ();
			getRootNode(vObjectModel).draw();			
			event.stopPropagation();
		});

		$tool_edit.click(function(event) {
			vObjectModel=$(this).closest('.node')[0]._model; // GET PARENT MODEL
			var vNodeName = vObjectModel.nodeName;
			do {
				vNodeName = prompt ("Title : ",vNodeName);
			} while (vNodeName==""); 
			vObjectModel.nodeName = vNodeName ;
			getRootNode(vObjectModel).draw();
			event.stopPropagation();
		});

		$parent_operator.click(function(event) {
			vObjectModel=$(this).closest('.node')[0]._model; // GET PARENT MODEL
			if (confirm ("Node Type ? (OK for sequence, Cancel for Parallelism)")) {
				vObjectModel.parentNode.nodeType="seq";
			} else {
				vObjectModel.parentNode.nodeType="par";
			}
			getRootNode(vObjectModel).draw();
			event.stopPropagation();
		});

		$tool_view.click(function(event) {
			alert("view");
			event.stopPropagation();
		});

		$tool_expand.click(function(event) {
			vObjectModel=$(this).closest('.node')[0]._model;
			if (vObjectModel.childNodes.length>0) {
				vObjectModel.expanded=!vObjectModel.expanded;
			} else {
				vObjectModel.expanded=true;
			}
			getRootNode(vObjectModel).draw();
			event.stopPropagation();
		});
		
	} 

	this.controller ();

	gClassNodeInstanceNumber++;
}


//============ UNDO/REDO MANAGEMENT ===========================
document.undoCommandStack = new Array (); // STACK for undo instructions
document.redoCommandStack = new Array (); // STACK for redo instructions
document.undoCommandStackCurrentIndex = -1; // THE ARRAY IS EMPTY : current index = -1
document.undoObjectsStack = new Array (); // Used to preserve objects references

/* FUNCTION resetUndo ----------------------------
Reinitialize all structures for manage undo system
*/ 
function resetUndo () {
	document.undoObjectsStack.splice(0,document.undoObjectsStack.length);
	document.undoCommandStack.splice(0,document.undoCommandStack.length);
	document.redoCommandStack.splice(0,document.redoCommandStack.length);
	document.undoCommandStackCurrentIndex = -1; 
}

/* FUNCTION Undo */
function undo () {
	if ((document.undoCommandStackCurrentIndex>=0)&&(document.undoCommandStackCurrentIndex<=document.undoCommandStack.length-1)) {
		eval(document.undoCommandStack[document.undoCommandStackCurrentIndex]);
		if (document.undoCommandStackCurrentIndex>=0) {
			document.undoCommandStackCurrentIndex--;
		}
	} else {
		console.log ("Undo is impossible");
	}
}
/* FUNCTION Redo */
function redo () {
	if (document.undoCommandStackCurrentIndex<document.undoCommandStack.length-1) {
		document.undoCommandStackCurrentIndex++;
		eval(document.redoCommandStack[document.undoCommandStackCurrentIndex]);
	} else {
		console.log ("Redo is impossible");
	}
	
}

/* ===========UTILITIES ===================================*/
function getRootNode (pNode) {
	vRoot=pNode
	while (vRoot.parentNode!=null) {
		vRoot=vRoot.parentNode;
	}
	return (vRoot);
}

function getParentId (pNode) {
	vParent=pNode.parentNode;
	if (vParent!=null) {
		vParentId = vParent.id;
	} else {
		vParentId = null;
	}
	return (vParentId);
}

function getChildIndex (pNode) {
	vParent=pNode.parentNode;
	if (vParent!=null) {
		vChildIndex=vParent.childNodes.indexOf(pNode);
	} else {
		vChildIndex=0;
	}
	return (vChildIndex);
}

function getClassInstancesNb(pClassName) { // TO CHECK DOESNT WORK
	return (document.getElementsByClassName(pClassName).length);
}
