KISSY.add("canvax/display/DisplayObjectContainer" , function(S , DisplayObject){

    DisplayObjectContainer = function(){
       var self = this;
       self.children = [];
       self.mouseChildren = [];
       arguments.callee.superclass.constructor.apply(this, arguments);
    };

    

    S.extend(DisplayObjectContainer , DisplayObject , {
        addChild : function(child){
            if(this.getChildIndex(child) != -1) {
                child.parent = this;
                return child;
            }

            if(child.parent) {
                child.parent.removeChild(child);
            }
            this.children.push( child );
            child.parent = this;
            if(this.heartBeat){
               this.heartBeat({
                 convertType : "children",
                 target       : child,
                 src      : this
               });
            }
            if(this.afterAddChild){
               this.afterAddChild(child);
            }
            return child;
        },
        addChildAt : function(child, index) {
            if(this.getChildIndex(child) != -1) {
                child.parent = this;
                return child;
            }

            if(child.parent) {
                child.parent.removeChild(child);
            }
            this.children.splice(index, 0, child);
            child.parent = this;
            
            if(this.heartBeat){
               this.heartBeat({
                 convertType : "children",
                 target       : child,
                 src      : this
               });
            }
            
            if(this.afterAddChild){
               this.afterAddChild(child);
            }


            return child;
        },
        removeChild : function(child) {
            return this.removeChildAt(S.indexOf( child , this.children ));
        },
        removeChildAt : function(index) {

            if (index < 0 || index > this.children.length - 1) {
                return false;
            }
            var child = this.children[index];
            if (child != null) {
                child.parent = null;
            }
            this.children.splice(index, 1);

            
            if(this.heartBeat){
               this.heartBeat({
                 convertType : "children",
                 target       : child,
                 src      : this
               });
            };

            
            if(this.afterDelChild){
               this.afterDelChild(child);
            }


            return true;
        },
        removeChildById : function( id ) {	
            for(var i = 0, len = this.children.length; i < len; i++) {
                if(this.children[i].id == id) {
                    return this.removeChildAt(i);
                }
            }
            return null;
        },
        removeAllChildren : function() {
            while(this.children.length > 0) {
                this.removeChildAt(0);
            }
        },
        getChildById : function(id){
            for(var i = 0, len = this.children.length; i < len; i++){
                if(this.children[i].id == id) {
                    return this.children[i];
                }
            }
            return null;
        },
        getChildAt : function(index) {
            if (index < 0 || index > this.children.length - 1) return null;
            return this.children[index];
        },
        getChildIndex : function(child) {
            return S.indexOf( child , this.children );
        },
        setChildIndex : function(child, index){
            if(child.parent != this) return;
            var oldIndex = S.indexOf(child , this.children);
            if(index == oldIndex) return;
            this.children.splice(oldIndex, 1);
            this.children.splice(index, 0, child);
        },
        contains : function(child) {
            return this.getChildIndex(child) != -1;
        },
        getNumChildren : function() {
            return this.children.length;
        },
        //获取x,y点上的所有object  num 需要返回的obj数量
        getObjectsUnderPoint : function(x, y , num) {
            var result = [];
            for(var i = this.children.length - 1; i >= 0; i--) {
                var child = this.children[i];

                if(child == null || !child.eventEnabled) {
                    continue;
                }

                if( child instanceof DisplayObjectContainer ) {
                    //是集合
                    if (child.mouseChildren && child.getNumChildren() > 0){
                       var objs = child.getObjectsUnderPoint(x, y);
                       if (objs.length > 0){
                          result = result.concat( objs );
                       }
                    }		
                } else {
                    //非集合，可以开始做hitTestPoint了
                    if (child.hitTestPoint(x, y)) {
                        result.push(child);
                        if (num != undefined && !isNaN(num)){
                           if(result.length == num){
                              return result;
                           }
                        }
                    }
                }
            }
            return result;
        },
        render : function(context) {
            for(var i = 0, len = this.children.length; i < len; i++) {
                var child = this.children[i];
                child._render(context);
            }
        }



    });

    return DisplayObjectContainer;

},{
   requires:[
     "canvax/display/DisplayObject"
   ]
})
