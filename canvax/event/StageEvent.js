
/**
 * Constructor.
 * @name StageEvent
 * @class A StageEvent object is dispatched whenever enter frame event or mouse events occur on Stage.
 * @augments EventBase
 * @property mouseX The x accordinate of mouse postion on Stage.
 * @property mouseY The y accordinate of mouse postion on Stage.
 */ 
KISSY.add("canvax/event/StageEvent" , function(S,EventBase,Base){
    var StageEvent = function(type, bubbles, cancelable) {
        EventBase.call(this, type, bubbles, cancelable);

        this.mouseX = 0;
        this.mouseY = 0;
    }

    Base.creatClass(StageEvent , EventBase , {
        toString : function() {
        return "[StageEvent type=" + this.type + ", mouseX=" + this.mouseX + ", mouseY=" + this.mouseY + "]";
    }

    });

    //Stage event types
    StageEvent.ENTER_FRAME = "enterframe";
    StageEvent.MOUSE_DOWN = "mousedown";
    StageEvent.MOUSE_UP = "mouseup";
    StageEvent.MOUSE_MOVE = "mousemove";
    StageEvent.MOUSE_OVER = "mouseover";
    StageEvent.MOUSE_OUT = "mouseout";


    return StageEvent;

} , {
    requires : [
        "canvax/event/EventBase",
        "canvax/core/Base"
        ]
})


