/**
 * Created by liulei on 2016/5/5.
 */
$(function () {
    var playerConfig = {
        "autoplay" : false,//自动播放
        "defaultId" : 0, //默认播放id
        "mode" : "order", //播放模式["order","",repeat","repeatall"]
        "volume" : 75, //默认音量
        "mediaType" : ["aac","mp3"], //播放音频格式顺序
        "box" : $("body"), //播放器背景元素
        "theme" : {
            "cd" : false,
            "progressColor" : false,
            "volumeColor" :　false,
            "defaultBgImg" :false,  //url
            "bgBlur" : 10 //背景高斯模糊程度
        }
    };
    var playList = [],
        modeIdList = [],
        modeId = playerConfig.defaultId,
        p = $("#player"),//播放器元素
        currentSongId = playerConfig.defaultId, //当前播放id
        audio = p.find(".audio")[0],
        lrc,
        zoom;

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
                if (obj[channel][i].call(this,data) === false) {
                    return false;
                }
            }
        }
    }
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
            $(document).ready(function () {
                img[0].src = src;
                img.load(function () {
                    stackBlurImage( "player-box-bg-img", "player-box-bg-canvas",playerConfig.theme.bgBlur, false );
                    setNewBg()
                })
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
    function getPlayList() {
        $.ajax({
            url : "js/playlist.json",
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
                            artpic : data[key].artpic
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
    function loadSongInf() {
        p.find(".art-name").html(playList[currentSongId].name);
        p.find(".art-singer").html(playList[currentSongId].artist);
        p.find(".art-album").html(playList[currentSongId].album);
    }
    function loadArtPic() {
        var url;
        if(playList[currentSongId].artpic){
            url = playList[currentSongId].artpic
        }else {
            url = "media/"+playList[currentSongId].key+".jpg";
        }
        p.find(".art-pic")[0].src = url;
    }
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
    function playListListener() {
        p.find(".player-list").click(function (e) {
            var currentPlay = p.find(".playlist-"+currentSongId);
            if(e.target.localName == "li"){
                if(currentPlay){
                    currentPlay.removeClass("current");
                }
                currentSongId = $(e.target).attr("listid");
                player.loadPlayMedia();
            }
        })
    }
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
    function progressListener() {
        var progressTotal = p.find(".player-progress").width();
        p.find(".player-progress").on("click",function (e) {
            audio.currentTime = e.offsetX/zoom/progressTotal*audio.duration;
        })
    }
    function volumeListener() {
        var currentVolume = p.find(".player-volume-current");
        currentVolume.width(playerConfig.volume/100*p.find(".player-volume-total").width());
        audio.volume = playerConfig.volume/100;
        p.find(".player-volume-total").click(function (e) {
            audio.volume = e.offsetX/zoom/$(this).width();
            currentVolume.width(e.offsetX/zoom);
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
    function lrcListBarListener(bh) {
        var lrcListBar = createSidebar(p.find(".player-list-box"),p.find(".player-list"),6,"left");
        playListbarMonitor.listen("playList",function (data) {
            lrcListBar.height(bh/data*bh)
        })
    }
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
                    moveBar(topMove,topMax,(lH-topMax))
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
        play : function () {
            audio.play();
            p.find(".player-btn-pp").css({
                "background": "url('images/stop.png') no-repeat center",
                "background-size": "80%",
                "opacity": ".5"
            })
        },
        pause : function () {
            audio.pause();
            p.find(".player-btn-pp").css({
                "background": "url('images/play.png') no-repeat center",
                "background-size": "80%",
                "opacity": ".5"
            })
        },
        muted : function (muted) {
          if(muted){
              audio.muted = true;
              p.find(".player-volume-bg").addClass("mute")
          }else {
              audio.muted = false;
              p.find(".player-volume-bg").removeClass("mute")
          }
        },
        loadPlayList : function () {
            var li = "";
            for(var i=0;i<playList.length;i++){
                li+="<li class='playlist-"+i+"' listid='"+i+"'>"+playList[i].artist+" - "+playList[i].name+"</li>"
            }
            p.find(".player-list").html(li);
            var  bh = p.find(".player-list-box").height(),
                lh = p.find(".player-list").height();
            if(lh > bh){
                lrcListBarListener(bh,lh);
                playListbarMonitor.trigger("playList",p.find(".player-list").height())
            }
        },
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
    function windowSizeListerer() {
        var pW = p.width(),
            pH = p.height();
        changePlayerSize($(window).width(),$(window).height(),pW,pH);
        $(window).on("resize",function () {
            changePlayerSize($(window).width(),$(window).height(),pW,pH);
        })
    }
    function changePlayerSize(wW,wH,pW,pH) {
        var zW = wW/pW,
            zH = wH/pH;
        zoom = Math.min(zW,zH);
        p.css({"zoom":zoom})
    }
    function init() {
        getPlayList();
        setTheme();
        windowSizeListerer();
    }
    init();
});
