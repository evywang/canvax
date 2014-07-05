/**
 * Canvax--Text
 *
 * @author 释剑 (李涛, litao.lt@alibaba-inc.com)
 *
 * 文本 类
 **/
KISSY.add('canvax/display/Text', function (S, DisplayObject, Base) {
    var Text = function (text, opt) {
        var self = this;
        self.type = 'text';
        self._reNewline = /\r?\n/;
        self.fontProperts = [
            'fontStyle',
            'fontVariant',
            'fontWeight',
            'fontSize',
            'fontFamily'
        ];    //做一次简单的opt参数校验，保证在用户不传opt的时候 或者传了opt但是里面没有context的时候报错
        //做一次简单的opt参数校验，保证在用户不传opt的时候 或者传了opt但是里面没有context的时候报错
        opt = Base.checkOpt(opt);
        self._context = {
            fontSize: opt.context.fontSize || 13,
            //字体大小默认13
            fontWeight: opt.context.fontWeight || 'normal',
            fontFamily: opt.context.fontFamily || '\u5FAE\u8F6F\u96C5\u9ED1',
            textDecoration: opt.context.textDecoration,
            fillStyle: opt.context.fontColor || opt.context.fillStyle || 'blank',
            lineHeight: opt.context.lineHeight || 1.3,
            //下面两个在displayObject中有
            //textAlign    : opt.context.textAlign      || 'left',
            //textBaseline : opt.context.textBaseline   || 'top',
            backgroundColor: opt.context.backgroundColor,
            textBackgroundColor: opt.context.textBackgroundColor
        };
        self._context.font = self._getFontDeclaration();
        self.text = text.toString();
        arguments.callee.superclass.constructor.apply(this, [opt]);
    };
    Base.creatClass(Text, DisplayObject, {
        $watch: function (name, value, preValue) {
            //context属性有变化的监听函数
            if (name in this.fontProperts) {
                //如果修改的是font的某个内容，就重新组装一遍font的值，
                //然后通知引擎这次对context的修改不需要上报心跳
                this._notWatch = false;
                this.context.font = this._getFontDeclaration();
            }
        },
        init: function (text, opt) {
            var self = this;
        },
        render: function (ctx) {
            var textLines = this._getTextLines();
            this.context.width = this._getTextWidth(ctx, textLines);
            this.context.height = this._getTextHeight(ctx, textLines);
            for (p in this.context.$model) {
                if (p in ctx) {
                    if (p != 'textBaseline' && this.context.$model[p]) {
                        ctx[p] = this.context.$model[p];
                    }
                }
            }
            this.clipTo && this.clipContext(this, ctx);
            this._renderTextBackground(ctx, textLines);
            this._renderText(ctx, textLines);
            this.clipTo && ctx.restore();
        },
        resetText: function (text) {
            this.text = text.toString();
            this.heartBeat();
        },
        getTextWidth: function () {
            var width = 0;
            Base._pixelCtx.save();
            Base._pixelCtx.font = this.context.font;
            width = this._getTextWidth(Base._pixelCtx, this._getTextLines());
            Base._pixelCtx.restore();
            return width;
        },
        getTextHeight: function () {
            return this._getTextHeight(Base._pixelCtx, this._getTextLines());
        },
        _getTextLines: function () {
            return this.text.split(this._reNewline);
        },
        _renderText: function (ctx, textLines) {
            ctx.save();
            this._setShadow(ctx);
            this._renderTextFill(ctx, textLines);
            this._renderTextStroke(ctx, textLines);
            this._removeShadow(ctx);
            ctx.restore();
        },
        _getFontDeclaration: function () {
            var self = this;
            var fontArr = [];
            _.each(this.fontProperts, function (p) {
                var fontP = self._context[p];
                if (p == 'fontSize') {
                    fontP = parseFloat(fontP) + 'px';
                }
                fontP && fontArr.push(fontP);
            });
            return fontArr.join(' ');
        },
        /**
             * @private
             * @param {CanvasRenderingContext2D} ctx Context to render on
             * @param {Array} textLines Array of all text lines
             */
        _renderTextFill: function (ctx, textLines) {
            if (!this.context.fillStyle)
                return;
            this._boundaries = [];
            var lineHeights = 0;
            for (var i = 0, len = textLines.length; i < len; i++) {
                var heightOfLine = this._getHeightOfLine(ctx, i, textLines);
                lineHeights += heightOfLine;
                this._renderTextLine('fillText', ctx, textLines[i], 0, //this._getLeftOffset(),
                this._getTopOffset() + lineHeights, i);
            }
        },
        /**
             * @private
             * @param {CanvasRenderingContext2D} ctx Context to render on
             * @param {Array} textLines Array of all text lines
             */
        _renderTextStroke: function (ctx, textLines) {
            if (!this.context.strokeStyle && !this._skipFillStrokeCheck)
                return;
            var lineHeights = 0;
            ctx.save();
            if (this.strokeDashArray) {
                // Spec requires the concatenation of two copies the dash list when the number of elements is odd
                if (1 & this.strokeDashArray.length) {
                    this.strokeDashArray.push.apply(this.strokeDashArray, this.strokeDashArray);
                }
                supportsLineDash && ctx.setLineDash(this.strokeDashArray);
            }
            ctx.beginPath();
            for (var i = 0, len = textLines.length; i < len; i++) {
                var heightOfLine = this._getHeightOfLine(ctx, i, textLines);
                lineHeights += heightOfLine;
                this._renderTextLine('strokeText', ctx, textLines[i], 0, //this._getLeftOffset(),
                this._getTopOffset() + lineHeights, i);
            }
            ctx.closePath();
            ctx.restore();
        },
        _renderTextLine: function (method, ctx, line, left, top, lineIndex) {
            // lift the line by quarter of fontSize
            top -= this.context.fontSize / 4;    // short-circuit
            // short-circuit
            if (this.context.textAlign !== 'justify') {
                this._renderChars(method, ctx, line, left, top, lineIndex);
                return;
            }
            var lineWidth = ctx.measureText(line).width;
            var totalWidth = this.context.width;
            if (totalWidth > lineWidth) {
                // stretch the line
                var words = line.split(/\s+/);
                var wordsWidth = ctx.measureText(line.replace(/\s+/g, '')).width;
                var widthDiff = totalWidth - wordsWidth;
                var numSpaces = words.length - 1;
                var spaceWidth = widthDiff / numSpaces;
                var leftOffset = 0;
                for (var i = 0, len = words.length; i < len; i++) {
                    this._renderChars(method, ctx, words[i], left + leftOffset, top, lineIndex);
                    leftOffset += ctx.measureText(words[i]).width + spaceWidth;
                }
            } else {
                this._renderChars(method, ctx, line, left, top, lineIndex);
            }
        },
        _renderChars: function (method, ctx, chars, left, top) {
            ctx[method](chars, 0, top);
        },
        _setShadow: function (ctx) {
            if (!this.shadow)
                return;
            ctx.shadowColor = 'red';
            ctx.shadowBlur = 1;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
        },
        _removeShadow: function (ctx) {
            ctx.shadowColor = '';
            ctx.shadowBlur = ctx.shadowOffsetX = ctx.shadowOffsetY = 0;
        },
        _getHeightOfLine: function () {
            return this.context.fontSize * this.context.lineHeight;
        },
        _getTextWidth: function (ctx, textLines) {
            var maxWidth = ctx.measureText(textLines[0] || '|').width;
            for (var i = 1, len = textLines.length; i < len; i++) {
                var currentLineWidth = ctx.measureText(textLines[i]).width;
                if (currentLineWidth > maxWidth) {
                    maxWidth = currentLineWidth;
                }
            }
            return maxWidth;
        },
        _getTextHeight: function (ctx, textLines) {
            return this.context.fontSize * textLines.length * this.context.lineHeight;
        },
        clipContext: function (receiver, ctx) {
            ctx.save();
            ctx.beginPath();
            receiver.clipTo(ctx);
            ctx.clip();
        },
        _renderTextBackground: function (ctx, textLines) {
            this._renderTextBoxBackground(ctx);
            this._renderTextLinesBackground(ctx, textLines);
        },
        _renderTextBoxBackground: function (ctx) {
            if (!this.context.backgroundColor)
                return;
            ctx.save();
            ctx.fillStyle = this.context.backgroundColor;
            ctx.fillRect(this._getLeftOffset(), this._getTopOffset(), this.context.width, this.context.height);
            ctx.restore();
        },
        _renderTextLinesBackground: function (ctx, textLines) {
            if (!this.context.textBackgroundColor)
                return;
            ctx.save();
            ctx.fillStyle = this.context.textBackgroundColor;
            for (var i = 0, len = textLines.length; i < len; i++) {
                if (textLines[i] !== '') {
                    var lineWidth = this._getLineWidth(ctx, textLines[i]);
                    var lineLeftOffset = this._getLineLeftOffset(lineWidth);
                    ctx.fillRect(this._getLeftOffset() + lineLeftOffset, this._getTopOffset() + i * this.context.fontSize * this.context.lineHeight, lineWidth, this.context.fontSize * this.context.lineHeight);
                }
            }
            ctx.restore();
        },
        _getLineWidth: function (ctx, line) {
            return this.context.textAlign === 'justify' ? this.context.width : ctx.measureText(line).width;
        },
        _getLineLeftOffset: function (lineWidth) {
            if (this.context.textAlign === 'center') {
                return (this.context.width - lineWidth) / 2;
            }
            if (this.context.textAlign === 'right') {
                return this.context.width - lineWidth;
            }
            return 0;
        },
        _getLeftOffset: function () {
            var l = 0;
            switch (this.context.textAlign) {
            case 'left':
                l = 0;
                break;
            case 'center':
                l = -this.context.width / 2;
                break;
            case 'right':
                l = -this.context.width;
                break;
            }
            return l;
        },
        /**
             * @private
             * @return {Number} Top offset
             */
        _getTopOffset: function () {
            var t = 0;
            switch (this.context.textBaseline) {
            case 'top':
                t = 0;
                break;
            case 'middle':
                t = -this.context.height / 2;
                break;
            case 'bottom':
                t = -this.context.height;
                break;
            }
            return t;
        }
    });
    return Text;
}, {
    requires: [
        'canvax/display/DisplayObject',
        'canvax/core/Base'
    ]
});