/**
 * Configuration management
 * Loads and validates environment variables
 * Note: Bun automatically loads .env files
 */

export interface Config {
  calcom: {
    apiKey: string;
    baseUrl: string;
    apiVersion: string;
  };
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const appConfig: Config = {
  calcom: {
    apiKey: getEnvVar('CALCOM_API_KEY'),
    baseUrl: getEnvVar('CALCOM_API_BASE_URL', 'https://api.cal.com/v2'),
    apiVersion: getEnvVar('CALCOM_API_VERSION', '2024-06-11'),
  },
};
