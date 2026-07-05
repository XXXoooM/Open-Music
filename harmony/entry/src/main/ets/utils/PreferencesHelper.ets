import { preferences } from '@kit.ArkData';
import { common } from '@kit.AbilityKit';

export class PreferencesHelper {
  private static instance: PreferencesHelper | null = null;
  private prefStore: preferences.Preferences | null = null;

  private constructor() {}

  static getInstance(): PreferencesHelper {
    if (!PreferencesHelper.instance) {
      PreferencesHelper.instance = new PreferencesHelper();
    }
    return PreferencesHelper.instance;
  }

  async init(context: common.Context): Promise<void> {
    if (this.prefStore) return;
    try {
      this.prefStore = await preferences.getPreferences(context, 'open_music_preferences');
      console.info('[PreferencesHelper] preferences store initialized successfully');
    } catch (e) {
      console.error('[PreferencesHelper] Failed to init preferences', JSON.stringify(e));
    }
  }

  async getString(key: string, defaultValue: string): Promise<string> {
    if (!this.prefStore) return defaultValue;
    return (await this.prefStore.get(key, defaultValue)) as string;
  }

  async putString(key: string, value: string): Promise<void> {
    if (!this.prefStore) return;
    await this.prefStore.put(key, value);
    await this.prefStore.flush();
  }

  async getNumber(key: string, defaultValue: number): Promise<number> {
    if (!this.prefStore) return defaultValue;
    return (await this.prefStore.get(key, defaultValue)) as number;
  }

  async putNumber(key: string, value: number): Promise<void> {
    if (!this.prefStore) return;
    await this.prefStore.put(key, value);
    await this.prefStore.flush();
  }

  async getBoolean(key: string, defaultValue: boolean): Promise<boolean> {
    if (!this.prefStore) return defaultValue;
    return (await this.prefStore.get(key, defaultValue)) as boolean;
  }

  async putBoolean(key: string, value: boolean): Promise<void> {
    if (!this.prefStore) return;
    await this.prefStore.put(key, value);
    await this.prefStore.flush();
  }

  async delete(key: string): Promise<void> {
    if (!this.prefStore) return;
    await this.prefStore.delete(key);
    await this.prefStore.flush();
  }
}
