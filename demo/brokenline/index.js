    
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
			 [0.55   , 175    ] 
	     ]
 

    var data1= [
        ["val1","val2","val3","val4"],
        [ 0.05 , 201  , 101 , 500 ] ,
        [ 0.1  , 1145 , 145 , 100 ] ,
        [ 0.15 , 488  , 88  , 700 ] ,
        [ 0.2  , 390  , 546 , 300 ] 
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
                   }
               },
               yAxis : {
                   fields : ["val2"],
                   dataMode:0
               },
               type  : "price"

           }

           var chart = new brokenline( box );

           //data.length=16;
           chart.draw(data1 , options);

       })
   }) 
