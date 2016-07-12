/**
 * Created by liulei on 2016/5/7.
 */
$(function () {
    function init() {
        var browser={
            versions:function(){
                var u = window.navigator.userAgent;
                return {
                    trident: u.indexOf('Trident') > -1, //IE内核
                    presto: u.indexOf('Presto') > -1, //opera内核
                    webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
                    gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
                    mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
                    ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
                    android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器
                    iPhone: u.indexOf('iPhone') > -1 || u.indexOf('Mac') > -1, //是否为iPhone或者安卓QQ浏览器
                    iPad: u.indexOf('iPad') > -1, //是否为iPad
                    webApp: u.indexOf('Safari') == -1 ,//是否为web应用程序，没有头部与底部
                    weixin: u.indexOf('MicroMessenger') == -1 //是否为微信浏览器
                };
            }()
        };
        var head = document.getElementsByTagName('head')[0],
            body = document.getElementsByTagName('body')[0],
            mJs,pJs,mCss,pCss;
        function loadMCss () {
            mCss = document.createElement('link');
            mCss.href = "css/mobile.css";
            mCss.rel = 'stylesheet';
            mCss.type = 'text/css';
            head.appendChild(mCss);
            mCss.onload = function () {
                loadMJs();
            }
        }
        function loadPCss () {
            pCss = document.createElement('link');
            pCss.href = "css/main.css";
            pCss.rel = 'stylesheet';
            pCss.type = 'text/css';
            head.appendChild(pCss);
            pCss.onload = function () {
                loadPJs()
            }
        }
        function addMeta() {
            $('<meta name="viewport" content="width=device-width,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no"/>')
                .appendTo($(head))
        }
        function loadMJs() {
            mJs = document.createElement('script');
            mJs.src = "js/mobile.js";
            mJs.type = 'text/javascript';
            body.appendChild(mJs);
            mJs.onload = function () {
                loadPJs()
            }
        }
        function loadPJs() {
            pJs = document.createElement('script');
            pJs.src = "js/player.js";
            pJs.type = 'text/javascript';
            body.appendChild(pJs);
        }
        if(browser.versions.mobile === true && $(window).width()/$(window).height() < 0.75){
            addMeta()
            loadMCss()
        }else{
            loadPCss()
        }
/*        $(window).on("resize", function(){
            if($(window).width()/$(window).height() > 0.75){
                $(mCss).remove();
                $(mJs).remove();
                $(pCss).remove();
                $(pJs).remove();
                loadPCss();
            }else{
                $(mCss).remove();
                $(mJs).remove();
                $(pCss).remove();
                $(pJs).remove();
                loadMCss();
                console.log("m")
            }
        });*/
    }
    init();
});
