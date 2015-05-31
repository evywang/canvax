/**
 * Canvax
 *
 * @author 释剑 (李涛, litao.lt@alibaba-inc.com)
 *
 * canvas 上委托的事件管理
 */
define(
    "canvax/event/CanvaxEvent",
    [
         "canvax/core/Base"
    ],
    function(EventBase,Base){
        var CanvaxEvent = function() {
            this.mouseX = 0;
            this.mouseY = 0;
            //this.type = type;
            this.target = null;
            this.currentTarget = null;	
            this.params = null;

            this._stopPropagation = false ; //默认不阻止事件冒泡
        }
        CanvaxEvent.prototype = {
            stopPropagation : function() {
                this._stopPropagation = true;
            }
        }
        return CanvaxEvent;
    } 
);
