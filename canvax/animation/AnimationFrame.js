define(
    "canvax/animation/AnimationFrame", 
    [
        "canvax/animation/Tween"
    ],
    function(Tween) {
        /**
         * 设置 AnimationFrame begin
         */
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
        };
        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function(callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function() {
                        callback(currTime + timeToCall);
                    },
                    timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        };
        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
        };

        //管理所有图表的渲染任务
        var _taskList = [];
        var _requestAid = null;

        /*
        * @param task 要加入到渲染帧队列中的任务
        * @result frameid
        */
        function registFrame(task) {
            if (!_requestAid && task) {
                _requestAid = requestAnimationFrame(function() {
                    _requestAid = null;
                    for (var i = 0, l = _taskList.length; i < l; i++) {
                        var task = _taskList.shift();
                        task();
                        i--;
                        l--;
                    };
                });
            };
            _taskList.push(task);
            return _requestAid;
        };

        /*
        *  @param task 要从渲染帧队列中删除的任务
        */
        function destroyFrame(task) {
            for (var i = 0, l = _taskList.length; i < l; i++) {
                if (_taskList[i] === task) {
                    _taskList.splice(i, 1);
                }
            };
            if (_taskList.length == 0) {
                cancelAnimationFrame(_requestAid);
                _requestAid = null;
            };
            return _requestAid;
        };

        /* 
         * @param opt {from , to , onUpdate , onComplete}
         * @result tween
         */
        function registTween(options) {
            var opt = _.extend({
                from: null,
                to: null,
                duration : 500,
                onUpdate: function() {},
                onComplete: function() {},
                repeat : 0,
                delay : 0
            }, options);
            var tween = {};
            if (opt.from && opt.to) {
                tween = new Tween.Tween(opt.from).to(opt.to , opt.duration).onUpdate(opt.onUpdate);
                tween.onComplete(function() {
                    destroyFrame( animate );
                    tween.stop();
                    Tween.remove( tween );
                    tween = null;
                });
                tween.onComplete(opt.onComplete);
                !opt.repeat && tween.repeat( opt.repeat );
                !opt.delay && tween.delay( opt.delay );
                function animate(){
                    registFrame( animate );
                    Tween.update();
                };
                tween.start();
                animate();
                tween._animate = animate;
            };
            return tween;
        };

        /*
         * @param tween
         * @result void(0)
         */
        function destroyTween(tween) {
            tween.stop();
            Tween.remove( tween );
            destroyFrame( tween._animate );
            tween = null;
        };

        return {
            registFrame: registFrame,
            destroyFrame: destroyFrame,
            registTween: registTween,
            destroyTween: destroyTween
        };
    }
);