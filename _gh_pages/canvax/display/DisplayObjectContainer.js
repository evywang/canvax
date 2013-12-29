/**
 * Canvax
 *
 * @author 释剑 (李涛, litao.lt@alibaba-inc.com)
 *
 * 模拟as3的DisplayList 中的容器类
 */


KISSY.add("canvax/display/DisplayObjectContainer" , function(S ,Base, DisplayObject){

    DisplayObjectContainer = function(opt){
       var self = this;
       self.children = [];
       self.mouseChildren = [];
       arguments.callee.superclass.constructor.apply(this, arguments);

       //所有的容器默认支持event 检测，因为 可能有里面的shape是eventEnable是true的
       //如果用户有强制的需求让容器下的所有元素都 不可检测，可以调用
       //DisplayObjectContainer的 setEventEnable() 方法
       self._eventEnabled = true;
    };

    

    Base.creatClass(DisplayObjectContainer , DisplayObject , {
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
            
            //上报children心跳
            if(this.heartBeat){
               this.heartBeat({
                 convertType : "children",
                 target       : child,
                 src      : this
               });
            }
            
            if(this.afterAddChild){
               this.afterAddChild(child,index);
            }

            return child;
        },
        removeChild : function(child) {
            return this.removeChildAt(_.indexOf( child , this.children ));
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
               this.afterDelChild(child , index);
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
        //集合类的自我销毁
        destroy : function(){
            if(this.parent){
                this.parent.removeChild(this);
                this.parent = null;
            }

            //依次销毁所有子元素
            //TODO：这个到底有没有必要。还有待商榷
            for(var i = 0, len = this.children.length; i < len; i++) {
                var child = this.children[i];
                child.destroy();
            }
            this = null;
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
            return _.indexOf( child , this.children );
        },
        setChildIndex : function(child, index){
            if(child.parent != this) return;
            var oldIndex = _.indexOf(child , this.children);
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

                if(child == null || !child._eventEnabled) {
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
     "canvax/core/Base",
     "canvax/display/DisplayObject"
   ]
})
