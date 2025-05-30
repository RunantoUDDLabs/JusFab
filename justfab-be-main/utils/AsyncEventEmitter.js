const EventEmitter = require('events');

class AsyncEventEmitter extends EventEmitter {
  /**
   * Emits an event and waits for both async and sync listeners to complete.
   * @param {string} event - The event name.
   * @param  {...any} args - Arguments passed to each listener.
   * @returns {Promise<boolean>} Resolves once all listeners have finished.
   */
  async asyncEmit(event, ...args) {
    // Get all listeners for the event.
    const listeners = this.listeners(event);
    // Wrap each listener's return in a promise. 
    // If the listener is sync, Promise.resolve wraps its return value.
    const promises = listeners.map(listener => Promise.resolve(listener(...args)));
    const all = await Promise.all(promises);
    return all;
  }
}

module.exports = AsyncEventEmitter;