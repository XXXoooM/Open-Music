import { UIAbility, Want, AbilityConstant } from '@kit.AbilityKit';
import { window } from '@kit.ArkUI';
import { BusinessError } from '@kit.BasicServicesKit';
import { PlaybackManager } from '../playback/PlaybackManager';

export default class EntryAbility extends UIAbility {
  onCreate(want: Want, launchParam: AbilityConstant.LaunchParam) {
    console.info('[EntryAbility] onCreate');
  }

  async onDestroy() {
    console.info('[EntryAbility] onDestroy');
    await PlaybackManager.getInstance().release();
  }

  onWindowStageCreate(windowStage: window.WindowStage) {
    console.info('[EntryAbility] onWindowStageCreate');

    // Initialize PlaybackManager with ability context
    PlaybackManager.getInstance().init(this.context);

    // Set full-screen display layout
    windowStage.getMainWindow().then((win: window.Window) => {
      win.setWindowLayoutFullScreen(true).then(() => {
        win.setWindowSystemBarProperties({
          statusBarColor: '#00000000',
          isStatusBarLightIcon: true
        }).catch((err: BusinessError) => {
          console.error(`[EntryAbility] setWindowSystemBarProperties failed: ${err.code} - ${err.message}`);
        });
      }).catch((err: BusinessError) => {
        console.error(`[EntryAbility] setWindowLayoutFullScreen failed: ${err.code} - ${err.message}`);
      });
    }).catch((err: BusinessError) => {
      console.error(`[EntryAbility] getMainWindow failed: ${err.code} - ${err.message}`);
    });

    windowStage.loadContent('pages/Index', (err: BusinessError) => {
      if (err.code) {
        console.error(`[EntryAbility] Failed to load content. Cause: ${JSON.stringify(err)}`);
        return;
      }
      console.info('[EntryAbility] Content loaded successfully.');
    });
  }

  onWindowStageDestroy() {
    console.info('[EntryAbility] onWindowStageDestroy');
  }

  onForeground() {
    console.info('[EntryAbility] onForeground');
  }

  onBackground() {
    console.info('[EntryAbility] onBackground');
  }
}