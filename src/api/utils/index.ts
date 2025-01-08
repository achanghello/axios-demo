import type { InternalAxiosRequestConfig } from "axios";
import qs from "qs";

/**
 * Generates a unique identifier for a request based on its properties
 * @param config - Axios request configuration
 * @returns Unique request identifier string
 */
export const generateRequestKey = (config: InternalAxiosRequestConfig): string => {
  return [
    config.method,
    config.url,
    stringifyParams(config.data),
    stringifyParams(config.params),
  ].join("&");
};

/**
 * Converts parameters to sorted query string for consistent request identification
 * @param params - Request parameters
 * @returns Sorted query string
 */
const stringifyParams = (params: any): string => {
  if (!params) return "";
  return qs.stringify(params, {
    arrayFormat: "repeat",
    sort: (a: string, b: string) => a.localeCompare(b),
  });
};
