# html5MusicPlayer
### 播放器配置
```js
playerConfig = {
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
```

### payerlist.json文件内存放的是歌曲信息
```json
{
  "1":{
    "name":"雨花石",
    "artist" : "李玉刚&石头",
    "album" : "雨花石",
    "mp3" : "media/1.mp3",
    "aac" : "media/1.aac",
    "lrc" : "media/1.lrc",
    "artpic" : "media/1.jpg"
  },
  "2":{
    "name":"情网",
    "artist" : "张学友",
    "album" : "吻别",
    "mp3" : "media/2.mp3",
    "aac" : "media/2.aac",
    "lrc" : "media/2.lrc",
    "artpic" : "media/2.jpg"
  },
  "3":{
    "name":"演员",
    "artist" : "薛之谦",
    "album" : "绅士",
    "mp3" : "media/3.mp3",
    "aac" : "media/3.aac",
    "lrc" : "media/3.lrc",
    "artpic" : "media/3.jpg"
  }
}
```