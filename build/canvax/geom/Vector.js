/**
 * Canvax
 *
 * @author 释剑 (李涛, litao.lt@alibaba-inc.com)
 *
 * 向量操作类
 * */
KISSY.add('canvax/geom/Vector', function () {
    function Vector(x, y) {
        if (this instanceof Vector === false) {
            return new Vector(x, y);
        }
        var vx = 0;
        var vy = 0;
        if (arguments.length == 1 && _.isObject(x)) {
            var arg = arguments[0];
            if (_.isArray(arg)) {
                vx = arg[0];
                vy = arg[1];
            } else if (arg.hasOwnProperty('x') && arg.hasOwnProperty('y')) {
                vx = arg.x;
                vy = arg.y;
            }
        }
        this._axes = [
            vx,
            vy
        ];
    }
    var precision = [
            1,
            10,
            100,
            1000,
            10000,
            100000,
            1000000,
            10000000,
            100000000,
            1000000000,
            10000000000
        ];
    Vector.prototype = {
        ctor: Vector,
        setAxes: function (x, y) {
            this._axes[0] = x;
            this._axes[1] = y;
            return this;
        },
        getX: function () {
            return this._axes[0];
        },
        setX: function (x) {
            this._axes[0] = x;
            return this;
        },
        getY: function () {
            return this._axes[1];
        },
        setY: function (y) {
            this._axes[1] = y;
            return this;
        },
        toArray: function () {
            return new Array(this._axes[0], this._axes[1]);
        },
        add: function (vec) {
            this._axes[0] += vec._axes[0];
            this._axes[1] += vec._axes[1];
            return this;
        },
        subtract: function (vec) {
            this._axes[0] -= vec._axes[0];
            this._axes[1] -= vec._axes[1];
            return this;
        },
        equals: function (vec) {
            return vec._axes[0] == this._axes[0] && vec._axes[1] == this._axes[1];
        },
        multiplyByVector: function (vec) {
            this._axes[0] *= vec._axes[0];
            this._axes[1] *= vec._axes[1];
            return this;
        },
        mulV: function (v) {
            return this.multiplyByVector(v);
        },
        divideByVector: function (vec) {
            this._axes[0] /= vec._axes[0];
            this._axes[1] /= vec._axes[1];
            return this;
        },
        divV: function (v) {
            return this.divideByVector(v);
        },
        multiplyByScalar: function (n) {
            this._axes[0] *= n;
            this._axes[1] *= n;
            return this;
        },
        mulS: function (n) {
            return this.multiplyByScalar(n);
        },
        divideByScalar: function (n) {
            this._axes[0] /= n;
            this._axes[1] /= n;
            return this;
        },
        divS: function (n) {
            return this.divideByScalar(n);
        },
        normalise: function () {
            return this.multiplyByScalar(1 / this.magnitude());
        },
        normalize: function () {
            return this.normalise();
        },
        unit: function () {
            return this.normalise();
        },
        magnitude: function () {
            return Math.sqrt(this._axes[0] * this._axes[0] + this._axes[1] * this._axes[1]);
        },
        length: function () {
            return this.magnitude();
        },
        lengthSq: function () {
            return this._axes[0] * this._axes[0] + this._axes[1] * this._axes[1];
        },
        dot: function (vec) {
            return vec._axes[0] * this._axes[0] + vec._axes[1] * this._axes[1];
        },
        cross: function (vec) {
            return this._axes[0] * vec._axes[1] - this._axes[1] * vec._axes[0];
        },
        reverse: function () {
            this._axes[0] = -this._axes[0];
            this._axes[1] = -this._axes[1];
            return this;
        },
        abs: function () {
            this._axes[0] = Math.abs(this._axes[0]);
            this._axes[1] = Math.abs(this._axes[1]);
            return this;
        },
        zero: function () {
            this._axes[0] = this._axes[1] = 0;
            return this;
        },
        distance: function (v) {
            var x = this._axes[0] - v._axes[0];
            var y = this._axes[1] - v._axes[1];
            return Math.sqrt(x * x + y * y);
        },
        rotate: function (rads) {
            var cos = Math.cos(rads), sin = Math.sin(rads);
            var ox = this._axes[0], oy = this._axes[1];
            this._axes[0] = ox * cos - oy * sin;
            this._axes[1] = ox * sin + oy * cos;
            return this;
        },
        round: function (n) {
            // Default is two decimals
            n = n || 2;    // This performs waaay better than toFixed and give Float32 the edge again.
                           // http://www.dynamicguru.com/javascript/round-numbers-with-precision/
            // This performs waaay better than toFixed and give Float32 the edge again.
            // http://www.dynamicguru.com/javascript/round-numbers-with-precision/
            this._axes[0] = (0.5 + this._axes[0] * precision[n] << 0) / precision[n];
            this._axes[1] = (0.5 + this._axes[1] * precision[n] << 0) / precision[n];
            return this;
        },
        clone: function () {
            return new this.ctor(this._axes[0], this._axes[1]);
        }
    };
    return Vector;
});