interface RetryAsyncOptions<TError = unknown> {
  retries: number;
  initialDelayMs: number;
  shouldRetry?: (error: TError, attempt: number) => boolean;
  onRetry?: (error: TError, attempt: number, delayMs: number) => void;
  sleep?: (delayMs: number) => Promise<void>;
}

function defaultSleep(delayMs: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

export async function retryAsync<TResult, TError = unknown>(
  operation: (attempt: number) => Promise<TResult>,
  options: RetryAsyncOptions<TError>,
): Promise<TResult> {
  let attempt = 1;

  while (true) {
    try {
      return await operation(attempt);
    } catch (error) {
      const typedError = error as TError;
      const shouldRetry = options.shouldRetry?.(typedError, attempt) ?? true;

      if (!shouldRetry || attempt > options.retries) {
        throw error;
      }

      const delayMs = options.initialDelayMs * 2 ** (attempt - 1);
      options.onRetry?.(typedError, attempt, delayMs);
      await (options.sleep ?? defaultSleep)(delayMs);
      attempt += 1;
    }
  }
}
