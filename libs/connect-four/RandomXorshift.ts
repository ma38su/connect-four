class RandomXorshift {

  private x: number;
  private y: number;
  private z: number;
  private w: number;

  constructor(seed = 88675123) {
    this.x = 123456789;
    this.y = 362436069;
    this.z = 521288629;
    this.w = seed || 88675123;
  }
  
  // XorShift
  next() {
    const t = this.x ^ (this.x << 11);
    this.x = this.y;
    this.y = this.z;
    this.z = this.w;
    this.w = (this.w ^ (this.w >>> 19)) ^ (t ^ (t >>> 8));
    return this.w;
  }

  nextFloat(): number {
    return (this.next() >>> 0) / (0xFFFFFFFF >>> 0);
  }

  nextInt(n: number): number {
    return Math.floor(this.nextFloat() * n);
  }

  nextRange(min: number, max: number): number {
    return min + this.nextInt(max - min);
  }

  clone(): RandomXorshift {
    const cloned = new RandomXorshift();
    cloned.x = this.x;
    cloned.y = this.y;
    cloned.z = this.z;
    cloned.w = this.w;
    return cloned;
  }

}

export { RandomXorshift }