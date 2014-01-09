    
    //准备demo数据，数据格式借鉴google charts 的数据格式，数组的第一条为字段，后面的数据为以此对应的数据
    var data = [
             ["val1" , "val2" ] ,
			 [0.05   , 201    ] ,
			 [0.1    , 1145   ] ,
			 [0.15   , 488    ] ,
			 [0.2    , 390    ] ,
			 [0.25   , 186    ] ,
			 [0.3    , 645    ] ,
			 [0.35   , 259    ] ,
			 [0.4    , 378    ] ,
			 [0.45   , 189    ] ,
			 [0.5    , 589    ] ,
			 [0.55   , 175    ]  ,
			 [0.1    , 1145   ] ,
			 [0.15   , 488    ] ,
			 [0.2    , 390    ] ,
			 [0.25   , 186    ] ,
			 [0.3    , 645    ] ,
			 [0.35   , 259    ] ,
			 [0.4    , 378    ] ,
			 [0.45   , 189    ] ,
			 [0.5    , 589    ] ,
			 [0.55   , 175    ]  ,
			 [0.1    , 1145   ] ,
			 [0.15   , 488    ] ,
			 [0.2    , 390    ] ,
			 [0.25   , 186    ] ,
			 [0.3    , 645    ] ,
			 [0.35   , 259    ] ,
			 [0.4    , 378    ] ,
			 [0.45   , 189    ] ,
			 [0.5    , 589    ] ,
			 [0.55   , 175    ]  ,
			 [0.1    , 1145   ] ,
			 [0.15   , 488    ] ,
			 [0.2    , 390    ] ,
			 [0.25   , 186    ] ,
			 [0.3    , 645    ] ,
			 [0.35   , 259    ] ,
			 [0.4    , 378    ] ,
			 [0.45   , 189    ] ,
			 [0.5    , 589    ] ,
			 [0.55   , 175    ] 
	     ]
 

    var data1= [
        ["val1","val2","val3","val4"],
        [ 1 , 201  , 101 , 500 ] ,
        [ 2  , 0 , 145 , 100 ] ,
        [ 3 , -488  , 88  , 700 ] ,
        [ 4  , 390  , 546 , 300 ] ,
        [ 5 , 0  , 88  , 700 ] ,
        [ 6  , 390  , 546 , 300 ] ,
        [ 7 , 201  , 101 , 500 ] ,
        [8  , 1145 , 145 , 100 ] ,
        [ 9 , 488  , 88  , 700 ] ,
        [ 10  , 390  , 546 , 300 ],
        [ 1 , 201  , 101 , 500 ] ,
        [ 2  , 0 , 145 , 100 ] ,
        [ 3 , -488  , 88  , 700 ] ,
        [ 4  , 390  , 546 , 300 ] ,
        [ 5 , 0  , 88  , 700 ] ,
        [ 6  , 390  , 546 , 300 ] ,
        [ 7 , 201  , 101 , 500 ] ,
        [8  , 1145 , 145 , 100 ] ,
        [ 9 , 488  , 88  , 700 ] ,
        [ 10  , 390  , 546 , 300 ],
        [ 1 , 201  , 101 , 500 ] ,
        [ 2  , 0 , 145 , 100 ] ,
        [ 3 , -488  , 88  , 700 ] ,
        [ 4  , 390  , 546 , 300 ] ,
        [ 5 , 0  , 88  , 700 ] ,
        [ 6  , 390  , 546 , 300 ] ,
        [ 7 , 201  , 101 , 500 ] ,
        [8  , 1145 , 145 , 100 ] ,
        [ 9 , 488  , 88  , 700 ] ,
        [ 10  , 390  , 546 , 300 ]
        ]

    KISSY.ready(function(){
       KISSY.config({
           debug:true,
           //base : "./",
           packages:[
             {
               name : "demo",
               path : "../.."
             }
           ]
       });

       var colorInd=0;
       window.stage=null;

       KISSY.use("demo/brokenline/brokenline , node" , function( S , brokenline  ){
           
           var box = S.one("#canvasTest");
           

           var options = {
               //title : "first charts",
               xAxis : {
                   field : "val1",
                   TextStyle:{
                       color : "black"
                   },
                   customPL:function(pointList){
                      return [
                          "星期一",
                          "星期二",
                          "星期三",
                          "星期四",
                          "星期五",
                          "星期六"
                      ]
                   }
               },
               yAxis : {
                   fields : ["val2"],
                   dataMode:0
               },
               customPL : function( pointList ){
                   var pl       = pointList.length;
                   var brokenPlist  = [];
                   S.each(pointList , function( p , i ){
                       brokenPlist.push(p);
                       var nextItem = (i >= pl-1) ? null : pointList[i+1];
                       if( nextItem ){
                           if( nextItem[1] != p[1] ) {
                               brokenPlist.push( [nextItem[0] , p[1]] );
                           }
                       }
                   });
                   return brokenPlist;
               }
           }

           var chart = new brokenline( box );

           //data.length=16;
           chart.draw(data1 , options);

       })
   }) 
