// Node Object
// @param string name : Name
// @param string type : seq for sequence, par for parallel or fre for free order
function Node(name, infoObject, type) {
    "use strict";

    //ATTRIBUTES

    // Node ID
    this.id = null;

    //this.className = className(arguments); // MANDATORY, TO IMPROVE

    // Node Name
    this.name = name;

    // Node Type Sequence/Parallel/Free Order ("seq", "par", "fre", Default : "seq")
    this.type = type;

    if (type === null) {
        this.type = "seq";
    }

    // Node is expanded, boolean value
    this.isExpanded = true;

    // Node is selected, boolean value
    this.isSelected = false;

    // Node depth
    this.depth = 0;

    // Parent Node
    this.parent = null;

    // if (this.parent !== null) {
    //     this.parentId = this.parent.id;
    // };

    // Child Nodes
    this.children = [];


    //METHODS

    this.getRoot = function () {
        var root = this.parent;
        //console.log(root);

        while (root.parent !== null) {
            root = root.parent;
        }

        return root;
    };

    this.addChild = function (node) {
        this
            .children
            .push(node);

        this
            .children[this.children.length - 1]
            .depth = this.depth + 1;
    };

    this.removeChild = function (id) {
        var index = 0,
            i = 0;

        for (i; i < this.children.length && this.children[i].id !== id; i++) {
            index = index + 1;
        }

        if (this.children[index].id === id) {
            this.children[index].parent = this.getRoot();
            this.children[index].depth = 1;
            this.children.splice(index, 1);
        }
    };

    // Output to JSON
    this.toJSON = function () {
        var totalChildren = "",
            i = 0;

        for (i; i < this.children.length; i++) {
            totalChildren =  totalChildren + " " + this.children[i].id;
        }

        return {
            id : this.id,
            parentId : this.parent.id,
            //className : this.className,
            type : this.type,
            name : this.name,
            //childIndex : getChildIndex(this),
            expanded : this.expanded,
            rootId : this.getRoot().id,
            depth : this.depth,
            selected : this.selected,
            //data : this.data,
            children : this.children
        };
    };
}