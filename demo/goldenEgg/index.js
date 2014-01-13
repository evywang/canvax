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
         "./hammer.png",   //锤子
         "./hammer_click.png", //打击中的锤子
         "./light.png",
         "./slit_l.png",
         "./slit_m.png",
         "./slit_r.png"
       ];

       var game = new eggGame( el , urls );
       
    });
 });
