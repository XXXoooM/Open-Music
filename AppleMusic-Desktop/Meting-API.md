---
created: 2026-08-23T13:23:11 (UTC +08:00)
tags: []
source: https://meting.mikus.ink/
author: 
---

# Meting-API

> ## Excerpt
> 📖 API 接口文档GET /api📋 请求参数Meting API 参数名类型必填默认值说明 server string 否 tencent 音乐平台，可选值：netease（网易云音乐）、tencent（QQ音乐） type string 否 playlist 请求类型，可选值见下方支持矩阵 id string 否 7326220405 资源ID，如歌单ID、歌曲ID、歌手ID、搜索关键词

---
📖 API 接口文档

GET /api

📋 请求参数

# Meting API

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|--------|-----|------------|---------------------------------------|
| server | string | 否 | tencent | 音乐平台，可选值：`netease`（网易云音乐）、`tencent`（QQ音乐） |
| type | string | 否 | playlist | 请求类型，可选值见下方支持矩阵 |
| id | string | 否 | 7326220405 | 资源ID，如歌单ID、歌曲ID、歌手ID、搜索关键词等 |

🔢 类型支持矩阵

# Meting API

| type 值 | 说明 | netease | tencent |
|----------|------|---------|---------|
| song | 单曲信息 | ✓ | ✓ |
| playlist | 歌单 | ✓ | ✓ |
| artist | 歌手歌曲 | ✓ | ✗ |
| search | 搜索 | ✓ | ✗ |
| url | 播放链接 | ✓ | ✓ |
| lrc | 歌词 | ✓ | ✓ |
| pic | 封面图片 | ✓ | ✓ |

📨 请求示例

请求URL URL

# Meting API

```bash
https://meting.mikus.ink/api?server=netease&type=playlist&id=6907557348
```

✅ 响应示例

成功响应 JSON 200

```json
[
  {
    "name": "歌曲名称",
    "artist": "歌手名",
    "url": "https://example.com/api?server=netease&type=url&id=xxx",
    "pic": "https://example.com/api?server=netease&type=pic&id=xxx",
    "lrc": "https://example.com/api?server=netease&type=lrc&id=xxx",
    "id": "473403185"
  }
]
```

成功响应 302 Redirect

```
HTTP/1.1 302 Found
Location: https://music.example.com/song.mp3
```

当 url 以 `@` 开头时，直接返回文本内容而非重定向

成功响应 Text 200

```csharp
[00:00.00] 作词 : 某某
[00:01.00] 作曲 : 某某
[00:10.50]第一行歌词
[00:15.30]第二行歌词
```

成功响应 302 Redirect

```
HTTP/1.1 302 Found
Location: https://img.example.com/cover.jpg
```

❌ 错误响应

# Meting API

| 状态码 | 说明 | 响应示例 |
|-----|------------------------------|-------------------------------------------------------------------------------------------|
| 400 | 参数不合法（server 或 type 不在支持范围内） | `{"status":400,"message":"server 参数不合法","param":{"server":"xxx","type":"song","id":"123"}}` |
| 403 | 无法获取播放链接（Cookie 无效或资源不可用） | `{"error":"no url"}` |
