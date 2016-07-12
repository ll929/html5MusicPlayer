/**
 * Created by liulei on 2016/5/7.
 */
$(function () {
    var pw = $(window).width(),
        ph = $(window).height();
    console.log(pw+":"+ph+":"+pw/ph)
    var p = $("#player"),
        pLeft = p.find(".player-left"),
        pCenter = p.find(".player-center"),
        pRight = p.find(".player-right");
    var pArr = [pLeft,pCenter,pRight],
        pArrIndex = 0,
        liArr = [];
    $("body").height(ph).width(pw);
    function swipeEvent() {
        pArr[pArrIndex].css({"left":"0"});
        liArr[pArrIndex].css({"background":"rgba(255,255,255,.8)"});
        $("#player").swipe( {
            swipe:function(event, direction, distance, duration, fingerCount, fingerData) {
                liArr[pArrIndex].css({"background":"rgba(255,255,255,.5)"});
                if(direction == "right"){
                    pArr[pArrIndex].animate({"left":"200%"},500);
                    if((--pArrIndex)<0){
                        pArrIndex = pArr.length - 1;
                    }
                    pArr[pArrIndex]
                        .css({"left":"-100%"})
                        .animate({"left":"0"},500);
                }else if(direction == "left"){
                    pArr[pArrIndex].animate({"left":"-100%"},500);
                    pArrIndex = ++pArrIndex % pArr.length;
                    pArr[pArrIndex]
                        .css({"left":"100%"})
                        .animate({"left":"0"},500);
                }
                liArr[pArrIndex].css({"background":"rgba(255,255,255,.8)"});
            },
            threshold:pw/5
        });
        p.find(".player-lrc-box").swipe( {
            swipe:function(event, direction, distance, duration, fingerCount, fingerData) {
                if(direction == "down" || direction == "up"){
                    p.find(".player-lrc-box").trigger("mousewheel",direction)
                }
            },
            threshold:pw/5
        });
        p.find(".player-list-box").swipe( {
            swipe:function(event, direction, distance, duration, fingerCount, fingerData) {
                if(direction == "down" || direction == "up"){
                    p.find(".player-list-box").trigger("mousewheel",direction)
                }
            },
            threshold:pw/5
        });
    }
    function createUl() {
        var css = {
            "position":"absolute",
            "width":"5%",
            "height":"100%",
            "border-radius": "100%",
            "background":"rgba(255,255,255,.5)",
            "list-style": "none"
        };
        liArr[0] = $("<li></li>").css(css);
        liArr[1] = $("<li></li>").css(css);
        liArr[2] = $("<li></li>").css(css);
            var ul = $("<ul>").css({
                "position":"absolute",
                "width" : "100%",
                "bottom" :"15%"
            }).appendTo(p).append(liArr[0]).append(liArr[1]).append(liArr[2]);
        ul.height(liArr[0].width());
        liArr[0].css({"left":"40.5%"});
        liArr[1].css({"left":"47.5%"});
        liArr[2].css({"right":"40.5%"});
    }
    function init() {
        createUl();
        swipeEvent()
    }
    init()
});