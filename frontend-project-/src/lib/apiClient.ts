import { logger } from './logger';

export interface ApiOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
}

export class ApiError extends Error {
  public status?: number;
  public statusText?: string;

  constructor(message: string, status?: number, statusText?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
  }
}

export async function fetchWithRetry<T>(url: string, options: ApiOptions = {}): Promise<T> {
  const {
    timeoutMs = 10000,
    retries = 2,
    retryDelayMs = 500,
    ...fetchOptions
  } = options;

  let lastError: any;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      if (attempt > 0) {
        logger.warn('ApiClient', `Retrying request to ${url} (Attempt ${attempt}/${retries})...`);
        await new Promise((r) => setTimeout(r, retryDelayMs * attempt));
      }

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
      });

      clearTimeout(timer);

      if (!response.ok) {
        throw new ApiError(`HTTP Error ${response.status}: ${response.statusText}`, response.status, response.statusText);
      }

      const data = await response.json();
      return data as T;
    } catch (err: any) {
      clearTimeout(timer);
      lastError = err;
      if (err.name === 'AbortError') {
        logger.error('ApiClient', `Request to ${url} timed out after ${timeoutMs}ms`);
      } else {
        logger.error('ApiClient', `Request failed for ${url}: ${err.message}`);
      }
    }
  }

  throw lastError || new ApiError(`Failed to fetch ${url} after ${retries} retries.`);
}
