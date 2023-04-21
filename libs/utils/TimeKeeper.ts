class TimeKeeper {
  timeThreshold: number;
  startTime: number;
  constructor(timeThreshold: number) {
    this.timeThreshold = timeThreshold;
    this.startTime = Date.now();
  }

  isTimeOver(): boolean {
    return (Date.now() - this.startTime) >= this.timeThreshold;
  }
}

export { TimeKeeper }