import { LightState } from '@video-light-sync/core';

export interface LightAdapter {
  name: string;
  init?(): Promise<void>;
  sync(state: LightState): Promise<void>;
}
