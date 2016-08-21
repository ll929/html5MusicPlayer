/**
 * Created by liulei on 2016/5/7.
 */
$(function () {
    //jquery检测滑动
    $.fn.extend({
        swipe: function (obj) {
            var $this = $(this),
                sX, sY, eX, eY, th;
            if (obj.threshold) {
                th = obj.threshold
            } else {
                th = 75;
            }
            addEventHandler($this[0], "touchstart", function (e) {
                if (e.targetTouches.length == 1) {
                    var touch = e.targetTouches[0];
                    sX = touch.pageX;
                    sY = touch.pageY;
                }
            });
            addEventHandler($this[0], "touchend", function (e) {
                var touch = e.changedTouches[0];
                eX = touch.pageX;
                eY = touch.pageY;
                if (Math.abs(eX - sX) > th || Math.abs(eY - sY) > th) {
                    obj.swipe(getDirection())
                }
            });
            addEventHandler($this[0], "touchcancel", function (e) {
                var touch = e.changedTouches[0];
                eX = touch.pageX;
                eY = touch.pageY;
                if (Math.abs(eX - sX) > th || Math.abs(eY - sY) > th) {
                    obj.swipe(getDirection())
                }
            });
            function addEventHandler(target, type, func) {
                if (target.addEventListener) {
                    target.addEventListener(type, func, false);
                } else if (target.attachEvent) {
                    target.attachEvent("on" + type, func);
                } else {
                    target["on" + type] = func;
                }
            }

            function getDirection() {
                var dX = eX - sX,
                    dY = eY - sY;
                if (dX > 0) {
                    if (dX >= Math.abs(dY)) {
                        return "right"
                    } else {
                        if (dY < 0) {
                            return "up"
                        } else {
                            return "down"
                        }
                    }
                } else {
                    if (Math.abs(dX) > Math.abs(dY)) {
                        return "left"
                    } else {
                        if (dY < 0) {
                            return "up"
                        } else {
                            return "down"
                        }
                    }
                }
            }
        }
    });
    //禁止uc浏览器滑动翻页
    (function () {
        var control = navigator.control || {};
        if (control.gesture) {
            control.gesture(false);
        }
    })();
    var pw = $(window).width(),
        ph = $(window).height();
    var p = $("#player"),
        pLeft = p.find(".player-left"),
        pCenter = p.find(".player-center"),
        pRight = p.find(".player-right");
    var pArr = [pLeft, pCenter, pRight],
        pArrIndex = 0,
        liArr = [];
    $("#post-music,.article-entry")
        .height(ph)
        .width(pw)
        .css({
            "position": "fixed",
            "top": 0,
            "z-index": 999,
            "margin": "0",
            "padding": "0"
        });
    function swipeEvent() {
        pArr[pArrIndex].css({"left": "0"});
        liArr[pArrIndex].css({"background": "rgba(255,255,255,.7)"});
        $("#player").swipe({
            swipe: function (direction) {
                liArr[pArrIndex].css({"background": "rgba(255,255,255,.2)"});
                if (direction == "right") {
                    pArr[pArrIndex].animate({"left": "200%"}, 500);
                    if ((--pArrIndex) < 0) {
                        pArrIndex = pArr.length - 1;
                    }
                    pArr[pArrIndex]
                        .css({"left": "-100%"})
                        .animate({"left": "0"}, 500);
                } else if (direction == "left") {
                    pArr[pArrIndex].animate({"left": "-100%"}, 500);
                    pArrIndex = ++pArrIndex % pArr.length;
                    pArr[pArrIndex]
                        .css({"left": "100%"})
                        .animate({"left": "0"}, 500);
                }
                liArr[pArrIndex].css({"background": "rgba(255,255,255,.7)"});
            },
            threshold: 20
        });
        p.find(".player-lrc-box").swipe({
            swipe: function (direction) {
                if (direction == "down" || direction == "up") {
                    p.find(".player-lrc-box").trigger("mousewheel", direction)
                }
            },
            threshold: 20
        });
        p.find(".player-list-box").swipe({
            swipe: function (direction) {
                if (direction == "down" || direction == "up") {
                    p.find(".player-list-box").trigger("mousewheel", direction)
                }
            },
            threshold: 20
        });
    }

    function createUl() {
        var css = {
            "position": "absolute",
            "width": "5%",
            "height": "100%",
            "border-radius": "100%",
            "background": "rgba(255,255,255,0.2)",
            "list-style": "none"
        };
        liArr[0] = $("<li></li>").css(css);
        liArr[1] = $("<li></li>").css(css);
        liArr[2] = $("<li></li>").css(css);
        var ul = $("<ul>").css({
            "position": "absolute",
            "width": "100%",
            "bottom": "15%"
        }).appendTo(p).append(liArr[0]).append(liArr[1]).append(liArr[2]);
        ul.height(liArr[0].width());
        liArr[0].css({"left": "40.5%"});
        liArr[1].css({"left": "47.5%"});
        liArr[2].css({"right": "40.5%"});
    }

    function init() {
        createUl();
        swipeEvent();
    }

    init();
});