/**
 * Canvax
 *
 * @author 释剑 (李涛, litao.lt@alibaba-inc.com)
 *
 * 事件类基类
 */
KISSY.add('canvax/event/EventBase', function (S, core) {
    var EventBase = function (type, bubbles, cancelable) {
        this.type = type;
        this.target = null;
        this.currentTarget = null;
        this.params = null;
        this.bubbles = bubbles != undefined ? bubbles : false;    //TODO Not implemented yet.
        //TODO Not implemented yet.
        this.cancelable = cancelable != undefined ? cancelable : false;    //TODO Not implemented yet.
        //TODO Not implemented yet.
        this._stopPropagation = false;    //默认不阻止事件冒泡
    }    /**
     * @private Not implemented yet.
     */;
    //默认不阻止事件冒泡
    /**
     * @private Not implemented yet.
     */
    EventBase.prototype.stopPropagation = function () {
        //TODO
        this._stopPropagation = true;
    }    /**
     * @private Not implemented yet.
     */;
    /**
     * @private Not implemented yet.
     */
    EventBase.prototype.preventDefault = function () {
    };
    //TODO
    /**
     * Duplicates an instance of the Event object.
     */
    EventBase.prototype.clone = function () {
        return Base.copy(this);
    }    /**
     * Deletes all properties of the Event object.
     */;
    /**
     * Deletes all properties of the Event object.
     */
    EventBase.prototype.dispose = function () {
        delete this.type;
        delete this.target;
        delete this.currentTarget;
        delete this.params;
    }    /**
     * Returns a string of the Event object.
     */;
    /**
     * Returns a string of the Event object.
     */
    EventBase.prototype.toString = function () {
        return '[EventBase type=' + this.type + ']';
    };
    return EventBase;
}, { requires: ['canvax/core/Base'] });