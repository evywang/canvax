/**
 * Canvax
 *
 * @author 释剑 (李涛, litao.lt@alibaba-inc.com)
 *
 * 事件类基类
 */


define(
    "canvax/event/EventBase",
    [
        "canvax/core/Base"
    ],
    function(core){
        var EventBase = function(type, bubbles, cancelable) {
            this.type = type;
            this.target = null;
            this.currentTarget = null;	
            this.params = null;
    
            this.bubbles = bubbles != undefined ? bubbles : false; //TODO Not implemented yet.
            this.cancelable = cancelable != undefined ? cancelable : false;	//TODO Not implemented yet.
    
            this._stopPropagation = false ; //默认不阻止事件冒泡
        }

        EventBase.prototype.stopPropagation = function() {
            this._stopPropagation = true;
        }
    
        EventBase.prototype.preventDefault = function() {
            //TODO
        }
    
        EventBase.prototype.clone = function() {
            return Base.copy(this);
        }
    
        EventBase.prototype.dispose = function() {
            delete this.type;
            delete this.target;
            delete this.currentTarget;
            delete this.params;
        }

        return EventBase;
    
    
    } 
);
