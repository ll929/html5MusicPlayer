/**
 * Created by liulei on 2016/5/7.
 */
$(function () {
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
        js,css;
    var mobileUrl = {
            css : "css/mobile.css",
            js : "js/mobile.js"
        },
        pcUrl = {
            css : "css/main.css",
            js : "js/player.js"
        };
    /**
     * 加载css
     * @param url  css链接
     */
    function loadCss(url) {
        css = document.createElement('link');
        css.href = url.css;
        css.rel = 'stylesheet';
        css.type = 'text/css';
        head.appendChild(css);
        css.onload = function () {
            loadJs(url.js)
        }
    }

    /**
     * 加载js
     * @param url js链接
     */
    function loadJs(url) {
        js = document.createElement('script');
        js.src = url;
        js.type = 'text/javascript';
        body.appendChild(js);
        if(url == mobileUrl.js){
            js.onload = function () {
                loadJs(pcUrl.js)
            }
        }
    }

    /**
     * 移动端添加头部viewport
     */
    function addMeta() {
        $('<meta name="viewport" content="width=device-width,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no"/>')
            .appendTo($(head))
    }
    
    /*判断是否移动端*/
    if(browser.versions.mobile === true && $(window).width()/$(window).height() < 0.75){
        addMeta();
        loadCss(mobileUrl)
    }else{
        loadCss(pcUrl)
    }
});
