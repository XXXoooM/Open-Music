---
created: 2026-08-23T13:23:32 (UTC +08:00)
tags: []
source: https://api.qijieya.cn/meting/
author: 
---

# 祈杰のMeting-API - 支持解析网易云VIP

> ## Excerpt
> 本站支持解析网易云VIP歌曲欢迎各位随时调用哦（网易云音乐人喵）
    
    如果VIP没了就是有人在恶意调用被我全局禁止了
    
    请迁移至 musicapi.qijieya.cn 本站将迁移过去（如果你发现用的不舒服可以随时切换回来，因为还没完全做好），更多信息请加Q群：140952978
    
     该api同时兼容meting，也有vip，有问题请加群

---
## 参数说明

server: 数据源  
     netease 网易云音乐(默认)  
     tencent QQ音乐

本站支持解析网易云VIP歌曲欢迎各位随时调用哦（网易云音乐人喵）  
如果VIP没了就是有人在恶意调用被我全局禁止了  
请迁移至 [musicapi.qijieya.cn](https://musicapi.qijieya.cn/) 本站将迁移过去（如果你发现用的不舒服可以随时切换回来，因为还没完全做好），更多信息请加Q群：[140952978](https://qm.qq.com/q/APwOfifNde)  
该api同时兼容meting，也有vip，有问题请加群

type: 类型  
     name 歌曲名  
     artist 歌手  
     url 链接  
     pic 封面  
     lrc 歌词  
     song 单曲  
     search 搜索  
     playlist 歌单

id: 类型ID（封面ID/单曲ID/歌单ID）或搜索关键词（type=search）  
search 可选参数：page（页码，默认1）、limit（条数，默认30）、search\_type（平台搜索类型，默认1）  
通用可选参数：br（音质参数，默认320，可选如2000/192/128）、cover（封面分辨率，默认300）；pic 同时兼容旧参数 size

GitHub：[meting-api](https://github.com/injahow/meting-api)，此API基于 [Meting](https://github.com/metowolf/Meting) 构建。

例如：[https://api.qijieya.cn/meting/?type=url&id=1969519579](https://api.qijieya.cn/meting/?type=url&id=1969519579)  
[https://api.qijieya.cn/meting/?type=url&id=1385117201](https://api.qijieya.cn/meting/?type=url&id=1385117201)   VIP歌曲测试  
[https://api.qijieya.cn/meting/?type=url&id=416892104](https://api.qijieya.cn/meting/?type=url&id=416892104)  
[https://api.qijieya.cn/meting/?type=url&id=416892104&br=2000](https://api.qijieya.cn/meting/?type=url&id=416892104&br=2000)  
[https://api.qijieya.cn/meting/?type=pic&id=416892104&cover=500](https://api.qijieya.cn/meting/?type=pic&id=416892104&cover=500)  
[https://api.qijieya.cn/meting/?type=song&id=591321](https://api.qijieya.cn/meting/?type=song&id=591321)  
[https://api.qijieya.cn/meting/?type=search&id=周杰伦&limit=5](https://api.qijieya.cn/meting/?type=search&id=%E5%91%A8%E6%9D%B0%E4%BC%A6&limit=5)  
[https://api.qijieya.cn/meting/?type=playlist&id=2619366284](https://api.qijieya.cn/meting/?type=playlist&id=2619366284)

API调用统计: 累计调用: **34484962** 今日调用: **158445**

  
©️2025 [祈杰](https://qijieya.cn/) All rights reserved.
