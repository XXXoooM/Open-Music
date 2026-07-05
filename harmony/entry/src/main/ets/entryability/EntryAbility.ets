import { UIAbility, Want, AbilityConstant } from '@kit.AbilityKit';
import { window } from '@kit.ArkUI';
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
    windowStage.getMainWindow().then((win) => {
      win.setWindowLayoutFullScreen(true).then(() => {
        win.setWindowSystemBarProperties({
          statusBarColor: '#00000000',
          statusBarContentColor: window.SystemBarContentColor.LIGHT
        });
      });
    });

    windowStage.loadContent('pages/Index', (err, data) => {
      if (err.code) {
        console.error(`[EntryAbility] Failed to load content. Cause: ${JSON.stringify(err)}`);
        return;
      }
      console.info(`[EntryAbility] Content loaded successfully. Data: ${JSON.stringify(data)}`);
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
