import { WeatherSnapshot, Precipitation } from '@/domain';

export class WeatherMapper {
  /**
   * Converts Open-Meteo current weather response to WeatherSnapshot.
   *
   * @param response - The Open-Meteo API response
   * @returns WeatherSnapshot with mapped values
   */
  static mapToWeatherSnapshot(response: OpenMeteoResponse): WeatherSnapshot {
    const current = response.current;

    return {
      tempC: current.temperature_2m,
      precipitationMm: current.precipitation,
      precipitationType: this.derivePrecipitationType(
        current.precipitation,
        current.temperature_2m,
        current.weather_code
      ),
      windKph: current.wind_speed_10m,
      timeISO: current.time,
    };
  }

  /**
   * Derives precipitation type based on precipitation amount, temperature, and weather code.
   *
   * @param precipitationMm - Precipitation in millimeters
   * @param tempC - Temperature in Celsius
   * @param weatherCode - Open-Meteo weather code
   * @returns Precipitation type enum
   */
  private static derivePrecipitationType(
    precipitationMm: number,
    tempC: number,
    weatherCode: number
  ): Precipitation {
    if (precipitationMm < 0.1) {
      return Precipitation.none;
    }

    if (tempC <= 0 || (weatherCode >= 71 && weatherCode <= 77) || weatherCode === 85 || weatherCode === 86) {
      return Precipitation.snow;
    }

    return Precipitation.rain;
  }
}

interface OpenMeteoResponse {
  current: {
    time: string;
    temperature_2m: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
  };
}
