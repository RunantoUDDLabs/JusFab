class WebhookQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  push(task) {
    this.queue.push(task);
    this.process();
  }

  async process() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      try {
        await task();
      } catch (e) {
        console.error('Webhook task error:', e);
      }
    }

    this.processing = false;
  }
}

module.exports = new WebhookQueue();