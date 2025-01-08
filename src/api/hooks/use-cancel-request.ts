import type { InternalAxiosRequestConfig } from "axios";
import { generateRequestKey } from "../utils";

/**
 * Map to store pending request controllers
 * Key: Unique request identifier
 * Value: AbortController instance
 */
const cancelerMap = new Map<string, AbortController>();

/**
 * Adds a new request to the pending requests map
 * @param config - Axios request configuration
 */
const addPendingRequest = (config: InternalAxiosRequestConfig): void => {
  removePendingRequest(config);
  const requestKey = generateRequestKey(config);
  const controller = new AbortController();
  config.signal = controller.signal;
  cancelerMap.set(requestKey, controller);
};

/**
 * Removes a pending request and aborts it if it exists
 * @param config - Axios request configuration
 */
const removePendingRequest = (config: InternalAxiosRequestConfig): void => {
  const requestKey = generateRequestKey(config);
  const controller = cancelerMap.get(requestKey);
  if (controller) {
    controller.abort();
    cancelerMap.delete(requestKey);
  }
};

/**
 * Removes all pending requests by aborting them
 */
const removeAllPendingRequests = (): void => {
  cancelerMap.forEach((controller) => {
    controller.abort();
  });
  cancelerMap.clear();
};

/**
 * Hook for managing axios request cancellation
 * @returns Object containing request cancellation utilities
 */
export const useCancelRequest = () => ({
  addPendingRequest,
  removePendingRequest,
  removeAllPendingRequests,
});
