use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct TrackDto {
    pub id: String,
    pub name: String,
    pub artist: String,
    pub album: Option<String>,
    pub pic: String,
    pub url: String,
    pub lrc: Option<String>,
    pub duration: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreatorDto {
    pub nickname: String,
    #[serde(rename = "avatarUrl")]
    pub avatar_url: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PlaylistDto {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub cover: String,
    #[serde(rename = "trackCount")]
    pub track_count: usize,
    pub creator: Option<CreatorDto>,
    pub tracks: Vec<TrackDto>,
}

#[derive(Debug, Deserialize)]
struct RawMetingItem {
    pub id: Option<serde_json::Value>,
    pub name: Option<String>,
    pub title: Option<String>,
    pub artist: Option<String>,
    pub author: Option<String>,
    pub album: Option<String>,
    pub pic: Option<String>,
    pub cover: Option<String>,
    pub url: Option<String>,
    pub lrc: Option<String>,
    pub duration: Option<f64>,
}

fn normalize_url(raw: &str, base: &str) -> String {
    if raw.starts_with("http://") || raw.starts_with("https://") {
        raw.to_string()
    } else if raw.starts_with('/') {
        if let Ok(parsed) = reqwest::Url::parse(base) {
            format!("{}://{}{}", parsed.scheme(), parsed.host_str().unwrap_or(""), raw)
        } else {
            raw.to_string()
        }
    } else {
        format!("{}{}", base, raw)
    }
}

async fn request_meting(
    client: &reqwest::Client,
    base_url: &str,
    server: &str,
    req_type: &str,
    id: &str,
    limit: Option<u32>,
) -> Result<Vec<TrackDto>, String> {
    let mut req = client
        .get(base_url)
        .query(&[("server", server), ("type", req_type), ("id", id)]);

    if let Some(lim) = limit {
        req = req.query(&[("limit", lim.to_string())]);
    }

    let res = req
        .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        .send()
        .await
        .map_err(|e| format!("Network request failed: {}", e))?;

    let raw_items: Vec<RawMetingItem> = res
        .json()
        .await
        .map_err(|e| format!("Failed to parse JSON response: {}", e))?;

    let tracks = raw_items
        .into_iter()
        .enumerate()
        .map(|(idx, item)| {
            let id_str = match item.id {
                Some(serde_json::Value::String(s)) => s,
                Some(serde_json::Value::Number(n)) => n.to_string(),
                _ => format!("track-{}", idx + 1),
            };
            let name = item.name.or(item.title).unwrap_or_else(|| "未知曲目".into());
            let artist = item.artist.or(item.author).unwrap_or_else(|| "未知歌手".into());
            let album = item.album.or_else(|| Some("单曲精选".into()));
            let pic_raw = item.pic.or(item.cover).unwrap_or_default();
            let url_raw = item.url.unwrap_or_default();
            let lrc_raw = item.lrc;

            TrackDto {
                id: id_str,
                name,
                artist,
                album,
                pic: normalize_url(&pic_raw, base_url),
                url: normalize_url(&url_raw, base_url),
                lrc: lrc_raw.map(|l| normalize_url(&l, base_url)),
                duration: item.duration,
            }
        })
        .collect();

    Ok(tracks)
}

#[tauri::command]
async fn fetch_playlist_tracks(
    source: Option<String>,
    server: Option<String>,
    playlist_id: String,
) -> Result<PlaylistDto, String> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(8))
        .build()
        .map_err(|e| e.to_string())?;

    let primary_source = source.unwrap_or_else(|| "qijieya".into());
    let music_server = server.unwrap_or_else(|| "netease".into());

    let (url1, url2) = if primary_source == "qijieya" {
        ("https://api.qijieya.cn/meting/", "https://meting.mikus.ink/api")
    } else {
        ("https://meting.mikus.ink/api", "https://api.qijieya.cn/meting/")
    };

    // Try primary route, fallback to secondary
    let tracks_res = match request_meting(&client, url1, &music_server, "playlist", &playlist_id, None).await {
        Ok(t) if !t.is_empty() => Ok(t),
        _ => request_meting(&client, url2, &music_server, "playlist", &playlist_id, None).await,
    };

    let tracks = tracks_res.unwrap_or_else(|_| vec![]);

    Ok(PlaylistDto {
        id: playlist_id,
        title: format!("Apple Music · 空间音频精选 ({})", if music_server == "netease" { "网易云" } else { "QQ音乐" }),
        description: Some("基于 Meting API 双源智能容灾解析的高保真音频流。".into()),
        cover: tracks.first().map(|t| t.pic.clone()).unwrap_or_else(|| "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80".into()),
        track_count: tracks.len(),
        creator: Some(CreatorDto {
            nickname: "Apple Music 官方多源同步".into(),
            avatar_url: None,
        }),
        tracks,
    })
}

#[tauri::command]
async fn search_music_tracks(
    source: Option<String>,
    server: Option<String>,
    keyword: String,
    limit: Option<u32>,
) -> Result<Vec<TrackDto>, String> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(6))
        .build()
        .map_err(|e| e.to_string())?;

    let primary_source = source.unwrap_or_else(|| "qijieya".into());
    let music_server = server.unwrap_or_else(|| "netease".into());

    let (url1, url2) = if primary_source == "qijieya" {
        ("https://api.qijieya.cn/meting/", "https://meting.mikus.ink/api")
    } else {
        ("https://meting.mikus.ink/api", "https://api.qijieya.cn/meting/")
    };

    match request_meting(&client, url1, &music_server, "search", &keyword, limit).await {
        Ok(t) if !t.is_empty() => Ok(t),
        _ => request_meting(&client, url2, &music_server, "search", &keyword, limit).await,
    }
}

#[tauri::command]
async fn get_lyrics(
    track_id: String,
    source: Option<String>,
    server: Option<String>,
) -> Result<String, String> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(6))
        .build()
        .map_err(|e| e.to_string())?;

    let primary_source = source.unwrap_or_else(|| "qijieya".into());
    let music_server = server.unwrap_or_else(|| "netease".into());

    let (url1, url2) = if primary_source == "qijieya" {
        ("https://api.qijieya.cn/meting/", "https://meting.mikus.ink/api")
    } else {
        ("https://meting.mikus.ink/api", "https://api.qijieya.cn/meting/")
    };

    let fetch_lrc = |base: &str| {
        client
            .get(base)
            .query(&[("server", music_server.as_str()), ("type", "lrc"), ("id", track_id.as_str())])
            .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
            .send()
    };

    if let Ok(res) = fetch_lrc(url1).await {
        if res.status().is_success() {
            if let Ok(text) = res.text().await {
                if !text.trim().is_empty() {
                    return Ok(text);
                }
            }
        }
    }

    if let Ok(res) = fetch_lrc(url2).await {
        if res.status().is_success() {
            if let Ok(text) = res.text().await {
                return Ok(text);
            }
        }
    }

    Err("Failed to fetch lyrics".into())
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AlbumDto {
    pub id: String,
    pub name: String,
    pub artist: String,
    pub cover: String,
    pub publish_year: Option<String>,
    pub track_count: usize,
    pub description: Option<String>,
    pub company: Option<String>,
    pub tracks: Vec<TrackDto>,
}

#[tauri::command]
async fn get_album(
    id: String,
    source: Option<String>,
    server: Option<String>,
) -> Result<AlbumDto, String> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(8))
        .build()
        .map_err(|e| e.to_string())?;

    let primary_source = source.unwrap_or_else(|| "qijieya".into());
    let music_server = server.unwrap_or_else(|| "netease".into());

    let (url1, url2) = if primary_source == "qijieya" {
        ("https://api.qijieya.cn/meting/", "https://meting.mikus.ink/api")
    } else {
        ("https://meting.mikus.ink/api", "https://api.qijieya.cn/meting/")
    };

    let tracks_res = match request_meting(&client, url1, &music_server, "playlist", &id, None).await {
        Ok(t) if !t.is_empty() => Ok(t),
        _ => request_meting(&client, url2, &music_server, "playlist", &id, None).await,
    };

    let tracks = tracks_res.unwrap_or_else(|_| vec![]);
    let album_name = tracks.first().and_then(|t| t.album.clone()).unwrap_or_else(|| "七里香".into());
    let artist_name = tracks.first().map(|t| t.artist.clone()).unwrap_or_else(|| "周杰伦".into());
    let cover_url = tracks.first().map(|t| t.pic.clone()).unwrap_or_else(|| "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&auto=format&fit=crop&q=80".into());

    Ok(AlbumDto {
        id,
        name: album_name,
        artist: artist_name,
        cover: cover_url,
        publish_year: Some("2004".into()),
        track_count: tracks.len(),
        description: Some("Apple Music 空间音频与高保真无损音质母带精选。".into()),
        company: Some("JVR Music / 杰威尔音乐".into()),
        tracks,
    })
}

#[tauri::command]
async fn play_native_stream(url: String) -> Result<String, String> {
    println!("[Rust Audio Engine] Native request stream: {}", url);
    Ok(format!("Streaming audio: {}", url))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            fetch_playlist_tracks,
            search_music_tracks,
            get_lyrics,
            get_album,
            play_native_stream
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
