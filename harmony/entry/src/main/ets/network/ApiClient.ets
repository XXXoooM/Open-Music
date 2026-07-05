import { http } from '@kit.NetworkKit';
import { Track } from '../model/Track';

const API_SOURCES: Record<string, string> = {
  'qijieya': 'https://api.qijieya.cn/meting/',
  'mikus': 'https://meting.mikus.ink/api'
};

function buildUrl(source: string, id: string): string {
  if (source === 'mikus') {
    return `${API_SOURCES.mikus}?server=netease&type=playlist&id=${id}`;
  }
  return `${API_SOURCES.qijieya}?type=playlist&id=${id}`;
}

function normalizeUrl(path: string, source: string): string {
  if (!path) return '';
  if (path.indexOf('http://') === 0 || path.indexOf('https://') === 0) {
    return path;
  }
  const baseUrl = API_SOURCES[source] || API_SOURCES.qijieya;
  let origin = '';
  try {
    const parts = baseUrl.split('/');
    if (parts.length >= 3) {
      origin = parts[0] + '//' + parts[2];
    }
  } catch (e) {
    // ignore
  }

  if (path.indexOf('/') === 0) {
    return origin + path;
  }
  const separator = baseUrl.lastIndexOf('/') === baseUrl.length - 1 ? '' : '/';
  return baseUrl + separator + path;
}

export class ApiClient {
  private static instance: ApiClient | null = null;

  private constructor() {}

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  // Fetch playlist with failover mechanism
  async fetchPlaylist(playlistId: string, primarySource: string): Promise<Track[]> {
    const sourcesToTry = [primarySource, primarySource === 'qijieya' ? 'mikus' : 'qijieya'];

    for (const source of sourcesToTry) {
      const url = buildUrl(source, playlistId);
      console.info(`[ApiClient] Trying to fetch playlist from: ${url}`);
      
      const httpClient = http.createHttp();
      try {
        const response = await httpClient.request(url, {
          method: http.RequestMethod.GET,
          header: { 'Content-Type': 'application/json' },
          connectTimeout: 6000,
          readTimeout: 12000
        });

        if (response.responseCode === 200) {
          const resStr = response.result as string;
          const jsonArr = JSON.parse(resStr) as Record<string, string>[];
          
          if (Array.isArray(jsonArr) && jsonArr.length > 0) {
            console.info(`[ApiClient] Successfully fetched playlist from source: ${source}`);
            return jsonArr.map((item, index) => {
              const nameVal = item.name || item.title || '未知歌名';
              const artistVal = item.artist || item.author || '未知歌手';
              const songUrl = normalizeUrl(item.url || '', source);
              const picUrl = normalizeUrl(item.pic || '', source);
              const lrcUrl = normalizeUrl(item.lrc || '', source);

              return {
                id: (index + 1).toString(),
                title: nameVal,
                artist: artistVal,
                cover: picUrl,
                url: songUrl,
                lrc: lrcUrl,
                duration: 0
              } as Track;
            });
          }
        }
      } catch (err) {
        console.warn(`[ApiClient] Source ${source} failed:`, JSON.stringify(err));
      } finally {
        httpClient.destroy();
      }
    }

    throw new Error('All API sources failed to retrieve playlist');
  }

  // Fetch lyric content directly
  async fetchLyric(lrcUrl: string): Promise<string> {
    if (!lrcUrl) return '';
    console.info(`[ApiClient] Fetching lyric from: ${lrcUrl}`);
    
    const httpClient = http.createHttp();
    try {
      const response = await httpClient.request(lrcUrl, {
        method: http.RequestMethod.GET,
        connectTimeout: 5000,
        readTimeout: 10000
      });
      if (response.responseCode === 200) {
        return response.result as string;
      }
    } catch (err) {
      console.warn(`[ApiClient] Failed to fetch lyric:`, JSON.stringify(err));
    } finally {
      httpClient.destroy();
    }
    return '';
  }
}
