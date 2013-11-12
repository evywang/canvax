    
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
			 [0.55   , 175    ] ,
			 [0.6    , 329    ] ,
			 [0.65   , 148    ] ,
			 [0.7    , 311    ] ,
			 [0.75   , 294    ] ,
			 [0.8    , 1478   ] ,
			 [0.85   , 441    ] ,
			 [0.9    , 794    ] ,
			 [0.95   , 376    ] ,
			 [1      , 1600   ] ,
			 [1.05   , 224    ] ,
			 [1.1    , 350    ] ,
			 [1.15   , 219    ] ,
			 [1.2    , 568    ] ,
			 [1.25   , 223    ] ,
			 [1.3    , 353    ] ,
			 [1.35   , 146    ] ,
			 [1.4    , 239    ] ,
			 [1.45   , 94     ] ,
			 [1.5    , 548    ] ,
			 [1.55   , 129    ] ,
			 [1.6    , 253    ] ,
			 [1.65   , 91     ] ,
			 [1.7    , 196    ] ,
			 [1.75   , 68     ] ,
			 [1.8    , 230    ] ,
			 [1.85   , 69     ] ,
			 [1.9    , 137    ] ,
			 [1.95   , 47     ] ,
			 [2      , 324    ] ,
			 [2.05   , 47     ] ,
			 [2.1    , 77     ] ,
			 [2.15   , 40     ] ,
			 [2.2    , 60     ] ,
			 [2.25   , 36     ] ,
			 [2.3    , 57     ] ,
			 [2.35   , 33     ] ,
			 [2.4    , 31     ] ,
			 [2.45   , 15     ] ,
			 [2.5    , 55     ] ,
			 [2.55   , 28     ]
	     ]
 

    var data1= [
        ["val1","val2","val3","val4"],
        [ 0.05 , 201  , 101 , 500 ] ,
        [ 0.1  , 1145 , 145 , 600 ] ,
        [ 0.15 , 488  , 88  , 700 ] ,
        [ 0.2  , 390  , 546 , 800 ] ,
        [ 0.25 , 186  , 126 , 900 ]
    ]

   



    KISSY.ready(function(){
       KISSY.config({
           debug:true,
           //base : "./",
           packages:[
             {
               name : "canvax",
               path : "../../../canvax"
             }
             ,
             {
               name : "demo",
               path : "../.."
             }
           ]
       });

       var colorInd=0;
       window.stage=null;

       KISSY.use("canvax/display/Stage ,demo/histogram/histogram , node" , function( S , Stage,Histogram  ){
           
           var box = S.one("#canvasTest");
           

           var options = {
               title : "first charts",
               xAxis : {
                   field : "val1",
                   TextStyle:{
                       color : "black"
                   }
               },
               yAxis : {
                   // fields : ["val2","val4"],
                   dataMode:0
               }

           }

           var chart = new Histogram( box );

           //data.length=16;
           chart.draw(data , options);

       })
   }) 
