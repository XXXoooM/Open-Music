import { Track } from '../model/Track';
import { PlaybackManager } from '../playback/PlaybackManager';
import { hslToColor } from '../utils/ThemeHelper';

@Component
export struct PlayerPage {
  @StorageLink('currentTrack') currentTrack: Track | null = null;
  @StorageLink('isPlaying') isPlaying: boolean = false;
  @StorageLink('currentTime') currentTime: number = 0;
  @StorageLink('duration') duration: number = 0;
  @StorageLink('themeHue') themeHue: number = 180;
  @StorageLink('playMode') playMode: string = 'list';

  @State rotationAngle: number = 0;
  @State volume: number = 80;
  private rotateTimer: number = -1;

  aboutToAppear() {
    this.rotateTimer = setInterval(() => {
      if (this.isPlaying) {
        this.rotationAngle = (this.rotationAngle + 1) % 360;
      }
    }, 40);
  }

  aboutToDisappear() {
    if (this.rotateTimer !== -1) {
      clearInterval(this.rotateTimer);
    }
  }

  // Format time (seconds -> mm:ss)
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Cycle play mode
  cyclePlayMode(): void {
    const manager = PlaybackManager.getInstance();
    if (this.playMode === 'list') {
      manager.setPlayMode('single');
    } else if (this.playMode === 'single') {
      manager.setPlayMode('random');
    } else {
      manager.setPlayMode('list');
    }
  }

  getModeIcon(): string {
    if (this.playMode === 'single') return '🔂';
    if (this.playMode === 'random') return '🔀';
    return '🔁';
  }

  getModeText(): string {
    if (this.playMode === 'single') return '单曲循环';
    if (this.playMode === 'random') return '随机播放';
    return '列表循环';
  }

  build() {
    Column() {
      // 1. Top Cover / Album Disc Art Area
      Column() {
        Stack() {
          // Inner vinyl circle frame
          Circle()
            .width(280)
            .height(280)
            .fill('#11131E')
            .stroke('#222538')
            .strokeWidth(6)

          // Rotating Album cover
          Image(this.currentTrack ? this.currentTrack.cover : '')
            .width(180)
            .height(180)
            .borderRadius(90)
            .rotate({ angle: this.rotationAngle })
            .objectFit(ImageFit.Cover)
            .backgroundColor('#1A1C28')
            
          // Inner center spindle pin hole
          Circle()
            .width(36)
            .height(36)
            .fill('#0A0B10')
            .stroke('#2F334E')
            .strokeWidth(3)
        }
        .width(300)
        .height(300)
        .margin({ top: 40, bottom: 24 })
      }
      .width('100%')
      .alignItems(HorizontalAlign.Center)

      // 2. Track Title and Artist Meta details
      Column() {
        Text(this.currentTrack ? this.currentTrack.title : '未播放音频')
          .fontSize(22)
          .fontWeight(FontWeight.Bold)
          .fontColor('#FFFFFF')
          .maxLines(1)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
          .margin({ bottom: 8 })

        Text(this.currentTrack ? this.currentTrack.artist : '未知歌手')
          .fontSize(16)
          .fontColor('#8F93A5')
          .maxLines(1)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
      }
      .width('90%')
      .alignItems(HorizontalAlign.Center)
      .margin({ bottom: 32 })

      // 3. Playback Progress Slider
      Column() {
        Row() {
          Text(this.formatTime(this.currentTime))
            .fontSize(12)
            .fontColor('#8F93A5')

          Slider({
            value: this.currentTime,
            min: 0,
            max: this.duration || 1,
            step: 1,
            style: SliderStyle.OutSet
          })
            .layoutWeight(1)
            .trackColor('#1C1E2A')
            .selectedColor(hslToColor(this.themeHue, 92, 68))
            .blockColor(hslToColor(this.themeHue, 92, 68))
            .trackThickness(4)
            .margin({ left: 10, right: 10 })
            .onChange((value: number, mode: SliderChangeMode) => {
              if (mode === SliderChangeMode.End || mode === SliderChangeMode.Moving) {
                PlaybackManager.getInstance().seek(value);
              }
            })

          Text(this.formatTime(this.duration))
            .fontSize(12)
            .fontColor('#8F93A5')
        }
        .width('90%')
        .alignItems(VerticalAlign.Center)
      }
      .width('100%')
      .margin({ bottom: 24 })

      // 4. Primary Playback Buttons Controller
      Row() {
        // Play Mode Selector
        Button() {
          Text(this.getModeIcon())
            .fontSize(20)
            .fontColor('#FFFFFF')
        }
        .width(44)
        .height(44)
        .backgroundColor('transparent')
        .onClick(() => this.cyclePlayMode())

        Blank().width(24)

        // Previous Button
        Button() {
          Text('⏮')
            .fontSize(24)
            .fontColor('#FFFFFF')
        }
        .width(52)
        .height(52)
        .backgroundColor('transparent')
        .onClick(() => PlaybackManager.getInstance().playPrevious())

        Blank().width(20)

        // Play/Pause Button
        Button() {
          Text(this.isPlaying ? '⏸' : '▶')
            .fontSize(32)
            .fontColor('#0A0B10')
            .margin({ left: this.isPlaying ? 0 : 4 }) // adjust centering for play arrow
        }
        .width(72)
        .height(72)
        .borderRadius(36)
        .backgroundColor('#FFFFFF')
        .shadow({ radius: 10, color: 'rgba(0, 0, 0, 0.3)' })
        .onClick(() => {
          if (this.isPlaying) {
            PlaybackManager.getInstance().pause();
          } else {
            PlaybackManager.getInstance().play();
          }
        })

        Blank().width(20)

        // Next Button
        Button() {
          Text('⏭')
            .fontSize(24)
            .fontColor('#FFFFFF')
        }
        .width(52)
        .height(52)
        .backgroundColor('transparent')
        .onClick(() => PlaybackManager.getInstance().playNext())

        Blank().width(24)

        // Indicator showing current Mode
        Column() {
          Text(this.getModeText())
            .fontSize(11)
            .fontColor('#8F93A5')
        }
        .width(52)
      }
      .width('90%')
      .justifyContent(FlexAlign.Center)
      .margin({ bottom: 36 })

      // 5. Volume Slider Controller
      Row() {
        Text('🔈')
          .fontSize(14)
          .fontColor('#8F93A5')

        Slider({
          value: this.volume,
          min: 0,
          max: 100,
          style: SliderStyle.InSet
        })
          .layoutWeight(1)
          .trackColor('#1C1E2A')
          .selectedColor(hslToColor(this.themeHue, 50, 45))
          .trackThickness(6)
          .margin({ left: 12, right: 12 })
          .onChange((value: number) => {
            this.volume = value;
            PlaybackManager.getInstance().setVolume(value / 100);
          })

        Text('🔊')
          .fontSize(14)
          .fontColor('#8F93A5')
      }
      .width('80%')
      .alignItems(VerticalAlign.Center)
    }
    .width('100%')
    .height('100%')
    .padding({ bottom: 40 })
    .linearGradient({
      angle: 180,
      colors: [
        [hslToColor(this.themeHue, 22, 10), 0.0],
        ['#06070a', 1.0]
      ]
    })
  }
}
