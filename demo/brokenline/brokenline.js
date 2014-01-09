KISSY.add("demo/brokenline/brokenline" , function( S , Base , Utils , Datasection ,Canvax){
    /*
     *@node chart在dom里的目标容器节点。
    */
    var Brokenline = function( node ){
        this.title         =  "brokenline";
        this.type          =  null;
        this.oneStrSize    =  null;
        this.element       =  null;//chart 在页面里面的容器节点，也就是要把这个chart放在哪个节点里
        this.canvax         =  null;
        this.width         =  0;
        this.height        =  0;
        this.data          =  null;
        this.dataRange     =  { //在上面的data池里面，当前可视尺寸内能现实的data范围，为以后的添加左右拖放放大缩小等扩展功能做准备
             start     :  0,
             to        :  0
        };
        this.fieldList     =  { //从上面的data获取得到的第一条数据的field字段列表
            title      :   "",
            index      :   0
        };
        this.barWidth      =  1;
        this.spaceWidth    =  5; //默认为5，实际上会在_calculateDataRange中计算出来
        this.spaceWidthMin =  1;
        this.xAxis         =  {
            field      : null,
            TextStyle  : null,
            dataOrg    : [],//从brokenline.data获得的xAxis 的 源数据，下面的data的数据从这里计算而来
            data       : [],
            xPointList : [],
            sprite     : null
        };
        this.yAxis     = {
            dataMode   : 0, //1为换算成百分比
            fields     : [],
            TextStyle  : null,
            dataOrg    : [],//从brokenline.data 得到的yAxisd的源数据
            data       : [],
            sprite     : null
        };
        this.graphs =  {
            barColor   : ["#458AE6" , "#39BCC0" , "#5BCB8A"],
            lineColor  : "#D6D6D6",
            sprite     : null
        };

        this.customPL  = function(arr){
            return arr;
        }

		this.init.apply(this , arguments);
    };

    Brokenline.prototype = {

        _yBlock : 0 , //y轴方向，分段取整后的值
        _yOverDiff : 0,//y轴方向把分段取整后多余的像素

        init : function( node ){
          var self = this;

          self.element = node;
          self.width   = parseInt(node.width());
          self.height  = parseInt(node.height());
          
          self.canvax = new Canvax({
              el : self.element
          })

          self.stage = new Canvax.Display.Stage({
              context : {
                width : self.width,
                height: self.height
              }
          });

          //先探测出来单个英文字符和单个的中文字符所占的高宽
          self.oneStrSize = Utils.probOneStrSize();
        },
        draw : function(data , options){
          var self = this;
          //开始绘图

          //初始化数据和配置
          self._config(data , options);
          
          //从chart属性的data 里面获取yAxis xAxis的源data
          self._initData();

          //得到了data后从Axis的data 计算 yAxis xAxis的layout相关
          self._initLayout();

          //计算barWidth spaceWidth
          self._calculateDataRange();

          //所有数据准备好后，终于开始绘图啦
          self._startDraw();

          //绘制结束，添加到舞台
          self._drawEnd();
        },
        _config  : function( data , options){
          var self  = this;
          self.data = data;

          for ( var i=0,l=data[0].length; i<l ; i++ ){
              self.fieldList[ data[0][i] ] = {
                 index : self._getIndexForField( data[0][i] , data[0] )
              };
          }

          if(options){
              S.mix(self , options , undefined , undefined , true);
          }
        },
        _getIndexForField:function( field , arr ){
          for( var i=0,l=arr.length ; i<l;i++){
             if ( field === arr[i] ){
                return i;
             }
          }
        },
        _initData:function(){
          //获取Axis 的data
          var self = this;
          self._getxAxisData();
          self._getyAxisData();
        },
        _initLayout:function(){
          var self = this;
          self.yMarginTop = Math.round(self.oneStrSize.en.height / 2); 
          self._yAxisLayout();
          self._xAxisLayout();
          self._graphsLayout();
        },
        _startDraw : function(){
          var self = this;
          self._graphsDraw();
          self._yAxisDraw();
          self._xAxisDraw();
        },
        _drawEnd : function(){
          var self = this;
          self.stage.addChild( self.xAxis.sprite );
          self.stage.addChild( self.yAxis.sprite );
          self.stage.addChild( self.graphs.sprite );
          self.canvax.addChild( self.stage );
        },
        _getxAxisData : function(){
          //获取xAxis的数据
          var self  = this;
          var data = self.data;
          var xAxis = self.xAxis;
          if (!xAxis.field){
            //如果用户没有配置field字段，那么就默认索引1为xAxis的数据类型字段
            xAxis.field = data[0][0];
          };

          xAxis.dataOrg.length = 0;
          for(var d=1,dl = data.length ; d<dl ; d++){
             xAxis.dataOrg.push( data[d][ self.fieldList[xAxis.field].index] );
          }

        },
        _getyAxisData : function(){
          //获取yAxis的数据
          var self      = this;
          var data      = self.data;
          var yAxis     = self.yAxis;

          if (yAxis.fields.length == 0){
             //如果用户没有配置fields，那么就默认除开yAxis以外的所有字段都要显示
             for (var i = 0 , l = data[0].length ; i<l ; i++){
                 if ( data[0][i] !== self.xAxis.field ){
                    yAxis.fields.push( data[0][i] );
                 }
             }
          }

          S.each(yAxis.fields , function(field , ind){
               var arr=[];
               S.each(data , function(item , i){
                   if(i==0){
                       return;
                   }
                   arr.push( item[ self.fieldList[field].index ] );
               });
               yAxis.dataOrg.push(arr); 
          });

          if (yAxis.dataMode==1){
              //需要转换为百分比
              S.each( yAxis.dataOrg , function(data ,i){
                 yAxis.dataOrg[i] = Utils.getArrScales(data);
              } );
          }
          
        },
        _yAxisLayout : function(){
          var self  = this;
          var yAxis = self.yAxis;

          //用yAxis.dataOrg的原始数据得到计算出实际在yAxis 上 要显示的数据
          yAxis.data = Datasection.section( Utils.getChildsArr(yAxis.dataOrg),5 );

          //计算data里面字符串最宽的值
          var max=0;
          S.each(yAxis.data , function(data , i){
            max = Math.max( max , data.toString().length );
          });

          yAxis.sprite = new Canvax.Display.Sprite({
             context : {
               x     : 0,
               y     : self.yMarginTop,
               width : (max + 1) * self.oneStrSize.en.width,
               //height = 总高减去 top 预留 部分 减去x的高，x的高固定为 英文字符的高*2
               height: self.height - self.yMarginTop - Math.round( self.oneStrSize.en.height*2 )
             }
          });

        },
        _xAxisLayout : function(){
          var self  = this;
          var yContext = self.yAxis.sprite.context;
          var xHeight  = Math.round( self.oneStrSize.en.height*2 );
          self.xAxis.sprite = new Canvax.Display.Sprite({
             context : {
               x     : yContext.width,
               y     : self.height - xHeight,
               width : self.width  - yContext.width,
               height: xHeight
             }
          });
        },
        _graphsLayout : function(){
          var self   = this;
          var yContext = self.yAxis.sprite.context;
          self.graphs.sprite = new Canvax.Display.Sprite({
             context : {
               x     : yContext.width,
               y     : yContext.y,
               width : self.width - yContext.width,
               height: yContext.height
             }
          });
        },
        _calculateDataRange : function(){
          //计算当前可视范围内能显示的data的范围，和spaceWidth barWidth
          var self     = this;
          var gSpriteC = self.graphs.sprite.context;
          var dl       = self.data.length-1;//因为第一行是field，所以要 -1

          //数据需要截断的情况
          self.dataRange.start = 1;
          if ( (self.barWidth + self.spaceWidthMin) * dl > gSpriteC.width ){
             self.dataRange.to = parseInt( gSpriteC.width / (self.barWidth + self.spaceWidthMin));
          } else {
             self.dataRange.to = dl;
          }

          //@gwidth 单个分组的bar+space的宽度 ，，，，，  重新计算barWidth spaceWidth
          var gwidth = (gSpriteC.width - self.barWidth) / (self.dataRange.to - self.dataRange.start);
          self.spaceWidth = gwidth - self.barWidth;

          //真正绘制之前 还要计算y轴的相关数据
          self._yBlock    = parseInt( gSpriteC.height / (self.yAxis.data.length - 1));
          //v方向均分后还多余的部分px
          self._yOverDiff =  gSpriteC.height - self._yBlock *( self.yAxis.data.length - 1 );

        },
        _graphsDraw : function(){
          //开始真正绘图
          //先画背景框
          var self          = this;
          var data          = self.data;
          var yAxis         = self.yAxis;
          var xAxis         = self.xAxis;
          var graphs        = self.graphs;
          var gSpriteC    = graphs.sprite.context;
          

          //画背景虚线
          for ( var i=0,l=yAxis.data.length-1 ; i<l ; i++ ){
             var linex = - self.oneStrSize.en.width + 2;
             var liney = Math.round( i * self._yBlock ) + self._yOverDiff; 
             graphs.sprite.addChild(new Canvax.Shapes.Line({
                 context : {
                     xStart      : linex,
                     yStart      : liney,
                     xEnd        : linex + gSpriteC.width + self.oneStrSize.en.width - 2,
                     yEnd        : liney,
                     lineType    : "dashed",
                     lineWidth   : 1,
                     strokeStyle : graphs.lineColor
                 }
             }));
          };

          //画左边线
          graphs.sprite.addChild(new Canvax.Shapes.Line({
              id : "line-left",
              context : {
                  xStart      : 0,
                  yStart      : -gSpriteC.y,
                  xEnd        : 0,
                  yEnd        : gSpriteC.height,
                  lineWidth   : 1,
                  strokeStyle : graphs.lineColor
              }
          }));

          //画下边线
          graphs.sprite.addChild(new Canvax.Shapes.Line({
              id : "line-bottom",
              context : {
                  xStart      : 0,
                  yStart      : gSpriteC.height,
                  xEnd        : self.width - gSpriteC.x,
                  yEnd        : gSpriteC.height,
                  lineWidth   : 1,
                  strokeStyle : graphs.lineColor
              }
          }));

          var dataRange = self.dataRange;
          var maxY      = 0;//yAxis方向最大值
          var minY      = 0;//yAxis方向最小

          S.each( yAxis.data , function(item ,i){
            maxY = Math.max(maxY,item);
            minY = Math.min(minY,item);
          } );

          //一条数据分组占据的width
          var groupWidth = self.barWidth + self.spaceWidth;

          S.each( yAxis.fields , function(field , fi){
              var pointList = [];

              for (var d = dataRange.start ; d<=dataRange.to ; d++){
                  var groupI = d - dataRange.start; 
                  var x = Math.round( groupI * ( groupWidth ) );

                  var itemHeight = gSpriteC.height - Math.round((gSpriteC.height - self._yOverDiff) * ( data[d][ self.fieldList[field].index ] / (maxY-minY) ));
                  pointList.push( [x , itemHeight] );
              };

              //这个时候的数据要给xAxis保留一份
              self._getxAxisPoints( pointList , groupWidth );

              //设置原点
              var gs_origin = (yAxis.data.length - 1 - S.indexOf( 0 , yAxis.data )) * self._yBlock -  graphs.sprite.context.height;
              graphs.sprite.addChild( new Canvax.Shapes.BrokenLine({
                  context : {
                      pointList   : self.customPL( pointList ),
                      strokeStyle : 'red',
                      lineWidth   : 1,
                      x           : 0,
                      y           : gs_origin
                  }
              }) );

          });
        },
        _yAxisDraw : function(){
          var self     = this;
          var yAxis    = self.yAxis;
          var ySpriteC = yAxis.sprite.context;
          S.each(yAxis.data , function( item , i ){
             var x = ySpriteC.width;
             var y = ySpriteC.height - i*self._yBlock;
             yAxis.sprite.addChild(new Canvax.Display.Text(
                item , {
                  context : {
                      x  : x - self.oneStrSize.en.width,
                      y  : y,
                      fillStyle:"blank",
                      textAlign:"right",
                      textBaseline:"middle"
                  }
                })
             );
          })
        },

        //x轴专属，计算x的xPointList
        _getxAxisPoints : function( pointList , groupWidth ){
          var self = this;
          var xAxis= self.xAxis;
          //如果有用户自定义的x轴数据
          if( xAxis.customPL ){
              var c_list=xAxis.customPL( pointList );
              var speed = parseInt( (pointList.length - 1) / (c_list.length-1) );
              if( c_list.constructor == Array && c_list.length > 0 ){
                  //外面传入的数据只有text
                  S.each(c_list , function(p , i){
                      var newP = {
                          x   : pointList[ i * speed ][0],//i*speed*groupWidth - i,
                          text: p
                      }
                      xAxis.xPointList.push( newP );
                  });
              }
          };

          //计算xAxis的xPointList
          if(xAxis.xPointList.length==0){
              S.each(pointList,function(p , i){
                  //TODO:这里目前只做简单的push，如果节点过多的话，还要多做一层处理
                  xAxis.xPointList.push({
                      x    : p[0] ,
                      text : xAxis.dataOrg[i]
                  });
              });
          };
        },
        _xAxisDraw : function(){
          var self     = this;
          var xAxis    = self.xAxis ;
          var xSpriteC = xAxis.sprite.context;
          var pCount = xAxis.xPointList.length;
          S.each(xAxis.xPointList , function( xp , i ){
              var x = xp.x ;
              //和折线一样，最后一个刻度做hack处理
              if(i == (pCount-1)) {
                  //x = xSpriteC.width
              }
              xAxis.sprite.addChild(new Canvax.Shapes.Line({
                  context : {
                      xStart      : x,
                      yStart      : 0,
                      xEnd        : x,
                      yEnd        : 5,
                      lineWidth   : 1,
                      strokeStyle : self.graphs.lineColor
                  }
              }));

              var textOpt = {
                  x   : x,
                  y   : 5,
                  fillStyle:"blank",
                  //textBackgroundColor:"red"
                  //textBaseline:"middle"
              }
              if(i>0){
                  textOpt.textAlign="center";
                  if(i == (pCount-1)){
                      textOpt.textAlign="right";
                  }
              } 
              xAxis.sprite.addChild(new Canvax.Display.Text(
                xp.text.toString()
                ,
                {
                  context : textOpt
                })
              );
          })
        }
    };
    return Brokenline;
} , {
    requires: [
        'base' ,
        'demo/brokenline/utils',
        'demo/brokenline/datasection',
        'canvax/'
    ]
});
