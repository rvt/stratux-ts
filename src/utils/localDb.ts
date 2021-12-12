/* eslint-disable class-methods-use-this */
/* eslint-env es6 */
import {
  defaultStratuxConnectionConfig,
  StratuxConnectionConfig,
} from './models/StratuxConnectionConfig.js';
import 'localforage';

// @ts-ignore
const localForage = localforage; // eslint-disable-line

export class LocalSettingsService {
  public getStratuxConnectionConfig(): Promise<StratuxConnectionConfig> {
    return localForage
      .getItem<StratuxConnectionConfig>('stratuxConnectionConfig')
      .then((e: StratuxConnectionConfig) =>
        !e ? defaultStratuxConnectionConfig : e
      );
  }

  public storeStratuxConnectionConfig(
    config: StratuxConnectionConfig
  ): Promise<StratuxConnectionConfig> {
    return localForage.setItem('stratuxConnectionConfig', config);
  }
}

// Readiness design pattern? https://stackoverflow.com/questions/35743426/async-constructor-functions-in-typescript

export const localSettingsService: LocalSettingsService =
  new LocalSettingsService();
// await localSettingsService.initDatabase();
