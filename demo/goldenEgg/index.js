 KISSY.ready(function(S){
    KISSY.config({
        debug:true,
        packages:[
          {
            name : "demo",
            path : "../.."
          }
        ]
    }); 
    KISSY.use("demo/goldenEgg/eggGame , node" , function(S , eggGame){
       var el   = S.all("#eggGame");

       var urls = [
         "./egg_faguang.png", //发光的蛋
         "./egg_liekai.png",  //裂开的蛋
         "./hammer.png",   //锤子
         "./hammer_click.png" //打击中的锤子
       ];

       var game = new eggGame( el , urls );
       
    });
 });
