import { DayPeriod, Precipitation, WeatherSnapshot } from './Weather';
import { Surface } from './Road';

export class SpeedRule {
  private baseSpeedLimit: number;
  private surface: Surface;
  private dayPeriod: DayPeriod;
  private weather?: WeatherSnapshot;

  /**
   * Creates a new SpeedRule instance.
   *
   * @param baseSpeedLimit - Base speed limit in km/h
   * @param surface - Road surface type
   * @param dayPeriod - Time of day (day or night)
   * @param weather - Optional weather snapshot for advanced calculations
   */
  constructor(
    baseSpeedLimit: number,
    surface: Surface,
    dayPeriod: DayPeriod,
    weather?: WeatherSnapshot
  ) {
    this.baseSpeedLimit = baseSpeedLimit;
    this.surface = surface;
    this.dayPeriod = dayPeriod;
    this.weather = weather;
  }

  /**
   * Computes the maximum safe speed by applying various safety factors.
   *
   * @returns Maximum safe speed rounded to nearest 5 km/h
   */
  computeMaxSafeSpeed(): number {
    let speed = this.baseSpeedLimit;

    speed *= this.getSurfaceFactor();

    speed *= this.getDayPeriodFactor();

    if (this.weather) {
      speed *= this.getPrecipitationFactor();
      speed *= this.getWindFactor();
    }

    return Math.round(speed / 5) * 5;
  }

  /**
   * Gets the surface factor based on road surface type.
   *
   * @returns Surface factor multiplier
   */
  private getSurfaceFactor(): number {
    switch (this.surface) {
      case Surface.asphalt:
        return 1.0;
      case Surface.gravel:
        return 0.8;
      case Surface.dirt:
        return 0.7;
      default:
        return 1.0;
    }
  }

  /**
   * Gets the day period factor based on time of day.
   *
   * @returns Day period factor multiplier
   */
  private getDayPeriodFactor(): number {
    switch (this.dayPeriod) {
      case DayPeriod.day:
        return 1.0;
      case DayPeriod.night:
        return 0.9;
      default:
        return 1.0;
    }
  }

  /**
   * Gets the precipitation factor based on weather conditions.
   *
   * @returns Precipitation factor multiplier
   */
  private getPrecipitationFactor(): number {
    if (!this.weather) return 1.0;

    switch (this.weather.precipitationType) {
      case Precipitation.none:
        return 1.0;
      case Precipitation.rain:
        return 0.85;
      case Precipitation.snow:
        return 0.7;
      default:
        return 1.0;
    }
  }

  /**
   * Gets the wind factor based on wind speed.
   * Strong winds (>40 kph) reduce safe speed.
   *
   * @returns Wind factor multiplier
   */
  private getWindFactor(): number {
    if (!this.weather) return 1.0;

    return this.weather.windKph > 40 ? 0.9 : 1.0;
  }
}
