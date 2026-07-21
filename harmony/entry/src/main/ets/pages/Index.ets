import { PlaylistPage } from './PlaylistPage';
import { PlayerPage } from './PlayerPage';
import { SettingsPage } from './SettingsPage';
import { ApiClient } from '../network/ApiClient';
import { PlaybackManager } from '../playback/PlaybackManager';
import { hslToColor } from '../utils/ThemeHelper';
import { Track } from '../model/Track';

@Entry
@Component
struct Index {
  @StorageLink('themeHue') themeHue: number = 180;
  @State selectedIndex: number = 0;

  private tabController: TabsController = new TabsController();

  async aboutToAppear() {
    // Load default playlist on startup if no cache exists in AppStorage
    const playlist = AppStorage.get<Track[]>('playlist') || [];
    if (playlist.length === 0) {
      try {
        console.info('[Index] Loading default playlist cache...');
        const cachedId = '17910751956'; // Default netease playlist ID
        const tracks = await ApiClient.getInstance().fetchPlaylist(cachedId, 'qijieya');
        if (tracks && tracks.length > 0) {
          await PlaybackManager.getInstance().setPlaylist(tracks, 0);
        }
      } catch (e) {
        console.error('[Index] Failed to auto-load default playlist', JSON.stringify(e));
      }
    }
  }

  build() {
    Column() {
      Tabs({ barPosition: BarPosition.End, controller: this.tabController }) {
        TabContent() {
          PlaylistPage()
        }
        .tabBar(this.TabBuilder('音乐馆', 0, '🎵'))

        TabContent() {
          PlayerPage()
        }
        .tabBar(this.TabBuilder('播放器', 1, '💿'))

        TabContent() {
          SettingsPage()
        }
        .tabBar(this.TabBuilder('设置', 2, '⚙️'))
      }
      .width('100%')
      .layoutWeight(1)
      .backgroundColor('#0A0B10')
      .barHeight(58)
      .barWidth('100%')
      .onChange((index: number) => {
        this.selectedIndex = index;
      })
    }
    .width('100%')
    .height('100%')
    .padding({ top: 38 }) // Immersive status bar height padding spacing offset
    .backgroundColor('#0A0B10')
  }

  @Builder
  TabBuilder(title: string, index: number, icon: string) {
    Column() {
      Text(icon)
        .fontSize(20)
        .margin({ bottom: 4 })
        .fontColor(this.selectedIndex === index ? hslToColor(this.themeHue, 92, 68) : '#8F93A5')
      
      Text(title)
        .fontSize(12)
        .fontColor(this.selectedIndex === index ? hslToColor(this.themeHue, 92, 68) : '#8F93A5')
        .fontWeight(this.selectedIndex === index ? FontWeight.Medium : FontWeight.Normal)
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
    .backgroundColor('#0E0F18')
  }
}
