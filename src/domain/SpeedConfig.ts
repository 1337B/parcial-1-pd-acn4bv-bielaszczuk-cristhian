import { Surface } from './Road';
import { DayPeriod } from './Weather';

export interface SpeedConfig {
  baseSpeedLimit: number;
  surface: Surface;
  dayPeriod: DayPeriod;
  enableExternalWeather: boolean;
}
