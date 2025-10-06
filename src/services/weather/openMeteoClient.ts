import { WeatherSnapshot } from '@/domain';
import { WeatherMapper } from './WeatherMapper';

export class WeatherApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: Response
  ) {
    super(message);
    this.name = 'WeatherApiError';
  }
}

export class OpenMeteoClient {
  private static readonly BASE_URL = 'https://api.open-meteo.com/v1/forecast';

  /**
   * Fetches current weather data for the specified coordinates.
   *
   * @param lat - Latitude coordinate
   * @param lon - Longitude coordinate
   * @returns Promise<WeatherSnapshot> - Current weather data mapped to our domain type
   * @throws WeatherApiError - When API request fails or returns non-ok response
   */
  static async getCurrentWeather(lat: number, lon: number): Promise<WeatherSnapshot> {
    try {
      // Construct API URL with required parameters
      const url = new URL(this.BASE_URL);
      url.searchParams.set('latitude', lat.toString());
      url.searchParams.set('longitude', lon.toString());
      url.searchParams.set('current', 'temperature_2m,precipitation,weather_code,wind_speed_10m');
      url.searchParams.set('wind_speed_unit', 'kmh');
      url.searchParams.set('precipitation_unit', 'mm');
      url.searchParams.set('timezone', 'auto');

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new WeatherApiError(
          `Open-Meteo API request failed: ${response.status} ${response.statusText}`,
          response.status,
          response
        );
      }

      const data = await response.json();

      if (!data.current) {
        throw new WeatherApiError('Invalid response format: missing current weather data');
      }

      return WeatherMapper.mapToWeatherSnapshot(data);

    } catch (error) {
      if (error instanceof WeatherApiError) {
        throw error;
      }

      throw new WeatherApiError(
        `Failed to fetch weather data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        undefined
      );
    }
  }
}
