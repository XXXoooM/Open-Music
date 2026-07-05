import { Track } from '../model/Track';
import { PlaybackManager } from '../playback/PlaybackManager';
import { hslToColor } from '../utils/ThemeHelper';

@Component
export struct PlaylistPage {
  @StorageLink('playlist') playlist: Track[] = [];
  @StorageLink('currentTrack') currentTrack: Track | null = null;
  @StorageLink('isPlaying') isPlaying: boolean = false;
  @StorageLink('themeHue') themeHue: number = 180;
  
  @State searchQuery: string = '';
  @State barHeights: number[] = [6, 12, 8];
  private timerId: number = -1;

  aboutToAppear() {
    this.timerId = setInterval(() => {
      if (this.isPlaying) {
        this.barHeights = [
          Math.floor(Math.random() * 14) + 4,
          Math.floor(Math.random() * 14) + 4,
          Math.floor(Math.random() * 14) + 4
        ];
      } else {
        this.barHeights = [6, 6, 6];
      }
    }, 150);
  }

  aboutToDisappear() {
    if (this.timerId !== -1) {
      clearInterval(this.timerId);
    }
  }

  // Filter track list based on search query
  getFilteredTracks(): Track[] {
    if (!this.searchQuery.trim()) {
      return this.playlist;
    }
    const query = this.searchQuery.toLowerCase();
    return this.playlist.filter(t => 
      t.title.toLowerCase().includes(query) || 
      t.artist.toLowerCase().includes(query)
    );
  }

  build() {
    Column() {
      // 1. Search Bar Header
      Row() {
        TextInput({ placeholder: '搜索歌单内歌曲/歌手...', text: this.searchQuery })
          .placeholderColor('#666666')
          .placeholderFont({ size: 14 })
          .caretColor(hslToColor(this.themeHue, 92, 68))
          .backgroundColor('#1A1C28')
          .fontColor('#FFFFFF')
          .height(44)
          .layoutWeight(1)
          .borderRadius(22)
          .onChange((value: string) => {
            this.searchQuery = value;
          })
      }
      .width('100%')
      .padding({ left: 16, right: 16, top: 12, bottom: 12 })
      .backgroundColor('#0A0B10')

      // 2. Track List View
      if (this.getFilteredTracks().length === 0) {
        Column() {
          Text('歌单空空如也，请在设置中载入歌单~')
            .fontSize(14)
            .fontColor('#606060')
            .margin({ top: 80 })
        }
        .width('100%')
        .layoutWeight(1)
      } else {
        List() {
          ForEach(this.getFilteredTracks(), (track: Track, index: number) => {
            ListItem() {
              this.buildTrackItem(track, index)
            }
          }, (track: Track) => track.id + track.title)
        }
        .width('100%')
        .layoutWeight(1)
        .divider({ strokeWidth: 0.5, color: '#1F2232', startMargin: 16, endMargin: 16 })
      }
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#0A0B10')
  }

  @Builder
  buildTrackItem(track: Track, index: number) {
    const isCurrent = this.currentTrack !== null && this.currentTrack.id === track.id;
    
    Row() {
      // Left index or EQ bars
      Stack() {
        if (isCurrent) {
          Row({ space: 2 }) {
            ForEach(this.barHeights, (height: number) => {
              Rect()
                .width(3)
                .height(height)
                .fill(hslToColor(this.themeHue, 92, 68))
                .borderRadius(1.5)
            }, (h: number, idx) => idx.toString() + h.toString())
          }
          .alignItems(VerticalAlign.Bottom)
          .height(20)
        } else {
          Text((index + 1).toString())
            .fontSize(14)
            .fontColor('#606060')
            .textAlign(TextAlign.Center)
        }
      }
      .width(36)
      .justifyContent(FlexAlign.Center)

      // Cover Art
      Image(track.cover || $r('app.media.layered_image')) // Fallback to app icon
        .width(44)
        .height(44)
        .borderRadius(6)
        .margin({ left: 8, right: 12 })
        .objectFit(ImageFit.Cover)

      // Meta text details
      Column() {
        Text(track.title)
          .fontSize(15)
          .fontColor(isCurrent ? hslToColor(this.themeHue, 92, 68) : '#FFFFFF')
          .fontWeight(isCurrent ? FontWeight.Medium : FontWeight.Normal)
          .maxLines(1)
          .textOverflow(TextOverflow.Ellipsis)
          .margin({ bottom: 4 })

        Text(track.artist)
          .fontSize(13)
          .fontColor(isCurrent ? hslToColor(this.themeHue, 60, 60) : '#8F93A5')
          .maxLines(1)
          .textOverflow(TextOverflow.Ellipsis)
      }
      .alignItems(HorizontalAlign.Start)
      .layoutWeight(1)

    }
    .width('100%')
    .padding({ left: 12, right: 16, top: 12, bottom: 12 })
    .backgroundColor(isCurrent ? '#141622' : 'transparent')
    .onClick(() => {
      const realIndex = this.playlist.findIndex(t => t.id === track.id);
      PlaybackManager.getInstance().setPlaylist(this.playlist, realIndex >= 0 ? realIndex : 0);
    })
  }
}
