if (typeof FlashCanvas != "undefined") {
    FlashCanvas.setOptions({
        usePolicyFile : true
    });

} 
KISSY.ready(function(S){
    KISSY.config({
        debug:true,
        packages:[
          {
            name : "demo",
            path : "../.."
          } ,
          {
            name : "canvax",
            path : "../../"
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

       var urls = [
        "http://gtms01.alicdn.com/tps/i1/T1inpxFAprXXXdzrYA-152-151.png",   //锤子
                 "http://gtms01.alicdn.com/tps/i1/T1VgByFvxfXXXdzrYA-152-151.png", //打击中的锤子
                 "http://gtms01.alicdn.com/tps/i1/T1WxBzFENbXXaG4.rS-300-300.png",
                 "http://gtms01.alicdn.com/tps/i1/T1jfXrFypmXXcXWHLe-35-32.png",
                 "http://gtms01.alicdn.com/tps/i1/T15FByFuxvXXaffDbN-40-160.png",
                 "http://gtms01.alicdn.com/tps/i1/T1xnRwFsdXXXX99eLj-56-78.png"
        ]

       var game = new eggGame( el , urls );
       window.g = game;
    });
 });
