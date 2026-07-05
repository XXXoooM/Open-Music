import { ApiClient } from '../network/ApiClient';
import { PreferencesHelper } from '../utils/PreferencesHelper';
import { PlaybackManager } from '../playback/PlaybackManager';
import { hslToColor } from '../utils/ThemeHelper';

interface ThemePreset {
  name: string;
  hue: number;
}

@Component
export struct SettingsPage {
  @StorageLink('themeHue') themeHue: number = 180;
  
  @State playlistInputId: string = '17910751956';
  @State selectedApi: string = 'qijieya';
  @State isHslEnabled: boolean = true;
  @State isLoading: boolean = false;
  @State statusMsg: string = '';

  private presets: ThemePreset[] = [
    { name: '经典青色', hue: 180 },
    { name: '优雅紫色', hue: 270 },
    { name: '深邃蓝色', hue: 210 },
    { name: '时尚粉色', hue: 330 },
    { name: '活力橙色', hue: 30 },
    { name: '护眼绿色', hue: 120 }
  ];

  async aboutToAppear() {
    // Load config states from Preferences
    const api = await PreferencesHelper.getInstance().getString('om-apisource', 'qijieya');
    this.selectedApi = api;

    const savedId = await PreferencesHelper.getInstance().getString('om-playlistid', '17910751956');
    this.playlistInputId = savedId;

    const hsl = await PreferencesHelper.getInstance().getBoolean('om-hslenabled', true);
    this.isHslEnabled = hsl;
  }

  async loadPlaylistData() {
    if (!this.playlistInputId.trim()) {
      this.statusMsg = '请输入有效的歌单 ID！';
      return;
    }
    this.isLoading = true;
    this.statusMsg = '载入中，请稍候...';
    try {
      const tracks = await ApiClient.getInstance().fetchPlaylist(
        this.playlistInputId,
        this.selectedApi
      );
      if (tracks && tracks.length > 0) {
        await PreferencesHelper.getInstance().putString('om-playlistid', this.playlistInputId);
        await PlaybackManager.getInstance().setPlaylist(tracks, 0);
        this.statusMsg = `成功载入 ${tracks.length} 首歌曲！`;
      } else {
        this.statusMsg = '未能获取到有效歌曲。';
      }
    } catch (e) {
      this.statusMsg = '载入失败，请切换 API 线路重试。';
      console.error('[SettingsPage] Error loading playlist', JSON.stringify(e));
    } finally {
      this.isLoading = false;
    }
  }

  async toggleHsl(enabled: boolean) {
    this.isHslEnabled = enabled;
    await PreferencesHelper.getInstance().putBoolean('om-hslenabled', enabled);
    if (!enabled) {
      // Restore default hue when HSL is disabled
      const defaultHue = await PreferencesHelper.getInstance().getNumber('om-defaulthue', 180);
      AppStorage.setOrCreate('themeHue', defaultHue);
    } else {
      // Recalculate based on current track if playing
      const currentTrack = AppStorage.get<any>('currentTrack');
      if (currentTrack) {
        const hash = getSongHashColor(currentTrack.title, currentTrack.artist);
        AppStorage.setOrCreate('themeHue', hash);
      }
    }
  }

  async selectPresetTheme(hue: number) {
    await PreferencesHelper.getInstance().putNumber('om-defaulthue', hue);
    await this.toggleHsl(false); // Select preset theme disables auto HSL
    AppStorage.setOrCreate('themeHue', hue);
    this.statusMsg = '主题已切换为预设色彩（HSL 律动已自动关闭）';
  }

  async setApiSource(source: string) {
    this.selectedApi = source;
    await PreferencesHelper.getInstance().putString('om-apisource', source);
  }

  build() {
    Scroll() {
      Column() {
        Text('系统设置')
          .fontSize(24)
          .fontWeight(FontWeight.Bold)
          .fontColor('#FFFFFF')
          .margin({ top: 32, bottom: 24 })
          .width('90%')

        // 1. NetEase Playlist Loading Card
        Column() {
          Text('网易云歌单载入')
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .fontColor('#FFFFFF')
            .margin({ bottom: 12 })

          Row() {
            TextInput({ text: this.playlistInputId, placeholder: '输入网易云歌单 ID' })
              .placeholderColor('#666666')
              .placeholderFont({ size: 14 })
              .backgroundColor('#0A0B10')
              .fontColor('#FFFFFF')
              .height(44)
              .layoutWeight(1)
              .borderRadius(8)
              .margin({ right: 10 })
              .onChange((value: string) => {
                this.playlistInputId = value;
              })

            Button() {
              if (this.isLoading) {
                LoadingProgress()
                  .width(20)
                  .height(20)
                  .color('#0A0B10')
              } else {
                Text('载入')
                  .fontSize(14)
                  .fontWeight(FontWeight.Medium)
                  .fontColor('#0A0B10')
              }
            }
            .width(72)
            .height(44)
            .borderRadius(8)
            .backgroundColor(hslToColor(this.themeHue, 92, 68))
            .onClick(() => this.loadPlaylistData())
          }
          .width('100%')

          if (this.statusMsg) {
            Text(this.statusMsg)
              .fontSize(13)
              .fontColor(hslToColor(this.themeHue, 60, 60))
              .margin({ top: 10 })
          }
        }
        .width('90%')
        .padding(16)
        .backgroundColor('#141622')
        .borderRadius(12)
        .margin({ bottom: 20 })
        .alignItems(HorizontalAlign.Start)

        // 2. API Server Selection Card
        Column() {
          Text('API 接口线路选择')
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .fontColor('#FFFFFF')
            .margin({ bottom: 16 })

          Row() {
            Button() {
              Text('线路一 (qijieya)')
                .fontSize(14)
                .fontColor(this.selectedApi === 'qijieya' ? '#0A0B10' : '#FFFFFF')
            }
            .layoutWeight(1)
            .height(40)
            .borderRadius(6)
            .backgroundColor(this.selectedApi === 'qijieya' ? hslToColor(this.themeHue, 92, 68) : '#1E2132')
            .onClick(() => this.setApiSource('qijieya'))
            .margin({ right: 10 })

            Button() {
              Text('线路二 (mikus)')
                .fontSize(14)
                .fontColor(this.selectedApi === 'mikus' ? '#0A0B10' : '#FFFFFF')
            }
            .layoutWeight(1)
            .height(40)
            .borderRadius(6)
            .backgroundColor(this.selectedApi === 'mikus' ? hslToColor(this.themeHue, 92, 68) : '#1E2132')
            .onClick(() => this.setApiSource('mikus'))
          }
          .width('100%')
        }
        .width('90%')
        .padding(16)
        .backgroundColor('#141622')
        .borderRadius(12)
        .margin({ bottom: 20 })
        .alignItems(HorizontalAlign.Start)

        // 3. Ambient HSL Color Settings Card
        Column() {
          Row() {
            Text('环境自适应 HSL 变色')
              .fontSize(16)
              .fontWeight(FontWeight.Medium)
              .fontColor('#FFFFFF')

            Toggle({ type: ToggleType.Switch, isOn: this.isHslEnabled })
              .selectedColor(hslToColor(this.themeHue, 92, 68))
              .onChange((isOn: boolean) => this.toggleHsl(isOn))
          }
          .width('100%')
          .justifyContent(FlexAlign.SpaceBetween)
          .margin({ bottom: 12 })

          Text('开启后，播放页面背景和高亮色彩将根据当前歌曲封面的哈希自动计算，呈现极致的环境光效果。')
            .fontSize(13)
            .fontColor('#8F93A5')
            .lineHeight(18)
        }
        .width('90%')
        .padding(16)
        .backgroundColor('#141622')
        .borderRadius(12)
        .margin({ bottom: 20 })

        // 4. Preset Theme Colors Grid
        Column() {
          Text('主题预设色彩')
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .fontColor('#FFFFFF')
            .margin({ bottom: 16 })

          Grid() {
            ForEach(this.presets, (preset: ThemePreset) => {
              GridItem() {
                Column() {
                  Circle()
                    .width(40)
                    .height(40)
                    .fill(hslToColor(preset.hue, 92, 68))
                    .stroke(this.themeHue === preset.hue && !this.isHslEnabled ? '#FFFFFF' : 'transparent')
                    .strokeWidth(3)
                    .margin({ bottom: 6 })

                  Text(preset.name)
                    .fontSize(11)
                    .fontColor('#FFFFFF')
                }
                .onClick(() => this.selectPresetTheme(preset.hue))
              }
            }, (preset: ThemePreset) => preset.name)
          }
          .columnsTemplate('1fr 1fr 1fr')
          .rowsGap(16)
          .height(160)
          .width('100%')
        }
        .width('90%')
        .padding(16)
        .backgroundColor('#141622')
        .borderRadius(12)
        .margin({ bottom: 40 })
        .alignItems(HorizontalAlign.Start)
      }
      .width('100%')
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#0A0B10')
  }
}

// Simple helper function duplicated locally to avoid circular import issues
function getSongHashColor(title: string, artist: string): number {
  let hash = 0;
  const str = title + artist;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}
