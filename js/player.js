/**
 * Created by liulei on 2016/5/5.
 */
$(function () {
    var playerConfig = {
        "autoplay" : false,//自动播放
        "defaultId" : 0, //默认播放id
        "mode" : "order", //播放模式["shuffle","order","",repeat","repeatall"]
        "volume" : 75, //默认音量
        "mediaType" : ["aac","mp3"], //播放音频格式顺序
        "box" : $("body"), //播放器背景元素
        "theme" : {
            "cd" : false,  //图片cd转动效果
            "progressColor" : "", //进度条颜色，默认rgba(123, 255, 255, 0.7)
            "volumeColor" :　"",  //音量颜色，默认rgba(123, 255, 255, 0.7)
            "defaultBgImg" :"",  //url
            "bgBlur" : 10 //背景高斯模糊程度
        }
    };
    var playList = [],
        modeIdList = [],
        modeId = playerConfig.defaultId,
        p = $("#player"),//播放器元素
        currentSongId = playerConfig.defaultId, //当前播放id
        audio = p.find(".audio")[0],
        lrc;

    /**
     * 秒转换分
     * @param sec 秒
     * @returns {string} 分
     */
    function secToMin(sec) {
        sec = Math.floor(sec);
        var second,minute,s,m;
        minute = (m = Math.floor(sec/60)) < 10 ? "0"+m : m;
        second = (s = sec%60) <10 ? "0"+s : s;
        return (minute+":"+second)
    }
    /**
     * 分钟转换秒
     * @param min 分钟
     * @returns {number} 秒
     */
    function minToSec(min) {
        var minArr = min.split(":");
        return minArr[0]*60 + minArr[1]*1;
    }

    function Monitor() {
        var obj = {};
        /**
         * @param channel 监听信息频道
         * @param eventfn 回调函数
         */
        this.listen = function (channel, eventfn) {
            if(obj[channel] != null){
                obj[channel].push(eventfn)
            }else {
                obj[channel] = [];
                obj[channel].push(eventfn)
            }
        };
        /**
         * @param channel 发布信息频道
         * @param data 发布的信息数据
         */
        this.trigger = function (channel,data) {
            if(obj[channel] == null) obj[channel] = [];
            for (var i = 0;i < obj[channel].length;i++) {
                //返回false则返回，不执行后续函数
                if (obj[channel][i].call(this,data) === false) {
                    return false;
                }
            }
        }
    }

    /**
     * 设置播放器背景
     */
    function setBoxBg() {
        var url,
            img = p.find("#player-box-bg-img"),
            canvas = p.find("#player-box-bg-canvas"),
            reg = /http:\/\//;
        if(playList[currentSongId].artpic){
            url = playList[currentSongId].artpic
        }else {
            url = "media/"+playList[currentSongId].key+".jpg";
        }
        //如果图片需要跨域加载，则先用后台转换成base64格式，在放到本地高斯模糊
        if(reg.test(url)){
            $.post("http://115.159.26.61/imgtobase64/getbase64.php",{
                "url":url
            },function (data,states) {
                if(states == "success"){
                    toBlur(data)
                }
            });
        }else {
            toBlur(url)
        }
        function toBlur(src) {
            img[0].src = src;
            img.load(function () {
                stackBlurImage( "player-box-bg-img", "player-box-bg-canvas",playerConfig.theme.bgBlur, false );
                setNewBg()
            })
        }
        function setNewBg() {
            var context = canvas[0].getContext("2d");
            context.globalCompositeOperation="source-over";
            context.fillStyle="rgba(0,0,0,0.3)";
            context.fillRect(0,0,canvas.width(),canvas.height());
            var dataURL =  canvas[0].toDataURL("image/jpg");
            playerConfig.box.css({
                "background":"url('"+dataURL+"') no-repeat center",
                "background-size": "cover"})
        }
    }

    /**
     * 设置主题样式
     */
    function setTheme() {
        var theme = playerConfig.theme;
        if(theme.cd){
            p.find(".art-pic-box,.art-pic-inner").addClass("cdtheme")
        }
        if(theme.progressColor){
            p.find(".player-progress-inner").css("background",theme.progressColor)
        }
        if(theme.volumeColor){
            p.find(".player-volume-current").css("background",theme.volumeColor)
        }
        if(theme.defaultBgImg){
            playerConfig.box.css({
                "background":"url('"+theme.defaultBgImg+"') no-repeat center",
                "background-size": "cover"})}
    }
    var lrcMonitor = new Monitor(),
        lrcBarMonitor = new Monitor(),
        playListbarMonitor = new Monitor();
    /**
     *
     * @param mode
     */
    function initModeSongId(mode) {
        for (var i = 0;i<playList.length;i++){
            modeIdList[i] = i;
        }
        switch (mode){
            case "shuffle":
                modeIdList.sort(function(){ return 0.5 - Math.random() });
                break;
        }
    }

    /**
     * 获取播放id
     * @param id
     * @param btn
     * @returns {*}
     */
    function getModeSongId(id,btn) {
        id < 0 ?id = modeIdList.length-1:id = id%modeIdList.length;
        switch (playerConfig.mode){
            case "shuffle":
                if(btn == "pre"){
                    modeId--;
                    var i;
                    modeId < 0 ?i = modeId = modeIdList.length-1:i = modeId%modeIdList.length;
                    return modeIdList[i];
                }else {
                    modeId++;
                    return modeIdList[modeId%modeIdList.length];
                }
            break;
            default :
                return id;
            break;
        }
    }

    /**
     * 异步获取播放列表
     */
    function getPlayList() {
        $.ajax({
            url : "js/playlist.json?v=2",
            type : "get",
            dataType : "json",
            success : function (data) {
                for(var key in data){
                    if(data.hasOwnProperty(key)){
                        playList[playList.length] = {
                            key : key,
                            name : data[key].name,
                            artist : data[key].artist,
                            album : data[key].album,
                            mp3 : data[key].mp3,
                            aac : data[key].aac,
                            lrc : data[key].lrc,
                            artpic : data[key].artpic || "images/artpic.jpg"
                        }
                    }
                }
                player.init();
            },
            error: function() {
                console.log("请求失败");
            }
        })
    }

    /**
     * 格式化lrc歌词
     * @param lrc lrc内容
     * @returns {Array}  歌词的每一句以数组的形式返回
     */
    function formatLrc(lrc) {
        var lrcArr = lrc.split("\n"), lrclist = [], singleLrc, timeId,text;
        for(var i=0;i<lrcArr.length;i++){
            singleLrc = lrcArr[i].split("]");
            timeId = minToSec(singleLrc[0].replace("[",""));
                text = $.trim(singleLrc[1]);
            if(!isNaN(timeId) && text != ""){
                lrclist.push({"timeId":timeId,"text":text})
            }
        }
        return lrclist;
    }

    /**
     * 异步请求lrc歌词文件
     */
    function loadLrc() {
        var url;
        if(playList[currentSongId].lrc){
            url = playList[currentSongId].lrc
        }else {
            url = "media/"+playList[currentSongId].key+".lrc"
        }
        $.ajax({
            url : url,
            type : "get",
            dataType : "text",
            success : function (data) {
                lrc = formatLrc(data);
                showLrc(lrc)
            },
            error: function() {
                console.log("请求失败");
            }
        });
        lrcTimeId = 0;lrcTemp = undefined; lrcTimeIdTemp = undefined;
    }

    /**
     * 显示歌词
     * @param lrc  经过formatLrc函数处理后的lrc
     */
    function showLrc(lrc) {
        var lrcBox = p.find(".player-lrc");
        lrcBox.css("top",0);
        if(lrc){
            var Li = '';
            for(var i = 0;i<lrc.length;i++ ){
                Li += "<li class='time-"+i+"'>"+lrc[i].text+"</li>";
            }
            lrcBox.html(Li);
        }else {
            lrcBox.html("<li>暂无歌词</li>");
        }
        var h = lrcBox.height();
        lrcBarMonitor.trigger("lrcBar",h)
    }

    /**
     * 加载歌曲其他信息
     */
    function loadSongInf() {
        p.find(".art-name").html(playList[currentSongId].name);
        p.find(".art-singer").html(playList[currentSongId].artist);
        p.find(".art-album").html(playList[currentSongId].album);
    }

    /**
     * 加载歌曲图片
     */
    function loadArtPic() {
        var url;
        if(playList[currentSongId].artpic){
            url = playList[currentSongId].artpic
        }else {
            url = "media/"+playList[currentSongId].key+".jpg";
        }
        p.find(".art-pic")[0].src = url;
    }

    /**
     * 加载歌曲资源
     */
    function loadAudio() {
      var ext1 = playerConfig.mediaType[0],
          ext2 = playerConfig.mediaType[1],
          source1 = p.find(".audio-source-1")[0],
          source2 = p.find(".audio-source-2")[0];
        if(playList[currentSongId][ext1]){
            source1.src = playList[currentSongId][ext1];
            if(playList[currentSongId][ext2]){
                source2.src = playList[currentSongId][ext2];
            }else {
                source2.src = playList[currentSongId][ext1];
            }
        }else if(playList[currentSongId][ext2]){
            source1.src = playList[currentSongId][ext2];
        }else {
            source1.src = "media/"+playList[currentSongId].key+"."+ext1;
            source2.src = "media/"+playList[currentSongId].key+"."+ext2;
        }
        audio.load();
    }

    /**
     * 监听播放列表点击事件
     */
    function playListListener() {
        p.find(".player-list").click(function (e) {
            var currentPlay = p.find(".playlist-"+currentSongId);
            if(e.target.localName == "li"){
                if(currentPlay){
                    currentPlay.removeClass("current");
                }
                currentSongId = $(e.target).data("listid");
                player.loadPlayMedia();
            }
        })
    }

    /**
     * 监听audio的各种事件
     */
    function audioListListener() {
        var progressTotal = p.find(".player-progress").width(),
            currentProgress = p.find(".player-progress-inner"),
            currentTime = p.find(".time-current");
        $(audio).on("canplay loadedmetadata",function () {
            p.find(".time-total").html(secToMin(audio.duration));
        });
        $(audio).on("timeupdate",function () {
            showCurrentLrc(audio.currentTime);
            var progress = audio.currentTime/audio.duration;
            currentProgress.width(progressTotal*progress);
            currentTime.html(secToMin(audio.currentTime));
        });
        $(audio).on("ended",function () {
            switch (playerConfig.mode){
                case "order":
                    if(currentSongId != playList.length-1){
                        p.find(".player-btn-next").trigger("click")
                    }else {
                        player.pause();
                        player.loadPlayMedia(false);
                    }
                    break;
                case "repeat":
                    player.loadPlayMedia();
                    break;
                default :
                    p.find(".player-btn-next").trigger("click");
                    break;
            }
        });
    }

    /**
     * 监听进度条点击事件
     */
    function progressListener() {
        var progressTotal = p.find(".player-progress").width();
        p.find(".player-progress").on("click",function (e) {
            audio.currentTime = e.offsetX/progressTotal*audio.duration;
        })
    }

    /**
     * 监听音量条点击事件
     */
    function volumeListener() {
        var currentVolume = p.find(".player-volume-current");
        currentVolume.width(playerConfig.volume/100*p.find(".player-volume-total").width());
        audio.volume = playerConfig.volume/100;
        p.find(".player-volume-total").click(function (e) {
            audio.volume = e.offsetX/$(this).width();
            currentVolume.width(e.offsetX);
            audio.muted = false;
            p.find(".player-volume-bg").removeClass("mute")
        });
        p.find(".player-volume-bg").click(function () {
            if(audio.muted){
                player.muted(false)
            }else {
                player.muted(true)
            }
        })
    }

    /**
     * 监听播放按钮点击事件
     */
    function playBtnListener() {
        var pre = p.find(".player-btn-pre"),
            pp = p.find(".player-btn-pp"),
            next = p.find(".player-btn-next");
        pp.click(function () {
            if (audio.paused) {
                player.play();
            } else {
                player.pause();
            }
        });
        pre.click(function () {
            p.find(".playlist-"+(currentSongId)).removeClass("current");
            currentSongId = getModeSongId(currentSongId-1,"pre");
            player.loadPlayMedia();
        });
        next.click(function () {
            p.find(".playlist-"+(currentSongId)).removeClass("current");

            currentSongId = getModeSongId(currentSongId*1+1);
            player.loadPlayMedia();
        })
    }

    /**
     * 监听模式选择点击事件
     */
    function playModeListener() {
        function setMode(mode) {
            p.find(".player-mode-"+playerConfig.mode).removeClass("current");
            if(mode == playerConfig.mode){
                playerConfig.mode = "order";
            }else {
                playerConfig.mode = mode;
                p.find(".player-mode-"+playerConfig.mode).addClass("current");
            }
        }
        p.find(".player-mode").click(function (e) {
            setMode($(e.target).attr("data"));
            initModeSongId(playerConfig.mode)
        })
    }

    /**
     * 绑定自定义事件
     */
    function lrcBarListener() {
        var bh = p.find(".player-lrc-box").height();
        var lrcBar = createSidebar(p.find(".player-lrc-box"),p.find(".player-lrc"),6,"right");
        lrcBar.height(bh/p.find(".player-lrc").height()*bh);
        lrcMonitor.listen("lrc",function (data) {
            var topMax = p.find(".player-lrc-box").height()-lrcBar.height();
            lrcBar.css("top",topMax*data/(lrc.length-6));
        });
        lrcBarMonitor.listen("lrcBar",function (data) {
            lrcBar.css("top","0");
            lrcBar.height(bh/data*bh);
        })
    }
    /**
     * 绑定自定义事件
     */
    function lrcListBarListener(bh) {
        var lrcListBar = createSidebar(p.find(".player-list-box"),p.find(".player-list"),6,"left");
        playListbarMonitor.listen("playList",function (data) {
            lrcListBar.height(bh/data*bh)
        })
    }

    /**
     * 创建滑动条
     * @param par 父元素
     * @param c 显示列表元素
     * @param w 滑动条宽度 px
     * @param d 滑动条方向 "left"or"right"
     * @returns {*|jQuery} 滑动条元素
     */
    function createSidebar(par,c,w,d) {
        var css = {
            "position":"absolute",
            "top": 0,
             "background":"rgba(255,255,255,.1)",
            "border-radius" :w/2+"px",
            "cursor":"pointer",
            "transition": "top 1s"
        };
        css[d] = 0;
        var bar = $("<div>")
            .width(w)
            .css(css);
        var lrcPos;
        bar.on("mouseover",function () {
                $(this).css({"background":"rgba(255,255,255,.5)"});
            })
            .on("mouseout",function () {
                $(this).css({"background":"rgba(255,255,255,.1)"});
            })
            .on("mousedown",function (e) {
                $(this).off("mouseout");
                $(this).css({
                    "background":"rgba(255,255,255,.5)",
                    "transition" : "top 0s"
                });
                var firstY = e.clientY,
                    top = $(this).css("top").replace("px",""),
                    lH = c.height();
                $(document).on("mousemove",function (e) {
                    var topMax = par.height()-bar.height();
                    var topMove = top*1+e.clientY-firstY;
                    if(topMove < 0){
                        topMove = 0
                    }else if (topMove > topMax){
                        topMove = topMax
                    }
                    bar.css("top",topMove+"px");
                    moveBar(topMove,topMax,(lH-topMax));
                    window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
                });
            })
            .appendTo(par);
        $(document).on("mouseup",function () {
            $(this).off("mousemove");
            bar.css({
                "background":"rgba(255,255,255,.1)",
                "transition" : "top 1s"
            });
            bar.on("mouseout",function () {
                bar.css({"background":"rgba(255,255,255,.1)"});
            });
        });
        par.on("mousewheel DOMMouseScroll", function (e,data) {
            var topMax = par.height()-bar.height();
            var delta = data;
            if(delta){
                switch (delta){
                    case "up":
                        delta = -1;
                        break;
                    case "down":
                        delta = 1;
                        break;
                }
            }else {
                delta = (e.originalEvent.wheelDelta && (e.originalEvent.wheelDelta > 0 ? 1 : -1)) ||  // chrome & ie
                    (e.originalEvent.detail && (e.originalEvent.detail > 0 ? -1 : 1))  // firefox
            }
            var topMove,
                lrcHeight = c.height(),
                currentTop = bar.css("top").replace("px","");
            if (delta > 0) {
                topMove = currentTop-topMax/4;
            } else if (delta < 0) {
                topMove = currentTop*1+topMax/4;
            }
            if(topMove < 0){
                topMove = 0
            }else if (topMove > topMax){
                topMove = topMax
            }
            bar.css("top",topMove+"px");
            moveBar(topMove,topMax,(lrcHeight-topMax))
        });
        function moveBar(pos,barH,lrcH) {
            bar.css("top",pos);
            lrcPos = Math.floor(pos/barH*lrcH/28);
            c.css({
                top:"-"+lrcPos*28+"px"
            })

        }
        return bar;
    }
    var lrcTimeId = 0, lrcTemp = undefined, lrcTimeIdTemp = undefined;
    /**
     * 当前歌词高亮显示
     * @param cTime 歌曲当前播放时间
     */
    function showCurrentLrc(cTime) {
        if (lrcTimeId < lrc.length && cTime > lrc[lrcTimeId].timeId) {
            while (lrcTimeId < lrc.length && cTime > lrc[lrcTimeId].timeId) {
                lrcTimeId++;
            }
            lrcTimeId--;
        }else if (lrcTimeId >= 1 && cTime < lrc[lrcTimeId].timeId){
            lrcTimeId = 0;
            while (cTime > lrc[lrcTimeId].timeId){
                lrcTimeId ++;
            }
            lrcTimeId --;
        }
        if (lrcTimeId != lrcTimeIdTemp) {
            changeLrcTop(lrcTimeId);
            if (lrcTemp) lrcTemp.removeClass("current");
            lrcTemp = p.find(".time-"+lrcTimeId).addClass("current");
            lrcTimeIdTemp = lrcTimeId;
        }
    }

    /**
     * 动态改变歌词上下位置
     * @param id 当前高亮歌词timeId
     */
    function changeLrcTop(id) {
        if (id > 6) {
            p.find(".player-lrc").css({
                top: "-" + (lrcTimeId - 6) * 28 + "px"
            });
            lrcMonitor.trigger("lrc",(lrcTimeId-6))
        } else {
            p.find(".player-lrc").css({
                top: "0"
            })
        }
    }
    var  player = {
        //播放
        play : function () {
            audio.play();
            p.find(".player-btn-pp").css({
                "background": "url('images/stop.png') no-repeat center",
                "background-size": "80%",
                "opacity": ".5"
            })
        },
        //暂停
        pause : function () {
            audio.pause();
            p.find(".player-btn-pp").css({
                "background": "url('images/play.png') no-repeat center",
                "background-size": "80%",
                "opacity": ".5"
            })
        },
        //静音
        muted : function (muted) {
          if(muted){
              audio.muted = true;
              p.find(".player-volume-bg").addClass("mute")
          }else {
              audio.muted = false;
              p.find(".player-volume-bg").removeClass("mute")
          }
        },
        //加载歌曲列表
        loadPlayList : function () {
            var li = "";
            for(var i=0;i<playList.length;i++){
                li+="<li class='playlist-"+i+"' data-listid='"+i+"'>"+playList[i].artist+" - "+playList[i].name+"</li>"
            }
            p.find(".player-list").html(li);
            var  bh = p.find(".player-list-box").height(),
                lh = p.find(".player-list").height();
            if(lh > bh){
                lrcListBarListener(bh,lh);
                playListbarMonitor.trigger("playList",p.find(".player-list").height())
            }
        },
        //加载播放器
        loadPlayMedia : function (autoPlay) {
            loadLrc();
            loadSongInf();
            loadArtPic();
            loadAudio();
            p.find(".playlist-"+currentSongId).addClass("current");
            if(autoPlay === undefined || autoPlay ===true)player.play();
            setBoxBg()
        },
        init : function () {
            player.loadPlayList();
            player.loadPlayMedia(playerConfig.autoplay);
            initModeSongId(playerConfig.mode);
            listener();
        }
    };
    function listener() {
        playListListener();
        progressListener();
        audioListListener();
        volumeListener();
        playBtnListener();
        playModeListener();
        lrcBarListener();
    }
    function init() {
        getPlayList();
        setTheme();
    }
    init();
});
