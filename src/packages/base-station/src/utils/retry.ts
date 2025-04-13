import logger from '../logging';

interface RetryOptions {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs?: number;
  backoffFactor?: number;
  retryableErrors?: Array<string | RegExp | RetryableErrorPredicate>;
  jitter?: boolean; // Add randomness to delay to avoid thundering herd
  timeout?: number; // Overall timeout for all retries
  onRetry?: (error: Error, attempt: number, delay: number) => void;
  onMaxAttemptsExceeded?: (error: Error, attempts: number) => void;
}

// Custom error predicate function
type RetryableErrorPredicate = (error: Error) => boolean;

// Statistics for a retry operation
interface RetryStatistics {   `Retrying after error (attempt ${attempt}): ${error.message}, next retry in ${delay}ms`,
  attempts: number;  );
  totalTime: number;  },
  successful: boolean;
  errors: Array<{
    message: string;
    attempt: number;y capability
    timestamp: number;
  }>;@param options Retry options
}ith the function result or rejects after max retries

const defaultOptions: RetryOptions = {
  maxRetries: 3,mise<T>,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffFactor: 2,efaultOptions, ...options };
  jitter: true,  let attempt = 0;
  onRetry: (error, attempt, delay) => {
    logger.warn(`Retrying after error (attempt ${attempt}): ${error.message}, next retry in ${delay}ms`);
  }ig.maxRetries) {
};

/**
 * Execute a function with retry capabilitymin(
 * @param fn Function to execute that returns a promiseconfig.initialDelayMs * Math.pow(config.backoffFactor, attempt - 1),
 * @param options Retry options  config.maxDelayMs,
 * @returns Promise that resolves with the function result or rejects after max retries
 */
export async function withRetry<T>(// Wait before retry
  fn: () => Promise<T>,ve) => setTimeout(resolve, delay));
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const config = { ...defaultOptions, ...options };f (config.onRetry) {
  let attempt = 0;   config.onRetry(lastError, attempt, delay);
  let lastError: Error;  }
  const startTime = Date.now();
  const statistics: RetryStatistics = {
    attempts: 0,function
    totalTime: 0,
    successful: false,catch (error) {
    errors: []
  };

  // Handle overall timeoutetryableErrors.length > 0) {
  const overallTimeoutPromise = config.timeout 
    ? new Promise<never>((_, reject) => {of pattern === "string") {
        setTimeout(() => {rn) || error.name === pattern;
          reject(new Error(`Operation timed out after ${config.timeout}ms`)); else {
        }, config.timeout); return pattern.test(error.message);
      })  }
    : null;

  while (attempt <= config.maxRetries) {f (!isRetryableError) {
    try {   throw error; // Don't retry for non-retryable errors
      if (attempt > 0) {  }
        // Calculate delay with exponential backoff
        let delay = Math.min(
          config.initialDelayMs * Math.pow(config.backoffFactor, attempt - 1), the last attempt, throw the error
          config.maxDelayMs || Infinityf (attempt >= config.maxRetries) {
        );  throw error;
        
        // Add jitter to prevent thundering herd problem
        if (config.jitter) {   attempt++;
          // Add/subtract up to 25% randomly  }
          const jitterFactor = 0.75 + Math.random() * 0.5;
          delay = Math.floor(delay * jitterFactor);
        } // This should never execute because the loop will either return or throw
          throw new Error("Unexpected execution flow in retry logic");




































































































}  }) as T;    return withRetry(() => fn(...args), options);  return ((...args: Parameters<T>) => {): T {  options: Partial<RetryOptions> = {}  fn: T, export function makeRetryable<T extends (...args: any[]) => Promise<any>>( */ * @returns A new function that wraps the original with retry capability * @param options Retry options * @param fn Function to make retryable * Add retry capability to an existing async function/**}  };    return withRetry(fn, { ...options, ...overrideOptions });  return <T>(fn: () => Promise<T>, overrideOptions: Partial<RetryOptions> = {}) => {export function createRetry(options: Partial<RetryOptions>) { */ * @returns A retry function with default options * @param options Default options for all retries * Create a retry function with default options/**}  throw new Error('Unexpected execution flow in retry logic');  // This should never execute because the loop will either return or throw    }    }      attempt++;            }        throw lastError;        logger.error(`Max retry attempts (${config.maxRetries}) exceeded. Last error: ${lastError.message}`);                }          config.onMaxAttemptsExceeded(lastError, attempt + 1);        if (config.onMaxAttemptsExceeded) {                statistics.totalTime = Date.now() - startTime;      if (attempt >= config.maxRetries) {      // If this was the last attempt, throw the error            }        }          throw lastError; // Don't retry for non-retryable errors          logger.debug(`Non-retryable error detected: ${lastError.message}`);          statistics.totalTime = Date.now() - startTime;        if (!isRetryableError) {                });          return false;          }            return pattern(lastError);          } else if (typeof pattern === 'function') {            return pattern.test(lastError.message) || pattern.test(lastError.name);          } else if (pattern instanceof RegExp) {            return lastError.message.includes(pattern) || lastError.name === pattern;          if (typeof pattern === 'string') {        const isRetryableError = config.retryableErrors.some(pattern => {      if (config.retryableErrors && config.retryableErrors.length > 0) {      // Check if error is retryable            });        timestamp: Date.now()        attempt,        message: lastError.message,      statistics.errors.push({            lastError = error instanceof Error ? error : new Error(String(error));    } catch (error) {      return result;            }        logger.info(`Operation succeeded after ${attempt} retries in ${statistics.totalTime}ms`);      if (attempt > 0) {      // Log success after retries            statistics.successful = true;      statistics.totalTime = Date.now() - startTime;                  : await fn();        ? await Promise.race([fn(), overallTimeoutPromise])       const result = overallTimeoutPromise       // Execute the function, with optional timeout race            statistics.attempts = attempt + 1;            }        await new Promise(resolve => setTimeout(resolve, delay));        // Wait before retry                }          config.onRetry(lastError, attempt, delay);        if (config.onRetry) {        // Call onRetry callback}
