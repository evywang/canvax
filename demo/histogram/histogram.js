KISSY.add("demo/histogram/histogram" , function( S , Base , Utils , Datasection ,Canvax,Stage, Line , Rect){
    /*
     *@node chart在dom里的目标容器节点。
    */
    var Histogram = function( node ){
		Histogram.superclass.constructor.apply(this,[]);
		this.init.apply(this , arguments);
    }


    Histogram.ATTRS={
        title : {
          value : "chart"
        },
        oneStrSize : {
            value :null
        },
        element: {//chart 在页面里面的容器节点，也就是要把这个chart放在哪个节点里
          value : null
        },
    
        paper : {
          value : null
        },
        width:{
          value : 0
        },
        height:{
          value : 0
        },
        padding:{ // svg的padding 
            value : {
                left:0,
                top:0,
                right:0,
                bottom:0
            }
        },
        data : { //原始数据源
          value : null
        },
        dataRange : {
          value : { //在上面的data池里面，当前可视尺寸内能现实的data范围，为以后的添加左右拖放放大缩小等扩展功能做准备
            start : 0,
            to    : 0
          }
        },
        fieldList: {
          value : { //从上面的data获取得到的第一条数据的field字段列表
            title:"",
            index:0
          }
        },
        barWidth:{
          value : 8
        },
        barWidthMin : {
          value : 8
        },
        barWidthMax : {
          value : 16
        },
        spaceWidth:{
          value : 4
        },
        spaceWidthMin:{
          value :4
        },
        xAxis:{
          value : {
            field : null,
            TextStyle:null,
            dataOrg:[],//从histogram.data获得的xAxis 的 源数据，下面的data的数据从这里计算而来
            data : [],
            layout : {
               left:0,
               top:0,
               width:0,
               height:0,
               padding:{
                 left:0,
                 top:10,
                 right:0,
                 bottom:0
                 
               }
            }
          }
        },
        yAxis:{
          value : {
            dataMode : 0, //1为换算成百分比
            fields : [],
            TextStyle:null,
            dataOrg : [],//从histogram.data 得到的yAxisd的源数据
            data : [],
            layout: {//位置
               left:0,
               top:0,
               width:0,
               height:0,
               padding:{
                 left:0,
                 top:6,
                 right:10,
                 bottom:0
                 
               }

            }
          }
        },
        graphs:{
          value : {
            barColor : ["#458AE6" , "#39BCC0" , "#5BCB8A"],
            lineColor : "#D6D6D6",
            layout:{
              left:0,
              top:0,
              width:0,
              height:0,
              padding:{
                 left:0,
                 top:10,
                 right:0,
                 bottom:0
              }
            }
          }
        }
    };




    S.extend(Histogram , Base , {

        /*
         *私有属性，内部计算得到，无需用户配置，
         *所以没有放到ATTRS里面
        */

        _yBlock : 0 , //y轴方向，分段取整后的值
        _yOverDiff : 0,//y轴方向把分段取整后多余的像素


        init : function( node ){
          var self = this;

          self.set("element" , node);
          self.set("width" , parseInt(node.width()));
          self.set("height" , parseInt(node.height()));
          

           
           var canvax = new Canvax({
              id : "canvax",
              el : self.get("element")
           })

           var stage = new Stage({
               id : "chart",
               context:{
                 width : self.get("width"),
                 height: self.get("height")
               }
           });

          //self.set("svgElement" , document.createElement("div"));
          self.set("paper" , canvax);
          self.set("stage" , stage);

          //先把整个画布偏移0.5个像素，已遍解决画图的0.5像素模糊问题
          //self.get("paper").setViewBox(0.5 ,0.5 , self.get("width") , self.get("height") );

          //先探测出来单个英文字符和单个的中文字符所占的高宽
          self.set("oneStrSize" , Utils.probOneStrSize());

          


        },
        draw : function(data , options){
          var self = this;
          //开始绘图

          

          //用data, options的用户参数，重新配置 chart的属性
          var obj = {
              data : data
          };
          obj.fieldList = {};
          for ( var i=0,l=data[0].length; i<l ; i++ ){
              obj.fieldList[ data[0][i] ] = {
                 index : self._getIndexForField( data[0][i] , data[0] )
              };
          }

          for ( var p in options ){
              var opt=self.get(p);
              if (p == "data" || opt === undefined){
                 //options如果有data属性 或者 该配置 默认设计中没有，丢弃
                 continue;
              } else {
                 S.mix( opt , options[p] , undefined , undefined , true );
                 obj[p]=opt;
              }
          }

		  Histogram.superclass.constructor.apply(self,[obj]);
          //参数配置完毕
          
         
          
          
          //从chart属性的data 里面获取yAxis xAxis的源data
          self._initData();

          //得到了data后从Axis的data 计算 yAxis xAxis的layout相关
          self._initLayout();

          //计算barWidth spaceWidth
          self._calculateDataRange();

          //所有数据准备好后，终于开始绘图啦
          self._startDraw();



          self._drawEnd();
        },

        
      
        _drawEnd : function(){
          //绘制完毕后，要把svgElement append to element
          var self = this;
          self.get("paper").addChild( self.get("stage") );
        },
    
        _initData:function(){
          //获取Axis 的data
          var self = this;
          self._getxAxisData();
          self._getyAxisData();

        },
        _initLayout:function(){
          var self = this;
          self._yAxisLayout();
          self._xAxisLayout();
          self._graphsLayout();

        },
        _startDraw : function(){
          var self = this;
          self._graphsDraw();
          self._yAxisDraw();
        },



        
        _getxAxisData : function(){
          //获取xAxis的数据
          var self  = this;
          var data = self.get("data");
          var xAxis = self.get("xAxis");
          var fieldList = self.get("fieldList");
          if (!xAxis.field){
            //如果用户没有配置field字段，那么就默认索引1为xAxis的数据类型字段
            xAxis.field = data[0][0]; 
          };

          xAxis.dataOrg.length = 0;
          for(var d=1,dl=data.length ; d<dl ; d++){
             xAxis.dataOrg.push( data[d][ fieldList[xAxis.field].index] );
          }

        },
        _getyAxisData : function(){
          //获取yAxis的数据
          var self  = this;
          var data = self.get("data");
          var xAxis = self.get("xAxis");
          var yAxis = self.get("yAxis");
          var fieldList = self.get("fieldList");

          if (yAxis.fields.length == 0){
             //如果用户没有配置fields，那么就默认除开yAxis以外的所有字段都要显示
             for (var i = 0 , l = data[0].length ; i<l ; i++){
                 if ( data[0][i] !== xAxis.field ){
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
                   arr.push( item[ fieldList[field].index ] );
               });
               yAxis.dataOrg.push(arr); 
          });

          if (yAxis.dataMode==1){
              //需要转换为百分比
              S.each( yAxis.dataOrg , function(data ,i){
                 yAxis.dataOrg[i] = Utils.getArrScales(data);
              } )

          }
          
        },
        _yAxisLayout : function(){
          var self = this;
          var yAxis = self.get("yAxis");
          var xAxis = self.get("xAxis");

          //用yAxis.dataOrg的原始数据得到计算出实际在yAxis 上 要显示的数据
          yAxis.data = Datasection.section( Utils.getChildsArr(yAxis.dataOrg) );

          //计算data里面字符串最宽的值
          var max=0;
          S.each(yAxis.data , function(data , i){
            max = Math.max( max , data.toString().length );
          });

          yAxis.layout.width = max*self.get("oneStrSize").en.width ;
          yAxis.layout.left = self.get("padding").left;
          yAxis.layout.top = self.get("padding").top;

          xAxis.layout.height = Math.round( self.get("oneStrSize").en.height*1.5 );

          yAxis.layout.height = self.get("height")-yAxis.layout.padding.top-yAxis.layout.padding.bottom - xAxis.layout.height-xAxis.layout.padding.top-xAxis.layout.padding.bottom;

          self.set("yAxis" , yAxis);
          self.set("xAxis" , xAxis);

        },

        _xAxisLayout : function(){
          var self = this;
          var xAxis = self.get("xAxis");
          var yAxis = self.get("yAxis");
          xAxis.layout.left = yAxis.layout.left+yAxis.layout.width+yAxis.layout.padding.left+yAxis.layout.padding.right;
          xAxis.layout.top = yAxis.layout.height+yAxis.layout.top+yAxis.layout.padding.top+yAxis.layout.padding.bottom;
          xAxis.layout.width = self.get("width")-xAxis.layout.left-xAxis.layout.padding.left-xAxis.layout.padding.right-self.get("padding").right;

          //知道xAxis 的 layout的，可以计算出来xAxis实习要显示的数据了
          self.set("yAxis" , yAxis);
          self.set("xAxis" , xAxis);

        },
        _graphsLayout : function(){
          var self = this;
          var graphs = self.get("graphs");
          var yAxis = self.get("yAxis");
          var xAxis = self.get("xAxis");

          graphs.layout.left = yAxis.layout.left+yAxis.layout.width+yAxis.layout.padding.left+yAxis.layout.padding.right;
          graphs.layout.top = self.get("padding").top;
          graphs.layout.width = xAxis.layout.width;
          graphs.layout.height = xAxis.layout.top-self.get("padding").top-graphs.layout.padding.top-graphs.layout.padding.bottom;

        },
        _getIndexForField:function( field , arr ){
          for( var i=0,l=arr.length ; i<l;i++){
             if ( field === arr[i] ){
                return i;
             }
          }
        },
               	
        _calculateDataRange : function(){
          //计算当前可视范围内能显示的data的范围，和spaceWidth barWidth
          //该方法必须在得到了xAxis.layout.width的前提下
          var self = this;
          var data = self.get("data");
          var dataRange = self.get("dataRange");
          var spaceWidth = self.get("spaceWidth");
          var spaceWidthMin = self.get("spaceWidthMin");
          var barWidth = self.get("barWidth");
          var barWidthMin = self.get("barWidthMin");
          var barWidthMax = self.get("barWidthMax");
          var yAxis = self.get("yAxis");
          var xAxis = self.get("xAxis");

          var dl = data.length-1;//因为第一行是field，所以要 -1

          var groupBarWidthMin = barWidthMin*yAxis.fields.length + spaceWidthMin*(yAxis.fields.length-1);
          var groupBarWidthMax = barWidthMax*yAxis.fields.length + spaceWidthMin*(yAxis.fields.length-1);

          //数据需要截断的情况
          dataRange.start = 1;
          if ( (groupBarWidthMin+spaceWidthMin)*dl > xAxis.layout.width ){
             dataRange.to = parseInt( xAxis.layout.width / (groupBarWidthMin+spaceWidthMin));
          } else {
             dataRange.to = dl
          }

          //@gwidth 单个分组的bar+space的宽度 ，，，，，  重新计算barWidth spaceWidth
          var gwidth = (xAxis.layout.width-self.get("oneStrSize").en.width) / (dataRange.to-dataRange.start+1);

          //如果使用barWidthMax，会导致spaceWidth <= spaceWidthMin,的话呢 ，我觉得还是应该用barWidthMin
          if ( (gwidth - groupBarWidthMax ) > spaceWidthMin ){
             barWidth = barWidthMax;
          } else {
             barWidth = barWidthMin;
          }

          //得到了barWidth后，spaceWidth就容易多了
          spaceWidth = gwidth - ( barWidth*yAxis.fields.length+spaceWidthMin*(yAxis.fields.length-1) );
          
          self.set("spaceWidth" , spaceWidth);
          self.set("barWidth" , barWidth);
          self.set("dataRange" , dataRange);
         



        },
        _graphsDraw : function(){
          //开始真正绘图
          
          //先画背景框
          var self = this;
          var paper = self.get("paper");
          var data = self.get("data");
          var fieldList = self.get("fieldList");
          var yAxis = self.get("yAxis");
          var xAxis = self.get("xAxis");
          var barWidth = self.get("barWidth");
          var spaceWidth = self.get("spaceWidth");
          var spaceWidthMin = self.get("spaceWidthMin");
          var graphs = self.get("graphs");
          


          //画左边线
          //var lineVStr = "M"+graphs.layout.left+" "+(graphs.layout.top)+"v"+(graphs.layout.height+graphs.layout.padding.top)+"Z";
          //paper.path( lineVStr ).attr({stroke:graphs.lineColor});
          self.get("stage").addChild(new Line({
              id : "line-left",
              context : {
                  xStart      : graphs.layout.left,
                  yStart      : graphs.layout.top,
                  xEnd        : graphs.layout.left,
                  yEnd        : graphs.layout.height+graphs.layout.padding.top,
                  lineWidth   : 1,
                  strokeStyle : graphs.lineColor

              }
          }));


          //画下边线
          //var lineHStr = "M"+xAxis.layout.left +" "+xAxis.layout.top+"h"+xAxis.layout.width+"Z";
          //paper.path( lineHStr ).attr({stroke:graphs.lineColor});

          self.get("stage").addChild(new Line({
              id : "line-bottom",
              context : {
                  xStart      : xAxis.layout.left,
                  yStart      : xAxis.layout.top,
                  xEnd        : xAxis.layout.width+xAxis.layout.left,
                  yEnd        : xAxis.layout.top,
                  lineWidth   : 1,
                  strokeStyle : graphs.lineColor

              }
          }));


          //画背景虚线
          self._yBlock = parseInt(graphs.layout.height / (yAxis.data.length-1));

          //v方向均分后还多余的部分px
          self._yOverDiff = graphs.layout.height-self._yBlock*(yAxis.data.length-1);
              
          for ( var i=0,l=yAxis.data.length-1 ; i<l ; i++ ){
             var linex = graphs.layout.left;
             var liney = Math.round( i*self._yBlock )+graphs.layout.top+graphs.layout.padding.top+self._yOverDiff; 
             //var lineBG = "M"+linex+" "+liney+"h"+graphs.layout.width;
             //paper.path(lineBG).attr({stroke:graphs.lineColor , "stroke-dasharray":"- "});
             self.get("stage").addChild(new Line({
                 id : "line-bottom",
                 context : {
                     xStart      : linex,
                     yStart      : liney,
                     xEnd        : linex+graphs.layout.width,
                     yEnd        : liney,
                     lineType    : "dashed",
                     lineWidth   : 1,
                     strokeStyle : graphs.lineColor
                 }
             }));

          };

          var dataRange=self.get("dataRange");
          var maxY = 0;//yAxis方向最大值
          var minY = 0;//yAxis方向最小

          S.each( yAxis.data , function(item ,i){
            maxY = Math.max(maxY,item);
            minY = Math.min(minY,item);
          } );

          //一条数据分组占据的width
          var groupWidth = barWidth*yAxis.fields.length + spaceWidthMin*(yAxis.fields.length-1);

          //遍历，把所有的数据用cloumn画出来
          for (var d=dataRange.start;d<=dataRange.to ; d++){
              S.each( yAxis.fields , function(field , fi){
                  var groupI = d - dataRange.start; 
                  var x = Math.round(groupI*(spaceWidth+groupWidth)+(spaceWidthMin+barWidth)*fi+ spaceWidth) + graphs.layout.left ;
                  //整个cloumns要往左移动半个SpaceWidth
                  x -= parseInt(spaceWidth/2);
                  
                  

                  var y = graphs.layout.top+graphs.layout.padding.top+graphs.layout.height;
                  var itemHeight = (graphs.layout.height-self._yOverDiff) * ( data[d][ fieldList[field].index ] / (maxY-minY) );
                  itemHeight = Math.round(itemHeight);
                  
                  //var cloumn = paper.rect( x+0.5 , y-itemHeight-0.5 , barWidth , itemHeight+0.5  );
                  var rect = new Rect({
                      context : {
                        x     : x,
                        y     : y-itemHeight,
                        width : barWidth,
                        height: itemHeight,
                        fillStyle:graphs.barColor[fi]
                      }
                  });
                  rect.hover(function(){
                     this.context.strokeStyle = "red";
                     this.context.lineWidth = 1;
                  },function(){
                     this.context.lineWidth = 0;
                     this.context.strokeStyle = null;

                  })
                  self.get("stage").addChild(rect);

                 // cloumn.attr({fill:graphs.barColor[fi],'stroke-width':"0"})

              } )
          }
            

        },
        _yAxisDraw : function(){
          var self = this;
          var yAxis = self.get("yAxis");
          var paper = self.get("paper");
          var graphs = self.get("graphs");
          S.each(yAxis.data , function( item , i ){
             var x = yAxis.layout.left+yAxis.layout.width;
             var y = yAxis.layout.height+yAxis.layout.top+yAxis.layout.padding.top - i*self._yBlock;
              
             setTimeout(function(){
               //paper.text( x , y , Utils.numAddSymbol(item) ).attr({'text-anchor':'end','font-size':'12'});
             });

             //paper.rect( graphs.layout.left-7-0.5 , y-2+0.5 , 7,3).attr({"stroke-width":"0",fill:graphs.lineColor});
          })
        }
    }); 






    return Histogram;


} , {
    requires: [
        'base' ,
        'demo/histogram/utils' ,
        'demo/histogram/datasection',
        'canvax/Canvax',
        'canvax/display/Stage',
        'canvax/shape/Line',
        'canvax/shape/Rect'
    ]
})
