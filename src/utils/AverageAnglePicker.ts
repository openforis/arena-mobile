import { Queue } from "@openforis/arena-core";

export class AverageAnglePicker {
  _expireAfter: any;
  _limit: any;
  _queue: any;
  constructor({ limit = 50, expireAfterMs = 1000 } = {}) {
    this._queue = new Queue();
    this._limit = limit;
    this._expireAfter = expireAfterMs;
  }

  push(value: any) {
    this._queue.enqueue({ creationDate: Date.now(), value });
    this._cleanup();
    return this._calculateWeightedAverageValue();
  }

  _cleanup() {
    while (
      this._queue.size > this._limit ||
      (this._queue.first &&
        Date.now() - this._queue.first.creationDate > this._expireAfter)
    ) {
      this._queue.dequeue();
    }
  }

  _calculateAverageValue() {
    let total = 0;
    for (const item of this._queue.items) {
      total += item.value;
    }
    return total / this._queue.size;
  }

  _calculateMinMax() {
    const items = this._queue.items;
    let min = Number.NaN;
    let max = Number.NaN;
    for (const item of items) {
      const value = item.value;
      min = Number.isNaN(min) ? value : Math.min(min, value);
      max = Number.isNaN(max) ? value : Math.max(max, value);
    }
    return { min, max };
  }

  _calculateWeightedAverageValue() {
    let total = 0;
    let totalWeight = 0;
    const items = this._queue.items;
    const { min, max } = this._calculateMinMax();
    const hasToAdapt = max - min > 180;
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      const weight = this._calculateItemWeight(index);
      const value =
        hasToAdapt && item.value < 180 ? item.value + 360 : item.value;
      total += value * weight;
      totalWeight += weight;
    }
    return total / totalWeight;
  }

  _calculateItemWeight(index: any) {
    // first item => 2 other items 1
    return index === this._queue.size - 1 ? 2 : 1;
  }
}
