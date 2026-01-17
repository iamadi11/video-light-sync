import { LightState } from '@video-light-sync/core';

export interface LightAdapter {
  id: string;
  name: string;
  type: string;
  init?(): Promise<void>;
  sync(state: LightState): Promise<void>;
}
