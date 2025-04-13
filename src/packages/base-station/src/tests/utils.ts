/**
 * Utility functions for testing
 */

/**
 * Wait for a specified time
 * @param ms Milliseconds to wait
 * @returns Promise that resolves after the time has elapsed
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create a mock object with typed functions that return the mock itself for chaining
 * @param base Base object to extend
 * @returns Mock object with chainable methods
 */
export function createChainableMock<T extends object>(base: T = {} as T): T {
  return new Proxy(base, {
    get(target: any, prop: string) {
      if (!(prop in target)) {
        target[prop] = vi.fn().mockReturnValue(target);
      }
      return target[prop];
    },
  });
}

/**
 * Create a mock event emitter
 * @returns Mock event emitter with on, emit, and removeListener methods
 */
export function createMockEventEmitter() {
  const listeners: Record<string, Function[]> = {};

  return {
    on: vi.fn((event: string, listener: Function) => {
      listeners[event] = listeners[event] || [];
      listeners[event].push(listener);
    }),
    emit: vi.fn((event: string, ...args: any[]) => {
      const eventListeners = listeners[event] || [];
      eventListeners.forEach((listener) => listener(...args));
    }),
    removeListener: vi.fn((event: string, listener: Function) => {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter((l) => l !== listener);
      }
    }),
    // For test verification
    getListeners: (event: string) => listeners[event] || [],
  };
}
