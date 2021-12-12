interface myCallbackType<CacheType> {
  (myArgument: CacheType): number;
}

class Patrolling<CacheType> {
  _cap: number;

  _timeout: number;

  _flush: any;

  _push: myCallbackType<CacheType>;

  _count: number;

  _timer?: any;

  constructor(
    cap: number,
    timeout: number,
    flush: any,
    push: myCallbackType<CacheType>
  ) {
    this._cap = cap;
    this._timeout = timeout;
    this._flush = flush;
    this._push = push;

    this._count = 0;
    this._timer = undefined;
  }

  async flush() {
    await this._flush();
    this.stopTimer();
  }

  async push(history: CacheType) {
    this._count = await this._push(history);

    if (this._cap <= this._count) {
      await this.flush();
    }

    if (!this._timer) {
      this.startTimer();
    }
  }

  startTimer() {
    if (this._timer) {
      this.stopTimer();
    }

    this._timer = setInterval(async () => {
      if (this._count > 0) {
        await this.flush();
      }
    }, this._timeout);
  }

  stopTimer() {
    clearInterval(this._timer);
    this._timer = undefined;
  }
}

export default Patrolling;
