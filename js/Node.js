// Node Object
        // @param string name : Name
        // @param string type : seq for sequence, par for parallel or fre for free order
        function Node(name, infoObject, type) {

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
            };

            // Node is expanded, boolean value
            this.isExpanded = true;

            // Node is selected, boolean value
            this.isSelected = false;

            // Node depth
            this.depth = 0;

            // Parent Node
            this.parent = null;

            // Child Nodes
            this.children = [];


            //METHODS

            this.getRoot = function () {
                var root = this.getParent();
                //console.log(root);

                while (root.getParent() != null) {
                    root = root.getParent();
                }

                return root;
            }

            this.getId = function () {
                return this.id;
            }

            this.setId = function (id) {
                this.id = id;
            }

            this.getParent = function () {
                return this.parent;
            }

            this.setParent = function (parent) {
                this.parent = parent;
            }

            this.getChildren = function () {
                return this.children;
            }

            this.addChild = function (node) {
                this.children.push(node);
                this.getChildren()[this.getChildren().length-1]
                .setDepth(this.getDepth()+1);

            }

            this.getDepth = function () {
                return this.depth;
            }

            this.setDepth = function (depth) {
                this.depth = depth;
            }

            this.removeChild = function (id) {
                var index = 0;
                for (var i = 0; i < this.getChildren().length && this.getChildren()[i].getId() != id; i++) {
                    index = index +1;
                };

                if (this.getChildren()[index].getId() == id) {
                    this.getChildren()[index].setParent(this.getRoot());
                    this.getChildren()[index].setDepth(1);
                    this.children.splice(index, 1);
                };
            }

            // Output to JSON
            this.toJSON = function () {

                return {
                    id:this.id,
                    parentId:this.getParent().getId(),
                    //className:this.className,
                    type:this.type,
                    name:this.name,
                    //childIndex:getChildIndex(this),
                    expanded:this.expanded,
                    rootId:this.getRoot().getId(),
                    depth:this.depth,
                    selected:this.selected,
                    //data:this.data,
                    children:this.getChildren()
                }
            }
        }